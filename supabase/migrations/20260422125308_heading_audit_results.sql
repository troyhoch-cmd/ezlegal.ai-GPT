/*
  # Heading audit results

  Stores results of an automated heading-structure audit so the team can
  track h1-h6 issues across deploys and fix regressions.

  1. New Tables
    - `heading_audit_results` — one row per audit run per file. Stores the
      discovered heading outline, the violation type (duplicate_h1,
      level_skip, missing_h1, empty_heading), a severity level, and a
      free-form message. Files without issues are NOT inserted.
    - `heading_audit_runs` — one row per audit run with a timestamp and
      summary counts. Lets the dashboard render trend lines.
  2. Security
    - RLS enabled.
    - Results are readable by authenticated admins (via profiles.is_admin).
      No client-side writes; writes happen from a CI job using the
      service role.
*/

CREATE TABLE IF NOT EXISTS public.heading_audit_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at timestamptz NOT NULL DEFAULT now(),
  commit_sha text,
  total_files integer NOT NULL DEFAULT 0,
  total_issues integer NOT NULL DEFAULT 0,
  duplicate_h1_count integer NOT NULL DEFAULT 0,
  level_skip_count integer NOT NULL DEFAULT 0,
  missing_h1_count integer NOT NULL DEFAULT 0,
  empty_heading_count integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.heading_audit_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.heading_audit_runs(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  line integer,
  issue_type text NOT NULL CHECK (issue_type IN ('duplicate_h1','level_skip','missing_h1','empty_heading','unlabeled_region')),
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info','warning','error')),
  heading_text text,
  detected_level integer,
  expected_level integer,
  message text NOT NULL
);

CREATE INDEX IF NOT EXISTS heading_audit_results_run_idx
  ON public.heading_audit_results (run_id, issue_type);

CREATE INDEX IF NOT EXISTS heading_audit_results_file_idx
  ON public.heading_audit_results (file_path);

ALTER TABLE public.heading_audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heading_audit_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'heading_audit_runs'
      AND policyname = 'Admins can read heading audit runs'
  ) THEN
    CREATE POLICY "Admins can read heading audit runs"
      ON public.heading_audit_runs FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = (SELECT auth.uid()) AND p.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'heading_audit_results'
      AND policyname = 'Admins can read heading audit results'
  ) THEN
    CREATE POLICY "Admins can read heading audit results"
      ON public.heading_audit_results FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = (SELECT auth.uid()) AND p.is_admin = true
        )
      );
  END IF;
END $$;
