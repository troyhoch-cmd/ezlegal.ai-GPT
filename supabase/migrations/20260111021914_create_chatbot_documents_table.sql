/*
  # Create Chatbot Documents Table

  1. New Tables
    - `chatbot_documents` - Stores metadata for uploaded PDF documents used by the chatbot
      - `id` (integer, primary key, auto-increment)
      - `name` (text) - Original filename
      - `category` (text) - Document category/topic
      - `size_kb` (integer) - File size in kilobytes
      - `file_path` (text) - Storage path or URL
      - `is_parsed` (boolean) - Whether the document has been parsed
      - `is_active` (boolean) - Whether the document is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_by` (uuid) - Admin who uploaded the document

  2. Security
    - Enable RLS on `chatbot_documents` table
    - Add policy for admins to manage documents
    - Add policy for authenticated users to read active documents
*/

CREATE TABLE IF NOT EXISTS chatbot_documents (
  id serial PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  size_kb integer NOT NULL DEFAULT 0,
  file_path text,
  is_parsed boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE chatbot_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chatbot documents"
  ON chatbot_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can view active documents"
  ON chatbot_documents
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_chatbot_documents_category ON chatbot_documents(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_documents_is_active ON chatbot_documents(is_active);

INSERT INTO chatbot_documents (id, name, category, size_kb, is_parsed, is_active) VALUES
  (1, 'ssrn-4640596.pdf', 'Access to Justice LLM RAG AI', 352, true, true),
  (2, 'Miranda v Arizona - US Supreme Court_240215_080700.pdf', 'Constitutional law', 51, true, true),
  (3, 'constitution_240103_033901 US Constitution.pdf', 'Constitutional law', 404, true, true),
  (4, 'HHRG-117-GO00-20220929-SD010_240227_204917.pdf', 'Constitutional law', 36, true, true),
  (5, 'Form_AZ_RealEstate_Contract.pdf', 'Arizona Residential Real Estate Laws and Forms', 316, true, true),
  (6, 'Arizona_SmallClaims.pdf', 'Arizona Small Claims Court Process', 110, true, true),
  (7, 'construction-anti-indemnity-statutes_241210_064050.pdf', 'United States Construction Laws - Anti-Indemnity Statutes and Laws All 50 States', 235, true, true),
  (8, 'SPANISH-Landlord-Tenant-Act_May-2023.pdf', 'Ley Para Propietarios', 703, true, true),
  (9, 'Landlord_Tenant_Act_May-2023_1.pdf', 'Arizona Residential Landlord Tenant Act', 687, true, true),
  (10, 'tenants rights handbook aug 16 2016.pdf', 'Arizona Tenant Rights and Responsibilities Handbook and Forms', 613, true, true),
  (11, 'arizona_constitution.pdf', 'State of Arizona Constitution', 295, true, true),
  (12, 'GPO-CONAN-2002_250114_061207.pdf', 'Analysis and Interpretation of United States of America Constitution', 8152, true, true),
  (13, 'Contract_Law_for_Dummies_-_Scott_J.pdf', 'Contract law', 7348, true, true),
  (14, 'GPO-CONAN-2002_250114_061207.pdf', 'United States of America Declaration of Independence', 8152, true, true),
  (15, 'Blogconsumer law.pdf', 'What is Consumer Law', 327, true, true),
  (16, 'Estate planning FAQS.pdf', 'Arizona Trusts and Estate Planning Hot Topics', 270, true, true),
  (17, 'DUI-Laws-By-State-2024-Guide.pdf', '50 State Summary of DUI Laws in U.S.A.', 1107, true, true),
  (18, 'Bankruptcy-Basics-Glossary-_-United-States-Cou.pdf', 'Summarize Filing For Bankruptcy Process in U.S.A', 751, true, true),
  (19, 'How Do I File for Bankruptcy in United States 2024.pdf', 'Summarize Filing For Bankruptcy Process in U.S.A', 199, true, true),
  (20, '50 State Survey of Emergency Guardianship Statutes in United States of America.pdf', '50 State Summary Emergency Guardianship Statutes in U.S.A', 676, true, true),
  (21, 'What is Bankruptcy in United States of America.pdf', 'Summarize Filing For Bankruptcy Process in U.S.A', 149, true, true),
  (22, 'What do My Miranda Rights Mean .pdf', 'Criminal law', 276, true, true),
  (23, 'Summary of Arizona Easement Law.pdf', 'Summary of Arizona Law on Easements', 975, true, true),
  (24, 'testing_pdf.pdf', 'Testing', 9, true, true),
  (25, 'Arizona_-Lifecare-Planning-Packet.pdf', 'Adult Guardianship', 1182, true, true),
  (26, 'Arizona_-Life-Care-Planning-Checklist.pdf', 'Adult Guardianship', 159, true, true),
  (30, 'CTFL Agile Tester_v1.0.pdf', 'Contract law', 578, true, true),
  (31, 'SupremeCourt_U.S._Trump v. Casa, Inc., et al..pdf', 'Constitutional law', 547, true, true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('chatbot_documents_id_seq', (SELECT MAX(id) FROM chatbot_documents) + 1, false);

CREATE OR REPLACE FUNCTION update_chatbot_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chatbot_documents_updated_at ON chatbot_documents;
CREATE TRIGGER trigger_update_chatbot_documents_updated_at
  BEFORE UPDATE ON chatbot_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_documents_updated_at();
