/*
  # Create social media templates table

  1. New Tables
    - `social_media_templates`
      - `id` (uuid, primary key)
      - `platform` (text) - e.g. 'whatsapp', 'facebook', 'nextdoor'
      - `icon_name` (text) - Lucide icon name for display
      - `color` (text) - CSS color class for platform header
      - `label_en` (text) - English label for the template
      - `label_es` (text) - Spanish label for the template
      - `text_en` (text) - English template text
      - `text_es` (text) - Spanish template text
      - `is_active` (boolean) - Whether template is visible
      - `display_order` (integer) - Sort order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `social_media_templates` table
    - Public read access for active templates (needed on public Media Kit page)
    - Admin-only write access via profiles.is_admin check

  3. Seed Data
    - WhatsApp, Facebook Group, and Nextdoor templates in EN+ES
*/

CREATE TABLE IF NOT EXISTS social_media_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  icon_name text NOT NULL DEFAULT 'MessageCircle',
  color text NOT NULL DEFAULT 'bg-gray-500',
  label_en text NOT NULL,
  label_es text NOT NULL DEFAULT '',
  text_en text NOT NULL,
  text_es text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE social_media_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active social media templates"
  ON social_media_templates
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert social media templates"
  ON social_media_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update social media templates"
  ON social_media_templates
  FOR UPDATE
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

CREATE POLICY "Admins can delete social media templates"
  ON social_media_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

INSERT INTO social_media_templates (platform, icon_name, color, label_en, label_es, text_en, text_es, display_order)
VALUES
  (
    'whatsapp',
    'MessageCircle',
    'bg-[#25D366]',
    'WhatsApp Message',
    'Mensaje de WhatsApp',
    'Know someone dealing with a legal issue? ezLegal.ai is a FREE resource that explains your legal rights in plain English (and Spanish). No signup needed, completely confidential. Check it out: https://ezlegal.ai/welcome?ch=whatsapp',
    'Conoces a alguien con un problema legal? ezLegal.ai es un recurso GRATIS que explica tus derechos legales en espanol simple. Sin registro, completamente confidencial. Miralo aqui: https://ezlegal.ai/welcome?ch=whatsapp',
    1
  ),
  (
    'facebook',
    'Facebook',
    'bg-[#1877F2]',
    'Facebook Group Post',
    'Post para Grupo de Facebook',
    E'I want to share a free legal resource with our community. ezLegal.ai answers legal questions in plain language with real citations to laws and statutes. It covers immigration, housing, employment, family law, and more. It''s free, confidential, and available in English and Spanish. If you or someone you know needs legal information, give it a try: https://ezlegal.ai/welcome?ch=facebook\n\nNote: This is legal information, not legal advice. For specific legal counsel, always consult a licensed attorney.',
    E'Quiero compartir un recurso legal gratuito con nuestra comunidad. ezLegal.ai responde preguntas legales en lenguaje simple con citas reales de leyes y estatutos. Cubre inmigracion, vivienda, trabajo, derecho familiar y mas. Es gratis, confidencial y disponible en espanol e ingles. Si tu o alguien que conoces necesita informacion legal, pruebalo: https://ezlegal.ai/welcome?ch=facebook\n\nNota: Esto es informacion legal, no asesoria legal. Para asesoria legal especifica, siempre consulte a un abogado licenciado.',
    2
  ),
  (
    'nextdoor',
    'MapPin',
    'bg-[#8ED500]',
    'Nextdoor Post',
    'Post para Nextdoor',
    'Hi neighbors! Wanted to share a free resource that might help someone in our community. ezLegal.ai provides free legal information on housing rights, employment law, immigration, and more. It explains things in plain language and is available in both English and Spanish. Completely confidential and free to use: https://ezlegal.ai/welcome?ch=nextdoor',
    'Hola vecinos! Quiero compartir un recurso gratuito que podria ayudar a alguien en nuestra comunidad. ezLegal.ai proporciona informacion legal gratuita sobre derechos de vivienda, derecho laboral, inmigracion y mas. Explica las cosas en lenguaje simple y esta disponible en espanol e ingles. Completamente confidencial y gratis: https://ezlegal.ai/welcome?ch=nextdoor',
    3
  );