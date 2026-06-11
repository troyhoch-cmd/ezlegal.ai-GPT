/*
  # Create Link Health Events Table

  1. New Tables
    - `link_health_events`
      - `id` (uuid, primary key)
      - `event_type` (text) - 'route_not_found', 'anchor_not_found', or 'cta_click'
      - `path` (text) - The URL path that triggered the event
      - `referrer_path` (text) - The page the user was on when the event occurred
      - `cta_id` (text, nullable) - The CTA identifier if applicable
      - `anchor` (text, nullable) - The anchor fragment if applicable
      - `occurred_at` (timestamptz) - When the event happened
      - `created_at` (timestamptz) - Database insert timestamp

  2. Security
    - Enable RLS on `link_health_events` table
    - Add INSERT policy for anonymous key (telemetry needs to work without auth)
    - Add SELECT policy for admin users only

  3. Indexes
    - Index on event_type for filtering
    - Index on occurred_at for time-range queries
    - Index on path for grouping broken links

  4. Notes
    - This table powers the runtime link-health telemetry system
    - Events are batched client-side and flushed periodically
    - Used to detect broken CTAs, missing routes, and dead anchors in production
*/

CREATE TABLE IF NOT EXISTS link_health_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('route_not_found', 'anchor_not_found', 'cta_click')),
  path text NOT NULL DEFAULT '',
  referrer_path text NOT NULL DEFAULT '',
  cta_id text,
  anchor text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE link_health_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous telemetry inserts"
  ON link_health_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view link health events"
  ON link_health_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_link_health_events_type ON link_health_events (event_type);
CREATE INDEX IF NOT EXISTS idx_link_health_events_occurred_at ON link_health_events (occurred_at);
CREATE INDEX IF NOT EXISTS idx_link_health_events_path ON link_health_events (path);
