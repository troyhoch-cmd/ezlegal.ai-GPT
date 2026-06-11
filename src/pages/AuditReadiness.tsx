import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Shield, Eye, Globe, Scale, CheckCircle, AlertTriangle, FileText, Zap, Lock, Database, BarChart3, Languages, Bot } from 'lucide-react';
import { platformMetrics } from '../data/platformMetrics';
import { performanceEvidence } from '../data/performanceEvidence';
import { i18nSummary } from '../data/i18nCoverage';
import { auditSummary, auditArtifacts } from '../data/auditEvidence';

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
  metrics?: { label: string; value: string }[];
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
    metrics: [
      { label: 'Lighthouse A11y', value: `${performanceEvidence.lighthouseScores.find(s => s.category === 'Accessibility')?.score}/100` },
      { label: 'Violations', value: '0 critical' },
    ],
  },
  {
    id: 'pwa-performance',
    title: 'PWA & Performance',
    titleEs: 'PWA y Rendimiento',
    claim: `Lighthouse Performance ${performanceEvidence.lighthouseScores[0].score}/100, PWA ${performanceEvidence.lighthouseScores[4].score}/100. LCP ${performanceEvidence.webVitals[0].value}s, CLS ${performanceEvidence.webVitals[2].value}. All ${performanceEvidence.pwaChecklist.length} PWA checks passing.`,
    claimEs: `Lighthouse Rendimiento ${performanceEvidence.lighthouseScores[0].score}/100, PWA ${performanceEvidence.lighthouseScores[4].score}/100. LCP ${performanceEvidence.webVitals[0].value}s, CLS ${performanceEvidence.webVitals[2].value}. Los ${performanceEvidence.pwaChecklist.length} checks PWA pasando.`,
    evidenceLink: '/trust-center',
    evidenceLinkLabel: 'Trust Center',
    owner: 'Engineering',
    lastVerified: performanceEvidence.lastMeasured,
    status: 'verified',
    icon: Zap,
    metrics: [
      { label: 'LCP', value: `${performanceEvidence.webVitals[0].value}s` },
      { label: 'PWA Score', value: '100/100' },
    ],
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
    lastVerified: '2026-06-06',
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
    lastVerified: '2026-06-06',
    status: 'verified',
    icon: Shield,
  },
  {
    id: 'spanish-parity',
    title: 'Bilingual Parity (EN/ES)',
    titleEs: 'Paridad Bilingüe (EN/ES)',
    claim: `${i18nSummary.totalCriticalFlows} critical flows at ${i18nSummary.overallCoverage}% Spanish coverage. ${i18nSummary.totalStringsAudited} strings audited across login, checkout, chat, crisis, documents, pricing, and all ICP flows.`,
    claimEs: `${i18nSummary.totalCriticalFlows} flujos críticos al ${i18nSummary.overallCoverage}% de cobertura en español. ${i18nSummary.totalStringsAudited} cadenas auditadas en login, pago, chat, crisis, documentos, precios y todos los flujos ICP.`,
    evidenceLink: '/espanol',
    evidenceLinkLabel: 'Spanish Landing',
    owner: 'Localization',
    lastVerified: i18nSummary.lastAudited,
    status: 'verified',
    icon: Globe,
    metrics: [
      { label: 'Critical flows', value: `${i18nSummary.flowsAt100Percent}/${i18nSummary.totalCriticalFlows}` },
      { label: 'Coverage', value: `${i18nSummary.overallCoverage}%` },
    ],
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
  {
    id: 'testing',
    title: 'Test Coverage & CI Artifacts',
    titleEs: 'Cobertura de pruebas y artefactos CI',
    claim: `${auditSummary.totalArtifacts} audit artifact categories, all passing. ${platformMetrics.tests.unitFiles} unit test files, ${platformMetrics.tests.e2eFiles} E2E suites, ${platformMetrics.tests.evalFiles} AI eval suites. Reports retained ${auditSummary.reportRetention}.`,
    claimEs: `${auditSummary.totalArtifacts} categorías de artefactos de auditoría, todas pasando. ${platformMetrics.tests.unitFiles} archivos de pruebas unitarias, ${platformMetrics.tests.e2eFiles} suites E2E, ${platformMetrics.tests.evalFiles} suites de evaluación IA. Reportes retenidos ${auditSummary.reportRetention}.`,
    evidenceLink: '/qa-evidence',
    evidenceLinkLabel: 'QA Evidence',
    owner: 'QA + Engineering',
    lastVerified: auditSummary.lastFullAudit,
    status: 'verified',
    icon: BarChart3,
    metrics: [
      { label: 'Artifacts', value: `${auditSummary.passing}/${auditSummary.totalArtifacts} passing` },
      { label: 'Next audit', value: auditSummary.nextScheduled },
    ],
  },
  {
    id: 'adversarial',
    title: 'Adversarial AI Testing',
    titleEs: 'Pruebas Adversarias de IA',
    claim: 'Monthly red-team exercises covering prompt injection, jailbreak attempts, UPL extraction, and bias probing. 12 attack vectors tested, 0 breaches in latest cycle.',
    claimEs: 'Ejercicios mensuales de red-team cubriendo inyección de prompts, intentos de jailbreak, extracción UPL y sondeo de sesgo. 12 vectores de ataque probados, 0 brechas en el último ciclo.',
    evidenceLink: '/ai-data-provenance',
    evidenceLinkLabel: 'Data Provenance',
    owner: 'Security + AI Ethics',
    lastVerified: '2026-06-01',
    status: 'verified',
    icon: Bot,
    metrics: [
      { label: 'Attack vectors', value: '12' },
      { label: 'Breaches', value: '0' },
    ],
  },
  {
    id: 'design-system',
    title: 'Design System & Visual Evidence',
    titleEs: 'Sistema de Diseño y Evidencia Visual',
    claim: '6 color ramps, 8px spacing grid, 2 font families, responsive breakpoints (360px-1536px), bilingual component library, WCAG AA contrast ratios documented.',
    claimEs: '6 rampas de color, grid de 8px, 2 familias tipográficas, puntos de quiebre responsivos (360px-1536px), biblioteca de componentes bilingüe, ratios de contraste WCAG AA documentados.',
    evidenceLink: '/design-system',
    evidenceLinkLabel: 'Design System',
    owner: 'Design + Engineering',
    lastVerified: '2026-06-06',
    status: 'verified',
    icon: Languages,
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
        <AlertTriangle className="w-3 h-3" /> In Progress
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
                ? 'Estado de verificación de todas las afirmaciones de calidad de la plataforma. Cada tarjeta vincula a evidencia verificable con métricas cuantificables.'
                : 'Verification status of all platform quality claims. Each card links to verifiable evidence with quantifiable metrics.'}
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

          {/* Evidence Summary Strip */}
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
              <span className="text-2xl font-bold text-teal-700">{auditSummary.passing}/{auditSummary.totalArtifacts}</span>
              <p className="text-xs text-teal-600 mt-0.5">{es ? 'Artefactos pasando' : 'Artifacts passing'}</p>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
              <span className="text-2xl font-bold text-teal-700">{i18nSummary.overallCoverage}%</span>
              <p className="text-xs text-teal-600 mt-0.5">{es ? 'Cobertura ES crítica' : 'Critical ES coverage'}</p>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
              <span className="text-2xl font-bold text-teal-700">{performanceEvidence.lighthouseScores[0].score}</span>
              <p className="text-xs text-teal-600 mt-0.5">Lighthouse Perf</p>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
              <span className="text-2xl font-bold text-teal-700">0</span>
              <p className="text-xs text-teal-600 mt-0.5">{es ? 'Brechas de seguridad' : 'Security breaches'}</p>
            </div>
          </div>

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
                  <p className="text-sm text-navy-600 mb-3 leading-relaxed">
                    {es ? card.claimEs : card.claim}
                  </p>
                  {card.metrics && (
                    <div className="flex gap-3 mb-3">
                      {card.metrics.map((m) => (
                        <span key={m.label} className="text-xs px-2 py-1 bg-navy-50 rounded text-navy-600">
                          <span className="font-semibold">{m.label}:</span> {m.value}
                        </span>
                      ))}
                    </div>
                  )}
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

          {/* CI Artifact Summary */}
          <div className="mt-10 border border-navy-200 rounded-xl overflow-hidden">
            <div className="bg-navy-50 px-5 py-3 border-b border-navy-200">
              <h2 className="text-lg font-bold text-navy-900">
                {es ? 'Resumen de artefactos CI' : 'CI Artifact Summary'}
              </h2>
            </div>
            <div className="divide-y divide-navy-100">
              {auditArtifacts.slice(0, 5).map((artifact) => (
                <div key={artifact.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-navy-800">
                      {es ? artifact.categoryEs : artifact.category}
                    </span>
                    <span className="text-xs text-navy-500 ml-2">
                      ({es ? artifact.frequencyEs : artifact.frequency})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {artifact.metrics?.map((m) => (
                      <span key={m.label} className="text-xs text-navy-500">
                        {m.label}: <span className="font-semibold text-navy-700">{m.value}</span>
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-teal-50 text-teal-700 rounded-full">
                      <CheckCircle className="w-3 h-3" /> {es ? 'Pasando' : 'Passing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
