-- Lead capture table for GTM conversion funnels
CREATE TABLE IF NOT EXISTS lead_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text NOT NULL,
  persona text,
  language text DEFAULT 'en',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lead_captures ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public lead capture forms)
CREATE POLICY "allow_public_insert_lead_captures" ON lead_captures
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated service-role can read leads (admin use)
CREATE POLICY "select_leads_service_role" ON lead_captures
  FOR SELECT TO authenticated
  USING (false);

-- Index for admin queries
CREATE INDEX idx_lead_captures_source ON lead_captures(source);
CREATE INDEX idx_lead_captures_created_at ON lead_captures(created_at DESC);
