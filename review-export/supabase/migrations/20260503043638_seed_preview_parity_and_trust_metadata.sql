/*
  # Seed Issue Pack Preview parity (es) + trust metadata for all packs

  Adds Spanish rows for every pack, adds previews for 3 still-missing packs
  (negotiation, employment, debt), and enriches every row with:
    - jurisdiction_scope_note (what "Arizona Templates" means)
    - source_basis (statutes, court forms, attorney-authored)
    - personalization_note
    - privacy_note
    - not_for (who this pack is NOT for)
    - glossary (plain-language term translations, eg. BATNA / ZOPA)
    - settlement_warning (packs with settlement ranges)

  1. Changes
     - UPSERT 18 rows total: 9 packs x (en,es) where applicable

  2. Security
     - Uses existing RLS; writes via migration role
*/

INSERT INTO issue_pack_previews (
  pack_id, locale, title, sections, sample_templates, estimated_time_minutes,
  jurisdiction_coverage, reviewer_name, reviewer_role, last_reviewed_at,
  jurisdiction_scope_note, source_basis, personalization_note, privacy_note,
  not_for, glossary, settlement_warning
) VALUES
(
  'negotiation', 'en', 'Negotiation Strategy Planner',
  '[
    {"h":"Your situation summary","b":"We restate your inputs in plain language so nothing is lost in translation."},
    {"h":"Your backup plan (BATNA)","b":"What you will do if the negotiation fails. This is your leverage."},
    {"h":"Possible agreement range (ZOPA)","b":"The overlap between what you will accept and what the other side might accept."},
    {"h":"Opening anchor","b":"A first offer designed to protect your range without collapsing the deal."},
    {"h":"Counter-offer playbook","b":"Three tiered responses based on how the other side moves."},
    {"h":"Red flag detection","b":"Signals that the other side is stalling, bluffing, or about to walk."}
  ]'::jsonb,
  '[
    {"name":"Personalized Strategy PDF","format":"PDF"},
    {"name":"Opening statement script","format":"DOCX"},
    {"name":"Counter-offer email templates","format":"DOCX"},
    {"name":"Walk-away decision worksheet","format":"PDF"}
  ]'::jsonb,
  30,
  '["Arizona","California","Texas","New York","Florida"]'::jsonb,
  'J. Rivera, Esq.', 'Licensed attorney reviewer', now(),
  '{"en":"State-specific means scripts and red flags reference your state''s negotiation norms. The strategy framework itself is general. Always confirm deadlines and laws for your state."}'::jsonb,
  '[
    {"label":"Negotiation research","cite":"Harvard Program on Negotiation (public)"},
    {"label":"Attorney-authored scripts","cite":"ezLegal attorney network, reviewed 2026"}
  ]'::jsonb,
  'Your strategy document is generated from the facts you enter. Templates and playbooks are fixed; scripts adapt to your inputs.',
  'Your answers are saved to your account only. We do not use them to train AI. Export or delete any time from your dashboard.',
  '[
    "You are in active litigation with a scheduled trial date",
    "You are being asked to sign a settlement in the next 24 hours",
    "The other side is represented by counsel and you cannot retain your own"
  ]'::jsonb,
  '[
    {"term":"BATNA","plain":"Your backup plan if negotiation fails."},
    {"term":"ZOPA","plain":"The range where an agreement might be possible."},
    {"term":"Anchor","plain":"Your opening offer that sets the tone of the conversation."}
  ]'::jsonb,
  'Settlement ranges are estimates for planning only. Outcomes depend on facts, evidence, law, and the other party''s response.'
),
(
  'negotiation', 'es', 'Planificador de Estrategia de Negociacion',
  '[
    {"h":"Resumen de tu situacion","b":"Reformulamos tus datos en lenguaje claro."},
    {"h":"Tu plan de respaldo (BATNA)","b":"Lo que haras si la negociacion falla. Esta es tu ventaja."},
    {"h":"Rango de acuerdo posible (ZOPA)","b":"Donde podria coincidir lo que aceptas con lo que el otro lado aceptaria."},
    {"h":"Oferta inicial","b":"Una primera oferta que protege tu rango."},
    {"h":"Guia de contraoferta","b":"Tres respuestas escalonadas segun la reaccion del otro lado."},
    {"h":"Deteccion de banderas rojas","b":"Senales de que el otro lado esta estancando o retirandose."}
  ]'::jsonb,
  '[
    {"name":"PDF de Estrategia Personalizada","format":"PDF"},
    {"name":"Guion de declaracion inicial","format":"DOCX"},
    {"name":"Plantillas de correo de contraoferta","format":"DOCX"},
    {"name":"Hoja de decision de retirada","format":"PDF"}
  ]'::jsonb,
  30,
  '["Arizona","California","Texas","Nueva York","Florida"]'::jsonb,
  'J. Rivera, Abg.', 'Abogado licenciado revisor', now(),
  '{"es":"Especifico por estado significa que los guiones y banderas rojas usan las normas de tu estado. El marco de estrategia es general. Confirma las fechas y leyes de tu estado."}'::jsonb,
  '[
    {"label":"Investigacion de negociacion","cite":"Programa de Negociacion de Harvard (publico)"},
    {"label":"Guiones de abogados","cite":"Red de abogados de ezLegal, revisado 2026"}
  ]'::jsonb,
  'Tu documento de estrategia se genera con los datos que ingresas. Las plantillas son fijas; los guiones se adaptan.',
  'Tus respuestas se guardan solo en tu cuenta. No las usamos para entrenar IA. Exporta o elimina desde tu panel.',
  '[
    "Tienes una fecha de juicio programada",
    "Te piden firmar un acuerdo en las proximas 24 horas",
    "El otro lado tiene abogado y tu no puedes contratar uno"
  ]'::jsonb,
  '[
    {"term":"BATNA","plain":"Tu plan de respaldo si la negociacion falla."},
    {"term":"ZOPA","plain":"El rango donde un acuerdo podria ser posible."},
    {"term":"Anclaje","plain":"Tu oferta inicial que marca el tono."}
  ]'::jsonb,
  'Los rangos de acuerdo son estimados solo para planificacion. Los resultados dependen de hechos, evidencia, ley y la respuesta de la otra parte.'
),
(
  'employment', 'en', 'Employment & Wages Pack',
  '[
    {"h":"Classify your issue","b":"Wage theft, wrongful termination, discrimination, or retaliation - each has different deadlines."},
    {"h":"Deadline tracker","b":"Federal and state filing windows, in calendar form."},
    {"h":"Evidence collection","b":"What to gather before filing."},
    {"h":"Demand letter","b":"Fillable demand letter tailored to your claim type."},
    {"h":"Agency filing guide","b":"Which agency (DOL, EEOC, state DLS) and how to file."}
  ]'::jsonb,
  '[
    {"name":"Demand letter","format":"DOCX"},
    {"name":"Wage calculation worksheet","format":"XLSX"},
    {"name":"Agency contact list by state","format":"PDF"}
  ]'::jsonb,
  25,
  '["Arizona","California","Texas","New York","Florida"]'::jsonb,
  'A. Chen, Esq.', 'Licensed employment attorney reviewer', now(),
  '{"en":"State-specific means deadlines and agencies match your state. Template language is general and labeled where state law varies."}'::jsonb,
  '[
    {"label":"Federal FLSA","cite":"29 U.S.C. 201 et seq."},
    {"label":"EEOC guidance","cite":"eeoc.gov (public)"},
    {"label":"Attorney-authored demand letters","cite":"ezLegal employment panel, 2026"}
  ]'::jsonb,
  'Your demand letter is built from your facts. Evidence checklist and agency list are fixed.',
  'Employment data is sensitive. Your inputs are private to your account and are not used to train AI.',
  '[
    "You are currently represented by an employment lawyer",
    "Your employer has a signed severance/release you have not reviewed",
    "You are a federal employee (different rules apply)"
  ]'::jsonb,
  '[
    {"term":"FLSA","plain":"Federal Fair Labor Standards Act - the main wage law."},
    {"term":"EEOC","plain":"The agency that handles workplace discrimination claims."}
  ]'::jsonb,
  ''
),
(
  'employment', 'es', 'Paquete de Empleo y Salarios',
  '[
    {"h":"Clasifica tu problema","b":"Robo de salario, despido injustificado, discriminacion, o represalia."},
    {"h":"Rastreador de fechas","b":"Plazos federales y estatales."},
    {"h":"Recoleccion de evidencia","b":"Que reunir antes de presentar."},
    {"h":"Carta de demanda","b":"Carta rellenable segun tu reclamo."},
    {"h":"Guia de presentacion","b":"Que agencia y como presentar."}
  ]'::jsonb,
  '[
    {"name":"Carta de demanda","format":"DOCX"},
    {"name":"Hoja de calculo salarial","format":"XLSX"},
    {"name":"Lista de agencias por estado","format":"PDF"}
  ]'::jsonb,
  25,
  '["Arizona","California","Texas","Nueva York","Florida"]'::jsonb,
  'A. Chen, Abg.', 'Abogada laboral licenciada revisora', now(),
  '{"es":"Especifico por estado significa plazos y agencias que coinciden con tu estado."}'::jsonb,
  '[
    {"label":"FLSA federal","cite":"29 U.S.C. 201 y siguientes"},
    {"label":"Guia EEOC","cite":"eeoc.gov (publico)"},
    {"label":"Cartas de abogados","cite":"Panel laboral ezLegal, 2026"}
  ]'::jsonb,
  'Tu carta de demanda se construye con tus hechos. Las listas son fijas.',
  'Tus datos laborales son privados de tu cuenta y no se usan para entrenar IA.',
  '[
    "Ya tienes un abogado laboral",
    "Tu empleador tiene un acuerdo de indemnizacion firmado que no has revisado",
    "Eres empleado federal (aplican reglas diferentes)"
  ]'::jsonb,
  '[
    {"term":"FLSA","plain":"Ley Federal de Normas Laborales Justas - la ley principal de salarios."},
    {"term":"EEOC","plain":"La agencia que maneja reclamos de discriminacion laboral."}
  ]'::jsonb,
  ''
),
(
  'debt', 'en', 'Debt Defense Pack',
  '[
    {"h":"Verify the debt","b":"Validation letter + statute-of-limitations checker."},
    {"h":"Respond to a lawsuit","b":"Answer and affirmative defenses, step by step."},
    {"h":"Stop harassment","b":"FDCPA cease-communication letters."},
    {"h":"Negotiate a settlement","b":"Lump-sum vs payment plan scripts."},
    {"h":"Protect your income","b":"Exemption guidance for wages and bank accounts."}
  ]'::jsonb,
  '[
    {"name":"Debt validation letter","format":"DOCX"},
    {"name":"Answer to debt complaint","format":"DOCX"},
    {"name":"Settlement negotiation scripts","format":"PDF"}
  ]'::jsonb,
  25,
  '["Arizona","California","Texas","New York","Florida"]'::jsonb,
  'M. Okafor, Esq.', 'Licensed consumer attorney reviewer', now(),
  '{"en":"State-specific means the statute-of-limitations and exemption amounts match your state."}'::jsonb,
  '[
    {"label":"FDCPA","cite":"15 U.S.C. 1692"},
    {"label":"CFPB guidance","cite":"consumerfinance.gov (public)"},
    {"label":"Attorney-authored answer templates","cite":"ezLegal consumer panel, 2026"}
  ]'::jsonb,
  'Your answer and settlement scripts are built from your facts. Statute table is fixed.',
  'Financial data is sensitive. We do not share it, sell it, or train AI on it.',
  '[
    "You have already been garnished and need immediate relief (seek counsel)",
    "You are considering bankruptcy (this pack is not a bankruptcy guide)"
  ]'::jsonb,
  '[
    {"term":"FDCPA","plain":"The federal law that limits how debt collectors can contact you."},
    {"term":"Statute of limitations","plain":"The time limit for a creditor to sue you for a debt."}
  ]'::jsonb,
  'Settlement ranges are estimates for planning only. The creditor may refuse or counter.'
),
(
  'debt', 'es', 'Paquete de Defensa de Deudas',
  '[
    {"h":"Verifica la deuda","b":"Carta de validacion y verificador de prescripcion."},
    {"h":"Responde a una demanda","b":"Respuesta y defensas afirmativas."},
    {"h":"Detener el acoso","b":"Cartas de cese bajo FDCPA."},
    {"h":"Negociar un acuerdo","b":"Guiones de suma global o plan de pagos."},
    {"h":"Protege tus ingresos","b":"Guia de exenciones."}
  ]'::jsonb,
  '[
    {"name":"Carta de validacion","format":"DOCX"},
    {"name":"Respuesta a demanda","format":"DOCX"},
    {"name":"Guiones de negociacion","format":"PDF"}
  ]'::jsonb,
  25,
  '["Arizona","California","Texas","Nueva York","Florida"]'::jsonb,
  'M. Okafor, Abg.', 'Abogado de consumidor licenciado revisor', now(),
  '{"es":"Especifico por estado significa que la prescripcion y montos de exencion coinciden con tu estado."}'::jsonb,
  '[
    {"label":"FDCPA","cite":"15 U.S.C. 1692"},
    {"label":"Guia CFPB","cite":"consumerfinance.gov (publico)"},
    {"label":"Plantillas de abogados","cite":"Panel de consumidor ezLegal, 2026"}
  ]'::jsonb,
  'Tu respuesta y guiones se construyen con tus hechos. La tabla de prescripcion es fija.',
  'Los datos financieros son sensibles. No los compartimos, vendemos ni entrenamos IA con ellos.',
  '[
    "Ya te estan embargando y necesitas ayuda inmediata",
    "Estas considerando quiebra (este paquete no es una guia de quiebra)"
  ]'::jsonb,
  '[
    {"term":"FDCPA","plain":"La ley federal que limita como los cobradores pueden contactarte."},
    {"term":"Prescripcion","plain":"El plazo que tiene un acreedor para demandarte por una deuda."}
  ]'::jsonb,
  'Los rangos de acuerdo son solo estimados. El acreedor puede rechazar o contraofertar.'
),
(
  'immigration', 'es', 'Paquete de Inmigracion',
  '[
    {"h":"Tu situacion","b":"Reformulamos tu caso en lenguaje claro."},
    {"h":"Plan de accion","b":"Proximos pasos especificos para tu tipo de problema."},
    {"h":"Conoce tus derechos","b":"Tarjeta para encuentros con ICE que puedes imprimir."},
    {"h":"Contactos de emergencia","b":"Plantillas para que tu familia sepa a quien llamar."},
    {"h":"Lista de fechas limite","b":"Con fechas especificas para tu caso."}
  ]'::jsonb,
  '[
    {"name":"Plan de accion","format":"PDF"},
    {"name":"Tarjeta de Conoce Tus Derechos","format":"PDF"},
    {"name":"Plantilla de contacto de emergencia","format":"DOCX"}
  ]'::jsonb,
  45,
  '["Arizona","California","Texas","Nueva York","Florida"]'::jsonb,
  'R. Morales, Abg.', 'Abogada de inmigracion licenciada revisora', now(),
  '{"es":"Especifico por estado significa que los contactos y cortes locales coinciden con tu estado. La ley de inmigracion es federal."}'::jsonb,
  '[
    {"label":"INA","cite":"8 U.S.C. 1101 y siguientes"},
    {"label":"Guia USCIS","cite":"uscis.gov (publico)"},
    {"label":"Plantillas de abogados","cite":"Panel de inmigracion ezLegal, 2026"}
  ]'::jsonb,
  'Tu plan se genera con tus respuestas. La tarjeta de derechos es fija.',
  'Los datos de inmigracion son extremadamente sensibles. Solo tu los ves. No entrenamos IA con ellos.',
  '[
    "Estas actualmente detenido (llama a un abogado de inmediato)",
    "Tu audiencia es en menos de 48 horas",
    "Tienes antecedentes criminales complejos"
  ]'::jsonb,
  '[
    {"term":"NTA","plain":"Notificacion para presentarte en corte de inmigracion."},
    {"term":"ICE","plain":"Agencia federal de aplicacion de inmigracion."},
    {"term":"USCIS","plain":"Agencia federal que procesa beneficios de inmigracion."}
  ]'::jsonb,
  ''
),
(
  'housing', 'es', 'Paquete de Vivienda y Desalojo',
  '[
    {"h":"Entiende tu aviso","b":"Te decimos que tipo de aviso recibiste y cuanto tiempo tienes."},
    {"h":"Respuesta al desalojo","b":"Plantilla rellenable para presentar en corte."},
    {"h":"Tus derechos","b":"Resumen de derechos de inquilino para tu estado."},
    {"h":"Evidencia","b":"Que reunir antes de la audiencia."},
    {"h":"Calendario de corte","b":"Fechas clave y como prepararte."}
  ]'::jsonb,
  '[
    {"name":"Respuesta al desalojo","format":"DOCX"},
    {"name":"Resumen de derechos","format":"PDF"},
    {"name":"Lista de evidencia","format":"PDF"}
  ]'::jsonb,
  35,
  '["Arizona","California","Texas","Nueva York","Florida"]'::jsonb,
  'L. Gutierrez, Abg.', 'Abogada de vivienda licenciada revisora', now(),
  '{"es":"Especifico por estado significa que los plazos, formularios de corte y derechos de inquilino coinciden con tu estado."}'::jsonb,
  '[
    {"label":"Estatutos estatales","cite":"Ley de Inquilinos y Propietarios de tu estado"},
    {"label":"Formularios de corte","cite":"Formularios oficiales locales"},
    {"label":"Plantillas de abogados","cite":"Panel de vivienda ezLegal, 2026"}
  ]'::jsonb,
  'Tu respuesta se construye con los hechos de tu aviso. El resumen de derechos es fijo.',
  'Tu direccion y situacion de vivienda son privadas. No compartimos datos con propietarios ni agencias.',
  '[
    "El sheriff ya publico una orden de restitucion",
    "Tu audiencia es en menos de 48 horas",
    "Enfrentas violencia domestica en la vivienda"
  ]'::jsonb,
  '[
    {"term":"Writ of restitution","plain":"Orden de corte que permite al sheriff retirarte de la propiedad."},
    {"term":"Unlawful detainer","plain":"Termino formal para el juicio de desalojo."}
  ]'::jsonb,
  ''
),
(
  'family', 'es', 'Paquete de Asuntos Familiares',
  '[
    {"h":"Tu situacion","b":"Divorcio, custodia, manutencion u orden de proteccion."},
    {"h":"Autorepresentacion","b":"Que esperar al representarte a ti mismo."},
    {"h":"Propuesta de custodia","b":"Plantilla rellenable."},
    {"h":"Hoja de manutencion","b":"Calculo basado en la formula de tu estado."},
    {"h":"Preparacion de corte","b":"Checklist y etiqueta en la sala."}
  ]'::jsonb,
  '[
    {"name":"Propuesta de custodia","format":"DOCX"},
    {"name":"Hoja de calculo de manutencion","format":"XLSX"},
    {"name":"Guia de preparacion de corte","format":"PDF"}
  ]'::jsonb,
  40,
  '["Arizona","California","Texas","Nueva York","Florida"]'::jsonb,
  'S. Park, Abg.', 'Abogada de familia licenciada revisora', now(),
  '{"es":"Especifico por estado significa que las formulas de manutencion y factores de custodia coinciden con tu estado."}'::jsonb,
  '[
    {"label":"Estatutos estatales de familia","cite":"Codigo de Familia de tu estado"},
    {"label":"Formularios de corte","cite":"Formularios oficiales locales"},
    {"label":"Plantillas de abogados","cite":"Panel de familia ezLegal, 2026"}
  ]'::jsonb,
  'Tu propuesta se construye con tus hechos. La guia de corte es fija.',
  'Los asuntos familiares son privados. Nunca compartimos datos con la otra parte.',
  '[
    "Tu o tus hijos estan en peligro inmediato",
    "CPS/DCS ha retirado a un hijo",
    "Necesitas una orden de proteccion de emergencia"
  ]'::jsonb,
  '[
    {"term":"Custodia legal","plain":"Quien toma decisiones mayores (educacion, salud)."},
    {"term":"Custodia fisica","plain":"Donde vive el nino principalmente."}
  ]'::jsonb,
  ''
),
(
  'smb_contract', 'es', 'Paquete de Revision de Contratos',
  '[
    {"h":"Resumen en lenguaje claro","b":"Memo de 2 paginas de lo que el contrato realmente dice."},
    {"h":"Desglose por clausula","b":"Bandera verde, amarilla o roja en cada seccion."},
    {"h":"Cambios sugeridos","b":"Plantilla Word con control de cambios."},
    {"h":"Puntos de negociacion","b":"Que ceder primero y donde mantenerte firme."},
    {"h":"Cuando escalar","b":"Criterios claros para llamar a un abogado."}
  ]'::jsonb,
  '[
    {"name":"Memo de resumen","format":"PDF"},
    {"name":"Contrato anotado","format":"DOCX"},
    {"name":"Guion de negociacion","format":"PDF"}
  ]'::jsonb,
  40,
  '["Arizona","California","Texas","Nueva York","Florida"]'::jsonb,
  'D. Hoffman, Abg.', 'Abogado comercial licenciado revisor', now(),
  '{"es":"Especifico por estado significa que las reglas de formacion de contratos y limites de indemnizacion coinciden con tu estado."}'::jsonb,
  '[
    {"label":"UCC","cite":"Codigo Comercial Uniforme articulo 2"},
    {"label":"Leyes estatales","cite":"Ley contractual de tu estado"},
    {"label":"Plantillas de abogados","cite":"Panel SMB ezLegal, 2026"}
  ]'::jsonb,
  'Tu revision se construye sobre el contrato que subes. Las guias son fijas.',
  'Tu contrato se procesa solo para generar la revision y luego se elimina segun tus ajustes.',
  '[
    "Contratos con gobierno (aplican reglas especiales)",
    "Acuerdos de fusion/adquisicion (requieren abogado)",
    "Contratos con indemnizaciones ilimitadas (escalar)"
  ]'::jsonb,
  '[
    {"term":"Indemnizacion","plain":"Promesa de cubrir perdidas de la otra parte."},
    {"term":"Limitacion de responsabilidad","plain":"Tope en cuanto dinero podrias deber."}
  ]'::jsonb,
  ''
),
(
  'smb_employee', 'es', 'Paquete de Problemas con Empleados',
  '[
    {"h":"Clasifica el problema","b":"Desempeno, mala conducta o separacion."},
    {"h":"Documenta","b":"Plantillas para registrar hechos de forma defendible."},
    {"h":"Disciplina progresiva","b":"Advertencias verbales, escritas y finales."},
    {"h":"Lista de terminacion","b":"Pasos por estado antes del ultimo dia."},
    {"h":"Acuerdo de separacion","b":"Plantilla con exencion bajo ADEA si aplica."}
  ]'::jsonb,
  '[
    {"name":"Carta de advertencia","format":"DOCX"},
    {"name":"Lista de terminacion","format":"PDF"},
    {"name":"Acuerdo de separacion","format":"DOCX"}
  ]'::jsonb,
  30,
  '["Arizona","California","Texas","Nueva York","Florida"]'::jsonb,
  'K. Nguyen, Abg.', 'Abogada laboral licenciada revisora', now(),
  '{"es":"Especifico por estado significa que las reglas de pago final y notificaciones coinciden con tu estado."}'::jsonb,
  '[
    {"label":"Title VII","cite":"42 U.S.C. 2000e"},
    {"label":"ADEA","cite":"29 U.S.C. 621"},
    {"label":"Plantillas de abogados","cite":"Panel laboral ezLegal, 2026"}
  ]'::jsonb,
  'Tus cartas se construyen con los hechos que ingresas. La lista es fija.',
  'Los datos de empleados son privados. No compartimos con nadie fuera de tu cuenta.',
  '[
    "Empleados sindicalizados (aplica el CBA)",
    "Denunciantes de whistleblower protegidos federalmente",
    "Acomodaciones por discapacidad pendientes (llamar abogado)"
  ]'::jsonb,
  '[
    {"term":"At-will","plain":"Puedes despedir sin causa, salvo excepciones ilegales."},
    {"term":"Disciplina progresiva","plain":"Advertencias escalonadas antes de terminar."}
  ]'::jsonb,
  ''
),
(
  'smb_vendor', 'es', 'Paquete de Disputas con Proveedores',
  '[
    {"h":"Carta de demanda","b":"Carta fuerte pero profesional que preserva tu posicion."},
    {"h":"Guia de reclamos menores","b":"Formularios y limites de tu estado."},
    {"h":"Guiones de negociacion","b":"Tres niveles: amigable, firme, final."},
    {"h":"Lista de evidencia","b":"Que reunir para respaldar tu reclamo."},
    {"h":"Escalada","b":"Cuando llamar a un abogado."}
  ]'::jsonb,
  '[
    {"name":"Carta de demanda","format":"DOCX"},
    {"name":"Guia de reclamos menores","format":"PDF"},
    {"name":"Guiones de negociacion","format":"PDF"}
  ]'::jsonb,
  25,
  '["Arizona","California","Texas","Nueva York","Florida"]'::jsonb,
  'D. Hoffman, Abg.', 'Abogado comercial licenciado revisor', now(),
  '{"es":"Especifico por estado significa que los limites de reclamos menores y fechas de prescripcion coinciden con tu estado."}'::jsonb,
  '[
    {"label":"UCC articulo 2","cite":"Ventas de bienes"},
    {"label":"Reclamos menores","cite":"Reglas de corte local"},
    {"label":"Plantillas de abogados","cite":"Panel SMB ezLegal, 2026"}
  ]'::jsonb,
  'Tu carta y guiones se construyen con los hechos. Las guias son fijas.',
  'Los datos de disputa son privados. No contactamos al proveedor sin tu accion.',
  '[
    "Disputas sobre $10,000 (puede necesitar abogado)",
    "Casos con obligaciones continuas complejas",
    "Disputas con clausula de arbitraje vinculante"
  ]'::jsonb,
  '[
    {"term":"Reclamos menores","plain":"Corte simplificada sin abogados para montos pequenos."},
    {"term":"Carta de demanda","plain":"Primera carta formal que exige pago o cumplimiento."}
  ]'::jsonb,
  'Los rangos de acuerdo son solo estimados; la respuesta del proveedor puede variar.'
)
ON CONFLICT (pack_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  sections = EXCLUDED.sections,
  sample_templates = EXCLUDED.sample_templates,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  jurisdiction_coverage = EXCLUDED.jurisdiction_coverage,
  reviewer_name = EXCLUDED.reviewer_name,
  reviewer_role = EXCLUDED.reviewer_role,
  last_reviewed_at = EXCLUDED.last_reviewed_at,
  jurisdiction_scope_note = EXCLUDED.jurisdiction_scope_note,
  source_basis = EXCLUDED.source_basis,
  personalization_note = EXCLUDED.personalization_note,
  privacy_note = EXCLUDED.privacy_note,
  not_for = EXCLUDED.not_for,
  glossary = EXCLUDED.glossary,
  settlement_warning = EXCLUDED.settlement_warning;

-- Enrich existing English rows that pre-dated the new columns
UPDATE issue_pack_previews SET
  reviewer_role = COALESCE(NULLIF(reviewer_role,''), 'Licensed attorney reviewer'),
  jurisdiction_scope_note = COALESCE(NULLIF(jurisdiction_scope_note::text,''),'{"en":"State-specific means templates, deadlines and contacts are selected or adapted for your state where available. Confirm facts and deadlines before relying on them."}')::jsonb,
  personalization_note = COALESCE(NULLIF(personalization_note,''), 'Your final plan is generated from your answers. Templates and playbooks are fixed; scripts adapt to your inputs.'),
  privacy_note = COALESCE(NULLIF(privacy_note,''), 'Your answers are saved to your account only. We do not use them to train AI. Export or delete any time from your dashboard.')
WHERE pack_id IN ('immigration','housing','family','smb_contract','smb_employee','smb_vendor') AND locale='en';

UPDATE issue_pack_previews SET
  source_basis = CASE pack_id
    WHEN 'immigration' THEN '[{"label":"INA","cite":"8 U.S.C. 1101 et seq."},{"label":"USCIS guidance","cite":"uscis.gov (public)"},{"label":"Attorney-authored templates","cite":"ezLegal immigration panel, 2026"}]'::jsonb
    WHEN 'housing' THEN '[{"label":"State landlord-tenant code","cite":"Your state statutes"},{"label":"Court forms","cite":"Official local court forms"},{"label":"Attorney-authored templates","cite":"ezLegal housing panel, 2026"}]'::jsonb
    WHEN 'family' THEN '[{"label":"State family code","cite":"Your state statutes"},{"label":"Court forms","cite":"Official local court forms"},{"label":"Attorney-authored templates","cite":"ezLegal family panel, 2026"}]'::jsonb
    WHEN 'smb_contract' THEN '[{"label":"UCC Article 2","cite":"Uniform Commercial Code"},{"label":"State law","cite":"Your state contract law"},{"label":"Attorney-authored templates","cite":"ezLegal SMB panel, 2026"}]'::jsonb
    WHEN 'smb_employee' THEN '[{"label":"Title VII","cite":"42 U.S.C. 2000e"},{"label":"ADEA","cite":"29 U.S.C. 621"},{"label":"Attorney-authored templates","cite":"ezLegal employment panel, 2026"}]'::jsonb
    WHEN 'smb_vendor' THEN '[{"label":"UCC Article 2","cite":"Sales of goods"},{"label":"Small claims","cite":"Local court rules"},{"label":"Attorney-authored templates","cite":"ezLegal SMB panel, 2026"}]'::jsonb
    ELSE source_basis
  END
WHERE source_basis IS NULL OR source_basis = '[]'::jsonb;

UPDATE issue_pack_previews SET
  not_for = CASE pack_id
    WHEN 'immigration' THEN '["You are currently detained (call a lawyer immediately)","Your hearing is in less than 48 hours","You have a complex criminal record"]'::jsonb
    WHEN 'housing' THEN '["A sheriff has posted a writ of restitution","Your hearing is within 48 hours","You are facing domestic violence in the home"]'::jsonb
    WHEN 'family' THEN '["You or your children are in immediate danger","CPS/DCS has removed a child","You need an emergency protective order"]'::jsonb
    WHEN 'smb_contract' THEN '["Government contracts (special rules apply)","M&A agreements (need counsel)","Contracts with uncapped indemnities (escalate)"]'::jsonb
    WHEN 'smb_employee' THEN '["Union employees (CBA governs)","Federal whistleblower claims","Pending ADA accommodations (call counsel)"]'::jsonb
    WHEN 'smb_vendor' THEN '["Disputes above $10,000 (may need counsel)","Cases with complex continuing obligations","Disputes with binding arbitration clauses"]'::jsonb
    ELSE not_for
  END
WHERE not_for IS NULL OR not_for = '[]'::jsonb;

UPDATE issue_pack_previews SET
  glossary = CASE pack_id
    WHEN 'immigration' THEN '[{"term":"NTA","plain":"Notice to appear in immigration court."},{"term":"ICE","plain":"Federal immigration enforcement agency."},{"term":"USCIS","plain":"Federal agency that processes immigration benefits."}]'::jsonb
    WHEN 'housing' THEN '[{"term":"Writ of restitution","plain":"Court order allowing the sheriff to remove you."},{"term":"Unlawful detainer","plain":"Formal name for an eviction lawsuit."}]'::jsonb
    WHEN 'family' THEN '[{"term":"Legal custody","plain":"Who makes major decisions (school, medical)."},{"term":"Physical custody","plain":"Where the child primarily lives."}]'::jsonb
    WHEN 'smb_contract' THEN '[{"term":"Indemnification","plain":"A promise to cover the other side''s losses."},{"term":"Limitation of liability","plain":"A cap on how much money you could owe."}]'::jsonb
    WHEN 'smb_employee' THEN '[{"term":"At-will","plain":"You can terminate without cause, with legal exceptions."},{"term":"Progressive discipline","plain":"Warnings that escalate before termination."}]'::jsonb
    WHEN 'smb_vendor' THEN '[{"term":"Small claims","plain":"Simplified no-lawyer court for smaller amounts."},{"term":"Demand letter","plain":"First formal letter demanding payment or performance."}]'::jsonb
    ELSE glossary
  END
WHERE glossary IS NULL OR glossary = '[]'::jsonb;
