/*
  # Enrich Issue Pack Previews with trust metadata

  Adds columns to issue_pack_previews so the preview modal can surface reviewer
  credentials, source basis, personalization boundary, privacy reminder, not-for
  audience, glossary terms, and jurisdiction scope definition. This fulfills the
  P0 recommendations: Spanish parity, reviewer/date metadata, source basis,
  "Arizona Templates" definition, plain-language glossary, settlement warnings,
  and "who this is not for".

  1. Changes
     - Adds jurisdiction_scope_note (jsonb) -- explains what "Arizona Templates" means
     - Adds source_basis (jsonb array) -- statute/form/attorney-authored citations
     - Adds personalization_note (text) -- what's generated vs fixed
     - Adds privacy_note (text) -- input handling reminder
     - Adds not_for (jsonb array) -- situations where this pack is wrong
     - Adds glossary (jsonb array of {term, plain}) -- plain-language translations
     - Adds settlement_warning (text, nullable) -- shown for packs with ranges
     - Adds reviewer_role (text) -- when name cannot be public

  2. Security
     - Preserves existing RLS (public SELECT, admin write)
*/

ALTER TABLE issue_pack_previews
  ADD COLUMN IF NOT EXISTS jurisdiction_scope_note jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_basis jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS personalization_note text DEFAULT '',
  ADD COLUMN IF NOT EXISTS privacy_note text DEFAULT '',
  ADD COLUMN IF NOT EXISTS not_for jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS glossary jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS settlement_warning text DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewer_role text DEFAULT 'Licensed attorney reviewer';
