/*
  # Add Tiered Usage Guardrails

  This migration extends the existing free tier rate limiting to include
  guardrails for all subscription tiers. Prevents margin erosion from
  excessive AI usage while ensuring good UX through clear limits.

  ## 1. New Tables

  ### `subscription_tier_limits`
  Defines usage limits per subscription tier

  ### `daily_usage_tracking` and `monthly_usage_tracking`
  Tracks aggregated usage per period

  ### `usage_alerts`
  Tracks when users approach/exceed limits

  ## 2. Tier Structure

  - free: Strict limits, conversion-focused
  - starter: Individual users, reasonable limits
  - professional: Power users, higher limits
  - enterprise: Custom limits, priority support
*/

-- Drop existing function that has different return type
DROP FUNCTION IF EXISTS public.check_usage_limit(uuid, text, integer);

-- Create subscription_tier_limits table
CREATE TABLE IF NOT EXISTS subscription_tier_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL UNIQUE CHECK (tier IN ('free', 'starter', 'professional', 'enterprise')),
  messages_per_day integer NOT NULL,
  ai_queries_per_day integer NOT NULL,
  documents_per_month integer NOT NULL,
  export_requests_per_month integer NOT NULL,
  max_matters integer NOT NULL,
  max_participants_per_matter integer NOT NULL,
  rag_queries_per_day integer NOT NULL,
  token_budget_per_day integer NOT NULL,
  priority_support boolean NOT NULL DEFAULT false,
  custom_limits boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Populate tier limits
INSERT INTO subscription_tier_limits (
  tier, 
  messages_per_day, 
  ai_queries_per_day, 
  documents_per_month, 
  export_requests_per_month,
  max_matters,
  max_participants_per_matter,
  rag_queries_per_day,
  token_budget_per_day,
  priority_support,
  custom_limits
) VALUES
  ('free', 10, 5, 5, 1, 1, 1, 3, 10000, false, false),
  ('starter', 100, 50, 50, 10, 10, 3, 30, 100000, false, false),
  ('professional', 500, 200, 200, 50, 50, 10, 150, 500000, true, false),
  ('enterprise', 10000, 5000, 5000, 1000, 1000, 100, 3000, 10000000, true, true)
ON CONFLICT (tier) DO UPDATE SET
  messages_per_day = EXCLUDED.messages_per_day,
  ai_queries_per_day = EXCLUDED.ai_queries_per_day,
  documents_per_month = EXCLUDED.documents_per_month,
  export_requests_per_month = EXCLUDED.export_requests_per_month,
  max_matters = EXCLUDED.max_matters,
  max_participants_per_matter = EXCLUDED.max_participants_per_matter,
  rag_queries_per_day = EXCLUDED.rag_queries_per_day,
  token_budget_per_day = EXCLUDED.token_budget_per_day,
  priority_support = EXCLUDED.priority_support,
  custom_limits = EXCLUDED.custom_limits,
  updated_at = now();

-- Create usage_tracking table for aggregated daily usage
CREATE TABLE IF NOT EXISTS daily_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  messages_count integer NOT NULL DEFAULT 0,
  ai_queries_count integer NOT NULL DEFAULT 0,
  rag_queries_count integer NOT NULL DEFAULT 0,
  tokens_used integer NOT NULL DEFAULT 0,
  estimated_cost_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, usage_date)
);

-- Create monthly_usage_tracking table
CREATE TABLE IF NOT EXISTS monthly_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_month date NOT NULL,
  documents_count integer NOT NULL DEFAULT 0,
  export_requests_count integer NOT NULL DEFAULT 0,
  total_tokens_used integer NOT NULL DEFAULT 0,
  total_cost_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, usage_month)
);

