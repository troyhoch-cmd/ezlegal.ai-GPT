/*
  # Add Favorites Feature to Chat Messages

  1. Changes
    - Add `is_favorite` boolean column to `chat_messages` table
    - Set default value to false
    - Add index for faster favorite queries

  2. Purpose
    - Enable users to mark important conversations as favorites
    - Support the new History page with favorite filtering
*/

-- Add is_favorite column to chat_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'is_favorite'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN is_favorite boolean DEFAULT false;
  END IF;
END $$;

-- Add index for faster favorite queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_favorite 
ON chat_messages(user_id, is_favorite, created_at DESC) 
WHERE is_favorite = true;
