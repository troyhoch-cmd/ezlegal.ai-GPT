/*
  # ezLegal pricing tiers catalog and monthly usage counters

  An existing `subscription_plans` table is already wired into Stripe billing.
  Rather than mutate that schema, this migration adds a new canonical catalog
  `ezlegal_pricing_tiers` for the product pricing UI plus per-user monthly
  `usage_counters` used to enforce tier limits.

  1. New Tables
    - `ezlegal_pricing_tiers`
        Canonical ezLegal product tiers with plain-language limits and feature
        flags. Seeds: free, essentials, pro, smb, legal_aid.
    - `usage_counters`
        Per-user monthly counters keyed by (user_id, metric, period_month).
        Metrics used initially: questions_asked, documents_uploaded,
        documents_generated.

  2. Security
    - RLS enabled on both tables.
    - ezlegal_pricing_tiers: readable by anon + authenticated when is_active;
      writable by admins only (profiles.is_admin).
    - usage_counters: users read/insert/update their own rows. Admins can
      read all rows for support and auditing.

  3. Notes
    - profiles.subscription_tier remains the source of truth for a user's
      current tier, consistent with AuthContext.
    - period_month is a DATE truncated to the first of the month. A unique
      constraint over (user_id, metric, period_month) allows upserts.
*/

CREATE TABLE IF NOT EXISTS ezlegal_pricing_tiers (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT 'personal',
  headline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  badge text,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_annual numeric(10,2) NOT NULL DEFAULT 0,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  included jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_label text NOT NULL DEFAULT 'Select plan',
  cta_route text NOT NULL DEFAULT '/pricing',
  is_highlighted boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ezlegal_pricing_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active ezlegal tiers" ON ezlegal_pricing_tiers;
CREATE POLICY "Anyone can read active ezlegal tiers"
  ON ezlegal_pricing_tiers FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can insert ezlegal tiers" ON ezlegal_pricing_tiers;
CREATE POLICY "Admins can insert ezlegal tiers"
  ON ezlegal_pricing_tiers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update ezlegal tiers" ON ezlegal_pricing_tiers;
CREATE POLICY "Admins can update ezlegal tiers"
  ON ezlegal_pricing_tiers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete ezlegal tiers" ON ezlegal_pricing_tiers;
CREATE POLICY "Admins can delete ezlegal tiers"
  ON ezlegal_pricing_tiers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.is_admin = true
    )
  );

