import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, AlertTriangle, Home, Briefcase,
  Heart, Scale, Globe, Clock, CheckCircle, Shield, Lock
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEvent } from '../services/analytics-service';
import { SpanishScopeNotice } from '../components/shared/AISafetyMicrocopy';
import TrustCTABlock from '../components/trust/TrustCTABlock';

const ISSUE_CARDS = [
  {
    icon: Home,
    title: 'Vivienda y desalojo',
    desc: 'Renta, reparaciones, aviso de desalojo, depósito de seguridad.',
    prompt: 'Tengo un problema con mi vivienda o un aviso de desalojo.',
  },
  {
    icon: Briefcase,
    title: 'Trabajo y salarios',
    desc: 'Salario no pagado, despido injusto, horas extra, discriminación.',
    prompt: 'Mi empleador no me ha pagado lo que me debe.',
  },
  {
    icon: Heart,
    title: 'Familia',
    desc: 'Custodia, manutención, divorcio, orden de protección.',
    prompt: 'Necesito ayuda con un problema de custodia o familia.',
  },
  {
    icon: Scale,
    title: 'Deudas',
    desc: 'Cobradores, demandas, embargo de salario, disputas de crédito.',
    prompt: 'Recibí una carta de cobro o demanda por deuda.',
  },
  {
    icon: Globe,
    title: 'Inmigración',
    desc: 'Organizar documentos, preparar preguntas, entender opciones.',
    prompt: 'Necesito ayuda para organizar mis documentos de inmigración.',
  },
  {
    icon: Clock,
    title: 'Pequeñas reclamaciones',
    desc: 'Alguien me debe dinero o tengo un reclamo menor.',
    prompt: 'Quiero hacer una pequeña reclamación.',
  },
];

const STEPS = [
  { num: 1, title: 'Cuéntenos qué pasó', desc: 'Escriba su situación en sus propias palabras. No necesita términos legales.' },
  { num: 2, title: 'Organizamos la información', desc: 'Identificamos el tipo de problema, fechas importantes y opciones disponibles.' },
  { num: 3, title: 'Recibe un plan de acción', desc: 'Pasos claros y numerados que puede seguir hoy.' },
  { num: 4, title: 'Documentos, recursos o referencias', desc: 'Le mostramos qué documentos necesita, recursos gratuitos y cómo encontrar un abogado si lo necesita.' },
];

