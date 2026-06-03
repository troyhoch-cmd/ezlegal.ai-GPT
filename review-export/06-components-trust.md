# ezLegal.ai Code Review - Trust, Safety & Legal Components

> Disclaimers, safety gates, trust signals, intake flows.

Generated: 2026-06-03T00:51:49.802Z
Files included: 18

---

## src/components/trust/AccessToJusticeCard.tsx

```tsx
import { Heart, Scale, Globe, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface AccessToJusticeCardProps {
  variant?: 'full' | 'compact';
  showProBono?: boolean;
}

export default function AccessToJusticeCard({ variant = 'full', showProBono = true }: AccessToJusticeCardProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  if (variant === 'compact') {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Heart className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-teal-800">
              {en ? 'Cannot afford a lawyer?' : 'No puedes pagar un abogado?'}
            </p>
            <p className="text-xs text-teal-700 mt-1">
              {en
                ? 'Free help is available. We screen for eligibility before showing paid options.'
                : 'Hay ayuda gratuita disponible. Evaluamos elegibilidad antes de mostrar opciones pagadas.'}
            </p>
            <div className="flex gap-3 mt-2">
              <Link to="/pro-bono" className="text-xs text-teal-700 hover:text-teal-900 font-medium underline">
                {en ? 'Free resources' : 'Recursos gratuitos'}
              </Link>
              <Link to="/legal-safety-net" className="text-xs text-teal-700 hover:text-teal-900 font-medium underline">
                {en ? 'Low-cost help' : 'Ayuda de bajo costo'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: DollarSign,
      titleEn: 'Free tier always available',
      titleEs: 'Nivel gratuito siempre disponible',
      descEn: 'Ask unlimited questions at no cost. No signup required.',
      descEs: 'Haz preguntas ilimitadas sin costo. No requiere registro.',
    },
    {
      icon: Scale,
      titleEn: 'Hardship screening first',
      titleEs: 'Evaluación de dificultad económica primero',
      descEn: 'We check if you qualify for free or reduced-cost help before showing paid options.',
      descEs: 'Verificamos si calificas para ayuda gratuita o de bajo costo antes de mostrar opciones pagadas.',
    },
    {
      icon: Globe,
      titleEn: 'Bilingual access',
      titleEs: 'Acceso bilingüe',
      descEn: 'Full platform support in English and Spanish.',
      descEs: 'Soporte completo de la plataforma en inglés y español.',
    },
    {
      icon: Heart,
      titleEn: 'Pro bono pathways',
      titleEs: 'Opciones pro bono',
      descEn: 'Connections to free legal assistance programs.',
      descEs: 'Conexiones a programas de asistencia legal gratuita.',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {en ? 'Access to Justice Commitment' : 'Compromiso de Acceso a la Justicia'}
      </h3>
      <p className="text-sm text-slate-600 mb-5">
        {en
          ? 'Everyone deserves to understand their legal rights, regardless of ability to pay.'
          : 'Todos merecen entender sus derechos legales, sin importar su capacidad de pago.'}
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-teal-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{en ? f.titleEn : f.titleEs}</p>
                <p className="text-xs text-slate-600 mt-0.5">{en ? f.descEn : f.descEs}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showProBono && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/pro-bono"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            {en ? 'Find free help' : 'Encontrar ayuda gratuita'}
          </Link>
          <Link
            to="/legal-safety-net"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            {en ? 'Low-cost options' : 'Opciones de bajo costo'}
          </Link>
        </div>
      )}
    </div>
  );
}

```

---

## src/components/trust/AIGovernanceSummary.tsx

```tsx
import { Brain, Shield, Eye, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface AIGovernanceSummaryProps {
  variant?: 'card' | 'strip';
}

export default function AIGovernanceSummary({ variant = 'card' }: AIGovernanceSummaryProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const principles = [
    {
      icon: Brain,
      titleEn: 'Transparent AI',
      titleEs: 'IA Transparente',
      descEn: 'We disclose when AI is used and explain its limitations.',
      descEs: 'Divulgamos cuándo se usa IA y explicamos sus limitaciones.',
    },
    {
      icon: Shield,
      titleEn: 'No training on your data',
      titleEs: 'No entrenamos con tus datos',
      descEn: 'Your conversations are never used to train AI models.',
      descEs: 'Tus conversaciones nunca se usan para entrenar modelos de IA.',
    },
    {
      icon: Eye,
      titleEn: 'Human oversight',
      titleEs: 'Supervisión humana',
      descEn: 'High-risk situations are flagged for human review.',
      descEs: 'Situaciones de alto riesgo se señalan para revisión humana.',
    },
    {
      icon: Lock,
      titleEn: 'Data minimization',
      titleEs: 'Minimización de datos',
      descEn: 'We collect only what is needed to help you.',
      descEs: 'Solo recopilamos lo necesario para ayudarte.',
    },
  ];

  if (variant === 'strip') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4 justify-center">
          {principles.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                <Icon className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                <span className="font-medium">{en ? p.titleEn : p.titleEs}</span>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-2">
          <Link to="/ai-governance" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
            {en ? 'View AI Governance' : 'Ver Gobernanza de IA'} &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        {en ? 'AI Governance Principles' : 'Principios de Gobernanza de IA'}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {principles.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-teal-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{en ? p.titleEn : p.titleEs}</p>
                <p className="text-xs text-slate-600 mt-0.5">{en ? p.descEn : p.descEs}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100 flex gap-4">
        <Link to="/ai-governance" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          {en ? 'Full AI Governance' : 'Gobernanza de IA completa'} &rarr;
        </Link>
        <Link to="/trust-center" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
          {en ? 'Trust Center' : 'Centro de Confianza'} &rarr;
        </Link>
      </div>
    </div>
  );
}

```

---

## src/components/trust/DataUsePlainLanguage.tsx

```tsx
import { Database, Trash2, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface DataUsePlainLanguageProps {
  variant?: 'full' | 'compact';
}

export default function DataUsePlainLanguage({ variant = 'full' }: DataUsePlainLanguageProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const points = [
    {
      icon: Database,
      titleEn: 'What we store',
      titleEs: 'Qué almacenamos',
      descEn: 'Only the information you provide during conversations and intake.',
      descEs: 'Solo la información que proporcionas durante conversaciones y admisión.',
    },
    {
      icon: Lock,
      titleEn: 'How we protect it',
      titleEs: 'Cómo lo protegemos',
      descEn: 'Encrypted in transit and at rest. Access is limited to what is needed to serve you.',
      descEs: 'Cifrado en tránsito y en reposo. El acceso se limita a lo necesario para ayudarte.',
    },
    {
      icon: Eye,
      titleEn: 'Who can see it',
      titleEs: 'Quién puede verlo',
      descEn: 'Only you. We do not share your data with third parties for marketing.',
      descEs: 'Solo tú. No compartimos tus datos con terceros para marketing.',
    },
    {
      icon: Trash2,
      titleEn: 'How to delete it',
      titleEs: 'Cómo eliminarlo',
      descEn: 'You can request full data deletion at any time.',
      descEs: 'Puedes solicitar la eliminación completa de datos en cualquier momento.',
    },
  ];

  if (variant === 'compact') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-700 mb-2 font-medium">
          {en ? 'Your data is yours.' : 'Tus datos son tuyos.'}
        </p>
        <ul className="space-y-1">
          <li className="text-xs text-slate-600 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-teal-600" aria-hidden="true" />
            {en ? 'Encrypted and private' : 'Cifrado y privado'}
          </li>
          <li className="text-xs text-slate-600 flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-teal-600" aria-hidden="true" />
            {en ? 'Never shared for marketing' : 'Nunca compartido para marketing'}
          </li>
          <li className="text-xs text-slate-600 flex items-center gap-1.5">
            <Trash2 className="w-3 h-3 text-teal-600" aria-hidden="true" />
            {en ? 'Delete anytime' : 'Elimina en cualquier momento'}
          </li>
        </ul>
        <Link to="/privacy" className="text-xs text-teal-600 hover:text-teal-700 font-medium mt-2 inline-block">
          {en ? 'Privacy policy' : 'Política de privacidad'} &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {en ? 'How your data is used' : 'Cómo se usan tus datos'}
      </h3>
      <p className="text-sm text-slate-600 mb-5">
        {en ? 'In plain language:' : 'En lenguaje simple:'}
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {points.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-slate-700" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{en ? p.titleEn : p.titleEs}</p>
                <p className="text-xs text-slate-600 mt-0.5">{en ? p.descEn : p.descEs}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <Link to="/privacy" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          {en ? 'Full privacy policy' : 'Política de privacidad completa'} &rarr;
        </Link>
        <Link to="/trust-center" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
          {en ? 'Trust Center' : 'Centro de Confianza'} &rarr;
        </Link>
      </div>
    </div>
  );
}

```

