import { useState, useRef } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Shield } from 'lucide-react';
import { ICP_CONTENT, type ICPKey, LEGAL_DISCLAIMER } from '../../lib/gtm-content';
import { submitLead, calculateLeadScore, type LeadData } from '../../lib/leads';
import { track } from '../../lib/gtm-analytics';
import { useLanguage } from '../../contexts/LanguageContext';
import CTAButton from './CTAButton';

type Step = 'icp' | 'need' | 'urgency' | 'context' | 'contact' | 'result';

const LEGAL_NEEDS: { value: string; label: Record<'en' | 'es', string> }[] = [
  { value: 'contract_review', label: { en: 'Contract review or negotiation', es: 'Revisión o negociación de contratos' } },
  { value: 'legal_intake', label: { en: 'Legal intake automation', es: 'Automatización de admisión legal' } },
  { value: 'business_formation', label: { en: 'Business formation or governance', es: 'Formación empresarial o gobernanza' } },
  { value: 'employment', label: { en: 'Employment/HR issue', es: 'Problema de empleo/RRHH' } },
  { value: 'privacy_compliance', label: { en: 'Privacy/compliance readiness', es: 'Preparación de privacidad/cumplimiento' } },
  { value: 'fundraising', label: { en: 'Fundraising/diligence', es: 'Recaudación/diligencia' } },
  { value: 'other', label: { en: 'Other', es: 'Otro' } },
];

const URGENCY_OPTIONS: { value: string; label: Record<'en' | 'es', string> }[] = [
  { value: 'today', label: { en: 'Today', es: 'Hoy' } },
  { value: 'this_week', label: { en: 'This week', es: 'Esta semana' } },
  { value: 'this_month', label: { en: 'This month', es: 'Este mes' } },
  { value: 'exploring', label: { en: 'Exploring', es: 'Explorando' } },
];

const ICP_LABELS_ES: Record<ICPKey, string> = {
  startups: 'Startups y PYMEs',
  law_firms: 'Bufetes de Abogados',
  in_house: 'Legal Interno',
};

const ICP_PAIN_ES: Record<ICPKey, string> = {
  startups: 'Las preguntas legales se acumulan en torno a contratos, contrataciones, privacidad y recaudación.',
  law_firms: 'La admisión, recolección de documentos y resúmenes iniciales consumen tiempo no facturable.',
  in_house: 'Los equipos legales reciben solicitudes dispersas con hechos incompletos.',
};

