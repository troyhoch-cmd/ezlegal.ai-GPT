import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Lock, ArrowLeft, ArrowRight, Zap, Shield, CreditCard,
  Building2, Users, FileText, Download, Calendar, AlertTriangle, Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import usePersonaRouting from '../hooks/usePersonaRouting';
import { supabase } from '../lib/supabase';
import { clearPendingPlan, readPendingPlan, setPendingPlan } from '../lib/plan-context';
import { trackEvent } from '../services/analytics-service';
import AccessToJusticeScreening, { hasCompletedA2JScreening } from '../components/AccessToJusticeScreening';

type CheckoutStep = 'review' | 'payment' | 'confirmation';

const PRODUCT_DETAILS: Record<string, {
  name: { en: string; es: string };
  description: { en: string; es: string };
  includes: { en: string[]; es: string[] };
}> = {
  immigration: {
    name: { en: 'Immigration Help Pack', es: 'Paquete de Inmigracion' },
    description: { en: 'Complete action plan for immigration situations', es: 'Plan de accion completo para situaciones de inmigracion' },
    includes: {
      en: ['5-page action plan', 'Know Your Rights document', 'Emergency contacts', 'Deadline checklist', 'Attorney referral'],
      es: ['Plan de accion de 5 paginas', 'Documento de derechos', 'Contactos de emergencia', 'Lista de fechas', 'Referencia a abogado'],
    },
  },
  housing: {
    name: { en: 'Housing & Eviction Pack', es: 'Paquete de Vivienda' },
    description: { en: 'Eviction defense and tenant rights toolkit', es: 'Kit de defensa contra desalojo y derechos del inquilino' },
    includes: {
      en: ['Eviction response template', 'Tenant rights guide', 'Court prep checklist', 'Evidence guide', 'Attorney referral'],
      es: ['Plantilla de respuesta', 'Guia de derechos', 'Lista del tribunal', 'Guia de evidencia', 'Referencia a abogado'],
    },
  },
  family: {
    name: { en: 'Family Matters Pack', es: 'Paquete Familiar' },
    description: { en: 'Divorce, custody, and family court guidance', es: 'Orientación sobre divorcio, custodia y tribunal familiar' },
    includes: {
      en: ['Self-representation guide', 'Custody templates', 'Support calculator', 'Court prep', 'Attorney referral'],
      es: ['Guia de autorepresentacion', 'Plantillas de custodia', 'Calculadora', 'Preparacion', 'Referencia a abogado'],
    },
  },
  employment: {
    name: { en: 'Employment & Wages Pack', es: 'Paquete de Empleo' },
    description: { en: 'Wage claims and workplace rights tools', es: 'Herramientas de reclamos salariales y derechos laborales' },
    includes: {
      en: ['Wage claim guide', 'Demand letter templates', 'Evidence guide', 'Filing deadlines', 'Attorney referral'],
      es: ['Guia de reclamo', 'Plantillas de demanda', 'Guia de evidencia', 'Fechas limite', 'Referencia a abogado'],
    },
  },
  debt: {
    name: { en: 'Debt Defense Pack', es: 'Paquete de Deudas' },
    description: { en: 'Debt collection defense and negotiation tools', es: 'Herramientas de defensa contra cobro de deudas' },
    includes: {
      en: ['Validation letters', 'Response guide', 'Statute checker', 'Negotiation scripts', 'Attorney referral'],
      es: ['Cartas de validacion', 'Guia de respuesta', 'Verificador', 'Guiones', 'Referencia a abogado'],
    },
  },
  negotiation: {
    name: { en: 'Negotiation Strategy Planner', es: 'Planificador de Negociacion' },
    description: { en: 'AI-generated negotiation strategy document', es: 'Documento de estrategia generado por IA' },
    includes: {
      en: ['Opening scripts', 'Settlement calculator', 'Counter-offer strategies', 'Red flag detection', 'PDF strategy doc'],
      es: ['Guiones de apertura', 'Calculadora', 'Contraofertas', 'Deteccion de riesgos', 'Documento PDF'],
    },
  },
  predictor: {
    name: { en: 'AI Case Predictor', es: 'Predictor de Casos IA' },
    description: { en: 'Data-informed probability range for your case', es: 'Rango de probabilidad basado en datos para tu caso' },
    includes: {
      en: ['Probability range', 'Key factor analysis', 'Similar case comparisons', 'Recommended next steps'],
      es: ['Rango de probabilidad', 'Analisis de factores', 'Comparaciones de casos', 'Próximos pasos'],
    },
  },
};