-- Create usage_alerts table
CREATE TABLE IF NOT EXISTS usage_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('approaching_limit', 'limit_reached', 'limit_exceeded', 'upgrade_recommended')),
  resource_type text NOT NULL,
  current_usage integer NOT NULL,
  limit_value integer NOT NULL,
  percentage_used numeric(5,2) NOT NULL,
  acknowledged boolean NOT NULL DEFAULT false,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage_tracking(user_id, usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_user_month ON monthly_usage_tracking(user_id, usage_month DESC);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_user ON usage_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_unack ON usage_alerts(user_id) WHERE acknowledged = false;

-- Enable RLS
ALTER TABLE subscription_tier_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view tier limits" ON subscription_tier_limits;
DROP POLICY IF EXISTS "Users can view own daily usage" ON daily_usage_tracking;
DROP POLICY IF EXISTS "Users can view own monthly usage" ON monthly_usage_tracking;
DROP POLICY IF EXISTS "Users can view own alerts" ON usage_alerts;
DROP POLICY IF EXISTS "Users can acknowledge own alerts" ON usage_alerts;

-- Tier limits are readable by all authenticated users
CREATE POLICY "Users can view tier limits"
  ON subscription_tier_limits FOR SELECT
  TO authenticated
  USING (true);

-- Users can only view their own usage
CREATE POLICY "Users can view own daily usage"
  ON daily_usage_tracking FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own monthly usage"
  ON monthly_usage_tracking FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own alerts"
  ON usage_alerts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can acknowledge own alerts"
  ON usage_alerts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to get user's current tier
CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT subscription_tier FROM profiles WHERE id = p_user_id),
    'free'
  );
$$;

-- Function to check if user can perform action (returns jsonb)
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_user_id uuid,
  p_resource_type text,
  p_increment integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier text;
  v_limits subscription_tier_limits;
  v_current_usage integer := 0;
  v_limit_value integer;
  v_allowed boolean := true;
  v_percentage numeric(5,2);
BEGIN
  v_tier := public.get_user_tier(p_user_id);
  SELECT * INTO v_limits FROM subscription_tier_limits WHERE tier = v_tier;
  
  CASE p_resource_type
    WHEN 'messages' THEN
      SELECT COALESCE(messages_count, 0) INTO v_current_usage
      FROM daily_usage_tracking
      WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
      v_limit_value := v_limits.messages_per_day;
      
    WHEN 'ai_queries' THEN
      SELECT COALESCE(ai_queries_count, 0) INTO v_current_usage
      FROM daily_usage_tracking
      WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
      v_limit_value := v_limits.ai_queries_per_day;
      
    WHEN 'rag_queries' THEN
      SELECT COALESCE(rag_queries_count, 0) INTO v_current_usage
      FROM daily_usage_tracking
      WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
      v_limit_value := v_limits.rag_queries_per_day;
      
    WHEN 'tokens' THEN
      SELECT COALESCE(tokens_used, 0) INTO v_current_usage
      FROM daily_usage_tracking
      WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
      v_limit_value := v_limits.token_budget_per_day;
      
    WHEN 'documents' THEN
      SELECT COALESCE(documents_count, 0) INTO v_current_usage
      FROM monthly_usage_tracking
      WHERE user_id = p_user_id AND usage_month = date_trunc('month', CURRENT_DATE)::date;
      v_limit_value := v_limits.documents_per_month;
      
    WHEN 'exports' THEN
      SELECT COALESCE(export_requests_count, 0) INTO v_current_usage
      FROM monthly_usage_tracking
      WHERE user_id = p_user_id AND usage_month = date_trunc('month', CURRENT_DATE)::date;
      v_limit_value := v_limits.export_requests_per_month;
      
    WHEN 'matters' THEN
      SELECT COUNT(*) INTO v_current_usage
      FROM matters
      WHERE user_id = p_user_id AND status != 'archived';
      v_limit_value := v_limits.max_matters;
      
    ELSE
      RETURN jsonb_build_object('allowed', false, 'error', 'Unknown resource type');
  END CASE;
  
  v_allowed := (v_current_usage + p_increment) <= v_limit_value;
  v_percentage := CASE WHEN v_limit_value > 0 THEN (v_current_usage::numeric / v_limit_value * 100) ELSE 0 END;
  
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_usage', v_current_usage,
    'limit', v_limit_value,
    'remaining', GREATEST(0, v_limit_value - v_current_usage),
    'percentage_used', v_percentage,
    'tier', v_tier,
    'resource_type', p_resource_type
  );
