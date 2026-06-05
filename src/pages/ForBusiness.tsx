import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, FileText, Scale, Clock,
  Building2, Users, CheckCircle, Lock, AlertTriangle,
  DollarSign, Briefcase
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ScopeNotice, SpanishScopeNotice } from '../components/shared/AISafetyMicrocopy';
import { trackEvent } from '../services/analytics-service';
import TrustCTABlock from '../components/trust/TrustCTABlock';
import BusinessIssueCards from '../components/BusinessIssueCards';
import { useLanguage } from '../contexts/LanguageContext';

const PROBLEMS_EN = [
  {
    icon: FileText,
    title: 'Contracts & agreements',
    desc: 'Review vendor contracts, NDAs, and service agreements before you sign.',
    prompt: 'I need help reviewing a business contract before signing.',
  },
  {
    icon: Users,
    title: 'Employee issues',
    desc: 'Hiring, firing, harassment complaints, or wage questions.',
    prompt: 'I have an employee issue and need to understand my obligations.',
  },
  {
    icon: Scale,
    title: 'Customer disputes',
    desc: 'Refund demands, chargebacks, or threatening letters.',
    prompt: 'A customer is threatening legal action against my business.',
  },
  {
    icon: Building2,
    title: 'Business formation',
    desc: 'LLC vs. Corp, registered agents, operating agreements.',
    prompt: 'I need help choosing the right business structure.',
  },
  {
    icon: AlertTriangle,
    title: 'Compliance & regulations',
    desc: 'Licenses, permits, privacy policies, ADA, industry rules.',
    prompt: 'I need to understand compliance requirements for my business.',
  },
  {
    icon: DollarSign,
    title: 'Debt & collections',
    desc: 'Someone owes you money, or a vendor is threatening collections.',
    prompt: 'I need help with a business debt or collections issue.',
  },
];

const PROBLEMS_ES = [
  {
    icon: FileText,
    title: 'Contratos y acuerdos',
    desc: 'Revise contratos de proveedores, NDAs y acuerdos de servicio antes de firmar.',
    prompt: 'I need help reviewing a business contract before signing.',
  },
  {
    icon: Users,
    title: 'Problemas con empleados',
    desc: 'Contratación, despidos, quejas de acoso o preguntas de salarios.',
    prompt: 'I have an employee issue and need to understand my obligations.',
  },
  {
    icon: Scale,
    title: 'Disputas con clientes',
    desc: 'Demandas de reembolso, contracargos o cartas amenazantes.',
    prompt: 'A customer is threatening legal action against my business.',
  },
  {
    icon: Building2,
    title: 'Formación de negocios',
    desc: 'LLC vs. Corp, agentes registrados, acuerdos operativos.',
    prompt: 'I need help choosing the right business structure.',
  },
  {
    icon: AlertTriangle,
    title: 'Cumplimiento y regulaciones',
    desc: 'Licencias, permisos, políticas de privacidad, ADA, reglas de la industria.',
    prompt: 'I need to understand compliance requirements for my business.',
  },
  {
    icon: DollarSign,
    title: 'Deudas y cobranzas',
    desc: 'Alguien le debe dinero, o un proveedor amenaza con cobranza.',
    prompt: 'I need help with a business debt or collections issue.',
  },
];

const WORKFLOWS_EN = [
  { title: 'Contract review', desc: 'Upload a contract and get a plain-language summary of risks and obligations.' },
  { title: 'Cease & desist drafting', desc: 'Generate a professional cease & desist letter with your facts.' },
  { title: 'Employee handbook check', desc: 'Identify missing policies that could expose you to liability.' },
  { title: 'LLC operating agreement', desc: 'Build a customized operating agreement with guided questions.' },
  { title: 'Privacy policy builder', desc: 'Generate a compliant privacy policy for your website.' },
  { title: 'Demand letter', desc: 'Create a demand letter to collect unpaid invoices from clients.' },
];

const WORKFLOWS_ES = [
  { title: 'Revisión de contratos', desc: 'Suba un contrato y obtenga un resumen en lenguaje sencillo de riesgos y obligaciones.' },
  { title: 'Redacción de cese y desista', desc: 'Genere una carta profesional de cese y desista con sus hechos.' },
  { title: 'Revisión del manual de empleados', desc: 'Identifique políticas faltantes que podrían exponerle a responsabilidad.' },
  { title: 'Acuerdo operativo de LLC', desc: 'Construya un acuerdo operativo personalizado con preguntas guiadas.' },
  { title: 'Constructor de política de privacidad', desc: 'Genere una política de privacidad conforme para su sitio web.' },
  { title: 'Carta de demanda', desc: 'Cree una carta de demanda para cobrar facturas impagas de clientes.' },
];

