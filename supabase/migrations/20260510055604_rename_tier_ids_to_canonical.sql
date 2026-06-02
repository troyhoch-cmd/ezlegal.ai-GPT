/*
  # Rename pricing tier IDs to canonical form

  1. Changes
    - Rename ezlegal_pricing_tiers row id 'family' -> 'family_household'
    - Rename ezlegal_pricing_tiers row id 'single_doc_boost' -> 'single_document_boost'
    - Only applies if source row exists and target row does not.
  2. Notes
    - Uses UPDATE (not DELETE) to preserve history and FK safety.
*/

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM ezlegal_pricing_tiers WHERE id = 'family')
     AND NOT EXISTS (SELECT 1 FROM ezlegal_pricing_tiers WHERE id = 'family_household') THEN
    UPDATE ezlegal_pricing_tiers SET id = 'family_household' WHERE id = 'family';
  END IF;

  IF EXISTS (SELECT 1 FROM ezlegal_pricing_tiers WHERE id = 'single_doc_boost')
     AND NOT EXISTS (SELECT 1 FROM ezlegal_pricing_tiers WHERE id = 'single_document_boost') THEN
    UPDATE ezlegal_pricing_tiers SET id = 'single_document_boost' WHERE id = 'single_doc_boost';
  END IF;
END $$;
