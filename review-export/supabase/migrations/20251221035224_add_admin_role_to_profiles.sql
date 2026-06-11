/*
  # Add Admin Role and User Management Features to Profiles

  1. Changes to profiles table
    - Add `is_admin` boolean column to identify admin users
    - Add `status` column to track user account status (active, suspended, deleted)
    - Add `subscription_tier` column to track user subscription level
    - Add `last_login_at` column to track user activity
    - Add indexes for better query performance

  2. Security
    - Update RLS policies to allow admins to view and manage all profiles
    - Maintain existing user privacy for non-admin users
    - Add policy for admins to update user status and subscription

  3. Notes
    - First user registered will need to be manually set as admin via SQL
    - Admins can view all user data but regular users can only view their own
*/

-- Add new columns to profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN status text DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier text DEFAULT 'free';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Drop existing policies to recreate them with admin access
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate RLS policies with admin access

-- SELECT policy: Users can view own profile OR admins can view all profiles
CREATE POLICY "Users can view own profile or admins view all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- UPDATE policy: Users can update own profile OR admins can update any profile
CREATE POLICY "Users can update own or admins update any"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    auth.uid() = id 
    OR 
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- INSERT policy: Users can create their own profile
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- DELETE policy: Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user stats for admin dashboard
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
  total_users bigint,
  active_users bigint,
  suspended_users bigint,
  free_tier bigint,
  basic_tier bigint,
  professional_tier bigint
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;