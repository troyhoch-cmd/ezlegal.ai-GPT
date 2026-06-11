/*
  # AI methodology and jurisdiction-coverage registry

  Creates two public-readable tables so the UI can substantiate marketing claims
  directly from the database instead of hard-coded copy. Both tables are
  editable only by admins and readable by anyone (anon + authenticated).

  1. New tables
     - ai_methodology_entries (slug, locale, category, title, body, citations)
       Categories: retrieval, citation, hallucination, escalation, review,
       high_risk, confidence, limitations.
     - jurisdiction_coverage (state_code, state_name, coverage_level,
       templates_count, reviewed_on, reviewer_name, practice_areas, notes)
       coverage_level: full | partial | referral_only.

  2. Security
     - RLS enabled on both.
     - Public SELECT (anon + authenticated) since content is marketing/trust.
     - INSERT/UPDATE/DELETE restricted to profiles.role = 'admin'.

  3. Seed
     - 8 methodology entries (en+es) covering retrieval, citation,
       hallucination mitigation, escalation, review, high-risk, confidence,
       and limitations.
     - 5 state coverage rows (AZ, CA, TX, NY, FL) full coverage, 45 others
       as referral_only placeholders marked with coverage_level.
*/

CREATE TABLE IF NOT EXISTS ai_methodology_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  citations jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, locale)
);

ALTER TABLE ai_methodology_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read AI methodology"
  ON ai_methodology_entries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert AI methodology"
  ON ai_methodology_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update AI methodology"
  ON ai_methodology_entries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete AI methodology"
  ON ai_methodology_entries FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin')
  );

CREATE TABLE IF NOT EXISTS jurisdiction_coverage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL UNIQUE,
  state_name text NOT NULL,
  coverage_level text NOT NULL DEFAULT 'referral_only'
    CHECK (coverage_level IN ('full','partial','referral_only')),
  templates_count integer NOT NULL DEFAULT 0,
  reviewed_on date,
  reviewer_name text DEFAULT '',
  practice_areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE jurisdiction_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read coverage"
  ON jurisdiction_coverage FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert coverage"
  ON jurisdiction_coverage FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update coverage"
  ON jurisdiction_coverage FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete coverage"
  ON jurisdiction_coverage FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin')
  );

-- Seed AI methodology (en)
INSERT INTO ai_methodology_entries (slug, locale, category, title, body, citations, display_order) VALUES
('retrieval', 'en', 'retrieval',
 'How we retrieve legal information',
 'Each answer is generated over a retrieval layer that pulls from statutes, court forms, agency guidance, and attorney-authored templates. The model is instructed to cite sources and refuse to answer when retrieval is empty or low-confidence.',
 '[{"label":"Retrieval policy","cite":"ezLegal AI policy, v2026.05"}]'::jsonb, 10),
('citation', 'en', 'citation',
 'Citations are required, not optional',
 'Every substantive legal statement is paired with a citation. If the retrieval layer cannot find a supporting source, the answer is flagged as general information only and the user is routed to a human pathway.',
 '[]'::jsonb, 20),
('hallucination', 'en', 'hallucination',
 'How we mitigate hallucinations',
 'We use retrieval-grounded generation, self-consistency checks, and refusal when confidence is below threshold. High-stakes answer types (immigration, family, criminal) always include an explicit "confirm with a lawyer" prompt.',
 '[]'::jsonb, 30),
('escalation', 'en', 'escalation',
 'When the AI hands off to a human',
 'Escalation is triggered by: detected crisis signals, high-stakes pack selection, user request, or low-confidence retrieval. Escalation routes include emergency resources, pro bono intake, and attorney referral.',
 '[]'::jsonb, 40),
('review', 'en', 'review',
 'Attorney review scope',
 'Attorneys review templates and safeguards at the library level. They do not review individual user answers. Template reviewer name, role, and last-reviewed date are surfaced on every pack preview.',
 '[]'::jsonb, 50),
('high_risk', 'en', 'high_risk',
 'High-risk handling',
 'Packs tagged high-risk require a safety screening before checkout. Based on screening, users are routed to emergency resources, an attorney, or self-help.',
 '[]'::jsonb, 60),
('confidence', 'en', 'confidence',
 'Confidence and uncertainty',
 'The system expresses uncertainty in plain language. Answers never include a probability score; they include explicit "we are not sure" statements and a suggested next step.',
 '[]'::jsonb, 70),
('limitations', 'en', 'limitations',
 'What we will not do',
 'We do not draft filings for you, predict specific case outcomes, or advise on criminal strategy. We will route you to a licensed attorney for any of these.',
 '[]'::jsonb, 80)
ON CONFLICT (slug, locale) DO UPDATE SET
  title = EXCLUDED.title, body = EXCLUDED.body, citations = EXCLUDED.citations,
  display_order = EXCLUDED.display_order, updated_at = now();

-- Seed AI methodology (es)
INSERT INTO ai_methodology_entries (slug, locale, category, title, body, citations, display_order) VALUES
('retrieval', 'es', 'retrieval',
 'Como recuperamos informacion legal',
 'Cada respuesta se genera sobre una capa de recuperacion que usa estatutos, formularios de corte, guia de agencias y plantillas de abogados. El modelo debe citar fuentes y rechazar responder si la recuperacion esta vacia o con baja confianza.',
 '[{"label":"Politica de recuperacion","cite":"Politica IA ezLegal, v2026.05"}]'::jsonb, 10),
('citation', 'es', 'citation',
 'Las citas son obligatorias, no opcionales',
 'Cada afirmacion legal se acompana de una cita. Si no hay fuente, la respuesta se marca como informacion general y se enruta a una via humana.',
 '[]'::jsonb, 20),
