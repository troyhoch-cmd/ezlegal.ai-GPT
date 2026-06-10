import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Users, Globe, Shield, ArrowRight, CheckCircle, Zap, BookOpen, Headphones as HeadphonesIcon, TrendingUp, ChevronRight, ExternalLink, Handshake, DollarSign, Lock, FileText, Heart, Megaphone, QrCode, LineChart, UserCheck, Code, ChevronDown, Star } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const PARTNER_MODELS = [
  {
    id: 'referral',
    icon: Megaphone,
    color: 'teal',
    startingAt: { en: 'Free to join', es: 'Gratis para unirse' },
    en: {
      name: 'Referral Partner',
      tagline: 'Share. Refer. Earn.',
      description: 'Share ezLegal with your community using your custom link, QR codes, and branded materials. You earn revenue share on every referred user who becomes a paid subscriber.',
      idealFor: 'Nonprofits, churches, community organizations, legal clinics, ESL programs',
      economics: [
        '20% revenue share on referred paid conversions',
        'No minimum volume requirements',
        'Monthly payouts via direct deposit',
        'Real-time referral tracking dashboard',
      ],
      commitments: [
        'Share resources with your community',
        'Display QR codes and flyers in your space',
        'Report quarterly on community reach',
      ],
    },
    es: {
      name: 'Aliado de Referencia',
      tagline: 'Comparte. Refiere. Gana.',
      description: 'Comparte ezLegal con tu comunidad usando tu enlace personalizado, codigos QR y materiales de marca. Ganas comision por cada usuario referido que se convierte en suscriptor.',
      idealFor: 'ONGs, iglesias, organizaciones comunitarias, clinicas legales, programas de ESL',
      economics: [
        '20% de comision sobre conversiones de pago referidas',
        'Sin requisitos minimos de volumen',
        'Pagos mensuales por deposito directo',
        'Panel de seguimiento de referidos en tiempo real',
      ],
      commitments: [
        'Compartir recursos con tu comunidad',
        'Colocar codigos QR y volantes en tu espacio',
        'Reportar trimestralmente sobre alcance comunitario',
      ],
    },
  },
  {
    id: 'sponsored',
    icon: Heart,
    color: 'green',
    highlight: true,
    startingAt: { en: 'From $2/member/mo', es: 'Desde $2/miembro/mes' },
    en: {
      name: 'Community Access Partner',
      tagline: 'Sponsor access for your members.',
      description: 'Pay a per-member or flat monthly fee so your community, clients, or constituents can access ezLegal for free on a branded portal with your logo and reporting.',
      idealFor: 'Government agencies, counties, large nonprofits with grant funding, bar associations, United Way chapters',
      economics: [
        'Per-member pricing starting at $2/member/month',
        'Flat-fee options for organizations under 500 members',
        'Volume discounts for 1,000+ members',
        'Grant-compatible invoicing and reporting',
      ],
      commitments: [
        'Define and verify your community/member base',
        'Co-brand deployment with your logo and colors',
        'Participate in quarterly impact review',
        'Minimum 6-month engagement',
      ],
    },
    es: {
      name: 'Aliado de Acceso Comunitario',
      tagline: 'Patrocina acceso para tus miembros.',
      description: 'Paga por miembro o tarifa mensual fija para que tu comunidad, clientes o constituyentes accedan a ezLegal gratis en un portal con tu marca y reportes.',
      idealFor: 'Agencias gubernamentales, condados, grandes ONGs con financiamiento, colegios de abogados, capitulos de United Way',
      economics: [
        'Precio por miembro desde $2/miembro/mes',
        'Opciones de tarifa fija para organizaciones con menos de 500 miembros',
        'Descuentos por volumen para 1,000+ miembros',
        'Facturacion y reportes compatibles con subvenciones',
      ],
      commitments: [
        'Definir y verificar tu base comunitaria/miembros',
        'Co-brandar el despliegue con tu logo y colores',
        'Participar en revision de impacto trimestral',
        'Compromiso minimo de 6 meses',
      ],
    },
  },
  {
    id: 'whitelabel',
    icon: Building2,
    color: 'navy',
    startingAt: { en: 'Custom pricing', es: 'Precio personalizado' },
    en: {
      name: 'White-Label Partner',
      tagline: 'Your brand. Our AI. Their trust.',
      description: 'Deploy the full ezLegal platform under your own brand with a custom domain, dedicated infrastructure, and tailored AI configuration. No ezLegal branding visible to your end users.',
      idealFor: 'Legal aid networks, state bar associations, large law firms, enterprise legal departments, technology integrators',
      economics: [
        'Platform licensing fee (annual contract)',
        'Usage-based tiers with predictable billing',
        'Custom SLA with uptime guarantees',
        'Pricing structured for enterprise procurement',
      ],
      commitments: [
        'Dedicated integration and brand alignment',
        'Minimum 12-month contract',
        'Designated partner success contact',
        'Quarterly business reviews',
      ],
    },
    es: {
      name: 'Aliado de Marca Blanca',
      tagline: 'Tu marca. Nuestra IA. Su confianza.',
      description: 'Despliega la plataforma completa de ezLegal bajo tu propia marca con dominio personalizado, infraestructura dedicada y configuracion de IA adaptada.',
      idealFor: 'Redes de ayuda legal, colegios de abogados estatales, grandes firmas de abogados, departamentos legales empresariales, integradores de tecnologia',
      economics: [
        'Licencia de plataforma (contrato anual)',
        'Niveles basados en uso con facturacion predecible',
        'SLA personalizado con garantias de disponibilidad',
        'Precios estructurados para adquisiciones empresariales',
      ],
      commitments: [
        'Integracion dedicada y alineacion de marca',
        'Contrato minimo de 12 meses',
        'Contacto designado para exito del aliado',
        'Revisiones de negocio trimestrales',
      ],
    },
  },
];

