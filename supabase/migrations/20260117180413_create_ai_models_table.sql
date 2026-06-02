/*
  # Create AI Models Table

  1. New Tables
    - `ai_models`
      - `id` (uuid, primary key)
      - `model_name` (text, unique) - internal identifier
      - `display_name` (text) - user-facing name
      - `openai_model` (text) - actual OpenAI API model name
      - `description` (text) - model description
      - `max_tokens` (integer) - maximum tokens for this model
      - `cost_per_1k_tokens` (decimal) - cost tracking
      - `is_active` (boolean) - whether model is available
      - `is_default` (boolean) - default model selection
      - `display_order` (integer) - sort order in UI
      - `tier_required` (text) - subscription tier needed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `ai_models` table
    - Add policy for authenticated users to read models
    - Add policy for admins to manage models

  3. Data
    - Populate with all available OpenAI models
*/

CREATE TABLE IF NOT EXISTS ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  openai_model text NOT NULL,
  description text,
  max_tokens integer DEFAULT 4096,
  cost_per_1k_tokens decimal(10, 6) DEFAULT 0.0,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  display_order integer DEFAULT 0,
  tier_required text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_models' AND policyname = 'Anyone can view active models'
  ) THEN
    CREATE POLICY "Anyone can view active models"
      ON ai_models
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_models' AND policyname = 'Admins can manage models'
  ) THEN
    CREATE POLICY "Admins can manage models"
      ON ai_models
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_models_display_order ON ai_models(display_order);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_active ON ai_models(is_active);

INSERT INTO ai_models (model_name, display_name, openai_model, description, max_tokens, cost_per_1k_tokens, is_active, is_default, display_order, tier_required)
VALUES
  ('chatgpt', 'ChatGPT', 'gpt-3.5-turbo', 'Fast and efficient for general legal questions', 4096, 0.0005, true, true, 1, 'free'),
  ('chatgpt-plus', 'ChatGPT Plus', 'gpt-3.5-turbo-16k', 'Extended context for longer documents', 16384, 0.001, true, false, 2, 'free'),
  ('chatgpt-4', 'ChatGPT 4', 'gpt-4', 'Advanced reasoning for complex legal analysis', 8192, 0.03, true, false, 3, 'premium'),
  ('chatgpt-4o', 'ChatGPT 4o', 'gpt-4o', 'Latest multimodal model with enhanced capabilities', 128000, 0.005, true, false, 4, 'premium'),
  ('chatgpt-4o-mini', 'ChatGPT 4o mini', 'gpt-4o-mini', 'Cost-effective version of GPT-4o', 128000, 0.00015, true, false, 5, 'free'),
  ('chatgpt-o1', 'ChatGPT o1', 'o1', 'Advanced reasoning model for complex legal problems', 200000, 0.015, true, false, 6, 'premium'),
  ('chatgpt-o3-mini', 'ChatGPT o3-mini', 'o3-mini', 'Efficient reasoning model', 200000, 0.0011, true, false, 7, 'premium'),
  ('chatgpt-5.2', 'ChatGPT 5.2', 'gpt-4o', 'Premium model with latest enhancements', 128000, 0.005, true, false, 8, 'premium'),
  ('chatgpt-5.1', 'ChatGPT 5.1', 'gpt-4o', 'Enhanced legal reasoning capabilities', 128000, 0.005, true, false, 9, 'premium'),
  ('chatgpt-5-mini', 'ChatGPT 5 mini', 'gpt-4o-mini', 'Balanced performance and cost', 128000, 0.00015, true, false, 10, 'free'),
  ('chatgpt-5-nano', 'ChatGPT 5 nano', 'gpt-4o-mini', 'Lightweight model for quick responses', 128000, 0.00015, true, false, 11, 'free')
ON CONFLICT (model_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  openai_model = EXCLUDED.openai_model,
  description = EXCLUDED.description,
  max_tokens = EXCLUDED.max_tokens,
  cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  tier_required = EXCLUDED.tier_required,
  updated_at = now();

DROP FUNCTION IF EXISTS get_active_openai_model();

CREATE FUNCTION get_active_openai_model()
RETURNS TABLE (
  model_name text,
  display_name text,
  openai_model text,
  max_tokens integer,
  cost_per_token decimal,
  settings jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.model_name,
    m.display_name,
    m.openai_model,
    m.max_tokens,
    m.cost_per_1k_tokens / 1000 as cost_per_token,
    jsonb_build_object('temperature', 0.7) as settings
  FROM ai_models m
  WHERE m.is_active = true AND m.is_default = true
  LIMIT 1;
$$;
