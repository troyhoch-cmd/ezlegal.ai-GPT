import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import { AttorneyServiceDisclosure } from '../components/shared';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { pricingAudiences } from '../data/pricing';
import type { LucideIcon } from 'lucide-react';
import {
  Building2, FileText, Shield, Clock, DollarSign, Users, CheckCircle2,
  ArrowRight, Briefcase, Scale, AlertTriangle,
  Lock, Calculator, ChevronDown, ChevronUp,
  Award, ExternalLink, X
} from 'lucide-react';

interface PainPoint {
  icon: LucideIcon;
  problem: string;
  stat: string;
  statLabel: string;
  citationId: number;
  solution: string;
}

interface UseCase {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
}

interface ValueProp {
  title: string;
  description: string;
  benefit: string;
  icon: 'speed' | 'savings' | 'shield';
}

interface FAQ {
  question: string;
  answer: string;
}

interface Citation {
  id: number;
  label: string;
  source: string;
  url: string;
  year: string;
  accessNote?: { en: string; es: string };
}

const citations: Citation[] = [
  { id: 1, label: 'Clio Legal Trends Report', source: 'Clio', url: 'https://www.clio.com/resources/legal-trends/', year: '2023', accessNote: { en: 'Free with registration', es: 'Gratis con registro' } },
  { id: 2, label: 'Legal Industry Survey', source: 'Thomson Reuters', url: 'https://legal.thomsonreuters.com/en/insights', year: '2023', accessNote: { en: 'May require subscription', es: 'Puede requerir suscripcion' } },
  { id: 3, label: 'Cost of a Data Breach Report', source: 'IBM/Ponemon Institute', url: 'https://www.ibm.com/reports/data-breach', year: '2023', accessNote: { en: 'Free with registration', es: 'Gratis con registro' } },
];

const painPoints: Record<'en' | 'es', PainPoint[]> = {
  en: [
    {
      icon: DollarSign,
      problem: 'Legal fees are unpredictable',
      stat: '$300-500/hr',
      statLabel: 'avg attorney rate',
      citationId: 1,
      solution: 'Flat monthly pricing with unlimited AI assistance',
    },
    {
      icon: Clock,
      problem: 'Contracts take weeks to review',
      stat: '5-10 days',
      statLabel: 'typical turnaround',
      citationId: 2,
      solution: 'AI-assisted review workflow helps surface key issues faster',
    },
    {
      icon: AlertTriangle,
      problem: 'Compliance risks are costly',
      stat: '$4.45M',
      statLabel: 'avg breach cost (IBM 2023)',
      citationId: 3,
      solution: 'Compliance checklists and monitoring alerts',
    },
    {
      icon: Users,
      problem: 'No in-house legal team',
      stat: 'Most',
      statLabel: 'SMBs lack dedicated counsel',
      citationId: 1,
      solution: 'AI legal assistant available 24/7',
    },
  ],
  es: [
    {
      icon: DollarSign,
      problem: 'Honorarios legales impredecibles',
      stat: '$300-500/hr',
      statLabel: 'tarifa promedio de abogado',
      citationId: 1,
      solution: 'Precio mensual fijo con asistencia AI ilimitada',
    },
    {
      icon: Clock,
      problem: 'La revision de contratos toma semanas',
      stat: '5-10 dias',
      statLabel: 'tiempo de respuesta tipico',
      citationId: 2,
      solution: 'Flujo de revision asistido por AI para detectar problemas clave mas rapido',
    },
    {
      icon: AlertTriangle,
      problem: 'Los riesgos de cumplimiento son costosos',
      stat: '$4.45M',
      statLabel: 'costo promedio de brecha (IBM 2023)',
      citationId: 3,
      solution: 'Listas de cumplimiento y alertas de monitoreo',
    },
    {
      icon: Users,
      problem: 'Sin equipo legal interno',
      stat: 'La mayoria',
      statLabel: 'de PYMEs carecen de abogado dedicado',
      citationId: 1,
      solution: 'Asistente legal AI disponible 24/7',
    },
  ],
};

