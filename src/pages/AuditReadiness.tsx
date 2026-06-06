import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Shield, Eye, Globe, Scale, CheckCircle, Clock, AlertTriangle, FileText, Zap, Lock, Database } from 'lucide-react';
import { platformMetrics } from '../data/platformMetrics';

interface AuditCard {
  id: string;
  title: string;
  titleEs: string;
  claim: string;
  claimEs: string;
  evidenceLink: string;
  evidenceLinkLabel: string;
  owner: string;
  lastVerified: string;
  status: 'verified' | 'needs-evidence' | 'in-progress';
  icon: React.ElementType;
}

const auditCards: AuditCard[] = [
  {
    id: 'accessibility',
    title: 'Accessibility (WCAG 2.2 AA)',
    titleEs: 'Accesibilidad (WCAG 2.2 AA)',
    claim: `Skip links, focus management, ARIA labels, keyboard navigation, reduced motion, reading preferences toolbar. Target: ${platformMetrics.accessibility.targetLevel}.`,
    claimEs: `Skip links, gestión de foco, etiquetas ARIA, navegación por teclado, movimiento reducido, barra de preferencias de lectura. Objetivo: ${platformMetrics.accessibility.targetLevel}.`,
    evidenceLink: '/accessibility-statement',
    evidenceLinkLabel: 'Accessibility Statement',
    owner: 'Engineering',
    lastVerified: platformMetrics.accessibility.lastVerified,
    status: 'verified',
    icon: Eye,
  },
  {
    id: 'pwa-performance',
    title: 'PWA & Performance',
    titleEs: 'PWA y Rendimiento',
    claim: `Service worker with offline fallback, manifest, install prompt, lazy-loaded ${platformMetrics.routes.total}+ routes, cache-first static assets.`,
    claimEs: `Service worker con respaldo offline, manifest, prompt de instalación, ${platformMetrics.routes.total}+ rutas con carga diferida, cache-first para assets estáticos.`,
    evidenceLink: '/trust-center',
    evidenceLinkLabel: 'Trust Center',
    owner: 'Engineering',
    lastVerified: platformMetrics.pwa.lastVerified,
    status: 'in-progress',
    icon: Zap,
  },
  {
    id: 'ai-governance',
    title: 'AI Governance & Transparency',
    titleEs: 'Gobernanza y Transparencia de IA',
    claim: `Model Card v${platformMetrics.governance.modelCard.version}, Bias Monitoring v${platformMetrics.governance.biasMonitoring.version}, Impact Assessment v${platformMetrics.governance.impactAssessment.version}, Data Provenance v${platformMetrics.governance.dataProvenance.version}. ISO/IEC 42001 + NIST AI RMF + EU AI Act aligned.`,
    claimEs: `Tarjeta de Modelo v${platformMetrics.governance.modelCard.version}, Monitoreo de Sesgo v${platformMetrics.governance.biasMonitoring.version}, Evaluación de Impacto v${platformMetrics.governance.impactAssessment.version}, Procedencia de Datos v${platformMetrics.governance.dataProvenance.version}. Alineado con ISO/IEC 42001 + NIST AI RMF + EU AI Act.`,
    evidenceLink: '/ai-governance',
    evidenceLinkLabel: 'AI Governance Hub',
    owner: 'AI Ethics Board',
    lastVerified: platformMetrics.governance.modelCard.lastUpdated,
    status: 'verified',
    icon: Database,
  },
  {
    id: 'upl-safety',
    title: 'UPL (Unauthorized Practice of Law) Avoidance',
    titleEs: 'Prevención de Ejercicio Ilegal de la Abogacía (UPL)',
    claim: 'Scope boundary disclaimers on every AI response, no attorney-client relationship language, jurisdiction gating, human escalation, claims scanning in CI.',
    claimEs: 'Avisos de límite de alcance en cada respuesta de IA, sin lenguaje de relación abogado-cliente, verificación de jurisdicción, escalamiento humano, escaneo de reclamos en CI.',
    evidenceLink: '/scope-disclaimers',
    evidenceLinkLabel: 'Scope Disclaimers',
    owner: 'Legal Compliance',
    lastVerified: '2026-06-01',
    status: 'verified',
    icon: Scale,
  },
  {
    id: 'a2j',
    title: 'Access-to-Justice (A2J) Compliance',
    titleEs: 'Cumplimiento de Acceso a la Justicia (A2J)',
    claim: 'Mandatory A2J screening before individual checkout, free tier with full information quality, pro bono intake, legal aid routing to LSC-funded organizations.',
    claimEs: 'Evaluación A2J obligatoria antes del pago individual, nivel gratuito con calidad completa de información, admisión pro bono, enrutamiento a organizaciones financiadas por LSC.',
    evidenceLink: '/pricing',
    evidenceLinkLabel: 'Pricing (A2J Tiers)',
    owner: 'Product + Legal',
    lastVerified: '2026-06-01',
    status: 'verified',
    icon: Shield,
  },
  {
    id: 'spanish-parity',
    title: 'Bilingual Parity (EN/ES)',
    titleEs: 'Paridad Bilingüe (EN/ES)',
    claim: `${platformMetrics.languages.translationKeys}+ translation keys, dedicated /espanol landing, language toggle, bilingual pricing, forms, disclaimers, and safety notices.`,
    claimEs: `${platformMetrics.languages.translationKeys}+ claves de traducción, landing dedicada /espanol, alternador de idioma, precios bilingües, formularios, avisos y notificaciones de seguridad.`,
    evidenceLink: '/espanol',
    evidenceLinkLabel: 'Spanish Landing',
    owner: 'Localization',
    lastVerified: '2026-06-06',
    status: 'verified',
    icon: Globe,
  },
  {
    id: 'security',
    title: 'Security Infrastructure',
    titleEs: 'Infraestructura de Seguridad',
    claim: `RLS on all tables, CSP headers, Zod validation, secrets scan in CI, ${platformMetrics.security.securityHardeningPhases} security hardening phases completed.`,
    claimEs: `RLS en todas las tablas, encabezados CSP, validación Zod, escaneo de secretos en CI, ${platformMetrics.security.securityHardeningPhases} fases de hardening de seguridad completadas.`,
    evidenceLink: '/trust-center',
    evidenceLinkLabel: 'Trust Center',
    owner: 'Security',
    lastVerified: platformMetrics.security.lastVerified,
    status: 'verified',
    icon: Lock,
  },
];

