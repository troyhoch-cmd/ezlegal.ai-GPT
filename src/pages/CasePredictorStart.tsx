import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ArrowLeft, Shield, AlertTriangle,
  Scale, FileText, Clock, CheckCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { US_STATES } from '../data/jurisdictions';

const CASE_TYPES = [
  { id: 'housing', en: 'Housing / Eviction', es: 'Vivienda / Desalojo', icon: '🏠' },
  { id: 'employment', en: 'Employment / Wages', es: 'Empleo / Salarios', icon: '💼' },
  { id: 'family', en: 'Family / Custody', es: 'Familia / Custodia', icon: '👨‍👩‍👧' },
  { id: 'debt', en: 'Debt / Collections', es: 'Deudas / Cobranzas', icon: '💳' },
  { id: 'consumer', en: 'Consumer Protection', es: 'Proteccion al Consumidor', icon: '🛒' },
  { id: 'personal_injury', en: 'Personal Injury', es: 'Lesiones Personales', icon: '🏥' },
  { id: 'small_claims', en: 'Small Claims', es: 'Reclamos Menores', icon: '⚖️' },
  { id: 'other', en: 'Other Civil Matter', es: 'Otro Asunto Civil', icon: '📋' },
];

const URGENCY_OPTIONS = [
  { id: 'exploring', en: 'Just exploring options', es: 'Solo explorando opciones' },
  { id: 'weeks', en: 'I have weeks to decide', es: 'Tengo semanas para decidir' },
  { id: 'days', en: 'Deadline within days', es: 'Fecha limite en dias' },
  { id: 'immediate', en: 'Immediate / Emergency', es: 'Inmediato / Emergencia' },
];