---

## src/components/trust/GovernanceEvidencePanel.tsx

```tsx
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, ExternalLink, Shield, Circle } from 'lucide-react';
import {
  GOVERNANCE_EVIDENCE,
  GOVERNANCE_CATEGORY_LABELS,
  getPublishedPolicies,
  getUnpublishedPolicies,
  getEvidenceByCategory,
} from '../../lib/intake/governanceStatus';
import type { PolicyStatus, GovernanceCategory } from '../../lib/intake/governanceStatus';

interface GovernanceEvidencePanelProps {
  language: string;
  variant?: 'full' | 'compact';
}

const STATUS_CONFIG: Record<PolicyStatus, { icon: typeof CheckCircle; label: string; labelEs: string; className: string }> = {
  implemented: { icon: CheckCircle, label: 'Implemented', labelEs: 'Implementado', className: 'text-green-600 bg-green-50 border-green-200' },
  partial: { icon: Clock, label: 'Partial', labelEs: 'Parcial', className: 'text-amber-600 bg-amber-50 border-amber-200' },
  planned: { icon: Circle, label: 'Planned', labelEs: 'Planeado', className: 'text-slate-500 bg-slate-50 border-slate-200' },
  blocked: { icon: AlertCircle, label: 'Blocked', labelEs: 'Bloqueado', className: 'text-red-500 bg-red-50 border-red-200' },
};

const CATEGORIES: GovernanceCategory[] = [
  'ai_limitations',
  'privacy_data',
  'legal_aid_referral',
  'attorney_review',
  'partner_controls',
  'accessibility_language',
];

export function GovernanceEvidencePanel({ language, variant = 'full' }: GovernanceEvidencePanelProps) {
  const published = getPublishedPolicies();
  const unpublished = getUnpublishedPolicies();
  const completionPercent = Math.round((published.length / GOVERNANCE_EVIDENCE.length) * 100);

  if (variant === 'compact') {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-teal-600" />
          <span className="font-semibold text-slate-800 text-sm">
            {language === 'es' ? 'Estado de Gobernanza' : 'Governance Status'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${completionPercent}%` }} />
          </div>
          <span className="text-sm font-medium text-slate-700">{completionPercent}%</span>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          {published.length}/{GOVERNANCE_EVIDENCE.length} {language === 'es' ? 'controles implementados' : 'controls implemented'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">
            {language === 'es' ? 'Evidencia de Gobernanza de IA' : 'AI Governance Evidence'}
          </h3>
          <span className="text-sm font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
            {completionPercent}% {language === 'es' ? 'implementado' : 'implemented'}
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${completionPercent}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> {published.length} implemented</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> {unpublished.length} remaining</span>
        </div>
      </div>

      {/* Category sections */}
      {CATEGORIES.map((category) => {
        const items = getEvidenceByCategory(category);
        if (items.length === 0) return null;
        const categoryLabel = GOVERNANCE_CATEGORY_LABELS[category][language === 'es' ? 'es' : 'en'];

        return (
          <div key={category} className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3 border-b border-slate-100">
              <h4 className="font-medium text-slate-700 text-sm">{categoryLabel}</h4>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const config = STATUS_CONFIG[item.status];
                const Icon = config.icon;
                const label = language === 'es' ? item.labelEs : item.labelEn;
                const statusLabel = language === 'es' ? config.labelEs : config.label;
                const userImpact = language === 'es' ? item.userImpactEs : item.userImpactEn;

                return (
                  <div key={item.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${config.className.split(' ')[0]}`} />
                        <span className="text-sm text-slate-800">{label}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${config.className}`}>
                          {statusLabel}
                        </span>
                        {item.url && (
                          <Link to={item.url} className="text-teal-600 hover:text-teal-800">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                    {userImpact && (
                      <p className="text-slate-500 text-xs mt-1.5 ml-7">{userImpact}</p>
                    )}
                    {item.openGap && (
                      <p className="text-amber-600 text-xs mt-1 ml-7">
                        {language === 'es' ? 'Brecha:' : 'Gap:'} {item.openGap}
                      </p>
                    )}
                    {item.lastUpdated && (
                      <p className="text-slate-400 text-xs mt-0.5 ml-7">
                        {language === 'es' ? 'Actualizado:' : 'Updated:'} {item.lastUpdated}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Disclaimer */}
      <p className="text-slate-400 text-xs">
        {language === 'es'
          ? '"Implementado" significa que el control está operativo y tiene evidencia. "Parcial" significa que existe internamente pero no está completamente publicado. "Planeado" significa que aún no se ha iniciado la implementación.'
          : '"Implemented" means the control is operational with evidence. "Partial" means it exists internally but is not fully published. "Planned" means implementation has not yet begun.'}
      </p>
    </div>
  );
}

```

---

## src/components/trust/HumanEscalationCard.tsx

```tsx
import { Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface HumanEscalationCardProps {
  context?: 'chat' | 'intake' | 'checkout' | 'general';
}

export default function HumanEscalationCard({ context = 'general' }: HumanEscalationCardProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const contextMessages: Record<string, { en: string; es: string }> = {
    chat: {
      en: 'If your situation is complex or high-risk, you can connect with a licensed attorney at any time.',
      es: 'Si tu situación es compleja o de alto riesgo, puedes conectarte con un abogado licenciado en cualquier momento.',
    },
    intake: {
      en: 'After completing intake, you can request a referral to a licensed attorney or legal aid provider.',
      es: 'Después de completar la admisión, puedes solicitar una referencia a un abogado licenciado o proveedor de ayuda legal.',
    },
    checkout: {
      en: 'Not sure if you need this? You can also speak with a licensed attorney directly.',
      es: 'No estás seguro si necesitas esto? También puedes hablar con un abogado licenciado directamente.',
    },
    general: {
      en: 'For complex legal situations, we recommend consulting with a licensed attorney.',
      es: 'Para situaciones legales complejas, recomendamos consultar con un abogado licenciado.',
    },
  };

  const msg = contextMessages[context];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-slate-700" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-900 mb-1">
            {en ? 'Need human help?' : 'Necesitas ayuda humana?'}
          </h4>
          <p className="text-sm text-slate-600 mb-3">{en ? msg.en : msg.es}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/find-attorney"
              className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-800 font-medium"
            >
              {en ? 'Find an attorney' : 'Buscar un abogado'}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              to="/pro-bono"
              className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-800 font-medium"
            >
              {en ? 'Free legal help' : 'Ayuda legal gratuita'}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## src/components/trust/ScopeBoundaryCard.tsx

```tsx
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface ScopeBoundaryCardProps {
  variant?: 'compact' | 'full';
}

export default function ScopeBoundaryCard({ variant = 'full' }: ScopeBoundaryCardProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const canDo = en
    ? [
        'Explain legal concepts in plain language',
        'Help you understand your rights in general terms',
        'Generate document drafts and checklists',
        'Identify possible next steps for your situation',
        'Connect you with attorney directories',
      ]
    : [
        'Explicar conceptos legales en lenguaje simple',
        'Ayudarte a entender tus derechos en términos generales',
        'Generar borradores de documentos y listas de verificación',
        'Identificar posibles próximos pasos para tu situación',
        'Conectarte con directorios de abogados',
      ];

  const cannotDo = en
    ? [
        'Provide legal advice for your specific case',
        'Represent you in court or negotiations',
        'Guarantee any legal outcome',
        'Replace a licensed attorney',
      ]
    : [
        'Dar asesoría legal para tu caso específico',
        'Representarte en tribunal o negociaciones',
        'Garantizar resultados legales',
        'Reemplazar a un abogado licenciado',
      ];

  if (variant === 'compact') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm text-slate-700 font-medium">
              {en
                ? 'ezLegal provides legal information, not legal advice.'
                : 'ezLegal proporciona información legal, no asesoría legal.'}
            </p>
            <Link to="/trust-center" className="text-xs text-teal-600 hover:text-teal-700 font-medium mt-1 inline-block">
              {en ? 'Learn more about our scope' : 'Conoce más sobre nuestro alcance'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        {en ? 'What ezLegal can and cannot do' : 'Qué puede y no puede hacer ezLegal'}
      </h3>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            {en ? 'We can help with' : 'Podemos ayudar con'}
          </h4>
          <ul className="space-y-2">
            {canDo.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" aria-hidden="true" />
            {en ? 'We cannot' : 'No podemos'}
          </h4>
          <ul className="space-y-2">
            {cannotDo.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <Link to="/trust-center" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          {en ? 'View full Trust Center' : 'Ver el Centro de Confianza completo'} &rarr;
        </Link>
      </div>
    </div>
  );
}

```

---

## src/components/trust/TrustCTABlock.tsx

```tsx
import { Shield, Lock, Brain, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface TrustCTABlockProps {
  variant?: 'standard' | 'compact';
}

export default function TrustCTABlock({ variant = 'standard' }: TrustCTABlockProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const links = [
    { to: '/trust-center', icon: Shield, labelEn: 'Trust Center', labelEs: 'Centro de Confianza' },
    { to: '/privacy', icon: Lock, labelEn: 'Privacy', labelEs: 'Privacidad' },
    { to: '/ai-governance', icon: Brain, labelEn: 'AI Governance', labelEs: 'Gobernanza de IA' },
    { to: '/scope-disclaimers', icon: Eye, labelEn: 'Scope & Disclaimers', labelEs: 'Alcance y Avisos' },
  ];

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-teal-700 px-2.5 py-1.5 bg-white rounded-full border border-slate-200 hover:border-teal-300 transition"
            >
              <Icon className="w-3 h-3" aria-hidden="true" />
              {en ? link.labelEn : link.labelEs}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-3 text-center">
        {en ? 'Transparency & Trust' : 'Transparencia y Confianza'}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 hover:shadow-sm transition text-center"
            >
              <Icon className="w-5 h-5 text-teal-600" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-700">{en ? link.labelEn : link.labelEs}</span>
            </Link>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 text-center mt-3">
        {en
          ? 'ezLegal provides legal information and tools, not legal advice.'
          : 'ezLegal proporciona información y herramientas legales, no asesoría legal.'}
      </p>
    </div>
  );
}

```

---

## src/components/shared/AISafetyMicrocopy.tsx

```tsx
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Users, Lock, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

type Variant = 'info' | 'warning' | 'urgent' | 'compact';

interface BaseProps {
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  info: 'bg-slate-100 border-slate-200 text-slate-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  urgent: 'bg-red-50 border-red-200 text-red-900',
  compact: 'bg-transparent border-transparent text-slate-500',
};

export function ScopeNotice({ variant = 'info', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-start gap-2 ${isCompact ? 'py-1' : 'p-3 rounded-xl border'} ${variantStyles[variant]} ${className}`}>
      <Shield className={`${isCompact ? 'w-3.5 h-3.5 mt-0.5' : 'w-4 h-4 mt-0.5'} shrink-0`} aria-hidden="true" />
      <p className={`${isCompact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
        {en
          ? 'This is legal information, not legal advice. No attorney-client relationship is created.'
          : 'Esto es información legal, no asesoría legal. No se crea relación abogado-cliente.'}
        {!isCompact && (
          <>
            {' '}
            <Link to="/scope-disclaimers" className="underline underline-offset-2 hover:opacity-80">
              {en ? 'Scope limits' : 'Límites de alcance'}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

export function NotLegalAdviceBanner({ variant = 'info', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border ${variantStyles[variant]} ${className}`}>
      <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
      <p className="text-sm font-medium">
        {en
          ? 'This is legal information, not legal advice.'
          : 'Esto es información legal, no asesoría legal.'}
      </p>
    </div>
  );
}

export function HumanEscalationCard({ variant = 'info', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${variantStyles[variant]} ${className}`}>
      <Users className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm leading-relaxed">
          {en
            ? 'You may need a lawyer or legal aid organization for this issue.'
            : 'Puede necesitar un abogado u organización de ayuda legal para este asunto.'}
        </p>
        <Link
          to="/lawyer-profiles"
          className="inline-block mt-1.5 text-sm font-medium underline underline-offset-2 hover:opacity-80"
        >
          {en ? 'Find legal help' : 'Encontrar ayuda legal'}
        </Link>
      </div>
    </div>
  );
}

export function PrivacyMicrocopy({ variant = 'info', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-start gap-2 ${isCompact ? 'py-1' : 'p-3 rounded-xl border'} ${variantStyles[variant]} ${className}`}>
      <Lock className={`${isCompact ? 'w-3.5 h-3.5 mt-0.5' : 'w-4 h-4 mt-0.5'} shrink-0`} aria-hidden="true" />
      <p className={`${isCompact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
        {en
          ? 'Do not upload documents you are not comfortable sharing. Conversations are encrypted.'
          : 'No suba documentos que no se sienta cómodo compartiendo. Las conversaciones están cifradas.'}
        {!isCompact && (
          <>
            {' '}
            <Link to="/privacy-at-a-glance" className="underline underline-offset-2 hover:opacity-80">
              {en ? 'Privacy details' : 'Detalles de privacidad'}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

export function DeadlineWarning({ variant = 'warning', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl border ${variantStyles[variant]} ${className}`}>
      <Clock className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-relaxed">
        {en
          ? 'Deadlines matter. If you have a court date or filing deadline, tell us the date so we can prioritize.'
          : 'Las fechas límite son importantes. Si tiene una fecha de corte o plazo, díganos para priorizar.'}
      </p>
    </div>
  );
}

export function SpanishScopeNotice({ variant = 'info', className = '' }: BaseProps) {
  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl border ${variantStyles[variant]} ${className}`}>
      <Shield className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-relaxed">
        Esto es información legal, no asesoría legal. Las fechas límite son importantes. Si está en peligro inmediato, llame al 911.{' '}
        <Link to="/scope-disclaimers" className="underline underline-offset-2 hover:opacity-80">
          Alcance y límites
        </Link>
      </p>
    </div>
  );
}

export function UrgentSafetyNotice({ variant = 'urgent', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${variantStyles[variant]} ${className}`} role="alert">
      <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">
          {en
            ? 'If you are in immediate danger, call 911.'
            : 'Si está en peligro inmediato, llame al 911.'}
        </p>
        <Link
          to="/emergency-resources"
          className="inline-block mt-1 text-sm font-medium underline underline-offset-2 hover:opacity-80"
        >
          {en ? 'Emergency resources' : 'Recursos de emergencia'}
        </Link>
      </div>
    </div>
  );
}

```

---

## src/components/shared/LegalDisclaimer.tsx

```tsx
import { Info, AlertTriangle, Lock, UserX, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDisclosure } from '../../lib/legal-disclosures';
import type { DisclosureKey } from '../../lib/legal-disclosures';

type Variant = 'banner' | 'inline' | 'card' | 'footer';

interface LegalDisclaimerProps {
  variant?: Variant;
  keys?: DisclosureKey[];
  jurisdiction?: string;
  showLinks?: boolean;
  className?: string;
}

const DEFAULT_KEYS: DisclosureKey[] = ['notAdvice', 'noAttorneyClient', 'consultAttorney'];

export default function LegalDisclaimer({
  variant = 'inline',
  keys = DEFAULT_KEYS,
  jurisdiction,
  showLinks = false,
  className = '',
}: LegalDisclaimerProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const texts = keys.map(key => getDisclosure(key, language));

  if (variant === 'banner') {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">
              {en ? 'Important Disclaimer' : 'Aviso Importante'}
            </h4>
            <div className="text-xs text-amber-800 space-y-1">
              {texts.map((text, i) => (
                <p key={i}>{i === 0 ? <strong>{text}</strong> : text}</p>
              ))}
              {jurisdiction && (
                <p>
                  {en
                    ? <>Information is tailored to <strong>{jurisdiction}</strong> law where possible.</>
                    : <>La información esta adaptada a la ley de <strong>{jurisdiction}</strong> cuando es posible.</>}
                </p>
              )}
            </div>
            {showLinks && (
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Link to="/scope-disclaimers" className="text-xs text-amber-700 hover:underline font-medium">
                  {en ? 'Full Disclaimers' : 'Descargos Completos'}
                </Link>
                <Link to="/trust-center" className="text-xs text-amber-700 hover:underline font-medium">
                  {en ? 'Trust Center' : 'Centro de Confianza'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-slate-50 rounded-xl p-4 space-y-3 text-sm text-slate-700 ${className}`}>
        <p><strong>{getDisclosure('notAdvice', language)}</strong></p>
        <ul className="space-y-2 pl-4">
          {keys.filter(k => k !== 'notAdvice').map(key => (
            <li key={key} className="flex items-start gap-2">
              <span className="text-slate-400">-</span>
              <span>{getDisclosure(key, language)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-navy-600 ${className}`}>
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{getDisclosure('notAdvice', language)}</span>
        </div>
        <div className="flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{en ? 'AES-256 encrypted' : 'Encriptado AES-256'}</span>
        </div>
        <div className="flex items-start gap-2">
          <UserX className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{getDisclosure('noPrivilege', language)}</span>
        </div>
        <div className="flex items-start gap-2">
          <Trash2 className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <Link to="/privacy" className="text-teal-600 hover:underline">
            {en ? 'Data retention & deletion' : 'Retencion y eliminacion de datos'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <p className={`text-xs text-slate-500 text-center ${className}`}>
      {texts.join(' ')}
    </p>
  );
}

```

---

## src/components/shared/CrisisResourceCard.tsx

```tsx
import { Phone, Heart, ExternalLink, Users, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCrisisResources } from '../../lib/legal-disclosures';
import type { CrisisResource } from '../../lib/legal-disclosures';
import Bdi from '../Bdi';

interface CrisisResourceCardProps {
  variant?: 'full' | 'compact' | 'inline';
  filterType?: CrisisResource['type'];
  showAttorneyLinks?: boolean;
}

export default function CrisisResourceCard({
  variant = 'full',
  filterType,
  showAttorneyLinks = true,
}: CrisisResourceCardProps) {
  const { language, t } = useLanguage();
  const en = language === 'en';
  const isRtl = language === 'ar' || language === 'he';
  const resources = getCrisisResources(language, filterType);

  const label = (enStr: string, esStr: string, tKey?: string) => {
    if (isRtl && tKey) {
      const v = t(tKey);
      if (v && v !== tKey) return v;
    }
    return en ? enStr : esStr;
  };

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        <a
          href="tel:988"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Phone className="w-3 h-3" aria-hidden="true" />
          <Bdi>988</Bdi>
        </a>
        <a
          href="tel:1-800-799-7233"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Heart className="w-3 h-3" aria-hidden="true" />
          {label('DV Hotline', 'Linea de VD', 'crisisResources.dvHotline')}
        </a>
        <Link
          to="/emergency-resources"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-300 text-red-700 text-xs font-semibold rounded-lg"
        >
          {label('All Crisis Resources', 'Todos los Recursos de Crisis', 'crisisResources.title')}
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        <a
          href="tel:988"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          <Bdi>988</Bdi>
        </a>
        <a
          href="tel:1-800-799-7233"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Heart className="w-4 h-4" aria-hidden="true" />
          {label('DV Hotline', 'Linea de Violencia Domestica', 'crisisResources.dvHotline')}
        </a>
        <Link
          to="/emergency-resources"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors"
        >
          {label('All Resources', 'Todos los Recursos', 'crisisResources.title')}
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6" role="alert">
      <div className="flex items-start gap-3 mb-4">
        <Heart className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="font-bold text-red-900">
            {label('Your Safety Comes First', 'Tu Seguridad es lo Primero', 'crisisResources.title')}
          </h3>
          <p className="text-sm text-red-800 mt-1">
            {isRtl ? (
              <>
                {t('crisisResources.call911')} {t('crisisResources.call211')}
              </>
            ) : en
              ? <>If you or someone you know is in immediate danger, please contact emergency services (<Bdi>911</Bdi>) or one of these resources.</>
              : <>Si usted o alguien que conoce esta en peligro inmediato, contacte los servicios de emergencia (<Bdi>911</Bdi>) o uno de estos recursos.</>}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {resources.map((resource) => (
          <div key={resource.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
            <div>
              <div className="font-medium text-stone-900 text-sm">{resource.name}</div>
              <div className="flex items-center gap-1 text-red-700 text-sm font-semibold">
                <Phone className="w-3 h-3" aria-hidden="true" />
                <Bdi>{resource.phone}</Bdi>
              </div>
            </div>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
              aria-label={`${resource.name} (opens in new tab)`}
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        ))}
      </div>

      {showAttorneyLinks && (
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <Link
            to="/pro-bono"
            className="flex items-start gap-3 p-3 bg-white border border-red-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-sm font-semibold text-slate-900 group-hover:text-green-700">
                {label('Free Legal Aid', 'Ayuda Legal Gratuita', 'nav.freeChat')}
              </span>
            </div>
          </Link>
          <Link
            to="/find-attorney"
            className="flex items-start gap-3 p-3 bg-white border border-red-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <Scale className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                {label('Find an Attorney', 'Encontrar un Abogado', 'nav.findAttorney')}
              </span>
            </div>
          </Link>
        </div>
      )}

      <Link
        to="/emergency-resources"
        className="inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800"
      >
        {label('View all crisis resources', 'Ver todos los recursos de crisis', 'crisisResources.title')}
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
      </Link>
    </div>
  );
}

```

---

## src/components/shared/AttorneyServiceDisclosure.tsx

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ChevronDown, ChevronUp, Shield, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDisclosure } from '../../lib/legal-disclosures';

interface AttorneyServiceDisclosureProps {
  variant?: 'inline' | 'expandable' | 'compact';
  context?: 'directory' | 'matching' | 'issue-pack' | 'case-predictor' | 'dashboard' | 'general';
}

const CONTEXT_NOTE: Record<string, Record<string, string>> = {
  'issue-pack': {
    en: 'Issue Packs include informational attorney referrals. Referrals are not endorsements and do not guarantee representation.',
    es: 'Los Paquetes incluyen referencias informativas de abogados. No son recomendaciones ni garantizan representacion.',
  },
  'case-predictor': {
    en: 'Case Predictor provides statistical estimates, not attorney advice. Consult a licensed attorney before acting on predictions.',
    es: 'El Predictor de Casos proporciona estimaciones estadisticas, no consejo de abogado. Consulte un abogado antes de actuar.',
  },
  dashboard: {
    en: 'Attorney connections shown here are informational. Confirm engagement terms directly with any attorney.',
    es: 'Las conexiones con abogados son informativas. Confirme terminos directamente con cualquier abogado.',
  },
  directory: {
    en: 'This directory is for informational purposes. Listings are not endorsements by ezLegal.ai.',
    es: 'Este directorio es informativo. Los listados no son recomendaciones de ezLegal.ai.',
  },
  matching: {
    en: 'Matches are based on practice area, jurisdiction, and availability. No attorney pays for placement.',
    es: 'Los emparejamientos se basan en area de practica, jurisdicción y disponibilidad. Ningun abogado paga por aparecer.',
  },
  general: { en: '', es: '' },
};

export default function AttorneyServiceDisclosure({
  variant = 'inline',
  context = 'general',
}: AttorneyServiceDisclosureProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [expanded, setExpanded] = useState(false);

  const scopeText = getDisclosure('attorneyServiceScope', language);
  const noRelText = getDisclosure('attorneyNoRelationship', language);
  const feesText = getDisclosure('attorneyFeesSeparate', language);
  const geoText = getDisclosure('attorneyGeographicLimits', language);

  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-2 text-xs text-navy-500">
        <Scale className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <span>
          {noRelText}{' '}
          <Link to="/scope-disclaimers" className="underline text-teal-600 hover:text-teal-700">
            {en ? 'Full disclosures' : 'Divulgaciones completas'}
          </Link>
        </span>
      </div>
    );
  }

  if (variant === 'expandable') {
    return (
      <div className="border border-navy-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-navy-50 hover:bg-navy-100 transition-colors text-left"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-navy-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-navy-700">
              {en ? 'Attorney Service Disclosures' : 'Divulgaciones de Servicios de Abogados'}
            </span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-navy-400" /> : <ChevronDown className="w-4 h-4 text-navy-400" />}
        </button>
        {expanded && (
          <div className="p-4 space-y-3 text-sm text-navy-600">
            {CONTEXT_NOTE[context]?.[language] && (
              <p className="font-medium text-navy-700">{CONTEXT_NOTE[context][language]}</p>
            )}
            <p>{scopeText}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="bg-navy-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold text-navy-700 mb-1">{en ? 'Fees' : 'Honorarios'}</p>
                <p className="text-xs">{feesText}</p>
              </div>
              <div className="bg-navy-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold text-navy-700 mb-1">{en ? 'Coverage' : 'Cobertura'}</p>
                <p className="text-xs">{geoText}</p>
              </div>
            </div>
            <Link to="/scope-disclaimers" className="inline-block text-xs text-teal-600 hover:text-teal-700 underline">
              {en ? 'View full scope disclaimers' : 'Ver divulgaciones completas'}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="space-y-2">
          {CONTEXT_NOTE[context]?.[language] && (
            <p className="text-sm font-semibold text-amber-800">{CONTEXT_NOTE[context][language]}</p>
          )}
          <p className="text-sm text-amber-700">{scopeText}</p>
          <p className="text-xs text-amber-600">{feesText} {geoText}</p>
          <Link to="/scope-disclaimers" className="inline-block text-xs text-teal-600 hover:text-teal-700 underline">
            {en ? 'View full scope disclaimers' : 'Ver divulgaciones completas'}
          </Link>
        </div>
      </div>
    </div>
  );
}

```

---

## src/components/shared/UrgentHelpLink.tsx

```tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { track } from '../../lib/gtm-analytics';
import { trackEvent } from '../../services/analytics-service';
import { trackUrgentResourcesOpened } from '../EthicalAnalytics';

interface UrgentHelpLinkProps {
  variant?: 'strip' | 'inline' | 'button';
  source?: string;
}

export function UrgentHelpLink({
  variant = 'button',
  source = 'unknown',
}: UrgentHelpLinkProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  function handleClick() {
    trackUrgentResourcesOpened();
    track('urgent_resources_clicked', { source });
    trackEvent('urgent_resources_clicked', { source });
  }

  if (variant === 'inline') {
    return (
      <Link
        to="/urgent-resources"
        onClick={handleClick}
        className="text-rose-600 underline hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded"
      >
        {en ? 'urgent resources' : 'recursos urgentes'}
      </Link>
    );
  }

  return (
    <Link
      to="/urgent-resources"
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-full bg-rose-700 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-800 transition focus:outline-none focus:ring-2 focus:ring-rose-500 whitespace-nowrap no-underline"
    >
      {en ? 'Get help now' : 'Obtener ayuda ahora'}
      <ArrowRight className="w-3 h-3" aria-hidden="true" />
    </Link>
  );
}

```

---

## src/components/intake/GuidedIntakeShell.tsx

```tsx
import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ICP, TriageRiskLevel, HumanEscalationType } from '../../lib/intake/types';
import { SCOPE_DISCLAIMER } from '../../lib/intake/scopeBoundaries';
import ProgressStepper from './ProgressStepper';
import SaveAndResumeNotice from './SaveAndResumeNotice';
import EmergencyTriageNotice from './EmergencyTriageNotice';
import ScopeBoundaryCard from '../trust/ScopeBoundaryCard';

interface GuidedIntakeShellProps {
  children: ReactNode;
  icp: ICP;
  currentStep: number;
  totalSteps: number;
  stepLabels?: { en: string; es: string }[];
  showEmergency?: boolean;
  showSaveNotice?: boolean;
  showScopeBoundary?: boolean;
  onBack?: () => void;
  onSave?: () => void;
  onEscalate?: (type: HumanEscalationType, risk: TriageRiskLevel) => void;
  titleEn?: string;
  titleEs?: string;
}

export default function GuidedIntakeShell({
  children,
  icp: _icp,
  currentStep,
  totalSteps,
  stepLabels,
  showEmergency = false,
  showSaveNotice = true,
  showScopeBoundary = false,
  onBack,
  onSave,
  onEscalate: _onEscalate,
  titleEn,
  titleEs,
}: GuidedIntakeShellProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      {showEmergency && (
        <div className="mb-4">
          <EmergencyTriageNotice variant="banner" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          {onBack && currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
              aria-label={en ? 'Go back to previous step' : 'Volver al paso anterior'}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {en ? 'Back' : 'Atrás'}
            </button>
          )}

          <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} labels={stepLabels} />

          {(titleEn || titleEs) && (
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-4">
              {en ? titleEn : titleEs}
            </h2>
          )}
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>

        {showScopeBoundary && (
          <div className="px-5 pb-4 sm:px-6 sm:pb-5 border-t border-slate-100 pt-4">
            <ScopeBoundaryCard variant="compact" />
          </div>
        )}

        {showSaveNotice && (
          <div className="px-5 pb-4 sm:px-6 sm:pb-5 border-t border-slate-100 pt-3 flex items-center justify-between">
            <SaveAndResumeNotice variant="inline" />
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
              >
                {en ? 'Save progress' : 'Guardar progreso'}
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500 text-center max-w-md mx-auto">
        {en ? SCOPE_DISCLAIMER.en : SCOPE_DISCLAIMER.es}
      </p>
    </div>
  );
}

```

---

## src/components/intake/IndividualIntake.tsx

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Briefcase, FileWarning, Globe, Shield, ArrowRight, ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEngagement, trackFunnelEvent } from '../../services/engagement-service';

type Category = 'housing' | 'family' | 'employment' | 'debt' | 'immigration' | 'criminal';
type Urgency = 'immediate' | 'upcoming' | 'planning';

const CATEGORIES = [
  { id: 'housing' as Category, icon: Home, color: 'sky', enLabel: 'Housing / Landlord', esLabel: 'Vivienda / Arrendador' },
  { id: 'family' as Category, icon: Users, color: 'rose', enLabel: 'Family Law', esLabel: 'Derecho Familiar' },
  { id: 'employment' as Category, icon: Briefcase, color: 'emerald', enLabel: 'Employment / Workplace', esLabel: 'Empleo / Trabajo' },
  { id: 'debt' as Category, icon: FileWarning, color: 'teal', enLabel: 'Debt / Collections', esLabel: 'Deudas / Cobros' },
  { id: 'immigration' as Category, icon: Globe, color: 'amber', enLabel: 'Immigration', esLabel: 'Inmigración' },
  { id: 'criminal' as Category, icon: Shield, color: 'slate', enLabel: 'Criminal / Traffic', esLabel: 'Penal / Tránsito' },
];

const URGENCY_OPTIONS = [
  { id: 'immediate' as Urgency, enLabel: 'Urgent (happening now or within days)', esLabel: 'Urgente (sucediendo ahora o en días)', color: 'red' },
  { id: 'upcoming' as Urgency, enLabel: 'Soon (within weeks)', esLabel: 'Pronto (en semanas)', color: 'amber' },
  { id: 'planning' as Urgency, enLabel: 'Planning ahead', esLabel: 'Planificando', color: 'green' },
];

export default function IndividualIntake() {
  const [step, setStep] = useState<'category' | 'urgency' | 'details'>('category');
  const [category, setCategory] = useState<Category | null>(null);
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'view',
      metadata: { persona: 'individual', step }
    });
  }, [step]);

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'individual', step: 'category', selection: cat }
    });
    setStep('urgency');
  };

  const handleUrgencySelect = (urg: Urgency) => {
    setUrgency(urg);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'individual', step: 'urgency', selection: urg }
    });
    setStep('details');
  };

  const handleContinue = () => {
    trackFunnelEvent('persona_intake_completed', {
      persona: 'individual',
      category,
      urgency
    });
    try {
      sessionStorage.setItem('ez_intake_data', JSON.stringify({
        persona: 'individual',
        category,
        urgency,
        timestamp: new Date().toISOString()
      }));
    } catch {
      // sessionStorage disabled
    }
    navigate(`/ask/${category}`);
  };

  const handleBack = () => {
    if (step === 'urgency') {
      setStep('category');
      setUrgency(null);
    } else if (step === 'details') {
      setStep('urgency');
    }
  };

  if (step === 'category') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 1 of 3' : 'Paso 1 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'What type of legal issue do you have?' : '¿Qué tipo de problema legal tienes?'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'Choose the category that best matches your situation'
                : 'Elige la categoría que mejor se ajuste a tu situación'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">
                  {language === 'en' ? 'Private by default • Legal information, not legal advice' : 'Privado por defecto • Información legal, no asesoría legal'}
                </p>
                <p className="text-navy-300 text-xs mt-1">
                  {language === 'en'
                    ? 'We help you understand your options and next steps. No attorney-client relationship is created.'
                    : 'Te ayudamos a entender tus opciones y próximos pasos. No se crea relación abogado-cliente.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-teal-500/50 rounded-2xl p-6 text-left transition-all group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${cat.color}-500/20 mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className={`w-6 h-6 text-${cat.color}-400`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">
                  {language === 'en' ? cat.enLabel : cat.esLabel}
                </h3>
                <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-teal-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'urgency') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 2 of 3' : 'Paso 2 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'How urgent is this issue?' : '¿Qué tan urgente es este problema?'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'This helps us prioritize what information you need first'
                : 'Esto nos ayuda a priorizar qué información necesitas primero'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleUrgencySelect(opt.id)}
                className={`w-full bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-${opt.color}-500/50 rounded-2xl p-6 text-left transition-all group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-${opt.color}-500`}></div>
                    <span className="text-white font-semibold text-lg">
                      {language === 'en' ? opt.enLabel : opt.esLabel}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-teal-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back to categories' : 'Volver a categorías'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'details') {
    const selectedCategory = CATEGORIES.find(c => c.id === category);
    const selectedUrgency = URGENCY_OPTIONS.find(u => u.id === urgency);

    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 3 of 3' : 'Paso 3 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'Great, we understand your situation' : 'Perfecto, entendemos tu situación'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'Ready to get specific answers to your questions'
                : 'Listo para obtener respuestas específicas a tus preguntas'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-teal-400" />
              <h3 className="text-white font-semibold">
                {language === 'en' ? 'Your situation summary:' : 'Resumen de tu situación:'}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {selectedCategory && <selectedCategory.icon className={`w-5 h-5 text-${selectedCategory.color}-400`} />}
                <span className="text-navy-100">
                  {language === 'en' ? selectedCategory?.enLabel : selectedCategory?.esLabel}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${selectedUrgency?.color}-500`}></div>
                <span className="text-navy-100">
                  {language === 'en' ? selectedUrgency?.enLabel : selectedUrgency?.esLabel}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl mb-4"
          >
            {language === 'en' ? 'Continue to Questions' : 'Continuar a Preguntas'}
          </button>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back' : 'Atrás'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

```