const UI: Record<'en' | 'es', {
  step1h: string;
  step1p: string;
  step2h: string;
  step2p: string;
  step3h: string;
  step3p: string;
  step4h: string;
  step4p: string;
  step5h: string;
  step5p: string;
  orgLabel: string;
  sizeLabel: string;
  sizePlaceholder: string;
  descLabel: string;
  docsLabel: string;
  docsPlaceholder: string;
  fnameLabel: string;
  emailLabel: string;
  roleLabel: string;
  consentLabel: string;
  back: string;
  cont: string;
  submit: string;
  resultH: string;
  roleField: string;
  needField: string;
  urgencyField: string;
  scoreField: string;
  priorityRec: string;
  checklistRec: string;
  priorityCta: string;
  checklistCta: string;
  localNote: string;
  disclaimer: string;
  errIcp: string;
  errNeed: string;
  errUrgency: string;
  errOrg: string;
  errDesc: string;
  errFname: string;
  errEmail: string;
  errEmailInvalid: string;
  errConsent: string;
  stepOf: string;
  done: string;
}> = {
  en: {
    step1h: 'What best describes you?',
    step1p: 'Select your role so we can tailor the experience.',
    step2h: 'Primary legal need',
    step2p: 'What is the most pressing legal workflow you need help with?',
    step3h: 'How urgent is this?',
    step3p: 'This helps us prioritize your request.',
    step4h: 'Tell us about your situation',
    step4p: 'This helps us tailor recommendations.',
    step5h: 'How can we reach you?',
    step5p: 'We will send your results and recommendations.',
    orgLabel: 'Organization name *',
    sizeLabel: 'Team/company size',
    sizePlaceholder: 'e.g. 5, 25, 100+',
    descLabel: 'Short description of the legal issue *',
    docsLabel: 'Document count (optional)',
    docsPlaceholder: 'e.g. 3 contracts, 10 documents',
    fnameLabel: 'First name *',
    emailLabel: 'Work email *',
    roleLabel: 'Role/title',
    consentLabel: 'I agree to receive communications about my legal readiness results. I understand this does not create an attorney-client relationship.',
    back: 'Back',
    cont: 'Continue',
    submit: 'Submit',
    resultH: 'Your Legal Readiness Summary',
    roleField: 'Role:',
    needField: 'Need:',
    urgencyField: 'Urgency:',
    scoreField: 'Score:',
    priorityRec: 'Based on your urgency and needs, we recommend a priority consultation.',
    checklistRec: 'Download the legal readiness checklist to start organizing your legal work.',
    priorityCta: 'Book a priority demo',
    checklistCta: 'Download the legal readiness checklist',
    localNote: 'Your request was saved locally for this prototype. Configure VITE_LEAD_ENDPOINT or Supabase to collect leads in production.',
    disclaimer: LEGAL_DISCLAIMER,
    errIcp: 'Select your role',
    errNeed: 'Select a legal need',
    errUrgency: 'Select urgency',
    errOrg: 'Organization name is required',
    errDesc: 'Description is required',
    errFname: 'First name is required',
    errEmail: 'Email is required',
    errEmailInvalid: 'Enter a valid email',
    errConsent: 'Consent is required',
    stepOf: 'Step',
    done: 'Submission complete. See your results below.',
  },
  es: {
    step1h: '¿Qué describe mejor su rol?',
    step1p: 'Seleccione su rol para personalizar la experiencia.',
    step2h: 'Necesidad legal principal',
    step2p: '¿Cuál es el flujo de trabajo legal más urgente con el que necesita ayuda?',
    step3h: '¿Qué tan urgente es esto?',
    step3p: 'Esto nos ayuda a priorizar su solicitud.',
    step4h: 'Cuéntenos sobre su situación',
    step4p: 'Esto nos ayuda a personalizar recomendaciones.',
    step5h: '¿Cómo podemos contactarle?',
    step5p: 'Le enviaremos sus resultados y recomendaciones.',
    orgLabel: 'Nombre de la organización *',
    sizeLabel: 'Tamaño del equipo/empresa',
    sizePlaceholder: 'ej. 5, 25, 100+',
    descLabel: 'Breve descripción del problema legal *',
    docsLabel: 'Cantidad de documentos (opcional)',
    docsPlaceholder: 'ej. 3 contratos, 10 documentos',
    fnameLabel: 'Nombre *',
    emailLabel: 'Correo de trabajo *',
    roleLabel: 'Cargo/título',
    consentLabel: 'Acepto recibir comunicaciones sobre mis resultados de preparación legal. Entiendo que esto no crea una relación abogado-cliente.',
    back: 'Atrás',
    cont: 'Continuar',
    submit: 'Enviar',
    resultH: 'Su Resumen de Preparación Legal',
    roleField: 'Rol:',
    needField: 'Necesidad:',
    urgencyField: 'Urgencia:',
    scoreField: 'Puntaje:',
    priorityRec: 'Basado en su urgencia y necesidades, recomendamos una consulta prioritaria.',
    checklistRec: 'Descargue la lista de verificación de preparación legal para comenzar a organizar su trabajo legal.',
    priorityCta: 'Reservar una demo prioritaria',
    checklistCta: 'Descargar la lista de preparación legal',
    localNote: 'Su solicitud fue guardada localmente para este prototipo. Configure VITE_LEAD_ENDPOINT o Supabase para capturar leads en producción.',
    disclaimer: 'Esta es información legal y orientación de flujos de trabajo, no asesoría legal. Usar ezlegal.ai no crea una relación abogado-cliente.',
    errIcp: 'Seleccione su rol',
    errNeed: 'Seleccione una necesidad legal',
    errUrgency: 'Seleccione la urgencia',
    errOrg: 'El nombre de la organización es requerido',
    errDesc: 'La descripción es requerida',
    errFname: 'El nombre es requerido',
    errEmail: 'El correo es requerido',
    errEmailInvalid: 'Ingrese un correo válido',
    errConsent: 'El consentimiento es requerido',
    stepOf: 'Paso',
    done: 'Envío completo. Vea sus resultados abajo.',
  },
};

