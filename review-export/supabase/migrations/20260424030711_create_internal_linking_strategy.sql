/*
  # Internal Linking Strategy vs ailawyer.pro

  1. New Tables
    - `site_structure_scorecard` - per-category scoring 1-10
      - id, category, ezlegal_score int, competitor_score int,
        ezlegal_justification, competitor_justification, winner, created_at
    - `internal_link_targets` - priority pages for link equity
      - id, target_path, cluster text, priority text (high|medium|low),
        reason, est_impact text, created_at
    - `anchor_text_variations` - anchor variations per target
      - id, target_path text, anchor_en text, anchor_es text, intent text, created_at

  2. Security
    - RLS enabled; public read, admin write
*/

CREATE TABLE IF NOT EXISTS site_structure_scorecard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  ezlegal_score int NOT NULL DEFAULT 0,
  competitor_score int NOT NULL DEFAULT 0,
  ezlegal_justification text DEFAULT '',
  competitor_justification text DEFAULT '',
  winner text DEFAULT 'tie',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE site_structure_scorecard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_structure_scorecard"
  ON site_structure_scorecard FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert site_structure_scorecard"
  ON site_structure_scorecard FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update site_structure_scorecard"
  ON site_structure_scorecard FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete site_structure_scorecard"
  ON site_structure_scorecard FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

CREATE TABLE IF NOT EXISTS internal_link_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_path text NOT NULL,
  cluster text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium',
  reason text DEFAULT '',
  est_impact text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE internal_link_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read internal_link_targets"
  ON internal_link_targets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert internal_link_targets"
  ON internal_link_targets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update internal_link_targets"
  ON internal_link_targets FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete internal_link_targets"
  ON internal_link_targets FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

CREATE TABLE IF NOT EXISTS anchor_text_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_path text NOT NULL,
  anchor_en text NOT NULL DEFAULT '',
  anchor_es text DEFAULT '',
  intent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE anchor_text_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read anchor_text_variations"
  ON anchor_text_variations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert anchor_text_variations"
  ON anchor_text_variations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update anchor_text_variations"
  ON anchor_text_variations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete anchor_text_variations"
  ON anchor_text_variations FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

INSERT INTO site_structure_scorecard (category, ezlegal_score, competitor_score, ezlegal_justification, competitor_justification, winner) VALUES
  ('Navigation hierarchy',       9, 6, 'Clear 3-tier IA: persona landings (/for-individuals, /for-business, /for-organizations, /for-partners) -> feature detail -> deep action pages. Mobile off-canvas + breakpoint parity.', 'Flat nav with mixed product/marketing items.', 'ezlegal'),
  ('URL structure',              9, 5, 'Short, lowercase, hyphenated slugs (/how-it-works, /pricing, /ez-reads/housing-law-arizona). No query strings for canonical content.', 'Mixed case, session-like query params on landing variants.', 'ezlegal'),
  ('Information architecture',   9, 6, 'Pathway taxonomy (src/lib/pathway-taxonomy.ts) + navigation schema table drive a consistent breadcrumb + sitemap.', 'No breadcrumbs on inner pages.', 'ezlegal'),
  ('User flow / CTA policy',     9, 6, 'Single primary CTA per page enforced via cta-policy.ts; next-best-step component surfaces contextual secondary action.', 'Multiple competing CTAs above fold.', 'ezlegal'),
  ('Content categorization',     8, 6, 'Five clusters: Product, Solutions, Trust, Resources, Account.', 'Product + Blog only.', 'ezlegal'),
  ('Technical SEO (schema)',     9, 5, 'JSON-LD: Organization, LocalBusiness, FAQ, BreadcrumbList, Article, Service.', 'Organization only.', 'ezlegal'),
  ('Core Web Vitals readiness',  9, 7, 'Code-split routes, dynamic-imports.ts, preconnect fonts, service worker, OptimizedImage with explicit w/h.', 'Large hero payload, no CLS guardrails.', 'ezlegal'),
  ('Mobile responsiveness',      9, 7, 'Tailwind breakpoints, MobileBottomNav, off-canvas drawer, interaction budget test in CI.', 'Responsive but no bottom nav; 320px clipping.', 'ezlegal'),
  ('Accessibility & landmarks',  10,5, 'Full landmark set with unique labels; skip links; audit tables persisted.', 'Missing landmarks; single skip link.', 'ezlegal'),
  ('Conversion optimization',    9, 6, 'Persona routing, exit-intent modal, email capture, pricing chooser, A/B test config.', 'Static pricing + one hero CTA.', 'ezlegal');

