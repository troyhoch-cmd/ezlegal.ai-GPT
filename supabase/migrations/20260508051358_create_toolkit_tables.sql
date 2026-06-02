/*
  # Toolkit tables (PDF, QR, OCR, CSV)

  1. New Tables
    - toolkit_pdf_jobs: generated PDFs (title, template, status, output_url, meta)
    - toolkit_qr_codes: QR generations (label, payload, size, ecc, data_url)
    - toolkit_ocr_jobs: OCR runs (file_name, language, status, text, confidence)
    - toolkit_csv_imports: CSV imports (file_name, row_count, error_count, status)
  2. Security
    - RLS enabled on every table
    - Per-user SELECT/INSERT/UPDATE/DELETE policies keyed by user_id = auth.uid()
*/

CREATE TABLE IF NOT EXISTS toolkit_pdf_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  template text NOT NULL DEFAULT 'blank',
  status text NOT NULL DEFAULT 'completed',
  output_url text DEFAULT '',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS toolkit_qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  payload text NOT NULL DEFAULT '',
  size integer NOT NULL DEFAULT 256,
  ecc text NOT NULL DEFAULT 'M',
  data_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS toolkit_ocr_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'eng',
  status text NOT NULL DEFAULT 'completed',
  text text NOT NULL DEFAULT '',
  confidence numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS toolkit_csv_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL DEFAULT '',
  row_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  sample jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE toolkit_pdf_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolkit_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolkit_ocr_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolkit_csv_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pdf_jobs_select_own" ON toolkit_pdf_jobs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "pdf_jobs_insert_own" ON toolkit_pdf_jobs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "pdf_jobs_update_own" ON toolkit_pdf_jobs FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "pdf_jobs_delete_own" ON toolkit_pdf_jobs FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

CREATE POLICY "qr_codes_select_own" ON toolkit_qr_codes FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "qr_codes_insert_own" ON toolkit_qr_codes FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "qr_codes_update_own" ON toolkit_qr_codes FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "qr_codes_delete_own" ON toolkit_qr_codes FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

CREATE POLICY "ocr_jobs_select_own" ON toolkit_ocr_jobs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "ocr_jobs_insert_own" ON toolkit_ocr_jobs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "ocr_jobs_update_own" ON toolkit_ocr_jobs FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "ocr_jobs_delete_own" ON toolkit_ocr_jobs FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

CREATE POLICY "csv_imports_select_own" ON toolkit_csv_imports FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "csv_imports_insert_own" ON toolkit_csv_imports FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "csv_imports_update_own" ON toolkit_csv_imports FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "csv_imports_delete_own" ON toolkit_csv_imports FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS toolkit_pdf_jobs_user_id_idx ON toolkit_pdf_jobs(user_id);
CREATE INDEX IF NOT EXISTS toolkit_qr_codes_user_id_idx ON toolkit_qr_codes(user_id);
CREATE INDEX IF NOT EXISTS toolkit_ocr_jobs_user_id_idx ON toolkit_ocr_jobs(user_id);
CREATE INDEX IF NOT EXISTS toolkit_csv_imports_user_id_idx ON toolkit_csv_imports(user_id);
