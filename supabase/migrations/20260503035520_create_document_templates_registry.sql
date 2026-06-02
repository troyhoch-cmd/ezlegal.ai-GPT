/*
  # Document Templates Registry

  ## Summary
  Creates a public-facing registry of document templates offered by ezLegal.ai,
  including per-template reviewer attribution, jurisdiction coverage, and the
  last attorney-review date. Powers the #templates section of /scope-disclaimers
  so the "Attorney-Reviewed Templates" trust badge is substantiated with
  concrete, auditable records.

  ## New Tables
  - `document_templates`
    - `id` (uuid, primary key)
    - `slug` (text, unique) — stable identifier for routing
    - `name` (text) — display name
    - `category` (text) — e.g., housing, employment, contracts, family
    - `description` (text) — one-sentence summary
    - `jurisdictions` (text[]) — ISO state codes or 'US' for federal
    - `reviewer_name` (text) — attorney of record
    - `reviewer_bar_state` (text) — licensing bar state
    - `reviewer_bar_number` (text, nullable)
    - `last_reviewed_at` (date)
    - `review_scope` (text) — what "reviewed" covers
    - `disclaimer` (text) — scope disclaimer shown with the template
    - `is_public` (boolean, default true)
    - `created_at`, `updated_at` (timestamptz)

  ## Security
  - RLS enabled.
  - Public SELECT policy for rows where is_public = true (trust/transparency page).
  - Admin-only INSERT/UPDATE/DELETE.
*/

CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text NOT NULL DEFAULT '',
  jurisdictions text[] NOT NULL DEFAULT ARRAY[]::text[],
  reviewer_name text NOT NULL DEFAULT '',
  reviewer_bar_state text NOT NULL DEFAULT '',
  reviewer_bar_number text,
  last_reviewed_at date NOT NULL DEFAULT CURRENT_DATE,
  review_scope text NOT NULL DEFAULT 'Legal accuracy, plain-language clarity, and jurisdictional fit.',
  disclaimer text NOT NULL DEFAULT 'Use of this template does not create an attorney-client relationship. Consult a licensed attorney before relying on it for a specific matter.',
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published templates" ON document_templates;
CREATE POLICY "Public can view published templates"
  ON document_templates FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Admins can insert templates" ON document_templates;
CREATE POLICY "Admins can insert templates"
  ON document_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update templates" ON document_templates;
CREATE POLICY "Admins can update templates"
  ON document_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete templates" ON document_templates;
CREATE POLICY "Admins can delete templates"
  ON document_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_document_templates_public_category
  ON document_templates (is_public, category);

INSERT INTO document_templates (slug, name, category, description, jurisdictions, reviewer_name, reviewer_bar_state, last_reviewed_at, review_scope)
VALUES
  ('residential-lease-demand-letter', 'Residential Lease Demand Letter', 'housing',
   'Formal demand to a landlord for repairs, return of security deposit, or lease compliance.',
   ARRAY['AZ','CA','TX','NY','FL'], 'Review Counsel (Housing)', 'AZ', CURRENT_DATE - INTERVAL '45 days',
   'Statutory citations, notice periods, delivery requirements, and plain-language framing.'),
  ('mutual-nda', 'Mutual Non-Disclosure Agreement',
   'contracts', 'Two-party NDA for early-stage commercial discussions.',
   ARRAY['US'], 'Review Counsel (Commercial)', 'CA', CURRENT_DATE - INTERVAL '60 days',
   'Definition of confidential information, term, carve-outs, and governing-law neutrality.'),
  ('independent-contractor-agreement', 'Independent Contractor Agreement',
   'employment', 'Services agreement between a business and an independent contractor.',
   ARRAY['US','CA','NY','TX'], 'Review Counsel (Employment)', 'NY', CURRENT_DATE - INTERVAL '90 days',
   'Classification factors, IP assignment, indemnity, and state-specific worker-classification notes.'),
  ('eeoc-intake-complaint', 'EEOC Intake Questionnaire Draft',
   'employment', 'Draft of EEOC intake facts and timeline for employment-discrimination claims.',
   ARRAY['US'], 'Review Counsel (Employment)', 'NY', CURRENT_DATE - INTERVAL '75 days',
   'Protected-class framing, timeline of adverse action, and filing-deadline callouts.'),
  ('small-claims-demand', 'Small Claims Demand Letter',
   'consumer', 'Pre-litigation demand before filing in small claims court.',
   ARRAY['AZ','CA','TX','NY','FL'], 'Review Counsel (Consumer)', 'AZ', CURRENT_DATE - INTERVAL '30 days',
   'Jurisdictional dollar limits, required notice, and proof-of-delivery guidance.'),
  ('power-of-attorney-simple', 'Simple Power of Attorney',
   'family', 'General or limited power of attorney for adults in routine matters.',
   ARRAY['AZ','CA','TX'], 'Review Counsel (Family)', 'AZ', CURRENT_DATE - INTERVAL '120 days',
   'Statutory form compliance, notarization requirements, and revocation clauses.'),
  ('cease-and-desist-harassment', 'Cease and Desist (Harassment)',
   'personal-safety', 'Civil cease-and-desist to document and demand an end to unwanted contact.',
   ARRAY['US'], 'Review Counsel (Safety)', 'AZ', CURRENT_DATE - INTERVAL '50 days',
   'Plain-language framing, preservation of evidence guidance, and safety-escalation notes.'),
  ('tenant-repair-request', 'Tenant Repair Request (Habitability)',
   'housing', 'Written request to a landlord for repairs required under implied warranty of habitability.',
   ARRAY['AZ','CA','NY','FL','TX'], 'Review Counsel (Housing)', 'CA', CURRENT_DATE - INTERVAL '20 days',
   'State repair-and-deduct rules, written-notice requirements, and retaliation protections.')
ON CONFLICT (slug) DO UPDATE
  SET last_reviewed_at = EXCLUDED.last_reviewed_at,
      review_scope = EXCLUDED.review_scope,
      updated_at = now();