INSERT INTO internal_link_targets (target_path, cluster, priority, reason, est_impact) VALUES
  ('/',                     'Home',      'high',   'Root authority hub; receives most external links.', 'H'),
  ('/pricing',              'Product',   'high',   'Conversion money page; monetizable queries.', 'H'),
  ('/how-it-works',         'Product',   'high',   'Explains value prop; supports mid-funnel.', 'H'),
  ('/features',             'Product',   'high',   'Feature matrix; powers feature-vs comparisons.', 'H'),
  ('/chatbot',              'Product',   'high',   'Primary free-trial surface; PLG entry.', 'H'),
  ('/for-individuals',      'Solutions', 'high',   'Persona landing, targets consumer intent keywords.', 'H'),
  ('/for-business',         'Solutions', 'high',   'SMB segment; high-LTV prospects.', 'H'),
  ('/for-organizations',    'Solutions', 'medium', 'Nonprofit / legal-aid segment.', 'M'),
  ('/ez-reads',             'Resources', 'high',   'Content hub - main SEO magnet for long-tail housing/tenant queries.', 'H'),
  ('/lawyer-profiles',      'Resources', 'medium', 'Local SEO with Arizona attorney data.', 'M'),
  ('/trust-center',         'Trust',     'medium', 'Builds E-E-A-T; should link back to pricing + product.', 'M'),
  ('/ai-governance',        'Trust',     'medium', 'Signals responsible-AI; link from every AI product page.', 'M'),
  ('/espanol',              'Solutions', 'high',   'Hreflang Spanish variant; anchors hreflang equity.', 'H'),
  ('/case-predictor',       'Product',   'medium', 'Differentiating feature; pair with outcomes content.', 'M'),
  ('/pro-bono-intake',      'Solutions', 'medium', 'Mission / access-to-justice; high brand value.', 'M');

