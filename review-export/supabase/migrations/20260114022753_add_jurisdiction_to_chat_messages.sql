/*
  # Add Jurisdiction Column to Chat Messages

  1. Changes
    - Add `jurisdiction` column to `chat_messages` table
    - Column stores the jurisdiction code (e.g., 'AZ', 'CA', 'FED')
    - Nullable to support existing messages without jurisdiction
    - Add index for efficient filtering by jurisdiction

  2. Purpose
    - Allow users to filter their chat history by jurisdiction
    - Track which jurisdiction context was used for each conversation
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'jurisdiction'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN jurisdiction text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chat_messages_jurisdiction ON chat_messages(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_jurisdiction ON chat_messages(user_id, jurisdiction);