---

## src/components/intake/BusinessIntake.tsx

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Scale, Users, Shield, Briefcase, AlertTriangle, ArrowRight, ArrowLeft, Clock, Building2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEngagement, trackFunnelEvent } from '../../services/engagement-service';

type BusinessContext = 'contract' | 'dispute' | 'employment' | 'compliance' | 'formation' | 'other';
type Timeline = 'active-deadline' | 'planning' | 'ongoing';

const BUSINESS_CONTEXTS = [
  { id: 'contract' as BusinessContext, icon: FileText, color: 'blue', enLabel: 'Contract Review / Drafting', esLabel: 'Revisión / Redacción de Contratos' },
  { id: 'dispute' as BusinessContext, icon: Scale, color: 'red', enLabel: 'Business Dispute', esLabel: 'Disputa Comercial' },
  { id: 'employment' as BusinessContext, icon: Users, color: 'emerald', enLabel: 'Employment / HR Issue', esLabel: 'Problema de Empleo / RR.HH.' },
  { id: 'compliance' as BusinessContext, icon: Shield, color: 'amber', enLabel: 'Compliance / Regulations', esLabel: 'Cumplimiento / Regulaciones' },
  { id: 'formation' as BusinessContext, icon: Building2, color: 'teal', enLabel: 'Business Formation / Structure', esLabel: 'Formación / Estructura Empresarial' },
  { id: 'other' as BusinessContext, icon: Briefcase, color: 'slate', enLabel: 'Other Business Matter', esLabel: 'Otro Asunto Comercial' },
];

