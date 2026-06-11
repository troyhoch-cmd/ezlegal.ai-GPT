import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Globe, Building2, Users, Briefcase, FileWarning, Handshake,
  CheckCircle, ArrowRight, Shield, Clock, FileText, AlertTriangle,
  Sparkles, Star, Lock, Scale
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import HighRiskPackGate from '../components/HighRiskPackGate';
import VerifiableTrustStrip from '../components/VerifiableTrustStrip';
import InlineEmailCapture from '../components/InlineEmailCapture';
import AttorneyReferralDisclosure from '../components/AttorneyReferralDisclosure';
import RelatedLinks from '../components/RelatedLinks';

const PACK_COLOR_MAP: Record<string, { iconBg: string; iconText: string }> = {
  amber: { iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
  sky: { iconBg: 'bg-sky-50', iconText: 'text-sky-600' },
  rose: { iconBg: 'bg-rose-50', iconText: 'text-rose-600' },
  emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
  teal: { iconBg: 'bg-teal-50', iconText: 'text-teal-600' },
  gold: { iconBg: 'bg-gold-50', iconText: 'text-gold-600' },
};

const PACKS = [
  {
    id: 'immigration',
    icon: Globe,
    color: 'amber',
    highRisk: true,
    price: 39,
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
      who: 'Inquilinos enfrentando desalojo o disputas de deposito.',
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
    en: {
      name: 'Family Matters Pack',
      desc: 'Divorce, child custody, support calculations, and domestic law guidance.',
      who: 'People navigating divorce, custody disputes, or family court proceedings.',
      includes: ['Self-representation guide', 'Custody and visitation templates', 'Child support calculator worksheet', 'Document preparation checklist', 'Attorney referral matched to your area'],
      sample: 'Includes custody proposal template, support calculation worksheet, and court prep guide.',
    },
    es: {
      name: 'Paquete de Asuntos Familiares',
      desc: 'Divorcio, custodia de hijos, calculos de manutencion y orientacion.',
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
      includes: ['Plantillas de carta de validacion', 'Guia de respuesta a demandas', 'Verificador de prescripcion', 'Guiones de negociacion', 'Referencia a abogado'],
      sample: 'Incluye 3 plantillas de cartas y biblioteca de guiones de negociacion.',
    },
  },
  {
    id: 'negotiation',
    icon: Handshake,
    color: 'gold',
    highRisk: false,
    price: 49,
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
  const [safetyGatePack, setSafetyGatePack] = useState<{ id: string; name: string } | null>(null);
  const lang = language === 'es' ? 'es' : 'en';

  const handlePurchase = (pack: typeof PACKS[0]) => {
    if (pack.highRisk) {
      setSafetyGatePack({ id: pack.id, name: pack[lang].name });
    } else if (user) {
      navigate(`/checkout?plan=${pack.id}`);
    } else {
      navigate(`/signup?plan=${pack.id}`);
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
                ? 'Each Issue Pack gives you a complete action plan built from structured templates, with document checklists, deadline trackers, and a matched attorney referral for your specific legal situation.'
                : 'Cada Paquete te da un plan de accion completo basado en plantillas estructuradas, con listas de verificacion, rastreadores de fechas y referencia a abogado.'
              }
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-navy-200">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-400" /> {language === 'en' ? '30-day access' : '30 dias de acceso'}</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-teal-400" /> {language === 'en' ? 'State-specific' : 'Especifico por estado'}</div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-teal-400" /> {language === 'en' ? 'Secure checkout' : 'Pago seguro'}</div>
            </div>
          </div>
        </section>

        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="px-4 py-3 bg-navy-50 border border-navy-200 rounded-xl text-sm text-navy-600">
              {language === 'en'
                ? 'ezLegal.ai provides legal information, not legal advice. Issue Packs contain structured templates and general guidance. They do not create an attorney-client relationship.'
                : 'ezLegal.ai proporciona informacion legal, no asesoramiento legal. Los Paquetes contienen plantillas estructuradas y orientacion general. No crean una relacion abogado-cliente.'}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {PACKS.map((pack) => {
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
                            pack.id === 'negotiation' ? 'bg-gold-400' : (PACK_COLOR_MAP[pack.color]?.iconBg || 'bg-navy-50')
                          }`}>
                            <PackIcon className={`w-7 h-7 ${pack.id === 'negotiation' ? 'text-navy-900' : (PACK_COLOR_MAP[pack.color]?.iconText || 'text-navy-600')}`} />
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
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span className="text-xs text-amber-700 font-medium">
                            {language === 'en' ? 'High-stakes situation - includes safety screening before purchase' : 'Situacion de alto riesgo - incluye evaluacion de seguridad'}
                          </span>
                        </div>
                      )}

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
                        {language === 'en' ? `Get ${pack[lang].name}` : `Obtener ${pack[lang].name}`}
                        <ArrowRight className="w-4 h-4" />
                      </button>
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
                  {language === 'en' ? 'What "Structured Templates" Means' : 'Que Significa "Plantillas Estructuradas"'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Template documents and checklists are designed for common legal workflows',
                    'Templates are general-purpose, not customized legal advice for your specific case',
                    'Content is periodically reviewed for accuracy and completeness',
                    'This does not create an attorney-client relationship',
                  ] : [
                    'Las plantillas estan disenadas para flujos legales comunes',
                    'Las plantillas son de proposito general, no asesoria legal personalizada',
                    'El contenido se revisa periodicamente para precision y completitud',
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
                : 'Comienza con una pregunta gratis. Nuestra IA te ayudara a entender tu situacion.'
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

      {safetyGatePack && (
        <HighRiskPackGate
          packId={safetyGatePack.id}
          packName={safetyGatePack.name}
          onConfirm={() => {
            const packId = safetyGatePack.id;
            setSafetyGatePack(null);
            if (user) navigate(`/checkout?plan=${packId}`);
            else navigate(`/signup?plan=${packId}`);
          }}
          onClose={() => setSafetyGatePack(null)}
        />
      )}

      <RelatedLinks fromPath="/issue-packs" />

      <Footer />
    </div>
  );
}
