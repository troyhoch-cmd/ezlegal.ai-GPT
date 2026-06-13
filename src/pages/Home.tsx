import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, MessageSquare, FileText, CheckCircle, Users,
  ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ResumeBanner from '../components/ResumeBanner';
import HomeKPIStrip from '../components/HomeKPIStrip';
import CrisisStrip from '../components/CrisisStrip';
import HomeAudienceRouting from '../components/HomeAudienceRouting';
import SafeguardsSection from '../components/SafeguardsSection';
import { recordConsent } from '../lib/consent';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersonalization } from '../contexts/PersonalizationContext';
import { usePersona } from '../contexts/PersonaContext';
import { useAuth } from '../contexts/AuthContext';
import { markHeroVariantSeen } from '../services/ui-preferences-service';
import { getVariant, HERO_EN_TEST, HERO_EN_COPY, HERO_ES_TEST, HERO_ES_COPY } from '../lib/ab-testing';
import { trackCTAClick } from '../lib/utm';
import { renderClaimOrFallback } from '../content/trustEvidence';

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
    void recordConsent({
      consentType: 'ai_processing',
      source: 'home_primary_cta',
      language,
      userId: user?.id ?? null,
    });
    navigate('/start');
  };


  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navigation />

      <main id="main-content" className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <section className="relative pt-24 pb-12 min-h-[68vh] flex items-center overflow-x-clip">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

          <div className="relative w-full max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center min-w-0">
            <h1 className="text-[clamp(1.75rem,7vw,3.75rem)] font-bold mb-4 leading-[1.1] tracking-tight text-white text-balance break-words">
              {heroCopy.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-navy-100 mb-6 max-w-2xl mx-auto leading-relaxed">
              {heroCopy.subtitle}
            </p>

            <div className="flex flex-col items-center justify-center gap-3 mb-4 w-full min-w-0">
              <button
                type="button"
                onClick={(e) => handleStartNow(e)}
                data-testid="hero-primary-cta"
                className="group bg-teal-700 hover:bg-teal-600 text-white px-6 sm:px-10 py-4 rounded-xl font-bold text-base sm:text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-navy-900 min-h-[56px] w-full sm:w-auto"
                aria-label={heroCopy.cta}
              >
                {heroCopy.cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" aria-hidden="true" />
              </button>

              <p className="text-sm text-white/80 mt-1 max-w-md leading-snug">
                {language === 'en'
                  ? 'Legal information, not legal advice. We are not a law firm.'
                  : 'Información legal, no asesoría legal. No somos un bufete de abogados.'
                }
              </p>

              <p className="text-sm text-navy-200 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <Shield className="w-4 h-4 text-teal-400 flex-shrink-0" aria-hidden="true" />
                <Link
                  to="/trust-center"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  {renderClaimOrFallback('attorney-informed', language === 'es' ? 'es' : 'en')}
                </Link>
              </p>
            </div>

            <div className="mt-3 flex justify-center w-full min-w-0">
              <CrisisStrip variant="inline" />
            </div>
          </div>
        </section>

        <section className="py-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4">
            <ResumeBanner />
            <div className="mt-4">
              <HomeKPIStrip />
            </div>
            <div className="mt-4 flex justify-center">
              <SafeguardsSection />
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="sr-only">
              {language === 'en' ? 'What you can do with ezLegal.ai' : 'Lo que puedes hacer con ezLegal.ai'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  Icon: MessageSquare,
                  en: 'Ask legal questions',
                  es: 'Haz preguntas legales',
                },
                {
                  Icon: FileText,
                  en: 'Understand documents',
                  es: 'Entiende documentos',
                },
                {
                  Icon: CheckCircle,
                  en: 'Find safe next steps',
                  es: 'Encuentra próximos pasos',
                },
                {
                  Icon: Users,
                  en: 'Prepare for an attorney',
                  es: 'Prepárate para un abogado',
                },
              ].map(({ Icon, en, es }) => (
                <div
                  key={en}
                  className="flex flex-col items-center text-center rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm min-w-0"
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-600 mb-3">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-navy-900 leading-snug break-words">
                    {language === 'en' ? en : es}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <HomeAudienceRouting />

        <section id="how-it-works" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-navy-900 mb-4">
                {language === 'en' ? 'How It Works Now' : 'Cómo Funciona Ahora'}
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
                    ? "Yes. Basic legal Q&A is completely free with no credit card required. You only pay if you choose optional premium features like detailed action plans or document templates."
                    : "Si. Las preguntas legales basicas son completamente gratis. Solo pagas si eliges caracteristicas premium opcionales."
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
              {language === 'en' ? 'Start with a free question' : 'Empieza con una pregunta gratis'}
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
