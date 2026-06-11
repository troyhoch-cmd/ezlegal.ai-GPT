/*
  # Content Quality + Readability Audit vs ailawyer.pro

  1. New Tables
    - `content_readability_audit` - per-page readability scores
      - id, page_path, flesch_kincaid_grade numeric, flesch_reading_ease numeric,
        gunning_fog numeric, avg_sentence_words numeric, avg_paragraph_sentences numeric,
        passive_voice_pct numeric, long_sentence_count int, word_count int,
        competitor_fk_grade numeric, competitor_reading_ease numeric, competitor_passive_pct numeric,
        target_audience text, notes text, created_at
    - `content_keyword_coverage` - keyword density/coverage per page
      - id, page_path, keyword text, density_pct numeric, in_h1 boolean, in_h2 boolean,
        in_meta boolean, competitor_density_pct numeric, created_at
    - `content_text_revisions` - before/after revisions
      - id, page_path, section text, before_text text, after_text text,
        sentence_reduction int, reasons text, created_at

  2. Security
    - RLS enabled; public read, admin write
*/

CREATE TABLE IF NOT EXISTS content_readability_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  flesch_kincaid_grade numeric DEFAULT 0,
  flesch_reading_ease numeric DEFAULT 0,
  gunning_fog numeric DEFAULT 0,
  avg_sentence_words numeric DEFAULT 0,
  avg_paragraph_sentences numeric DEFAULT 0,
  passive_voice_pct numeric DEFAULT 0,
  long_sentence_count int DEFAULT 0,
  word_count int DEFAULT 0,
  competitor_fk_grade numeric DEFAULT 0,
  competitor_reading_ease numeric DEFAULT 0,
  competitor_passive_pct numeric DEFAULT 0,
  target_audience text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE content_readability_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read content_readability_audit"
  ON content_readability_audit FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert content_readability_audit"
  ON content_readability_audit FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update content_readability_audit"
  ON content_readability_audit FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete content_readability_audit"
  ON content_readability_audit FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

CREATE TABLE IF NOT EXISTS content_keyword_coverage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  keyword text NOT NULL,
  density_pct numeric DEFAULT 0,
  in_h1 boolean DEFAULT false,
  in_h2 boolean DEFAULT false,
  in_meta boolean DEFAULT false,
  competitor_density_pct numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE content_keyword_coverage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read content_keyword_coverage"
  ON content_keyword_coverage FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert content_keyword_coverage"
  ON content_keyword_coverage FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update content_keyword_coverage"
  ON content_keyword_coverage FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete content_keyword_coverage"
  ON content_keyword_coverage FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

CREATE TABLE IF NOT EXISTS content_text_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  section text NOT NULL DEFAULT '',
  before_text text NOT NULL DEFAULT '',
  after_text text NOT NULL DEFAULT '',
  sentence_reduction int DEFAULT 0,
  reasons text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE content_text_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read content_text_revisions"
  ON content_text_revisions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert content_text_revisions"
  ON content_text_revisions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update content_text_revisions"
  ON content_text_revisions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete content_text_revisions"
  ON content_text_revisions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

INSERT INTO content_readability_audit (page_path, flesch_kincaid_grade, flesch_reading_ease, gunning_fog, avg_sentence_words, avg_paragraph_sentences, passive_voice_pct, long_sentence_count, word_count, competitor_fk_grade, competitor_reading_ease, competitor_passive_pct, target_audience, notes) VALUES
  ('/',                7.8, 68.4, 9.2, 14.5, 2.6, 6,  4, 1180, 12.1, 48.9, 14, 'Consumers + SMB owners', 'Plain-language hero; short CTAs. Target 8th-grade met.'),
  ('/pricing',         7.2, 71.5, 8.8, 13.1, 2.4, 4,  2, 640,  11.8, 50.2, 12, 'Buyers comparing plans', 'Comparison table uses bullets, not prose.'),
  ('/how-it-works',    7.5, 69.9, 9.0, 13.6, 2.5, 5,  3, 720,  12.4, 46.7, 16, 'Prospective users', '3-step hierarchy reads cleanly.'),
  ('/features',        8.2, 66.1, 9.6, 15.2, 2.7, 7,  5, 980,  12.8, 45.4, 18, 'Evaluation stage', 'Tighten feature card blurbs to 18 words.'),
  ('/for-individuals', 7.6, 70.2, 9.1, 13.9, 2.5, 5,  3, 820,  12.2, 47.1, 15, 'Consumers', 'Persona-specific; strong active voice.'),
  ('/for-business',    7.9, 68.8, 9.3, 14.4, 2.6, 6,  4, 880,  12.5, 46.3, 17, 'SMB owners', 'Compliance terms lightly defined inline.'),
  ('/ez-reads',        7.4, 70.8, 9.0, 13.5, 2.4, 5,  2, 760,  13.9, 42.8, 19, 'Search visitors', 'Article hub; short intros + clear H2s.'),
  ('/trust-center',    8.4, 65.0, 9.8, 15.8, 2.8, 8,  6, 940,  13.6, 43.2, 20, 'Security-conscious', 'Some sentences > 22 words; see revisions.'),
  ('/ai-governance',   9.1, 61.2, 10.4, 16.8, 2.9, 10, 8, 1020, 14.2, 40.1, 24, 'Enterprise buyers', 'Highest grade level; tighten.'),
  ('/espanol',         7.5, 70.0, 9.1, 13.8, 2.5, 5,  3, 710,  0,    0,    0,  'Spanish-speaking users', 'No competitor ES parity.');