const PARTNER_BENEFITS = [
  {
    icon: LineChart,
    en: { title: 'Partner Dashboard', desc: 'Real-time analytics on referrals, usage, conversions, and community impact -- all in one place.' },
    es: { title: 'Panel de Aliado', desc: 'Analitica en tiempo real sobre referidos, uso, conversiones e impacto comunitario -- todo en un solo lugar.' },
  },
  {
    icon: Globe,
    en: { title: 'Bilingual by Default', desc: 'All partner materials, flyers, social posts, and the platform itself are available in English and Spanish.' },
    es: { title: 'Bilingue por Defecto', desc: 'Todos los materiales, volantes, posts sociales y la plataforma estan disponibles en ingles y espanol.' },
  },
  {
    icon: QrCode,
    en: { title: 'Branded Materials', desc: 'Custom QR codes, printable flyers, social media templates, and co-branded collateral -- ready to distribute.' },
    es: { title: 'Materiales de Marca', desc: 'Codigos QR personalizados, volantes impresos, plantillas para redes sociales y material co-branded -- listos para distribuir.' },
  },
  {
    icon: UserCheck,
    en: { title: 'Dedicated Partner Success', desc: 'Every partner gets a named success manager for onboarding, troubleshooting, and quarterly reviews.' },
    es: { title: 'Exito de Aliado Dedicado', desc: 'Cada aliado tiene un gerente de exito asignado para incorporacion, resolucion de problemas y revisiones trimestrales.' },
  },
  {
    icon: FileText,
    en: { title: 'Impact Reporting', desc: 'Monthly reports on users served, questions answered, topics covered, and community demographics.' },
    es: { title: 'Reportes de Impacto', desc: 'Reportes mensuales sobre usuarios atendidos, preguntas respondidas, temas cubiertos y demografia comunitaria.' },
  },
  {
    icon: Shield,
    en: { title: 'Compliance & Security', desc: 'SOC 2-aligned security, clear UPL disclaimers, data privacy controls, and audit-ready documentation.' },
    es: { title: 'Cumplimiento y Seguridad', desc: 'Seguridad alineada con SOC 2, avisos claros de UPL, controles de privacidad de datos y documentacion lista para auditoria.' },
  },
];

const PIPELINE_STEPS = [
  { en: 'Apply', es: 'Solicitar', icon: BookOpen },
  { en: 'Discovery Call', es: 'Llamada Inicial', icon: HeadphonesIcon },
  { en: 'Pilot (30 days)', es: 'Piloto (30 dias)', icon: Zap },
  { en: 'Onboarding', es: 'Incorporacion', icon: Star },
  { en: 'Go Live', es: 'En Vivo', icon: TrendingUp },
];

