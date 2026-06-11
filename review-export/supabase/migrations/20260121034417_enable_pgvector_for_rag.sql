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
