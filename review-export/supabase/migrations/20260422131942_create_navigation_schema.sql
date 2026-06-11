/*
  # Navigation IA as data

  1. New tables
    - `navigation_groups` — parent nav groups (top-level items in the bar).
      Each row declares a label (en/es), an ordering index, a CTA flag, and
      an audience array so the same row can light up for different personas.
    - `navigation_items` — child items within a group (or standalone if
      group_id is null). Carries route `to`, icon name, short label,
      description, locale labels, sort order, `is_primary` (visible as a
      top-bar link at wide breakpoints), `is_bottom_nav` (mobile bottom bar),
      `is_breadcrumb_label` (friendly label for that route in breadcrumbs).

  2. Security
    - RLS enabled. Public SELECT — nav is part of the marketing surface.
    - INSERT/UPDATE/DELETE restricted to admins so marketers can edit IA
      without a deploy; no authenticated-user writes.

  3. Seed
    - Inserts the new recommended IA: flatter desktop bar with five top-level
      categories, three bottom-nav mobile items (Ask / Guides / Menu), and
      friendly breadcrumb labels for 20 core routes.
*/

CREATE TABLE IF NOT EXISTS navigation_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label_en text NOT NULL,
  label_es text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 100,
  audiences text[] NOT NULL DEFAULT ARRAY['consumer','business','organization','admin'],
  show_in_top_bar boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES navigation_groups(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  route text NOT NULL,
  icon text NOT NULL DEFAULT 'ChevronRight',
  label_en text NOT NULL,
  label_es text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_es text NOT NULL DEFAULT '',
  breadcrumb_label_en text NOT NULL DEFAULT '',
  breadcrumb_label_es text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 100,
  is_primary boolean NOT NULL DEFAULT false,
  is_bottom_nav boolean NOT NULL DEFAULT false,
  is_cta boolean NOT NULL DEFAULT false,
  highlight boolean NOT NULL DEFAULT false,
  audiences text[] NOT NULL DEFAULT ARRAY['consumer','business','organization','admin'],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nav_items_group ON navigation_items(group_id);
CREATE INDEX IF NOT EXISTS idx_nav_items_bottom ON navigation_items(is_bottom_nav) WHERE is_bottom_nav = true;
CREATE INDEX IF NOT EXISTS idx_nav_items_breadcrumbs ON navigation_items(route);

ALTER TABLE navigation_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active nav groups"
  ON navigation_groups FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert nav groups"
  ON navigation_groups FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can update nav groups"
  ON navigation_groups FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can delete nav groups"
  ON navigation_groups FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Anyone can read active nav items"
  ON navigation_items FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert nav items"
  ON navigation_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can update nav items"
  ON navigation_items FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can delete nav items"
  ON navigation_items FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

-- Seed recommended IA
INSERT INTO navigation_groups (slug, label_en, label_es, sort_order) VALUES
  ('get-help',  'Get Help',     'Obtener Ayuda',  10),
  ('solutions', 'Solutions',    'Soluciones',     20),
  ('resources', 'Resources',    'Recursos',       30),
  ('pricing',   'Pricing',      'Precios',        40),
  ('trust',     'Trust',        'Confianza',      50)
ON CONFLICT (slug) DO NOTHING;

WITH g AS (SELECT id, slug FROM navigation_groups)
INSERT INTO navigation_items (group_id, slug, route, icon, label_en, label_es, description_en, description_es, breadcrumb_label_en, breadcrumb_label_es, sort_order, is_primary, is_bottom_nav, is_cta, highlight)
VALUES
  ((SELECT id FROM g WHERE slug='get-help'),  'ask-ezlegal',    '/chat',                'Sparkles',     'Ask EZLegal',            'Preguntar a EZLegal',      'Chat, research, draft in one place', 'Chat, investigacion y redaccion',     'Ask EZLegal',          'Preguntar a EZLegal',       10, true,  true,  true,  false),
  ((SELECT id FROM g WHERE slug='get-help'),  'negotiation',    '/negotiate',           'Handshake',    'Negotiation Planner',    'Planificador de Negociacion','Build winning strategies',            'Estrategias ganadoras',               'Negotiate',            'Negociar',                  20, false, false, false, false),
  ((SELECT id FROM g WHERE slug='get-help'),  'case-predictor', '/case-predictor',      'Scale',        'Case Predictor',         'Predictor de Casos',        'Know your chances',                   'Conoce tus probabilidades',           'Case Predictor',       'Predictor',                 30, false, false, false, false),
  ((SELECT id FROM g WHERE slug='get-help'),  'crisis',         '/emergency-resources', 'AlertTriangle','Urgent Help',            'Ayuda Urgente',             'Immediate crisis resources',          'Recursos de crisis',                  'Urgent Help',          'Ayuda Urgente',             40, false, false, false, true),
  ((SELECT id FROM g WHERE slug='solutions'), 'for-individuals','/for-individuals',     'User',         'For Individuals',        'Para Individuos',           'Personal legal help',                 'Ayuda legal personal',                'For Individuals',      'Para Individuos',           10, true,  false, false, false),
  ((SELECT id FROM g WHERE slug='solutions'), 'for-business',   '/for-business',        'Building2',    'For Business',           'Para Negocios',             'SMB legal solutions',                 'Soluciones para PYMES',               'For Business',         'Para Negocios',             20, false, false, false, false),
  ((SELECT id FROM g WHERE slug='solutions'), 'for-orgs',       '/for-organizations',   'Scale',        'For Legal Aid & Nonprofits','Asistencia Legal y ONG', 'Nonprofits and legal aid',            'ONG y asistencia legal',              'For Organizations',    'Para Organizaciones',       30, false, false, false, false),
  ((SELECT id FROM g WHERE slug='resources'), 'guides',         '/ezreads',             'BookOpen',     'Legal Guides',           'Guias Legales',             'Plain-language articles',             'Articulos en lenguaje simple',        'Legal Guides',         'Guias',                     10, true,  true,  false, false),
  ((SELECT id FROM g WHERE slug='resources'), 'find-attorney',  '/find-attorney',       'Users',        'Find an Attorney',       'Encontrar Abogado',         'Licensed professionals',              'Profesionales con licencia',          'Find Attorney',        'Encontrar Abogado',         20, false, false, false, false),
  ((SELECT id FROM g WHERE slug='resources'), 'how-it-works',   '/how-it-works',        'ShieldCheck',  'How Our AI Works',       'Como Funciona la IA',       'Methodology and sources',             'Metodologia y fuentes',               'How It Works',         'Como Funciona',             30, false, false, false, false),
  ((SELECT id FROM g WHERE slug='pricing'),   'pricing',        '/pricing',             'CreditCard',   'Pricing',                'Precios',                   'Plans and features',                  'Planes y funciones',                  'Pricing',              'Precios',                   10, true,  false, false, false),
  ((SELECT id FROM g WHERE slug='trust'),    'trust-center',    '/trust-center',        'Shield',       'Trust Center',           'Centro de Confianza',       'Safety and governance',               'Seguridad y gobernanza',              'Trust Center',         'Confianza',                 10, true,  false, false, false),
  ((SELECT id FROM g WHERE slug='trust'),    'what-we-help',    '/scope-disclaimers',   'FileText',     'What We Can Help With',  'Lo Que Podemos Ayudar',     'Our scope and limits',                'Alcance y limites',                   'What We Help With',    'Lo Que Ayudamos',           20, false, false, false, false),
  ((SELECT id FROM g WHERE slug='trust'),    'about',           '/about',               'Info',         'About Us',               'Sobre Nosotros',            'Our mission',                         'Nuestra mision',                      'About',                'Sobre Nosotros',            30, false, false, false, false),
  ((SELECT id FROM g WHERE slug='trust'),    'contact',         '/contact',             'MessageSquare','Contact',                'Contacto',                  'Get in touch',                        'Contactenos',                         'Contact',              'Contacto',                  40, false, false, false, false)
ON CONFLICT (slug) DO NOTHING;

-- Standalone breadcrumb-label rows (not part of visible nav groups)
INSERT INTO navigation_items (slug, route, icon, label_en, label_es, breadcrumb_label_en, breadcrumb_label_es, sort_order, is_primary)
VALUES
  ('home',       '/',            'Home',  'Home',         'Inicio',       'Home',          'Inicio',        0, false),
  ('dashboard',  '/dashboard',   'User',  'Dashboard',    'Panel',        'Dashboard',     'Panel',         0, false),
  ('documents',  '/documents',   'FileText','Documents',  'Documentos',   'Documents',     'Documentos',    0, false),
  ('profile',    '/profile',     'User',  'Profile',      'Perfil',       'Profile',       'Perfil',        0, false),
  ('login',      '/login',       'User',  'Sign In',      'Iniciar Sesion','Sign In',      'Iniciar Sesion',0, false),
  ('signup',     '/signup',      'User',  'Sign Up',      'Registrarse',  'Sign Up',       'Registrarse',   0, false)
ON CONFLICT (slug) DO NOTHING;