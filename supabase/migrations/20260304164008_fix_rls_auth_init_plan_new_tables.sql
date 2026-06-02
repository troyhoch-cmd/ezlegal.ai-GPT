/*
  # Fix RLS auth() initialization plan on audit_events, user_data_requests, tenant_policies

  Replaces auth.uid() with (select auth.uid()) in all policies on these three tables.
  This prevents per-row re-evaluation of auth functions, significantly improving
  query performance at scale per Supabase recommendations.

  Also replaces auth.uid() in the EXISTS subqueries used for admin checks.
*/

-- ── audit_events ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can insert own audit events" ON audit_events;
DROP POLICY IF EXISTS "Anon can insert session audit events" ON audit_events;
DROP POLICY IF EXISTS "Admins can read all audit events" ON audit_events;

CREATE POLICY "Users can insert own audit events"
  ON audit_events FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Anon can insert session audit events"
  ON audit_events FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Admins can read all audit events"
  ON audit_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true
    )
  );

-- ── user_data_requests ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can insert own data requests" ON user_data_requests;
DROP POLICY IF EXISTS "Users can read own data requests" ON user_data_requests;
DROP POLICY IF EXISTS "Admins can read all data requests" ON user_data_requests;
DROP POLICY IF EXISTS "Admins can update data requests" ON user_data_requests;

CREATE POLICY "Users can insert own data requests"
  ON user_data_requests FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can read own data requests"
  ON user_data_requests FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can read all data requests"
  ON user_data_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update data requests"
  ON user_data_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true
    )
  );

-- ── tenant_policies ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can read tenant policies" ON tenant_policies;
DROP POLICY IF EXISTS "Admins can insert tenant policies" ON tenant_policies;
DROP POLICY IF EXISTS "Admins can update tenant policies" ON tenant_policies;
DROP POLICY IF EXISTS "Admins can delete tenant policies" ON tenant_policies;

CREATE POLICY "Admins can read tenant policies"
  ON tenant_policies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert tenant policies"
  ON tenant_policies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update tenant policies"
  ON tenant_policies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete tenant policies"
  ON tenant_policies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true
    )
  );