interface FormState {
  icp: ICPKey | '';
  legalNeed: string;
  urgency: string;
  organizationName: string;
  teamSize: string;
  description: string;
  documentCount: string;
  firstName: string;
  email: string;
  role: string;
  consent: boolean;
  honeypot: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function LegalReadinessWizard() {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en' as const;
  const t = UI[lang];

  const [step, setStep] = useState<Step>(() => { track('wizard_started'); return 'icp'; });
  const [form, setForm] = useState<FormState>({
    icp: '', legalNeed: '', urgency: '', organizationName: '', teamSize: '',
    description: '', documentCount: '', firstName: '', email: '', role: '',
    consent: false, honeypot: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; recommendation: string; method: string } | null>(null);
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = (msg: string) => {
    if (announcerRef.current) announcerRef.current.textContent = msg;
  };

  const steps: Step[] = ['icp', 'need', 'urgency', 'context', 'contact', 'result'];
  const currentIndex = steps.indexOf(step);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (step === 'icp' && !form.icp) e.icp = t.errIcp;
    if (step === 'need' && !form.legalNeed) e.legalNeed = t.errNeed;
    if (step === 'urgency' && !form.urgency) e.urgency = t.errUrgency;
    if (step === 'context') {
      if (!form.organizationName.trim()) e.organizationName = t.errOrg;
      if (!form.description.trim()) e.description = t.errDesc;
    }
    if (step === 'contact') {
      if (!form.firstName.trim()) e.firstName = t.errFname;
      if (!form.email.trim()) e.email = t.errEmail;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.errEmailInvalid;
      if (!form.consent) e.consent = t.errConsent;
    }
    setErrors(e);
    if (Object.keys(e).length) announce(Object.values(e)[0]);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    track('wizard_step_completed', { step, icp: form.icp });
    const nextStep = steps[currentIndex + 1];
    if (nextStep) setStep(nextStep);
  };

  const prev = () => {
    const prevStep = steps[currentIndex - 1];
    if (prevStep) setStep(prevStep);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (form.honeypot) return;

    setSubmitting(true);
    const score = calculateLeadScore({ urgency: form.urgency, legalNeed: form.legalNeed, teamSize: form.teamSize, email: form.email });
    const recommendation = score >= 50 ? t.priorityRec : t.checklistRec;

    const leadData: LeadData = {
      icp: form.icp,
      legalNeed: form.legalNeed,
      urgency: form.urgency,
      organizationName: form.organizationName,
      teamSize: form.teamSize,
      description: form.description,
      documentCount: form.documentCount,
      firstName: form.firstName,
      email: form.email,
      role: form.role,
      leadScore: score,
      recommendation,
    };

    const res = await submitLead(leadData);
    setResult({ score, recommendation, method: res.method });
    setStep('result');
    setSubmitting(false);
    track('wizard_completed', { icp: form.icp, score });
    announce(t.done);
  };

  const update = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const renderError = (field: string) => errors[field] ? (
    <p className="text-red-600 text-sm mt-1" role="alert">{errors[field]}</p>
  ) : null;

  const progressPct = Math.round((currentIndex / (steps.length - 1)) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      <div ref={announcerRef} aria-live="assertive" className="sr-only" />

      {step !== 'result' && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-navy-500 mb-1">
            <span>{t.stepOf} {currentIndex + 1} / {steps.length - 1}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 transition-all duration-300 rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {step === 'icp' && (
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">{t.step1h}</h2>
          <p className="text-navy-600 mb-6 text-sm">{t.step1p}</p>
          <div className="space-y-3">
            {(Object.keys(ICP_CONTENT) as ICPKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => update('icp', key)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  form.icp === key ? 'border-teal-600 bg-teal-50' : 'border-navy-200 hover:border-teal-400'
                }`}
              >
                <span className="font-semibold text-navy-900">
                  {lang === 'es' ? ICP_LABELS_ES[key] : ICP_CONTENT[key].label}
                </span>
                <p className="text-sm text-navy-600 mt-1">
                  {lang === 'es' ? ICP_PAIN_ES[key] : ICP_CONTENT[key].pain}
                </p>
              </button>
            ))}
          </div>
          {renderError('icp')}
        </div>
      )}

      {step === 'need' && (
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">{t.step2h}</h2>
          <p className="text-navy-600 mb-6 text-sm">{t.step2p}</p>
          <div className="space-y-2">
            {LEGAL_NEEDS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('legalNeed', opt.value)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                  form.legalNeed === opt.value ? 'border-teal-600 bg-teal-50 font-medium' : 'border-navy-200 hover:border-teal-400'
                }`}
              >
                {opt.label[lang]}
              </button>
            ))}
          </div>
          {renderError('legalNeed')}
        </div>
      )}

