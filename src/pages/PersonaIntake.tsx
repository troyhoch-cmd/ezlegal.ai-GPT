import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import {
  User, Building2, Users, ArrowRight, ArrowLeft,
  Shield, AlertTriangle, Clock, Globe, Heart, CheckCircle,
  Search, MapPin, Save, X, DollarSign
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ReferralConsentCard from '../components/ReferralConsentCard';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEvent } from '../services/analytics-service';
import { trackReviewScreenViewed } from '../components/EthicalAnalytics';
import { US_STATES } from '../data/jurisdictions';
import { SCOPE_DISCLAIMER } from '../lib/intake/scopeBoundaries';

type Persona = 'individual' | 'business' | 'organization';
type Step = 'who' | 'what' | 'urgency' | 'affordability' | 'state' | 'results';
type AffordabilityLevel = 'cannot-pay' | 'low-cost' | 'can-pay';

const TRIAGE_STORAGE_KEY = 'ezlegal_triage_context';
const TRIAGE_DRAFT_KEY = 'ezlegal_triage_draft';
const STATE_STORAGE_KEY = 'ezlegal_state';

const INDIVIDUAL_ISSUES = [
  { id: 'housing', label: 'Housing or eviction', labelEs: 'Vivienda o desalojo', urgent: true },
  { id: 'debt', label: 'Debt or consumer problem', labelEs: 'Deuda o problema de consumo', urgent: false },
  { id: 'family', label: 'Family or safety concern', labelEs: 'Familia o preocupación de seguridad', urgent: true },
  { id: 'immigration', label: 'Immigration', labelEs: 'Inmigración', urgent: true },
  { id: 'employment', label: 'Employment', labelEs: 'Empleo', urgent: false },
  { id: 'court', label: 'Court papers or deadline', labelEs: 'Documentos del tribunal o fecha límite', urgent: true },
  { id: 'other', label: 'Not sure', labelEs: 'No estoy seguro/a', urgent: false },
];

const BUSINESS_ISSUES = [
  { id: 'contract', label: 'Contract or lease', labelEs: 'Contrato o arrendamiento', urgent: false },
  { id: 'employee', label: 'Employee or contractor issue', labelEs: 'Empleado o contratista', urgent: false },
  { id: 'compliance', label: 'Compliance or licensing', labelEs: 'Cumplimiento o licencias', urgent: false },
  { id: 'dispute', label: 'Demand letter or dispute', labelEs: 'Carta de demanda o disputa', urgent: true },
  { id: 'formation', label: 'Business formation', labelEs: 'Formación de negocio', urgent: false },
  { id: 'collections', label: 'Debt, invoice, or collections', labelEs: 'Deuda, factura o cobranzas', urgent: false },
  { id: 'other', label: 'Not sure', labelEs: 'No estoy seguro/a', urgent: false },
];

const ORG_ISSUES = [
  { id: 'intake', label: 'Client intake', labelEs: 'Admisión de clientes', urgent: false },
  { id: 'referral', label: 'Referral routing', labelEs: 'Flujo de referencias', urgent: false },
  { id: 'documents', label: 'Document preparation', labelEs: 'Preparación de documentos', urgent: false },
  { id: 'rights', label: 'Know-your-rights materials', labelEs: 'Materiales de derechos', urgent: false },
  { id: 'reporting', label: 'Reporting / outcomes', labelEs: 'Informes / resultados', urgent: false },
  { id: 'other', label: 'Not sure', labelEs: 'No estoy seguro/a', urgent: false },
];

type UrgencyLevel = 'court-date' | 'unsafe' | 'legal-papers' | 'detention' | 'eviction-lockout' | 'custody-emergency' | 'soon' | 'none';

