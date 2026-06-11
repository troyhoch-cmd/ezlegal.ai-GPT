import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  Search,
  Filter,
  Star,
  MessageSquare,
  Users,
  FileText,
  TrendingUp,
  X,
  Download,
  RefreshCw,
  Clock,
  ChevronDown,
  Briefcase,
  Settings,
  Crown,
  Sparkles,
  BarChart3,
  Lock
} from 'lucide-react';
import ActivityTimeline from '../components/ActivityTimeline';
import ActivityStatsBar from '../components/ActivityStatsBar';
import {
  Activity,
  ActivityType,
  ActivityStats,
  getActivities,
  getActivityStats,
  groupActivitiesByDate,
  getActivityTypeConfig
} from '../services/activity-service';
import { trackFeatureView, trackExport, trackConversion } from '../services/engagement-service';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

const activityTypeOptions: { type: ActivityType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'chat', label: 'Chat Sessions', icon: MessageSquare },
  { type: 'lawyer_match', label: 'Lawyer Matches', icon: Users },
  { type: 'document', label: 'Documents', icon: FileText },
  { type: 'prediction', label: 'Predictions', icon: TrendingUp },
  { type: 'case', label: 'Cases', icon: Briefcase },
  { type: 'system', label: 'System', icon: Settings }
];

