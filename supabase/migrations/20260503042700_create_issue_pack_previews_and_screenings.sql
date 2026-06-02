/*
  # Issue Pack Previews, Deadline Screenings, LSO Pricing Inquiries

  Adds persistence for the P1/P2 Issue Packs build-out:

  1. New Tables
    - `issue_pack_previews`
      - Stores sample action-plan preview content per pack_id and locale.
      - Fields: id, pack_id, locale, title, sections jsonb, sample_templates jsonb,
        estimated_time_minutes, jurisdiction_coverage jsonb, last_reviewed_at,
        reviewer_name, created_at, updated_at.
    - `issue_pack_deadline_screenings`
      - Captures the structured screening answers shown before a high-risk purchase.
      - Fields: id, user_id (nullable), pack_id, language, jurisdiction, answers jsonb,
        computed_urgency (safe|caution|emergency), recommended_route
        (purchase|attorney|emergency), created_at.
    - `lso_pricing_inquiries`
      - Captures Legal Service Organization / bulk-pricing inquiries from the
        "For legal aid" audience tab.
      - Fields: id, organization_name, contact_name, contact_email, org_type,
        seats_estimated, languages jsonb, notes, created_at.

  2. Security
    - All tables have RLS enabled.
    - `issue_pack_previews` is public-readable (marketing content).
    - `issue_pack_deadline_screenings`: users read their own; anon+auth can insert;
      admins read all.
    - `lso_pricing_inquiries`: anon+auth can insert; only admins can read.
*/

CREATE TABLE IF NOT EXISTS issue_pack_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id text NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  title text NOT NULL DEFAULT '',
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  sample_templates jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_time_minutes integer NOT NULL DEFAULT 30,
  jurisdiction_coverage jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_reviewed_at timestamptz,
  reviewer_name text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pack_id, locale)
);

ALTER TABLE issue_pack_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pack previews"
  ON issue_pack_previews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert pack previews"
  ON issue_pack_previews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update pack previews"
  ON issue_pack_previews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS issue_pack_deadline_screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  pack_id text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'en',
  jurisdiction text DEFAULT '',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  computed_urgency text NOT NULL DEFAULT 'safe'
    CHECK (computed_urgency IN ('safe', 'caution', 'emergency')),
  recommended_route text NOT NULL DEFAULT 'purchase'
    CHECK (recommended_route IN ('purchase', 'attorney', 'emergency')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ipds_user_id ON issue_pack_deadline_screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_ipds_pack_id ON issue_pack_deadline_screenings(pack_id);

ALTER TABLE issue_pack_deadline_screenings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deadline screenings"
  ON issue_pack_deadline_screenings FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all deadline screenings"
  ON issue_pack_deadline_screenings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert deadline screening"
  ON issue_pack_deadline_screenings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS lso_pricing_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  org_type text NOT NULL DEFAULT 'legal_aid',
  seats_estimated integer NOT NULL DEFAULT 0,
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lso_pricing_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit lso inquiry"
  ON lso_pricing_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view lso inquiries"
  ON lso_pricing_inquiries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
    )
  );

