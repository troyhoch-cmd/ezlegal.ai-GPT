/*
  # Upgrade ezLegal pricing to 12-tier market-owning catalog

  1. Schema Changes
    - `ezlegal_pricing_tiers` gains `launch_badge text` and `one_time_price numeric` columns.
  2. Data
    - Deactivate all legacy tier rows (preserves history; no hard delete to protect referential integrity).
    - Upsert 12 new tiers grouped by audience (personal, smb, organization) with verbatim launch copy.
  3. Security
    - Table RLS policies unchanged; preserves existing public-read constraints.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ezlegal_pricing_tiers' AND column_name = 'launch_badge'
  ) THEN
    ALTER TABLE ezlegal_pricing_tiers ADD COLUMN launch_badge text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ezlegal_pricing_tiers' AND column_name = 'one_time_price'
  ) THEN
    ALTER TABLE ezlegal_pricing_tiers ADD COLUMN one_time_price numeric(10,2);
  END IF;
END $$;

UPDATE ezlegal_pricing_tiers SET is_active = false WHERE id IN ('free','essentials','pro','smb','legal_aid');

INSERT INTO ezlegal_pricing_tiers (
  id, name, audience, headline, description, badge, launch_badge,
  price_monthly, price_annual, one_time_price, cta_label, cta_route,
  is_highlighted, is_active, display_order, limits, features, included
) VALUES
  ('justice_free','Justice Free','personal','Start free. No credit card.','Ask legal questions in plain English or Spanish and see if ezLegal.ai is right for you.',NULL,NULL,0,0,NULL,'Start free','/signup',false,true,10,
    '{"questionsPerMonth":30,"documentUploadsPerMonth":3,"documentGenerationsPerMonth":1,"savedMattersMax":1,"seats":1}'::jsonb,
    '{"spanish":true,"urgentHelpSafetyLinks":true,"legalAidReferral":true,"qualifiedHelpFinder":true}'::jsonb,
    '["30 legal questions per month","3 documents analyzed per month","1 document generated per month","English and Spanish","Urgent-help safety links, always free"]'::jsonb),
  ('everyday_plus','Everyday Plus','personal','For one legal issue you want to understand.','Answers, document explanations, and next-step plans for a single personal legal matter.','Most popular','Founding users: $1/mo for 12 months',4.99,39,NULL,'Get Everyday Plus','/checkout?plan=everyday_plus',true,true,20,
    '{"questionsPerMonth":200,"documentUploadsPerMonth":15,"documentGenerationsPerMonth":5,"savedMattersMax":3,"seats":1}'::jsonb,
    '{"spanish":true,"priorityDocumentProcessing":true,"documentReview":true,"reviewReadyFormatting":true}'::jsonb,
    '["200 questions per month","15 documents analyzed per month","5 documents generated per month","Next-step plan for each matter","Priority document processing","Downloadable, review-ready formatting"]'::jsonb),
  ('family','Family / Household','personal','For ongoing personal legal help.','More questions, more documents, and shared household matters.',NULL,NULL,7.99,69,NULL,'Choose Family','/checkout?plan=family',false,true,30,
    '{"questionsPerMonth":500,"documentUploadsPerMonth":30,"documentGenerationsPerMonth":10,"savedMattersMax":10,"seats":2}'::jsonb,
    '{"spanish":true,"priorityDocumentProcessing":true,"documentReview":true,"reviewReadyFormatting":true,"qualifiedHelpFinder":true}'::jsonb,
    '["500 questions per month (fair-use)","30 documents analyzed per month","10 documents generated per month","2 household members included","Find free, low-cost, legal-aid, or pro bono help"]'::jsonb),
  ('single_doc_boost','Single Document Boost','personal','One document, one low price.','Analyze or generate a single document without a subscription.',NULL,NULL,0,0,2.99,'Buy Boost','/checkout?plan=single_doc_boost',false,true,40,
    '{"questionsPerMonth":0,"documentUploadsPerMonth":1,"documentGenerationsPerMonth":1,"savedMattersMax":1,"seats":1}'::jsonb,
    '{"spanish":true,"documentReview":true,"reviewReadyFormatting":true}'::jsonb,
    '["1 document analyzed or generated","Plain-language summary","Downloadable, review-ready format","No subscription — one-time $2.99"]'::jsonb),
  ('business_free','Business Free','smb','Try ezLegal at work, free.','For solo operators and new businesses evaluating the platform.',NULL,NULL,0,0,NULL,'Start free','/signup?audience=business',false,true,50,
    '{"questionsPerMonth":20,"documentUploadsPerMonth":2,"documentGenerationsPerMonth":1,"savedMattersMax":1,"seats":1}'::jsonb,
    '{"spanish":true}'::jsonb,
    '["20 business questions per month","2 documents analyzed per month","1 document generated per month","English and Spanish"]'::jsonb),
  ('business_starter','Business Starter','smb','For solo operators and freelancers.','Review client contracts, NDAs, and simple vendor agreements before you sign.',NULL,NULL,7.99,79,NULL,'Start Business','/checkout?plan=business_starter',false,true,60,
    '{"questionsPerMonth":200,"documentUploadsPerMonth":15,"documentGenerationsPerMonth":5,"savedMattersMax":5,"seats":1}'::jsonb,
    '{"priorityDocumentProcessing":true,"documentReview":true,"reviewReadyFormatting":true,"sharedContractHistory":true}'::jsonb,
    '["200 questions per month","15 contracts analyzed per month","5 documents generated per month","Shared contract history","Downloadable, review-ready format"]'::jsonb),
  ('business_growth','Business Growth','smb','For growing small businesses.','Contracts, leases, vendor agreements, and NDAs — explained with suggested edits.','Best for SMBs','Founding users: $12/mo for 12 months',17.99,179,NULL,'Get Growth','/checkout?plan=business_growth',true,true,70,
    '{"questionsPerMonth":800,"documentUploadsPerMonth":60,"documentGenerationsPerMonth":20,"savedMattersMax":25,"seats":3}'::jsonb,
    '{"priorityDocumentProcessing":true,"documentReview":true,"reviewReadyFormatting":true,"sharedContractHistory":true,"auditLogExport":true,"conflictScreeningSupport":true}'::jsonb,
    '["3 seats included","800 questions per month (fair-use)","60 contracts analyzed per month","20 documents generated per month","Shared contract history and audit trail","Conflict screening support"]'::jsonb),
  ('business_team','Business Team','smb','For teams of 5 to 15.','Shared workspace, audit trail, and scaled limits for growing operations.',NULL,NULL,34.99,349,NULL,'Choose Team','/checkout?plan=business_team',false,true,80,
    '{"questionsPerMonth":"unlimited","documentUploadsPerMonth":200,"documentGenerationsPerMonth":60,"savedMattersMax":100,"seats":10}'::jsonb,
    '{"priorityDocumentProcessing":true,"documentReview":true,"reviewReadyFormatting":true,"sharedContractHistory":true,"auditLogExport":true,"conflictScreeningSupport":true}'::jsonb,
    '["10 seats included","Fair-use unlimited questions","200 documents analyzed per month","60 documents generated per month","Shared workspace and audit trail","Conflict screening support"]'::jsonb),
  ('legal_aid_free','Legal Aid Free','organization','Free for qualifying legal-aid organizations.','Bilingual intake, triage, and staff-review safeguards for frontline teams.',NULL,NULL,0,0,NULL,'Apply for free access','/for-partners?plan=legal_aid_free',false,true,90,
    '{"questionsPerMonth":1000,"documentUploadsPerMonth":100,"documentGenerationsPerMonth":25,"savedMattersMax":100,"seats":5}'::jsonb,
    '{"documentReview":true,"reviewReadyFormatting":true,"bilingualIntake":true,"staffReviewSafeguards":true}'::jsonb,
    '["Free for qualifying orgs","Bilingual intake (EN/ES)","Staff-review safeguards","5 staff seats included","Urgent-help safety links"]'::jsonb),
  ('clinic_starter','Clinic Starter','organization','For small clinics and nonprofits.','Scaled intake and document review for community legal programs.',NULL,NULL,49,499,NULL,'Talk to partnerships','/for-partners?plan=clinic_starter',false,true,100,
    '{"questionsPerMonth":5000,"documentUploadsPerMonth":500,"documentGenerationsPerMonth":100,"savedMattersMax":500,"seats":15}'::jsonb,
    '{"priorityDocumentProcessing":true,"documentReview":true,"reviewReadyFormatting":true,"sharedContractHistory":true,"auditLogExport":true,"conflictScreeningSupport":true,"bilingualIntake":true,"staffReviewSafeguards":true}'::jsonb,
    '["15 staff seats","Bilingual intake workflows","Shared matter history and audit trail","Conflict screening support","Staff-review safeguards"]'::jsonb),
  ('organization_pro','Organization Pro','organization','For mid-sized legal-aid and advocacy teams.','Embedded workflows, white-label intake, and program-level reporting.',NULL,NULL,199,1999,NULL,'Talk to partnerships','/for-partners?plan=organization_pro',false,true,110,
    '{"questionsPerMonth":"unlimited","documentUploadsPerMonth":"unlimited","documentGenerationsPerMonth":"unlimited","savedMattersMax":"unlimited","seats":50}'::jsonb,
    '{"priorityDocumentProcessing":true,"documentReview":true,"reviewReadyFormatting":true,"sharedContractHistory":true,"auditLogExport":true,"conflictScreeningSupport":true,"bilingualIntake":true,"staffReviewSafeguards":true,"whiteLabel":true,"apiAccess":true}'::jsonb,
    '["50 staff seats","Fair-use unlimited intake and matters","White-label embedded workflows","API access and SSO","Program-level reporting"]'::jsonb),
  ('coalition_statewide','Coalition / Statewide','organization','For statewide coalitions and large programs.','Unlimited staff, custom integrations, and dedicated partnership support.',NULL,NULL,499,4990,NULL,'Talk to partnerships','/for-partners?plan=coalition_statewide',false,true,120,
    '{"questionsPerMonth":"unlimited","documentUploadsPerMonth":"unlimited","documentGenerationsPerMonth":"unlimited","savedMattersMax":"unlimited","seats":"unlimited"}'::jsonb,
    '{"priorityDocumentProcessing":true,"documentReview":true,"reviewReadyFormatting":true,"sharedContractHistory":true,"auditLogExport":true,"conflictScreeningSupport":true,"bilingualIntake":true,"staffReviewSafeguards":true,"whiteLabel":true,"apiAccess":true}'::jsonb,
    '["Unlimited staff seats","Fair-use unlimited everything","Custom integrations and SSO","Dedicated partnership support","Statewide reporting and analytics"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  audience = EXCLUDED.audience,
  headline = EXCLUDED.headline,
  description = EXCLUDED.description,
  badge = EXCLUDED.badge,
  launch_badge = EXCLUDED.launch_badge,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  one_time_price = EXCLUDED.one_time_price,
  cta_label = EXCLUDED.cta_label,
  cta_route = EXCLUDED.cta_route,
  is_highlighted = EXCLUDED.is_highlighted,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  limits = EXCLUDED.limits,
  features = EXCLUDED.features,
  included = EXCLUDED.included;
