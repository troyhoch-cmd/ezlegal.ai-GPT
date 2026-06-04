import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, Building2, Users, Briefcase, FileWarning, Handshake, CheckCircle, ArrowRight, Shield, Clock, FileText, AlertTriangle, Lock, Eye, RefreshCw, Phone, Ligature as FileSignature, UserCog, Landmark, BookOpen, BarChart3, Mail, Scale } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import HighRiskPackGate from '../components/HighRiskPackGate';
import VerifiableTrustStrip from '../components/VerifiableTrustStrip';
import InlineEmailCapture from '../components/InlineEmailCapture';
import AttorneyReferralDisclosure from '../components/AttorneyReferralDisclosure';
import RelatedLinks from '../components/RelatedLinks';
import IssuePackPreviewModal from '../components/IssuePackPreviewModal';
import IssuePackDeadlineScreening from '../components/IssuePackDeadlineScreening';
import { trackEvent } from '../services/analytics-service';

type Audience = 'individuals' | 'business' | 'legal_aid';

const ATTORNEY_REVIEW_PACKS = ['smb_employee', 'smb_contract', 'smb_vendor'];

interface PackDef {
  id: string;
  icon: typeof Globe;
  color: string;
  highRisk: boolean;
  price: number;
  audience: Audience[];
  en: { name: string; desc: string; who: string; includes: string[]; sample: string };
  es: { name: string; desc: string; who: string; includes: string[]; sample: string };
}

