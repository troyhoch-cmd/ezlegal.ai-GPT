import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MessageCircle, Shield, CheckCircle, ArrowRight, Globe,
  Scale, Home, Briefcase, Baby, Car, MapPin, Users,
  Lock, Clock, Star, Phone, ChevronRight
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import WhatsAppOptIn from '../components/WhatsAppOptIn';
import ShareButton from '../components/ShareButton';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const CHANNEL_CONFIG: Record<string, {
  en: { headline: string; subheadline: string; cta: string };
  es: { headline: string; subheadline: string; cta: string };
  color: string;
  icon: typeof MessageCircle;
}> = {
  whatsapp: {
    en: {
      headline: 'Free Legal Help on WhatsApp',
      subheadline: 'Get confidential legal information in English or Spanish. Response within 24 hours.',
      cta: 'Get Help on WhatsApp',
    },
    es: {
      headline: 'Ayuda Legal Gratis por WhatsApp',
      subheadline: 'Recibe información legal confidencial en español o inglés. Respuesta en menos de 24 horas.',
      cta: 'Recibir Ayuda por WhatsApp',
    },
    color: '#25D366',
    icon: MessageCircle,
  },
  facebook: {
    en: {
      headline: 'Free Legal Answers for Your Community',
      subheadline: 'Ask any legal question in plain English. Get jurisdiction-specific answers with real citations, completely free.',
      cta: 'Ask Your Question Free',
    },
    es: {
      headline: 'Respuestas Legales Gratis para tu Comunidad',
      subheadline: 'Haz cualquier pregunta legal en español simple. Obtien respuestas con citas reales, completamente gratis.',
      cta: 'Haz tu Pregunta Gratis',
    },
    color: '#1877F2',
    icon: Users,
  },
  nextdoor: {
    en: {
      headline: 'Your Neighbors Recommended This Legal Resource',
      subheadline: 'ezLegal.ai helps your community understand their legal rights. Free, confidential, and available 24/7.',
      cta: 'Get Free Legal Help',
    },
    es: {
      headline: 'Tus Vecinos Recomendaron Este Recurso Legal',
      subheadline: 'ezLegal.ai ayuda a tu comunidad a entender sus derechos legales. Gratis, confidencial y disponible 24/7.',
      cta: 'Obtener Ayuda Legal Gratis',
    },
    color: '#8ED500',
    icon: MapPin,
  },
  sms: {
    en: {
      headline: 'Someone Shared Free Legal Help With You',
      subheadline: 'Ask any legal question and get clear, cited answers. Free to start, available 24/7.',
      cta: 'Start Your Free Question',
    },
    es: {
      headline: 'Alguien te Compartio Ayuda Legal Gratis',
      subheadline: 'Haz cualquier pregunta legal y recibe respuestas claras con citas. Gratis para comenzar, disponible 24/7.',
      cta: 'Haz tu Pregunta Gratis',
    },
    color: '#64748b',
    icon: Phone,
  },
  qr: {
    en: {
      headline: 'Scan Complete - Free Legal Help Awaits',
      subheadline: 'You scanned a QR code to get free legal information. Ask any question and get answers with real legal citations.',
      cta: 'Ask Your Question Now',
    },
    es: {
      headline: 'Escaneo Completado - Ayuda Legal Gratis te Espera',
      subheadline: 'Escaneaste un codigo QR para obtener información legal gratuita. Haz cualquier pregunta y recibe respuestas con citas legales reales.',
      cta: 'Haz tu Pregunta Ahora',
    },
    color: '#0d9488',
    icon: CheckCircle,
  },
  google: {
    en: {
      headline: 'Get Clear Legal Answers, Not Confusion',
      subheadline: 'ezLegal.ai explains your legal rights in plain language with citations to real laws. Free and confidential.',
      cta: 'Ask Your Legal Question',
    },
    es: {
      headline: 'Obtien Respuestas Legales Claras, No Confusion',
      subheadline: 'ezLegal.ai explica tus derechos legales en lenguaje simple con citas de leyes reales. Gratis y confidencial.',
      cta: 'Haz tu Pregunta Legal',
    },
    color: '#0d9488',
    icon: Scale,
  },
};

