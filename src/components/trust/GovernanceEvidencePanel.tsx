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