const PACKS: PackDef[] = [
  {
    id: 'immigration',
    icon: Globe,
    color: 'amber',
    highRisk: true,
    price: 39,
    audience: ['individuals'],
    en: {
      name: 'Immigration Help Pack',
      desc: 'Deportation defense, visa issues, status questions, and ICE encounter rights.',
      who: 'People facing immigration questions, visa renewals, or deportation concerns.',
      includes: ['Step-by-step action plan for your issue type', 'Know Your Rights document (ICE encounters)', 'Emergency contact templates', 'Deadline checklist', 'Attorney referral matched to your area'],
      sample: 'Includes a 5-page action plan with state-specific contacts, fillable ICE encounter card, and 30-day access to updates.',
    },
    es: {
      name: 'Paquete de Inmigracion',
      desc: 'Defensa contra deportacion, problemas de visa, preguntas de estatus y derechos ante ICE.',
      who: 'Personas enfrentando preguntas de inmigracion o preocupaciones de deportacion.',
      includes: ['Plan de accion paso a paso', 'Documento de Conoce Tus Derechos (ICE)', 'Plantillas de contactos de emergencia', 'Lista de fechas limite', 'Referencia a abogado'],
      sample: 'Incluye un plan de accion de 5 paginas con contactos estatales.',
    },
  },
  {
    id: 'housing',
    icon: Building2,
    color: 'sky',
    highRisk: true,
    price: 29,
    audience: ['individuals'],
    en: {
      name: 'Housing & Eviction Pack',
      desc: 'Eviction defense, tenant rights, security deposits, and landlord disputes.',
      who: 'Tenants facing eviction, deposit disputes, or unsafe housing conditions.',
      includes: ['Eviction response template', 'Tenant rights guide for your state', 'Court calendar and preparation checklist', 'Evidence collection checklist', 'Attorney referral matched to your area'],
      sample: 'Includes a fillable eviction response, state-specific tenant rights summary, and 30-day deadline tracker.',
    },
    es: {
      name: 'Paquete de Vivienda y Desalojo',
      desc: 'Defensa contra desalojo, derechos de inquilino y depositos de seguridad.',
      who: 'Inquilinos enfrentando desalojo o disputas de depósito.',
      includes: ['Plantilla de respuesta a desalojo', 'Guia de derechos del inquilino', 'Calendario del tribunal', 'Lista de evidencia', 'Referencia a abogado'],
      sample: 'Incluye respuesta de desalojo rellenable y resumen de derechos.',
    },
  },
  {
    id: 'family',
    icon: Users,
    color: 'rose',
    highRisk: true,
    price: 39,
    audience: ['individuals'],
    en: {
      name: 'Family Matters Pack',
      desc: 'Divorce, child custody, support calculations, and domestic law guidance.',
      who: 'People navigating divorce, custody disputes, or family court proceedings.',
      includes: ['Self-representation guide', 'Custody and visitation templates', 'Child support calculator worksheet', 'Document preparation checklist', 'Attorney referral matched to your area'],
      sample: 'Includes custody proposal template, support calculation worksheet, and court prep guide.',
    },
    es: {
      name: 'Paquete de Asuntos Familiares',
      desc: 'Divorcio, custodia de hijos, calculos de manutencion y orientación.',
      who: 'Personas navegando divorcio o disputas de custodia.',
      includes: ['Guia de autorepresentacion', 'Plantillas de custodia', 'Hoja de calculo de manutencion', 'Lista de documentos', 'Referencia a abogado'],
      sample: 'Incluye plantilla de propuesta de custodia y guia de preparacion.',
    },
  },
  {
    id: 'employment',
    icon: Briefcase,
    color: 'emerald',
    highRisk: false,
    price: 29,
    audience: ['individuals'],
    en: {
      name: 'Employment & Wages Pack',
      desc: 'Wage claims, wrongful termination, workplace discrimination, and labor rights.',
      who: 'Workers dealing with unpaid wages, termination, or workplace issues.',
      includes: ['Wage claim filing guide', 'Demand letter templates', 'Evidence documentation guide', 'Filing deadline tracker', 'Attorney referral matched to your area'],
      sample: 'Includes fillable demand letter, wage calculation worksheet, and agency contact list.',
    },
    es: {
      name: 'Paquete de Empleo y Salarios',
      desc: 'Reclamos salariales, despido injustificado y derechos laborales.',
      who: 'Trabajadores con salarios impagos o problemas laborales.',
      includes: ['Guia de reclamo salarial', 'Plantillas de carta de demanda', 'Guia de documentacion', 'Rastreador de fechas', 'Referencia a abogado'],
      sample: 'Incluye carta de demanda rellenable y hoja de calculo salarial.',
    },
  },
  {
    id: 'debt',
    icon: FileWarning,
    color: 'teal',
    highRisk: false,
    price: 29,
    audience: ['individuals'],
    en: {
      name: 'Debt Defense Pack',
      desc: 'Debt validation, collection harassment, lawsuit response, and statute of limitations.',
      who: 'People being contacted by collectors or facing debt-related lawsuits.',
      includes: ['Debt validation letter templates', 'Lawsuit response guide', 'Statute of limitations checker', 'Negotiation scripts', 'Attorney referral matched to your area'],
      sample: 'Includes 3 letter templates, negotiation script library, and statute tracker.',
    },
    es: {
      name: 'Paquete de Defensa de Deudas',
      desc: 'Validacion de deudas, acoso de cobradores y respuesta a demandas.',
      who: 'Personas contactadas por cobradores o enfrentando demandas.',
      includes: ['Plantillas de carta de validacion', 'Guia de respuesta a demandas', 'Verificador de prescripción', 'Guiones de negociacion', 'Referencia a abogado'],
      sample: 'Incluye 3 plantillas de cartas y biblioteca de guiones de negociacion.',
    },
  },
  {
    id: 'smb_contract',
    icon: FileSignature,
    color: 'teal',
    highRisk: false,
    price: 249,
    audience: ['business'],
    en: {
      name: 'Contract Review Pack',
      desc: 'Plain-language contract review with risk flags and suggested redlines for small businesses.',
      who: 'SMB owners reviewing vendor, client, or partnership agreements before signing.',
      includes: ['Clause-by-clause risk breakdown', 'Suggested redlines in Word format', 'Plain-language summary memo', 'Negotiation leverage points', 'Attorney referral if escalation needed'],
      sample: 'Includes annotated contract with risk flags, redline suggestions, and 2-page summary memo.',
    },
    es: {
      name: 'Paquete de Revision de Contratos',
      desc: 'Revision de contratos en lenguaje claro con banderas de riesgo y sugerencias de cambios.',
      who: 'Dueños de pequenas empresas revisando acuerdos antes de firmar.',
      includes: ['Desglose de riesgo por clausula', 'Sugerencias de cambios en Word', 'Memo de resumen', 'Puntos de negociacion', 'Referencia a abogado si escala'],
      sample: 'Incluye contrato anotado con banderas de riesgo y memo de resumen.',
    },
  },
  {
    id: 'smb_employee',
    icon: UserCog,
    color: 'sky',
    highRisk: false,
    price: 199,
    audience: ['business'],
    en: {
      name: 'Employee Issue Pack',
      desc: 'Documentation, warning letters, and termination guidance that keeps you compliant.',
      who: 'SMB owners and managers handling performance issues, warnings, or terminations.',
      includes: ['Performance documentation templates', 'Progressive discipline letter library', 'Termination checklist by state', 'Separation agreement template', 'Attorney referral for wrongful-termination risk'],
      sample: 'Includes 4 warning-letter templates, termination checklist, and separation agreement.',
    },
    es: {
      name: 'Paquete de Problemas con Empleados',
      desc: 'Documentacion, cartas de advertencia y guia de terminacion que mantiene cumplimiento.',
      who: 'Dueños y gerentes manejando problemas de desempeno o terminaciones.',
      includes: ['Plantillas de documentacion', 'Biblioteca de cartas disciplinarias', 'Lista de terminacion por estado', 'Plantilla de acuerdo de separacion', 'Referencia a abogado'],
      sample: 'Incluye 4 plantillas de cartas y lista de terminacion.',
    },
  },
  {
    id: 'smb_vendor',
    icon: FileWarning,
    color: 'amber',
    highRisk: false,
    price: 149,
    audience: ['business'],
    en: {
      name: 'Vendor Dispute Pack',
      desc: 'Recover money and resolve vendor or client disputes without jumping to court.',
      who: 'SMBs dealing with unpaid invoices, non-delivery, or breach-of-contract claims.',
      includes: ['Demand letter template library', 'Small claims filing guide by state', 'Settlement negotiation scripts', 'Evidence and documentation checklist', 'Attorney referral for claims over $10k'],
      sample: 'Includes demand letter, small claims guide, and 3 negotiation scripts.',
    },
    es: {
      name: 'Paquete de Disputas con Proveedores',
      desc: 'Recupera dinero y resuelve disputas con proveedores o clientes sin ir a corte.',
      who: 'Empresas con facturas impagas o incumplimientos de contrato.',
      includes: ['Biblioteca de cartas de demanda', 'Guia de reclamos menores', 'Guiones de negociacion', 'Lista de evidencia', 'Referencia a abogado'],
      sample: 'Incluye carta de demanda y guiones de negociacion.',
    },
  },
  {
    id: 'negotiation',
    icon: Handshake,
    color: 'gold',
    highRisk: false,
    price: 49,
    audience: ['individuals', 'business'],
    en: {
      name: 'Negotiation Strategy Planner',
      desc: 'Your complete, exportable strategy document. Explore free tools at /negotiate first, then purchase your personalized PDF pack.',
      who: 'Anyone negotiating a settlement, debt resolution, lease terms, or business dispute.',
      includes: ['Tailored opening statement scripts', 'Settlement range calculator', 'Counter-offer strategies', 'Red flag detection for bad deals', 'Downloadable PDF strategy document'],
      sample: 'Includes personalized strategy document with 3 negotiation scenarios and risk assessment.',
    },
    es: {
      name: 'Planificador de Estrategia de Negociacion',
      desc: 'Estrategias de negociacion generadas por IA para acuerdos y disputas.',
      who: 'Cualquiera negociando un acuerdo, resolucion de deuda o disputa.',
      includes: ['Guiones de declaracion inicial', 'Calculadora de rango de acuerdo', 'Estrategias de contraoferta', 'Deteccion de banderas rojas', 'Documento PDF descargable'],
      sample: 'Incluye documento de estrategia personalizado con 3 escenarios.',
    },
  },
];