const LEGAL_AREAS = [
  { icon: Globe, en: 'Immigration', es: 'Inmigracion', color: 'bg-teal-500' },
  { icon: Briefcase, en: 'Employment', es: 'Trabajo', color: 'bg-amber-500' },
  { icon: Home, en: 'Housing', es: 'Vivienda', color: 'bg-emerald-500' },
  { icon: Baby, en: 'Family Law', es: 'Derecho Familiar', color: 'bg-rose-500' },
  { icon: Car, en: 'Accidents', es: 'Accidentes', color: 'bg-sky-500' },
  { icon: Scale, en: 'Criminal', es: 'Criminal', color: 'bg-navy-500' },
];

export default function ChannelLanding() {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const es = language === 'es';
  const [tracked, setTracked] = useState(false);

  const channel = searchParams.get('ch') || searchParams.get('utm_source') || 'direct';
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const utmContent = searchParams.get('utm_content') || '';

  const config = CHANNEL_CONFIG[channel] || CHANNEL_CONFIG['google'];
  const content = es ? config.es : config.en;

  useEffect(() => {
    if (tracked) return;
    const track = async () => {
      try {
        await supabase.from('channel_landing_visits').insert({
          channel,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          utm_content: utmContent || null,
          language: es ? 'es' : 'en',
          referrer_url: document.referrer || null,
          user_agent: navigator.userAgent || null,
          session_id: sessionStorage.getItem('session_id') || crypto.randomUUID(),
        });
      } catch {
      }
    };
    track();
    setTracked(true);
  }, [tracked, channel, utmSource, utmMedium, utmCampaign, utmContent, es]);

  const isWhatsAppChannel = channel === 'whatsapp';

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">
        <section
          className="relative py-20 lg:py-28 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${config.color}15, ${config.color}05, white)` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-sm font-semibold"
                  style={{ backgroundColor: `${config.color}15`, color: config.color }}
                >
                  <config.icon className="w-4 h-4" />
                  {es ? 'Recurso Recomendado' : 'Recommended Resource'}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-navy-900 mb-6 leading-tight">
                  {content.headline}
                </h1>
                <p className="text-lg text-navy-600 mb-8 leading-relaxed">
                  {content.subheadline}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    to="/chat"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                  >
                    {content.cta}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  {!isWhatsAppChannel && (
                    <Link
                      to="/espanol"
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-navy-700 rounded-xl font-semibold border border-navy-200 hover:border-navy-300 transition-all"
                    >
                      <Globe className="w-5 h-5 text-teal-600" />
                      {es ? 'Página en Español' : 'En Español'}
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Shield, en: 'Confidential', es: 'Confidencial' },
                    { icon: Clock, en: 'Available 24/7', es: 'Disponible 24/7' },
                    { icon: Lock, en: 'No Signup Needed', es: 'Sin Registro' },
                  ].map(item => (
                    <div key={item.en} className="flex items-center gap-2 text-sm text-navy-600">
                      <item.icon className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span className="font-medium">{es ? item.es : item.en}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {isWhatsAppChannel ? (
                  <WhatsAppOptIn
                    source={channel}
                    utmSource={utmSource}
                    utmMedium={utmMedium}
                    utmCampaign={utmCampaign}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-navy-200 shadow-xl p-8">
                    <h3 className="text-lg font-bold text-navy-900 mb-4">
                      {es ? 'Areas Legales que Cubrimos' : 'Legal Areas We Cover'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {LEGAL_AREAS.map(area => (
                        <div key={area.en} className="flex items-center gap-3 p-3 bg-navy-50 rounded-xl">
                          <div className={`w-8 h-8 ${area.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <area.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-navy-800">{es ? area.es : area.en}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/chat"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all"
                    >
                      {content.cta}
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                    <p className="text-[11px] text-navy-400 text-center mt-3">
                      {es
                        ? 'Información legal, no asesoria legal. Consulte a un abogado para asesoramiento.'
                        : 'Legal information, not legal advice. Consult an attorney for counsel.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Familias Confian en Nosotros' : 'Families Trust ezLegal.ai'}
              </h2>
              <p className="text-navy-600">
                {es
                  ? 'Información legal real, explicada en lenguaje simple.'
                  : 'Real legal information, explained in plain language.'}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  en: { stat: '50', label: 'U.S. States Covered', desc: 'Jurisdiction-aware legal information for every state' },
                  es: { stat: '50', label: 'Estados Cubiertos', desc: 'Información legal adaptada a cada estado' },
                },
                {
                  en: { stat: '24/7', label: 'Always Available', desc: 'AI-powered answers any time, day or night' },
                  es: { stat: '24/7', label: 'Siempre Disponible', desc: 'Respuestas impulsadas por IA a cualquier hora' },
                },
                {
                  en: { stat: 'EN/ES', label: 'Bilingual Support', desc: 'Full English and Spanish language coverage' },
                  es: { stat: 'EN/ES', label: 'Soporte Bilingue', desc: 'Cobertura completa en inglés y español' },
                },
              ].map(item => {
                const d = es ? item.es : item.en;
                return (
                  <div key={d.label} className="text-center p-6 bg-navy-50 rounded-2xl">
                    <p className="text-4xl font-bold text-teal-600 mb-1">{d.stat}</p>
                    <p className="font-semibold text-navy-900 mb-1">{d.label}</p>
                    <p className="text-sm text-navy-500">{d.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-6">
                  {es ? 'Tu Privacidad Importa' : 'Your Privacy Matters'}
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: Shield, en: 'Your data is never sold or shared with third parties', es: 'Tus datos nunca se venden ni se comparten con terceros' },
                    { icon: Lock, en: 'AES-256 encryption protects all conversations', es: 'Cifrado AES-256 protege todas las conversaciones' },
                    { icon: Globe, en: 'We never share information with ICE or law enforcement', es: 'NUNCA compartimos información con ICE o la policia' },
                    { icon: CheckCircle, en: 'You can delete your data anytime', es: 'Puedes eliminar tus datos en cualquier momento' },
                  ].map(item => (
                    <div key={item.en} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <p className="text-navy-700 font-medium">{es ? item.es : item.en}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {isWhatsAppChannel && (
                  <WhatsAppOptIn
                    source={channel}
                    utmSource={utmSource}
                    utmMedium={utmMedium}
                    utmCampaign={utmCampaign}
                    variant="compact"
                  />
                )}
                <ShareButton context="legal-help" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-navy-50 rounded-2xl p-8 border border-navy-100">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-navy-700 text-lg leading-relaxed mb-4 italic">
                {es
                  ? '"Tenia miedo de buscar ayuda legal por mi estatus. ezLegal me explico mis derechos de forma clara y confidencial. Ahora se que tengo opciones."'
                  : '"I was afraid to seek legal help because of my status. ezLegal explained my rights clearly and confidentially. Now I know I have options."'}
              </blockquote>
              <p className="text-navy-500 text-sm">- Maria G., Tucson, AZ</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-teal-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {es ? 'Obtén Respuestas Legales Ahora' : 'Get Legal Answers Now'}
            </h2>
            <p className="text-teal-100 mb-8 text-lg">
              {es
                ? 'Gratis para comenzar. Sin tarjeta de crédito. Disponible 24/7.'
                : 'Free to start. No credit card. Available 24/7.'}
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-teal-700 rounded-xl font-bold text-lg hover:bg-teal-50 transition-all shadow-lg"
            >
              {es ? 'Haz tu Pregunta Gratis' : 'Ask Your Question Free'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
