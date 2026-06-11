import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  Plus, Search, Calendar, AlertCircle, CheckCircle, Clock, Filter,
  FolderOpen, FileText, Users, ChevronRight, Archive,
  MoreVertical, Download, Scale, MapPin
} from 'lucide-react';
import { US_STATES } from '../data/jurisdictions';

interface Matter {
  id: string;
  title: string;
  description: string | null;
  practice_area: string | null;
  jurisdiction: string | null;
  status: 'open' | 'closed' | 'on_hold' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  document_count?: number;
  message_count?: number;
  participant_count?: number;
}

interface MatterStats {
  total: number;
  open: number;
  closed: number;
  on_hold: number;
}

const PRACTICE_AREAS = [
  'Family Law',
  'Criminal Defense',
  'Immigration',
  'Employment',
  'Housing & Tenant Rights',
  'Consumer Protection',
  'Small Claims',
  'Estate Planning',
  'Business Formation',
  'Contracts',
  'Personal Injury',
  'Civil Rights',
];

export default function Matters() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [filteredMatters, setFilteredMatters] = useState<Matter[]>([]);
  const [stats, setStats] = useState<MatterStats>({ total: 0, open: 0, closed: 0, on_hold: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState('all');
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    practice_area: '',
    jurisdiction: 'Arizona',
    status: 'open',
    priority: 'medium',
  });

  useEffect(() => {
    if (user) {
      loadMatters();
    }
  }, [user]);

  useEffect(() => {
    filterMatters();
  }, [matters, searchTerm, statusFilter, practiceAreaFilter]);

  const loadMatters = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('matters')
      .select(`
        *,
        matter_documents(count),
        matter_participants(count)
      `)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      const mattersWithCounts = data.map(m => ({
        ...m,
        document_count: m.matter_documents?.[0]?.count || 0,
        participant_count: m.matter_participants?.[0]?.count || 0,
      }));
      setMatters(mattersWithCounts);

      setStats({
        total: data.length,
        open: data.filter(m => m.status === 'open').length,
        closed: data.filter(m => m.status === 'closed').length,
        on_hold: data.filter(m => m.status === 'on_hold').length,
      });
    }
    setLoading(false);
  };

  const filterMatters = () => {
    let filtered = matters;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.title.toLowerCase().includes(term) ||
          m.description?.toLowerCase().includes(term) ||
          m.practice_area?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    if (practiceAreaFilter !== 'all') {
      filtered = filtered.filter(m => m.practice_area === practiceAreaFilter);
    }

    setFilteredMatters(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('matters').insert({
      user_id: user.id,
      ...formData,
    });

    if (!error) {
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        practice_area: '',
        jurisdiction: 'Arizona',
        status: 'open',
        priority: 'medium',
      });
      loadMatters();
    }
  };

  const handleExportRecord = async (matterId: string) => {
    setExporting(true);
    try {
      const { data, error } = await supabase.rpc('export_matter_record', {
        p_matter_id: matterId
      });

      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matter-record-${matterId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-navy-100 text-navy-700 border-navy-200';
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { icon: Clock, color: 'text-teal-600 bg-teal-50', label: t('matters.open') };
      case 'on_hold':
        return { icon: AlertCircle, color: 'text-amber-600 bg-amber-50', label: t('matters.onHold') };
      case 'closed':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: t('matters.closed') };
      case 'archived':
        return { icon: Archive, color: 'text-navy-500 bg-navy-100', label: t('matters.archived') };
      default:
        return { icon: Clock, color: 'text-navy-500 bg-navy-100', label: status };
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">{t('matters.title')}</h2>
          <p className="text-navy-600 mb-6">
            {t('matters.signInPrompt')}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              className="px-6 py-2 border-2 border-navy-200 text-navy-700 rounded-lg font-semibold hover:bg-navy-50 transition-all"
            >
              {t('matters.signIn')}
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all"
            >
              {t('matters.createAccount')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('matters.heading')}</h1>
              <p className="text-teal-100">{t('matters.subtitle')}</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-teal-600 px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-teal-50 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              {t('matters.newMatter')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-teal-100">{t('matters.totalMatters')}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-green-300">{stats.open}</div>
              <div className="text-sm text-teal-100">{t('matters.active')}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-amber-300">{stats.on_hold}</div>
              <div className="text-sm text-teal-100">{t('matters.onHold')}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-navy-300">{stats.closed}</div>
              <div className="text-sm text-teal-100">{t('matters.closed')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('matters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 appearance-none bg-white text-sm"
                >
                  <option value="all">{t('matters.allStatus')}</option>
                  <option value="open">{t('matters.open')}</option>
                  <option value="on_hold">{t('matters.onHold')}</option>
                  <option value="closed">{t('matters.closed')}</option>
                  <option value="archived">{t('matters.archived')}</option>
                </select>
              </div>

              <div className="relative">
                <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-4 h-4" />
                <select
                  value={practiceAreaFilter}
                  onChange={(e) => setPracticeAreaFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 appearance-none bg-white text-sm"
                >
                  <option value="all">{t('matters.allPracticeAreas')}</option>
                  {PRACTICE_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredMatters.length === 0 ? (
          <div className="bg-white rounded-xl border border-navy-200 p-12 text-center">
            <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-navy-400" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">
              {searchTerm || statusFilter !== 'all' || practiceAreaFilter !== 'all'
                ? t('matters.noMatch')
                : t('matters.noMatters')}
            </h3>
            <p className="text-navy-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || practiceAreaFilter !== 'all'
                ? t('matters.adjustFilters')
                : t('matters.createFirst')}
            </p>
            {!searchTerm && statusFilter === 'all' && practiceAreaFilter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-teal-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                {t('matters.createFirstBtn')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatters.map((matter) => {
              const statusConfig = getStatusConfig(matter.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={matter.id}
                  className="bg-white rounded-xl shadow-sm border border-navy-200 hover:shadow-md hover:border-navy-300 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-navy-900 truncate">
                            {matter.title}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(matter.priority)}`}>
                            {matter.priority}
                          </span>
                        </div>

                        {matter.description && (
                          <p className="text-sm text-navy-600 mb-3 line-clamp-2">
                            {matter.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>

                          {matter.practice_area && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg">
                              <Scale className="w-3.5 h-3.5" />
                              {matter.practice_area}
                            </span>
                          )}

                          {matter.jurisdiction && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-navy-100 text-navy-600 rounded-lg">
                              <MapPin className="w-3.5 h-3.5" />
                              {matter.jurisdiction}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMatter(matter);
                            setShowExportModal(true);
                          }}
                          className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition-colors"
                          title={t('matters.exportRecord')}
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-navy-100">
                      <div className="flex items-center gap-6 text-sm text-navy-500">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          <span>{matter.document_count || 0} {t('matters.documents')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{matter.participant_count || 0} {t('matters.participants')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{t('matters.updated')} {new Date(matter.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedMatter(matter)}
                        className="inline-flex items-center gap-1 text-teal-600 font-medium text-sm hover:gap-2 transition-all"
                      >
                        {t('matters.viewDetails')}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-navy-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-navy-200">
              <h2 className="text-2xl font-bold text-navy-900">{t('matters.createNewMatter')}</h2>
              <p className="text-navy-600 text-sm mt-1">
                {t('matters.createDesc')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  {t('matters.matterTitle')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Lease Agreement Review, Employment Dispute"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    {t('matters.practiceArea')}
                  </label>
                  <select
                    value={formData.practice_area}
                    onChange={(e) => setFormData({ ...formData, practice_area: e.target.value })}
                    className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  >
                    <option value="">{t('matters.selectPracticeArea')}</option>
                    {PRACTICE_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    {t('matters.jurisdictionLabel')}
                  </label>
                  <select
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  >
                    {US_STATES.map(j => (
                      <option key={j.code} value={j.name}>{j.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    {t('matters.priority')}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  >
                    <option value="low">{t('matters.priorityLow')}</option>
                    <option value="medium">{t('matters.priorityMedium')}</option>
                    <option value="high">{t('matters.priorityHigh')}</option>
                    <option value="urgent">{t('matters.priorityUrgent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    {t('matters.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  >
                    <option value="open">{t('matters.open')}</option>
                    <option value="on_hold">{t('matters.onHold')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  {t('matters.description')}
                </label>
                <textarea
                  rows={4}
                  placeholder="Briefly describe the legal matter..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-navy-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                >
                  {t('matters.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t('matters.createMatter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExportModal && selectedMatter && (
        <div className="fixed inset-0 bg-navy-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">{t('matters.exportTitle')}</h3>
              <p className="text-navy-600 mb-4">
                {t('matters.exportDesc')}
              </p>
              <div className="bg-navy-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-navy-700 mb-2">{t('matters.exportIncludes')}</h4>
                <ul className="text-sm text-navy-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t('matters.exportItem1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t('matters.exportItem2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t('matters.exportItem3')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t('matters.exportItem4')}
                  </li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2.5 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                >
                  {t('matters.cancel')}
                </button>
                <button
                  onClick={() => handleExportRecord(selectedMatter.id)}
                  disabled={exporting}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {exporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('matters.exporting')}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      {t('matters.exportJSON')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
