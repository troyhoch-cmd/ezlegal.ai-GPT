/*
  # Extend analytics_events table for conversion tracking

  1. Modified Tables
    - `analytics_events`
      - Add `event_name` (text) - normalized conversion event name
      - Add `properties` (jsonb) - flexible event metadata
      - Add `page_path` (text) - URL path where event occurred
      - Add `referrer` (text) - document referrer
      - Add `user_agent` (text) - browser user agent
      - Add `language` (text) - active UI language
      - Add `jurisdiction` (text) - user's selected jurisdiction

  2. Indexes
    - event_name + created_at for time-series queries
    - session_id + created_at for session reconstruction

  3. Notes
    - Existing event_type/metadata columns preserved for backwards compatibility
    - New event_name column used by the conversion analytics service
    - Anonymous insert policy added for pre-auth tracking
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'event_name'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN event_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'properties'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN properties jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'page_path'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN page_path text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'referrer'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN referrer text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN user_agent text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'language'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN language text DEFAULT 'en';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'jurisdiction'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN jurisdiction text;
  END IF;
END $$;

-- Indexes for conversion funnel queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name_created
  ON analytics_events (event_name, created_at DESC)
  WHERE event_name != '';

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_created
  ON analytics_events (session_id, created_at);

-- Allow anonymous users to insert events for pre-auth tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'analytics_events'
    AND policyname = 'Anonymous users can insert conversion events'
  ) THEN
    CREATE POLICY "Anonymous users can insert conversion events"
      ON analytics_events
      FOR INSERT
      TO anon
      WITH CHECK (user_id IS NULL);
  END IF;
END $$;
