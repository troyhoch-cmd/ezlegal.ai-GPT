/*
  # Document Intelligence System — competitor feature parity

  Adds tables that power five competitor capabilities inside our Documents tool:
    - Definely — clause navigator + change-impact analysis -> `document_clauses`, `document_clause_impacts`
    - Gavel — no-code template automation + client intake -> `document_automations`, `document_automation_runs`
    - Streamline AI — AI intake & triage + routing -> `document_intake_triage`
    - Spellbook — clause suggestions + risk detection -> `document_risks`, `document_clause_suggestions`
    - Harvey AI — multi-step research & drafting plans -> `document_research_plans`, `document_research_steps`

  1. New tables
    - document_clauses(id, document_id, user_id, index, heading, snippet, clause_type, start_offset, end_offset, created_at)
    - document_clause_impacts(id, document_id, clause_id, user_id, change_summary, impact_level, affected_clause_ids[], explanation, created_at)
    - document_risks(id, document_id, user_id, severity, category, clause_id, title, description, suggestion, citation, created_at)
    - document_clause_suggestions(id, document_id, user_id, clause_id, suggestion_type, title, suggested_text, rationale, created_at)
    - document_automations(id, user_id, name, description, template_body, variables_schema, intake_schema, created_at, updated_at, is_active)
    - document_automation_runs(id, automation_id, user_id, client_name, client_email, answers, rendered_output, status, created_at)
    - document_intake_triage(id, user_id, raw_intake, detected_matter_type, urgency, routing_recommendation, suggested_template_id, confidence, created_at)
    - document_research_plans(id, document_id, user_id, goal, status, created_at, updated_at)
    - document_research_steps(id, plan_id, user_id, step_order, step_type, title, detail, status, result, citations, created_at)

  2. Security
    - RLS enabled on every table.
    - Owner-only SELECT/INSERT/UPDATE/DELETE via auth.uid() = user_id.
    - document_automations additionally allows public read of active rows for template discovery (is_active = true AND is_public = true).

  3. Notes
    1. Each table has an index on user_id for fast owner listing.
    2. Clause offsets enable the Definely-style clause navigator.
    3. document_risks.severity is 'info'|'low'|'medium'|'high'|'critical'.
*/

CREATE TABLE IF NOT EXISTS document_clauses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clause_index integer NOT NULL DEFAULT 0,
  heading text NOT NULL DEFAULT '',
  snippet text NOT NULL DEFAULT '',
  clause_type text NOT NULL DEFAULT 'general',
  start_offset integer NOT NULL DEFAULT 0,
  end_offset integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_clauses_document ON document_clauses(document_id);
CREATE INDEX IF NOT EXISTS idx_document_clauses_user ON document_clauses(user_id);
ALTER TABLE document_clauses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS document_clause_impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  clause_id uuid REFERENCES document_clauses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  change_summary text NOT NULL DEFAULT '',
  impact_level text NOT NULL DEFAULT 'low',
  affected_clause_ids uuid[] NOT NULL DEFAULT '{}',
  explanation text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_impacts_document ON document_clause_impacts(document_id);
CREATE INDEX IF NOT EXISTS idx_document_impacts_user ON document_clause_impacts(user_id);
ALTER TABLE document_clause_impacts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS document_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clause_id uuid REFERENCES document_clauses(id) ON DELETE SET NULL,
  severity text NOT NULL DEFAULT 'medium',
  category text NOT NULL DEFAULT 'general',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  suggestion text NOT NULL DEFAULT '',
  citation text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_risks_document ON document_risks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_risks_user ON document_risks(user_id);
ALTER TABLE document_risks ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS document_clause_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clause_id uuid REFERENCES document_clauses(id) ON DELETE SET NULL,
  suggestion_type text NOT NULL DEFAULT 'improvement',
  title text NOT NULL DEFAULT '',
  suggested_text text NOT NULL DEFAULT '',
  rationale text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_suggestions_document ON document_clause_suggestions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_suggestions_user ON document_clause_suggestions(user_id);
ALTER TABLE document_clause_suggestions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS document_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  template_body text NOT NULL DEFAULT '',
  variables_schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  intake_schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_automations_user ON document_automations(user_id);
ALTER TABLE document_automations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS document_automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES document_automations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL DEFAULT '',
  client_email text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  rendered_output text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_automation_runs_user ON document_automation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_automation ON document_automation_runs(automation_id);
ALTER TABLE document_automation_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS document_intake_triage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_intake text NOT NULL DEFAULT '',
  detected_matter_type text NOT NULL DEFAULT '',
  urgency text NOT NULL DEFAULT 'standard',
  routing_recommendation text NOT NULL DEFAULT '',
  suggested_template_slug text NOT NULL DEFAULT '',
  confidence numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_triage_user ON document_intake_triage(user_id);
ALTER TABLE document_intake_triage ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS document_research_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_research_plans_user ON document_research_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_research_plans_document ON document_research_plans(document_id);
ALTER TABLE document_research_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS document_research_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES document_research_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_order integer NOT NULL DEFAULT 0,
  step_type text NOT NULL DEFAULT 'research',
  title text NOT NULL DEFAULT '',
  detail text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  result text NOT NULL DEFAULT '',
  citations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_research_steps_plan ON document_research_steps(plan_id);
CREATE INDEX IF NOT EXISTS idx_research_steps_user ON document_research_steps(user_id);
ALTER TABLE document_research_steps ENABLE ROW LEVEL SECURITY;

-- Policies: owner CRUD for all tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'document_clauses','document_clause_impacts','document_risks','document_clause_suggestions',
    'document_automation_runs','document_intake_triage','document_research_plans','document_research_steps'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "owner_select" ON %I', t);
    EXECUTE format('CREATE POLICY "owner_select" ON %I FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()))', t);
    EXECUTE format('DROP POLICY IF EXISTS "owner_insert" ON %I', t);
    EXECUTE format('CREATE POLICY "owner_insert" ON %I FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()))', t);
    EXECUTE format('DROP POLICY IF EXISTS "owner_update" ON %I', t);
    EXECUTE format('CREATE POLICY "owner_update" ON %I FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()))', t);
    EXECUTE format('DROP POLICY IF EXISTS "owner_delete" ON %I', t);
    EXECUTE format('CREATE POLICY "owner_delete" ON %I FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()))', t);
  END LOOP;
END $$;

-- document_automations: owner CRUD + public read of active public templates
DROP POLICY IF EXISTS "owner_select" ON document_automations;
CREATE POLICY "owner_select" ON document_automations FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (is_active = true AND is_public = true));
DROP POLICY IF EXISTS "anon_public_templates" ON document_automations;
CREATE POLICY "anon_public_templates" ON document_automations FOR SELECT TO anon
  USING (is_active = true AND is_public = true);
DROP POLICY IF EXISTS "owner_insert" ON document_automations;
CREATE POLICY "owner_insert" ON document_automations FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "owner_update" ON document_automations;
CREATE POLICY "owner_update" ON document_automations FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "owner_delete" ON document_automations;
CREATE POLICY "owner_delete" ON document_automations FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