INSERT INTO ezlegal_pricing_tiers (
  id, name, audience, headline, description, badge,
  price_monthly, price_annual, limits, features, included,
  cta_label, cta_route, is_highlighted, display_order
) VALUES
  ('free', 'Free', 'personal',
   'Start free. No credit card.',
   'Ask legal questions in plain English or Spanish and see if ezLegal.ai is right for you.',
   NULL, 0, 0,
   '{"questionsPerMonth":10,"documentUploadsPerMonth":1,"documentGenerationsPerMonth":0,"savedMattersMax":1,"seats":1}'::jsonb,
   '{"spanish":true,"attorneyInformedSafeguards":true,"legalAidReferral":true}'::jsonb,
   '["10 legal questions per month","1 document upload to analyze","Plain-language summaries","English and Spanish","Urgent help safety links"]'::jsonb,
   'Start free', '/signup', false, 10),
  ('essentials', 'Essentials', 'personal',
   'For one legal issue you need to understand.',
   'Answers, document explanations, and next-step plans for a single personal legal matter.',
   'Most popular', 19, 190,
   '{"questionsPerMonth":100,"documentUploadsPerMonth":10,"documentGenerationsPerMonth":3,"savedMattersMax":3,"seats":1}'::jsonb,
   '{"spanish":true,"urgentHelpFastLane":true,"attorneyInformedSafeguards":true,"documentReview":true,"legalAidReferral":true}'::jsonb,
   '["100 questions per month","10 documents analyzed per month","3 documents generated per month","Next-step plan for each matter","Priority urgent-help routing"]'::jsonb,
   'Get Essentials', '/checkout?plan=essentials', true, 20),
  ('pro', 'Pro', 'personal',
   'For ongoing personal legal help.',
   'Unlimited questions and unlimited document explanations for everyday legal needs.',
   NULL, 39, 390,
   '{"questionsPerMonth":"unlimited","documentUploadsPerMonth":"unlimited","documentGenerationsPerMonth":10,"savedMattersMax":10,"seats":1}'::jsonb,
   '{"spanish":true,"urgentHelpFastLane":true,"attorneyInformedSafeguards":true,"documentReview":true,"courtReadyOutputs":true,"legalAidReferral":true,"attorneyReferral":true,"prioritySupport":true}'::jsonb,
   '["Unlimited questions","Unlimited document analysis","10 documents generated per month","Court-ready output formatting","Priority support"]'::jsonb,
   'Upgrade to Pro', '/checkout?plan=pro', false, 30),
  ('smb', 'Small Business', 'smb',
   'Review contracts before you sign.',
   'Contracts, leases, vendor agreements, NDAs — explained and redlined with suggested changes.',
   NULL, 79, 790,
   '{"questionsPerMonth":"unlimited","documentUploadsPerMonth":"unlimited","documentGenerationsPerMonth":25,"savedMattersMax":25,"seats":3}'::jsonb,
   '{"spanish":true,"urgentHelpFastLane":true,"attorneyInformedSafeguards":true,"documentReview":true,"courtReadyOutputs":true,"legalAidReferral":true,"attorneyReferral":true,"prioritySupport":true,"conflictChecking":true,"auditLogExport":true}'::jsonb,
   '["3 seats included","Unlimited contract analysis","Redline suggestions with rationale","Conflict checking","Audit log export"]'::jsonb,
   'Start Small Business', '/checkout?plan=smb', false, 40),
  ('legal_aid', 'Legal Aid & Pro Bono', 'organization',
   'Help more clients, faster.',
   'Triage, intake, document review, referrals, and staff workflows with responsible AI safeguards.',
   NULL, 0, 0,
   '{"questionsPerMonth":"unlimited","documentUploadsPerMonth":"unlimited","documentGenerationsPerMonth":"unlimited","savedMattersMax":"unlimited","seats":"unlimited"}'::jsonb,
   '{"spanish":true,"urgentHelpFastLane":true,"attorneyInformedSafeguards":true,"documentReview":true,"courtReadyOutputs":true,"legalAidReferral":true,"attorneyReferral":true,"prioritySupport":true,"conflictChecking":true,"auditLogExport":true,"whiteLabel":true,"apiAccess":true}'::jsonb,
   '["Unlimited intake and matters","Unlimited seats","Conflict checking and audit logs","White-label embedded workflows","Partnership support"]'::jsonb,
   'Talk to partnerships', '/for-partners', false, 50)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  audience = EXCLUDED.audience,
  headline = EXCLUDED.headline,
  description = EXCLUDED.description,
  badge = EXCLUDED.badge,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  limits = EXCLUDED.limits,
  features = EXCLUDED.features,
  included = EXCLUDED.included,
  cta_label = EXCLUDED.cta_label,
  cta_route = EXCLUDED.cta_route,
  is_highlighted = EXCLUDED.is_highlighted,
  display_order = EXCLUDED.display_order,
  updated_at = now();

CREATE TABLE IF NOT EXISTS usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric text NOT NULL,
  period_month date NOT NULL,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT usage_counters_user_metric_period_unique UNIQUE (user_id, metric, period_month),
  CONSTRAINT usage_counters_count_nonneg CHECK (count >= 0)
);

CREATE INDEX IF NOT EXISTS usage_counters_user_id_idx ON usage_counters (user_id);
CREATE INDEX IF NOT EXISTS usage_counters_period_month_idx ON usage_counters (period_month);

ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own usage" ON usage_counters;
CREATE POLICY "Users read own usage"
  ON usage_counters FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users insert own usage" ON usage_counters;
CREATE POLICY "Users insert own usage"
  ON usage_counters FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users update own usage" ON usage_counters;
CREATE POLICY "Users update own usage"
  ON usage_counters FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins read all usage" ON usage_counters;
CREATE POLICY "Admins read all usage"
  ON usage_counters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.is_admin = true
    )
  );
