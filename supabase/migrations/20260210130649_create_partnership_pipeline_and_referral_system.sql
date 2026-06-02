/*
  # Partnership Pipeline & Referral Tracking System

  1. New Tables
    - `partners`
      - `id` (uuid, primary key) - unique partner identifier
      - `user_id` (uuid, nullable) - linked auth user if partner has an account
      - `organization_name` (text) - partner organization name
      - `contact_name` (text) - primary contact person
      - `contact_email` (text) - primary contact email
      - `contact_phone` (text) - phone number
      - `website` (text) - partner website URL
      - `partner_type` (text) - legal_aid | enterprise | technology | nonprofit | government
      - `tier` (text) - pro | developer | enterprise | legal_aid_free
      - `pipeline_stage` (text) - lead | contacted | discovery | proposal | negotiation | pilot | onboarding | active | churned | paused
      - `pipeline_substage` (text) - optional substage for granularity
      - `source` (text) - how the partner was acquired
      - `assigned_to` (text) - internal team member managing the partner
      - `priority` (text) - low | medium | high | critical
      - `monthly_value` (numeric) - estimated or actual monthly revenue
      - `language_preference` (text) - en | es | both
      - `notes` (text) - internal notes
      - `metadata` (jsonb) - flexible data storage
      - `last_contact_at` (timestamptz) - when last contacted
      - `pilot_start_date` (date) - pilot program start
      - `pilot_end_date` (date) - pilot program end
      - `contract_start_date` (date) - contract start
      - `contract_end_date` (date) - contract end
      - `created_at` (timestamptz) - record creation
      - `updated_at` (timestamptz) - last update

    - `partner_pipeline_activities`
      - `id` (uuid, primary key) - activity identifier
      - `partner_id` (uuid, FK) - linked partner
      - `activity_type` (text) - stage_change | note | email | call | meeting | proposal_sent | contract_signed | demo_scheduled | follow_up
      - `from_stage` (text) - previous pipeline stage
      - `to_stage` (text) - new pipeline stage
      - `description` (text) - activity description
      - `performed_by` (uuid) - user who performed the activity
      - `metadata` (jsonb) - additional activity data
      - `created_at` (timestamptz) - when the activity occurred

    - `partner_referrals`
      - `id` (uuid, primary key) - referral identifier
      - `partner_id` (uuid, FK) - referring partner
      - `referral_code` (text, unique) - unique referral tracking code
      - `referred_email` (text) - referred user email
      - `referred_user_id` (uuid, nullable) - linked user if they sign up
      - `referral_type` (text) - user_signup | widget_install | api_integration | pro_bono_case
      - `status` (text) - pending | converted | expired | rejected
      - `conversion_value` (numeric) - revenue from this referral
      - `landing_page` (text) - which co-branded landing was used
      - `utm_source` (text) - tracking source
      - `utm_campaign` (text) - tracking campaign
      - `metadata` (jsonb) - additional data
      - `converted_at` (timestamptz) - when conversion happened
      - `created_at` (timestamptz) - record creation

    - `partner_co_branded_pages`
      - `id` (uuid, primary key) - page identifier
      - `partner_id` (uuid, FK) - owning partner
      - `slug` (text, unique) - URL slug for the landing page
      - `page_title` (text) - page title
      - `hero_heading` (text) - hero section heading
      - `hero_subheading` (text) - hero section subheading
      - `partner_logo_url` (text) - partner logo URL
      - `primary_color` (text) - partner brand color
      - `cta_text` (text) - call to action text
      - `cta_link` (text) - CTA destination
      - `content` (jsonb) - flexible page content blocks
      - `language` (text) - en | es | both
      - `is_active` (boolean) - whether page is live
      - `view_count` (integer) - page views
      - `conversion_count` (integer) - conversions from this page
      - `created_at` (timestamptz) - record creation
      - `updated_at` (timestamptz) - last update

  2. Security
    - RLS enabled on all tables
    - Admins can read/write all partner data
    - Partners can read their own data (via user_id match)
    - Referral creation allowed for authenticated users

  3. Indexes
    - partners: pipeline_stage, partner_type, tier, contact_email
    - partner_pipeline_activities: partner_id, activity_type
    - partner_referrals: partner_id, referral_code, status
    - partner_co_branded_pages: partner_id, slug
*/

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_name text NOT NULL,
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL,
  contact_phone text DEFAULT '',
  website text DEFAULT '',
  partner_type text NOT NULL DEFAULT 'enterprise' CHECK (partner_type IN ('legal_aid', 'enterprise', 'technology', 'nonprofit', 'government')),
  tier text NOT NULL DEFAULT 'pro' CHECK (tier IN ('pro', 'developer', 'enterprise', 'legal_aid_free')),
  pipeline_stage text NOT NULL DEFAULT 'lead' CHECK (pipeline_stage IN ('lead', 'contacted', 'discovery', 'proposal', 'negotiation', 'pilot', 'onboarding', 'active', 'churned', 'paused')),
  pipeline_substage text DEFAULT '',
  source text DEFAULT '',
  assigned_to text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  monthly_value numeric DEFAULT 0,
  language_preference text NOT NULL DEFAULT 'en' CHECK (language_preference IN ('en', 'es', 'both')),
  notes text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  last_contact_at timestamptz,
  pilot_start_date date,
  pilot_end_date date,
  contract_start_date date,
  contract_end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all partners"
  ON partners FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Partners can view own record"
  ON partners FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_partners_pipeline_stage ON partners(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_partners_partner_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_tier ON partners(tier);
CREATE INDEX IF NOT EXISTS idx_partners_contact_email ON partners(contact_email);
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_priority ON partners(priority);

-- Partner pipeline activities table
CREATE TABLE IF NOT EXISTS partner_pipeline_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  activity_type text NOT NULL DEFAULT 'note' CHECK (activity_type IN ('stage_change', 'note', 'email', 'call', 'meeting', 'proposal_sent', 'contract_signed', 'demo_scheduled', 'follow_up')),
  from_stage text,
  to_stage text,
  description text NOT NULL DEFAULT '',
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE partner_pipeline_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pipeline activities"
  ON partner_pipeline_activities FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Partners can view own pipeline activities"
  ON partner_pipeline_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM partners WHERE partners.id = partner_pipeline_activities.partner_id AND partners.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_partner_pipeline_activities_partner_id ON partner_pipeline_activities(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_pipeline_activities_type ON partner_pipeline_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_partner_pipeline_activities_created_at ON partner_pipeline_activities(created_at);

-- Partner referrals table
CREATE TABLE IF NOT EXISTS partner_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  referral_code text UNIQUE NOT NULL,
  referred_email text DEFAULT '',
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_type text NOT NULL DEFAULT 'user_signup' CHECK (referral_type IN ('user_signup', 'widget_install', 'api_integration', 'pro_bono_case')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired', 'rejected')),
  conversion_value numeric DEFAULT 0,
  landing_page text DEFAULT '',
  utm_source text DEFAULT '',
  utm_campaign text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  converted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE partner_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all referrals"
  ON partner_referrals FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Partners can view own referrals"
  ON partner_referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM partners WHERE partners.id = partner_referrals.partner_id AND partners.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner_id ON partner_referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_referral_code ON partner_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_status ON partner_referrals(status);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_referred_user_id ON partner_referrals(referred_user_id);

-- Partner co-branded pages table
CREATE TABLE IF NOT EXISTS partner_co_branded_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  page_title text NOT NULL DEFAULT '',
  hero_heading text NOT NULL DEFAULT '',
  hero_subheading text DEFAULT '',
  partner_logo_url text DEFAULT '',
  primary_color text DEFAULT '#0d9488',
  cta_text text DEFAULT 'Get Started',
  cta_link text DEFAULT '/signup',
  content jsonb DEFAULT '[]',
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es', 'both')),
  is_active boolean NOT NULL DEFAULT true,
  view_count integer NOT NULL DEFAULT 0,
  conversion_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE partner_co_branded_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage co-branded pages"
  ON partner_co_branded_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Partners can view own co-branded pages"
  ON partner_co_branded_pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM partners WHERE partners.id = partner_co_branded_pages.partner_id AND partners.user_id = auth.uid())
  );

CREATE POLICY "Anyone can view active co-branded pages"
  ON partner_co_branded_pages FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_partner_co_branded_pages_partner_id ON partner_co_branded_pages(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_co_branded_pages_slug ON partner_co_branded_pages(slug);
CREATE INDEX IF NOT EXISTS idx_partner_co_branded_pages_is_active ON partner_co_branded_pages(is_active);

-- Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_partners_updated_at'
  ) THEN
    CREATE TRIGGER trigger_partners_updated_at
      BEFORE UPDATE ON partners
      FOR EACH ROW
      EXECUTE FUNCTION update_partners_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_partner_co_branded_pages_updated_at'
  ) THEN
    CREATE TRIGGER trigger_partner_co_branded_pages_updated_at
      BEFORE UPDATE ON partner_co_branded_pages
      FOR EACH ROW
      EXECUTE FUNCTION update_partners_updated_at();
  END IF;
END $$;