END;
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id uuid,
  p_resource_type text,
  p_amount integer DEFAULT 1,
  p_tokens integer DEFAULT 0,
  p_cost_cents integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE p_resource_type
    WHEN 'messages' THEN
      INSERT INTO daily_usage_tracking (user_id, usage_date, messages_count, tokens_used, estimated_cost_cents)
      VALUES (p_user_id, CURRENT_DATE, p_amount, p_tokens, p_cost_cents)
      ON CONFLICT (user_id, usage_date)
      DO UPDATE SET 
        messages_count = daily_usage_tracking.messages_count + p_amount,
        tokens_used = daily_usage_tracking.tokens_used + p_tokens,
        estimated_cost_cents = daily_usage_tracking.estimated_cost_cents + p_cost_cents,
        updated_at = now();
        
    WHEN 'ai_queries' THEN
      INSERT INTO daily_usage_tracking (user_id, usage_date, ai_queries_count, tokens_used, estimated_cost_cents)
      VALUES (p_user_id, CURRENT_DATE, p_amount, p_tokens, p_cost_cents)
      ON CONFLICT (user_id, usage_date)
      DO UPDATE SET 
        ai_queries_count = daily_usage_tracking.ai_queries_count + p_amount,
        tokens_used = daily_usage_tracking.tokens_used + p_tokens,
        estimated_cost_cents = daily_usage_tracking.estimated_cost_cents + p_cost_cents,
        updated_at = now();
        
    WHEN 'rag_queries' THEN
      INSERT INTO daily_usage_tracking (user_id, usage_date, rag_queries_count, tokens_used, estimated_cost_cents)
      VALUES (p_user_id, CURRENT_DATE, p_amount, p_tokens, p_cost_cents)
      ON CONFLICT (user_id, usage_date)
      DO UPDATE SET 
        rag_queries_count = daily_usage_tracking.rag_queries_count + p_amount,
        tokens_used = daily_usage_tracking.tokens_used + p_tokens,
        estimated_cost_cents = daily_usage_tracking.estimated_cost_cents + p_cost_cents,
        updated_at = now();
        
    WHEN 'documents' THEN
      INSERT INTO monthly_usage_tracking (user_id, usage_month, documents_count)
      VALUES (p_user_id, date_trunc('month', CURRENT_DATE)::date, p_amount)
      ON CONFLICT (user_id, usage_month)
      DO UPDATE SET 
        documents_count = monthly_usage_tracking.documents_count + p_amount,
        updated_at = now();
        
    WHEN 'exports' THEN
      INSERT INTO monthly_usage_tracking (user_id, usage_month, export_requests_count)
      VALUES (p_user_id, date_trunc('month', CURRENT_DATE)::date, p_amount)
      ON CONFLICT (user_id, usage_month)
      DO UPDATE SET 
        export_requests_count = monthly_usage_tracking.export_requests_count + p_amount,
        updated_at = now();
  END CASE;
END;
$$;

-- Function to create usage alert
CREATE OR REPLACE FUNCTION public.create_usage_alert(
  p_user_id uuid,
  p_resource_type text,
  p_current_usage integer,
  p_limit_value integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_percentage numeric(5,2);
  v_alert_type text;
BEGIN
  v_percentage := CASE WHEN p_limit_value > 0 THEN (p_current_usage::numeric / p_limit_value * 100) ELSE 0 END;
  
  IF v_percentage >= 100 THEN
    v_alert_type := 'limit_exceeded';
  ELSIF v_percentage >= 90 THEN
    v_alert_type := 'limit_reached';
  ELSIF v_percentage >= 75 THEN
    v_alert_type := 'approaching_limit';
  ELSE
    RETURN;
  END IF;
  
  INSERT INTO usage_alerts (
    user_id,
    alert_type,
    resource_type,
    current_usage,
    limit_value,
    percentage_used
  ) VALUES (
    p_user_id,
    v_alert_type,
    p_resource_type,
    p_current_usage,
    p_limit_value,
    v_percentage
  );
END;
$$;

-- Add cost tracking columns to openai_usage if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'openai_usage') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'openai_usage' AND column_name = 'estimated_cost_cents'
    ) THEN
      ALTER TABLE openai_usage ADD COLUMN estimated_cost_cents integer DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'openai_usage' AND column_name = 'model_pricing_version'
    ) THEN
      ALTER TABLE openai_usage ADD COLUMN model_pricing_version text;
    END IF;
  END IF;
END $$;
