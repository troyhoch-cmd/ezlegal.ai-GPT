import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Filter,
  Globe,
  Search,
  Shield,
  Users,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { bl } from '../lib/i18n';
import { ReferralStatusTimeline } from '../components/ReferralStatusTimeline';
import { ConsentLogPreview } from '../components/ConsentLogPreview';
import { PartnerCapacityCard } from '../components/PartnerCapacityCard';
import { ReferralExportOptions } from '../components/ReferralExportOptions';

type UrgencyLevel = 'high' | 'medium' | 'low';
type IssueCategory = 'housing' | 'family' | 'immigration' | 'employment' | 'consumer' | 'benefits';

interface QueueItem {
  id: string;
  issueCategory: IssueCategory;
  urgency: UrgencyLevel;
  language: 'en' | 'es';
  jurisdiction: string;
  consentStatus: 'pending' | 'granted' | 'declined';
  submittedAt: string;
  summary: string;
}

const demoQueue: QueueItem[] = [
  {
    id: 'ref-001',
    issueCategory: 'housing',
    urgency: 'high',
    language: 'es',
    jurisdiction: 'AZ',
    consentStatus: 'granted',
    submittedAt: '2026-05-28 09:15',
    summary: 'Eviction notice received, court date in 5 days',
  },
  {
    id: 'ref-002',
    issueCategory: 'family',
    urgency: 'medium',
    language: 'en',
    jurisdiction: 'AZ',
    consentStatus: 'granted',
    submittedAt: '2026-05-28 10:42',
    summary: 'Custody modification request after relocation',
  },
  {
    id: 'ref-003',
    issueCategory: 'immigration',
    urgency: 'high',
    language: 'es',
    jurisdiction: 'AZ',
    consentStatus: 'pending',
    submittedAt: '2026-05-28 11:30',
    summary: 'DACA renewal deadline approaching',
  },
  {
    id: 'ref-004',
    issueCategory: 'employment',
    urgency: 'low',
    language: 'en',
    jurisdiction: 'AZ',
    consentStatus: 'granted',
    submittedAt: '2026-05-27 16:20',
    summary: 'Wage dispute with former employer',
  },
  {
    id: 'ref-005',
    issueCategory: 'consumer',
    urgency: 'medium',
    language: 'es',
    jurisdiction: 'CA',
    consentStatus: 'granted',
    submittedAt: '2026-05-27 14:08',
    summary: 'Debt collection harassment after payment',
  },
  {
    id: 'ref-006',
    issueCategory: 'benefits',
    urgency: 'low',
    language: 'en',
    jurisdiction: 'AZ',
    consentStatus: 'declined',
    submittedAt: '2026-05-26 09:45',
    summary: 'SNAP benefits denial appeal',
  },
];

const urgencyColors: Record<UrgencyLevel, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-700',
};

const consentColors: Record<string, string> = {
  granted: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-700',
  declined: 'bg-red-100 text-red-700',
};

const categoryLabels: Record<IssueCategory, { en: string; es: string }> = {
  housing: { en: 'Housing', es: 'Vivienda' },
  family: { en: 'Family', es: 'Familia' },
  immigration: { en: 'Immigration', es: 'Inmigración' },
  employment: { en: 'Employment', es: 'Empleo' },
  consumer: { en: 'Consumer', es: 'Consumidor' },
  benefits: { en: 'Benefits', es: 'Beneficios' },
};

