/*
  # Allow anonymous handoff requests

  1. Changes
    - Add INSERT policy on `lawyer_connections` for anonymous (unauthenticated) users
    - This allows the handoff form to work for users who haven't signed up yet
    - Anonymous inserts are limited to new rows with null user_id

  2. Security
    - Anonymous users can only INSERT, not SELECT/UPDATE/DELETE
    - They cannot set user_id to any value other than null
    - Existing authenticated policies remain unchanged
*/

CREATE POLICY "Anonymous users can submit handoff requests"
  ON public.lawyer_connections
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
