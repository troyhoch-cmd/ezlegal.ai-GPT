/*
  # Create leads table for GTM lead capture

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `email` (text, not null)
      - `role` (text)
      - `icp` (text, not null) - startups, law_firms, in_house
      - `legal_need` (text)
      - `urgency` (text)
      - `organization_name` (text)
      - `team_size` (text)
      - `description` (text)
      - `document_count` (text)
      - `lead_score` (integer)
      - `recommendation` (text)
      - `attribution` (jsonb) - UTM params, referrer, landing page
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `leads` table
    - Allow anonymous inserts (public lead capture)
    - Authenticated users can read their own leads by email
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text,
  email text NOT NULL,
  role text,
  icp text NOT NULL,
  legal_need text,
  urgency text,
  organization_name text,
  team_size text,
  description text,
  document_count text,
  lead_score integer DEFAULT 0,
  recommendation text,
  attribution jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to submit leads (public form)
CREATE POLICY "Anyone can submit a lead"
  ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can view leads matching their email
CREATE POLICY "Users can view own leads by email"
  ON leads
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create index on email for lookup performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