export default function ForBusiness() {
  useEffect(() => {
    trackEvent('page_view', { path: '/for-business' });
  }, []);

  const { language } = useLanguage();
  const en = language === 'en';

  const handleProblemClick = (prompt: string) => {
    try {
      window.sessionStorage.setItem('ez_chatbot_prefill', prompt);
    } catch { /* ignore */ }
    trackEvent('business_problem_selected', { prompt: prompt.slice(0, 40) });
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navigation />

      <main id="main-content">
        {/* Hero */}
        <section className="pt-24 sm:pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1.5 mb-6">
              <Briefcase className="w-4 h-4 text-sky-700" aria-hidden="true" />
              <span className="text-sm font-medium text-sky-800">
                {en ? 'For small & medium businesses' : 'Para pequeñas y medianas empresas'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              {en ? 'Practical legal workflows for small businesses.' : 'Flujos legales prácticos para pequeños negocios.'}
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-7 text-slate-600">
              {en
                ? 'Contracts, compliance, employee issues, demand letters, and predictable pricing. ezLegal is not a law firm and does not replace attorney advice — but helps you prepare and know when you need one.'
                : 'Contratos, cumplimiento, problemas con empleados, cartas de demanda y precios predecibles. ezLegal no es un bufete de abogados y no reemplaza el consejo legal — pero le ayuda a prepararse y saber cuándo necesita uno.'}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/start?persona=business"
                onClick={() => trackEvent('business_cta_clicked', { cta: 'hero_start_intake' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-700/20 hover:bg-sky-800 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                {en ? 'Start business intake' : 'Iniciar consulta de negocio'}
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/schedule-demo"
                onClick={() => trackEvent('business_cta_clicked', { cta: 'hero_demo' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                {en ? 'Schedule demo' : 'Programar demo'}
              </Link>
              <Link
                to="/pricing"
                onClick={() => trackEvent('business_cta_clicked', { cta: 'hero_pricing' })}
                className="inline-flex items-center justify-center gap-2 rounded-full text-sm text-sky-700 hover:text-sky-900 font-medium px-4 py-3.5 transition"
              >
                {en ? 'View pricing' : 'Ver precios'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              {en ? 'No credit card required. Free tier available.' : 'No requiere tarjeta de crédito. Nivel gratuito disponible.'}
            </p>
          </div>
        </section>

        {/* Common problems */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="problems-heading">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="problems-heading" className="text-2xl font-black text-center mb-3">
              {en ? 'Common business problems we help with' : 'Problemas comerciales comunes con los que ayudamos'}
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
              {en
                ? 'Select your situation to start a conversation with context already loaded.'
                : 'Seleccione su situación para iniciar una conversación con contexto ya cargado.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(en ? PROBLEMS_EN : PROBLEMS_ES).map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to="/chat"
                    onClick={() => handleProblemClick(card.prompt)}
                    className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 text-sky-700 shrink-0 group-hover:bg-sky-100 transition">
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

        {/* Productized workflows */}
        <section className="py-14" aria-labelledby="workflows-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="workflows-heading" className="text-2xl font-black text-center mb-3">
              {en ? 'Tools that save you time and money' : 'Herramientas que te ahorran tiempo y dinero'}
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              {en
                ? 'Guided workflows that turn hours of legal work into minutes.'
                : 'Flujos de trabajo guiados que convierten horas de trabajo legal en minutos.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(en ? WORKFLOWS_EN : WORKFLOWS_ES).map((w) => (
                <div key={w.title} className="flex items-start gap-3 p-5 rounded-xl border border-slate-200 bg-white">
                  <CheckCircle className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{w.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Procurement trust strip */}
        <section className="py-10 bg-slate-50 border-y border-slate-200" aria-labelledby="trust-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="trust-heading" className="sr-only">Security and compliance</h2>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-6">
              {[
                { icon: Shield, text: 'Information, not legal advice — scope is clear' },
                { icon: Lock, text: 'Encrypted in transit and at rest' },
                { icon: Users, text: 'Connect to a lawyer when you need one' },
                { icon: Clock, text: 'Answers in under 60 seconds' },
              ].map(({ icon: I, text }) => (
                <div key={text} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <I className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/trust-center" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                Trust Center
              </Link>
              <Link to="/enterprise-security" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                Enterprise Security
              </Link>
              <Link to="/sla" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                SLA & Uptime
              </Link>
              <Link to="/ai-governance" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                AI Governance
              </Link>
            </div>
          </div>
        </section>

        {/* Business onboarding cards */}
        <section className="py-14" aria-labelledby="onboarding-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="onboarding-heading" className="text-2xl font-black text-center mb-3">
              {en ? 'Get started in 3 simple steps' : 'Comienza en 3 simples pasos'}
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
              {en
                ? 'No jargon, no appointments, no surprise bills.'
                : 'Sin jerga, sin citas, sin facturas sorpresa.'}
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  num: 1,
                  titleEn: 'Tell us your concern',
                  descEn: 'Pick a category above, or just describe your situation in plain language.',
                  titleEs: 'Cuéntanos tu preocupación',
                  descEs: 'Elige una categoría arriba, o simplemente describe tu situación en lenguaje sencillo.',
                },
                {
                  num: 2,
                  titleEn: 'Get organized guidance',
                  descEn: 'We summarize risks, obligations, and deadlines in clear language.',
                  titleEs: 'Obtén orientación organizada',
                  descEs: 'Resumimos riesgos, obligaciones y plazos en lenguaje claro.',
                },
                {
                  num: 3,
                  titleEn: 'Take action',
                  descEn: 'Use our document tools, or connect with an attorney if needed.',
                  titleEs: 'Toma acción',
                  descEs: 'Usa nuestras herramientas de documentos, o conéctate con un abogado si es necesario.',
                },
              ].map((card) => (
                <div key={card.num} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                  <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sm font-bold text-sky-700">{card.num}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{en ? card.titleEn : card.titleEs}</h3>
                  <p className="text-sm text-slate-600">{en ? card.descEn : card.descEs}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="py-14" aria-labelledby="pricing-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="pricing-heading" className="text-2xl font-black mb-3">
              {en ? 'Predictable pricing, not surprise invoices' : 'Precios predecibles, no facturas sorpresa'}
            </h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              {en
                ? 'Most business owners pay $300-500 per hour for legal help. We start at a fraction of that.'
                : 'La mayoría de los dueños de negocios pagan $300-500 por hora por ayuda legal. Nosotros comenzamos con una fracción de eso.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  name: 'Free',
                  price: '$0',
                  descEn: '3 questions/month, basic guidance',
                  descEs: '3 preguntas/mes, orientación básica',
                },
                {
                  name: 'Business',
                  price: '$99/mo',
                  descEn: 'Unlimited questions, document tools, team access',
                  descEs: 'Preguntas ilimitadas, herramientas de documentos, acceso de equipo',
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  descEn: 'Dedicated support, API, compliance features',
                  descEs: 'Soporte dedicado, API, características de cumplimiento',
                },
              ].map((tier) => (
                <div key={tier.name} className="p-5 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm font-medium text-slate-500 mb-1">{tier.name}</p>
                  <p className="text-2xl font-black text-slate-900 mb-2">{tier.price}</p>
                  <p className="text-sm text-slate-600">{en ? tier.descEn : tier.descEs}</p>
                </div>
              ))}
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1 mt-6 text-sm font-medium text-sky-700 hover:text-sky-900 transition"
            >
              {en ? 'See full pricing details' : 'Ver detalles de precios completos'}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Trust links */}
        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <TrustCTABlock variant="standard" />
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {en ? <ScopeNotice className="max-w-xl mx-auto" /> : <SpanishScopeNotice className="max-w-xl mx-auto" />}
            <p className="text-xs text-slate-500 text-center mt-3 max-w-lg mx-auto">
              {en
                ? 'ezLegal helps organize legal information and generate documents. It does not replace a lawyer.'
                : 'ezLegal ayuda a organizar información legal y generar documentos. No reemplaza a un abogado.'}
            </p>
          </div>
        </section>

        {/* Not sure section */}
        <section className="py-8 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-slate-600 mb-3">
              {en
                ? 'Not sure which option is right for your business?'
                : 'No está seguro cuál opción es la correcta para su negocio?'}
            </p>
            <Link
              to="/start"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-900 transition"
            >
              {en ? 'Take the guided questionnaire' : 'Responde el cuestionario guiado'}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* SMB use-case breakdown */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="smb-breakdown-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="smb-breakdown-heading" className="text-2xl font-black text-center mb-3">
              {en ? 'What you can do — and when to get help' : 'Qué puedes hacer — y cuándo pedir ayuda'}
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-lg mx-auto">
              {en
                ? 'For each business situation, here is what is free, when human help matters, and what may cost extra.'
                : 'Para cada situación comercial, aquí está lo que es gratuito, cuándo importa la ayuda humana y qué puede costar extra.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  titleEn: 'Contract review',
                  titleEs: 'Revisión de contratos',
                  freeEn: 'AI summary of key terms, risks, and deadlines.',
                  freeEs: 'Resumen de IA de términos clave, riesgos y plazos.',
                  humanEn: 'When terms are unusual, high-value, or disputed.',
                  humanEs: 'Cuando los términos son inusuales, de alto valor o disputados.',
                  paidEn: 'Detailed clause-by-clause analysis. Attorney review when available.',
                  paidEs: 'Análisis detallado cláusula por cláusula. Revisión del abogado cuando esté disponible.',
                },
                {
                  titleEn: 'Hiring / employee issue',
                  titleEs: 'Contratación / problema de empleado',
                  freeEn: 'General employment law information. Common next steps.',
                  freeEs: 'Información general de la ley laboral. Próximos pasos comunes.',
                  humanEn: 'When termination, discrimination, or wages are involved.',
                  humanEs: 'Cuando se trata de terminación, discriminación o salarios.',
                  paidEn: 'Document preparation for HR actions. Compliance checklists.',
                  paidEs: 'Preparación de documentos para acciones de RRHH. Listas de verificación de cumplimiento.',
                },
                {
                  titleEn: 'Customer nonpayment',
                  titleEs: 'Falta de pago del cliente',
                  freeEn: 'Demand letter template. Explanation of small claims process.',
                  freeEs: 'Plantilla de carta de demanda. Explicación del proceso de pequeños reclamos.',
                  humanEn: 'When amount exceeds small claims limit or debtor is unresponsive.',
                  humanEs: 'Cuando el monto excede el límite de pequeños reclamos o el deudor no responde.',
                  paidEn: 'Custom demand letter preparation. Filing guidance.',
                  paidEs: 'Preparación de carta de demanda personalizada. Orientación de presentación.',
                },
                {
                  titleEn: 'Lease / vendor dispute',
                  titleEs: 'Disputa de arrendamiento / proveedor',
                  freeEn: 'Plain-language lease summary. Identify key obligations.',
                  freeEs: 'Resumen de arrendamiento en lenguaje sencillo. Identifica obligaciones clave.',
                  humanEn: 'When breach is alleged or eviction is threatened.',
                  humanEs: 'Cuando se alega incumplimiento o se amenaza con desalojo.',
                  paidEn: 'Response letter preparation. Dispute documentation.',
                  paidEs: 'Preparación de carta de respuesta. Documentación de disputas.',
                },
                {
                  titleEn: 'Business formation / compliance',
                  titleEs: 'Formación de negocio / cumplimiento',
                  freeEn: 'Entity comparison (LLC vs Corp vs Sole Prop). State requirements.',
                  freeEs: 'Comparación de entidades (LLC vs Corp vs Propietario único). Requisitos estatales.',
                  humanEn: 'When tax implications or existing liabilities are involved.',
                  humanEs: 'Cuando hay implicaciones fiscales o pasivos existentes.',
                  paidEn: 'Formation document preparation. Compliance calendar setup.',
                  paidEs: 'Preparación de documentos de formación. Configuración del calendario de cumplimiento.',
                },
              ].map((item) => (
                <div key={item.titleEn} className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="font-bold text-slate-900 mb-3">{en ? item.titleEn : item.titleEs}</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold shrink-0 mt-0.5">F</span>
                      <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">{en ? 'Free:' : 'Gratis:'}</span> {en ? item.freeEn : item.freeEs}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold shrink-0 mt-0.5">H</span>
                      <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">{en ? 'Human help:' : 'Ayuda humana:'}</span> {en ? item.humanEn : item.humanEs}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold shrink-0 mt-0.5">$</span>
                      <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">{en ? 'May cost extra:' : 'Puede costar extra:'}</span> {en ? item.paidEn : item.paidEs}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business issue cards — bilingual, with cost transparency */}
        <section className="py-12 bg-white" aria-labelledby="issue-cards-heading">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="issue-cards-heading" className="text-xl font-bold text-slate-900 text-center mb-2">
              {en ? 'Choose your issue' : 'Elige tu problema'}
            </h2>
            <p className="text-center text-sm text-slate-600 mb-6 max-w-lg mx-auto">
              {en
                ? 'Each card shows what you can do for free and when optional paid lawyer review is available. You always see cost before you pay.'
                : 'Cada tarjeta muestra qué puedes hacer gratis y cuándo está disponible la revisión opcional de abogado pagada. Siempre ves el costo antes de pagar.'}
            </p>
            <BusinessIssueCards />
            <p className="mt-6 text-center text-xs text-slate-500">
              {en
                ? 'Lawyer review is always optional. You will see the exact cost before any payment is processed.'
                : 'La revisión por abogado es siempre opcional. Verás el costo exacto antes de procesar cualquier pago.'}
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-950 py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              {en ? 'Stop guessing. Start protecting your business.' : 'Deja de adivinar. Empieza a proteger tu negocio.'}
            </h2>
            <p className="text-slate-400 text-sm mb-7">
              {en
                ? 'Prevent problems before they become expensive. Get information fast.'
                : 'Previene problemas antes de que se vuelvan costosos. Obtén información rápido.'}
            </p>
            <Link
              to="/start?persona=business"
              onClick={() => trackEvent('business_cta_clicked', { cta: 'bottom' })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 hover:bg-sky-50 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {en ? 'Start business intake' : 'Iniciar consulta de negocio'}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