function StatusIndicator({ status }: { status: AuditCard['status'] }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-teal-50 text-teal-700 rounded-full border border-teal-200">
        <CheckCircle className="w-3 h-3" /> Verified
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full border border-amber-200">
        <Clock className="w-3 h-3" /> In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-full border border-red-200">
      <AlertTriangle className="w-3 h-3" /> Needs Evidence
    </span>
  );
}

export default function AuditReadiness() {
  const { language } = useLanguage();
  const es = language === 'es';

  const verifiedCount = auditCards.filter((c) => c.status === 'verified').length;
  const totalCount = auditCards.length;

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-24 pb-16 bg-white min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-10">
            <div className="flex items-center gap-2 text-sm text-navy-500 mb-4">
              <Link to="/trust-center" className="hover:text-teal-600 transition-colors">
                {es ? 'Centro de Confianza' : 'Trust Center'}
              </Link>
              <span>/</span>
              <span className="text-navy-700 font-medium">
                {es ? 'Preparación para Auditoría' : 'Audit Readiness'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              {es ? 'Preparación para Auditoría' : 'Audit Readiness'}
            </h1>
            <p className="text-lg text-navy-600 max-w-3xl">
              {es
                ? 'Estado de verificación de todas las afirmaciones de calidad de la plataforma. Cada tarjeta vincula a evidencia verificable.'
                : 'Verification status of all platform quality claims. Each card links to verifiable evidence.'}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-semibold text-teal-800">
                  {verifiedCount}/{totalCount} {es ? 'verificados' : 'verified'}
                </span>
              </div>
              <span className="text-sm text-navy-500">
                {es ? 'Última revisión: 6 de junio de 2026' : 'Last reviewed: June 6, 2026'}
              </span>
            </div>
          </header>

          <div className="grid gap-6 sm:grid-cols-2">
            {auditCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.id}
                  className="border border-navy-200 rounded-xl p-5 hover:border-teal-300 transition-colors focus-within:ring-2 focus-within:ring-teal-500"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <h2 className="text-sm font-bold text-navy-900">
                        {es ? card.titleEs : card.title}
                      </h2>
                    </div>
                    <StatusIndicator status={card.status} />
                  </div>
                  <p className="text-sm text-navy-600 mb-4 leading-relaxed">
                    {es ? card.claimEs : card.claim}
                  </p>
                  <div className="flex items-center justify-between text-xs text-navy-500">
                    <Link
                      to={card.evidenceLink}
                      className="text-teal-600 font-medium hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      {card.evidenceLinkLabel}
                    </Link>
                    <span>{es ? 'Responsable' : 'Owner'}: {card.owner}</span>
                  </div>
                  <div className="mt-2 text-xs text-navy-400">
                    {es ? 'Verificado' : 'Verified'}: {card.lastVerified}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-10 bg-navy-50 border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-2">
              {es ? 'Nota sobre esta página' : 'About this page'}
            </h2>
            <p className="text-sm text-navy-600">
              {es
                ? 'Esta página existe para hacer verificables las afirmaciones de calidad de nuestra plataforma. No constituye asesoría legal. ezLegal.ai proporciona información legal, no asesoría legal.'
                : 'This page exists to make our platform quality claims verifiable. It does not constitute legal advice. ezLegal.ai provides legal information, not legal advice.'}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
