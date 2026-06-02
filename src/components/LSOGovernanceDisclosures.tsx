import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Eye, Brain, Scale, Lock, FileText, CheckCircle,
  ChevronDown, ChevronUp, AlertTriangle, Users,
  ExternalLink, Database, Fingerprint
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const t = {
  en: {
    title: 'AI Governance & Compliance Disclosures',
    subtitle: 'Transparency documentation for Legal Service Organizations and enterprise partners.',
    modelCard: 'AI Model Card',
    modelCardDesc: 'ezLegal.ai uses OpenAI GPT-4o models accessed via API. Models are not fine-tuned on user data. All interactions are stateless -- no user data is used for model training.',
    modelProvider: 'Model Provider:',
    modelProviderVal: 'OpenAI (API access, no fine-tuning)',
    modelVersion: 'Primary Model:',
    modelVersionVal: 'GPT-4o (latest stable)',
    trainingData: 'Training Data:',
    trainingDataVal: 'OpenAI pre-trained. ezLegal.ai provides retrieval-augmented context from Arizona statutes and legal databases.',
    noUserTraining: 'User Data Training:',
    noUserTrainingVal: 'None. Zero user data is used for model training or improvement.',
    dataTitle: 'Data Governance',
    dataSubtitle: 'How we handle client and organizational data.',
    dataItems: [
      { label: 'Storage', value: 'US-based Supabase (SOC 2 Type II infrastructure)' },
      { label: 'Encryption at Rest', value: 'AES-256 via cloud provider' },
      { label: 'Encryption in Transit', value: 'TLS 1.3' },
      { label: 'Data Retention', value: 'User-controlled. Delete any time via account settings or API.' },
      { label: 'Third-Party Sharing', value: 'None. Data is never sold or shared with third parties.' },
      { label: 'CCPA Compliance', value: 'Full compliance. Data deletion requests honored within 30 days.' },
      { label: 'Sub-Processors', value: 'OpenAI (inference only), Supabase (hosting), Stripe (payments)' },
    ],
    auditTitle: 'Audit & Accountability',
    auditSubtitle: 'Oversight mechanisms and audit trails.',
    auditItems: [
      'All AI interactions logged with timestamps, model version, and token counts',
      'Audit logs retained for minimum 2 years per LSC compliance',
      'Role-based access controls (RBAC) enforced at database level via Row Level Security',
      'Quarterly bias audits on AI output quality across demographics',
      'AI Governance Board reviews all new feature deployments',
      'Incident response plan with 24-hour notification for data breaches',
    ],
    safetyTitle: 'AI Safety Controls',
    safetySubtitle: 'Guardrails that protect end users.',
    safetyItems: [
      { icon: AlertTriangle, label: 'Scope Disclaimers', desc: 'Every interaction includes clear notice that this is legal information, not legal advice.' },
      { icon: Users, label: 'Attorney Handoff', desc: 'Automatic escalation pathways to licensed attorneys for matters requiring representation.' },
      { icon: Shield, label: 'Safety Gates', desc: 'Consent-based gates for outcome predictions, document generation, and negotiation tools.' },
      { icon: Eye, label: 'Crisis Detection', desc: 'Real-time detection and routing for domestic violence, suicide risk, and other crisis situations.' },
      { icon: Lock, label: 'PII Protection', desc: 'Automated screening to prevent inadvertent disclosure of sensitive personal information.' },
      { icon: Scale, label: 'Jurisdiction Enforcement', desc: 'All guidance is jurisdiction-locked. Users must confirm their state before receiving substantive information.' },
    ],
    complianceTitle: 'Regulatory Compliance',
    complianceSubtitle: 'Standards and frameworks we follow.',
    complianceItems: [
      { standard: 'ABA Model Rules', status: 'Aligned', note: 'No UPL -- information only, not legal advice' },
      { standard: 'LSC Requirements', status: 'Compliant', note: 'Grant reporting, case tracking, audit trails' },
      { standard: 'CCPA / Privacy', status: 'Compliant', note: 'Full data rights, deletion, portability' },
      { standard: 'SOC 2 Type II', status: 'Infrastructure', note: 'Via Supabase managed hosting' },
      { standard: 'WCAG 2.1 AA', status: 'In Progress', note: 'Accessibility audit and remediation ongoing' },
      { standard: 'NIST AI RMF', status: 'Aligned', note: 'Risk identification, measurement, governance' },
    ],
    downloadPolicy: 'Download Full AI Policy (PDF)',
    viewGovernance: 'View Complete AI Governance Framework',
    contactCompliance: 'Contact Compliance Team',
    lastUpdated: 'Last Updated:',
    lastUpdatedDate: 'February 2026',
  },
  es: {
    title: 'Divulgaciones de Gobernanza y Cumplimiento de IA',
    subtitle: 'Documentacion de transparencia para Organizaciones de Servicios Legales y socios empresariales.',
    modelCard: 'Tarjeta del Modelo de IA',
    modelCardDesc: 'ezLegal.ai utiliza modelos GPT-4o de OpenAI accedidos via API. Los modelos no se ajustan con datos de usuarios. Todas las interacciones son sin estado -- ningun dato de usuario se usa para entrenar modelos.',
    modelProvider: 'Proveedor del Modelo:',
    modelProviderVal: 'OpenAI (acceso API, sin ajuste fino)',
    modelVersion: 'Modelo Principal:',
    modelVersionVal: 'GPT-4o (ultima version estable)',
    trainingData: 'Datos de Entrenamiento:',
    trainingDataVal: 'Pre-entrenado por OpenAI. ezLegal.ai proporciona contexto aumentado por recuperacion de estatutos de Arizona y bases de datos legales.',
    noUserTraining: 'Entrenamiento con Datos de Usuarios:',
    noUserTrainingVal: 'Ninguno. Cero datos de usuarios se usan para entrenamiento o mejora del modelo.',
    dataTitle: 'Gobernanza de Datos',
    dataSubtitle: 'Como manejamos los datos de clientes y organizaciones.',
    dataItems: [
      { label: 'Almacenamiento', value: 'Supabase con sede en EE.UU. (infraestructura SOC 2 Tipo II)' },
      { label: 'Cifrado en Reposo', value: 'AES-256 via proveedor de nube' },
      { label: 'Cifrado en Transito', value: 'TLS 1.3' },
      { label: 'Retencion de Datos', value: 'Controlado por el usuario. Elimine en cualquier momento.' },
      { label: 'Compartir con Terceros', value: 'Ninguno. Los datos nunca se venden ni comparten.' },
      { label: 'Cumplimiento CCPA', value: 'Cumplimiento total. Solicitudes de eliminacion atendidas en 30 dias.' },
      { label: 'Sub-Procesadores', value: 'OpenAI (inferencia), Supabase (alojamiento), Stripe (pagos)' },
    ],
    auditTitle: 'Auditoria y Responsabilidad',
    auditSubtitle: 'Mecanismos de supervision y registros de auditoria.',
    auditItems: [
      'Todas las interacciones de IA registradas con marcas de tiempo, version del modelo y conteo de tokens',
      'Registros de auditoria retenidos por minimo 2 anos segun cumplimiento LSC',
      'Controles de acceso basados en roles (RBAC) aplicados a nivel de base de datos',
      'Auditorias trimestrales de sesgo en la calidad de salida de IA',
      'La Junta de Gobernanza de IA revisa todos los despliegues de nuevas funciones',
      'Plan de respuesta a incidentes con notificación de 24 horas para violaciones de datos',
    ],
    safetyTitle: 'Controles de Seguridad de IA',
    safetySubtitle: 'Protecciones que protegen a los usuarios finales.',
    safetyItems: [
      { icon: AlertTriangle, label: 'Descargos de Alcance', desc: 'Cada interacción incluye aviso claro de que es información legal, no asesoramiento legal.' },
      { icon: Users, label: 'Transferencia a Abogado', desc: 'Vías de escalación automática a abogados licenciados para asuntos que requieren representación.' },
      { icon: Shield, label: 'Puertas de Seguridad', desc: 'Puertas basadas en consentimiento para predicciones, generación de documentos y herramientas de negociación.' },
      { icon: Eye, label: 'Detección de Crisis', desc: 'Detección en tiempo real y enrutamiento para violencia doméstica, riesgo de suicidio y otras situaciones de crisis.' },
      { icon: Lock, label: 'Protección de PII', desc: 'Filtrado automatizado para prevenir divulgación inadvertida de información personal sensible.' },
      { icon: Scale, label: 'Aplicación de Jurisdicción', desc: 'Toda la orientación está bloqueada por jurisdicción. Los usuarios deben confirmar su estado antes de recibir información.' },
    ],
    complianceTitle: 'Cumplimiento Regulatorio',
    complianceSubtitle: 'Estandares y marcos que seguimos.',
    complianceItems: [
      { standard: 'Reglas Modelo ABA', status: 'Alineado', note: 'Sin UPL -- solo información, no asesoramiento legal' },
      { standard: 'Requisitos LSC', status: 'Cumplido', note: 'Reportes de subsidios, seguimiento de casos, registros de auditoria' },
      { standard: 'CCPA / Privacidad', status: 'Cumplido', note: 'Derechos completos de datos, eliminacion, portabilidad' },
      { standard: 'SOC 2 Tipo II', status: 'Infraestructura', note: 'Via alojamiento administrado de Supabase' },
      { standard: 'WCAG 2.1 AA', status: 'En Progreso', note: 'Auditoria de accesibilidad y remediacion en curso' },
      { standard: 'NIST AI RMF', status: 'Alineado', note: 'Identificacion de riesgos, medicion, gobernanza' },
    ],
    downloadPolicy: 'Descargar Politica Completa de IA (PDF)',
    viewGovernance: 'Ver Marco Completo de Gobernanza de IA',
    contactCompliance: 'Contactar al Equipo de Cumplimiento',
    lastUpdated: 'Ultima Actualizacion:',
    lastUpdatedDate: 'Febrero 2026',
  },
};

