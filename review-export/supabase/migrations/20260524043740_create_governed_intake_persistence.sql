/*
  # Create Governed Intake Persistence Tables

  1. New Tables
    - `spanish_triage_sessions` - Stores Spanish-speaking individual triage flow data
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, references auth.users)
      - `anonymous_session_id` (text, nullable)
      - `jurisdiction` (text, nullable)
      - `language` (text, default 'es')
      - `affordability_status` (text)
      - `risk_level` (text)
      - `has_deadline` (boolean, default false)
      - `status` (text, default 'in_progress')
      - `metadata` (jsonb, default '{}')
      - `created_at` / `updated_at` (timestamptz)

    - `business_intake_sessions` - Stores SMB intake flow data
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `anonymous_session_id` (text, nullable)
      - `jurisdiction` (text, nullable)
      - `language` (text, default 'en')
      - `business_segment` (text)
      - `document_type` (text, nullable)
      - `attorney_review_recommended` (boolean, default false)
      - `scope_acknowledged` (boolean, default false)
      - `status` (text, default 'in_progress')
      - `metadata` (jsonb, default '{}')
      - `created_at` / `updated_at` (timestamptz)

    - `org_partner_profiles` - Stores organization partner intake profiles
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `anonymous_session_id` (text, nullable)
      - `org_type` (text)
      - `jurisdictions_served` (text[], default '{}')
      - `issue_areas` (text[], default '{}')
      - `languages_supported` (text[], default '{}')
      - `intake_volume` (text, nullable)
      - `accepts_warm_referrals` (boolean, default false)
      - `requires_conflict_check` (boolean, default false)
      - `consent_given` (boolean, default false)
      - `status` (text, default 'submitted')
      - `metadata` (jsonb, default '{}')
      - `created_at` / `updated_at` (timestamptz)

    - `referral_routing_records` - Tracks referrals to legal-aid orgs
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `anonymous_session_id` (text, nullable)
      - `triage_session_id` (uuid, nullable)
      - `partner_profile_id` (uuid, nullable)
      - `jurisdiction` (text, nullable)
      - `language` (text, nullable)
      - `issue_area` (text, nullable)
      - `affordability_status` (text, nullable)
      - `risk_level` (text, nullable)
      - `referral_status` (text, default 'new')
      - `metadata` (jsonb, default '{}')
      - `created_at` / `updated_at` (timestamptz)

    - `attorney_review_requests` - Tracks SMB attorney review requests
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `anonymous_session_id` (text, nullable)
      - `business_session_id` (uuid, nullable)
      - `business_segment` (text, nullable)
      - `jurisdiction` (text, nullable)
      - `issue_area` (text, nullable)
      - `trigger_reasons` (text[], default '{}')
      - `document_type` (text, nullable)
      - `urgency` (text, default 'normal')
      - `status` (text, default 'draft')
      - `estimated_turnaround` (text, nullable)
      - `price_cents` (integer, nullable)
      - `metadata` (jsonb, default '{}')
      - `created_at` / `updated_at` (timestamptz)

    - `intake_consent_records` - Stores consent attestations
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `anonymous_session_id` (text, nullable)
      - `consent_type` (text)
      - `consent_text` (text)
      - `granted` (boolean, default false)
      - `icp` (text, nullable)
      - `metadata` (jsonb, default '{}')
      - `created_at` (timestamptz)

    - `intake_audit_events` - Immutable audit log for intake flows
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `anonymous_session_id` (text, nullable)
      - `event_type` (text)
      - `icp` (text, nullable)
      - `step_id` (text, nullable)
      - `jurisdiction` (text, nullable)
      - `language` (text, nullable)
      - `metadata` (jsonb, default '{}')
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Authenticated users can read/write their own records
    - Anonymous users can create records with anonymous_session_id
    - Intake audit events are insert-only (no update/delete for users)

  3. Important Notes
    - All tables use gen_random_uuid() for primary keys
    - updated_at auto-updates via trigger on mutable tables
    - Anonymous sessions use client-generated IDs stored in localStorage
*/

-- Helper: auto-update updated_at
CREATE OR REPLACE FUNCTION public.intake_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- spanish_triage_sessions
CREATE TABLE IF NOT EXISTS public.spanish_triage_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id text,
  jurisdiction text,
  language text DEFAULT 'es',
  affordability_status text NOT NULL DEFAULT 'can_pay',
  risk_level text NOT NULL DEFAULT 'normal',
  has_deadline boolean DEFAULT false,
  status text NOT NULL DEFAULT 'in_progress',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.spanish_triage_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own spanish triage sessions"
  ON public.spanish_triage_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spanish triage sessions"
  ON public.spanish_triage_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spanish triage sessions"
  ON public.spanish_triage_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert spanish triage sessions"
  ON public.spanish_triage_sessions FOR INSERT TO anon
  WITH CHECK (anonymous_session_id IS NOT NULL AND user_id IS NULL);

CREATE TRIGGER spanish_triage_sessions_updated_at
  BEFORE UPDATE ON public.spanish_triage_sessions
  FOR EACH ROW EXECUTE FUNCTION public.intake_set_updated_at();

-- business_intake_sessions
CREATE TABLE IF NOT EXISTS public.business_intake_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id text,
  jurisdiction text,
  language text DEFAULT 'en',
  business_segment text NOT NULL DEFAULT '',
  document_type text,
  attorney_review_recommended boolean DEFAULT false,
  scope_acknowledged boolean DEFAULT false,
  status text NOT NULL DEFAULT 'in_progress',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.business_intake_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own business intake sessions"
  ON public.business_intake_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business intake sessions"
  ON public.business_intake_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business intake sessions"
  ON public.business_intake_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert business intake sessions"
  ON public.business_intake_sessions FOR INSERT TO anon
  WITH CHECK (anonymous_session_id IS NOT NULL AND user_id IS NULL);

