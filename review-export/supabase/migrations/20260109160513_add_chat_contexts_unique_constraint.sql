/*
  # Add Unique Constraint to chat_contexts

  1. Changes
    - Add unique constraint on session_id column in chat_contexts table
    - This allows upsert operations to work correctly

  2. Security
    - No security changes
*/

ALTER TABLE chat_contexts
ADD CONSTRAINT chat_contexts_session_id_unique UNIQUE (session_id);