export default function CasePredictorStart() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [caseType, setCaseType] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [urgency, setUrgency] = useState('');
  const [briefDescription, setBriefDescription] = useState('');

  const isHighRiskUrgency = urgency === 'days' || urgency === 'immediate';
  const isHighRiskCaseType = ['family'].includes(caseType);

  const handleSubmit = () => {
    const caseLabel = CASE_TYPES.find(c => c.id === caseType)?.[language === 'en' ? 'en' : 'es'] || caseType;
    const stateLabel = US_STATES.find(s => s.code === jurisdiction)?.name || jurisdiction;
    const prefill = `I want to predict my case outcome. Case type: ${caseLabel}. State: ${stateLabel}. ${briefDescription ? `Details: ${briefDescription}` : ''}`;
    try {
      sessionStorage.setItem('ez_chatbot_prefill', prefill);
    } catch {
      // storage disabled
    }
    navigate('/chat');
  };

  const canProceed = () => {
    if (step === 1) return caseType !== '';
    if (step === 2) return jurisdiction !== '';
    if (step === 3) return urgency !== '';
    return true;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="pt-[73px]">
        <div className="bg-gradient-to-br from-teal-800 to-teal-900 py-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-teal-100 mb-4">
              <Sparkles className="w-4 h-4 text-gold-300" />
              {language === 'en' ? 'AI CASE PREDICTOR' : 'PREDICTOR DE CASOS IA'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'Get Your Case Prediction' : 'Obtener Tu Prediccion de Caso'}
            </h1>
            <p className="text-teal-100 max-w-xl mx-auto">
              {language === 'en'
                ? 'Answer a few quick questions so we can provide the most accurate prediction for your situation.'
                : 'Responde unas preguntas rapidas para darte la prediccion mas precisa para tu situación.'}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <nav aria-label={language === 'en' ? 'Prediction wizard progress' : 'Progreso del asistente de prediccion'}>
            <ol className="flex items-center justify-between mb-8">
              {([
                { num: 1, label: language === 'en' ? 'Case Type' : 'Tipo de Caso' },
                { num: 2, label: language === 'en' ? 'State' : 'Estado' },
                { num: 3, label: language === 'en' ? 'Urgency' : 'Urgencia' },
                { num: 4, label: language === 'en' ? 'Details' : 'Detalles' },
              ]).map((s) => (
                <li
                  key={s.num}
                  className="flex items-center flex-1"
                  aria-current={s.num === step ? 'step' : undefined}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      s.num < step ? 'bg-teal-600 text-white' :
                      s.num === step ? 'bg-teal-600 text-white ring-4 ring-teal-100' :
                      'bg-navy-200 text-navy-500'
                    }`}
                    aria-label={`${s.label}: ${s.num < step ? (language === 'en' ? 'completed' : 'completado') : s.num === step ? (language === 'en' ? 'current step' : 'paso actual') : (language === 'en' ? 'upcoming' : 'pendiente')}`}
                  >
                    {s.num < step ? <CheckCircle className="w-4 h-4" /> : s.num}
                  </div>
                  {s.num < 4 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${s.num < step ? 'bg-teal-500' : 'bg-navy-200'}`} aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">
                {language === 'en' ? 'What type of case do you have?' : 'Que tipo de caso tienes?'}
              </h2>
              <p className="text-navy-500 text-sm mb-6">
                {language === 'en' ? 'Select the category that best describes your situation.' : 'Selecciona la categoria que mejor describe tu situación.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CASE_TYPES.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => setCaseType(ct.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      caseType === ct.id
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : 'border-navy-200 hover:border-teal-300 hover:bg-navy-50'
                    }`}
                  >
                    <span className="text-2xl">{ct.icon}</span>
                    <span className="text-sm font-semibold text-navy-900">
                      {language === 'en' ? ct.en : ct.es}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">
                {language === 'en' ? 'What state is your case in?' : 'En que estado esta tu caso?'}
              </h2>
              <p className="text-navy-500 text-sm mb-6">
                {language === 'en' ? 'Case outcomes vary significantly by jurisdiction. This helps us find the most relevant data.' : 'Los resultados varian por jurisdicción. Esto nos ayuda a encontrar datos relevantes.'}
              </p>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full p-4 border-2 border-navy-200 rounded-xl text-navy-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              >
                <option value="">{language === 'en' ? 'Select your state...' : 'Selecciona tu estado...'}</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">
                {language === 'en' ? 'How urgent is your situation?' : 'Que tan urgente es tu situación?'}
              </h2>
              <p className="text-navy-500 text-sm mb-6">
                {language === 'en' ? 'This helps us prioritize the right guardrails for your prediction.' : 'Esto nos ayuda a priorizar las protecciones correctas para tu prediccion.'}
              </p>
              <div className="space-y-3">
                {URGENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setUrgency(opt.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      urgency === opt.id
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : 'border-navy-200 hover:border-teal-300 hover:bg-navy-50'
                    }`}
                  >
                    <Clock className={`w-5 h-5 flex-shrink-0 ${urgency === opt.id ? 'text-teal-600' : 'text-navy-400'}`} />
                    <span className="text-sm font-semibold text-navy-900">
                      {language === 'en' ? opt.en : opt.es}
                    </span>
                  </button>
                ))}
              </div>

              {isHighRiskUrgency && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800 mb-1">
                        {language === 'en' ? 'Important: Predictions take time and are not real-time legal advice' : 'Importante: Las predicciones toman tiempo y no son asesoria legal en tiempo real'}
                      </p>
                      <p className="text-xs text-red-700 mb-2">
                        {language === 'en'
                          ? 'If you have an imminent court date or filing deadline, we strongly recommend contacting an attorney immediately rather than relying on a prediction.'
                          : 'Si tienes una fecha de corte inminente, recomendamos contactar un abogado inmediatamente.'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Link to="/find-attorney" className="text-xs text-red-700 underline font-bold hover:text-red-900">
                          {language === 'en' ? 'Find an attorney now' : 'Encontrar abogado ahora'}
                        </Link>
                        <span className="text-red-300">|</span>
                        <Link to="/pro-bono" className="text-xs text-red-700 underline font-bold hover:text-red-900">
                          {language === 'en' ? 'Pro bono options' : 'Opciones pro bono'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isHighRiskCaseType && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-1">
                        {language === 'en' ? 'Family / Custody cases involve high judicial discretion' : 'Casos de familia/custodia involucran alta discrecion judicial'}
                      </p>
                      <p className="text-xs text-amber-700">
                        {language === 'en'
                          ? 'Predictions for custody and family matters are less reliable because judges apply "best interest of the child" standards that vary widely. Consider the prediction as directional only.'
                          : 'Las predicciones para asuntos familiares son menos confiables. Considera la prediccion como direccional solamente.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">
                {language === 'en' ? 'Briefly describe your situation (optional)' : 'Describe brevemente tu situación (opcional)'}
              </h2>
              <p className="text-navy-500 text-sm mb-6">
                {language === 'en'
                  ? 'A few sentences about the key facts. More detail helps narrow the prediction range.'
                  : 'Unas oraciones sobre los hechos clave. Mas detalle ayuda a estrechar el rango.'}
              </p>
              <textarea
                value={briefDescription}
                onChange={(e) => setBriefDescription(e.target.value)}
                placeholder={language === 'en'
                  ? 'e.g., My landlord is trying to evict me for nonpayment, but I have repair requests that were ignored for 3 months...'
                  : 'ej., Mi arrendador intenta desalojarme por falta de pago, pero tengo solicitudes de reparacion ignoradas por 3 meses...'}
                className="w-full p-4 border-2 border-navy-200 rounded-xl text-navy-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all resize-none h-32"
                maxLength={500}
              />
              <p className="text-xs text-navy-400 mt-1 text-right">{briefDescription.length}/500</p>

              <div className="mt-6 bg-navy-50 border border-navy-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-navy-800 mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-teal-600" />
                  {language === 'en' ? 'Your prediction will include:' : 'Tu prediccion incluira:'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(language === 'en' ? [
                    'Probability range estimate',
                    'Key factors for/against',
                    'Similar case comparisons',
                    'Recommended next steps',
                  ] : [
                    'Estimacion de rango de probabilidad',
                    'Factores a favor/en contra',
                    'Comparaciones de casos similares',
                    'Próximos pasos recomendados',
                  ]).map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-navy-600">
                      <CheckCircle className="w-3 h-3 text-teal-600 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-xs text-navy-400 border-t border-navy-100 pt-4">
                <p>
                  {language === 'en'
                    ? 'Case Predictor provides a statistical estimate, not legal advice. It does not create an attorney-client relationship. '
                    : 'El Predictor proporciona una estimacion estadistica, no asesoria legal. No crea una relacion abogado-cliente. '}
                  <Link to="/scope-disclaimers" className="text-teal-600 underline">
                    {language === 'en' ? 'Full scope & disclaimers' : 'Alcance y descargos completos'}
                  </Link>
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-100">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 text-navy-600 hover:text-navy-900 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'en' ? 'Back' : 'Atras'}
              </button>
            ) : (
              <Link
                to="/case-predictor"
                className="flex items-center gap-2 text-navy-600 hover:text-navy-900 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'en' ? 'Back to overview' : 'Volver al resumen'}
              </Link>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:bg-navy-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                {language === 'en' ? 'Continue' : 'Continuar'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                {language === 'en' ? 'Get My Prediction' : 'Obtener Mi Prediccion'}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
