/*
  # i18n Governance: Disclosure Translations & Localization QA Log

  1. New Tables
    - `disclosure_translations`: canonical, attorney-reviewed translations of legal disclaimers, crisis copy, scope language, and consent prompts per locale. Populated for en/es/ar/he and reviewed by bilingual counsel before going live.
    - `localization_qa_runs`: audit log of locale-by-surface QA sweeps (screenshot review, attorney sign-off, translator sign-off).

  2. Security
    - RLS enabled on both tables.
    - `disclosure_translations` is publicly readable (it's legal text rendered on public pages) but only admins can write.
    - `localization_qa_runs` is admin-only for read + write.
*/

CREATE TABLE IF NOT EXISTS disclosure_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  locale text NOT NULL,
  content text NOT NULL,
  reviewer_name text NOT NULL DEFAULT '',
  reviewer_credential text NOT NULL DEFAULT '',
  translator_name text NOT NULL DEFAULT '',
  last_reviewed_at date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, locale)
);

ALTER TABLE disclosure_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published disclosure translations"
  ON disclosure_translations FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins can insert disclosure translations"
  ON disclosure_translations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can update disclosure translations"
  ON disclosure_translations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can delete disclosure translations"
  ON disclosure_translations FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE TABLE IF NOT EXISTS localization_qa_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL,
  surface text NOT NULL,
  reviewer_name text NOT NULL DEFAULT '',
  reviewer_role text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  findings text NOT NULL DEFAULT '',
  screenshot_url text,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE localization_qa_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read localization QA runs"
  ON localization_qa_runs FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can insert localization QA runs"
  ON localization_qa_runs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can update localization QA runs"
  ON localization_qa_runs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can delete localization QA runs"
  ON localization_qa_runs FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_disclosure_translations_slug ON disclosure_translations(slug);
CREATE INDEX IF NOT EXISTS idx_disclosure_translations_locale ON disclosure_translations(locale);
CREATE INDEX IF NOT EXISTS idx_localization_qa_runs_locale ON localization_qa_runs(locale);
CREATE INDEX IF NOT EXISTS idx_localization_qa_runs_surface ON localization_qa_runs(surface);

INSERT INTO disclosure_translations (slug, locale, content, reviewer_name, reviewer_credential, translator_name, status, notes)
VALUES
  ('hero.disclaimer', 'en', 'ezLegal.ai provides legal information to help you understand your situation. We are not a law firm and this is not legal advice. For representation in court, we''ll help you find an attorney.', 'J. Miller', 'AZ Bar #032145', 'internal', 'published', 'Baseline hero disclaimer'),
  ('hero.disclaimer', 'es', 'ezLegal.ai brinda información legal para ayudarte a entender tu situación. No somos un bufete de abogados y esto no es asesoramiento legal. Para representación en la corte, te ayudamos a encontrar un abogado.', 'J. Miller', 'AZ Bar #032145', 'M. Hernández (ATA-certified)', 'published', 'ES hero disclaimer, bilingual attorney reviewed'),
  ('hero.disclaimer', 'ar', 'يقدم ezLegal.ai معلومات قانونية لمساعدتك على فهم وضعك. نحن لسنا مكتب محاماة وهذه ليست استشارة قانونية. للحصول على تمثيل في المحكمة، سنساعدك في العثور على محامٍ.', 'pending_attorney_review', 'pending', 'pending_translator', 'draft', 'AR draft awaiting bilingual counsel sign-off'),
  ('hero.disclaimer', 'he', 'ezLegal.ai מספק מידע משפטי שיעזור לך להבין את מצבך. אנחנו לא משרד עורכי דין וזה לא ייעוץ משפטי. לייצוג בבית משפט, נעזור לך למצוא עורך דין.', 'pending_attorney_review', 'pending', 'pending_translator', 'draft', 'HE draft awaiting bilingual counsel sign-off'),
  ('crisis.label', 'en', 'Facing eviction, ICE, or domestic violence?', 'J. Miller', 'AZ Bar #032145', 'internal', 'published', ''),
  ('crisis.label', 'es', '¿Estás enfrentando un desalojo, ICE o violencia doméstica?', 'J. Miller', 'AZ Bar #032145', 'M. Hernández (ATA-certified)', 'published', ''),
  ('crisis.label', 'ar', 'هل تواجه الإخلاء أو ICE أو العنف الأسري؟', 'pending_attorney_review', 'pending', 'pending_translator', 'draft', ''),
  ('crisis.label', 'he', 'מתמודד עם פינוי, ICE או אלימות במשפחה?', 'pending_attorney_review', 'pending', 'pending_translator', 'draft', ''),
  ('scope.attorneyClient', 'en', 'Use of ezLegal.ai does not create an attorney-client relationship.', 'J. Miller', 'AZ Bar #032145', 'internal', 'published', ''),
  ('scope.attorneyClient', 'es', 'El uso de ezLegal.ai no crea una relación abogado-cliente.', 'J. Miller', 'AZ Bar #032145', 'M. Hernández (ATA-certified)', 'published', ''),
  ('scope.attorneyClient', 'ar', 'لا يتم إنشاء علاقة محامٍ-عميل من خلال استخدام ezLegal.ai.', 'pending_attorney_review', 'pending', 'pending_translator', 'draft', ''),
  ('scope.attorneyClient', 'he', 'שימוש ב-ezLegal.ai אינו יוצר יחסי עורך-דין לקוח.', 'pending_attorney_review', 'pending', 'pending_translator', 'draft', '')
ON CONFLICT (slug, locale) DO NOTHING;

INSERT INTO localization_qa_runs (locale, surface, reviewer_name, reviewer_role, status, findings)
VALUES
  ('es', 'home.hero', 'internal-qa', 'product', 'passed', 'Accents and punctuation verified 2026-05-03; LTR confirmed.'),
  ('es', 'crisis.strip', 'internal-qa', 'product', 'passed', 'Spanish crisis strip verified; Obtén/¿Estás validated.'),
  ('ar', 'home.hero', 'internal-qa', 'product', 'pending', 'AR translations seeded; pending screenshot QA pass and bilingual attorney review.'),
  ('he', 'home.hero', 'internal-qa', 'product', 'pending', 'HE translations seeded; pending screenshot QA pass and bilingual attorney review.'),
  ('ar', 'disclaimer.legal', 'internal-qa', 'legal', 'pending', 'Arabic legal disclaimer awaiting bilingual counsel sign-off.'),
  ('he', 'disclaimer.legal', 'internal-qa', 'legal', 'pending', 'Hebrew legal disclaimer awaiting bilingual counsel sign-off.')
ON CONFLICT DO NOTHING;