const URGENCY_OPTIONS: { id: UrgencyLevel; label: string; labelEs: string; isHighRisk: boolean; icon: typeof Clock }[] = [
  { id: 'court-date', label: 'I have a court date or deadline', labelEs: 'Tengo una fecha de tribunal o plazo', isHighRisk: true, icon: Clock },
  { id: 'unsafe', label: 'I may be unsafe or in danger', labelEs: 'Puedo estar en peligro', isHighRisk: true, icon: AlertTriangle },
  { id: 'eviction-lockout', label: 'I am being evicted or locked out', labelEs: 'Me están desalojando o impidiendo entrar', isHighRisk: true, icon: AlertTriangle },
  { id: 'detention', label: 'Immigration detention or criminal arrest', labelEs: 'Detención migratoria o arresto criminal', isHighRisk: true, icon: AlertTriangle },
  { id: 'custody-emergency', label: 'Custody emergency or child safety', labelEs: 'Emergencia de custodia o seguridad de menores', isHighRisk: true, icon: AlertTriangle },
  { id: 'legal-papers', label: 'I received legal papers', labelEs: 'Recibí documentos legales', isHighRisk: true, icon: Clock },
  { id: 'soon', label: 'I need help soon but not today', labelEs: 'Necesito ayuda pronto pero no hoy', isHighRisk: false, icon: Clock },
  { id: 'none', label: 'Not urgent / just exploring', labelEs: 'No es urgente / solo estoy explorando', isHighRisk: false, icon: Shield },
];

const AFFORDABILITY_OPTIONS: { id: AffordabilityLevel; label: string; labelEs: string; icon: typeof DollarSign }[] = [
  { id: 'cannot-pay', label: 'I cannot pay for legal help', labelEs: 'No puedo pagar por ayuda legal', icon: Heart },
  { id: 'low-cost', label: 'I need low-cost options', labelEs: 'Necesito opciones de bajo costo', icon: DollarSign },
  { id: 'can-pay', label: 'I can pay if needed', labelEs: 'Puedo pagar si es necesario', icon: DollarSign },
];

function getIssues(persona: Persona) {
  if (persona === 'individual') return INDIVIDUAL_ISSUES;
  if (persona === 'business') return BUSINESS_ISSUES;
  return ORG_ISSUES;
}

function getIssueLabel(persona: Persona, issueId: string, en: boolean) {
  const issues = getIssues(persona);
  const found = issues.find((i) => i.id === issueId);
  return found ? (en ? found.label : found.labelEs) : issueId;
}

interface TriageDraft {
  persona?: Persona | null;
  issue?: string | null;
  urgency?: UrgencyLevel | null;
  affordability?: AffordabilityLevel | null;
  state?: string | null;
  step?: Step;
}

