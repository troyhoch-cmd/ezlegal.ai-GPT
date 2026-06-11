/*
  # OpenAI Usage Tracking System

  1. New Tables
    - `openai_usage_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - linked user if authenticated
      - `session_id` (text) - chat session identifier
      - `model_name` (text) - model used (e.g., gpt-4o, gpt-4o-mini)
      - `prompt_tokens` (integer) - tokens in the prompt
      - `completion_tokens` (integer) - tokens in the response
      - `total_tokens` (integer) - total tokens used
      - `cost_usd` (numeric) - calculated cost in USD
      - `request_type` (text) - 'chat', 'analysis', 'embedding'
      - `jurisdiction` (text) - legal jurisdiction
      - `category` (text) - legal category
      - `response_time_ms` (integer) - API response time
      - `success` (boolean) - whether request succeeded
      - `error_message` (text) - error if failed
      - `created_at` (timestamptz)

    - `openai_rate_limits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `ip_address` (text, nullable)
      - `requests_count` (integer)
      - `tokens_count` (integer)
      - `window_start` (timestamptz)
      - `window_type` (text) - 'minute', 'hour', 'day'

  2. Functions
    - `get_active_openai_model()` - Returns the default active model config
    - `log_openai_usage()` - Logs API usage with cost calculation

  3. Security
    - Enable RLS on all tables
    - Users can view their own usage logs
    - Rate limit tracking is service-level
*/

-- OpenAI Usage Logs table
CREATE TABLE IF NOT EXISTS openai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  model_name text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer GENERATED ALWAYS AS (prompt_tokens + completion_tokens) STORED,
  cost_usd numeric(10, 8) NOT NULL DEFAULT 0,
  request_type text NOT NULL DEFAULT 'chat',
  jurisdiction text,
  category text,
  response_time_ms integer,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE openai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage logs"
  ON openai_usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert usage logs"
  ON openai_usage_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Rate Limits table
CREATE TABLE IF NOT EXISTS openai_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text,
  requests_count integer NOT NULL DEFAULT 0,
  tokens_count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  window_type text NOT NULL DEFAULT 'hour',
  CONSTRAINT rate_limit_identifier CHECK (user_id IS NOT NULL OR ip_address IS NOT NULL)
);

ALTER TABLE openai_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can manage rate limits"
  ON openai_rate_limits
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Function to get active OpenAI model configuration
CREATE OR REPLACE FUNCTION get_active_openai_model()
RETURNS TABLE (
  model_name text,
  display_name text,
  max_tokens integer,
  cost_per_token numeric,
  settings jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    amc.model_name,
    amc.display_name,
    amc.max_tokens,
    amc.cost_per_token,
    amc.settings
  FROM ai_model_configs amc
  WHERE amc.provider = 'openai'
    AND amc.is_active = true
    AND amc.is_default = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      amc.model_name,
      amc.display_name,
      amc.max_tokens,
      amc.cost_per_token,
      amc.settings
    FROM ai_model_configs amc
    WHERE amc.provider = 'openai'
      AND amc.is_active = true
    ORDER BY amc.priority DESC
    LIMIT 1;
  END IF;
END;
$$;

-- Function to log OpenAI usage with cost calculation
CREATE OR REPLACE FUNCTION log_openai_usage(
  p_user_id uuid,
  p_session_id text,
  p_model_name text,
  p_prompt_tokens integer,
  p_completion_tokens integer,
  p_request_type text DEFAULT 'chat',
  p_jurisdiction text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_response_time_ms integer DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost_per_token numeric;
  v_cost_usd numeric;
  v_log_id uuid;
BEGIN
  SELECT cost_per_token INTO v_cost_per_token
  FROM ai_model_configs
  WHERE model_name = p_model_name
  LIMIT 1;
  
  IF v_cost_per_token IS NULL THEN
    v_cost_per_token := 0.00001;
  END IF;
  
  v_cost_usd := (p_prompt_tokens + p_completion_tokens) * v_cost_per_token;
  
  INSERT INTO openai_usage_logs (
    user_id,
    session_id,
    model_name,
    prompt_tokens,
    completion_tokens,
    cost_usd,
    request_type,
    jurisdiction,
    category,
    response_time_ms,
    success,
    error_message
  ) VALUES (
    p_user_id,
    p_session_id,
    p_model_name,
    p_prompt_tokens,
    p_completion_tokens,
    v_cost_usd,
    p_request_type,
    p_jurisdiction,
    p_category,
    p_response_time_ms,
    p_success,
    p_error_message
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_openai_rate_limit(
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_window_type text DEFAULT 'hour',
  p_max_requests integer DEFAULT 100,
  p_max_tokens integer DEFAULT 100000
)
RETURNS TABLE (
  allowed boolean,
  requests_remaining integer,
  tokens_remaining integer,
  reset_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_duration interval;
  v_current_requests integer;
  v_current_tokens integer;
  v_window_start timestamptz;
BEGIN
  CASE p_window_type
    WHEN 'minute' THEN v_window_duration := interval '1 minute';
    WHEN 'hour' THEN v_window_duration := interval '1 hour';
    WHEN 'day' THEN v_window_duration := interval '1 day';
    ELSE v_window_duration := interval '1 hour';
  END CASE;
  
  SELECT 
    orl.requests_count,
    orl.tokens_count,
    orl.window_start
  INTO v_current_requests, v_current_tokens, v_window_start
  FROM openai_rate_limits orl
  WHERE (p_user_id IS NOT NULL AND orl.user_id = p_user_id)
     OR (p_ip_address IS NOT NULL AND orl.ip_address = p_ip_address)
  AND orl.window_type = p_window_type
  AND orl.window_start > now() - v_window_duration;
  
  IF NOT FOUND THEN
    v_current_requests := 0;
    v_current_tokens := 0;
    v_window_start := now();
  END IF;
  
  RETURN QUERY SELECT
    (v_current_requests < p_max_requests AND v_current_tokens < p_max_tokens) AS allowed,
    GREATEST(0, p_max_requests - v_current_requests) AS requests_remaining,
    GREATEST(0, p_max_tokens - v_current_tokens) AS tokens_remaining,
    (v_window_start + v_window_duration) AS reset_at;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_user_id ON openai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_session_id ON openai_usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_created_at ON openai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_model_name ON openai_usage_logs(model_name);
CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_user_id ON openai_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_ip_address ON openai_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_window ON openai_rate_limits(window_type, window_start);
