/*
  # Add campaign_params column to link_health_events

  1. Modified Tables
    - `link_health_events`
      - Added `campaign_params` (text, nullable) - stores allowlisted UTM/campaign
        query parameters extracted before stripping PII-bearing query strings

  2. Notes
    - Preserves marketing attribution (utm_source, utm_medium, utm_campaign, etc.)
      while continuing to strip arbitrary query params for privacy
    - Column is nullable since most events won't carry campaign parameters
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'link_health_events' AND column_name = 'campaign_params'
  ) THEN
    ALTER TABLE link_health_events ADD COLUMN campaign_params text;
  END IF;
END $$;