function loadDraft(): TriageDraft | null {
  try {
    const raw = sessionStorage.getItem(TRIAGE_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveDraft(draft: TriageDraft) {
  try { sessionStorage.setItem(TRIAGE_DRAFT_KEY, JSON.stringify(draft)); } catch { /* ignore */ }
}

function clearDraft() {
  try { sessionStorage.removeItem(TRIAGE_DRAFT_KEY); } catch { /* ignore */ }
}

function loadSavedState(): string | null {
  try { return sessionStorage.getItem(STATE_STORAGE_KEY); } catch { return null; }
}

export default function PersonaIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam === 'es') setLanguage('es');
    const from = (location.state as { from?: string } | null)?.from;
    if (from === '/espanol' || from === '/es') setLanguage('es');
    const pathParam = searchParams.get('path');
    if (pathParam === 'legal-aid' && !persona) {
      setPersona('individual');
      setStep('what');
    } else if (pathParam === 'smb' && !persona) {
      setPersona('business');
      setStep('what');
    } else if (pathParam === 'organizations' && !persona) {
      setPersona('organization');
      setStep('what');
    }
  }, [searchParams, setLanguage, location.state]);

  const en = language === 'en';

  const [showResume, setShowResume] = useState(false);
  const [step, setStep] = useState<Step>('who');
  const [persona, setPersona] = useState<Persona | null>(null);
  const [issue, setIssue] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<UrgencyLevel | null>(null);
  const [affordability, setAffordability] = useState<AffordabilityLevel | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(loadSavedState);
  const [stateSearch, setStateSearch] = useState('');

  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.persona && draft.step && draft.step !== 'who') {
      setShowResume(true);
    }
  }, []);

  const handleResume = () => {
    const draft = loadDraft();
    if (draft) {
      setPersona(draft.persona || null);
      setIssue(draft.issue || null);
      setUrgency(draft.urgency || null);
      setAffordability(draft.affordability || null);
      setSelectedState(draft.state || loadSavedState());
      setStep(draft.step || 'who');
    }
    setShowResume(false);
  };

  const handleStartOver = () => {
    clearDraft();
    setShowResume(false);
    setStep('who');
    setPersona(null);
    setIssue(null);
    setUrgency(null);
    setAffordability(null);
  };

  const stepNumber = step === 'who' ? 1 : step === 'what' ? 2 : step === 'urgency' ? 3 : step === 'affordability' ? 4 : step === 'state' ? (persona === 'individual' ? 5 : 4) : 5;
  const totalSteps = persona === 'individual' ? 5 : 4;
  const progressPercent = step === 'results' ? 100 : (stepNumber / totalSteps) * 100;

  const handlePersonaSelect = (p: Persona) => {
    setPersona(p);
    saveDraft({ persona: p, step: 'what' });
    trackEvent('triage_persona_selected', { persona: p });
    setStep('what');
  };

  const handleIssueSelect = (issueId: string) => {
    setIssue(issueId);
    saveDraft({ persona, issue: issueId, step: 'urgency' });
    trackEvent('triage_issue_selected', { issue: issueId });
    setStep('urgency');
  };

  const handleUrgencySelect = (u: UrgencyLevel) => {
    setUrgency(u);
    trackEvent('triage_urgency_selected', { urgency: u });
    if (persona === 'individual') {
      saveDraft({ persona, issue, urgency: u, step: 'affordability' });
      setStep('affordability');
    } else {
      saveDraft({ persona, issue, urgency: u, step: 'state' });
      setStep('state');
    }
  };

  const handleAffordabilitySelect = (a: AffordabilityLevel) => {
    setAffordability(a);
    saveDraft({ persona, issue, urgency, affordability: a, step: 'state' });
    setStep('state');
  };

  const handleStateSelect = (code: string | null) => {
    setSelectedState(code);
    if (code) {
      try { sessionStorage.setItem(STATE_STORAGE_KEY, code); } catch { /* ignore */ }
    }
    completeFlow(code);
  };

  const completeFlow = (state: string | null) => {
    clearDraft();
    const ctx = { persona, issue, urgency, state, language, ts: new Date().toISOString() };
    try { sessionStorage.setItem(TRIAGE_STORAGE_KEY, JSON.stringify(ctx)); } catch { /* ignore */ }
    trackEvent('triage_completed', { persona, issue, urgency, state });
    trackReviewScreenViewed();
    setStep('results');
  };

  const isHighRisk = urgency === 'court-date' || urgency === 'unsafe' || urgency === 'legal-papers' ||
    urgency === 'detention' || urgency === 'eviction-lockout' || urgency === 'custody-emergency' ||
    (issue && INDIVIDUAL_ISSUES.find((i) => i.id === issue)?.urgent && urgency !== 'none');

  const isDV = issue === 'family' && (urgency === 'unsafe' || urgency === 'court-date');
  const isImmigration = issue === 'immigration';

  const goBack = () => {
    if (step === 'results') setStep('state');
    else if (step === 'state') setStep(persona === 'individual' ? 'affordability' : 'urgency');
    else if (step === 'affordability') setStep('urgency');
    else if (step === 'urgency') setStep('what');
    else if (step === 'what') setStep('who');
  };

  const handleSaveAndExit = () => {
    saveDraft({ persona, issue, urgency, affordability, state: selectedState, step });
    navigate('/');
  };

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return US_STATES;
    const q = stateSearch.toLowerCase();
    return US_STATES.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [stateSearch]);

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col">
      <Navigation />

      <main id="main-content" className="flex-1 pt-20">
        {showResume && (
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <p className="text-sm text-teal-800 flex-1">
                {en ? 'You have an unfinished question. Resume or start over?' : 'Tienes una pregunta sin terminar. ¿Continuar o empezar de nuevo?'}
              </p>
              <div className="flex gap-2">
                <button onClick={handleResume} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                  {en ? 'Resume' : 'Continuar'}
                </button>
                <button onClick={handleStartOver} className="px-3 py-1.5 border border-teal-300 text-teal-700 text-xs font-semibold rounded-lg hover:bg-teal-100 transition-colors">
                  {en ? 'Start over' : 'Empezar de nuevo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step !== 'results' && (
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">
                {en ? `Step ${stepNumber} of ${totalSteps}` : `Paso ${stepNumber} de ${totalSteps}`}
              </span>
              <div className="flex items-center gap-3">
                {step !== 'who' && (
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
                  >
                    <ArrowLeft className="w-3 h-3" /> {en ? 'Back' : 'Atrás'}
                  </button>
                )}
                {step !== 'who' && (
                  <button
                    onClick={handleSaveAndExit}
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 transition"
                    title={en ? 'Save and finish later' : 'Guardar y terminar después'}
                  >
                    <Save className="w-3 h-3" /> {en ? 'Save' : 'Guardar'}
                  </button>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Step 1: Who */}
          {step === 'who' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-center mb-2">
                {en ? 'Who needs help?' : '¿Quién necesita ayuda?'}
              </h1>
              <p className="text-center text-slate-600 mb-2">
                {en ? 'This helps us show you the right options.' : 'Esto nos ayuda a mostrarte las opciones correctas.'}
              </p>
              <p className="text-center text-xs text-slate-500 mb-8">
                {en ? 'Not a law firm. Not legal advice. No account needed.' : 'No es un bufete. No es asesoría legal. Sin necesidad de cuenta.'}
              </p>
              <div className="grid gap-3">
                {([
                  { id: 'individual' as const, icon: User, label: 'Individual or family', labelEs: 'Persona o familia', desc: en ? 'Housing, family, debt, employment, immigration' : 'Vivienda, familia, deuda, empleo, inmigración' },
                  { id: 'business' as const, icon: Building2, label: 'Small business', labelEs: 'Pequeño negocio', desc: en ? 'Contracts, employees, compliance, disputes' : 'Contratos, empleados, cumplimiento, disputas' },
                  { id: 'organization' as const, icon: Users, label: 'Legal aid or community organization', labelEs: 'Organización legal o comunitaria', desc: en ? 'Intake, triage, referrals, partner tools' : 'Admisión, triaje, referencias, herramientas' },
                ]).map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePersonaSelect(p.id)}
                      className="flex items-center gap-4 w-full p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left group"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-700 shrink-0 group-hover:bg-teal-100 transition">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900">{en ? p.label : p.labelEs}</p>
                        <p className="text-sm text-slate-500">{p.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-teal-600 transition" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: What issue */}
          {step === 'what' && persona && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">
                {en ? 'What kind of issue is this?' : '¿Qué tipo de problema es?'}
              </h2>
              <p className="text-center text-slate-600 mb-8">
                {en ? 'Pick the closest match.' : 'Elige la opción más cercana.'}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {getIssues(persona).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleIssueSelect(item.id)}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left font-medium text-slate-800"
                  >
                    {en ? item.label : item.labelEs}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Urgency */}
          {step === 'urgency' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">
                {en ? 'Is anything urgent?' : '¿Hay algo urgente?'}
              </h2>
              <p className="text-center text-slate-600 mb-8">
                {en ? 'This helps us prioritize the right information.' : 'Esto nos ayuda a priorizar la información correcta.'}
              </p>
              <div className="grid gap-3">
                {URGENCY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleUrgencySelect(opt.id)}
                      className={`flex items-center gap-4 w-full p-4 bg-white rounded-xl border transition-all text-left ${
                        opt.isHighRisk ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-teal-300'
                      } hover:shadow-md`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${opt.isHighRisk ? 'text-amber-600' : 'text-slate-400'}`} aria-hidden="true" />
                      <span className="font-medium text-slate-800">{en ? opt.label : opt.labelEs}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4 (individuals only): Affordability */}
          {step === 'affordability' && persona === 'individual' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">
                {en ? 'Can you pay for legal help?' : '¿Puedes pagar por ayuda legal?'}
              </h2>
              <p className="text-center text-slate-600 mb-8">
                {en ? 'This helps us show the right resources first.' : 'Esto nos ayuda a mostrar los recursos correctos primero.'}
              </p>
              <div className="grid gap-3">
                {AFFORDABILITY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAffordabilitySelect(opt.id)}
                      className="flex items-center gap-4 w-full p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left"
                    >
                      <Icon className="w-5 h-5 shrink-0 text-teal-600" aria-hidden="true" />
                      <span className="font-medium text-slate-800">{en ? opt.label : opt.labelEs}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: State */}
          {step === 'state' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">
                {en ? 'What state are you in?' : '¿En qué estado estás?'}
              </h2>
              <p className="text-center text-slate-600 mb-6">
                {en ? 'Laws vary by state. This helps us give better information.' : 'Las leyes varían por estado. Esto nos ayuda a dar mejor información.'}
              </p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  type="text"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  placeholder={en ? 'Search states...' : 'Buscar estados...'}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  autoFocus
                />
                {stateSearch && (
                  <button
                    onClick={() => setStateSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={en ? 'Clear search' : 'Borrar búsqueda'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl mb-4">
                {filteredStates.map((s) => (
                  <button
                    key={s.code}
                    onClick={() => handleStateSelect(s.code)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm border-b border-slate-100 last:border-0 transition-colors ${
                      selectedState === s.code ? 'bg-teal-50 text-teal-800 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    {s.name}
                    {selectedState === s.code && <CheckCircle className="w-4 h-4 text-teal-600 ml-auto" aria-hidden="true" />}
                  </button>
                ))}
                {filteredStates.length === 0 && (
                  <p className="px-4 py-3 text-sm text-slate-500">{en ? 'No states match your search.' : 'Ningún estado coincide con tu búsqueda.'}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStateSelect(null)}
                  className="w-full p-3 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-left"
                >
                  {en ? "I'm not sure / it may be federal or immigration-related" : 'No estoy seguro/a / puede ser federal o de inmigración'}
                </button>
              </div>

              {!selectedState && (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  {en
                    ? 'Laws can vary by state. We can still help you understand the issue, but results may be more general.'
                    : 'Las leyes pueden variar por estado. Aún podemos ayudarte a entender el problema, pero los resultados pueden ser más generales.'}
                </p>
              )}
            </div>
          )}

          {/* Results */}
          {step === 'results' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-teal-600" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-black mb-2">
                  {en ? 'Here is what we recommend' : 'Esto es lo que recomendamos'}
                </h2>
              </div>

              {/* Safety warning for DV */}
              {isDV && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-red-900 text-sm mb-1">
                        {en ? 'Safety notice' : 'Aviso de seguridad'}
                      </p>
                      <p className="text-xs text-red-800">
                        {en
                          ? 'If someone monitors your device, consider using a safer device before saving or searching. Call 911 for immediate danger, or the National DV Hotline: 1-800-799-7233.'
                          : 'Si alguien vigila su dispositivo, considere usar un dispositivo más seguro antes de guardar o buscar. Llame al 911 para peligro inmediato, o a la Línea Nacional de Violencia Doméstica: 1-800-799-7233.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Immigration warning */}
              {isImmigration && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-blue-900 text-sm mb-1">
                        {en ? 'Immigration matters require qualified help' : 'Los asuntos de inmigración requieren ayuda calificada'}
                      </p>
                      <p className="text-xs text-blue-800">
                        {en
                          ? 'Immigration law is complex and errors can have serious consequences. We encourage you to contact an accredited immigration attorney or BIA-recognized organization before taking action.'
                          : 'La ley de inmigración es compleja y los errores pueden tener consecuencias serias. Le animamos a contactar a un abogado de inmigración acreditado o una organización reconocida por la BIA antes de tomar acción.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-2">{en ? 'What we understood' : 'Lo que entendimos'}</h3>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">{en ? 'Issue:' : 'Problema:'}</span>{' '}
                  {persona && issue ? getIssueLabel(persona, issue, en) : (en ? 'General' : 'General')}
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  <span className="font-semibold">{en ? 'Urgency:' : 'Urgencia:'}</span>{' '}
                  {URGENCY_OPTIONS.find((o) => o.id === urgency)?.[en ? 'label' : 'labelEs'] || '-'}
                </p>
                {selectedState && (
                  <p className="text-sm text-slate-700 mt-1">
                    <span className="font-semibold">{en ? 'State:' : 'Estado:'}</span>{' '}
                    {US_STATES.find((s) => s.code === selectedState)?.name || selectedState}
                  </p>
                )}
                <p className="text-sm text-slate-700 mt-1">
                  <span className="font-semibold">{en ? 'Language:' : 'Idioma:'}</span>{' '}
                  {en ? 'English' : 'Espa\u00f1ol'}
                </p>
              </div>

              {/* Referral consent for organization handoff */}
              {persona === 'organization' && (
                <div className="mb-6">
                  <ReferralConsentCard onConsent={(consented) => {
                    trackEvent('referral_consent_decision', { consented: String(consented) });
                  }} />
                </div>
              )}

              {/* High-risk warning */}
              {isHighRisk && !isDV && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-amber-900 text-sm mb-1">
                        {en ? 'Talk to a qualified legal professional or legal aid provider if possible.' : 'Hable con un profesional legal calificado o proveedor de ayuda legal si es posible.'}
                      </p>
                      <p className="text-xs text-amber-800">
                        {en
                          ? 'Your situation may involve deadlines or safety concerns that require professional help.'
                          : 'Su situación puede involucrar plazos o preocupaciones de seguridad que requieren ayuda profesional.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action cards */}
              <div className="grid gap-3">
                {isHighRisk && (
                  <Link
                    to="/urgent-resources"
                    className="flex items-center gap-4 w-full p-5 bg-amber-50 rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-left group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-600 text-white shrink-0">
                      <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-amber-900">{en ? 'Get urgent resources' : 'Obtener recursos urgentes'}</p>
                      <p className="text-sm text-amber-700">{en ? 'Hotlines, legal aid, and emergency help' : 'Líneas de ayuda, asistencia legal y ayuda de emergencia'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600" />
                  </Link>
                )}

                {/* Individuals: free help first (especially if cannot pay), then general info */}
                {persona === 'individual' && (
                  <>
                    <Link
                      to={affordability === 'cannot-pay' ? '/pro-bono' : '/find-attorney'}
                      className={`flex items-center gap-4 w-full p-5 rounded-xl border hover:shadow-md transition-all text-left group ${
                        isHighRisk ? 'bg-white border-slate-200 hover:border-teal-300' : 'bg-teal-50 border-teal-200 hover:border-teal-400'
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${isHighRisk ? 'bg-teal-100 text-teal-700' : 'bg-teal-700 text-white'}`}>
                        <Heart className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{en ? 'Find free or low-cost help' : 'Encontrar ayuda gratuita o de bajo costo'}</p>
                        <p className="text-sm text-slate-600">
                          {affordability === 'cannot-pay'
                            ? (en ? 'Pro bono and legal aid resources' : 'Recursos pro bono y de ayuda legal')
                            : (en ? 'Legal aid and community resources near you' : 'Ayuda legal y recursos comunitarios cerca de ti')}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                    </Link>
                    <Link
                      to="/chat"
                      className="flex items-center gap-4 w-full p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left group"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{en ? 'Continue with general legal information' : 'Continuar con información legal general'}</p>
                        <p className="text-sm text-slate-600">{en ? 'Ask questions and get plain-language guidance' : 'Haz preguntas y obtén orientación en lenguaje simple'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                    </Link>
                  </>
                )}

                {/* SMBs: Start business chat + optional attorney review */}
                {persona === 'business' && (
                  <>
                    <Link
                      to="/chat"
                      className={`flex items-center gap-4 w-full p-5 rounded-xl border hover:shadow-md transition-all text-left group ${
                        isHighRisk ? 'bg-white border-slate-200 hover:border-teal-300' : 'bg-teal-50 border-teal-200 hover:border-teal-400'
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${isHighRisk ? 'bg-slate-100 text-slate-700' : 'bg-teal-700 text-white'}`}>
                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{en ? 'Start business chat' : 'Iniciar chat de negocio'}</p>
                        <p className="text-sm text-slate-600">{en ? 'Contracts, compliance, and dispute guidance' : 'Contratos, cumplimiento y orientación de disputas'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                    </Link>
                    <Link
                      to="/find-attorney"
                      className="flex items-center gap-4 w-full p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left group"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                        <Users className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{en ? 'Optional attorney review' : 'Revisión de abogado opcional'}</p>
                        <p className="text-sm text-slate-600">{en ? 'Get professional help when needed' : 'Obtener ayuda profesional cuando sea necesario'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                    </Link>
                  </>
                )}

                {/* Organizations: Book partner demo + View governance */}
                {persona === 'organization' && (
                  <>
                    <Link
                      to="/partner-dashboard-demo"
                      className={`flex items-center gap-4 w-full p-5 rounded-xl border hover:shadow-md transition-all text-left group ${
                        isHighRisk ? 'bg-white border-slate-200 hover:border-teal-300' : 'bg-teal-50 border-teal-200 hover:border-teal-400'
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${isHighRisk ? 'bg-slate-100 text-slate-700' : 'bg-teal-700 text-white'}`}>
                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{en ? 'Book partner demo' : 'Reservar demo de socios'}</p>
                        <p className="text-sm text-slate-600">{en ? 'Intake, triage, and referral tools' : 'Herramientas de admisión, triaje y referencia'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                    </Link>
                    <Link
                      to="/ai-governance"
                      className="flex items-center gap-4 w-full p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left group"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                        <Shield className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{en ? 'View governance' : 'Ver gobernanza'}</p>
                        <p className="text-sm text-slate-600">{en ? 'AI safety and compliance framework' : 'Marco de seguridad y cumplimiento de IA'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                    </Link>
                    <Link
                      to="/contact?subject=partnerships"
                      className="flex items-center gap-4 w-full p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left group"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                        <Users className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{en ? 'Talk to partnerships team' : 'Hablar con equipo de alianzas'}</p>
                        <p className="text-sm text-slate-600">{en ? 'Schedule a call or request information' : 'Programar una llamada o solicitar información'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                    </Link>
                  </>
                )}
              </div>

              {/* Scope disclaimer */}
              <p className="mt-6 text-center text-xs text-slate-500 max-w-md mx-auto">
                {en ? SCOPE_DISCLAIMER.en : SCOPE_DISCLAIMER.es}
              </p>
            </div>
          )}

          {/* Footer disclaimer */}
          {step !== 'results' && (
            <div className="mt-10">
              <p className="text-center text-xs text-slate-500 max-w-md mx-auto">
                {en
                  ? 'This tool provides legal information, not legal advice. Not a law firm.'
                  : 'Esta herramienta provee información legal, no asesoría legal. No es un bufete.'}
              </p>
              {step !== 'who' && (
                <p className="text-center text-xs text-slate-400 mt-2">
                  {en ? 'Only save details on a device you trust.' : 'Solo guarde detalles en un dispositivo de confianza.'}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
