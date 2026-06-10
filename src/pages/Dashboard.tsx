import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  MessageSquare, FileText, Search, Users, Clock, CheckCircle2,
  Sparkles, ArrowRight, Zap, Shield, BookOpen, Star, Award,
  DollarSign, Activity, ChevronDown, ChevronUp, X, Brain
} from 'lucide-react';
import { practiceAreas } from '../data/practiceAreas';
import AttorneyConnections from '../components/AttorneyConnections';
import OutcomePredictionWidget from '../components/OutcomePredictionWidget';
import PredictionConsentGate from '../components/PredictionConsentGate';
import PersonaSelector from '../components/PersonaSelector';
import PostPurchaseActivation from '../components/PostPurchaseActivation';
import TrialOnboarding from '../components/TrialOnboarding';
import DashboardOnboardingTour from '../components/DashboardOnboardingTour';
import { getUserEntitlements, getEntitlementStatusLabel, type Entitlement } from '../services/entitlement-service';

interface UsageStats {
  chatsToday: number;
  chatsThisMonth: number;
  documentsCreated: number;
  researchQueries: number;
  dailyLimit: number;
  monthlyLimit: number;
}

interface RecentActivity {
  id: string;
  type: 'chat' | 'document' | 'research';
  title: string;
  timestamp: string;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predictionConsented, setPredictionConsented] = useState(false);
  const [_consentedJurisdiction, setConsentedJurisdiction] = useState('');
  const [stats, setStats] = useState<UsageStats>({
    chatsToday: 0,
    chatsThisMonth: 0,
    documentsCreated: 0,
    researchQueries: 0,
    dailyLimit: 5,
    monthlyLimit: 150,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [showAdvancedTools, setShowAdvancedTools] = useState(() => {
    try { return localStorage.getItem('ezlegal-dashboard-advanced') === 'true'; } catch { return false; }
  });
  const [showDashboardTour, setShowDashboardTour] = useState(() => {
    try {
      const hasSeenTour = localStorage.getItem('ezlegal-dashboard-tour-completed');
      const isFirstVisit = !hasSeenTour && user;
      return isFirstVisit;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    loadDashboardData();
    if (user) {
      getUserEntitlements(user.id).then(setEntitlements);
    }
  }, [user]);

  const handleTourComplete = () => {
    try {
      localStorage.setItem('ezlegal-dashboard-tour-completed', 'true');
    } catch { /* ignore */ }
    setShowDashboardTour(false);
  };

  const handleTourSkip = () => {
    try {
      localStorage.setItem('ezlegal-dashboard-tour-completed', 'true');
    } catch { /* ignore */ }
    setShowDashboardTour(false);
  };

  useEffect(() => {
    if (searchParams.get('prediction') === 'open') {
      setShowPredictionModal(true);
      searchParams.delete('prediction');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const { count: todayCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', today.toISOString());

      const { count: monthCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', monthStart.toISOString());

      const { data: recentChats } = await supabase
        .from('chat_messages')
        .select('id, message, created_at')
        .eq('user_id', user.id)
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        chatsToday: todayCount || 0,
        chatsThisMonth: monthCount || 0,
        documentsCreated: 0,
        researchQueries: 0,
        dailyLimit: 5,
        monthlyLimit: 150,
      });

      if (recentChats) {
        setRecentActivity(
          recentChats.map(chat => ({
            id: chat.id,
            type: 'chat' as const,
            title: chat.message.substring(0, 60) + (chat.message.length > 60 ? '...' : ''),
            timestamp: new Date(chat.created_at).toLocaleDateString(),
          }))
        );
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const usagePercentage = (stats.chatsToday / stats.dailyLimit) * 100;
  const monthlyPercentage = (stats.chatsThisMonth / stats.monthlyLimit) * 100;
  const isSimpleMode = (!profile?.user_type || profile.user_type === 'individual') && !showAdvancedTools;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      {showDashboardTour && (
        <DashboardOnboardingTour onComplete={handleTourComplete} onSkip={handleTourSkip} />
      )}

      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('dash.welcomeBack')}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-teal-100">{t('dash.aiDashboard')}</p>
            <div className="mt-3">
              <PersonaSelector compact />
            </div>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-[280px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t('dash.freeTier')}</h2>
                  <p className="text-teal-100 text-sm">{t('dash.upgradeUnlimited')}</p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t('dash.todaysUsage')}</span>
                    <span className="text-sm font-bold">{stats.chatsToday} / {stats.dailyLimit}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5 backdrop-blur">
                    <div
                      className="bg-white rounded-full h-2.5 transition-all"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t('dash.monthlyUsage')}</span>
                    <span className="text-sm font-bold">{stats.chatsThisMonth} / {stats.monthlyLimit}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5 backdrop-blur">
                    <div
                      className="bg-white rounded-full h-2.5 transition-all"
                      style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[320px]">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/chat"
                  className="flex flex-col items-center justify-center gap-1 bg-white text-green-600 px-4 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all shadow-lg text-center"
                >
                  <span className="text-xs text-navy-500 font-normal">{t('dash.freeQuestions')}</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {t('dash.askQuestions')}
                  </span>
                </Link>
                <Link
                  to="/pricing"
                  className="flex flex-col items-center justify-center gap-1 bg-white/20 backdrop-blur text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30 text-center"
                >
                  <span className="text-xs text-teal-200 font-normal">{t('dash.whenNeeded')}</span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {t('dash.issuePacks')}
                  </span>
                </Link>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">{t('dash.freeForever')}</span>
                  <span className="text-xs bg-green-400 text-navy-900 px-2 py-0.5 rounded-full font-bold">{t('dash.noLimit')}</span>
                </div>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-300" />
                    {t('dash.unlimitedAi')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-300" />
                    {t('dash.attorneyAccess')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-300" />
                    {t('dash.guidesResources')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-300" />
                    {t('dash.noCreditCard')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 px-4 py-3 bg-navy-50 border border-navy-200 rounded-xl text-sm text-navy-600">
          {lang === 'en'
            ? 'ezLegal.ai provides legal information, not legal advice. This does not create an attorney-client relationship.'
            : 'ezLegal.ai proporciona informacion legal, no asesoramiento legal. Esto no crea una relacion abogado-cliente.'}
        </div>
        <PostPurchaseActivation />
        <TrialOnboarding />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-navy-900">{t('dash.quickActions')}</h2>
            <div className="flex items-center gap-3">
              {(!profile?.user_type || profile.user_type === 'individual') && (
                <button
                  onClick={() => {
                    const next = !showAdvancedTools;
                    setShowAdvancedTools(next);
                    try { localStorage.setItem('ezlegal-dashboard-advanced', String(next)); } catch { /* ignore */ }
                  }}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    showAdvancedTools
                      ? 'bg-teal-50 border-teal-300 text-teal-700'
                      : 'bg-navy-50 border-navy-200 text-navy-500 hover:border-navy-300'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  {showAdvancedTools
                    ? (lang === 'en' ? 'Advanced tools' : 'Herramientas avanzadas')
                    : (lang === 'en' ? 'Show all tools' : 'Mostrar todas')
                  }
                </button>
              )}
              <div className="flex items-center gap-2 text-sm text-navy-600">
                <Award className="w-4 h-4 text-teal-600" />
                <span className="font-medium">{t('dash.costSavings')}</span>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 ${isSimpleMode ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-4`}>
            <Link
              to="/dashboard/ai-assistant"
              className="group bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-6 border-2 border-teal-600 hover:shadow-2xl transition-all relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4 transition-colors">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t('dash.aiLawyerMatch')}
              </h3>
              <p className="text-sm text-teal-100 mb-4">
                {t('dash.aiLawyerMatchDesc')}
              </p>
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                {t('dash.tryItNow')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/chat"
              className="group bg-white rounded-xl p-6 border-2 border-navy-200 hover:border-teal-600 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-teal-50 group-hover:bg-teal-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <MessageSquare className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-teal-600 transition-colors">
                {t('dash.aiChatAssistant')}
              </h3>
              <p className="text-sm text-navy-600 mb-4">
                {t('dash.aiChatDesc')}
              </p>
              <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm">
                {t('dash.startChatting')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {!isSimpleMode && (
              <Link
                to="/dashboard/documents"
                className="group bg-white rounded-xl p-6 border-2 border-navy-200 hover:border-teal-600 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-green-50 group-hover:bg-green-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-teal-600 transition-colors">
                  {t('dash.generateDocs')}
                </h3>
                <p className="text-sm text-navy-600 mb-4">
                  {t('dash.generateDocsDesc')}
                </p>
                <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm">
                  {t('dash.createDocument')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}

            {!isSimpleMode && (
              <Link
                to="/dashboard/research"
                className="group bg-white rounded-xl p-6 border-2 border-navy-200 hover:border-teal-600 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-teal-50 group-hover:bg-teal-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <Search className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-teal-600 transition-colors">
                  {t('dash.legalResearch')}
                </h3>
                <p className="text-sm text-navy-600 mb-4">
                  {t('dash.legalResearchDesc')}
                </p>
                <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm">
                  {t('dash.startResearch')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}

            <Link
              to="/dashboard/lawyer-profiles"
              className="group bg-white rounded-xl p-6 border-2 border-navy-200 hover:border-teal-600 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-teal-600 transition-colors">
                {t('dash.findLawyer')}
              </h3>
              <p className="text-sm text-navy-600 mb-4">
                {t('dash.findLawyerDesc')}
              </p>
              <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm">
                {t('dash.browseLawyers')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <button
              onClick={() => setShowPredictionModal(true)}
              className="group bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-6 border-2 border-teal-500 hover:shadow-2xl transition-all text-left relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4 transition-colors">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t('dash.outcomeScenarios')}
              </h3>
              <p className="text-sm text-teal-100 mb-4">
                {t('dash.outcomeScenariosDesc')}
              </p>
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                {t('dash.analyzeCase')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {entitlements.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600" />
              {t('dash.purchases')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {entitlements.map((ent) => {
                const statusInfo = getEntitlementStatusLabel(ent.status, lang);
                return (
                  <div key={ent.id} className="border border-navy-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-navy-800 capitalize">
                        {ent.product_type.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    {ent.product_id && (
                      <p className="text-xs text-navy-500 capitalize mb-1">{ent.product_id.replace(/-/g, ' ')}</p>
                    )}
                    {ent.expires_at && (
                      <p className="text-xs text-navy-400">
                        {ent.status === 'active' ? t('dash.expires') : t('dash.expired')}: {new Date(ent.expires_at).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US')}
                      </p>
                    )}
                    {ent.status === 'expired' && (
                      <Link to="/pricing" className="text-xs text-teal-600 hover:underline font-medium mt-1 inline-block">
                        {t('dash.renew')}
                      </Link>
                    )}
                    {ent.status === 'payment_failed' && (
                      <Link to="/pricing" className="text-xs text-red-600 hover:underline font-medium mt-1 inline-block">
                        {t('dash.updatePayment')}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-navy-900">{t('dash.recentActivity')}</h3>
                <Link to="/dashboard/history" className="text-sm text-teal-600 hover:underline font-medium">
                  {t('dash.viewAll')}
                </Link>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-navy-400" />
                  </div>
                  <p className="text-navy-600 mb-4">{t('dash.noActivity')}</p>
                  <Link
                    to="/chat"
                    className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:underline"
                  >
                    {t('dash.startFirst')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {activity.type === 'chat' && <MessageSquare className="w-5 h-5 text-teal-600" />}
                        {activity.type === 'document' && <FileText className="w-5 h-5 text-green-600" />}
                        {activity.type === 'research' && <Search className="w-5 h-5 text-teal-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-navy-900 truncate">{activity.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-navy-600" />
                          <span className="text-sm text-navy-600">{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <AttorneyConnections compact limit={3} />
          </div>

          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm h-fit">
            <h3 className="text-xl font-bold text-navy-900 mb-6">{t('dash.yourStats')}</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy-900">{stats.chatsThisMonth}</p>
                    <p className="text-sm text-navy-600">{t('dash.conversations')}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy-900">{stats.chatsThisMonth}</p>
                    <p className="text-sm text-navy-600">{t('dash.questionsAnswered')}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{t('dash.unlimited')}</p>
                    <p className="text-sm text-navy-600">{t('dash.freeQuestionsAvailable')}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-navy-200">
                <Link
                  to="/pricing"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  {t('dash.getIssuePack')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {!isSimpleMode && (
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy-900">{t('dash.browseByArea')}</h3>
              <BookOpen className="w-6 h-6 text-navy-600" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {practiceAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setExpandedCategory(expandedCategory === area.id ? null : area.id)}
                  className={`group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    expandedCategory === area.id
                      ? 'bg-gradient-to-br from-teal-600 to-teal-700 border-teal-600 shadow-lg'
                      : 'bg-navy-50 border-transparent hover:bg-gradient-to-br hover:from-teal-50 hover:to-teal-100 hover:border-teal-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform ${
                    expandedCategory === area.id ? 'bg-white/20 scale-110' : 'bg-teal-100 group-hover:scale-110'
                  }`}>
                    <area.icon className={`w-6 h-6 ${expandedCategory === area.id ? 'text-white' : 'text-teal-600'}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium text-center ${
                      expandedCategory === area.id ? 'text-white' : 'text-navy-900 group-hover:text-teal-600'
                    }`}>
                      {area.name}
                    </span>
                    {expandedCategory === area.id ? (
                      <ChevronUp className="w-4 h-4 text-white" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-navy-600 group-hover:text-teal-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {expandedCategory && (
              <div className="mt-6 p-6 bg-navy-50 rounded-xl border border-navy-200 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-teal-600">
                    {practiceAreas.find(a => a.id === expandedCategory)?.name} {t('dash.services')}
                  </h4>
                  <button
                    onClick={() => setExpandedCategory(null)}
                    className="p-1 hover:bg-navy-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-navy-600" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {practiceAreas
                    .find(a => a.id === expandedCategory)
                    ?.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to="/chat"
                        state={{ topic: `${practiceAreas.find(a => a.id === expandedCategory)?.name}: ${sub.name}` }}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-navy-200 hover:border-teal-600 hover:shadow-md transition-all group"
                      >
                        <div className="w-2 h-2 bg-teal-600 rounded-full flex-shrink-0" />
                        <span className="text-sm text-navy-900 group-hover:text-teal-600 transition-colors">
                          {sub.name}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-[280px]">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8" />
                <h3 className="text-2xl font-bold">{t('dash.needHumanAttorney')}</h3>
              </div>
              <p className="text-navy-300 mb-4">
                {t('dash.aiGuidanceNote')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/dashboard/lawyer-profiles"
                  className="inline-flex items-center gap-2 bg-white text-navy-900 px-6 py-3 rounded-lg font-semibold hover:bg-navy-100 transition-all"
                >
                  <Users className="w-5 h-5" />
                  {t('dash.browseAttorneys')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2 text-sm text-navy-300">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{t('dash.verifiedNetwork')}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <div className="text-sm font-semibold mb-3">{t('dash.whyChoose')}</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  {t('dash.allVerified')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  {t('dash.responseTime')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  {t('dash.growingCommunity')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showPredictionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {!predictionConsented ? (
              <PredictionConsentGate
                onConsent={(jurisdiction) => {
                  setConsentedJurisdiction(jurisdiction);
                  setPredictionConsented(true);
                }}
                onDecline={() => setShowPredictionModal(false)}
              />
            ) : (
              <OutcomePredictionWidget onClose={() => { setShowPredictionModal(false); setPredictionConsented(false); }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
