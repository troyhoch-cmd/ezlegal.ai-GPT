/*
  # Upgrade document generator for Am Law 100 senior-partner output

  1. New Data
    - Upserts GPT-5.5, GPT-5.5 Pro, and o3-reasoning into ai_models so the
      document generator dropdown shows current flagship drafting models.
  2. New Tables
    - drafting_mode_presets: three posture-based presets (quick_form,
      associate, partner) that drive model choice, token budget, draft
      passes, RAG top-k, and the system prompt for document generation.
    - document_generation_requests: audit log of generation runs with the
      drafting_mode, model, RAG context count, and outcome.
  3. Security
    - RLS enabled on both new tables.
    - Authenticated users may read drafting_mode_presets.
    - Users may read and insert their own document_generation_requests rows.
*/

INSERT INTO ai_models (model_name, openai_model, display_name, description, tier_required, is_default, max_tokens, cost_per_1k_tokens, display_order, is_active)
VALUES
  ('gpt-5.5',      'gpt-5.5',         'ChatGPT 5.5',      'Flagship model for complex legal drafting. Senior-partner-level output with deep reasoning, risk analysis, and multi-jurisdiction awareness.', 'premium',    false, 16384, 0.0200, 10, true),
  ('gpt-5.5-pro',  'gpt-5.5-pro',     'ChatGPT 5.5 Pro',  'Extended reasoning for Am Law 100 partner-grade documents. Multi-pass drafting with self-critique and citation grounding.',                      'enterprise', false, 32768, 0.0600, 11, true),
  ('o3-reasoning', 'o3',              'o3 Reasoning',     'For novel legal questions, structured deal docs, and multi-party agreements requiring deep chain-of-thought.',                                  'enterprise', false, 16384, 0.0800, 12, true)
ON CONFLICT (model_name) DO UPDATE
  SET openai_model       = EXCLUDED.openai_model,
      display_name       = EXCLUDED.display_name,
      description        = EXCLUDED.description,
      max_tokens         = EXCLUDED.max_tokens,
      cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
      tier_required      = EXCLUDED.tier_required,
      display_order      = EXCLUDED.display_order,
      is_active          = true;

CREATE TABLE IF NOT EXISTS drafting_mode_presets (
  mode            text PRIMARY KEY,
  display_name    text NOT NULL,
  description     text NOT NULL DEFAULT '',
  min_tier        text NOT NULL DEFAULT 'free',
  default_model   text NOT NULL,
  max_tokens      integer NOT NULL DEFAULT 4096,
  draft_passes    integer NOT NULL DEFAULT 1,
  rag_top_k       integer NOT NULL DEFAULT 0,
  system_prompt   text NOT NULL,
  display_order   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE drafting_mode_presets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'drafting_mode_presets'
      AND policyname = 'Drafting presets readable by authenticated users'
  ) THEN
    CREATE POLICY "Drafting presets readable by authenticated users"
      ON drafting_mode_presets FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

INSERT INTO drafting_mode_presets (mode, display_name, description, min_tier, default_model, max_tokens, draft_passes, rag_top_k, system_prompt, display_order) VALUES
  ('quick_form', 'Quick Form', 'Clean fillable template, ready in seconds. Best for simple letters and notices.', 'free', 'gpt-4o-mini', 2048, 1, 0,
   'You are a legal form generator. Produce a clean, plain-language fillable template with [BRACKETED] placeholders for all party-specific information. Use short sentences and standard section headings. Do not add commentary, explanations, or disclaimers inside the document body.', 1),
  ('associate', 'Associate Draft', 'Mid-level associate quality. Reasoned sections, standard clauses, jurisdiction-aware.', 'free', 'gpt-4o', 8192, 1, 5,
   'You are a senior associate at a top-tier firm. Draft a complete legal document with numbered articles, a defined-terms block, standard boilerplate, and proper signature blocks. Ground all jurisdiction-specific clauses in the authorities provided in the context. Use precise legal prose. Do not include advisory commentary inside the document body; put any necessary notices in a single Notice block at the end.', 2),
  ('partner', 'Senior Partner (Am Law 100)', 'Deep drafting: negotiated fallbacks, risk allocation rationale, Drafting Notes appendix with authority citations.', 'premium', 'gpt-5.5', 16384, 3, 12,
   E'You are an Am Law 100 senior partner drafting for a sophisticated client. Produce a fully-negotiated, execution-quality document that includes:\n\n1. Cover memo stating deal posture, key commercial points, and any open issues.\n2. Defined Terms block with cross-references.\n3. Full operative provisions with negotiated fallback positions marked [FALLBACK: alternative language].\n4. Representations, warranties, covenants, indemnities (with caps, baskets, de minimis thresholds, and survival periods), termination triggers, dispute resolution, and governing law + venue with a short analysis.\n5. Drafting Notes appendix that cites the exact statutes, cases, and secondary sources provided in the AUTHORITIES context window, with the rationale for each material drafting choice.\n6. Execution version signature block.\n\nUse firm-quality prose. Never include generic legal-advice disclaimers inside the document body; put any required notices in a single Notice block at the end. If the AUTHORITIES context does not support a cited proposition, say so explicitly in the Drafting Notes rather than fabricating a citation.', 3)
ON CONFLICT (mode) DO UPDATE
  SET display_name  = EXCLUDED.display_name,
      description   = EXCLUDED.description,
      min_tier      = EXCLUDED.min_tier,
      default_model = EXCLUDED.default_model,
      max_tokens    = EXCLUDED.max_tokens,
      draft_passes  = EXCLUDED.draft_passes,
      rag_top_k     = EXCLUDED.rag_top_k,
      system_prompt = EXCLUDED.system_prompt,
      display_order = EXCLUDED.display_order,
      updated_at    = now();

CREATE TABLE IF NOT EXISTS document_generation_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  document_type     text NOT NULL DEFAULT '',
  drafting_mode     text NOT NULL DEFAULT 'associate' CHECK (drafting_mode IN ('quick_form','associate','partner')),
  model_used        text NOT NULL DEFAULT '',
  jurisdiction      text NOT NULL DEFAULT '',
  rag_context_count integer NOT NULL DEFAULT 0,
  draft_passes      integer NOT NULL DEFAULT 1,
  tokens_used       integer NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','error')),
  error_message     text NOT NULL DEFAULT '',
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_docgen_requests_user_created
  ON document_generation_requests (user_id, created_at DESC);

ALTER TABLE document_generation_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'document_generation_requests'
      AND policyname = 'Users can read own document generation requests'
  ) THEN
    CREATE POLICY "Users can read own document generation requests"
      ON document_generation_requests FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'document_generation_requests'
      AND policyname = 'Users can insert own document generation requests'
  ) THEN
    CREATE POLICY "Users can insert own document generation requests"
      ON document_generation_requests FOR INSERT
      TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END $$;
