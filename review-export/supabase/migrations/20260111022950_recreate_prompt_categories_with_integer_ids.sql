/*
  # Recreate Prompt Categories with Integer IDs

  1. Changes
    - Drop existing prompt_categories table and recreate with integer IDs
    - Update related tables to use integer foreign keys
    - Insert 42 predefined categories matching LegalBreeze structure
    - Maintain referential integrity with subcategories and prompts

  2. Migration Steps
    - Drop dependent tables temporarily
    - Recreate prompt_categories with integer ID
    - Recreate dependent tables with updated foreign keys
    - Insert all 42 categories
*/

DROP TABLE IF EXISTS chatbot_prompts CASCADE;
DROP TABLE IF EXISTS prompt_subcategories CASCADE;
DROP TABLE IF EXISTS prompt_categories CASCADE;

CREATE TABLE prompt_categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text DEFAULT 'folder',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON prompt_categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON prompt_categories
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

CREATE TABLE prompt_subcategories (
  id serial PRIMARY KEY,
  category_id integer REFERENCES prompt_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  keywords text[] DEFAULT '{}',
  model_override text,
  system_prompt_template text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prompt_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subcategories"
  ON prompt_subcategories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage subcategories"
  ON prompt_subcategories
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

CREATE TABLE chatbot_prompts (
  id serial PRIMARY KEY,
  category_id integer REFERENCES prompt_categories(id) ON DELETE SET NULL,
  subcategory_id integer REFERENCES prompt_subcategories(id) ON DELETE SET NULL,
  title text NOT NULL,
  prompt_text text NOT NULL,
  description text,
  jurisdiction text DEFAULT 'Arizona',
  tags text[] DEFAULT '{}',
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chatbot_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active prompts"
  ON chatbot_prompts
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage prompts"
  ON chatbot_prompts
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

CREATE INDEX IF NOT EXISTS idx_prompt_subcategories_category ON prompt_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_category ON chatbot_prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_subcategory ON chatbot_prompts(subcategory_id);

INSERT INTO prompt_categories (id, name, description, icon, display_order, is_active) VALUES
  (1, 'Adult Guardianship', 'Legal matters related to adult guardianship', 'user-check', 1, true),
  (2, 'Consumer Protection', 'Consumer rights and protection matters', 'shield', 2, true),
  (3, 'Criminal Matters', 'Criminal law and defense', 'gavel', 3, true),
  (4, 'Dependency and Juvenile Court Matters', 'Juvenile court and dependency cases', 'users', 4, true),
  (5, 'DUIs', 'DUI and traffic-related offenses', 'alert-triangle', 5, true),
  (6, 'Employment', 'Employment law and workplace issues', 'briefcase', 6, true),
  (7, 'Family Law', 'Divorce, custody, and family matters', 'heart', 7, true),
  (8, 'Healthcare, Medicare, and Medicaid', 'Healthcare and medical assistance programs', 'heart-pulse', 8, true),
  (9, 'Housing', 'Landlord-tenant and housing law', 'home', 9, true),
  (10, 'Immigration', 'Immigration and citizenship matters', 'globe', 10, true),
  (11, 'Rights Restoration', 'Civil rights restoration', 'key', 11, true),
  (12, 'Social Security', 'Social Security benefits and claims', 'dollar-sign', 12, true),
  (13, 'Traffic Tickets', 'Traffic violations and tickets', 'car', 13, true),
  (14, 'Trusts and Wills', 'Estate planning, trusts, and wills', 'file-text', 14, true),
  (15, 'Business and Investment Agreements', 'Business contracts and investment agreements', 'trending-up', 15, true),
  (16, 'Intellectual Property (IP)', 'Patents, trademarks, and copyrights', 'lightbulb', 16, true),
  (17, 'Personal Injury', 'Personal injury and accident claims', 'activity', 17, true),
  (18, 'Tax and Business Law', 'Tax law and business regulations', 'calculator', 18, true),
  (19, 'Real Estate', 'Real estate transactions and disputes', 'building', 19, true),
  (20, 'Legal Research and Analysis', 'Legal research services', 'search', 20, true),
  (21, 'Legal Research and Case Law', 'Case law research and analysis', 'book-open', 21, true),
  (22, 'Legal Procedures and Processes', 'Court procedures and legal processes', 'list', 22, true),
  (23, 'Legal Terms and Concepts', 'Legal terminology and concepts', 'bookmark', 23, true),
  (24, 'Public Policy and Social Impact of Law', 'Public policy and law impact', 'megaphone', 24, true),
  (25, 'Marketing, Sponsorship, and Service Agreements', 'Marketing and service contracts', 'award', 25, true),
  (26, 'Miscellaneous Legal Documents', 'Various legal documents', 'file', 26, true),
  (27, 'Family Care and Military Considerations', 'Military family law matters', 'flag', 27, true),
  (28, 'Surrogacy and Reproductive Agreements', 'Surrogacy and reproductive law', 'baby', 28, true),
  (29, 'Name Changes', 'Legal name change processes', 'edit-3', 29, true),
  (30, 'Conservatorship and Guardianship', 'Conservatorship legal matters', 'shield-check', 30, true),
  (31, 'Family Limited Partnerships', 'Family partnership agreements', 'users-2', 31, true),
  (32, 'Qualified Domestic Relations Orders (QDROs)', 'QDRO and retirement division', 'file-check', 32, true),
  (33, 'Cohabitation and Domestic Partnership Agreements', 'Domestic partnership contracts', 'user-heart', 33, true),
  (34, 'Relinquishment and Termination of Parental Rights', 'Parental rights termination', 'user-x', 34, true),
  (35, 'Medication Agreements', 'Medical consent and agreements', 'pill', 35, true),
  (36, 'Medical Malpractice', 'Medical malpractice claims', 'stethoscope', 36, true),
  (37, 'Public Transportation Accidents', 'Public transit accident claims', 'bus', 37, true),
  (38, 'Premises Liability', 'Property liability claims', 'building-2', 38, true),
  (39, 'Intellectual Property', 'IP law and protection', 'copyright', 39, true),
  (40, 'Legal Forms and Checklists', 'Standard legal forms', 'clipboard-list', 40, true),
  (41, 'Consultant Advice', 'Legal consultation services', 'message-circle', 41, true),
  (42, 'Enforceability analysis under Arizona law', 'Arizona law enforceability review', 'scale', 42, true);

SELECT setval('prompt_categories_id_seq', 43, false);
