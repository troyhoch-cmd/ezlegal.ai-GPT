import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Puzzle, Code, Building2, Shield, ArrowRight, CheckCircle,
  Globe, Users, Zap, Lock, Heart, BarChart3, Headphones
} from 'lucide-react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePersonalization } from '../../contexts/PersonalizationContext';
import { supabase } from '../../lib/supabase';
import { trackCTAClick, getStoredUTM } from '../../lib/utm';

const PARTNER_TYPES = [
  {
    icon: Heart,
    title: { en: 'Legal Aid Organizations', es: 'Organizaciones de Ayuda Legal' },
    desc: {
      en: 'Extend your reach with AI-powered triage. Serve more clients without more staff.',
      es: 'Amplía tu alcance con triaje por IA. Atiende más clientes sin más personal.',
    },
  },
  {
    icon: Building2,
    title: { en: 'Law Firms', es: 'Bufetes de Abogados' },
    desc: {
      en: 'White-label AI intake for your practice. Qualify leads 24/7.',
      es: 'IA de marca blanca para tu práctica. Califica prospectos 24/7.',
    },
  },
  {
    icon: Globe,
    title: { en: 'Community Organizations', es: 'Organizaciones Comunitarias' },
    desc: {
      en: 'Embed bilingual legal help on your website. Help your community navigate legal issues.',
      es: 'Integra ayuda legal bilingüe en tu sitio. Ayuda a tu comunidad.',
    },
  },
];

const INTEGRATION_OPTIONS = [
  {
    icon: Puzzle,
    name: { en: 'Embed Widget', es: 'Widget Embebido' },
    price: '$79/mo',
    desc: { en: '5-minute setup, no developers needed', es: 'Configuración en 5 minutos, sin desarrolladores' },
  },
  {
    icon: Code,
    name: { en: 'API Access', es: 'Acceso API' },
    price: '$0.02/query',
    desc: { en: 'Full control for custom integrations', es: 'Control total para integraciones personalizadas' },
  },
  {
    icon: Building2,
    name: { en: 'White-Label', es: 'Marca Blanca' },
    price: 'Custom',
    desc: { en: 'Your brand, our AI. Enterprise SLA.', es: 'Tu marca, nuestra IA. SLA empresarial.' },
  },
];