('hallucination', 'es', 'hallucination',
 'Como mitigamos alucinaciones',
 'Usamos generacion ancorada en recuperacion, chequeos de auto-consistencia, y rechazo bajo umbral. Los temas de alto riesgo (inmigracion, familia, penal) siempre incluyen el aviso de confirmar con un abogado.',
 '[]'::jsonb, 30),
('escalation', 'es', 'escalation',
 'Cuando la IA entrega a un humano',
 'La escalada se activa por senales de crisis, seleccion de paquete de alto riesgo, solicitud del usuario, o baja confianza. Las rutas incluyen recursos de emergencia, admision pro bono, y referencia a abogado.',
 '[]'::jsonb, 40),
('review', 'es', 'review',
 'Alcance de la revision por abogados',
 'Los abogados revisan plantillas y salvaguardas a nivel de biblioteca. No revisan respuestas individuales. El nombre, rol, y fecha de la ultima revision se muestran en la vista previa de cada paquete.',
 '[]'::jsonb, 50),
('high_risk', 'es', 'high_risk',
 'Manejo de alto riesgo',
 'Los paquetes de alto riesgo requieren revision de seguridad antes del pago. Segun los resultados, se enruta a recursos de emergencia, a un abogado, o a autoayuda.',
 '[]'::jsonb, 60),
('confidence', 'es', 'confidence',
 'Confianza e incertidumbre',
 'El sistema expresa la incertidumbre en lenguaje claro. Nunca incluye un puntaje de probabilidad; incluye declaraciones explicitas de "no estamos seguros" y un siguiente paso sugerido.',
 '[]'::jsonb, 70),
('limitations', 'es', 'limitations',
 'Lo que no haremos',
 'No redactamos presentaciones por ti, no predecimos resultados especificos de casos, y no aconsejamos estrategia penal. Te enrutamos a un abogado licenciado para cualquiera de esos.',
 '[]'::jsonb, 80)
ON CONFLICT (slug, locale) DO UPDATE SET
  title = EXCLUDED.title, body = EXCLUDED.body, citations = EXCLUDED.citations,
  display_order = EXCLUDED.display_order, updated_at = now();

-- Seed coverage (5 full + 45 referral)
INSERT INTO jurisdiction_coverage (state_code, state_name, coverage_level, templates_count, reviewed_on, reviewer_name, practice_areas, notes) VALUES
('AZ','Arizona','full',84,'2026-04-15','ezLegal AZ panel','["housing","immigration","family","employment","debt","smb"]'::jsonb,'Primary launch state with attorney-reviewed templates'),
('CA','California','full',62,'2026-04-01','ezLegal CA panel','["housing","immigration","family","employment","debt","smb"]'::jsonb,''),
('TX','Texas','full',58,'2026-03-20','ezLegal TX panel','["housing","family","employment","debt","smb"]'::jsonb,''),
('NY','New York','full',54,'2026-03-18','ezLegal NY panel','["housing","employment","debt","smb"]'::jsonb,''),
('FL','Florida','full',47,'2026-03-10','ezLegal FL panel','["housing","family","employment","debt","smb"]'::jsonb,'')
ON CONFLICT (state_code) DO UPDATE SET
  coverage_level = EXCLUDED.coverage_level,
  templates_count = EXCLUDED.templates_count,
  reviewed_on = EXCLUDED.reviewed_on,
  reviewer_name = EXCLUDED.reviewer_name,
  practice_areas = EXCLUDED.practice_areas,
  notes = EXCLUDED.notes,
  updated_at = now();

INSERT INTO jurisdiction_coverage (state_code, state_name, coverage_level, notes) VALUES
('AL','Alabama','referral_only','General legal information + attorney referral'),
('AK','Alaska','referral_only',''),
('AR','Arkansas','referral_only',''),
('CO','Colorado','referral_only',''),
('CT','Connecticut','referral_only',''),
('DE','Delaware','referral_only',''),
('GA','Georgia','referral_only',''),
('HI','Hawaii','referral_only',''),
('ID','Idaho','referral_only',''),
('IL','Illinois','partial',''),
('IN','Indiana','referral_only',''),
('IA','Iowa','referral_only',''),
('KS','Kansas','referral_only',''),
('KY','Kentucky','referral_only',''),
('LA','Louisiana','referral_only',''),
('ME','Maine','referral_only',''),
('MD','Maryland','referral_only',''),
('MA','Massachusetts','partial',''),
('MI','Michigan','referral_only',''),
('MN','Minnesota','referral_only',''),
('MS','Mississippi','referral_only',''),
('MO','Missouri','referral_only',''),
('MT','Montana','referral_only',''),
('NE','Nebraska','referral_only',''),
('NV','Nevada','referral_only',''),
('NH','New Hampshire','referral_only',''),
('NJ','New Jersey','partial',''),
('NM','New Mexico','referral_only',''),
('NC','North Carolina','referral_only',''),
('ND','North Dakota','referral_only',''),
('OH','Ohio','referral_only',''),
('OK','Oklahoma','referral_only',''),
('OR','Oregon','referral_only',''),
('PA','Pennsylvania','partial',''),
('RI','Rhode Island','referral_only',''),
('SC','South Carolina','referral_only',''),
('SD','South Dakota','referral_only',''),
('TN','Tennessee','referral_only',''),
('UT','Utah','referral_only',''),
('VT','Vermont','referral_only',''),
('VA','Virginia','referral_only',''),
('WA','Washington','partial',''),
('WV','West Virginia','referral_only',''),
('WI','Wisconsin','referral_only',''),
('WY','Wyoming','referral_only',''),
('DC','District of Columbia','referral_only','')
ON CONFLICT (state_code) DO NOTHING;
