/*
  # Fix community flyer assets: add readiness records and correct asset_type

  1. Modified Tables
    - `partner_assets`: Update asset_type from 'pdf' to 'community-flyer' for 10 community flyer assets
    - `asset_readiness`: Insert readiness records for 10 community flyers that were missing them

  2. Assets Fixed
    - tenant-rights-en, tenant-rights-es
    - family-law-en, family-law-es
    - immigration-en, immigration-es
    - consumer-rights-en, consumer-rights-es
    - employment-en, employment-es

  3. Important Notes
    - These assets were seeded with asset_type='pdf' but should be 'community-flyer'
    - Without readiness records, the filter function excludes them from display
    - English-only flyers get english_status='complete', spanish_status='not_applicable'
    - Spanish-only flyers get english_status='not_applicable', spanish_status='complete'
*/

UPDATE partner_assets
SET asset_type = 'community-flyer',
    updated_at = now()
WHERE slug IN (
  'tenant-rights-en', 'tenant-rights-es',
  'family-law-en', 'family-law-es',
  'immigration-en', 'immigration-es',
  'consumer-rights-en', 'consumer-rights-es',
  'employment-en', 'employment-es'
);

INSERT INTO asset_readiness (asset_id, english_status, spanish_status, legal_review_status, brand_approval_status, version)
SELECT
  pa.id,
  CASE
    WHEN pa.slug LIKE '%-es' THEN 'not_applicable'
    ELSE 'complete'
  END,
  CASE
    WHEN pa.slug LIKE '%-en' THEN 'not_applicable'
    ELSE 'complete'
  END,
  'complete',
  'complete',
  1
FROM partner_assets pa
WHERE pa.slug IN (
  'tenant-rights-en', 'tenant-rights-es',
  'family-law-en', 'family-law-es',
  'immigration-en', 'immigration-es',
  'consumer-rights-en', 'consumer-rights-es',
  'employment-en', 'employment-es'
)
AND NOT EXISTS (
  SELECT 1 FROM asset_readiness ar WHERE ar.asset_id = pa.id
);