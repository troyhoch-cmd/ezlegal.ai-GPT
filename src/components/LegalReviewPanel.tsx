import { Shield, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { bl } from '../lib/i18n';
import {
  contentRegistry,
  getContentNeedingReview,
  type LegalContentEntry,
  type ReviewStatus,
} from '../data/legalContentStatus';
import { LegalReviewBadge } from './LegalReviewBadge';

interface LegalReviewPanelProps {
  filterStatus?: ReviewStatus;
  showAllStatuses?: boolean;
}

export function LegalReviewPanel({ filterStatus, showAllStatuses = false }: LegalReviewPanelProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const entries: LegalContentEntry[] = filterStatus
    ? contentRegistry.filter((e) => e.currentStatus === filterStatus)
    : showAllStatuses
      ? contentRegistry
      : getContentNeedingReview();

  const needsAttentionCount = getContentNeedingReview().length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-600" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-800">
            {en ? 'Legal content review status' : 'Estado de revisión de contenido legal'}
          </h3>
        </div>
        {needsAttentionCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-semibold">
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            {needsAttentionCount} {en ? 'need attention' : 'necesitan atención'}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-slate-500">
          {en ? 'All content is up to date.' : 'Todo el contenido está actualizado.'}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <li key={entry.id} className="px-5 py-4 hover:bg-slate-25 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {bl(entry.title, language)}
                    </p>
                    <LegalReviewBadge status={entry.currentStatus} compact />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {bl(entry.description, language)}
                  </p>
                  {entry.flaggedIssues.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {entry.flaggedIssues.map((issue, i) => (
                        <p key={i} className="flex items-start gap-1 text-xs text-amber-700">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          {issue}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {entry.jurisdictions.map((j) => (
                    <span
                      key={j}
                      className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {j}
                    </span>
                  ))}
                  {entry.lastReviewedAt && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                      {entry.lastReviewedAt}
                    </span>
                  )}
                  {entry.sourceUrl && (
                    <a
                      href={entry.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-[10px] text-teal-600 hover:text-teal-800 mt-1"
                    >
                      <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                      {en ? 'Source' : 'Fuente'}
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {en
            ? 'Content review status is for internal governance only. Items marked "Pending review" have not yet been verified by qualified reviewers.'
            : 'El estado de revisión de contenido es solo para gobernanza interna. Los elementos marcados como "Pendiente de revisión" aún no han sido verificados por revisores calificados.'}
        </p>
      </div>
    </section>
  );
}
