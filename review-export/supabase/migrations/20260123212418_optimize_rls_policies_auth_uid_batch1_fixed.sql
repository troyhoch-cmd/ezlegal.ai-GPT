/*
  # Optimize RLS Policies - Batch 1 (Core Tables) - Fixed

  This migration optimizes RLS policies by replacing `auth.uid()` and `auth.jwt()`
  with `(select auth.uid())` and `(select auth.jwt())` to prevent re-evaluation 
  for each row, improving query performance at scale.

  ## Tables Updated:
  1. profiles - Users can view/update own profile
  2. documents - Admin compliance policy
  3. chat_messages - Admin compliance policy
  4. email_captures - Authenticated users view own (uses auth.jwt())
  5. role_access_matrix - Admin modify policy
  6. access_audit_log - All policies
*/

-- profiles: Users can view own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

-- profiles: Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- documents: Admins can view all documents for compliance
DROP POLICY IF EXISTS "Admins can view all documents for compliance" ON public.documents;
CREATE POLICY "Admins can view all documents for compliance" ON public.documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- chat_messages: Admins can view all messages for compliance
DROP POLICY IF EXISTS "Admins can view all messages for compliance" ON public.chat_messages;
CREATE POLICY "Admins can view all messages for compliance" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- email_captures: Authenticated users can view own captures (uses email from JWT)
DROP POLICY IF EXISTS "Authenticated users can view own captures" ON public.email_captures;
CREATE POLICY "Authenticated users can view own captures" ON public.email_captures
  FOR SELECT TO authenticated
  USING (email = (select auth.jwt() ->> 'email'));

-- role_access_matrix: Admins can modify access matrix
DROP POLICY IF EXISTS "Admins can modify access matrix" ON public.role_access_matrix;
CREATE POLICY "Admins can modify access matrix" ON public.role_access_matrix
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- access_audit_log: Admins can view all audit logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.access_audit_log;
CREATE POLICY "Admins can view all audit logs" ON public.access_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- access_audit_log: System can insert audit logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.access_audit_log;
CREATE POLICY "System can insert audit logs" ON public.access_audit_log
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- access_audit_log: Users can view own audit log
DROP POLICY IF EXISTS "Users can view own audit log" ON public.access_audit_log;
CREATE POLICY "Users can view own audit log" ON public.access_audit_log
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
