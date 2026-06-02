/*
  # Create Viral Sharing and Referral Tracking Tables

  1. New Tables
    - `engagement_events`
      - Tracks share events by platform (WhatsApp, Facebook, SMS, etc.)
      - Stores language preference and context for viral optimization
      - Used to measure Hispanic community engagement
    
    - `referral_codes`
      - Tracks referral chains for viral growth
      - Links referrers to referred users
      - Measures conversion from referrals

  2. Security
    - engagement_events: Anyone can insert (anonymous tracking allowed)
    - referral_codes: Users can view own referrals, admins see all

  3. Purpose
    - Measure viral sharing effectiveness
    - Optimize for Hispanic community sharing patterns
    - Track referral conversions for growth metrics
*/

CREATE TABLE IF NOT EXISTS engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  platform text,
  url text,
  language text DEFAULT 'en',
  context text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_engagement_events_type ON engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_events_platform ON engagement_events(platform);
CREATE INDEX IF NOT EXISTS idx_engagement_events_language ON engagement_events(language);
CREATE INDEX IF NOT EXISTS idx_engagement_events_created ON engagement_events(created_at);

CREATE POLICY "Anyone can insert engagement events"
  ON engagement_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own engagement events"
  ON engagement_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired')),
  converted_at timestamptz,
  platform text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer ON referral_codes(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_status ON referral_codes(status);

CREATE POLICY "Users can view own referral codes"
  ON referral_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referral codes"
  ON referral_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    v_code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;

CREATE OR REPLACE FUNCTION track_share_event(
  p_platform text,
  p_url text DEFAULT NULL,
  p_language text DEFAULT 'en',
  p_context text DEFAULT 'general'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO engagement_events (
    event_type,
    platform,
    url,
    language,
    context,
    user_id
  ) VALUES (
    'share',
    p_platform,
    p_url,
    p_language,
    p_context,
    auth.uid()
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_share_analytics(p_days integer DEFAULT 30)
RETURNS TABLE(
  platform text,
  language text,
  share_count bigint,
  unique_urls bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.platform,
    e.language,
    COUNT(*) as share_count,
    COUNT(DISTINCT e.url) as unique_urls
  FROM engagement_events e
  WHERE e.event_type = 'share'
    AND e.created_at > now() - (p_days || ' days')::interval
  GROUP BY e.platform, e.language
  ORDER BY share_count DESC;
END;
$$;