export default function PartnerDashboardDemo() {
  const { language } = useLanguage();
  const en = language === 'en';

  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all');
  const [languageFilter, setLanguageFilter] = useState<'en' | 'es' | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'queue' | 'timeline' | 'capacity' | 'exports' | 'audit'>('queue');

  const filteredQueue = demoQueue.filter((item) => {
    if (urgencyFilter !== 'all' && item.urgency !== urgencyFilter) return false;
    if (languageFilter !== 'all' && item.language !== languageFilter) return false;
    if (categoryFilter !== 'all' && item.issueCategory !== categoryFilter) return false;
    if (searchTerm && !item.summary.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: 'queue' as const, label: en ? 'Intake queue' : 'Cola de admisión' },
    { id: 'timeline' as const, label: en ? 'Referral status' : 'Estado de referencia' },
    { id: 'capacity' as const, label: en ? 'Capacity' : 'Capacidad' },
    { id: 'exports' as const, label: en ? 'Exports' : 'Exportaciones' },
    { id: 'audit' as const, label: en ? 'Audit log' : 'Registro de auditoría' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/for-organizations"
              className="text-slate-500 hover:text-slate-700 transition"
              aria-label={en ? 'Back to organizations page' : 'Volver a la página de organizaciones'}
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {en ? 'Partner dashboard' : 'Panel de socio'}
              </h1>
              <p className="text-[11px] text-slate-500">
                {en ? 'Legal aid organization workflow preview' : 'Vista previa del flujo de trabajo de organización de ayuda legal'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              {en ? 'Demo mode' : 'Modo demo'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {en ? 'This is a demonstration dashboard' : 'Este es un panel de demostración'}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {en
                ? 'All data shown is fictional. No real user data is displayed. This preview demonstrates the partner workflow experience.'
                : 'Todos los datos mostrados son ficticios. No se muestran datos reales de usuarios. Esta vista previa demuestra la experiencia del flujo de trabajo del socio.'}
            </p>
          </div>
        </div>

        <nav className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'queue' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  placeholder={en ? 'Search referrals...' : 'Buscar referencias...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value as UrgencyLevel | 'all')}
                    className="text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label={en ? 'Filter by urgency' : 'Filtrar por urgencia'}
                  >
                    <option value="all">{en ? 'All urgency' : 'Toda urgencia'}</option>
                    <option value="high">{en ? 'High' : 'Alta'}</option>
                    <option value="medium">{en ? 'Medium' : 'Media'}</option>
                    <option value="low">{en ? 'Low' : 'Baja'}</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value as 'en' | 'es' | 'all')}
                    className="text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label={en ? 'Filter by language' : 'Filtrar por idioma'}
                  >
                    <option value="all">{en ? 'All languages' : 'Todos los idiomas'}</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | 'all')}
                    className="text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label={en ? 'Filter by issue' : 'Filtrar por tema'}
                  >
                    <option value="all">{en ? 'All issues' : 'Todos los temas'}</option>
                    {(Object.keys(categoryLabels) as IssueCategory[]).map((cat) => (
                      <option key={cat} value={cat}>{bl(categoryLabels[cat], language)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  {en ? `${filteredQueue.length} referrals` : `${filteredQueue.length} referencias`}
                </p>
                <p className="text-[10px] text-slate-400">
                  {en ? 'Sorted by urgency, then submission time' : 'Ordenado por urgencia, luego hora de envío'}
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredQueue.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    {en ? 'No referrals match your filters.' : 'Ninguna referencia coincide con sus filtros.'}
                  </div>
                ) : (
                  filteredQueue
                    .sort((a, b) => {
                      const urgOrder = { high: 0, medium: 1, low: 2 };
                      return urgOrder[a.urgency] - urgOrder[b.urgency];
                    })
                    .map((item) => (
                      <div key={item.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${urgencyColors[item.urgency]}`}>
                                {item.urgency === 'high' ? (en ? 'Urgent' : 'Urgente') : item.urgency === 'medium' ? (en ? 'Medium' : 'Media') : (en ? 'Low' : 'Baja')}
                              </span>
                              <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                {bl(categoryLabels[item.issueCategory], language)}
                              </span>
                              <span className="inline-flex items-center rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">
                                {item.language === 'es' ? 'Español' : 'English'}
                              </span>
                              <span className="text-[10px] text-slate-400">{item.jurisdiction}</span>
                            </div>
                            <p className="text-sm text-slate-800">{item.summary}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                                {item.submittedAt}
                              </span>
                              <span className="text-[10px] text-slate-400">{item.id}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${consentColors[item.consentStatus]}`}>
                              <Shield className="w-2.5 h-2.5 mr-1" aria-hidden="true" />
                              {item.consentStatus === 'granted'
                                ? en ? 'Consent granted' : 'Consentimiento otorgado'
                                : item.consentStatus === 'pending'
                                  ? en ? 'Consent pending' : 'Consentimiento pendiente'
                                  : en ? 'Declined' : 'Rechazado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="max-w-md">
            <ReferralStatusTimeline
              currentStatus="in-review"
              timestamps={{
                draft: '2026-05-28 09:15',
                'consent-obtained': '2026-05-28 09:18',
                submitted: '2026-05-28 09:20',
                acknowledged: '2026-05-28 10:05',
                'in-review': '2026-05-28 11:30',
              }}
              isDemo
            />
          </div>
        )}

        {activeTab === 'capacity' && (
          <div className="max-w-md">
            <PartnerCapacityCard isDemo />
          </div>
        )}

        {activeTab === 'exports' && (
          <div className="max-w-lg">
            <ReferralExportOptions isDemo />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="max-w-lg">
            <ConsentLogPreview isDemo />
          </div>
        )}
      </div>
    </div>
  );
}
