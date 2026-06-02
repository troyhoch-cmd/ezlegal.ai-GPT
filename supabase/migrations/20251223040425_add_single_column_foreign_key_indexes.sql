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
