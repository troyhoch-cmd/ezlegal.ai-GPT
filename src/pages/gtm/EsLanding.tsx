import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, MessageCircle, ArrowRight, Phone, Lock,
  Globe, Home, Briefcase, Baby, Scale, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePersonalization } from '../../contexts/PersonalizationContext';
import { getVariant, HERO_ES_TEST, HERO_ES_COPY } from '../../lib/ab-testing';
import { trackCTAClick } from '../../lib/utm';

const LEGAL_TOPICS = [
  { icon: Globe, title: 'Inmigración', desc: 'DACA, visas, deportación', query: 'inmigracion' },
  { icon: Briefcase, title: 'Trabajo', desc: 'Salarios, discriminación', query: 'trabajo' },
  { icon: Home, title: 'Vivienda', desc: 'Desalojos, depósitos', query: 'vivienda' },
  { icon: Baby, title: 'Familia', desc: 'Custodia, divorcio', query: 'familia' },
  { icon: Scale, title: 'Criminal', desc: 'Derechos, defensa', query: 'criminal' },
  { icon: AlertTriangle, title: 'Accidentes', desc: 'Lesiones, compensación', query: 'accidentes' },
];

export default function EsLanding() {
  const { setLanguage } = useLanguage();
  const { trackPageVisit } = usePersonalization();
  const navigate = useNavigate();
  const heroVariant = getVariant(HERO_ES_TEST);
  const heroCopy = HERO_ES_COPY[heroVariant] || HERO_ES_COPY.control;

  useEffect(() => {
    setLanguage('es');
    trackPageVisit('/es');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 min-h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Globe className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-white font-medium">100% en Español</span>
            </div>

            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight text-white">
              {heroCopy.title}
            </h1>

            <p className="text-lg sm:text-xl text-navy-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              {heroCopy.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => { trackCTAClick(`es-hero-primary-${heroVariant}`, '/ask'); navigate('/ask'); }}
                data-cta="es-hero-primary"
                className="group bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center gap-3 focus:outline-none focus:ring-4 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-navy-900 w-full sm:w-auto justify-center"
              >
                {heroCopy.cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/urgent-help"
                data-cta="es-hero-crisis"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white border border-white/30 hover:border-white/60 px-6 py-3 rounded-xl transition-all font-medium"
              >
                <Phone className="w-4 h-4" />
                Ayuda urgente
              </Link>
            </div>

            <p className="text-sm text-navy-200 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>Confidencial. NO compartimos datos con ICE ni la policía.</span>
            </p>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="py-5 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 text-sm text-navy-600">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600" />
              Cifrado de nivel bancario
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" />
              Privado por defecto
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Disponible 24/7
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              Gratis para empezar
            </span>
          </div>
        </section>

        {/* Legal Topics */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-navy-900 mb-3">
                ¿En qué te podemos ayudar?
              </h2>
              <p className="text-lg text-navy-500">
                Selecciona tu situación para recibir información personalizada
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {LEGAL_TOPICS.map(({ icon: Icon, title, desc, query }) => (
                <Link
                  key={query}
                  to={`/ask?topic=${query}&lang=es`}
                  data-cta={`es-topic-${query}`}
                  className="group flex flex-col items-center text-center p-5 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all bg-white"
                >
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-teal-600 mb-3 group-hover:bg-teal-100 transition-colors">
                    <Icon className="w-6 h-6" />
                  </span>
                  <span className="font-semibold text-navy-900 text-sm sm:text-base">{title}</span>
                  <span className="text-xs text-navy-500 mt-1">{desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-navy-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">
              Cómo funciona
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Describe tu situación',
                  desc: 'Escríbenos en español, con tus propias palabras. No necesitas saber términos legales.',
                  icon: MessageCircle,
                },
                {
                  step: '02',
                  title: 'Recibe orientación clara',
                  desc: 'Te explicamos tus derechos y opciones en lenguaje simple y directo.',
                  icon: CheckCircle,
                },
                {
                  step: '03',
                  title: 'Toma acción',
                  desc: 'Sigue los pasos recomendados. Si necesitas un abogado, te conectamos gratis.',
                  icon: ArrowRight,
                },
              ].map(({ step, title, desc, icon: Icon }) => (
                <div key={step} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-2xl mb-4">
                    <Icon className="w-7 h-7 text-teal-600" />
                  </div>
                  <div className="text-4xl font-bold text-navy-200 mb-2">{step}</div>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">{title}</h3>
                  <p className="text-navy-600 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Promise */}
        <section className="py-12 bg-white border-y border-slate-200">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-50 rounded-xl mb-4">
              <Shield className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-3">
              Tu seguridad es nuestra prioridad
            </h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              No importa tu estatus migratorio. Tu información está cifrada y protegida.
              NO compartimos datos con ICE, la policía, ni ninguna agencia del gobierno.
            </p>
            <p className="text-sm text-navy-500 italic">
              Nota: ezLegal.ai proporciona información legal, no asesoramiento legal.
              No somos un bufete de abogados y no se establece ninguna relación abogado-cliente.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tu primera pregunta es gratis
            </h2>
            <p className="text-lg text-navy-100 mb-8">
              Miles de personas ya usan ezLegal.ai para entender sus derechos. Empieza ahora.
            </p>
            <button
              type="button"
              onClick={() => navigate('/ask')}
              data-cta="es-bottom-primary"
              className="group bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 inline-flex items-center gap-3 focus:outline-none focus:ring-4 focus:ring-teal-300"
            >
              Comenzar ahora — es gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