export default function PartnersLanding() {
  const { language } = useLanguage();
  const { trackPageVisit } = usePersonalization();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', org: '', type: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackPageVisit('/partners');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const en = language === 'en';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.name.trim()) return;
    setSubmitting(true);
    const utm = getStoredUTM();
    trackCTAClick('partner-form-submit', '/partners');
    try {
      await supabase.from('lead_captures').insert({
        email: formData.email.trim(),
        source: 'partner_landing',
        persona: 'partner',
        language,
        metadata: { name: formData.name, org: formData.org, type: formData.type, ...utm },
      });
    } catch {
      const leads = JSON.parse(localStorage.getItem('ezlegal_leads') || '[]');
      leads.push({ ...formData, source: 'partner_landing', ts: Date.now() });
      localStorage.setItem('ezlegal_leads', JSON.stringify(leads));
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 min-h-[55vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Users className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-white font-medium">
                {en ? 'Partner Program' : 'Programa de Socios'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
              {en
                ? 'Bring AI-powered legal help to your community'
                : 'Lleva ayuda legal con IA a tu comunidad'
              }
            </h1>

            <p className="text-lg text-navy-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              {en
                ? 'Whether you\'re a legal aid org, law firm, or community group — integrate ezLegal.ai to serve more people, faster.'
                : 'Ya seas una organización de ayuda legal, bufete o grupo comunitario — integra ezLegal.ai para servir a más personas, más rápido.'
              }
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#partner-form"
                data-cta="partner-hero-primary"
                className="group bg-teal-500 hover:bg-teal-400 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {en ? 'Apply to Partner' : 'Solicitar Asociación'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                to="/schedule-demo"
                className="inline-flex items-center gap-2 text-white border border-white/30 hover:border-white/60 px-6 py-3.5 rounded-xl transition-all font-medium"
              >
                {en ? 'Schedule Demo' : 'Agendar Demo'}
              </Link>
            </div>
          </div>
        </section>

        {/* Partner Types */}
        <section className="py-14 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 text-center mb-10">
              {en ? 'Who we partner with' : 'Con quiénes nos asociamos'}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {PARTNER_TYPES.map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="p-6 rounded-xl border border-slate-200 hover:border-teal-200 hover:shadow-md transition-all">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-teal-50 rounded-xl mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </span>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">
                    {en ? title.en : title.es}
                  </h3>
                  <p className="text-sm text-navy-600 leading-relaxed">
                    {en ? desc.en : desc.es}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Options */}
        <section className="py-14 bg-navy-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 text-center mb-10">
              {en ? 'Integration options' : 'Opciones de integración'}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {INTEGRATION_OPTIONS.map(({ icon: Icon, name, price, desc }, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                  <span className="inline-flex items-center justify-center w-11 h-11 bg-navy-100 rounded-xl mb-4">
                    <Icon className="w-5 h-5 text-navy-700" />
                  </span>
                  <h3 className="font-bold text-navy-900 mb-1">
                    {en ? name.en : name.es}
                  </h3>
                  <p className="text-teal-600 font-bold text-lg mb-2">{price}</p>
                  <p className="text-sm text-navy-500">
                    {en ? desc.en : desc.es}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-10 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-10 text-center">
            {[
              { stat: '10,000+', label: en ? 'people served' : 'personas atendidas' },
              { stat: '85%', label: en ? 'resolution without attorney' : 'resolución sin abogado' },
              { stat: '<30s', label: en ? 'average response' : 'respuesta promedio' },
              { stat: '2', label: en ? 'languages (EN/ES)' : 'idiomas (EN/ES)' },
            ].map(({ stat, label }) => (
              <div key={stat}>
                <div className="text-2xl font-bold text-navy-900">{stat}</div>
                <div className="text-sm text-navy-500">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Partner Application Form */}
        <section id="partner-form" className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
          <div className="max-w-lg mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-3">
              {en ? 'Become a partner' : 'Conviértete en socio'}
            </h2>
            <p className="text-center text-navy-200 mb-8">
              {en
                ? 'Tell us about your organization and we\'ll reach out within 24 hours.'
                : 'Cuéntanos sobre tu organización y te contactaremos en 24 horas.'
              }
            </p>

            {submitted ? (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-white mb-2">
                  {en ? 'Application received!' : '¡Solicitud recibida!'}
                </p>
                <p className="text-navy-200">
                  {en ? 'We\'ll be in touch within 24 hours.' : 'Te contactaremos en 24 horas.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="partner-name" className="block text-sm font-medium text-navy-200 mb-1">
                    {en ? 'Your name' : 'Tu nombre'}
                  </label>
                  <input
                    id="partner-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label htmlFor="partner-email" className="block text-sm font-medium text-navy-200 mb-1">
                    {en ? 'Work email' : 'Email de trabajo'}
                  </label>
                  <input
                    id="partner-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label htmlFor="partner-org" className="block text-sm font-medium text-navy-200 mb-1">
                    {en ? 'Organization' : 'Organización'}
                  </label>
                  <input
                    id="partner-org"
                    type="text"
                    value={formData.org}
                    onChange={(e) => setFormData(prev => ({ ...prev, org: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label htmlFor="partner-type" className="block text-sm font-medium text-navy-200 mb-1">
                    {en ? 'Organization type' : 'Tipo de organización'}
                  </label>
                  <select
                    id="partner-type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="" className="text-navy-900">{en ? 'Select...' : 'Seleccionar...'}</option>
                    <option value="legal_aid" className="text-navy-900">{en ? 'Legal Aid Organization' : 'Organización de Ayuda Legal'}</option>
                    <option value="law_firm" className="text-navy-900">{en ? 'Law Firm' : 'Bufete de Abogados'}</option>
                    <option value="nonprofit" className="text-navy-900">{en ? 'Nonprofit / Community Org' : 'ONG / Organización Comunitaria'}</option>
                    <option value="government" className="text-navy-900">{en ? 'Government Agency' : 'Agencia Gubernamental'}</option>
                    <option value="other" className="text-navy-900">{en ? 'Other' : 'Otro'}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  data-cta="partner-form-submit"
                  className="w-full bg-teal-500 hover:bg-teal-400 text-white py-3.5 rounded-lg font-bold transition-all disabled:opacity-60 mt-2"
                >
                  {submitting
                    ? (en ? 'Submitting...' : 'Enviando...')
                    : (en ? 'Submit Application' : 'Enviar Solicitud')
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
                ? 'ezLegal.ai provides legal information technology. Partner integrations provide legal information to end users, not legal advice. Each partner is responsible for compliance with their jurisdiction\'s ethical rules.'
                : 'ezLegal.ai proporciona tecnología de información legal. Las integraciones para socios proveen información legal, no asesoramiento. Cada socio es responsable del cumplimiento ético en su jurisdicción.'
              }
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
