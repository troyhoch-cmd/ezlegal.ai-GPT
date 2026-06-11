/*
  # Fix Profile SELECT Policy Recursion

  1. Problem
    - Current SELECT policy on profiles table causes infinite recursion
    - Policy checks `EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)`
    - This triggers another SELECT policy check, causing recursion

  2. Solution
    - Replace the recursive SELECT policy with one that uses the existing
      `is_admin_no_rls()` SECURITY DEFINER function
    - This function bypasses RLS to check admin status without recursion

  3. Security
    - Users can still only see their own profile
    - Admins can view all profiles using the non-recursive admin check
*/

-- Drop the existing problematic SELECT policy
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON profiles;

-- Create a new SELECT policy that won't cause recursion
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins can view all profiles (using the non-recursive function)
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin_no_rls() = true);
