import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Users, FileText, BarChart3,
  Building2, Globe, CheckCircle, Lock, Scale, Heart
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ScopeNotice } from '../components/shared/AISafetyMicrocopy';
import { trackEvent } from '../services/analytics-service';
import TrustCTABlock from '../components/trust/TrustCTABlock';
import ReferralPacketPreview from '../components/ReferralPacketPreview';
import OrganizationIntakeQueue from '../components/OrganizationIntakeQueue';
import { useLanguage } from '../contexts/LanguageContext';

const CAPABILITIES: Record<'en' | 'es', string[]> = {
  en: [
    'AI-assisted client intake and eligibility screening',
    'Multilingual support (English + Spanish built in)',
    'Case triage, priority routing, and escalation pathways',
    'Document generation from guided templates',
    'Reporting and analytics on intake volume and triage outcomes',
    'Integration-ready architecture (API, embed widgets, white-label)',
  ],
  es: [
    'Admisión de clientes asistida por IA y evaluación de elegibilidad',
    'Soporte multilingüe (inglés + español integrado)',
    'Triaje de casos, enrutamiento prioritario y vías de escalamiento',
    'Generación de documentos a partir de plantillas guiadas',
    'Informes y análisis sobre volumen de admisión y resultados de triaje',
    'Arquitectura lista para integración (API, widgets, marca blanca)',
  ],
};

const USE_CASES: { icon: typeof Heart; title: Record<'en' | 'es', string>; desc: Record<'en' | 'es', string> }[] = [
  {
    icon: Heart,
    title: { en: 'Legal aid organizations', es: 'Organizaciones de ayuda legal' },
    desc: { en: 'Screen more clients, triage faster, and stretch limited attorney hours with AI-assisted intake.', es: 'Evalúe más clientes, triaje más rápido y extienda las horas limitadas de abogados con admisión asistida por IA.' },
  },
  {
    icon: Building2,
    title: { en: 'Law school clinics', es: 'Clínicas de escuelas de derecho' },
    desc: { en: 'Give students guided intake tools and case-matching that surfaces relevant precedent.', es: 'Brinde a los estudiantes herramientas de admisión guiada y coincidencia de casos que muestra precedentes relevantes.' },
  },
  {
    icon: Users,
    title: { en: 'Bar associations', es: 'Colegios de abogados' },
    desc: { en: 'Offer a modern pro bono portal that matches volunteer attorneys to cases by expertise.', es: 'Ofrezca un portal pro bono moderno que conecte abogados voluntarios con casos por especialidad.' },
  },
  {
    icon: Globe,
    title: { en: 'Community organizations', es: 'Organizaciones comunitarias' },
    desc: { en: 'Embed a legal self-help widget on your site to serve clients in their language.', es: 'Integre un widget de autoayuda legal en su sitio para atender clientes en su idioma.' },
  },
  {
    icon: Scale,
    title: { en: 'Court self-help centers', es: 'Centros de autoayuda judicial' },
    desc: { en: 'Reduce counter wait times with guided document preparation and next-step checklists.', es: 'Reduzca tiempos de espera con preparación guiada de documentos y listas de próximos pasos.' },
  },
];

const GOVERNANCE_LINKS: { title: Record<'en' | 'es', string>; to: string; desc: Record<'en' | 'es', string> }[] = [
  { title: { en: 'AI Governance Framework', es: 'Marco de Gobernanza de IA' }, to: '/ai-governance', desc: { en: 'How we build, test, and monitor our AI systems.', es: 'Cómo construimos, probamos y monitoreamos nuestros sistemas de IA.' } },
  { title: { en: 'Bias Monitoring Dashboard', es: 'Panel de Monitoreo de Sesgo' }, to: '/bias-monitoring', desc: { en: 'Live metrics on fairness across demographics.', es: 'Métricas en vivo sobre equidad entre grupos demográficos.' } },
  { title: { en: 'Model Card', es: 'Tarjeta del Modelo' }, to: '/ai-model-card', desc: { en: 'Technical details on model capabilities and limitations.', es: 'Detalles técnicos sobre capacidades y limitaciones del modelo.' } },
  { title: { en: 'Algorithmic Impact Assessment', es: 'Evaluación de Impacto Algorítmico' }, to: '/algorithmic-impact-assessment', desc: { en: 'Risk assessment for our AI applications.', es: 'Evaluación de riesgos para nuestras aplicaciones de IA.' } },
];