const PRICES: Record<string, number> = {
  immigration: 39, housing: 29, family: 39, employment: 29, debt: 29, negotiation: 49, predictor: 4.99,
};

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isBusiness, isOrganization } = usePersonaRouting();
  const lang = language === 'en' ? 'en' : 'es';

  const queryPlan = searchParams.get('plan');
  const pending = readPendingPlan();
  const plan = queryPlan || pending?.planId || 'housing';
  const product = PRODUCT_DETAILS[plan] || PRODUCT_DETAILS['housing'];
  const price = PRICES[plan] || 29;

  const [a2jPassed, setA2jPassed] = useState(() => hasCompletedA2JScreening());
  const [step, setStep] = useState<CheckoutStep>('review');
  const [email, setEmail] = useState(user?.email || '');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [waitlistMsg, setWaitlistMsg] = useState('');
  const [scopeAcknowledged, setScopeAcknowledged] = useState(false);

  if (!user) {
    setPendingPlan(plan, 'checkout-gate');
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">
            {language === 'en' ? 'Sign in to continue' : 'Inicia sesion para continuar'}
          </h1>
          <p className="text-navy-600 mb-6">
            {language === 'en' ? 'Create a free account to complete your purchase and access your materials.' : 'Crea una cuenta gratis para completar tu compra y acceder a tus materiales.'}
          </p>
          <Link
            to={`/login?redirect=${encodeURIComponent(`/checkout?plan=${plan}`)}`}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            {language === 'en' ? 'Sign In to Continue' : 'Iniciar Sesion'}
          </Link>
          <p className="text-xs text-navy-500 mt-3">
            {language === 'en' ? 'No credit card required for account creation' : 'No se requiere tarjeta para crear cuenta'}
          </p>
        </div>
      </div>
    );
  }

  const showA2JScreening = !isBusiness && !isOrganization && !a2jPassed;

  if (showA2JScreening) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
        <AccessToJusticeScreening onContinueToCheckout={() => setA2jPassed(true)} />
      </div>
    );
  }

  const handleSubmitPayment = async () => {
    setProcessing(true);
    setErrorMsg('');
    setWaitlistMsg('');
    trackEvent('payment_started', { plan });
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) {
        setErrorMsg(language === 'en' ? 'Your session expired. Please sign in again.' : 'Sesion expirada. Inicia sesion de nuevo.');
        setProcessing(false);
        return;
      }
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout-session`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan,
          successUrl: `${window.location.origin}/dashboard/billing?status=success`,
          cancelUrl: `${window.location.origin}/checkout?plan=${plan}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error ?? (language === 'en' ? 'Could not start checkout.' : 'No se pudo iniciar el pago.'));
        setProcessing(false);
        return;
      }
      if (data.mode === 'stripe' && data.url) {
        clearPendingPlan();
        window.location.href = data.url;
        return;
      }
      clearPendingPlan();
      setWaitlistMsg(
        language === 'en'
          ? 'Stripe is being finalized. Your interest is queued and we will email you within one business day.'
          : 'Stripe esta en configuracion. Guardamos tu interes y te contactaremos en un dia habil.',
      );
      setStep('confirmation');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <header className="bg-white border-b border-navy-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <img src="/red-and-grey-minamali-business-card-2-1-2.svg" alt="ezLegal.ai" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-navy-600">
              <Lock className="w-4 h-4 text-green-600" />
              <span>{language === 'en' ? 'Secure Checkout' : 'Pago Seguro'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="sr-only">{language === 'en' ? 'Secure Checkout' : 'Pago Seguro'}</h1>
        <button
          onClick={() => step === 'review' ? navigate(-1) : setStep('review')}
          className="flex items-center gap-2 text-navy-600 hover:text-navy-900 mb-6 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'review'
            ? (language === 'en' ? 'Back' : 'Volver')
            : (language === 'en' ? 'Back to review' : 'Volver a revision')}
        </button>

        <div className="flex items-center gap-2 mb-8">
          {(['review', 'payment', 'confirmation'] as CheckoutStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-teal-600 text-white' :
                (['review', 'payment', 'confirmation'].indexOf(step) > i) ? 'bg-teal-100 text-teal-700' :
                'bg-navy-200 text-navy-500'
              }`}>
                {(['review', 'payment', 'confirmation'].indexOf(step) > i) ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === s ? 'text-navy-900' : 'text-navy-500'} hidden sm:block`}>
                {s === 'review' ? (language === 'en' ? 'Review' : 'Revision') :
                 s === 'payment' ? (language === 'en' ? 'Payment' : 'Pago') :
                 (language === 'en' ? 'Confirmation' : 'Confirmacion')}
              </span>
              {i < 2 && <div className="w-8 sm:w-16 h-px bg-navy-200" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'review' && product && (
              <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-navy-900 mb-4">
                  {language === 'en' ? 'Order Review' : 'Revision del Pedido'}
                </h2>

                <div className="bg-navy-50 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-navy-900 mb-1">{product.name[lang]}</h3>
                  <p className="text-sm text-navy-600 mb-3">{product.description[lang]}</p>
                  <ul className="space-y-1">
                    {product.includes[lang].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {isOrganization && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <Users className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      {language === 'en' ? 'Organization plans include multi-seat licensing and grant-eligible invoicing.' : 'Planes de organizacion incluyen licencias multi-usuario.'}
                    </p>
                  </div>
                )}

                {isBusiness && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      {language === 'en' ? 'Business plans include priority support and team sharing.' : 'Planes de negocios incluyen soporte prioritario.'}
                    </p>
                  </div>
                )}

                {isBusiness && (
                  <label className="flex items-start gap-3 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scopeAcknowledged}
                      onChange={(e) => {
                        setScopeAcknowledged(e.target.checked);
                        if (e.target.checked) {
                          trackEvent('smb_checkout_scope_acknowledged', { plan });
                        }
                      }}
                      className="mt-0.5 w-4 h-4 text-teal-600 border-navy-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-xs text-navy-700 leading-relaxed">
                      {language === 'en'
                        ? 'I understand this provides legal information and templates, not legal advice. Attorney review is recommended for complex or high-value matters.'
                        : 'Entiendo que esto proporciona informacion legal y plantillas, no asesoria legal. Se recomienda revision de abogado para asuntos complejos.'}
                    </span>
                  </label>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">{language === 'en' ? '7-day satisfaction guarantee' : 'Garantia de 7 dias'}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1 ml-6">
                    {language === 'en' ? 'Full refund if not satisfied. No questions asked.' : 'Reembolso completo si no estas satisfecho.'}
                  </p>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  disabled={isBusiness && !scopeAcknowledged}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'en' ? 'Continue to Payment' : 'Continuar al Pago'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sm:p-8">
                <div className="text-center mb-6">
                  <CreditCard className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-navy-900">{language === 'en' ? 'Payment' : 'Pago'}</h2>
                </div>

                <div className="bg-navy-50 border border-navy-200 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-navy-900 text-sm">{language === 'en' ? 'Payment Security' : 'Seguridad de Pago'}</h3>
                      <p className="text-xs text-navy-600 mb-2">
                        {language === 'en' ? 'Your connection is protected with TLS 1.3 encryption. Payment processing via Stripe is in progress.' : 'Tu conexion esta protegida con cifrado TLS 1.3. El procesamiento de pagos via Stripe esta en progreso.'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-navy-500">
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> TLS 1.3</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> AES-256</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> {language === 'en' ? 'Stripe (coming soon)' : 'Stripe (proximamente)'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">{language === 'en' ? 'Email for receipt' : 'Email para recibo'}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-navy-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{errorMsg}</p>
                  </div>
                )}
                {waitlistMsg && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-2">
                    <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{waitlistMsg}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmitPayment}
                  disabled={processing}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> {language === 'en' ? 'Processing...' : 'Procesando...'}</>
                  ) : (
                    <><Lock className="w-4 h-4" /> {language === 'en' ? `Pay $${price}` : `Pagar $${price}`}</>
                  )}
                </button>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 mb-2">
                    {language === 'en' ? 'Purchase Complete!' : 'Compra Completada!'}
                  </h2>
                  <p className="text-navy-600">
                    {language === 'en' ? 'Your materials are ready in your dashboard.' : 'Tus materiales estan listos en tu panel.'}
                  </p>
                </div>

                <div className="bg-navy-50 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-navy-900 mb-3">
                    {language === 'en' ? 'What happens next' : 'Que sigue'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: Download, text: language === 'en' ? 'Download your action plan and templates now' : 'Descarga tu plan de accion y plantillas ahora' },
                      { icon: FileText, text: language === 'en' ? 'Fill in templates with your specific details' : 'Completa las plantillas con tus datos' },
                      { icon: Calendar, text: language === 'en' ? 'Review your deadline checklist and key dates' : 'Revisa tu lista de fechas limite' },
                      { icon: Mail, text: language === 'en' ? 'Receipt sent to ' + email : 'Recibo enviado a ' + email },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-sm text-navy-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center">
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">{language === 'en' ? 'Refund policy:' : 'Politica de reembolso:'}</span>{' '}
                    {language === 'en' ? '7-day full refund if not satisfied. Contact support@ezlegal.ai' : '7 dias de reembolso completo. Contacta support@ezlegal.ai'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/dashboard"
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {language === 'en' ? 'Go to Dashboard' : 'Ir al Panel'}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/find-attorney"
                    className="flex-1 bg-white hover:bg-navy-50 text-navy-700 font-semibold py-4 px-6 rounded-xl transition-all border border-navy-300 flex items-center justify-center gap-2"
                  >
                    {language === 'en' ? 'Find an Attorney' : 'Encontrar Abogado'}
                  </Link>
                </div>

                <p className="text-center text-xs text-navy-500 mt-4">
                  {language === 'en' ? 'Need help? Email support@ezlegal.ai' : 'Necesitas ayuda? Email support@ezlegal.ai'}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4">{language === 'en' ? 'Order Summary' : 'Resumen del Pedido'}</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">{product?.name[lang] || plan}</p>
                    <p className="text-xs text-navy-500">{language === 'en' ? 'One-time purchase' : 'Compra unica'}</p>
                  </div>
                  <p className="font-bold text-navy-900">${price}</p>
                </div>
              </div>
              <div className="border-t border-navy-200 pt-3 mb-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-navy-900">{language === 'en' ? 'Total' : 'Total'}</span>
                  <span className="text-teal-600">${price}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-navy-500">
                <div className="flex items-center gap-2"><Lock className="w-3 h-3 text-green-600" /> TLS 1.3 + AES-256</div>
                <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-green-600" /> {language === 'en' ? '7-day refund guarantee' : 'Garantia de 7 dias'}</div>
                <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-green-600" /> {language === 'en' ? 'Instant access' : 'Acceso instantaneo'}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-navy-200 space-y-1.5">
                <p className="text-[10px] text-navy-500">
                  {language === 'en'
                    ? 'Legal information, not legal advice. Attorney review optional unless separately engaged.'
                    : 'Información legal, no asesoría legal. Revisión de abogado opcional.'}
                </p>
                <p className="text-[10px] text-navy-500">
                  {language === 'en' ? '7-day full refund if not satisfied.' : 'Reembolso completo en 7 días si no estás satisfecho.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
