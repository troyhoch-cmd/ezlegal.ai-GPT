import { CheckCircle, Clock, FileText, Send, UserCheck, XCircle, Archive, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { bl } from '../lib/i18n';

export type ReferralStatus =
  | 'draft'
  | 'consent-obtained'
  | 'submitted'
  | 'acknowledged'
  | 'in-review'
  | 'accepted'
  | 'declined'
  | 'closed';

interface TimelineStep {
  status: ReferralStatus;
  label: { en: string; es: string };
  timestamp: string | null;
  icon: typeof CheckCircle;
}

interface ReferralStatusTimelineProps {
  currentStatus: ReferralStatus;
  timestamps?: Partial<Record<ReferralStatus, string>>;
  isDemo?: boolean;
}

const statusOrder: ReferralStatus[] = [
  'draft',
  'consent-obtained',
  'submitted',
  'acknowledged',
  'in-review',
  'accepted',
  'declined',
  'closed',
];

const statusLabels: Record<ReferralStatus, { en: string; es: string }> = {
  draft: { en: 'Draft created', es: 'Borrador creado' },
  'consent-obtained': { en: 'Consent obtained', es: 'Consentimiento obtenido' },
  submitted: { en: 'Submitted to partner', es: 'Enviado al socio' },
  acknowledged: { en: 'Acknowledged by partner', es: 'Confirmado por el socio' },
  'in-review': { en: 'Under review', es: 'En revisión' },
  accepted: { en: 'Accepted', es: 'Aceptado' },
  declined: { en: 'Declined', es: 'Rechazado' },
  closed: { en: 'Closed', es: 'Cerrado' },
};

const statusIcons: Record<ReferralStatus, typeof CheckCircle> = {
  draft: FileText,
  'consent-obtained': UserCheck,
  submitted: Send,
  acknowledged: Clock,
  'in-review': Clock,
  accepted: CheckCircle,
  declined: XCircle,
  closed: Archive,
};

export function ReferralStatusTimeline({
  currentStatus,
  timestamps = {},
  isDemo = true,
}: ReferralStatusTimelineProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const currentIdx = statusOrder.indexOf(currentStatus);

  const relevantStatuses = statusOrder.filter((s) => {
    const idx = statusOrder.indexOf(s);
    if (s === 'declined' && currentStatus !== 'declined') return false;
    if (s === 'closed' && currentStatus !== 'closed') return false;
    return idx <= currentIdx || idx === currentIdx + 1;
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      {isDemo && (
        <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-2 py-1 mb-3 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" aria-hidden="true" />
          {en ? 'Demo — example referral timeline' : 'Demo — línea de tiempo de referencia de ejemplo'}
        </p>
      )}
      <h4 className="text-xs font-semibold text-slate-700 mb-3">
        {en ? 'Referral status' : 'Estado de referencia'}
      </h4>
      <ol className="space-y-0">
        {relevantStatuses.map((status, i) => {
          const idx = statusOrder.indexOf(status);
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture = idx > currentIdx;
          const Icon = statusIcons[status];
          const label = bl(statusLabels[status], language);
          const ts = timestamps[status] || null;

          return (
            <li key={status} className="relative flex items-start gap-3 pb-4 last:pb-0">
              {i < relevantStatuses.length - 1 && (
                <span
                  className={`absolute left-[11px] top-6 w-0.5 h-full ${
                    isComplete ? 'bg-teal-300' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${
                  isComplete
                    ? 'bg-teal-100 text-teal-700'
                    : isCurrent
                      ? 'bg-teal-600 text-white ring-2 ring-teal-200'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className={`text-xs font-medium ${
                    isCurrent ? 'text-teal-800' : isComplete ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {label}
                  {isCurrent && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-semibold text-teal-700">
                      {en ? 'Current' : 'Actual'}
                    </span>
                  )}
                </p>
                {ts && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{ts}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
