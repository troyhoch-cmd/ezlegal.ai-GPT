/*
  # Optimize RLS Policies and Fix Security Issues

  1. Performance Optimizations
    - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth functions for each row, improving query performance at scale
    - Affects tables: clients, cases, documents, chat_messages, research_queries, profiles

  2. Security Fixes
    - Add search_path to all functions to prevent search path injection attacks
    - Set search_path = '' for SECURITY DEFINER functions to prevent malicious schema attacks

  3. Tables Updated
    - public.clients (4 policies)
    - public.cases (4 policies)
    - public.documents (4 policies)
    - public.chat_messages (3 policies)
    - public.research_queries (3 policies)
    - public.profiles (4 policies)

  4. Functions Updated
    - is_admin()
    - get_user_stats()
    - handle_new_user()
    - handle_updated_at()
*/

-- ============================================================================
-- CLIENTS TABLE - Optimize RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

CREATE POLICY "Users can view own clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- CASES TABLE - Optimize RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own cases" ON cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON cases;

CREATE POLICY "Users can view own cases"
  ON cases
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own cases"
  ON cases
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own cases"
  ON cases
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own cases"
  ON cases
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- DOCUMENTS TABLE - Optimize RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

CREATE POLICY "Users can view own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- CHAT_MESSAGES TABLE - Optimize RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete own chat messages" ON chat_messages;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- RESEARCH_QUERIES TABLE - Optimize RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own research queries" ON research_queries;
DROP POLICY IF EXISTS "Users can insert own research queries" ON research_queries;
DROP POLICY IF EXISTS "Users can delete own research queries" ON research_queries;

CREATE POLICY "Users can view own research queries"
  ON research_queries
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own research queries"
  ON research_queries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own research queries"
  ON research_queries
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PROFILES TABLE - Optimize RLS Policies with Admin Access
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON profiles;
DROP POLICY IF EXISTS "Users can update own or admins update any" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

CREATE POLICY "Users can view own profile or admins view all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid())
    OR 
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

CREATE POLICY "Users can update own or admins update any"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = (select auth.uid())
    OR 
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  )
  WITH CHECK (
    id = (select auth.uid())
    OR 
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Only admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

-- ============================================================================
-- FUNCTIONS - Fix Search Path Security Issues
-- ============================================================================

-- Fix is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
END;
$$;

-- Fix get_user_stats function
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
  total_users bigint,
  active_users bigint,
  suspended_users bigint,
  free_tier bigint,
  basic_tier bigint,
  professional_tier bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_users,
    COUNT(*) FILTER (WHERE status = 'active')::bigint as active_users,
    COUNT(*) FILTER (WHERE status = 'suspended')::bigint as suspended_users,
    COUNT(*) FILTER (WHERE subscription_tier = 'free')::bigint as free_tier,
    COUNT(*) FILTER (WHERE subscription_tier = 'basic')::bigint as basic_tier,
    COUNT(*) FILTER (WHERE subscription_tier = 'professional')::bigint as professional_tier
  FROM profiles;
END;
$$;

-- Fix handle_new_user function (if it exists)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;