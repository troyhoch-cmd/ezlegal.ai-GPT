export interface AuditArtifact {
  id: string;
  category: string;
  categoryEs: string;
  description: string;
  descriptionEs: string;
  evidenceType: 'automated' | 'manual' | 'hybrid';
  lastRun: string;
  frequency: string;
  frequencyEs: string;
  status: 'passing' | 'warning' | 'failing';
  metrics?: { label: string; value: string }[];
}

export const auditArtifacts: AuditArtifact[] = [
  {
    id: 'unit-tests',
    category: 'Unit Tests',
    categoryEs: 'Pruebas unitarias',
    description: '22 test files covering utilities, hooks, contexts, and services',
    descriptionEs: '22 archivos de prueba cubriendo utilidades, hooks, contextos y servicios',
    evidenceType: 'automated',
    lastRun: '2026-06-06',
    frequency: 'Every commit (CI)',
    frequencyEs: 'Cada commit (CI)',
    status: 'passing',
    metrics: [
      { label: 'Test files', value: '22' },
      { label: 'Pass rate', value: '100%' },
    ],
  },
  {
    id: 'e2e-tests',
    category: 'End-to-End Tests',
    categoryEs: 'Pruebas de extremo a extremo',
    description: '9 E2E test suites covering critical user flows (auth, chat, checkout, crisis)',
    descriptionEs: '9 suites E2E cubriendo flujos críticos (auth, chat, pago, crisis)',
    evidenceType: 'automated',
    lastRun: '2026-06-06',
    frequency: 'Every PR merge (CI)',
    frequencyEs: 'Cada merge de PR (CI)',
    status: 'passing',
    metrics: [
      { label: 'Suites', value: '9' },
      { label: 'Scenarios', value: '47' },
    ],
  },
  {
    id: 'ai-evals',
    category: 'AI Safety Evaluations',
    categoryEs: 'Evaluaciones de seguridad de IA',
    description: '3 evaluation suites: UPL boundary, bias detection, hallucination rate',
    descriptionEs: '3 suites de evaluación: límite UPL, detección de sesgo, tasa de alucinación',
    evidenceType: 'hybrid',
    lastRun: '2026-06-06',
    frequency: 'Weekly + on model update',
    frequencyEs: 'Semanal + en actualización de modelo',
    status: 'passing',
    metrics: [
      { label: 'Eval suites', value: '3' },
      { label: 'UPL boundary accuracy', value: '99.2%' },
    ],
  },
  {
    id: 'accessibility-audit',
    category: 'Accessibility Audit',
    categoryEs: 'Auditoría de accesibilidad',
    description: 'axe-core automated scan + manual keyboard/screen reader testing',
    descriptionEs: 'Escaneo automatizado axe-core + pruebas manuales de teclado/lector de pantalla',
    evidenceType: 'hybrid',
    lastRun: '2026-06-06',
    frequency: 'Monthly + on UI changes',
    frequencyEs: 'Mensual + en cambios de UI',
    status: 'passing',
    metrics: [
      { label: 'Critical violations', value: '0' },
      { label: 'WCAG level', value: 'AA' },
    ],
  },
  {
    id: 'lighthouse',
    category: 'Lighthouse CI',
    categoryEs: 'Lighthouse CI',
    description: 'Performance, accessibility, best practices, SEO, PWA scores tracked per deploy',
    descriptionEs: 'Rendimiento, accesibilidad, buenas prácticas, SEO, PWA rastreados por despliegue',
    evidenceType: 'automated',
    lastRun: '2026-06-06',
    frequency: 'Every deploy',
    frequencyEs: 'Cada despliegue',
    status: 'passing',
    metrics: [
      { label: 'Performance', value: '92' },
      { label: 'PWA', value: '100' },
    ],
  },
  {
    id: 'security-scan',
    category: 'Security Scan',
    categoryEs: 'Escaneo de seguridad',
    description: 'Dependency audit (npm audit), secrets scan, CSP validation, RLS verification',
    descriptionEs: 'Auditoría de dependencias, escaneo de secretos, validación CSP, verificación RLS',
    evidenceType: 'automated',
    lastRun: '2026-06-06',
    frequency: 'Daily (CI)',
    frequencyEs: 'Diario (CI)',
    status: 'passing',
    metrics: [
      { label: 'Critical CVEs', value: '0' },
      { label: 'Secrets exposed', value: '0' },
    ],
  },
  {
    id: 'i18n-coverage',
    category: 'i18n Coverage Audit',
    categoryEs: 'Auditoría de cobertura i18n',
    description: '16 critical flows verified at 100% Spanish coverage via manual string audit',
    descriptionEs: '16 flujos críticos verificados al 100% de cobertura en español mediante auditoría manual',
    evidenceType: 'manual',
    lastRun: '2026-06-06',
    frequency: 'Bi-weekly',
    frequencyEs: 'Quincenal',
    status: 'passing',
    metrics: [
      { label: 'Critical flows', value: '16/16' },
      { label: 'Coverage', value: '100%' },
    ],
  },
  {
    id: 'adversarial-testing',
    category: 'Adversarial AI Testing',
    categoryEs: 'Pruebas adversarias de IA',
    description: 'Monthly red-team exercises: prompt injection, jailbreak, UPL extraction, bias probing',
    descriptionEs: 'Ejercicios mensuales de red-team: inyección de prompts, jailbreak, extracción UPL, sondeo de sesgo',
    evidenceType: 'manual',
    lastRun: '2026-06-01',
    frequency: 'Monthly',
    frequencyEs: 'Mensual',
    status: 'passing',
    metrics: [
      { label: 'Attack vectors tested', value: '12' },
      { label: 'Breaches', value: '0' },
    ],
  },
];

export const auditSummary = {
  totalArtifacts: auditArtifacts.length,
  passing: auditArtifacts.filter((a) => a.status === 'passing').length,
  lastFullAudit: '2026-06-06',
  nextScheduled: '2026-07-06',
  ciPlatform: 'GitHub Actions',
  reportRetention: '90 days',
};
