/*
  # Create audit_events table

  ## Summary
  Creates a structured audit log table for the Experience Policy Layer.
  Records policy decisions, blocked actions, data access requests, and
  other security-relevant events for compliance and debugging.

  ## New Tables
  - `audit_events`
    - `id` (uuid, primary key)
    - `user_id` (uuid, nullable FK to auth.users — null for anonymous events)
    - `session_id` (text, non-null, for correlating anonymous events)
    - `event_type` (text) — e.g. 'policy_block', 'action_denied', 'data_access_request'
    - `entity_type` (text, nullable) — e.g. 'route', 'action', 'document', 'chat_session'
    - `entity_id` (text, nullable) — the specific entity involved
    - `metadata` (jsonb) — additional context (reason, redirect, tier, etc.)
    - `tenant_id` (text) — for multi-tenant scoping
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Authenticated users can INSERT their own events
  - Anonymous users can INSERT events with null user_id
  - Admins can SELECT all events (read-only audit access)

  ## Indexes
  - (user_id, event_type, created_at DESC) — for per-user audit queries
  - (tenant_id, created_at DESC) — for admin tenant-scoped queries
*/

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL DEFAULT '',
  event_type text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  tenant_id text NOT NULL DEFAULT 'ezlegal',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own audit events"
  ON audit_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert session audit events"
  ON audit_events FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Admins can read all audit events"
  ON audit_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_audit_events_user_type_created
  ON audit_events (user_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_created
  ON audit_events (tenant_id, created_at DESC);
