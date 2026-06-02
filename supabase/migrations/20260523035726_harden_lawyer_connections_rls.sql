/*
  # Harden lawyer_connections RLS policies

  1. Security Changes
    - Revoke SELECT, UPDATE, DELETE from anon role on lawyer_connections
    - Grant INSERT only to anon and authenticated
    - Add policy: anon can only insert rows with NULL user_id
    - Add policy: authenticated can only insert rows with their own user_id

  2. Purpose
    - Ensures anonymous handoff requests cannot read or modify existing records
    - Ensures authenticated users can only submit their own handoff requests
    - Prevents data leakage of attorney connection records
*/

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.lawyer_connections ENABLE ROW LEVEL SECURITY;

-- Revoke broad permissions from anon
DO $$
BEGIN
  REVOKE SELECT, UPDATE, DELETE ON TABLE public.lawyer_connections FROM anon;
  GRANT INSERT ON TABLE public.lawyer_connections TO anon;
  GRANT INSERT ON TABLE public.lawyer_connections TO authenticated;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Permission adjustment skipped: %', SQLERRM;
END $$;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "anon_insert_lawyer_connections_null_user" ON public.lawyer_connections;

CREATE POLICY "anon_insert_lawyer_connections_null_user"
  ON public.lawyer_connections
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "auth_insert_lawyer_connections_self" ON public.lawyer_connections;

CREATE POLICY "auth_insert_lawyer_connections_self"
  ON public.lawyer_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
