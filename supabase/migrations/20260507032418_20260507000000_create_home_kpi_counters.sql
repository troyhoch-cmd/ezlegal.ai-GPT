/*
  # Home KPI counters

  1. New Tables
    - home_kpi_counters: single-row-per-key table that backs the public
      homepage KPI strip (questions answered, jurisdictions covered,
      partner count). Lets us display a stable baseline when anonymous
      RLS prevents reading underlying operational tables.
  2. Security
    - RLS enabled.
    - Anonymous and authenticated users may SELECT (these are public
      marketing numbers).
    - No INSERT/UPDATE/DELETE policies. Values are managed via
      migrations or the service role.
  3. Seed
    - questions_answered baseline = 340 (matches prototype KPI).
*/

CREATE TABLE IF NOT EXISTS home_kpi_counters (
  key           text PRIMARY KEY,
  value_numeric bigint NOT NULL DEFAULT 0,
  value_label   text NOT NULL DEFAULT '',
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE home_kpi_counters ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'home_kpi_counters'
      AND policyname = 'Home KPI counters readable by anyone'
  ) THEN
    CREATE POLICY "Home KPI counters readable by anyone"
      ON home_kpi_counters FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

INSERT INTO home_kpi_counters (key, value_numeric, value_label) VALUES
  ('questions_answered', 340, '340'),
  ('jurisdictions_covered', 50, '50 states'),
  ('partner_count',        0, 'Partner program')
ON CONFLICT (key) DO UPDATE
  SET value_numeric = EXCLUDED.value_numeric,
      value_label   = EXCLUDED.value_label,
      updated_at    = now();
