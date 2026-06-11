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
