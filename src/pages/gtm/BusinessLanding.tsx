import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, FileText, Shield, Clock, DollarSign, Users, CheckCircle,
  ArrowRight, Briefcase, Scale, Lock, Calculator, Award, Zap
} from 'lucide-react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePersonalization } from '../../contexts/PersonalizationContext';
import { supabase } from '../../lib/supabase';
import { trackCTAClick, getStoredUTM } from '../../lib/utm';

const PAIN_POINTS = [
  {
    icon: DollarSign,
    problem: { en: '$300/hr for basic legal questions', es: '$300/hr por preguntas legales básicas' },
    solution: { en: 'Unlimited AI Q&A from $99/mo', es: 'Preguntas ilimitadas desde $99/mes' },
  },
  {
    icon: Clock,
    problem: { en: 'Days waiting for attorney callbacks', es: 'Días esperando respuestas de abogados' },
    solution: { en: 'Instant answers, 24/7', es: 'Respuestas instantáneas, 24/7' },
  },
  {
    icon: FileText,
    problem: { en: 'Expensive document templates', es: 'Plantillas de documentos costosas' },
    solution: { en: 'Business templates included', es: 'Plantillas incluidas' },
  },
];

const FEATURES = [
  { icon: Briefcase, en: 'Employment law guidance', es: 'Guía de derecho laboral' },
  { icon: FileText, en: 'Contract review assistance', es: 'Revisión de contratos' },
  { icon: Shield, en: 'Compliance monitoring', es: 'Monitoreo de cumplimiento' },
  { icon: Scale, en: 'HR policy templates', es: 'Plantillas de políticas de RRHH' },
  { icon: Users, en: 'Multi-user team access', es: 'Acceso para equipos' },
  { icon: Lock, en: 'SOC 2 compliant security', es: 'Seguridad SOC 2' },
];

export default function BusinessLanding() {
  const { language } = useLanguage();
  const { trackPageVisit } = usePersonalization();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackPageVisit('/business');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const utm = getStoredUTM();
    trackCTAClick('biz-lead-capture', '/business');
    try {
      await supabase.from('lead_captures').insert({
        email: email.trim(),
        source: 'business_landing',
        persona: 'smb',
        language,
        metadata: { ...utm },
      });
    } catch {
      const leads = JSON.parse(localStorage.getItem('ezlegal_leads') || '[]');
      leads.push({ email: email.trim(), source: 'business_landing', ts: Date.now() });
      localStorage.setItem('ezlegal_leads', JSON.stringify(leads));
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 min-h-[60vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-4 py-1.5 mb-6">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span className="text-sm text-teal-300 font-medium">
                    {en ? 'For Small Businesses' : 'Para Pequeños Negocios'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                  {en
                    ? 'Stop overpaying for legal help your business needs'
                    : 'Deja de pagar de más por la ayuda legal que tu negocio necesita'
                  }
                </h1>

                <p className="text-lg text-navy-100 mb-8 leading-relaxed">
                  {en
                    ? 'AI-powered legal guidance for employment, contracts, compliance, and more. From $99/month — a fraction of traditional attorney fees.'
                    : 'Orientación legal con IA para empleo, contratos, cumplimiento y más. Desde $99/mes — una fracción de los costos tradicionales.'
                  }
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/ask')}
                    data-cta="biz-hero-primary"
                    className="group bg-teal-500 hover:bg-teal-400 text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {en ? 'Try Free — No Card Required' : 'Prueba Gratis — Sin Tarjeta'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center gap-2 text-white border border-white/30 hover:border-white/60 px-6 py-3.5 rounded-xl transition-all font-medium"
                  >
                    {en ? 'See Plans' : 'Ver Planes'}
                  </Link>
                </div>
              </div>

              {/* ROI Calculator Mini */}
              <div className="hidden lg:block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="w-5 h-5 text-teal-400" />
                  <span className="text-white font-semibold">
                    {en ? 'Quick ROI' : 'ROI Rápido'}
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-navy-200">
                    <span>{en ? 'Traditional attorney (5 hrs/mo)' : 'Abogado tradicional (5 hrs/mes)'}</span>
                    <span className="text-white font-bold">$1,500/mo</span>
                  </div>
                  <div className="flex justify-between text-navy-200">
                    <span>ezLegal.ai Business Pro</span>
                    <span className="text-teal-400 font-bold">$249/mo</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-white font-semibold">{en ? 'Annual savings' : 'Ahorro anual'}</span>
                    <span className="text-teal-400 font-bold text-lg">$15,012</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-14 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {PAIN_POINTS.map(({ icon: Icon, problem, solution }, i) => (
                <div key={i} className="relative p-5 rounded-xl border border-slate-200 bg-slate-50">
                  <Icon className="w-8 h-8 text-navy-300 mb-3" />
                  <p className="text-sm text-navy-500 line-through mb-2">
                    {en ? problem.en : problem.es}
                  </p>
                  <p className="text-base font-semibold text-teal-700">
                    {en ? solution.en : solution.es}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-navy-900 mb-3">
                {en ? 'Everything your team needs' : 'Todo lo que tu equipo necesita'}
              </h2>
              <p className="text-lg text-navy-500">
                {en
                  ? 'AI-powered legal tools built for business operations'
                  : 'Herramientas legales con IA para operaciones de negocio'
                }
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, en: enLabel, es: esLabel }, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-slate-100 bg-white hover:border-teal-200 hover:shadow-sm transition-all">
                  <span className="inline-flex items-center justify-center w-9 h-9 bg-teal-50 rounded-lg flex-shrink-0">
                    <Icon className="w-4 h-4 text-teal-600" />
                  </span>
                  <span className="text-navy-800 font-medium text-sm">
                    {en ? enLabel : esLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 bg-navy-50 border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-navy-600">
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                <span className="font-semibold">500+</span> {en ? 'businesses served' : 'negocios atendidos'}
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-600" />
                <span className="font-semibold">30s</span> {en ? 'avg response time' : 'tiempo promedio'}
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <span className="font-semibold">SOC 2</span> {en ? 'compliant' : 'certificado'}
              </span>
            </div>
          </div>
        </section>

        {/* Lead Capture */}
        <section className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
          <div className="max-w-xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {en ? 'Get a free business legal checkup' : 'Obtén una revisión legal gratuita'}
            </h2>
            <p className="text-navy-100 mb-8">
              {en
                ? 'Enter your email and we\'ll send a personalized compliance checklist for your industry.'
                : 'Ingresa tu email y te enviamos una lista de cumplimiento personalizada.'
              }
            </p>

            {submitted ? (
              <div className="flex items-center justify-center gap-2 text-teal-300 font-semibold">
                <CheckCircle className="w-5 h-5" />
                {en ? 'Check your inbox!' : '¡Revisa tu correo!'}
              </div>
            ) : (
              <form onSubmit={handleLeadCapture} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={en ? 'you@company.com' : 'tu@empresa.com'}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  data-cta="biz-lead-capture"
                  className="bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-60"
                >
                  {submitting
                    ? (en ? 'Sending...' : 'Enviando...')
                    : (en ? 'Get Free Checkup' : 'Obtener Gratis')
                  }
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 text-center text-xs text-navy-500">
            <p>
              {en
                ? 'ezLegal.ai provides legal information, not legal advice. We are not a law firm. No attorney-client relationship is created by using this service. For representation, consult a licensed attorney.'
                : 'ezLegal.ai proporciona información legal, no asesoramiento legal. No somos un bufete de abogados. No se crea relación abogado-cliente. Para representación, consulta a un abogado con licencia.'
              }
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