INSERT INTO issue_pack_previews (pack_id, locale, title, sections, sample_templates, estimated_time_minutes, jurisdiction_coverage, reviewer_name, last_reviewed_at)
VALUES
  ('immigration', 'en', 'Immigration Help Pack - Sample Action Plan',
   '[
     {"h":"Step 1: Confirm your status and deadlines","b":"Identify notices received (NTA, I-862, I-220), note any court date, and confirm whether you are in removal proceedings."},
     {"h":"Step 2: Know Your Rights at home and in public","b":"Printable cards for ICE encounters: right to remain silent, right to refuse entry without a judicial warrant, right to an attorney."},
     {"h":"Step 3: Organize evidence and emergency contacts","b":"Use the emergency contact template to document a trusted contact, attorney hotlines, and consular resources."},
     {"h":"Step 4: Request attorney referral","b":"Submit your case to the matched referral queue. Referrals are matched by state, case type, and language."}
   ]'::jsonb,
   '[
     {"name":"Know Your Rights Card (EN)","format":"PDF"},
     {"name":"Emergency Contact Sheet","format":"PDF / fillable"},
     {"name":"ICE Encounter Script","format":"PDF"}
   ]'::jsonb,
   25,
   '["US - federal", "AZ", "CA", "FL", "NY", "TX"]'::jsonb,
   'Reviewed by supervising attorney', now()),
  ('housing', 'en', 'Housing & Eviction Pack - Sample Action Plan',
   '[
     {"h":"Step 1: Read the notice","b":"Identify the notice type (pay-or-quit, cure-or-quit, unconditional quit, writ of restitution) and the response deadline."},
     {"h":"Step 2: Calculate your deadline","b":"Use the state-specific deadline tracker - deadlines vary from 3 to 30 days depending on the notice and jurisdiction."},
     {"h":"Step 3: Draft your response","b":"Use the fillable eviction response template tailored to your notice type. Include defenses, affirmative claims, and filing fee waiver request if eligible."},
     {"h":"Step 4: Prepare for court","b":"Court calendar, evidence checklist, and witness preparation guide."}
   ]'::jsonb,
   '[
     {"name":"Eviction Response (fillable)","format":"DOCX / PDF"},
     {"name":"Tenant Rights Summary","format":"PDF"},
     {"name":"Evidence Checklist","format":"PDF"}
   ]'::jsonb,
   30,
   '["AZ", "CA", "FL", "NY", "TX", "IL", "WA"]'::jsonb,
   'Reviewed by supervising attorney', now()),
  ('family', 'en', 'Family Matters Pack - Sample Action Plan',
   '[
     {"h":"Step 1: Identify your posture","b":"Are you filing, responding, or modifying? Confirm jurisdiction and venue."},
     {"h":"Step 2: Calculate child support","b":"State-specific worksheet applies your jurisdictions guideline formula."},
     {"h":"Step 3: Draft custody proposal","b":"Use the parenting-plan template to map schedules, holidays, and decision-making."},
     {"h":"Step 4: Prepare for hearing","b":"Document checklist, witness list, and self-representation guide."}
   ]'::jsonb,
   '[
     {"name":"Parenting Plan Template","format":"DOCX"},
     {"name":"Child Support Worksheet","format":"PDF"},
     {"name":"Court Prep Guide","format":"PDF"}
   ]'::jsonb,
   35,
   '["AZ", "CA", "NY", "TX"]'::jsonb,
   'Reviewed by supervising attorney', now()),
  ('smb_contract', 'en', 'Contract Review Pack - Sample Action Plan',
   '[
     {"h":"Step 1: Classify the contract","b":"Identify type (services, sale, lease, NDA, MSA) and the commercial stakes."},
     {"h":"Step 2: Run the risk checklist","b":"Indemnity, limitation of liability, IP assignment, termination, auto-renewal, venue, and payment terms."},
     {"h":"Step 3: Generate negotiation points","b":"Auto-drafted redline suggestions grouped by priority."},
     {"h":"Step 4: Counsel handoff","b":"Attorney-ready summary packet for your outside counsel."}
   ]'::jsonb,
   '[
     {"name":"Risk Checklist","format":"PDF"},
     {"name":"Redline Comment Sheet","format":"DOCX"},
     {"name":"Counsel Handoff Brief","format":"PDF"}
   ]'::jsonb,
   40,
   '["US - 50 states"]'::jsonb,
   'Reviewed by supervising attorney', now()),
  ('smb_employee', 'en', 'Employee Issue Pack - Sample Action Plan',
   '[
     {"h":"Step 1: Classify the issue","b":"Wage dispute, termination, discrimination claim, or policy issue."},
     {"h":"Step 2: Documentation tracker","b":"Timeline, witness list, written communications, and performance records."},
     {"h":"Step 3: Policy review","b":"Handbook alignment check against your state and federal obligations."},
     {"h":"Step 4: Counsel referral","b":"Employment-law attorney referral matched by state and issue type."}
   ]'::jsonb,
   '[
     {"name":"Documentation Tracker","format":"PDF / Sheet"},
     {"name":"Termination Checklist","format":"PDF"},
     {"name":"HR Policy Alignment","format":"PDF"}
   ]'::jsonb,
   35,
   '["US - 50 states"]'::jsonb,
   'Reviewed by supervising attorney', now()),
  ('smb_vendor', 'en', 'Vendor Dispute Pack - Sample Action Plan',
   '[
     {"h":"Step 1: Map the dispute","b":"Contract terms, non-performance, delivery or invoice issues, and damages."},
     {"h":"Step 2: Demand letter","b":"Fillable demand letter tailored to your dispute type and jurisdiction."},
     {"h":"Step 3: Evidence organization","b":"Invoices, communications, statements of work, and delivery records."},
     {"h":"Step 4: Escalation options","b":"Mediation, small-claims vs. civil court, and attorney referral."}
   ]'::jsonb,
   '[
     {"name":"Demand Letter (fillable)","format":"DOCX / PDF"},
     {"name":"Evidence Index","format":"PDF"},
     {"name":"Escalation Decision Guide","format":"PDF"}
   ]'::jsonb,
   30,
   '["US - 50 states"]'::jsonb,
   'Reviewed by supervising attorney', now())
ON CONFLICT (pack_id, locale) DO NOTHING;