function getModelColors(color: string) {
  const map: Record<string, { bg: string; border: string; accent: string; icon: string }> = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'text-teal-700', icon: 'text-teal-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', accent: 'text-green-700', icon: 'text-green-600' },
    navy: { bg: 'bg-navy-50', border: 'border-navy-200', accent: 'text-navy-700', icon: 'text-navy-600' },
  };
  return map[color] || map.teal;
}

export default function PartnerHub() {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const { user } = useAuth();
  const es = language === 'es';
  const [searchParams] = useSearchParams();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    organization_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    partner_model: '',
    partner_type: 'nonprofit',
    community_size: '',
    language_preference: language,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, notes: `Referral: ${ref}` }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(false);
    try {
      const { error } = await supabase.from('partners').insert({
        organization_name: formData.organization_name,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || null,
        website: formData.website || null,
        partner_type: formData.partner_type,
        language_preference: formData.language_preference,
        notes: [
          formData.partner_model ? `Model: ${formData.partner_model}` : '',
          formData.community_size ? `Community Size: ${formData.community_size}` : '',
          formData.notes,
        ].filter(Boolean).join(' | '),
        pipeline_stage: 'lead',
        source: searchParams.get('utm_source') || 'partner_hub',
        metadata: {
          utm_campaign: searchParams.get('utm_campaign'),
          utm_medium: searchParams.get('utm_medium'),
          referral_code: searchParams.get('ref'),
          selected_model: formData.partner_model,
          community_size: formData.community_size,
        },
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      setSubmitError(true);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">

        <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-6">
                <Handshake className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-teal-300">
                  {es ? 'Programa de Alianzas' : 'Partner Program'}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {es
                  ? 'Lleva Acceso Legal a Tu Comunidad'
                  : 'Bring Legal Access to Your Community'}
              </h1>
              <p className="text-lg text-navy-200 mb-4 leading-relaxed">
                {es
                  ? 'Ya seas una ONG compartiendo recursos, un gobierno patrocinando acceso, o una empresa desplegando nuestra IA bajo tu marca -- hay un modelo de alianza para ti.'
                  : "Whether you're a nonprofit sharing resources, a government sponsoring access, or an enterprise deploying our AI under your brand -- there's a partnership model for you."}
              </p>
              <p className="text-sm text-navy-400 mb-8">
                {es
                  ? 'Buscas comprar ezLegal directamente para tu organizacion?'
                  : 'Looking to buy ezLegal directly for your organization?'}
                {' '}
                <Link to="/pricing" className="text-teal-400 hover:text-teal-300 underline">
                  {es ? 'Ver Planes y Precios' : 'See Plans & Pricing'}
                </Link>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                    >
                      {es ? 'Acceder al Portal de Aliados' : 'Access Partner Portal'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="#apply"
                      className="inline-flex items-center gap-2 px-8 py-3.5 border border-navy-500 text-white rounded-xl font-semibold hover:bg-navy-700 transition-all"
                    >
                      {es ? 'Solicitar Nuevo Modelo' : 'Apply for a New Model'}
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="#apply"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                    >
                      {es ? 'Solicitar Alianza' : 'Apply to Partner'}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <Link
                      to="/schedule-demo"
                      className="inline-flex items-center gap-2 px-8 py-3.5 border border-navy-500 text-white rounded-xl font-semibold hover:bg-navy-700 transition-all"
                    >
                      {es ? 'Agendar Llamada' : 'Schedule a Discovery Call'}
                    </Link>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 border-t border-navy-700/50 pt-8">
                {[
                  { value: '50', en: 'U.S. States', es: 'Estados' },
                  { value: '24/7', en: 'AI Availability', es: 'Disponibilidad IA' },
                  { value: '99.9%', en: 'Target Uptime', es: 'Meta de Disponibilidad' },
                  { value: '2', en: 'Languages', es: 'Idiomas' },
                ].map(stat => (
                  <div key={stat.en} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-navy-400 mt-1">{es ? stat.es : stat.en}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-navy-50 border border-navy-200 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-sm mb-1">
                    {es ? 'Quieres ofrecer ezLegal a tu comunidad?' : 'Want to offer ezLegal to your community?'}
                  </h3>
                  <p className="text-xs text-navy-600 mb-2">
                    {es
                      ? 'Estas en el lugar correcto. Explora nuestros modelos de alianza abajo.'
                      : "You're in the right place. Explore our partnership models below."}
                  </p>
                  <a href="#models" className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                    {es ? 'Ver modelos' : 'See models'} <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="bg-navy-50 border border-navy-200 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-navy-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-navy-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-sm mb-1">
                    {es ? 'Comprando para uso interno de tu organizacion?' : "Buying for your organization's internal use?"}
                  </h3>
                  <p className="text-xs text-navy-600 mb-2">
                    {es
                      ? 'Consulta nuestros planes directos de suscripcion para organizaciones en la pagina de precios.'
                      : 'Check our direct subscription plans for organizations on the pricing page.'}
                  </p>
                  <Link to="/pricing?tab=organizations" className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                    {es ? 'Ver precios' : 'View pricing'} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="models" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Como Quieres Trabajar con Nosotros?' : 'How Do You Want to Work With Us?'}
              </h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                {es
                  ? 'Elige el modelo que se ajuste a tu organizacion. Cada uno tiene su propia estructura economica, compromisos y herramientas.'
                  : 'Choose the model that fits your organization. Each has its own economics, commitments, and enablement tools.'}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {PARTNER_MODELS.map(model => {
                const m = es ? model.es : model.en;
                const colors = getModelColors(model.color);
                const Icon = model.icon;
                return (
                  <div
                    key={model.id}
                    className={`relative rounded-2xl border-2 ${
                      model.highlight ? 'border-green-400 shadow-xl shadow-green-100' : colors.border
                    } bg-white overflow-hidden flex flex-col`}
                  >
                    {model.highlight && (
                      <div className="bg-green-600 text-white text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                        {es ? 'Mas Solicitado' : 'Most Requested'}
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-navy-900">{m.name}</h3>
                          <p className={`text-sm ${colors.accent} font-medium`}>{m.tagline}</p>
                        </div>
                      </div>
                      <div className={`${colors.bg} rounded-lg px-3 py-2 mb-4`}>
                        <span className={`text-lg font-bold ${colors.accent}`}>
                          {es ? model.startingAt.es : model.startingAt.en}
                        </span>
                      </div>

                      <p className="text-sm text-navy-600 mb-4 leading-relaxed">{m.description}</p>

                      <div className="mb-4">
                        <span className={`text-xs font-bold uppercase tracking-wider ${colors.accent}`}>
                          {es ? 'Ideal para' : 'Ideal for'}
                        </span>
                        <p className="text-xs text-navy-500 mt-1">{m.idealFor}</p>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <DollarSign className={`w-3.5 h-3.5 ${colors.icon}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${colors.accent}`}>
                            {es ? 'Economia' : 'Economics'}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {m.economics.map(item => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle className={`w-3.5 h-3.5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                              <span className="text-xs text-navy-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Handshake className={`w-3.5 h-3.5 ${colors.icon}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${colors.accent}`}>
                            {es ? 'Tu Compromiso' : 'Your Commitment'}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {m.commitments.map(item => (
                            <li key={item} className="flex items-start gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-navy-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <a
                        href="#apply"
                        className={`mt-auto block text-center py-3 rounded-xl font-semibold transition-all text-sm ${
                          model.highlight
                            ? 'bg-green-600 text-white hover:bg-green-500'
                            : 'bg-navy-900 text-white hover:bg-navy-800'
                        }`}
                      >
                        {es ? `Solicitar: ${m.name}` : `Apply: ${m.name}`}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-navy-500">
                {es
                  ? 'No sabes cual modelo es el adecuado?'
                  : "Not sure which model is right?"}
                {' '}
                <Link to="/schedule-demo" className="text-teal-600 hover:text-teal-700 font-semibold underline">
                  {es ? 'Habla con nuestro equipo' : 'Talk to our team'}
                </Link>
                {' '}
                {es ? '-- te ayudamos a elegir.' : "-- we'll help you decide."}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Lo Que Recibe Cada Aliado' : 'What Every Partner Gets'}
              </h2>
              <p className="text-navy-600 max-w-xl mx-auto">
                {es
                  ? 'Sin importar el modelo que elijas, todos los aliados reciben estas herramientas y soporte.'
                  : 'Regardless of which model you choose, every partner receives these tools and support.'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PARTNER_BENEFITS.map(benefit => {
                const b = es ? benefit.es : benefit.en;
                const Icon = benefit.icon;
                return (
                  <div key={b.title} className="bg-white rounded-xl p-6 border border-navy-100 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="font-bold text-navy-900 mb-1">{b.title}</h3>
                    <p className="text-sm text-navy-600 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Pruebas y Seguridad' : 'Proof & Risk Controls'}
              </h2>
              <p className="text-navy-600 max-w-xl mx-auto">
                {es
                  ? 'Sabemos que las alianzas en tecnologia legal requieren confianza. Esto es lo que puedes compartir con tu equipo legal y de adquisiciones.'
                  : 'We know LegalTech partnerships require trust. Here is what you can share with your legal and procurement teams.'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-navy-50 rounded-xl p-6 border border-navy-100">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-navy-700" />
                  <h3 className="font-bold text-navy-900">{es ? 'Seguridad de Datos' : 'Data Security'}</h3>
                </div>
                <ul className="space-y-2 text-sm text-navy-600">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Cifrado AES-256 en reposo y en transito' : 'AES-256 encryption at rest and in transit'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Controles de acceso alineados con SOC 2' : 'SOC 2-aligned access controls'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Politicas de retencion de datos configurables' : 'Configurable data retention policies'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'DPA disponible para aliados empresariales' : 'DPA available for enterprise partners'}</li>
                </ul>
              </div>
              <div className="bg-navy-50 rounded-xl p-6 border border-navy-100">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-navy-700" />
                  <h3 className="font-bold text-navy-900">{es ? 'Limites de la IA y UPL' : 'AI Boundaries & UPL'}</h3>
                </div>
                <ul className="space-y-2 text-sm text-navy-600">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Avisos claros: informacion legal, no asesoria legal' : 'Clear disclaimers: legal information, not legal advice'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Nunca se implica relacion abogado-cliente' : 'No attorney-client relationship implied'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Escalamiento a abogados reales integrado' : 'Escalation to real attorneys built in'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Registros de auditoria para cumplimiento y gobernanza' : 'Audit logs for compliance and governance'}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">
              {es ? 'Como Funciona' : 'How It Works'}
            </h2>
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              {PIPELINE_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.en} className="flex-1 flex flex-col items-center text-center relative">
                    <div className="w-14 h-14 bg-teal-50 border-2 border-teal-200 rounded-full flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
                      {es ? `Paso ${index + 1}` : `Step ${index + 1}`}
                    </div>
                    <p className="font-semibold text-navy-900 text-sm">{es ? step.es : step.en}</p>
                    {index < PIPELINE_STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed border-navy-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Preguntas Frecuentes de Aliados' : 'Partner Program FAQ'}
              </h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  en: { q: 'How do partners make money?', a: 'Referral Partners earn 20% revenue share on every paid subscriber they refer. Community Access Partners negotiate per-member or flat-fee pricing funded by grants or organizational budgets. White-Label Partners license the platform at an annual contract rate with usage-based tiers.' },
                  es: { q: 'Como ganan dinero los aliados?', a: 'Los Aliados de Referencia ganan 20% de comision por cada suscriptor pagado que refieren. Los Aliados de Acceso Comunitario negocian precios por miembro o tarifa fija financiados por subvenciones o presupuestos organizacionales. Los Aliados de Marca Blanca licencian la plataforma con contrato anual y niveles basados en uso.' },
                },
                {
                  en: { q: 'What are the eligibility requirements?', a: 'We partner with nonprofits, legal aid organizations, government agencies, bar associations, community organizations, churches, and enterprises. You need a defined community or member base and a willingness to participate in quarterly impact reviews. There are no minimum size requirements for Referral Partners.' },
                  es: { q: 'Cuales son los requisitos de elegibilidad?', a: 'Nos asociamos con ONGs, organizaciones de ayuda legal, agencias gubernamentales, colegios de abogados, organizaciones comunitarias, iglesias y empresas. Necesitas una base comunitaria o de miembros definida y disposicion a participar en revisiones de impacto trimestrales. No hay requisitos minimos de tamano para Aliados de Referencia.' },
                },
                {
                  en: { q: 'How long does the onboarding process take?', a: 'Referral Partners can be active within 48 hours after approval. Community Access Partners typically launch within 2-4 weeks depending on co-branding requirements. White-Label deployments take 4-8 weeks for full brand alignment and infrastructure setup.' },
                  es: { q: 'Cuanto tiempo toma el proceso de incorporacion?', a: 'Los Aliados de Referencia pueden estar activos dentro de 48 horas despues de la aprobacion. Los Aliados de Acceso Comunitario generalmente lanzan en 2-4 semanas dependiendo de los requisitos de co-branding. Las implementaciones de Marca Blanca toman 4-8 semanas para la alineacion completa de marca e infraestructura.' },
                },
                {
                  en: { q: 'Is there a cost to become a partner?', a: 'Referral Partners pay nothing -- you earn from referrals. Community Access Partners pay per-member pricing (starting at $2/member/month) or negotiate flat-fee options. White-Label Partners pay annual platform licensing. All models include partner success support at no extra cost.' },
                  es: { q: 'Hay algun costo para convertirse en aliado?', a: 'Los Aliados de Referencia no pagan nada -- ganan por referidos. Los Aliados de Acceso Comunitario pagan precio por miembro (desde $2/miembro/mes) o negocian opciones de tarifa fija. Los Aliados de Marca Blanca pagan licencia anual de plataforma. Todos los modelos incluyen soporte de exito de aliado sin costo adicional.' },
                },
                {
                  en: { q: 'Can I use grant funding to pay for a partnership?', a: 'Yes. Our Community Access and White-Label models are structured for grant-compatible invoicing. We provide impact reporting, demographic tracking, and funder-ready documentation to support your grant requirements.' },
                  es: { q: 'Puedo usar fondos de subvenciones para pagar una alianza?', a: 'Si. Nuestros modelos de Acceso Comunitario y Marca Blanca estan estructurados para facturacion compatible con subvenciones. Proporcionamos informes de impacto, seguimiento demografico y documentacion lista para financiadores para apoyar tus requisitos de subvencion.' },
                },
                {
                  en: { q: 'What if I need technical integration (API, widgets)?', a: 'Visit our Technical Integration page for details on embed widgets, API access, and white-label deployment options with full pricing and comparison tables.' },
                  es: { q: 'Que pasa si necesito integracion tecnica (API, widgets)?', a: 'Visita nuestra pagina de Integracion Tecnica para detalles sobre widgets embebidos, acceso a API y opciones de implementacion de marca blanca con precios y tablas comparativas completas.' },
                },
              ].map((faq, idx) => {
                const f = es ? faq.es : faq.en;
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-navy-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-navy-50 transition-colors"
                    >
                      <span className="font-semibold text-navy-900 pr-4">{f.q}</span>
                      <ChevronDown className={`w-5 h-5 text-navy-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <p className="text-sm text-navy-600 leading-relaxed">{f.a}</p>
                        {idx === 5 && (
                          <Link to="/for-partners" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-semibold mt-2">
                            {es ? 'Ver Integracion Tecnica' : 'View Technical Integration'} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 bg-navy-50 border-y border-navy-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-navy-200 p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Code className="w-8 h-8 text-teal-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-navy-900 mb-2">
                  {es ? 'Necesitas Integracion Tecnica?' : 'Need Technical Integration?'}
                </h3>
                <p className="text-sm text-navy-600 mb-1">
                  {es
                    ? 'Para equipos de desarrollo que quieren integrar via API, incrustar widgets, o desplegar una solucion de marca blanca completa.'
                    : 'For development teams looking to integrate via API, embed widgets, or deploy a full white-label solution.'}
                </p>
                <p className="text-xs text-navy-500">
                  {es
                    ? 'Widget desde $79/mes -- API a $0.02/consulta -- Marca Blanca a precio personalizado'
                    : 'Widget from $79/mo -- API at $0.02/query -- White-Label custom pricing'}
                </p>
              </div>
              <Link
                to="/for-partners"
                className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-800 transition-all flex-shrink-0"
              >
                {es ? 'Ver Opciones Tecnicas' : 'View Technical Options'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="apply" className="py-16 bg-navy-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Solicitar Alianza' : 'Apply to Partner'}
              </h2>
              <p className="text-navy-600">
                {es
                  ? 'Completa el formulario y nuestro equipo se pondra en contacto dentro de 2 dias habiles.'
                  : "Fill out the form below and our team will be in touch within 2 business days."}
              </p>
            </div>

            {submitted ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-navy-200 shadow-sm">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy-900 mb-2">
                  {es ? 'Solicitud Recibida' : 'Application Received'}
                </h3>
                <p className="text-navy-600 mb-6">
                  {es
                    ? 'Gracias por su interes. Nuestro equipo de alianzas revisara su solicitud y se pondra en contacto dentro de 2 dias habiles.'
                    : "Thank you for your interest. Our partnerships team will review your application and reach out within 2 business days."}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/media-kit" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold">
                    {es ? 'Ver Kit de Medios' : 'View Media Kit'} <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link to="/schedule-demo" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold">
                    {es ? 'Agendar Llamada' : 'Schedule a Call'} <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-navy-200 shadow-sm space-y-5">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                    {es ? 'Hubo un problema al enviar tu solicitud. Por favor intenta de nuevo.' : 'There was a problem submitting your application. Please try again.'}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Nombre de la Organizacion' : 'Organization Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organization_name}
                      onChange={e => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Nombre de Contacto' : 'Contact Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={e => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Correo Electronico' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contact_email}
                      onChange={e => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Telefono' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={e => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Tipo de Organizacion' : 'Organization Type'} *
                    </label>
                    <select
                      required
                      value={formData.partner_type}
                      onChange={e => setFormData(prev => ({ ...prev, partner_type: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="nonprofit">{es ? 'ONG / Sin Fines de Lucro' : 'Nonprofit / NGO'}</option>
                      <option value="legal_aid">{es ? 'Organizacion de Ayuda Legal' : 'Legal Aid Organization'}</option>
                      <option value="government">{es ? 'Agencia Gubernamental / Condado' : 'Government Agency / County'}</option>
                      <option value="bar_association">{es ? 'Colegio de Abogados' : 'Bar Association'}</option>
                      <option value="enterprise">{es ? 'Empresa / Firma Legal' : 'Enterprise / Law Firm'}</option>
                      <option value="community_org">{es ? 'Organizacion Comunitaria / Iglesia' : 'Community Organization / Church'}</option>
                      <option value="other">{es ? 'Otro' : 'Other'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Modelo de Interes' : 'Partnership Model of Interest'}
                    </label>
                    <select
                      value={formData.partner_model}
                      onChange={e => setFormData(prev => ({ ...prev, partner_model: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="">{es ? 'No estoy seguro / Ayudame a decidir' : "Not sure / Help me decide"}</option>
                      <option value="referral">{es ? 'Aliado de Referencia (ganar por referidos)' : 'Referral Partner (earn on referrals)'}</option>
                      <option value="sponsored">{es ? 'Acceso Comunitario (patrocinar acceso)' : 'Community Access (sponsor access)'}</option>
                      <option value="whitelabel">{es ? 'Marca Blanca (desplegar bajo tu marca)' : 'White-Label (deploy under your brand)'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Tamano de Comunidad' : 'Community / Member Size'}
                    </label>
                    <select
                      value={formData.community_size}
                      onChange={e => setFormData(prev => ({ ...prev, community_size: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="">{es ? 'Seleccionar' : 'Select'}</option>
                      <option value="under-100">{es ? 'Menos de 100' : 'Under 100'}</option>
                      <option value="100-500">100 - 500</option>
                      <option value="500-1000">500 - 1,000</option>
                      <option value="1000-5000">1,000 - 5,000</option>
                      <option value="5000+">5,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Sitio Web' : 'Website'}
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1">
                    {es ? 'Notas Adicionales' : 'Additional Notes'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    placeholder={es
                      ? 'Cuentanos sobre tu comunidad y como planeas usar ezLegal...'
                      : 'Tell us about your community and how you plan to use ezLegal...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      {es ? 'Enviar Solicitud' : 'Submit Application'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-xs text-navy-400 text-center">
                  {es
                    ? 'Al enviar, acepta nuestros terminos de servicio. ezLegal.ai proporciona informacion legal, no asesoria legal.'
                    : 'By submitting, you agree to our terms of service. ezLegal.ai provides legal information, not legal advice.'}
                </p>
              </form>
            )}
          </div>
        </section>

        <section className="bg-navy-900 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {es ? 'Preguntas? Habla con Nuestro Equipo' : 'Questions? Talk to Our Team'}
            </h2>
            <p className="text-navy-300 mb-2">
              {es ? 'Escribenos a' : 'Email us at'}{' '}
              <a href="mailto:partners@ezlegal.ai" className="text-teal-400 hover:text-teal-300 font-semibold">
                partners@ezlegal.ai
              </a>
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
              <Link to="/schedule-demo" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Agendar Demo' : 'Schedule a Demo'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link to="/media-kit" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Kit de Medios' : 'Media Kit'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link to="/for-partners" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Integracion Tecnica' : 'Technical Integration'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link to="/contact" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Contactar Ventas' : 'Contact Sales'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