const useCases: Record<'en' | 'es', UseCase[]> = {
  en: [
    {
      icon: FileText,
      title: 'Contract Management',
      description: 'Generate, review, and manage NDAs, service agreements, employment contracts, and more.',
      benefits: ['Auto-generate from templates', 'AI clause analysis', 'Version tracking', 'E-signature ready'],
    },
    {
      icon: Shield,
      title: 'Compliance & Risk',
      description: 'Stay compliant with employment law, data privacy regulations, and industry standards.',
      benefits: ['GDPR/CCPA guidance', 'Employment law updates', 'Policy generators', 'Audit preparation'],
    },
    {
      icon: Scale,
      title: 'Employment Law',
      description: 'Navigate hiring, termination, workplace policies, and employee disputes with confidence.',
      benefits: ['Handbook templates', 'Termination guidance', 'Discrimination prevention', 'Wage & hour compliance'],
    },
    {
      icon: Briefcase,
      title: 'Business Formation',
      description: 'Structure your business correctly from day one with entity selection guidance.',
      benefits: ['LLC vs Corp analysis', 'Operating agreements', 'Bylaws & resolutions', 'State compliance'],
    },
  ],
  es: [
    {
      icon: FileText,
      title: 'Gestion de Contratos',
      description: 'Genera, revisa y administra NDAs, acuerdos de servicio, contratos laborales y mas.',
      benefits: ['Auto-generar desde plantillas', 'Analisis de clausulas con AI', 'Seguimiento de versiones', 'Listo para firma electronica'],
    },
    {
      icon: Shield,
      title: 'Cumplimiento y Riesgo',
      description: 'Cumple con la ley laboral, regulaciones de privacidad de datos y estandares de la industria.',
      benefits: ['Guia GDPR/CCPA', 'Actualizaciones de ley laboral', 'Generadores de politicas', 'Preparacion de auditorias'],
    },
    {
      icon: Scale,
      title: 'Derecho Laboral',
      description: 'Navega contratacion, terminacion, politicas laborales y disputas de empleados con confianza.',
      benefits: ['Plantillas de manual', 'Guia de terminacion', 'Prevencion de discriminacion', 'Cumplimiento salarial'],
    },
    {
      icon: Briefcase,
      title: 'Formacion de Empresas',
      description: 'Estructura tu negocio correctamente desde el primer dia con guia de seleccion de entidad.',
      benefits: ['Analisis LLC vs Corp', 'Acuerdos operativos', 'Estatutos y resoluciones', 'Cumplimiento estatal'],
    },
  ],
};

const valueProps: Record<'en' | 'es', ValueProp[]> = {
  en: [
    {
      title: 'Faster Contract Reviews',
      description: 'AI-assisted contract analysis helps your team identify key clauses and potential issues more quickly, accelerating your review process.',
      benefit: 'Designed to accelerate review workflows',
      icon: 'speed',
    },
    {
      title: 'Affordable Legal Coverage',
      description: 'Get enterprise-level legal support without the enterprise price tag. Built specifically for teams of 5-200.',
      benefit: 'Predictable monthly pricing, no hourly surprises',
      icon: 'savings',
    },
    {
      title: 'Proactive Compliance',
      description: 'Stay ahead of regulatory requirements with built-in compliance monitoring for CCPA, employment law, and more.',
      benefit: 'Catch issues before they become costly problems',
      icon: 'shield',
    },
  ],
  es: [
    {
      title: 'Revisiones de Contratos mas Rapidas',
      description: 'El analisis de contratos asistido por AI ayuda a tu equipo a identificar clausulas clave y problemas potenciales mas rapidamente.',
      benefit: 'Disenado para acelerar flujos de revision',
      icon: 'speed',
    },
    {
      title: 'Cobertura Legal Asequible',
      description: 'Obten soporte legal de nivel empresarial sin el precio empresarial. Construido para equipos de 5-200.',
      benefit: 'Precio mensual predecible, sin sorpresas por hora',
      icon: 'savings',
    },
    {
      title: 'Cumplimiento Proactivo',
      description: 'Mantente adelante de requisitos regulatorios con monitoreo de cumplimiento integrado.',
      benefit: 'Detecta problemas antes de que se vuelvan costosos',
      icon: 'shield',
    },
  ],
};