CREATE TRIGGER business_intake_sessions_updated_at
  BEFORE UPDATE ON public.business_intake_sessions
  FOR EACH ROW EXECUTE FUNCTION public.intake_set_updated_at();

-- org_partner_profiles
CREATE TABLE IF NOT EXISTS public.org_partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id text,
  org_type text NOT NULL DEFAULT '',
  jurisdictions_served text[] DEFAULT '{}',
  issue_areas text[] DEFAULT '{}',
  languages_supported text[] DEFAULT '{}',
  intake_volume text,
  accepts_warm_referrals boolean DEFAULT false,
  requires_conflict_check boolean DEFAULT false,
  consent_given boolean DEFAULT false,
  status text NOT NULL DEFAULT 'submitted',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.org_partner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own org partner profiles"
  ON public.org_partner_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own org partner profiles"
  ON public.org_partner_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own org partner profiles"
  ON public.org_partner_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert org partner profiles"
  ON public.org_partner_profiles FOR INSERT TO anon
  WITH CHECK (anonymous_session_id IS NOT NULL AND user_id IS NULL);

CREATE TRIGGER org_partner_profiles_updated_at
  BEFORE UPDATE ON public.org_partner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.intake_set_updated_at();

-- referral_routing_records
CREATE TABLE IF NOT EXISTS public.referral_routing_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id text,
  triage_session_id uuid REFERENCES public.spanish_triage_sessions(id) ON DELETE SET NULL,
  partner_profile_id uuid REFERENCES public.org_partner_profiles(id) ON DELETE SET NULL,
  jurisdiction text,
  language text,
  issue_area text,
  affordability_status text,
  risk_level text,
  referral_status text NOT NULL DEFAULT 'new',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.referral_routing_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral records"
  ON public.referral_routing_records FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral records"
  ON public.referral_routing_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Org users can read assigned referrals"
  ON public.referral_routing_records FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_partner_profiles
      WHERE org_partner_profiles.id = referral_routing_records.partner_profile_id
      AND org_partner_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Org users can update assigned referrals"
  ON public.referral_routing_records FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_partner_profiles
      WHERE org_partner_profiles.id = referral_routing_records.partner_profile_id
      AND org_partner_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_partner_profiles
      WHERE org_partner_profiles.id = referral_routing_records.partner_profile_id
      AND org_partner_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Anon can insert referral records"
  ON public.referral_routing_records FOR INSERT TO anon
  WITH CHECK (anonymous_session_id IS NOT NULL AND user_id IS NULL);

CREATE TRIGGER referral_routing_records_updated_at
  BEFORE UPDATE ON public.referral_routing_records
  FOR EACH ROW EXECUTE FUNCTION public.intake_set_updated_at();

-- attorney_review_requests
CREATE TABLE IF NOT EXISTS public.attorney_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id text,
  business_session_id uuid REFERENCES public.business_intake_sessions(id) ON DELETE SET NULL,
  business_segment text,
  jurisdiction text,
  issue_area text,
  trigger_reasons text[] DEFAULT '{}',
  document_type text,
  urgency text DEFAULT 'normal',
  status text NOT NULL DEFAULT 'draft',
  estimated_turnaround text,
  price_cents integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.attorney_review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attorney review requests"
  ON public.attorney_review_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attorney review requests"
  ON public.attorney_review_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attorney review requests"
  ON public.attorney_review_requests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert attorney review requests"
  ON public.attorney_review_requests FOR INSERT TO anon
  WITH CHECK (anonymous_session_id IS NOT NULL AND user_id IS NULL);

CREATE TRIGGER attorney_review_requests_updated_at
  BEFORE UPDATE ON public.attorney_review_requests
  FOR EACH ROW EXECUTE FUNCTION public.intake_set_updated_at();

-- intake_consent_records
CREATE TABLE IF NOT EXISTS public.intake_consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id text,
  consent_type text NOT NULL,
  consent_text text NOT NULL DEFAULT '',
  granted boolean DEFAULT false,
  icp text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.intake_consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own consent records"
  ON public.intake_consent_records FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
  ON public.intake_consent_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert consent records"
  ON public.intake_consent_records FOR INSERT TO anon
  WITH CHECK (anonymous_session_id IS NOT NULL AND user_id IS NULL);

-- intake_audit_events (insert-only for users)
CREATE TABLE IF NOT EXISTS public.intake_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id text,
  event_type text NOT NULL,
  icp text,
  step_id text,
  jurisdiction text,
  language text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.intake_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audit events"
  ON public.intake_audit_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit events"
  ON public.intake_audit_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert audit events"
  ON public.intake_audit_events FOR INSERT TO anon
  WITH CHECK (anonymous_session_id IS NOT NULL AND user_id IS NULL);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_spanish_triage_user_id ON public.spanish_triage_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_spanish_triage_anon ON public.spanish_triage_sessions(anonymous_session_id) WHERE anonymous_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_business_intake_user_id ON public.business_intake_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_business_intake_anon ON public.business_intake_sessions(anonymous_session_id) WHERE anonymous_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_org_partner_user_id ON public.org_partner_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_routing_partner ON public.referral_routing_records(partner_profile_id) WHERE partner_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_routing_triage ON public.referral_routing_records(triage_session_id) WHERE triage_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attorney_review_user_id ON public.attorney_review_requests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attorney_review_session ON public.attorney_review_requests(business_session_id) WHERE business_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_intake_audit_user_id ON public.intake_audit_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_intake_audit_event_type ON public.intake_audit_events(event_type);