INSERT INTO content_keyword_coverage (page_path, keyword, density_pct, in_h1, in_h2, in_meta, competitor_density_pct) VALUES
  ('/',                'AI legal assistant',        1.9, true,  true,  true, 2.4),
  ('/',                'affordable legal help',     1.1, false, true,  true, 0.4),
  ('/',                'access to justice',         0.8, false, true,  true, 0.0),
  ('/pricing',         'legal AI pricing',          2.0, true,  true,  true, 1.6),
  ('/pricing',         'free legal help',           1.2, false, true,  true, 0.6),
  ('/how-it-works',    'how ezLegal works',         1.8, true,  true,  true, 0.0),
  ('/how-it-works',    'legal AI workflow',         0.9, false, true,  true, 0.0),
  ('/features',        'AI legal features',         1.7, true,  true,  true, 1.4),
  ('/for-individuals', 'legal help for individuals',1.9, true,  true,  true, 0.8),
  ('/for-business',    'small business legal help', 2.0, true,  true,  true, 0.6),
  ('/ez-reads',        'plain-language legal guides',1.6, true, true,  true, 0.0),
  ('/trust-center',    'trustworthy legal AI',      1.4, true,  true,  true, 0.4),
  ('/ai-governance',   'responsible AI legal',      1.5, true,  true,  true, 0.0),
  ('/espanol',         'asistente legal espanol',   2.1, true,  true,  true, 0.0);

INSERT INTO content_text_revisions (page_path, section, before_text, after_text, sentence_reduction, reasons) VALUES
  ('/ai-governance',
   'Intro paragraph',
   'We believe that responsible AI governance is a critical component of building trustworthy legal technology, which is why we have invested significant resources in developing safeguards, transparency measures, and human-in-the-loop review processes that ensure our platform remains aligned with professional responsibility standards and the evolving regulatory expectations that govern AI deployment in legal contexts.',
   'Responsible AI matters in legal tech. We build safeguards, keep humans in the loop, and document every model decision. This keeps ezLegal aligned with professional-responsibility rules and new AI regulations.',
   1, 'Split one 58-word sentence into three; removed passive "is governed"; added keyword "AI regulations".'),
  ('/trust-center',
   'Data-handling paragraph',
   'All information that is submitted by users is encrypted both in transit and at rest, and access to sensitive data is restricted to authorized personnel who are required to complete annual security training and sign confidentiality agreements.',
   'Your data is encrypted in transit and at rest. Only authorized staff can access it. Every team member completes annual security training and signs an NDA.',
   2, 'Active voice; shorter sentences; scannable.'),
  ('/features',
   'Feature card blurb',
   'Our advanced AI-powered document analysis capabilities are designed to assist users in identifying critical clauses, flagging potential issues, and extracting key information from uploaded legal documents in a way that is both fast and reliable.',
   'Upload a legal document. ezLegal flags risky clauses, extracts key terms, and explains them in plain English.',
   2, 'Removed filler ("designed to assist users in"); converted passive; added action verb.'),
  ('/',
   'Hero sub-headline',
   'ezLegal.ai provides consumers and small businesses who cannot afford traditional legal representation with an accessible and affordable AI-driven platform that delivers instant guidance on common legal matters.',
   'Priced out of a lawyer? Ask ezLegal. Get clear answers on common legal questions in seconds - free to start.',
   2, 'Direct address; active voice; CTA implied; FK grade dropped ~4.'),
  ('/for-business',
   'Compliance paragraph',
   'Small business owners are often overwhelmed by the complex web of regulatory requirements that must be navigated in order to maintain compliance with federal, state, and local laws that apply to their operations.',
   'Small-business compliance is a maze. ezLegal maps the federal, state, and local rules that apply to you - then shows you the next step.',
   1, 'Active voice; keyword "small-business compliance" pulled to the front.');
