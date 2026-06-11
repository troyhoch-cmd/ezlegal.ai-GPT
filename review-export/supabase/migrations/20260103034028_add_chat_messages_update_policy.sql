/*
  # Add UPDATE policy for chat_messages table

  1. Changes
    - Add UPDATE policy to allow users to update their own chat messages
    - This enables users to mark messages as favorites or modify message content
  
  2. Security
    - Users can only update their own messages
    - Policy checks auth.uid() = user_id
*/

CREATE POLICY "Users can update own chat messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