export default function ForOrganizations() {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en' as const;
  const en = lang === 'en';

  useEffect(() => {
    trackEvent('page_view', { path: '/for-organizations' });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navigation />

      <main id="main-content">
        {/* Hero */}
        <section className="pt-24 sm:pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
              <Building2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span className="text-sm font-medium text-emerald-800">
                {en ? 'For organizations & partners' : 'Para organizaciones y socios'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              {en
                ? 'AI-assisted intake that multiplies your capacity.'
                : 'Admisión asistida por IA que multiplica su capacidad.'}
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-7 text-slate-600">
              {en
                ? 'Serve more people with the same team. Our platform handles intake, triage, and guided self-help so your attorneys can focus on what matters.'
                : 'Atienda a más personas con el mismo equipo. Nuestra plataforma maneja admisión, triaje y autoayuda guiada para que sus abogados se enfoquen en lo importante.'}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/schedule-demo"
                onClick={() => trackEvent('demo_requested', { source: 'org_hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {en ? 'Schedule organization demo' : 'Programar demo para organizaciones'}
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/partners"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {en ? 'Create partner intake page' : 'Crear página de admisión para socios'}
              </Link>
              <Link
                to="/ai-governance"
                className="inline-flex items-center justify-center gap-2 rounded-full text-sm text-emerald-700 hover:text-emerald-900 font-medium px-4 py-3.5 transition"
              >
                {en ? 'Review AI governance' : 'Revisar gobernanza de IA'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500 max-w-lg mx-auto">
              {en
                ? 'We do not claim to replace lawyers or legal aid staff. Our tools support and augment your team.'
                : 'No pretendemos reemplazar abogados o personal de ayuda legal. Nuestras herramientas apoyan y complementan a su equipo.'}
            </p>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="capabilities-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="capabilities-heading" className="text-2xl font-black text-center mb-8">
              {en ? 'Platform capabilities' : 'Capacidades de la plataforma'}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {CAPABILITIES[lang].map((cap) => (
                <div key={cap} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-sm text-slate-800 leading-relaxed">{cap}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-14" aria-labelledby="use-cases-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="use-cases-heading" className="text-2xl font-black text-center mb-3">
              {en ? 'Built for access-to-justice organizations' : 'Diseñado para organizaciones de acceso a la justicia'}
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              {en
                ? 'Whether you serve hundreds or hundreds of thousands, our platform scales with your mission.'
                : 'Ya sea que atienda cientos o cientos de miles, nuestra plataforma escala con su misión.'}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((uc) => {
                const Icon = uc.icon;
                return (
                  <div key={uc.title[lang]} className="p-5 rounded-xl border border-slate-200 bg-white">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 mb-3">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-bold text-slate-900 mb-1">{uc.title[lang]}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{uc.desc[lang]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Governance */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="governance-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="governance-heading" className="text-2xl font-black text-center mb-3">
              {en ? 'Governance & transparency' : 'Gobernanza y transparencia'}
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
              {en
                ? 'We publish our AI governance documentation so partners can evaluate our approach.'
                : 'Publicamos nuestra documentación de gobernanza de IA para que los socios puedan evaluar nuestro enfoque.'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {GOVERNANCE_LINKS.map((link) => (
                <Link
                  key={link.title[lang]}
                  to={link.to}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition group"
                >
                  <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-0.5 group-hover:text-emerald-800 transition">{link.title[lang]}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{link.desc[lang]}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Key workflow areas */}
        <section className="py-14" aria-labelledby="workflows-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="workflows-heading" className="text-2xl font-black text-center mb-3">
              {en ? 'How organizations use the platform' : 'Cómo las organizaciones usan la plataforma'}
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              {en
                ? 'Triage, intake support, education, referral routing, and document preparation support.'
                : 'Triaje, soporte de admisión, educación, enrutamiento de referidos y soporte de preparación de documentos.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Users, title: en ? 'Client-facing intake support' : 'Soporte de admisión para clientes', desc: en ? 'Guided questionnaires that gather key facts before attorney review.' : 'Cuestionarios guiados que recopilan hechos clave antes de la revisión del abogado.' },
                { icon: Globe, title: en ? 'Spanish-language access' : 'Acceso en español', desc: en ? 'Full bilingual intake and self-help flows for Spanish-speaking clients.' : 'Flujos completos bilingües de admisión y autoayuda para clientes hispanohablantes.' },
                { icon: Scale, title: en ? 'Referral and escalation' : 'Referido y escalamiento', desc: en ? 'Route high-risk cases to attorneys and surface emergency resources.' : 'Enrute casos de alto riesgo a abogados y muestre recursos de emergencia.' },
                { icon: BarChart3, title: en ? 'Admin and audit visibility' : 'Visibilidad administrativa y de auditoría', desc: en ? 'Track intake volume, triage outcomes, and response quality.' : 'Rastree volumen de admisión, resultados de triaje y calidad de respuesta.' },
                { icon: Lock, title: en ? 'Privacy and consent' : 'Privacidad y consentimiento', desc: en ? 'Configurable consent gates and data handling policies.' : 'Puertas de consentimiento configurables y políticas de manejo de datos.' },
                { icon: FileText, title: en ? 'Reporting' : 'Informes', desc: en ? 'Grant reporting templates and demographic analytics.' : 'Plantillas de informes de subvenciones y análisis demográficos.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-5 rounded-xl border border-slate-200 bg-white">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 mb-3">
                      <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                    </span>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Implementation notes */}
        <section className="py-10 bg-amber-50 border-y border-amber-200" aria-labelledby="implementation-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="implementation-heading" className="text-lg font-bold text-amber-900 mb-4 text-center">
              {en ? 'Implementation guidance' : 'Guía de implementación'}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: en ? 'Human review recommended' : 'Revisión humana recomendada', desc: en ? 'AI output should be reviewed by qualified staff before client action.' : 'La salida de IA debe ser revisada por personal calificado antes de la acción del cliente.' },
                { title: en ? 'Use with local eligibility rules' : 'Use con reglas de elegibilidad locales', desc: en ? 'Configure screening criteria for your jurisdiction and funding source.' : 'Configure criterios de evaluación para su jurisdicción y fuente de financiamiento.' },
                { title: en ? 'Configure emergency escalation' : 'Configure escalamiento de emergencia', desc: en ? 'Set up high-risk detection and crisis resource routing for your community.' : 'Configure la detección de alto riesgo y el enrutamiento de recursos de crisis para su comunidad.' },
              ].map((note) => (
                <div key={note.title} className="bg-white rounded-lg border border-amber-200 p-4">
                  <h3 className="text-sm font-bold text-amber-900 mb-1">{note.title}</h3>
                  <p className="text-xs text-amber-800 leading-relaxed">{note.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration ready */}
        <section className="py-14" aria-labelledby="integration-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="integration-heading" className="text-2xl font-black mb-3">
              {en ? 'Integration-ready' : 'Listo para integración'}
            </h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              {en
                ? 'Designed to support future integrations with your existing case management and intake systems. Embed our intake widget, connect via API, or use our white-label solution.'
                : 'Diseñado para soportar integraciones futuras con sus sistemas existentes de gestión de casos y admisión. Integre nuestro widget, conéctese vía API o use nuestra solución de marca blanca.'}
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {[
                { icon: Lock, text: en ? 'Encrypted data at rest and in transit' : 'Datos cifrados en reposo y en tránsito' },
                { icon: BarChart3, text: en ? 'Real-time partner dashboard' : 'Panel de socios en tiempo real' },
                { icon: FileText, text: en ? 'API & embeddable widgets' : 'API y widgets integrables' },
                { icon: Globe, text: en ? 'Multi-language support' : 'Soporte multilingüe' },
              ].map(({ icon: I, text }) => (
                <div key={text} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <I className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
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
            <ScopeNotice className="max-w-xl mx-auto" />
          </div>
        </section>

        {/* Partner workflow features */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="partner-features-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="partner-features-heading" className="text-2xl font-black text-center mb-3">
              {en ? 'What partners can do' : 'Qué pueden hacer los socios'}
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              {en
                ? 'Tools designed for legal-aid teams, pro bono coordinators, and community organizations.'
                : 'Herramientas diseñadas para equipos de ayuda legal, coordinadores pro bono y organizaciones comunitarias.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: en ? 'Consent-based referral routing' : 'Enrutamiento de referidos basado en consentimiento', desc: en ? 'Clients explicitly opt in before any data is shared. Consent is timestamped and revocable.' : 'Los clientes dan consentimiento explícito antes de compartir datos. El consentimiento tiene fecha y es revocable.' },
                { title: en ? 'Staff review workflow' : 'Flujo de revisión de personal', desc: en ? 'Every AI-generated summary is labeled "for staff review" — nothing goes to a client without human approval.' : 'Cada resumen generado por IA está etiquetado "para revisión de personal" — nada llega al cliente sin aprobación humana.' },
                { title: en ? 'Multilingual intake' : 'Admisión multilingüe', desc: en ? 'Full bilingual intake in English and Spanish. Language preference is captured and preserved in referral packets.' : 'Admisión bilingüe completa en inglés y español. La preferencia de idioma se captura y preserva en paquetes de referido.' },
                { title: en ? 'Urgency flags and deadline detection' : 'Banderas de urgencia y detección de plazos', desc: en ? 'Automatic detection of court dates, filing deadlines, and safety concerns with visual priority sorting.' : 'Detección automática de fechas judiciales, plazos de presentación y preocupaciones de seguridad con priorización visual.' },
                { title: en ? 'Audit logs' : 'Registros de auditoría', desc: en ? 'Immutable record of all consent events, referral routing, and status changes for compliance and oversight.' : 'Registro inmutable de todos los eventos de consentimiento, enrutamiento y cambios de estado para cumplimiento y supervisión.' },
                { title: en ? 'Grant reporting (anonymized)' : 'Informes de subvenciones (anonimizados)', desc: en ? 'Aggregate intake volume, triage outcomes, and demographics for funders. Never includes client names, narratives, or contact info.' : 'Volumen agregado de admisión, resultados de triaje y demografía para financiadores. Nunca incluye nombres, narrativas o datos de contacto.' },
              ].map((item) => (
                <div key={item.title} className="p-5 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mock referral card */}
        <section className="py-14" aria-labelledby="sample-referral-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="sample-referral-heading" className="text-2xl font-black text-center mb-3">
              {en ? 'Sample referral summary' : 'Ejemplo de resumen de referido'}
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-md mx-auto">
              {en
                ? 'This is what a triage summary looks like when shared with your team.'
                : 'Así se ve un resumen de triaje cuando se comparte con su equipo.'}
            </p>
            <div className="border-2 border-dashed border-amber-300 rounded-xl p-6 bg-amber-50/30 relative">
              <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                {en ? 'Example only' : 'Solo ejemplo'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-4">
                {en ? 'For staff review' : 'Para revisión de personal'}
              </span>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue category</p>
                  <p className="text-sm text-slate-800">Housing — Eviction notice received</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Urgency</p>
                  <p className="text-sm text-slate-800">High — Court date in 12 days</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jurisdiction</p>
                  <p className="text-sm text-slate-800">Arizona — Maricopa County</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Language</p>
                  <p className="text-sm text-slate-800">Spanish (intake completed in Spanish)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Consent source</p>
                  <p className="text-sm text-slate-800">Explicit opt-in at intake (timestamped)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Generated summary</p>
                  <p className="text-sm text-slate-800">Tenant received 5-day eviction notice. No prior violations. May qualify for emergency rental assistance. Deadline: response due before court date.</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Suggested routing</p>
                  <p className="text-sm text-slate-800">Housing unit — urgent queue</p>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-amber-700 italic">
                {en
                  ? 'This is a fictional example for demonstration purposes. No real client data is shown. Analytics never include client names, narratives, phone, email, or address.'
                  : 'Este es un ejemplo ficticio con fines demostrativos. No se muestran datos reales de clientes. Los análisis nunca incluyen nombres, narrativas, teléfono, correo o dirección.'}
              </p>
            </div>
          </div>
        </section>

        {/* Partner CTAs */}
        <section className="py-10 bg-white border-y border-slate-200" aria-labelledby="partner-ctas-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="partner-ctas-heading" className="text-lg font-bold text-slate-900 mb-4">
              {en ? 'Ready to explore?' : '¿Listo para explorar?'}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/schedule-demo"
                onClick={() => trackEvent('partner_cta_clicked', { cta: 'book_partner_demo' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {en ? 'Book a partner demo' : 'Reservar una demo para socios'}
              </Link>
              <a
                href="#sample-referral-heading"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {en ? 'See sample referral' : 'Ver referido de ejemplo'}
              </a>
              <Link
                to="/enterprise-security"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {en ? 'Download security & AI overview' : 'Descargar resumen de seguridad e IA'}
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {en
                ? 'We do not imply existing partnerships. All integration features require a signed agreement.'
                : 'No implicamos asociaciones existentes. Todas las funciones de integración requieren un acuerdo firmado.'}
            </p>
          </div>
        </section>

        {/* Partner workflow demos */}
        <section className="py-12 bg-slate-50" aria-labelledby="workflow-demos-heading" id="workflow">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="workflow-demos-heading" className="text-xl font-bold text-slate-900 text-center mb-8">
              {en ? 'Partner workflow previews' : 'Vistas previas de flujos de socios'}
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{en ? 'Referral packet format' : 'Formato de paquete de referido'}</h3>
                <ReferralPacketPreview isDemo={true} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{en ? 'Intake queue interface' : 'Interfaz de cola de admisión'}</h3>
                <OrganizationIntakeQueue />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-950 py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              {en ? 'Ready to expand your reach?' : '¿Listo para expandir su alcance?'}
            </h2>
            <p className="text-slate-400 text-sm mb-7">
              {en
                ? 'See how ezLegal.ai can serve your community. No commitment required.'
                : 'Vea cómo ezLegal.ai puede servir a su comunidad. Sin compromiso requerido.'}
            </p>
            <Link
              to="/schedule-demo"
              onClick={() => trackEvent('demo_requested', { source: 'org_bottom' })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 hover:bg-emerald-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {en ? 'Schedule a partner demo' : 'Programar una demo para socios'}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
