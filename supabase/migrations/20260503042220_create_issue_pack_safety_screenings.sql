/*
  # Issue Pack Safety Screening Audit

  Captures pre-purchase safety-screening events for high-stakes Issue Packs
  (immigration, housing, family). Used to substantiate the "safety screening
  before purchase" trust claim and to power refund/decline reporting.

  1. New Tables
    - `issue_pack_safety_screenings`
      - `id` uuid primary key
      - `user_id` uuid nullable (anonymous pre-auth allowed)
      - `session_id` text (anonymous tracking)
      - `pack_id` text (immigration, housing, family, ...)
      - `language` text (en, es, ar, he)
      - `acknowledged` boolean (user ticked the I-understand box)
      - `outcome` text check (proceeded, declined, referred_to_attorney, emergency_diversion)
      - `emergency_flags` jsonb (e.g. active ICE encounter, hearing <24h, DV)
      - `jurisdiction` text (state code user selected, if any)
      - `created_at` timestamptz default now()

  2. Security
    - RLS enabled. Users can only read their own rows. Anonymous inserts
      allowed so screenings can happen before login. Admins can read all.
*/

CREATE TABLE IF NOT EXISTS issue_pack_safety_screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text DEFAULT '',
  pack_id text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'en',
  acknowledged boolean NOT NULL DEFAULT false,
  outcome text NOT NULL DEFAULT 'proceeded'
    CHECK (outcome IN ('proceeded', 'declined', 'referred_to_attorney', 'emergency_diversion')),
  emergency_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  jurisdiction text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ipss_user_id ON issue_pack_safety_screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_ipss_pack_id ON issue_pack_safety_screenings(pack_id);
CREATE INDEX IF NOT EXISTS idx_ipss_created_at ON issue_pack_safety_screenings(created_at DESC);

ALTER TABLE issue_pack_safety_screenings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own safety screenings"
  ON issue_pack_safety_screenings FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all safety screenings"
  ON issue_pack_safety_screenings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert safety screening records"
  ON issue_pack_safety_screenings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
