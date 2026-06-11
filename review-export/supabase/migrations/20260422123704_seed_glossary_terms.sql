/*
  # Seed plain-language glossary terms

  Populates `glossary_terms` with the jargon most likely to appear on
  consumer-facing surfaces (intake, chat, pricing, disclosures). Uses
  ON CONFLICT so this migration is idempotent.
*/

INSERT INTO public.glossary_terms (slug, term, plain_language, language) VALUES
  ('jurisdiction', 'Jurisdiction', 'The state or country whose laws apply to your situation.', 'en'),
  ('statute', 'Statute', 'A written law passed by a legislature.', 'en'),
  ('matter', 'Matter', 'A legal issue or case you are working on.', 'en'),
  ('governance', 'Governance', 'The rules we follow to keep this service safe and fair.', 'en'),
  ('entitlement', 'Entitlement', 'What your current plan lets you do.', 'en'),
  ('conformance', 'Conformance', 'How closely the product follows its own safety rules.', 'en'),
  ('attestation', 'Attestation', 'A written statement confirming something is true.', 'en'),
  ('escalation', 'Escalation', 'Passing your question to a human who can help further.', 'en'),
  ('rag', 'RAG citation', 'An answer that cites the source it was built from.', 'en'),
  ('retainer', 'Retainer', 'An upfront fee that reserves a lawyer''s time.', 'en'),
  ('pro-bono', 'Pro bono', 'Legal help provided for free to people who cannot pay.', 'en'),
  ('triage', 'Triage', 'Sorting issues by how urgent they are.', 'en'),
  ('jurisdiction-es', 'Jurisdiccion', 'El estado o pais cuyas leyes aplican a tu situacion.', 'es'),
  ('statute-es', 'Estatuto', 'Una ley escrita aprobada por una legislatura.', 'es'),
  ('matter-es', 'Asunto', 'Un problema legal o caso en el que estas trabajando.', 'es'),
  ('pro-bono-es', 'Pro bono', 'Ayuda legal gratuita para personas que no pueden pagar.', 'es'),
  ('triage-es', 'Triaje', 'Clasificar problemas segun su urgencia.', 'es')
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  plain_language = EXCLUDED.plain_language,
  language = EXCLUDED.language,
  updated_at = now();