const faqs: Record<'en' | 'es', FAQ[]> = {
  en: [
    {
      question: "How is this different from just using ChatGPT for legal questions?",
      answer: "ezLegal.ai is purpose-built for legal work with jurisdiction-specific accuracy, attorney-reviewed templates, and compliance tracking. General AI tools lack legal context, can't produce structured legal document drafts, and don't understand state-specific requirements. Our AI is built with legal research methodology and reviewed by practicing attorneys.",
    },
    {
      question: "Do we still need an attorney if we use ezLegal.ai?",
      answer: "Yes — ezLegal.ai is not a substitute for legal counsel. We handle routine legal information tasks so you can reserve attorney time for complex matters that require professional judgment. Think of us as your first line of defense that escalates to human attorneys when needed. We even help you find and brief attorneys when you need them.",
    },
    {
      question: "Is our data secure and confidential?",
      answer: "Yes. We use TLS 1.3 encryption in transit and AES-256 at rest via our infrastructure provider (Supabase, which is SOC 2 Type II certified). We never use your data to train AI models. Your business information stays private and we're CCPA compliant.",
    },
    {
      question: "How quickly can we get started?",
      answer: "Most teams are up and running in under 30 minutes. No complex integrations required. For Enterprise plans with custom integrations, typical deployment is 2-4 weeks with dedicated support throughout.",
    },
    {
      question: "What if we need help with something outside the AI's capabilities?",
      answer: "Our platform includes warm handoff to our network of vetted attorneys. You can share your conversation history and documents directly, so the attorney has full context. Business plan users get priority attorney matching.",
    },
  ],
  es: [
    {
      question: "Como es diferente de usar ChatGPT para preguntas legales?",
      answer: "ezLegal.ai esta construido especificamente para trabajo legal con precision por jurisdiccion, plantillas revisadas por abogados y seguimiento de cumplimiento. Las herramientas AI generales carecen de contexto legal y no entienden requisitos especificos por estado.",
    },
    {
      question: "Seguimos necesitando un abogado si usamos ezLegal.ai?",
      answer: "Si — ezLegal.ai no sustituye asesoramiento legal profesional. Manejamos tareas de informacion legal rutinarias para que puedas reservar tiempo de abogado para asuntos complejos que requieren juicio profesional. Te ayudamos a encontrar y preparar abogados cuando los necesitas.",
    },
    {
      question: "Nuestros datos son seguros y confidenciales?",
      answer: "Si. Usamos cifrado TLS 1.3 en transito y AES-256 en reposo a traves de nuestro proveedor de infraestructura (Supabase, que cuenta con certificacion SOC 2 Tipo II). Nunca usamos tus datos para entrenar modelos AI. Tu informacion comercial permanece privada y cumplimos con CCPA.",
    },
    {
      question: "Que tan rapido podemos empezar?",
      answer: "La mayoria de equipos estan funcionando en menos de 30 minutos. No se requieren integraciones complejas. Para planes Enterprise con integraciones personalizadas, el despliegue tipico es de 2-4 semanas.",
    },
    {
      question: "Que pasa si necesitamos ayuda fuera de las capacidades del AI?",
      answer: "Nuestra plataforma incluye transferencia a nuestra red de abogados verificados. Puedes compartir tu historial de conversacion y documentos directamente para que el abogado tenga contexto completo.",
    },
  ],
};

