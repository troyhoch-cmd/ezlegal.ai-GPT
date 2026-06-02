/*
  # Add metadata column to email_captures

  1. Changes
    - Add `metadata` JSONB column to store additional capture context
    - This allows storing state selection, guide type, and other contextual data
    - Add `guide_sent_at` timestamp to track when guide was emailed

  2. Purpose
    - Support jurisdiction-aware exit intent modals
    - Track which type of guide was requested (state-specific vs general)
*/

ALTER TABLE email_captures 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE email_captures 
ADD COLUMN IF NOT EXISTS guide_sent_at TIMESTAMPTZ;
