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
