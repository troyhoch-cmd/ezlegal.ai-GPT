import { useState, useEffect } from 'react';
import './home-redesign.css';
import { isBackendConfigured } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, MessageSquare, FileText, CheckCircle, Users, Home as House, Briefcase, Heart, Scale,
  ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ResumeBanner from '../components/ResumeBanner';
import CrisisStrip from '../components/CrisisStrip';
import HomeAudienceRouting from '../components/HomeAudienceRouting';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersonalization } from '../contexts/PersonalizationContext';
import { usePersona } from '../contexts/PersonaContext';
import { useAuth } from '../contexts/AuthContext';
import { markHeroVariantSeen } from '../services/ui-preferences-service';
import { getVariant, HERO_EN_TEST, HERO_EN_COPY, HERO_ES_TEST, HERO_ES_COPY } from '../lib/ab-testing';
import { trackCTAClick } from '../lib/utm';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { language } = useLanguage();
  const { trackPageVisit } = usePersonalization();
  const { setPersona: _setPersona } = usePersona();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const heroVariant = language === 'es' ? getVariant(HERO_ES_TEST) : getVariant(HERO_EN_TEST);
  const heroCopy = language === 'es'
    ? (HERO_ES_COPY[heroVariant] || HERO_ES_COPY.control)
    : (HERO_EN_COPY[heroVariant] || HERO_EN_COPY.control);

  useEffect(() => {
    trackPageVisit('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Returning authenticated users always land in the chat workspace.
  useEffect(() => {
    if (!user) return;
    navigate('/chat', { replace: true });
  }, [user, navigate]);

  // P1: persist hero-seen state
  useEffect(() => {
    if (user && !profile?.hero_variant_seen) {
      markHeroVariantSeen(user.id);
    }
  }, [user, profile?.hero_variant_seen]);

  // Silence unused warning — persona selection now lives in Step2Router on /start
  void _setPersona;

  const handleStartNow = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    trackCTAClick(`hero-primary-${heroVariant}`, '/start');
    navigate('/start');
  };


  return (
    <div className="home-redesign min-h-screen overflow-x-hidden">
      <Navigation />

      <main id="main-content" className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <section className="clarity-hero" aria-labelledby="clarity-title">
          {!isBackendConfigured && <p role="status" className="clarity-preview-notice">{language === 'en'
            ? 'Preview: explore the new design. Connected services, including accounts and saved work, are currently unavailable.'
            : 'Vista previa: explora el nuevo diseño. Los servicios conectados, incluidas las cuentas y el trabajo guardado, no están disponibles actualmente.'}</p>}
          <div className="clarity-grid">
            <div className="clarity-intro">
              <span className="clarity-eyebrow"><span />{language === 'en' ? 'ARIZONA LEGAL INFORMATION' : 'INFORMACIÓN LEGAL DE ARIZONA'}</span>
              <h1 id="clarity-title">{language === 'en' ? <>Life gets complicated.<br /><em>Your next step<br />doesn’t have to.</em></> : <>La vida se complica.<br /><em>Tu próximo paso<br />no tiene por qué.</em></>}</h1>
              <p className="clarity-description">{language === 'en' ? 'Make sense of your legal questions, understand your documents, and find a way forward. In English or Spanish. In your own words.' : 'Aclara tus preguntas legales, entiende tus documentos y encuentra cómo seguir. En inglés o español. Con tus propias palabras.'}</p>
              <button type="button" onClick={handleStartNow} data-testid="hero-primary-cta" className="clarity-primary" aria-label={heroCopy.cta}>{heroCopy.cta}<ArrowRight size={19} aria-hidden="true" /></button>
              <a href="#how-it-works" className="clarity-secondary">{language === 'en' ? 'See how it works' : 'Mira cómo funciona'}<ChevronDown size={16} aria-hidden="true" /></a>
              <p className="clarity-allowance">{language === 'en' ? 'Free plan: 10 questions and 3 documents per month. No credit card to start. You can ask without an account; sign in to save your work. Paid plans are optional.' : 'Plan gratis: 10 preguntas y 3 documentos al mes. Sin tarjeta para empezar. Puedes preguntar sin cuenta; inicia sesión para guardar tu trabajo. Los planes de pago son opcionales.'} <Link to="/pricing">{language === 'en' ? 'Compare plans' : 'Comparar planes'}</Link></p>
            </div>
            <div className="clarity-paths">
              <div className="clarity-paths-heading"><span className="clarity-eyebrow">{language === 'en' ? 'A LITTLE CLARITY STARTS HERE' : 'LA CLARIDAD EMPIEZA AQUÍ'}</span><span className="clarity-mark" aria-hidden="true"><Scale size={27} /></span></div>
              <h2>{language === 'en' ? 'What’s on your mind?' : '¿Qué te preocupa?'}</h2>
              <p>{language === 'en' ? 'Pick a starting point. We’ll take it from there.' : 'Elige un punto de partida. Seguimos desde ahí.'}</p>
              <div className="clarity-task-list">
                {[
                  { icon: House, en: 'Housing & renting', es: 'Vivienda y alquiler', detailEn: 'Leases, repairs, eviction notices', detailEs: 'Contratos, reparaciones, desalojos', path: '/ask/housing' },
                  { icon: Heart, en: 'Family & relationships', es: 'Familia y relaciones', detailEn: 'Divorce, custody, family questions', detailEs: 'Divorcio, custodia, dudas familiares', path: '/ask/family' },
                  { icon: Briefcase, en: 'Work & pay', es: 'Trabajo y salario', detailEn: 'Wages, workplace rights, job concerns', detailEs: 'Salarios y derechos laborales', path: '/ask/employment' },
                  { icon: FileText, en: 'Understand a document', es: 'Entender un documento', detailEn: 'Put confusing legal language in context', detailEs: 'Aclara el lenguaje legal confuso', path: '/chat' },
                  { icon: MessageSquare, en: 'Something else', es: 'Algo más', detailEn: 'Start with a question in your own words', detailEs: 'Empieza con tus propias palabras', path: '/chat' },
                ].map(({ icon: Icon, en, es, detailEn, detailEs, path }) => <Link className="clarity-task" to={path} key={en}><span className="clarity-task-icon"><Icon size={21} aria-hidden="true" /></span><span><strong>{language === 'en' ? en : es}</strong><small>{language === 'en' ? detailEn : detailEs}</small></span><ArrowRight size={18} aria-hidden="true" /></Link>)}
              </div>
              <div className="clarity-scope"><Shield size={17} aria-hidden="true" /><span>{language === 'en' ? 'For Arizona legal questions. Other states are outside our current coverage.' : 'Para preguntas sobre la ley de Arizona. Otros estados están fuera de nuestra cobertura actual.'}</span></div>
            </div>
          </div>
          <div className="clarity-trust"><span>{language === 'en' ? 'Legal information, not legal advice. We are not a law firm.' : 'Información legal, no asesoría legal. No somos un bufete de abogados.'} <Link to="/privacy">{language === 'en' ? 'Your privacy' : 'Tu privacidad'}</Link></span><CrisisStrip variant="inline" /></div>
        </section>

        {/* Social proof + conversion strip */}
        <section className="py-5 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 text-teal-700">
                  <Users className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-navy-800">
                  {language === 'en' ? 'Legal information in English and Spanish' : 'Información legal en inglés y español'}
                </span>
              </div>
              <span className="hidden sm:block w-px h-6 bg-slate-200" aria-hidden="true" />
              <span className="text-sm text-navy-600 font-medium">
                {language === 'en' ? '$0 to start — no credit card needed' : '$0 para empezar — sin tarjeta de crédito'}
              </span>
              <span className="hidden sm:block w-px h-6 bg-slate-200" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <Link
                  to="/find-a-lawyer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  {language === 'en' ? 'Find a Lawyer' : 'Buscar un Abogado'}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                <span className="w-px h-4 bg-slate-200 hidden sm:block" aria-hidden="true" />
                <Link
                  to="/pricing?audience=legal-aid"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-800 transition-colors"
                >
                  {language === 'en' ? 'Free for Legal Aid Orgs' : 'Gratis para Organizaciones de Ayuda Legal'}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-5"><ResumeBanner /></div>

        <HomeAudienceRouting />

        <section id="how-it-works" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-navy-900 mb-4">
                {language === 'en' ? 'From uncertainty to a next step' : 'De la duda al próximo paso'}
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                {language === 'en'
                  ? 'Get clarity on your legal situation in three simple steps'
                  : 'Obtén claridad sobre tu situación legal en tres pasos simples'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-6">
                  <MessageSquare className="w-8 h-8 text-teal-600" />
                </div>
                <div className="text-5xl font-bold text-navy-100 mb-3">01</div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">
                  {language === 'en' ? 'Describe Your Situation' : 'Describe Tu Situación'}
                </h3>
                <p className="text-navy-500">
                  {language === 'en'
                    ? 'Tell us what happened in plain language. No legal jargon required.'
                    : 'Dinos qué pasó en lenguaje simple. No se requiere jerga legal.'
                  }
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-6">
                  <FileText className="w-8 h-8 text-teal-600" />
                </div>
                <div className="text-5xl font-bold text-navy-100 mb-3">02</div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">
                  {language === 'en' ? 'Get Clear Guidance' : 'Recibe Orientación Clara'}
                </h3>
                <p className="text-navy-500">
                  {language === 'en'
                    ? 'Receive easy-to-understand information about your rights and options.'
                    : 'Recibe información fácil de entender sobre tus derechos y opciones.'
                  }
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-6">
                  <CheckCircle className="w-8 h-8 text-teal-600" />
                </div>
                <div className="text-5xl font-bold text-navy-100 mb-3">03</div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">
                  {language === 'en' ? 'Take Action' : 'Toma Acción'}
                </h3>
                <p className="text-navy-500">
                  {language === 'en'
                    ? 'Follow clear next steps, with attorney referrals when needed.'
                    : 'Sigue los próximos pasos claros, con referencias a abogados cuando sea necesario.'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>


        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                {language === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: language === 'en' ? "Is ezLegal.ai a replacement for a lawyer?" : "Es ezLegal.ai un reemplazo para un abogado?",
                  a: language === 'en'
                    ? "No. We provide legal information to help you understand your situation — not legal advice. For complex matters or court representation, we connect you with licensed attorneys through our referral network."
                    : "No. Proporcionamos información legal para ayudarte a entender tu situación — no asesoramiento legal. Para asuntos complejos, te conectamos con abogados a través de nuestra red de referencias."
                },
                {
                  q: language === 'en' ? "Is my information private?" : "Es mi información privada?",
                  a: language === 'en'
                    ? "We encrypt your conversations in transit and at rest and never use them to train AI models. We follow California privacy law (CCPA). Note: because we are not a law firm, attorney-client privilege does not apply to these conversations. See our Privacy Policy for details."
                    : "Ciframos tus conversaciones en tránsito y en reposo y nunca las usamos para entrenar modelos de IA. Cumplimos con la ley de privacidad de California (CCPA). Nota: como no somos un bufete de abogados, el privilegio abogado-cliente no aplica."
                },
                {
                  q: language === 'en' ? "Is it really free?" : "Es realmente gratis?",
                  a: language === 'en'
                    ? "The free plan includes 10 questions and 3 documents per month, with no credit card to start. Paid upgrades are optional; see pricing for pilot prices."
                    : "El plan gratis incluye 10 preguntas y 3 documentos al mes, sin tarjeta para empezar. Los planes de pago son opcionales; consulta los precios piloto."
                },
                {
                  q: language === 'en' ? "What makes ezLegal.ai ethical?" : "Que hace a ezLegal.ai etico?",
                  a: language === 'en'
                    ? "We are transparent about what our AI can and cannot do. We tell you clearly when you need a lawyer. We never replace a lawyer's judgment. We maintain strict privacy standards and monitor every AI response for quality and safety."
                    : "Somos transparentes sobre lo que nuestra IA puede y no puede hacer. Te decimos claramente cuando necesitas un abogado. Nunca reemplazamos el juicio de un abogado. Mantenemos estandares estrictos de privacidad."
                },
                {
                  q: language === 'en' ? "How accurate is the legal information?" : "Que tan precisa es la información legal?",
                  a: language === 'en'
                    ? "We train our AI on official legal sources, and legal professionals review it regularly. However, laws vary by state and change often. We provide general information — for advice about your specific case, consult a licensed attorney."
                    : "Entrenamos nuestra IA con fuentes legales oficiales, y profesionales legales la revisan regularmente. Sin embargo, las leyes varian segun el estado. Para consejo sobre tu caso especifico, consulta a un abogado con licencia."
                },
              ].map((faq, i) => (
                <div key={i} className="border border-navy-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-navy-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-semibold text-navy-900 pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 bg-navy-50 border-t border-navy-200">
                      <p className="text-navy-600 leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>


        <section className="py-20 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">
              {language === 'en'
                ? 'Ready to Get Started?'
                : '¿Listo para comenzar?'
              }
            </h2>
            <p className="text-lg sm:text-xl text-navy-100 mb-10">
              {language === 'en'
                ? 'Legal information in English or Spanish — free to start'
                : 'Información legal en inglés o español — gratis para comenzar'
              }
            </p>
            <button
              type="button"
              onClick={handleStartNow}
              className="bg-teal-700 hover:bg-teal-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 inline-flex items-center gap-3 focus:outline-none focus:ring-4 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-navy-900"
            >
              {language === 'en' ? 'Ask a free legal question' : 'Haz tu pregunta gratis'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-white/80 mt-4 max-w-md mx-auto leading-snug">
              {language === 'en'
                ? 'Legal information, not legal advice. We are not a law firm.'
                : 'Información legal, no asesoría legal. No somos un bufete de abogados.'
              }
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