export default function IssuePacks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightTopic = searchParams.get('topic');
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeAudience, setActiveAudience] = useState<Audience>('individuals');
  const [previewPack, setPreviewPack] = useState<PackDef | null>(null);
  const [screeningPack, setScreeningPack] = useState<PackDef | null>(null);
  const [safetyGatePack, setSafetyGatePack] = useState<{ id: string; name: string } | null>(null);
  const [lsoForm, setLsoForm] = useState({ org: '', name: '', email: '', orgType: 'legal_aid', seats: '', notes: '' });
  const [lsoSubmitted, setLsoSubmitted] = useState(false);
  const [lsoSubmitting, setLsoSubmitting] = useState(false);
  const lang = language === 'en' ? 'en' : 'es';

  const hasUrgentSession = (() => {
    try {
      const draft = sessionStorage.getItem('ez_triage_draft');
      if (!draft) return false;
      const parsed = JSON.parse(draft);
      return ['critical', 'detention', 'eviction-lockout', 'custody-emergency'].includes(parsed?.urgency);
    } catch { return false; }
  })();

  const visiblePacks = activeAudience === 'legal_aid'
    ? PACKS.filter((p) => p.audience.includes('individuals'))
    : PACKS.filter((p) => p.audience.includes(activeAudience));

  const proceedToCheckout = (packId: string) => {
    if (user) navigate(`/checkout?plan=${packId}`);
    else navigate(`/signup?plan=${packId}`);
  };

  const handlePurchase = (pack: PackDef) => {
    if (pack.audience.includes('business')) {
      trackEvent('smb_pricing_clicked', { pack_id: pack.id, price: pack.price });
    }
    if (pack.highRisk) {
      setScreeningPack(pack);
    } else {
      proceedToCheckout(pack.id);
    }
  };

  const submitLsoInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLsoSubmitting(true);
    try {
      await supabase.from('lso_pricing_inquiries').insert({
        organization_name: lsoForm.org,
        contact_name: lsoForm.name,
        contact_email: lsoForm.email,
        org_type: lsoForm.orgType,
        seats_estimated: lsoForm.seats ? parseInt(lsoForm.seats, 10) : null,
        languages: ['en', 'es'],
        notes: lsoForm.notes,
      });
      setLsoSubmitted(true);
    } catch {
      setLsoSubmitted(true);
    } finally {
      setLsoSubmitting(false);
    }
  };

  const logScreeningOutcome = async (packId: string, outcome: 'proceeded' | 'declined') => {
    try {
      await supabase.from('issue_pack_safety_screenings').insert({
        user_id: user?.id ?? null,
        pack_id: packId,
        language,
        acknowledged: outcome === 'proceeded',
        outcome,
      });
    } catch {
      // non-blocking audit
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <VerifiableTrustStrip className="mt-[73px]" />

      <main id="main-content" className="pt-4">
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gold-400/20 text-gold-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <FileText className="w-4 h-4" />
              {language === 'en' ? 'ISSUE PACKS' : 'PAQUETES DE TEMAS'}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {language === 'en' ? 'Your Action Plan, Ready to Go' : 'Tu Plan de Accion, Listo para Usar'}
            </h1>
            <p className="text-xl text-navy-100 max-w-3xl mx-auto mb-8">
              {language === 'en'
                ? 'Each Issue Pack gives you a complete action plan built from attorney-reviewed templates, with document checklists, deadline trackers, and a matched attorney referral for your specific legal situation.'
                : 'Cada Paquete te da un plan de accion completo basado en plantillas revisadas por abogados, con listas de verificacion, rastreadores de fechas y referencia a abogado.'
              }
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-navy-200">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-400" /> {language === 'en' ? '30-day access' : '30 dias de acceso'}</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-teal-400" /> {language === 'en' ? 'State-specific' : 'Especifico por estado'}</div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-teal-400" /> {language === 'en' ? 'Secure checkout' : 'Pago seguro'}</div>
            </div>
          </div>
        </section>

        <section className="pt-10 pb-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <h2 className="text-base font-bold text-red-900 mb-1">
                    {language === 'en' ? 'In an emergency? Do not buy a pack first.' : 'En una emergencia? No compres un paquete primero.'}
                  </h2>
                  <p className="text-sm text-red-800 mb-3">
                    {language === 'en'
                      ? 'If you are currently detained, facing a hearing in the next 48 hours, locked out of your home, or in danger, get free urgent help before purchasing anything.'
                      : 'Si estas detenido, tienes audiencia en 48 horas, estas fuera de tu casa o en peligro, obten ayuda gratis y urgente antes de comprar.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/emergency-resources"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg"
                    >
                      <Phone className="w-4 h-4" />
                      {language === 'en' ? 'Emergency resources' : 'Recursos de emergencia'}
                    </Link>
                    <Link
                      to="/ask"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 text-sm font-semibold rounded-lg"
                    >
                      {language === 'en' ? 'Ask a free question first' : 'Hacer una pregunta gratis primero'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-navy-50 border border-navy-200 rounded-2xl" role="tablist" aria-label={language === 'en' ? 'Audience' : 'Audiencia'}>
              {([
                { id: 'individuals' as Audience, en: 'For Individuals & Families', es: 'Individuos y Familias', icon: Users },
                { id: 'business' as Audience, en: 'For Small Business', es: 'Pequenas Empresas', icon: Briefcase },
                { id: 'legal_aid' as Audience, en: 'For Legal Aid & Nonprofits', es: 'Ayuda Legal y ONG', icon: Landmark },
              ]).map((tab) => {
                const Icon = tab.icon;
                const active = activeAudience === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveAudience(tab.id)}
                    className={`flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active ? 'bg-white text-navy-900 shadow-sm border border-navy-200' : 'text-navy-600 hover:text-navy-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {language === 'en' ? tab.en : tab.es}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {activeAudience === 'legal_aid' && (
          <section className="py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-gold-400/20 rounded-xl flex items-center justify-center">
                    <Landmark className="w-6 h-6 text-gold-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {language === 'en' ? 'Legal Services Organization Plans' : 'Planes para Organizaciones de Servicios Legales'}
                    </h2>
                    <p className="text-sm text-navy-200">
                      {language === 'en' ? 'Volume access, caseworker dashboards, and shared intake for LSOs and nonprofits.' : 'Acceso por volumen, paneles de caseworkers y admision compartida.'}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-6 mb-8">
                  {([
                    { tier: 'Starter', seats: '1-5', price: 199, en: 'Single-office legal aid clinic', es: 'Clinica de ayuda legal de una oficina' },
                    { tier: 'Community', seats: '6-25', price: 499, en: 'County-wide nonprofit with caseworkers', es: 'Sin fines de lucro con caseworkers' },
                    { tier: 'Statewide', seats: '25+', price: 1499, en: 'Statewide LSO with multi-office access', es: 'LSO estatal con multi-oficina' },
                  ]).map((t) => (
                    <div key={t.tier} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="text-xs uppercase tracking-wide text-gold-300 font-bold mb-1">{t.tier}</div>
                      <div className="text-3xl font-bold font-serif mb-1">${t.price}<span className="text-sm font-normal text-navy-300">/mo</span></div>
                      <div className="text-xs text-navy-300 mb-3">{t.seats} {language === 'en' ? 'caseworker seats' : 'asientos'}</div>
                      <p className="text-sm text-navy-100">{language === 'en' ? t.en : t.es}</p>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-8 text-sm">
                  {([
                    { icon: BarChart3, en: 'Caseworker dashboard with client pipeline', es: 'Panel de caseworker con pipeline de clientes' },
                    { icon: Users, en: 'Shared intake forms with team access controls', es: 'Formularios de admision con controles de equipo' },
                    { icon: BookOpen, en: 'Grant reporting and aggregated impact metrics', es: 'Reportes de subvencion y metricas de impacto' },
                    { icon: Shield, en: 'SOC 2 + HIPAA-ready data handling', es: 'Manejo de datos SOC 2 y HIPAA-ready' },
                  ]).map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <Icon className="w-4 h-4 text-gold-300 flex-shrink-0 mt-0.5" />
                        <span className="text-navy-100">{language === 'en' ? f.en : f.es}</span>
                      </div>
                    );
                  })}
                </div>

                {!lsoSubmitted ? (
                  <form onSubmit={submitLsoInquiry} className="bg-white rounded-2xl p-5 sm:p-6 text-navy-900">
                    <h3 className="font-bold mb-1">{language === 'en' ? 'Get a custom quote' : 'Obten una cotizacion personalizada'}</h3>
                    <p className="text-xs text-navy-500 mb-4">{language === 'en' ? 'We respond within 2 business days with pricing and a pilot plan.' : 'Respondemos en 2 dias habiles.'}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input required placeholder={language === 'en' ? 'Organization name' : 'Nombre de la organizacion'} value={lsoForm.org} onChange={(e) => setLsoForm({ ...lsoForm, org: e.target.value })} className="px-3 py-2 border border-navy-200 rounded-lg text-sm" />
                      <input required placeholder={language === 'en' ? 'Your name' : 'Tu nombre'} value={lsoForm.name} onChange={(e) => setLsoForm({ ...lsoForm, name: e.target.value })} className="px-3 py-2 border border-navy-200 rounded-lg text-sm" />
                      <input required type="email" placeholder={language === 'en' ? 'Work email' : 'Correo de trabajo'} value={lsoForm.email} onChange={(e) => setLsoForm({ ...lsoForm, email: e.target.value })} className="px-3 py-2 border border-navy-200 rounded-lg text-sm" />
                      <input type="number" min="1" placeholder={language === 'en' ? 'Caseworker seats' : 'Asientos'} value={lsoForm.seats} onChange={(e) => setLsoForm({ ...lsoForm, seats: e.target.value })} className="px-3 py-2 border border-navy-200 rounded-lg text-sm" />
                      <select value={lsoForm.orgType} onChange={(e) => setLsoForm({ ...lsoForm, orgType: e.target.value })} className="px-3 py-2 border border-navy-200 rounded-lg text-sm sm:col-span-2">
                        <option value="legal_aid">{language === 'en' ? 'Legal aid organization' : 'Organizacion de ayuda legal'}</option>
                        <option value="nonprofit">{language === 'en' ? 'Nonprofit / community org' : 'Sin fines de lucro'}</option>
                        <option value="law_school">{language === 'en' ? 'Law school clinic' : 'Clinica de escuela de derecho'}</option>
                        <option value="court">{language === 'en' ? 'Court self-help center' : 'Centro de autoayuda de corte'}</option>
                      </select>
                      <textarea placeholder={language === 'en' ? 'Which practice areas? Anything else we should know?' : 'Que areas? Algo mas?'} value={lsoForm.notes} onChange={(e) => setLsoForm({ ...lsoForm, notes: e.target.value })} rows={3} className="px-3 py-2 border border-navy-200 rounded-lg text-sm sm:col-span-2" />
                    </div>
                    <button type="submit" disabled={lsoSubmitting} className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-navy-300 text-white rounded-xl font-bold text-sm">
                      <Mail className="w-4 h-4" />
                      {lsoSubmitting ? (language === 'en' ? 'Sending...' : 'Enviando...') : (language === 'en' ? 'Request LSO quote' : 'Solicitar cotizacion')}
                    </button>
                  </form>
                ) : (
                  <div className="bg-white rounded-2xl p-6 text-navy-900 text-center">
                    <CheckCircle className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                    <h3 className="font-bold mb-1">{language === 'en' ? 'Inquiry received' : 'Consulta recibida'}</h3>
                    <p className="text-sm text-navy-600">{language === 'en' ? 'We will reach out within 2 business days with pricing and next steps.' : 'Te contactaremos en 2 dias habiles.'}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeAudience === 'individuals' && hasUrgentSession && (
              <div className="mb-8 max-w-3xl mx-auto rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-bold text-amber-900 mb-1">
                      {language === 'en' ? 'Your situation may need urgent free help first' : 'Tu situacion puede necesitar ayuda gratuita urgente primero'}
                    </h2>
                    <p className="text-sm text-amber-800 mb-3">
                      {language === 'en'
                        ? 'Based on your earlier answers, you may qualify for free emergency resources. We recommend exploring those before purchasing.'
                        : 'Según tus respuestas anteriores, podrías calificar para recursos de emergencia gratuitos. Recomendamos explorarlos antes de comprar.'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/emergency-resources"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg"
                      >
                        <Phone className="w-4 h-4" />
                        {language === 'en' ? 'Free emergency resources' : 'Recursos de emergencia gratuitos'}
                      </Link>
                      <Link
                        to="/pro-bono"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 text-sm font-semibold rounded-lg"
                      >
                        {language === 'en' ? 'Free legal aid' : 'Ayuda legal gratuita'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeAudience === 'legal_aid' && (
              <div className="text-center mb-8">
                <p className="text-sm text-navy-500">
                  {language === 'en'
                    ? 'Your caseworkers can also use any individual pack on behalf of clients. Volume licensing is included in the plans above.'
                    : 'Tus caseworkers tambien pueden usar cualquier paquete individual para clientes.'}
                </p>
              </div>
            )}
            <div className="grid lg:grid-cols-2 gap-8">
              {visiblePacks.map((pack) => {
                const isHighlighted = highlightTopic === pack.id;
                const PackIcon = pack.icon;
                return (
                  <div
                    key={pack.id}
                    className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl ${
                      isHighlighted ? 'border-teal-400 shadow-lg ring-2 ring-teal-200' : 'border-navy-200'
                    } ${pack.id === 'negotiation' ? 'lg:col-span-2 max-w-2xl mx-auto w-full' : ''}`}
                  >
                    <div className={`p-6 sm:p-8 bg-gradient-to-br ${
                      pack.id === 'negotiation' ? 'from-navy-900 to-navy-800' : 'from-white to-navy-50'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            pack.id === 'negotiation' ? 'bg-gold-400' : `bg-${pack.color}-50`
                          }`}>
                            <PackIcon className={`w-7 h-7 ${pack.id === 'negotiation' ? 'text-navy-900' : `text-${pack.color}-600`}`} />
                          </div>
                          <div>
                            <h3 className={`text-xl font-bold ${pack.id === 'negotiation' ? 'text-white' : 'text-navy-900'}`}>
                              {pack[lang].name}
                            </h3>
                            <p className={`text-sm ${pack.id === 'negotiation' ? 'text-navy-200' : 'text-navy-500'}`}>
                              {pack[lang].desc}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className={`text-3xl font-bold font-serif ${pack.id === 'negotiation' ? 'text-gold-400' : 'text-navy-900'}`}>
                            ${pack.price}
                          </div>
                          <div className={`text-xs ${pack.id === 'negotiation' ? 'text-navy-300' : 'text-navy-400'}`}>
                            {language === 'en' ? 'one-time' : 'unico pago'}
                          </div>
                        </div>
                      </div>

                      {pack.highRisk && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span className="text-xs text-amber-700 font-medium">
                            {language === 'en' ? 'High-stakes situation - includes safety screening before purchase' : 'Situación de alto riesgo - incluye evaluacion de seguridad'}
                          </span>
                        </div>
                      )}

                      {ATTORNEY_REVIEW_PACKS.includes(pack.id) && (
                        <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 mb-3">
                          <Scale className="w-4 h-4 text-sky-600 flex-shrink-0" />
                          <span className="text-xs text-sky-700 font-medium">
                            {language === 'en' ? 'Attorney review recommended for complex matters' : 'Revision de abogado recomendada para asuntos complejos'}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${pack.id === 'negotiation' ? 'bg-white/10 text-navy-100' : 'bg-teal-50 text-teal-700 border border-teal-100'}`}>
                          <Globe className="w-3 h-3" />
                          {language === 'en' ? 'English + Español' : 'Ingles + Español'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${pack.id === 'negotiation' ? 'bg-white/10 text-navy-100' : 'bg-navy-50 text-navy-600 border border-navy-100'}`}>
                          <RefreshCw className="w-3 h-3" />
                          {language === 'en' ? '7-day refund if unused' : 'Reembolso 7 dias si no se usa'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewPack(pack)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium transition-colors ${pack.id === 'negotiation' ? 'bg-white/10 text-navy-100 hover:bg-white/20' : 'bg-navy-50 text-navy-600 border border-navy-100 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700'}`}
                        >
                          <Eye className="w-3 h-3" />
                          {language === 'en' ? 'Preview before pay' : 'Vista previa antes de pagar'}
                        </button>
                      </div>

                      <div className={`rounded-xl p-4 mb-4 ${pack.id === 'negotiation' ? 'bg-white/10' : 'bg-navy-50'}`}>
                        <h4 className={`text-xs font-bold uppercase tracking-wide mb-1 ${pack.id === 'negotiation' ? 'text-gold-300' : 'text-navy-500'}`}>
                          {language === 'en' ? 'WHO IS THIS FOR' : 'PARA QUIEN ES'}
                        </h4>
                        <p className={`text-sm ${pack.id === 'negotiation' ? 'text-navy-100' : 'text-navy-600'}`}>
                          {pack[lang].who}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className={`text-xs font-bold uppercase tracking-wide mb-3 ${pack.id === 'negotiation' ? 'text-gold-300' : 'text-navy-500'}`}>
                          {language === 'en' ? 'WHAT YOU GET' : 'QUE INCLUYE'}
                        </h4>
                        <ul className="space-y-2">
                          {pack[lang].includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${pack.id === 'negotiation' ? 'text-gold-400' : 'text-teal-600'}`} />
                              <span className={`text-sm ${pack.id === 'negotiation' ? 'text-navy-100' : 'text-navy-700'}`}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`rounded-lg p-3 mb-6 ${pack.id === 'negotiation' ? 'bg-white/5 border border-white/10' : 'bg-teal-50 border border-teal-100'}`}>
                        <p className={`text-xs ${pack.id === 'negotiation' ? 'text-navy-200' : 'text-teal-700'}`}>
                          <span className="font-semibold">{language === 'en' ? 'Sample output:' : 'Ejemplo:'}</span> {pack[lang].sample}
                        </p>
                      </div>

                      <button
                        onClick={() => handlePurchase(pack)}
                        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                          pack.id === 'negotiation'
                            ? 'bg-gold-400 hover:bg-gold-300 text-navy-900 shadow-lg hover:shadow-xl'
                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {pack.highRisk ? (
                          <>
                            <Shield className="w-4 h-4" />
                            {language === 'en' ? 'Start safety check' : 'Iniciar revision de seguridad'}
                          </>
                        ) : (
                          <>
                            {language === 'en' ? `Get ${pack[lang].name}` : `Obtener ${pack[lang].name}`}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <p className={`text-[11px] mt-2 text-center ${pack.id === 'negotiation' ? 'text-navy-300' : 'text-navy-400'}`}>
                        {language === 'en'
                          ? 'Legal information, not legal advice. Purchase does not create an attorney-client relationship.'
                          : 'Informacion legal, no asesoria legal. La compra no crea una relacion abogado-cliente.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50 border-t border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-navy-900 mb-3">
                {language === 'en' ? 'Free vs. Issue Packs' : 'Gratis vs. Paquetes de Temas'}
              </h2>
              <p className="text-navy-500">{language === 'en' ? 'Understand the difference' : 'Entiende la diferencia'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-navy-200 overflow-hidden">
              <div className="grid grid-cols-3">
                <div className="p-4 bg-navy-50 border-b border-r border-navy-200 font-bold text-navy-700 text-sm">{language === 'en' ? 'Feature' : 'Caracteristica'}</div>
                <div className="p-4 bg-navy-50 border-b border-r border-navy-200 text-center font-bold text-navy-700 text-sm">{language === 'en' ? 'Free Q&A' : 'Preguntas Gratis'}</div>
                <div className="p-4 bg-teal-50 border-b border-navy-200 text-center font-bold text-teal-700 text-sm">{language === 'en' ? 'Issue Pack' : 'Paquete'}</div>
              </div>
              {[
                { feature: language === 'en' ? 'AI legal answers' : 'Respuestas legales IA', free: true, pack: true },
                { feature: language === 'en' ? 'Unlimited follow-ups' : 'Seguimientos ilimitados', free: true, pack: true },
                { feature: language === 'en' ? 'Action plan document' : 'Documento de plan de accion', free: false, pack: true },
                { feature: language === 'en' ? 'Fillable templates' : 'Plantillas rellenables', free: false, pack: true },
                { feature: language === 'en' ? 'Deadline tracker' : 'Rastreador de fechas', free: false, pack: true },
                { feature: language === 'en' ? 'Attorney referral' : 'Referencia a abogado', free: false, pack: true },
                { feature: language === 'en' ? '30-day updates' : 'Actualizaciones por 30 dias', free: false, pack: true },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3">
                  <div className="p-3 border-b border-r border-navy-100 text-sm text-navy-700">{row.feature}</div>
                  <div className="p-3 border-b border-r border-navy-100 text-center">
                    {row.free ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <span className="text-navy-300">--</span>}
                  </div>
                  <div className="p-3 border-b border-navy-100 text-center bg-teal-50/50">
                    <CheckCircle className="w-5 h-5 text-teal-600 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-white border-t border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'What "Attorney-Reviewed Templates" Means' : 'Que Significa "Plantillas Revisadas por Abogados"'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Template documents and checklists are reviewed by licensed attorneys for legal accuracy',
                    'Templates are general-purpose, not customized legal advice for your specific case',
                    'Review is at the template level, not per-user or per-purchase',
                    'This does not create an attorney-client relationship',
                  ] : [
                    'Las plantillas son revisadas por abogados licenciados para precision legal',
                    'Las plantillas son de proposito general, no asesoria legal personalizada',
                    'La revision es a nivel de plantilla, no por usuario o por compra',
                    'Esto no crea una relacion abogado-cliente',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'What You\'ll Receive' : 'Lo Que Recibiras'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'PDF action plan with step-by-step instructions',
                    'Fillable document templates (Word/PDF format)',
                    'Interactive deadline checklist with key dates',
                    'Matched attorney referral in your area',
                    '30-day access to updates and revisions',
                  ] : [
                    'Plan de accion PDF con instrucciones paso a paso',
                    'Plantillas de documentos rellenables (Word/PDF)',
                    'Lista interactiva de fechas limite',
                    'Referencia a abogado en tu area',
                    '30 dias de acceso a actualizaciones',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-navy-50 border border-navy-200 rounded-lg p-3">
                  <p className="text-xs text-navy-500">
                    <span className="font-semibold">{language === 'en' ? 'After purchase:' : 'Despues de la compra:'}</span>{' '}
                    {language === 'en'
                      ? 'Instant access via your dashboard. Download or print at any time. Full refund available within 7 days if unused.'
                      : 'Acceso instantaneo en tu panel. Descarga o imprime en cualquier momento. Reembolso completo en 7 dias si no se usa.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <AttorneyReferralDisclosure variant="expandable" />
            </div>
            <div className="mt-8 max-w-md mx-auto">
              <InlineEmailCapture
                source="issue_packs_preview"
                context="issue_packs"
                label={{
                  en: 'Email me a sample action plan',
                  es: 'Enviar un plan de accion de muestra',
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">{language === 'en' ? 'Not Sure Which Pack You Need?' : 'No Sabes Cual Paquete Necesitas?'}</h2>
            <p className="text-navy-100 mb-8 text-lg">
              {language === 'en'
                ? 'Start with a free question. Our AI will help you understand your situation and recommend the right pack if one applies.'
                : 'Comienza con una pregunta gratis. Nuestra IA te ayudara a entender tu situación.'
              }
            </p>
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              {language === 'en' ? 'Ask My Question Free' : 'Hacer Mi Pregunta Gratis'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {screeningPack && (
        <IssuePackDeadlineScreening
          packId={screeningPack.id}
          packName={screeningPack[lang].name}
          onClose={() => {
            logScreeningOutcome(screeningPack.id, 'declined');
            setScreeningPack(null);
          }}
          onProceed={() => {
            const packId = screeningPack.id;
            logScreeningOutcome(packId, 'proceeded');
            setScreeningPack(null);
            proceedToCheckout(packId);
          }}
        />
      )}

      {previewPack && (
        <IssuePackPreviewModal
          packId={previewPack.id}
          packName={previewPack[lang].name}
          onClose={() => setPreviewPack(null)}
          onPurchase={() => {
            const pack = previewPack;
            setPreviewPack(null);
            handlePurchase(pack);
          }}
        />
      )}

      {safetyGatePack && (
        <HighRiskPackGate
          packId={safetyGatePack.id}
          packName={safetyGatePack.name}
          language={language}
          onContinue={() => {
            const packId = safetyGatePack.id;
            logScreeningOutcome(packId, 'proceeded');
            setSafetyGatePack(null);
            proceedToCheckout(packId);
          }}
          onClose={() => {
            logScreeningOutcome(safetyGatePack.id, 'declined');
            setSafetyGatePack(null);
          }}
        />
      )}

      <RelatedLinks fromPath="/issue-packs" />

      <Footer />
    </div>
  );
}
