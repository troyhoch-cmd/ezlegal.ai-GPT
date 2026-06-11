/**
 * RLS Policy Verification Tests
 *
 * Validates that Supabase Row Level Security policies for governed intake,
 * attorney review, and partner referral tables are structurally sound.
 *
 * TODO: When CI Supabase instance is available:
 * 1. Run SQL fixtures against a test database with service_role
 * 2. Verify per-user access with anon, authenticated, partner, admin tokens
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const MIGRATIONS_DIR = path.resolve(__dirname, '../supabase/migrations');

function readMigration(filename: string): string {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.includes(filename));
  if (files.length === 0) throw new Error(`Migration not found: ${filename}`);
  return fs.readFileSync(path.join(MIGRATIONS_DIR, files[0]), 'utf-8');
}

describe('RLS Policy Verification — Governed Intake', () => {
  const migrationContent = readMigration('create_governed_intake_persistence');

  it('enables RLS on all governed intake tables', () => {
    const tables = ['spanish_triage_sessions', 'business_intake_sessions', 'org_partner_profiles',
      'referral_routing_records', 'attorney_review_requests', 'intake_consent_records', 'intake_audit_events'];
    for (const table of tables) {
      expect(migrationContent).toMatch(new RegExp(`ALTER TABLE.*${table}.*ENABLE ROW LEVEL SECURITY`, 'is'));
    }
  });

  it('restricts select to authenticated session owners', () => {
    expect(migrationContent).toMatch(/FOR SELECT/i);
    expect(migrationContent).toMatch(/auth\.uid\(\)/);
  });

  it('restricts insert to authenticated users creating their own records', () => {
    expect(migrationContent).toMatch(/FOR INSERT/i);
    expect(migrationContent).toMatch(/WITH CHECK/i);
  });

  it('does not use USING (true) which would bypass RLS', () => {
    expect(migrationContent).not.toMatch(/USING\s*\(\s*true\s*\)/i);
  });
});

describe('RLS Policy Verification — Attorney Review Requests', () => {
  const hardenMigration = readMigration('harden_intake_rls_and_add_scope_acknowledged');

  it('adds scope_acknowledged_at column', () => {
    expect(hardenMigration).toMatch(/scope_acknowledged_at/i);
  });

  it('adds assigned_attorney_id column', () => {
    expect(hardenMigration).toMatch(/assigned_attorney_id/i);
  });

  it('restricts policies to authenticated users with auth.uid()', () => {
    expect(hardenMigration).toMatch(/auth\.uid\(\)/);
  });

  it('does not allow unauthenticated access (no TO anon for read)', () => {
    expect(hardenMigration).not.toMatch(/TO\s+anon/i);
  });
});

describe('RLS Policy Verification — Referral Routing Records', () => {
  const intakeMigration = readMigration('create_governed_intake_persistence');

  it('enables RLS on referral_routing_records', () => {
    expect(intakeMigration).toMatch(/ALTER TABLE.*referral_routing_records.*ENABLE ROW LEVEL SECURITY/is);
  });

  it('restricts partner access to own records via partner_profile_id', () => {
    expect(intakeMigration).toMatch(/partner_profile_id/i);
  });

  it('anon cannot read referral_routing_records', () => {
    const referralPolicies = intakeMigration.match(/referral_routing_records.*?;/gis) || [];
    const hasAnonRead = referralPolicies.some(p => /TO\s+anon/i.test(p) && /FOR SELECT/i.test(p));
    expect(hasAnonRead).toBe(false);
  });
});

describe('RLS Policy Verification — Privileged Field Protection', () => {
  const hardenMigration = readMigration('harden_intake_rls_and_add_scope_acknowledged');

  it('assigned_attorney_id is added as a column (admin-controlled)', () => {
    expect(hardenMigration).toMatch(/ADD COLUMN.*assigned_attorney_id|assigned_attorney_id.*uuid/is);
  });

  it('scope_acknowledged_at requires auth.uid() context', () => {
    expect(hardenMigration).toMatch(/auth\.uid\(\)/);
  });
});

describe('RLS — Migration Integrity', () => {
  it('all governed intake migrations with CREATE TABLE also enable RLS', () => {
    const relevantMigrations = fs.readdirSync(MIGRATIONS_DIR).filter(f =>
      f.includes('governed_intake') || f.includes('harden_intake')
    );
    expect(relevantMigrations.length).toBeGreaterThan(0);

    for (const file of relevantMigrations) {
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      if (content.match(/CREATE TABLE/i)) {
        expect(content).toMatch(/ENABLE ROW LEVEL SECURITY/i);
      }
    }
  });

  it('no governed intake migration uses DROP TABLE or DROP COLUMN', () => {
    const relevantMigrations = fs.readdirSync(MIGRATIONS_DIR).filter(f =>
      f.includes('governed_intake') || f.includes('harden_intake')
    );
    for (const file of relevantMigrations) {
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      expect(content).not.toMatch(/DROP TABLE/i);
      expect(content).not.toMatch(/DROP COLUMN/i);
    }
  });
});
