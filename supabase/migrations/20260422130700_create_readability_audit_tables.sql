/*
  # Readability audit persistence

  1. New tables
    - `readability_audit_runs` — one row per audit run with aggregate Flesch
      Reading Ease, Flesch-Kincaid Grade, avg sentence length, passive ratio,
      words-per-paragraph, and commit SHA.
    - `readability_audit_results` — one row per prose block flagged by the
      auditor (source file, line range, metrics, severity, suggestion tag).

  2. Security
    - RLS enabled on both.
    - SELECT restricted to admins (profiles.is_admin = true).
    - INSERT restricted to service-role (writes happen from CI/the auditor
      script with service key; no authenticated user path needed).
*/

CREATE TABLE IF NOT EXISTS readability_audit_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commit_sha text NOT NULL DEFAULT '',
  total_files integer NOT NULL DEFAULT 0,
  total_blocks integer NOT NULL DEFAULT 0,
  flagged_blocks integer NOT NULL DEFAULT 0,
  avg_flesch_ease numeric(6,2) NOT NULL DEFAULT 0,
  avg_fk_grade numeric(6,2) NOT NULL DEFAULT 0,
  avg_sentence_len numeric(6,2) NOT NULL DEFAULT 0,
  passive_ratio numeric(5,4) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS readability_audit_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES readability_audit_runs(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  line_start integer NOT NULL,
  line_end integer NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info','warning','error')),
  issue_type text NOT NULL,
  flesch_ease numeric(6,2) NOT NULL DEFAULT 0,
  fk_grade numeric(6,2) NOT NULL DEFAULT 0,
  word_count integer NOT NULL DEFAULT 0,
  sentence_count integer NOT NULL DEFAULT 0,
  avg_sentence_len numeric(6,2) NOT NULL DEFAULT 0,
  longest_sentence_len integer NOT NULL DEFAULT 0,
  passive_count integer NOT NULL DEFAULT 0,
  excerpt text NOT NULL DEFAULT '',
  suggestion text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readability_results_run ON readability_audit_results(run_id);
CREATE INDEX IF NOT EXISTS idx_readability_results_file ON readability_audit_results(file_path);

ALTER TABLE readability_audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE readability_audit_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit runs"
  ON readability_audit_runs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can read audit results"
  ON readability_audit_results FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));
