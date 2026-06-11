/*
  # Create Funding Requests Table

  1. New Tables
    - `funding_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `lawyer_id` (text)
      - `lawyer_name` (text)
      - `requester_name` (text)
      - `requester_email` (text)
      - `requester_phone` (text, optional)
      - `annual_income` (text)
      - `household_size` (integer)
      - `funding_type` (text) - pro_bono, sliding_scale, payment_plan, legal_aid
      - `currently_employed` (boolean)
      - `receiving_benefits` (boolean)
      - `legal_matter_description` (text)
      - `financial_hardship_description` (text, optional)
      - `status` (text) - pending, approved, denied, referred
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Anyone can create requests
    - Authenticated users can view their own requests
*/

CREATE TABLE IF NOT EXISTS funding_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lawyer_id text NOT NULL,
  lawyer_name text NOT NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  annual_income text NOT NULL,
  household_size integer NOT NULL DEFAULT 1,
  funding_type text NOT NULL DEFAULT 'sliding_scale' CHECK (funding_type IN ('pro_bono', 'sliding_scale', 'payment_plan', 'legal_aid')),
  currently_employed boolean DEFAULT true,
  receiving_benefits boolean DEFAULT false,
  legal_matter_description text NOT NULL,
  financial_hardship_description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'referred')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funding_requests_user_id ON funding_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_funding_requests_lawyer_id ON funding_requests(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_funding_requests_status ON funding_requests(status);
CREATE INDEX IF NOT EXISTS idx_funding_requests_funding_type ON funding_requests(funding_type);

ALTER TABLE funding_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create funding requests"
  ON funding_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view their own funding requests"
  ON funding_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can update their own funding requests"
  ON funding_requests
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
