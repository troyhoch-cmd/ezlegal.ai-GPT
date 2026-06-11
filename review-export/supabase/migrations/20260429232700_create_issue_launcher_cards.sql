/*
  # Guided Issue Launcher cards

  1. New table
    - `issue_launcher_cards`: curated set of legal issue cards shown on the chat empty state.
      - id uuid PK, slug text unique, title text, description text
      - icon text (lucide-react icon name), sort_order int, is_active bool
      - prompt_seed text (pre-loaded user prompt), audience text ('all'|'individual'|'business'|'legal_aid')
      - created_at, updated_at timestamptz
  2. Security
    - RLS enabled.
    - Public read for active rows (anonymous and authenticated).
    - Admin-only insert/update/delete via is_admin profile flag.
  3. Seed
    - 9 default cards covering the canonical consumer legal issues.
*/

CREATE TABLE IF NOT EXISTS issue_launcher_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'HelpCircle',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  prompt_seed text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT 'all',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE issue_launcher_cards ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='issue_launcher_cards' AND policyname='Anyone can read active issue cards'
  ) THEN
    CREATE POLICY "Anyone can read active issue cards"
      ON issue_launcher_cards FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='issue_launcher_cards' AND policyname='Admins can insert issue cards'
  ) THEN
    CREATE POLICY "Admins can insert issue cards"
      ON issue_launcher_cards FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.is_admin = true)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='issue_launcher_cards' AND policyname='Admins can update issue cards'
  ) THEN
    CREATE POLICY "Admins can update issue cards"
      ON issue_launcher_cards FOR UPDATE
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.is_admin = true)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.is_admin = true)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='issue_launcher_cards' AND policyname='Admins can delete issue cards'
  ) THEN
    CREATE POLICY "Admins can delete issue cards"
      ON issue_launcher_cards FOR DELETE
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.is_admin = true)
      );
  END IF;
END $$;

INSERT INTO issue_launcher_cards (slug, title, description, icon, sort_order, prompt_seed, audience) VALUES
  ('housing', 'Housing or eviction', 'Rent, repairs, eviction notice, security deposit', 'Home', 10, 'I have a housing or eviction issue. ', 'individual'),
  ('debt', 'Debt or collections', 'Debt collectors, medical bills, wage garnishment', 'CreditCard', 20, 'I''m dealing with debt or collections. ', 'individual'),
  ('work', 'Work or wages', 'Unpaid wages, wrongful termination, harassment', 'Briefcase', 30, 'I have a work or wages problem. ', 'individual'),
  ('family', 'Family or divorce', 'Divorce, custody, child support', 'Users', 40, 'I have a family law question. ', 'individual'),
  ('business', 'Small business', 'Contracts, licenses, disputes', 'Store', 50, 'I have a small business legal question. ', 'business'),
  ('identity', 'Identity theft or scam', 'Fraud, identity theft, scams', 'ShieldAlert', 60, 'I think I''ve been a victim of fraud or identity theft. ', 'individual'),
  ('court', 'Court papers', 'Received court papers or a summons', 'FileText', 70, 'I received court papers and don''t know what to do. ', 'all'),
  ('immigration', 'Immigration paperwork', 'Visa, green card, citizenship forms', 'Globe2', 80, 'I have an immigration paperwork question. ', 'individual'),
  ('unsure', 'Not sure', 'Describe what happened in your own words', 'HelpCircle', 999, '', 'all')
ON CONFLICT (slug) DO NOTHING;
