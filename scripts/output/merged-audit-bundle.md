# ezLegal.ai Post-Merge Audit Bundle
# Generated: 2026-06-08T23:07:20.279Z
# Use with: scripts/gpt-post-merge-audit-prompt.md

---

## IMPORTANT: LEGACY SITE EXCLUSION

DO NOT reference the legacy ezlegal.ai production site at any point during this audit.
The files below are from the CURRENT PROJECT only.
The April 28 baseline was used as a recovery source — it is NOT the standard.
The legacy production site is IRRELEVANT. See the audit prompt for full rules.

---

# SECTION 1: MERGED FILES (Audit These)

## File: src/pages/ForBusiness.tsx

```tsx
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
  const en = language === 'en';
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

  const lang = language === 'es' ? 'es' : 'en';
  const currentPainPoints = painPoints[lang];
  const currentUseCases = useCases[lang];
  const currentValueProps = valueProps[lang];
  const currentFaqs = faqs[lang];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <main id="main-content" className="pt-4">
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

        {/* Scope Boundary */}
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

```

---

## File: src/pages/EZReads.tsx

```tsx
import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Users,
  Shield,
  Home,
  X,
  MapPin,
  ShieldCheck,
  Landmark,
  ChevronDown,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import Footer from '../components/Footer';
import ArticleModal from '../components/ArticleModal';
import ShareButton from '../components/ShareButton';
import GuidesSearch from '../components/guides/GuidesSearch';
import UrgentHelpBanner from '../components/guides/UrgentHelpBanner';
import SafetyEscalationStrip from '../components/guides/SafetyEscalationStrip';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { US_STATES, getJurisdictionName } from '../data/jurisdictions';
import { getArticleImage, onArticleImageError } from '../lib/article-images';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  image_url: string | null;
  is_featured: boolean;
  author_name: string;
  published_at: string;
  jurisdiction: string | null;
  review_status: string;
  sources: string | null;
  updated_at: string;
  last_reviewed_at: string | null;
}

const FALLBACK_ARTICLES_EN = [
  {
    slug: 'tenant-protection-laws',
    title: 'Understanding Your Rights: A Complete Guide to Tenant Protection Laws',
    excerpt: 'Learn about your rights as a tenant, from security deposits to eviction protection. This comprehensive guide breaks down complex housing laws into plain English.',
    category: 'Housing Law',
    read_time: '12 min read',
    image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'security-deposit-rights',
    title: 'Security Deposits: What Landlords Can and Cannot Deduct',
    excerpt: 'Understand the rules around security deposits, including legal limits, what can be deducted, and how to get your full deposit back when you move out.',
    category: 'Housing Law',
    read_time: '8 min read',
    image_url: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'eviction-process-guide',
    title: 'Eviction Process Explained: Know Your Rights and Timeline',
    excerpt: 'A step-by-step guide to the eviction process, including required notices, court procedures, and how to respond if you receive an eviction notice.',
    category: 'Housing Law',
    read_time: '15 min read',
    image_url: 'https://images.pexels.com/photos/7578901/pexels-photo-7578901.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'small-claims-court-guide',
    title: 'Small Claims Court: How to File and Prepare Your Case',
    excerpt: 'A step-by-step guide to navigating small claims court without an attorney. Learn what cases qualify, how to file, and tips for presenting your case.',
    category: 'Civil Law',
    read_time: '8 min read',
    image_url: 'https://images.pexels.com/photos/6077123/pexels-photo-6077123.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'employment-rights-guide',
    title: 'Employment Rights Every Worker Should Know',
    excerpt: 'From minimum wage to workplace discrimination, understand your fundamental rights as an employee and when to take action.',
    category: 'Employment Law',
    read_time: '10 min read',
    image_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'creating-will-guide',
    title: 'Creating a Will Without a Lawyer: What You Need to Know',
    excerpt: 'Essential information about estate planning for individuals and families. Learn what makes a will legally valid and common mistakes to avoid.',
    category: 'Estate Planning',
    read_time: '15 min read',
    image_url: 'https://images.pexels.com/photos/4057663/pexels-photo-4057663.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const FALLBACK_ARTICLES_ES = [
  {
    slug: 'leyes-proteccion-inquilinos',
    title: 'Entendiendo Tus Derechos: Guia Completa de Leyes de Proteccion al Inquilino',
    excerpt: 'Aprende sobre tus derechos como inquilino, desde depositos de seguridad hasta proteccion contra desalojos.',
    category: 'Housing Law',
    read_time: '12 min de lectura',
    image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'derechos-deposito-seguridad',
    title: 'Depositos de Seguridad: Que Puede y No Puede Descontar Tu Arrendador',
    excerpt: 'Entiende las reglas sobre depositos de seguridad, incluyendo limites legales y como recuperar tu deposito.',
    category: 'Housing Law',
    read_time: '8 min de lectura',
    image_url: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'guia-proceso-desalojo',
    title: 'Proceso de Desalojo Explicado: Conoce Tus Derechos y Plazos',
    excerpt: 'Una guia paso a paso del proceso de desalojo, incluyendo avisos requeridos y como responder.',
    category: 'Housing Law',
    read_time: '15 min de lectura',
    image_url: 'https://images.pexels.com/photos/7578901/pexels-photo-7578901.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'guia-reclamos-menores',
    title: 'Tribunal de Reclamos Menores: Como Presentar y Preparar Tu Caso',
    excerpt: 'Guia paso a paso para navegar el tribunal de reclamos menores sin abogado.',
    category: 'Civil Law',
    read_time: '8 min de lectura',
    image_url: 'https://images.pexels.com/photos/6077123/pexels-photo-6077123.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'derechos-laborales-guia',
    title: 'Derechos Laborales que Todo Trabajador Debe Conocer',
    excerpt: 'Desde el salario minimo hasta la discriminacion laboral, entiende tus derechos fundamentales.',
    category: 'Employment Law',
    read_time: '10 min de lectura',
    image_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'crear-testamento-guia',
    title: 'Crear un Testamento Sin Abogado: Lo Que Necesitas Saber',
    excerpt: 'Informacion esencial sobre planificacion patrimonial para individuos y familias.',
    category: 'Wills & Probate',
    read_time: '15 min de lectura',
    image_url: 'https://images.pexels.com/photos/4057663/pexels-photo-4057663.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

function formatUpdatedDate(dateStr: string, lang: 'en' | 'es'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (lang === 'es') {
    if (diffDays < 1) return 'Actualizado hoy';
    if (diffDays < 7) return `Actualizado hace ${diffDays}d`;
    if (diffDays < 30) return `Actualizado hace ${Math.floor(diffDays / 7)}sem`;
    return `Actualizado ${date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
  }
  if (diffDays < 1) return 'Updated today';
  if (diffDays < 7) return `Updated ${diffDays}d ago`;
  if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)}w ago`;
  return `Updated ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

function toArticle(a: (typeof FALLBACK_ARTICLES_EN)[number], i: number): Article {
  return {
    ...a,
    id: `fallback-${i}`,
    content: '',
    is_featured: i === 0,
    author_name: 'EZLegal.ai',
    published_at: '2026-04-15T00:00:00.000Z',
    jurisdiction: null,
    review_status: 'editorial_review',
    sources: null,
    updated_at: '2026-05-20T00:00:00.000Z',
    last_reviewed_at: '2026-05-20T00:00:00.000Z',
  };
}

interface CategoryConfig {
  name: string;
  icon: typeof Home;
  count: number;
  examples: string;
  dbName: string;
}

function useCategories(t: (key: string) => string, articles: Article[]): CategoryConfig[] {
  return useMemo(() => {
    const countByCategory = (dbName: string): number =>
      articles.filter((a: Article) => a.category === dbName).length || 0;

    return [
      { name: t('ezreads.category.housingLaw'), icon: Home, count: countByCategory('Housing Law'), examples: t('ezreads.category.housingExamples'), dbName: 'Housing Law' },
      { name: t('ezreads.category.employmentLaw'), icon: Users, count: countByCategory('Employment Law'), examples: t('ezreads.category.employmentExamples'), dbName: 'Employment Law' },
      { name: t('ezreads.category.consumerProtection'), icon: Shield, count: countByCategory('Consumer Protection'), examples: t('ezreads.category.consumerExamples'), dbName: 'Consumer Protection' },
      { name: t('ezreads.category.familyLaw'), icon: FileText, count: countByCategory('Family Law'), examples: t('ezreads.category.familyExamples'), dbName: 'Family Law' },
      { name: t('ezreads.category.willsProbate'), icon: BookOpen, count: countByCategory('Wills & Probate'), examples: t('ezreads.category.willsExamples'), dbName: 'Wills & Probate' },
      { name: t('ezreads.category.civilLaw'), icon: Scale, count: countByCategory('Civil Law'), examples: t('ezreads.category.civilExamples'), dbName: 'Civil Law' },
    ];
  }, [t, articles]);
}

