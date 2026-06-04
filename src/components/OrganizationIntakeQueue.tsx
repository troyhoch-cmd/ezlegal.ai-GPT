import { useState, useMemo } from 'react';
import { Clock, AlertTriangle, Users, CheckCircle, Filter, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type Status = 'needs_review' | 'pending' | 'accepted';
type Urgency = 'high' | 'medium' | 'low';

interface QueueItem {
  id: string;
  issueType: { en: string; es: string };
  urgency: Urgency;
  status: Status;
  state: string;
  language: string;
  timestamp: string;
}

const DEMO_ITEMS: QueueItem[] = [
  { id: 'demo-1', issueType: { en: 'Eviction — 5 days to respond', es: 'Desalojo — 5 días para responder' }, urgency: 'high', status: 'needs_review', state: 'AZ', language: 'es', timestamp: '2 hours ago' },
  { id: 'demo-2', issueType: { en: 'Custody modification request', es: 'Solicitud de modificación de custodia' }, urgency: 'medium', status: 'pending', state: 'AZ', language: 'en', timestamp: '4 hours ago' },
  { id: 'demo-3', issueType: { en: 'Wage theft — employer non-payment', es: 'Robo de salario — falta de pago del empleador' }, urgency: 'medium', status: 'accepted', state: 'CA', language: 'es', timestamp: '6 hours ago' },
  { id: 'demo-4', issueType: { en: 'Immigration — DACA renewal question', es: 'Inmigración — pregunta de renovación de DACA' }, urgency: 'low', status: 'needs_review', state: 'TX', language: 'es', timestamp: '1 day ago' },
  { id: 'demo-5', issueType: { en: 'Domestic violence protective order', es: 'Orden de protección por violencia doméstica' }, urgency: 'high', status: 'pending', state: 'AZ', language: 'en', timestamp: '3 hours ago' },
];

const urgencyStyles: Record<Urgency, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-600',
};

const urgencyLabels: Record<Urgency, { en: string; es: string }> = {
  high: { en: 'Urgent', es: 'Urgente' },
  medium: { en: 'Medium', es: 'Media' },
  low: { en: 'Low', es: 'Baja' },
};

const statusStyles: Record<Status, string> = {
  needs_review: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
};

const statusLabels: Record<Status, { en: string; es: string }> = {
  needs_review: { en: 'Needs Review', es: 'Requiere Revision' },
  pending: { en: 'Pending', es: 'Pendiente' },
  accepted: { en: 'Accepted', es: 'Aceptado' },
};

const urgencyOrder: Record<Urgency, number> = { high: 0, medium: 1, low: 2 };

export default function OrganizationIntakeQueue() {
  const { language } = useLanguage();
  const en = language === 'en';

  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');
  const [sortByUrgency, setSortByUrgency] = useState(true);

  const filteredItems = useMemo(() => {
    let items = [...DEMO_ITEMS];
    if (statusFilter !== 'all') items = items.filter(i => i.status === statusFilter);
    if (languageFilter !== 'all') items = items.filter(i => i.language === languageFilter);
    if (jurisdictionFilter !== 'all') items = items.filter(i => i.state === jurisdictionFilter);
    if (sortByUrgency) {
      items.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
    }
    return items;
  }, [statusFilter, languageFilter, jurisdictionFilter, sortByUrgency]);

  const uniqueStates = [...new Set(DEMO_ITEMS.map(i => i.state))].sort();
  const uniqueLanguages = [...new Set(DEMO_ITEMS.map(i => i.language))].sort();

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

      {/* Filters */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
          className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          aria-label={en ? 'Filter by status' : 'Filtrar por estado'}
        >
          <option value="all">{en ? 'All statuses' : 'Todos los estados'}</option>
          <option value="needs_review">{en ? 'Needs review' : 'Requiere revision'}</option>
          <option value="pending">{en ? 'Pending' : 'Pendiente'}</option>
          <option value="accepted">{en ? 'Accepted' : 'Aceptado'}</option>
        </select>
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          aria-label={en ? 'Filter by language' : 'Filtrar por idioma'}
        >
          <option value="all">{en ? 'All languages' : 'Todos los idiomas'}</option>
          {uniqueLanguages.map(l => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
        <select
          value={jurisdictionFilter}
          onChange={(e) => setJurisdictionFilter(e.target.value)}
          className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          aria-label={en ? 'Filter by jurisdiction' : 'Filtrar por jurisdicción'}
        >
          <option value="all">{en ? 'All states' : 'Todos los estados'}</option>
          {uniqueStates.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSortByUrgency(!sortByUrgency)}
          className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium transition ${
            sortByUrgency ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-600'
          }`}
          aria-pressed={sortByUrgency}
          aria-label={en ? 'Sort by urgency' : 'Ordenar por urgencia'}
        >
          <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
          {en ? 'Urgency' : 'Urgencia'}
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {filteredItems.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-xs text-slate-500">{en ? 'No items match current filters.' : 'Ningún elemento coincide con los filtros actuales.'}</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">
                  {en ? item.issueType.en : item.issueType.es}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${urgencyStyles[item.urgency]}`}>
                    {item.urgency === 'high' && <Clock className="w-2.5 h-2.5" aria-hidden="true" />}
                    {en ? urgencyLabels[item.urgency].en : urgencyLabels[item.urgency].es}
                  </span>
                  <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[item.status]}`}>
                    {en ? statusLabels[item.status].en : statusLabels[item.status].es}
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
          ))
        )}
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-500">
          {en
            ? 'This is a demonstration of the intake queue interface. In production, items appear when clients complete intake with referral consent. Analytics never include client names, narratives, phone numbers, email addresses, or case facts.'
            : 'Esta es una demostración de la interfaz de cola de admisión. En producción, los elementos aparecen cuando los clientes completan la admisión con consentimiento de referencia. Los análisis nunca incluyen nombres de clientes, narrativas, números de teléfono, correos electrónicos ni hechos del caso.'}
        </p>
      </div>
    </div>
  );
}
