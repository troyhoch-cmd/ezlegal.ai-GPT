/*
  # Fix Profile Update Policy Recursion

  1. Problem
    - Current UPDATE policy on profiles table causes infinite recursion
    - Policy checks profiles table to verify admin status, triggering another policy check

  2. Solution
    - Create a SECURITY DEFINER function to check admin status without triggering RLS
    - Replace the UPDATE policy with a simpler one using the new function

  3. Security
    - Function runs with elevated privileges but only returns boolean
    - Users can still only update their own profile OR admins can update any
*/

-- Create a security definer function to check admin status without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin_no_rls()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Drop the existing problematic UPDATE policy
DROP POLICY IF EXISTS "Users can update own or admins update any" ON profiles;

-- Create a new UPDATE policy that won't cause recursion
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create a separate policy for admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_no_rls() = true)
  WITH CHECK (public.is_admin_no_rls() = true);