export default function EZReads() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArticleLoading, setIsArticleLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const { language, t } = useLanguage();

  const lang = language === 'es' ? 'es' : 'en' as const;
  const categories = useCategories(t, articles);
  const fallbackArticles = language === 'es' ? FALLBACK_ARTICLES_ES : FALLBACK_ARTICLES_EN;
  const dateLocale = language === 'es' ? 'es-ES' : 'en-US';

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, selectedJurisdiction, language]);

  async function fetchArticles() {
    setIsLoading(true);

    if (language === 'es') {
      setArticlesFromFallback();
      setIsLoading(false);
      return;
    }

    try {
      const dbCategory = selectedCategory
        ? categories.find(c => c.name === selectedCategory)?.dbName || selectedCategory
        : null;

      let query = supabase
        .from('ezreads_articles')
        .select(
          'id, slug, title, excerpt, category, read_time, image_url, is_featured, author_name, published_at, jurisdiction, review_status, sources, updated_at, last_reviewed_at'
        )
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (dbCategory) {
        query = query.eq('category', dbCategory);
      }
      if (selectedJurisdiction) {
        query = query.or(`jurisdiction.eq.${selectedJurisdiction},jurisdiction.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        setArticles(data.map((a) => ({ ...a, content: '' })));
      } else {
        setArticlesFromFallback();
      }
    } catch {
      setArticlesFromFallback();
    } finally {
      setIsLoading(false);
    }
  }

  function setArticlesFromFallback() {
    if (!selectedCategory) {
      setArticles(fallbackArticles.map(toArticle));
      return;
    }
    const dbCategory = categories.find(c => c.name === selectedCategory)?.dbName || selectedCategory;
    const filtered = fallbackArticles.filter(
      (a) => a.category === dbCategory || a.category === selectedCategory
    );
    setArticles(filtered.map(toArticle));
  }

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  async function openArticle(articleSlug: string) {
    setIsModalOpen(true);
    setIsArticleLoading(true);
    setSelectedArticle(null);

    try {
      const { data, error } = await supabase
        .from('ezreads_articles')
        .select('*')
        .eq('slug', articleSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSelectedArticle(data);
      } else {
        loadFallbackArticle(articleSlug);
      }
    } catch {
      loadFallbackArticle(articleSlug);
    } finally {
      setIsArticleLoading(false);
    }
  }

  function loadFallbackArticle(slug: string) {
    const fallback = fallbackArticles.find((a) => a.slug === slug);
    if (fallback) {
      setSelectedArticle({
        ...toArticle(fallback, 0),
        content: generatePlaceholderContent(fallback.title, fallback.excerpt),
      });
    }
  }

  function generatePlaceholderContent(title: string, excerpt: string): string {
    if (language === 'es') {
      return `<p class="text-lg font-medium text-navy-800 mb-6">${excerpt}</p>
<h2>Resumen</h2>
<p>Esta guia explica ${title.toLowerCase()} en pasos cortos. Conocer tus derechos te ayuda a tomar buenas decisiones.</p>
<h2>Puntos Clave</h2>
<ul>
<li>Conoce tus derechos bajo las leyes federales y estatales aplicables</li>
<li>Documenta todo por escrito cuando sea posible</li>
<li>Busca asistencia legal si crees que tus derechos han sido violados</li>
<li>Los plazos pueden aplicar - actua rapidamente para preservar tus opciones</li>
</ul>
<blockquote><strong>Importante:</strong> Esto es informacion general, no consejo legal. Cada caso es distinto y las leyes cambian segun el lugar. Habla con un abogado para tu caso.</blockquote>`;
    }
    return `<p class="text-lg font-medium text-navy-800 mb-6">${excerpt}</p>
<h2>Overview</h2>
<p>This article provides comprehensive information about ${title.toLowerCase()}. Understanding your legal rights is essential for making informed decisions.</p>
<h2>Key Points</h2>
<ul>
<li>Know your rights under applicable federal and state laws</li>
<li>Document everything in writing whenever possible</li>
<li>Seek legal assistance if you believe your rights have been violated</li>
<li>Time limits may apply - act promptly to preserve your options</li>
</ul>
<blockquote><strong>Important:</strong> This article provides general legal information, not legal advice. Every situation is unique. For guidance specific to your circumstances, consult with a qualified attorney.</blockquote>`;
  }

  function handleSearch(query: string, category?: string) {
    setSearchQuery(query);
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
  }

  function handleSearchClear() {
    setSearchQuery('');
  }

  function handleClearAllFilters() {
    setSelectedCategory(null);
    setSelectedJurisdiction('');
    setSearchQuery('');
  }

  const featuredArticle = filteredArticles.find((a) => a.is_featured) || filteredArticles[0];
  const regularArticles = filteredArticles.filter((a) => a !== featuredArticle);
  const hasActiveFilters = !!selectedCategory || !!selectedJurisdiction || !!searchQuery;

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8" />
              <span className="text-xl font-semibold">{t('ezreads.title')}</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">{t('ezreads.heroTitle')}</h1>
            <p className="text-xl text-navy-100 leading-relaxed mb-10">
              {t('ezreads.heroSubtitle')}
            </p>
            <GuidesSearch onSearch={handleSearch} onClear={handleSearchClear} />
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-navy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-navy-900">{t('ezreads.browseByCategory')}</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                <select
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="pl-9 pr-8 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer"
                  aria-label={t('ezreads.allStates')}
                >
                  <option value="">{t('ezreads.allStates')}</option>
                  {US_STATES.map((state) => (
                    <option key={state.code} value={state.code}>{state.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy-600 hover:text-navy-900 bg-navy-100 hover:bg-navy-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t('ezreads.clearAll')}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all group ${
                  selectedCategory === category.name
                    ? 'bg-teal-600 border-teal-600'
                    : 'bg-navy-50 hover:bg-teal-50 border-navy-200 hover:border-teal-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                  selectedCategory === category.name ? 'bg-teal-500' : 'bg-teal-50 group-hover:bg-teal-600'
                }`}>
                  <category.icon className={`w-6 h-6 transition-colors ${
                    selectedCategory === category.name ? 'text-white' : 'text-teal-600 group-hover:text-white'
                  }`} />
                </div>
                <div className="text-center">
                  <div className={`font-semibold text-sm ${selectedCategory === category.name ? 'text-white' : 'text-navy-900'}`}>
                    {category.name}
                  </div>
                  <div className={`text-xs mt-0.5 ${selectedCategory === category.name ? 'text-teal-200' : 'text-navy-500'}`}>
                    {category.count} {language === 'es' ? 'articulos' : 'articles'}
                  </div>
                  <div className={`text-xs mt-1 leading-tight ${selectedCategory === category.name ? 'text-teal-100' : 'text-navy-400'}`}>
                    {category.examples}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedCategory && (
            <div className="mt-6">
              <UrgentHelpBanner category={selectedCategory} />
            </div>
          )}
        </div>
      </section>

      <SafetyEscalationStrip />

      {searchQuery && (
        <section className="py-4 bg-teal-50 border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy-700">
                {t('ezreads.showingResults')}{' '}
                <span className="font-semibold">&ldquo;{searchQuery}&rdquo;</span>
                {selectedCategory && <span> {language === 'es' ? 'en' : 'in'} {selectedCategory}</span>}
                <span className="text-navy-500 ml-2">
                  ({filteredArticles.length}{' '}
                  {filteredArticles.length === 1
                    ? (language === 'es' ? 'articulo' : 'article')
                    : (language === 'es' ? 'articulos' : 'articles')})
                </span>
              </p>
              <button onClick={handleSearchClear} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t('ezreads.clearSearch')}
              </button>
            </div>
          </div>
        </section>
      )}

      {isLoading ? (
        <section className="py-24 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-navy-600">{t('ezreads.loadingArticles')}</p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {!selectedCategory && !searchQuery && featuredArticle && (
            <section className="py-16 bg-navy-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-navy-900 mb-2">{t('ezreads.featuredArticle')}</h2>
                  <p className="text-navy-600">{t('ezreads.popularThisWeek')}</p>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow border border-navy-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="relative h-64 lg:h-auto">
                      <img
                        src={getArticleImage(featuredArticle.image_url, featuredArticle.category)}
                        alt={featuredArticle.title}
                        loading="lazy"
                        onError={onArticleImageError(featuredArticle.category)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-3 py-1 bg-teal-600 text-white text-sm font-semibold rounded-full">
                          {featuredArticle.category}
                        </span>
                        {featuredArticle.jurisdiction && (
                          <span className="px-3 py-1 bg-navy-700/80 backdrop-blur-sm text-white text-sm font-medium rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getJurisdictionName(featuredArticle.jurisdiction)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-navy-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredArticle.read_time}
                        </div>
                        <span className="text-navy-300">|</span>
                        <span>
                          {new Date(featuredArticle.published_at).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        {featuredArticle.review_status === 'attorney_reviewed' && (
                          <>
                            <span className="text-navy-300">|</span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <ShieldCheck className="w-4 h-4" />
                              {t('ezreads.attorneyReviewed')}
                            </span>
                          </>
                        )}
                        {featuredArticle.review_status === 'official_sources' && (
                          <>
                            <span className="text-navy-300">|</span>
                            <span className="inline-flex items-center gap-1 text-teal-600 font-medium">
                              <Landmark className="w-4 h-4" />
                              {t('ezreads.officialSources')}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-3xl font-bold text-navy-900 mb-4 leading-tight">{featuredArticle.title}</h3>
                      <p className="text-lg text-navy-600 mb-4 leading-relaxed">{featuredArticle.excerpt}</p>
                      {!featuredArticle.jurisdiction && (
                        <p className="text-xs text-navy-400 mb-4 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {t('ezreads.generalGuidance')}
                        </p>
                      )}
                      <button
                        onClick={() => openArticle(featuredArticle.slug)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors group w-fit"
                      >
                        {t('ezreads.readArticle')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-2">
                  {selectedCategory
                    ? selectedCategory
                    : searchQuery
                      ? t('ezreads.searchResults')
                      : t('ezreads.recentArticles')}
                </h2>
                <p className="text-navy-600">
                  {selectedCategory
                    ? `${filteredArticles.length} ${t('ezreads.articlesAbout')} ${selectedCategory.toLowerCase()}`
                    : searchQuery
                      ? `${filteredArticles.length} ${t('ezreads.articlesMatching')}`
                      : t('ezreads.latestGuides')}
                </p>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 mx-auto text-navy-300 mb-4" />
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">{t('ezreads.noArticles')}</h3>
                  <p className="text-navy-600 mb-6">
                    {searchQuery ? t('ezreads.noArticlesSearch') : t('ezreads.noArticlesCategory')}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAllFilters}
                      className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                    >
                      {t('ezreads.clearAllFilters')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(selectedCategory || searchQuery ? filteredArticles : regularArticles).map((article) => (
                    <article
                      key={article.id}
                      className="bg-white border border-navy-200 rounded-xl overflow-hidden hover:shadow-xl transition-all group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={getArticleImage(article.image_url, article.category)}
                          alt={article.title}
                          loading="lazy"
                          onError={onArticleImageError(article.category)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-teal-600 text-xs font-semibold rounded-full">
                            {lang === 'es' ? (categories.find(c => c.dbName === article.category)?.name || article.category) : article.category}
                          </span>
                          {article.jurisdiction && (
                            <span className="px-2 py-1 bg-navy-800/80 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {getJurisdictionName(article.jurisdiction)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-navy-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.read_time}
                          </div>
                          {article.review_status === 'attorney_reviewed' && (
                            <>
                              <span className="text-navy-300">|</span>
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                <ShieldCheck className="w-3 h-3" />
                                {t('ezreads.attorneyReviewed')}
                              </span>
                            </>
                          )}
                          {article.review_status === 'official_sources' && (
                            <>
                              <span className="text-navy-300">|</span>
                              <span className="inline-flex items-center gap-1 text-teal-600 font-medium">
                                <Landmark className="w-3 h-3" />
                                {t('ezreads.officialSources')}
                              </span>
                            </>
                          )}
                        </div>
                        <details className="mb-3 text-xs text-navy-500">
                          <summary className="cursor-pointer select-none text-navy-500 hover:text-navy-700 list-none inline-flex items-center gap-1">
                            <span className="underline-offset-2 hover:underline">
                              {language === 'es' ? 'Detalles' : 'Details'}
                            </span>
                          </summary>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span>
                              {language === 'es' ? 'Publicado ' : 'Published '}
                              {new Date(article.published_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            {article.updated_at !== article.published_at && (
                              <>
                                <span className="text-navy-300">|</span>
                                <span>{formatUpdatedDate(article.updated_at, lang)}</span>
                              </>
                            )}
                            {article.jurisdiction && (
                              <>
                                <span className="text-navy-300">|</span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {getJurisdictionName(article.jurisdiction)}
                                </span>
                              </>
                            )}
                          </div>
                        </details>
                        <h3 className="text-xl font-bold text-navy-900 mb-3 leading-tight group-hover:text-teal-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-navy-600 mb-4 leading-relaxed text-sm">{article.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => openArticle(article.slug)}
                            className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all"
                          >
                            {t('ezreads.readMore')}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <ShareButton
                            variant="compact"
                            context="article"
                            title={article.title}
                            url={`${window.location.origin}/ezreads#${article.slug}`}
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section className="py-16 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-orange-200" />
          <h2 className="text-4xl font-bold mb-6">{t('ezreads.stayInformed')}</h2>
          <p className="text-xl text-navy-100 mb-8 max-w-2xl mx-auto">
            {t('ezreads.stayInformedDesc')}
          </p>
          {newsletterSubmitted ? (
            <p className="text-teal-300 font-medium">{lang === 'es' ? 'Gracias por suscribirte.' : 'Thank you for subscribing.'}</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newsletterEmail.includes('@')) {
                  supabase.from('email_captures').insert({ email: newsletterEmail, source: 'ezreads_newsletter', language: lang }).then(() => {});
                  setNewsletterSubmitted(true);
                }
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t('ezreads.enterEmail')}
                required
                className="flex-1 px-4 py-3 rounded-lg text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
              <button type="submit" className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap">
                {t('ezreads.subscribe')}
              </button>
            </form>
          )}
          <p className="text-navy-200 text-sm mt-4">{t('ezreads.freeResources')}</p>
        </div>
      </section>

      <RelatedLinks />
      <Footer />

      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedArticle(null); }}
        isLoading={isArticleLoading}
      />
    </div>
  );
}

```

---

## File: src/pages/Documents.tsx

```tsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import usePersonaRouting from '../hooks/usePersonaRouting';
import { supabase } from '../lib/supabase';
import { Plus, FileText, Download, Search, Sparkles, X, MapPin, CheckCircle, AlertTriangle, Wand2, Loader2, ScanLine, Building2, Users, Globe } from 'lucide-react';
import { JURISDICTION_GROUPS, getJurisdictionName } from '../data/jurisdictions';
import ValidatedFormField from '../components/ValidatedFormField';
import DocumentOCRProcessor from '../components/DocumentOCRProcessor';
import AIModelSelector from '../components/AIModelSelector';
import { getFieldConfig, validateField } from '../lib/document-validation';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const templateNameES: Record<string, string> = {
  '501c3_formation': 'Formacion 501(c)(3)',
  general_partnership_formation: 'Formacion de Sociedad General',
  llc_dissolution: 'Disolucion de LLC',
  multiple_member_llc_formation: 'Formacion de LLC Multi-Miembro',
  asset_sale_purchase: 'Acuerdo de Compraventa de Activos',
  buy_sell_agreement: 'Acuerdo de Compra-Venta',
  consultant_agreement: 'Contrato de Consultor',
  corporate_bylaws: 'Estatutos Corporativos',
  demand_letter: 'Carta de Demanda',
  employee_severance: 'Acuerdo de Separacion Laboral',
  employee_stock_option: 'Acuerdo de Opciones sobre Acciones',
  employment_agreement: 'Contrato de Empleo',
  joint_venture_agreement: 'Acuerdo de Empresa Conjunta',
  license_agreement: 'Acuerdo de Licencia',
  master_service_agreement: 'Acuerdo de Servicios Maestro',
  non_compete_agreement: 'Acuerdo de No Competencia',
  non_disclosure_agreement: 'Acuerdo de Confidencialidad',
  partnership_agreement: 'Acuerdo de Sociedad',
  power_of_attorney: 'Poder Notarial',
  settlement_agreement: 'Acuerdo de Conciliacion',
  shareholder_agreement: 'Acuerdo de Accionistas',
  terms_of_service: 'Terminos de Servicio',
  website_hosting_agreement: 'Acuerdo de Hospedaje Web',
  routine_document_review: 'Revision Rutinaria de Documentos',
  s_corp_c_corp_formation: 'Formacion S-corp o C-corp',
  single_member_llc_formation: 'Formacion de LLC de Miembro Unico',
};

interface Document {
  id: string;
  title: string;
  document_type: string;
  content: string;
  template_used: string | null;
  created_at: string;
  jurisdiction?: string | null;
}

const templates = {
  '501c3_formation': {
    name: '501(c)(3) Formation',
    fields: ['organization_name', 'state', 'purpose', 'registered_agent', 'incorporator_name', 'effective_date'],
    template: `ARTICLES OF INCORPORATION FOR 501(c)(3) NONPROFIT

ARTICLE I - NAME
The name of this corporation is [organization_name].

ARTICLE II - PURPOSE
This corporation is organized exclusively for charitable, religious, educational, and/or scientific purposes under Section 501(c)(3) of the Internal Revenue Code.

The specific purpose of this corporation is: [purpose]

ARTICLE III - NONPROFIT STATUS
No part of the net earnings shall inure to the benefit of any private shareholder or individual.

ARTICLE IV - REGISTERED AGENT
The name and address of the registered agent in the State of [state] is: [registered_agent]

ARTICLE V - INCORPORATOR
The name and address of the incorporator is: [incorporator_name]

ARTICLE VI - DISSOLUTION
Upon dissolution, assets shall be distributed for exempt purposes under Section 501(c)(3) of the Internal Revenue Code.

ARTICLE VII - EFFECTIVE DATE
These Articles of Incorporation are effective as of [effective_date].

IN WITNESS WHEREOF, the undersigned incorporator has executed these Articles of Incorporation.

_______________________          _______________________
[incorporator_name]              Date
Incorporator`
  },
  general_partnership_formation: {
    name: 'General Partnership Formation',
    fields: ['partnership_name', 'partner1_name', 'partner2_name', 'business_purpose', 'capital_contribution', 'effective_date'],
    template: `GENERAL PARTNERSHIP AGREEMENT

This General Partnership Agreement is entered into as of [effective_date] by and between [partner1_name] and [partner2_name] (collectively, the "Partners").

ARTICLE I - FORMATION
The Partners hereby form a general partnership under the name [partnership_name].

ARTICLE II - PURPOSE
The purpose of the Partnership is: [business_purpose]

ARTICLE III - CAPITAL CONTRIBUTIONS
Each Partner shall contribute the following capital: $[capital_contribution]

ARTICLE IV - PROFIT AND LOSS SHARING
Profits and losses shall be shared equally among the Partners.

ARTICLE V - MANAGEMENT
All Partners shall have equal rights in the management and conduct of the Partnership business.

ARTICLE VI - TERM
The Partnership shall continue until dissolved by mutual agreement or operation of law.

IN WITNESS WHEREOF, the Partners have executed this Agreement.

_______________________          _______________________
[partner1_name]                  [partner2_name]
Partner                          Partner`
  },
  llc_dissolution: {
    name: 'LLC Dissolution',
    fields: ['llc_name', 'state', 'dissolution_date', 'member_name', 'reason_for_dissolution'],
    template: `ARTICLES OF DISSOLUTION

LIMITED LIABILITY COMPANY DISSOLUTION

ARTICLE I - COMPANY NAME
The name of the Limited Liability Company being dissolved is: [llc_name]

ARTICLE II - STATE OF FORMATION
This LLC was formed in the State of [state].

ARTICLE III - DISSOLUTION DATE
The effective date of dissolution is: [dissolution_date]

ARTICLE IV - REASON FOR DISSOLUTION
Reason for dissolution: [reason_for_dissolution]

ARTICLE V - MEMBER APPROVAL
The dissolution has been approved by the required vote of members.

ARTICLE VI - LIABILITIES
All debts, obligations, and liabilities of the LLC have been paid or adequately provided for.

ARTICLE VII - ASSET DISTRIBUTION
All remaining assets have been distributed to members according to the Operating Agreement.

ARTICLE VIII - CERTIFICATION
The undersigned certifies that the information contained herein is true and correct.

_______________________          _______________________
[member_name]                    Date
Member/Manager`
  },
  multiple_member_llc_formation: {
    name: 'Multiple Member LLC Formation',
    fields: ['llc_name', 'state', 'member1_name', 'member2_name', 'member1_ownership', 'member2_ownership', 'effective_date'],
    template: `OPERATING AGREEMENT FOR MULTIPLE MEMBER LLC

OPERATING AGREEMENT OF [llc_name], LLC

This Operating Agreement is entered into as of [effective_date].

ARTICLE I - FORMATION
The Members hereby form a Limited Liability Company under the laws of [state].

ARTICLE II - NAME AND PURPOSE
The name of the LLC is [llc_name], LLC. The LLC may engage in any lawful business activity.

ARTICLE III - MEMBERS AND OWNERSHIP
[member1_name]: [member1_ownership]%
[member2_name]: [member2_ownership]%

ARTICLE IV - CAPITAL CONTRIBUTIONS
Each Member shall contribute capital proportionate to their ownership interest.

ARTICLE V - DISTRIBUTIONS
Distributions shall be made to Members in proportion to their ownership percentages.

ARTICLE VI - MANAGEMENT
The LLC shall be managed by its Members. Major decisions require majority vote.

ARTICLE VII - TRANSFER OF INTERESTS
No Member may transfer their interest without written consent of other Members.

IN WITNESS WHEREOF, the Members have executed this Agreement.

_______________________          _______________________
[member1_name]                   [member2_name]`
  },
  asset_sale_purchase: {
    name: 'Prepare Asset Sale and Purchase Agreement',
    fields: ['seller_name', 'buyer_name', 'asset_description', 'purchase_price', 'closing_date'],
    template: `ASSET SALE AND PURCHASE AGREEMENT

This Asset Sale and Purchase Agreement is made between [seller_name] ("Seller") and [buyer_name] ("Buyer").

ARTICLE I - ASSETS BEING SOLD
The Seller agrees to sell and the Buyer agrees to purchase the following assets:
[asset_description]

ARTICLE II - PURCHASE PRICE
The total purchase price for the Assets is: $[purchase_price]

ARTICLE III - CLOSING
The closing of this transaction shall occur on [closing_date].

ARTICLE IV - REPRESENTATIONS
Seller represents that:
- Seller has full authority to sell the Assets
- The Assets are free and clear of all liens and encumbrances
- All information provided regarding the Assets is accurate

ARTICLE V - CONDITIONS
This sale is contingent upon:
- Buyer's satisfactory inspection of Assets
- Completion of due diligence
- Execution of all required documents

ARTICLE VI - TRANSFER OF OWNERSHIP
Title to the Assets shall transfer to Buyer upon receipt of full payment.

_______________________          _______________________
[seller_name]                    [buyer_name]
Seller                           Buyer`
  },
  buy_sell_agreement: {
    name: 'Prepare Buy-Sell Agreement',
    fields: ['company_name', 'owner1_name', 'owner2_name', 'trigger_event', 'valuation_method', 'effective_date'],
    template: `BUY-SELL AGREEMENT

This Buy-Sell Agreement is made as of [effective_date] among the owners of [company_name].

ARTICLE I - PARTIES
Owner 1: [owner1_name]
Owner 2: [owner2_name]

ARTICLE II - PURPOSE
This Agreement governs the purchase and sale of ownership interests upon certain triggering events.

ARTICLE III - TRIGGERING EVENTS
The following events shall trigger this Agreement: [trigger_event]

ARTICLE IV - VALUATION
The ownership interests shall be valued using: [valuation_method]

ARTICLE V - PURCHASE OBLIGATION
Upon a triggering event, the remaining owners shall have the right and obligation to purchase the departing owner's interest.

ARTICLE VI - PAYMENT TERMS
Payment may be made in a lump sum or in installments over 60 months with interest at the prime rate.

ARTICLE VII - LIFE INSURANCE FUNDING
The owners may maintain life insurance policies to fund this Agreement.

_______________________          _______________________
[owner1_name]                    [owner2_name]`
  },
  consultant_agreement: {
    name: 'Prepare Consultant Agreement',
    fields: ['consultant_name', 'client_name', 'services_description', 'compensation', 'start_date', 'end_date'],
    template: `CONSULTANT AGREEMENT

This Consultant Agreement is entered into as of [start_date] between [client_name] ("Client") and [consultant_name] ("Consultant").

ARTICLE I - SERVICES
Consultant agrees to provide the following services: [services_description]

ARTICLE II - TERM
This Agreement begins on [start_date] and ends on [end_date], unless terminated earlier.

ARTICLE III - COMPENSATION
Client shall pay Consultant: $[compensation]
Payment terms: Net 30 days from invoice date.

ARTICLE IV - INDEPENDENT CONTRACTOR
Consultant is an independent contractor, not an employee. Consultant is responsible for all taxes.

ARTICLE V - CONFIDENTIALITY
Consultant shall maintain the confidentiality of all proprietary information.

ARTICLE VI - WORK PRODUCT
All work product created under this Agreement shall be the property of Client.

ARTICLE VII - TERMINATION
Either party may terminate with 14 days written notice.

_______________________          _______________________
[consultant_name]                [client_name]
Consultant                       Client`
  },
  corporate_bylaws: {
    name: 'Prepare Corporate Bylaws',
    fields: ['corporation_name', 'state', 'fiscal_year_end', 'number_of_directors', 'registered_agent'],
    template: `CORPORATE BYLAWS OF [corporation_name]

ARTICLE I - OFFICES
The principal office shall be located in the State of [state].
Registered Agent: [registered_agent]

ARTICLE II - SHAREHOLDERS
Section 2.1 - Annual Meetings shall be held within 60 days of fiscal year end.
Section 2.2 - Special Meetings may be called by the Board or holders of 10% of shares.
Section 2.3 - Quorum shall be a majority of outstanding shares.

ARTICLE III - BOARD OF DIRECTORS
Section 3.1 - Number: The Board shall consist of [number_of_directors] directors.
Section 3.2 - Term: Directors serve one-year terms.
Section 3.3 - Meetings: Regular meetings shall be held quarterly.

ARTICLE IV - OFFICERS
The officers shall include President, Secretary, and Treasurer.

ARTICLE V - FISCAL YEAR
The fiscal year shall end on [fiscal_year_end].

ARTICLE VI - AMENDMENTS
These Bylaws may be amended by a majority vote of shareholders.

ADOPTED by the Board of Directors on _________________.

_______________________
Secretary`
  },
  demand_letter: {
    name: 'Prepare Demand Letter',
    fields: ['sender_name', 'recipient_name', 'amount_owed', 'reason_for_debt', 'payment_deadline'],
    template: `DEMAND LETTER

Date: _________________

[recipient_name]
[Recipient Address]

RE: DEMAND FOR PAYMENT

Dear [recipient_name],

This letter serves as a formal demand for payment of the amount owed to [sender_name].

AMOUNT DUE: $[amount_owed]

REASON FOR DEBT: [reason_for_debt]

You are hereby demanded to pay the full amount of $[amount_owed] on or before [payment_deadline].

CONSEQUENCES OF NON-PAYMENT:
If payment is not received by the deadline, we will have no choice but to pursue all available legal remedies, including but not limited to:
- Filing a lawsuit in the appropriate court
- Seeking attorney's fees and court costs
- Reporting to credit agencies

PAYMENT INSTRUCTIONS:
Please remit payment to:
[sender_name]
[Payment address/method]

This is a serious matter. Please treat it accordingly.

Sincerely,

_______________________
[sender_name]`
  },
  employee_severance: {
    name: 'Prepare Employee Severance Agreement',
    fields: ['employee_name', 'company_name', 'severance_amount', 'last_work_date', 'benefits_end_date'],
    template: `EMPLOYEE SEVERANCE AGREEMENT

This Severance Agreement is entered into between [company_name] ("Company") and [employee_name] ("Employee").

ARTICLE I - SEPARATION
Employee's last day of employment shall be [last_work_date].

ARTICLE II - SEVERANCE PAYMENT
Company shall pay Employee severance of: $[severance_amount]
Payment shall be made within 30 days of execution of this Agreement.

ARTICLE III - BENEFITS
Employee benefits shall continue through [benefits_end_date].
COBRA information will be provided separately.

ARTICLE IV - RELEASE OF CLAIMS
Employee releases Company from all claims arising from employment, except for vested benefits.

ARTICLE V - CONFIDENTIALITY
Employee agrees to maintain confidentiality regarding proprietary information and the terms of this Agreement.

ARTICLE VI - NON-DISPARAGEMENT
Both parties agree not to make disparaging statements about the other.

ARTICLE VII - RETURN OF PROPERTY
Employee shall return all company property by the separation date.

ARTICLE VIII - CONSIDERATION PERIOD
Employee has 21 days to consider and 7 days to revoke this Agreement.

_______________________          _______________________
[employee_name]                  [company_name]
Employee                         Company Representative`
  },
  employee_stock_option: {
    name: 'Prepare Employee Stock Option Agreement',
    fields: ['employee_name', 'company_name', 'number_of_shares', 'exercise_price', 'vesting_start_date', 'grant_date'],
    template: `EMPLOYEE STOCK OPTION AGREEMENT

This Stock Option Agreement is entered into as of [grant_date] between [company_name] ("Company") and [employee_name] ("Optionee").

ARTICLE I - GRANT OF OPTION
Company grants Optionee the option to purchase [number_of_shares] shares of Common Stock.

ARTICLE II - EXERCISE PRICE
The exercise price per share is: $[exercise_price]

ARTICLE III - VESTING SCHEDULE
Vesting commencement date: [vesting_start_date]
- 25% vests after 12 months (cliff)
- Remaining shares vest monthly over the following 36 months

ARTICLE IV - EXERCISE PERIOD
Options must be exercised within 10 years of the grant date or 90 days after termination, whichever is earlier.

ARTICLE V - METHOD OF EXERCISE
Options may be exercised by written notice and payment of the exercise price.

ARTICLE VI - TAX CONSEQUENCES
Optionee is responsible for all tax obligations arising from exercise of options.

ARTICLE VII - RESTRICTIONS
These options are non-transferable except by will or laws of descent.

_______________________          _______________________
[employee_name]                  [company_name]
Optionee                         Authorized Representative`
  },
  employment_agreement: {
    name: 'Prepare Employment Agreement',
    fields: ['employee_name', 'company_name', 'position', 'salary', 'start_date'],
    template: `EMPLOYMENT AGREEMENT

This Employment Agreement is made between [company_name] ("Employer") and [employee_name] ("Employee").

ARTICLE I - POSITION AND DUTIES
Employee is hired as [position]. Employee shall perform duties as assigned.

ARTICLE II - START DATE
Employment begins on [start_date].

ARTICLE III - COMPENSATION
Base Salary: $[salary] per year, paid bi-weekly.
Employee is eligible for bonuses at Employer's discretion.

ARTICLE IV - BENEFITS
Employee is eligible for standard company benefits including health insurance, 401(k), and PTO.

ARTICLE V - AT-WILL EMPLOYMENT
Employment is at-will and may be terminated by either party at any time with or without cause.

ARTICLE VI - CONFIDENTIALITY
Employee shall maintain confidentiality of all proprietary information during and after employment.

ARTICLE VII - NON-COMPETE
Employee agrees not to compete with Employer for 12 months following termination within 50 miles.

ARTICLE VIII - INTELLECTUAL PROPERTY
All work product created during employment belongs to Employer.

_______________________          _______________________
[employee_name]                  [company_name]
Employee                         Employer`
  },
  joint_venture_agreement: {
    name: 'Prepare Joint Venture Agreement',
    fields: ['party1_name', 'party2_name', 'venture_name', 'purpose', 'contribution1', 'contribution2', 'effective_date'],
    template: `JOINT VENTURE AGREEMENT

This Joint Venture Agreement is entered into as of [effective_date] between [party1_name] ("Party A") and [party2_name] ("Party B").

ARTICLE I - FORMATION
The parties hereby form a joint venture known as [venture_name].

ARTICLE II - PURPOSE
The purpose of this Joint Venture is: [purpose]

ARTICLE III - CONTRIBUTIONS
Party A shall contribute: [contribution1]
Party B shall contribute: [contribution2]

ARTICLE IV - PROFIT AND LOSS SHARING
Profits and losses shall be shared 50/50 unless otherwise agreed.

ARTICLE V - MANAGEMENT
Major decisions require unanimous consent. Day-to-day operations shall be managed jointly.

ARTICLE VI - TERM
This Joint Venture shall continue until completed or terminated by mutual agreement.

ARTICLE VII - CONFIDENTIALITY
Both parties shall maintain confidentiality of Joint Venture information.

ARTICLE VIII - DISPUTE RESOLUTION
Disputes shall be resolved through mediation, then binding arbitration.

_______________________          _______________________
[party1_name]                    [party2_name]
Party A                          Party B`
  },
  license_agreement: {
    name: 'Prepare License Agreement',
    fields: ['licensor_name', 'licensee_name', 'licensed_property', 'license_fee', 'territory', 'term_length'],
    template: `LICENSE AGREEMENT

This License Agreement is made between [licensor_name] ("Licensor") and [licensee_name] ("Licensee").

ARTICLE I - GRANT OF LICENSE
Licensor grants Licensee a non-exclusive license to use: [licensed_property]

ARTICLE II - TERRITORY
The license is valid in: [territory]

ARTICLE III - TERM
The license term is [term_length] from the effective date.

ARTICLE IV - LICENSE FEE
Licensee shall pay Licensor: $[license_fee]
Payment terms: Due upon execution of this Agreement.

ARTICLE V - PERMITTED USE
Licensee may use the Licensed Property for lawful business purposes as specified.

ARTICLE VI - RESTRICTIONS
Licensee shall not sublicense, modify, or reverse engineer the Licensed Property.

ARTICLE VII - INTELLECTUAL PROPERTY
All intellectual property rights remain with Licensor.

ARTICLE VIII - TERMINATION
Either party may terminate with 30 days notice for material breach.

_______________________          _______________________
[licensor_name]                  [licensee_name]
Licensor                         Licensee`
  },
  master_service_agreement: {
    name: 'Prepare Master Service Agreement',
    fields: ['provider_name', 'client_name', 'services_scope', 'payment_terms', 'effective_date'],
    template: `MASTER SERVICE AGREEMENT

This Master Service Agreement is made as of [effective_date] between [provider_name] ("Provider") and [client_name] ("Client").

ARTICLE I - SERVICES
Provider shall provide services as described in executed Statements of Work (SOWs).
General scope: [services_scope]

ARTICLE II - STATEMENTS OF WORK
Individual projects shall be governed by SOWs that reference this MSA.

ARTICLE III - COMPENSATION
Payment terms: [payment_terms]
Invoices are due Net 30 unless otherwise specified in the SOW.

ARTICLE IV - TERM
This Agreement remains in effect for 2 years and auto-renews unless terminated.

ARTICLE V - CONFIDENTIALITY
Both parties shall protect confidential information for 3 years following disclosure.

ARTICLE VI - INTELLECTUAL PROPERTY
Pre-existing IP remains with original owner. Work product ownership defined in each SOW.

ARTICLE VII - LIABILITY
Neither party liable for indirect, consequential, or punitive damages.

ARTICLE VIII - TERMINATION
Either party may terminate with 60 days written notice.

_______________________          _______________________
[provider_name]                  [client_name]
Provider                         Client`
  },
  non_compete_agreement: {
    name: 'Prepare Non-Compete Agreement',
    fields: ['employee_name', 'company_name', 'restricted_period', 'geographic_area', 'effective_date'],
    template: `NON-COMPETE AGREEMENT

This Non-Compete Agreement is made as of [effective_date] between [company_name] ("Company") and [employee_name] ("Employee").

ARTICLE I - CONSIDERATION
In exchange for employment/continued employment and other valuable consideration, Employee agrees to the following restrictions.

ARTICLE II - NON-COMPETITION
During employment and for [restricted_period] after termination, Employee shall not:
- Work for any competing business
- Start a competing business
- Solicit Company's customers or employees

ARTICLE III - GEOGRAPHIC SCOPE
These restrictions apply within: [geographic_area]

ARTICLE IV - NON-SOLICITATION
Employee shall not solicit or hire Company employees for [restricted_period] after termination.

ARTICLE V - REASONABLENESS
Both parties acknowledge these restrictions are reasonable and necessary to protect legitimate business interests.

ARTICLE VI - REMEDIES
Company may seek injunctive relief and damages for breach of this Agreement.

ARTICLE VII - SEVERABILITY
If any provision is unenforceable, it shall be modified to be enforceable.

_______________________          _______________________
[employee_name]                  [company_name]
Employee                         Company Representative`
  },
  non_disclosure_agreement: {
    name: 'Prepare Non-Disclosure Agreement',
    fields: ['discloser_name', 'recipient_name', 'purpose', 'confidential_info_description', 'effective_date'],
    template: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is entered into as of [effective_date] by and between [discloser_name] ("Disclosing Party") and [recipient_name] ("Receiving Party").

ARTICLE I - PURPOSE
This Agreement protects confidential information shared for: [purpose]

ARTICLE II - CONFIDENTIAL INFORMATION
Confidential Information includes: [confidential_info_description]

ARTICLE III - OBLIGATIONS
The Receiving Party shall:
- Use Confidential Information only for the stated purpose
- Protect information with reasonable care
- Not disclose to third parties without consent
- Return or destroy information upon request

ARTICLE IV - EXCLUSIONS
This Agreement does not apply to information that:
- Is publicly available
- Was known prior to disclosure
- Is independently developed
- Is required to be disclosed by law

ARTICLE V - TERM
This Agreement remains in effect for 3 years from the Effective Date.

ARTICLE VI - REMEDIES
Disclosing Party may seek injunctive relief for breach.

_______________________          _______________________
[discloser_name]                 [recipient_name]
Disclosing Party                 Receiving Party`
  },
  partnership_agreement: {
    name: 'Prepare Partnership Agreement',
    fields: ['partnership_name', 'partner1_name', 'partner2_name', 'business_purpose', 'profit_share_percent', 'effective_date'],
    template: `PARTNERSHIP AGREEMENT

This Partnership Agreement is made as of [effective_date] between [partner1_name] and [partner2_name] (the "Partners").

ARTICLE I - FORMATION
The Partners form a partnership under the name [partnership_name].

ARTICLE II - PURPOSE
The Partnership shall engage in: [business_purpose]

ARTICLE III - CAPITAL
Each Partner shall contribute capital as agreed. Additional contributions require unanimous consent.

ARTICLE IV - PROFITS AND LOSSES
Profits and losses shall be divided: [profit_share_percent]% to each Partner.

ARTICLE V - MANAGEMENT
Partners shall have equal management rights. Major decisions require unanimous consent.

ARTICLE VI - BANKING
Partnership funds shall be deposited in accounts designated by the Partners.

ARTICLE VII - WITHDRAWAL
A Partner may withdraw with 90 days written notice.

ARTICLE VIII - DISSOLUTION
The Partnership shall dissolve upon mutual agreement, death, or bankruptcy of a Partner.

ARTICLE IX - DISPUTE RESOLUTION
Disputes shall be resolved through mediation, then arbitration.

_______________________          _______________________
[partner1_name]                  [partner2_name]`
  },
  power_of_attorney: {
    name: 'Prepare Power of Attorney',
    fields: ['principal_name', 'agent_name', 'powers_granted', 'effective_date', 'state'],
    template: `POWER OF ATTORNEY

STATE OF [state]

I, [principal_name] ("Principal"), hereby appoint [agent_name] ("Agent") as my Attorney-in-Fact.

ARTICLE I - POWERS GRANTED
I grant my Agent authority to act on my behalf in the following matters:
[powers_granted]

ARTICLE II - EFFECTIVE DATE
This Power of Attorney is effective as of [effective_date].

ARTICLE III - DURABILITY
This Power of Attorney shall remain in effect even if I become incapacitated.

ARTICLE IV - AGENT'S DUTIES
Agent shall act in my best interest, keep accurate records, and avoid conflicts of interest.

ARTICLE V - THIRD PARTY RELIANCE
Third parties may rely on this Power of Attorney in good faith.

ARTICLE VI - REVOCATION
I may revoke this Power of Attorney at any time in writing.

ARTICLE VII - GOVERNING LAW
This Power of Attorney is governed by the laws of [state].

_______________________          _______________________
[principal_name]                 Date
Principal

ACKNOWLEDGMENT BY AGENT:
I accept this appointment.

_______________________          _______________________
[agent_name]                     Date
Agent`
  },
  settlement_agreement: {
    name: 'Prepare Settlement Agreement',
    fields: ['party1_name', 'party2_name', 'dispute_description', 'settlement_amount', 'payment_deadline'],
    template: `SETTLEMENT AGREEMENT AND RELEASE

This Settlement Agreement is made between [party1_name] ("Party A") and [party2_name] ("Party B").

RECITALS
WHEREAS, a dispute exists between the parties regarding: [dispute_description]
WHEREAS, the parties wish to resolve this dispute without further litigation.

ARTICLE I - SETTLEMENT PAYMENT
Party B shall pay Party A: $[settlement_amount]
Payment due by: [payment_deadline]

ARTICLE II - RELEASE OF CLAIMS
Upon receipt of payment, Party A releases Party B from all claims arising from the dispute.

ARTICLE III - MUTUAL RELEASE
Both parties release each other from any and all claims related to the dispute.

ARTICLE IV - NO ADMISSION
This settlement is not an admission of liability by either party.

ARTICLE V - CONFIDENTIALITY
The terms of this settlement shall remain confidential.

ARTICLE VI - NON-DISPARAGEMENT
Neither party shall make disparaging statements about the other.

ARTICLE VII - ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties.

_______________________          _______________________
[party1_name]                    [party2_name]
Party A                          Party B`
  },
  shareholder_agreement: {
    name: 'Prepare Shareholder Agreement',
    fields: ['company_name', 'shareholder1_name', 'shareholder2_name', 'shareholder1_shares', 'shareholder2_shares', 'effective_date'],
    template: `SHAREHOLDER AGREEMENT

This Shareholder Agreement is made as of [effective_date] among the shareholders of [company_name].

ARTICLE I - SHAREHOLDERS
[shareholder1_name]: [shareholder1_shares] shares
[shareholder2_name]: [shareholder2_shares] shares

ARTICLE II - BOARD REPRESENTATION
Shareholders shall be entitled to board representation proportionate to ownership.

ARTICLE III - VOTING
Major decisions require approval of shareholders holding 2/3 of outstanding shares.

ARTICLE IV - TRANSFER RESTRICTIONS
No shareholder may transfer shares without first offering them to other shareholders (Right of First Refusal).

ARTICLE V - DRAG-ALONG
If majority shareholders accept a bona fide offer, minority shareholders must sell on same terms.

ARTICLE VI - TAG-ALONG
If majority shareholders sell, minority shareholders may participate proportionately.

ARTICLE VII - DIVIDENDS
Dividends shall be declared at the Board's discretion and distributed pro rata.

ARTICLE VIII - DISPUTE RESOLUTION
Disputes shall be resolved through binding arbitration.

_______________________          _______________________
[shareholder1_name]              [shareholder2_name]`
  },
  terms_of_service: {
    name: 'Prepare Terms of Service/Use Agreement',
    fields: ['company_name', 'website_url', 'service_description', 'jurisdiction', 'effective_date'],
    template: `TERMS OF SERVICE

Effective Date: [effective_date]

Welcome to [website_url]. These Terms of Service govern your use of [company_name]'s services.

1. ACCEPTANCE
By using our services, you agree to these Terms. If you do not agree, do not use our services.

2. SERVICES
[company_name] provides: [service_description]

3. USER ACCOUNTS
You are responsible for maintaining the security of your account and all activities under your account.

4. ACCEPTABLE USE
You agree not to:
- Violate any laws
- Infringe intellectual property rights
- Transmit harmful code
- Interfere with service operation

5. INTELLECTUAL PROPERTY
All content and materials are owned by [company_name] and protected by copyright.

6. LIMITATION OF LIABILITY
[company_name] is not liable for indirect, incidental, or consequential damages.

7. TERMINATION
We may terminate your access for violation of these Terms.

8. GOVERNING LAW
These Terms are governed by the laws of [jurisdiction].

9. CHANGES
We may modify these Terms at any time. Continued use constitutes acceptance.

[company_name]`
  },
  website_hosting_agreement: {
    name: 'Prepare Website Hosting Agreement',
    fields: ['provider_name', 'client_name', 'monthly_fee', 'storage_limit', 'bandwidth_limit', 'effective_date'],
    template: `WEBSITE HOSTING AGREEMENT

This Website Hosting Agreement is made as of [effective_date] between [provider_name] ("Provider") and [client_name] ("Client").

ARTICLE I - HOSTING SERVICES
Provider shall provide website hosting services including:
- Web server space: [storage_limit]
- Monthly bandwidth: [bandwidth_limit]
- Email accounts
- Technical support

ARTICLE II - FEES
Monthly hosting fee: $[monthly_fee]
Payment due on the 1st of each month.

ARTICLE III - UPTIME GUARANTEE
Provider guarantees 99.9% uptime, excluding scheduled maintenance.

ARTICLE IV - CLIENT RESPONSIBILITIES
Client shall:
- Provide accurate account information
- Not host illegal or harmful content
- Maintain current payment

ARTICLE V - BACKUPS
Provider performs daily backups. Client is responsible for maintaining independent backups.

ARTICLE VI - TERM AND TERMINATION
This Agreement is month-to-month. Either party may terminate with 30 days notice.

ARTICLE VII - LIMITATION OF LIABILITY
Provider's liability is limited to fees paid in the preceding 12 months.

_______________________          _______________________
[provider_name]                  [client_name]
Provider                         Client`
  },
  routine_document_review: {
    name: 'Routine Document Review',
    fields: ['client_name', 'document_type', 'document_description', 'review_date', 'reviewer_name'],
    template: `DOCUMENT REVIEW CHECKLIST

Client: [client_name]
Document Type: [document_type]
Description: [document_description]
Review Date: [review_date]
Reviewer: [reviewer_name]

REVIEW CHECKLIST:

[ ] Document completeness verified
[ ] All parties properly identified
[ ] Dates and deadlines confirmed
[ ] Financial terms verified
[ ] Legal terminology appropriate
[ ] Governing law specified
[ ] Signature blocks present
[ ] Exhibits/attachments included
[ ] Compliance with applicable laws
[ ] No conflicting provisions

COMMENTS AND RECOMMENDATIONS:
_____________________________________________
_____________________________________________
_____________________________________________

RISK ASSESSMENT:
[ ] Low Risk
[ ] Medium Risk
[ ] High Risk - Further review recommended

RECOMMENDATION:
[ ] Approved as-is
[ ] Approved with minor changes
[ ] Requires significant revision
[ ] Not recommended

_______________________          _______________________
[reviewer_name]                  Date
Reviewer`
  },
  s_corp_c_corp_formation: {
    name: 'S-corp or C-corp Formation',
    fields: ['corporation_name', 'state', 'shares_authorized', 'incorporator_name', 'registered_agent', 'effective_date'],
    template: `ARTICLES OF INCORPORATION

ARTICLE I - NAME
The name of this corporation is: [corporation_name]

ARTICLE II - PURPOSE
The purpose of the corporation is to engage in any lawful business activity.

ARTICLE III - AUTHORIZED SHARES
The corporation is authorized to issue [shares_authorized] shares of common stock.

ARTICLE IV - REGISTERED AGENT
The registered agent in [state] is: [registered_agent]

ARTICLE V - INCORPORATOR
The name of the incorporator is: [incorporator_name]

ARTICLE VI - BOARD OF DIRECTORS
The initial Board shall consist of one or more directors as determined by the incorporator.

ARTICLE VII - INDEMNIFICATION
The corporation shall indemnify directors and officers to the fullest extent permitted by law.

ARTICLE VIII - AMENDMENTS
These Articles may be amended by shareholder vote as provided by law.

EFFECTIVE DATE: [effective_date]

IN WITNESS WHEREOF, the incorporator has executed these Articles.

_______________________          _______________________
[incorporator_name]              Date
Incorporator

NOTE: For S-Corp election, file IRS Form 2553 within 75 days of formation.`
  },
  single_member_llc_formation: {
    name: 'Single Member LLC Formation',
    fields: ['llc_name', 'member_name', 'state', 'business_purpose', 'initial_contribution', 'effective_date'],
    template: `OPERATING AGREEMENT FOR SINGLE MEMBER LLC

OPERATING AGREEMENT OF [llc_name], LLC

This Operating Agreement is made as of [effective_date] by [member_name] (the "Member").

ARTICLE I - FORMATION
The Member forms a single member limited liability company in [state] under the name [llc_name], LLC.

ARTICLE II - PURPOSE
The purpose of the LLC is: [business_purpose]

ARTICLE III - MEMBER
The sole Member is: [member_name]
The Member holds 100% of the membership interest.

ARTICLE IV - CAPITAL CONTRIBUTION
Initial capital contribution: $[initial_contribution]

ARTICLE V - MANAGEMENT
The LLC shall be managed by its Member.

ARTICLE VI - DISTRIBUTIONS
The Member may make distributions at any time at Member's sole discretion.

ARTICLE VII - TAX TREATMENT
The LLC shall be treated as a disregarded entity for federal tax purposes unless the Member elects otherwise.

ARTICLE VIII - DISSOLUTION
The LLC shall dissolve upon Member's death, bankruptcy, or written decision to dissolve.

_______________________          _______________________
[member_name]                    Date
Member`
  }
};

interface DocumentFormFieldsProps {
  selectedTemplate: keyof typeof templates;
  templates: typeof templates;
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  onBack: () => void;
  onGenerate: () => void;
  lang: 'en' | 'es';
}

function DocumentFormFields({
  selectedTemplate,
  templates,
  formData,
  setFormData,
  onBack,
  onGenerate,
  lang
}: DocumentFormFieldsProps) {
  const en = lang === 'en';
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const fieldConfigs = useMemo(() => {
    return templates[selectedTemplate].fields.map(field =>
      getFieldConfig(selectedTemplate, field)
    );
  }, [selectedTemplate, templates]);

  const validationStatus = useMemo(() => {
    const results: Record<string, { isValid: boolean; error: string | null }> = {};
    let allValid = true;
    let filledCount = 0;
    const totalRequired = fieldConfigs.filter(f => f.required).length;

    fieldConfigs.forEach(config => {
      const value = formData[config.name] || '';
      const result = validateField(value, config, formData);
      results[config.name] = result;

      if (config.required && value.trim()) {
        filledCount++;
      }

      if (config.required && !result.isValid) {
        allValid = false;
      }
    });

    return {
      results,
      allValid,
      filledCount,
      totalRequired,
      progress: totalRequired > 0 ? Math.round((filledCount / totalRequired) * 100) : 0
    };
  }, [fieldConfigs, formData]);

  const handleGenerate = () => {
    setAttemptedSubmit(true);
    if (validationStatus.allValid) {
      onGenerate();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-navy-900">
            {en ? templates[selectedTemplate].name : (templateNameES[selectedTemplate] || templates[selectedTemplate].name)}
          </h3>
          <p className="text-sm text-navy-500 mt-1">
            {en ? 'Fill in the details below to generate your document' : 'Completa los detalles a continuacion para generar tu documento'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-navy-500 mb-1">{en ? 'Completion' : 'Completado'}</div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-navy-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    validationStatus.progress === 100
                      ? 'bg-green-500'
                      : validationStatus.progress > 50
                        ? 'bg-teal-500'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${validationStatus.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-navy-700">
                {validationStatus.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {attemptedSubmit && !validationStatus.allValid && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3" role="alert">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">{en ? 'Please complete all required fields' : 'Por favor completa todos los campos obligatorios'}</p>
            <p className="text-sm text-amber-700 mt-1">
              {validationStatus.totalRequired - validationStatus.filledCount} {en ? 'required field(s) need your attention' : 'campo(s) obligatorio(s) necesitan tu atencion'}
            </p>
          </div>
        </div>
      )}

      {validationStatus.progress === 100 && validationStatus.allValid && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3" role="status">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">{en ? 'All fields completed' : 'Todos los campos completados'}</p>
            <p className="text-sm text-green-700 mt-1">
              {en ? 'Your document is ready to generate' : 'Tu documento esta listo para generar'}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {fieldConfigs.map((config) => (
          <ValidatedFormField
            key={config.name}
            config={config}
            value={formData[config.name] || ''}
            onChange={(value) => setFormData({ ...formData, [config.name]: value })}
            allValues={formData}
            showValidation={attemptedSubmit || (formData[config.name]?.length > 0)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-200">
        <div className="text-sm text-navy-500">
          <span className="text-red-500">*</span> {en ? 'Required fields' : 'Campos obligatorios'}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-2.5 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors"
          >
            {en ? 'Back' : 'Volver'}
          </button>
          <button
            onClick={handleGenerate}
            disabled={attemptedSubmit && !validationStatus.allValid}
            className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
              validationStatus.allValid
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-navy-100 text-navy-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            {en ? 'Generate Document' : 'Generar Documento'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [documentJurisdiction, setDocumentJurisdiction] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates | 'custom' | ''>('');
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [customDocumentType, setCustomDocumentType] = useState('');
  const [customDocumentDescription, setCustomDocumentDescription] = useState('');
  const [customDocumentParties, setCustomDocumentParties] = useState('');
  const [customDocumentDetails, setCustomDocumentDetails] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isBusiness, isOrganization } = usePersonaRouting();

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    loadDocuments();
  }, [user?.id]);

  const loadDocuments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleTemplateSelect = (template: keyof typeof templates) => {
    setSelectedTemplate(template);
    const templateData = templates[template];
    const initialFormData: { [key: string]: string } = {};
    templateData.fields.forEach(field => {
      initialFormData[field] = '';
    });
    setFormData(initialFormData);
    setDocumentTitle(templateData.name);
    setGeneratedContent('');
  };

  const generateDocument = () => {
    if (!selectedTemplate || selectedTemplate === 'custom') return;

    let content = templates[selectedTemplate].template;
    Object.entries(formData).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    });
    setGeneratedContent(content);
  };

  const generateCustomDocument = async () => {
    if (!customDocumentType.trim() || !customDocumentDescription.trim()) return;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      alert(language === 'en' ? 'Service configuration error. Please try again later.' : 'Error de configuracion del servicio. Intente de nuevo mas tarde.');
      return;
    }

    setIsGeneratingCustom(true);

    try {
      const prompt = `Generate an informational legal draft with the following specifications. This draft is for educational/informational purposes and should be reviewed by a licensed attorney before use.

DOCUMENT TYPE: ${customDocumentType}

DESCRIPTION/PURPOSE: ${customDocumentDescription}

${customDocumentParties ? `PARTIES INVOLVED: ${customDocumentParties}` : ''}

${customDocumentDetails ? `ADDITIONAL DETAILS: ${customDocumentDetails}` : ''}

${documentJurisdiction ? `JURISDICTION: ${documentJurisdiction}` : ''}

Please generate a complete draft document that:
1. Includes all standard sections appropriate for this type of document
2. Uses proper legal formatting with numbered articles/sections
3. Includes signature blocks where appropriate
4. Uses placeholder text in [BRACKETS] for any specific information that needs to be filled in
5. Includes standard legal disclaimers and boilerplate language
6. Is ready for attorney review and customization

Generate the complete document text now.`;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          sessionId: crypto.randomUUID(),
          jurisdiction: documentJurisdiction || 'General',
          modelOverride: selectedModel || undefined,
          maxTokens: 8192,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate document (status ${response.status})`);
      }

      const data = await response.json();
      if (!data || typeof data.response !== 'string' || !data.response.trim()) {
        throw new Error('Invalid response from document generation service');
      }
      let generatedText = data.response;

      const followUpStart = generatedText.indexOf('---FOLLOW_UP_QUESTIONS---');
      if (followUpStart !== -1) {
        generatedText = generatedText.substring(0, followUpStart).trim();
      }

      setGeneratedContent(generatedText);
      setDocumentTitle(customDocumentType);
    } catch (error) {
      console.error('Error generating custom document:', error);
      alert(language === 'en' ? 'Failed to generate document. Please try again.' : 'Error al generar el documento. Intente de nuevo.');
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!generatedContent) return;

    if (!user) {
      const blob = new Blob([generatedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle || 'document'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(language === 'en' ? 'Document downloaded! Sign up to save and manage all your documents online.' : 'Documento descargado! Registrate para guardar y administrar tus documentos en linea.');
      return;
    }

    const { error } = await supabase.from('documents').insert({
      user_id: user.id,
      title: documentTitle,
      document_type: selectedTemplate || 'custom',
      content: generatedContent,
      template_used: selectedTemplate || null,
      case_id: null,
      jurisdiction: documentJurisdiction || null,
    });

    if (!error) {
      setShowModal(false);
      setSelectedTemplate('');
      setFormData({});
      setGeneratedContent('');
      setDocumentTitle('');
      setDocumentJurisdiction('');
      loadDocuments();
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJurisdiction = !selectedJurisdiction || doc.jurisdiction === selectedJurisdiction;
    return matchesSearch && matchesJurisdiction;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {!user && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl px-6 py-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-navy-900">{language === 'en' ? 'Try Document Generation Free!' : 'Prueba la Generacion de Documentos Gratis!'}</p>
                <p className="text-sm text-navy-600">{language === 'en' ? 'Generate documents now, sign up to save them online' : 'Genera documentos ahora, registrate para guardarlos en linea'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/signup"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold shadow-md text-sm"
              >
                {language === 'en' ? 'Create Account' : 'Crear Cuenta'}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          {language === 'en' ? 'Legal Documents' : 'Documentos Legales'}
        </h1>
        <p className="text-navy-600">
          {language === 'en' ? 'Create informational legal drafts for review by a licensed attorney' : 'Crea borradores legales informativos para revision por un abogado licenciado'}
        </p>
      </div>

      {/* Non-dismissible scope boundary — legal information only */}
      <div className="mb-6 p-4 bg-slate-100 border border-slate-300 rounded-xl flex items-start gap-3" role="region" aria-label={language === 'en' ? 'Legal scope notice' : 'Aviso de alcance legal'}>
        <AlertTriangle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          {language === 'en'
            ? 'This tool provides legal information and workflow support only — not legal advice. All generated documents are informational drafts requiring review by a licensed attorney before use.'
            : 'Esta herramienta proporciona solo informacion legal y soporte de flujo de trabajo — no asesoramiento legal. Todos los documentos generados son borradores informativos que requieren revision por un abogado licenciado antes de su uso.'}
        </p>
      </div>

      {isOrganization && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Users className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 mb-1">
              {language === 'en' ? 'Organization Mode' : 'Modo Organizacion'}
            </p>
            <p className="text-amber-700">
              {language === 'en'
                ? 'Documents generated here are templates requiring attorney review before client distribution. Always verify jurisdiction-specific requirements.'
                : 'Los documentos generados aqui son plantillas que requieren revision de abogado antes de la distribucion al cliente. Siempre verifique los requisitos jurisdiccionales.'}
            </p>
          </div>
        </div>
      )}

      {isBusiness && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-800 mb-1">
              {language === 'en' ? 'Business Templates' : 'Plantillas de Negocios'}
            </p>
            <p className="text-blue-700">
              {language === 'en'
                ? 'Recommended: LLC Formation, Employment Agreements, NDAs, Consultant Agreements, and Master Service Agreements.'
                : 'Recomendados: Formacion de LLC, Contratos de Empleo, NDAs, Contratos de Consultor y Acuerdos de Servicios.'}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search documents...' : 'Buscar documentos...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="w-full lg:w-64">
            <div className="flex items-center gap-2">
              <MapPin className="text-navy-400 w-5 h-5 flex-shrink-0" />
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value)}
                className="flex-1 px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                aria-label={language === 'en' ? 'Filter by jurisdiction' : 'Filtrar por jurisdiccion'}
              >
                <option value="">{language === 'en' ? 'All Jurisdictions' : 'Todas las Jurisdicciones'}</option>
                {JURISDICTION_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((jurisdiction) => (
                      <option key={jurisdiction.code} value={jurisdiction.code}>
                        {jurisdiction.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowOCRScanner(true)}
            className="bg-navy-700 hover:bg-navy-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <ScanLine className="w-5 h-5" />
            {language === 'en' ? 'Scan Document' : 'Escanear Documento'}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            {language === 'en' ? 'Generate Document' : 'Generar Documento'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy-900 mb-1 truncate">{doc.title}</h3>
                <p className="text-sm text-navy-500 capitalize">{language === 'es' && templateNameES[doc.document_type] ? templateNameES[doc.document_type] : doc.document_type.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <p className="text-sm text-navy-600 mb-4 line-clamp-3">
              {doc.content.substring(0, 150)}...
            </p>

            <div className="flex items-center justify-between text-xs text-navy-500">
              <div className="flex items-center gap-2">
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                {doc.jurisdiction && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                    <MapPin className="w-3 h-3" />
                    {getJurisdictionName(doc.jurisdiction)}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  const blob = new Blob([doc.content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${doc.title || 'document'}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                {language === 'en' ? 'Download' : 'Descargar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-navy-200">
          <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-navy-400" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            {language === 'en' ? 'No documents found' : 'No se encontraron documentos'}
          </h3>
          <p className="text-navy-600 mb-4">
            {language === 'en' ? 'Create your first informational legal draft' : 'Crea tu primer borrador legal informativo'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            {language === 'en' ? 'Generate Document' : 'Generar Documento'}
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-navy-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-navy-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy-900">
                {language === 'en' ? 'Generate Legal Document' : 'Generar Documento Legal'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTemplate('');
                  setFormData({});
                  setGeneratedContent('');
                  setDocumentTitle('');
                  setDocumentJurisdiction('');
                  setCustomDocumentType('');
                  setCustomDocumentDescription('');
                  setCustomDocumentParties('');
                  setCustomDocumentDetails('');
                }}
                className="text-navy-400 hover:text-navy-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {!selectedTemplate ? (
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">
                    {language === 'en' ? 'Choose a Template' : 'Elige una Plantilla'}
                  </h3>
                  {language === 'es' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                      <Globe className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Los documentos legales se generan en ingles para garantizar la precision juridica. Para uso en espanol, recomendamos la revision y traduccion por un abogado licenciado.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(templates).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => handleTemplateSelect(key as keyof typeof templates)}
                        className="p-4 border-2 border-navy-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
                      >
                        <FileText className="w-8 h-8 text-teal-600 mb-2" />
                        <h4 className="font-semibold text-navy-900">{language === 'es' ? (templateNameES[key] || template.name) : template.name}</h4>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedTemplate('custom');
                        setDocumentTitle('');
                        setGeneratedContent('');
                      }}
                      className="p-4 border-2 border-dashed border-teal-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-left bg-gradient-to-br from-teal-50 to-white"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Wand2 className="w-8 h-8 text-teal-600" />
                        <span className="text-xs font-medium px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">{language === 'en' ? 'AI-Powered' : 'Con IA'}</span>
                      </div>
                      <h4 className="font-semibold text-navy-900">{language === 'en' ? 'Custom Document' : 'Documento Personalizado'}</h4>
                      <p className="text-sm text-navy-500 mt-1">{language === 'en' ? 'Describe any document type and let AI generate it for you' : 'Describe cualquier tipo de documento y deja que la AI lo genere por ti'}</p>
                    </button>
                  </div>
                </div>
              ) : selectedTemplate === 'custom' && !generatedContent ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-navy-900">{language === 'en' ? 'Create Custom Document' : 'Crear Documento Personalizado'}</h3>
                      <p className="text-sm text-navy-500 mt-1">{language === 'en' ? 'Describe the document you need and AI will generate it' : 'Describe el documento que necesitas y la AI lo generara'}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-full">
                      <Wand2 className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-medium text-teal-700">{language === 'en' ? 'AI-Powered' : 'Con IA'}</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {language === 'en' ? 'Document Type' : 'Tipo de Documento'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customDocumentType}
                        onChange={(e) => setCustomDocumentType(e.target.value)}
                        placeholder={language === 'en' ? 'e.g., Independent Contractor Agreement, Cease and Desist Letter, Release of Liability...' : 'ej., Contrato de Contratista Independiente, Carta de Cese y Desista, Liberacion de Responsabilidad...'}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <p className="text-xs text-navy-500 mt-1">{language === 'en' ? 'Enter any type of legal document you need' : 'Ingresa cualquier tipo de documento legal que necesites'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {language === 'en' ? 'Description & Purpose' : 'Descripcion y Proposito'} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={customDocumentDescription}
                        onChange={(e) => setCustomDocumentDescription(e.target.value)}
                        placeholder={language === 'en' ? 'Describe what this document is for, its purpose, and any specific requirements...' : 'Describe para que es este documento, su proposito y cualquier requisito especifico...'}
                        rows={4}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {language === 'en' ? 'Parties Involved' : 'Partes Involucradas'}
                      </label>
                      <input
                        type="text"
                        value={customDocumentParties}
                        onChange={(e) => setCustomDocumentParties(e.target.value)}
                        placeholder={language === 'en' ? 'e.g., Company ABC (Employer) and John Doe (Contractor)' : 'ej., Empresa ABC (Empleador) y Juan Perez (Contratista)'}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {language === 'en' ? 'Additional Details' : 'Detalles Adicionales'}
                      </label>
                      <textarea
                        value={customDocumentDetails}
                        onChange={(e) => setCustomDocumentDetails(e.target.value)}
                        placeholder={language === 'en' ? 'Any specific terms, clauses, dates, amounts, or other details to include...' : 'Cualquier termino, clausula, fecha, monto u otros detalles especificos a incluir...'}
                        rows={3}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {language === 'en' ? 'Jurisdiction' : 'Jurisdiccion'}
                      </label>
                      <select
                        value={documentJurisdiction}
                        onChange={(e) => setDocumentJurisdiction(e.target.value)}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">{language === 'en' ? 'Select Jurisdiction (optional)' : 'Seleccionar Jurisdiccion (opcional)'}</option>
                        {JURISDICTION_GROUPS.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((jurisdiction) => (
                              <option key={jurisdiction.code} value={jurisdiction.code}>
                                {jurisdiction.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <p className="text-xs text-navy-500 mt-1">{language === 'en' ? 'If applicable, select the state whose laws should govern this document' : 'Si aplica, selecciona el estado cuyas leyes deben regir este documento'}</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <AIModelSelector
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                      variant="compact"
                      label={language === 'en' ? 'AI Model for Document Generation' : 'Modelo AI para Generacion de Documentos'}
                      showDescription={false}
                    />
                    <p className="text-xs text-navy-500 mt-2">{language === 'en' ? 'Premium models (GPT-5 series) provide more comprehensive and sophisticated legal documents' : 'Los modelos premium (serie GPT-5) proporcionan documentos legales mas completos y sofisticados'}</p>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-200">
                    <div className="text-sm text-navy-500">
                      <span className="text-red-500">*</span> {language === 'en' ? 'Required fields' : 'Campos obligatorios'}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedTemplate('');
                          setCustomDocumentType('');
                          setCustomDocumentDescription('');
                          setCustomDocumentParties('');
                          setCustomDocumentDetails('');
                        }}
                        className="px-6 py-2.5 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                      >
                        {language === 'en' ? 'Back' : 'Volver'}
                      </button>
                      <button
                        onClick={generateCustomDocument}
                        disabled={!customDocumentType.trim() || !customDocumentDescription.trim() || isGeneratingCustom}
                        className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                          customDocumentType.trim() && customDocumentDescription.trim() && !isGeneratingCustom
                            ? 'bg-teal-600 hover:bg-teal-700 text-white'
                            : 'bg-navy-200 text-navy-400 cursor-not-allowed'
                        }`}
                      >
                        {isGeneratingCustom ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {language === 'en' ? 'Generating...' : 'Generando...'}
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5" />
                            {language === 'en' ? 'Generate Document' : 'Generar Documento'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedTemplate !== 'custom' && !generatedContent ? (
                <DocumentFormFields
                  selectedTemplate={selectedTemplate as keyof typeof templates}
                  templates={templates}
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => {
                    setSelectedTemplate('');
                    setFormData({});
                  }}
                  onGenerate={generateDocument}
                  lang={language === 'es' ? 'es' : 'en'}
                />
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">
                    {language === 'en' ? 'Preview & Save' : 'Vista Previa y Guardar'}
                  </h3>

                  {/* Non-dismissible legal disclaimer */}
                  <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-amber-800">
                          {language === 'en' ? 'Important: This is an informational draft only' : 'Importante: Este es solo un borrador informativo'}
                        </p>
                        <p className="text-amber-700 mt-1">
                          {language === 'en'
                            ? 'This AI-generated document is not legal advice and may not be suitable for your specific situation. Have a licensed attorney review any document before signing or relying on it.'
                            : 'Este documento generado por AI no es asesoramiento legal y puede no ser adecuado para su situacion especifica. Haga que un abogado licenciado revise cualquier documento antes de firmarlo o depender de el.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {language === 'es' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                      <Globe className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Los documentos legales se generan en ingles para garantizar la precision juridica. Para uso en espanol, recomendamos la revision y traduccion por un abogado licenciado.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {language === 'en' ? 'Document Title' : 'Titulo del Documento'}
                      </label>
                      <input
                        type="text"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {language === 'en' ? 'Jurisdiction' : 'Jurisdiccion'}
                      </label>
                      <div className="flex items-center gap-2">
                        <MapPin className="text-navy-400 w-5 h-5 flex-shrink-0" />
                        <select
                          value={documentJurisdiction}
                          onChange={(e) => setDocumentJurisdiction(e.target.value)}
                          className="flex-1 px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          aria-label={language === 'en' ? 'Select document jurisdiction' : 'Seleccionar jurisdiccion del documento'}
                        >
                          <option value="">{language === 'en' ? 'Select Jurisdiction' : 'Seleccionar Jurisdiccion'}</option>
                          {JURISDICTION_GROUPS.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                              {group.options.map((jurisdiction) => (
                                <option key={jurisdiction.code} value={jurisdiction.code}>
                                  {jurisdiction.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-navy-500 mt-1">
                        {language === 'en' ? 'Select the jurisdiction this document applies to' : 'Selecciona la jurisdiccion a la que aplica este documento'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-navy-50 border border-navy-200 rounded-lg p-6 mb-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-navy-700 font-mono">
                      {generatedContent}
                    </pre>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setGeneratedContent('')}
                      className="px-6 py-2 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50"
                    >
                      {language === 'en' ? 'Edit' : 'Editar'}
                    </button>
                    <button
                      onClick={handleSaveDocument}
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                    >
                      {user
                        ? (language === 'en' ? 'Save Document' : 'Guardar Documento')
                        : (language === 'en' ? 'Download Document' : 'Descargar Documento')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showOCRScanner && (
        <div className="fixed inset-0 bg-navy-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="max-w-3xl w-full">
            <DocumentOCRProcessor
              onClose={() => setShowOCRScanner(false)}
              onTextExtracted={(text) => {
                setCustomDocumentDescription(text);
                setShowOCRScanner(false);
                setSelectedTemplate('custom');
                setShowModal(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

```

---

# SECTION 2: CONTEXT FILES (Reference Only — Do Not Audit)

These files provide type definitions and architectural context.
They are NOT audit targets. Do NOT suggest changes to these files.

## Context: src/lib/translations.ts

```tsx
export const translations = {
  en: {
    // Navigation
    'nav.intro': 'Overview',
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.company': 'Company',
    'nav.legal': 'Legal',
    'nav.forOrganizations': 'For Organizations',
    'nav.forBusiness': 'For Business',
    'nav.product': 'Product',
    'nav.getStarted': 'Get Started',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Sign Out',
    'nav.help': 'Help',
    'nav.about': 'About',
    'nav.adminDashboard': 'Admin Dashboard',
    'nav.aiGovernance': 'AI Governance',
    'nav.contact': 'Contact',
    'nav.getHelp': 'Get Help',
    'nav.howAiWorks': 'How AI Works',
    'nav.legalGuides': 'Legal Guides',
    'nav.partnerProgram': 'Partner Program',
    'nav.trustSafety': 'Trust & Safety',

    // Hero Section
    'hero.tagline': 'AI-Powered Legal Guidance, Instantly',
    'hero.subtitle': 'Get answers to your legal questions in seconds, not weeks. Powered by AI and reviewed by lawyers.',
    'hero.cta': 'Start Free',
    'hero.secondary': 'Schedule Demo',
    'hero.badge': 'Trusted by thousands',
    'hero.noCreditCard': 'No credit card required',

    // Home Page
    'home.title': 'ezLegal.ai - Your AI Legal Assistant',
    'home.description': 'Get instant legal guidance with AI-powered answers and attorney review.',
    'home.features': 'Features',
    'home.pricing': 'Pricing',
    'home.about': 'About Us',
    'home.contact': 'Contact',

    // Common
    'common.learnMore': 'Learn More',
    'common.getStarted': 'Get Started',
    'common.signUp': 'Sign Up',
    'common.signIn': 'Sign In',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.skip': 'Skip',
    'common.continue': 'Continue',
    'common.or': 'Or',
    'common.and': 'and',
    'common.required': 'Required',
    'common.optional': 'Optional',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.view': 'View',
    'common.download': 'Download',
    'common.print': 'Print',
    'common.share': 'Share',
    'common.copy': 'Copy',
    'common.copyLink': 'Copy Link',
    'common.copied': 'Copied!',
    'common.tryAgain': 'Try Again',
    'common.noResults': 'No results found',
    'common.empty': 'No data available',
    'common.terms': 'Terms of Service',
    'common.privacy': 'Privacy Policy',

    // Login Page
    'login.welcomeBack': 'Welcome Back',
    'login.continueHelp': 'Continue where you left off',
    'login.freeToStart': 'Free to start',
    'login.freeForever': 'Free forever plan available',
    'login.noCreditCard': 'No credit card required',
    'login.ethicalAi': 'Ethical AI',
    'login.neverTrains': 'Your data is never used to train AI models',
    'login.access247': '24/7 Access',
    'login.wheneverYouNeed': 'Get legal guidance whenever you need it',
    'login.bankSecurity': 'Bank-Level Security',
    'login.encryption': '256-bit encryption protects your data',
    'login.enterPassword': 'Enter your password',
    'login.signingIn': 'Signing in...',

// ... [1429 lines omitted for brevity] ...

    'scheduleDemo.organization': 'Organización',
    'scheduleDemo.preferredTime': 'Hora preferida',
    'scheduleDemo.submit': 'Solicitar demostración',
    'scheduleDemo.success': '\u00A1Gracias! Nos pondremos en contacto pronto.',

    // Guía de funciones
    'featureGuide.title': 'Guía de funciones',
    'featureGuide.subtitle': 'Aprende cómo sacar el máximo provecho de ezLegal.ai',

    // Herramientas
    'toolkit.title': 'Herramientas legales',
    'toolkit.subtitle': 'Herramientas esenciales para tus necesidades legales',
    'toolkit.templates': 'Plantillas de documentos',
    'toolkit.calculators': 'Calculadoras legales',
    'toolkit.checklists': 'Listas de verificación',

    // Casos
    'cases.title': 'Predictor de casos',
    'cases.subtitle': 'Predicción de resultados de casos impulsada por IA',
    'cases.start': 'Iniciar predicción',
    'cases.disclaimer': 'Las predicciones son solo estimaciones, no garantías.',

    // Auditoría del sitio
    'siteAudit.title': 'Auditoría del sitio',
    'siteAudit.status': 'Estado',
    'siteAudit.passed': 'Aprobado',
    'siteAudit.failed': 'Fallido',
    'siteAudit.warning': 'Advertencia',

    // Landing en español
    'espanol.title': 'Asistencia Legal con IA',
    'espanol.subtitle': 'Orientación legal en español, impulsada por inteligencia artificial.',
    'espanol.cta': 'Comenzar Ahora',
    'espanol.immigration': 'Inmigración',
    'espanol.housing': 'Vivienda',
    'espanol.employment': 'Empleo',
    'espanol.family': 'Familia',

    // Sin conexión
    'offline.title': 'Sin conexión',
    'offline.message': 'Algunas funciones pueden no estar disponibles hasta que te reconectes.',
    'offline.retry': 'Reintentar conexión',

    // PWA
    'pwa.install': 'Instalar aplicación',
    'pwa.installDesc': 'Agrega ezLegal.ai a tu pantalla de inicio para acceso rápido.',
    'pwa.later': 'Quizás después',
  }
};

```

---

## Context: src/contexts/LanguageContext.tsx

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { translations } from '../lib/translations';
import {
  type Language,
  type Direction,
  SUPPORTED_LOCALES,
  getLocaleDescriptor,
  detectBrowserLanguage,
  getBrowserTimezone,
  applyDirectionToDom,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatList,
  selectPlural,
} from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { trackEvent, setAnalyticsLanguage } from '../services/analytics-service';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

interface LanguageContextType {
  language: Language;
  locale: string;
  dir: Direction;
  timezone: string;
  setLanguage: (lang: Language) => void;
  setLocale: (bcp47: string) => void;
  t: TranslateFn;
  formatDate: (v: Date | string | number, opts?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (v: Date | string | number) => string;
  formatRelativeTime: (v: Date | string | number) => string;
  formatNumber: (v: number, opts?: Intl.NumberFormatOptions) => string;
  formatCurrency: (v: number, currency?: string) => string;
  formatPercent: (v: number, fractionDigits?: number) => string;
  formatList: (items: string[], type?: Intl.ListFormatType) => string;
  plural: (count: number, forms: { zero?: string; one: string; two?: string; few?: string; many?: string; other: string }) => string;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG = 'ezlegal-language';
const STORAGE_LOCALE = 'ezlegal-locale';

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_LANG);
    if (saved && SUPPORTED_LOCALES.some((l) => l.code === saved)) return saved as Language;
    return detectBrowserLanguage();
  });

  const [locale, setLocaleState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_LOCALE);
    if (saved) return saved;
    return getLocaleDescriptor(language).bcp47;
  });

  const [timezone, setTimezone] = useState<string>(() => getBrowserTimezone());

  const descriptor = useMemo(() => getLocaleDescriptor(language), [language]);
  const dir: Direction = descriptor.dir;

  useEffect(() => {
    localStorage.setItem(STORAGE_LANG, language);
    localStorage.setItem(STORAGE_LOCALE, locale);
    applyDirectionToDom(dir, locale, language);
  }, [language, locale, dir]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user || !active) return;
        const { data } = await supabase
          .from('accessibility_preferences')
          .select('locale, timezone')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!active || !data) return;
        if (data.locale) {
          const code = data.locale.split('-')[0] as Language;
          const match = SUPPORTED_LOCALES.find((l) => l.code === code);
          if (match) {
            setLanguageState(match.code);
            setLocaleState(data.locale);
          }
        }
        if (data.timezone) setTimezone(data.timezone);
      } catch { /* gracefully handle unauthenticated or network errors */ }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (patch: { locale?: string; timezone?: string }) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;
      await supabase
        .from('accessibility_preferences')
        .upsert(
          { user_id: user.id, ...patch, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
    } catch { /* gracefully handle unauthenticated or network errors */ }
  }, []);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      setAnalyticsLanguage(lang);
      trackEvent('language_selected', { language: lang });
      const bcp47 = getLocaleDescriptor(lang).bcp47;
      setLocaleState(bcp47);
      void persist({ locale: bcp47 });
    },
    [persist],
  );

  const setLocale = useCallback(
    (bcp47: string) => {
      setLocaleState(bcp47);
      const code = bcp47.split('-')[0] as Language;
      if (SUPPORTED_LOCALES.some((l) => l.code === code)) setLanguageState(code);
      void persist({ locale: bcp47 });
    },
    [persist],
  );

  const t: TranslateFn = useCallback(
    (key, vars) => {
      const dict = translations[language] ?? translations.en;
      const fallback = translations.en[key] ?? key;
      return interpolate(dict[key] ?? fallback, vars);
    },
    [language],
  );

  const value: LanguageContextType = useMemo(
    () => ({
      language,
      locale,
      dir,
      timezone,
      setLanguage,
      setLocale,
      t,
      formatDate: (v, opts) => formatDate(v, locale, opts, timezone),
      formatDateTime: (v) => formatDateTime(v, locale, timezone),
      formatRelativeTime: (v) => formatRelativeTime(v, locale),
      formatNumber: (v, opts) => formatNumber(v, locale, opts),
      formatCurrency: (v, currency) => formatCurrency(v, locale, currency),
      formatPercent: (v, frac) => formatPercent(v, locale, frac),
      formatList: (items, type) => formatList(items, locale, type),
      plural: (count, forms) => selectPlural(count, locale, forms),
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [language, locale, dir, timezone, setLanguage, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { SUPPORTED_LOCALES } from '../lib/i18n';
export type { Language, Direction } from '../lib/i18n';

```

---

## Context: src/data/pricing.ts

```tsx
export type CommerceModel =
  | 'free'
  | 'self_serve_subscription'
  | 'one_time_addon'
  | 'partner_custom'
  | 'grant_or_free_access';

export interface TermsMicrocopy {
  cancel?: { en: string; es: string };
  refund?: { en: string; es: string };
  data?: { en: string; es: string };
}

export interface PricingPlan {
  id: string;
  name: { en: string; es: string };
  audience: 'individuals' | 'business' | 'legal-aid';
  commerceModel: CommerceModel;
  termsMicrocopy?: TermsMicrocopy;
  monthlyPrice: number | null;
  annualPrice: number | null;
  priceDisplay: { en: string; es: string };
  annualPriceDisplay?: { en: string; es: string };
  priceNote?: { en: string; es: string };
  description: { en: string; es: string };
  features: { en: string[]; es: string[] };
  ctaLabel: { en: string; es: string };
  ctaHref: string;
  recommended?: boolean;
  badge?: { en: string; es: string };
  ethicalNote?: { en: string; es: string };
  isFinalPrice: boolean;
  isFoundingPrice: boolean;
  isAddOn?: boolean;
  isStartingAt?: boolean;
}

export interface PricingAudience {
  id: 'individuals' | 'business' | 'legal-aid';
  label: { en: string; es: string };
  headline: { en: string; es: string };
  subline?: { en: string; es: string };
  plans: PricingPlan[];
}

export const pricingAudiences: PricingAudience[] = [
  {
    id: 'individuals',
    label: { en: 'Individuals', es: 'Personas' },
    headline: { en: 'Legal clarity for you and your family', es: 'Claridad legal para ti y tu familia' },
    plans: [
      {
        id: 'justice_free',
        name: { en: 'Free', es: 'Gratis' },
        audience: 'individuals',
        commerceModel: 'free',
        monthlyPrice: 0,
        annualPrice: 0,
        priceDisplay: { en: '$0', es: '$0' },
        priceNote: { en: 'forever', es: 'siempre' },
        isFinalPrice: true,
        isFoundingPrice: false,
        description: {
          en: 'For basic legal questions and safe next steps.',
          es: 'Para preguntas legales básicas y próximos pasos seguros.',
        },
        features: {
          en: [
            'Ask legal questions in English or Spanish',
            'Get plain-language explanations',
            'Understand common legal documents',
            'Find free or low-cost help',
            'Urgent-help links always free',
            'No credit card required',
          ],
          es: [
            'Haz preguntas legales en inglés o español',
            'Recibe explicaciones en lenguaje simple',
            'Entiende documentos legales comunes',
            'Encuentra ayuda gratuita o de bajo costo',
            'Enlaces de ayuda urgente siempre gratis',
            'Sin tarjeta de crédito',
          ],
        },
        ctaLabel: { en: 'Start free', es: 'Comenzar gratis' },
        ctaHref: '/chat',
        termsMicrocopy: {
          data: { en: 'No credit card required', es: 'Sin tarjeta de crédito' },
        },
      },
      {
        id: 'everyday-plus',
        name: { en: 'Everyday Plus', es: 'Diario Plus' },
        audience: 'individuals',
        commerceModel: 'self_serve_subscription',
        termsMicrocopy: {
          cancel: { en: 'Cancel anytime', es: 'Cancela cuando quieras' },
          refund: { en: '7-day refund guarantee', es: 'Garantía de reembolso de 7 días' },
          data: { en: 'Your data never trains AI', es: 'Tus datos nunca entrenan IA' },
        },

// ... [462 lines omitted for brevity] ...

];

export const comparisonFeatures = [
  { key: 'questions', en: 'Questions per month', es: 'Preguntas por mes' },
  { key: 'documents', en: 'Document analysis', es: 'Análisis de documentos' },
  { key: 'matters', en: 'Saved matters', es: 'Asuntos guardados' },
  { key: 'spanish', en: 'Spanish support', es: 'Soporte en español' },
  { key: 'summaries', en: 'Referral-ready summaries', es: 'Resúmenes para referencia' },
  { key: 'priority', en: 'Priority processing', es: 'Procesamiento prioritario' },
  { key: 'team', en: 'Team access', es: 'Acceso de equipo' },
  { key: 'org', en: 'Organization workflows', es: 'Flujos organizacionales' },
  { key: 'support', en: 'Support level', es: 'Nivel de soporte' },
];

export const comparisonData: Record<string, Record<string, { en: string; es: string }>> = {
  justice_free: {
    questions: { en: '10/month', es: '10/mes' },
    documents: { en: '3/month', es: '3/mes' },
    matters: { en: '1', es: '1' },
    spanish: { en: 'Yes', es: 'Sí' },
    summaries: { en: '--', es: '--' },
    priority: { en: '--', es: '--' },
    team: { en: '--', es: '--' },
    org: { en: '--', es: '--' },
    support: { en: 'Community', es: 'Comunidad' },
  },
  'everyday-plus': {
    questions: { en: '100/month', es: '100/mes' },
    documents: { en: '20/month', es: '20/mes' },
    matters: { en: '10', es: '10' },
    spanish: { en: 'Yes', es: 'Sí' },
    summaries: { en: 'Yes', es: 'Sí' },
    priority: { en: 'Yes', es: 'Sí' },
    team: { en: '--', es: '--' },
    org: { en: '--', es: '--' },
    support: { en: 'Email', es: 'Correo' },
  },
  family: {
    questions: { en: '200/month', es: '200/mes' },
    documents: { en: '40/month', es: '40/mes' },
    matters: { en: '25', es: '25' },
    spanish: { en: 'Yes', es: 'Sí' },
    summaries: { en: 'Yes', es: 'Sí' },
    priority: { en: 'Yes', es: 'Sí' },
    team: { en: 'Household', es: 'Hogar' },
    org: { en: '--', es: '--' },
    support: { en: 'Priority email', es: 'Correo prioritario' },
  },
};

```

---

# SECTION 3: AUDIT INSTRUCTIONS

Use the full prompt in `scripts/gpt-post-merge-audit-prompt.md` alongside this bundle.

Key reminders:
- Audit ONLY Section 1 files
- DO NOT reference the legacy ezlegal.ai production site
- Check for banned content (see prompt for full list)
- Verify bilingual EN/ES parity
- Confirm type safety and proper Language narrowing
- Output one JSON block per audited file