export default function EspanolLanding() {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage('es');
    trackEvent('espanol_landing_viewed', {});
  }, [setLanguage]);

  const handleIssueClick = (prompt: string) => {
    try {
      window.sessionStorage.setItem('ez_chatbot_prefill', prompt);
    } catch { /* ignore */ }
    trackEvent('espanol_issue_selected', { prompt: prompt.slice(0, 40) });
  };

  return (
    <div lang="es" className="min-h-screen bg-white text-slate-950">
      <Navigation />

      <main id="main-content">
        {/* Emergency warning */}
        <section className="bg-red-50 border-b border-red-100 py-4 mt-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-red-900 text-center sm:text-left">
              Si está en peligro inmediato, llame al <strong>911</strong>. Si tiene una audiencia o fecha límite, díganos la fecha al comenzar.
            </p>
            <Link
              to="/emergency-resources"
              className="inline-flex items-center gap-2 shrink-0 rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Recursos urgentes
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Hero */}
        <section className="pt-16 sm:pt-24 pb-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-6">
              <Globe className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span className="text-sm font-medium text-teal-800">Experiencia completa en español</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              Ayuda legal clara, paso a paso.
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-7 text-slate-600">
              Explique su problema en español. Le ayudamos a entender su situación, encontrar próximos pasos, organizar documentos y saber cuándo necesita un abogado o ayuda de emergencia.
            </p>

            <p className="mt-3 text-sm font-medium text-slate-500">
              Esto es información legal, no asesoría legal.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/es/chat"
                data-testid="espanol-primary-cta"
                onClick={() => trackEvent('espanol_cta_clicked', { cta: 'empezar' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-700/20 hover:bg-teal-800 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Empezar en español
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/pro-bono?lang=es"
                onClick={() => trackEvent('espanol_cta_clicked', { cta: 'ayuda_gratis' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-teal-300 bg-white px-7 py-3.5 text-base font-semibold text-teal-800 hover:bg-teal-50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <Heart className="w-5 h-5" aria-hidden="true" />
                Necesito ayuda gratis o de bajo costo
              </Link>
              <Link
                to="/emergency-resources"
                onClick={() => trackEvent('espanol_cta_clicked', { cta: 'urgente' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-red-300 bg-white px-7 py-3.5 text-base font-semibold text-red-800 hover:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                Recursos urgentes
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Sin cuenta ni pago. Comience en menos de 60 segundos.
            </p>
          </div>
        </section>

        {/* Issue cards */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="issues-heading">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="issues-heading" className="text-2xl font-black text-center mb-8">
              ¿Cuál es su situación?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ISSUE_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to="/es/chat"
                    onClick={() => handleIssueClick(card.prompt)}
                    className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-700 shrink-0 group-hover:bg-teal-100 transition">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{card.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-14" aria-labelledby="steps-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="steps-heading" className="text-2xl font-black text-center mb-10">
              Qué pasa después
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {STEPS.map((step) => (
                <div key={step.num} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white font-bold text-sm">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <section className="py-10 bg-slate-50 border-y border-slate-200">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {[
                { icon: Shield, text: 'Información legal, no asesoría legal' },
                { icon: Lock, text: 'Conversaciones cifradas' },
                { icon: Globe, text: 'Experiencia completa en español' },
                { icon: CheckCircle, text: 'Sin juicio, sin importar su estatus' },
              ].map(({ icon: I, text }) => (
                <div key={text} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <I className="w-4 h-4 text-teal-600" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SpanishScopeNotice className="max-w-xl mx-auto" />
            <p className="text-sm text-slate-600 leading-7 text-center mt-4">
              ezLegal.ai ofrece información legal y herramientas de autoayuda. No somos un bufete de abogados y no reemplazamos el consejo de un abogado.{' '}
              <Link to="/scope-disclaimers" className="underline text-teal-700 hover:text-teal-900">
                Alcance y límites
              </Link>
            </p>
          </div>
        </section>

        {/* Hardship-aware help */}
        <section className="py-14" aria-labelledby="hardship-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="hardship-heading" className="text-2xl font-black text-center mb-3">
              ¿El costo es un problema?
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
              Creemos que todos merecen entender sus derechos. Si no puede pagar, hay opciones.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                to="/pro-bono?lang=es"
                className="block p-5 bg-teal-50 rounded-xl border border-teal-200 hover:border-teal-400 transition text-center"
              >
                <Heart className="w-7 h-7 text-teal-700 mx-auto mb-2" aria-hidden="true" />
                <h3 className="font-bold text-slate-900 mb-1">Ayuda gratuita</h3>
                <p className="text-xs text-slate-600">Programas pro bono y asistencia legal gratuita</p>
              </Link>
              <Link
                to="/legal-safety-net"
                className="block p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 transition text-center"
              >
                <Scale className="w-7 h-7 text-slate-700 mx-auto mb-2" aria-hidden="true" />
                <h3 className="font-bold text-slate-900 mb-1">Bajo costo</h3>
                <p className="text-xs text-slate-600">Opciones de pago reducido y planes de pago</p>
              </Link>
              <Link
                to="/es/chat"
                className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition text-center"
              >
                <CheckCircle className="w-7 h-7 text-green-600 mx-auto mb-2" aria-hidden="true" />
                <h3 className="font-bold text-slate-900 mb-1">Gratis para siempre</h3>
                <p className="text-xs text-slate-600">Preguntas ilimitadas sin costo ni registro</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Language continuity notice */}
        <section className="bg-amber-50 border-y border-amber-200 py-4">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex items-center gap-3 justify-center">
            <Globe className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
            <p className="text-sm text-amber-800">
              Algunas páginas pueden mostrarse en inglés. Su preferencia de idioma se mantiene y siempre puede regresar aquí.
            </p>
          </div>
        </section>

        {/* Trust links */}
        <section className="py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <TrustCTABlock variant="compact" />
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-950 py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              ¿Listo para entender sus opciones?
            </h2>
            <p className="text-slate-400 text-sm mb-7">
              Empiece gratis. Sin registro. Sin tarjeta de crédito.
            </p>
            <Link
              to="/es/chat"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 hover:bg-teal-50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Empezar en español
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
