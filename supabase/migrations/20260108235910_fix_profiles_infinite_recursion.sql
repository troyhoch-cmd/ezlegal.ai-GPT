/*
  # Fix Profiles Table Infinite Recursion

  1. Problem
    - RLS policies on profiles table query profiles table to check is_admin
    - This causes infinite recursion when any query hits the profiles table

  2. Solution
    - Create a SECURITY DEFINER function to check admin status (bypasses RLS)
    - Update all policies to use this function instead of subqueries

  3. Changes
    - Create is_admin() function with SECURITY DEFINER
    - Drop existing problematic policies
    - Recreate policies using the new function
*/

CREATE OR REPLACE FUNCTION public.is_admin()
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

DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON profiles;
DROP POLICY IF EXISTS "Users can update own or admins update any" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

CREATE POLICY "Users can view own profile or admins view all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin() = true);

CREATE POLICY "Users can update own or admins update any"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin() = true)
  WITH CHECK (id = auth.uid() OR public.is_admin() = true);

CREATE POLICY "Only admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);