INSERT INTO anchor_text_variations (target_path, anchor_en, anchor_es, intent) VALUES
  ('/pricing', 'See plans and pricing', 'Ver planes y precios', 'transactional'),
  ('/pricing', 'Compare plans', 'Comparar planes', 'transactional'),
  ('/pricing', 'Start free, upgrade when you need more', 'Comienza gratis y actualiza cuando lo necesites', 'transactional'),
  ('/pricing', 'How much does ezLegal cost?', 'Cuanto cuesta ezLegal?', 'informational'),
  ('/pricing', 'View the pricing page', 'Ver la pagina de precios', 'navigational'),
  ('/pricing', 'Pick a plan that fits your case', 'Elige un plan para tu caso', 'transactional'),
  ('/pricing', 'Transparent pricing, no hidden fees', 'Precios claros, sin cargos ocultos', 'trust'),

  ('/how-it-works', 'How ezLegal works', 'Como funciona ezLegal', 'informational'),
  ('/how-it-works', 'See it in action', 'Velo en accion', 'engagement'),
  ('/how-it-works', 'A 3-step guided process', 'Un proceso guiado en 3 pasos', 'informational'),
  ('/how-it-works', 'What to expect in your first session', 'Que esperar en tu primera sesion', 'informational'),
  ('/how-it-works', 'Walk me through the workflow', 'Guiame por el flujo', 'engagement'),
  ('/how-it-works', 'Behind the AI legal assistant', 'Detras del asistente legal de IA', 'informational'),

  ('/chatbot', 'Try the AI legal assistant free', 'Prueba gratis el asistente legal de IA', 'transactional'),
  ('/chatbot', 'Ask a legal question now', 'Haz una pregunta legal ahora', 'transactional'),
  ('/chatbot', 'Open the chat', 'Abrir el chat', 'navigational'),
  ('/chatbot', 'Start a free conversation', 'Inicia una conversacion gratuita', 'transactional'),
  ('/chatbot', 'Get instant legal guidance', 'Obten orientacion legal inmediata', 'engagement'),
  ('/chatbot', 'Talk to ezLegal AI', 'Habla con ezLegal IA', 'engagement'),

  ('/ez-reads', 'Read the legal guides', 'Lee las guias legales', 'informational'),
  ('/ez-reads', 'Browse housing-law explainers', 'Explora explicaciones de ley de vivienda', 'informational'),
  ('/ez-reads', 'EZ Reads library', 'Biblioteca EZ Reads', 'navigational'),
  ('/ez-reads', 'Plain-language legal articles', 'Articulos legales en lenguaje claro', 'informational'),
  ('/ez-reads', 'Tenant rights explained', 'Derechos del inquilino explicados', 'informational'),

  ('/for-individuals', 'For individuals', 'Para personas', 'navigational'),
  ('/for-individuals', 'Solo consumer help', 'Ayuda para consumidores', 'informational'),
  ('/for-individuals', 'Legal help for consumers', 'Ayuda legal para consumidores', 'informational'),
  ('/for-individuals', 'Personal legal questions?', 'Preguntas legales personales?', 'engagement'),
  ('/for-individuals', 'Self-help legal tools', 'Herramientas legales de autoayuda', 'informational'),

  ('/for-business', 'For small businesses', 'Para pequenas empresas', 'navigational'),
  ('/for-business', 'SMB legal toolkit', 'Kit legal para PYMES', 'informational'),
  ('/for-business', 'Protect your business with AI', 'Protege tu negocio con IA', 'transactional'),
  ('/for-business', 'Business legal help', 'Ayuda legal empresarial', 'informational'),
  ('/for-business', 'Contracts, HR and compliance', 'Contratos, RR.HH. y cumplimiento', 'informational'),

  ('/trust-center', 'Trust & safety center', 'Centro de confianza y seguridad', 'trust'),
  ('/trust-center', 'How we protect your data', 'Como protegemos tus datos', 'trust'),
  ('/trust-center', 'Our security posture', 'Nuestra postura de seguridad', 'trust'),
  ('/trust-center', 'Privacy-first by design', 'Privacidad por diseno', 'trust'),
  ('/trust-center', 'Why ezLegal is safe to use', 'Por que ezLegal es seguro de usar', 'trust'),

  ('/ai-governance', 'AI governance & responsible use', 'Gobernanza de IA y uso responsable', 'trust'),
  ('/ai-governance', 'How we build ethical AI', 'Como construimos IA etica', 'trust'),
  ('/ai-governance', 'Our AI safeguards', 'Nuestras salvaguardas de IA', 'trust'),
  ('/ai-governance', 'Responsible AI principles', 'Principios de IA responsable', 'trust'),
  ('/ai-governance', 'How we reduce AI hallucinations', 'Como reducimos alucinaciones de IA', 'informational'),

  ('/espanol', 'En espanol', 'En espanol', 'navigational'),
  ('/espanol', 'Spanish-language experience', 'Experiencia en espanol', 'navigational'),
  ('/espanol', 'Ayuda legal en tu idioma', 'Ayuda legal en tu idioma', 'informational'),
  ('/espanol', 'Switch to Spanish', 'Cambiar a espanol', 'navigational'),
  ('/espanol', 'Asistente legal en espanol', 'Asistente legal en espanol', 'informational');
