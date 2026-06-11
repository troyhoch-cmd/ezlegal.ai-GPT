import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Database, Shield, FileText, Globe, AlertTriangle, Clock, CheckCircle, HelpCircle, RefreshCw, Lock, Eye } from 'lucide-react';

interface ProvenanceEntry {
  category: string;
  categoryEs: string;
  items: {
    label: string;
    labelEs: string;
    value: string;
    valueEs: string;
    status: 'verified' | 'pending' | 'not-applicable';
  }[];
}

const provenanceData: ProvenanceEntry[] = [
  {
    category: 'Model Providers',
    categoryEs: 'Proveedores de Modelos',
    items: [
      { label: 'Primary LLM', labelEs: 'LLM Principal', value: 'OpenAI GPT-4o (via API)', valueEs: 'OpenAI GPT-4o (vía API)', status: 'verified' },
      { label: 'Fallback Model', labelEs: 'Modelo Secundario', value: 'OpenAI GPT-4o-mini for free tier', valueEs: 'OpenAI GPT-4o-mini para nivel gratuito', status: 'verified' },
      { label: 'Embedding Model', labelEs: 'Modelo de Embeddings', value: 'OpenAI text-embedding-3-small', valueEs: 'OpenAI text-embedding-3-small', status: 'verified' },
      { label: 'No Custom Training', labelEs: 'Sin Entrenamiento Personalizado', value: 'We do not fine-tune or train models on user data', valueEs: 'No ajustamos ni entrenamos modelos con datos de usuarios', status: 'verified' },
    ],
  },
  {
    category: 'Legal Information Sources',
    categoryEs: 'Fuentes de Información Legal',
    items: [
      { label: 'State Statutes', labelEs: 'Estatutos Estatales', value: 'Official state legislature websites (AZ, CA, TX, FL, NY)', valueEs: 'Sitios oficiales de legislaturas estatales (AZ, CA, TX, FL, NY)', status: 'verified' },
      { label: 'Federal Law', labelEs: 'Ley Federal', value: 'U.S. Code via congress.gov', valueEs: 'Código de EE.UU. vía congress.gov', status: 'verified' },
      { label: 'Court Rules', labelEs: 'Reglas de Corte', value: 'State court administrative offices', valueEs: 'Oficinas administrativas de cortes estatales', status: 'verified' },
      { label: 'Legal Aid Resources', labelEs: 'Recursos de Ayuda Legal', value: 'LSC-funded organization directories', valueEs: 'Directorios de organizaciones financiadas por LSC', status: 'verified' },
      { label: 'Update Frequency', labelEs: 'Frecuencia de Actualización', value: 'Weekly scraping with change detection', valueEs: 'Rastreo semanal con detección de cambios', status: 'verified' },
    ],
  },
  {
    category: 'Dataset Licensing',
    categoryEs: 'Licencias de Datos',
    items: [
      { label: 'Public Domain Sources', labelEs: 'Fuentes de Dominio Público', value: 'All statutory and court rule data is public domain (17 USC 105)', valueEs: 'Todos los datos estatutarios y reglas de corte son de dominio público (17 USC 105)', status: 'verified' },
      { label: 'No Copyrighted Content', labelEs: 'Sin Contenido con Copyright', value: 'No proprietary legal databases (Westlaw, LexisNexis) used', valueEs: 'No se usan bases de datos legales propietarias (Westlaw, LexisNexis)', status: 'verified' },
      { label: 'Attorney Content', labelEs: 'Contenido de Abogados', value: 'Volunteer attorney-reviewed FAQ content under CC-BY-4.0', valueEs: 'Contenido FAQ revisado por abogados voluntarios bajo CC-BY-4.0', status: 'verified' },
      { label: 'Third-Party Datasets', labelEs: 'Conjuntos de Datos de Terceros', value: 'None. All retrieval data sourced from official government sites', valueEs: 'Ninguno. Todos los datos de recuperación provienen de sitios gubernamentales oficiales', status: 'verified' },
    ],
  },
  {
    category: 'PII Handling & Retention',
    categoryEs: 'Manejo de PII y Retención',
    items: [
      { label: 'User Conversations', labelEs: 'Conversaciones de Usuarios', value: 'Encrypted at rest (AES-256). Retained for user access. Deletable on request.', valueEs: 'Encriptadas en reposo (AES-256). Retenidas para acceso del usuario. Eliminables a solicitud.', status: 'verified' },
      { label: 'Training Exclusion', labelEs: 'Exclusión de Entrenamiento', value: 'User data is NEVER used to train or fine-tune any AI model', valueEs: 'Los datos de usuarios NUNCA se usan para entrenar o ajustar ningún modelo de IA', status: 'verified' },
      { label: 'API Data Handling', labelEs: 'Manejo de Datos API', value: 'OpenAI API with zero-retention data policy (no training on inputs)', valueEs: 'API de OpenAI con política de cero retención de datos (sin entrenamiento en entradas)', status: 'verified' },
      { label: 'Anonymized Analytics', labelEs: 'Analíticas Anonimizadas', value: 'Aggregate usage metrics only. No PII in analytics pipeline.', valueEs: 'Solo métricas de uso agregadas. Sin PII en el pipeline de analíticas.', status: 'verified' },
      { label: 'Data Deletion', labelEs: 'Eliminación de Datos', value: 'Users can export or delete all data via /profile settings', valueEs: 'Los usuarios pueden exportar o eliminar todos sus datos vía configuración de /profile', status: 'verified' },
    ],
  },
  {
    category: 'Excluded Source Categories',
    categoryEs: 'Categorías de Fuentes Excluidas',
    items: [
      { label: 'Social Media', labelEs: 'Redes Sociales', value: 'No Reddit, Twitter/X, forum, or social media legal advice scraped', valueEs: 'No se rastrean consejos legales de Reddit, Twitter/X, foros ni redes sociales', status: 'verified' },
      { label: 'User-Generated Content', labelEs: 'Contenido Generado por Usuarios', value: 'No Avvo, Quora, or crowdsourced legal answers used', valueEs: 'No se usa Avvo, Quora ni respuestas legales de origen colectivo', status: 'verified' },
      { label: 'Outdated Sources', labelEs: 'Fuentes Desactualizadas', value: 'Statutes older than current legislative session flagged/excluded', valueEs: 'Estatutos anteriores a la sesión legislativa actual marcados/excluidos', status: 'verified' },
      { label: 'Paywalled Content', labelEs: 'Contenido de Pago', value: 'No content behind paywalls or requiring subscriptions', valueEs: 'Sin contenido detrás de muros de pago o que requiera suscripciones', status: 'verified' },
    ],
  },
  {
    category: 'Human Review Process',
    categoryEs: 'Proceso de Revisión Humana',
    items: [
      { label: 'Attorney Review', labelEs: 'Revisión de Abogados', value: 'All FAQ content and safety prompts reviewed by licensed attorneys', valueEs: 'Todo el contenido FAQ y prompts de seguridad revisados por abogados licenciados', status: 'verified' },
      { label: 'Bias Audits', labelEs: 'Auditorías de Sesgo', value: 'Quarterly bias testing across language, income, and geography', valueEs: 'Pruebas de sesgo trimestrales por idioma, ingresos y geografía', status: 'verified' },
      { label: 'Safety Red-Teaming', labelEs: 'Red-Teaming de Seguridad', value: 'Monthly adversarial testing for UPL violations and harmful outputs', valueEs: 'Pruebas adversariales mensuales para violaciones UPL y respuestas dañinas', status: 'pending' },
      { label: 'Community Feedback', labelEs: 'Retroalimentación Comunitaria', value: 'Trust Center report mechanism for bias or accuracy concerns', valueEs: 'Mecanismo de reporte en Trust Center para preocupaciones de sesgo o precisión', status: 'verified' },
    ],
  },
  {
    category: 'Update Cadence',
    categoryEs: 'Cadencia de Actualizaciones',
    items: [
      { label: 'Statute Data', labelEs: 'Datos Estatutarios', value: 'Weekly automated scraping with human-verified change detection', valueEs: 'Rastreo automático semanal con detección de cambios verificada por humanos', status: 'verified' },
      { label: 'Model Updates', labelEs: 'Actualizaciones de Modelo', value: 'Evaluated within 30 days of provider release; deployed after safety testing', valueEs: 'Evaluados dentro de 30 días del lanzamiento del proveedor; desplegados tras pruebas de seguridad', status: 'verified' },
      { label: 'Governance Docs', labelEs: 'Documentos de Gobernanza', value: 'Quarterly review cycle with public version history', valueEs: 'Ciclo de revisión trimestral con historial de versiones público', status: 'verified' },
      { label: 'Crisis Resources', labelEs: 'Recursos de Crisis', value: 'Monthly verification of hotline numbers and legal aid contacts', valueEs: 'Verificación mensual de números de línea de ayuda y contactos de ayuda legal', status: 'verified' },
    ],
  },
  {
    category: 'Known Limitations',
    categoryEs: 'Limitaciones Conocidas',
    items: [
      { label: 'Jurisdiction Coverage', labelEs: 'Cobertura de Jurisdicción', value: 'Currently 5 states (AZ, CA, TX, FL, NY). Federal law nationwide.', valueEs: 'Actualmente 5 estados (AZ, CA, TX, FL, NY). Ley federal a nivel nacional.', status: 'verified' },
      { label: 'Language Quality', labelEs: 'Calidad de Idioma', value: 'English primary; Spanish 91.6% parity. Arabic partial support.', valueEs: 'Inglés principal; español 91.6% de paridad. Árabe con soporte parcial.', status: 'verified' },
      { label: 'Temporal Lag', labelEs: 'Retraso Temporal', value: 'Up to 7-day delay between law changes and system updates', valueEs: 'Hasta 7 días de retraso entre cambios legales y actualizaciones del sistema', status: 'verified' },
      { label: 'Not Legal Advice', labelEs: 'No Es Asesoría Legal', value: 'System provides legal information only. Cannot replace attorney judgment.', valueEs: 'El sistema proporciona solo información legal. No puede reemplazar el juicio de un abogado.', status: 'verified' },
    ],
  },
];

