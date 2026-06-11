/*
  # Allow bilingual glossary entries

  Replace the single-column unique constraint on `glossary_terms.slug` with a
  composite `(slug, language)` constraint so the same slug can hold EN + ES copy.

  1. Changes
    - Drop constraint `glossary_terms_slug_key`
    - Add `glossary_terms_slug_language_key` unique constraint on (slug, language)

  2. Security
    - No RLS changes.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'glossary_terms_slug_key'
      AND conrelid = 'glossary_terms'::regclass
  ) THEN
    ALTER TABLE glossary_terms DROP CONSTRAINT glossary_terms_slug_key;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'glossary_terms_slug_language_key'
      AND conrelid = 'glossary_terms'::regclass
  ) THEN
    ALTER TABLE glossary_terms
      ADD CONSTRAINT glossary_terms_slug_language_key UNIQUE (slug, language);
  END IF;
END $$;
