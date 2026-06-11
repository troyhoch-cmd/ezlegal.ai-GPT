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