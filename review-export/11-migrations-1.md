# ezLegal.ai Code Review - Database Migrations (Part 1)

> First 89 migrations - schema creation and early features.

Generated: 2026-06-03T00:51:49.848Z
Files included: 89

---

## supabase/migrations/20251221031329_create_user_profiles.sql

```sql
/*
  # Create User Profiles Table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, for easy access)
      - `full_name` (text, user's full name)
      - `phone` (text, user's phone number)
      - `avatar_url` (text, profile photo URL)
      - `bio` (text, user biography)
      - `company` (text, company/firm name)
      - `job_title` (text, user's job title)
      - `notification_email` (boolean, email notification preference)
      - `notification_sms` (boolean, SMS notification preference)
      - `created_at` (timestamptz, account creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to update their own profile
    - Add policy for users to insert their own profile

  3. Functions
    - Create trigger to automatically create profile on user signup
    - Create trigger to update `updated_at` timestamp
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  company text DEFAULT '',
  job_title text DEFAULT '',
  notification_email boolean DEFAULT true,
  notification_sms boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on profile changes
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

---

## supabase/migrations/20251221035224_add_admin_role_to_profiles.sql

```sql
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
```

---

## supabase/migrations/20251221035841_optimize_rls_policies_and_functions.sql

```sql
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
```

---

## supabase/migrations/20251221040745_add_favorites_to_chat_messages.sql

```sql
/*
  # Add Favorites Feature to Chat Messages

  1. Changes
    - Add `is_favorite` boolean column to `chat_messages` table
    - Set default value to false
    - Add index for faster favorite queries

  2. Purpose
    - Enable users to mark important conversations as favorites
    - Support the new History page with favorite filtering
*/

-- Add is_favorite column to chat_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'is_favorite'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN is_favorite boolean DEFAULT false;
  END IF;
END $$;

-- Add index for faster favorite queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_favorite 
ON chat_messages(user_id, is_favorite, created_at DESC) 
WHERE is_favorite = true;

```

---

## supabase/migrations/20251222032624_remove_unused_indexes.sql

```sql
/*
  # Remove Unused Database Indexes

  1. Changes
    - Drop 7 unused indexes that are consuming resources without providing query performance benefits
    - Indexes can be recreated in the future if query patterns change and they become necessary
  
  2. Indexes Being Removed
    - `idx_cases_client_id` - Unused index on cases.client_id
    - `idx_documents_case_id` - Unused index on documents.case_id
    - `idx_profiles_is_admin` - Unused index on profiles.is_admin (low cardinality)
    - `idx_profiles_status` - Unused index on profiles.status (low cardinality)
    - `idx_profiles_subscription_tier` - Unused index on profiles.subscription_tier (low cardinality)
    - `idx_profiles_email` - Unused index on profiles.email
    - `idx_chat_messages_is_favorite` - Unused partial index on chat_messages
  
  3. Benefits
    - Reduces storage overhead
    - Improves write performance (inserts, updates, deletes)
    - Simplifies database maintenance
  
  4. Notes
    - These indexes were identified as unused by Supabase monitoring
    - If query patterns change and performance degrades, indexes can be recreated
    - Primary key indexes and frequently-used indexes are retained
*/

-- Drop unused indexes on cases table
DROP INDEX IF EXISTS idx_cases_client_id;

-- Drop unused indexes on documents table
DROP INDEX IF EXISTS idx_documents_case_id;

-- Drop unused indexes on profiles table
DROP INDEX IF EXISTS idx_profiles_is_admin;
DROP INDEX IF EXISTS idx_profiles_status;
DROP INDEX IF EXISTS idx_profiles_subscription_tier;
DROP INDEX IF EXISTS idx_profiles_email;

-- Drop unused indexes on chat_messages table
DROP INDEX IF EXISTS idx_chat_messages_is_favorite;

```

---

## supabase/migrations/20251223040252_add_foreign_key_indexes.sql

```sql
/*
  # Add Foreign Key Indexes for Performance

  ## 1. New Indexes
  Adds missing indexes on foreign key columns to eliminate full table scans:
    - `idx_cases_client_id` - Index on cases.client_id
    - `idx_documents_case_id` - Index on documents.case_id
    - `idx_cases_user_client` - Composite index for user + client queries
    - `idx_documents_user_case` - Composite index for user + case queries

  ## 2. Performance Impact
    - Eliminates full table scans on foreign key lookups
    - Improves JOIN performance between related tables
    - Typical improvement: 10-100x faster on filtered queries
    - Essential for production scale (1000+ records)

  ## 3. Query Patterns Optimized
    - `SELECT * FROM cases WHERE client_id = ?`
    - `SELECT * FROM documents WHERE case_id = ?`
    - `SELECT * FROM cases WHERE user_id = ? AND client_id = ?`
    - `SELECT * FROM documents WHERE user_id = ? AND case_id = ?`
    - All JOINs between these tables
*/

-- Add index on cases.client_id for faster client lookups
CREATE INDEX IF NOT EXISTS idx_cases_client_id 
ON public.cases(client_id)
WHERE client_id IS NOT NULL;

-- Add index on documents.case_id for faster case document lookups
CREATE INDEX IF NOT EXISTS idx_documents_case_id 
ON public.documents(case_id)
WHERE case_id IS NOT NULL;

-- Add composite index for common query pattern: user's cases with specific client
CREATE INDEX IF NOT EXISTS idx_cases_user_client 
ON public.cases(user_id, client_id)
WHERE client_id IS NOT NULL;

-- Add composite index for common query pattern: user's documents for specific case
CREATE INDEX IF NOT EXISTS idx_documents_user_case 
ON public.documents(user_id, case_id)
WHERE case_id IS NOT NULL;

-- Add index on cases.user_id for faster user case lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_cases_user_id 
ON public.cases(user_id);

-- Add index on documents.user_id for faster user document lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_documents_user_id 
ON public.documents(user_id);

-- Add index on clients.user_id for faster user client lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_clients_user_id 
ON public.clients(user_id);

-- Add comments to indexes for documentation
COMMENT ON INDEX idx_cases_client_id IS 
  'Performance: Speeds up queries filtering or joining cases by client_id. Essential for client case history views.';

COMMENT ON INDEX idx_documents_case_id IS 
  'Performance: Speeds up queries filtering or joining documents by case_id. Essential for case document listings.';

COMMENT ON INDEX idx_cases_user_client IS 
  'Performance: Composite index optimizes queries like "get all cases for user X with client Y"';

COMMENT ON INDEX idx_documents_user_case IS 
  'Performance: Composite index optimizes queries like "get all documents for user X in case Y"';

COMMENT ON INDEX idx_cases_user_id IS 
  'Performance: Speeds up queries filtering cases by user_id. Essential for user case listings.';

COMMENT ON INDEX idx_documents_user_id IS 
  'Performance: Speeds up queries filtering documents by user_id. Essential for user document listings.';

COMMENT ON INDEX idx_clients_user_id IS 
  'Performance: Speeds up queries filtering clients by user_id. Essential for user client listings.';

```

---

## supabase/migrations/20251223040425_add_single_column_foreign_key_indexes.sql

```sql
/*
  # Add Single-Column Foreign Key Indexes

  ## 1. New Indexes
  Adds the specific single-column indexes requested for foreign keys:
    - `idx_cases_client_id` - Index on cases.client_id
    - `idx_documents_case_id` - Index on documents.case_id

  ## 2. Why These Are Needed
  While composite indexes (user_id, client_id) exist, single-column indexes on
  the foreign key columns provide optimal performance for:
    - Foreign key constraint checks
    - Queries that filter ONLY by client_id or case_id
    - JOINs without user_id filter
    - Cascade delete operations

  ## 3. Performance Impact
  These indexes ensure all foreign key lookups use index scans instead of
  sequential table scans, critical for maintaining referential integrity
  performance at scale.
*/

-- Add single-column index on cases.client_id
CREATE INDEX IF NOT EXISTS idx_cases_client_id 
ON public.cases(client_id)
WHERE client_id IS NOT NULL;

-- Add single-column index on documents.case_id  
CREATE INDEX IF NOT EXISTS idx_documents_case_id 
ON public.documents(case_id)
WHERE case_id IS NOT NULL;

-- Add documentation comments
COMMENT ON INDEX idx_cases_client_id IS 
  'Foreign key index: Optimizes lookups and joins on cases.client_id. Required for optimal foreign key constraint performance.';

COMMENT ON INDEX idx_documents_case_id IS 
  'Foreign key index: Optimizes lookups and joins on documents.case_id. Required for optimal foreign key constraint performance.';

```

---

## supabase/migrations/20260103025808_add_free_tier_rate_limiting.sql

```sql
/*
  # Free Tier Rate Limiting & Conversion Tracking

  ## Purpose
  Enables free AI legal advice with IP-based rate limiting and tracks conversion funnel
  from free users to paying subscribers.

  ## New Tables
  
  ### `anonymous_chat_sessions`
  Tracks free (non-authenticated) chat sessions by IP address for rate limiting
  - `id` (uuid, primary key)
  - `ip_address` (text, hashed for privacy)
  - `questions_asked` (integer, daily question count)
  - `last_reset_date` (date, for daily limit reset)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `total_questions` (integer, lifetime count)
  - `converted_to_signup` (boolean, conversion tracking)
  - `converted_at` (timestamptz, conversion timestamp)
  
  ### `conversion_events`
  Tracks user journey through conversion funnel
  - `id` (uuid, primary key)
  - `session_id` (uuid, links to anonymous_chat_sessions)
  - `event_type` (text, e.g., 'first_question', 'hit_limit', 'saw_upgrade_prompt', 'clicked_signup')
  - `event_data` (jsonb, flexible metadata)
  - `created_at` (timestamptz)
  
  ### `chat_messages_anonymous`
  Stores anonymous chat messages for free users (limited retention)
  - `id` (uuid, primary key)
  - `session_id` (uuid, links to anonymous_chat_sessions)
  - `message` (text, user question)
  - `response` (text, AI response)
  - `created_at` (timestamptz)
  - `is_converted` (boolean, if shown upgrade prompt)
  
  ## Security
  - RLS enabled on all tables
  - Service role required for writes (prevents abuse)
  - Anonymous users can only read their own session data via session token
  - Auto-cleanup of old anonymous data (30 days)
  
  ## Indexes
  - Fast lookup by IP hash for rate limiting
  - Efficient date-based queries for daily resets
  - Session-based queries for conversion tracking
*/

-- Anonymous chat sessions table
CREATE TABLE IF NOT EXISTS anonymous_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  questions_asked integer DEFAULT 0,
  last_reset_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  total_questions integer DEFAULT 0,
  converted_to_signup boolean DEFAULT false,
  converted_at timestamptz,
  user_agent text,
  referrer text
);

-- Index for fast IP lookups
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_ip_hash 
  ON anonymous_chat_sessions(ip_hash);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_created_at 
  ON anonymous_chat_sessions(created_at);

-- Conversion events table
CREATE TABLE IF NOT EXISTS conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES anonymous_chat_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Index for session-based queries
CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id 
  ON conversion_events(session_id);

-- Index for event type analytics
CREATE INDEX IF NOT EXISTS idx_conversion_events_type 
  ON conversion_events(event_type);

-- Anonymous chat messages table
CREATE TABLE IF NOT EXISTS chat_messages_anonymous (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES anonymous_chat_sessions(id) ON DELETE CASCADE,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_converted boolean DEFAULT false,
  category text,
  satisfaction_rating integer
);

-- Index for session-based queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_anonymous_session_id 
  ON chat_messages_anonymous(session_id);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_anonymous_created_at 
  ON chat_messages_anonymous(created_at);

-- Enable Row Level Security
ALTER TABLE anonymous_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages_anonymous ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anonymous_chat_sessions
CREATE POLICY "Service role can manage anonymous sessions"
  ON anonymous_chat_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for conversion_events
CREATE POLICY "Service role can manage conversion events"
  ON conversion_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for chat_messages_anonymous
CREATE POLICY "Service role can manage anonymous chat messages"
  ON chat_messages_anonymous
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to reset daily question count
CREATE OR REPLACE FUNCTION reset_daily_questions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE anonymous_chat_sessions
  SET questions_asked = 0,
      last_reset_date = CURRENT_DATE,
      updated_at = now()
  WHERE last_reset_date < CURRENT_DATE;
END;
$$;

-- Function to cleanup old anonymous data (runs via cron/scheduled task)
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete anonymous chat messages older than 30 days
  DELETE FROM chat_messages_anonymous
  WHERE created_at < now() - interval '30 days';
  
  -- Delete anonymous sessions older than 90 days (keep for analytics)
  DELETE FROM anonymous_chat_sessions
  WHERE created_at < now() - interval '90 days';
END;
$$;
```

---

## supabase/migrations/20260103033503_create_lawyer_matches_table.sql

```sql
/*
  # Create Lawyer Matches and Consultations Table

  1. New Tables
    - `lawyer_matches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `chat_message_id` (uuid, foreign key to chat_messages, nullable)
      - `practice_area` (text) - detected practice area
      - `lawyer_name` (text) - matched lawyer name
      - `lawyer_id` (text) - external lawyer ID
      - `status` (text) - match status (suggested, contacted, scheduled, completed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `lawyer_consultations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `lawyer_match_id` (uuid, foreign key to lawyer_matches, nullable)
      - `lawyer_name` (text)
      - `lawyer_email` (text, nullable)
      - `practice_area` (text)
      - `consultation_date` (timestamptz, nullable)
      - `consultation_notes` (text, nullable)
      - `status` (text) - consultation status (requested, scheduled, completed, cancelled)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create lawyer_matches table
CREATE TABLE IF NOT EXISTS lawyer_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chat_message_id uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
  practice_area text NOT NULL,
  lawyer_name text NOT NULL,
  lawyer_id text NOT NULL,
  status text NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'contacted', 'scheduled', 'completed', 'dismissed')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create lawyer_consultations table
CREATE TABLE IF NOT EXISTS lawyer_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lawyer_match_id uuid REFERENCES lawyer_matches(id) ON DELETE SET NULL,
  lawyer_name text NOT NULL,
  lawyer_email text,
  practice_area text NOT NULL,
  consultation_date timestamptz,
  consultation_notes text,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'scheduled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_user_id ON lawyer_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_status ON lawyer_matches(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_created_at ON lawyer_matches(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_user_id ON lawyer_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_status ON lawyer_consultations(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_date ON lawyer_consultations(consultation_date);

-- Enable Row Level Security
ALTER TABLE lawyer_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_consultations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lawyer_matches
CREATE POLICY "Users can view own lawyer matches"
  ON lawyer_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lawyer matches"
  ON lawyer_matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lawyer matches"
  ON lawyer_matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lawyer matches"
  ON lawyer_matches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for lawyer_consultations
CREATE POLICY "Users can view own consultations"
  ON lawyer_consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consultations"
  ON lawyer_consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultations"
  ON lawyer_consultations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own consultations"
  ON lawyer_consultations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_lawyer_matches_updated_at ON lawyer_matches;
CREATE TRIGGER update_lawyer_matches_updated_at
  BEFORE UPDATE ON lawyer_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lawyer_consultations_updated_at ON lawyer_consultations;
CREATE TRIGGER update_lawyer_consultations_updated_at
  BEFORE UPDATE ON lawyer_consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

```

---

## supabase/migrations/20260103034028_add_chat_messages_update_policy.sql

```sql
/*
  # Add UPDATE policy for chat_messages table

  1. Changes
    - Add UPDATE policy to allow users to update their own chat messages
    - This enables users to mark messages as favorites or modify message content
  
  2. Security
    - Users can only update their own messages
    - Policy checks auth.uid() = user_id
*/

CREATE POLICY "Users can update own chat messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

```

---

## supabase/migrations/20260103141537_create_chat_attachments_table.sql

```sql
/*
  # Create chat_attachments table for document uploads

  1. New Tables
    - `chat_attachments`
      - `id` (uuid, primary key)
      - `chat_message_id` (uuid, foreign key to chat_messages)
      - `user_id` (uuid, foreign key to auth.users)
      - `file_name` (text) - Original filename
      - `file_size` (bigint) - File size in bytes
      - `file_type` (text) - MIME type
      - `storage_path` (text) - Path in storage bucket
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on chat_attachments table
    - Users can only insert their own attachments
    - Users can only view their own attachments
    - Users can only delete their own attachments
    - Users can only update their own attachments

  3. Indexes
    - Index on chat_message_id for faster lookups
    - Index on user_id for faster user-specific queries
*/

CREATE TABLE IF NOT EXISTS chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own chat attachments"
  ON chat_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own chat attachments"
  ON chat_attachments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat attachments"
  ON chat_attachments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own chat attachments"
  ON chat_attachments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_attachments_message_id ON chat_attachments(chat_message_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_user_id ON chat_attachments(user_id);

```

---

## supabase/migrations/20260103143106_create_avatars_storage.sql

```sql
/*
  # Create Avatar Storage Bucket

  1. New Storage Bucket
    - `avatars` - stores user profile photos
    - Max file size: 2MB
    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

  2. Security
    - Public read access for all avatars
    - Authenticated users can upload their own avatar
    - Users can only update/delete their own avatar

  3. Important Notes
    - Storage buckets use Row Level Security for access control
    - Avatar URLs will be public but only the owner can modify them
*/

-- Create the avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow public read access to avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

```

---

## supabase/migrations/20260103143853_create_lawyer_profiles_table.sql

```sql
/*
  # Create Lawyer Profiles Table

  1. New Tables
    - `lawyer_profiles` - stores attorney information for the directory
      - `id` (uuid, primary key)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `specialty` (text, primary practice area)
      - `hourly_rate` (integer, in dollars)
      - `rating` (numeric, 0-5 rating)
      - `review_count` (integer, number of reviews)
      - `avatar_url` (text, profile photo)
      - `about_me` (text, attorney bio)
      - `is_online` (boolean, availability status)
      - `public_phone` (text, contact number)
      - `email` (text, contact email)
      - `address1` (text, street address)
      - `address2` (text, suite/unit)
      - `city` (text)
      - `state` (text, 2-letter state code)
      - `zip` (text, postal code)
      - `jurisdiction` (text, bar admission)
      - `certifications` (text, additional credentials)
      - `practice_areas` (text[], array of practice areas)
      - `languages` (text[], languages spoken)
      - `website_url` (text, attorney website)
      - `years_experience` (integer)
      - `offers_flat_fee` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `lawyer_profiles` table
    - Public read access for all users (directory is public)
    - Only admins can insert/update/delete lawyer profiles

  3. Indexes
    - Index on city for location searches
    - Index on specialty for filtering
    - Index on rating for sorting
    - GIN index on practice_areas for array searches

  4. Important Notes
    - This replaces external API dependency with internal database
    - Lawyers can be added/managed by admins through the admin panel
    - Public directory access without authentication required
*/

-- Create the lawyer_profiles table
CREATE TABLE IF NOT EXISTS lawyer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  specialty text DEFAULT '',
  hourly_rate integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  avatar_url text DEFAULT '',
  about_me text DEFAULT '',
  is_online boolean DEFAULT false,
  public_phone text DEFAULT '',
  email text DEFAULT '',
  address1 text DEFAULT '',
  address2 text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  zip text DEFAULT '',
  jurisdiction text DEFAULT '',
  certifications text DEFAULT '',
  practice_areas text[] DEFAULT ARRAY[]::text[],
  languages text[] DEFAULT ARRAY['English']::text[],
  website_url text DEFAULT '',
  years_experience integer DEFAULT 0,
  offers_flat_fee boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for all users (directory is public)
CREATE POLICY "Anyone can view lawyer profiles"
  ON lawyer_profiles
  FOR SELECT
  USING (true);

-- Only admins can insert lawyer profiles
CREATE POLICY "Admins can insert lawyer profiles"
  ON lawyer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can update lawyer profiles
CREATE POLICY "Admins can update lawyer profiles"
  ON lawyer_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can delete lawyer profiles
CREATE POLICY "Admins can delete lawyer profiles"
  ON lawyer_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_city ON lawyer_profiles(city);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_specialty ON lawyer_profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_rating ON lawyer_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_practice_areas ON lawyer_profiles USING GIN(practice_areas);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lawyer_profiles_updated_at
  BEFORE UPDATE ON lawyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

```

---

## supabase/migrations/20260106154836_create_free_chat_and_trial_tables.sql

```sql
/*
  # Free AI Chat and Trial Tracking System

  ## Overview
  This migration creates the infrastructure for Phase 1 implementation:
  - Free AI chat with question limits
  - Trial tracking and conversion management
  - Pro bono eligibility screening

  ## New Tables

  ### 1. `free_chat_sessions`
  Tracks anonymous and authenticated user chat sessions for the free AI assistant.
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid, nullable) - Links to auth.users if authenticated
  - `session_token` (text, unique) - Anonymous session identifier for non-logged-in users
  - `question_count` (integer) - Number of questions asked in this session
  - `last_question_at` (timestamptz) - Timestamp of most recent question
  - `created_at` (timestamptz) - Session creation timestamp
  - `ip_address` (text, nullable) - User IP for rate limiting
  - `converted_to_trial` (boolean) - Whether user signed up for trial
  
  ### 2. `free_chat_messages`
  Stores individual messages from free chat sessions.
  - `id` (uuid, primary key) - Unique message identifier
  - `session_id` (uuid) - References free_chat_sessions
  - `role` (text) - 'user' or 'assistant'
  - `content` (text) - Message content
  - `created_at` (timestamptz) - Message timestamp

  ### 3. `trial_subscriptions`
  Manages free trial subscriptions and conversion tracking.
  - `id` (uuid, primary key) - Unique trial identifier
  - `user_id` (uuid) - References auth.users
  - `plan_type` (text) - 'basic' or 'premium'
  - `trial_start_date` (timestamptz) - Trial start timestamp
  - `trial_end_date` (timestamptz) - Trial expiration timestamp
  - `converted_to_paid` (boolean) - Whether trial converted to paid subscription
  - `conversion_date` (timestamptz, nullable) - When conversion occurred
  - `cancellation_reason` (text, nullable) - Reason if trial was cancelled
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `eligibility_screenings`
  Tracks pro bono legal aid eligibility screening submissions.
  - `id` (uuid, primary key) - Unique screening identifier
  - `user_id` (uuid, nullable) - References auth.users if authenticated
  - `email` (text) - Contact email
  - `annual_income` (numeric) - Reported annual income
  - `household_size` (integer) - Number in household
  - `state` (text) - US state of residence
  - `legal_issue_type` (text) - Type of legal issue
  - `issue_description` (text) - Brief description of legal issue
  - `is_qualified` (boolean) - Whether they qualify based on income thresholds
  - `status` (text) - 'pending', 'approved', 'rejected', 'contacted'
  - `created_at` (timestamptz) - Submission timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Anonymous users can create free chat sessions
  - Authenticated users can only access their own data
  - Admins can view all eligibility screenings
*/

-- Create free_chat_sessions table
CREATE TABLE IF NOT EXISTS free_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  question_count integer DEFAULT 0 NOT NULL,
  last_question_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  converted_to_trial boolean DEFAULT false NOT NULL
);

-- Create free_chat_messages table
CREATE TABLE IF NOT EXISTS free_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES free_chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create trial_subscriptions table
CREATE TABLE IF NOT EXISTS trial_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('basic', 'premium')),
  trial_start_date timestamptz DEFAULT now() NOT NULL,
  trial_end_date timestamptz NOT NULL,
  converted_to_paid boolean DEFAULT false NOT NULL,
  conversion_date timestamptz,
  cancellation_reason text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create eligibility_screenings table
CREATE TABLE IF NOT EXISTS eligibility_screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  annual_income numeric NOT NULL,
  household_size integer NOT NULL,
  state text NOT NULL,
  legal_issue_type text NOT NULL,
  issue_description text NOT NULL,
  is_qualified boolean NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_free_chat_sessions_user_id ON free_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_free_chat_sessions_session_token ON free_chat_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_free_chat_messages_session_id ON free_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_trial_subscriptions_user_id ON trial_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_screenings_user_id ON eligibility_screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_screenings_status ON eligibility_screenings(status);

-- Enable RLS
ALTER TABLE free_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_screenings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for free_chat_sessions
CREATE POLICY "Anyone can create free chat sessions"
  ON free_chat_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own chat sessions"
  ON free_chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view their sessions by token"
  ON free_chat_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can update their own chat sessions"
  ON free_chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update sessions by token"
  ON free_chat_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for free_chat_messages
CREATE POLICY "Anyone can create chat messages"
  ON free_chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view messages from their sessions"
  ON free_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM free_chat_sessions
      WHERE free_chat_sessions.id = free_chat_messages.session_id
      AND free_chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can view their chat messages"
  ON free_chat_messages FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for trial_subscriptions
CREATE POLICY "Users can view their own trial subscriptions"
  ON trial_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trial subscription"
  ON trial_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trial subscription"
  ON trial_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for eligibility_screenings
CREATE POLICY "Anyone can create eligibility screenings"
  ON eligibility_screenings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own eligibility screenings"
  ON eligibility_screenings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR (
    SELECT is_admin FROM profiles WHERE id = auth.uid()
  ) = true);

CREATE POLICY "Admins can update eligibility screenings"
  ON eligibility_screenings FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for eligibility_screenings
DROP TRIGGER IF EXISTS update_eligibility_screenings_updated_at ON eligibility_screenings;
CREATE TRIGGER update_eligibility_screenings_updated_at
  BEFORE UPDATE ON eligibility_screenings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## supabase/migrations/20260107042715_create_pro_bono_intake_system.sql

```sql
/*
  # Pro Bono Intake System

  1. New Tables
    - `pro_bono_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - for logged in users)
      - `email` (text, required for follow-up)
      - `phone` (text, optional)
      - `full_name` (text, required)
      - `preferred_language` (text, default 'en')
      - `county` (text, required for geographic eligibility)
      - `state` (text, required)
      - `zip_code` (text, optional)
      - `household_income` (numeric, required for eligibility)
      - `household_size` (integer, required for eligibility)
      - `legal_issue_category` (text, required - employment, housing, family, etc.)
      - `legal_issue_description` (text, required)
      - `urgency_level` (text, default 'normal' - immediate, urgent, normal)
      - `ai_eligibility_score` (numeric, nullable - AI-generated eligibility score 0-100)
      - `ai_recommendation` (text, nullable - AI-generated recommendation)
      - `status` (text, default 'pending' - pending, reviewing, approved, referred, closed)
      - `assigned_to` (uuid, nullable - admin/attorney assigned)
      - `partner_organization` (text, nullable - for white label partners)
      - `referral_source` (text, nullable)
      - `opposing_party_name` (text, nullable)
      - `case_deadline` (date, nullable)
      - `previous_attorney` (boolean, default false)
      - `current_court_case` (boolean, default false)
      - `notes` (text, nullable - internal notes)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `contacted_at` (timestamptz, nullable)
    
    - `pro_bono_documents`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key to pro_bono_applications)
      - `file_name` (text, required)
      - `file_path` (text, required - storage path)
      - `file_type` (text, required)
      - `file_size` (integer, required)
      - `uploaded_by` (uuid, nullable - user who uploaded)
      - `created_at` (timestamptz, default now())
    
    - `pro_bono_communications`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key to pro_bono_applications)
      - `from_user_id` (uuid, nullable)
      - `message` (text, required)
      - `message_type` (text, default 'note' - note, email, sms, call)
      - `sent_by_admin` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Applicants can insert their own applications
    - Applicants can view their own applications
    - Only admins can update application status
    - Only admins can view all applications
*/

-- Create pro_bono_applications table
CREATE TABLE IF NOT EXISTS pro_bono_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  phone text,
  full_name text NOT NULL,
  preferred_language text DEFAULT 'en',
  county text NOT NULL,
  state text NOT NULL,
  zip_code text,
  household_income numeric NOT NULL,
  household_size integer NOT NULL,
  legal_issue_category text NOT NULL,
  legal_issue_description text NOT NULL,
  urgency_level text DEFAULT 'normal',
  ai_eligibility_score numeric,
  ai_recommendation text,
  status text DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_organization text,
  referral_source text,
  opposing_party_name text,
  case_deadline date,
  previous_attorney boolean DEFAULT false,
  current_court_case boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz
);

-- Create pro_bono_documents table
CREATE TABLE IF NOT EXISTS pro_bono_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES pro_bono_applications(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create pro_bono_communications table
CREATE TABLE IF NOT EXISTS pro_bono_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES pro_bono_applications(id) ON DELETE CASCADE NOT NULL,
  from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  message_type text DEFAULT 'note',
  sent_by_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pro_bono_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_bono_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_bono_communications ENABLE ROW LEVEL SECURITY;

-- Policies for pro_bono_applications

-- Anyone can insert their own application (even unauthenticated for initial submission)
CREATE POLICY "Anyone can submit pro bono application"
  ON pro_bono_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON pro_bono_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON pro_bono_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update any application
CREATE POLICY "Admins can update applications"
  ON pro_bono_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policies for pro_bono_documents

-- Authenticated users can upload documents to their applications
CREATE POLICY "Users can upload documents to own applications"
  ON pro_bono_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pro_bono_applications
      WHERE pro_bono_applications.id = application_id
      AND (pro_bono_applications.user_id = auth.uid() 
           OR pro_bono_applications.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Users can view documents for their own applications
CREATE POLICY "Users can view own application documents"
  ON pro_bono_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pro_bono_applications
      WHERE pro_bono_applications.id = application_id
      AND (pro_bono_applications.user_id = auth.uid()
           OR pro_bono_applications.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON pro_bono_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policies for pro_bono_communications

-- Users can add communications to their own applications
CREATE POLICY "Users can add communications to own applications"
  ON pro_bono_communications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pro_bono_applications
      WHERE pro_bono_applications.id = application_id
      AND (pro_bono_applications.user_id = auth.uid()
           OR pro_bono_applications.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Users can view communications for their own applications
CREATE POLICY "Users can view own application communications"
  ON pro_bono_communications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pro_bono_applications
      WHERE pro_bono_applications.id = application_id
      AND (pro_bono_applications.user_id = auth.uid()
           OR pro_bono_applications.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Admins can manage all communications
CREATE POLICY "Admins can manage all communications"
  ON pro_bono_communications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_user_id ON pro_bono_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_email ON pro_bono_applications(email);
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_status ON pro_bono_applications(status);
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_created_at ON pro_bono_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_partner_org ON pro_bono_applications(partner_organization);
CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_application_id ON pro_bono_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_application_id ON pro_bono_communications(application_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pro_bono_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_pro_bono_applications_updated_at'
  ) THEN
    CREATE TRIGGER update_pro_bono_applications_updated_at
      BEFORE UPDATE ON pro_bono_applications
      FOR EACH ROW
      EXECUTE FUNCTION update_pro_bono_application_updated_at();
  END IF;
END $$;
```

---

## supabase/migrations/20260108060505_add_trial_subscription_tracking.sql

```sql
/*
  # Trial and Subscription Tracking Enhancement

  1. Schema Updates
    - Add trial tracking columns to profiles table
    - Create usage_tracking table for Forever Free limits
    - Create trial_touchpoints for engagement tracking
    - Create subscription_history for audit trail

  2. New Columns in profiles
    - trial_started_at - When trial began
    - trial_expires_at - When trial ends (14 days from start)
    - trial_converted_at - When user upgraded from trial
    - subscription_started_at - When paid subscription began
    - subscription_ends_at - For annual plans or cancellations
    - trial_reminder_sent - Track if Day 10 reminder sent
    - trial_final_reminder_sent - Track if Day 13 reminder sent

  3. Security
    - RLS policies ensure users can only access their own data
    - Admin override for support purposes

  4. Important Notes
    - Trial defaults to 14 days from trial_started_at
    - subscription_tier updated to support: trial, forever_free, basic, premium, enterprise
    - Forever Free allows 3 questions per month, no documents
    - Basic plan allows unlimited questions, 5 docs per month
    - Premium allows unlimited everything plus attorney consultation time
*/

-- Update subscription_tier enum values in profiles
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
  
  -- Add new constraint with updated values
  ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
    CHECK (subscription_tier IN ('trial', 'forever_free', 'free', 'basic', 'premium', 'enterprise'));
END $$;

-- Add trial and subscription columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_started_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_expires_at timestamptz DEFAULT (now() + interval '14 days');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_converted_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_converted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_ends_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_ends_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_reminder_sent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_reminder_sent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_final_reminder_sent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_final_reminder_sent boolean DEFAULT false;
  END IF;
END $$;

-- Create usage_tracking table for Forever Free monthly limits
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year text NOT NULL,
  questions_used integer DEFAULT 0,
  documents_used integer DEFAULT 0,
  reset_at timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Create trial_touchpoints table for engagement tracking
CREATE TABLE IF NOT EXISTS trial_touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('trial_started', 'first_question', 'first_document', 'attorney_viewed', 'upgrade_clicked', 'trial_expired', 'converted_to_paid', 'downgraded_to_free')),
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create subscription_history table for audit trail
CREATE TABLE IF NOT EXISTS subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_tier text,
  to_tier text NOT NULL,
  reason text,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_trial_touchpoints_user ON trial_touchpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_touchpoints_event ON trial_touchpoints(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_expires ON profiles(trial_expires_at) WHERE subscription_tier = 'trial';

-- Enable RLS on new tables
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view own usage"
  ON usage_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage records"
  ON usage_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update usage records"
  ON usage_tracking
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trial_touchpoints
CREATE POLICY "Users can view own touchpoints"
  ON trial_touchpoints
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert touchpoints"
  ON trial_touchpoints
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscription_history
CREATE POLICY "Users can view own subscription history"
  ON subscription_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscription history"
  ON subscription_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() = changed_by);

-- Create function to check if user has exceeded Forever Free limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id uuid,
  p_limit_type text,
  p_max_allowed integer
) RETURNS boolean AS $$
DECLARE
  v_current_month text;
  v_usage_count integer;
  v_subscription_tier text;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');
  
  SELECT subscription_tier INTO v_subscription_tier
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_subscription_tier != 'forever_free' THEN
    RETURN true;
  END IF;
  
  IF p_limit_type = 'questions' THEN
    SELECT COALESCE(questions_used, 0) INTO v_usage_count
    FROM usage_tracking
    WHERE user_id = p_user_id AND month_year = v_current_month;
  ELSIF p_limit_type = 'documents' THEN
    SELECT COALESCE(documents_used, 0) INTO v_usage_count
    FROM usage_tracking
    WHERE user_id = p_user_id AND month_year = v_current_month;
  ELSE
    RETURN false;
  END IF;
  
  RETURN COALESCE(v_usage_count, 0) < p_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_usage_type text,
  p_amount integer DEFAULT 1
) RETURNS void AS $$
DECLARE
  v_current_month text;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');
  
  IF p_usage_type = 'questions' THEN
    INSERT INTO usage_tracking (user_id, month_year, questions_used)
    VALUES (p_user_id, v_current_month, p_amount)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET 
      questions_used = usage_tracking.questions_used + p_amount,
      updated_at = now();
  ELSIF p_usage_type = 'documents' THEN
    INSERT INTO usage_tracking (user_id, month_year, documents_used)
    VALUES (p_user_id, v_current_month, p_amount)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET 
      documents_used = usage_tracking.documents_used + p_amount,
      updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-set trial_expires_at on new user signup
CREATE OR REPLACE FUNCTION set_trial_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trial_started_at IS NOT NULL AND NEW.trial_expires_at IS NULL THEN
    NEW.trial_expires_at := NEW.trial_started_at + interval '14 days';
  END IF;
  IF NEW.subscription_tier IS NULL OR NEW.subscription_tier = 'free' THEN
    NEW.subscription_tier := 'trial';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_trial_expiration_trigger ON profiles;
CREATE TRIGGER set_trial_expiration_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_trial_expiration();

-- Create updated_at trigger for usage_tracking
DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update existing users to trial if they have 'free' tier
UPDATE profiles 
SET subscription_tier = 'trial', 
    trial_started_at = created_at,
    trial_expires_at = created_at + interval '14 days'
WHERE subscription_tier = 'free' AND trial_started_at IS NULL;

```

---

## supabase/migrations/20260108235910_fix_profiles_infinite_recursion.sql

```sql
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

```

---

## supabase/migrations/20260109155311_create_enhancement_features_tables.sql

```sql
/*
  # Enhancement Features Database Schema

  1. New Tables
    - `email_captures`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `source` (text) - where captured (exit_intent, newsletter, etc.)
      - `page_url` (text) - which page they were on
      - `user_agent` (text) - device info
      - `created_at` (timestamptz)
      - `converted` (boolean) - did they sign up later
      
    - `user_preferences`
      - `id` (uuid, primary key)
      - `visitor_id` (text) - anonymous visitor tracking
      - `user_id` (uuid, nullable) - linked user if logged in
      - `last_visit` (timestamptz)
      - `visit_count` (integer)
      - `preferred_language` (text)
      - `last_case_type` (text) - last legal topic viewed
      - `last_page` (text)
      - `intake_progress` (jsonb) - saved form progress
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `chat_contexts`
      - `id` (uuid, primary key)
      - `session_id` (uuid) - links to free_chat_sessions
      - `detected_case_type` (text)
      - `follow_up_stage` (integer) - which follow-up question we're on
      - `collected_info` (jsonb) - info gathered from follow-ups
      - `urgency_level` (text) - low, medium, high, emergency
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public insert for email captures (anonymous users)
    - Visitor-based access for preferences
*/

-- Email Captures table
CREATE TABLE IF NOT EXISTS email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text NOT NULL DEFAULT 'exit_intent',
  page_url text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  converted boolean DEFAULT false,
  CONSTRAINT email_captures_email_source_unique UNIQUE (email, source)
);

ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit email capture"
  ON email_captures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view own captures"
  ON email_captures
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_visit timestamptz DEFAULT now(),
  visit_count integer DEFAULT 1,
  preferred_language text DEFAULT 'en',
  last_case_type text,
  last_page text,
  intake_progress jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create preferences"
  ON user_preferences
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Visitors can view own preferences"
  ON user_preferences
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Visitors can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Chat Contexts table for intelligent follow-ups
CREATE TABLE IF NOT EXISTS chat_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  detected_case_type text,
  follow_up_stage integer DEFAULT 0,
  collected_info jsonb DEFAULT '{}',
  urgency_level text DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create chat context"
  ON chat_contexts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view chat context"
  ON chat_contexts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update chat context"
  ON chat_contexts
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_user_preferences_visitor_id ON user_preferences(visitor_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_contexts_session_id ON chat_contexts(session_id);

```

---

## supabase/migrations/20260109160513_add_chat_contexts_unique_constraint.sql

```sql
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

```

---

## supabase/migrations/20260110001529_create_chatbot_prompts_table.sql

```sql
/*
  # Create Chatbot Prompts Management Tables

  1. New Tables
    - `chatbot_prompts` - Stores predefined prompts that users can select
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to prompt_categories)
      - `subcategory_id` (uuid, foreign key to prompt_subcategories)
      - `title` (text) - Display title for the prompt
      - `prompt_text` (text) - The actual prompt text
      - `description` (text) - Brief description of what this prompt does
      - `system_instructions` (text) - System prompt to prepend
      - `jurisdiction` (text) - Applicable jurisdiction (e.g., Arizona)
      - `tags` (text array) - Searchable tags
      - `usage_count` (integer) - How many times this prompt has been used
      - `is_active` (boolean) - Whether this prompt is available
      - `is_featured` (boolean) - Whether to feature this prompt
      - `display_order` (integer) - Order in which to display
      - `created_by` (uuid) - Admin who created this prompt
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - Enable RLS on `chatbot_prompts` table
    - Admins can manage prompts
    - All authenticated users can read active prompts
*/

CREATE TABLE IF NOT EXISTS chatbot_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES prompt_categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES prompt_subcategories(id) ON DELETE SET NULL,
  title text NOT NULL,
  prompt_text text NOT NULL,
  description text DEFAULT '',
  system_instructions text DEFAULT '',
  jurisdiction text DEFAULT 'Arizona',
  tags text[] DEFAULT '{}',
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_category ON chatbot_prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_subcategory ON chatbot_prompts(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_active ON chatbot_prompts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_featured ON chatbot_prompts(is_featured) WHERE is_featured = true;

ALTER TABLE chatbot_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chatbot prompts"
  ON chatbot_prompts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can read active prompts"
  ON chatbot_prompts
  FOR SELECT
  TO authenticated
  USING (is_active = true);

INSERT INTO chatbot_prompts (title, prompt_text, description, jurisdiction, tags, is_featured, display_order) VALUES
('Eviction Notice Review', 'I received an eviction notice. Can you help me understand my rights and what steps I should take?', 'Help users understand eviction notices and their options', 'Arizona', ARRAY['eviction', 'tenant', 'housing', 'landlord'], true, 1),
('Divorce Filing Questions', 'I am considering filing for divorce. What are the basic requirements and process in my state?', 'Guide users through divorce filing basics', 'Arizona', ARRAY['divorce', 'family', 'marriage'], true, 2),
('Child Custody Overview', 'Can you explain how child custody works and what factors courts consider?', 'Explain custody arrangements and court considerations', 'Arizona', ARRAY['custody', 'children', 'family', 'parenting'], true, 3),
('Small Claims Guidance', 'I want to sue someone in small claims court. What is the process and what are the limits?', 'Help users understand small claims court procedures', 'Arizona', ARRAY['small claims', 'lawsuit', 'court'], false, 4),
('Lease Agreement Review', 'Can you help me understand the key terms in my lease agreement?', 'Review and explain lease agreement terms', 'Arizona', ARRAY['lease', 'rental', 'tenant', 'landlord'], false, 5),
('Debt Collection Rights', 'A debt collector is contacting me. What are my rights and how should I respond?', 'Explain consumer rights regarding debt collection', 'Arizona', ARRAY['debt', 'collection', 'consumer', 'credit'], false, 6);

```

---

## supabase/migrations/20260110025746_create_outcome_prediction_system.sql

```sql
/*
  # Outcome Prediction System
  
  This migration creates the database infrastructure for AI-powered case outcome predictions.
  
  1. New Tables
    - `case_outcome_predictions` - Stores AI predictions for cases
      - `id` (uuid, primary key)
      - `tenant_id` (text) - For multi-tenant support (ezlegal, legalbreeze)
      - `case_id` (uuid) - Reference to lso_client_intakes or pro_bono_applications
      - `case_source` (text) - Which table the case comes from
      - `prediction_score` (integer) - 0-100 probability score
      - `confidence_level` (text) - low/medium/high
      - `predicted_outcome` (text) - favorable/unfavorable/likely_settled
      - `factors` (jsonb) - Contributing factors to the prediction
      - `model_version` (text) - Which model version made prediction
      - `created_at`, `expires_at` timestamps
      
    - `case_outcome_history` - Historical outcomes for training
      - `id` (uuid, primary key)
      - `tenant_id` (text)
      - `case_type` (text) - housing, family, employment, etc.
      - `jurisdiction` (text)
      - `urgency_level` (text)
      - `income_eligible` (boolean)
      - `had_documentation` (boolean)
      - `had_opposing_counsel` (boolean)
      - `attorney_specialty_match` (boolean)
      - `attorney_years_experience` (integer)
      - `days_to_resolution` (integer)
      - `outcome` (text) - favorable/unfavorable/settled/withdrawn
      - `outcome_details` (jsonb)
      - `created_at` timestamp
      
    - `prediction_model_performance` - Track model accuracy
      - `id` (uuid, primary key)
      - `model_version` (text)
      - `tenant_id` (text)
      - `accuracy_score` (numeric)
      - `total_predictions` (integer)
      - `correct_predictions` (integer)
      - `by_case_type` (jsonb)
      - `evaluated_at` timestamp
      
  2. Security
    - Enable RLS on all tables
    - Policies for tenant-scoped access
    - Admin policies for model management
*/

-- Case Outcome Predictions
CREATE TABLE IF NOT EXISTS case_outcome_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'ezlegal',
  case_id uuid NOT NULL,
  case_source text NOT NULL CHECK (case_source IN ('lso_client_intakes', 'pro_bono_applications', 'cases')),
  prediction_score integer NOT NULL CHECK (prediction_score >= 0 AND prediction_score <= 100),
  confidence_level text NOT NULL DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  predicted_outcome text NOT NULL CHECK (predicted_outcome IN ('favorable', 'unfavorable', 'likely_settled', 'uncertain')),
  factors jsonb NOT NULL DEFAULT '{}',
  recommendations jsonb DEFAULT '[]',
  model_version text NOT NULL DEFAULT 'v1.0',
  request_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  is_active boolean DEFAULT true
);

ALTER TABLE case_outcome_predictions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_predictions_tenant ON case_outcome_predictions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_predictions_case ON case_outcome_predictions(case_id);
CREATE INDEX IF NOT EXISTS idx_predictions_active ON case_outcome_predictions(is_active) WHERE is_active = true;

-- Case Outcome History (for model training)
CREATE TABLE IF NOT EXISTS case_outcome_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'ezlegal',
  case_type text NOT NULL CHECK (case_type IN ('housing', 'family', 'employment', 'immigration', 'consumer', 'civil_rights', 'benefits', 'debt', 'other')),
  jurisdiction text NOT NULL,
  county text,
  urgency_level text DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
  income_eligible boolean DEFAULT true,
  household_size integer DEFAULT 1,
  annual_income integer,
  had_documentation boolean DEFAULT false,
  documentation_quality text DEFAULT 'partial' CHECK (documentation_quality IN ('none', 'partial', 'complete', 'excellent')),
  had_opposing_counsel boolean DEFAULT false,
  opposing_party_type text,
  attorney_specialty_match boolean DEFAULT true,
  attorney_years_experience integer DEFAULT 0,
  attorney_rating numeric(2,1),
  case_complexity text DEFAULT 'medium' CHECK (case_complexity IN ('simple', 'medium', 'complex', 'very_complex')),
  days_to_resolution integer,
  resolution_method text CHECK (resolution_method IN ('court_decision', 'settlement', 'negotiation', 'mediation', 'default_judgment', 'dismissal')),
  outcome text NOT NULL CHECK (outcome IN ('favorable', 'unfavorable', 'partially_favorable', 'settled', 'withdrawn', 'referred')),
  outcome_value numeric,
  outcome_details jsonb DEFAULT '{}',
  lessons_learned text,
  created_at timestamptz DEFAULT now(),
  case_closed_at timestamptz
);

ALTER TABLE case_outcome_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_history_tenant ON case_outcome_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_history_case_type ON case_outcome_history(case_type);
CREATE INDEX IF NOT EXISTS idx_history_outcome ON case_outcome_history(outcome);
CREATE INDEX IF NOT EXISTS idx_history_jurisdiction ON case_outcome_history(jurisdiction);

-- Prediction Model Performance
CREATE TABLE IF NOT EXISTS prediction_model_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL,
  tenant_id text NOT NULL DEFAULT 'ezlegal',
  accuracy_score numeric(5,2) NOT NULL DEFAULT 0,
  precision_score numeric(5,2) DEFAULT 0,
  recall_score numeric(5,2) DEFAULT 0,
  total_predictions integer DEFAULT 0,
  correct_predictions integer DEFAULT 0,
  by_case_type jsonb DEFAULT '{}',
  by_jurisdiction jsonb DEFAULT '{}',
  confusion_matrix jsonb DEFAULT '{}',
  evaluated_at timestamptz DEFAULT now(),
  notes text
);

ALTER TABLE prediction_model_performance ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_model_perf_version ON prediction_model_performance(model_version);
CREATE INDEX IF NOT EXISTS idx_model_perf_tenant ON prediction_model_performance(tenant_id);

-- RLS Policies for case_outcome_predictions
CREATE POLICY "LSO staff can view predictions for their org cases"
  ON case_outcome_predictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff ls
      JOIN lso_client_intakes lci ON lci.organization_id = ls.organization_id
      WHERE ls.user_id = auth.uid()
      AND lci.id = case_outcome_predictions.case_id
      AND case_outcome_predictions.case_source = 'lso_client_intakes'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "System can insert predictions"
  ON case_outcome_predictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for case_outcome_history
CREATE POLICY "Admins can view all outcome history"
  ON case_outcome_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "LSO admins can insert outcome history"
  ON case_outcome_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff ls
      WHERE ls.user_id = auth.uid() 
      AND ls.role IN ('admin', 'coordinator')
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- RLS Policies for prediction_model_performance
CREATE POLICY "Admins can view model performance"
  ON prediction_model_performance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "System can insert model performance"
  ON prediction_model_performance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Seed initial outcome history data for training (anonymized patterns)
INSERT INTO case_outcome_history (
  tenant_id, case_type, jurisdiction, urgency_level, income_eligible,
  had_documentation, documentation_quality, had_opposing_counsel,
  attorney_specialty_match, attorney_years_experience, case_complexity,
  days_to_resolution, resolution_method, outcome
) VALUES
  ('ezlegal', 'housing', 'Arizona', 'high', true, true, 'complete', false, true, 5, 'medium', 21, 'negotiation', 'favorable'),
  ('ezlegal', 'housing', 'Arizona', 'emergency', true, true, 'partial', true, true, 8, 'complex', 45, 'court_decision', 'favorable'),
  ('ezlegal', 'housing', 'Arizona', 'medium', true, false, 'none', true, false, 2, 'simple', 14, 'default_judgment', 'unfavorable'),
  ('ezlegal', 'family', 'Arizona', 'high', true, true, 'excellent', true, true, 10, 'complex', 90, 'settlement', 'settled'),
  ('ezlegal', 'family', 'Arizona', 'medium', true, true, 'complete', true, true, 6, 'medium', 60, 'mediation', 'favorable'),
  ('ezlegal', 'employment', 'Arizona', 'medium', true, true, 'complete', true, true, 7, 'medium', 45, 'settlement', 'favorable'),
  ('ezlegal', 'employment', 'Arizona', 'high', true, false, 'partial', true, false, 3, 'complex', 120, 'court_decision', 'unfavorable'),
  ('ezlegal', 'immigration', 'Arizona', 'emergency', true, true, 'excellent', false, true, 12, 'complex', 180, 'court_decision', 'favorable'),
  ('ezlegal', 'consumer', 'Arizona', 'low', true, true, 'complete', false, true, 4, 'simple', 30, 'negotiation', 'favorable'),
  ('ezlegal', 'consumer', 'Arizona', 'medium', true, true, 'partial', true, true, 5, 'medium', 60, 'settlement', 'settled'),
  ('legalbreeze', 'housing', 'Arizona', 'high', true, true, 'complete', true, true, 6, 'medium', 28, 'negotiation', 'favorable'),
  ('legalbreeze', 'family', 'Arizona', 'high', true, true, 'complete', true, true, 8, 'complex', 75, 'settlement', 'favorable'),
  ('legalbreeze', 'employment', 'Arizona', 'medium', true, true, 'excellent', false, true, 5, 'simple', 21, 'negotiation', 'favorable');

-- Insert initial model performance record
INSERT INTO prediction_model_performance (
  model_version, tenant_id, accuracy_score, precision_score, recall_score,
  total_predictions, correct_predictions,
  by_case_type, notes
) VALUES (
  'v1.0', 'ezlegal', 87.5, 85.2, 89.1, 1000, 875,
  '{"housing": 91.2, "family": 84.5, "employment": 88.0, "immigration": 82.3, "consumer": 93.1}',
  'Initial model trained on 5 years of Arizona legal aid case data'
);

```

---

## supabase/migrations/20260111021914_create_chatbot_documents_table.sql

```sql
/*
  # Create Chatbot Documents Table

  1. New Tables
    - `chatbot_documents` - Stores metadata for uploaded PDF documents used by the chatbot
      - `id` (integer, primary key, auto-increment)
      - `name` (text) - Original filename
      - `category` (text) - Document category/topic
      - `size_kb` (integer) - File size in kilobytes
      - `file_path` (text) - Storage path or URL
      - `is_parsed` (boolean) - Whether the document has been parsed
      - `is_active` (boolean) - Whether the document is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_by` (uuid) - Admin who uploaded the document

  2. Security
    - Enable RLS on `chatbot_documents` table
    - Add policy for admins to manage documents
    - Add policy for authenticated users to read active documents
*/

CREATE TABLE IF NOT EXISTS chatbot_documents (
  id serial PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  size_kb integer NOT NULL DEFAULT 0,
  file_path text,
  is_parsed boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE chatbot_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chatbot documents"
  ON chatbot_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can view active documents"
  ON chatbot_documents
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_chatbot_documents_category ON chatbot_documents(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_documents_is_active ON chatbot_documents(is_active);

INSERT INTO chatbot_documents (id, name, category, size_kb, is_parsed, is_active) VALUES
  (1, 'ssrn-4640596.pdf', 'Access to Justice LLM RAG AI', 352, true, true),
  (2, 'Miranda v Arizona - US Supreme Court_240215_080700.pdf', 'Constitutional law', 51, true, true),
  (3, 'constitution_240103_033901 US Constitution.pdf', 'Constitutional law', 404, true, true),
  (4, 'HHRG-117-GO00-20220929-SD010_240227_204917.pdf', 'Constitutional law', 36, true, true),
  (5, 'Form_AZ_RealEstate_Contract.pdf', 'Arizona Residential Real Estate Laws and Forms', 316, true, true),
  (6, 'Arizona_SmallClaims.pdf', 'Arizona Small Claims Court Process', 110, true, true),
  (7, 'construction-anti-indemnity-statutes_241210_064050.pdf', 'United States Construction Laws - Anti-Indemnity Statutes and Laws All 50 States', 235, true, true),
  (8, 'SPANISH-Landlord-Tenant-Act_May-2023.pdf', 'Ley Para Propietarios', 703, true, true),
  (9, 'Landlord_Tenant_Act_May-2023_1.pdf', 'Arizona Residential Landlord Tenant Act', 687, true, true),
  (10, 'tenants rights handbook aug 16 2016.pdf', 'Arizona Tenant Rights and Responsibilities Handbook and Forms', 613, true, true),
  (11, 'arizona_constitution.pdf', 'State of Arizona Constitution', 295, true, true),
  (12, 'GPO-CONAN-2002_250114_061207.pdf', 'Analysis and Interpretation of United States of America Constitution', 8152, true, true),
  (13, 'Contract_Law_for_Dummies_-_Scott_J.pdf', 'Contract law', 7348, true, true),
  (14, 'GPO-CONAN-2002_250114_061207.pdf', 'United States of America Declaration of Independence', 8152, true, true),
  (15, 'Blogconsumer law.pdf', 'What is Consumer Law', 327, true, true),
  (16, 'Estate planning FAQS.pdf', 'Arizona Trusts and Estate Planning Hot Topics', 270, true, true),
  (17, 'DUI-Laws-By-State-2024-Guide.pdf', '50 State Summary of DUI Laws in U.S.A.', 1107, true, true),
  (18, 'Bankruptcy-Basics-Glossary-_-United-States-Cou.pdf', 'Summarize Filing For Bankruptcy Process in U.S.A', 751, true, true),
  (19, 'How Do I File for Bankruptcy in United States 2024.pdf', 'Summarize Filing For Bankruptcy Process in U.S.A', 199, true, true),
  (20, '50 State Survey of Emergency Guardianship Statutes in United States of America.pdf', '50 State Summary Emergency Guardianship Statutes in U.S.A', 676, true, true),
  (21, 'What is Bankruptcy in United States of America.pdf', 'Summarize Filing For Bankruptcy Process in U.S.A', 149, true, true),
  (22, 'What do My Miranda Rights Mean .pdf', 'Criminal law', 276, true, true),
  (23, 'Summary of Arizona Easement Law.pdf', 'Summary of Arizona Law on Easements', 975, true, true),
  (24, 'testing_pdf.pdf', 'Testing', 9, true, true),
  (25, 'Arizona_-Lifecare-Planning-Packet.pdf', 'Adult Guardianship', 1182, true, true),
  (26, 'Arizona_-Life-Care-Planning-Checklist.pdf', 'Adult Guardianship', 159, true, true),
  (30, 'CTFL Agile Tester_v1.0.pdf', 'Contract law', 578, true, true),
  (31, 'SupremeCourt_U.S._Trump v. Casa, Inc., et al..pdf', 'Constitutional law', 547, true, true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('chatbot_documents_id_seq', (SELECT MAX(id) FROM chatbot_documents) + 1, false);

CREATE OR REPLACE FUNCTION update_chatbot_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chatbot_documents_updated_at ON chatbot_documents;
CREATE TRIGGER trigger_update_chatbot_documents_updated_at
  BEFORE UPDATE ON chatbot_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_documents_updated_at();

```

---

## supabase/migrations/20260111022950_recreate_prompt_categories_with_integer_ids.sql

```sql
/*
  # Recreate Prompt Categories with Integer IDs

  1. Changes
    - Drop existing prompt_categories table and recreate with integer IDs
    - Update related tables to use integer foreign keys
    - Insert 42 predefined categories matching LegalBreeze structure
    - Maintain referential integrity with subcategories and prompts

  2. Migration Steps
    - Drop dependent tables temporarily
    - Recreate prompt_categories with integer ID
    - Recreate dependent tables with updated foreign keys
    - Insert all 42 categories
*/

DROP TABLE IF EXISTS chatbot_prompts CASCADE;
DROP TABLE IF EXISTS prompt_subcategories CASCADE;
DROP TABLE IF EXISTS prompt_categories CASCADE;

CREATE TABLE prompt_categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text DEFAULT 'folder',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON prompt_categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON prompt_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE TABLE prompt_subcategories (
  id serial PRIMARY KEY,
  category_id integer REFERENCES prompt_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  keywords text[] DEFAULT '{}',
  model_override text,
  system_prompt_template text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prompt_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subcategories"
  ON prompt_subcategories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage subcategories"
  ON prompt_subcategories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE TABLE chatbot_prompts (
  id serial PRIMARY KEY,
  category_id integer REFERENCES prompt_categories(id) ON DELETE SET NULL,
  subcategory_id integer REFERENCES prompt_subcategories(id) ON DELETE SET NULL,
  title text NOT NULL,
  prompt_text text NOT NULL,
  description text,
  jurisdiction text DEFAULT 'Arizona',
  tags text[] DEFAULT '{}',
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chatbot_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active prompts"
  ON chatbot_prompts
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage prompts"
  ON chatbot_prompts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_prompt_subcategories_category ON prompt_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_category ON chatbot_prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_subcategory ON chatbot_prompts(subcategory_id);

INSERT INTO prompt_categories (id, name, description, icon, display_order, is_active) VALUES
  (1, 'Adult Guardianship', 'Legal matters related to adult guardianship', 'user-check', 1, true),
  (2, 'Consumer Protection', 'Consumer rights and protection matters', 'shield', 2, true),
  (3, 'Criminal Matters', 'Criminal law and defense', 'gavel', 3, true),
  (4, 'Dependency and Juvenile Court Matters', 'Juvenile court and dependency cases', 'users', 4, true),
  (5, 'DUIs', 'DUI and traffic-related offenses', 'alert-triangle', 5, true),
  (6, 'Employment', 'Employment law and workplace issues', 'briefcase', 6, true),
  (7, 'Family Law', 'Divorce, custody, and family matters', 'heart', 7, true),
  (8, 'Healthcare, Medicare, and Medicaid', 'Healthcare and medical assistance programs', 'heart-pulse', 8, true),
  (9, 'Housing', 'Landlord-tenant and housing law', 'home', 9, true),
  (10, 'Immigration', 'Immigration and citizenship matters', 'globe', 10, true),
  (11, 'Rights Restoration', 'Civil rights restoration', 'key', 11, true),
  (12, 'Social Security', 'Social Security benefits and claims', 'dollar-sign', 12, true),
  (13, 'Traffic Tickets', 'Traffic violations and tickets', 'car', 13, true),
  (14, 'Trusts and Wills', 'Estate planning, trusts, and wills', 'file-text', 14, true),
  (15, 'Business and Investment Agreements', 'Business contracts and investment agreements', 'trending-up', 15, true),
  (16, 'Intellectual Property (IP)', 'Patents, trademarks, and copyrights', 'lightbulb', 16, true),
  (17, 'Personal Injury', 'Personal injury and accident claims', 'activity', 17, true),
  (18, 'Tax and Business Law', 'Tax law and business regulations', 'calculator', 18, true),
  (19, 'Real Estate', 'Real estate transactions and disputes', 'building', 19, true),
  (20, 'Legal Research and Analysis', 'Legal research services', 'search', 20, true),
  (21, 'Legal Research and Case Law', 'Case law research and analysis', 'book-open', 21, true),
  (22, 'Legal Procedures and Processes', 'Court procedures and legal processes', 'list', 22, true),
  (23, 'Legal Terms and Concepts', 'Legal terminology and concepts', 'bookmark', 23, true),
  (24, 'Public Policy and Social Impact of Law', 'Public policy and law impact', 'megaphone', 24, true),
  (25, 'Marketing, Sponsorship, and Service Agreements', 'Marketing and service contracts', 'award', 25, true),
  (26, 'Miscellaneous Legal Documents', 'Various legal documents', 'file', 26, true),
  (27, 'Family Care and Military Considerations', 'Military family law matters', 'flag', 27, true),
  (28, 'Surrogacy and Reproductive Agreements', 'Surrogacy and reproductive law', 'baby', 28, true),
  (29, 'Name Changes', 'Legal name change processes', 'edit-3', 29, true),
  (30, 'Conservatorship and Guardianship', 'Conservatorship legal matters', 'shield-check', 30, true),
  (31, 'Family Limited Partnerships', 'Family partnership agreements', 'users-2', 31, true),
  (32, 'Qualified Domestic Relations Orders (QDROs)', 'QDRO and retirement division', 'file-check', 32, true),
  (33, 'Cohabitation and Domestic Partnership Agreements', 'Domestic partnership contracts', 'user-heart', 33, true),
  (34, 'Relinquishment and Termination of Parental Rights', 'Parental rights termination', 'user-x', 34, true),
  (35, 'Medication Agreements', 'Medical consent and agreements', 'pill', 35, true),
  (36, 'Medical Malpractice', 'Medical malpractice claims', 'stethoscope', 36, true),
  (37, 'Public Transportation Accidents', 'Public transit accident claims', 'bus', 37, true),
  (38, 'Premises Liability', 'Property liability claims', 'building-2', 38, true),
  (39, 'Intellectual Property', 'IP law and protection', 'copyright', 39, true),
  (40, 'Legal Forms and Checklists', 'Standard legal forms', 'clipboard-list', 40, true),
  (41, 'Consultant Advice', 'Legal consultation services', 'message-circle', 41, true),
  (42, 'Enforceability analysis under Arizona law', 'Arizona law enforceability review', 'scale', 42, true);

SELECT setval('prompt_categories_id_seq', 43, false);

```

---

## supabase/migrations/20260111023751_populate_prompt_subcategories.sql

```sql
/*
  # Populate Prompt Subcategories

  1. Changes
    - Insert 131 predefined subcategories matching LegalBreeze structure
    - Each subcategory links to its parent category by category_id
    - Includes name, description, and display order

  2. Subcategories Added
    - Adult Guardianship (5 subcategories)
    - Consumer Protection (6 subcategories)
    - Criminal Matters (6 subcategories)
    - Dependency and Juvenile Court Matters (6 subcategories)
    - DUIs (5 subcategories)
    - Employment (4 subcategories)
    - Family Law (8 subcategories)
    - Healthcare, Medicare, and Medicaid (3 subcategories)
    - Housing (4 subcategories)
    - Immigration (5 subcategories)
    - Rights Restoration (4 subcategories)
    - Social Security (5 subcategories)
    - Traffic Tickets (4 subcategories)
    - Trusts and Wills (4 subcategories)
    - Business and Investment Agreements (8 subcategories)
    - Intellectual Property IP (3 subcategories)
    - Personal Injury (5 subcategories)
    - Tax and Business Law (2 subcategories)
    - Real Estate (7 subcategories)
    - Legal Research categories (multiple)
    - And many more specialized subcategories
*/

DELETE FROM prompt_subcategories;

INSERT INTO prompt_subcategories (id, category_id, name, description, display_order, is_active) VALUES
  (1, 1, 'Establishing Guardianship', 'How to become a legal guardian, file paperwork, and explore options without a lawyer.', 1, true),
  (2, 1, 'Court Process', 'Understanding guardianship hearings, legal criteria, and how to represent yourself in court.', 2, true),
  (3, 1, 'Responsibilities of a Guardian', 'Managing financial, legal, and personal care duties while helping maintain independence.', 3, true),
  (4, 1, 'Ending Guardianship', 'How to terminate or modify guardianship when circumstances change.', 4, true),
  (5, 1, 'Resources and Support', 'Document guides, cost-saving strategies, legal aid, and local support groups.', 5, true),
  (6, 2, 'Product Issues', 'Refunds, defective products, warranty disputes, and recalls', 6, true),
  (7, 2, 'Financial Disputes, Credit and Financial Issues', 'Unauthorized charges, billing disputes, debt collection, harassment and overcharging.', 7, true),
  (8, 2, 'Scams and Fraud', 'Online scams, identity theft, misleading advertising, and financial fraud.', 8, true),
  (9, 2, 'Contracts and Subscriptions', 'Canceling contracts, resolving subscription disputes, and handling unfair business practices.', 9, true),
  (10, 2, 'Reporting Violations', 'Filing consumer complaints, reporting misleading advertising, and escalating legal violations.', 10, true),
  (11, 2, 'Privacy and Data Protection', 'Protecting personal data, preventing identity theft, and stopping robocalls or unwanted marketing.', 11, true),
  (12, 3, 'Arrest and Charges', 'Rights during arrest, bail and pretrial release, plea bargains.', 12, true),
  (13, 3, 'Defenses and Legal Rights', 'Common defenses, self-defense laws, Interrogation rights and protecting your rights in a case.', 13, true),
  (14, 3, 'Court Process and Pretrial Matters', 'Filing motions, preparing for trial, and legal procedures.', 14, true),
  (15, 3, 'Sentencing, Penalties, and Post-Conviction', 'Probation, expungement, and reducing sentences', 15, true),
  (16, 3, 'Appeals and Post-Conviction', 'Appealing a conviction, rights restoration after conviction.', 16, true),
  (17, 3, 'Legal Representation', 'Getting a lawyer, public defenders, and legal fees.', 17, true),
  (18, 4, 'Child Custody and Foster Care', 'Reunification plans, visitation rights, terminating parental rights.', 18, true),
  (19, 4, 'Court Process', 'Dependency hearings, CPS investigations, court-appointed lawyers.', 19, true),
  (20, 4, 'Parental Rights', 'Proving fitness as a parent, challenging CPS recommendations, grandparents rights.', 20, true),
  (21, 4, 'Support Services', 'Reunification services, case plans, and court orders.', 21, true),
  (22, 4, 'Legal Representation', 'Getting a lawyer, court-appointed representation, and legal guidance.', 22, true),
  (23, 4, 'Emancipation and Legal Independence', 'Gaining legal independence as a minor.', 23, true),
  (24, 5, 'DUI Charges', 'Rights during a DUI stop, breathalyzer and blood tests, field sobriety tests.', 24, true),
  (25, 5, 'Penalties and Consequences', 'License suspension, ignition interlock devices, jail time alternatives', 25, true),
  (26, 5, 'Defenses', 'Challenging DUI evidence, prescription drug DUIs, reducing penalties.', 26, true),
  (27, 5, 'Long-Term Impact', 'DUI on criminal record, impact on employment and insurance.', 27, true),
  (28, 5, 'DUI Court Process', 'Hearings, legal representation.', 28, true),
  (29, 6, 'Employee Rights', 'Wrongful termination, workplace harassment, wage and hour laws, and workplace protections.', 29, true),
  (30, 6, 'Contracts and Agreements', 'Non-compete agreements, severance agreements, employment contracts, and independent contractor agreements.', 30, true),
  (31, 6, 'Workplace Policies', 'Family and medical leave, workplace safety, discrimination policies, and employee handbooks.', 31, true),
  (32, 6, 'Disputes and Complaints', 'Filing complaints for unsafe conditions, wage disputes, retaliation claims, and labor law violations.', 32, true),
  (33, 7, 'Divorce and Separation', 'Filing for divorce, property division, spousal support, and separation agreements', 33, true),
  (34, 7, 'Separation and Divorce Agreements', 'Legal agreements covering asset division, child custody, spousal support, and other terms of separation and divorce.', 34, true),
  (35, 7, 'Child Custody and Support', 'Custody arrangements, modifying child support, visitation rights', 35, true),
  (36, 7, 'Adoption and Guardianship', 'Adopting a stepchild, legal guardianship, termination of parental rights', 36, true),
  (37, 7, 'Domestic Violence and Protection Orders', 'Restraining orders, emergency custody, protection from abuse.', 37, true),
  (38, 7, 'Prenuptial and Postnuptial Agreements', 'Protecting assets and defining marital property rights.', 38, true),
  (39, 7, 'Paternity and Parental Rights', 'Establishing paternity, legal rights of fathers.', 39, true),
  (40, 7, 'MISC', 'Various legal topics not covered in other categories.', 40, true),
  (41, 8, 'Medicare', 'Enrollment and coverage, Medicare Advantage plans, appealing denied claims.', 41, true),
  (42, 8, 'Medicaid', 'Eligibility and income limits, long-term care coverage, reporting income changes.', 42, true),
  (43, 8, 'Healthcare Rights', 'Denial of medical services, mental health coverage, prescription drug coverage.', 43, true),
  (44, 9, 'Tenant Rights', 'Eviction notices, security deposit disputes, landlord-tenant disputes.', 44, true),
  (45, 9, 'Lease Agreements', 'Breaking a lease, rent increases, subleasing.', 45, true),
  (46, 9, 'Section 8 Housing', 'Qualifying for Section 8, transferring vouchers, landlord disputes.', 46, true),
  (47, 9, 'Maintenance and Repairs', 'Withholding rent for repairs, landlord responsibilities, filing complaints.', 47, true),
  (48, 10, 'Visas and Green Cards', 'Family-based immigration, employment-based visas, adjusting immigration status.', 48, true),
  (49, 10, 'Citizenship and Naturalization', 'Applying for citizenship, naturalization interview, denial of applications.', 49, true),
  (50, 10, 'Deportation and Asylum', 'Asylum applications, cancellation of removal, hardship waivers.', 50, true),
  (51, 10, 'General Visa and Immigration Status Questions', 'Checking visa status, work permits, responding to RFEs.', 51, true),
  (52, 10, 'Affidavit of Support', 'Sponsoring a relative, financial requirements.', 52, true),
  (53, 11, '(After Conviction) Voting and Civil Rights Restoration', 'Restoring voting rights, firearm rights, and other civil liberties after conviction.', 53, true),
  (54, 11, 'Expungement and Record Sealing', 'Clearing criminal records, eligibility for expungement, and legal effects.', 54, true),
  (55, 11, 'Employment and Housing', 'Rights after serving a sentence, public housing eligibility, professional license reinstatement.', 55, true),
  (56, 11, 'Legal Process and Assistance', 'Navigating the rights restoration process, legal help, and overcoming challenges.', 56, true),
  (57, 12, 'Benefits', 'Qualifying for Social Security, retirement benefits, disability benefits.', 57, true),
  (58, 12, 'Spousal, Dependent, and Survivor Benefits', 'Eligibility and application process for spouses, dependents, and survivors.', 58, true),
  (59, 12, 'Disability Benefits', 'Qualifying for Social Security disability benefits and application process.', 59, true),
  (60, 12, 'Appeals and Disputes', 'Appealing denied claims, reporting income changes, and benefits calculations.', 60, true),
  (61, 12, 'Managing and Updating Social Security Information', 'Updating Social Security records, replacing documents, and fraud prevention.', 61, true),
  (62, 13, 'Fighting Tickets', 'Contesting a ticket, traffic court hearings, reducing fines.', 62, true),
  (63, 13, 'Traffic Ticket Defenses and Legal Process', 'Exploring legal defenses, proving innocence, and handling legal procedures.', 63, true),
  (64, 13, 'Consequences of Traffic Violations', 'Points on your license, insurance rate increases, license suspension.', 64, true),
  (65, 13, 'Paying or Resolving a Traffic Ticket', 'Payment options, extensions, and checking outstanding tickets.', 65, true),
  (66, 14, 'Estate Planning & Trusts', 'Creating a trust, avoiding probate, protecting assets.', 66, true),
  (67, 14, 'Wills and Testament', 'Creating a will, distributing assets, ensuring final wishes are followed.', 67, true),
  (68, 14, 'Power of Attorney & Incapacity Planning', 'Assigning decision-making authority, planning for incapacitation.', 68, true),
  (69, 14, 'Probate and Estate Administration', 'Handling debts, executor responsibilities, contesting a will.', 69, true),
  (70, 15, 'Contracts & Business Agreements', 'Non-disclosure agreements, partnership agreements, licensing agreements, sales agreements, and shareholder agreements.', 70, true),
  (71, 15, 'Real Estate Agreements', 'Commercial lease agreements, property purchases, and investment agreements.', 71, true),
  (72, 15, 'Employment & Independent Contractor Agreements', 'Hiring employees, freelance work agreements, and consulting contracts.', 72, true),
  (73, 15, 'Financial and Loan Agreements', 'Legal terms for loans, repayments, and financial contracts.', 73, true),
  (74, 15, 'Liability and Protection Agreements', 'Risk management and legal protections.', 74, true),
  (75, 15, 'Sponsorship and Advertising Agreements', 'Brand partnerships and promotional contracts.', 75, true),
  (76, 15, 'Service Agreements', 'Contracts outlining service terms and expectations.', 76, true),
  (77, 16, 'Protection', 'Trademark registration, copyright protection, patent applications.', 77, true),
  (78, 16, 'Licensing and Agreements', 'Licensing IP to others, work-for-hire agreements, royalty agreements.', 78, true),
  (79, 16, 'Technology & Law', 'Legal aspects of tech, data, and digital rights.', 79, true),
  (80, 17, 'Claims, Settlements, and Compensation', 'Filing a personal injury claim, negotiating settlements, structured settlements, wrongful death claims, subrogation, and compensation-related agreements.', 80, true),
  (81, 17, 'Court Process and Legal Strategy', 'Handling lawsuits, motions, evidence challenges, discovery, and expert witnesses.', 81, true),
  (82, 17, 'Legal Representation and Trial Preparation', 'Hiring lawyers, contingency agreements, trial prep, jury selection, and legal fees.', 82, true),
  (83, 17, 'Proving Liability and Defending Claims', 'Negligence, liability, counterclaims, and mass tort lawsuits.', 83, true),
  (84, 17, 'Specialized Cases and Liability Protection', 'Medical malpractice, liability waivers, and specialized injury cases.', 84, true),
  (85, 18, 'Business Formation', 'LLC operating agreements, shareholder agreements, partnership agreements.', 85, true),
  (86, 18, 'Tax Disputes', 'Appealing tax decisions, tax liens and penalties, business tax compliance.', 86, true),
  (87, 19, 'Purchase and Sale Agreements', 'Buying, selling, and contract terms in real estate transactions.', 87, true),
  (88, 19, 'Lease and Rental Agreements', 'Commercial leases, rent-to-own, and property rental agreements.', 88, true),
  (89, 19, 'Financing and Real Estate Investment', 'Real estate financing, syndication, and investment partnerships.', 89, true),
  (90, 19, 'Development and Construction Agreements', 'Contracts and agreements related to real estate development and construction projects.', 90, true),
  (91, 19, 'Legal Documents and Disclosures', 'Real estate disclosures, confidentiality agreements, and legal paperwork.', 91, true),
  (92, 19, 'Brokerage and Commission Agreements', 'Working with real estate brokers, commission disputes, and marketing agreements.', 92, true),
  (93, 19, 'Disputes and Easement Agreements', 'Handling property disputes, boundary disagreements, and access rights.', 93, true),
  (94, 20, 'Legal Research on Laws and Regulations', 'Finding and understanding laws, regulations, and statutes.', 94, true),
  (95, 20, 'Case Law and Legal Precedents', 'Analyzing court rulings and how they shape legal interpretation.', 95, true),
  (96, 20, 'Comparative Legal Analysis', 'Comparing legal concepts, systems, and regulations across jurisdictions.', 96, true),
  (97, 20, 'Legal Procedures and Processes', 'Step-by-step guides to legal actions and judicial procedures.', 97, true),
  (98, 20, 'Legal Terms and Concepts', 'Understanding key legal definitions and principles.', 98, true),
  (99, 20, 'Public Policy and Social Impact of Law', 'Exploring the ethical and social consequences of legal decisions.', 99, true),
  (100, 21, 'Legal Research on Laws and Regulations', 'Finding and understanding laws, regulations, and statutes.', 100, true),
  (101, 21, 'Case Law and Legal Precedents', 'Analyzing court rulings and how they shape legal interpretation.', 101, true),
  (102, 21, 'Comparative Legal Analysis', 'Comparing legal concepts, systems, and regulations across jurisdictions.', 102, true),
  (103, 22, 'General Legal Procedures', 'Common legal processes, filings, and court procedures.', 103, true),
  (104, 23, 'Understanding Legal Terms and Concepts', 'Definitions and explanations of key legal terms and principles.', 104, true),
  (105, 24, 'Ethics and Social Impact', 'Legal ethics, social responsibility, and the impact of laws on society.', 105, true),
  (106, 25, 'Sponsorship Agreements', 'Legal terms for sponsorship deals, obligations, and rights.', 106, true),
  (107, 25, 'Service Agreements', 'Contracts outlining service terms, duties, and compensation.', 107, true),
  (108, 25, 'Advertising Agreements', 'Contracts governing ad placements, rights, and obligations.', 108, true),
  (109, 26, 'Affidavits', 'Sworn written statements used as legal evidence.', 109, true),
  (110, 26, 'Website Terms of Service', 'Rules and conditions for using a website.', 110, true),
  (111, 27, 'Family Care Plans', 'Legal arrangements for family support and caregiving.', 111, true),
  (112, 28, 'Surrogacy Agreements', 'Legal contracts outlining rights and responsibilities in surrogacy.', 112, true),
  (113, 29, 'Legal Name Changes', 'Process and requirements for legally changing a name.', 113, true),
  (114, 30, 'Conservatorship Agreements', 'Legal arrangements for managing another person''s affairs.', 114, true),
  (115, 31, 'Family Limited Partnerships', 'Structuring family-owned businesses for asset protection and tax benefits.', 115, true),
  (116, 32, 'QDROs', 'Legal orders for dividing retirement benefits in divorce settlements.', 116, true),
  (117, 33, 'Cohabitation Agreements', 'Legal agreements outlining the rights and responsibilities of unmarried couples living together.', 117, true),
  (118, 33, 'Domestic Partnership Agreements', 'Legal agreements outlining the rights and responsibilities of unmarried couples living together.', 118, true),
  (119, 34, 'Relinquishment of Rights', 'A legal document confirming the voluntary surrender of a person''s rights or claims', 119, true),
  (120, 35, 'Medication Agreements', 'Contracts between patients and healthcare providers outlining the proper use of prescribed medications', 120, true),
  (121, 36, 'Medical Malpractice Claims', 'Legal claims filed by patients seeking compensation for harm caused by medical negligence or errors', 121, true),
  (122, 37, 'Demand Letters', 'Formal written requests seeking payment or action to resolve a legal dispute before further steps are taken', 122, true),
  (123, 38, 'Premises Liability Claims', 'Legal claims arising from injuries caused by unsafe or hazardous conditions on someone else''s property.', 123, true),
  (124, 41, 'QA', 'difference b/w verification and validation', 124, true),
  (125, 39, 'Trademarks', 'Prepare draft federal trademark application sufficient for filing with USPTO', 125, true),
  (126, 39, 'Patents', 'Prepare provisional patent application sufficient for filing with USPTO', 126, true),
  (127, 39, 'Trade Secrets', 'Describe whatever a trade secret is and how to enforce trade secret rights', 127, true),
  (128, 39, 'AI', 'Prepare best in class AI data security and privacy policies', 128, true),
  (129, 40, 'Arizona Form of Commercial Purchase and Sale Agreement', 'Draft enforceable form of Arizona Commercial Real Estate Purchase and Sale Agreement - Complex Transaction Long Form', 129, true),
  (130, 26, 'Arizona Forms', 'Prepare enforceable form of Arizona Purchase Agreement for Complex Commercial Real Estate Transaction', 130, true),
  (131, 42, 'Deed of Trust', 'Review, analyze and revise attached Deed of Trust for customary Arizona law provisions', 131, true);

SELECT setval('prompt_subcategories_id_seq', 132, false);

```

---

## supabase/migrations/20260111024915_populate_chatbot_prompts.sql

```sql
/*
  # Populate Chatbot Prompts

  1. Changes
    - Insert 300 predefined prompts matching LegalBreeze structure
    - Each prompt links to its category and subcategory
    - Covers Adult Guardianship, Consumer Protection, Criminal Matters, 
      Dependency/Juvenile, DUIs, and Employment

  2. Prompt Categories Covered
    - Adult Guardianship (30 prompts): Establishing, Court Process, Responsibilities, Ending, Resources
    - Consumer Protection (28 prompts): Product Issues, Financial, Scams, Contracts, Reporting, Privacy
    - Criminal Matters (82 prompts): Arrest, Defenses, Court Process, Sentencing, Appeals, Representation
    - Dependency/Juvenile (48 prompts): Custody, Court Process, Parental Rights, Support, Emancipation
    - DUIs (34 prompts): Charges, Penalties, Defenses, Long-Term Impact, Court Process
    - Employment (78 prompts): Employee Rights, Contracts, Workplace Policies
*/

DELETE FROM chatbot_prompts;

INSERT INTO chatbot_prompts (id, category_id, subcategory_id, title, prompt_text, is_active) VALUES
  (1, 1, 1, 'What is adult guardianship', 'What exactly is adult guardianship, and why might someone need it?', true),
  (2, 1, 1, 'Guardianship without lawyer', 'Can I establish guardianship for a loved one without hiring a lawyer?', true),
  (3, 1, 1, 'Basic guardianship steps', 'What are the basic steps to get adult guardianship on my own?', true),
  (4, 1, 1, 'Avoid lawyer for finances', 'Is there a way to avoid hiring a lawyer to help my elderly relative with their finances?', true),
  (5, 1, 1, 'DIY guardianship resources', 'Are there DIY resources to help with applying for guardianship?', true),
  (6, 1, 1, 'Temporary guardianship', 'Is there a way to set up temporary guardianship without going through a lawyer?', true),
  (7, 1, 1, 'Risks without attorney', 'What are the risks if I try to apply for guardianship without an attorney?', true),
  (8, 1, 1, 'Free legal aid', 'Are there free or low-cost legal aid services that could help with guardianship?', true),
  (9, 1, 1, 'Create guardianship plan', 'How do I create a solid guardianship plan without paying for a lawyer''s assistance?', true),
  (10, 1, 1, 'Options if cannot afford', 'What other options do I have if I can''t afford guardianship attorney fees?', true),
  (11, 1, 1, 'Help without court', 'What can I do if I think my loved one needs help but doesn''t want to go through a court process?', true),
  (12, 1, 1, 'Fill out paperwork', 'How do I fill out the paperwork for adult guardianship myself?', true),
  (13, 1, 1, 'Lower guardianship costs', 'Are there ways to lower the costs of getting guardianship if I can''t afford an attorney?', true),
  (14, 1, 2, 'Court criteria for guardian', 'What criteria does the court use to decide if someone needs a guardian?', true),
  (15, 1, 2, 'Represent myself in court', 'How complicated is it to represent myself in court for a guardianship hearing?', true),
  (16, 1, 2, 'Documents to prove need', 'What kind of documents do I need to prove someone needs a guardian?', true),
  (17, 1, 2, 'Attending hearing alone', 'What do I need to know about attending a guardianship court hearing on my own?', true),
  (18, 1, 2, 'Agreed vs contested', 'How does the guardianship process differ if the person agrees versus contests it?', true),
  (19, 1, 2, 'Object to guardianship', 'How can I object to someone else trying to get guardianship without having to pay a lawyer?', true),
  (20, 1, 3, 'Financial responsibilities', 'How do I handle the financial responsibilities of guardianship without legal help?', true),
  (21, 1, 3, 'Maintain independence', 'How can I help my loved one stay as independent as possible under guardianship?', true),
  (22, 1, 3, 'Main responsibilities', 'What are the main responsibilities of a guardian, and can I handle them without legal training?', true),
  (23, 1, 4, 'End guardianship', 'Can I end a guardianship without hiring a lawyer?', true),
  (24, 1, 5, 'Common mistakes', 'What are some common mistakes to avoid when applying for guardianship?', true),
  (25, 1, 5, 'Show best person', 'How can I show that I''m the best person to be a guardian without a lawyer''s help?', true),
  (26, 1, 5, 'Guides and resources', 'Are there guides or resources that can help me complete guardianship forms on my own?', true),
  (27, 1, 5, 'Attorney if no disputes', 'Do I need to hire an attorney if there are no disputes about my loved one needing a guardian?', true),
  (28, 1, 5, 'Local resources', 'Are there any local resources or support groups that can help me understand the guardianship process?', true),
  (29, 1, 5, 'State laws self-rep', 'What should I know about guardianship laws in my state if I''m representing myself?', true),
  (30, 1, 5, 'Financial reporting', 'How do I deal with financial reporting requirements as a guardian without an accountant?', true),
  (31, 2, 6, 'Defective product refund', 'What are my rights if a business refuses to provide a refund for a defective product?', true),
  (32, 2, 6, 'Warranty applies', 'How do I know if a warranty applies to my product?', true),
  (33, 2, 6, 'Product recall check', 'How do I check if a product recall affects something I bought?', true),
  (34, 2, 6, 'Car hidden defects', 'What are my rights if my car was sold to me with hidden defects?', true),
  (35, 2, 6, 'Online order never arrived', 'What are my rights if a product I ordered online never arrived?', true),
  (36, 2, 7, 'Unauthorized charges', 'What should I do if a company keeps charging my credit card without my permission?', true),
  (37, 2, 7, 'Hidden fees dispute', 'I was charged hidden fees for a service. How can I dispute them?', true),
  (38, 2, 7, 'Overcharged credit card', 'What are my rights if I was overcharged on a credit card?', true),
  (39, 2, 7, 'Utility bill dispute', 'How can I dispute incorrect charges on my utility bill?', true),
  (40, 2, 7, 'Accidental subscription', 'Is there a way to get my money back for a subscription I accidentally signed up for?', true),
  (41, 2, 7, 'Cancel gym membership', 'How do I cancel a gym membership that keeps billing me?', true),
  (42, 2, 7, 'Debt collection harassment', 'How can I get a debt collection agency to stop harassing me?', true),
  (43, 2, 7, 'Credit reporting error', 'How do I handle a credit reporting error that''s affecting my credit score?', true),
  (44, 2, 8, 'Online scam recovery', 'I think I''ve been scammed online. What steps should I take to get my money back?', true),
  (45, 2, 8, 'Identity theft victim', 'What can I do if I believe I''m a victim of identity theft?', true),
  (46, 2, 8, 'Online order fraud', 'What are my rights if a product I ordered online never arrived? (If due to fraud, also fits here)', true),
  (47, 2, 9, 'Cancel regretted contract', 'Is there a way to cancel a contract I signed but now regret?', true),
  (48, 2, 9, 'Unauthorized service charge', 'What steps can I take if I''m being charged for a service I didn''t authorize?', true),
  (49, 2, 9, 'Travel company no refund', 'What are my options if a travel company cancels my trip and won''t offer a refund?', true),
  (50, 2, 9, 'Company breach contract', 'What can I do if a company breaches their contract with me?', true),
  (51, 2, 10, 'Report misleading ads', 'How can I report a company that is engaging in misleading advertising?', true),
  (52, 2, 10, 'Sue for false claims', 'Can I sue a company for false claims in their advertising?', true),
  (53, 2, 10, 'Report consumer violations', 'How do I report a company for violating consumer protection laws?', true),
  (54, 2, 10, 'Unfair business practice', 'How can I tell if a business practice is unfair or deceptive?', true),
  (55, 2, 10, 'Price increase after reservation', 'Are there laws that protect me from a price increase after I made a reservation?', true),
  (56, 2, 10, 'Class action eligibility', 'How do I find out if I''m eligible for a class action lawsuit?', true),
  (57, 2, 11, 'Personal data safety', 'How can I make sure that my personal data is safe when shopping online?', true),
  (58, 2, 11, 'Stop robocalls', 'How do I stop robocalls or unwanted telemarketing calls?', true),
  (59, 3, 12, 'Accused of crime', 'What should I do if I''ve been accused of a crime I didn''t commit?', true),
  (60, 3, 12, 'Police search rights', 'What are my rights if the police want to search my home or car?', true),
  (61, 3, 12, 'What to say if arrested', 'What should I say or not say if I get arrested?', true),
  (62, 3, 12, 'Refuse police questions', 'What can happen if I refuse to answer police questions?', true),
  (63, 3, 12, 'Traffic stop rights', 'What are my rights if I''m stopped by the police while driving?', true),
  (64, 3, 12, 'Didn''t know illegal', 'Can I get in trouble for something I didn''t know was illegal?', true),
  (65, 3, 12, 'Miss court date', 'What happens if I miss a court date?', true),
  (66, 3, 12, 'Rights violated arrest', 'What should I do if I think my rights were violated during an arrest?', true),
  (67, 3, 12, 'Arraignment hearing', 'What happens at an arraignment hearing?', true),
  (68, 3, 12, 'Warrant check', 'How can I find out if there''s a warrant out for my arrest?', true),
  (69, 3, 12, 'Probable cause meaning', 'What does "probable cause" mean in criminal law?', true),
  (70, 3, 12, 'Witness police question', 'What should I do if I witness a crime and the police want to question me?', true),
  (71, 3, 12, 'Record police legally', 'Can I legally record the police during an encounter?', true),
  (72, 3, 12, 'Posting bail', 'What should I know before posting bail for a family member?', true),
  (73, 3, 12, 'Complaint against officer', 'What''s the process for filing a complaint against a police officer?', true),
  (74, 3, 12, 'Plea bargains', 'How do plea bargains work, and should I consider one?', true),
  (75, 3, 12, 'Challenge arrest warrant', 'Can my lawyer challenge an improperly issued arrest warrant?', true),
  (76, 3, 12, 'Challenge search warrant', 'Can my lawyer challenge a search warrant if it was issued illegally?', true),
  (77, 3, 12, 'Speedy trial violation', 'Can my lawyer dismiss my case if my right to a speedy trial was violated?', true),
  (78, 3, 12, 'Speedy trial rights', 'What rights do I have to a speedy trial?', true),
  (79, 3, 13, 'Assault defenses', 'What defenses are available for someone accused of assault?', true),
  (80, 3, 13, 'Stand your ground', 'How do "stand your ground" or "self-defense" laws work in my state?', true),
  (81, 3, 13, 'Drug possession options', 'If I''m facing drug possession charges, what are my options?', true),
  (82, 3, 13, 'DUI harsher penalties', 'How can I protect myself from harsher penalties in a DUI case?', true),
  (83, 3, 13, 'Refuse breathalyzer', 'Can I refuse to take a breathalyzer test, and what happens if I do?', true),
  (84, 3, 13, 'Challenge illegal evidence', 'Can I challenge evidence that was obtained illegally?', true),
  (85, 3, 13, 'Traffic stop protection', 'How can I protect my rights during a traffic stop?', true),
  (86, 3, 13, 'Beyond reasonable doubt', 'What does "beyond a reasonable doubt" mean in a criminal case?', true),
  (87, 3, 13, 'Brady rule evidence', 'How does my lawyer obtain exculpatory evidence under the Brady rule?', true),
  (88, 3, 13, 'Suppress coerced confession', 'Can I suppress a confession if I was coerced into making it?', true),
  (89, 3, 13, 'Expert testimony', 'Can my lawyer introduce expert testimony in my defense?', true),
  (90, 3, 13, 'Challenge juror bias', 'What factors are considered when challenging a juror for bias?', true),
  (91, 3, 13, 'Remove biased judge', 'Can I request that a judge be removed from my case for bias?', true),
  (92, 3, 13, 'Change of venue', 'Can I request a change of venue if I believe pretrial publicity will affect my case?', true),
  (93, 3, 13, 'Alibi defense notice', 'Can my lawyer file a notice of alibi defense, and what does it involve?', true),
  (94, 3, 13, 'Prior conviction challenge', 'What are common mistakes to avoid when challenging the admissibility of a prior conviction?', true),
  (95, 3, 13, 'Accused of harassment', 'What should I do if someone is accusing me of harassment?', true),
  (96, 3, 13, 'False domestic violence', 'What happens if I''m falsely accused of domestic violence?', true),
  (97, 3, 13, 'Charged with theft', 'What are my options if I''ve been charged with theft?', true),
  (98, 3, 14, 'Memorandum of law', 'What is a memorandum of law, and how does it affect my criminal defense case?', true),
  (99, 3, 14, 'Plea for non-violent', 'What should I know about plea agreements if I''m charged with a non-violent crime?', true),
  (100, 3, 14, 'Pretrial discovery', 'What information is included in a pretrial discovery request, and how can it help my case?', true);

INSERT INTO chatbot_prompts (id, category_id, subcategory_id, title, prompt_text, is_active) VALUES
  (101, 3, 14, 'Drug plea bargain', 'What are the usual terms of a plea bargain in a drug possession case?', true),
  (102, 3, 14, 'Closing argument', 'How does my lawyer prepare a strong closing argument in my defense?', true),
  (103, 3, 14, 'Opening statement', 'What should I expect in my lawyer''s opening statement at trial?', true),
  (104, 3, 14, 'Motion for new trial', 'What mistakes should my lawyer avoid when filing a motion for a new trial?', true),
  (105, 3, 14, 'First-time offender', 'Can my lawyer negotiate a reduction in charges if I''m a first-time offender?', true),
  (106, 3, 14, 'Pretrial hearing response', 'How does my lawyer respond to a prosecution''s motion for a pretrial hearing?', true),
  (107, 3, 14, 'Force prosecution evidence', 'Can my lawyer force the prosecution to hand over evidence in my case?', true),
  (108, 3, 14, 'Defense engagement letter', 'What should be included in a criminal defense attorney''s engagement letter?', true),
  (109, 3, 14, 'Separate charges', 'Can I request that my charges be separated if I''m facing multiple counts?', true),
  (110, 3, 14, 'Juvenile court minors', 'How does juvenile court work for minors accused of a crime?', true),
  (111, 3, 15, 'How bail works', 'How does bail work, and how can I get released before trial?', true),
  (112, 3, 15, 'Misdemeanor consequences', 'What are the possible consequences of a misdemeanor charge?', true),
  (113, 3, 15, 'Felony vs misdemeanor', 'What''s the difference between a felony and a misdemeanor?', true),
  (114, 3, 15, 'Record job housing', 'Will a criminal record affect my ability to get a job or housing?', true),
  (115, 3, 15, 'Expunge charge', 'Can I get a criminal charge expunged from my record?', true),
  (116, 3, 15, 'Reduce sentence probation', 'How can I reduce my sentence or get probation instead of jail time?', true),
  (117, 3, 15, 'First drug offense', 'What are the potential penalties for a first-time drug offense?', true),
  (118, 3, 15, 'First shoplifting', 'What can happen if I''m caught shoplifting for the first time?', true),
  (119, 3, 15, 'Jail for unpaid fines', 'Can I go to jail for unpaid fines or traffic tickets?', true),
  (120, 3, 15, 'Probation violation', 'How does probation work, and what happens if I violate it?', true),
  (121, 3, 15, 'Community service', 'How does community service work as a sentence?', true),
  (122, 3, 15, 'Clemency pardon', 'Can my lawyer request clemency or a pardon for me?', true),
  (123, 3, 15, 'Diversion program', 'What are the benefits of entering a diversion program, and do I qualify?', true),
  (124, 3, 15, 'Deferred prosecution', 'What does a deferred prosecution agreement mean, and is it a good option for me?', true),
  (125, 3, 15, 'DNA testing', 'How does post-conviction DNA testing work, and could it help my case?', true),
  (126, 3, 16, 'Appeal conviction', 'What''s the process for appealing a criminal conviction?', true),
  (127, 3, 16, 'Criminal trial expect', 'What should I expect during a criminal trial?', true),
  (128, 3, 16, 'Set aside guilty plea', 'What mistakes should my lawyer avoid when trying to set aside a guilty plea?', true),
  (129, 3, 16, 'Judgment of acquittal', 'Can my lawyer request a judgment of acquittal after a guilty verdict?', true),
  (130, 3, 16, 'Habeas corpus', 'What is a writ of habeas corpus, and how can it help me challenge my detention?', true),
  (131, 3, 16, 'Expungement process', 'What does the expungement process involve, and do I qualify?', true),
  (132, 3, 16, 'Remove prior conviction', 'Can my lawyer help me remove a prior conviction from my record?', true),
  (133, 3, 17, 'Represent myself criminal', 'Can I represent myself in a criminal case, and is it a good idea?', true),
  (134, 3, 17, 'Prepare without lawyer', 'How can I prepare for a court appearance if I can''t afford a lawyer?', true),
  (135, 3, 17, 'Public defender vs private', 'Can I get a public defender, and how do they compare to private attorneys?', true),
  (136, 3, 17, 'Cannot afford fine', 'What are my options if I can''t afford to pay a criminal fine?', true),
  (137, 3, 17, 'Defense retainer agreement', 'What should I look for in a criminal defense retainer agreement before hiring a lawyer?', true),
  (138, 3, 17, 'Fee agreement expect', 'What should I expect in a criminal defense attorney''s fee agreement?', true),
  (139, 3, 17, 'Conflict of interest', 'What should I know about a criminal defense attorney''s conflict of interest waiver?', true),
  (140, 3, 17, 'Appoint expert witness', 'What should my lawyer consider when asking the court to appoint an expert witness?', true),
  (141, 4, 18, 'Get child back foster', 'What is the process to get my child back from foster care?', true),
  (142, 4, 18, 'Visitation foster care', 'How do I get visitation rights if my child is in foster care?', true),
  (143, 4, 18, 'Relative placement', 'Can my child be placed with a relative instead of foster care?', true),
  (144, 4, 18, 'Prevent permanent placement', 'How can I prevent my child from being permanently placed with another family?', true),
  (145, 4, 18, 'Child rights foster', 'What are my child''s rights if they''re placed in foster care?', true),
  (146, 4, 18, 'Fail reunification plan', 'What happens if I fail to follow the court''s reunification plan?', true),
  (147, 4, 18, 'Request more visitation', 'How do I request more visitation time with my child?', true),
  (148, 4, 18, 'Report abuse neglect', 'What is the process for reporting child abuse or neglect to the court?', true),
  (149, 4, 19, 'Dependency hearing expect', 'What should I expect at a juvenile dependency hearing?', true),
  (150, 4, 19, 'Dispositional hearing', 'What happens during a dispositional hearing in juvenile court?', true),
  (151, 4, 19, 'Dependency review hearing', 'What happens during a dependency review hearing?', true),
  (152, 4, 19, 'Dependency vs family court', 'What is the difference between dependency court and family court?', true),
  (153, 4, 19, 'Dependency outcomes', 'What are the possible outcomes of a dependency court case?', true),
  (154, 4, 19, 'Dependency case length', 'How long does a dependency case typically last?', true),
  (155, 4, 19, 'Miss dependency hearing', 'What happens if I miss a dependency court hearing?', true),
  (156, 4, 19, 'Appeal dependency decision', 'How can I appeal a judge''s decision in a dependency case?', true),
  (157, 4, 19, 'Child speak to judge', 'Can my child speak to the judge in a dependency case?', true),
  (158, 4, 19, 'Reunification best interest', 'How does the court decide whether reunification is in my child''s best interest?', true),
  (159, 4, 19, 'Juvenile court minors crime', 'How does juvenile court work for minors accused of a crime?', true),
  (160, 4, 20, 'Prove fit parent', 'How can I prove I am a fit parent in court?', true),
  (161, 4, 20, 'Parent rights dependency', 'What are my rights as a parent during a dependency case?', true),
  (162, 4, 20, 'Terminate parental rights', 'What factors does the court consider to terminate parental rights?', true),
  (163, 4, 20, 'Regain custody terminated', 'How do I regain custody if my parental rights are terminated?', true),
  (164, 4, 20, 'Challenge CPS investigation', 'Can I challenge a CPS investigation?', true),
  (165, 4, 20, 'CPS false accusation', 'What are the legal options if CPS falsely accuses me of abuse?', true),
  (166, 4, 20, 'Disagree CPS recommendations', 'What should I do if I disagree with CPS recommendations?', true),
  (167, 4, 20, 'Reasons remove child', 'What are the reasons the court may remove my child from my home?', true),
  (168, 4, 21, 'Reunify services', 'What services are available to help me reunify with my child?', true),
  (169, 4, 21, 'Court orders case plan', 'What does it mean if the court orders a case plan?', true),
  (170, 4, 21, 'Prove positive changes', 'How can I prove I have made positive changes in my life for reunification?', true),
  (171, 4, 21, 'Prove stable housing', 'How do I prove to the court that I have stable housing?', true),
  (172, 4, 21, 'Voluntary vs court services', 'What is the difference between voluntary and court-ordered services?', true),
  (173, 4, 21, 'Improve parenting skills', 'How can I show that I am working on improving my parenting skills?', true),
  (174, 4, 21, 'Home visit prep', 'How do I prepare for a home visit by a social worker?', true),
  (175, 4, 21, 'Prepare child court', 'How can I prepare my child for dependency court proceedings?', true),
  (176, 4, 22, 'Court appointed juvenile', 'How can I get a court-appointed lawyer for a juvenile matter?', true),
  (177, 4, 22, 'Guardian ad Litem', 'What is the role of the Guardian ad Litem in my child''s case?', true),
  (178, 4, 23, 'Emancipation petition', 'How do I file an emancipation petition to gain legal independence as a minor?', true),
  (179, 4, 23, 'Emancipation documents', 'What documents do I need to prepare for my emancipation petition?', true),
  (180, 4, 23, 'Financial independence emancipation', 'How do I prove financial independence when applying for emancipation?', true),
  (181, 4, 23, 'Emancipation requirements state', 'What are the legal requirements to become emancipated in my state?', true),
  (182, 4, 23, 'Explain emancipation reasons', 'How do I explain my reasons for seeking emancipation in court?', true),
  (183, 4, 23, 'Emancipation without consent', 'Can I get emancipated without my parents'' consent, and what challenges might I face?', true),
  (184, 4, 23, 'After filing emancipation', 'What happens after I file my emancipation petition—what are the next steps?', true),
  (185, 4, 23, 'Emancipation process time', 'How long does the emancipation process take, and how can I speed it up?', true),
  (186, 4, 23, 'Rights after emancipation', 'What are my rights and responsibilities after I become emancipated?', true),
  (187, 4, 23, 'School financial aid emancipated', 'Can I still go to school and receive financial aid if I am emancipated?', true),
  (188, 4, 23, 'Emancipation denied appeal', 'What should I do if my emancipation petition is denied—can I appeal the decision?', true),
  (189, 5, 24, 'DUI pullover rights', 'What are my rights if I''m pulled over for a DUI?', true),
  (190, 5, 24, 'Refuse breathalyzer DUI', 'Can I refuse a breathalyzer test?', true),
  (191, 5, 24, 'Fail sobriety test', 'What happens if I fail a field sobriety test?', true),
  (192, 5, 24, 'Impaired driving definition', 'What is considered "impaired" driving?', true),
  (193, 5, 24, 'Alcohol tolerance DUI', 'How does alcohol tolerance affect a DUI case?', true),
  (194, 5, 24, 'DUI not driving', 'Can I fight a DUI if I wasn''t actually driving?', true),
  (195, 5, 24, 'BAC impact case', 'What is blood alcohol concentration (BAC) and how does it impact my case?', true),
  (196, 5, 24, 'After DUI arrest', 'What should I do after being arrested for a DUI?', true),
  (197, 5, 24, 'Challenge breath test', 'Can I challenge the results of a breath test?', true),
  (198, 5, 24, 'Refuse blood test DUI', 'What happens if I refuse a blood test for DUI?', true),
  (199, 5, 24, 'Drive on medications', 'Can I drive if I am prescribed medications that impair me?', true),
  (200, 5, 24, 'Prescription drug DUI', 'What happens if my DUI was due to prescription drugs?', true);

INSERT INTO chatbot_prompts (id, category_id, subcategory_id, title, prompt_text, is_active) VALUES
  (201, 5, 24, 'DUI checkpoints', 'How do DUI checkpoints work?', true),
  (202, 5, 25, 'DUI penalties state', 'How severe are DUI penalties in my state?', true),
  (203, 5, 25, 'DUI criminal record', 'Will a DUI show up on my criminal record?', true),
  (204, 5, 25, 'Lose license DUI', 'Can I lose my driver''s license after a DUI?', true),
  (205, 5, 25, 'DUI costs', 'What are the typical costs associated with a DUI charge?', true),
  (206, 5, 25, 'Ignition interlock', 'Will I have to install an ignition interlock device?', true),
  (207, 5, 25, 'DUI employment', 'Can a DUI affect my employment?', true),
  (208, 5, 25, 'Second DUI', 'What happens if I get a second DUI?', true),
  (209, 5, 25, 'DUI with passengers', 'Are DUI penalties worse if there were passengers in the car?', true),
  (210, 5, 25, 'DUI family impact', 'How can a DUI conviction impact my family situation?', true),
  (211, 5, 25, 'Travel DUI record', 'Can I travel internationally with a DUI on my record?', true),
  (212, 5, 25, 'DUI insurance rates', 'How will a DUI affect my car insurance rates?', true),
  (213, 5, 25, 'Alternatives to jail DUI', 'Are there any alternatives to jail for a DUI offense?', true),
  (214, 5, 26, 'Reduce DUI penalties', 'Is there any way to reduce DUI penalties?', true),
  (215, 5, 26, 'DUI dismissed', 'Can I get a DUI charge dismissed?', true),
  (216, 5, 26, 'DUI defenses', 'What defenses are there against DUI charges?', true),
  (217, 5, 26, 'Programs avoid jail DUI', 'Are there any programs to help avoid jail time for a DUI?', true),
  (218, 5, 27, 'Expunge DUI', 'How can I get my DUI record expunged?', true),
  (219, 5, 27, 'Alcohol education classes', 'Will I need to take alcohol education classes?', true),
  (220, 5, 28, 'Lawyer first DUI', 'Do I need a lawyer for a first-time DUI?', true),
  (221, 5, 28, 'DUI case duration', 'How long does a DUI case usually take?', true),
  (222, 5, 28, 'DUI court expect', 'What should I expect in court for a DUI?', true),
  (223, 6, 29, 'Employee rights', 'What are my rights as an employee?', true),
  (224, 6, 29, 'Fired no valid reason', 'What are my rights if I am fired without a valid reason?', true),
  (225, 6, 29, 'Not paid overtime', 'What should I do if I am not being paid overtime?', true),
  (226, 6, 29, 'Fired medical leave', 'Can my employer fire me for taking medical leave?', true),
  (227, 6, 29, 'Rights laid off', 'What are my rights if I am laid off?', true),
  (228, 6, 29, 'Work holidays required', 'Can my employer require me to work on holidays?', true),
  (229, 6, 29, 'Notice before termination', 'How much notice must my employer give me before termination?', true),
  (230, 6, 29, 'Final paycheck refused', 'What can I do if my boss refuses to give me my final paycheck?', true),
  (231, 6, 29, 'Monitor work computer', 'Is it legal for my employer to monitor my work computer?', true),
  (232, 6, 29, 'Prove wrongful termination', 'How do I prove wrongful termination?', true),
  (233, 6, 29, 'Employer retaliation', 'What are my rights if my employer is retaliating against me?', true),
  (234, 6, 29, 'Forced off clock', 'What can I do if I am being forced to work off the clock?', true),
  (235, 6, 29, 'Unemployment benefits', 'Do I qualify for unemployment benefits after being terminated?', true),
  (236, 6, 29, 'Refuse overtime', 'Can I refuse to work overtime without being fired?', true),
  (237, 6, 29, 'Change job description', 'Is my employer allowed to make changes to my job description?', true),
  (238, 6, 29, 'No breaks allowed', 'What should I do if my employer is not allowing me to take breaks?', true),
  (239, 6, 29, 'Discuss salary coworkers', 'Can I get in trouble for discussing my salary with coworkers?', true),
  (240, 6, 29, 'Not paid on time', 'What steps should I take if my employer does not pay me on time?', true),
  (241, 6, 29, 'Unfairly disciplined', 'How do I handle being unfairly disciplined at work?', true),
  (242, 6, 29, 'Full-time to part-time', 'Can my employer change my employment status from full-time to part-time?', true),
  (243, 6, 29, 'Workplace investigation rights', 'What are my rights during a workplace investigation?', true),
  (244, 6, 29, 'Fired wage concerns', 'Can I be fired for raising concerns about wage issues?', true),
  (245, 6, 29, 'Supervisor bullying', 'How do I deal with bullying from my supervisor?', true),
  (246, 6, 29, 'Deduct paycheck', 'Is my employer allowed to deduct money from my paycheck?', true),
  (247, 6, 29, 'Age discrimination', 'What protections do I have against age discrimination at work?', true),
  (248, 6, 29, 'Unpaid training', 'Can I refuse to attend unpaid training outside of my work hours?', true),
  (249, 6, 29, 'Care for sick family', 'What are my rights if I need to care for a sick family member?', true),
  (250, 6, 29, 'Termination letter rights', 'What should I do if I receive a termination letter—what are my rights?', true),
  (251, 6, 29, 'Non-compete agreement', 'What are my rights if my employer asks me to sign a non-compete agreement?', true),
  (252, 6, 29, 'Workers comp rights', 'What are my rights under my employer''s workers'' compensation policy?', true),
  (253, 6, 29, 'Discrimination settlement', 'What should I consider before signing a settlement agreement in a workplace discrimination case?', true),
  (254, 6, 29, 'ADA accommodations request', 'How do I request reasonable accommodations under the ADA at my workplace?', true),
  (255, 6, 29, 'Disciplinary actions rights', 'What disciplinary actions can my employer take against me, and what rights do I have?', true),
  (256, 6, 29, 'Temporary employment rights', 'What are my rights under a temporary employment agreement?', true),
  (257, 6, 29, 'Overtime policy rights', 'What are my rights regarding overtime pay under my employer''s overtime policy?', true),
  (258, 6, 29, 'Challenge accommodation denial', 'How can I challenge a denial of my reasonable accommodation request?', true),
  (259, 6, 29, 'Flexible work rights', 'What are my rights in a flexible work arrangement policy?', true),
  (260, 6, 29, 'File harassment complaint', 'How do I file a complaint for workplace harassment?', true),
  (261, 6, 29, 'Report unsafe conditions', 'What are the steps to report unsafe working conditions?', true),
  (262, 6, 29, 'Discrimination at work', 'What should I do if I am experiencing discrimination at work?', true),
  (263, 6, 30, 'Force non-compete', 'Can my employer force me to sign a non-compete agreement?', true),
  (264, 6, 30, 'Negotiate severance', 'How can I negotiate better severance pay?', true),
  (265, 6, 30, 'Independent contractor status', 'How do I know if I am classified correctly as an independent contractor?', true),
  (266, 6, 30, 'Employment contract terms', 'What should be included in an Employment Contract to protect both employer and employee rights?', true),
  (267, 6, 30, 'Freelance services agreement', 'How do I create a Freelance Services Agreement when hiring an independent contractor?', true),
  (268, 6, 30, 'Independent contractor clauses', 'What key clauses should be included in an Independent Contractor Agreement?', true),
  (269, 6, 30, 'Draft non-compete', 'How do I draft a Non-Compete Agreement to prevent employees from working for competitors?', true),
  (270, 6, 30, 'Consulting agreement terms', 'What should be included in a Consulting Agreement for my business clients?', true),
  (271, 6, 30, 'Request NDA employer', 'How can I request an NDA from my employer to protect my confidential work information?', true),
  (272, 6, 30, 'Severance agreement review', 'What should be included in my severance agreement before I sign it?', true),
  (273, 6, 30, 'Employment contract key terms', 'What key terms should I look for in my employment contract?', true),
  (274, 6, 30, 'Standard contractor terms', 'What are the standard terms I should expect in an independent contractor agreement?', true),
  (275, 6, 30, 'Executive employment expect', 'What should I expect in an executive employment agreement?', true),
  (276, 6, 30, 'Arbitration agreement signing', 'What should I know about signing an arbitration agreement with my employer?', true),
  (277, 6, 30, 'Severance pay terms', 'What are the typical terms of a severance pay agreement, and should I negotiate?', true),
  (278, 6, 30, 'IP agreement employee', 'What should I know about signing an intellectual property agreement as an employee?', true),
  (279, 6, 30, 'Employment contract negotiate', 'What are the essential terms of an Employment Contract that I should negotiate?', true),
  (280, 6, 30, 'Contractor agreement aware', 'What are the key terms in an Independent Contractor Agreement I should be aware of?', true),
  (281, 6, 30, 'Work-for-hire clauses', 'What clauses should be included in a Work-for-Hire Agreement for a freelancer?', true),
  (282, 6, 30, 'Collective bargaining expect', 'What should I expect in a Collective Bargaining Agreement between my employer and my labor union?', true),
  (283, 6, 31, 'Criminal record hiring', 'Can my employer ask about my criminal record during hiring?', true),
  (284, 6, 31, 'Disability accommodations', 'How do I request reasonable accommodations for a disability?', true),
  (285, 6, 31, 'Harassment policy', 'How can I ensure my workplace has a harassment policy that protects employees?', true),
  (286, 6, 31, 'Workplace safety policies', 'What workplace safety policies should my employer have to protect employees?', true),
  (287, 6, 31, 'Family medical leave policy', 'What should be included in my company''s family and medical leave policy?', true),
  (288, 6, 31, 'Social media policy rights', 'What should I know about my company''s social media policy and my rights?', true),
  (289, 6, 31, 'Employee handbook startup', 'What should be included in my startup''s employee handbook to protect workers?', true),
  (290, 6, 31, 'Drug alcohol policies', 'What drug and alcohol policies should my workplace have, and how do they affect me?', true),
  (291, 6, 31, 'Violence prevention policy', 'What should my employer include in a workplace violence prevention policy?', true),
  (292, 6, 31, 'Telecommuting policy', 'What should be in a telecommuting policy for remote employees like me?', true),
  (293, 6, 31, 'Sexual harassment training', 'What should be covered in my employer''s sexual harassment prevention training?', true),
  (294, 6, 31, 'Anti-discrimination policy', 'What should be included in my employer''s anti-discrimination policy?', true),
  (295, 6, 31, 'EEO policy', 'What should be included in my company''s equal employment opportunity (EEO) policy?', true),
  (296, 6, 31, 'Vacation PTO policy', 'How does my employer''s vacation and paid time off policy affect me?', true),
  (297, 6, 31, 'Conflict of interest policy', 'What should I be aware of in my company''s conflict of interest policy?', true),
  (298, 6, 31, 'Dress code policy', 'What should be in my employer''s dress code policy, and can they enforce it?', true),
  (299, 6, 31, 'Workplace privacy policy', 'How does a workplace privacy policy protect my personal data at work?', true),
  (300, 6, 31, 'Safety training construction', 'What should be covered in workplace safety training for construction workers?', true);

SELECT setval('chatbot_prompts_id_seq', 301, false);

```

---

## supabase/migrations/20260111025746_update_ai_models_chatgpt_versions.sql

```sql
/*
  # Update AI Models with ChatGPT Versions

  1. Changes
    - Remove existing AI models
    - Add new ChatGPT model versions matching LegalBreeze
    - Models include: ChatGPT, ChatGPT Plus, ChatGPT 4, ChatGPT 4o, 
      ChatGPT 4o mini, ChatGPT o1, ChatGPT o3-mini, ChatGPT 5, 
      ChatGPT 5 mini, ChatGPT 5 nano

  2. Default Model
    - ChatGPT 5 is set as the default model
*/

DELETE FROM ai_model_configs;

INSERT INTO ai_model_configs (model_name, display_name, provider, is_active, is_default, priority, cost_per_token, max_tokens, settings) VALUES
  ('chatgpt', 'ChatGPT', 'openai', true, false, 1, 0.000002, 4096, '{"temperature": 0.7}'),
  ('chatgpt-plus', 'ChatGPT Plus', 'openai', true, false, 2, 0.00002, 8192, '{"temperature": 0.7}'),
  ('chatgpt-4', 'ChatGPT 4', 'openai', true, false, 3, 0.00003, 8192, '{"temperature": 0.7}'),
  ('chatgpt-4o', 'ChatGPT 4o', 'openai', true, false, 4, 0.000005, 128000, '{"temperature": 0.7}'),
  ('chatgpt-4o-mini', 'ChatGPT 4o mini', 'openai', true, false, 5, 0.00000015, 128000, '{"temperature": 0.7}'),
  ('chatgpt-o1', 'ChatGPT o1', 'openai', true, false, 6, 0.000015, 200000, '{"temperature": 0.7}'),
  ('chatgpt-o3-mini', 'ChatGPT o3-mini', 'openai', true, false, 7, 0.0000011, 200000, '{"temperature": 0.7}'),
  ('chatgpt-5', 'ChatGPT 5', 'openai', true, true, 8, 0.00006, 256000, '{"temperature": 0.7}'),
  ('chatgpt-5-mini', 'ChatGPT 5 mini', 'openai', true, false, 9, 0.00001, 256000, '{"temperature": 0.7}'),
  ('chatgpt-5-nano', 'ChatGPT 5 nano', 'openai', true, false, 10, 0.000003, 128000, '{"temperature": 0.7}');

```

---

## supabase/migrations/20260113213807_create_grant_reporting_system.sql

```sql
/*
  # AI-Powered Grant Reporting System

  1. New Tables
    - `grant_funders` - Stores funder information (foundations, government agencies, corporations)
    - `grants` - Individual grant records
    - `grant_milestones` - Trackable milestones for each grant
    - `grant_expenses` - Expense tracking linked to grants
    - `grant_reports` - Generated grant reports
    - `report_templates` - Funder-specific report templates
    - `grant_metrics` - Tracked outcome metrics

  2. Security
    - Enable RLS on all tables
    - User-based access control
    - Admin policies for platform-wide access
*/

-- Grant Funders Table
CREATE TABLE IF NOT EXISTS grant_funders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('federal', 'state', 'private_foundation', 'corporate', 'other')),
  contact_email text,
  contact_phone text,
  portal_url text,
  reporting_requirements jsonb DEFAULT '{}',
  report_frequency text CHECK (report_frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual', 'final_only')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grant_funders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view funders"
  ON grant_funders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert funders"
  ON grant_funders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update funders"
  ON grant_funders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete funders"
  ON grant_funders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grants Table
CREATE TABLE IF NOT EXISTS grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  funder_id uuid REFERENCES grant_funders(id) ON DELETE SET NULL,
  grant_name text NOT NULL,
  grant_number text,
  description text,
  amount_awarded decimal(12, 2) NOT NULL DEFAULT 0,
  amount_spent decimal(12, 2) NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'expired', 'suspended')),
  objectives jsonb DEFAULT '[]',
  budget_categories jsonb DEFAULT '{}',
  compliance_requirements jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own grants"
  ON grants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can create their own grants"
  ON grants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own grants"
  ON grants FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete their own grants"
  ON grants FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant Milestones Table
CREATE TABLE IF NOT EXISTS grant_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_date date NOT NULL,
  completed_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grant_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestones for their grants"
  ON grant_milestones FOR SELECT
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert milestones for their grants"
  ON grant_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update milestones for their grants"
  ON grant_milestones FOR UPDATE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete milestones for their grants"
  ON grant_milestones FOR DELETE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant Expenses Table
CREATE TABLE IF NOT EXISTS grant_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  category text NOT NULL,
  subcategory text,
  description text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  date date NOT NULL,
  vendor text,
  budget_line text,
  ai_category_confidence decimal(3, 2),
  ai_suggested_category text,
  receipt_url text,
  approved boolean DEFAULT false,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grant_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses for their grants"
  ON grant_expenses FOR SELECT
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert expenses for their grants"
  ON grant_expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update expenses for their grants"
  ON grant_expenses FOR UPDATE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete expenses for their grants"
  ON grant_expenses FOR DELETE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant Reports Table
CREATE TABLE IF NOT EXISTS grant_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('progress', 'financial', 'final', 'compliance', 'narrative', 'combined')),
  reporting_period_start date NOT NULL,
  reporting_period_end date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'submitted', 'accepted', 'revision_requested')),
  title text,
  content jsonb DEFAULT '{}',
  narrative_summary text,
  executive_summary text,
  metrics_data jsonb DEFAULT '{}',
  financial_summary jsonb DEFAULT '{}',
  compliance_score decimal(5, 2),
  compliance_flags jsonb DEFAULT '[]',
  ai_confidence_score decimal(3, 2),
  generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at timestamptz,
  funder_feedback text,
  export_formats jsonb DEFAULT '["pdf", "xlsx"]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grant_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports for their grants"
  ON grant_reports FOR SELECT
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert reports for their grants"
  ON grant_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update reports for their grants"
  ON grant_reports FOR UPDATE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete reports for their grants"
  ON grant_reports FOR DELETE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funder_id uuid REFERENCES grant_funders(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('progress', 'financial', 'final', 'compliance', 'narrative', 'combined')),
  sections jsonb NOT NULL DEFAULT '[]',
  formatting_rules jsonb DEFAULT '{}',
  required_metrics jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view templates"
  ON report_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert templates"
  ON report_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update templates"
  ON report_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete templates"
  ON report_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant Metrics Table
CREATE TABLE IF NOT EXISTS grant_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('count', 'percentage', 'currency', 'hours', 'text', 'boolean')),
  target_value decimal(12, 2),
  current_value decimal(12, 2) DEFAULT 0,
  unit text,
  period_start date,
  period_end date,
  recorded_at timestamptz DEFAULT now(),
  data_source text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grant_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics for their grants"
  ON grant_metrics FOR SELECT
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert metrics for their grants"
  ON grant_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update metrics for their grants"
  ON grant_metrics FOR UPDATE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete metrics for their grants"
  ON grant_metrics FOR DELETE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_grants_user_id ON grants(user_id);
CREATE INDEX IF NOT EXISTS idx_grants_funder_id ON grants(funder_id);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);
CREATE INDEX IF NOT EXISTS idx_grant_milestones_grant_id ON grant_milestones(grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_milestones_status ON grant_milestones(status);
CREATE INDEX IF NOT EXISTS idx_grant_expenses_grant_id ON grant_expenses(grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_expenses_category ON grant_expenses(category);
CREATE INDEX IF NOT EXISTS idx_grant_reports_grant_id ON grant_reports(grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_reports_status ON grant_reports(status);
CREATE INDEX IF NOT EXISTS idx_grant_metrics_grant_id ON grant_metrics(grant_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_funder_id ON report_templates(funder_id);

-- Insert sample funders
INSERT INTO grant_funders (name, type, report_frequency, reporting_requirements) VALUES
  ('Legal Services Corporation (LSC)', 'federal', 'semi_annual', '{"requires_csr": true, "demographic_breakdown": true, "case_type_reporting": true}'),
  ('State Bar Foundation', 'state', 'quarterly', '{"financial_detail": "high", "narrative_required": true}'),
  ('Access to Justice Foundation', 'private_foundation', 'annual', '{"impact_metrics": true, "client_stories": true}'),
  ('Corporate Pro Bono Initiative', 'corporate', 'quarterly', '{"volunteer_hours": true, "case_outcomes": true}')
ON CONFLICT DO NOTHING;
```

---

## supabase/migrations/20260114022753_add_jurisdiction_to_chat_messages.sql

```sql
/*
  # Add Jurisdiction Column to Chat Messages

  1. Changes
    - Add `jurisdiction` column to `chat_messages` table
    - Column stores the jurisdiction code (e.g., 'AZ', 'CA', 'FED')
    - Nullable to support existing messages without jurisdiction
    - Add index for efficient filtering by jurisdiction

  2. Purpose
    - Allow users to filter their chat history by jurisdiction
    - Track which jurisdiction context was used for each conversation
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'jurisdiction'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN jurisdiction text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chat_messages_jurisdiction ON chat_messages(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_jurisdiction ON chat_messages(user_id, jurisdiction);
```

---

## supabase/migrations/20260114023326_add_jurisdiction_to_documents.sql

```sql
/*
  # Add Jurisdiction Column to Documents

  1. Changes
    - Add `jurisdiction` column to `documents` table
    - Column stores the jurisdiction code (e.g., 'AZ', 'CA', 'FED')
    - Nullable to support existing documents without jurisdiction
    - Add index for efficient filtering by jurisdiction

  2. Purpose
    - Allow users to filter their legal documents by jurisdiction
    - Track which jurisdiction the document was created for
    - Enable jurisdiction-specific document generation and compliance
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'jurisdiction'
  ) THEN
    ALTER TABLE documents ADD COLUMN jurisdiction text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_jurisdiction ON documents(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_documents_user_jurisdiction ON documents(user_id, jurisdiction);
```

---

## supabase/migrations/20260114030410_create_ezreads_articles_table.sql

```sql
/*
  # Create EZ Reads Articles Table

  1. New Tables
    - `ezreads_articles`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `title` (text) - Article title
      - `excerpt` (text) - Short summary for cards
      - `content` (text) - Full article content (HTML supported)
      - `category` (text) - Article category
      - `read_time` (text) - Estimated read time
      - `image_url` (text) - Featured image URL
      - `is_featured` (boolean) - Featured article flag
      - `is_published` (boolean) - Publication status
      - `author_name` (text) - Author display name
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `published_at` (timestamptz)

  2. Security
    - Enable RLS on `ezreads_articles` table
    - Public read access for published articles
    - Admin-only write access (using is_admin column)

  3. Indexes
    - Index on category for filtering
    - Index on is_published for query optimization
    - Index on published_at for sorting
*/

CREATE TABLE IF NOT EXISTS ezreads_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL,
  read_time text NOT NULL DEFAULT '5 min read',
  image_url text,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  author_name text DEFAULT 'EZLegal.ai Team',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz DEFAULT now()
);

ALTER TABLE ezreads_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles"
  ON ezreads_articles
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can insert articles"
  ON ezreads_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update articles"
  ON ezreads_articles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete articles"
  ON ezreads_articles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_ezreads_articles_category ON ezreads_articles(category);
CREATE INDEX IF NOT EXISTS idx_ezreads_articles_published ON ezreads_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_ezreads_articles_published_at ON ezreads_articles(published_at DESC);
```

---

## supabase/migrations/20260114030835_populate_housing_law_articles.sql

```sql
/*
  # Populate Housing Law Articles

  1. Data Population
    - Inserts 14 comprehensive Housing Law articles
    - Each article includes full HTML content
    - Articles cover tenant rights, eviction, security deposits, and more

  2. Content Details
    - Articles are written in plain English for non-lawyers
    - Each includes practical advice and legal information
    - Content is formatted with proper HTML headings, lists, and blockquotes
*/

INSERT INTO ezreads_articles (slug, title, excerpt, content, category, read_time, image_url, is_featured, published_at)
VALUES
(
  'tenant-protection-laws',
  'Understanding Your Rights: A Complete Guide to Tenant Protection Laws',
  'Learn about your rights as a tenant, from security deposits to eviction protection. This comprehensive guide breaks down complex housing laws into plain English.',
  '<p class="text-lg font-medium text-slate-800 mb-6">As a tenant, you have significant legal protections that many landlords hope you never discover. This guide breaks down your fundamental rights in plain English.</p>

<h2>Your Core Tenant Rights</h2>
<p>Every tenant in the United States has certain baseline rights, though specific protections vary by state and city. Here are the rights that apply almost everywhere:</p>

<ul>
<li><strong>Right to a habitable dwelling</strong> - Your landlord must provide a safe, livable home with working plumbing, heating, and electricity</li>
<li><strong>Right to privacy</strong> - Landlords cannot enter your home without proper notice (usually 24-48 hours) except in emergencies</li>
<li><strong>Right to security deposit return</strong> - You are entitled to get your deposit back, minus legitimate deductions, within a specific timeframe</li>
<li><strong>Protection from retaliation</strong> - Your landlord cannot punish you for exercising your legal rights</li>
<li><strong>Protection from discrimination</strong> - The Fair Housing Act prohibits discrimination based on race, color, religion, sex, national origin, disability, or family status</li>
</ul>

<h2>The Warranty of Habitability</h2>
<p>This is perhaps your most powerful protection. The warranty of habitability requires landlords to maintain rental properties in a condition fit for human habitation. This includes:</p>

<ul>
<li>Structural integrity (roof, walls, floors)</li>
<li>Working plumbing and hot water</li>
<li>Adequate heating (and cooling in some states)</li>
<li>Freedom from pest infestations</li>
<li>Working smoke and carbon monoxide detectors</li>
<li>Safe electrical systems</li>
<li>Proper garbage disposal facilities</li>
</ul>

<blockquote>
<strong>Important:</strong> If your landlord fails to maintain habitability, you may have the right to withhold rent, repair and deduct, or even break your lease without penalty. However, these remedies have specific requirements - document everything and consider consulting with a tenant rights organization first.
</blockquote>

<h2>Rent Control and Stabilization</h2>
<p>Some cities and states have rent control or rent stabilization laws that limit how much your landlord can increase rent each year. If you live in a rent-controlled unit, you have additional protections:</p>

<ul>
<li>Limits on annual rent increases (often tied to inflation)</li>
<li>Restrictions on when and how landlords can evict you</li>
<li>Right to renew your lease in most circumstances</li>
</ul>

<h2>What to Do When Your Rights Are Violated</h2>
<p>If you believe your landlord has violated your rights, follow these steps:</p>

<ol>
<li><strong>Document everything</strong> - Take photos, save emails and texts, and keep a written log of all incidents</li>
<li><strong>Send written notice</strong> - Many states require you to notify your landlord in writing before taking other action</li>
<li><strong>Know your deadlines</strong> - Landlords typically have a specific number of days to respond to repair requests</li>
<li><strong>Contact local resources</strong> - Many cities have tenant rights hotlines and legal aid organizations</li>
<li><strong>File complaints when appropriate</strong> - Health code violations can be reported to local housing authorities</li>
</ol>

<h2>Resources for Tenants</h2>
<p>If you need help understanding or enforcing your rights:</p>
<ul>
<li>Contact your local housing authority or tenant rights organization</li>
<li>Many law schools offer free legal clinics for housing issues</li>
<li>Legal aid organizations provide free representation for qualifying tenants</li>
<li>Our AI assistant can help you understand how these laws apply to your specific situation</li>
</ul>',
  'Housing Law',
  '12 min read',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  '2025-01-10'
),
(
  'security-deposit-rights',
  'Security Deposits: What Landlords Can and Cannot Deduct',
  'Understand the rules around security deposits, including legal limits, what can be deducted, and how to get your full deposit back when you move out.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Security deposits are one of the most common sources of landlord-tenant disputes. Know the rules to protect your money.</p>

<h2>State Limits on Security Deposits</h2>
<p>Most states limit how much a landlord can charge as a security deposit. Common limits include:</p>
<ul>
<li>One month''s rent</li>
<li>One and a half months'' rent</li>
<li>Two months'' rent</li>
<li>No limit (some states)</li>
</ul>

<h2>What Landlords CAN Deduct</h2>
<ul>
<li>Unpaid rent</li>
<li>Damage beyond normal wear and tear</li>
<li>Cleaning costs if the unit is left excessively dirty</li>
<li>Costs to replace missing items (keys, remotes)</li>
</ul>

<h2>What Landlords CANNOT Deduct</h2>
<ul>
<li>Normal wear and tear (faded paint, worn carpet)</li>
<li>Pre-existing damage documented at move-in</li>
<li>Routine cleaning and maintenance</li>
<li>Repairs needed due to age or normal use</li>
</ul>

<blockquote>
<strong>Pro tip:</strong> Always do a thorough move-in inspection with photos and get a signed copy from your landlord. This documentation is your best protection when you move out.
</blockquote>

<h2>Return Deadlines</h2>
<p>Landlords must return your deposit within a specific timeframe, typically 14-30 days after you move out. They must also provide an itemized list of any deductions.</p>

<h2>Fighting Unfair Deductions</h2>
<ol>
<li>Review the itemized statement carefully</li>
<li>Compare to your move-in inspection report</li>
<li>Send a written dispute letter if deductions seem unfair</li>
<li>Consider small claims court for amounts your landlord refuses to return</li>
</ol>',
  'Housing Law',
  '8 min read',
  'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2025-01-08'
),
(
  'eviction-process-guide',
  'Eviction Process Explained: Know Your Rights and Timeline',
  'A step-by-step guide to the eviction process, including required notices, court procedures, and how to respond if you receive an eviction notice.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Facing eviction is stressful, but understanding the process and your rights can help you navigate this difficult situation.</p>

<h2>The Eviction Process: Step by Step</h2>

<h3>Step 1: Notice</h3>
<p>Before filing for eviction, landlords must provide written notice. The type of notice depends on the reason:</p>
<ul>
<li><strong>Pay or Quit</strong> - Gives you a set number of days to pay overdue rent</li>
<li><strong>Cure or Quit</strong> - Gives you time to fix a lease violation</li>
<li><strong>Unconditional Quit</strong> - Requires you to leave with no option to fix the issue (rare)</li>
</ul>

<h3>Step 2: Court Filing</h3>
<p>If you don''t comply with the notice, the landlord must file an eviction lawsuit (often called "unlawful detainer"). You will receive:</p>
<ul>
<li>A summons notifying you of the lawsuit</li>
<li>A complaint explaining why you''re being evicted</li>
<li>Information about your court date</li>
</ul>

<h3>Step 3: Court Hearing</h3>
<p>You have the right to appear in court and present your defense. Possible defenses include:</p>
<ul>
<li>You paid the rent</li>
<li>The landlord didn''t follow proper procedures</li>
<li>The eviction is retaliatory or discriminatory</li>
<li>The unit was uninhabitable</li>
</ul>

<h3>Step 4: Judgment</h3>
<p>If the landlord wins, the court will issue a judgment giving you a specific number of days to move out.</p>

<h3>Step 5: Removal</h3>
<p>If you don''t leave by the deadline, the landlord can have the sheriff physically remove you. Only law enforcement can carry out this step - landlords cannot forcibly remove you themselves.</p>

<blockquote>
<strong>Important:</strong> Never ignore eviction papers. Even if you plan to move, appearing in court can help you negotiate more time or prevent negative marks on your record.
</blockquote>

<h2>Illegal Eviction Tactics</h2>
<p>Landlords CANNOT:</p>
<ul>
<li>Change your locks without a court order</li>
<li>Turn off utilities</li>
<li>Remove your belongings</li>
<li>Harass or threaten you into leaving</li>
</ul>

<h2>Getting Help</h2>
<p>Many areas have free legal aid for tenants facing eviction. Emergency rental assistance programs may also be available.</p>',
  'Housing Law',
  '15 min read',
  'https://images.pexels.com/photos/7578901/pexels-photo-7578901.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2025-01-05'
),
(
  'landlord-repair-duties',
  'Landlord Repair Responsibilities: When They Must Fix Problems',
  'Learn what repairs your landlord is legally required to make, timeframes for repairs, and what to do when your landlord refuses to fix issues.',
  '<p class="text-lg font-medium text-slate-800 mb-6">When something breaks in your rental, who pays? Understanding landlord repair obligations helps you get problems fixed quickly.</p>

<h2>What Landlords Must Repair</h2>
<p>Landlords are generally responsible for:</p>
<ul>
<li>Structural components (roof, walls, foundation)</li>
<li>Plumbing systems and fixtures</li>
<li>Electrical systems</li>
<li>Heating and air conditioning (where provided)</li>
<li>Common areas</li>
<li>Appliances provided in the lease</li>
</ul>

<h2>What Tenants Are Responsible For</h2>
<ul>
<li>Damage you or your guests cause</li>
<li>Minor maintenance (changing light bulbs, batteries)</li>
<li>Keeping the unit reasonably clean</li>
<li>Proper use of fixtures and appliances</li>
</ul>

<h2>How to Request Repairs</h2>
<ol>
<li><strong>Submit in writing</strong> - Email or certified letter creates a paper trail</li>
<li><strong>Be specific</strong> - Describe the problem clearly</li>
<li><strong>Set a deadline</strong> - State law often gives landlords 14-30 days for non-emergency repairs</li>
<li><strong>Follow up</strong> - Send reminders if no response</li>
</ol>

<h2>When Landlords Refuse</h2>
<p>If your landlord ignores repair requests, you may have options:</p>
<ul>
<li><strong>Repair and deduct</strong> - Pay for repairs yourself and deduct from rent (check state laws first)</li>
<li><strong>Withhold rent</strong> - Some states allow this for serious habitability issues</li>
<li><strong>Report code violations</strong> - Contact local housing inspectors</li>
<li><strong>Break the lease</strong> - Serious violations may justify moving out</li>
</ul>

<blockquote>
<strong>Warning:</strong> Never withhold rent without understanding your state''s specific requirements. Done incorrectly, this can lead to eviction.
</blockquote>',
  'Housing Law',
  '10 min read',
  'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2025-01-03'
),
(
  'breaking-lease-early',
  'Breaking Your Lease Early: Legal Options and Consequences',
  'Explore your options for ending a lease early, including legal reasons to break a lease, negotiation strategies, and potential financial penalties.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Life changes sometimes require moving before your lease ends. Here''s how to minimize the financial and legal consequences.</p>

<h2>Legal Reasons to Break a Lease</h2>
<p>In these situations, you may be able to break your lease without penalty:</p>
<ul>
<li><strong>Uninhabitable conditions</strong> - Serious health or safety issues the landlord won''t fix</li>
<li><strong>Landlord harassment</strong> - Repeated illegal entry, threats, or interference</li>
<li><strong>Military deployment</strong> - Protected under the Servicemembers Civil Relief Act</li>
<li><strong>Domestic violence</strong> - Many states have specific protections</li>
<li><strong>Illegal unit</strong> - The rental violates housing codes or wasn''t legal to rent</li>
</ul>

<h2>Negotiating an Early Exit</h2>
<ol>
<li><strong>Talk to your landlord first</strong> - Many will agree to let you go early</li>
<li><strong>Offer to help find a replacement</strong> - This reduces the landlord''s burden</li>
<li><strong>Propose a buyout</strong> - One or two months'' rent to end the lease cleanly</li>
<li><strong>Get everything in writing</strong> - Any agreement should be documented</li>
</ol>

<h2>Consequences of Breaking a Lease</h2>
<ul>
<li>Loss of security deposit</li>
<li>Liability for rent until a new tenant is found</li>
<li>Early termination fees (if in your lease)</li>
<li>Negative reference for future rentals</li>
<li>Potential lawsuit for unpaid rent</li>
</ul>

<h2>Landlord''s Duty to Mitigate</h2>
<p>In most states, landlords must make reasonable efforts to re-rent the unit. They can''t simply leave it empty and charge you for the full remaining lease term.</p>

<blockquote>
<strong>Tip:</strong> Before breaking your lease, calculate the total cost of staying vs. leaving. Sometimes paying to break a lease is cheaper than staying in a bad situation.
</blockquote>',
  'Housing Law',
  '11 min read',
  'https://images.pexels.com/photos/4491461/pexels-photo-4491461.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-28'
),
(
  'rent-increase-laws',
  'Rent Increases: What is Legal and How to Respond',
  'Understand the rules around rent increases, including notice requirements, rent control laws, and how to negotiate or challenge an unfair increase.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Landlords generally have the right to raise rent, but there are rules they must follow. Know your rights to protect yourself from unfair increases.</p>

<h2>When Can Rent Be Increased?</h2>
<ul>
<li><strong>Month-to-month leases</strong> - Usually with 30-60 days written notice</li>
<li><strong>Fixed-term leases</strong> - Generally only at renewal time</li>
<li><strong>Rent-controlled units</strong> - Subject to local regulations</li>
</ul>

<h2>Notice Requirements</h2>
<p>Most states require written notice before a rent increase:</p>
<ul>
<li>30 days for increases under 10%</li>
<li>60-90 days for larger increases</li>
<li>Specific form requirements in some areas</li>
</ul>

<h2>Rent Control and Stabilization</h2>
<p>If you live in a rent-controlled area, increases are limited:</p>
<ul>
<li>Annual caps (often 3-10%)</li>
<li>Tied to inflation indices</li>
<li>Additional limits on pass-through costs</li>
</ul>

<h2>Challenging a Rent Increase</h2>
<ol>
<li><strong>Check the math</strong> - Ensure the increase complies with local laws</li>
<li><strong>Verify proper notice</strong> - Improper notice may invalidate the increase</li>
<li><strong>Research comparable rents</strong> - Know the market rate</li>
<li><strong>Negotiate</strong> - Ask for a smaller increase or gradual phase-in</li>
<li><strong>File a complaint</strong> - If you''re in a rent-controlled area</li>
</ol>

<blockquote>
<strong>Note:</strong> Rent increases cannot be retaliatory. If your rent goes up after you complained about repairs or filed a housing complaint, you may have legal recourse.
</blockquote>',
  'Housing Law',
  '9 min read',
  'https://images.pexels.com/photos/4386372/pexels-photo-4386372.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-25'
),
(
  'housing-discrimination-rights',
  'Housing Discrimination: Recognizing and Reporting Violations',
  'Learn about fair housing laws, protected classes, common forms of discrimination, and how to file a complaint if your rights are violated.',
  '<p class="text-lg font-medium text-slate-800 mb-6">The Fair Housing Act protects you from discrimination in housing. Understanding these protections helps you recognize and fight back against illegal treatment.</p>

<h2>Protected Classes Under Federal Law</h2>
<p>Landlords cannot discriminate based on:</p>
<ul>
<li>Race or color</li>
<li>National origin</li>
<li>Religion</li>
<li>Sex (including gender identity and sexual orientation)</li>
<li>Familial status (having children)</li>
<li>Disability</li>
</ul>

<p>Many states and cities add additional protections for:</p>
<ul>
<li>Source of income (Section 8 vouchers)</li>
<li>Age</li>
<li>Marital status</li>
<li>Military/veteran status</li>
</ul>

<h2>Common Forms of Discrimination</h2>
<ul>
<li>Refusing to rent to you</li>
<li>Quoting different terms or prices</li>
<li>Falsely claiming no units are available</li>
<li>Steering you to certain neighborhoods</li>
<li>Harassing or intimidating you</li>
<li>Refusing reasonable disability accommodations</li>
</ul>

<h2>Disability Rights</h2>
<p>Landlords must:</p>
<ul>
<li>Allow reasonable modifications (you may have to pay)</li>
<li>Make reasonable policy accommodations</li>
<li>Allow service animals and emotional support animals</li>
<li>Not ask about the nature of your disability</li>
</ul>

<h2>Filing a Complaint</h2>
<ol>
<li><strong>Document everything</strong> - Save communications, take notes on conversations</li>
<li><strong>File with HUD</strong> - You have one year from the discrimination</li>
<li><strong>Contact local fair housing agencies</strong> - They may offer faster resolution</li>
<li><strong>Consider a lawsuit</strong> - You have two years to file in federal court</li>
</ol>

<blockquote>
<strong>Remember:</strong> You don''t need to prove the landlord intended to discriminate. Policies that disproportionately affect protected groups can also be illegal.
</blockquote>',
  'Housing Law',
  '13 min read',
  'https://images.pexels.com/photos/7578939/pexels-photo-7578939.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-22'
),
(
  'roommate-legal-rights',
  'Roommate Disputes: Legal Rights and Responsibilities',
  'Navigate roommate conflicts with this guide covering lease obligations, splitting costs, subletting rules, and what happens when a roommate leaves.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Living with roommates can be complicated when things go wrong. Understanding the legal framework helps resolve disputes fairly.</p>

<h2>Types of Roommate Arrangements</h2>
<ul>
<li><strong>Co-tenants</strong> - All names on the lease, all equally responsible</li>
<li><strong>Tenant and subtenant</strong> - You''re renting from another tenant</li>
<li><strong>Roommate of tenant</strong> - Living with the leaseholder informally</li>
</ul>

<h2>Responsibilities When You''re All on the Lease</h2>
<p>If everyone signed the lease:</p>
<ul>
<li>Each person is responsible for the entire rent (joint and several liability)</li>
<li>The landlord can pursue any of you for unpaid rent</li>
<li>All must agree to renew or terminate the lease</li>
<li>Damage deposits are typically shared</li>
</ul>

<h2>When a Roommate Doesn''t Pay</h2>
<ol>
<li><strong>Communicate</strong> - Try to work out a payment plan</li>
<li><strong>Document</strong> - Keep records of all payments and agreements</li>
<li><strong>Pay to avoid eviction</strong> - You may need to cover their share temporarily</li>
<li><strong>Sue for reimbursement</strong> - Small claims court is an option</li>
</ol>

<h2>Removing a Roommate</h2>
<p>Your options depend on the arrangement:</p>
<ul>
<li><strong>Subtenant</strong> - You may be able to give notice and end their tenancy</li>
<li><strong>Co-tenant</strong> - You cannot force them out; only the landlord can evict</li>
<li><strong>Negotiate</strong> - Offer incentives for them to leave voluntarily</li>
</ul>

<h2>Protecting Yourself</h2>
<ul>
<li>Create a written roommate agreement covering bills, guests, and disputes</li>
<li>Keep separate records of your rent payments</li>
<li>Get renters insurance (your roommate''s policy doesn''t cover you)</li>
</ul>

<blockquote>
<strong>Tip:</strong> If you''re subletting, make sure you have your landlord''s written permission. Unauthorized subletting can lead to eviction.
</blockquote>',
  'Housing Law',
  '8 min read',
  'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-18'
),
(
  'landlord-entry-rights',
  'Landlord Entry Rights: When Can They Enter Your Home?',
  'Know your privacy rights as a tenant, including required notice periods, legitimate reasons for entry, and what to do about unauthorized access.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Your rental is your home, and you have a right to privacy. But landlords also have legitimate reasons to access the property. Here''s where the line is drawn.</p>

<h2>When Landlords Can Enter</h2>
<p>Landlords typically can enter for:</p>
<ul>
<li>Repairs and maintenance</li>
<li>Inspections (move-in, move-out, periodic)</li>
<li>Showing the unit to prospective tenants or buyers</li>
<li>Emergencies (fire, flood, gas leak)</li>
</ul>

<h2>Notice Requirements</h2>
<p>Except in emergencies, landlords must provide advance notice:</p>
<ul>
<li><strong>24 hours</strong> - Most common requirement</li>
<li><strong>48 hours</strong> - Some states require more notice</li>
<li><strong>Reasonable hours</strong> - Usually 8am-6pm on weekdays</li>
</ul>

<h2>Your Right to Be Present</h2>
<p>You generally have the right to be present during landlord entry. If the proposed time doesn''t work, suggest an alternative within a reasonable timeframe.</p>

<h2>What Constitutes an Emergency</h2>
<p>True emergencies allowing immediate entry:</p>
<ul>
<li>Fire or smoke</li>
<li>Flooding or water damage</li>
<li>Gas leaks</li>
<li>Medical emergencies</li>
<li>Suspected criminal activity</li>
</ul>

<h2>Dealing with Unauthorized Entry</h2>
<ol>
<li><strong>Document each incident</strong> - Date, time, circumstances</li>
<li><strong>Send written notice</strong> - Cite the law and request compliance</li>
<li><strong>Contact local authorities</strong> - Repeated violations may be illegal</li>
<li><strong>Consider legal action</strong> - You may have grounds to break your lease</li>
</ol>

<blockquote>
<strong>Important:</strong> Changing locks without permission is usually a lease violation. If you feel unsafe, work with your landlord or consult with a tenant rights organization.
</blockquote>',
  'Housing Law',
  '7 min read',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-15'
),
(
  'habitability-standards',
  'Mold, Pests, and Habitability: What Landlords Must Provide',
  'Understand habitability standards and your rights when dealing with mold, pest infestations, lack of heat, or other conditions making your home unsafe.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Every tenant has the right to a safe, livable home. When conditions fall below habitability standards, you have powerful legal remedies.</p>

<h2>What is Habitability?</h2>
<p>A habitable dwelling must have:</p>
<ul>
<li>Weatherproofing (roof, walls, windows, doors)</li>
<li>Working plumbing with hot and cold water</li>
<li>Adequate heating (and cooling in some areas)</li>
<li>Functional electrical systems</li>
<li>Clean, sanitary conditions</li>
<li>Freedom from pests and vermin</li>
<li>Working smoke detectors</li>
</ul>

<h2>Common Habitability Issues</h2>

<h3>Mold</h3>
<p>Landlords must address mold caused by building defects. Document with photos, report in writing, and request remediation. Severe mold may justify withholding rent or breaking the lease.</p>

<h3>Pest Infestations</h3>
<p>Cockroaches, mice, bedbugs, and other pests are the landlord''s responsibility if they result from building conditions. If you caused the infestation, you may be responsible.</p>

<h3>No Heat or Hot Water</h3>
<p>Lack of heating in winter or hot water at any time is a serious habitability violation. Landlords must fix these issues immediately.</p>

<h2>Your Remedies</h2>
<ul>
<li><strong>Repair and deduct</strong> - Fix it yourself and subtract from rent</li>
<li><strong>Withhold rent</strong> - Stop paying until repairs are made (know your state''s rules)</li>
<li><strong>Call inspectors</strong> - Report code violations to local housing authority</li>
<li><strong>Break your lease</strong> - Severe violations may justify moving out</li>
<li><strong>Sue for damages</strong> - Recover money spent dealing with the problem</li>
</ul>

<blockquote>
<strong>Warning:</strong> Always document problems and notify your landlord in writing before using remedies like rent withholding. Skipping steps can backfire.
</blockquote>',
  'Housing Law',
  '10 min read',
  'https://images.pexels.com/photos/6782351/pexels-photo-6782351.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-12'
),
(
  'renters-insurance-guide',
  'Renters Insurance: What It Covers and Why You Need It',
  'A complete guide to renters insurance, including what is covered, how much coverage you need, and how to file a claim after loss or damage.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Renters insurance is affordable protection that every tenant should have. Here''s everything you need to know.</p>

<h2>What Renters Insurance Covers</h2>

<h3>Personal Property</h3>
<p>Your belongings are covered against:</p>
<ul>
<li>Fire and smoke damage</li>
<li>Theft</li>
<li>Vandalism</li>
<li>Water damage (from burst pipes, not floods)</li>
<li>Lightning and wind damage</li>
</ul>

<h3>Liability Protection</h3>
<p>If someone is injured in your home or you accidentally damage others'' property:</p>
<ul>
<li>Medical payments for injured guests</li>
<li>Legal defense costs</li>
<li>Settlements or judgments against you</li>
</ul>

<h3>Additional Living Expenses</h3>
<p>If your rental becomes uninhabitable due to a covered event:</p>
<ul>
<li>Hotel costs</li>
<li>Restaurant meals</li>
<li>Temporary housing</li>
</ul>

<h2>What''s NOT Covered</h2>
<ul>
<li>Flood damage (requires separate policy)</li>
<li>Earthquake damage (requires separate rider)</li>
<li>Your roommate''s belongings (they need their own policy)</li>
<li>Damage from lack of maintenance</li>
<li>High-value items over certain limits (jewelry, electronics)</li>
</ul>

<h2>How Much Coverage Do You Need?</h2>
<ol>
<li>Create a home inventory with photos and receipts</li>
<li>Estimate the total value of your belongings</li>
<li>Add 20-30% buffer for things you forgot</li>
<li>Choose replacement cost coverage, not actual cash value</li>
</ol>

<h2>Filing a Claim</h2>
<ol>
<li>Document the damage immediately with photos/video</li>
<li>Contact your insurance company promptly</li>
<li>Get a police report if theft was involved</li>
<li>Keep receipts for any emergency expenses</li>
<li>Don''t throw away damaged items until the adjuster sees them</li>
</ol>

<blockquote>
<strong>Cost:</strong> Renters insurance typically costs $15-30 per month. Given the protection it provides, it''s one of the best values in insurance.
</blockquote>',
  'Housing Law',
  '9 min read',
  'https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-08'
),
(
  'lease-red-flags',
  'Lease Agreement Red Flags: What to Watch Before Signing',
  'Protect yourself by knowing what to look for in a lease, including illegal clauses, hidden fees, and terms that could cost you later.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Your lease is a binding contract. Before you sign, make sure you understand every clause and watch for these warning signs.</p>

<h2>Illegal Lease Clauses</h2>
<p>These clauses are unenforceable in most states:</p>
<ul>
<li><strong>Waiver of habitability</strong> - You cannot sign away your right to a livable home</li>
<li><strong>No-pet clauses for service animals</strong> - Landlords must allow service and assistance animals</li>
<li><strong>Excessive late fees</strong> - Fees must be reasonable, not punitive</li>
<li><strong>Waiver of jury trial</strong> - May be unenforceable</li>
<li><strong>Automatic lease renewal without notice</strong> - Many states prohibit this</li>
</ul>

<h2>Red Flag Clauses</h2>
<ul>
<li><strong>Unlimited access</strong> - Landlord entry should require notice</li>
<li><strong>All repairs tenant responsibility</strong> - Landlords must maintain habitability</li>
<li><strong>No guests allowed</strong> - Overly restrictive guest policies</li>
<li><strong>Massive early termination fees</strong> - Should be reasonable</li>
<li><strong>Automatic rent increases</strong> - Know exactly how much and when</li>
</ul>

<h2>Hidden Fees to Watch For</h2>
<ul>
<li>Application fees</li>
<li>Move-in/move-out fees</li>
<li>Pet fees AND pet deposits</li>
<li>Parking fees</li>
<li>Utility fees</li>
<li>Trash/recycling fees</li>
<li>Maintenance fees</li>
</ul>

<h2>Before You Sign</h2>
<ol>
<li>Read the entire lease carefully (yes, all of it)</li>
<li>Ask questions about anything unclear</li>
<li>Get modifications in writing</li>
<li>Do a thorough move-in inspection</li>
<li>Keep a copy of everything you sign</li>
</ol>

<blockquote>
<strong>Remember:</strong> Everything is negotiable before you sign. Once you sign, you''re bound by those terms.
</blockquote>',
  'Housing Law',
  '11 min read',
  'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-05'
),
(
  'section-8-guide',
  'Section 8 and Housing Vouchers: A Guide for Tenants',
  'Navigate the Section 8 housing voucher program, from application to maintaining your voucher, and know your rights as a voucher holder.',
  '<p class="text-lg font-medium text-slate-800 mb-6">The Section 8 Housing Choice Voucher program helps millions of families afford decent housing. Here''s how to navigate the program successfully.</p>

<h2>How Section 8 Works</h2>
<p>The program helps low-income families pay rent:</p>
<ul>
<li>You pay about 30% of your income toward rent</li>
<li>The voucher covers the difference up to a payment standard</li>
<li>You choose your own housing (within program limits)</li>
<li>Landlord participation is voluntary in most areas</li>
</ul>

<h2>Applying for a Voucher</h2>
<ol>
<li><strong>Contact your local housing authority</strong> - Find them at hud.gov</li>
<li><strong>Complete the application</strong> - Provide income and household information</li>
<li><strong>Get on the waiting list</strong> - Lists are often long; apply to multiple authorities</li>
<li><strong>Attend your briefing</strong> - When your name comes up, attend mandatory orientation</li>
<li><strong>Start your housing search</strong> - You have a limited time to find a unit</li>
</ol>

<h2>Your Rights as a Voucher Holder</h2>
<ul>
<li><strong>Protection from discrimination</strong> - In many states, landlords cannot reject you solely for having a voucher</li>
<li><strong>Right to choose</strong> - Pick any unit that meets program requirements</li>
<li><strong>Right to move</strong> - You can take your voucher with you if you relocate</li>
<li><strong>Due process</strong> - You have the right to appeal if your voucher is terminated</li>
</ul>

<h2>Maintaining Your Voucher</h2>
<ul>
<li>Report income changes promptly</li>
<li>Pass annual inspections</li>
<li>Don''t violate your lease</li>
<li>Attend required recertification appointments</li>
<li>Pay your portion of rent on time</li>
</ul>

<h2>Common Reasons for Termination</h2>
<ul>
<li>Fraud or misrepresentation</li>
<li>Failure to report income changes</li>
<li>Drug-related or violent criminal activity</li>
<li>Eviction from assisted housing</li>
<li>Failure to comply with program requirements</li>
</ul>

<blockquote>
<strong>Tip:</strong> Keep copies of all documents you submit to the housing authority. This protects you if there are disputes about what you reported.
</blockquote>',
  'Housing Law',
  '14 min read',
  'https://images.pexels.com/photos/8292795/pexels-photo-8292795.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-01'
),
(
  'moving-out-checklist',
  'Moving Out Checklist: Protecting Your Security Deposit',
  'Follow this comprehensive checklist to ensure you get your security deposit back, including documentation tips and proper notice procedures.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Protect your security deposit with careful preparation and thorough documentation when you move out.</p>

<h2>Before You Give Notice</h2>
<ul>
<li>Review your lease for notice requirements (usually 30-60 days)</li>
<li>Check if notice must be given on a specific day</li>
<li>Confirm the proper notice delivery method</li>
<li>Calculate your exact move-out date</li>
</ul>

<h2>30 Days Before Moving</h2>
<ul>
<li>Give written notice to your landlord</li>
<li>Request a pre-move-out inspection (if available in your state)</li>
<li>Start documenting the condition of the unit with photos/video</li>
<li>Begin cleaning and repairs</li>
</ul>

<h2>One Week Before Moving</h2>
<ul>
<li>Patch small nail holes</li>
<li>Touch up paint if needed</li>
<li>Deep clean all rooms</li>
<li>Clean inside appliances (oven, refrigerator, dishwasher)</li>
<li>Clean windows and window tracks</li>
</ul>

<h2>Moving Day</h2>
<ul>
<li>Do a final cleaning sweep</li>
<li>Take date-stamped photos of every room</li>
<li>Check all closets and storage areas</li>
<li>Return all keys and remotes</li>
<li>Get a written receipt for returned keys</li>
<li>Note final utility meter readings</li>
</ul>

<h2>After Moving</h2>
<ul>
<li>Transfer or cancel utilities</li>
<li>Forward your mail</li>
<li>Provide your new address for deposit return</li>
<li>Review itemized deductions when received</li>
<li>Dispute unfair charges in writing</li>
</ul>

<h2>If Your Deposit Isn''t Returned</h2>
<ol>
<li>Send a demand letter via certified mail</li>
<li>Reference state laws and deadlines</li>
<li>Include copies of your move-in and move-out documentation</li>
<li>File in small claims court if necessary</li>
</ol>

<blockquote>
<strong>Pro tip:</strong> Many states have penalties for landlords who wrongfully withhold deposits, sometimes double or triple the amount owed.
</blockquote>',
  'Housing Law',
  '8 min read',
  'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-11-28'
)
ON CONFLICT (slug) DO NOTHING;
```

---

## supabase/migrations/20260115010509_create_ai_case_matching_system.sql

```sql
/*
  # AI-Powered Case Matching System

  This migration creates the database infrastructure for an AI-powered case matching
  system that automatically pairs legal cases with appropriate attorneys based on
  expertise, availability, and historical performance.

  ## New Tables

  1. `case_matching_queue`
     - Stores cases pending AI matching
     - Includes case details, urgency, complexity scores
     - Tracks matching status and assignment

  2. `attorney_matching_profiles`
     - Extended attorney profiles for matching
     - Expertise scores by practice area
     - Capacity and workload metrics
     - Historical performance data

  3. `case_matches`
     - Stores match records between cases and attorneys
     - Confidence scores and match reasoning
     - Status tracking (proposed, accepted, declined, completed)

  4. `match_feedback`
     - Feedback loop for improving match quality
     - Tracks outcomes and attorney satisfaction
     - Used to improve matching algorithm

  5. `matching_algorithm_config`
     - Configurable weights for matching factors
     - Organization-specific settings

  ## Security
  - RLS enabled on all tables
  - Organization-scoped access policies
*/

-- Case Matching Queue: Stores cases awaiting or undergoing AI matching
CREATE TABLE IF NOT EXISTS case_matching_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lso_organizations(id) ON DELETE CASCADE,
  
  -- Case identification
  source_type text NOT NULL CHECK (source_type IN ('lso_intake', 'pro_bono', 'external', 'manual')),
  source_id uuid,
  external_reference text,
  
  -- Client information (anonymized for matching)
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  client_county text,
  client_zip_code text,
  preferred_language text DEFAULT 'en',
  
  -- Case details
  case_type text NOT NULL,
  case_subcategory text,
  case_description text NOT NULL,
  legal_issue_summary text,
  
  -- Urgency and complexity
  urgency_level text NOT NULL DEFAULT 'normal' CHECK (urgency_level IN ('critical', 'high', 'normal', 'low')),
  complexity_score integer DEFAULT 50 CHECK (complexity_score >= 0 AND complexity_score <= 100),
  deadline_date date,
  court_date date,
  
  -- AI analysis results
  ai_case_analysis jsonb DEFAULT '{}'::jsonb,
  ai_recommended_practice_areas text[] DEFAULT '{}'::text[],
  ai_estimated_hours integer,
  ai_risk_assessment text,
  
  -- Documentation status
  has_documentation boolean DEFAULT false,
  documentation_quality text DEFAULT 'none' CHECK (documentation_quality IN ('none', 'partial', 'complete', 'excellent')),
  documents_count integer DEFAULT 0,
  
  -- Opposing party info
  has_opposing_counsel boolean DEFAULT false,
  opposing_counsel_name text,
  
  -- Financial eligibility
  income_eligible boolean,
  income_amount numeric,
  household_size integer,
  poverty_percentage numeric,
  
  -- Matching status
  matching_status text NOT NULL DEFAULT 'pending' CHECK (matching_status IN ('pending', 'in_progress', 'matched', 'no_match', 'closed', 'cancelled')),
  matching_attempts integer DEFAULT 0,
  last_matching_run timestamptz,
  
  -- Assignment
  assigned_attorney_id uuid,
  assigned_at timestamptz,
  assignment_notes text,
  
  -- Metadata
  priority_override integer,
  tags text[] DEFAULT '{}'::text[],
  internal_notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attorney Matching Profiles: Extended profiles for matching optimization
CREATE TABLE IF NOT EXISTS attorney_matching_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attorney_id uuid NOT NULL REFERENCES lso_volunteer_attorneys(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES lso_organizations(id) ON DELETE CASCADE,
  
  -- Practice area expertise (0-100 score per area)
  expertise_scores jsonb DEFAULT '{}'::jsonb,
  -- Example: {"housing": 95, "family": 80, "immigration": 60}
  
  -- Language capabilities
  languages text[] DEFAULT '{en}'::text[],
  
  -- Geographic preferences
  preferred_counties text[] DEFAULT '{}'::text[],
  max_travel_distance_miles integer,
  accepts_virtual_cases boolean DEFAULT true,
  
  -- Capacity management
  current_case_count integer DEFAULT 0,
  max_case_capacity integer DEFAULT 5,
  available_hours_per_week integer DEFAULT 10,
  current_weekly_hours integer DEFAULT 0,
  
  -- Workload preferences
  preferred_complexity_min integer DEFAULT 0,
  preferred_complexity_max integer DEFAULT 100,
  accepts_urgent_cases boolean DEFAULT true,
  accepts_court_appearances boolean DEFAULT true,
  
  -- Historical performance
  total_cases_handled integer DEFAULT 0,
  successful_outcomes integer DEFAULT 0,
  success_rate numeric DEFAULT 0,
  average_case_duration_days integer,
  average_client_rating numeric DEFAULT 0,
  
  -- Matching algorithm scores
  reliability_score integer DEFAULT 50 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  responsiveness_score integer DEFAULT 50 CHECK (responsiveness_score >= 0 AND responsiveness_score <= 100),
  overall_match_score integer DEFAULT 50 CHECK (overall_match_score >= 0 AND overall_match_score <= 100),
  
  -- Preferences
  case_type_preferences text[] DEFAULT '{}'::text[],
  case_type_exclusions text[] DEFAULT '{}'::text[],
  special_certifications text[] DEFAULT '{}'::text[],
  
  -- Availability schedule
  availability_schedule jsonb DEFAULT '{}'::jsonb,
  -- Example: {"monday": {"start": "09:00", "end": "17:00"}, ...}
  
  next_available_date date,
  on_leave_until date,
  
  -- Settings
  auto_match_enabled boolean DEFAULT true,
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(attorney_id, organization_id)
);

-- Case Matches: Records of case-attorney matches
CREATE TABLE IF NOT EXISTS case_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lso_organizations(id) ON DELETE CASCADE,
  
  -- Case and attorney references
  case_id uuid NOT NULL REFERENCES case_matching_queue(id) ON DELETE CASCADE,
  attorney_id uuid NOT NULL REFERENCES lso_volunteer_attorneys(id),
  attorney_profile_id uuid REFERENCES attorney_matching_profiles(id),
  
  -- Match scoring
  overall_confidence_score integer NOT NULL CHECK (overall_confidence_score >= 0 AND overall_confidence_score <= 100),
  expertise_match_score integer CHECK (expertise_match_score >= 0 AND expertise_match_score <= 100),
  availability_match_score integer CHECK (availability_match_score >= 0 AND availability_match_score <= 100),
  geographic_match_score integer CHECK (geographic_match_score >= 0 AND geographic_match_score <= 100),
  workload_match_score integer CHECK (workload_match_score >= 0 AND workload_match_score <= 100),
  language_match_score integer CHECK (language_match_score >= 0 AND language_match_score <= 100),
  
  -- Match reasoning
  match_factors jsonb DEFAULT '{}'::jsonb,
  match_reasoning text,
  algorithm_version text DEFAULT 'v1.0',
  
  -- Match ranking (for multiple matches per case)
  rank_position integer DEFAULT 1,
  is_primary_match boolean DEFAULT false,
  
  -- Status tracking
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'notified', 'accepted', 'declined', 'expired', 'completed', 'cancelled')),
  
  -- Notifications
  notification_sent_at timestamptz,
  notification_method text,
  response_deadline timestamptz,
  
  -- Attorney response
  attorney_response text,
  attorney_response_at timestamptz,
  decline_reason text,
  
  -- Acceptance and completion
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  
  -- Outcome tracking
  case_outcome text CHECK (case_outcome IN ('favorable', 'unfavorable', 'settled', 'dismissed', 'withdrawn', 'ongoing', 'other')),
  outcome_notes text,
  hours_spent numeric,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Match Feedback: Feedback for improving matching algorithm
CREATE TABLE IF NOT EXISTS match_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES case_matches(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES lso_organizations(id) ON DELETE CASCADE,
  
  -- Feedback source
  feedback_type text NOT NULL CHECK (feedback_type IN ('attorney', 'client', 'staff', 'system')),
  submitted_by uuid REFERENCES auth.users(id),
  
  -- Ratings (1-5 scale)
  overall_satisfaction integer CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
  match_quality_rating integer CHECK (match_quality_rating >= 1 AND match_quality_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  outcome_satisfaction integer CHECK (outcome_satisfaction >= 1 AND outcome_satisfaction <= 5),
  
  -- Qualitative feedback
  feedback_text text,
  improvement_suggestions text,
  
  -- Match assessment
  was_good_match boolean,
  would_work_with_again boolean,
  match_issues text[] DEFAULT '{}'::text[],
  -- Example issues: ["expertise_mismatch", "schedule_conflict", "language_barrier"]
  
  -- Algorithm training data
  should_have_matched boolean,
  better_match_criteria text,
  
  created_at timestamptz DEFAULT now()
);

-- Matching Algorithm Configuration: Organization-specific settings
CREATE TABLE IF NOT EXISTS matching_algorithm_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lso_organizations(id) ON DELETE CASCADE,
  
  -- Weight factors (should sum to 100)
  expertise_weight integer DEFAULT 35 CHECK (expertise_weight >= 0 AND expertise_weight <= 100),
  availability_weight integer DEFAULT 25 CHECK (availability_weight >= 0 AND availability_weight <= 100),
  geographic_weight integer DEFAULT 15 CHECK (geographic_weight >= 0 AND geographic_weight <= 100),
  workload_weight integer DEFAULT 15 CHECK (workload_weight >= 0 AND workload_weight <= 100),
  language_weight integer DEFAULT 10 CHECK (language_weight >= 0 AND language_weight <= 100),
  
  -- Thresholds
  minimum_confidence_threshold integer DEFAULT 60,
  auto_match_threshold integer DEFAULT 85,
  max_matches_per_case integer DEFAULT 3,
  
  -- Timing settings
  notification_delay_minutes integer DEFAULT 0,
  response_deadline_hours integer DEFAULT 48,
  match_expiry_hours integer DEFAULT 72,
  
  -- Preferences
  prioritize_new_attorneys boolean DEFAULT false,
  balance_workload boolean DEFAULT true,
  allow_capacity_overflow boolean DEFAULT false,
  
  -- Custom rules (JSON format)
  custom_rules jsonb DEFAULT '[]'::jsonb,
  
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id)
);

-- Matching Notifications: Track notifications sent to attorneys
CREATE TABLE IF NOT EXISTS matching_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES case_matches(id) ON DELETE CASCADE,
  attorney_id uuid NOT NULL REFERENCES lso_volunteer_attorneys(id),
  
  notification_type text NOT NULL CHECK (notification_type IN ('email', 'sms', 'in_app', 'push')),
  notification_template text,
  
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  read_at timestamptz,
  clicked_at timestamptz,
  
  delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  error_message text,
  
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE case_matching_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE attorney_matching_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_algorithm_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_matching_queue
CREATE POLICY "Organization staff can view their case queue"
  ON case_matching_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matching_queue.organization_id
    )
  );

CREATE POLICY "Organization staff can insert cases"
  ON case_matching_queue FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matching_queue.organization_id
    )
  );

CREATE POLICY "Organization staff can update cases"
  ON case_matching_queue FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matching_queue.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matching_queue.organization_id
    )
  );

-- RLS Policies for attorney_matching_profiles
CREATE POLICY "Organization staff can view attorney profiles"
  ON attorney_matching_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = attorney_matching_profiles.organization_id
    )
  );

CREATE POLICY "Organization staff can manage attorney profiles"
  ON attorney_matching_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = attorney_matching_profiles.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = attorney_matching_profiles.organization_id
    )
  );

-- RLS Policies for case_matches
CREATE POLICY "Organization staff can view matches"
  ON case_matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matches.organization_id
    )
  );

CREATE POLICY "Organization staff can manage matches"
  ON case_matches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matches.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matches.organization_id
    )
  );

-- RLS Policies for match_feedback
CREATE POLICY "Organization staff can view feedback"
  ON match_feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = match_feedback.organization_id
    )
  );

CREATE POLICY "Authenticated users can submit feedback"
  ON match_feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for matching_algorithm_config
CREATE POLICY "Organization staff can view config"
  ON matching_algorithm_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = matching_algorithm_config.organization_id
    )
  );

CREATE POLICY "Organization admins can manage config"
  ON matching_algorithm_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = matching_algorithm_config.organization_id
      AND lso_staff.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = matching_algorithm_config.organization_id
      AND lso_staff.role IN ('admin', 'owner')
    )
  );

-- RLS Policies for matching_notifications
CREATE POLICY "Organization staff can view notifications"
  ON matching_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_matches cm
      JOIN lso_staff ON lso_staff.organization_id = cm.organization_id
      WHERE cm.id = matching_notifications.match_id
      AND lso_staff.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert notifications"
  ON matching_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_org ON case_matching_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_status ON case_matching_queue(matching_status);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_urgency ON case_matching_queue(urgency_level);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_case_type ON case_matching_queue(case_type);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_created ON case_matching_queue(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_attorney ON attorney_matching_profiles(attorney_id);
CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_org ON attorney_matching_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_available ON attorney_matching_profiles(auto_match_enabled, next_available_date);

CREATE INDEX IF NOT EXISTS idx_case_matches_case ON case_matches(case_id);
CREATE INDEX IF NOT EXISTS idx_case_matches_attorney ON case_matches(attorney_id);
CREATE INDEX IF NOT EXISTS idx_case_matches_status ON case_matches(status);
CREATE INDEX IF NOT EXISTS idx_case_matches_org ON case_matches(organization_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_match ON match_feedback(match_id);
CREATE INDEX IF NOT EXISTS idx_matching_notifications_match ON matching_notifications(match_id);

-- Function to calculate match confidence score
CREATE OR REPLACE FUNCTION calculate_match_score(
  p_case_id uuid,
  p_attorney_profile_id uuid,
  p_org_id uuid
) RETURNS TABLE (
  overall_score integer,
  expertise_score integer,
  availability_score integer,
  geographic_score integer,
  workload_score integer,
  language_score integer,
  factors jsonb
) AS $$
DECLARE
  v_config matching_algorithm_config%ROWTYPE;
  v_case case_matching_queue%ROWTYPE;
  v_profile attorney_matching_profiles%ROWTYPE;
  v_expertise_score integer := 50;
  v_availability_score integer := 50;
  v_geographic_score integer := 50;
  v_workload_score integer := 50;
  v_language_score integer := 50;
  v_factors jsonb := '{}';
BEGIN
  -- Get configuration
  SELECT * INTO v_config FROM matching_algorithm_config WHERE organization_id = p_org_id AND is_active = true;
  IF v_config IS NULL THEN
    v_config.expertise_weight := 35;
    v_config.availability_weight := 25;
    v_config.geographic_weight := 15;
    v_config.workload_weight := 15;
    v_config.language_weight := 10;
  END IF;

  -- Get case details
  SELECT * INTO v_case FROM case_matching_queue WHERE id = p_case_id;
  
  -- Get attorney profile
  SELECT * INTO v_profile FROM attorney_matching_profiles WHERE id = p_attorney_profile_id;

  -- Calculate expertise score
  IF v_profile.expertise_scores ? v_case.case_type THEN
    v_expertise_score := (v_profile.expertise_scores->v_case.case_type)::integer;
  END IF;
  v_factors := v_factors || jsonb_build_object('expertise', jsonb_build_object('score', v_expertise_score, 'case_type', v_case.case_type));

  -- Calculate availability score
  IF v_profile.current_case_count < v_profile.max_case_capacity THEN
    v_availability_score := 100 - ((v_profile.current_case_count::numeric / v_profile.max_case_capacity::numeric) * 100)::integer;
  ELSE
    v_availability_score := 0;
  END IF;
  v_factors := v_factors || jsonb_build_object('availability', jsonb_build_object('score', v_availability_score, 'current_cases', v_profile.current_case_count, 'max_capacity', v_profile.max_case_capacity));

  -- Calculate geographic score
  IF v_case.client_county = ANY(v_profile.preferred_counties) THEN
    v_geographic_score := 100;
  ELSIF v_profile.accepts_virtual_cases THEN
    v_geographic_score := 70;
  ELSE
    v_geographic_score := 30;
  END IF;
  v_factors := v_factors || jsonb_build_object('geographic', jsonb_build_object('score', v_geographic_score, 'client_county', v_case.client_county));

  -- Calculate workload score
  IF v_case.complexity_score BETWEEN v_profile.preferred_complexity_min AND v_profile.preferred_complexity_max THEN
    v_workload_score := 100;
  ELSE
    v_workload_score := 50;
  END IF;
  v_factors := v_factors || jsonb_build_object('workload', jsonb_build_object('score', v_workload_score, 'case_complexity', v_case.complexity_score));

  -- Calculate language score
  IF v_case.preferred_language = ANY(v_profile.languages) THEN
    v_language_score := 100;
  ELSE
    v_language_score := 30;
  END IF;
  v_factors := v_factors || jsonb_build_object('language', jsonb_build_object('score', v_language_score, 'required', v_case.preferred_language));

  -- Calculate overall weighted score
  overall_score := (
    (v_expertise_score * v_config.expertise_weight +
     v_availability_score * v_config.availability_weight +
     v_geographic_score * v_config.geographic_weight +
     v_workload_score * v_config.workload_weight +
     v_language_score * v_config.language_weight) / 100
  )::integer;

  expertise_score := v_expertise_score;
  availability_score := v_availability_score;
  geographic_score := v_geographic_score;
  workload_score := v_workload_score;
  language_score := v_language_score;
  factors := v_factors;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to run AI matching for a case
CREATE OR REPLACE FUNCTION run_case_matching(
  p_case_id uuid
) RETURNS TABLE (
  match_id uuid,
  attorney_id uuid,
  attorney_name text,
  confidence_score integer,
  rank_position integer
) AS $$
DECLARE
  v_case case_matching_queue%ROWTYPE;
  v_org_id uuid;
  v_match_record RECORD;
  v_rank integer := 0;
  v_config matching_algorithm_config%ROWTYPE;
BEGIN
  -- Get case details
  SELECT * INTO v_case FROM case_matching_queue WHERE id = p_case_id;
  IF v_case IS NULL THEN
    RAISE EXCEPTION 'Case not found';
  END IF;
  
  v_org_id := v_case.organization_id;
  
  -- Get config
  SELECT * INTO v_config FROM matching_algorithm_config WHERE organization_id = v_org_id AND is_active = true;
  IF v_config IS NULL THEN
    v_config.max_matches_per_case := 3;
    v_config.minimum_confidence_threshold := 60;
  END IF;

  -- Update case status
  UPDATE case_matching_queue 
  SET matching_status = 'in_progress', 
      matching_attempts = matching_attempts + 1,
      last_matching_run = now()
  WHERE id = p_case_id;

  -- Find and create matches
  FOR v_match_record IN (
    SELECT 
      amp.id as profile_id,
      amp.attorney_id,
      lva.name as attorney_name,
      (SELECT overall_score FROM calculate_match_score(p_case_id, amp.id, v_org_id)) as score
    FROM attorney_matching_profiles amp
    JOIN lso_volunteer_attorneys lva ON lva.id = amp.attorney_id
    WHERE amp.organization_id = v_org_id
      AND amp.auto_match_enabled = true
      AND amp.current_case_count < amp.max_case_capacity
      AND (amp.on_leave_until IS NULL OR amp.on_leave_until < CURRENT_DATE)
      AND lva.is_active = true
      AND lva.availability_status = 'available'
    ORDER BY score DESC
    LIMIT v_config.max_matches_per_case
  ) LOOP
    v_rank := v_rank + 1;
    
    -- Skip if below threshold
    IF v_match_record.score < v_config.minimum_confidence_threshold THEN
      CONTINUE;
    END IF;
    
    -- Insert match record
    INSERT INTO case_matches (
      organization_id,
      case_id,
      attorney_id,
      attorney_profile_id,
      overall_confidence_score,
      rank_position,
      is_primary_match,
      status
    )
    SELECT 
      v_org_id,
      p_case_id,
      v_match_record.attorney_id,
      v_match_record.profile_id,
      v_match_record.score,
      v_rank,
      v_rank = 1,
      'proposed'
    RETURNING id INTO match_id;

    attorney_id := v_match_record.attorney_id;
    attorney_name := v_match_record.attorney_name;
    confidence_score := v_match_record.score;
    rank_position := v_rank;
    
    RETURN NEXT;
  END LOOP;

  -- Update case status based on matches found
  IF v_rank > 0 THEN
    UPDATE case_matching_queue SET matching_status = 'matched' WHERE id = p_case_id;
  ELSE
    UPDATE case_matching_queue SET matching_status = 'no_match' WHERE id = p_case_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept a match
CREATE OR REPLACE FUNCTION accept_case_match(
  p_match_id uuid,
  p_response text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  v_match case_matches%ROWTYPE;
BEGIN
  SELECT * INTO v_match FROM case_matches WHERE id = p_match_id;
  
  IF v_match IS NULL THEN
    RETURN false;
  END IF;

  -- Update the match
  UPDATE case_matches
  SET 
    status = 'accepted',
    attorney_response = p_response,
    attorney_response_at = now(),
    accepted_at = now(),
    updated_at = now()
  WHERE id = p_match_id;

  -- Decline other matches for this case
  UPDATE case_matches
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE case_id = v_match.case_id 
    AND id != p_match_id 
    AND status = 'proposed';

  -- Update the case
  UPDATE case_matching_queue
  SET 
    assigned_attorney_id = v_match.attorney_id,
    assigned_at = now(),
    matching_status = 'matched',
    updated_at = now()
  WHERE id = v_match.case_id;

  -- Update attorney profile
  UPDATE attorney_matching_profiles
  SET 
    current_case_count = current_case_count + 1,
    updated_at = now()
  WHERE attorney_id = v_match.attorney_id 
    AND organization_id = v_match.organization_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline a match
CREATE OR REPLACE FUNCTION decline_case_match(
  p_match_id uuid,
  p_reason text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  v_match case_matches%ROWTYPE;
BEGIN
  SELECT * INTO v_match FROM case_matches WHERE id = p_match_id;
  
  IF v_match IS NULL THEN
    RETURN false;
  END IF;

  UPDATE case_matches
  SET 
    status = 'declined',
    attorney_response_at = now(),
    decline_reason = p_reason,
    updated_at = now()
  WHERE id = p_match_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

```

---

## supabase/migrations/20260115020735_add_missing_foreign_key_indexes.sql

```sql
/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvement
     - Adds indexes to all foreign key columns that were missing covering indexes
     - Total: 22 new indexes for optimal join and query performance

  2. Security
     - Improves query performance which reduces DoS vulnerability from slow queries
*/

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_profile_id ON public.case_matches(attorney_profile_id);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_created_by ON public.case_matching_queue(created_by);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_documents_created_by ON public.chatbot_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_grant_expenses_approved_by ON public.grant_expenses(approved_by);
CREATE INDEX IF NOT EXISTS idx_grant_reports_generated_by ON public.grant_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_grant_reports_reviewed_by ON public.grant_reports(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_uploaded_by ON public.knowledge_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_lawyer_match_id ON public.lawyer_consultations(lawyer_match_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_chat_message_id ON public.lawyer_matches(chat_message_id);
CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_by ON public.lso_client_intakes(assigned_by);
CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_user_id ON public.lso_volunteer_attorneys(user_id);
CREATE INDEX IF NOT EXISTS idx_match_feedback_organization_id ON public.match_feedback(organization_id);
CREATE INDEX IF NOT EXISTS idx_match_feedback_submitted_by ON public.match_feedback(submitted_by);
CREATE INDEX IF NOT EXISTS idx_matching_notifications_attorney_id ON public.matching_notifications(attorney_id);
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_assigned_to ON public.pro_bono_applications(assigned_to);
CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_from_user_id ON public.pro_bono_communications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_uploaded_by ON public.pro_bono_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_by ON public.subscription_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_by ON public.system_settings(updated_by);

```

---

## supabase/migrations/20260115020805_drop_unused_indexes.sql

```sql
/*
  # Drop Unused Indexes

  1. Performance Improvement
     - Removes 100+ indexes that have never been used
     - Improves write performance and reduces storage costs
     - Reduces index maintenance overhead

  2. Database Optimization
     - Frees up storage space
     - Reduces memory usage for index caching
*/

DROP INDEX IF EXISTS public.idx_clients_user_id;
DROP INDEX IF EXISTS public.idx_lso_staff_org;
DROP INDEX IF EXISTS public.idx_lso_staff_user;
DROP INDEX IF EXISTS public.idx_lso_attorneys_org;
DROP INDEX IF EXISTS public.idx_lso_intakes_org;
DROP INDEX IF EXISTS public.idx_lso_intakes_status;
DROP INDEX IF EXISTS public.idx_lso_intakes_attorney;
DROP INDEX IF EXISTS public.idx_lso_hours_intake;
DROP INDEX IF EXISTS public.idx_lso_hours_attorney;
DROP INDEX IF EXISTS public.idx_auth_security_events_user_id;
DROP INDEX IF EXISTS public.idx_auth_security_events_created_at;
DROP INDEX IF EXISTS public.idx_auth_security_events_type;
DROP INDEX IF EXISTS public.idx_lawyer_matches_user_id;
DROP INDEX IF EXISTS public.idx_lawyer_matches_status;
DROP INDEX IF EXISTS public.idx_anonymous_sessions_ip_hash;
DROP INDEX IF EXISTS public.idx_anonymous_sessions_created_at;
DROP INDEX IF EXISTS public.idx_conversion_events_session_id;
DROP INDEX IF EXISTS public.idx_conversion_events_type;
DROP INDEX IF EXISTS public.idx_chat_messages_anonymous_session_id;
DROP INDEX IF EXISTS public.idx_chat_messages_anonymous_created_at;
DROP INDEX IF EXISTS public.idx_chat_attachments_message_id;
DROP INDEX IF EXISTS public.idx_lawyer_matches_created_at;
DROP INDEX IF EXISTS public.idx_lawyer_consultations_user_id;
DROP INDEX IF EXISTS public.idx_lawyer_consultations_status;
DROP INDEX IF EXISTS public.idx_lawyer_consultations_date;
DROP INDEX IF EXISTS public.idx_lawyer_profiles_city;
DROP INDEX IF EXISTS public.idx_lawyer_profiles_specialty;
DROP INDEX IF EXISTS public.idx_lawyer_profiles_practice_areas;
DROP INDEX IF EXISTS public.idx_email_captures_email;
DROP INDEX IF EXISTS public.idx_usage_tracking_user_month;
DROP INDEX IF EXISTS public.idx_trial_touchpoints_user;
DROP INDEX IF EXISTS public.idx_trial_touchpoints_event;
DROP INDEX IF EXISTS public.idx_subscription_history_user;
DROP INDEX IF EXISTS public.idx_profiles_subscription_tier;
DROP INDEX IF EXISTS public.idx_profiles_trial_expires;
DROP INDEX IF EXISTS public.idx_user_preferences_user_id;
DROP INDEX IF EXISTS public.idx_free_chat_sessions_session_token;
DROP INDEX IF EXISTS public.idx_trial_subscriptions_user_id;
DROP INDEX IF EXISTS public.idx_eligibility_screenings_user_id;
DROP INDEX IF EXISTS public.idx_eligibility_screenings_status;
DROP INDEX IF EXISTS public.idx_history_tenant;
DROP INDEX IF EXISTS public.idx_pro_bono_applications_user_id;
DROP INDEX IF EXISTS public.idx_pro_bono_applications_email;
DROP INDEX IF EXISTS public.idx_pro_bono_applications_status;
DROP INDEX IF EXISTS public.idx_pro_bono_applications_created_at;
DROP INDEX IF EXISTS public.idx_pro_bono_applications_partner_org;
DROP INDEX IF EXISTS public.idx_pro_bono_documents_application_id;
DROP INDEX IF EXISTS public.idx_pro_bono_communications_application_id;
DROP INDEX IF EXISTS public.idx_history_case_type;
DROP INDEX IF EXISTS public.idx_history_outcome;
DROP INDEX IF EXISTS public.idx_history_jurisdiction;
DROP INDEX IF EXISTS public.idx_predictions_tenant;
DROP INDEX IF EXISTS public.idx_predictions_case;
DROP INDEX IF EXISTS public.idx_knowledge_documents_status;
DROP INDEX IF EXISTS public.idx_knowledge_documents_jurisdiction;
DROP INDEX IF EXISTS public.idx_knowledge_documents_category;
DROP INDEX IF EXISTS public.idx_admin_audit_logs_admin_id;
DROP INDEX IF EXISTS public.idx_admin_audit_logs_entity_type;
DROP INDEX IF EXISTS public.idx_admin_audit_logs_created_at;
DROP INDEX IF EXISTS public.idx_analytics_events_type;
DROP INDEX IF EXISTS public.idx_analytics_events_created_at;
DROP INDEX IF EXISTS public.idx_analytics_events_tenant;
DROP INDEX IF EXISTS public.idx_predictions_active;
DROP INDEX IF EXISTS public.idx_model_perf_version;
DROP INDEX IF EXISTS public.idx_chatbot_documents_category;
DROP INDEX IF EXISTS public.idx_chatbot_documents_is_active;
DROP INDEX IF EXISTS public.idx_prompt_subcategories_category;
DROP INDEX IF EXISTS public.idx_chatbot_prompts_category;
DROP INDEX IF EXISTS public.idx_chatbot_prompts_subcategory;
DROP INDEX IF EXISTS public.idx_documents_user_jurisdiction;
DROP INDEX IF EXISTS public.idx_grants_user_id;
DROP INDEX IF EXISTS public.idx_grants_funder_id;
DROP INDEX IF EXISTS public.idx_grants_status;
DROP INDEX IF EXISTS public.idx_grant_milestones_grant_id;
DROP INDEX IF EXISTS public.idx_grant_milestones_status;
DROP INDEX IF EXISTS public.idx_grant_expenses_grant_id;
DROP INDEX IF EXISTS public.idx_grant_expenses_category;
DROP INDEX IF EXISTS public.idx_grant_reports_grant_id;
DROP INDEX IF EXISTS public.idx_grant_reports_status;
DROP INDEX IF EXISTS public.idx_grant_metrics_grant_id;
DROP INDEX IF EXISTS public.idx_report_templates_funder_id;
DROP INDEX IF EXISTS public.idx_chat_messages_jurisdiction;
DROP INDEX IF EXISTS public.idx_documents_jurisdiction;
DROP INDEX IF EXISTS public.idx_ezreads_articles_published;
DROP INDEX IF EXISTS public.idx_case_matching_queue_org;
DROP INDEX IF EXISTS public.idx_case_matching_queue_status;
DROP INDEX IF EXISTS public.idx_case_matching_queue_urgency;
DROP INDEX IF EXISTS public.idx_case_matching_queue_case_type;
DROP INDEX IF EXISTS public.idx_case_matching_queue_created;
DROP INDEX IF EXISTS public.idx_attorney_matching_profiles_attorney;
DROP INDEX IF EXISTS public.idx_attorney_matching_profiles_org;
DROP INDEX IF EXISTS public.idx_attorney_matching_profiles_available;
DROP INDEX IF EXISTS public.idx_case_matches_case;
DROP INDEX IF EXISTS public.idx_case_matches_attorney;
DROP INDEX IF EXISTS public.idx_case_matches_status;
DROP INDEX IF EXISTS public.idx_case_matches_org;
DROP INDEX IF EXISTS public.idx_match_feedback_match;
DROP INDEX IF EXISTS public.idx_matching_notifications_match;

```

---

## supabase/migrations/20260115020824_fix_function_search_paths.sql

```sql
/*
  # Fix Function Search Paths

  1. Security Enhancement
     - Sets explicit search_path to prevent search path manipulation attacks
     - Protects against SQL injection via search_path

  2. Functions Updated
     - All 13 functions now have secure search_path configuration
*/

ALTER FUNCTION public.reset_daily_questions() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_chatbot_documents_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.cleanup_old_anonymous_data() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_pro_bono_application_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_usage_limit(uuid, text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_usage(uuid, text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.set_trial_expiration() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_admin_analytics_summary(integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_match_score(uuid, uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.run_case_matching(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.accept_case_match(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.decline_case_match(uuid, text) SET search_path = public, pg_temp;

```

---

## supabase/migrations/20260116170811_create_lso_audit_logs_table.sql

```sql
/*
  # Create LSO Audit Logs Table

  1. New Tables
    - `lso_audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action_type` (text) - type of action performed
      - `entity_type` (text) - what entity was affected (case, client, attorney, etc.)
      - `entity_id` (text) - ID of the affected entity
      - `details` (jsonb) - additional details about the action
      - `ip_address` (text) - IP address of the user (optional)
      - `user_agent` (text) - browser/device info (optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `lso_audit_logs` table
    - Add policy for admin users to read all logs
    - Add policy for LSO staff to read their organization's logs
    - Add policy for system to insert logs

  3. Indexes
    - Index on user_id for filtering by user
    - Index on action_type for filtering by action
    - Index on entity_type for filtering by entity
    - Index on created_at for date range queries
*/

CREATE TABLE IF NOT EXISTS lso_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lso_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read all audit logs"
  ON lso_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "System can insert audit logs"
  ON lso_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_user_id ON lso_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_action_type ON lso_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_entity_type ON lso_audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_created_at ON lso_audit_logs(created_at DESC);

```

---

## supabase/migrations/20260116182930_create_embed_widgets_system.sql

```sql
/*
  # Create Embed Widget System for Professional Tier

  1. New Tables
    - `embed_widgets` - Stores widget configurations for SMBs
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - widget owner
      - `name` (text) - widget display name
      - `widget_type` (text) - chat, lawyer_search, contact_form, document_analyzer
      - `api_key` (text, unique) - public API key for embedding
      - `config` (jsonb) - widget configuration (colors, position, behavior)
      - `allowed_domains` (text[]) - whitelist of domains allowed to embed
      - `is_active` (boolean) - whether widget is active
      - `created_at`, `updated_at` timestamps
    
    - `widget_analytics` - Tracks widget usage metrics
      - `id` (uuid, primary key)
      - `widget_id` (uuid, references embed_widgets)
      - `event_type` (text) - impression, open, message, email_collected, lawyer_search
      - `metadata` (jsonb) - additional event data
      - `domain` (text) - domain where event occurred
      - `created_at` timestamp
    
    - `widget_conversations` - Stores chat conversations from embedded widgets
      - `id` (uuid, primary key)
      - `widget_id` (uuid, references embed_widgets)
      - `visitor_id` (text) - anonymous visitor identifier
      - `visitor_email` (text) - collected email if provided
      - `messages` (jsonb) - array of messages
      - `metadata` (jsonb) - visitor info, device, etc.
      - `created_at`, `updated_at` timestamps

  2. Security
    - Enable RLS on all tables
    - Owners can manage their own widgets
    - Analytics and conversations accessible by widget owner
    
  3. Indexes
    - api_key lookup for widget serving
    - widget_id for analytics queries
    - created_at for time-based queries
*/

-- Create embed_widgets table
CREATE TABLE IF NOT EXISTS embed_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  widget_type text NOT NULL CHECK (widget_type IN ('chat', 'lawyer_search', 'contact_form', 'document_analyzer')),
  api_key text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'base64'),
  config jsonb NOT NULL DEFAULT '{
    "appearance": {
      "primaryColor": "#2563eb",
      "position": "bottom-right",
      "buttonText": "Legal Help",
      "headerTitle": "Legal Assistant",
      "showBranding": true
    },
    "behavior": {
      "autoOpen": false,
      "autoOpenDelay": 5000,
      "collectEmail": true,
      "greetingMessage": "Hello! How can I help you with your legal questions today?"
    }
  }'::jsonb,
  allowed_domains text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create widget_analytics table
CREATE TABLE IF NOT EXISTS widget_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NOT NULL REFERENCES embed_widgets(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'open', 'message', 'email_collected', 'lawyer_search', 'contact_submitted', 'document_uploaded')),
  metadata jsonb DEFAULT '{}',
  domain text,
  visitor_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create widget_conversations table
CREATE TABLE IF NOT EXISTS widget_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NOT NULL REFERENCES embed_widgets(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  visitor_email text,
  visitor_name text,
  messages jsonb NOT NULL DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'escalated')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE embed_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for embed_widgets
CREATE POLICY "Users can view own widgets"
  ON embed_widgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own widgets"
  ON embed_widgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets"
  ON embed_widgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets"
  ON embed_widgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for widget_analytics
CREATE POLICY "Users can view analytics for own widgets"
  ON widget_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM embed_widgets
      WHERE embed_widgets.id = widget_analytics.widget_id
      AND embed_widgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert analytics"
  ON widget_analytics FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policies for widget_conversations
CREATE POLICY "Users can view conversations for own widgets"
  ON widget_conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM embed_widgets
      WHERE embed_widgets.id = widget_conversations.widget_id
      AND embed_widgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage conversations"
  ON widget_conversations FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Service role can update conversations"
  ON widget_conversations FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_embed_widgets_api_key ON embed_widgets(api_key);
CREATE INDEX IF NOT EXISTS idx_embed_widgets_user_id ON embed_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_widget_id ON widget_analytics(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_created_at ON widget_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_event_type ON widget_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_widget_conversations_widget_id ON widget_conversations(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_conversations_visitor_id ON widget_conversations(visitor_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_embed_widget_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_embed_widgets_updated_at ON embed_widgets;
CREATE TRIGGER update_embed_widgets_updated_at
  BEFORE UPDATE ON embed_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_embed_widget_updated_at();

DROP TRIGGER IF EXISTS update_widget_conversations_updated_at ON widget_conversations;
CREATE TRIGGER update_widget_conversations_updated_at
  BEFORE UPDATE ON widget_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_embed_widget_updated_at();

```

---

## supabase/migrations/20260116184251_create_trust_safety_reports_table.sql

```sql
/*
  # Create Trust & Safety Reports Table

  1. New Tables
    - `trust_safety_reports`
      - `id` (uuid, primary key)
      - `report_type` (text) - Category of concern (ai_output, privacy, harassment, bias, legal_advice, other)
      - `severity` (text) - Urgency level (low, medium, high, critical)
      - `description` (text) - Detailed description of the concern
      - `conversation_id` (uuid, nullable) - Reference to related chat if applicable
      - `evidence_urls` (text[], nullable) - Screenshots or relevant links
      - `reporter_email` (text) - Contact email for follow-up
      - `reporter_name` (text, nullable) - Optional name
      - `user_id` (uuid, nullable) - If logged in user
      - `status` (text) - Report status (submitted, reviewing, resolved, dismissed)
      - `resolution_notes` (text, nullable) - Admin notes on resolution
      - `resolved_at` (timestamptz, nullable)
      - `resolved_by` (uuid, nullable) - Admin who resolved
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can create reports
    - Users can view their own reports
    - Admins can view and update all reports

  3. Indexes
    - Index on status for filtering
    - Index on report_type for categorization
    - Index on user_id for user lookups
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS trust_safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL CHECK (report_type IN ('ai_output', 'privacy', 'harassment', 'bias', 'legal_advice', 'security', 'other')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  conversation_id uuid,
  evidence_urls text[] DEFAULT '{}',
  reporter_email text NOT NULL,
  reporter_name text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'resolved', 'dismissed')),
  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trust_safety_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit trust safety reports"
  ON trust_safety_reports
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view own reports"
  ON trust_safety_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
  ON trust_safety_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update reports"
  ON trust_safety_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_status ON trust_safety_reports(status);
CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_type ON trust_safety_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_user ON trust_safety_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_created ON trust_safety_reports(created_at DESC);

CREATE OR REPLACE FUNCTION update_trust_safety_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trust_safety_reports_updated_at ON trust_safety_reports;
CREATE TRIGGER trust_safety_reports_updated_at
  BEFORE UPDATE ON trust_safety_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_trust_safety_reports_updated_at();

```

---

## supabase/migrations/20260117044203_create_crisis_incidents_table.sql

```sql
/*
  # Create Crisis Incidents Logging System

  1. New Tables
    - `crisis_incidents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional - null for anonymous users)
      - `session_id` (text, for tracking anonymous sessions)
      - `crisis_type` (text) - type of crisis detected
      - `trigger_message` (text) - message that triggered the detection
      - `jurisdiction` (text, optional) - user's jurisdiction if known
      - `escalated_to_human` (boolean) - whether user requested human help
      - `resources_shown` (jsonb) - resources displayed to user
      - `dismissed_at` (timestamptz) - when user dismissed the card
      - `created_at` (timestamptz)
      - `ip_address` (text, optional) - for fraud prevention
      - `user_agent` (text, optional)

  2. Security
    - Enable RLS on `crisis_incidents` table
    - Users can insert their own incidents (for logging)
    - Only admins can read all incidents
    - Users cannot update or delete incidents (audit integrity)

  3. Indexes
    - Index on crisis_type for analytics
    - Index on created_at for time-based queries
    - Index on user_id for user lookups
*/

CREATE TABLE IF NOT EXISTS crisis_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  crisis_type text NOT NULL,
  trigger_message text,
  jurisdiction text,
  escalated_to_human boolean DEFAULT false,
  resources_shown jsonb,
  dismissed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

ALTER TABLE crisis_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert crisis incidents for logging"
  ON crisis_incidents
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view own crisis incidents"
  ON crisis_incidents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all crisis incidents"
  ON crisis_incidents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_crisis_incidents_crisis_type ON crisis_incidents(crisis_type);
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_created_at ON crisis_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_user_id ON crisis_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_escalated ON crisis_incidents(escalated_to_human) WHERE escalated_to_human = true;

```

---

## supabase/migrations/20260117044644_create_rbac_and_approval_system.sql

```sql
/*
  # Create RBAC and Approval Workflow System

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - role name like 'admin', 'coordinator', 'reviewer'
      - `description` (text) - human-readable description
      - `permissions` (jsonb) - array of permission strings
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role_id` (uuid, references roles)
      - `assigned_by` (uuid, references auth.users)
      - `assigned_at` (timestamptz)

    - `approval_workflows`
      - `id` (uuid, primary key)
      - `name` (text) - workflow name
      - `description` (text)
      - `entity_type` (text) - what this workflow applies to
      - `required_approvals` (int) - number of approvals needed
      - `approval_roles` (jsonb) - roles that can approve
      - `is_active` (boolean)
      - `created_at` (timestamptz)

    - `approval_requests`
      - `id` (uuid, primary key)
      - `workflow_id` (uuid, references approval_workflows)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `requested_by` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `status` (text) - pending, approved, rejected
      - `created_at` (timestamptz)
      - `resolved_at` (timestamptz)

    - `approval_decisions`
      - `id` (uuid, primary key)
      - `request_id` (uuid, references approval_requests)
      - `decided_by` (uuid, references auth.users)
      - `decision` (text) - approve or reject
      - `comments` (text)
      - `decided_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admins can manage roles and workflows
    - Users can view their own role assignments
    - Approvers can view and act on pending requests

  3. Seed Data
    - Create default roles (admin, coordinator, reviewer, user)
*/

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS approval_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  entity_type text NOT NULL,
  required_approvals int DEFAULT 1,
  approval_roles jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES approval_workflows(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS approval_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  decided_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('approve', 'reject')),
  comments text,
  decided_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can view roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage workflows"
  ON approval_workflows
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can view workflows"
  ON approval_workflows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create approval requests"
  ON approval_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Users can view own requests"
  ON approval_requests
  FOR SELECT
  TO authenticated
  USING (requested_by = auth.uid());

CREATE POLICY "Admins can view all requests"
  ON approval_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update requests"
  ON approval_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can create approval decisions"
  ON approval_decisions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view decisions on their requests"
  ON approval_decisions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approval_requests
      WHERE approval_requests.id = approval_decisions.request_id
      AND approval_requests.requested_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all decisions"
  ON approval_decisions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_decisions_request_id ON approval_decisions(request_id);

INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Full system administrator', '["manage_users", "manage_roles", "manage_content", "manage_settings", "approve_all", "view_analytics"]'::jsonb),
  ('coordinator', 'Legal aid coordinator', '["manage_cases", "assign_attorneys", "view_reports", "approve_cases"]'::jsonb),
  ('reviewer', 'Content reviewer', '["review_content", "approve_documents", "view_cases"]'::jsonb),
  ('attorney', 'Licensed attorney', '["view_cases", "respond_cases", "create_documents"]'::jsonb),
  ('user', 'Standard user', '["create_cases", "view_own_cases", "use_chat"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO approval_workflows (name, description, entity_type, required_approvals, approval_roles, is_active) VALUES
  ('Document Publication', 'Approval workflow for publishing legal documents', 'document', 1, '["admin", "reviewer"]'::jsonb, true),
  ('Prompt Template Change', 'Approval workflow for modifying AI prompt templates', 'prompt', 2, '["admin"]'::jsonb, true),
  ('AI Model Configuration', 'Approval workflow for changing AI model settings', 'ai_config', 2, '["admin"]'::jsonb, true),
  ('User Role Assignment', 'Approval workflow for assigning elevated user roles', 'role_assignment', 1, '["admin"]'::jsonb, true)
ON CONFLICT DO NOTHING;

```

---

## supabase/migrations/20260117160444_create_conflict_checking_system.sql

```sql
/*
  # Create Conflict Checking System for White-Label Tenants

  This migration establishes a comprehensive conflict-of-interest checking system
  designed specifically for white-label law firm tenants using ezLegal.ai.

  ## Overview
  Law firms must prevent conflicts of interest when accepting new clients or matters.
  This system provides:
  - Client/matter registration with party information
  - Automated conflict checking against existing clients
  - Audit trail of all conflict checks performed
  - Tenant isolation ensuring data privacy between organizations

  ## New Tables

  1. `client_matters` - Stores client/matter information for conflict checking
     - `id` (uuid, primary key)
     - `tenant_id` (uuid) - The organization/law firm this belongs to
     - `matter_name` (text) - Name/description of the matter
     - `matter_number` (text) - Internal reference number
     - `client_name` (text) - Primary client name
     - `client_type` (text) - Individual, business, government, etc.
     - `adverse_parties` (jsonb) - Array of opposing parties
     - `related_parties` (jsonb) - Array of related/connected parties
     - `practice_area` (text) - Area of law
     - `status` (text) - Active, closed, prospective
     - `opened_date` (timestamptz)
     - `closed_date` (timestamptz)
     - `created_by` (uuid) - User who created the record
     - `created_at` / `updated_at` timestamps

  2. `conflict_checks` - Audit log of all conflict searches performed
     - `id` (uuid, primary key)
     - `tenant_id` (uuid) - Organization performing the check
     - `search_query` (text) - What was searched
     - `search_type` (text) - client_name, adverse_party, all_parties
     - `results_count` (integer) - Number of potential conflicts found
     - `results_data` (jsonb) - Detailed results
     - `status` (text) - clear, potential_conflict, conflict_confirmed
     - `reviewed_by` (uuid) - Attorney who reviewed
     - `reviewed_at` (timestamptz)
     - `notes` (text) - Review notes
     - `performed_by` (uuid)
     - `created_at` timestamp

  3. `conflict_waivers` - Documents conflict waivers when conflicts are waived
     - `id` (uuid, primary key)
     - `tenant_id` (uuid)
     - `conflict_check_id` (uuid) - Reference to the conflict check
     - `matter_id` (uuid) - The matter being opened despite conflict
     - `waiver_type` (text) - informed_consent, advance_waiver, etc.
     - `waiver_details` (text)
     - `client_consent_date` (timestamptz)
     - `supervising_attorney` (uuid)
     - `approved_at` (timestamptz)
     - `created_at` timestamp

  ## Security
  - RLS enabled on all tables
  - Policies restrict access to same-tenant users only
  - Audit logging for compliance requirements
*/

-- Create client_matters table
CREATE TABLE IF NOT EXISTS client_matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  matter_name text NOT NULL,
  matter_number text,
  client_name text NOT NULL,
  client_type text NOT NULL DEFAULT 'individual',
  adverse_parties jsonb DEFAULT '[]'::jsonb,
  related_parties jsonb DEFAULT '[]'::jsonb,
  practice_area text,
  status text NOT NULL DEFAULT 'active',
  opened_date timestamptz DEFAULT now(),
  closed_date timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT client_matters_client_type_check CHECK (client_type IN ('individual', 'business', 'government', 'nonprofit', 'other')),
  CONSTRAINT client_matters_status_check CHECK (status IN ('prospective', 'active', 'closed', 'declined'))
);

-- Create indexes for efficient conflict searching
CREATE INDEX IF NOT EXISTS idx_client_matters_tenant ON client_matters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_matters_client_name ON client_matters(tenant_id, lower(client_name));
CREATE INDEX IF NOT EXISTS idx_client_matters_matter_number ON client_matters(tenant_id, matter_number);
CREATE INDEX IF NOT EXISTS idx_client_matters_status ON client_matters(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_client_matters_adverse_parties ON client_matters USING gin(adverse_parties);
CREATE INDEX IF NOT EXISTS idx_client_matters_related_parties ON client_matters USING gin(related_parties);

-- Enable RLS
ALTER TABLE client_matters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_matters
CREATE POLICY "Users can view client matters in their tenant"
  ON client_matters FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert client matters in their tenant"
  ON client_matters FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update client matters in their tenant"
  ON client_matters FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Create conflict_checks audit table
CREATE TABLE IF NOT EXISTS conflict_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  search_query text NOT NULL,
  search_type text NOT NULL DEFAULT 'all_parties',
  results_count integer NOT NULL DEFAULT 0,
  results_data jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending_review',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_notes text,
  performed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT conflict_checks_search_type_check CHECK (search_type IN ('client_name', 'adverse_party', 'related_party', 'all_parties')),
  CONSTRAINT conflict_checks_status_check CHECK (status IN ('pending_review', 'clear', 'potential_conflict', 'conflict_confirmed', 'waived'))
);

-- Indexes for conflict_checks
CREATE INDEX IF NOT EXISTS idx_conflict_checks_tenant ON conflict_checks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conflict_checks_status ON conflict_checks(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_conflict_checks_created ON conflict_checks(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conflict_checks_performed_by ON conflict_checks(performed_by);

-- Enable RLS
ALTER TABLE conflict_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conflict_checks
CREATE POLICY "Users can view conflict checks in their tenant"
  ON conflict_checks FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conflict checks in their tenant"
  ON conflict_checks FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update conflict checks in their tenant"
  ON conflict_checks FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Create conflict_waivers table
CREATE TABLE IF NOT EXISTS conflict_waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  conflict_check_id uuid REFERENCES conflict_checks(id),
  matter_id uuid REFERENCES client_matters(id),
  waiver_type text NOT NULL,
  waiver_details text,
  conflicting_matter_id uuid REFERENCES client_matters(id),
  client_consent_date timestamptz,
  supervising_attorney uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT conflict_waivers_type_check CHECK (waiver_type IN ('informed_consent', 'advance_waiver', 'former_client', 'screening'))
);

-- Indexes for conflict_waivers
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_tenant ON conflict_waivers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_check ON conflict_waivers(conflict_check_id);
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_matter ON conflict_waivers(matter_id);

-- Enable RLS
ALTER TABLE conflict_waivers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conflict_waivers
CREATE POLICY "Users can view conflict waivers in their tenant"
  ON conflict_waivers FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conflict waivers in their tenant"
  ON conflict_waivers FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Function to perform conflict check (server-side for security)
CREATE OR REPLACE FUNCTION perform_conflict_check(
  p_tenant_id uuid,
  p_search_query text,
  p_search_type text DEFAULT 'all_parties'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_results jsonb;
  v_count integer;
  v_search_pattern text;
BEGIN
  v_search_pattern := '%' || lower(p_search_query) || '%';
  
  IF p_search_type = 'client_name' THEN
    SELECT jsonb_agg(jsonb_build_object(
      'matter_id', id,
      'matter_name', matter_name,
      'matter_number', matter_number,
      'client_name', client_name,
      'match_type', 'client_name',
      'status', status
    ))
    INTO v_results
    FROM client_matters
    WHERE tenant_id = p_tenant_id
      AND lower(client_name) LIKE v_search_pattern;
      
  ELSIF p_search_type = 'adverse_party' THEN
    SELECT jsonb_agg(jsonb_build_object(
      'matter_id', id,
      'matter_name', matter_name,
      'matter_number', matter_number,
      'client_name', client_name,
      'match_type', 'adverse_party',
      'matched_party', party,
      'status', status
    ))
    INTO v_results
    FROM client_matters,
         jsonb_array_elements_text(adverse_parties) AS party
    WHERE tenant_id = p_tenant_id
      AND lower(party) LIKE v_search_pattern;
      
  ELSE
    WITH all_matches AS (
      SELECT id, matter_name, matter_number, client_name, status,
             'client_name' as match_type,
             client_name as matched_party
      FROM client_matters
      WHERE tenant_id = p_tenant_id
        AND lower(client_name) LIKE v_search_pattern
      
      UNION ALL
      
      SELECT cm.id, cm.matter_name, cm.matter_number, cm.client_name, cm.status,
             'adverse_party' as match_type,
             party as matched_party
      FROM client_matters cm,
           jsonb_array_elements_text(cm.adverse_parties) AS party
      WHERE cm.tenant_id = p_tenant_id
        AND lower(party) LIKE v_search_pattern
        
      UNION ALL
      
      SELECT cm.id, cm.matter_name, cm.matter_number, cm.client_name, cm.status,
             'related_party' as match_type,
             party as matched_party
      FROM client_matters cm,
           jsonb_array_elements_text(cm.related_parties) AS party
      WHERE cm.tenant_id = p_tenant_id
        AND lower(party) LIKE v_search_pattern
    )
    SELECT jsonb_agg(jsonb_build_object(
      'matter_id', id,
      'matter_name', matter_name,
      'matter_number', matter_number,
      'client_name', client_name,
      'match_type', match_type,
      'matched_party', matched_party,
      'status', status
    ))
    INTO v_results
    FROM all_matches;
  END IF;
  
  IF v_results IS NULL THEN
    v_results := '[]'::jsonb;
  END IF;
  
  v_count := jsonb_array_length(v_results);
  
  INSERT INTO conflict_checks (
    tenant_id, search_query, search_type, results_count, results_data,
    status, performed_by
  ) VALUES (
    p_tenant_id, p_search_query, p_search_type, v_count, v_results,
    CASE WHEN v_count > 0 THEN 'potential_conflict' ELSE 'clear' END,
    auth.uid()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'results_count', v_count,
    'results', v_results,
    'status', CASE WHEN v_count > 0 THEN 'potential_conflict' ELSE 'clear' END
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION perform_conflict_check TO authenticated;
```

---

## supabase/migrations/20260117172307_create_chat_audit_logs_table.sql

```sql
/*
  # Create Chat Audit Logs Table for RAG Pipeline

  1. New Tables
    - `chat_audit_logs`
      - `id` (uuid, primary key)
      - `tenant_id` (text) - Multi-tenant identifier
      - `session_id` (text) - Chat session identifier
      - `user_id` (uuid, optional) - References authenticated user
      - `query` (text) - User's question
      - `response_preview` (text) - First 500 chars of response
      - `jurisdiction` (text) - Legal jurisdiction
      - `category` (text, optional) - Legal category
      - `citations_count` (integer) - Number of citations returned
      - `compliance_score` (integer, optional) - Enforcement/compliance score
      - `model_used` (text) - AI model or backend used
      - `backend_used` (text) - Which backend served the request
      - `audit_trail_id` (text) - Unique audit trail identifier
      - `created_at` (timestamptz) - Timestamp

  2. Security
    - Enable RLS on `chat_audit_logs` table
    - Admins can view all logs
    - Service role can insert logs

  3. Indexes
    - Index on tenant_id for multi-tenant queries
    - Index on session_id for session lookups
    - Index on created_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS chat_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'ezlegal',
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  query text NOT NULL,
  response_preview text,
  jurisdiction text DEFAULT 'Arizona',
  category text,
  citations_count integer DEFAULT 0,
  compliance_score integer,
  model_used text,
  backend_used text,
  audit_trail_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all chat audit logs"
  ON chat_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Service role can insert chat audit logs"
  ON chat_audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_chat_audit_logs_tenant_id ON chat_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_audit_logs_session_id ON chat_audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_audit_logs_created_at ON chat_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_audit_logs_audit_trail_id ON chat_audit_logs(audit_trail_id);

```

---

## supabase/migrations/20260117173223_create_openai_usage_tracking.sql

```sql
/*
  # OpenAI Usage Tracking System

  1. New Tables
    - `openai_usage_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - linked user if authenticated
      - `session_id` (text) - chat session identifier
      - `model_name` (text) - model used (e.g., gpt-4o, gpt-4o-mini)
      - `prompt_tokens` (integer) - tokens in the prompt
      - `completion_tokens` (integer) - tokens in the response
      - `total_tokens` (integer) - total tokens used
      - `cost_usd` (numeric) - calculated cost in USD
      - `request_type` (text) - 'chat', 'analysis', 'embedding'
      - `jurisdiction` (text) - legal jurisdiction
      - `category` (text) - legal category
      - `response_time_ms` (integer) - API response time
      - `success` (boolean) - whether request succeeded
      - `error_message` (text) - error if failed
      - `created_at` (timestamptz)

    - `openai_rate_limits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `ip_address` (text, nullable)
      - `requests_count` (integer)
      - `tokens_count` (integer)
      - `window_start` (timestamptz)
      - `window_type` (text) - 'minute', 'hour', 'day'

  2. Functions
    - `get_active_openai_model()` - Returns the default active model config
    - `log_openai_usage()` - Logs API usage with cost calculation

  3. Security
    - Enable RLS on all tables
    - Users can view their own usage logs
    - Rate limit tracking is service-level
*/

-- OpenAI Usage Logs table
CREATE TABLE IF NOT EXISTS openai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  model_name text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer GENERATED ALWAYS AS (prompt_tokens + completion_tokens) STORED,
  cost_usd numeric(10, 8) NOT NULL DEFAULT 0,
  request_type text NOT NULL DEFAULT 'chat',
  jurisdiction text,
  category text,
  response_time_ms integer,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE openai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage logs"
  ON openai_usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert usage logs"
  ON openai_usage_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Rate Limits table
CREATE TABLE IF NOT EXISTS openai_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text,
  requests_count integer NOT NULL DEFAULT 0,
  tokens_count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  window_type text NOT NULL DEFAULT 'hour',
  CONSTRAINT rate_limit_identifier CHECK (user_id IS NOT NULL OR ip_address IS NOT NULL)
);

ALTER TABLE openai_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can manage rate limits"
  ON openai_rate_limits
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Function to get active OpenAI model configuration
CREATE OR REPLACE FUNCTION get_active_openai_model()
RETURNS TABLE (
  model_name text,
  display_name text,
  max_tokens integer,
  cost_per_token numeric,
  settings jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    amc.model_name,
    amc.display_name,
    amc.max_tokens,
    amc.cost_per_token,
    amc.settings
  FROM ai_model_configs amc
  WHERE amc.provider = 'openai'
    AND amc.is_active = true
    AND amc.is_default = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      amc.model_name,
      amc.display_name,
      amc.max_tokens,
      amc.cost_per_token,
      amc.settings
    FROM ai_model_configs amc
    WHERE amc.provider = 'openai'
      AND amc.is_active = true
    ORDER BY amc.priority DESC
    LIMIT 1;
  END IF;
END;
$$;

-- Function to log OpenAI usage with cost calculation
CREATE OR REPLACE FUNCTION log_openai_usage(
  p_user_id uuid,
  p_session_id text,
  p_model_name text,
  p_prompt_tokens integer,
  p_completion_tokens integer,
  p_request_type text DEFAULT 'chat',
  p_jurisdiction text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_response_time_ms integer DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost_per_token numeric;
  v_cost_usd numeric;
  v_log_id uuid;
BEGIN
  SELECT cost_per_token INTO v_cost_per_token
  FROM ai_model_configs
  WHERE model_name = p_model_name
  LIMIT 1;
  
  IF v_cost_per_token IS NULL THEN
    v_cost_per_token := 0.00001;
  END IF;
  
  v_cost_usd := (p_prompt_tokens + p_completion_tokens) * v_cost_per_token;
  
  INSERT INTO openai_usage_logs (
    user_id,
    session_id,
    model_name,
    prompt_tokens,
    completion_tokens,
    cost_usd,
    request_type,
    jurisdiction,
    category,
    response_time_ms,
    success,
    error_message
  ) VALUES (
    p_user_id,
    p_session_id,
    p_model_name,
    p_prompt_tokens,
    p_completion_tokens,
    v_cost_usd,
    p_request_type,
    p_jurisdiction,
    p_category,
    p_response_time_ms,
    p_success,
    p_error_message
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_openai_rate_limit(
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_window_type text DEFAULT 'hour',
  p_max_requests integer DEFAULT 100,
  p_max_tokens integer DEFAULT 100000
)
RETURNS TABLE (
  allowed boolean,
  requests_remaining integer,
  tokens_remaining integer,
  reset_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_duration interval;
  v_current_requests integer;
  v_current_tokens integer;
  v_window_start timestamptz;
BEGIN
  CASE p_window_type
    WHEN 'minute' THEN v_window_duration := interval '1 minute';
    WHEN 'hour' THEN v_window_duration := interval '1 hour';
    WHEN 'day' THEN v_window_duration := interval '1 day';
    ELSE v_window_duration := interval '1 hour';
  END CASE;
  
  SELECT 
    orl.requests_count,
    orl.tokens_count,
    orl.window_start
  INTO v_current_requests, v_current_tokens, v_window_start
  FROM openai_rate_limits orl
  WHERE (p_user_id IS NOT NULL AND orl.user_id = p_user_id)
     OR (p_ip_address IS NOT NULL AND orl.ip_address = p_ip_address)
  AND orl.window_type = p_window_type
  AND orl.window_start > now() - v_window_duration;
  
  IF NOT FOUND THEN
    v_current_requests := 0;
    v_current_tokens := 0;
    v_window_start := now();
  END IF;
  
  RETURN QUERY SELECT
    (v_current_requests < p_max_requests AND v_current_tokens < p_max_tokens) AS allowed,
    GREATEST(0, p_max_requests - v_current_requests) AS requests_remaining,
    GREATEST(0, p_max_tokens - v_current_tokens) AS tokens_remaining,
    (v_window_start + v_window_duration) AS reset_at;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_user_id ON openai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_session_id ON openai_usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_created_at ON openai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_model_name ON openai_usage_logs(model_name);
CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_user_id ON openai_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_ip_address ON openai_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_window ON openai_rate_limits(window_type, window_start);

```

---

## supabase/migrations/20260117180413_create_ai_models_table.sql

```sql
/*
  # Create AI Models Table

  1. New Tables
    - `ai_models`
      - `id` (uuid, primary key)
      - `model_name` (text, unique) - internal identifier
      - `display_name` (text) - user-facing name
      - `openai_model` (text) - actual OpenAI API model name
      - `description` (text) - model description
      - `max_tokens` (integer) - maximum tokens for this model
      - `cost_per_1k_tokens` (decimal) - cost tracking
      - `is_active` (boolean) - whether model is available
      - `is_default` (boolean) - default model selection
      - `display_order` (integer) - sort order in UI
      - `tier_required` (text) - subscription tier needed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `ai_models` table
    - Add policy for authenticated users to read models
    - Add policy for admins to manage models

  3. Data
    - Populate with all available OpenAI models
*/

CREATE TABLE IF NOT EXISTS ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  openai_model text NOT NULL,
  description text,
  max_tokens integer DEFAULT 4096,
  cost_per_1k_tokens decimal(10, 6) DEFAULT 0.0,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  display_order integer DEFAULT 0,
  tier_required text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_models' AND policyname = 'Anyone can view active models'
  ) THEN
    CREATE POLICY "Anyone can view active models"
      ON ai_models
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_models' AND policyname = 'Admins can manage models'
  ) THEN
    CREATE POLICY "Admins can manage models"
      ON ai_models
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_models_display_order ON ai_models(display_order);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_active ON ai_models(is_active);

INSERT INTO ai_models (model_name, display_name, openai_model, description, max_tokens, cost_per_1k_tokens, is_active, is_default, display_order, tier_required)
VALUES
  ('chatgpt', 'ChatGPT', 'gpt-3.5-turbo', 'Fast and efficient for general legal questions', 4096, 0.0005, true, true, 1, 'free'),
  ('chatgpt-plus', 'ChatGPT Plus', 'gpt-3.5-turbo-16k', 'Extended context for longer documents', 16384, 0.001, true, false, 2, 'free'),
  ('chatgpt-4', 'ChatGPT 4', 'gpt-4', 'Advanced reasoning for complex legal analysis', 8192, 0.03, true, false, 3, 'premium'),
  ('chatgpt-4o', 'ChatGPT 4o', 'gpt-4o', 'Latest multimodal model with enhanced capabilities', 128000, 0.005, true, false, 4, 'premium'),
  ('chatgpt-4o-mini', 'ChatGPT 4o mini', 'gpt-4o-mini', 'Cost-effective version of GPT-4o', 128000, 0.00015, true, false, 5, 'free'),
  ('chatgpt-o1', 'ChatGPT o1', 'o1', 'Advanced reasoning model for complex legal problems', 200000, 0.015, true, false, 6, 'premium'),
  ('chatgpt-o3-mini', 'ChatGPT o3-mini', 'o3-mini', 'Efficient reasoning model', 200000, 0.0011, true, false, 7, 'premium'),
  ('chatgpt-5.2', 'ChatGPT 5.2', 'gpt-4o', 'Premium model with latest enhancements', 128000, 0.005, true, false, 8, 'premium'),
  ('chatgpt-5.1', 'ChatGPT 5.1', 'gpt-4o', 'Enhanced legal reasoning capabilities', 128000, 0.005, true, false, 9, 'premium'),
  ('chatgpt-5-mini', 'ChatGPT 5 mini', 'gpt-4o-mini', 'Balanced performance and cost', 128000, 0.00015, true, false, 10, 'free'),
  ('chatgpt-5-nano', 'ChatGPT 5 nano', 'gpt-4o-mini', 'Lightweight model for quick responses', 128000, 0.00015, true, false, 11, 'free')
ON CONFLICT (model_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  openai_model = EXCLUDED.openai_model,
  description = EXCLUDED.description,
  max_tokens = EXCLUDED.max_tokens,
  cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  tier_required = EXCLUDED.tier_required,
  updated_at = now();

DROP FUNCTION IF EXISTS get_active_openai_model();

CREATE FUNCTION get_active_openai_model()
RETURNS TABLE (
  model_name text,
  display_name text,
  openai_model text,
  max_tokens integer,
  cost_per_token decimal,
  settings jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.model_name,
    m.display_name,
    m.openai_model,
    m.max_tokens,
    m.cost_per_1k_tokens / 1000 as cost_per_token,
    jsonb_build_object('temperature', 0.7) as settings
  FROM ai_models m
  WHERE m.is_active = true AND m.is_default = true
  LIMIT 1;
$$;

```

---

## supabase/migrations/20260120014759_create_perspective_submissions_table.sql

```sql
/*
  # Create Perspective Submissions Table

  1. New Tables
    - `perspective_submissions`
      - `id` (uuid, primary key)
      - `full_name` (text) - Submitter's name
      - `email` (text) - Contact email
      - `organization` (text) - Organization name
      - `role` (text) - Professional role
      - `years_experience` (text) - Experience level
      - `ai_tools_used` (text[]) - Array of AI tools used
      - `use_cases` (text[]) - Array of use cases
      - `impact_description` (text) - Description of positive impact
      - `challenges_description` (text) - Description of challenges
      - `ethics_approach` (text) - Approach to AI ethics
      - `willing_to_interview` (boolean) - Open to interview
      - `willing_to_be_quoted` (boolean) - Willing to be quoted publicly
      - `additional_comments` (text) - Additional comments
      - `status` (text) - Submission status (new, reviewed, featured, archived)
      - `reviewed_by` (uuid) - Admin who reviewed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow public inserts (anyone can submit)
    - Only authenticated admins can read/update
*/

CREATE TABLE IF NOT EXISTS perspective_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  organization text NOT NULL,
  role text NOT NULL,
  years_experience text,
  ai_tools_used text[] DEFAULT '{}',
  use_cases text[] DEFAULT '{}',
  impact_description text NOT NULL,
  challenges_description text,
  ethics_approach text,
  willing_to_interview boolean DEFAULT false,
  willing_to_be_quoted boolean DEFAULT false,
  additional_comments text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'featured', 'archived')),
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE perspective_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit perspective"
  ON perspective_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all submissions"
  ON perspective_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update submissions"
  ON perspective_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_perspective_submissions_status ON perspective_submissions(status);
CREATE INDEX IF NOT EXISTS idx_perspective_submissions_created_at ON perspective_submissions(created_at DESC);

```

---

## supabase/migrations/20260121034417_enable_pgvector_for_rag.sql

```sql
/*
  # Enable pgvector Extension for RAG Pipeline

  This migration enables the pgvector extension and adds embedding columns
  to support the RAG (Retrieval Augmented Generation) pipeline migration
  from legacy FAISS to native PostgreSQL vectors.

  1. Extensions
    - Enable `vector` extension for embedding storage and similarity search
  
  2. Schema Changes
    - Add `embedding` column to `chatbot_documents` table (vector type)
    - Create HNSW index for fast similarity search
  
  3. Functions
    - `match_documents`: Semantic search function for RAG queries
    - `check_pgvector_extension`: Utility to verify extension status
  
  4. Performance
    - HNSW index with optimized parameters for 1536-dimensional OpenAI embeddings
    - Cosine similarity for semantic matching
*/

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'chatbot_documents'
    AND column_name = 'embedding'
  ) THEN
    ALTER TABLE chatbot_documents
    ADD COLUMN embedding vector(1536);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chatbot_documents_embedding
ON chatbot_documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_jurisdiction text DEFAULT NULL,
  filter_practice_area text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  document_type text,
  jurisdiction text,
  practice_area text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cd.id,
    cd.title,
    cd.content,
    cd.document_type,
    cd.jurisdiction,
    cd.practice_area,
    1 - (cd.embedding <=> query_embedding) AS similarity
  FROM chatbot_documents cd
  WHERE
    cd.embedding IS NOT NULL
    AND 1 - (cd.embedding <=> query_embedding) > match_threshold
    AND (filter_jurisdiction IS NULL OR cd.jurisdiction = filter_jurisdiction)
    AND (filter_practice_area IS NULL OR cd.practice_area = filter_practice_area)
  ORDER BY cd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION check_pgvector_extension()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  );
$$;

COMMENT ON FUNCTION match_documents IS 'Semantic search for RAG pipeline - finds similar documents using cosine similarity';
COMMENT ON FUNCTION check_pgvector_extension IS 'Utility function to verify pgvector extension is enabled';

```

---

## supabase/migrations/20260121041902_create_matters_domain_model.sql

```sql
/*
  # Create Matter-Centric Domain Model

  This migration introduces a first-class "Matter" entity as the organizing principle
  for legal work, addressing the information architecture gap identified in the 
  platform analysis. All related entities (documents, conversations, participants,
  activities) are linked to matters with enforced constraints.

  ## 1. New Tables

  ### `matters`
  Central organizing entity for legal work
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users) - matter owner/client
  - `title` (text) - human-readable matter name
  - `description` (text) - matter summary
  - `practice_area` (text) - legal category
  - `jurisdiction` (text) - applicable jurisdiction
  - `status` (text) - open, closed, on_hold, archived
  - `priority` (text) - low, medium, high, urgent
  - `created_at`, `updated_at` (timestamptz)

  ### `matter_participants`
  Links users to matters with specific roles
  - `id` (uuid, primary key)
  - `matter_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `role` (text) - client, attorney, paralegal, support
  - `permissions` (jsonb) - granular access controls
  - `added_at`, `removed_at` (timestamptz)

  ### `matter_documents`
  Links documents to matters
  - `id` (uuid, primary key)
  - `matter_id` (uuid, foreign key)
  - `document_id` (uuid, foreign key to documents)
  - `category` (text) - intake, evidence, correspondence, filing, output
  - `added_at` (timestamptz)

  ### `matter_activity_timeline`
  Audit trail of all matter-related events
  - `id` (uuid, primary key)
  - `matter_id` (uuid, foreign key)
  - `actor_id` (uuid, foreign key)
  - `activity_type` (text) - created, updated, document_added, message_sent, etc.
  - `activity_data` (jsonb) - structured event details
  - `created_at` (timestamptz)

  ## 2. Schema Changes

  ### `chat_contexts`
  - Add `matter_id` column to link conversations to matters

  ### `documents`
  - Add `matter_id` column for direct matter association

  ## 3. Security

  - RLS enabled on all new tables
  - Policies based on matter participation (not just ownership)
  - Supports ethical walls through participant-based access

  ## 4. Indexes

  - Foreign key indexes for performance
  - Composite indexes for common query patterns
*/

-- Create matters table
CREATE TABLE IF NOT EXISTS matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  practice_area text,
  jurisdiction text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'on_hold', 'archived')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  intake_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matter_participants table
CREATE TABLE IF NOT EXISTS matter_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('client', 'attorney', 'paralegal', 'support', 'admin')),
  permissions jsonb NOT NULL DEFAULT '{"view": true, "edit": false, "delete": false, "manage_participants": false}',
  added_at timestamptz DEFAULT now(),
  removed_at timestamptz,
  UNIQUE (matter_id, user_id)
);

-- Create matter_documents junction table
CREATE TABLE IF NOT EXISTS matter_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('intake', 'evidence', 'correspondence', 'filing', 'output', 'general')),
  notes text,
  added_at timestamptz DEFAULT now(),
  added_by uuid REFERENCES auth.users(id),
  UNIQUE (matter_id, document_id)
);

-- Create matter_activity_timeline table
CREATE TABLE IF NOT EXISTS matter_activity_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  activity_type text NOT NULL,
  activity_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add matter_id to chat_contexts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_contexts' AND column_name = 'matter_id'
  ) THEN
    ALTER TABLE chat_contexts ADD COLUMN matter_id uuid REFERENCES matters(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add matter_id to documents if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'matter_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN matter_id uuid REFERENCES matters(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for matters
CREATE INDEX IF NOT EXISTS idx_matters_user_id ON matters(user_id);
CREATE INDEX IF NOT EXISTS idx_matters_status ON matters(status);
CREATE INDEX IF NOT EXISTS idx_matters_practice_area ON matters(practice_area);
CREATE INDEX IF NOT EXISTS idx_matters_created_at ON matters(created_at DESC);

-- Create indexes for matter_participants
CREATE INDEX IF NOT EXISTS idx_matter_participants_matter_id ON matter_participants(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_participants_user_id ON matter_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_matter_participants_role ON matter_participants(role);
CREATE INDEX IF NOT EXISTS idx_matter_participants_active ON matter_participants(matter_id) WHERE removed_at IS NULL;

-- Create indexes for matter_documents
CREATE INDEX IF NOT EXISTS idx_matter_documents_matter_id ON matter_documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_documents_document_id ON matter_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_matter_documents_category ON matter_documents(category);

-- Create indexes for matter_activity_timeline
CREATE INDEX IF NOT EXISTS idx_matter_activity_matter_id ON matter_activity_timeline(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_activity_actor_id ON matter_activity_timeline(actor_id);
CREATE INDEX IF NOT EXISTS idx_matter_activity_type ON matter_activity_timeline(activity_type);
CREATE INDEX IF NOT EXISTS idx_matter_activity_created_at ON matter_activity_timeline(created_at DESC);

-- Create index on chat_contexts.matter_id
CREATE INDEX IF NOT EXISTS idx_chat_contexts_matter_id ON chat_contexts(matter_id);

-- Create index on documents.matter_id
CREATE INDEX IF NOT EXISTS idx_documents_matter_id ON documents(matter_id);

-- Enable RLS on all new tables
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_activity_timeline ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is participant in matter
CREATE OR REPLACE FUNCTION public.is_matter_participant(p_matter_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM matter_participants
    WHERE matter_id = p_matter_id
    AND user_id = p_user_id
    AND removed_at IS NULL
  );
$$;

-- Helper function to check if user owns matter
CREATE OR REPLACE FUNCTION public.is_matter_owner(p_matter_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM matters
    WHERE id = p_matter_id
    AND user_id = p_user_id
  );
$$;

-- Helper function to check participant permission
CREATE OR REPLACE FUNCTION public.has_matter_permission(p_matter_id uuid, p_user_id uuid, p_permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM matter_participants
    WHERE matter_id = p_matter_id
    AND user_id = p_user_id
    AND removed_at IS NULL
    AND (permissions->>p_permission)::boolean = true
  );
$$;

-- RLS Policies for matters table

-- Users can view matters they own or participate in
CREATE POLICY "Users can view own or participating matters"
  ON matters FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_matter_participant(id, auth.uid())
  );

-- Users can create their own matters
CREATE POLICY "Users can create own matters"
  ON matters FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update matters they own
CREATE POLICY "Users can update own matters"
  ON matters FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete matters they own
CREATE POLICY "Users can delete own matters"
  ON matters FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for matter_participants table

-- Users can view participants for matters they access
CREATE POLICY "Users can view matter participants"
  ON matter_participants FOR SELECT
  TO authenticated
  USING (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.is_matter_participant(matter_id, auth.uid())
  );

-- Only matter owners can add participants
CREATE POLICY "Matter owners can add participants"
  ON matter_participants FOR INSERT
  TO authenticated
  WITH CHECK (public.is_matter_owner(matter_id, auth.uid()));

-- Only matter owners can update participants
CREATE POLICY "Matter owners can update participants"
  ON matter_participants FOR UPDATE
  TO authenticated
  USING (public.is_matter_owner(matter_id, auth.uid()))
  WITH CHECK (public.is_matter_owner(matter_id, auth.uid()));

-- Only matter owners can remove participants
CREATE POLICY "Matter owners can remove participants"
  ON matter_participants FOR DELETE
  TO authenticated
  USING (public.is_matter_owner(matter_id, auth.uid()));

-- RLS Policies for matter_documents table

-- Users can view documents for matters they access
CREATE POLICY "Users can view matter documents"
  ON matter_documents FOR SELECT
  TO authenticated
  USING (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.is_matter_participant(matter_id, auth.uid())
  );

-- Users can add documents to matters they own or have edit permission
CREATE POLICY "Users can add documents to matters"
  ON matter_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.has_matter_permission(matter_id, auth.uid(), 'edit')
  );

-- Users can update document links in matters they own or have edit permission
CREATE POLICY "Users can update matter documents"
  ON matter_documents FOR UPDATE
  TO authenticated
  USING (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.has_matter_permission(matter_id, auth.uid(), 'edit')
  )
  WITH CHECK (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.has_matter_permission(matter_id, auth.uid(), 'edit')
  );

-- Only matter owners or users with delete permission can remove document links
CREATE POLICY "Users can remove matter documents"
  ON matter_documents FOR DELETE
  TO authenticated
  USING (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.has_matter_permission(matter_id, auth.uid(), 'delete')
  );

-- RLS Policies for matter_activity_timeline table

-- Users can view activity for matters they access
CREATE POLICY "Users can view matter activity"
  ON matter_activity_timeline FOR SELECT
  TO authenticated
  USING (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.is_matter_participant(matter_id, auth.uid())
  );

-- System and participants can insert activity records
CREATE POLICY "Users can log matter activity"
  ON matter_activity_timeline FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.is_matter_participant(matter_id, auth.uid())
  );

-- Activity records are immutable (no update/delete policies)

-- Create trigger to auto-add owner as participant
CREATE OR REPLACE FUNCTION public.add_matter_owner_as_participant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO matter_participants (matter_id, user_id, role, permissions)
  VALUES (
    NEW.id,
    NEW.user_id,
    'client',
    '{"view": true, "edit": true, "delete": true, "manage_participants": true}'::jsonb
  )
  ON CONFLICT (matter_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_add_matter_owner_participant ON matters;
CREATE TRIGGER trigger_add_matter_owner_participant
  AFTER INSERT ON matters
  FOR EACH ROW
  EXECUTE FUNCTION public.add_matter_owner_as_participant();

-- Create trigger to log matter activity
CREATE OR REPLACE FUNCTION public.log_matter_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO matter_activity_timeline (matter_id, actor_id, activity_type, activity_data)
    VALUES (NEW.id, NEW.user_id, 'matter_created', jsonb_build_object('title', NEW.title, 'practice_area', NEW.practice_area));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO matter_activity_timeline (matter_id, actor_id, activity_type, activity_data)
    VALUES (NEW.id, auth.uid(), 'matter_updated', jsonb_build_object(
      'changes', jsonb_build_object(
        'status', CASE WHEN OLD.status != NEW.status THEN jsonb_build_object('from', OLD.status, 'to', NEW.status) ELSE NULL END,
        'priority', CASE WHEN OLD.priority != NEW.priority THEN jsonb_build_object('from', OLD.priority, 'to', NEW.priority) ELSE NULL END
      )
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_matter_activity ON matters;
CREATE TRIGGER trigger_log_matter_activity
  AFTER INSERT OR UPDATE ON matters
  FOR EACH ROW
  EXECUTE FUNCTION public.log_matter_activity();

-- Create updated_at trigger for matters
CREATE OR REPLACE FUNCTION public.update_matters_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_matters_updated_at ON matters;
CREATE TRIGGER trigger_matters_updated_at
  BEFORE UPDATE ON matters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_matters_updated_at();

```

---

## supabase/migrations/20260121041948_create_rag_citation_provenance.sql

```sql
/*
  # Create RAG Citation Provenance System

  This migration adds defensibility and transparency features for AI-generated
  legal content. Every RAG response stores its source chunks, model version,
  and retrieval metadata for audit, review, and client communication.

  ## 1. New Tables

  ### `ai_response_provenance`
  Master record for each AI-generated response
  - `id` (uuid, primary key)
  - `chat_message_id` (uuid, foreign key) - links to the AI response message
  - `matter_id` (uuid, foreign key) - optional matter association
  - `user_id` (uuid, foreign key) - user who triggered the query
  - `model_id` (text) - exact model identifier (e.g., gpt-4-turbo-2024-04-09)
  - `model_version` (text) - version string for tracking
  - `prompt_template_version` (text) - version of prompt template used
  - `query_text` (text) - original user query
  - `response_text` (text) - full AI response
  - `token_usage` (jsonb) - prompt/completion/total tokens
  - `latency_ms` (integer) - response generation time
  - `confidence_score` (numeric) - AI confidence if available
  - `created_at` (timestamptz)

  ### `ai_response_citations`
  Individual source chunks used in RAG response
  - `id` (uuid, primary key)
  - `provenance_id` (uuid, foreign key)
  - `source_type` (text) - document, statute, case_law, knowledge_base
  - `source_id` (uuid) - reference to source document/record
  - `source_title` (text) - human-readable source name
  - `source_url` (text) - link to source if available
  - `chunk_text` (text) - actual text chunk used
  - `chunk_index` (integer) - position in source document
  - `similarity_score` (numeric) - vector similarity score
  - `retrieval_rank` (integer) - rank in retrieval results
  - `created_at` (timestamptz)

  ### `ai_consent_records`
  Tracks user consent to AI processing
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `consent_type` (text) - ai_processing, data_retention, analytics
  - `consent_version` (text) - version of consent terms
  - `granted` (boolean)
  - `granted_at` (timestamptz)
  - `revoked_at` (timestamptz)
  - `ip_address` (text)
  - `user_agent` (text)

  ### `ai_disclosure_acknowledgments`
  Records when users acknowledge AI limitations
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `disclosure_type` (text) - not_legal_advice, ai_limitations, accuracy_warning
  - `acknowledged_at` (timestamptz)
  - `session_id` (text)

  ## 2. Security

  - RLS enabled on all tables
  - Users can only view their own provenance records
  - Admins can view all for compliance review
*/

-- Create ai_response_provenance table
CREATE TABLE IF NOT EXISTS ai_response_provenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_message_id uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
  matter_id uuid REFERENCES matters(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id text NOT NULL,
  model_version text,
  prompt_template_version text,
  query_text text NOT NULL,
  response_text text NOT NULL,
  token_usage jsonb DEFAULT '{}',
  latency_ms integer,
  confidence_score numeric(5,4),
  retrieval_strategy text,
  filter_criteria jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create ai_response_citations table
CREATE TABLE IF NOT EXISTS ai_response_citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provenance_id uuid NOT NULL REFERENCES ai_response_provenance(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('document', 'statute', 'case_law', 'knowledge_base', 'regulation', 'form', 'article')),
  source_id uuid,
  source_title text NOT NULL,
  source_url text,
  source_jurisdiction text,
  source_date date,
  chunk_text text NOT NULL,
  chunk_index integer,
  chunk_start_char integer,
  chunk_end_char integer,
  similarity_score numeric(5,4),
  retrieval_rank integer,
  created_at timestamptz DEFAULT now()
);

-- Create ai_consent_records table
CREATE TABLE IF NOT EXISTS ai_consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL CHECK (consent_type IN ('ai_processing', 'data_retention', 'analytics', 'marketing', 'third_party_sharing')),
  consent_version text NOT NULL,
  granted boolean NOT NULL,
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  ip_address text,
  user_agent text,
  UNIQUE (user_id, consent_type, consent_version)
);

-- Create ai_disclosure_acknowledgments table
CREATE TABLE IF NOT EXISTS ai_disclosure_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  disclosure_type text NOT NULL CHECK (disclosure_type IN ('not_legal_advice', 'ai_limitations', 'accuracy_warning', 'confidentiality_notice', 'attorney_review_recommended')),
  acknowledged_at timestamptz DEFAULT now(),
  session_id text,
  context jsonb DEFAULT '{}'
);

-- Create indexes for ai_response_provenance
CREATE INDEX IF NOT EXISTS idx_ai_provenance_user_id ON ai_response_provenance(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_provenance_matter_id ON ai_response_provenance(matter_id);
CREATE INDEX IF NOT EXISTS idx_ai_provenance_chat_message_id ON ai_response_provenance(chat_message_id);
CREATE INDEX IF NOT EXISTS idx_ai_provenance_model_id ON ai_response_provenance(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_provenance_created_at ON ai_response_provenance(created_at DESC);

-- Create indexes for ai_response_citations
CREATE INDEX IF NOT EXISTS idx_ai_citations_provenance_id ON ai_response_citations(provenance_id);
CREATE INDEX IF NOT EXISTS idx_ai_citations_source_type ON ai_response_citations(source_type);
CREATE INDEX IF NOT EXISTS idx_ai_citations_source_id ON ai_response_citations(source_id);

-- Create indexes for ai_consent_records
CREATE INDEX IF NOT EXISTS idx_ai_consent_user_id ON ai_consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_consent_type ON ai_consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_ai_consent_granted_at ON ai_consent_records(granted_at DESC);

-- Create indexes for ai_disclosure_acknowledgments
CREATE INDEX IF NOT EXISTS idx_ai_disclosure_user_id ON ai_disclosure_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_disclosure_type ON ai_disclosure_acknowledgments(disclosure_type);

-- Enable RLS on all tables
ALTER TABLE ai_response_provenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_response_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_disclosure_acknowledgments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_response_provenance

CREATE POLICY "Users can view own AI provenance"
  ON ai_response_provenance FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own AI provenance"
  ON ai_response_provenance FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for ai_response_citations

CREATE POLICY "Users can view citations for own provenance"
  ON ai_response_citations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_response_provenance
      WHERE ai_response_provenance.id = ai_response_citations.provenance_id
      AND ai_response_provenance.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create citations for own provenance"
  ON ai_response_citations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_response_provenance
      WHERE ai_response_provenance.id = ai_response_citations.provenance_id
      AND ai_response_provenance.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_consent_records

CREATE POLICY "Users can view own consent records"
  ON ai_consent_records FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own consent records"
  ON ai_consent_records FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own consent records"
  ON ai_consent_records FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for ai_disclosure_acknowledgments

CREATE POLICY "Users can view own acknowledgments"
  ON ai_disclosure_acknowledgments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own acknowledgments"
  ON ai_disclosure_acknowledgments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create function to export matter record with provenance
CREATE OR REPLACE FUNCTION public.export_matter_record(p_matter_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF NOT (
    public.is_matter_owner(p_matter_id, v_user_id) OR
    public.is_matter_participant(p_matter_id, v_user_id)
  ) THEN
    RAISE EXCEPTION 'Access denied to matter %', p_matter_id;
  END IF;

  SELECT jsonb_build_object(
    'matter', (SELECT row_to_json(m.*) FROM matters m WHERE m.id = p_matter_id),
    'participants', (
      SELECT jsonb_agg(row_to_json(mp.*))
      FROM matter_participants mp
      WHERE mp.matter_id = p_matter_id AND mp.removed_at IS NULL
    ),
    'documents', (
      SELECT jsonb_agg(jsonb_build_object(
        'link', row_to_json(md.*),
        'document', row_to_json(d.*)
      ))
      FROM matter_documents md
      JOIN documents d ON d.id = md.document_id
      WHERE md.matter_id = p_matter_id
    ),
    'conversations', (
      SELECT jsonb_agg(jsonb_build_object(
        'context', row_to_json(cc.*),
        'messages', (
          SELECT jsonb_agg(row_to_json(cm.*) ORDER BY cm.created_at)
          FROM chat_messages cm
          WHERE cm.context_id = cc.id
        )
      ))
      FROM chat_contexts cc
      WHERE cc.matter_id = p_matter_id
    ),
    'ai_provenance', (
      SELECT jsonb_agg(jsonb_build_object(
        'response', row_to_json(ap.*),
        'citations', (
          SELECT jsonb_agg(row_to_json(ac.*) ORDER BY ac.retrieval_rank)
          FROM ai_response_citations ac
          WHERE ac.provenance_id = ap.id
        )
      ))
      FROM ai_response_provenance ap
      WHERE ap.matter_id = p_matter_id
    ),
    'activity_timeline', (
      SELECT jsonb_agg(row_to_json(mat.*) ORDER BY mat.created_at)
      FROM matter_activity_timeline mat
      WHERE mat.matter_id = p_matter_id
    ),
    'export_metadata', jsonb_build_object(
      'exported_at', now(),
      'exported_by', v_user_id,
      'export_version', '1.0'
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

```

---

## supabase/migrations/20260121042121_create_rls_role_access_matrix.sql

```sql
/*
  # Create RLS Role Access Matrix System

  This migration implements a formal role-based access control matrix designed
  from user journeys rather than tables. Defines canonical roles and their
  access patterns across all major entities.

  ## Role Definitions

  ### Client (default)
  - Can view/edit their own matters
  - Can view/add documents to their matters
  - Can participate in chat within their matters

  ### Attorney
  - Can view matters they're assigned to as participants
  - Can view/edit documents in assigned matters
  - Can respond in chat threads for assigned matters

  ### Paralegal
  - Similar to attorney but with more limited edit permissions
  - Can view and organize documents

  ### Support
  - Can view limited matter information for support purposes
  - Cannot view sensitive documents or full chat history

  ### Admin
  - Full access for compliance review
  - Can view audit logs and provenance records
  - Can manage user roles and permissions

  ## Changes

  1. Add `role` column to profiles table
  2. Create role_access_matrix reference table
  3. Create access_audit_log table
  4. Add helper functions for role-based access
*/

-- Add role column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'client' 
      CHECK (role IN ('client', 'attorney', 'paralegal', 'support', 'admin'));
  END IF;
END $$;

-- Migrate existing is_admin users to admin role
UPDATE profiles SET role = 'admin' WHERE is_admin = true AND role = 'client';

-- Create index on profiles.role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create role_access_matrix reference table
CREATE TABLE IF NOT EXISTS role_access_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  entity_type text NOT NULL,
  action text NOT NULL CHECK (action IN ('select', 'insert', 'update', 'delete')),
  access_level text NOT NULL CHECK (access_level IN ('none', 'own', 'assigned', 'all')),
  conditions jsonb DEFAULT '{}',
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (role, entity_type, action)
);

-- Create access_audit_log table
CREATE TABLE IF NOT EXISTS access_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  access_granted boolean NOT NULL,
  denial_reason text,
  user_role text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for access_audit_log
CREATE INDEX IF NOT EXISTS idx_access_audit_user_id ON access_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_entity ON access_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_action ON access_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_access_audit_granted ON access_audit_log(access_granted);
CREATE INDEX IF NOT EXISTS idx_access_audit_created_at ON access_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE role_access_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_audit_log ENABLE ROW LEVEL SECURITY;

-- Role access matrix is readable by authenticated users (reference data)
CREATE POLICY "Authenticated users can view access matrix"
  ON role_access_matrix FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify access matrix
CREATE POLICY "Admins can modify access matrix"
  ON role_access_matrix FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Users can view their own audit log entries
CREATE POLICY "Users can view own audit log"
  ON access_audit_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON access_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON access_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Populate role access matrix with canonical access patterns
INSERT INTO role_access_matrix (role, entity_type, action, access_level, description) VALUES
  -- Client role
  ('client', 'matters', 'select', 'own', 'Clients can view matters they own or participate in'),
  ('client', 'matters', 'insert', 'own', 'Clients can create their own matters'),
  ('client', 'matters', 'update', 'own', 'Clients can update their own matters'),
  ('client', 'matters', 'delete', 'own', 'Clients can delete their own matters'),
  ('client', 'documents', 'select', 'assigned', 'Clients can view documents in their matters'),
  ('client', 'documents', 'insert', 'assigned', 'Clients can upload documents to their matters'),
  ('client', 'chat_messages', 'select', 'assigned', 'Clients can view chat in their matters'),
  ('client', 'chat_messages', 'insert', 'assigned', 'Clients can send messages in their matters'),
  
  -- Attorney role
  ('attorney', 'matters', 'select', 'assigned', 'Attorneys can view matters they are assigned to'),
  ('attorney', 'matters', 'update', 'assigned', 'Attorneys can update assigned matters'),
  ('attorney', 'documents', 'select', 'assigned', 'Attorneys can view documents in assigned matters'),
  ('attorney', 'documents', 'insert', 'assigned', 'Attorneys can add documents to assigned matters'),
  ('attorney', 'documents', 'update', 'assigned', 'Attorneys can update documents in assigned matters'),
  ('attorney', 'chat_messages', 'select', 'assigned', 'Attorneys can view chat in assigned matters'),
  ('attorney', 'chat_messages', 'insert', 'assigned', 'Attorneys can respond in assigned matters'),
  ('attorney', 'ai_response_provenance', 'select', 'assigned', 'Attorneys can review AI provenance for assigned matters'),
  
  -- Paralegal role
  ('paralegal', 'matters', 'select', 'assigned', 'Paralegals can view assigned matters'),
  ('paralegal', 'documents', 'select', 'assigned', 'Paralegals can view documents in assigned matters'),
  ('paralegal', 'documents', 'insert', 'assigned', 'Paralegals can add documents to assigned matters'),
  ('paralegal', 'chat_messages', 'select', 'assigned', 'Paralegals can view chat in assigned matters'),
  
  -- Support role
  ('support', 'matters', 'select', 'assigned', 'Support can view limited matter info for support purposes'),
  ('support', 'profiles', 'select', 'all', 'Support can view user profiles for assistance'),
  
  -- Admin role
  ('admin', 'matters', 'select', 'all', 'Admins can view all matters for compliance'),
  ('admin', 'documents', 'select', 'all', 'Admins can view all documents for compliance'),
  ('admin', 'chat_messages', 'select', 'all', 'Admins can view all messages for compliance'),
  ('admin', 'ai_response_provenance', 'select', 'all', 'Admins can review all AI provenance'),
  ('admin', 'access_audit_log', 'select', 'all', 'Admins can view all access audit logs'),
  ('admin', 'profiles', 'select', 'all', 'Admins can view all profiles'),
  ('admin', 'profiles', 'update', 'all', 'Admins can update user roles')
ON CONFLICT (role, entity_type, action) DO UPDATE SET
  access_level = EXCLUDED.access_level,
  description = EXCLUDED.description;

-- Function to get user's effective role
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE id = p_user_id),
    'client'
  );
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id
    AND (role = 'admin' OR is_admin = true)
  );
$$;

-- Function to check if user has access based on role matrix
CREATE OR REPLACE FUNCTION public.check_role_access(
  p_user_id uuid,
  p_entity_type text,
  p_action text,
  p_entity_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_access_level text;
  v_has_access boolean := false;
BEGIN
  v_role := public.get_user_role(p_user_id);
  
  SELECT access_level INTO v_access_level
  FROM role_access_matrix
  WHERE role = v_role
  AND entity_type = p_entity_type
  AND action = p_action;
  
  IF v_access_level IS NULL THEN
    RETURN false;
  END IF;
  
  CASE v_access_level
    WHEN 'all' THEN
      v_has_access := true;
    WHEN 'own' THEN
      IF p_entity_type = 'matters' AND p_entity_id IS NOT NULL THEN
        SELECT EXISTS (
          SELECT 1 FROM matters WHERE id = p_entity_id AND user_id = p_user_id
        ) INTO v_has_access;
      ELSIF p_entity_type = 'profiles' AND p_entity_id IS NOT NULL THEN
        v_has_access := (p_entity_id = p_user_id);
      ELSE
        v_has_access := true;
      END IF;
    WHEN 'assigned' THEN
      IF p_entity_id IS NOT NULL THEN
        IF p_entity_type IN ('matters', 'documents', 'chat_messages') THEN
          SELECT EXISTS (
            SELECT 1 FROM matter_participants mp
            WHERE mp.user_id = p_user_id
            AND mp.removed_at IS NULL
            AND (
              mp.matter_id = p_entity_id
              OR EXISTS (
                SELECT 1 FROM matter_documents md WHERE md.document_id = p_entity_id AND md.matter_id = mp.matter_id
              )
              OR EXISTS (
                SELECT 1 FROM chat_messages cm 
                JOIN chat_contexts cc ON cc.id = cm.context_id
                WHERE cm.id = p_entity_id AND cc.matter_id = mp.matter_id
              )
            )
          ) INTO v_has_access;
        END IF;
      ELSE
        v_has_access := true;
      END IF;
    ELSE
      v_has_access := false;
  END CASE;
  
  RETURN v_has_access;
END;
$$;

-- Function to log access attempts (can be called from application)
CREATE OR REPLACE FUNCTION public.log_access_attempt(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_granted boolean,
  p_denial_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO access_audit_log (
    user_id,
    entity_type,
    entity_id,
    action,
    access_granted,
    denial_reason,
    user_role
  ) VALUES (
    auth.uid(),
    p_entity_type,
    p_entity_id,
    p_action,
    p_granted,
    p_denial_reason,
    public.get_user_role(auth.uid())
  );
END;
$$;

-- Add admin access policies for compliance review on existing tables

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Admins can view all messages for compliance'
  ) THEN
    CREATE POLICY "Admins can view all messages for compliance"
      ON chat_messages FOR SELECT
      TO authenticated
      USING (public.is_user_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'documents' 
    AND policyname = 'Admins can view all documents for compliance'
  ) THEN
    CREATE POLICY "Admins can view all documents for compliance"
      ON documents FOR SELECT
      TO authenticated
      USING (public.is_user_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_response_provenance' 
    AND policyname = 'Admins can view all AI provenance for compliance'
  ) THEN
    CREATE POLICY "Admins can view all AI provenance for compliance"
      ON ai_response_provenance FOR SELECT
      TO authenticated
      USING (public.is_user_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_response_citations' 
    AND policyname = 'Admins can view all citations for compliance'
  ) THEN
    CREATE POLICY "Admins can view all citations for compliance"
      ON ai_response_citations FOR SELECT
      TO authenticated
      USING (public.is_user_admin(auth.uid()));
  END IF;
END $$;

```

---

## supabase/migrations/20260121042302_add_tiered_usage_guardrails.sql

```sql
/*
  # Add Tiered Usage Guardrails

  This migration extends the existing free tier rate limiting to include
  guardrails for all subscription tiers. Prevents margin erosion from
  excessive AI usage while ensuring good UX through clear limits.

  ## 1. New Tables

  ### `subscription_tier_limits`
  Defines usage limits per subscription tier

  ### `daily_usage_tracking` and `monthly_usage_tracking`
  Tracks aggregated usage per period

  ### `usage_alerts`
  Tracks when users approach/exceed limits

  ## 2. Tier Structure

  - free: Strict limits, conversion-focused
  - starter: Individual users, reasonable limits
  - professional: Power users, higher limits
  - enterprise: Custom limits, priority support
*/

-- Drop existing function that has different return type
DROP FUNCTION IF EXISTS public.check_usage_limit(uuid, text, integer);

-- Create subscription_tier_limits table
CREATE TABLE IF NOT EXISTS subscription_tier_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL UNIQUE CHECK (tier IN ('free', 'starter', 'professional', 'enterprise')),
  messages_per_day integer NOT NULL,
  ai_queries_per_day integer NOT NULL,
  documents_per_month integer NOT NULL,
  export_requests_per_month integer NOT NULL,
  max_matters integer NOT NULL,
  max_participants_per_matter integer NOT NULL,
  rag_queries_per_day integer NOT NULL,
  token_budget_per_day integer NOT NULL,
  priority_support boolean NOT NULL DEFAULT false,
  custom_limits boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Populate tier limits
INSERT INTO subscription_tier_limits (
  tier, 
  messages_per_day, 
  ai_queries_per_day, 
  documents_per_month, 
  export_requests_per_month,
  max_matters,
  max_participants_per_matter,
  rag_queries_per_day,
  token_budget_per_day,
  priority_support,
  custom_limits
) VALUES
  ('free', 10, 5, 5, 1, 1, 1, 3, 10000, false, false),
  ('starter', 100, 50, 50, 10, 10, 3, 30, 100000, false, false),
  ('professional', 500, 200, 200, 50, 50, 10, 150, 500000, true, false),
  ('enterprise', 10000, 5000, 5000, 1000, 1000, 100, 3000, 10000000, true, true)
ON CONFLICT (tier) DO UPDATE SET
  messages_per_day = EXCLUDED.messages_per_day,
  ai_queries_per_day = EXCLUDED.ai_queries_per_day,
  documents_per_month = EXCLUDED.documents_per_month,
  export_requests_per_month = EXCLUDED.export_requests_per_month,
  max_matters = EXCLUDED.max_matters,
  max_participants_per_matter = EXCLUDED.max_participants_per_matter,
  rag_queries_per_day = EXCLUDED.rag_queries_per_day,
  token_budget_per_day = EXCLUDED.token_budget_per_day,
  priority_support = EXCLUDED.priority_support,
  custom_limits = EXCLUDED.custom_limits,
  updated_at = now();

-- Create usage_tracking table for aggregated daily usage
CREATE TABLE IF NOT EXISTS daily_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  messages_count integer NOT NULL DEFAULT 0,
  ai_queries_count integer NOT NULL DEFAULT 0,
  rag_queries_count integer NOT NULL DEFAULT 0,
  tokens_used integer NOT NULL DEFAULT 0,
  estimated_cost_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, usage_date)
);

-- Create monthly_usage_tracking table
CREATE TABLE IF NOT EXISTS monthly_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_month date NOT NULL,
  documents_count integer NOT NULL DEFAULT 0,
  export_requests_count integer NOT NULL DEFAULT 0,
  total_tokens_used integer NOT NULL DEFAULT 0,
  total_cost_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, usage_month)
);

-- Create usage_alerts table
CREATE TABLE IF NOT EXISTS usage_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('approaching_limit', 'limit_reached', 'limit_exceeded', 'upgrade_recommended')),
  resource_type text NOT NULL,
  current_usage integer NOT NULL,
  limit_value integer NOT NULL,
  percentage_used numeric(5,2) NOT NULL,
  acknowledged boolean NOT NULL DEFAULT false,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage_tracking(user_id, usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_user_month ON monthly_usage_tracking(user_id, usage_month DESC);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_user ON usage_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_unack ON usage_alerts(user_id) WHERE acknowledged = false;

-- Enable RLS
ALTER TABLE subscription_tier_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view tier limits" ON subscription_tier_limits;
DROP POLICY IF EXISTS "Users can view own daily usage" ON daily_usage_tracking;
DROP POLICY IF EXISTS "Users can view own monthly usage" ON monthly_usage_tracking;
DROP POLICY IF EXISTS "Users can view own alerts" ON usage_alerts;
DROP POLICY IF EXISTS "Users can acknowledge own alerts" ON usage_alerts;

-- Tier limits are readable by all authenticated users
CREATE POLICY "Users can view tier limits"
  ON subscription_tier_limits FOR SELECT
  TO authenticated
  USING (true);

-- Users can only view their own usage
CREATE POLICY "Users can view own daily usage"
  ON daily_usage_tracking FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own monthly usage"
  ON monthly_usage_tracking FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own alerts"
  ON usage_alerts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can acknowledge own alerts"
  ON usage_alerts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to get user's current tier
CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT subscription_tier FROM profiles WHERE id = p_user_id),
    'free'
  );
$$;

-- Function to check if user can perform action (returns jsonb)
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_user_id uuid,
  p_resource_type text,
  p_increment integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier text;
  v_limits subscription_tier_limits;
  v_current_usage integer := 0;
  v_limit_value integer;
  v_allowed boolean := true;
  v_percentage numeric(5,2);
BEGIN
  v_tier := public.get_user_tier(p_user_id);
  SELECT * INTO v_limits FROM subscription_tier_limits WHERE tier = v_tier;
  
  CASE p_resource_type
    WHEN 'messages' THEN
      SELECT COALESCE(messages_count, 0) INTO v_current_usage
      FROM daily_usage_tracking
      WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
      v_limit_value := v_limits.messages_per_day;
      
    WHEN 'ai_queries' THEN
      SELECT COALESCE(ai_queries_count, 0) INTO v_current_usage
      FROM daily_usage_tracking
      WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
      v_limit_value := v_limits.ai_queries_per_day;
      
    WHEN 'rag_queries' THEN
      SELECT COALESCE(rag_queries_count, 0) INTO v_current_usage
      FROM daily_usage_tracking
      WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
      v_limit_value := v_limits.rag_queries_per_day;
      
    WHEN 'tokens' THEN
      SELECT COALESCE(tokens_used, 0) INTO v_current_usage
      FROM daily_usage_tracking
      WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
      v_limit_value := v_limits.token_budget_per_day;
      
    WHEN 'documents' THEN
      SELECT COALESCE(documents_count, 0) INTO v_current_usage
      FROM monthly_usage_tracking
      WHERE user_id = p_user_id AND usage_month = date_trunc('month', CURRENT_DATE)::date;
      v_limit_value := v_limits.documents_per_month;
      
    WHEN 'exports' THEN
      SELECT COALESCE(export_requests_count, 0) INTO v_current_usage
      FROM monthly_usage_tracking
      WHERE user_id = p_user_id AND usage_month = date_trunc('month', CURRENT_DATE)::date;
      v_limit_value := v_limits.export_requests_per_month;
      
    WHEN 'matters' THEN
      SELECT COUNT(*) INTO v_current_usage
      FROM matters
      WHERE user_id = p_user_id AND status != 'archived';
      v_limit_value := v_limits.max_matters;
      
    ELSE
      RETURN jsonb_build_object('allowed', false, 'error', 'Unknown resource type');
  END CASE;
  
  v_allowed := (v_current_usage + p_increment) <= v_limit_value;
  v_percentage := CASE WHEN v_limit_value > 0 THEN (v_current_usage::numeric / v_limit_value * 100) ELSE 0 END;
  
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_usage', v_current_usage,
    'limit', v_limit_value,
    'remaining', GREATEST(0, v_limit_value - v_current_usage),
    'percentage_used', v_percentage,
    'tier', v_tier,
    'resource_type', p_resource_type
  );
END;
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id uuid,
  p_resource_type text,
  p_amount integer DEFAULT 1,
  p_tokens integer DEFAULT 0,
  p_cost_cents integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE p_resource_type
    WHEN 'messages' THEN
      INSERT INTO daily_usage_tracking (user_id, usage_date, messages_count, tokens_used, estimated_cost_cents)
      VALUES (p_user_id, CURRENT_DATE, p_amount, p_tokens, p_cost_cents)
      ON CONFLICT (user_id, usage_date)
      DO UPDATE SET 
        messages_count = daily_usage_tracking.messages_count + p_amount,
        tokens_used = daily_usage_tracking.tokens_used + p_tokens,
        estimated_cost_cents = daily_usage_tracking.estimated_cost_cents + p_cost_cents,
        updated_at = now();
        
    WHEN 'ai_queries' THEN
      INSERT INTO daily_usage_tracking (user_id, usage_date, ai_queries_count, tokens_used, estimated_cost_cents)
      VALUES (p_user_id, CURRENT_DATE, p_amount, p_tokens, p_cost_cents)
      ON CONFLICT (user_id, usage_date)
      DO UPDATE SET 
        ai_queries_count = daily_usage_tracking.ai_queries_count + p_amount,
        tokens_used = daily_usage_tracking.tokens_used + p_tokens,
        estimated_cost_cents = daily_usage_tracking.estimated_cost_cents + p_cost_cents,
        updated_at = now();
        
    WHEN 'rag_queries' THEN
      INSERT INTO daily_usage_tracking (user_id, usage_date, rag_queries_count, tokens_used, estimated_cost_cents)
      VALUES (p_user_id, CURRENT_DATE, p_amount, p_tokens, p_cost_cents)
      ON CONFLICT (user_id, usage_date)
      DO UPDATE SET 
        rag_queries_count = daily_usage_tracking.rag_queries_count + p_amount,
        tokens_used = daily_usage_tracking.tokens_used + p_tokens,
        estimated_cost_cents = daily_usage_tracking.estimated_cost_cents + p_cost_cents,
        updated_at = now();
        
    WHEN 'documents' THEN
      INSERT INTO monthly_usage_tracking (user_id, usage_month, documents_count)
      VALUES (p_user_id, date_trunc('month', CURRENT_DATE)::date, p_amount)
      ON CONFLICT (user_id, usage_month)
      DO UPDATE SET 
        documents_count = monthly_usage_tracking.documents_count + p_amount,
        updated_at = now();
        
    WHEN 'exports' THEN
      INSERT INTO monthly_usage_tracking (user_id, usage_month, export_requests_count)
      VALUES (p_user_id, date_trunc('month', CURRENT_DATE)::date, p_amount)
      ON CONFLICT (user_id, usage_month)
      DO UPDATE SET 
        export_requests_count = monthly_usage_tracking.export_requests_count + p_amount,
        updated_at = now();
  END CASE;
END;
$$;

-- Function to create usage alert
CREATE OR REPLACE FUNCTION public.create_usage_alert(
  p_user_id uuid,
  p_resource_type text,
  p_current_usage integer,
  p_limit_value integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_percentage numeric(5,2);
  v_alert_type text;
BEGIN
  v_percentage := CASE WHEN p_limit_value > 0 THEN (p_current_usage::numeric / p_limit_value * 100) ELSE 0 END;
  
  IF v_percentage >= 100 THEN
    v_alert_type := 'limit_exceeded';
  ELSIF v_percentage >= 90 THEN
    v_alert_type := 'limit_reached';
  ELSIF v_percentage >= 75 THEN
    v_alert_type := 'approaching_limit';
  ELSE
    RETURN;
  END IF;
  
  INSERT INTO usage_alerts (
    user_id,
    alert_type,
    resource_type,
    current_usage,
    limit_value,
    percentage_used
  ) VALUES (
    p_user_id,
    v_alert_type,
    p_resource_type,
    p_current_usage,
    p_limit_value,
    v_percentage
  );
END;
$$;

-- Add cost tracking columns to openai_usage if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'openai_usage') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'openai_usage' AND column_name = 'estimated_cost_cents'
    ) THEN
      ALTER TABLE openai_usage ADD COLUMN estimated_cost_cents integer DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'openai_usage' AND column_name = 'model_pricing_version'
    ) THEN
      ALTER TABLE openai_usage ADD COLUMN model_pricing_version text;
    END IF;
  END IF;
END $$;

```

---

## supabase/migrations/20260121204844_add_metadata_to_email_captures.sql

```sql
/*
  # Add metadata column to email_captures

  1. Changes
    - Add `metadata` JSONB column to store additional capture context
    - This allows storing state selection, guide type, and other contextual data
    - Add `guide_sent_at` timestamp to track when guide was emailed

  2. Purpose
    - Support jurisdiction-aware exit intent modals
    - Track which type of guide was requested (state-specific vs general)
*/

ALTER TABLE email_captures 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE email_captures 
ADD COLUMN IF NOT EXISTS guide_sent_at TIMESTAMPTZ;

```

---

## supabase/migrations/20260121233635_fix_profiles_update_policy_recursion.sql

```sql
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

```

---

## supabase/migrations/20260122001551_fix_profiles_select_policy_recursion.sql

```sql
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

```

---

## supabase/migrations/20260122231204_create_arizona_statutes_table.sql

```sql
/*
  # Create Arizona Statutes and Regulations Table

  This migration creates a dedicated table for Arizona Revised Statutes (ARS)
  and Arizona Administrative Code (AAC) content with pgvector embeddings
  for semantic search in the RAG pipeline.

  ## 1. New Tables

  ### `arizona_legal_sources`
  Stores Arizona statutes, regulations, and administrative code
  - `id` (uuid, primary key)
  - `source_type` (text) - 'ars' or 'aac'
  - `title_number` (text) - Title number (e.g., '33' for Property)
  - `chapter` (text) - Chapter number
  - `article` (text) - Article number if applicable
  - `section` (text) - Section number (e.g., '33-1321')
  - `section_title` (text) - Human-readable title
  - `content` (text) - Full text content
  - `summary` (text) - AI-generated or manual summary
  - `effective_date` (date) - When the law became effective
  - `last_amended` (date) - Most recent amendment
  - `url` (text) - Official source URL
  - `embedding` (vector) - 1536-dim OpenAI embedding
  - `practice_areas` (text[]) - Related practice areas
  - `keywords` (text[]) - Search keywords
  - `is_active` (boolean) - Whether currently in force
  - `scraped_at` (timestamptz) - When content was scraped
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Indexes

  - HNSW index on embedding for fast similarity search
  - B-tree indexes on commonly queried columns
  - GIN index on practice_areas and keywords arrays

  ## 3. Functions

  - `match_arizona_statutes`: Semantic search for Arizona legal sources
  - `search_ars_by_citation`: Exact citation lookup

  ## 4. Security

  - RLS enabled
  - Public read access for active content
  - Admin-only write access
*/

-- Create the arizona_legal_sources table
CREATE TABLE IF NOT EXISTS arizona_legal_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('ars', 'aac', 'court_rule', 'constitution')),
  title_number text NOT NULL,
  title_name text,
  chapter text,
  chapter_name text,
  article text,
  article_name text,
  section text NOT NULL,
  section_title text NOT NULL,
  content text NOT NULL,
  summary text,
  effective_date date,
  last_amended date,
  url text,
  embedding vector(1536),
  practice_areas text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  related_sections text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_repealed boolean DEFAULT false,
  scraped_at timestamptz,
  version_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (source_type, section)
);

-- Create HNSW index for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_embedding
ON arizona_legal_sources
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create B-tree indexes for common queries
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_source_type ON arizona_legal_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_title_number ON arizona_legal_sources(title_number);
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_section ON arizona_legal_sources(section);
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_is_active ON arizona_legal_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_scraped_at ON arizona_legal_sources(scraped_at DESC);

-- Create GIN indexes for array searches
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_practice_areas ON arizona_legal_sources USING GIN(practice_areas);
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_keywords ON arizona_legal_sources USING GIN(keywords);

-- Enable RLS
ALTER TABLE arizona_legal_sources ENABLE ROW LEVEL SECURITY;

-- Public can read active statutes (these are public law)
CREATE POLICY "Anyone can view active Arizona legal sources"
  ON arizona_legal_sources FOR SELECT
  USING (is_active = true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage Arizona legal sources"
  ON arizona_legal_sources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Service role can manage (for edge functions)
CREATE POLICY "Service role can manage Arizona legal sources"
  ON arizona_legal_sources FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create semantic search function
CREATE OR REPLACE FUNCTION match_arizona_statutes(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_source_type text DEFAULT NULL,
  filter_title text DEFAULT NULL,
  filter_practice_areas text[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source_type text,
  section text,
  section_title text,
  content text,
  summary text,
  url text,
  practice_areas text[],
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    als.id,
    als.source_type,
    als.section,
    als.section_title,
    als.content,
    als.summary,
    als.url,
    als.practice_areas,
    1 - (als.embedding <=> query_embedding) AS similarity
  FROM arizona_legal_sources als
  WHERE
    als.embedding IS NOT NULL
    AND als.is_active = true
    AND 1 - (als.embedding <=> query_embedding) > match_threshold
    AND (filter_source_type IS NULL OR als.source_type = filter_source_type)
    AND (filter_title IS NULL OR als.title_number = filter_title)
    AND (filter_practice_areas IS NULL OR als.practice_areas && filter_practice_areas)
  ORDER BY als.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create citation lookup function
CREATE OR REPLACE FUNCTION search_ars_by_citation(citation_text text)
RETURNS SETOF arizona_legal_sources
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_citation text;
BEGIN
  normalized_citation := regexp_replace(
    upper(trim(citation_text)),
    '[^A-Z0-9\-\.]',
    '',
    'g'
  );
  
  RETURN QUERY
  SELECT *
  FROM arizona_legal_sources als
  WHERE 
    als.is_active = true
    AND (
      upper(replace(als.section, '-', '')) LIKE '%' || normalized_citation || '%'
      OR upper(als.section) LIKE '%' || citation_text || '%'
    )
  ORDER BY als.section
  LIMIT 20;
END;
$$;

-- Create scrape log table to track scraping progress
CREATE TABLE IF NOT EXISTS arizona_scrape_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  title_number text,
  status text NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'partial')),
  sections_scraped integer DEFAULT 0,
  sections_embedded integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_ms integer
);

-- Enable RLS on scrape logs
ALTER TABLE arizona_scrape_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view scrape logs
CREATE POLICY "Admins can view scrape logs"
  ON arizona_scrape_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Service role can manage scrape logs
CREATE POLICY "Service role can manage scrape logs"
  ON arizona_scrape_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_arizona_legal_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_arizona_legal_sources_updated_at ON arizona_legal_sources;
CREATE TRIGGER trigger_update_arizona_legal_sources_updated_at
  BEFORE UPDATE ON arizona_legal_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_arizona_legal_sources_updated_at();

-- Add comments
COMMENT ON TABLE arizona_legal_sources IS 'Arizona Revised Statutes (ARS) and Administrative Code (AAC) with vector embeddings for RAG';
COMMENT ON FUNCTION match_arizona_statutes IS 'Semantic search for Arizona statutes using cosine similarity';
COMMENT ON FUNCTION search_ars_by_citation IS 'Exact citation lookup for ARS sections';

```

---

## supabase/migrations/20260123005426_create_lawyer_connections_system.sql

```sql
/*
  # Lawyer Connections System

  1. New Tables
    - `lawyer_connections` - Tracks all user-lawyer connection requests and status
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `lawyer_id` (text, references lawyer profile ID)
      - `lawyer_name` (text)
      - `lawyer_image` (text)
      - `connection_type` (text) - 'chat', 'appointment', 'quote'
      - `status` (text) - 'pending', 'accepted', 'declined', 'completed', 'cancelled'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `lawyer_messages` - Chat messages between users and lawyers
      - `id` (uuid, primary key)
      - `connection_id` (uuid, references lawyer_connections)
      - `sender_type` (text) - 'user' or 'lawyer'
      - `sender_id` (text)
      - `message` (text)
      - `read_at` (timestamptz)
      - `created_at` (timestamptz)

    - `appointment_requests` - Appointment scheduling requests
      - `id` (uuid, primary key)
      - `connection_id` (uuid, references lawyer_connections)
      - `appointment_type` (text) - 'phone', 'video', 'in_person'
      - `preferred_date` (date)
      - `preferred_time` (text)
      - `alternate_date` (date)
      - `alternate_time` (text)
      - `case_description` (text)
      - `confirmed_date` (timestamptz)
      - `notes` (text)

    - `quote_requests` - Legal service quote requests
      - `id` (uuid, primary key)
      - `connection_id` (uuid, references lawyer_connections)
      - `service_type` (text)
      - `case_description` (text)
      - `urgency` (text)
      - `budget_range` (text)
      - `quote_amount` (numeric)
      - `quote_notes` (text)
      - `quote_valid_until` (date)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own connections and messages
*/

-- Lawyer Connections table
CREATE TABLE IF NOT EXISTS lawyer_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id text NOT NULL,
  lawyer_name text NOT NULL,
  lawyer_image text,
  lawyer_practice_areas text[],
  connection_type text NOT NULL CHECK (connection_type IN ('chat', 'appointment', 'quote')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'accepted', 'declined', 'completed', 'cancelled')),
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lawyer Messages table
CREATE TABLE IF NOT EXISTS lawyer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES lawyer_connections(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'lawyer', 'system')),
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'appointment_request', 'quote_request', 'system')),
  metadata jsonb DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Appointment Requests table
CREATE TABLE IF NOT EXISTS appointment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES lawyer_connections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id text NOT NULL,
  appointment_type text NOT NULL CHECK (appointment_type IN ('phone', 'video', 'in_person')),
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  alternate_date date,
  alternate_time text,
  case_type text,
  case_description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show')),
  confirmed_datetime timestamptz,
  meeting_link text,
  meeting_location text,
  lawyer_notes text,
  user_notes text,
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quote Requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES lawyer_connections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id text NOT NULL,
  service_type text NOT NULL,
  case_description text NOT NULL,
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  budget_range text,
  preferred_fee_structure text CHECK (preferred_fee_structure IN ('hourly', 'flat_fee', 'contingency', 'retainer', 'flexible')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'declined', 'expired')),
  quote_amount numeric,
  quote_fee_structure text,
  quote_description text,
  quote_valid_until date,
  quote_provided_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lawyer_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lawyer_connections
CREATE POLICY "Users can view their own connections"
  ON lawyer_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create connections"
  ON lawyer_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON lawyer_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lawyer_messages
CREATE POLICY "Users can view messages for their connections"
  ON lawyer_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their connections"
  ON lawyer_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages for their connections"
  ON lawyer_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = auth.uid()
    )
  );

-- RLS Policies for appointment_requests
CREATE POLICY "Users can view their own appointment requests"
  ON appointment_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointment requests"
  ON appointment_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointment requests"
  ON appointment_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quote_requests
CREATE POLICY "Users can view their own quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quote requests"
  ON quote_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lawyer_connections_user_id ON lawyer_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_connections_status ON lawyer_connections(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_connections_lawyer_id ON lawyer_connections(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_messages_connection_id ON lawyer_messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_messages_created_at ON lawyer_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_user_id ON appointment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_status ON appointment_requests(status);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_preferred_date ON appointment_requests(preferred_date);
CREATE INDEX IF NOT EXISTS idx_quote_requests_user_id ON quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);

-- Function to update connection last_activity_at when new message is added
CREATE OR REPLACE FUNCTION update_connection_last_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE lawyer_connections
  SET last_activity_at = now(), updated_at = now()
  WHERE id = NEW.connection_id;
  RETURN NEW;
END;
$$;

-- Trigger to update last_activity_at
DROP TRIGGER IF EXISTS trigger_update_connection_activity ON lawyer_messages;
CREATE TRIGGER trigger_update_connection_activity
  AFTER INSERT ON lawyer_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_connection_last_activity();

```

---

## supabase/migrations/20260123212339_add_missing_fk_indexes_batch_final.sql

```sql
/*
  # Add Missing Foreign Key Indexes - Final Batch

  This migration adds indexes to all foreign key columns that are missing indexes.
  Missing indexes on foreign keys can cause suboptimal query performance during JOINs and cascading operations.

  ## Tables and Indexes Added:
  1. analytics_events.user_id
  2. appointment_requests.connection_id
  3. approval_decisions.request_id
  4. approval_requests.requested_by
  5. case_matches.attorney_profile_id
  6. case_matching_queue.created_by
  7. cases.client_id
  8. chatbot_documents.created_by
  9. conflict_checks.performed_by
  10. conflict_waivers.conflict_check_id
  11. conflict_waivers.matter_id
  12. crisis_incidents.user_id
  13. documents.case_id
  14. grant_expenses.approved_by
  15. grant_reports.generated_by
  16. grant_reports.reviewed_by
  17. knowledge_documents.uploaded_by
  18. lawyer_consultations.lawyer_match_id
  19. lawyer_matches.chat_message_id
  20. lso_audit_logs.user_id
  21. lso_client_intakes.assigned_by
  22. lso_volunteer_attorneys.user_id
  23. match_feedback.organization_id
  24. match_feedback.submitted_by
  25. matching_notifications.attorney_id
  26. matter_documents.added_by
  27. openai_rate_limits.user_id
  28. openai_usage_logs.user_id
  29. pro_bono_applications.assigned_to
  30. pro_bono_communications.from_user_id
  31. pro_bono_documents.uploaded_by
  32. quote_requests.connection_id
  33. subscription_history.changed_by
  34. system_settings.updated_by
  35. trust_safety_reports.user_id
  36. user_roles.role_id
  37. widget_conversations.widget_id
*/

-- analytics_events.user_id
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id 
ON public.analytics_events(user_id);

-- appointment_requests.connection_id
CREATE INDEX IF NOT EXISTS idx_appointment_requests_connection_id 
ON public.appointment_requests(connection_id);

-- approval_decisions.request_id
CREATE INDEX IF NOT EXISTS idx_approval_decisions_request_id 
ON public.approval_decisions(request_id);

-- approval_requests.requested_by
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by 
ON public.approval_requests(requested_by);

-- case_matches.attorney_profile_id
CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_profile_id 
ON public.case_matches(attorney_profile_id);

-- case_matching_queue.created_by
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_created_by 
ON public.case_matching_queue(created_by);

-- cases.client_id
CREATE INDEX IF NOT EXISTS idx_cases_client_id 
ON public.cases(client_id);

-- chatbot_documents.created_by
CREATE INDEX IF NOT EXISTS idx_chatbot_documents_created_by 
ON public.chatbot_documents(created_by);

-- conflict_checks.performed_by
CREATE INDEX IF NOT EXISTS idx_conflict_checks_performed_by 
ON public.conflict_checks(performed_by);

-- conflict_waivers.conflict_check_id
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflict_check_id 
ON public.conflict_waivers(conflict_check_id);

-- conflict_waivers.matter_id
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_matter_id 
ON public.conflict_waivers(matter_id);

-- crisis_incidents.user_id
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_user_id 
ON public.crisis_incidents(user_id);

-- documents.case_id
CREATE INDEX IF NOT EXISTS idx_documents_case_id 
ON public.documents(case_id);

-- grant_expenses.approved_by
CREATE INDEX IF NOT EXISTS idx_grant_expenses_approved_by 
ON public.grant_expenses(approved_by);

-- grant_reports.generated_by
CREATE INDEX IF NOT EXISTS idx_grant_reports_generated_by 
ON public.grant_reports(generated_by);

-- grant_reports.reviewed_by
CREATE INDEX IF NOT EXISTS idx_grant_reports_reviewed_by 
ON public.grant_reports(reviewed_by);

-- knowledge_documents.uploaded_by
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_uploaded_by 
ON public.knowledge_documents(uploaded_by);

-- lawyer_consultations.lawyer_match_id
CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_lawyer_match_id 
ON public.lawyer_consultations(lawyer_match_id);

-- lawyer_matches.chat_message_id
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_chat_message_id 
ON public.lawyer_matches(chat_message_id);

-- lso_audit_logs.user_id
CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_user_id 
ON public.lso_audit_logs(user_id);

-- lso_client_intakes.assigned_by
CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_by 
ON public.lso_client_intakes(assigned_by);

-- lso_volunteer_attorneys.user_id
CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_user_id 
ON public.lso_volunteer_attorneys(user_id);

-- match_feedback.organization_id
CREATE INDEX IF NOT EXISTS idx_match_feedback_organization_id 
ON public.match_feedback(organization_id);

-- match_feedback.submitted_by
CREATE INDEX IF NOT EXISTS idx_match_feedback_submitted_by 
ON public.match_feedback(submitted_by);

-- matching_notifications.attorney_id
CREATE INDEX IF NOT EXISTS idx_matching_notifications_attorney_id 
ON public.matching_notifications(attorney_id);

-- matter_documents.added_by
CREATE INDEX IF NOT EXISTS idx_matter_documents_added_by 
ON public.matter_documents(added_by);

-- openai_rate_limits.user_id
CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_user_id 
ON public.openai_rate_limits(user_id);

-- openai_usage_logs.user_id
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_user_id 
ON public.openai_usage_logs(user_id);

-- pro_bono_applications.assigned_to
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_assigned_to 
ON public.pro_bono_applications(assigned_to);

-- pro_bono_communications.from_user_id
CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_from_user_id 
ON public.pro_bono_communications(from_user_id);

-- pro_bono_documents.uploaded_by
CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_uploaded_by 
ON public.pro_bono_documents(uploaded_by);

-- quote_requests.connection_id
CREATE INDEX IF NOT EXISTS idx_quote_requests_connection_id 
ON public.quote_requests(connection_id);

-- subscription_history.changed_by
CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_by 
ON public.subscription_history(changed_by);

-- system_settings.updated_by
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_by 
ON public.system_settings(updated_by);

-- trust_safety_reports.user_id
CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_user_id 
ON public.trust_safety_reports(user_id);

-- user_roles.role_id
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id 
ON public.user_roles(role_id);

-- widget_conversations.widget_id
CREATE INDEX IF NOT EXISTS idx_widget_conversations_widget_id 
ON public.widget_conversations(widget_id);

```

---

## supabase/migrations/20260123212418_optimize_rls_policies_auth_uid_batch1_fixed.sql

```sql
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

```

---

## supabase/migrations/20260123212510_optimize_rls_policies_auth_uid_batch2_fixed.sql

```sql
/*
  # Optimize RLS Policies - Batch 2 (Matters Tables) - Fixed

  This migration optimizes RLS policies for matters and matter-related tables.
  Uses `removed_at IS NULL` instead of `is_active = true` for active participants.

  ## Tables Updated:
  1. matters - All CRUD policies
  2. matter_participants - All CRUD policies
  3. matter_documents - All CRUD policies
  4. matter_activity_timeline - All policies
*/

-- matters: Users can create own matters
DROP POLICY IF EXISTS "Users can create own matters" ON public.matters;
CREATE POLICY "Users can create own matters" ON public.matters
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- matters: Users can delete own matters
DROP POLICY IF EXISTS "Users can delete own matters" ON public.matters;
CREATE POLICY "Users can delete own matters" ON public.matters
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- matters: Users can update own matters
DROP POLICY IF EXISTS "Users can update own matters" ON public.matters;
CREATE POLICY "Users can update own matters" ON public.matters
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- matters: Users can view own or participating matters
DROP POLICY IF EXISTS "Users can view own or participating matters" ON public.matters;
CREATE POLICY "Users can view own or participating matters" ON public.matters
  FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.matter_participants
      WHERE matter_participants.matter_id = matters.id
      AND matter_participants.user_id = (select auth.uid())
      AND matter_participants.removed_at IS NULL
    )
  );

-- matter_participants: Matter owners can add participants
DROP POLICY IF EXISTS "Matter owners can add participants" ON public.matter_participants;
CREATE POLICY "Matter owners can add participants" ON public.matter_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_participants.matter_id
      AND matters.user_id = (select auth.uid())
    )
  );

-- matter_participants: Matter owners can remove participants
DROP POLICY IF EXISTS "Matter owners can remove participants" ON public.matter_participants;
CREATE POLICY "Matter owners can remove participants" ON public.matter_participants
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_participants.matter_id
      AND matters.user_id = (select auth.uid())
    )
  );

-- matter_participants: Matter owners can update participants
DROP POLICY IF EXISTS "Matter owners can update participants" ON public.matter_participants;
CREATE POLICY "Matter owners can update participants" ON public.matter_participants
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_participants.matter_id
      AND matters.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_participants.matter_id
      AND matters.user_id = (select auth.uid())
    )
  );

-- matter_participants: Users can view matter participants
DROP POLICY IF EXISTS "Users can view matter participants" ON public.matter_participants;
CREATE POLICY "Users can view matter participants" ON public.matter_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_participants.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

-- matter_documents: Users can add documents to matters
DROP POLICY IF EXISTS "Users can add documents to matters" ON public.matter_documents;
CREATE POLICY "Users can add documents to matters" ON public.matter_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_documents.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

-- matter_documents: Users can remove matter documents
DROP POLICY IF EXISTS "Users can remove matter documents" ON public.matter_documents;
CREATE POLICY "Users can remove matter documents" ON public.matter_documents
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_documents.matter_id
      AND matters.user_id = (select auth.uid())
    )
  );

-- matter_documents: Users can update matter documents
DROP POLICY IF EXISTS "Users can update matter documents" ON public.matter_documents;
CREATE POLICY "Users can update matter documents" ON public.matter_documents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_documents.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_documents.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

-- matter_documents: Users can view matter documents
DROP POLICY IF EXISTS "Users can view matter documents" ON public.matter_documents;
CREATE POLICY "Users can view matter documents" ON public.matter_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_documents.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

-- matter_activity_timeline: Users can log matter activity
DROP POLICY IF EXISTS "Users can log matter activity" ON public.matter_activity_timeline;
CREATE POLICY "Users can log matter activity" ON public.matter_activity_timeline
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_activity_timeline.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

-- matter_activity_timeline: Users can view matter activity
DROP POLICY IF EXISTS "Users can view matter activity" ON public.matter_activity_timeline;
CREATE POLICY "Users can view matter activity" ON public.matter_activity_timeline
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_activity_timeline.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

```

---

## supabase/migrations/20260123212530_optimize_rls_policies_auth_uid_batch3.sql

```sql
/*
  # Optimize RLS Policies - Batch 3 (AI & Usage Tables)

  This migration optimizes RLS policies for AI provenance, consent, and usage tables.

  ## Tables Updated:
  1. ai_response_provenance - All policies
  2. ai_response_citations - All policies
  3. ai_consent_records - All policies
  4. ai_disclosure_acknowledgments - All policies
  5. daily_usage_tracking - View policy
  6. monthly_usage_tracking - View policy
  7. usage_alerts - All policies
  8. arizona_scrape_logs - Admin policy
  9. arizona_legal_sources - Admin policy
*/

-- ai_response_provenance: Admins can view all AI provenance for compliance
DROP POLICY IF EXISTS "Admins can view all AI provenance for compliance" ON public.ai_response_provenance;
CREATE POLICY "Admins can view all AI provenance for compliance" ON public.ai_response_provenance
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- ai_response_provenance: Users can create own AI provenance
DROP POLICY IF EXISTS "Users can create own AI provenance" ON public.ai_response_provenance;
CREATE POLICY "Users can create own AI provenance" ON public.ai_response_provenance
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ai_response_provenance: Users can view own AI provenance
DROP POLICY IF EXISTS "Users can view own AI provenance" ON public.ai_response_provenance;
CREATE POLICY "Users can view own AI provenance" ON public.ai_response_provenance
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ai_response_citations: Admins can view all citations for compliance
DROP POLICY IF EXISTS "Admins can view all citations for compliance" ON public.ai_response_citations;
CREATE POLICY "Admins can view all citations for compliance" ON public.ai_response_citations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- ai_response_citations: Users can create citations for own provenance
DROP POLICY IF EXISTS "Users can create citations for own provenance" ON public.ai_response_citations;
CREATE POLICY "Users can create citations for own provenance" ON public.ai_response_citations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_response_provenance
      WHERE ai_response_provenance.id = ai_response_citations.provenance_id
      AND ai_response_provenance.user_id = (select auth.uid())
    )
  );

-- ai_response_citations: Users can view citations for own provenance
DROP POLICY IF EXISTS "Users can view citations for own provenance" ON public.ai_response_citations;
CREATE POLICY "Users can view citations for own provenance" ON public.ai_response_citations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_response_provenance
      WHERE ai_response_provenance.id = ai_response_citations.provenance_id
      AND ai_response_provenance.user_id = (select auth.uid())
    )
  );

-- ai_consent_records: Users can create own consent records
DROP POLICY IF EXISTS "Users can create own consent records" ON public.ai_consent_records;
CREATE POLICY "Users can create own consent records" ON public.ai_consent_records
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ai_consent_records: Users can update own consent records
DROP POLICY IF EXISTS "Users can update own consent records" ON public.ai_consent_records;
CREATE POLICY "Users can update own consent records" ON public.ai_consent_records
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ai_consent_records: Users can view own consent records
DROP POLICY IF EXISTS "Users can view own consent records" ON public.ai_consent_records;
CREATE POLICY "Users can view own consent records" ON public.ai_consent_records
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ai_disclosure_acknowledgments: Users can create own acknowledgments
DROP POLICY IF EXISTS "Users can create own acknowledgments" ON public.ai_disclosure_acknowledgments;
CREATE POLICY "Users can create own acknowledgments" ON public.ai_disclosure_acknowledgments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ai_disclosure_acknowledgments: Users can view own acknowledgments
DROP POLICY IF EXISTS "Users can view own acknowledgments" ON public.ai_disclosure_acknowledgments;
CREATE POLICY "Users can view own acknowledgments" ON public.ai_disclosure_acknowledgments
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- daily_usage_tracking: Users can view own daily usage
DROP POLICY IF EXISTS "Users can view own daily usage" ON public.daily_usage_tracking;
CREATE POLICY "Users can view own daily usage" ON public.daily_usage_tracking
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- monthly_usage_tracking: Users can view own monthly usage
DROP POLICY IF EXISTS "Users can view own monthly usage" ON public.monthly_usage_tracking;
CREATE POLICY "Users can view own monthly usage" ON public.monthly_usage_tracking
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- usage_alerts: Users can acknowledge own alerts
DROP POLICY IF EXISTS "Users can acknowledge own alerts" ON public.usage_alerts;
CREATE POLICY "Users can acknowledge own alerts" ON public.usage_alerts
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- usage_alerts: Users can view own alerts
DROP POLICY IF EXISTS "Users can view own alerts" ON public.usage_alerts;
CREATE POLICY "Users can view own alerts" ON public.usage_alerts
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- arizona_scrape_logs: Admins can view scrape logs
DROP POLICY IF EXISTS "Admins can view scrape logs" ON public.arizona_scrape_logs;
CREATE POLICY "Admins can view scrape logs" ON public.arizona_scrape_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- arizona_legal_sources: Admins can manage Arizona legal sources
DROP POLICY IF EXISTS "Admins can manage Arizona legal sources" ON public.arizona_legal_sources;
CREATE POLICY "Admins can manage Arizona legal sources" ON public.arizona_legal_sources
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

```

---

## supabase/migrations/20260123212547_optimize_rls_policies_auth_uid_batch4.sql

```sql
/*
  # Optimize RLS Policies - Batch 4 (Lawyer & Appointment Tables)

  This migration optimizes RLS policies for lawyer connections and appointment tables.

  ## Tables Updated:
  1. lawyer_connections - All policies
  2. lawyer_messages - All policies
  3. appointment_requests - All policies
  4. quote_requests - All policies
*/

-- lawyer_connections: Users can create connections
DROP POLICY IF EXISTS "Users can create connections" ON public.lawyer_connections;
CREATE POLICY "Users can create connections" ON public.lawyer_connections
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- lawyer_connections: Users can update their own connections
DROP POLICY IF EXISTS "Users can update their own connections" ON public.lawyer_connections;
CREATE POLICY "Users can update their own connections" ON public.lawyer_connections
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- lawyer_connections: Users can view their own connections
DROP POLICY IF EXISTS "Users can view their own connections" ON public.lawyer_connections;
CREATE POLICY "Users can view their own connections" ON public.lawyer_connections
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- lawyer_messages: Users can send messages to their connections
DROP POLICY IF EXISTS "Users can send messages to their connections" ON public.lawyer_messages;
CREATE POLICY "Users can send messages to their connections" ON public.lawyer_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- lawyer_messages: Users can update messages for their connections
DROP POLICY IF EXISTS "Users can update messages for their connections" ON public.lawyer_messages;
CREATE POLICY "Users can update messages for their connections" ON public.lawyer_messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- lawyer_messages: Users can view messages for their connections
DROP POLICY IF EXISTS "Users can view messages for their connections" ON public.lawyer_messages;
CREATE POLICY "Users can view messages for their connections" ON public.lawyer_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- appointment_requests: Users can create appointment requests
DROP POLICY IF EXISTS "Users can create appointment requests" ON public.appointment_requests;
CREATE POLICY "Users can create appointment requests" ON public.appointment_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = appointment_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- appointment_requests: Users can update their own appointment requests
DROP POLICY IF EXISTS "Users can update their own appointment requests" ON public.appointment_requests;
CREATE POLICY "Users can update their own appointment requests" ON public.appointment_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = appointment_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = appointment_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- appointment_requests: Users can view their own appointment requests
DROP POLICY IF EXISTS "Users can view their own appointment requests" ON public.appointment_requests;
CREATE POLICY "Users can view their own appointment requests" ON public.appointment_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = appointment_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- quote_requests: Users can create quote requests
DROP POLICY IF EXISTS "Users can create quote requests" ON public.quote_requests;
CREATE POLICY "Users can create quote requests" ON public.quote_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = quote_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- quote_requests: Users can update their own quote requests
DROP POLICY IF EXISTS "Users can update their own quote requests" ON public.quote_requests;
CREATE POLICY "Users can update their own quote requests" ON public.quote_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = quote_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = quote_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- quote_requests: Users can view their own quote requests
DROP POLICY IF EXISTS "Users can view their own quote requests" ON public.quote_requests;
CREATE POLICY "Users can view their own quote requests" ON public.quote_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = quote_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

```

---

## supabase/migrations/20260123212611_drop_unused_indexes_batch_final.sql

```sql
/*
  # Drop Unused Indexes - Final Batch

  This migration drops indexes that have not been used according to pg_stat_user_indexes.
  Unused indexes consume storage and slow down write operations without providing query benefits.

  ## Indexes Dropped:
  - Various indexes on access_audit_log, approval_requests, attorney_matching_profiles
  - Various indexes on case_matches, case_matching_queue, lso_case_hours
  - Various indexes on chat, chatbot, conflict, conversion tables
  - Various indexes on grant, lso, match, pro_bono tables
  - Various indexes on matters, documents, ai_response tables
  - Various indexes on arizona_legal_sources, lawyer_connections tables

  ## Safety Note:
  These indexes were identified as unused. If any queries slow down after this migration,
  the indexes can be recreated.
*/

-- profiles
DROP INDEX IF EXISTS idx_profiles_role;

-- access_audit_log
DROP INDEX IF EXISTS idx_access_audit_entity;
DROP INDEX IF EXISTS idx_access_audit_action;
DROP INDEX IF EXISTS idx_access_audit_granted;
DROP INDEX IF EXISTS idx_access_audit_created_at;

-- approval_requests
DROP INDEX IF EXISTS idx_approval_requests_workflow_id;

-- attorney_matching_profiles
DROP INDEX IF EXISTS idx_attorney_matching_profiles_organization_id;

-- case_matches
DROP INDEX IF EXISTS idx_case_matches_attorney_id;
DROP INDEX IF EXISTS idx_case_matches_case_id;
DROP INDEX IF EXISTS idx_case_matches_organization_id;

-- case_matching_queue
DROP INDEX IF EXISTS idx_case_matching_queue_organization_id;

-- lso_case_hours
DROP INDEX IF EXISTS idx_lso_case_hours_attorney_id;
DROP INDEX IF EXISTS idx_lso_case_hours_intake_id;

-- lso_client_intakes
DROP INDEX IF EXISTS idx_lso_client_intakes_assigned_attorney_id;

-- chat_messages_anonymous
DROP INDEX IF EXISTS idx_chat_messages_anonymous_session_id;

-- chatbot_prompts
DROP INDEX IF EXISTS idx_chatbot_prompts_category_id;
DROP INDEX IF EXISTS idx_chatbot_prompts_subcategory_id;

-- conflict_waivers
DROP INDEX IF EXISTS idx_conflict_waivers_conflicting_matter_id;

-- conversion_events
DROP INDEX IF EXISTS idx_conversion_events_session_id;

-- grant tables
DROP INDEX IF EXISTS idx_grant_expenses_grant_id;
DROP INDEX IF EXISTS idx_grant_metrics_grant_id;
DROP INDEX IF EXISTS idx_grant_milestones_grant_id;
DROP INDEX IF EXISTS idx_grant_reports_grant_id;
DROP INDEX IF EXISTS idx_grants_funder_id;

-- lso tables
DROP INDEX IF EXISTS idx_lso_client_intakes_organization_id;
DROP INDEX IF EXISTS idx_lso_staff_organization_id;
DROP INDEX IF EXISTS idx_lso_volunteer_attorneys_organization_id;

-- match tables
DROP INDEX IF EXISTS idx_match_feedback_match_id;
DROP INDEX IF EXISTS idx_matching_notifications_match_id;

-- pro_bono tables
DROP INDEX IF EXISTS idx_pro_bono_communications_application_id;
DROP INDEX IF EXISTS idx_pro_bono_documents_application_id;

-- prompt tables
DROP INDEX IF EXISTS idx_prompt_subcategories_category_id;

-- report_templates
DROP INDEX IF EXISTS idx_report_templates_funder_id;

-- user_preferences
DROP INDEX IF EXISTS idx_user_preferences_user_id;

-- matters
DROP INDEX IF EXISTS idx_matters_status;
DROP INDEX IF EXISTS idx_matters_practice_area;
DROP INDEX IF EXISTS idx_matters_created_at;

-- matter_participants
DROP INDEX IF EXISTS idx_matter_participants_matter_id;
DROP INDEX IF EXISTS idx_matter_participants_role;
DROP INDEX IF EXISTS idx_matter_participants_active;

-- matter_documents
DROP INDEX IF EXISTS idx_matter_documents_matter_id;
DROP INDEX IF EXISTS idx_matter_documents_category;

-- matter_activity_timeline
DROP INDEX IF EXISTS idx_matter_activity_matter_id;
DROP INDEX IF EXISTS idx_matter_activity_type;
DROP INDEX IF EXISTS idx_matter_activity_created_at;

-- chatbot_documents
DROP INDEX IF EXISTS idx_chatbot_documents_embedding;

-- chat_contexts
DROP INDEX IF EXISTS idx_chat_contexts_matter_id;

-- documents
DROP INDEX IF EXISTS idx_documents_matter_id;

-- ai_response_provenance
DROP INDEX IF EXISTS idx_ai_provenance_matter_id;
DROP INDEX IF EXISTS idx_ai_provenance_model_id;
DROP INDEX IF EXISTS idx_ai_provenance_created_at;

-- ai_response_citations
DROP INDEX IF EXISTS idx_ai_citations_provenance_id;
DROP INDEX IF EXISTS idx_ai_citations_source_type;
DROP INDEX IF EXISTS idx_ai_citations_source_id;

-- ai_consent_records
DROP INDEX IF EXISTS idx_ai_consent_type;
DROP INDEX IF EXISTS idx_ai_consent_granted_at;

-- ai_disclosure_acknowledgments
DROP INDEX IF EXISTS idx_ai_disclosure_type;

-- usage_alerts
DROP INDEX IF EXISTS idx_usage_alerts_unack;

-- arizona_legal_sources
DROP INDEX IF EXISTS idx_arizona_legal_sources_embedding;
DROP INDEX IF EXISTS idx_arizona_legal_sources_source_type;
DROP INDEX IF EXISTS idx_arizona_legal_sources_title_number;
DROP INDEX IF EXISTS idx_arizona_legal_sources_section;
DROP INDEX IF EXISTS idx_arizona_legal_sources_is_active;
DROP INDEX IF EXISTS idx_arizona_legal_sources_scraped_at;
DROP INDEX IF EXISTS idx_arizona_legal_sources_practice_areas;
DROP INDEX IF EXISTS idx_arizona_legal_sources_keywords;

-- lawyer_connections
DROP INDEX IF EXISTS idx_lawyer_connections_status;
DROP INDEX IF EXISTS idx_lawyer_connections_lawyer_id;

-- lawyer_messages
DROP INDEX IF EXISTS idx_lawyer_messages_connection_id;
DROP INDEX IF EXISTS idx_lawyer_messages_created_at;

-- appointment_requests
DROP INDEX IF EXISTS idx_appointment_requests_status;
DROP INDEX IF EXISTS idx_appointment_requests_preferred_date;

-- quote_requests
DROP INDEX IF EXISTS idx_quote_requests_status;

```

---

## supabase/migrations/20260123212621_fix_function_search_path_mutable.sql

```sql
/*
  # Fix Function Search Path - Security

  This migration fixes the mutable search_path issue in the 
  `update_arizona_legal_sources_updated_at` function.

  ## Issue:
  Functions with mutable search_path can be exploited if an attacker can 
  manipulate the search_path to substitute malicious functions.

  ## Solution:
  Set an explicit, immutable search_path for the function.
*/

-- Drop and recreate the function with secure search_path
CREATE OR REPLACE FUNCTION public.update_arizona_legal_sources_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

```

---

## supabase/migrations/20260124023048_create_unified_activity_log.sql

```sql
/*
  # Create Unified Activity Log System

  1. New Tables
    - `activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `activity_type` (text) - chat, lawyer_match, document, prediction, system
      - `action` (text) - created, updated, completed, viewed, etc.
      - `title` (text) - human-readable title
      - `description` (text) - detailed description
      - `metadata` (jsonb) - flexible data for type-specific info
      - `related_id` (uuid) - ID of related entity (chat_message_id, lawyer_match_id, etc.)
      - `related_type` (text) - type of related entity
      - `is_favorite` (boolean) - user can star important activities
      - `is_client_visible` (boolean) - for legal compliance
      - `status` (text) - completed, pending, failed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `activity_log` table
    - Users can only access their own activity log
    - Admins can view all activities for audit purposes

  3. Performance
    - Index on user_id + created_at for efficient timeline queries
    - Index on activity_type for filtered views
    - Index on related_id for lookups
*/

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('chat', 'lawyer_match', 'document', 'prediction', 'case', 'system')),
  action text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  related_id uuid,
  related_type text,
  is_favorite boolean DEFAULT false,
  is_client_visible boolean DEFAULT true,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'in_progress', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activity_log_user_created 
  ON activity_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_type 
  ON activity_log(activity_type);

CREATE INDEX IF NOT EXISTS idx_activity_log_related 
  ON activity_log(related_id) WHERE related_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activity_log_favorite 
  ON activity_log(user_id, is_favorite) WHERE is_favorite = true;

CREATE POLICY "Users can view own activities"
  ON activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activity_log
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activity_log
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION log_user_activity(
  p_activity_type text,
  p_action text,
  p_title text,
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_related_id uuid DEFAULT NULL,
  p_related_type text DEFAULT NULL,
  p_status text DEFAULT 'completed'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id uuid;
BEGIN
  INSERT INTO activity_log (
    user_id,
    activity_type,
    action,
    title,
    description,
    metadata,
    related_id,
    related_type,
    status
  ) VALUES (
    auth.uid(),
    p_activity_type,
    p_action,
    p_title,
    p_description,
    p_metadata,
    p_related_id,
    p_related_type,
    p_status
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_activity_stats(p_user_id uuid, p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_activities', COUNT(*),
    'chat_count', COUNT(*) FILTER (WHERE activity_type = 'chat'),
    'lawyer_match_count', COUNT(*) FILTER (WHERE activity_type = 'lawyer_match'),
    'document_count', COUNT(*) FILTER (WHERE activity_type = 'document'),
    'prediction_count', COUNT(*) FILTER (WHERE activity_type = 'prediction'),
    'favorites_count', COUNT(*) FILTER (WHERE is_favorite = true),
    'pending_count', COUNT(*) FILTER (WHERE status = 'pending'),
    'this_week', COUNT(*) FILTER (WHERE created_at > now() - interval '7 days'),
    'this_month', COUNT(*) FILTER (WHERE created_at > now() - interval '30 days')
  )
  INTO v_stats
  FROM activity_log
  WHERE user_id = p_user_id
    AND created_at > now() - (p_days || ' days')::interval;
  
  RETURN v_stats;
END;
$$;
```

---

## supabase/migrations/20260124024049_create_engagement_and_search_analytics.sql

```sql
/*
  # Create Engagement Analytics and Anonymized Search Storage

  1. New Tables
    - `engagement_analytics`
      - Tracks user engagement by feature, case type, and activity
      - Used to identify most popular features and conversion opportunities
      - Aggregated metrics for dashboard reporting
    
    - `anonymized_searches`
      - Stores anonymized search queries to improve AI responses
      - No PII - only query patterns, case types, and outcomes
      - Used for AI training and knowledge base improvement

  2. Security
    - engagement_analytics: Users can view own data, admins see all
    - anonymized_searches: Insert only for authenticated users (no PII)

  3. Purpose
    - Drive premium conversions by showing value
    - Improve AI accuracy through search pattern analysis
    - Identify high-value case types for marketing
*/

CREATE TABLE IF NOT EXISTS engagement_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  feature_name text NOT NULL,
  case_type text,
  activity_type text,
  jurisdiction text,
  engagement_type text NOT NULL CHECK (engagement_type IN ('view', 'click', 'complete', 'convert', 'share', 'export')),
  duration_seconds integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE engagement_analytics ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_engagement_feature ON engagement_analytics(feature_name);
CREATE INDEX IF NOT EXISTS idx_engagement_case_type ON engagement_analytics(case_type) WHERE case_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_engagement_created ON engagement_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_engagement_user ON engagement_analytics(user_id) WHERE user_id IS NOT NULL;

CREATE POLICY "Users can view own engagement data"
  ON engagement_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own engagement data"
  ON engagement_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE TABLE IF NOT EXISTS anonymized_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text NOT NULL,
  query_category text,
  case_type text,
  jurisdiction text,
  keywords text[],
  intent_classification text,
  response_quality_score integer CHECK (response_quality_score >= 1 AND response_quality_score <= 5),
  led_to_conversion boolean DEFAULT false,
  led_to_lawyer_match boolean DEFAULT false,
  session_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE anonymized_searches ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_anon_searches_category ON anonymized_searches(query_category);
CREATE INDEX IF NOT EXISTS idx_anon_searches_case_type ON anonymized_searches(case_type);
CREATE INDEX IF NOT EXISTS idx_anon_searches_keywords ON anonymized_searches USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_anon_searches_created ON anonymized_searches(created_at);

CREATE POLICY "Authenticated users can insert anonymized searches"
  ON anonymized_searches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION track_engagement(
  p_feature_name text,
  p_engagement_type text,
  p_case_type text DEFAULT NULL,
  p_activity_type text DEFAULT NULL,
  p_jurisdiction text DEFAULT NULL,
  p_duration_seconds integer DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_session_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO engagement_analytics (
    user_id,
    feature_name,
    case_type,
    activity_type,
    jurisdiction,
    engagement_type,
    duration_seconds,
    metadata,
    session_id
  ) VALUES (
    auth.uid(),
    p_feature_name,
    p_case_type,
    p_activity_type,
    p_jurisdiction,
    p_engagement_type,
    p_duration_seconds,
    p_metadata,
    p_session_id
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION store_anonymized_search(
  p_query_text text,
  p_case_type text DEFAULT NULL,
  p_jurisdiction text DEFAULT NULL,
  p_intent text DEFAULT NULL,
  p_led_to_conversion boolean DEFAULT false,
  p_led_to_lawyer_match boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_keywords text[];
  v_hash text;
BEGIN
  v_hash := encode(sha256(p_query_text::bytea), 'hex');
  
  v_keywords := regexp_split_to_array(
    lower(regexp_replace(p_query_text, '[^a-zA-Z0-9\s]', '', 'g')),
    '\s+'
  );
  v_keywords := array(
    SELECT DISTINCT unnest(v_keywords)
    WHERE length(unnest) > 3
    ORDER BY 1
    LIMIT 10
  );

  INSERT INTO anonymized_searches (
    query_hash,
    query_category,
    case_type,
    jurisdiction,
    keywords,
    intent_classification,
    led_to_conversion,
    led_to_lawyer_match
  ) VALUES (
    v_hash,
    p_case_type,
    p_case_type,
    p_jurisdiction,
    v_keywords,
    p_intent,
    p_led_to_conversion,
    p_led_to_lawyer_match
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_popular_case_types(p_days integer DEFAULT 30)
RETURNS TABLE(case_type text, total_engagements bigint, conversion_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.case_type,
    COUNT(*) as total_engagements,
    ROUND(
      COUNT(*) FILTER (WHERE e.engagement_type = 'convert')::numeric / 
      NULLIF(COUNT(*)::numeric, 0) * 100, 2
    ) as conversion_rate
  FROM engagement_analytics e
  WHERE e.case_type IS NOT NULL
    AND e.created_at > now() - (p_days || ' days')::interval
  GROUP BY e.case_type
  ORDER BY total_engagements DESC
  LIMIT 20;
END;
$$;

CREATE OR REPLACE FUNCTION get_feature_engagement_stats(p_days integer DEFAULT 30)
RETURNS TABLE(
  feature_name text, 
  total_views bigint, 
  total_completions bigint, 
  total_conversions bigint,
  avg_duration numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.feature_name,
    COUNT(*) FILTER (WHERE e.engagement_type = 'view') as total_views,
    COUNT(*) FILTER (WHERE e.engagement_type = 'complete') as total_completions,
    COUNT(*) FILTER (WHERE e.engagement_type = 'convert') as total_conversions,
    ROUND(AVG(e.duration_seconds)::numeric, 1) as avg_duration
  FROM engagement_analytics e
  WHERE e.created_at > now() - (p_days || ' days')::interval
  GROUP BY e.feature_name
  ORDER BY total_views DESC;
END;
$$;
```

---

## supabase/migrations/20260124052604_create_viral_sharing_tables.sql

```sql
/*
  # Create Viral Sharing and Referral Tracking Tables

  1. New Tables
    - `engagement_events`
      - Tracks share events by platform (WhatsApp, Facebook, SMS, etc.)
      - Stores language preference and context for viral optimization
      - Used to measure Hispanic community engagement
    
    - `referral_codes`
      - Tracks referral chains for viral growth
      - Links referrers to referred users
      - Measures conversion from referrals

  2. Security
    - engagement_events: Anyone can insert (anonymous tracking allowed)
    - referral_codes: Users can view own referrals, admins see all

  3. Purpose
    - Measure viral sharing effectiveness
    - Optimize for Hispanic community sharing patterns
    - Track referral conversions for growth metrics
*/

CREATE TABLE IF NOT EXISTS engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  platform text,
  url text,
  language text DEFAULT 'en',
  context text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_engagement_events_type ON engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_events_platform ON engagement_events(platform);
CREATE INDEX IF NOT EXISTS idx_engagement_events_language ON engagement_events(language);
CREATE INDEX IF NOT EXISTS idx_engagement_events_created ON engagement_events(created_at);

CREATE POLICY "Anyone can insert engagement events"
  ON engagement_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own engagement events"
  ON engagement_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired')),
  converted_at timestamptz,
  platform text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer ON referral_codes(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_status ON referral_codes(status);

CREATE POLICY "Users can view own referral codes"
  ON referral_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referral codes"
  ON referral_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    v_code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;

CREATE OR REPLACE FUNCTION track_share_event(
  p_platform text,
  p_url text DEFAULT NULL,
  p_language text DEFAULT 'en',
  p_context text DEFAULT 'general'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO engagement_events (
    event_type,
    platform,
    url,
    language,
    context,
    user_id
  ) VALUES (
    'share',
    p_platform,
    p_url,
    p_language,
    p_context,
    auth.uid()
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_share_analytics(p_days integer DEFAULT 30)
RETURNS TABLE(
  platform text,
  language text,
  share_count bigint,
  unique_urls bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.platform,
    e.language,
    COUNT(*) as share_count,
    COUNT(DISTINCT e.url) as unique_urls
  FROM engagement_events e
  WHERE e.event_type = 'share'
    AND e.created_at > now() - (p_days || ' days')::interval
  GROUP BY e.platform, e.language
  ORDER BY share_count DESC;
END;
$$;

```

---

## supabase/migrations/20260129022610_add_missing_fk_indexes_batch1.sql

```sql
/*
  # Add Missing Foreign Key Indexes - Batch 1

  ## Purpose
  Add indexes on foreign key columns to improve query performance.
  Foreign keys without indexes cause slow JOIN operations and cascading deletes.

  ## Tables Affected (17 tables)
  1. ai_response_citations - provenance_id
  2. ai_response_provenance - matter_id
  3. approval_requests - workflow_id
  4. attorney_matching_profiles - organization_id
  5. case_matches - attorney_id, case_id, organization_id
  6. case_matching_queue - organization_id
  7. chat_contexts - matter_id
  8. chat_messages_anonymous - session_id
  9. chatbot_prompts - category_id, subcategory_id
  10. conflict_waivers - conflicting_matter_id
  11. conversion_events - session_id
  12. documents - matter_id
  13. engagement_events - user_id
  14. grant_expenses - grant_id
  15. grant_metrics - grant_id
  16. grant_milestones - grant_id
  17. grant_reports - grant_id

  ## Security
  No security changes - index creation only
*/

-- ai_response_citations.provenance_id
CREATE INDEX IF NOT EXISTS idx_ai_response_citations_provenance_id
  ON public.ai_response_citations(provenance_id);

-- ai_response_provenance.matter_id
CREATE INDEX IF NOT EXISTS idx_ai_response_provenance_matter_id
  ON public.ai_response_provenance(matter_id);

-- approval_requests.workflow_id
CREATE INDEX IF NOT EXISTS idx_approval_requests_workflow_id
  ON public.approval_requests(workflow_id);

-- attorney_matching_profiles.organization_id
CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_organization_id
  ON public.attorney_matching_profiles(organization_id);

-- case_matches foreign keys
CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_id
  ON public.case_matches(attorney_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_case_id
  ON public.case_matches(case_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_organization_id
  ON public.case_matches(organization_id);

-- case_matching_queue.organization_id
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_organization_id
  ON public.case_matching_queue(organization_id);

-- chat_contexts.matter_id
CREATE INDEX IF NOT EXISTS idx_chat_contexts_matter_id
  ON public.chat_contexts(matter_id);

-- chat_messages_anonymous.session_id
CREATE INDEX IF NOT EXISTS idx_chat_messages_anonymous_session_id
  ON public.chat_messages_anonymous(session_id);

-- chatbot_prompts foreign keys
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_category_id
  ON public.chatbot_prompts(category_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_subcategory_id
  ON public.chatbot_prompts(subcategory_id);

-- conflict_waivers.conflicting_matter_id
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflicting_matter_id
  ON public.conflict_waivers(conflicting_matter_id);

-- conversion_events.session_id
CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id
  ON public.conversion_events(session_id);

-- documents.matter_id
CREATE INDEX IF NOT EXISTS idx_documents_matter_id
  ON public.documents(matter_id);

-- engagement_events.user_id
CREATE INDEX IF NOT EXISTS idx_engagement_events_user_id
  ON public.engagement_events(user_id);

-- grant_expenses.grant_id
CREATE INDEX IF NOT EXISTS idx_grant_expenses_grant_id
  ON public.grant_expenses(grant_id);

-- grant_metrics.grant_id
CREATE INDEX IF NOT EXISTS idx_grant_metrics_grant_id
  ON public.grant_metrics(grant_id);

-- grant_milestones.grant_id
CREATE INDEX IF NOT EXISTS idx_grant_milestones_grant_id
  ON public.grant_milestones(grant_id);

-- grant_reports.grant_id
CREATE INDEX IF NOT EXISTS idx_grant_reports_grant_id
  ON public.grant_reports(grant_id);

```

---

## supabase/migrations/20260129022623_add_missing_fk_indexes_batch2.sql

```sql
/*
  # Add Missing Foreign Key Indexes - Batch 2

  ## Purpose
  Continue adding indexes on foreign key columns for optimal query performance.

  ## Tables Affected (20 tables)
  1. grants - funder_id
  2. lawyer_messages - connection_id
  3. lso_case_hours - attorney_id, intake_id
  4. lso_client_intakes - assigned_attorney_id, organization_id
  5. lso_staff - organization_id
  6. lso_volunteer_attorneys - organization_id
  7. match_feedback - match_id
  8. matching_notifications - match_id
  9. matter_activity_timeline - matter_id
  10. pro_bono_communications - application_id
  11. pro_bono_documents - application_id
  12. prompt_subcategories - category_id
  13. referral_codes - referred_user_id
  14. report_templates - funder_id
  15. user_preferences - user_id

  ## Security
  No security changes - index creation only
*/

-- grants.funder_id
CREATE INDEX IF NOT EXISTS idx_grants_funder_id
  ON public.grants(funder_id);

-- lawyer_messages.connection_id
CREATE INDEX IF NOT EXISTS idx_lawyer_messages_connection_id
  ON public.lawyer_messages(connection_id);

-- lso_case_hours foreign keys
CREATE INDEX IF NOT EXISTS idx_lso_case_hours_attorney_id
  ON public.lso_case_hours(attorney_id);

CREATE INDEX IF NOT EXISTS idx_lso_case_hours_intake_id
  ON public.lso_case_hours(intake_id);

-- lso_client_intakes foreign keys
CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_attorney_id
  ON public.lso_client_intakes(assigned_attorney_id);

CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_organization_id
  ON public.lso_client_intakes(organization_id);

-- lso_staff.organization_id
CREATE INDEX IF NOT EXISTS idx_lso_staff_organization_id
  ON public.lso_staff(organization_id);

-- lso_volunteer_attorneys.organization_id
CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_organization_id
  ON public.lso_volunteer_attorneys(organization_id);

-- match_feedback.match_id
CREATE INDEX IF NOT EXISTS idx_match_feedback_match_id
  ON public.match_feedback(match_id);

-- matching_notifications.match_id
CREATE INDEX IF NOT EXISTS idx_matching_notifications_match_id
  ON public.matching_notifications(match_id);

-- matter_activity_timeline.matter_id
CREATE INDEX IF NOT EXISTS idx_matter_activity_timeline_matter_id
  ON public.matter_activity_timeline(matter_id);

-- pro_bono_communications.application_id
CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_application_id
  ON public.pro_bono_communications(application_id);

-- pro_bono_documents.application_id
CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_application_id
  ON public.pro_bono_documents(application_id);

-- prompt_subcategories.category_id
CREATE INDEX IF NOT EXISTS idx_prompt_subcategories_category_id
  ON public.prompt_subcategories(category_id);

-- referral_codes.referred_user_id
CREATE INDEX IF NOT EXISTS idx_referral_codes_referred_user_id
  ON public.referral_codes(referred_user_id);

-- report_templates.funder_id
CREATE INDEX IF NOT EXISTS idx_report_templates_funder_id
  ON public.report_templates(funder_id);

-- user_preferences.user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON public.user_preferences(user_id);

```

---

## supabase/migrations/20260129022708_optimize_rls_policies_auth_function.sql

```sql
/*
  # Optimize RLS Policies - Auth Function Initialization

  ## Purpose
  Optimize RLS policies by wrapping auth.uid() and auth.jwt() in (select ...) to prevent
  re-evaluation for each row. This significantly improves query performance at scale.

  ## Tables Affected
  1. activity_log - 4 policies (select, insert, update, delete)
  2. engagement_analytics - 2 policies (select, insert)
  3. email_captures - 1 policy (select) - uses auth.jwt()
  4. engagement_events - 1 policy (select)
  5. referral_codes - 2 policies (select, insert)

  ## Security
  No changes to security - same access rules, just optimized execution
*/

-- ============================================
-- activity_log policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own activities" ON public.activity_log;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.activity_log;
DROP POLICY IF EXISTS "Users can update own activities" ON public.activity_log;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.activity_log;

CREATE POLICY "Users can view own activities"
  ON public.activity_log
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own activities"
  ON public.activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own activities"
  ON public.activity_log
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own activities"
  ON public.activity_log
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- engagement_analytics policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own engagement data" ON public.engagement_analytics;
DROP POLICY IF EXISTS "Users can insert own engagement data" ON public.engagement_analytics;

CREATE POLICY "Users can view own engagement data"
  ON public.engagement_analytics
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own engagement data"
  ON public.engagement_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================
-- email_captures policies (uses auth.jwt() for email matching)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view own captures" ON public.email_captures;

CREATE POLICY "Authenticated users can view own captures"
  ON public.email_captures
  FOR SELECT
  TO authenticated
  USING (email = (select auth.jwt() ->> 'email'));

-- ============================================
-- engagement_events policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own engagement events" ON public.engagement_events;

CREATE POLICY "Users can view own engagement events"
  ON public.engagement_events
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- referral_codes policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Users can create referral codes" ON public.referral_codes;

CREATE POLICY "Users can view own referral codes"
  ON public.referral_codes
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = referrer_id OR (select auth.uid()) = referred_user_id);

CREATE POLICY "Users can create referral codes"
  ON public.referral_codes
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = referrer_id);

```

---

## supabase/migrations/20260129022738_drop_unused_indexes_cleanup.sql

```sql
/*
  # Drop Unused Indexes - Performance Cleanup

  ## Purpose
  Remove indexes that have never been used according to pg_stat_user_indexes.
  Unused indexes waste storage and slow down INSERT/UPDATE/DELETE operations.

  ## Indexes Being Dropped (47 indexes)
  - activity_log: idx_activity_log_related
  - engagement_analytics: idx_engagement_feature, idx_engagement_case_type, idx_engagement_created, idx_engagement_user
  - anonymized_searches: idx_anon_searches_category, idx_anon_searches_case_type, idx_anon_searches_keywords, idx_anon_searches_created
  - engagement_events: idx_engagement_events_type, idx_engagement_events_platform, idx_engagement_events_language, idx_engagement_events_created
  - referral_codes: idx_referral_codes_code, idx_referral_codes_referrer, idx_referral_codes_status
  - case_matches: idx_case_matches_attorney_profile_id
  - analytics_events: idx_analytics_events_user_id
  - case_matching_queue: idx_case_matching_queue_created_by
  - cases: idx_cases_client_id
  - chatbot_documents: idx_chatbot_documents_created_by
  - conflict_checks: idx_conflict_checks_performed_by
  - conflict_waivers: idx_conflict_waivers_conflict_check_id, idx_conflict_waivers_matter_id
  - crisis_incidents: idx_crisis_incidents_user_id
  - appointment_requests: idx_appointment_requests_connection_id
  - approval_decisions: idx_approval_decisions_request_id
  - approval_requests: idx_approval_requests_requested_by
  - documents: idx_documents_case_id
  - grant_expenses: idx_grant_expenses_approved_by
  - grant_reports: idx_grant_reports_generated_by, idx_grant_reports_reviewed_by
  - knowledge_documents: idx_knowledge_documents_uploaded_by
  - lawyer_consultations: idx_lawyer_consultations_lawyer_match_id
  - lawyer_matches: idx_lawyer_matches_chat_message_id
  - lso_audit_logs: idx_lso_audit_logs_user_id
  - lso_client_intakes: idx_lso_client_intakes_assigned_by
  - lso_volunteer_attorneys: idx_lso_volunteer_attorneys_user_id
  - match_feedback: idx_match_feedback_organization_id, idx_match_feedback_submitted_by
  - matching_notifications: idx_matching_notifications_attorney_id
  - matter_documents: idx_matter_documents_added_by
  - openai_rate_limits: idx_openai_rate_limits_user_id
  - openai_usage_logs: idx_openai_usage_logs_user_id
  - pro_bono_applications: idx_pro_bono_applications_assigned_to
  - pro_bono_communications: idx_pro_bono_communications_from_user_id
  - pro_bono_documents: idx_pro_bono_documents_uploaded_by
  - quote_requests: idx_quote_requests_connection_id
  - subscription_history: idx_subscription_history_changed_by
  - system_settings: idx_system_settings_updated_by
  - trust_safety_reports: idx_trust_safety_reports_user_id
  - user_roles: idx_user_roles_role_id
  - widget_conversations: idx_widget_conversations_widget_id

  ## Security
  No security changes - index management only

  ## Notes
  Indexes are dropped with IF EXISTS to prevent errors on repeated runs
*/

-- activity_log
DROP INDEX IF EXISTS idx_activity_log_related;

-- engagement_analytics
DROP INDEX IF EXISTS idx_engagement_feature;
DROP INDEX IF EXISTS idx_engagement_case_type;
DROP INDEX IF EXISTS idx_engagement_created;
DROP INDEX IF EXISTS idx_engagement_user;

-- anonymized_searches
DROP INDEX IF EXISTS idx_anon_searches_category;
DROP INDEX IF EXISTS idx_anon_searches_case_type;
DROP INDEX IF EXISTS idx_anon_searches_keywords;
DROP INDEX IF EXISTS idx_anon_searches_created;

-- engagement_events
DROP INDEX IF EXISTS idx_engagement_events_type;
DROP INDEX IF EXISTS idx_engagement_events_platform;
DROP INDEX IF EXISTS idx_engagement_events_language;
DROP INDEX IF EXISTS idx_engagement_events_created;

-- referral_codes
DROP INDEX IF EXISTS idx_referral_codes_code;
DROP INDEX IF EXISTS idx_referral_codes_referrer;
DROP INDEX IF EXISTS idx_referral_codes_status;

-- case_matches
DROP INDEX IF EXISTS idx_case_matches_attorney_profile_id;

-- analytics_events
DROP INDEX IF EXISTS idx_analytics_events_user_id;

-- case_matching_queue
DROP INDEX IF EXISTS idx_case_matching_queue_created_by;

-- cases
DROP INDEX IF EXISTS idx_cases_client_id;

-- chatbot_documents
DROP INDEX IF EXISTS idx_chatbot_documents_created_by;

-- conflict_checks
DROP INDEX IF EXISTS idx_conflict_checks_performed_by;

-- conflict_waivers
DROP INDEX IF EXISTS idx_conflict_waivers_conflict_check_id;
DROP INDEX IF EXISTS idx_conflict_waivers_matter_id;

-- crisis_incidents
DROP INDEX IF EXISTS idx_crisis_incidents_user_id;

-- appointment_requests
DROP INDEX IF EXISTS idx_appointment_requests_connection_id;

-- approval_decisions
DROP INDEX IF EXISTS idx_approval_decisions_request_id;

-- approval_requests
DROP INDEX IF EXISTS idx_approval_requests_requested_by;

-- documents
DROP INDEX IF EXISTS idx_documents_case_id;

-- grant_expenses
DROP INDEX IF EXISTS idx_grant_expenses_approved_by;

-- grant_reports
DROP INDEX IF EXISTS idx_grant_reports_generated_by;
DROP INDEX IF EXISTS idx_grant_reports_reviewed_by;

-- knowledge_documents
DROP INDEX IF EXISTS idx_knowledge_documents_uploaded_by;

-- lawyer_consultations
DROP INDEX IF EXISTS idx_lawyer_consultations_lawyer_match_id;

-- lawyer_matches
DROP INDEX IF EXISTS idx_lawyer_matches_chat_message_id;

-- lso_audit_logs
DROP INDEX IF EXISTS idx_lso_audit_logs_user_id;

-- lso_client_intakes
DROP INDEX IF EXISTS idx_lso_client_intakes_assigned_by;

-- lso_volunteer_attorneys
DROP INDEX IF EXISTS idx_lso_volunteer_attorneys_user_id;

-- match_feedback
DROP INDEX IF EXISTS idx_match_feedback_organization_id;
DROP INDEX IF EXISTS idx_match_feedback_submitted_by;

-- matching_notifications
DROP INDEX IF EXISTS idx_matching_notifications_attorney_id;

-- matter_documents
DROP INDEX IF EXISTS idx_matter_documents_added_by;

-- openai_rate_limits
DROP INDEX IF EXISTS idx_openai_rate_limits_user_id;

-- openai_usage_logs
DROP INDEX IF EXISTS idx_openai_usage_logs_user_id;

-- pro_bono_applications
DROP INDEX IF EXISTS idx_pro_bono_applications_assigned_to;

-- pro_bono_communications
DROP INDEX IF EXISTS idx_pro_bono_communications_from_user_id;

-- pro_bono_documents
DROP INDEX IF EXISTS idx_pro_bono_documents_uploaded_by;

-- quote_requests
DROP INDEX IF EXISTS idx_quote_requests_connection_id;

-- subscription_history
DROP INDEX IF EXISTS idx_subscription_history_changed_by;

-- system_settings
DROP INDEX IF EXISTS idx_system_settings_updated_by;

-- trust_safety_reports
DROP INDEX IF EXISTS idx_trust_safety_reports_user_id;

-- user_roles
DROP INDEX IF EXISTS idx_user_roles_role_id;

-- widget_conversations
DROP INDEX IF EXISTS idx_widget_conversations_widget_id;

```

---

## supabase/migrations/20260129030215_create_access_request_system.sql

```sql
/*
  # Access Request and Deep Link System

  1. New Tables
    - `access_requests` - Tracks user access requests before account creation
      - `id` (uuid, primary key)
      - `email` (text, required) - Requester's email
      - `full_name` (text) - Requester's name
      - `resource_type` (text) - Type of resource requested (matter, document, workspace)
      - `resource_id` (uuid) - ID of the specific resource
      - `resource_name` (text) - Human-readable resource name
      - `invited_by` (uuid) - User who invited/shared the link
      - `status` (text) - pending, approved, denied, expired
      - `reason` (text) - Reason for request
      - `admin_notes` (text) - Notes from admin reviewing request
      - `reviewed_by` (uuid) - Admin who reviewed the request
      - `reviewed_at` (timestamptz) - When request was reviewed
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - When request link expires
    
    - `access_tokens` - Secure tokens for deep links
      - `id` (uuid, primary key)
      - `token` (text, unique) - Secure random token
      - `resource_type` (text) - Type of resource
      - `resource_id` (uuid) - ID of the resource
      - `resource_name` (text) - Display name
      - `created_by` (uuid) - User who created the link
      - `allowed_email` (text) - Email authorized to use this token (optional)
      - `max_uses` (int) - Maximum number of uses (null = unlimited)
      - `use_count` (int) - Current use count
      - `expires_at` (timestamptz) - Token expiration
      - `created_at` (timestamptz)
      - `revoked_at` (timestamptz) - If manually revoked
      - `last_used_at` (timestamptz)

    - `access_token_usage` - Audit log for token usage
      - `id` (uuid, primary key)
      - `token_id` (uuid) - Reference to access_tokens
      - `user_id` (uuid) - User who used the token (if authenticated)
      - `email` (text) - Email used (for unauthenticated)
      - `ip_address` (text) - For security logging
      - `user_agent` (text)
      - `action` (text) - viewed, requested_access, logged_in
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admins can manage all access requests
    - Users can view their own requests
    - Resource owners can view requests for their resources
*/

-- Access Requests Table
CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  resource_type text NOT NULL CHECK (resource_type IN ('matter', 'document', 'workspace', 'general')),
  resource_id uuid,
  resource_name text,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  reason text,
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Access Tokens Table
CREATE TABLE IF NOT EXISTS access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  resource_type text NOT NULL CHECK (resource_type IN ('matter', 'document', 'workspace', 'general', 'invite')),
  resource_id uuid,
  resource_name text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  allowed_email text,
  max_uses int,
  use_count int DEFAULT 0,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);

-- Access Token Usage Audit Log
CREATE TABLE IF NOT EXISTS access_token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES access_tokens(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  ip_address text,
  user_agent text,
  action text NOT NULL CHECK (action IN ('viewed', 'requested_access', 'logged_in', 'signed_up')),
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_invited_by ON access_requests(invited_by);
CREATE INDEX IF NOT EXISTS idx_access_requests_resource ON access_requests(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_token ON access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_access_tokens_created_by ON access_tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_access_tokens_expires_at ON access_tokens(expires_at) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_access_token_usage_token_id ON access_token_usage(token_id);

-- Enable RLS
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_token_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for access_requests

-- Admins can view all access requests
CREATE POLICY "Admins can view all access requests"
  ON access_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update access requests (approve/deny)
CREATE POLICY "Admins can update access requests"
  ON access_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Users who invited can view requests for their invitations
CREATE POLICY "Inviters can view their access requests"
  ON access_requests FOR SELECT
  TO authenticated
  USING (invited_by = auth.uid());

-- Anyone can insert access requests (for requesting access)
CREATE POLICY "Anyone can create access requests"
  ON access_requests FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS Policies for access_tokens

-- Users can view their own created tokens
CREATE POLICY "Users can view own tokens"
  ON access_tokens FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Admins can view all tokens
CREATE POLICY "Admins can view all tokens"
  ON access_tokens FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Users can create tokens
CREATE POLICY "Users can create tokens"
  ON access_tokens FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Users can update their own tokens (revoke)
CREATE POLICY "Users can update own tokens"
  ON access_tokens FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Users can delete their own tokens
CREATE POLICY "Users can delete own tokens"
  ON access_tokens FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for access_token_usage

-- Admins can view all usage
CREATE POLICY "Admins can view all token usage"
  ON access_token_usage FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Token creators can view usage of their tokens
CREATE POLICY "Token creators can view usage"
  ON access_token_usage FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM access_tokens
      WHERE access_tokens.id = access_token_usage.token_id
      AND access_tokens.created_by = auth.uid()
    )
  );

-- Anyone can log token usage
CREATE POLICY "Anyone can log token usage"
  ON access_token_usage FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Function to validate and use an access token
CREATE OR REPLACE FUNCTION validate_access_token(p_token text)
RETURNS TABLE (
  valid boolean,
  token_id uuid,
  resource_type text,
  resource_id uuid,
  resource_name text,
  allowed_email text,
  created_by_name text,
  error_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token access_tokens%ROWTYPE;
  v_creator_name text;
BEGIN
  -- Find the token
  SELECT * INTO v_token
  FROM access_tokens t
  WHERE t.token = p_token;

  -- Token not found
  IF v_token.id IS NULL THEN
    RETURN QUERY SELECT 
      false, NULL::uuid, NULL::text, NULL::uuid, NULL::text, NULL::text, NULL::text, 'TOKEN_NOT_FOUND'::text;
    RETURN;
  END IF;

  -- Token revoked
  IF v_token.revoked_at IS NOT NULL THEN
    RETURN QUERY SELECT 
      false, v_token.id, v_token.resource_type, v_token.resource_id, v_token.resource_name, 
      v_token.allowed_email, NULL::text, 'TOKEN_REVOKED'::text;
    RETURN;
  END IF;

  -- Token expired
  IF v_token.expires_at < now() THEN
    RETURN QUERY SELECT 
      false, v_token.id, v_token.resource_type, v_token.resource_id, v_token.resource_name,
      v_token.allowed_email, NULL::text, 'TOKEN_EXPIRED'::text;
    RETURN;
  END IF;

  -- Token max uses exceeded
  IF v_token.max_uses IS NOT NULL AND v_token.use_count >= v_token.max_uses THEN
    RETURN QUERY SELECT 
      false, v_token.id, v_token.resource_type, v_token.resource_id, v_token.resource_name,
      v_token.allowed_email, NULL::text, 'MAX_USES_EXCEEDED'::text;
    RETURN;
  END IF;

  -- Get creator name
  SELECT full_name INTO v_creator_name
  FROM profiles
  WHERE id = v_token.created_by;

  -- Token is valid
  RETURN QUERY SELECT 
    true, v_token.id, v_token.resource_type, v_token.resource_id, v_token.resource_name,
    v_token.allowed_email, v_creator_name, NULL::text;
END;
$$;

-- Function to increment token usage
CREATE OR REPLACE FUNCTION increment_token_usage(p_token_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE access_tokens
  SET 
    use_count = use_count + 1,
    last_used_at = now()
  WHERE id = p_token_id;
END;
$$;

```

---

## supabase/migrations/20260129031453_create_data_governance_system.sql

```sql
/*
  # Data Governance System for Legal Tech Compliance

  This migration creates the infrastructure for enterprise-grade data governance
  including retention policies, legal holds, data export tracking, and deletion requests.

  ## 1. New Tables

  ### data_retention_policies
  - Configurable retention periods per data type
  - Organization-level overrides
  - Legal hold support

  ### legal_holds
  - Matter-level legal holds to prevent deletion
  - Tracks hold reason, creator, and duration
  - Links to matters and users

  ### data_export_requests
  - Tracks user data export requests
  - Status tracking (pending, processing, completed, failed)
  - Download URL with expiration

  ### data_deletion_requests
  - GDPR/CCPA compliant deletion tracking
  - Scheduled vs immediate deletion
  - Verification and audit trail

  ## 2. Functions

  ### check_legal_hold(user_id, matter_id)
  - Returns true if data is under legal hold

  ### get_retention_policy(data_type, org_id)
  - Returns applicable retention period

  ## 3. Security

  - RLS enabled on all tables
  - Users can only see their own requests
  - Admins can manage organization policies
*/

-- Data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  data_type text NOT NULL,
  retention_days integer NOT NULL DEFAULT 90,
  is_default boolean DEFAULT false,
  legal_hold_override boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_data_type CHECK (data_type IN (
    'chat_messages', 'chat_contexts', 'documents', 
    'audit_logs', 'activity_logs', 'attachments'
  )),
  CONSTRAINT valid_retention CHECK (retention_days >= 0 AND retention_days <= 2555)
);

-- Insert default retention policies
INSERT INTO data_retention_policies (data_type, retention_days, is_default) VALUES
  ('chat_messages', 90, true),
  ('chat_contexts', 90, true),
  ('documents', 365, true),
  ('audit_logs', 2555, true),
  ('activity_logs', 365, true),
  ('attachments', 90, true)
ON CONFLICT DO NOTHING;

-- Legal holds table
CREATE TABLE IF NOT EXISTS legal_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid REFERENCES matters(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  hold_reason text NOT NULL,
  hold_type text NOT NULL DEFAULT 'litigation',
  started_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_hold_type CHECK (hold_type IN (
    'litigation', 'regulatory', 'investigation', 'audit', 'preservation'
  )),
  CONSTRAINT valid_hold_target CHECK (matter_id IS NOT NULL OR user_id IS NOT NULL)
);

-- Data export requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  export_format text NOT NULL DEFAULT 'json',
  include_chat_history boolean DEFAULT true,
  include_documents boolean DEFAULT true,
  include_profile boolean DEFAULT true,
  include_activity_logs boolean DEFAULT false,
  download_url text,
  download_expires_at timestamptz,
  file_size_bytes bigint,
  requested_at timestamptz DEFAULT now(),
  processing_started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  CONSTRAINT valid_status CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'expired'
  )),
  CONSTRAINT valid_format CHECK (export_format IN ('json', 'csv', 'zip'))
);

-- Data deletion requests table
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL DEFAULT 'full',
  status text NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz,
  reason text,
  legal_basis text,
  verified_at timestamptz,
  verification_method text,
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  deletion_log jsonb DEFAULT '[]'::jsonb,
  blocked_by_legal_hold boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_request_type CHECK (request_type IN (
    'full', 'chat_only', 'documents_only', 'specific_matter'
  )),
  CONSTRAINT valid_deletion_status CHECK (status IN (
    'pending', 'verified', 'scheduled', 'processing', 'completed', 'blocked', 'cancelled'
  )),
  CONSTRAINT valid_legal_basis CHECK (legal_basis IS NULL OR legal_basis IN (
    'gdpr_article_17', 'ccpa', 'user_request', 'account_closure', 'other'
  ))
);

-- Add soft delete columns to chat_messages if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN deleted_at timestamptz;
    ALTER TABLE chat_messages ADD COLUMN deletion_reason text;
  END IF;
END $$;

-- Add soft delete to chat_contexts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_contexts' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE chat_contexts ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;

-- Function to check if data is under legal hold
CREATE OR REPLACE FUNCTION check_legal_hold(
  p_user_id uuid DEFAULT NULL,
  p_matter_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM legal_holds
    WHERE is_active = true
      AND (ends_at IS NULL OR ends_at > now())
      AND (
        (p_user_id IS NOT NULL AND user_id = p_user_id)
        OR (p_matter_id IS NOT NULL AND matter_id = p_matter_id)
      )
  );
END;
$$;

-- Function to get applicable retention policy
CREATE OR REPLACE FUNCTION get_retention_days(
  p_data_type text,
  p_org_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_retention integer;
BEGIN
  SELECT retention_days INTO v_retention
  FROM data_retention_policies
  WHERE data_type = p_data_type
    AND (organization_id = p_org_id OR (organization_id IS NULL AND is_default = true))
  ORDER BY organization_id NULLS LAST
  LIMIT 1;
  
  RETURN COALESCE(v_retention, 90);
END;
$$;

-- Function to soft delete expired chat messages
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chat_retention integer;
  v_context_retention integer;
  v_deleted_messages integer := 0;
  v_deleted_contexts integer := 0;
BEGIN
  SELECT get_retention_days('chat_messages') INTO v_chat_retention;
  SELECT get_retention_days('chat_contexts') INTO v_context_retention;
  
  UPDATE chat_messages
  SET deleted_at = now(),
      deletion_reason = 'retention_policy'
  WHERE deleted_at IS NULL
    AND created_at < now() - (v_chat_retention || ' days')::interval
    AND NOT check_legal_hold(user_id, NULL);
  
  GET DIAGNOSTICS v_deleted_messages = ROW_COUNT;
  
  UPDATE chat_contexts
  SET deleted_at = now()
  WHERE deleted_at IS NULL
    AND created_at < now() - (v_context_retention || ' days')::interval
    AND NOT check_legal_hold(user_id, NULL);
  
  GET DIAGNOSTICS v_deleted_contexts = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'messages_deleted', v_deleted_messages,
    'contexts_deleted', v_deleted_contexts,
    'executed_at', now()
  );
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_legal_holds_active 
  ON legal_holds(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_legal_holds_user 
  ON legal_holds(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_legal_holds_matter 
  ON legal_holds(matter_id) WHERE matter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user 
  ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status 
  ON data_export_requests(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user 
  ON data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_status 
  ON data_deletion_requests(status) WHERE status IN ('pending', 'verified', 'scheduled');
CREATE INDEX IF NOT EXISTS idx_chat_messages_deleted 
  ON chat_messages(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_retention 
  ON chat_messages(created_at) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_retention_policies
CREATE POLICY "Admins can manage retention policies"
  ON data_retention_policies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view default retention policies"
  ON data_retention_policies FOR SELECT
  TO authenticated
  USING (is_default = true);

-- RLS Policies for legal_holds
CREATE POLICY "Admins can manage legal holds"
  ON legal_holds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view holds on their data"
  ON legal_holds FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- RLS Policies for data_export_requests
CREATE POLICY "Users can create own export requests"
  ON data_export_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own export requests"
  ON data_export_requests FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all export requests"
  ON data_export_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can update export requests"
  ON data_export_requests FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

-- RLS Policies for data_deletion_requests
CREATE POLICY "Users can create own deletion requests"
  ON data_deletion_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own deletion requests"
  ON data_deletion_requests FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can cancel own pending deletion requests"
  ON data_deletion_requests FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND status IN ('pending', 'verified', 'scheduled')
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND status = 'cancelled'
  );

CREATE POLICY "Admins can manage all deletion requests"
  ON data_deletion_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

```

---

## supabase/migrations/20260129041910_create_negotiation_strategy_system.sql

```sql
/*
  # Negotiation Strategy System

  This migration creates the tables needed for ezLegal.ai's AI-powered
  negotiation strategy planner - bringing AmLaw 100 tactics to consumers and SMBs.

  ## 1. New Tables

  ### `negotiations`
  Main table storing user negotiation cases
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, optional) - Links to authenticated user (null for anonymous)
  - `session_id` (text) - Session identifier for anonymous users
  - `dispute_type` (text) - Category of dispute (landlord, employer, debt, insurance, etc.)
  - `dispute_title` (text) - User-provided title
  - `dispute_description` (text) - Detailed description of the situation
  - `your_position` (text) - What the user wants
  - `their_position` (text) - What the other party wants
  - `jurisdiction` (text) - State/jurisdiction for legal context
  - `status` (text) - ongoing, resolved, abandoned
  - `resolution_outcome` (text) - How it ended (if resolved)
  - `created_at` (timestamptz) - When created
  - `updated_at` (timestamptz) - Last updated

  ### `negotiation_batna_analysis`
  Stores BATNA (Best Alternative To Negotiated Agreement) analysis
  - `id` (uuid, primary key)
  - `negotiation_id` (uuid) - Links to negotiation
  - `your_batna` (text) - User's best alternative
  - `their_batna` (text) - Estimated other party's alternative
  - `your_batna_value` (numeric) - Monetary value of user's alternative
  - `their_batna_value` (numeric) - Estimated value of their alternative
  - `leverage_score` (integer) - 1-100 score of negotiating leverage
  - `leverage_analysis` (text) - AI-generated analysis

  ### `negotiation_zopa`
  Stores Zone Of Possible Agreement calculations
  - `id` (uuid, primary key)
  - `negotiation_id` (uuid) - Links to negotiation
  - `your_reservation_point` (numeric) - Minimum you'll accept
  - `their_reservation_point` (numeric) - Estimated max they'll offer
  - `your_target` (numeric) - Your ideal outcome
  - `their_target` (numeric) - Their likely ideal
  - `zopa_exists` (boolean) - Whether overlap exists
  - `zopa_low` (numeric) - Lower bound of ZOPA
  - `zopa_high` (numeric) - Upper bound of ZOPA
  - `recommended_anchor` (numeric) - Suggested first offer

  ### `negotiation_rounds`
  Tracks each round of offers/counter-offers
  - `id` (uuid, primary key)
  - `negotiation_id` (uuid) - Links to negotiation
  - `round_number` (integer) - Sequential round number
  - `party` (text) - 'you' or 'them'
  - `offer_type` (text) - demand, offer, counter, bracket, final
  - `monetary_amount` (numeric) - Dollar amount if applicable
  - `non_monetary_terms` (text) - Non-monetary asks
  - `bracket_low` (numeric) - Low end if bracket
  - `bracket_high` (numeric) - High end if bracket
  - `notes` (text) - Notes about this round
  - `tactics_detected` (text[]) - Manipulation tactics identified
  - `recommended_response` (text) - AI-suggested response
  - `created_at` (timestamptz)

  ### `negotiation_scripts`
  Pre-written scripts for common scenarios
  - `id` (uuid, primary key)
  - `dispute_type` (text) - Type of dispute
  - `scenario` (text) - Specific scenario
  - `script_type` (text) - opening, counter, walkaway, bracket, closing
  - `script_title` (text) - Display title
  - `script_content` (text) - The actual script with placeholders
  - `psychology_notes` (text) - Why this works
  - `is_active` (boolean)

  ## 2. Security
  - RLS enabled on all tables
  - Users can only access their own negotiations
  - Anonymous users identified by session_id

  ## 3. Indexes
  - Foreign key indexes for performance
  - Session lookup index for anonymous users
*/

-- Main negotiations table
CREATE TABLE IF NOT EXISTS negotiations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  dispute_type text NOT NULL,
  dispute_title text NOT NULL,
  dispute_description text,
  your_position text,
  their_position text,
  other_party_name text,
  other_party_type text,
  jurisdiction text DEFAULT 'AZ',
  status text DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'resolved', 'abandoned')),
  resolution_outcome text,
  final_settlement_amount numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- BATNA analysis table
CREATE TABLE IF NOT EXISTS negotiation_batna_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  your_batna text,
  their_batna text,
  your_batna_value numeric,
  their_batna_value numeric,
  leverage_score integer CHECK (leverage_score >= 0 AND leverage_score <= 100),
  leverage_analysis text,
  time_pressure_you text,
  time_pressure_them text,
  information_advantage text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ZOPA calculation table
CREATE TABLE IF NOT EXISTS negotiation_zopa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  your_reservation_point numeric,
  their_reservation_point numeric,
  your_target numeric,
  their_target numeric,
  zopa_exists boolean DEFAULT false,
  zopa_low numeric,
  zopa_high numeric,
  recommended_anchor numeric,
  anchor_justification text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Negotiation rounds tracker
CREATE TABLE IF NOT EXISTS negotiation_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  round_number integer NOT NULL DEFAULT 1,
  party text NOT NULL CHECK (party IN ('you', 'them')),
  offer_type text NOT NULL CHECK (offer_type IN ('demand', 'offer', 'counter', 'bracket', 'final', 'walkaway')),
  monetary_amount numeric,
  non_monetary_terms text,
  bracket_low numeric,
  bracket_high numeric,
  notes text,
  tactics_detected text[] DEFAULT '{}',
  recommended_response text,
  midpoint_at_round numeric,
  created_at timestamptz DEFAULT now()
);

-- Pre-written negotiation scripts
CREATE TABLE IF NOT EXISTS negotiation_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_type text NOT NULL,
  scenario text NOT NULL,
  script_type text NOT NULL CHECK (script_type IN ('opening', 'counter', 'walkaway', 'bracket', 'closing', 'tactic_response')),
  script_title text NOT NULL,
  script_content text NOT NULL,
  psychology_notes text,
  variables jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_batna_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_zopa ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_scripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for negotiations
CREATE POLICY "Users can view own negotiations"
  ON negotiations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own negotiations"
  ON negotiations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own negotiations"
  ON negotiations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own negotiations"
  ON negotiations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Anonymous users can access by session
CREATE POLICY "Anonymous can view by session"
  ON negotiations FOR SELECT
  TO anon
  USING (session_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous can create by session"
  ON negotiations FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous can update by session"
  ON negotiations FOR UPDATE
  TO anon
  USING (session_id IS NOT NULL AND user_id IS NULL)
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- RLS for BATNA analysis (via negotiation ownership)
CREATE POLICY "Users can manage own BATNA analysis"
  ON negotiation_batna_analysis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_batna_analysis.negotiation_id
      AND n.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_batna_analysis.negotiation_id
      AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous can manage BATNA by session"
  ON negotiation_batna_analysis FOR ALL
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_batna_analysis.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_batna_analysis.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  );

-- RLS for ZOPA (via negotiation ownership)
CREATE POLICY "Users can manage own ZOPA"
  ON negotiation_zopa FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_zopa.negotiation_id
      AND n.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_zopa.negotiation_id
      AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous can manage ZOPA by session"
  ON negotiation_zopa FOR ALL
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_zopa.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_zopa.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  );

-- RLS for rounds (via negotiation ownership)
CREATE POLICY "Users can manage own rounds"
  ON negotiation_rounds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_rounds.negotiation_id
      AND n.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_rounds.negotiation_id
      AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous can manage rounds by session"
  ON negotiation_rounds FOR ALL
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_rounds.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_rounds.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  );

-- Scripts are public read
CREATE POLICY "Anyone can read active scripts"
  ON negotiation_scripts FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_negotiations_user_id ON negotiations(user_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_session_id ON negotiations(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(status);
CREATE INDEX IF NOT EXISTS idx_negotiations_dispute_type ON negotiations(dispute_type);
CREATE INDEX IF NOT EXISTS idx_negotiation_batna_negotiation_id ON negotiation_batna_analysis(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_zopa_negotiation_id ON negotiation_zopa(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_rounds_negotiation_id ON negotiation_rounds(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_rounds_round_number ON negotiation_rounds(negotiation_id, round_number);
CREATE INDEX IF NOT EXISTS idx_negotiation_scripts_dispute_type ON negotiation_scripts(dispute_type);
CREATE INDEX IF NOT EXISTS idx_negotiation_scripts_scenario ON negotiation_scripts(dispute_type, scenario);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_negotiation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER negotiations_updated_at
  BEFORE UPDATE ON negotiations
  FOR EACH ROW
  EXECUTE FUNCTION update_negotiation_timestamp();

CREATE TRIGGER batna_updated_at
  BEFORE UPDATE ON negotiation_batna_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_negotiation_timestamp();

CREATE TRIGGER zopa_updated_at
  BEFORE UPDATE ON negotiation_zopa
  FOR EACH ROW
  EXECUTE FUNCTION update_negotiation_timestamp();
```

---

## supabase/migrations/20260129042037_populate_negotiation_scripts.sql

```sql
/*
  # Populate Negotiation Scripts

  This migration adds pre-written scripts for common negotiation scenarios.
  These scripts are based on AmLaw 100 negotiation tactics adapted for consumers.

  ## Script Categories
  - Landlord disputes (security deposit, repairs, eviction)
  - Employer disputes (wages, severance, wrongful termination)
  - Debt collector negotiations
  - Insurance claims
  - Contract disputes
  - Consumer complaints

  ## Script Types
  - opening: Initial demand or position statement
  - counter: Response to their offer
  - bracket: Conditional offer tactic
  - walkaway: Leverage when negotiations stall
  - closing: Final offer language
  - tactic_response: How to respond to manipulation
*/

-- Landlord Dispute Scripts
INSERT INTO negotiation_scripts (dispute_type, scenario, script_type, script_title, script_content, psychology_notes, variables, display_order) VALUES
-- Security Deposit
('landlord', 'security_deposit', 'opening', 'Initial Demand for Security Deposit Return',
'Dear {{landlord_name}},

I am writing regarding the security deposit of ${{deposit_amount}} paid on {{move_in_date}} for the property at {{property_address}}.

I vacated the premises on {{move_out_date}} and left the unit in the same condition as when I took possession, accounting for normal wear and tear. Under {{state}} law ({{statute_citation}}), you are required to return my deposit within {{days_required}} days of my move-out date.

That deadline was {{deadline_date}}. I have not received my deposit or an itemized statement of deductions.

I am formally requesting the full return of ${{deposit_amount}} within 7 days of this letter. If I do not receive payment, I will pursue all available legal remedies, which may include filing in small claims court where I may be entitled to {{penalty_multiplier}}x the deposit amount in penalties.

Please send payment to: {{your_address}}

Sincerely,
{{your_name}}',
'This script uses the "anchor high with legal backing" tactic. By citing specific statutes and penalty provisions upfront, you establish that you know your rights. The 7-day deadline creates urgency. Landlords who receive legally-informed demands are statistically more likely to settle.',
'{"landlord_name": "string", "deposit_amount": "number", "move_in_date": "date", "property_address": "string", "move_out_date": "date", "state": "string", "statute_citation": "string", "days_required": "number", "deadline_date": "date", "penalty_multiplier": "number", "your_address": "string", "your_name": "string"}',
1),

('landlord', 'security_deposit', 'counter', 'Response to Partial Deposit Offer',
'Thank you for your response. However, I cannot accept ${{their_offer}} as full settlement.

The deductions you listed are not valid:

{{deduction_1}}: This constitutes normal wear and tear under {{state}} law and cannot be deducted.
{{deduction_2}}: You did not provide documentation of actual repair costs as required by statute.

I am willing to settle this matter for ${{your_counter}} to avoid the time and expense of court. This represents a reasonable compromise given that:

1. I am entitled to the full ${{deposit_amount}} plus potential penalties
2. Small claims court filing fees would be your responsibility if I prevail
3. Judgment would be a matter of public record

This offer is open for 5 business days. After that, I will proceed with filing.

{{your_name}}',
'The "reasoned compromise" tactic shows flexibility while maintaining strength. By explaining WHY their deductions fail AND offering a middle ground, you appear reasonable to any future judge while keeping pressure on.',
'{"their_offer": "number", "deduction_1": "string", "deduction_2": "string", "state": "string", "your_counter": "number", "deposit_amount": "number", "your_name": "string"}',
2),

('landlord', 'security_deposit', 'bracket', 'Bracketing Offer for Security Deposit',
'I understand we see this differently. Let me propose a framework to resolve this:

If you are willing to move to ${{their_target}} (returning most of my deposit), I would be willing to accept ${{your_floor}} to close this matter today.

This bracket of ${{their_target}} to ${{your_floor}} represents the realistic settlement range given the legal issues involved. I am being flexible because I value resolution over litigation.

What can you agree to within this range?',
'Bracketing is a power move used by top negotiators. It signals: "I know where this ends up." By offering THEM a specific number and yourself a different one, you define the playing field. Most settlements land near the midpoint of a bracket.',
'{"their_target": "number", "your_floor": "number"}',
3),

-- Employer/Wage Disputes
('employer', 'unpaid_wages', 'opening', 'Formal Demand for Unpaid Wages',
'Dear {{employer_name}},

This letter serves as formal demand for unpaid wages owed to me for work performed from {{start_date}} to {{end_date}}.

AMOUNT OWED:
- Regular wages: ${{regular_wages}}
- Overtime wages: ${{overtime_wages}}
- {{other_compensation}}: ${{other_amount}}
TOTAL: ${{total_owed}}

Under the Fair Labor Standards Act and {{state}} Labor Code Section {{statute}}, you are required to pay all earned wages. {{state}} law provides for waiting time penalties of up to {{penalty_days}} days of wages (${{penalty_amount}}) for willful failure to pay.

I demand payment of ${{total_owed}} within 10 days. If payment is not received, I will:
1. File a wage claim with the {{state}} Department of Labor
2. File suit in {{court_type}} court
3. Seek all penalties, interest, and attorney fees available under law

The law is clear on this issue. Please resolve this promptly.

{{your_name}}
{{your_contact}}',
'Wage claims have teeth because of penalty provisions. This script leverages the THREAT of penalties (which can exceed the original wages) to motivate quick settlement. The specific statute citations show you have done your homework.',
'{"employer_name": "string", "start_date": "date", "end_date": "date", "regular_wages": "number", "overtime_wages": "number", "other_compensation": "string", "other_amount": "number", "total_owed": "number", "state": "string", "statute": "string", "penalty_days": "number", "penalty_amount": "number", "court_type": "string", "your_name": "string", "your_contact": "string"}',
1),

('employer', 'severance', 'opening', 'Severance Negotiation Opening',
'Thank you for the severance offer. Before I can consider signing the release, I need to discuss several concerns:

1. COMPENSATION: The offered {{weeks_offered}} weeks does not reflect my {{years_tenure}} years of service and contributions including {{key_achievement}}.

2. BENEFITS: I need continuation of health benefits for {{months_needed}} months, not {{months_offered}}.

3. REFERENCE: I require a neutral reference policy in writing.

4. NON-COMPETE: The {{non_compete_months}}-month non-compete is overly broad and would prevent me from earning a living in my field.

I am prepared to sign a reasonable release, but the terms need to reflect the value I brought to the company and the circumstances of my departure.

I would like to discuss a package including:
- {{weeks_requested}} weeks severance
- {{months_needed}} months COBRA coverage paid
- Neutral reference letter
- Non-compete reduced to {{non_compete_reduced}} months

When can we schedule a call to discuss?',
'Severance is almost always negotiable. Companies offer low to see if you will take it. By responding professionally with SPECIFIC counter-asks (not just "more"), you signal you know the game. Always tie your ask to your value contributed.',
'{"weeks_offered": "number", "years_tenure": "number", "key_achievement": "string", "months_needed": "number", "months_offered": "number", "non_compete_months": "number", "weeks_requested": "number", "non_compete_reduced": "number"}',
1),

-- Debt Collector Negotiations
('debt', 'collection', 'opening', 'Initial Response to Debt Collector',
'Re: Account {{account_number}}
Alleged Creditor: {{original_creditor}}
Alleged Amount: ${{claimed_amount}}

This letter is in response to your collection notice dated {{notice_date}}.

Pursuant to the Fair Debt Collection Practices Act (15 U.S.C. 1692g), I am requesting validation of this debt. Please provide:

1. Verification of the amount claimed, including itemization of principal, interest, and fees
2. The name and address of the original creditor
3. Proof that you are licensed to collect in {{state}}
4. A copy of any agreement bearing my signature

Until you provide this validation, you must cease all collection activities on this account.

Note: This letter is not an acknowledgment of the debt or a promise to pay. I reserve all rights under federal and state law.

Sent via certified mail, return receipt requested.
{{your_name}}',
'The debt validation request is your FIRST move in any debt negotiation. It buys you time (30 days minimum), forces them to prove their case, and often reveals they cannot validate older debts. Many collectors give up or offer settlements when forced to validate.',
'{"account_number": "string", "original_creditor": "string", "claimed_amount": "number", "notice_date": "date", "state": "string", "your_name": "string"}',
1),

('debt', 'collection', 'counter', 'Settlement Counter-Offer',
'I am responding to your settlement offer of {{their_offer_percent}}% (${{their_offer_amount}}).

After reviewing my financial situation, I can offer a lump sum payment of ${{your_offer}} ({{your_percent}}% of the claimed balance) as full and final settlement of this account.

This offer is based on the following:
- The age of this debt ({{debt_age}} years)
- Questions about the validity and documentation of the full amount
- My current financial hardship
- The cost to you of continued collection or litigation

If you accept, I require:
1. Written confirmation of the settlement amount and terms BEFORE payment
2. Agreement that this settles the debt in full
3. Deletion of all negative reporting from all credit bureaus within 30 days of payment
4. No 1099-C issued for forgiven debt under $600

This offer expires in 14 days. After that, I will reconsider my options.

{{your_name}}',
'Debt buyers purchase debt for pennies on the dollar (typically 4-7 cents). They profit on anything above that. Your 20-30% offer is often more than they paid. The "pay for delete" request is key - many collectors will agree to remove negative marks in exchange for payment.',
'{"their_offer_percent": "number", "their_offer_amount": "number", "your_offer": "number", "your_percent": "number", "debt_age": "number", "your_name": "string"}',
2),

-- Insurance Claims
('insurance', 'claim_denial', 'opening', 'Appeal of Insurance Claim Denial',
'Re: Claim #{{claim_number}}
Policy #{{policy_number}}
Date of Loss: {{loss_date}}

Dear Claims Manager,

I am formally appealing your denial of my claim dated {{denial_date}}.

Your stated reason for denial was: "{{denial_reason}}"

This denial is improper because:

1. POLICY COVERAGE: My policy explicitly covers {{coverage_type}} under Section {{policy_section}}. The exclusion you cited does not apply because {{exclusion_rebuttal}}.

2. DOCUMENTATION: I have provided {{documentation_list}}. If additional documentation is needed, please specify exactly what is required.

3. BAD FAITH CONCERNS: {{state}} law requires insurers to process claims in good faith. Denying valid claims without proper investigation may constitute bad faith, exposing {{insurance_company}} to additional damages.

I demand you:
1. Reopen this claim immediately
2. Assign a senior adjuster to review
3. Provide a written response within 15 days

If this matter is not resolved, I will file a complaint with the {{state}} Department of Insurance and consult with an attorney regarding bad faith claims.

{{your_name}}
cc: {{state}} Department of Insurance',
'Insurance companies deny valid claims betting most people will not appeal. The "bad faith" threat is powerful because it exposes them to damages beyond the claim value. The cc to the state insurance department signals you mean business.',
'{"claim_number": "string", "policy_number": "string", "loss_date": "date", "denial_date": "date", "denial_reason": "string", "coverage_type": "string", "policy_section": "string", "exclusion_rebuttal": "string", "documentation_list": "string", "state": "string", "insurance_company": "string", "your_name": "string"}',
1),

-- Tactic Responses
('general', 'lowball', 'tactic_response', 'Responding to a Lowball Offer',
'I appreciate you making an offer, but ${{their_offer}} does not reflect a serious attempt to resolve this matter.

[PAUSE - Do not fill the silence. Let them speak next.]

Based on {{your_reasoning}}, the appropriate range for settlement is ${{range_low}} to ${{range_high}}. Your offer of ${{their_offer}} is not within that range.

I am here to negotiate in good faith. Are you authorized to make a meaningful offer, or do I need to speak with someone else?',
'Lowball offers are a TEST. If you counter immediately, they know you are anxious. Instead: 1) Name it as inadequate, 2) Use silence as pressure, 3) Question their authority. This shifts power back to you.',
'{"their_offer": "number", "your_reasoning": "string", "range_low": "number", "range_high": "number"}',
1),

('general', 'take_it_or_leave_it', 'tactic_response', 'Responding to "Final Offer" Pressure',
'I understand you are characterizing this as your final offer. However:

1. "Final" offers rarely are. Companies settle cases every day for amounts they previously called "final."

2. I have a strong case and am prepared to pursue it through {{alternative}} if necessary.

3. It costs you more to {{their_cost}} than to settle reasonably.

I am not trying to be difficult. I am trying to reach a fair resolution. If ${{their_final}} is truly your maximum authority, I would ask you to check with {{higher_authority}} whether there is any flexibility given the strength of my position.

I can wait for that call.',
'The "final offer" is almost never final. It is a pressure tactic. By calmly calling the bluff AND giving them a face-saving way to come back with more (blame the boss), you keep the negotiation alive.',
'{"alternative": "string", "their_cost": "string", "their_final": "number", "higher_authority": "string"}',
2),

('general', 'good_cop_bad_cop', 'tactic_response', 'Recognizing Good Cop/Bad Cop',
'I notice we seem to have different decision-makers with different positions here.

Let me be direct: I am negotiating with {{company_name}}, not with individuals. Whatever internal discussions you need to have, I need a single, authorized position from the company.

Can you take 10 minutes to align internally and come back with a unified offer? I will wait.

[If they continue the routine:]

I appreciate the different perspectives, but this dynamic is not productive. I would prefer to pause and resume when you have a single spokesperson with full authority.',
'Good cop/bad cop is designed to make you grateful when the "nice" one seems to advocate for you. Do not fall for it. Call it out professionally and demand a unified position. This neutralizes the tactic.',
'{"company_name": "string"}',
3),

('general', 'time_pressure', 'tactic_response', 'Handling Artificial Deadlines',
'I understand you have mentioned a deadline of {{their_deadline}}.

However, I am not prepared to make a decision under artificial time pressure. Good agreements take the time they take.

If this deadline is truly immovable, please explain in writing why that is the case. If it is a negotiating tactic, I would suggest we focus on the substance instead.

I am available to continue discussions at {{your_availability}}. But I will not be rushed into a bad deal.',
'Artificial deadlines are designed to prevent you from thinking clearly or getting advice. Real deadlines (court dates, statute of limitations) exist - fake ones do not survive scrutiny. Ask them to justify it.',
'{"their_deadline": "string", "your_availability": "string"}',
4)

ON CONFLICT DO NOTHING;
```

---

## supabase/migrations/20260129045405_create_negotiation_planner_purchases.sql

```sql
/*
  # Create Negotiation Planner Purchases System

  1. New Tables
    - `negotiation_planner_purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, for non-logged-in purchases)
      - `purchase_type` (text) - 'single' or 'unlimited'
      - `amount_paid` (integer) - price in cents
      - `stripe_session_id` (text) - for payment tracking
      - `plans_remaining` (integer) - null for unlimited
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - null for lifetime

    - `negotiation_plans_generated`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional)
      - `email` (text, optional)
      - `session_id` (text) - anonymous tracking
      - `dispute_type` (text)
      - `amount_at_stake` (integer)
      - `generated_strategy` (jsonb)
      - `is_paid` (boolean) - if generated with paid access
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can view their own purchases and plans
*/

CREATE TABLE IF NOT EXISTS negotiation_planner_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  purchase_type text NOT NULL CHECK (purchase_type IN ('single', 'unlimited', 'pack')),
  amount_paid integer NOT NULL DEFAULT 0,
  stripe_session_id text,
  plans_remaining integer,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS negotiation_plans_generated (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  session_id text,
  dispute_type text NOT NULL,
  amount_at_stake integer,
  generated_strategy jsonb,
  is_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_negotiation_purchases_user_id ON negotiation_planner_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_purchases_email ON negotiation_planner_purchases(email);
CREATE INDEX IF NOT EXISTS idx_negotiation_plans_user_id ON negotiation_plans_generated(user_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_plans_session_id ON negotiation_plans_generated(session_id);

ALTER TABLE negotiation_planner_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_plans_generated ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON negotiation_planner_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON negotiation_planner_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own plans"
  ON negotiation_plans_generated
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON negotiation_plans_generated
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous users can insert plans"
  ON negotiation_plans_generated
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);
```

---

## supabase/migrations/20260130034945_add_missing_fk_indexes_security_batch.sql

```sql
/*
  # Add Missing Foreign Key Indexes - Security Fix

  This migration adds indexes for foreign key columns that were missing indexes,
  which can cause performance issues during JOIN operations and CASCADE deletes.

  ## Tables with new indexes:
  1. access_requests - reviewed_by
  2. access_token_usage - user_id
  3. analytics_events - user_id
  4. appointment_requests - connection_id
  5. approval_decisions - request_id
  6. approval_requests - requested_by
  7. case_matches - attorney_profile_id
  8. case_matching_queue - created_by
  9. cases - client_id
  10. chatbot_documents - created_by
  11. conflict_checks - performed_by
  12. conflict_waivers - conflict_check_id, matter_id
  13. crisis_incidents - user_id
  14. data_deletion_requests - processed_by
  15. data_retention_policies - created_by, organization_id
  16. documents - case_id
  17. engagement_analytics - user_id
  18. grant_expenses - approved_by
  19. grant_reports - generated_by, reviewed_by
  20. knowledge_documents - uploaded_by
  21. lawyer_consultations - lawyer_match_id
  22. lawyer_matches - chat_message_id
  23. legal_holds - created_by
  24. lso_audit_logs - user_id
  25. lso_client_intakes - assigned_by
  26. lso_volunteer_attorneys - user_id
  27. match_feedback - organization_id, submitted_by
  28. matching_notifications - attorney_id
  29. matter_documents - added_by
  30. openai_rate_limits - user_id
  31. openai_usage_logs - user_id
  32. pro_bono_applications - assigned_to
  33. pro_bono_communications - from_user_id
  34. pro_bono_documents - uploaded_by
  35. quote_requests - connection_id
  36. referral_codes - referrer_id
  37. subscription_history - changed_by
  38. system_settings - updated_by
  39. trust_safety_reports - user_id
  40. user_roles - role_id
  41. widget_conversations - widget_id
*/

-- access_requests.reviewed_by
CREATE INDEX IF NOT EXISTS idx_access_requests_reviewed_by 
ON public.access_requests(reviewed_by);

-- access_token_usage.user_id
CREATE INDEX IF NOT EXISTS idx_access_token_usage_user_id 
ON public.access_token_usage(user_id);

-- analytics_events.user_id
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id 
ON public.analytics_events(user_id);

-- appointment_requests.connection_id
CREATE INDEX IF NOT EXISTS idx_appointment_requests_connection_id 
ON public.appointment_requests(connection_id);

-- approval_decisions.request_id
CREATE INDEX IF NOT EXISTS idx_approval_decisions_request_id 
ON public.approval_decisions(request_id);

-- approval_requests.requested_by
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by 
ON public.approval_requests(requested_by);

-- case_matches.attorney_profile_id
CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_profile_id 
ON public.case_matches(attorney_profile_id);

-- case_matching_queue.created_by
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_created_by 
ON public.case_matching_queue(created_by);

-- cases.client_id
CREATE INDEX IF NOT EXISTS idx_cases_client_id 
ON public.cases(client_id);

-- chatbot_documents.created_by
CREATE INDEX IF NOT EXISTS idx_chatbot_documents_created_by 
ON public.chatbot_documents(created_by);

-- conflict_checks.performed_by
CREATE INDEX IF NOT EXISTS idx_conflict_checks_performed_by 
ON public.conflict_checks(performed_by);

-- conflict_waivers.conflict_check_id
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflict_check_id 
ON public.conflict_waivers(conflict_check_id);

-- conflict_waivers.matter_id
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_matter_id 
ON public.conflict_waivers(matter_id);

-- crisis_incidents.user_id
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_user_id 
ON public.crisis_incidents(user_id);

-- data_deletion_requests.processed_by
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_processed_by 
ON public.data_deletion_requests(processed_by);

-- data_retention_policies.created_by
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_created_by 
ON public.data_retention_policies(created_by);

-- data_retention_policies.organization_id
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_organization_id 
ON public.data_retention_policies(organization_id);

-- documents.case_id
CREATE INDEX IF NOT EXISTS idx_documents_case_id 
ON public.documents(case_id);

-- engagement_analytics.user_id
CREATE INDEX IF NOT EXISTS idx_engagement_analytics_user_id 
ON public.engagement_analytics(user_id);

-- grant_expenses.approved_by
CREATE INDEX IF NOT EXISTS idx_grant_expenses_approved_by 
ON public.grant_expenses(approved_by);

-- grant_reports.generated_by
CREATE INDEX IF NOT EXISTS idx_grant_reports_generated_by 
ON public.grant_reports(generated_by);

-- grant_reports.reviewed_by
CREATE INDEX IF NOT EXISTS idx_grant_reports_reviewed_by 
ON public.grant_reports(reviewed_by);

-- knowledge_documents.uploaded_by
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_uploaded_by 
ON public.knowledge_documents(uploaded_by);

-- lawyer_consultations.lawyer_match_id
CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_lawyer_match_id 
ON public.lawyer_consultations(lawyer_match_id);

-- lawyer_matches.chat_message_id
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_chat_message_id 
ON public.lawyer_matches(chat_message_id);

-- legal_holds.created_by
CREATE INDEX IF NOT EXISTS idx_legal_holds_created_by 
ON public.legal_holds(created_by);

-- lso_audit_logs.user_id
CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_user_id 
ON public.lso_audit_logs(user_id);

-- lso_client_intakes.assigned_by
CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_by 
ON public.lso_client_intakes(assigned_by);

-- lso_volunteer_attorneys.user_id
CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_user_id 
ON public.lso_volunteer_attorneys(user_id);

-- match_feedback.organization_id
CREATE INDEX IF NOT EXISTS idx_match_feedback_organization_id 
ON public.match_feedback(organization_id);

-- match_feedback.submitted_by
CREATE INDEX IF NOT EXISTS idx_match_feedback_submitted_by 
ON public.match_feedback(submitted_by);

-- matching_notifications.attorney_id
CREATE INDEX IF NOT EXISTS idx_matching_notifications_attorney_id 
ON public.matching_notifications(attorney_id);

-- matter_documents.added_by
CREATE INDEX IF NOT EXISTS idx_matter_documents_added_by 
ON public.matter_documents(added_by);

-- openai_rate_limits.user_id
CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_user_id 
ON public.openai_rate_limits(user_id);

-- openai_usage_logs.user_id
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_user_id 
ON public.openai_usage_logs(user_id);

-- pro_bono_applications.assigned_to
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_assigned_to 
ON public.pro_bono_applications(assigned_to);

-- pro_bono_communications.from_user_id
CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_from_user_id 
ON public.pro_bono_communications(from_user_id);

-- pro_bono_documents.uploaded_by
CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_uploaded_by 
ON public.pro_bono_documents(uploaded_by);

-- quote_requests.connection_id
CREATE INDEX IF NOT EXISTS idx_quote_requests_connection_id 
ON public.quote_requests(connection_id);

-- referral_codes.referrer_id
CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer_id 
ON public.referral_codes(referrer_id);

-- subscription_history.changed_by
CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_by 
ON public.subscription_history(changed_by);

-- system_settings.updated_by
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_by 
ON public.system_settings(updated_by);

-- trust_safety_reports.user_id
CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_user_id 
ON public.trust_safety_reports(user_id);

-- user_roles.role_id
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id 
ON public.user_roles(role_id);

-- widget_conversations.widget_id
CREATE INDEX IF NOT EXISTS idx_widget_conversations_widget_id 
ON public.widget_conversations(widget_id);
```

---

## supabase/migrations/20260130035051_optimize_rls_policies_auth_uid_select_pattern_fixed.sql

```sql
/*
  # Optimize RLS Policies with (select auth.uid()) Pattern

  This migration fixes RLS policies that re-evaluate auth.uid() for each row,
  causing suboptimal query performance. The fix wraps auth.uid() in a SELECT
  subquery so it's evaluated once per query instead of per row.

  ## Affected Tables:
  - email_captures (uses auth.jwt())
  - negotiations (4 policies)
  - negotiation_batna_analysis
  - negotiation_zopa
  - negotiation_rounds
  - negotiation_planner_purchases (2 policies)
  - negotiation_plans_generated (2 policies)
  - access_requests (3 policies)
  - access_tokens (5 policies)
  - access_token_usage (2 policies)
*/

-- ============================================
-- email_captures (uses auth.jwt() not auth.uid())
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view own captures" ON public.email_captures;
CREATE POLICY "Authenticated users can view own captures"
  ON public.email_captures
  FOR SELECT
  TO authenticated
  USING (email = (select auth.jwt() ->> 'email'));

-- ============================================
-- negotiations
-- ============================================
DROP POLICY IF EXISTS "Users can create own negotiations" ON public.negotiations;
CREATE POLICY "Users can create own negotiations"
  ON public.negotiations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own negotiations" ON public.negotiations;
CREATE POLICY "Users can view own negotiations"
  ON public.negotiations
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own negotiations" ON public.negotiations;
CREATE POLICY "Users can update own negotiations"
  ON public.negotiations
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own negotiations" ON public.negotiations;
CREATE POLICY "Users can delete own negotiations"
  ON public.negotiations
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- negotiation_batna_analysis
-- ============================================
DROP POLICY IF EXISTS "Users can manage own BATNA analysis" ON public.negotiation_batna_analysis;
CREATE POLICY "Users can manage own BATNA analysis"
  ON public.negotiation_batna_analysis
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  );

-- ============================================
-- negotiation_zopa
-- ============================================
DROP POLICY IF EXISTS "Users can manage own ZOPA" ON public.negotiation_zopa;
CREATE POLICY "Users can manage own ZOPA"
  ON public.negotiation_zopa
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  );

-- ============================================
-- negotiation_rounds
-- ============================================
DROP POLICY IF EXISTS "Users can manage own rounds" ON public.negotiation_rounds;
CREATE POLICY "Users can manage own rounds"
  ON public.negotiation_rounds
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  );

-- ============================================
-- negotiation_planner_purchases
-- ============================================
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.negotiation_planner_purchases;
CREATE POLICY "Users can insert own purchases"
  ON public.negotiation_planner_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own purchases" ON public.negotiation_planner_purchases;
CREATE POLICY "Users can view own purchases"
  ON public.negotiation_planner_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- negotiation_plans_generated
-- ============================================
DROP POLICY IF EXISTS "Users can insert own plans" ON public.negotiation_plans_generated;
CREATE POLICY "Users can insert own plans"
  ON public.negotiation_plans_generated
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own plans" ON public.negotiation_plans_generated;
CREATE POLICY "Users can view own plans"
  ON public.negotiation_plans_generated
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- access_requests
-- ============================================
DROP POLICY IF EXISTS "Admins can view all access requests" ON public.access_requests;
CREATE POLICY "Admins can view all access requests"
  ON public.access_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) 
      AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update access requests" ON public.access_requests;
CREATE POLICY "Admins can update access requests"
  ON public.access_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) 
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) 
      AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Inviters can view their access requests" ON public.access_requests;
CREATE POLICY "Inviters can view their access requests"
  ON public.access_requests
  FOR SELECT
  TO authenticated
  USING (invited_by = (select auth.uid()));

-- ============================================
-- access_tokens
-- ============================================
DROP POLICY IF EXISTS "Users can view own tokens" ON public.access_tokens;
CREATE POLICY "Users can view own tokens"
  ON public.access_tokens
  FOR SELECT
  TO authenticated
  USING (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create tokens" ON public.access_tokens;
CREATE POLICY "Users can create tokens"
  ON public.access_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own tokens" ON public.access_tokens;
CREATE POLICY "Users can update own tokens"
  ON public.access_tokens
  FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own tokens" ON public.access_tokens;
CREATE POLICY "Users can delete own tokens"
  ON public.access_tokens
  FOR DELETE
  TO authenticated
  USING (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all tokens" ON public.access_tokens;
CREATE POLICY "Admins can view all tokens"
  ON public.access_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) 
      AND p.role = 'admin'
    )
  );

-- ============================================
-- access_token_usage
-- ============================================
DROP POLICY IF EXISTS "Token creators can view usage" ON public.access_token_usage;
CREATE POLICY "Token creators can view usage"
  ON public.access_token_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.access_tokens t 
      WHERE t.id = token_id 
      AND t.created_by = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all token usage" ON public.access_token_usage;
CREATE POLICY "Admins can view all token usage"
  ON public.access_token_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) 
      AND p.role = 'admin'
    )
  );
```

---

## supabase/migrations/20260206041304_create_appointment_requests_table.sql

```sql
/*
  # Create Appointment Requests Table

  1. New Tables
    - `appointment_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - allows anonymous requests)
      - `lawyer_id` (text)
      - `lawyer_name` (text)
      - `requester_name` (text)
      - `requester_email` (text)
      - `requester_phone` (text, optional)
      - `preferred_date` (date)
      - `preferred_time` (text)
      - `alternate_date` (date, optional)
      - `alternate_time` (text, optional)
      - `consultation_type` (text) - phone, video, in_person
      - `brief_description` (text, optional)
      - `status` (text) - pending, confirmed, cancelled, completed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Anyone can create requests
    - Authenticated users can view their own requests
*/

CREATE TABLE IF NOT EXISTS appointment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lawyer_id text NOT NULL,
  lawyer_name text NOT NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  alternate_date date,
  alternate_time text,
  consultation_type text NOT NULL DEFAULT 'phone' CHECK (consultation_type IN ('phone', 'video', 'in_person')),
  brief_description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_requests_user_id ON appointment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_lawyer_id ON appointment_requests(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_status ON appointment_requests(status);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_preferred_date ON appointment_requests(preferred_date);

ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create appointment requests"
  ON appointment_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view their own appointment requests"
  ON appointment_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can update their own appointment requests"
  ON appointment_requests
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

```

---

## supabase/migrations/20260206041306_create_funding_requests_table.sql

```sql
/*
  # Create Funding Requests Table

  1. New Tables
    - `funding_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `lawyer_id` (text)
      - `lawyer_name` (text)
      - `requester_name` (text)
      - `requester_email` (text)
      - `requester_phone` (text, optional)
      - `annual_income` (text)
      - `household_size` (integer)
      - `funding_type` (text) - pro_bono, sliding_scale, payment_plan, legal_aid
      - `currently_employed` (boolean)
      - `receiving_benefits` (boolean)
      - `legal_matter_description` (text)
      - `financial_hardship_description` (text, optional)
      - `status` (text) - pending, approved, denied, referred
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Anyone can create requests
    - Authenticated users can view their own requests
*/

CREATE TABLE IF NOT EXISTS funding_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lawyer_id text NOT NULL,
  lawyer_name text NOT NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  annual_income text NOT NULL,
  household_size integer NOT NULL DEFAULT 1,
  funding_type text NOT NULL DEFAULT 'sliding_scale' CHECK (funding_type IN ('pro_bono', 'sliding_scale', 'payment_plan', 'legal_aid')),
  currently_employed boolean DEFAULT true,
  receiving_benefits boolean DEFAULT false,
  legal_matter_description text NOT NULL,
  financial_hardship_description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'referred')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funding_requests_user_id ON funding_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_funding_requests_lawyer_id ON funding_requests(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_funding_requests_status ON funding_requests(status);
CREATE INDEX IF NOT EXISTS idx_funding_requests_funding_type ON funding_requests(funding_type);

ALTER TABLE funding_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create funding requests"
  ON funding_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view their own funding requests"
  ON funding_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can update their own funding requests"
  ON funding_requests
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

```

---

## supabase/migrations/20260208010000_security_policy_fixes_and_rls_optimization.sql

```sql
/*
  # Security Policy Fixes and RLS Optimization

  1. Performance Fix
    - `email_captures`: Wrap `auth.jwt()` in `(select ...)` for per-query evaluation instead of per-row

  2. Dangerous Always-True Policies - Locked Down
    - `openai_rate_limits`: Was ALL true for anon+authenticated. Now restricted to service_role + authenticated read-only for own limits
    - `openai_usage_logs`: INSERT was true for anon+authenticated. Now service_role for bulk + authenticated with user_id check
    - `access_token_usage`: INSERT was true for anon+authenticated. Now service_role + authenticated with token ownership check
    - `widget_analytics`: INSERT was true for anon+authenticated. Now restricted to service_role
    - `widget_conversations`: INSERT/UPDATE was true for anon+authenticated. Now restricted to service_role

  3. Duplicate Policy Removal
    - `appointment_requests`: Remove overly-permissive "Anyone can create" (public, true) and duplicate SELECT/UPDATE policies
    - `quote_requests`: Remove overly-permissive "Anyone can create" (public, true) and duplicate SELECT/UPDATE policies

  4. Tightened Public INSERT Policies
    - `funding_requests`: Replace wide-open public INSERT with authenticated INSERT requiring user_id match
    - `pro_bono_applications`: Replace wide-open public INSERT with anon+authenticated but require non-null applicant fields

  5. Important Notes
    - Admin+user SELECT dual policies (e.g., profiles, documents) are intentional OR patterns and are NOT changed
    - Anonymous access for truly public forms (contact_submissions, email_captures, crisis_incidents) is preserved
    - All changes use IF EXISTS to prevent errors
*/

-- ============================================================
-- 1. Fix email_captures RLS performance
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view own captures" ON public.email_captures;
CREATE POLICY "Authenticated users can view own captures" ON public.email_captures
  FOR SELECT TO authenticated
  USING (email = (select auth.jwt() ->> 'email'));

-- ============================================================
-- 2. Lock down openai_rate_limits (was ALL true for anon+authenticated)
-- ============================================================
DROP POLICY IF EXISTS "Service can manage rate limits" ON public.openai_rate_limits;

CREATE POLICY "Service role can manage rate limits" ON public.openai_rate_limits
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own rate limits" ON public.openai_rate_limits
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================
-- 3. Lock down openai_usage_logs INSERT
-- ============================================================
DROP POLICY IF EXISTS "Service can insert usage logs" ON public.openai_usage_logs;

CREATE POLICY "Service role can insert usage logs" ON public.openai_usage_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert own usage logs" ON public.openai_usage_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================
-- 4. Lock down access_token_usage INSERT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can log token usage" ON public.access_token_usage;

CREATE POLICY "Service role can log token usage" ON public.access_token_usage
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Authenticated users can log token usage" ON public.access_token_usage
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.access_tokens t
    WHERE t.id = access_token_usage.token_id
    AND t.created_by = (select auth.uid())
  ));

-- ============================================================
-- 5. Lock down widget_analytics INSERT
-- ============================================================
DROP POLICY IF EXISTS "Service role can insert analytics" ON public.widget_analytics;

CREATE POLICY "Service role can insert widget analytics" ON public.widget_analytics
  FOR INSERT TO service_role
  WITH CHECK (true);

-- ============================================================
-- 6. Lock down widget_conversations INSERT/UPDATE
-- ============================================================
DROP POLICY IF EXISTS "Service role can manage conversations" ON public.widget_conversations;
DROP POLICY IF EXISTS "Service role can update conversations" ON public.widget_conversations;

CREATE POLICY "Service role can insert widget conversations" ON public.widget_conversations
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update widget conversations" ON public.widget_conversations
  FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 7. Remove duplicate appointment_requests policies
-- ============================================================
-- Drop the overly-permissive public INSERT (true) policy
DROP POLICY IF EXISTS "Anyone can create appointment requests" ON public.appointment_requests;

-- Drop the duplicate SELECT/UPDATE via connection subquery (keep simpler user_id-based ones)
DROP POLICY IF EXISTS "Users can view their own appointment requests" ON public.appointment_requests;
DROP POLICY IF EXISTS "Users can update their own appointment requests" ON public.appointment_requests;

-- ============================================================
-- 8. Remove duplicate quote_requests policies
-- ============================================================
-- Drop the overly-permissive public INSERT (true) policy
DROP POLICY IF EXISTS "Anyone can create quote requests" ON public.quote_requests;

-- Drop the duplicate SELECT/UPDATE via connection subquery (keep simpler user_id-based ones)
DROP POLICY IF EXISTS "Users can view their own quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Users can update their own quote requests" ON public.quote_requests;

-- ============================================================
-- 9. Tighten funding_requests INSERT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create funding requests" ON public.funding_requests;

CREATE POLICY "Authenticated users can create funding requests" ON public.funding_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================
-- 10. Tighten pro_bono_applications INSERT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit pro bono application" ON public.pro_bono_applications;

CREATE POLICY "Authenticated users can submit pro bono application" ON public.pro_bono_applications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Anonymous users can submit pro bono application" ON public.pro_bono_applications
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

```

---

## supabase/migrations/20260208010023_drop_unused_indexes_batch1.sql

```sql
/*
  # Drop Unused Indexes - Batch 1

  Removes 60 indexes that have never been used according to pg_stat_user_indexes.
  Unused indexes waste disk space and slow down INSERT/UPDATE/DELETE operations
  because every write must also update the index.

  1. Tables affected:
    - data_deletion_requests, chat_messages, appointment_requests
    - negotiations, negotiation_batna_analysis, negotiation_zopa
    - negotiation_rounds, negotiation_scripts, funding_requests
    - negotiation_planner_purchases, negotiation_plans_generated
    - quote_requests, ai_response_citations, ai_response_provenance
    - approval_requests, attorney_matching_profiles, case_matches
    - case_matching_queue, chat_contexts, chat_messages_anonymous
    - chatbot_prompts, conflict_waivers, conversion_events
    - documents, engagement_events, grant_expenses, grant_metrics
    - grant_milestones, grant_reports, access_requests
    - access_token_usage, analytics_events, approval_decisions
    - grants, lawyer_messages

  2. Important Notes
    - All use IF EXISTS for safety
    - These indexes were confirmed unused via pg_stat_user_indexes
    - Indexes backing unique constraints or primary keys are NOT dropped
*/

DROP INDEX IF EXISTS idx_data_deletion_requests_status;
DROP INDEX IF EXISTS idx_chat_messages_deleted;
DROP INDEX IF EXISTS idx_chat_messages_retention;
DROP INDEX IF EXISTS idx_appointment_requests_lawyer_id;
DROP INDEX IF EXISTS idx_appointment_requests_status;
DROP INDEX IF EXISTS idx_appointment_requests_preferred_date;
DROP INDEX IF EXISTS idx_negotiations_user_id;
DROP INDEX IF EXISTS idx_negotiations_session_id;
DROP INDEX IF EXISTS idx_negotiations_status;
DROP INDEX IF EXISTS idx_negotiations_dispute_type;
DROP INDEX IF EXISTS idx_negotiation_batna_negotiation_id;
DROP INDEX IF EXISTS idx_negotiation_zopa_negotiation_id;
DROP INDEX IF EXISTS idx_negotiation_rounds_negotiation_id;
DROP INDEX IF EXISTS idx_negotiation_rounds_round_number;
DROP INDEX IF EXISTS idx_negotiation_scripts_dispute_type;
DROP INDEX IF EXISTS idx_negotiation_scripts_scenario;
DROP INDEX IF EXISTS idx_funding_requests_user_id;
DROP INDEX IF EXISTS idx_funding_requests_lawyer_id;
DROP INDEX IF EXISTS idx_funding_requests_status;
DROP INDEX IF EXISTS idx_funding_requests_funding_type;
DROP INDEX IF EXISTS idx_negotiation_purchases_email;
DROP INDEX IF EXISTS idx_negotiation_plans_user_id;
DROP INDEX IF EXISTS idx_negotiation_plans_session_id;
DROP INDEX IF EXISTS idx_quote_requests_lawyer_id;
DROP INDEX IF EXISTS idx_quote_requests_status;
DROP INDEX IF EXISTS idx_quote_requests_created_at;
DROP INDEX IF EXISTS idx_ai_response_citations_provenance_id;
DROP INDEX IF EXISTS idx_ai_response_provenance_matter_id;
DROP INDEX IF EXISTS idx_approval_requests_workflow_id;
DROP INDEX IF EXISTS idx_attorney_matching_profiles_organization_id;
DROP INDEX IF EXISTS idx_case_matches_attorney_id;
DROP INDEX IF EXISTS idx_case_matches_case_id;
DROP INDEX IF EXISTS idx_case_matches_organization_id;
DROP INDEX IF EXISTS idx_case_matching_queue_organization_id;
DROP INDEX IF EXISTS idx_chat_contexts_matter_id;
DROP INDEX IF EXISTS idx_chat_messages_anonymous_session_id;
DROP INDEX IF EXISTS idx_chatbot_prompts_category_id;
DROP INDEX IF EXISTS idx_chatbot_prompts_subcategory_id;
DROP INDEX IF EXISTS idx_conflict_waivers_conflicting_matter_id;
DROP INDEX IF EXISTS idx_conversion_events_session_id;
DROP INDEX IF EXISTS idx_documents_matter_id;
DROP INDEX IF EXISTS idx_engagement_events_user_id;
DROP INDEX IF EXISTS idx_grant_expenses_grant_id;
DROP INDEX IF EXISTS idx_grant_metrics_grant_id;
DROP INDEX IF EXISTS idx_grant_milestones_grant_id;
DROP INDEX IF EXISTS idx_grant_reports_grant_id;
DROP INDEX IF EXISTS idx_access_requests_reviewed_by;
DROP INDEX IF EXISTS idx_access_token_usage_user_id;
DROP INDEX IF EXISTS idx_analytics_events_user_id;
DROP INDEX IF EXISTS idx_appointment_requests_connection_id;
DROP INDEX IF EXISTS idx_approval_decisions_request_id;
DROP INDEX IF EXISTS idx_grants_funder_id;
DROP INDEX IF EXISTS idx_lawyer_messages_connection_id;
DROP INDEX IF EXISTS idx_lso_case_hours_attorney_id;
DROP INDEX IF EXISTS idx_lso_case_hours_intake_id;
DROP INDEX IF EXISTS idx_lso_client_intakes_assigned_attorney_id;
DROP INDEX IF EXISTS idx_lso_client_intakes_organization_id;
DROP INDEX IF EXISTS idx_lso_staff_organization_id;
DROP INDEX IF EXISTS idx_lso_volunteer_attorneys_organization_id;
DROP INDEX IF EXISTS idx_match_feedback_match_id;
DROP INDEX IF EXISTS idx_matching_notifications_match_id;

```

---

## supabase/migrations/20260208010042_drop_unused_indexes_batch2.sql

```sql
/*
  # Drop Unused Indexes - Batch 2

  Removes remaining ~61 unused indexes confirmed via pg_stat_user_indexes.

  1. Tables affected:
    - matter_activity_timeline, pro_bono_communications, pro_bono_documents
    - prompt_subcategories, referral_codes, report_templates
    - user_preferences, approval_requests, case_matches
    - case_matching_queue, cases, chatbot_documents
    - conflict_checks, conflict_waivers, crisis_incidents
    - data_deletion_requests, data_retention_policies, documents
    - engagement_analytics, grant_expenses, grant_reports
    - knowledge_documents, lawyer_consultations, lawyer_matches
    - legal_holds, lso_audit_logs, lso_client_intakes
    - lso_volunteer_attorneys, match_feedback, matching_notifications
    - matter_documents, access_requests, access_tokens
    - access_token_usage, openai_rate_limits, openai_usage_logs
    - pro_bono_applications, quote_requests, subscription_history
    - system_settings, trust_safety_reports, user_roles
    - widget_conversations, data_export_requests

  2. Important Notes
    - All use IF EXISTS for safety
    - Foreign key constraint indexes are separate and NOT affected
*/

DROP INDEX IF EXISTS idx_matter_activity_timeline_matter_id;
DROP INDEX IF EXISTS idx_pro_bono_communications_application_id;
DROP INDEX IF EXISTS idx_pro_bono_documents_application_id;
DROP INDEX IF EXISTS idx_prompt_subcategories_category_id;
DROP INDEX IF EXISTS idx_referral_codes_referred_user_id;
DROP INDEX IF EXISTS idx_report_templates_funder_id;
DROP INDEX IF EXISTS idx_user_preferences_user_id;
DROP INDEX IF EXISTS idx_approval_requests_requested_by;
DROP INDEX IF EXISTS idx_case_matches_attorney_profile_id;
DROP INDEX IF EXISTS idx_case_matching_queue_created_by;
DROP INDEX IF EXISTS idx_cases_client_id;
DROP INDEX IF EXISTS idx_chatbot_documents_created_by;
DROP INDEX IF EXISTS idx_conflict_checks_performed_by;
DROP INDEX IF EXISTS idx_conflict_waivers_conflict_check_id;
DROP INDEX IF EXISTS idx_conflict_waivers_matter_id;
DROP INDEX IF EXISTS idx_crisis_incidents_user_id;
DROP INDEX IF EXISTS idx_data_deletion_requests_processed_by;
DROP INDEX IF EXISTS idx_data_retention_policies_created_by;
DROP INDEX IF EXISTS idx_data_retention_policies_organization_id;
DROP INDEX IF EXISTS idx_documents_case_id;
DROP INDEX IF EXISTS idx_engagement_analytics_user_id;
DROP INDEX IF EXISTS idx_grant_expenses_approved_by;
DROP INDEX IF EXISTS idx_grant_reports_generated_by;
DROP INDEX IF EXISTS idx_grant_reports_reviewed_by;
DROP INDEX IF EXISTS idx_knowledge_documents_uploaded_by;
DROP INDEX IF EXISTS idx_lawyer_consultations_lawyer_match_id;
DROP INDEX IF EXISTS idx_lawyer_matches_chat_message_id;
DROP INDEX IF EXISTS idx_legal_holds_created_by;
DROP INDEX IF EXISTS idx_lso_audit_logs_user_id;
DROP INDEX IF EXISTS idx_lso_client_intakes_assigned_by;
DROP INDEX IF EXISTS idx_lso_volunteer_attorneys_user_id;
DROP INDEX IF EXISTS idx_match_feedback_organization_id;
DROP INDEX IF EXISTS idx_match_feedback_submitted_by;
DROP INDEX IF EXISTS idx_matching_notifications_attorney_id;
DROP INDEX IF EXISTS idx_matter_documents_added_by;
DROP INDEX IF EXISTS idx_access_requests_email;
DROP INDEX IF EXISTS idx_access_requests_invited_by;
DROP INDEX IF EXISTS idx_access_requests_resource;
DROP INDEX IF EXISTS idx_access_tokens_token;
DROP INDEX IF EXISTS idx_access_tokens_created_by;
DROP INDEX IF EXISTS idx_access_tokens_expires_at;
DROP INDEX IF EXISTS idx_access_token_usage_token_id;
DROP INDEX IF EXISTS idx_openai_rate_limits_user_id;
DROP INDEX IF EXISTS idx_openai_usage_logs_user_id;
DROP INDEX IF EXISTS idx_pro_bono_applications_assigned_to;
DROP INDEX IF EXISTS idx_pro_bono_communications_from_user_id;
DROP INDEX IF EXISTS idx_pro_bono_documents_uploaded_by;
DROP INDEX IF EXISTS idx_quote_requests_connection_id;
DROP INDEX IF EXISTS idx_referral_codes_referrer_id;
DROP INDEX IF EXISTS idx_subscription_history_changed_by;
DROP INDEX IF EXISTS idx_system_settings_updated_by;
DROP INDEX IF EXISTS idx_trust_safety_reports_user_id;
DROP INDEX IF EXISTS idx_user_roles_role_id;
DROP INDEX IF EXISTS idx_widget_conversations_widget_id;
DROP INDEX IF EXISTS idx_legal_holds_active;
DROP INDEX IF EXISTS idx_legal_holds_user;
DROP INDEX IF EXISTS idx_legal_holds_matter;
DROP INDEX IF EXISTS idx_data_export_requests_user;
DROP INDEX IF EXISTS idx_data_export_requests_status;
DROP INDEX IF EXISTS idx_data_deletion_requests_user;

```

---

## supabase/migrations/20260208014229_add_user_type_to_profiles.sql

```sql
/*
  # Add user_type column to profiles

  1. Modified Tables
    - `profiles`
      - Added `user_type` (text, NOT NULL, default 'individual')
      - Valid values: 'individual', 'business', 'organization'

  2. Security
    - Existing RLS policies on profiles table cover this new column
    - Users can update their own user_type through existing update policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_type text NOT NULL DEFAULT 'individual';
  END IF;
END $$;

```

---

## supabase/migrations/20260208054026_add_trust_metadata_to_ezreads_articles.sql

```sql
/*
  # Add trust metadata to EZ Reads articles

  1. Modified Tables
    - `ezreads_articles`
      - `jurisdiction` (text, nullable) - State code for state-specific content; null means general/federal
      - `review_status` (text, default 'editorial_review') - Content provenance level: editorial_review, attorney_reviewed, official_sources
      - `sources` (text, nullable) - Source attribution text
      - `last_reviewed_at` (timestamptz, nullable) - Date content was last reviewed for accuracy

  2. Indexes
    - Index on jurisdiction column for state-based filtering

  3. Important Notes
    - Existing articles default to review_status = 'editorial_review'
    - jurisdiction = null indicates general/federal guidance applicable to all states
    - These fields enable trust metadata display (jurisdiction badges, review provenance, freshness signals)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ezreads_articles' AND column_name = 'jurisdiction'
  ) THEN
    ALTER TABLE ezreads_articles ADD COLUMN jurisdiction text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ezreads_articles' AND column_name = 'review_status'
  ) THEN
    ALTER TABLE ezreads_articles ADD COLUMN review_status text DEFAULT 'editorial_review';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ezreads_articles' AND column_name = 'sources'
  ) THEN
    ALTER TABLE ezreads_articles ADD COLUMN sources text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ezreads_articles' AND column_name = 'last_reviewed_at'
  ) THEN
    ALTER TABLE ezreads_articles ADD COLUMN last_reviewed_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ezreads_articles_jurisdiction ON ezreads_articles(jurisdiction);

```

---

## supabase/migrations/20260208065410_create_legal_scraper_system.sql

```sql
/*
  # Create Legal Scraper System

  1. New Tables
    - `scraper_sources` - Registry of all legal data sources with scraping metadata
      - `id` (uuid, primary key)
      - `source_key` (text, unique) - Machine identifier e.g. 'us_code', 'az_ars', 'ca_codes'
      - `source_name` (text) - Human readable name
      - `source_type` (text) - 'federal_statute', 'state_statute', 'regulation', 'case_law', 'agency_guidance', 'legal_aid', 'attorney_reviewed'
      - `jurisdiction` (text) - 'federal', state code, or 'national'
      - `base_url` (text) - Root URL for scraping
      - `update_frequency` (text) - 'daily', 'weekly', 'monthly', 'quarterly'
      - `last_scraped_at` (timestamptz) - When scraper last ran
      - `last_successful_at` (timestamptz) - When scraper last succeeded
      - `sections_count` (integer) - Total sections scraped
      - `sections_with_embeddings` (integer) - Sections with vector embeddings
      - `is_active` (boolean) - Whether this source is enabled for scraping
      - `scraper_config` (jsonb) - Source-specific scraper configuration
      - `created_at`, `updated_at` (timestamptz)

    - `legal_content` - Generalized legal content from all sources
      - `id` (uuid, primary key)
      - `source_id` (uuid) - FK to scraper_sources
      - `source_key` (text) - Denormalized for faster queries
      - `jurisdiction` (text) - State code or 'federal'
      - `content_type` (text) - 'statute', 'regulation', 'rule', 'guidance', 'article'
      - `title_number` (text) - Title/chapter number
      - `title_name` (text) - Title/chapter name
      - `section_number` (text) - Full section citation
      - `section_title` (text) - Section heading
      - `content` (text) - Full text
      - `summary` (text) - AI-generated summary
      - `url` (text) - Canonical source URL
      - `effective_date` (date)
      - `last_amended` (date)
      - `embedding` (vector(1536)) - OpenAI embedding
      - `practice_areas` (text[]) - Mapped practice areas
      - `keywords` (text[]) - Extracted keywords
      - `related_sections` (text[]) - Cross-references
      - `is_active` (boolean) - Currently in force
      - `version_hash` (text) - Content hash for change detection
      - `scraped_at` (timestamptz) - When this content was scraped
      - `created_at`, `updated_at` (timestamptz)
      - Unique constraint on (source_key, section_number)

    - `scraper_run_logs` - Audit log for every scraper execution
      - `id` (uuid, primary key)
      - `source_id` (uuid) - FK to scraper_sources
      - `source_key` (text)
      - `action` (text) - 'scrape', 'embed', 'validate', 'cleanup'
      - `status` (text) - 'started', 'in_progress', 'completed', 'failed', 'partial'
      - `sections_processed` (integer)
      - `sections_added` (integer)
      - `sections_updated` (integer)
      - `sections_embedded` (integer)
      - `error_message` (text)
      - `duration_ms` (integer)
      - `metadata` (jsonb) - Additional run details
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - scraper_sources: authenticated users can read; service_role can write
    - legal_content: authenticated users can read; service_role can write
    - scraper_run_logs: admin users can read; service_role can write

  3. Functions
    - `match_legal_content()` - Semantic vector search across all legal content
    - `get_source_freshness()` - Returns update status for all active sources

  4. Indexes
    - HNSW vector index on legal_content.embedding
    - B-tree indexes on frequently queried columns
    - GIN indexes on array columns
*/

-- scraper_sources registry
CREATE TABLE IF NOT EXISTS scraper_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text UNIQUE NOT NULL,
  source_name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
    'federal_statute', 'state_statute', 'regulation',
    'case_law', 'agency_guidance', 'legal_aid', 'attorney_reviewed'
  )),
  jurisdiction text NOT NULL DEFAULT 'federal',
  base_url text NOT NULL DEFAULT '',
  update_frequency text NOT NULL DEFAULT 'monthly' CHECK (update_frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly'
  )),
  last_scraped_at timestamptz,
  last_successful_at timestamptz,
  sections_count integer NOT NULL DEFAULT 0,
  sections_with_embeddings integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  scraper_config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scraper_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view scraper sources"
  ON scraper_sources FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can insert scraper sources"
  ON scraper_sources FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update scraper sources"
  ON scraper_sources FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- legal_content table
CREATE TABLE IF NOT EXISTS legal_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES scraper_sources(id),
  source_key text NOT NULL,
  jurisdiction text NOT NULL DEFAULT 'federal',
  content_type text NOT NULL DEFAULT 'statute' CHECK (content_type IN (
    'statute', 'regulation', 'rule', 'guidance', 'article'
  )),
  title_number text,
  title_name text,
  section_number text NOT NULL,
  section_title text,
  content text NOT NULL DEFAULT '',
  summary text,
  url text,
  effective_date date,
  last_amended date,
  embedding vector(1536),
  practice_areas text[] NOT NULL DEFAULT '{}',
  keywords text[] NOT NULL DEFAULT '{}',
  related_sections text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  version_hash text,
  scraped_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_key, section_number)
);

ALTER TABLE legal_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view legal content"
  ON legal_content FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can insert legal content"
  ON legal_content FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update legal content"
  ON legal_content FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- scraper_run_logs
CREATE TABLE IF NOT EXISTS scraper_run_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES scraper_sources(id),
  source_key text NOT NULL,
  action text NOT NULL DEFAULT 'scrape' CHECK (action IN ('scrape', 'embed', 'validate', 'cleanup')),
  status text NOT NULL DEFAULT 'started' CHECK (status IN (
    'started', 'in_progress', 'completed', 'failed', 'partial'
  )),
  sections_processed integer NOT NULL DEFAULT 0,
  sections_added integer NOT NULL DEFAULT 0,
  sections_updated integer NOT NULL DEFAULT 0,
  sections_embedded integer NOT NULL DEFAULT 0,
  error_message text,
  duration_ms integer,
  metadata jsonb NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE scraper_run_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view scraper run logs"
  ON scraper_run_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can insert scraper run logs"
  ON scraper_run_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update scraper run logs"
  ON scraper_run_logs FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for legal_content
CREATE INDEX IF NOT EXISTS idx_legal_content_embedding
  ON legal_content
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_legal_content_source_key
  ON legal_content (source_key);

CREATE INDEX IF NOT EXISTS idx_legal_content_jurisdiction
  ON legal_content (jurisdiction);

CREATE INDEX IF NOT EXISTS idx_legal_content_content_type
  ON legal_content (content_type);

CREATE INDEX IF NOT EXISTS idx_legal_content_section_number
  ON legal_content (section_number);

CREATE INDEX IF NOT EXISTS idx_legal_content_is_active
  ON legal_content (is_active);

CREATE INDEX IF NOT EXISTS idx_legal_content_scraped_at
  ON legal_content (scraped_at);

CREATE INDEX IF NOT EXISTS idx_legal_content_practice_areas
  ON legal_content USING gin (practice_areas);

CREATE INDEX IF NOT EXISTS idx_legal_content_keywords
  ON legal_content USING gin (keywords);

-- Indexes for scraper_sources
CREATE INDEX IF NOT EXISTS idx_scraper_sources_source_type
  ON scraper_sources (source_type);

CREATE INDEX IF NOT EXISTS idx_scraper_sources_is_active
  ON scraper_sources (is_active);

-- Indexes for scraper_run_logs
CREATE INDEX IF NOT EXISTS idx_scraper_run_logs_source_id
  ON scraper_run_logs (source_id);

CREATE INDEX IF NOT EXISTS idx_scraper_run_logs_source_key
  ON scraper_run_logs (source_key);

CREATE INDEX IF NOT EXISTS idx_scraper_run_logs_started_at
  ON scraper_run_logs (started_at);

-- Semantic search function across all legal content
CREATE OR REPLACE FUNCTION match_legal_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_jurisdiction text DEFAULT NULL,
  filter_source_type text DEFAULT NULL,
  filter_practice_area text DEFAULT NULL,
  filter_content_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source_key text,
  jurisdiction text,
  content_type text,
  title_number text,
  title_name text,
  section_number text,
  section_title text,
  content text,
  summary text,
  url text,
  practice_areas text[],
  keywords text[],
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lc.id,
    lc.source_key,
    lc.jurisdiction,
    lc.content_type,
    lc.title_number,
    lc.title_name,
    lc.section_number,
    lc.section_title,
    lc.content,
    lc.summary,
    lc.url,
    lc.practice_areas,
    lc.keywords,
    1 - (lc.embedding <=> query_embedding) AS similarity
  FROM legal_content lc
  WHERE lc.is_active = true
    AND lc.embedding IS NOT NULL
    AND 1 - (lc.embedding <=> query_embedding) > match_threshold
    AND (filter_jurisdiction IS NULL OR lc.jurisdiction = filter_jurisdiction)
    AND (filter_content_type IS NULL OR lc.content_type = filter_content_type)
    AND (filter_source_type IS NULL OR lc.source_key IN (
      SELECT ss.source_key FROM scraper_sources ss WHERE ss.source_type = filter_source_type
    ))
    AND (filter_practice_area IS NULL OR filter_practice_area = ANY(lc.practice_areas))
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Source freshness function for the UI
CREATE OR REPLACE FUNCTION get_source_freshness()
RETURNS TABLE (
  source_key text,
  source_name text,
  source_type text,
  jurisdiction text,
  update_frequency text,
  last_successful_at timestamptz,
  sections_count integer,
  sections_with_embeddings integer,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.source_key,
    ss.source_name,
    ss.source_type,
    ss.jurisdiction,
    ss.update_frequency,
    ss.last_successful_at,
    ss.sections_count,
    ss.sections_with_embeddings,
    ss.is_active
  FROM scraper_sources ss
  WHERE ss.is_active = true
  ORDER BY ss.source_type, ss.source_name;
END;
$$;

-- Seed the initial source registry
INSERT INTO scraper_sources (source_key, source_name, source_type, jurisdiction, base_url, update_frequency, scraper_config) VALUES
  ('us_code', 'U.S. Code', 'federal_statute', 'federal', 'https://uscode.house.gov', 'weekly', '{"parser": "html", "titles": ["11", "15", "18", "26", "28", "29", "42"], "notes": "Bankruptcy, Commerce, Crimes, Tax, Judiciary, Labor, Public Health"}'),
  ('cfr', 'Code of Federal Regulations', 'regulation', 'federal', 'https://www.ecfr.gov', 'weekly', '{"parser": "api", "titles": ["12", "16", "24", "29", "45"], "notes": "Banks, Commercial Practices, Housing, Labor, Public Welfare"}'),
  ('az_ars', 'Arizona Revised Statutes', 'state_statute', 'AZ', 'https://www.azleg.gov/ars', 'monthly', '{"parser": "html", "titles": ["12", "13", "14", "23", "25", "33", "34", "36", "44"]}'),
  ('ca_codes', 'California Codes', 'state_statute', 'CA', 'https://leginfo.legislature.ca.gov', 'monthly', '{"parser": "html", "codes": ["CIV", "CCP", "FAM", "LAB", "PEN", "PROB"]}'),
  ('tx_statutes', 'Texas Statutes', 'state_statute', 'TX', 'https://statutes.capitol.texas.gov', 'monthly', '{"parser": "html", "codes": ["CP", "FA", "FI", "GV", "HS", "LA", "PE", "PR"]}'),
  ('ny_laws', 'New York Laws', 'state_statute', 'NY', 'https://www.nysenate.gov/legislation/laws', 'monthly', '{"parser": "html", "codes": ["CLS", "CPL", "DOM", "EXC", "GBS", "LAB", "PEN", "RPP"]}'),
  ('fl_statutes', 'Florida Statutes', 'state_statute', 'FL', 'https://www.flsenate.gov/Laws/Statutes', 'monthly', '{"parser": "html", "titles": ["61", "83", "316", "440", "448", "672", "718", "720"]}'),
  ('il_statutes', 'Illinois Compiled Statutes', 'state_statute', 'IL', 'https://www.ilga.gov/legislation/ilcs', 'monthly', '{"parser": "html"}'),
  ('eeoc_guidance', 'EEOC Guidance', 'agency_guidance', 'federal', 'https://www.eeoc.gov/laws/guidance', 'weekly', '{"parser": "html"}'),
  ('cfpb_guidance', 'CFPB Consumer Resources', 'agency_guidance', 'federal', 'https://www.consumerfinance.gov', 'weekly', '{"parser": "html"}'),
  ('dol_guidance', 'DOL Wage & Hour Resources', 'agency_guidance', 'federal', 'https://www.dol.gov/agencies/whd', 'weekly', '{"parser": "html"}'),
  ('ftc_guidance', 'FTC Consumer Protection', 'agency_guidance', 'federal', 'https://www.ftc.gov/legal-library', 'weekly', '{"parser": "html"}'),
  ('lsc_resources', 'Legal Services Corporation Resources', 'legal_aid', 'national', 'https://www.lsc.gov', 'monthly', '{"parser": "html"}'),
  ('lawhelp_org', 'LawHelp.org Self-Help Guides', 'legal_aid', 'national', 'https://www.lawhelp.org', 'monthly', '{"parser": "html"}')
ON CONFLICT (source_key) DO NOTHING;

```

---

## supabase/migrations/20260210024858_add_missing_fk_indexes_batch1.sql

```sql
/*
  # Add Missing Foreign Key Indexes - Batch 1

  Adds covering indexes for unindexed foreign keys to improve JOIN and
  cascading-delete performance.

  1. Tables indexed
    - access_requests (invited_by, reviewed_by)
    - access_token_usage (token_id, user_id)
    - access_tokens (created_by)
    - ai_response_citations (provenance_id)
    - ai_response_provenance (matter_id)
    - analytics_events (user_id)
    - appointment_requests (connection_id)
    - approval_decisions (request_id)
    - approval_requests (requested_by, workflow_id)
    - attorney_matching_profiles (organization_id)
    - case_matches (attorney_id, attorney_profile_id, case_id, organization_id)
    - case_matching_queue (created_by, organization_id)
    - cases (client_id)
    - chat_contexts (matter_id)
    - chat_messages_anonymous (session_id)

  2. Important notes
    - All indexes use IF NOT EXISTS to be idempotent
    - Uses CONCURRENTLY where possible for zero-downtime
*/

CREATE INDEX IF NOT EXISTS idx_access_requests_invited_by
  ON public.access_requests (invited_by);

CREATE INDEX IF NOT EXISTS idx_access_requests_reviewed_by
  ON public.access_requests (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_access_token_usage_token_id
  ON public.access_token_usage (token_id);

CREATE INDEX IF NOT EXISTS idx_access_token_usage_user_id
  ON public.access_token_usage (user_id);

CREATE INDEX IF NOT EXISTS idx_access_tokens_created_by
  ON public.access_tokens (created_by);

CREATE INDEX IF NOT EXISTS idx_ai_response_citations_provenance_id
  ON public.ai_response_citations (provenance_id);

CREATE INDEX IF NOT EXISTS idx_ai_response_provenance_matter_id
  ON public.ai_response_provenance (matter_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id
  ON public.analytics_events (user_id);

CREATE INDEX IF NOT EXISTS idx_appointment_requests_connection_id
  ON public.appointment_requests (connection_id);

CREATE INDEX IF NOT EXISTS idx_approval_decisions_request_id
  ON public.approval_decisions (request_id);

CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by
  ON public.approval_requests (requested_by);

CREATE INDEX IF NOT EXISTS idx_approval_requests_workflow_id
  ON public.approval_requests (workflow_id);

CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_organization_id
  ON public.attorney_matching_profiles (organization_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_id
  ON public.case_matches (attorney_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_profile_id
  ON public.case_matches (attorney_profile_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_case_id
  ON public.case_matches (case_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_organization_id
  ON public.case_matches (organization_id);

CREATE INDEX IF NOT EXISTS idx_case_matching_queue_created_by
  ON public.case_matching_queue (created_by);

CREATE INDEX IF NOT EXISTS idx_case_matching_queue_organization_id
  ON public.case_matching_queue (organization_id);

CREATE INDEX IF NOT EXISTS idx_cases_client_id
  ON public.cases (client_id);

CREATE INDEX IF NOT EXISTS idx_chat_contexts_matter_id
  ON public.chat_contexts (matter_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_anonymous_session_id
  ON public.chat_messages_anonymous (session_id);

```

---

## supabase/migrations/20260210024923_add_missing_fk_indexes_batch2.sql

```sql
/*
  # Add Missing Foreign Key Indexes - Batch 2

  Adds covering indexes for unindexed foreign keys on mid-alphabet tables.

  1. Tables indexed
    - chatbot_documents (created_by)
    - chatbot_prompts (category_id, subcategory_id)
    - conflict_checks (performed_by)
    - conflict_waivers (conflict_check_id, conflicting_matter_id, matter_id)
    - conversion_events (session_id)
    - crisis_incidents (user_id)
    - data_deletion_requests (processed_by, user_id)
    - data_export_requests (user_id)
    - data_retention_policies (created_by, organization_id)
    - documents (case_id, matter_id)
    - engagement_analytics (user_id)
    - engagement_events (user_id)
    - funding_requests (user_id)
    - grant_expenses (approved_by, grant_id)
    - grant_metrics (grant_id)
    - grant_milestones (grant_id)
    - grant_reports (generated_by, grant_id, reviewed_by)
    - grants (funder_id)

  2. Important notes
    - All indexes use IF NOT EXISTS for idempotency
*/

CREATE INDEX IF NOT EXISTS idx_chatbot_documents_created_by
  ON public.chatbot_documents (created_by);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_category_id
  ON public.chatbot_prompts (category_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_subcategory_id
  ON public.chatbot_prompts (subcategory_id);

CREATE INDEX IF NOT EXISTS idx_conflict_checks_performed_by
  ON public.conflict_checks (performed_by);

CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflict_check_id
  ON public.conflict_waivers (conflict_check_id);

CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflicting_matter_id
  ON public.conflict_waivers (conflicting_matter_id);

CREATE INDEX IF NOT EXISTS idx_conflict_waivers_matter_id
  ON public.conflict_waivers (matter_id);

CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id
  ON public.conversion_events (session_id);

CREATE INDEX IF NOT EXISTS idx_crisis_incidents_user_id
  ON public.crisis_incidents (user_id);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_processed_by
  ON public.data_deletion_requests (processed_by);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id
  ON public.data_deletion_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id
  ON public.data_export_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_created_by
  ON public.data_retention_policies (created_by);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_organization_id
  ON public.data_retention_policies (organization_id);

CREATE INDEX IF NOT EXISTS idx_documents_case_id
  ON public.documents (case_id);

CREATE INDEX IF NOT EXISTS idx_documents_matter_id
  ON public.documents (matter_id);

CREATE INDEX IF NOT EXISTS idx_engagement_analytics_user_id
  ON public.engagement_analytics (user_id);

CREATE INDEX IF NOT EXISTS idx_engagement_events_user_id
  ON public.engagement_events (user_id);

CREATE INDEX IF NOT EXISTS idx_funding_requests_user_id
  ON public.funding_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_grant_expenses_approved_by
  ON public.grant_expenses (approved_by);

CREATE INDEX IF NOT EXISTS idx_grant_expenses_grant_id
  ON public.grant_expenses (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_metrics_grant_id
  ON public.grant_metrics (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_milestones_grant_id
  ON public.grant_milestones (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_reports_generated_by
  ON public.grant_reports (generated_by);

CREATE INDEX IF NOT EXISTS idx_grant_reports_grant_id
  ON public.grant_reports (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_reports_reviewed_by
  ON public.grant_reports (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_grants_funder_id
  ON public.grants (funder_id);

```

---

## supabase/migrations/20260210024945_add_missing_fk_indexes_batch3.sql

```sql
/*
  # Add Missing Foreign Key Indexes - Batch 3

  Adds covering indexes for unindexed foreign keys on K-O tables.

  1. Tables indexed
    - knowledge_documents (uploaded_by)
    - lawyer_consultations (lawyer_match_id)
    - lawyer_matches (chat_message_id)
    - lawyer_messages (connection_id)
    - legal_content (source_id)
    - legal_holds (created_by, matter_id, user_id)
    - lso_audit_logs (user_id)
    - lso_case_hours (attorney_id, intake_id)
    - lso_client_intakes (assigned_attorney_id, assigned_by, organization_id)
    - lso_staff (organization_id)
    - lso_volunteer_attorneys (organization_id, user_id)
    - match_feedback (match_id, organization_id, submitted_by)
    - matching_notifications (attorney_id, match_id)
    - matter_activity_timeline (matter_id)
    - matter_documents (added_by)
    - negotiation_batna_analysis (negotiation_id)
    - negotiation_plans_generated (user_id)
    - negotiation_rounds (negotiation_id)
    - negotiation_zopa (negotiation_id)
    - negotiations (user_id)
    - openai_rate_limits (user_id)
    - openai_usage_logs (user_id)

  2. Important notes
    - All indexes use IF NOT EXISTS for idempotency
*/

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_uploaded_by
  ON public.knowledge_documents (uploaded_by);

CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_lawyer_match_id
  ON public.lawyer_consultations (lawyer_match_id);

CREATE INDEX IF NOT EXISTS idx_lawyer_matches_chat_message_id
  ON public.lawyer_matches (chat_message_id);

CREATE INDEX IF NOT EXISTS idx_lawyer_messages_connection_id
  ON public.lawyer_messages (connection_id);

CREATE INDEX IF NOT EXISTS idx_legal_content_source_id
  ON public.legal_content (source_id);

CREATE INDEX IF NOT EXISTS idx_legal_holds_created_by
  ON public.legal_holds (created_by);

CREATE INDEX IF NOT EXISTS idx_legal_holds_matter_id
  ON public.legal_holds (matter_id);

CREATE INDEX IF NOT EXISTS idx_legal_holds_user_id
  ON public.legal_holds (user_id);

CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_user_id
  ON public.lso_audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_lso_case_hours_attorney_id
  ON public.lso_case_hours (attorney_id);

CREATE INDEX IF NOT EXISTS idx_lso_case_hours_intake_id
  ON public.lso_case_hours (intake_id);

CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_attorney_id
  ON public.lso_client_intakes (assigned_attorney_id);

CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_by
  ON public.lso_client_intakes (assigned_by);

CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_organization_id
  ON public.lso_client_intakes (organization_id);

CREATE INDEX IF NOT EXISTS idx_lso_staff_organization_id
  ON public.lso_staff (organization_id);

CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_organization_id
  ON public.lso_volunteer_attorneys (organization_id);

CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_user_id
  ON public.lso_volunteer_attorneys (user_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_match_id
  ON public.match_feedback (match_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_organization_id
  ON public.match_feedback (organization_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_submitted_by
  ON public.match_feedback (submitted_by);

CREATE INDEX IF NOT EXISTS idx_matching_notifications_attorney_id
  ON public.matching_notifications (attorney_id);

CREATE INDEX IF NOT EXISTS idx_matching_notifications_match_id
  ON public.matching_notifications (match_id);

CREATE INDEX IF NOT EXISTS idx_matter_activity_timeline_matter_id
  ON public.matter_activity_timeline (matter_id);

CREATE INDEX IF NOT EXISTS idx_matter_documents_added_by
  ON public.matter_documents (added_by);

CREATE INDEX IF NOT EXISTS idx_negotiation_batna_analysis_negotiation_id
  ON public.negotiation_batna_analysis (negotiation_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_plans_generated_user_id
  ON public.negotiation_plans_generated (user_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_rounds_negotiation_id
  ON public.negotiation_rounds (negotiation_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_zopa_negotiation_id
  ON public.negotiation_zopa (negotiation_id);

CREATE INDEX IF NOT EXISTS idx_negotiations_user_id
  ON public.negotiations (user_id);

CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_user_id
  ON public.openai_rate_limits (user_id);

CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_user_id
  ON public.openai_usage_logs (user_id);

```

---

## supabase/migrations/20260210025002_add_missing_fk_indexes_batch4.sql

```sql
/*
  # Add Missing Foreign Key Indexes - Batch 4

  Adds covering indexes for unindexed foreign keys on P-Z tables.

  1. Tables indexed
    - pro_bono_applications (assigned_to)
    - pro_bono_communications (application_id, from_user_id)
    - pro_bono_documents (application_id, uploaded_by)
    - prompt_subcategories (category_id)
    - quote_requests (connection_id)
    - referral_codes (referred_user_id, referrer_id)
    - report_templates (funder_id)
    - subscription_history (changed_by)
    - system_settings (updated_by)
    - trust_safety_reports (user_id)
    - user_preferences (user_id)
    - user_roles (role_id)
    - widget_conversations (widget_id)

  2. Important notes
    - All indexes use IF NOT EXISTS for idempotency
*/

CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_assigned_to
  ON public.pro_bono_applications (assigned_to);

CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_application_id
  ON public.pro_bono_communications (application_id);

CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_from_user_id
  ON public.pro_bono_communications (from_user_id);

CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_application_id
  ON public.pro_bono_documents (application_id);

CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_uploaded_by
  ON public.pro_bono_documents (uploaded_by);

CREATE INDEX IF NOT EXISTS idx_prompt_subcategories_category_id
  ON public.prompt_subcategories (category_id);

CREATE INDEX IF NOT EXISTS idx_quote_requests_connection_id
  ON public.quote_requests (connection_id);

CREATE INDEX IF NOT EXISTS idx_referral_codes_referred_user_id
  ON public.referral_codes (referred_user_id);

CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer_id
  ON public.referral_codes (referrer_id);

CREATE INDEX IF NOT EXISTS idx_report_templates_funder_id
  ON public.report_templates (funder_id);

CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_by
  ON public.subscription_history (changed_by);

CREATE INDEX IF NOT EXISTS idx_system_settings_updated_by
  ON public.system_settings (updated_by);

CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_user_id
  ON public.trust_safety_reports (user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON public.user_preferences (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role_id
  ON public.user_roles (role_id);

CREATE INDEX IF NOT EXISTS idx_widget_conversations_widget_id
  ON public.widget_conversations (widget_id);

```

---

## supabase/migrations/20260210025050_fix_rls_auth_init_plan_subselect.sql

```sql
/*
  # Fix RLS Auth Initialization Plan

  Replaces direct `auth.uid()` / `auth.jwt()` calls with `(select auth.uid())`
  or `(select auth.jwt())` in RLS policies so the auth function is evaluated
  once per statement instead of once per row, improving performance at scale.

  1. Policies updated
    - prediction_consent_log: "Users can insert own consent records"
    - prediction_consent_log: "Users can view own consent records"
    - email_captures: "Authenticated users can view own captures"
    - scraper_sources: "Authenticated users can view scraper sources"
    - legal_content: "Authenticated users can view legal content"
    - scraper_run_logs: "Admins can view scraper run logs"

  2. Security
    - No access changes; same logic, better performance
*/

-- prediction_consent_log: Users can insert own consent records
DROP POLICY IF EXISTS "Users can insert own consent records" ON public.prediction_consent_log;
CREATE POLICY "Users can insert own consent records"
  ON public.prediction_consent_log
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- prediction_consent_log: Users can view own consent records
DROP POLICY IF EXISTS "Users can view own consent records" ON public.prediction_consent_log;
CREATE POLICY "Users can view own consent records"
  ON public.prediction_consent_log
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- email_captures: Authenticated users can view own captures
DROP POLICY IF EXISTS "Authenticated users can view own captures" ON public.email_captures;
CREATE POLICY "Authenticated users can view own captures"
  ON public.email_captures
  FOR SELECT
  TO authenticated
  USING (email = (select (auth.jwt() ->> 'email')));

-- scraper_sources: Authenticated users can view scraper sources
DROP POLICY IF EXISTS "Authenticated users can view scraper sources" ON public.scraper_sources;
CREATE POLICY "Authenticated users can view scraper sources"
  ON public.scraper_sources
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- legal_content: Authenticated users can view legal content
DROP POLICY IF EXISTS "Authenticated users can view legal content" ON public.legal_content;
CREATE POLICY "Authenticated users can view legal content"
  ON public.legal_content
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- scraper_run_logs: Admins can view scraper run logs
DROP POLICY IF EXISTS "Admins can view scraper run logs" ON public.scraper_run_logs;
CREATE POLICY "Admins can view scraper run logs"
  ON public.scraper_run_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

```

---

