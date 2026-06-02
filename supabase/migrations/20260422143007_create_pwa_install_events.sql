/*
  # PWA install event tracking

  1. Purpose
    - Track PWA install lifecycle events (prompt shown, accepted, dismissed, installed)
      so we can measure installability and debug the install flow.

  2. New tables
    - pwa_install_events
      - id (uuid, pk)
      - user_id (uuid, nullable - FK to auth.users)
      - session_key (text, nullable)
      - event_type (text: 'prompt_shown' | 'accepted' | 'dismissed' | 'installed' | 'display_mode')
      - platform (text, nullable - mobile/desktop/unknown)
      - display_mode (text, nullable - browser/standalone/minimal-ui/fullscreen)
      - user_agent (text, nullable)
      - context (jsonb, default {})
      - created_at (timestamptz, default now())

  3. Security
    - RLS enabled.
    - Anyone (anon + authenticated) can INSERT their own rows (user_id either null or auth.uid()).
    - Admins can SELECT/DELETE all rows.

  4. Indexes
    - Indexed on created_at desc and (event_type, created_at desc).
*/

CREATE TABLE IF NOT EXISTS pwa_install_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_key text,
  event_type text NOT NULL CHECK (event_type IN ('prompt_shown', 'accepted', 'dismissed', 'installed', 'display_mode')),
  platform text,
  display_mode text,
  user_agent text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pwa_install_events_created_at ON pwa_install_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pwa_install_events_type ON pwa_install_events (event_type, created_at DESC);

ALTER TABLE pwa_install_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log their install events" ON pwa_install_events;
CREATE POLICY "Anyone can log their install events"
  ON pwa_install_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins read install events" ON pwa_install_events;
CREATE POLICY "Admins read install events"
  ON pwa_install_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins delete install events" ON pwa_install_events;
CREATE POLICY "Admins delete install events"
  ON pwa_install_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true
    )
  );