const TIMELINE_OPTIONS = [
  { id: 'active-deadline' as Timeline, enLabel: 'I have a deadline or notice', esLabel: 'Tengo un plazo o aviso', color: 'red', enDesc: 'Court date, contract deadline, or regulatory notice', esDesc: 'Fecha de corte, plazo contractual o aviso regulatorio' },
  { id: 'ongoing' as Timeline, enLabel: 'Ongoing issue that needs attention', esLabel: 'Problema en curso que necesita atención', color: 'amber', enDesc: 'Active dispute, employee matter, or vendor problem', esDesc: 'Disputa activa, asunto de empleado o problema con proveedor' },
  { id: 'planning' as Timeline, enLabel: 'Planning / preventative', esLabel: 'Planificación / preventivo', color: 'green', enDesc: 'Setting up policies, reviewing agreements, or planning ahead', esDesc: 'Estableciendo políticas, revisando acuerdos o planificando' },
];

export default function BusinessIntake() {
  const [step, setStep] = useState<'context' | 'timeline' | 'summary'>('context');
  const [context, setContext] = useState<BusinessContext | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'view',
      metadata: { persona: 'business', step }
    });
  }, [step]);

  const handleContextSelect = (ctx: BusinessContext) => {
    setContext(ctx);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'business', step: 'context', selection: ctx }
    });
    setStep('timeline');
  };

  const handleTimelineSelect = (tl: Timeline) => {
    setTimeline(tl);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'business', step: 'timeline', selection: tl }
    });
    setStep('summary');
  };

  const handleContinue = () => {
    trackFunnelEvent('persona_intake_completed', {
      persona: 'business',
      context,
      timeline
    });
    try {
      sessionStorage.setItem('ez_intake_data', JSON.stringify({
        persona: 'business',
        context,
        timeline,
        timestamp: new Date().toISOString()
      }));
    } catch {
      // sessionStorage disabled
    }
    navigate('/chat');
  };

  const handleBack = () => {
    if (step === 'timeline') {
      setStep('context');
      setTimeline(null);
    } else if (step === 'summary') {
      setStep('timeline');
    }
  };

  if (step === 'context') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 1 of 3' : 'Paso 1 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'What type of business need is this?' : '¿Qué tipo de necesidad comercial es esta?'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'Select the category that best describes your business matter'
                : 'Selecciona la categoría que mejor describa tu asunto comercial'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">
                  {language === 'en' ? 'Confidential • Business guidance only • Not legal advice' : 'Confidencial • Solo orientación comercial • No es asesoramiento legal'}
                </p>
                <p className="text-navy-300 text-xs mt-1">
                  {language === 'en'
                    ? 'We help you understand your options and connect with the right legal resources.'
                    : 'Te ayudamos a entender tus opciones y conectarte con los recursos legales adecuados.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {BUSINESS_CONTEXTS.map((ctx) => (
              <button
                key={ctx.id}
                onClick={() => handleContextSelect(ctx.id)}
                className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-blue-500/50 rounded-2xl p-6 text-left transition-all group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${ctx.color}-500/20 mb-4 group-hover:scale-110 transition-transform`}>
                  <ctx.icon className={`w-6 h-6 text-${ctx.color}-400`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">
                  {language === 'en' ? ctx.enLabel : ctx.esLabel}
                </h3>
                <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-blue-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'timeline') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 2 of 3' : 'Paso 2 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'What is your timeline?' : '¿Cuál es tu cronograma?'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'This helps us prioritize the most relevant guidance for your business'
                : 'Esto nos ayuda a priorizar la orientación más relevante para tu negocio'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {TIMELINE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleTimelineSelect(opt.id)}
                className={`w-full bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-${opt.color}-500/50 rounded-2xl p-6 text-left transition-all group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${opt.color}-500 mt-1`}></div>
                    <div>
                      <span className="text-white font-semibold text-lg block mb-1">
                        {language === 'en' ? opt.enLabel : opt.esLabel}
                      </span>
                      <span className="text-navy-300 text-sm">
                        {language === 'en' ? opt.enDesc : opt.esDesc}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back to categories' : 'Volver a categorías'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    const selectedContext = BUSINESS_CONTEXTS.find(c => c.id === context);
    const selectedTimeline = TIMELINE_OPTIONS.find(t => t.id === timeline);

    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 3 of 3' : 'Paso 3 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'Ready to get business guidance' : 'Listo para obtener orientación comercial'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? "We'll help you understand your options and next steps"
                : 'Te ayudaremos a entender tus opciones y próximos pasos'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">
                {language === 'en' ? 'Your business matter:' : 'Tu asunto comercial:'}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {selectedContext && <selectedContext.icon className={`w-5 h-5 text-${selectedContext.color}-400`} />}
                <span className="text-navy-100">
                  {language === 'en' ? selectedContext?.enLabel : selectedContext?.esLabel}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${selectedTimeline?.color}-500`}></div>
                <span className="text-navy-100">
                  {language === 'en' ? selectedTimeline?.enLabel : selectedTimeline?.esLabel}
                </span>
              </div>
            </div>
          </div>

          {timeline === 'active-deadline' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-200 font-medium text-sm mb-1">
                    {language === 'en' ? 'Time-sensitive matter detected' : 'Asunto urgente detectado'}
                  </p>
                  <p className="text-red-300/80 text-xs">
                    {language === 'en'
                      ? 'Consider consulting with a business attorney if you have an active deadline or notice.'
                      : 'Considera consultar con un abogado comercial si tienes un plazo activo o aviso.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl mb-4"
          >
            {language === 'en' ? 'Start Business Chat' : 'Iniciar Chat Comercial'}
          </button>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back' : 'Atrás'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

```

---

## src/components/intake/LegalAidIntake.tsx

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Layers, User, UserCheck, ArrowRight, ArrowLeft, Clock, Shield, Scale } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEngagement, trackFunnelEvent } from '../../services/engagement-service';

type WorkflowMode = 'individual-client' | 'bulk-triage' | 'self-help-support' | 'staff-assisted';
type Scale = 'low' | 'medium' | 'high' | 'very-high';

const WORKFLOW_MODES = [
  {
    id: 'individual-client' as WorkflowMode,
    icon: User,
    color: 'teal',
    enLabel: 'Individual Client Intake',
    esLabel: 'Ingreso de Cliente Individual',
    enDesc: 'One-on-one intake for a single client matter',
    esDesc: 'Ingreso individual para un caso de un solo cliente'
  },
  {
    id: 'bulk-triage' as WorkflowMode,
    icon: Layers,
    color: 'blue',
    enLabel: 'Group / Bulk Triage',
    esLabel: 'Clasificación Grupal / Masiva',
    enDesc: 'Process multiple clients or intake forms at once',
    esDesc: 'Procesar múltiples clientes o formularios de ingreso a la vez'
  },
  {
    id: 'self-help-support' as WorkflowMode,
    icon: Users,
    color: 'amber',
    enLabel: 'Self-Help / Clinic Support',
    esLabel: 'Apoyo de Autoayuda / Clínica',
    enDesc: 'Tools for walk-in clinics or self-help centers',
    esDesc: 'Herramientas para clínicas sin cita o centros de autoayuda'
  },
  {
    id: 'staff-assisted' as WorkflowMode,
    icon: UserCheck,
    color: 'emerald',
    enLabel: 'Staff-Assisted Workflow',
    esLabel: 'Flujo Asistido por Personal',
    enDesc: 'Intake with staff oversight and review',
    esDesc: 'Ingreso con supervisión y revisión del personal'
  },
];

const SCALE_OPTIONS = [
  {
    id: 'low' as Scale,
    enLabel: '1-10 matters per week',
    esLabel: '1-10 casos por semana',
    color: 'green'
  },
  {
    id: 'medium' as Scale,
    enLabel: '10-50 matters per week',
    esLabel: '10-50 casos por semana',
    color: 'blue'
  },
  {
    id: 'high' as Scale,
    enLabel: '50-100 matters per week',
    esLabel: '50-100 casos por semana',
    color: 'amber'
  },
  {
    id: 'very-high' as Scale,
    enLabel: '100+ matters per week',
    esLabel: '100+ casos por semana',
    color: 'red'
  },
];

export default function LegalAidIntake() {
  const [step, setStep] = useState<'workflow' | 'scale' | 'summary'>('workflow');
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode | null>(null);
  const [scale, setScale] = useState<Scale | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'view',
      metadata: { persona: 'legal-aid', step }
    });
  }, [step]);

  const handleWorkflowSelect = (mode: WorkflowMode) => {
    setWorkflowMode(mode);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'legal-aid', step: 'workflow', selection: mode }
    });
    setStep('scale');
  };

  const handleScaleSelect = (scaleValue: Scale) => {
    setScale(scaleValue);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'legal-aid', step: 'scale', selection: scaleValue }
    });
    setStep('summary');
  };

  const handleContinue = () => {
    trackFunnelEvent('persona_intake_completed', {
      persona: 'legal-aid',
      workflowMode,
      scale
    });
    try {
      sessionStorage.setItem('ez_intake_data', JSON.stringify({
        persona: 'legal-aid',
        workflowMode,
        scale,
        timestamp: new Date().toISOString()
      }));
    } catch {
      // sessionStorage disabled
    }

    if (workflowMode === 'individual-client') {
      navigate('/pro-bono-intake');
    } else {
      navigate('/partner-hub');
    }
  };

  const handleBack = () => {
    if (step === 'scale') {
      setStep('workflow');
      setScale(null);
    } else if (step === 'summary') {
      setStep('scale');
    }
  };

  if (step === 'workflow') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 1 of 3' : 'Paso 1 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'Select your workflow mode' : 'Selecciona tu modo de flujo de trabajo'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'Choose the workflow that best fits how you serve clients'
                : 'Elige el flujo de trabajo que mejor se adapte a cómo sirves a los clientes'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">
                  {language === 'en'
                    ? 'Designed for ethical access to justice • Compliant with LSO guidelines'
                    : 'Diseñado para acceso ético a la justicia • Cumple con las pautas de LSO'}
                </p>
                <p className="text-navy-300 text-xs mt-1">
                  {language === 'en'
                    ? 'Built specifically for legal aid organizations, pro bono programs, and access to justice initiatives.'
                    : 'Construido específicamente para organizaciones de asistencia legal, programas pro bono e iniciativas de acceso a la justicia.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {WORKFLOW_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleWorkflowSelect(mode.id)}
                className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 text-left transition-all group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${mode.color}-500/20 mb-4 group-hover:scale-110 transition-transform`}>
                  <mode.icon className={`w-6 h-6 text-${mode.color}-400`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {language === 'en' ? mode.enLabel : mode.esLabel}
                </h3>
                <p className="text-navy-300 text-sm mb-3">
                  {language === 'en' ? mode.enDesc : mode.esDesc}
                </p>
                <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'scale') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 2 of 3' : 'Paso 2 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'What is your typical volume?' : '¿Cuál es tu volumen típico?'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'This helps us optimize the workflow for your organization'
                : 'Esto nos ayuda a optimizar el flujo de trabajo para tu organización'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {SCALE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleScaleSelect(opt.id)}
                className={`w-full bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-${opt.color}-500/50 rounded-2xl p-6 text-left transition-all group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-${opt.color}-500`}></div>
                    <span className="text-white font-semibold text-lg">
                      {language === 'en' ? opt.enLabel : opt.esLabel}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-emerald-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back to workflow modes' : 'Volver a modos de flujo de trabajo'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    const selectedWorkflow = WORKFLOW_MODES.find(w => w.id === workflowMode);
    const selectedScale = SCALE_OPTIONS.find(s => s.id === scale);

    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 3 of 3' : 'Paso 3 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'Workflow configured' : 'Flujo de trabajo configurado'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'Ready to start processing client matters efficiently'
                : 'Listo para empezar a procesar casos de clientes eficientemente'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white font-semibold">
                {language === 'en' ? 'Your configuration:' : 'Tu configuración:'}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {selectedWorkflow && <selectedWorkflow.icon className={`w-5 h-5 text-${selectedWorkflow.color}-400`} />}
                <span className="text-navy-100">
                  {language === 'en' ? selectedWorkflow?.enLabel : selectedWorkflow?.esLabel}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${selectedScale?.color}-500`}></div>
                <span className="text-navy-100">
                  {language === 'en' ? selectedScale?.enLabel : selectedScale?.esLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-200 font-medium text-sm mb-1">
                  {language === 'en' ? 'Access to justice focused' : 'Enfocado en acceso a la justicia'}
                </p>
                <p className="text-emerald-300/80 text-xs">
                  {language === 'en'
                    ? 'All outputs include oversight flags, ethical disclosures, and are designed for attorney review.'
                    : 'Todas las salidas incluyen marcadores de supervisión, divulgaciones éticas y están diseñadas para revisión de abogados.'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl mb-4"
          >
            {language === 'en'
              ? (workflowMode === 'individual-client' ? 'Start Client Intake' : 'Go to Partner Hub')
              : (workflowMode === 'individual-client' ? 'Iniciar Ingreso de Cliente' : 'Ir al Centro de Socios')}
          </button>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back' : 'Atrás'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

```

---

## src/components/intake/EmergencyTriageNotice.tsx

```tsx
import { AlertTriangle, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmergencyTriageNoticeProps {
  variant?: 'banner' | 'card';
  showDVHotline?: boolean;
  showLegalAid?: boolean;
}

export default function EmergencyTriageNotice({ variant = 'banner', showDVHotline = true, showLegalAid = true }: EmergencyTriageNoticeProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  if (variant === 'card') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5" role="alert">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-2">
              {en ? 'Are you in immediate danger?' : 'Estás en peligro inmediato?'}
            </h3>
            <p className="text-sm text-red-800 mb-4">
              {en
                ? 'If you are in danger, call 911. If you need help with domestic violence or a legal emergency, these resources are free and confidential.'
                : 'Si estás en peligro, llama al 911. Si necesitas ayuda con violencia doméstica o una emergencia legal, estos recursos son gratuitos y confidenciales.'}
            </p>
            <div className="space-y-2">
              {showDVHotline && (
                <a
                  href="tel:18007997233"
                  className="flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-900"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {en ? 'National DV Hotline: 1-800-799-7233' : 'Línea Nacional de VD: 1-800-799-7233'}
                </a>
              )}
              {showLegalAid && (
                <Link
                  to="/emergency-resources"
                  className="flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-900"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  {en ? 'View emergency resources' : 'Ver recursos de emergencia'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-r-lg" role="alert">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
        <p className="text-sm text-red-800 font-medium">
          {en ? 'In danger? Call 911.' : 'En peligro? Llama al 911.'}
          {' '}
          <Link to="/emergency-resources" className="underline hover:text-red-900">
            {en ? 'Free help available' : 'Ayuda gratuita disponible'}
          </Link>
        </p>
      </div>
    </div>
  );
}

```

---

## src/components/intake/ProgressStepper.tsx

```tsx
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  labels?: { en: string; es: string }[];
}

export default function ProgressStepper({ currentStep, totalSteps, labels }: ProgressStepperProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="w-full mb-6" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={en ? `Step ${currentStep} of ${totalSteps}` : `Paso ${currentStep} de ${totalSteps}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">
          {en ? `Step ${currentStep} of ${totalSteps}` : `Paso ${currentStep} de ${totalSteps}`}
        </span>
        <span className="text-sm text-slate-500">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < currentStep ? 'bg-teal-600' : i === currentStep ? 'bg-teal-300' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      {labels && labels[currentStep - 1] && (
        <p className="text-sm text-slate-600 mt-2 font-medium">
          {en ? labels[currentStep - 1].en : labels[currentStep - 1].es}
        </p>
      )}
    </div>
  );
}

export function StepIndicator({ step, total, completed }: { step: number; total: number; completed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {completed ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-teal-600 flex items-center justify-center">
          <span className="text-xs font-bold text-teal-600">{step}</span>
        </div>
      )}
      <span className="text-xs text-slate-500">{step}/{total}</span>
    </div>
  );
}

```

---