export default function History() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const isPremium = profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'enterprise';

  const getTypeLabel = (type: ActivityType): string => {
    const labels: Record<ActivityType, string> = {
      chat: t('history.typeChatSessions'),
      lawyer_match: t('history.typeLawyerMatches'),
      document: t('history.typeDocuments'),
      prediction: t('history.typePredictions'),
      case: t('history.typeCases'),
      system: t('history.typeSystem'),
    };
    return labels[type] || type;
  };
  const FREE_ACTIVITY_LIMIT = 50;
  const FREE_EXPORT_LIMIT = 10;

  const loadActivities = useCallback(async (reset: boolean = false) => {
    if (!user) return;

    const currentOffset = reset ? 0 : activities.length;
    const limit = 20;

    if (!reset) setLoadingMore(true);
    else setLoading(true);

    const startDate = getStartDateFromFilter(dateFilter);
    const endDate = dateFilter === 'custom' ? new Date() : undefined;

    const { activities: newActivities, total } = await getActivities({
      limit,
      offset: currentOffset,
      activityTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      favoritesOnly: showFavoritesOnly,
      searchTerm: searchTerm || undefined,
      startDate,
      endDate
    });

    if (reset) {
      setActivities(newActivities);
    } else {
      setActivities(prev => [...prev, ...newActivities]);
    }

    setHasMore(currentOffset + newActivities.length < total);
    setLoading(false);
    setLoadingMore(false);
  }, [user, activities.length, selectedTypes, showFavoritesOnly, searchTerm, dateFilter]);

  const loadStats = useCallback(async () => {
    if (!user) return;
    setStatsLoading(true);
    const statsData = await getActivityStats(30);
    setStats(statsData);
    setStatsLoading(false);
  }, [user]);

  useEffect(() => {
    loadActivities(true);
  }, [selectedTypes, showFavoritesOnly, dateFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    trackFeatureView('activity_center', { isPremium });
  }, [isPremium]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadActivities(true);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleRefresh = () => {
    loadActivities(true);
    loadStats();
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadActivities(false);
    }
  };

  const toggleTypeFilter = (type: ActivityType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setShowFavoritesOnly(false);
    setDateFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedTypes.length > 0 || showFavoritesOnly || dateFilter !== 'all' || searchTerm;

  const groupedActivities = groupActivitiesByDate(activities);

  const handleExport = async () => {
    const exportActivities = isPremium ? activities : activities.slice(0, FREE_EXPORT_LIMIT);

    if (!isPremium && activities.length > FREE_EXPORT_LIMIT) {
      setShowUpgradeModal(true);
    }

    const csvContent = exportActivities.map(a =>
      `"${a.created_at}","${a.activity_type}","${a.action}","${a.title.replace(/"/g, '""')}","${a.description?.replace(/"/g, '""') || ''}","${a.status}"`
    ).join('\n');

    const header = 'Date,Type,Action,Title,Description,Status\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ezlegal-activity-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    trackExport('activity_center');
  };

  const migrateExistingChats = async () => {
    if (!user) return;

    const { data: existingChats } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (existingChats && existingChats.length > 0) {
      const activitiesToInsert = existingChats.map(chat => ({
        user_id: user.id,
        activity_type: 'chat',
        action: 'message_sent',
        title: chat.message.substring(0, 100) + (chat.message.length > 100 ? '...' : ''),
        description: chat.response?.substring(0, 200),
        metadata: {
          messageId: chat.id,
          jurisdiction: chat.jurisdiction,
          isFavorite: chat.is_favorite
        },
        related_id: chat.id,
        related_type: 'chat_message',
        is_favorite: chat.is_favorite || false,
        status: 'completed',
        created_at: chat.created_at
      }));

      await supabase.from('activity_log').insert(activitiesToInsert);
      handleRefresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-navy-900">{t('history.title')}</h1>
              <p className="text-navy-600 mt-1">
                {t('history.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg transition-all"
                title={t('history.refresh')}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExport}
                disabled={activities.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t('history.export')}</span>
              </button>
              <a
                href="/chat"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">{t('history.newChat')}</span>
              </a>
            </div>
          </div>
        </div>

        <ActivityStatsBar stats={stats} loading={statsLoading} />

        <div className="bg-white rounded-xl border border-navy-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('history.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-navy-400 hover:text-navy-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  showFavoritesOnly
                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-navy-100 text-navy-700 hover:bg-navy-200 border border-transparent'
                }`}
              >
                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                {t('history.favorites')}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    selectedTypes.length > 0
                      ? 'bg-brand-100 text-brand-700 border border-brand-300'
                      : 'bg-navy-100 text-navy-700 hover:bg-navy-200 border border-transparent'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {t('history.type')}
                  {selectedTypes.length > 0 && (
                    <span className="bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {selectedTypes.length}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showFilters && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-lg border border-navy-200 py-2 z-20">
                      <div className="px-4 py-2 border-b border-navy-100">
                        <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">{t('history.activityTypes')}</span>
                      </div>
                      {activityTypeOptions.map(({ type, label, icon: Icon }) => {
                        const config = getActivityTypeConfig(type);
                        const isSelected = selectedTypes.includes(type);
                        return (
                          <button
                            key={type}
                            onClick={() => toggleTypeFilter(type)}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all ${
                              isSelected ? config.lightBg : 'hover:bg-navy-50'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${isSelected ? config.bgColor : 'bg-navy-200'}`}>
                              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-navy-500'}`} />
                            </div>
                            <span className={isSelected ? config.textColor : 'text-navy-700'}>{getTypeLabel(type)}</span>
                            {isSelected && (
                              <span className="ml-auto text-xs text-navy-400">{t('history.active')}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all border ${
                  dateFilter !== 'all'
                    ? 'bg-brand-100 text-brand-700 border-brand-300'
                    : 'bg-navy-100 text-navy-700 hover:bg-navy-200 border-transparent'
                }`}
              >
                <option value="all">{t('history.allTime')}</option>
                <option value="today">{t('history.today')}</option>
                <option value="week">{t('history.last7Days')}</option>
                <option value="month">{t('history.last30Days')}</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {t('history.clear')}
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 bg-navy-200 rounded-full" />
                <div className="flex-1 bg-white rounded-xl border border-navy-200 p-4">
                  <div className="h-4 bg-navy-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-navy-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-navy-200">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-brand-600" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900 mb-2">
              {hasActiveFilters ? t('history.noMatch') : t('history.noActivity')}
            </h3>
            <p className="text-navy-600 mb-6 max-w-md mx-auto">
              {hasActiveFilters
                ? t('history.adjustFilters')
                : t('history.willAppear')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-navy-100 text-navy-700 rounded-lg font-medium hover:bg-navy-200 transition-all"
                >
                  {t('history.clearFilters')}
                </button>
              ) : (
                <>
                  <a
                    href="/chat"
                    className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg font-semibold hover:from-brand-700 hover:to-brand-800 transition-all shadow-md flex items-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {t('history.startChat')}
                  </a>
                  <button
                    onClick={migrateExistingChats}
                    className="px-6 py-3 bg-navy-100 text-navy-700 rounded-lg font-medium hover:bg-navy-200 transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    {t('history.importHistory')}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {Array.from(groupedActivities.entries()).map(([groupLabel, groupActivities]) => (
              <ActivityTimeline
                key={groupLabel}
                groupLabel={groupLabel}
                activities={groupActivities}
                onActivityUpdate={handleRefresh}
              />
            ))}

            {hasMore && (
              <div className="text-center py-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-white border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      {t('history.loading')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      {t('history.loadMore')}
                    </>
                  )}
                </button>
              </div>
            )}

            {!isPremium && activities.length >= FREE_ACTIVITY_LIMIT && (
              <div className="mt-8 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 rounded-2xl p-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-navy-900 mb-2">
                      {t('history.unlockTitle')}
                    </h3>
                    <p className="text-navy-700 mb-3">
                      {t('history.unlockDesc')}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-amber-700">
                        <BarChart3 className="w-4 h-4" />
                        <span>{t('history.advancedAnalytics')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-700">
                        <Download className="w-4 h-4" />
                        <span>{t('history.unlimitedExports')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-700">
                        <Clock className="w-4 h-4" />
                        <span>{t('history.fullHistory')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      to="/pricing"
                      onClick={() => trackConversion('activity_center')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      {t('history.upgradeNow')}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('history.exportLimitTitle')}</h3>
                <p className="text-white/90">
                  {t('history.exportLimitDesc')}
                </p>
              </div>
              <div className="p-6">
                <p className="text-navy-700 mb-6 text-center">
                  Upgrade to Premium to export your complete activity history with no limits.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-navy-700">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Download className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>{t('history.exportLimitFeature1')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-navy-700">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>{t('history.exportLimitFeature2')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-navy-700">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>{t('history.exportLimitFeature3')}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 px-4 py-3 border border-navy-300 text-navy-700 rounded-xl font-medium hover:bg-navy-50 transition-all"
                  >
                    {t('history.maybeLater')}
                  </button>
                  <Link
                    to="/pricing"
                    onClick={() => {
                      trackConversion('activity_center_export_modal');
                      setShowUpgradeModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-center"
                  >
                    {t('history.upgrade')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStartDateFromFilter(filter: DateFilter): Date | undefined {
  const now = new Date();
  switch (filter) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return monthAgo;
    default:
      return undefined;
  }
}