interface SectionProps {
  title: string;
  subtitle: string;
  icon: typeof Shield;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, subtitle, icon: Icon, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-navy-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-navy-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-navy-900">{title}</h3>
            <p className="text-xs text-navy-500">{subtitle}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-navy-400" /> : <ChevronDown className="w-5 h-5 text-navy-400" />}
      </button>
      {open && <div className="p-5 pt-0 border-t border-navy-100">{children}</div>}
    </div>
  );
}

interface LSOGovernanceDisclosuresProps {
  embedded?: boolean;
}

export default function LSOGovernanceDisclosures({ embedded = false }: LSOGovernanceDisclosuresProps) {
  const { language } = useLanguage();
  const s = t[language as 'en' | 'es'] || t.en;

  const content = (
    <div className="space-y-4">
      <CollapsibleSection title={s.modelCard} subtitle={s.modelCardDesc.substring(0, 60) + '...'} icon={Brain} defaultOpen>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-navy-700 leading-relaxed">{s.modelCardDesc}</p>
          <div className="bg-navy-50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3 text-sm">
              <span className="font-semibold text-navy-800 min-w-[160px]">{s.modelProvider}</span>
              <span className="text-navy-600">{s.modelProviderVal}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="font-semibold text-navy-800 min-w-[160px]">{s.modelVersion}</span>
              <span className="text-navy-600">{s.modelVersionVal}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="font-semibold text-navy-800 min-w-[160px]">{s.trainingData}</span>
              <span className="text-navy-600">{s.trainingDataVal}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="font-semibold text-navy-800 min-w-[160px]">{s.noUserTraining}</span>
              <span className="text-green-700 font-semibold">{s.noUserTrainingVal}</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={s.dataTitle} subtitle={s.dataSubtitle} icon={Database}>
        <div className="mt-4">
          <div className="divide-y divide-navy-100">
            {s.dataItems.map((item: { label: string; value: string }, i: number) => (
              <div key={i} className="flex items-start gap-3 py-3 text-sm">
                <span className="font-semibold text-navy-800 min-w-[180px] flex-shrink-0">{item.label}</span>
                <span className="text-navy-600">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={s.safetyTitle} subtitle={s.safetySubtitle} icon={Shield}>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {s.safetyItems.map((item: { icon: React.ElementType; label: string; desc: string }, i: number) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-navy-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-navy-900">{item.label}</span>
                </div>
                <p className="text-xs text-navy-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={s.auditTitle} subtitle={s.auditSubtitle} icon={Eye}>
        <div className="mt-4 space-y-2">
          {s.auditItems.map((item: string, i: number) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-navy-700">{item}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={s.complianceTitle} subtitle={s.complianceSubtitle} icon={Fingerprint}>
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-200">
                  <th className="text-left py-2 px-3 font-semibold text-navy-800">Standard</th>
                  <th className="text-left py-2 px-3 font-semibold text-navy-800">Status</th>
                  <th className="text-left py-2 px-3 font-semibold text-navy-800">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {s.complianceItems.map((item: { standard: string; status: string; note: string }, i: number) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 font-medium text-navy-900">{item.standard}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Compliant' || item.status === 'Cumplido'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'Aligned' || item.status === 'Alineado'
                          ? 'bg-teal-100 text-teal-800'
                          : item.status === 'In Progress' || item.status === 'En Progreso'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-navy-100 text-navy-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-navy-600">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CollapsibleSection>

      <div className="flex flex-wrap gap-3 pt-4">
        <Link
          to="/ai-governance"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <FileText className="w-4 h-4" />
          {s.viewGovernance}
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-navy-50 text-navy-700 border border-navy-200 rounded-lg text-sm font-semibold transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          {s.contactCompliance}
        </Link>
      </div>

      <div className="pt-3 text-xs text-navy-400">
        {s.lastUpdated} {s.lastUpdatedDate}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="bg-white rounded-2xl border border-navy-200 shadow-sm overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-navy-50 to-white border-b border-navy-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy-900">{s.title}</h2>
            <p className="text-sm text-navy-600">{s.subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{content}</div>
    </div>
  );
}
