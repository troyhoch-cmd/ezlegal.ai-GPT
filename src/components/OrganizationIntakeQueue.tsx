import { Clock, FileText, AlertTriangle, Users, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface QueueItem {
  id: string;
  issueType: { en: string; es: string };
  urgency: 'high' | 'medium' | 'low';
  state: string;
  language: string;
  timestamp: string;
}

const DEMO_ITEMS: QueueItem[] = [
  { id: 'demo-1', issueType: { en: 'Eviction — 5 days to respond', es: 'Desalojo — 5 días para responder' }, urgency: 'high', state: 'AZ', language: 'es', timestamp: '2 hours ago' },
  { id: 'demo-2', issueType: { en: 'Custody modification request', es: 'Solicitud de modificación de custodia' }, urgency: 'medium', state: 'AZ', language: 'en', timestamp: '4 hours ago' },
  { id: 'demo-3', issueType: { en: 'Wage theft — employer non-payment', es: 'Robo de salario — falta de pago del empleador' }, urgency: 'medium', state: 'CA', language: 'es', timestamp: '6 hours ago' },
  { id: 'demo-4', issueType: { en: 'Immigration — DACA renewal question', es: 'Inmigración — pregunta de renovación de DACA' }, urgency: 'low', state: 'TX', language: 'es', timestamp: '1 day ago' },
];

const urgencyStyles = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-600',
};

const urgencyLabels = {
  high: { en: 'Urgent', es: 'Urgente' },
  medium: { en: 'Medium', es: 'Media' },
  low: { en: 'Low', es: 'Baja' },
};

export default function OrganizationIntakeQueue() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden" role="region" aria-labelledby="intake-queue-title">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <h3 id="intake-queue-title" className="font-semibold text-slate-900 text-sm">
            {en ? 'Intake queue' : 'Cola de admisión'}
          </h3>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
          <AlertTriangle className="w-3 h-3" aria-hidden="true" />
          {en ? 'Demo' : 'Demostración'}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {DEMO_ITEMS.map((item) => (
          <div key={item.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">
                {en ? item.issueType.en : item.issueType.es}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${urgencyStyles[item.urgency]}`}>
                  {item.urgency === 'high' && <Clock className="w-2.5 h-2.5" aria-hidden="true" />}
                  {en ? urgencyLabels[item.urgency].en : urgencyLabels[item.urgency].es}
                </span>
                <span className="text-[10px] text-slate-400">{item.state}</span>
                <span className="text-[10px] text-slate-400">{item.language.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-slate-400">{item.timestamp}</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-medium text-teal-700 hover:bg-teal-100 transition focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label={en ? `Review ${item.issueType.en}` : `Revisar ${item.issueType.es}`}
              >
                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                {en ? 'Review' : 'Revisar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-500">
          {en
            ? 'This is a demonstration of the intake queue interface. In production, items appear when clients complete intake with referral consent.'
            : 'Esta es una demostración de la interfaz de cola de admisión. En producción, los elementos aparecen cuando los clientes completan la admisión con consentimiento de referencia.'}
        </p>
      </div>
    </div>
  );
}
