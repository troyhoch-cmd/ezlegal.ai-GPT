import { Eye, Clock, Shield, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConsentRecord {
  id: string;
  action: string;
  timestamp: string;
  dataScope: string;
  recipientOrg: string;
}

interface ConsentLogPreviewProps {
  records?: ConsentRecord[];
  isDemo?: boolean;
}

const demoRecords: ConsentRecord[] = [
  {
    id: '1',
    action: 'Consent granted for referral',
    timestamp: '2026-05-28 14:32 UTC',
    dataScope: 'Issue summary, urgency level, jurisdiction, preferred language',
    recipientOrg: 'Arizona Legal Aid Society',
  },
  {
    id: '2',
    action: 'Referral packet generated',
    timestamp: '2026-05-28 14:33 UTC',
    dataScope: 'De-identified case summary',
    recipientOrg: 'Arizona Legal Aid Society',
  },
  {
    id: '3',
    action: 'Referral submitted to partner',
    timestamp: '2026-05-28 14:35 UTC',
    dataScope: 'Encrypted referral packet',
    recipientOrg: 'Arizona Legal Aid Society',
  },
];

export function ConsentLogPreview({ records, isDemo = true }: ConsentLogPreviewProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const items = records || demoRecords;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span className="text-[11px] text-amber-700 font-medium">
            {en ? 'Demo — example consent log' : 'Demo — registro de consentimiento de ejemplo'}
          </span>
        </div>
      )}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Shield className="w-4 h-4 text-slate-500" aria-hidden="true" />
        <h4 className="text-xs font-semibold text-slate-700">
          {en ? 'Consent audit trail' : 'Registro de auditoría de consentimiento'}
        </h4>
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((record) => (
          <li key={record.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800">{record.action}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                    {record.timestamp}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Eye className="w-2.5 h-2.5" aria-hidden="true" />
                    {record.recipientOrg}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {en ? 'Scope:' : 'Alcance:'} {record.dataScope}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-2">
        <p className="text-[10px] text-slate-500">
          {en
            ? 'No user data is shared without explicit, revocable consent.'
            : 'No se comparten datos del usuario sin consentimiento explícito y revocable.'}
        </p>
      </div>
    </div>
  );
}
