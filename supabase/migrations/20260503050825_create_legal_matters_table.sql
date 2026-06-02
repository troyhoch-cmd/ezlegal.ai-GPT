/*
  # Legal matters - core retention primitive
  Creates legal_matters with RLS; users see only their own matters.
*/

CREATE TABLE IF NOT EXISTS legal_matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  issue_type text NOT NULL DEFAULT 'general',
  jurisdiction text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  summary text NOT NULL DEFAULT '',
  next_step text NOT NULL DEFAULT '',
  next_step_due timestamptz,
  risk_level text NOT NULL DEFAULT 'low',
  audience text NOT NULL DEFAULT 'individual',
  pack_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT legal_matters_status_check CHECK (status IN ('active','watching','resolved','escalated')),
  CONSTRAINT legal_matters_risk_check CHECK (risk_level IN ('low','medium','high','urgent')),
  CONSTRAINT legal_matters_audience_check CHECK (audience IN ('individual','business','legal_aid'))
);

CREATE INDEX IF NOT EXISTS legal_matters_user_idx ON legal_matters(user_id);

ALTER TABLE legal_matters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own matters" ON legal_matters FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own matters" ON legal_matters FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own matters" ON legal_matters FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own matters" ON legal_matters FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
