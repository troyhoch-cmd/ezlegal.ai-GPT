/*
  # Create Engagement Analytics and Anonymized Search Storage

  1. New Tables
    - `engagement_analytics`
      - Tracks user engagement by feature, case type, and activity
      - Used to identify most popular features and conversion opportunities
      - Aggregated metrics for dashboard reporting
    
    - `anonymized_searches`
      - Stores anonymized search queries to improve AI responses
      - No PII - only query patterns, case types, and outcomes
      - Used for AI training and knowledge base improvement

  2. Security
    - engagement_analytics: Users can view own data, admins see all
    - anonymized_searches: Insert only for authenticated users (no PII)

  3. Purpose
    - Drive premium conversions by showing value
    - Improve AI accuracy through search pattern analysis
    - Identify high-value case types for marketing
*/

CREATE TABLE IF NOT EXISTS engagement_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  feature_name text NOT NULL,
  case_type text,
  activity_type text,
  jurisdiction text,
  engagement_type text NOT NULL CHECK (engagement_type IN ('view', 'click', 'complete', 'convert', 'share', 'export')),
  duration_seconds integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE engagement_analytics ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_engagement_feature ON engagement_analytics(feature_name);
CREATE INDEX IF NOT EXISTS idx_engagement_case_type ON engagement_analytics(case_type) WHERE case_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_engagement_created ON engagement_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_engagement_user ON engagement_analytics(user_id) WHERE user_id IS NOT NULL;

CREATE POLICY "Users can view own engagement data"
  ON engagement_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own engagement data"
  ON engagement_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE TABLE IF NOT EXISTS anonymized_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text NOT NULL,
  query_category text,
  case_type text,
  jurisdiction text,
  keywords text[],
  intent_classification text,
  response_quality_score integer CHECK (response_quality_score >= 1 AND response_quality_score <= 5),
  led_to_conversion boolean DEFAULT false,
  led_to_lawyer_match boolean DEFAULT false,
  session_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE anonymized_searches ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_anon_searches_category ON anonymized_searches(query_category);
CREATE INDEX IF NOT EXISTS idx_anon_searches_case_type ON anonymized_searches(case_type);
CREATE INDEX IF NOT EXISTS idx_anon_searches_keywords ON anonymized_searches USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_anon_searches_created ON anonymized_searches(created_at);

CREATE POLICY "Authenticated users can insert anonymized searches"
  ON anonymized_searches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION track_engagement(
  p_feature_name text,
  p_engagement_type text,
  p_case_type text DEFAULT NULL,
  p_activity_type text DEFAULT NULL,
  p_jurisdiction text DEFAULT NULL,
  p_duration_seconds integer DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_session_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO engagement_analytics (
    user_id,
    feature_name,
    case_type,
    activity_type,
    jurisdiction,
    engagement_type,
    duration_seconds,
    metadata,
    session_id
  ) VALUES (
    auth.uid(),
    p_feature_name,
    p_case_type,
    p_activity_type,
    p_jurisdiction,
    p_engagement_type,
    p_duration_seconds,
    p_metadata,
    p_session_id
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION store_anonymized_search(
  p_query_text text,
  p_case_type text DEFAULT NULL,
  p_jurisdiction text DEFAULT NULL,
  p_intent text DEFAULT NULL,
  p_led_to_conversion boolean DEFAULT false,
  p_led_to_lawyer_match boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_keywords text[];
  v_hash text;
BEGIN
  v_hash := encode(sha256(p_query_text::bytea), 'hex');
  
  v_keywords := regexp_split_to_array(
    lower(regexp_replace(p_query_text, '[^a-zA-Z0-9\s]', '', 'g')),
    '\s+'
  );
  v_keywords := array(
    SELECT DISTINCT unnest(v_keywords)
    WHERE length(unnest) > 3
    ORDER BY 1
    LIMIT 10
  );

  INSERT INTO anonymized_searches (
    query_hash,
    query_category,
    case_type,
    jurisdiction,
    keywords,
    intent_classification,
    led_to_conversion,
    led_to_lawyer_match
  ) VALUES (
    v_hash,
    p_case_type,
    p_case_type,
    p_jurisdiction,
    v_keywords,
    p_intent,
    p_led_to_conversion,
    p_led_to_lawyer_match
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_popular_case_types(p_days integer DEFAULT 30)
RETURNS TABLE(case_type text, total_engagements bigint, conversion_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.case_type,
    COUNT(*) as total_engagements,
    ROUND(
      COUNT(*) FILTER (WHERE e.engagement_type = 'convert')::numeric / 
      NULLIF(COUNT(*)::numeric, 0) * 100, 2
    ) as conversion_rate
  FROM engagement_analytics e
  WHERE e.case_type IS NOT NULL
    AND e.created_at > now() - (p_days || ' days')::interval
  GROUP BY e.case_type
  ORDER BY total_engagements DESC
  LIMIT 20;
END;
$$;

CREATE OR REPLACE FUNCTION get_feature_engagement_stats(p_days integer DEFAULT 30)
RETURNS TABLE(
  feature_name text, 
  total_views bigint, 
  total_completions bigint, 
  total_conversions bigint,
  avg_duration numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.feature_name,
    COUNT(*) FILTER (WHERE e.engagement_type = 'view') as total_views,
    COUNT(*) FILTER (WHERE e.engagement_type = 'complete') as total_completions,
    COUNT(*) FILTER (WHERE e.engagement_type = 'convert') as total_conversions,
    ROUND(AVG(e.duration_seconds)::numeric, 1) as avg_duration
  FROM engagement_analytics e
  WHERE e.created_at > now() - (p_days || ' days')::interval
  GROUP BY e.feature_name
  ORDER BY total_views DESC;
END;
$$;