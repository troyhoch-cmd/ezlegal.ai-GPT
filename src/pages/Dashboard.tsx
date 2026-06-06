import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  MessageSquare, FileText, Search, Users,
  Sparkles, ArrowRight, Zap, Shield, BookOpen, Award,
  ChevronDown, ChevronUp, X, Brain
} from 'lucide-react';
import { practiceAreas } from '../data/practiceAreas';
import AttorneyConnections from '../components/AttorneyConnections';
import OutcomePredictionWidget from '../components/OutcomePredictionWidget';
import PredictionConsentGate from '../components/PredictionConsentGate';
import PostPurchaseActivation from '../components/PostPurchaseActivation';
import TrialOnboarding from '../components/TrialOnboarding';
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

  useEffect(() => {
    loadDashboardData();
    if (user) {
      getUserEntitlements(user.id).then(setEntitlements);
    }
  }, [user]);

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
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {language === 'en' ? 'Your Action Plan' : 'Tu Plan de Accion'}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-teal-100 text-sm">
                {language === 'en' ? 'Tasks and next steps for your legal issues' : 'Tareas y proximos pasos para tus asuntos legales'}
              </p>
            </div>
            <Link
              to="/chat"
              className="flex items-center gap-2 bg-white text-teal-700 px-5 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-lg text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              {t('dash.askQuestions')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostPurchaseActivation />
        <TrialOnboarding />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-navy-900">
              {language === 'en' ? 'What do you need help with?' : 'En que necesitas ayuda?'}
            </h2>
            {(!profile?.user_type || profile.user_type === 'individual') && (
              <button
                onClick={() => {
                  const next = !showAdvancedTools;
                  setShowAdvancedTools(next);
                  try { localStorage.setItem('ezlegal-dashboard-advanced', String(next)); } catch {}
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  showAdvancedTools
                    ? 'bg-teal-50 border-teal-300 text-teal-700'
                    : 'bg-navy-50 border-navy-200 text-navy-500 hover:border-navy-300'
                }`}
              >
                <Zap className="w-3 h-3" />
                {showAdvancedTools
                  ? (language === 'en' ? 'Fewer options' : 'Menos opciones')
                  : (language === 'en' ? 'More tools' : 'Mas herramientas')
                }
              </button>
            )}
          </div>

          <div className={`grid grid-cols-1 ${isSimpleMode ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4`}>
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
              <p className="text-sm text-navy-600 mb-3">
                {t('dash.aiChatDesc')}
              </p>
              <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm">
                {t('dash.startChatting')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

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
              <p className="text-sm text-navy-600 mb-3">
                {t('dash.findLawyerDesc')}
              </p>
              <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm">
                {t('dash.browseLawyers')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/pricing"
              className="group bg-white rounded-xl p-6 border-2 border-navy-200 hover:border-green-500 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-green-50 group-hover:bg-green-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-green-600 transition-colors">
                {language === 'en' ? 'Your Action Plans' : 'Tus Planes de Accion'}
              </h3>
              <p className="text-sm text-navy-600 mb-3">
                {language === 'en' ? 'Step-by-step action plans and document templates.' : 'Planes de accion paso a paso y plantillas de documentos.'}
              </p>
              <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                {language === 'en' ? 'View action plans' : 'Ver planes de accion'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {!isSimpleMode && (
              <>
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
                  <p className="text-sm text-teal-100 mb-3">
                    {t('dash.aiLawyerMatchDesc')}
                  </p>
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    {t('dash.tryItNow')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

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
                  <p className="text-sm text-navy-600 mb-3">
                    {t('dash.generateDocsDesc')}
                  </p>
                  <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm">
                    {t('dash.createDocument')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

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
                  <p className="text-sm text-navy-600 mb-3">
                    {t('dash.legalResearchDesc')}
                  </p>
                  <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm">
                    {t('dash.startResearch')}
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
                  <p className="text-sm text-teal-100 mb-3">
                    {t('dash.outcomeScenariosDesc')}
                  </p>
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    {t('dash.analyzeCase')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </>
            )}
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
                const statusInfo = getEntitlementStatusLabel(ent.status);
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
                        {ent.status === 'active' ? t('dash.expires') : t('dash.expired')}: {new Date(ent.expires_at).toLocaleDateString()}
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

        {recentActivity.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900">{t('dash.recentActivity')}</h3>
              <Link to="/dashboard/history" className="text-sm text-teal-600 hover:underline font-medium">
                {t('dash.viewAll')}
              </Link>
            </div>
            <div className="space-y-2">
              {recentActivity.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">{activity.title}</p>
                    <span className="text-xs text-navy-500">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSimpleMode && <AttorneyConnections compact limit={3} />}

        {!isSimpleMode && <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-navy-900">{t('dash.browseByArea')}</h3>
            <BookOpen className="w-6 h-6 text-navy-600" />
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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
                  expandedCategory === area.id ? 'bg-white/20 scale-110' : `bg-${area.color}-100 group-hover:scale-110`
                }`}>
                  <area.icon className={`w-6 h-6 ${expandedCategory === area.id ? 'text-white' : `text-${area.color}-600`}`} />
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
        </div>}
      </div>

      <div className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-navy-300" />
              <div>
                <h3 className="text-lg font-bold">{t('dash.needHumanAttorney')}</h3>
                <p className="text-navy-300 text-sm">{t('dash.aiGuidanceNote')}</p>
              </div>
            </div>
            <Link
              to="/dashboard/lawyer-profiles"
              className="inline-flex items-center gap-2 bg-white text-navy-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-navy-100 transition-all text-sm"
            >
              <Users className="w-4 h-4" />
              {t('dash.browseAttorneys')}
              <ArrowRight className="w-4 h-4" />
            </Link>
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
