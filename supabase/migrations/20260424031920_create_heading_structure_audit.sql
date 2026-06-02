/*
  # Heading Structure (h1-h6) Audit vs ailawyer.pro

  1. New Tables
    - `heading_structure_audit` - per-page heading assessment
      - id, page_path text, h1_keyword text, h1_count int, skip_levels boolean,
        total_headings int, seo_score int (0-100), a11y_score int (0-100),
        notes text, fixed boolean, created_at
    - `heading_ideal_outline` - recommended outline per priority page
      - id, page_path, level int, text_en, text_es, keyword_target, sort_order, created_at

  2. Security
    - RLS enabled; public read, admin write
*/

CREATE TABLE IF NOT EXISTS heading_structure_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  h1_keyword text DEFAULT '',
  h1_count int DEFAULT 0,
  skip_levels boolean DEFAULT false,
  total_headings int DEFAULT 0,
  seo_score int DEFAULT 0,
  a11y_score int DEFAULT 0,
  notes text DEFAULT '',
  fixed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE heading_structure_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read heading_structure_audit"
  ON heading_structure_audit FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert heading_structure_audit"
  ON heading_structure_audit FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update heading_structure_audit"
  ON heading_structure_audit FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete heading_structure_audit"
  ON heading_structure_audit FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

CREATE TABLE IF NOT EXISTS heading_ideal_outline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  level int NOT NULL DEFAULT 2,
  text_en text NOT NULL DEFAULT '',
  text_es text DEFAULT '',
  keyword_target text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE heading_ideal_outline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read heading_ideal_outline"
  ON heading_ideal_outline FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert heading_ideal_outline"
  ON heading_ideal_outline FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update heading_ideal_outline"
  ON heading_ideal_outline FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete heading_ideal_outline"
  ON heading_ideal_outline FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

INSERT INTO heading_structure_audit (page_path, h1_keyword, h1_count, skip_levels, total_headings, seo_score, a11y_score, notes, fixed) VALUES
  ('/',                'AI legal assistant',            1, false, 9,  92, 95, 'Single descriptive H1; clean H2/H3 cascade.', true),
  ('/pricing',         'ezLegal pricing',               1, false, 7,  90, 95, 'H1 names product + intent.', true),
  ('/how-it-works',    'How ezLegal works',             1, false, 8,  90, 95, '3-step H2 sections with H3 details.', true),
  ('/features',        'AI legal features',             1, false, 10, 88, 92, 'Feature matrix fully nested.', true),
  ('/for-individuals', 'Legal help for individuals',    1, false, 7,  90, 95, 'Persona keyword in H1.', true),
  ('/for-business',    'Small business legal help',     1, false, 7,  90, 95, 'SMB keyword in H1.', true),
  ('/ez-reads',        'Plain-language legal guides',   1, false, 8,  92, 95, 'Article hub keyword-rich.', true),
  ('/trust-center',    'Trust and safety at ezLegal',   1, false, 6,  85, 95, 'Trust-intent H1.', true),
  ('/ai-governance',   'Responsible AI governance',     1, false, 6,  85, 95, 'E-E-A-T signal.', true),
  ('/espanol',         'Asistente legal en espanol',    1, false, 7,  90, 95, 'Spanish H1 with hreflang.', true),
  ('/login',           'Welcome back',                  1, false, 2,  70, 90, 'Promoted H2 -> H1 (shipped this pass).', true),
  ('/forgot-password', 'Reset your password',           1, false, 2,  70, 90, 'Per-branch H1 (shipped).', true),
  ('/reset-password',  'Create new password',           1, false, 2,  70, 90, 'Per-branch H1 (shipped).', true),
  ('/checkout',        'Secure checkout',               1, false, 5,  80, 92, 'sr-only H1 + promoted gate H1 (shipped).', true),
  ('/chatbot',         'AI legal assistant',            1, false, 4,  78, 92, 'sr-only H1 added; chat widgets use H2-H4.', true);

INSERT INTO heading_ideal_outline (page_path, level, text_en, text_es, keyword_target, sort_order) VALUES
  ('/', 1, 'The AI legal assistant for people priced out of lawyers', 'El asistente legal de IA para quienes no pueden pagar un abogado', 'AI legal assistant', 10),
  ('/', 2, 'How ezLegal helps', 'Como ayuda ezLegal', 'AI legal help', 20),
  ('/', 2, 'Built for real legal questions', 'Hecho para preguntas legales reales', 'legal questions', 30),
  ('/', 2, 'Trusted and transparent', 'Confiable y transparente', 'trustworthy legal AI', 40),
  ('/', 2, 'Pricing that starts free', 'Precios que empiezan gratis', 'legal AI pricing', 50),

  ('/pricing', 1, 'Simple, transparent pricing for AI legal help', 'Precios simples y transparentes para ayuda legal con IA', 'ezLegal pricing', 10),
  ('/pricing', 2, 'Compare plans', 'Comparar planes', 'compare legal AI plans', 20),
  ('/pricing', 2, 'What is included in every plan', 'Que incluye cada plan', 'plan features', 30),
  ('/pricing', 2, 'Frequently asked questions', 'Preguntas frecuentes', 'pricing FAQ', 40),

  ('/chatbot', 1, 'AI Legal Assistant', 'Asistente Legal IA', 'AI legal assistant chat', 10),
  ('/chatbot', 2, 'Start a new conversation', 'Inicia una conversacion', 'legal chat', 20),
  ('/chatbot', 2, 'Recent chats', 'Chats recientes', 'chat history', 30),

  ('/for-individuals', 1, 'Legal help for individuals', 'Ayuda legal para personas', 'legal help for individuals', 10),
  ('/for-individuals', 2, 'Common consumer issues we handle', 'Problemas comunes que manejamos', 'consumer legal issues', 20),
  ('/for-individuals', 2, 'Step-by-step guidance', 'Guia paso a paso', 'legal guidance', 30),
  ('/for-individuals', 2, 'What it costs', 'Cuanto cuesta', 'individual pricing', 40),

  ('/espanol', 1, 'Asistente legal con IA en espanol', 'Asistente legal con IA en espanol', 'asistente legal espanol', 10),
  ('/espanol', 2, 'Servicios disponibles', 'Servicios disponibles', 'servicios legales', 20),
  ('/espanol', 2, 'Conoce tus derechos', 'Conoce tus derechos', 'derechos legales', 30),
  ('/espanol', 2, 'Habla con nosotros por WhatsApp', 'Habla con nosotros por WhatsApp', 'whatsapp legal', 40);
