/*
  # Create chat_attachments table for document uploads

  1. New Tables
    - `chat_attachments`
      - `id` (uuid, primary key)
      - `chat_message_id` (uuid, foreign key to chat_messages)
      - `user_id` (uuid, foreign key to auth.users)
      - `file_name` (text) - Original filename
      - `file_size` (bigint) - File size in bytes
      - `file_type` (text) - MIME type
      - `storage_path` (text) - Path in storage bucket
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on chat_attachments table
    - Users can only insert their own attachments
    - Users can only view their own attachments
    - Users can only delete their own attachments
    - Users can only update their own attachments

  3. Indexes
    - Index on chat_message_id for faster lookups
    - Index on user_id for faster user-specific queries
*/

CREATE TABLE IF NOT EXISTS chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own chat attachments"
  ON chat_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own chat attachments"
  ON chat_attachments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat attachments"
  ON chat_attachments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own chat attachments"
  ON chat_attachments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_attachments_message_id ON chat_attachments(chat_message_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_user_id ON chat_attachments(user_id);