export default function ForBusiness() {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en' as const;
  const en = lang === 'en';
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const citationTriggerRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const citationPopoverRef = useRef<HTMLDivElement | null>(null);

  const closeCitation = useCallback(() => {
    const prev = activeCitation;
    setActiveCitation(null);
    if (prev !== null) {
      citationTriggerRefs.current[prev]?.focus();
    }
  }, [activeCitation]);

  useEffect(() => {
    if (activeCitation === null) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCitation();
    }
    function handleClickOutside(e: MouseEvent) {
      const popover = citationPopoverRef.current;
      const trigger = activeCitation !== null ? citationTriggerRefs.current[activeCitation] : null;
      if (popover && !popover.contains(e.target as Node) && trigger && !trigger.contains(e.target as Node)) {
        closeCitation();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeCitation, closeCitation]);

  const [calculatorInputs, setCalculatorInputs] = useState({
    contracts: 10,
    hourlyRate: 350,
    hoursPerContract: 3,
  });

  const annualSavings = calculatorInputs.contracts * 12 * calculatorInputs.hourlyRate * calculatorInputs.hoursPerContract;
  const businessStarterPlan = pricingAudiences
    .find(a => a.id === 'business')!
    .plans.find(p => p.id === 'business-starter')!;
  const ezLegalCost = businessStarterPlan.monthlyPrice! * 12;
  const netSavings = annualSavings - ezLegalCost;

  const currentPainPoints = painPoints[lang];
  const currentUseCases = useCases[lang];
  const currentValueProps = valueProps[lang];
  const currentFaqs = faqs[lang];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <main id="main-content" className="pt-4">
        {/* Scope Boundary - Above the fold */}
        <div className="bg-amber-50 border-b border-amber-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-amber-800 text-center font-medium">
              <Scale className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              {en
                ? 'ezLegal.ai provides legal information and workflow support — not legal advice. For legal decisions, consult a licensed attorney.'
                : 'ezLegal.ai proporciona informacion legal y apoyo de flujos de trabajo — no asesoramiento legal. Para decisiones legales, consulte a un abogado licenciado.'}
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 rounded-full px-4 py-1.5 mb-6">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-semibold text-teal-300">
                    {en ? 'For Small & Medium Businesses' : 'Para Pequenas y Medianas Empresas'}
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                  {en ? 'Enterprise Legal Power.' : 'Poder Legal Empresarial.'}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                    {en ? 'SMB Budget.' : 'Presupuesto PYME.'}
                  </span>
                </h1>

                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  {en
                    ? 'Stop overpaying for routine legal work. Our AI helps your team navigate contracts, compliance questions, and everyday legal workflows — so you can focus on growing your business.'
                    : 'Deja de pagar de mas por trabajo legal rutinario. Nuestra AI ayuda a tu equipo a navegar contratos, preguntas de cumplimiento y flujos legales cotidianos — para que te enfoques en crecer tu negocio.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    to="/signup?plan=business"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {en ? 'Start 14-Day Free Trial' : 'Inicia Prueba Gratis de 14 Dias'}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/contact?type=demo"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
                  >
                    {en ? 'Schedule Demo' : 'Agendar Demo'}
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>{en ? 'No credit card required' : 'Sin tarjeta de credito'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>{en ? 'Setup in 30 minutes' : 'Configuracion en 30 minutos'}</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg">
                        {en ? 'ROI Calculator' : 'Calculadora de ROI'}
                      </h2>
                      <p className="text-sm text-slate-400">
                        {en ? 'See your potential savings' : 'Ve tus ahorros potenciales'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {en ? 'Contracts reviewed per month' : 'Contratos revisados por mes'}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={calculatorInputs.contracts}
                        onChange={(e) => setCalculatorInputs(prev => ({ ...prev, contracts: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        aria-label={en ? 'Contracts reviewed per month' : 'Contratos revisados por mes'}
                      />
                      <div className="flex justify-between text-sm text-slate-400 mt-1">
                        <span>1</span>
                        <span className="text-teal-400 font-semibold">{calculatorInputs.contracts}</span>
                        <span>50</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {en ? 'Attorney hourly rate' : 'Tarifa por hora del abogado'}
                      </label>
                      <input
                        type="range"
                        min="150"
                        max="600"
                        step="50"
                        value={calculatorInputs.hourlyRate}
                        onChange={(e) => setCalculatorInputs(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        aria-label={en ? 'Attorney hourly rate' : 'Tarifa por hora del abogado'}
                      />
                      <div className="flex justify-between text-sm text-slate-400 mt-1">
                        <span>$150</span>
                        <span className="text-teal-400 font-semibold">${calculatorInputs.hourlyRate}</span>
                        <span>$600</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">
                            {en ? 'Current Annual Spend' : 'Gasto Anual Actual'}
                          </p>
                          <p className="text-xl font-bold text-red-400">${annualSavings.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">
                            {en ? 'With ezLegal.ai (from)' : 'Con ezLegal.ai (desde)'}
                          </p>
                          <p className="text-xl font-bold text-green-400">${ezLegalCost.toLocaleString()}/yr</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                        <p className="text-sm text-green-300 mb-1">
                          {en ? 'Estimated Annual Savings' : 'Ahorros Anuales Estimados'}
                        </p>
                        <p className="text-3xl font-bold text-green-400">${netSavings.toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        {en
                          ? <>Estimate based on your inputs and our Business Starter plan. Actual savings may vary. <Link to="/pricing?tab=business" className="text-teal-400 hover:text-teal-300 underline">See pricing page</Link> for current plan details.</>
                          : <>Estimacion basada en tus datos y nuestro plan Negocio Inicial. Los ahorros reales pueden variar. <Link to="/pricing?tab=business" className="text-teal-400 hover:text-teal-300 underline">Consulta la pagina de precios</Link> para detalles actuales.</>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        {/* Trust Bar */}
        <section className="py-8 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold">{en ? 'CCPA Compliant' : 'Cumple CCPA'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600" title={en ? 'Encryption provided via our infrastructure provider (Supabase)' : 'Cifrado proporcionado por nuestro proveedor de infraestructura (Supabase)'}>
                <Lock className="w-5 h-5 text-teal-600" />
                <span className="font-semibold">{en ? 'TLS 1.3 + AES-256 Encryption' : 'Cifrado TLS 1.3 + AES-256'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600" title={en ? 'Document templates and legal content reviewed by licensed attorneys' : 'Plantillas y contenido legal revisado por abogados licenciados'}>
                <Award className="w-5 h-5 text-amber-600" />
                <span className="font-semibold">{en ? 'Attorney-Reviewed Templates' : 'Plantillas Revisadas por Abogados'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-5 h-5 text-teal-600" />
                <span className="font-semibold">{en ? 'Built for Growing Companies' : 'Construido para Empresas en Crecimiento'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                {en ? 'Legal Pain Points We Solve' : 'Problemas Legales que Resolvemos'}
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                {en
                  ? 'Small businesses face big legal challenges. Here\'s how we help.'
                  : 'Los pequenos negocios enfrentan grandes desafios legales. Asi es como ayudamos.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentPainPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div key={index} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
                      {en ? 'The Problem' : 'El Problema'}
                    </p>
                    <h3 className="font-bold text-slate-900 mb-3">{point.problem}</h3>
                    <div className="bg-slate-100 rounded-lg p-3 mb-4 relative">
                      <p className="text-2xl font-bold text-slate-900">{point.stat}</p>
                      <p className="text-xs text-slate-500">
                        {point.statLabel}
                        <button
                          ref={(el) => { citationTriggerRefs.current[point.citationId] = el; }}
                          onClick={(e) => { e.stopPropagation(); setActiveCitation(activeCitation === point.citationId ? null : point.citationId); }}
                          className="inline-flex items-center justify-center w-4 h-4 ml-1 text-[9px] font-bold text-teal-700 bg-teal-100 rounded-full hover:bg-teal-200 transition-colors align-super cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                          aria-label={`${en ? 'View source' : 'Ver fuente'} ${point.citationId}: ${citations.find(c => c.id === point.citationId)?.source || ''}`}
                          aria-expanded={activeCitation === point.citationId}
                          aria-controls={activeCitation === point.citationId ? `citation-popover-${point.citationId}` : undefined}
                        >
                          {point.citationId}
                        </button>
                      </p>
                      {activeCitation === point.citationId && (() => {
                        const cite = citations.find(c => c.id === point.citationId);
                        if (!cite) return null;
                        return (
                          <div
                            ref={citationPopoverRef}
                            id={`citation-popover-${point.citationId}`}
                            role="dialog"
                            aria-label={en ? `Source: ${cite.source}` : `Fuente: ${cite.source}`}
                            className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900">{cite.source} ({cite.year})</p>
                                <p className="text-slate-600 mt-0.5">{cite.label}</p>
                                {cite.accessNote && (
                                  <p className="text-slate-400 mt-0.5 italic">{cite.accessNote[lang]}</p>
                                )}
                              </div>
                              <button
                                onClick={closeCitation}
                                className="text-slate-400 hover:text-slate-600 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
                                aria-label={en ? 'Close citation' : 'Cerrar cita'}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <a
                              href={cite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-teal-600 hover:text-teal-700 font-medium"
                            >
                              {en ? 'View source' : 'Ver fuente'} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600">{point.solution}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                {en ? 'Sources' : 'Fuentes'}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {citations.map((cite) => (
                  <div key={cite.id} className="inline-flex items-center gap-1">
                    <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-teal-700 bg-teal-100 rounded-full flex-shrink-0">{cite.id}</span>
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-teal-600 transition-colors inline-flex items-center gap-1"
                    >
                      {cite.source} ({cite.year}) <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    {cite.accessNote && (
                      <span className="text-[10px] text-slate-400 italic">{cite.accessNote[lang]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                {en ? 'Built for How Businesses Actually Work' : 'Construido para como Trabajan las Empresas'}
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                {en
                  ? 'From contracts to compliance, we\'ve got you covered.'
                  : 'Desde contratos hasta cumplimiento, te tenemos cubierto.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {currentUseCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{useCase.title}</h3>
                        <p className="text-slate-300">{useCase.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {useCase.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/features"
                className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold transition-colors"
              >
                {en ? 'See All Features' : 'Ver Todas las Funciones'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                {en ? 'Why Businesses Choose ezLegal.ai' : 'Por que las Empresas Eligen ezLegal.ai'}
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                {en
                  ? 'Purpose-built to help growing companies handle legal work smarter and more affordably.'
                  : 'Construido a proposito para ayudar a empresas en crecimiento a manejar trabajo legal de forma mas inteligente y asequible.'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {currentValueProps.map((prop, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-5">
                    {prop.icon === 'speed' && <Clock className="w-6 h-6 text-white" />}
                    {prop.icon === 'savings' && <DollarSign className="w-6 h-6 text-white" />}
                    {prop.icon === 'shield' && <Shield className="w-6 h-6 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{prop.title}</h3>
                  <p className="text-slate-700 mb-6 leading-relaxed">{prop.description}</p>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2">
                    <p className="text-sm font-semibold text-teal-700">{prop.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing CTA Section (links to pricing page instead of hardcoding) */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {en ? 'Simple, Transparent Pricing' : 'Precios Simples y Transparentes'}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              {en
                ? 'No hidden fees. No per-document charges. Just predictable monthly pricing.'
                : 'Sin cargos ocultos. Sin cobros por documento. Solo precios mensuales predecibles.'}
            </p>
            <Link
              to="/pricing?tab=business"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {en ? 'View Business Plans' : 'Ver Planes de Negocio'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="mt-8">
              <AttorneyServiceDisclosure variant="expandable" context="general" />
            </div>
            <p className="text-sm text-slate-500 mt-6">
              {en
                ? 'All plans include a 14-day free trial. No credit card required.'
                : 'Todos los planes incluyen prueba gratis de 14 dias. Sin tarjeta de credito.'}
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                {en ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
              </h2>
              <p className="text-xl text-slate-600">
                {en
                  ? 'Get answers to common questions about ezLegal.ai for business.'
                  : 'Respuestas a preguntas comunes sobre ezLegal.ai para negocios.'}
              </p>
            </div>

            <div className="space-y-4">
              {currentFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                    aria-expanded={expandedFaq === index}
                  >
                    <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              {en ? 'Ready to Take Control of Your Legal Work?' : 'Listo para Tomar Control de tu Trabajo Legal?'}
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              {en
                ? 'Growing businesses use ezLegal.ai to navigate contracts, compliance questions, and everyday legal workflows more efficiently.'
                : 'Empresas en crecimiento usan ezLegal.ai para navegar contratos, preguntas de cumplimiento y flujos legales cotidianos de forma mas eficiente.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup?plan=business"
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 hover:bg-teal-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
              >
                {en ? 'Start Free Trial' : 'Iniciar Prueba Gratis'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact?type=demo"
                className="inline-flex items-center justify-center gap-2 bg-teal-500/30 hover:bg-teal-500/50 border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
              >
                {en ? 'Talk to Sales' : 'Hablar con Ventas'}
              </Link>
            </div>
            <p className="mt-6 text-teal-200 text-sm">
              {en
                ? '14-day free trial. No credit card required.'
                : 'Prueba gratis de 14 dias. Sin tarjeta de credito.'}
            </p>
          </div>
        </section>
      </main>

      <RelatedLinks />
      <Footer />
    </div>
  );
}
