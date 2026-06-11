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
