/*
  # Create Perspective Submissions Table

  1. New Tables
    - `perspective_submissions`
      - `id` (uuid, primary key)
      - `full_name` (text) - Submitter's name
      - `email` (text) - Contact email
      - `organization` (text) - Organization name
      - `role` (text) - Professional role
      - `years_experience` (text) - Experience level
      - `ai_tools_used` (text[]) - Array of AI tools used
      - `use_cases` (text[]) - Array of use cases
      - `impact_description` (text) - Description of positive impact
      - `challenges_description` (text) - Description of challenges
      - `ethics_approach` (text) - Approach to AI ethics
      - `willing_to_interview` (boolean) - Open to interview
      - `willing_to_be_quoted` (boolean) - Willing to be quoted publicly
      - `additional_comments` (text) - Additional comments
      - `status` (text) - Submission status (new, reviewed, featured, archived)
      - `reviewed_by` (uuid) - Admin who reviewed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow public inserts (anyone can submit)
    - Only authenticated admins can read/update
*/

CREATE TABLE IF NOT EXISTS perspective_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  organization text NOT NULL,
  role text NOT NULL,
  years_experience text,
  ai_tools_used text[] DEFAULT '{}',
  use_cases text[] DEFAULT '{}',
  impact_description text NOT NULL,
  challenges_description text,
  ethics_approach text,
  willing_to_interview boolean DEFAULT false,
  willing_to_be_quoted boolean DEFAULT false,
  additional_comments text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'featured', 'archived')),
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE perspective_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit perspective"
  ON perspective_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all submissions"
  ON perspective_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update submissions"
  ON perspective_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_perspective_submissions_status ON perspective_submissions(status);
CREATE INDEX IF NOT EXISTS idx_perspective_submissions_created_at ON perspective_submissions(created_at DESC);
