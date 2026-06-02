/*
  # Create Negotiation Planner Purchases System

  1. New Tables
    - `negotiation_planner_purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, for non-logged-in purchases)
      - `purchase_type` (text) - 'single' or 'unlimited'
      - `amount_paid` (integer) - price in cents
      - `stripe_session_id` (text) - for payment tracking
      - `plans_remaining` (integer) - null for unlimited
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - null for lifetime

    - `negotiation_plans_generated`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional)
      - `email` (text, optional)
      - `session_id` (text) - anonymous tracking
      - `dispute_type` (text)
      - `amount_at_stake` (integer)
      - `generated_strategy` (jsonb)
      - `is_paid` (boolean) - if generated with paid access
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can view their own purchases and plans
*/

CREATE TABLE IF NOT EXISTS negotiation_planner_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  purchase_type text NOT NULL CHECK (purchase_type IN ('single', 'unlimited', 'pack')),
  amount_paid integer NOT NULL DEFAULT 0,
  stripe_session_id text,
  plans_remaining integer,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS negotiation_plans_generated (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  session_id text,
  dispute_type text NOT NULL,
  amount_at_stake integer,
  generated_strategy jsonb,
  is_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_negotiation_purchases_user_id ON negotiation_planner_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_purchases_email ON negotiation_planner_purchases(email);
CREATE INDEX IF NOT EXISTS idx_negotiation_plans_user_id ON negotiation_plans_generated(user_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_plans_session_id ON negotiation_plans_generated(session_id);

ALTER TABLE negotiation_planner_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_plans_generated ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON negotiation_planner_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON negotiation_planner_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own plans"
  ON negotiation_plans_generated
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON negotiation_plans_generated
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous users can insert plans"
  ON negotiation_plans_generated
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);