      {step === 'urgency' && (
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">{t.step3h}</h2>
          <p className="text-navy-600 mb-6 text-sm">{t.step3p}</p>
          <div className="grid grid-cols-2 gap-3">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('urgency', opt.value)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  form.urgency === opt.value ? 'border-teal-600 bg-teal-50 font-semibold' : 'border-navy-200 hover:border-teal-400'
                }`}
              >
                {opt.label[lang]}
              </button>
            ))}
          </div>
          {renderError('urgency')}
        </div>
      )}

      {step === 'context' && (
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">{t.step4h}</h2>
          <p className="text-navy-600 mb-6 text-sm">{t.step4p}</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="org" className="block text-sm font-medium text-navy-700 mb-1">{t.orgLabel}</label>
              <input id="org" type="text" value={form.organizationName} onChange={(e) => update('organizationName', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              {renderError('organizationName')}
            </div>
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-navy-700 mb-1">{t.sizeLabel}</label>
              <input id="size" type="text" placeholder={t.sizePlaceholder} value={form.teamSize} onChange={(e) => update('teamSize', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-navy-700 mb-1">{t.descLabel}</label>
              <textarea id="desc" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              {renderError('description')}
            </div>
            <div>
              <label htmlFor="docs" className="block text-sm font-medium text-navy-700 mb-1">{t.docsLabel}</label>
              <input id="docs" type="text" placeholder={t.docsPlaceholder} value={form.documentCount} onChange={(e) => update('documentCount', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
          </div>
        </div>
      )}

      {step === 'contact' && (
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">{t.step5h}</h2>
          <p className="text-navy-600 mb-6 text-sm">{t.step5p}</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="fname" className="block text-sm font-medium text-navy-700 mb-1">{t.fnameLabel}</label>
              <input id="fname" type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              {renderError('firstName')}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-1">{t.emailLabel}</label>
              <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              {renderError('email')}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-navy-700 mb-1">{t.roleLabel}</label>
              <input id="role" type="text" value={form.role} onChange={(e) => update('role', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <input type="text" name="website" value={form.honeypot} onChange={(e) => update('honeypot', e.target.value)} className="absolute -left-[9999px] opacity-0" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="flex items-start gap-2">
              <input id="consent" type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} className="mt-1 w-4 h-4 rounded border-navy-300 text-teal-600 focus:ring-teal-500" />
              <label htmlFor="consent" className="text-sm text-navy-600">
                {t.consentLabel}
              </label>
            </div>
            {renderError('consent')}
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-3">{t.resultH}</h2>
          <p className="text-navy-600 mb-6">{result.recommendation}</p>

          <div className="bg-navy-50 rounded-xl p-6 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-navy-500">{t.roleField}</span> <span className="font-medium text-navy-800">{form.icp && (lang === 'es' ? ICP_LABELS_ES[form.icp as ICPKey] : ICP_CONTENT[form.icp as ICPKey]?.label)}</span></div>
              <div><span className="text-navy-500">{t.needField}</span> <span className="font-medium text-navy-800">{LEGAL_NEEDS.find(n => n.value === form.legalNeed)?.label[lang]}</span></div>
              <div><span className="text-navy-500">{t.urgencyField}</span> <span className="font-medium text-navy-800 capitalize">{URGENCY_OPTIONS.find(o => o.value === form.urgency)?.label[lang]}</span></div>
              <div><span className="text-navy-500">{t.scoreField}</span> <span className="font-medium text-navy-800">{result.score}/100</span></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            {result.score >= 50 ? (
              <CTAButton text={t.priorityCta} to="/schedule-demo" variant="primary" size="lg" trackEvent="demo_click" />
            ) : (
              <CTAButton text={t.checklistCta} to="/resources/legal-readiness-checklist" variant="primary" size="lg" trackEvent="checklist_download" />
            )}
          </div>

          {result.method === 'localStorage' && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3 mb-4">
              {t.localNote}
            </p>
          )}

          <div className="flex items-start gap-2 text-xs text-navy-500 bg-navy-50 rounded-lg p-3">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{t.disclaimer}</p>
          </div>
        </div>
      )}

      {step !== 'result' && (
        <div className="flex justify-between mt-8">
          {currentIndex > 0 ? (
            <button type="button" onClick={prev} className="flex items-center gap-2 text-navy-600 hover:text-navy-800 font-medium">
              <ArrowLeft className="w-4 h-4" /> {t.back}
            </button>
          ) : <div />}
          {step === 'contact' ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {t.submit}
            </button>
          ) : (
            <button type="button" onClick={next} className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all">
              {t.cont} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
