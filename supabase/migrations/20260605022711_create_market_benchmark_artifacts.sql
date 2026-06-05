CREATE TABLE IF NOT EXISTS market_benchmark_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  icp text NOT NULL,
  dimension text NOT NULL,
  our_score numeric(5,2) NOT NULL DEFAULT 0,
  competitor_label text NOT NULL,
  competitor_score numeric(5,2) NOT NULL DEFAULT 0,
  evidence_url text NOT NULL DEFAULT '',
  evidence_type text NOT NULL DEFAULT 'url',
  notes text,
  verified_at timestamptz,
  verified_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE market_benchmark_artifacts ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (service_role bypasses RLS; authenticated admins use these)
CREATE POLICY "select_benchmark_artifacts" ON market_benchmark_artifacts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_benchmark_artifacts" ON market_benchmark_artifacts FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "update_benchmark_artifacts" ON market_benchmark_artifacts FOR UPDATE
  TO authenticated USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  ) WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "delete_benchmark_artifacts" ON market_benchmark_artifacts FOR DELETE
  TO authenticated USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