function StatusBadge({ status }: { status: 'verified' | 'pending' | 'not-applicable' }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full border border-teal-200">
        <CheckCircle className="w-3 h-3" /> Verified
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
        <Clock className="w-3 h-3" /> In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-50 text-slate-600 rounded-full border border-slate-200">
      <HelpCircle className="w-3 h-3" /> N/A
    </span>
  );
}

const sectionIcons: Record<string, React.ElementType> = {
  'Model Providers': Database,
  'Legal Information Sources': Globe,
  'Dataset Licensing': FileText,
  'PII Handling & Retention': Lock,
  'Excluded Source Categories': AlertTriangle,
  'Human Review Process': Eye,
  'Update Cadence': RefreshCw,
  'Known Limitations': HelpCircle,
};

export default function AIDataProvenance() {
  const { language } = useLanguage();
  const es = language === 'es';

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-24 pb-16 bg-white min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            <div className="flex items-center gap-2 text-sm text-navy-500 mb-4">
              <Link to="/ai-governance" className="hover:text-teal-600 transition-colors">
                {es ? 'Gobernanza de IA' : 'AI Governance'}
              </Link>
              <span>/</span>
              <span className="text-navy-700 font-medium">
                {es ? 'Procedencia de Datos' : 'Data Provenance'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              {es ? 'Procedencia de Datos y Abastecimiento Ético' : 'AI Data Provenance & Ethical Sourcing'}
            </h1>
            <p className="text-lg text-navy-600 max-w-3xl">
              {es
                ? 'Documentación transparente de dónde provienen nuestros datos, cómo los manejamos y qué excluimos deliberadamente. Parte de nuestro compromiso con la IA ética y el acceso a la justicia.'
                : 'Transparent documentation of where our data comes from, how we handle it, and what we deliberately exclude. Part of our commitment to ethical AI and access to justice.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                <Clock className="h-3 w-3" />
                {es ? 'Última actualización: Junio 2026' : 'Last Updated: June 2026'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-navy-50 text-navy-700 rounded-full border border-navy-200">
                <FileText className="h-3 w-3" />
                {es ? 'Versión 1.0' : 'Version 1.0'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                <Shield className="h-3 w-3" />
                {es ? 'Cero Entrenamiento en Datos de Usuario' : 'Zero User-Data Training'}
              </span>
            </div>
          </header>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-10">
            <p className="text-sm text-amber-800">
              <strong>{es ? 'Aviso importante:' : 'Important notice:'}</strong>{' '}
              {es
                ? 'Esta página documenta nuestras prácticas de gobernanza de datos. No constituye asesoría legal. ezLegal.ai proporciona información legal, no asesoría legal.'
                : 'This page documents our data governance practices. It does not constitute legal advice. ezLegal.ai provides legal information, not legal advice.'}
            </p>
          </div>

          <div className="space-y-10">
            {provenanceData.map((section) => {
              const Icon = sectionIcons[section.category] || Database;
              return (
                <section key={section.category} className="border border-navy-200 rounded-xl overflow-hidden">
                  <div className="bg-navy-50 px-6 py-4 flex items-center gap-3">
                    <Icon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <h2 className="text-lg font-bold text-navy-900">
                      {es ? section.categoryEs : section.category}
                    </h2>
                  </div>
                  <div className="divide-y divide-navy-100">
                    {section.items.map((item) => (
                      <div key={item.label} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                        <div className="sm:w-48 flex-shrink-0">
                          <span className="text-sm font-semibold text-navy-700">
                            {es ? item.labelEs : item.label}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-navy-600">
                            {es ? item.valueEs : item.value}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <section className="mt-12 bg-teal-50 border border-teal-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              {es ? 'Nuestro Compromiso' : 'Our Commitment'}
            </h2>
            <ul className="space-y-2 text-sm text-navy-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                {es ? 'Nunca entrenaremos modelos con datos de usuarios' : 'We will never train models on user data'}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                {es ? 'Solo usamos fuentes de dominio público y con licencia' : 'We only use public domain and properly licensed sources'}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                {es ? 'Los usuarios pueden eliminar todos sus datos en cualquier momento' : 'Users can delete all their data at any time'}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                {es ? 'Publicamos esta documentación abiertamente como parte de la IA responsable' : 'We publish this documentation openly as part of responsible AI'}
              </li>
            </ul>
          </section>

          <nav className="mt-10 flex flex-wrap gap-3" aria-label={es ? 'Documentos relacionados' : 'Related documents'}>
            <Link to="/ai-model-card" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-white border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
              <FileText className="w-4 h-4" />
              {es ? 'Tarjeta del Modelo' : 'Model Card'}
            </Link>
            <Link to="/bias-monitoring" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-white border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
              <Eye className="w-4 h-4" />
              {es ? 'Monitoreo de Sesgo' : 'Bias Monitoring'}
            </Link>
            <Link to="/trust-center" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-white border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
              <Shield className="w-4 h-4" />
              {es ? 'Centro de Confianza' : 'Trust Center'}
            </Link>
            <Link to="/privacy" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-white border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
              <Lock className="w-4 h-4" />
              {es ? 'Política de Privacidad' : 'Privacy Policy'}
            </Link>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
