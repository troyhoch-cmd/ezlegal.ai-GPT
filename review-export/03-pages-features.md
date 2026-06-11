# ezLegal.ai Code Review - Feature Pages

> Dashboard, documents, tools, and feature pages.

Generated: 2026-06-03T00:51:49.797Z
Files included: 14

---

## src/pages/Dashboard.tsx

```tsx
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
              Your Purchases & Subscriptions
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
                        {ent.status === 'active' ? 'Expires' : 'Expired'}: {new Date(ent.expires_at).toLocaleDateString()}
                      </p>
                    )}
                    {ent.status === 'expired' && (
                      <Link to="/pricing" className="text-xs text-teal-600 hover:underline font-medium mt-1 inline-block">
                        Renew
                      </Link>
                    )}
                    {ent.status === 'payment_failed' && (
                      <Link to="/pricing" className="text-xs text-red-600 hover:underline font-medium mt-1 inline-block">
                        Update payment method
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

```

---

## src/pages/Documents.tsx

```tsx
import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import usePersonaRouting from '../hooks/usePersonaRouting';
import { supabase } from '../lib/supabase';
import { Plus, FileText, Download, Search, Sparkles, X, MapPin, CheckCircle, AlertTriangle, Wand2, Loader2, ScanLine, Building2, Users, Workflow, Award, Gavel, Scale, Upload } from 'lucide-react';
import { JURISDICTION_GROUPS, getJurisdictionName } from '../data/jurisdictions';
import ValidatedFormField from '../components/ValidatedFormField';
import DocumentOCRProcessor from '../components/DocumentOCRProcessor';
import AIModelSelector from '../components/AIModelSelector';
import DocumentIntelligencePanel from '../components/DocumentIntelligencePanel';
import { getFieldConfig, validateField } from '../lib/document-validation';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function stripThinkingDetails(text: string): string {
  if (!text) return '';
  let out = text;
  const endMarker = out.indexOf('---END_THINKING---');
  if (endMarker !== -1) {
    out = out.slice(endMarker + '---END_THINKING---'.length);
  } else if (out.includes('---THINKING_DETAILS---')) {
    const afterKey = out.lastIndexOf('KEY_ISSUE:');
    if (afterKey !== -1) {
      const nl = out.indexOf('\n', afterKey);
      out = nl !== -1 ? out.slice(nl + 1) : '';
    } else {
      out = out.replace(/---THINKING_DETAILS---[\s\S]*/g, '');
    }
  }
  return out
    .replace(/^\s*LEGAL_AREA:[^\n]*\n?/gm, '')
    .replace(/^\s*JURISDICTION:[^\n]*\n?/gm, '')
    .replace(/^\s*KEY_ISSUE:[^\n]*\n?/gm, '')
    .trim();
}

interface Document {
  id: string;
  title: string;
  document_type: string;
  content: string;
  template_used: string | null;
  created_at: string;
  jurisdiction?: string | null;
}

const templates = {
  '501c3_formation': {
    name: '501(c)(3) Formation',
    fields: ['organization_name', 'state', 'purpose', 'registered_agent', 'incorporator_name', 'effective_date'],
    template: `ARTICLES OF INCORPORATION FOR 501(c)(3) NONPROFIT

ARTICLE I - NAME
The name of this corporation is [organization_name].

ARTICLE II - PURPOSE
This corporation is organized exclusively for charitable, religious, educational, and/or scientific purposes under Section 501(c)(3) of the Internal Revenue Code.

The specific purpose of this corporation is: [purpose]

ARTICLE III - NONPROFIT STATUS
No part of the net earnings shall inure to the benefit of any private shareholder or individual.

ARTICLE IV - REGISTERED AGENT
The name and address of the registered agent in the State of [state] is: [registered_agent]

ARTICLE V - INCORPORATOR
The name and address of the incorporator is: [incorporator_name]

ARTICLE VI - DISSOLUTION
Upon dissolution, assets shall be distributed for exempt purposes under Section 501(c)(3) of the Internal Revenue Code.

ARTICLE VII - EFFECTIVE DATE
These Articles of Incorporation are effective as of [effective_date].

IN WITNESS WHEREOF, the undersigned incorporator has executed these Articles of Incorporation.

_______________________          _______________________
[incorporator_name]              Date
Incorporator`
  },
  general_partnership_formation: {
    name: 'General Partnership Formation',
    fields: ['partnership_name', 'partner1_name', 'partner2_name', 'business_purpose', 'capital_contribution', 'effective_date'],
    template: `GENERAL PARTNERSHIP AGREEMENT

This General Partnership Agreement is entered into as of [effective_date] by and between [partner1_name] and [partner2_name] (collectively, the "Partners").

ARTICLE I - FORMATION
The Partners hereby form a general partnership under the name [partnership_name].

ARTICLE II - PURPOSE
The purpose of the Partnership is: [business_purpose]

ARTICLE III - CAPITAL CONTRIBUTIONS
Each Partner shall contribute the following capital: $[capital_contribution]

ARTICLE IV - PROFIT AND LOSS SHARING
Profits and losses shall be shared equally among the Partners.

ARTICLE V - MANAGEMENT
All Partners shall have equal rights in the management and conduct of the Partnership business.

ARTICLE VI - TERM
The Partnership shall continue until dissolved by mutual agreement or operation of law.

IN WITNESS WHEREOF, the Partners have executed this Agreement.

_______________________          _______________________
[partner1_name]                  [partner2_name]
Partner                          Partner`
  },
  llc_dissolution: {
    name: 'LLC Dissolution',
    fields: ['llc_name', 'state', 'dissolution_date', 'member_name', 'reason_for_dissolution'],
    template: `ARTICLES OF DISSOLUTION

LIMITED LIABILITY COMPANY DISSOLUTION

ARTICLE I - COMPANY NAME
The name of the Limited Liability Company being dissolved is: [llc_name]

ARTICLE II - STATE OF FORMATION
This LLC was formed in the State of [state].

ARTICLE III - DISSOLUTION DATE
The effective date of dissolution is: [dissolution_date]

ARTICLE IV - REASON FOR DISSOLUTION
Reason for dissolution: [reason_for_dissolution]

ARTICLE V - MEMBER APPROVAL
The dissolution has been approved by the required vote of members.

ARTICLE VI - LIABILITIES
All debts, obligations, and liabilities of the LLC have been paid or adequately provided for.

ARTICLE VII - ASSET DISTRIBUTION
All remaining assets have been distributed to members according to the Operating Agreement.

ARTICLE VIII - CERTIFICATION
The undersigned certifies that the information contained herein is true and correct.

_______________________          _______________________
[member_name]                    Date
Member/Manager`
  },
  multiple_member_llc_formation: {
    name: 'Multiple Member LLC Formation',
    fields: ['llc_name', 'state', 'member1_name', 'member2_name', 'member1_ownership', 'member2_ownership', 'effective_date'],
    template: `OPERATING AGREEMENT FOR MULTIPLE MEMBER LLC

OPERATING AGREEMENT OF [llc_name], LLC

This Operating Agreement is entered into as of [effective_date].

ARTICLE I - FORMATION
The Members hereby form a Limited Liability Company under the laws of [state].

ARTICLE II - NAME AND PURPOSE
The name of the LLC is [llc_name], LLC. The LLC may engage in any lawful business activity.

ARTICLE III - MEMBERS AND OWNERSHIP
[member1_name]: [member1_ownership]%
[member2_name]: [member2_ownership]%

ARTICLE IV - CAPITAL CONTRIBUTIONS
Each Member shall contribute capital proportionate to their ownership interest.

ARTICLE V - DISTRIBUTIONS
Distributions shall be made to Members in proportion to their ownership percentages.

ARTICLE VI - MANAGEMENT
The LLC shall be managed by its Members. Major decisions require majority vote.

ARTICLE VII - TRANSFER OF INTERESTS
No Member may transfer their interest without written consent of other Members.

IN WITNESS WHEREOF, the Members have executed this Agreement.

_______________________          _______________________
[member1_name]                   [member2_name]`
  },
  asset_sale_purchase: {
    name: 'Prepare Asset Sale and Purchase Agreement',
    fields: ['seller_name', 'buyer_name', 'asset_description', 'purchase_price', 'closing_date'],
    template: `ASSET SALE AND PURCHASE AGREEMENT

This Asset Sale and Purchase Agreement is made between [seller_name] ("Seller") and [buyer_name] ("Buyer").

ARTICLE I - ASSETS BEING SOLD
The Seller agrees to sell and the Buyer agrees to purchase the following assets:
[asset_description]

ARTICLE II - PURCHASE PRICE
The total purchase price for the Assets is: $[purchase_price]

ARTICLE III - CLOSING
The closing of this transaction shall occur on [closing_date].

ARTICLE IV - REPRESENTATIONS
Seller represents that:
- Seller has full authority to sell the Assets
- The Assets are free and clear of all liens and encumbrances
- All information provided regarding the Assets is accurate

ARTICLE V - CONDITIONS
This sale is contingent upon:
- Buyer's satisfactory inspection of Assets
- Completion of due diligence
- Execution of all required documents

ARTICLE VI - TRANSFER OF OWNERSHIP
Title to the Assets shall transfer to Buyer upon receipt of full payment.

_______________________          _______________________
[seller_name]                    [buyer_name]
Seller                           Buyer`
  },
  buy_sell_agreement: {
    name: 'Prepare Buy-Sell Agreement',
    fields: ['company_name', 'owner1_name', 'owner2_name', 'trigger_event', 'valuation_method', 'effective_date'],
    template: `BUY-SELL AGREEMENT

This Buy-Sell Agreement is made as of [effective_date] among the owners of [company_name].

ARTICLE I - PARTIES
Owner 1: [owner1_name]
Owner 2: [owner2_name]

ARTICLE II - PURPOSE
This Agreement governs the purchase and sale of ownership interests upon certain triggering events.

ARTICLE III - TRIGGERING EVENTS
The following events shall trigger this Agreement: [trigger_event]

ARTICLE IV - VALUATION
The ownership interests shall be valued using: [valuation_method]

ARTICLE V - PURCHASE OBLIGATION
Upon a triggering event, the remaining owners shall have the right and obligation to purchase the departing owner's interest.

ARTICLE VI - PAYMENT TERMS
Payment may be made in a lump sum or in installments over 60 months with interest at the prime rate.

ARTICLE VII - LIFE INSURANCE FUNDING
The owners may maintain life insurance policies to fund this Agreement.

_______________________          _______________________
[owner1_name]                    [owner2_name]`
  },
  consultant_agreement: {
    name: 'Prepare Consultant Agreement',
    fields: ['consultant_name', 'client_name', 'services_description', 'compensation', 'start_date', 'end_date'],
    template: `CONSULTANT AGREEMENT

This Consultant Agreement is entered into as of [start_date] between [client_name] ("Client") and [consultant_name] ("Consultant").

ARTICLE I - SERVICES
Consultant agrees to provide the following services: [services_description]

ARTICLE II - TERM
This Agreement begins on [start_date] and ends on [end_date], unless terminated earlier.

ARTICLE III - COMPENSATION
Client shall pay Consultant: $[compensation]
Payment terms: Net 30 days from invoice date.

ARTICLE IV - INDEPENDENT CONTRACTOR
Consultant is an independent contractor, not an employee. Consultant is responsible for all taxes.

ARTICLE V - CONFIDENTIALITY
Consultant shall maintain the confidentiality of all proprietary information.

ARTICLE VI - WORK PRODUCT
All work product created under this Agreement shall be the property of Client.

ARTICLE VII - TERMINATION
Either party may terminate with 14 days written notice.

_______________________          _______________________
[consultant_name]                [client_name]
Consultant                       Client`
  },
  corporate_bylaws: {
    name: 'Prepare Corporate Bylaws',
    fields: ['corporation_name', 'state', 'fiscal_year_end', 'number_of_directors', 'registered_agent'],
    template: `CORPORATE BYLAWS OF [corporation_name]

ARTICLE I - OFFICES
The principal office shall be located in the State of [state].
Registered Agent: [registered_agent]

ARTICLE II - SHAREHOLDERS
Section 2.1 - Annual Meetings shall be held within 60 days of fiscal year end.
Section 2.2 - Special Meetings may be called by the Board or holders of 10% of shares.
Section 2.3 - Quorum shall be a majority of outstanding shares.

ARTICLE III - BOARD OF DIRECTORS
Section 3.1 - Number: The Board shall consist of [number_of_directors] directors.
Section 3.2 - Term: Directors serve one-year terms.
Section 3.3 - Meetings: Regular meetings shall be held quarterly.

ARTICLE IV - OFFICERS
The officers shall include President, Secretary, and Treasurer.

ARTICLE V - FISCAL YEAR
The fiscal year shall end on [fiscal_year_end].

ARTICLE VI - AMENDMENTS
These Bylaws may be amended by a majority vote of shareholders.

ADOPTED by the Board of Directors on _________________.

_______________________
Secretary`
  },
  demand_letter: {
    name: 'Prepare Demand Letter',
    fields: ['sender_name', 'recipient_name', 'amount_owed', 'reason_for_debt', 'payment_deadline'],
    template: `DEMAND LETTER

Date: _________________

[recipient_name]
[Recipient Address]

RE: DEMAND FOR PAYMENT

Dear [recipient_name],

This letter serves as a formal demand for payment of the amount owed to [sender_name].

AMOUNT DUE: $[amount_owed]

REASON FOR DEBT: [reason_for_debt]

You are hereby demanded to pay the full amount of $[amount_owed] on or before [payment_deadline].

CONSEQUENCES OF NON-PAYMENT:
If payment is not received by the deadline, we will have no choice but to pursue all available legal remedies, including but not limited to:
- Filing a lawsuit in the appropriate court
- Seeking attorney's fees and court costs
- Reporting to credit agencies

PAYMENT INSTRUCTIONS:
Please remit payment to:
[sender_name]
[Payment address/method]

This is a serious matter. Please treat it accordingly.

Sincerely,

_______________________
[sender_name]`
  },
  employee_severance: {
    name: 'Prepare Employee Severance Agreement',
    fields: ['employee_name', 'company_name', 'severance_amount', 'last_work_date', 'benefits_end_date'],
    template: `EMPLOYEE SEVERANCE AGREEMENT

This Severance Agreement is entered into between [company_name] ("Company") and [employee_name] ("Employee").

ARTICLE I - SEPARATION
Employee's last day of employment shall be [last_work_date].

ARTICLE II - SEVERANCE PAYMENT
Company shall pay Employee severance of: $[severance_amount]
Payment shall be made within 30 days of execution of this Agreement.

ARTICLE III - BENEFITS
Employee benefits shall continue through [benefits_end_date].
COBRA information will be provided separately.

ARTICLE IV - RELEASE OF CLAIMS
Employee releases Company from all claims arising from employment, except for vested benefits.

ARTICLE V - CONFIDENTIALITY
Employee agrees to maintain confidentiality regarding proprietary information and the terms of this Agreement.

ARTICLE VI - NON-DISPARAGEMENT
Both parties agree not to make disparaging statements about the other.

ARTICLE VII - RETURN OF PROPERTY
Employee shall return all company property by the separation date.

ARTICLE VIII - CONSIDERATION PERIOD
Employee has 21 days to consider and 7 days to revoke this Agreement.

_______________________          _______________________
[employee_name]                  [company_name]
Employee                         Company Representative`
  },
  employee_stock_option: {
    name: 'Prepare Employee Stock Option Agreement',
    fields: ['employee_name', 'company_name', 'number_of_shares', 'exercise_price', 'vesting_start_date', 'grant_date'],
    template: `EMPLOYEE STOCK OPTION AGREEMENT

This Stock Option Agreement is entered into as of [grant_date] between [company_name] ("Company") and [employee_name] ("Optionee").

ARTICLE I - GRANT OF OPTION
Company grants Optionee the option to purchase [number_of_shares] shares of Common Stock.

ARTICLE II - EXERCISE PRICE
The exercise price per share is: $[exercise_price]

ARTICLE III - VESTING SCHEDULE
Vesting commencement date: [vesting_start_date]
- 25% vests after 12 months (cliff)
- Remaining shares vest monthly over the following 36 months

ARTICLE IV - EXERCISE PERIOD
Options must be exercised within 10 years of the grant date or 90 days after termination, whichever is earlier.

ARTICLE V - METHOD OF EXERCISE
Options may be exercised by written notice and payment of the exercise price.

ARTICLE VI - TAX CONSEQUENCES
Optionee is responsible for all tax obligations arising from exercise of options.

ARTICLE VII - RESTRICTIONS
These options are non-transferable except by will or laws of descent.

_______________________          _______________________
[employee_name]                  [company_name]
Optionee                         Authorized Representative`
  },
  employment_agreement: {
    name: 'Prepare Employment Agreement',
    fields: ['employee_name', 'company_name', 'position', 'salary', 'start_date'],
    template: `EMPLOYMENT AGREEMENT

This Employment Agreement is made between [company_name] ("Employer") and [employee_name] ("Employee").

ARTICLE I - POSITION AND DUTIES
Employee is hired as [position]. Employee shall perform duties as assigned.

ARTICLE II - START DATE
Employment begins on [start_date].

ARTICLE III - COMPENSATION
Base Salary: $[salary] per year, paid bi-weekly.
Employee is eligible for bonuses at Employer's discretion.

ARTICLE IV - BENEFITS
Employee is eligible for standard company benefits including health insurance, 401(k), and PTO.

ARTICLE V - AT-WILL EMPLOYMENT
Employment is at-will and may be terminated by either party at any time with or without cause.

ARTICLE VI - CONFIDENTIALITY
Employee shall maintain confidentiality of all proprietary information during and after employment.

ARTICLE VII - NON-COMPETE
Employee agrees not to compete with Employer for 12 months following termination within 50 miles.

ARTICLE VIII - INTELLECTUAL PROPERTY
All work product created during employment belongs to Employer.

_______________________          _______________________
[employee_name]                  [company_name]
Employee                         Employer`
  },
  joint_venture_agreement: {
    name: 'Prepare Joint Venture Agreement',
    fields: ['party1_name', 'party2_name', 'venture_name', 'purpose', 'contribution1', 'contribution2', 'effective_date'],
    template: `JOINT VENTURE AGREEMENT

This Joint Venture Agreement is entered into as of [effective_date] between [party1_name] ("Party A") and [party2_name] ("Party B").

ARTICLE I - FORMATION
The parties hereby form a joint venture known as [venture_name].

ARTICLE II - PURPOSE
The purpose of this Joint Venture is: [purpose]

ARTICLE III - CONTRIBUTIONS
Party A shall contribute: [contribution1]
Party B shall contribute: [contribution2]

ARTICLE IV - PROFIT AND LOSS SHARING
Profits and losses shall be shared 50/50 unless otherwise agreed.

ARTICLE V - MANAGEMENT
Major decisions require unanimous consent. Day-to-day operations shall be managed jointly.

ARTICLE VI - TERM
This Joint Venture shall continue until completed or terminated by mutual agreement.

ARTICLE VII - CONFIDENTIALITY
Both parties shall maintain confidentiality of Joint Venture information.

ARTICLE VIII - DISPUTE RESOLUTION
Disputes shall be resolved through mediation, then binding arbitration.

_______________________          _______________________
[party1_name]                    [party2_name]
Party A                          Party B`
  },
  license_agreement: {
    name: 'Prepare License Agreement',
    fields: ['licensor_name', 'licensee_name', 'licensed_property', 'license_fee', 'territory', 'term_length'],
    template: `LICENSE AGREEMENT

This License Agreement is made between [licensor_name] ("Licensor") and [licensee_name] ("Licensee").

ARTICLE I - GRANT OF LICENSE
Licensor grants Licensee a non-exclusive license to use: [licensed_property]

ARTICLE II - TERRITORY
The license is valid in: [territory]

ARTICLE III - TERM
The license term is [term_length] from the effective date.

ARTICLE IV - LICENSE FEE
Licensee shall pay Licensor: $[license_fee]
Payment terms: Due upon execution of this Agreement.

ARTICLE V - PERMITTED USE
Licensee may use the Licensed Property for lawful business purposes as specified.

ARTICLE VI - RESTRICTIONS
Licensee shall not sublicense, modify, or reverse engineer the Licensed Property.

ARTICLE VII - INTELLECTUAL PROPERTY
All intellectual property rights remain with Licensor.

ARTICLE VIII - TERMINATION
Either party may terminate with 30 days notice for material breach.

_______________________          _______________________
[licensor_name]                  [licensee_name]
Licensor                         Licensee`
  },
  master_service_agreement: {
    name: 'Prepare Master Service Agreement',
    fields: ['provider_name', 'client_name', 'services_scope', 'payment_terms', 'effective_date'],
    template: `MASTER SERVICE AGREEMENT

This Master Service Agreement is made as of [effective_date] between [provider_name] ("Provider") and [client_name] ("Client").

ARTICLE I - SERVICES
Provider shall provide services as described in executed Statements of Work (SOWs).
General scope: [services_scope]

ARTICLE II - STATEMENTS OF WORK
Individual projects shall be governed by SOWs that reference this MSA.

ARTICLE III - COMPENSATION
Payment terms: [payment_terms]
Invoices are due Net 30 unless otherwise specified in the SOW.

ARTICLE IV - TERM
This Agreement remains in effect for 2 years and auto-renews unless terminated.

ARTICLE V - CONFIDENTIALITY
Both parties shall protect confidential information for 3 years following disclosure.

ARTICLE VI - INTELLECTUAL PROPERTY
Pre-existing IP remains with original owner. Work product ownership defined in each SOW.

ARTICLE VII - LIABILITY
Neither party liable for indirect, consequential, or punitive damages.

ARTICLE VIII - TERMINATION
Either party may terminate with 60 days written notice.

_______________________          _______________________
[provider_name]                  [client_name]
Provider                         Client`
  },
  non_compete_agreement: {
    name: 'Prepare Non-Compete Agreement',
    fields: ['employee_name', 'company_name', 'restricted_period', 'geographic_area', 'effective_date'],
    template: `NON-COMPETE AGREEMENT

This Non-Compete Agreement is made as of [effective_date] between [company_name] ("Company") and [employee_name] ("Employee").

ARTICLE I - CONSIDERATION
In exchange for employment/continued employment and other valuable consideration, Employee agrees to the following restrictions.

ARTICLE II - NON-COMPETITION
During employment and for [restricted_period] after termination, Employee shall not:
- Work for any competing business
- Start a competing business
- Solicit Company's customers or employees

ARTICLE III - GEOGRAPHIC SCOPE
These restrictions apply within: [geographic_area]

ARTICLE IV - NON-SOLICITATION
Employee shall not solicit or hire Company employees for [restricted_period] after termination.

ARTICLE V - REASONABLENESS
Both parties acknowledge these restrictions are reasonable and necessary to protect legitimate business interests.

ARTICLE VI - REMEDIES
Company may seek injunctive relief and damages for breach of this Agreement.

ARTICLE VII - SEVERABILITY
If any provision is unenforceable, it shall be modified to be enforceable.

_______________________          _______________________
[employee_name]                  [company_name]
Employee                         Company Representative`
  },
  non_disclosure_agreement: {
    name: 'Prepare Non-Disclosure Agreement',
    fields: ['discloser_name', 'recipient_name', 'purpose', 'confidential_info_description', 'effective_date'],
    template: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is entered into as of [effective_date] by and between [discloser_name] ("Disclosing Party") and [recipient_name] ("Receiving Party").

ARTICLE I - PURPOSE
This Agreement protects confidential information shared for: [purpose]

ARTICLE II - CONFIDENTIAL INFORMATION
Confidential Information includes: [confidential_info_description]

ARTICLE III - OBLIGATIONS
The Receiving Party shall:
- Use Confidential Information only for the stated purpose
- Protect information with reasonable care
- Not disclose to third parties without consent
- Return or destroy information upon request

ARTICLE IV - EXCLUSIONS
This Agreement does not apply to information that:
- Is publicly available
- Was known prior to disclosure
- Is independently developed
- Is required to be disclosed by law

ARTICLE V - TERM
This Agreement remains in effect for 3 years from the Effective Date.

ARTICLE VI - REMEDIES
Disclosing Party may seek injunctive relief for breach.

_______________________          _______________________
[discloser_name]                 [recipient_name]
Disclosing Party                 Receiving Party`
  },
  partnership_agreement: {
    name: 'Prepare Partnership Agreement',
    fields: ['partnership_name', 'partner1_name', 'partner2_name', 'business_purpose', 'profit_share_percent', 'effective_date'],
    template: `PARTNERSHIP AGREEMENT

This Partnership Agreement is made as of [effective_date] between [partner1_name] and [partner2_name] (the "Partners").

ARTICLE I - FORMATION
The Partners form a partnership under the name [partnership_name].

ARTICLE II - PURPOSE
The Partnership shall engage in: [business_purpose]

ARTICLE III - CAPITAL
Each Partner shall contribute capital as agreed. Additional contributions require unanimous consent.

ARTICLE IV - PROFITS AND LOSSES
Profits and losses shall be divided: [profit_share_percent]% to each Partner.

ARTICLE V - MANAGEMENT
Partners shall have equal management rights. Major decisions require unanimous consent.

ARTICLE VI - BANKING
Partnership funds shall be deposited in accounts designated by the Partners.

ARTICLE VII - WITHDRAWAL
A Partner may withdraw with 90 days written notice.

ARTICLE VIII - DISSOLUTION
The Partnership shall dissolve upon mutual agreement, death, or bankruptcy of a Partner.

ARTICLE IX - DISPUTE RESOLUTION
Disputes shall be resolved through mediation, then arbitration.

_______________________          _______________________
[partner1_name]                  [partner2_name]`
  },
  power_of_attorney: {
    name: 'Prepare Power of Attorney',
    fields: ['principal_name', 'agent_name', 'powers_granted', 'effective_date', 'state'],
    template: `POWER OF ATTORNEY

STATE OF [state]

I, [principal_name] ("Principal"), hereby appoint [agent_name] ("Agent") as my Attorney-in-Fact.

ARTICLE I - POWERS GRANTED
I grant my Agent authority to act on my behalf in the following matters:
[powers_granted]

ARTICLE II - EFFECTIVE DATE
This Power of Attorney is effective as of [effective_date].

ARTICLE III - DURABILITY
This Power of Attorney shall remain in effect even if I become incapacitated.

ARTICLE IV - AGENT'S DUTIES
Agent shall act in my best interest, keep accurate records, and avoid conflicts of interest.

ARTICLE V - THIRD PARTY RELIANCE
Third parties may rely on this Power of Attorney in good faith.

ARTICLE VI - REVOCATION
I may revoke this Power of Attorney at any time in writing.

ARTICLE VII - GOVERNING LAW
This Power of Attorney is governed by the laws of [state].

_______________________          _______________________
[principal_name]                 Date
Principal

ACKNOWLEDGMENT BY AGENT:
I accept this appointment.

_______________________          _______________________
[agent_name]                     Date
Agent`
  },
  settlement_agreement: {
    name: 'Prepare Settlement Agreement',
    fields: ['party1_name', 'party2_name', 'dispute_description', 'settlement_amount', 'payment_deadline'],
    template: `SETTLEMENT AGREEMENT AND RELEASE

This Settlement Agreement is made between [party1_name] ("Party A") and [party2_name] ("Party B").

RECITALS
WHEREAS, a dispute exists between the parties regarding: [dispute_description]
WHEREAS, the parties wish to resolve this dispute without further litigation.

ARTICLE I - SETTLEMENT PAYMENT
Party B shall pay Party A: $[settlement_amount]
Payment due by: [payment_deadline]

ARTICLE II - RELEASE OF CLAIMS
Upon receipt of payment, Party A releases Party B from all claims arising from the dispute.

ARTICLE III - MUTUAL RELEASE
Both parties release each other from any and all claims related to the dispute.

ARTICLE IV - NO ADMISSION
This settlement is not an admission of liability by either party.

ARTICLE V - CONFIDENTIALITY
The terms of this settlement shall remain confidential.

ARTICLE VI - NON-DISPARAGEMENT
Neither party shall make disparaging statements about the other.

ARTICLE VII - ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties.

_______________________          _______________________
[party1_name]                    [party2_name]
Party A                          Party B`
  },
  shareholder_agreement: {
    name: 'Prepare Shareholder Agreement',
    fields: ['company_name', 'shareholder1_name', 'shareholder2_name', 'shareholder1_shares', 'shareholder2_shares', 'effective_date'],
    template: `SHAREHOLDER AGREEMENT

This Shareholder Agreement is made as of [effective_date] among the shareholders of [company_name].

ARTICLE I - SHAREHOLDERS
[shareholder1_name]: [shareholder1_shares] shares
[shareholder2_name]: [shareholder2_shares] shares

ARTICLE II - BOARD REPRESENTATION
Shareholders shall be entitled to board representation proportionate to ownership.

ARTICLE III - VOTING
Major decisions require approval of shareholders holding 2/3 of outstanding shares.

ARTICLE IV - TRANSFER RESTRICTIONS
No shareholder may transfer shares without first offering them to other shareholders (Right of First Refusal).

ARTICLE V - DRAG-ALONG
If majority shareholders accept a bona fide offer, minority shareholders must sell on same terms.

ARTICLE VI - TAG-ALONG
If majority shareholders sell, minority shareholders may participate proportionately.

ARTICLE VII - DIVIDENDS
Dividends shall be declared at the Board's discretion and distributed pro rata.

ARTICLE VIII - DISPUTE RESOLUTION
Disputes shall be resolved through binding arbitration.

_______________________          _______________________
[shareholder1_name]              [shareholder2_name]`
  },
  terms_of_service: {
    name: 'Prepare Terms of Service/Use Agreement',
    fields: ['company_name', 'website_url', 'service_description', 'jurisdiction', 'effective_date'],
    template: `TERMS OF SERVICE

Effective Date: [effective_date]

Welcome to [website_url]. These Terms of Service govern your use of [company_name]'s services.

1. ACCEPTANCE
By using our services, you agree to these Terms. If you do not agree, do not use our services.

2. SERVICES
[company_name] provides: [service_description]

3. USER ACCOUNTS
You are responsible for maintaining the security of your account and all activities under your account.

4. ACCEPTABLE USE
You agree not to:
- Violate any laws
- Infringe intellectual property rights
- Transmit harmful code
- Interfere with service operation

5. INTELLECTUAL PROPERTY
All content and materials are owned by [company_name] and protected by copyright.

6. LIMITATION OF LIABILITY
[company_name] is not liable for indirect, incidental, or consequential damages.

7. TERMINATION
We may terminate your access for violation of these Terms.

8. GOVERNING LAW
These Terms are governed by the laws of [jurisdiction].

9. CHANGES
We may modify these Terms at any time. Continued use constitutes acceptance.

[company_name]`
  },
  website_hosting_agreement: {
    name: 'Prepare Website Hosting Agreement',
    fields: ['provider_name', 'client_name', 'monthly_fee', 'storage_limit', 'bandwidth_limit', 'effective_date'],
    template: `WEBSITE HOSTING AGREEMENT

This Website Hosting Agreement is made as of [effective_date] between [provider_name] ("Provider") and [client_name] ("Client").

ARTICLE I - HOSTING SERVICES
Provider shall provide website hosting services including:
- Web server space: [storage_limit]
- Monthly bandwidth: [bandwidth_limit]
- Email accounts
- Technical support

ARTICLE II - FEES
Monthly hosting fee: $[monthly_fee]
Payment due on the 1st of each month.

ARTICLE III - UPTIME GUARANTEE
Provider guarantees 99.9% uptime, excluding scheduled maintenance.

ARTICLE IV - CLIENT RESPONSIBILITIES
Client shall:
- Provide accurate account information
- Not host illegal or harmful content
- Maintain current payment

ARTICLE V - BACKUPS
Provider performs daily backups. Client is responsible for maintaining independent backups.

ARTICLE VI - TERM AND TERMINATION
This Agreement is month-to-month. Either party may terminate with 30 days notice.

ARTICLE VII - LIMITATION OF LIABILITY
Provider's liability is limited to fees paid in the preceding 12 months.

_______________________          _______________________
[provider_name]                  [client_name]
Provider                         Client`
  },
  routine_document_review: {
    name: 'Routine Document Review',
    fields: ['client_name', 'document_type', 'document_description', 'review_date', 'reviewer_name'],
    template: `DOCUMENT REVIEW CHECKLIST

Client: [client_name]
Document Type: [document_type]
Description: [document_description]
Review Date: [review_date]
Reviewer: [reviewer_name]

REVIEW CHECKLIST:

[ ] Document completeness verified
[ ] All parties properly identified
[ ] Dates and deadlines confirmed
[ ] Financial terms verified
[ ] Legal terminology appropriate
[ ] Governing law specified
[ ] Signature blocks present
[ ] Exhibits/attachments included
[ ] Compliance with applicable laws
[ ] No conflicting provisions

COMMENTS AND RECOMMENDATIONS:
_____________________________________________
_____________________________________________
_____________________________________________

RISK ASSESSMENT:
[ ] Low Risk
[ ] Medium Risk
[ ] High Risk - Further review recommended

RECOMMENDATION:
[ ] Approved as-is
[ ] Approved with minor changes
[ ] Requires significant revision
[ ] Not recommended

_______________________          _______________________
[reviewer_name]                  Date
Reviewer`
  },
  s_corp_c_corp_formation: {
    name: 'S-corp or C-corp Formation',
    fields: ['corporation_name', 'state', 'shares_authorized', 'incorporator_name', 'registered_agent', 'effective_date'],
    template: `ARTICLES OF INCORPORATION

ARTICLE I - NAME
The name of this corporation is: [corporation_name]

ARTICLE II - PURPOSE
The purpose of the corporation is to engage in any lawful business activity.

ARTICLE III - AUTHORIZED SHARES
The corporation is authorized to issue [shares_authorized] shares of common stock.

ARTICLE IV - REGISTERED AGENT
The registered agent in [state] is: [registered_agent]

ARTICLE V - INCORPORATOR
The name of the incorporator is: [incorporator_name]

ARTICLE VI - BOARD OF DIRECTORS
The initial Board shall consist of one or more directors as determined by the incorporator.

ARTICLE VII - INDEMNIFICATION
The corporation shall indemnify directors and officers to the fullest extent permitted by law.

ARTICLE VIII - AMENDMENTS
These Articles may be amended by shareholder vote as provided by law.

EFFECTIVE DATE: [effective_date]

IN WITNESS WHEREOF, the incorporator has executed these Articles.

_______________________          _______________________
[incorporator_name]              Date
Incorporator

NOTE: For S-Corp election, file IRS Form 2553 within 75 days of formation.`
  },
  single_member_llc_formation: {
    name: 'Single Member LLC Formation',
    fields: ['llc_name', 'member_name', 'state', 'business_purpose', 'initial_contribution', 'effective_date'],
    template: `OPERATING AGREEMENT FOR SINGLE MEMBER LLC

OPERATING AGREEMENT OF [llc_name], LLC

This Operating Agreement is made as of [effective_date] by [member_name] (the "Member").

ARTICLE I - FORMATION
The Member forms a single member limited liability company in [state] under the name [llc_name], LLC.

ARTICLE II - PURPOSE
The purpose of the LLC is: [business_purpose]

ARTICLE III - MEMBER
The sole Member is: [member_name]
The Member holds 100% of the membership interest.

ARTICLE IV - CAPITAL CONTRIBUTION
Initial capital contribution: $[initial_contribution]

ARTICLE V - MANAGEMENT
The LLC shall be managed by its Member.

ARTICLE VI - DISTRIBUTIONS
The Member may make distributions at any time at Member's sole discretion.

ARTICLE VII - TAX TREATMENT
The LLC shall be treated as a disregarded entity for federal tax purposes unless the Member elects otherwise.

ARTICLE VIII - DISSOLUTION
The LLC shall dissolve upon Member's death, bankruptcy, or written decision to dissolve.

_______________________          _______________________
[member_name]                    Date
Member`
  }
};

interface DocumentFormFieldsProps {
  selectedTemplate: keyof typeof templates;
  templates: typeof templates;
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  onBack: () => void;
  onGenerate: () => void;
}

function DocumentFormFields({
  selectedTemplate,
  templates,
  formData,
  setFormData,
  onBack,
  onGenerate
}: DocumentFormFieldsProps) {
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const fieldConfigs = useMemo(() => {
    return templates[selectedTemplate].fields.map(field =>
      getFieldConfig(selectedTemplate, field)
    );
  }, [selectedTemplate, templates]);

  const validationStatus = useMemo(() => {
    const results: Record<string, { isValid: boolean; error: string | null }> = {};
    let allValid = true;
    let filledCount = 0;
    const totalRequired = fieldConfigs.filter(f => f.required).length;

    fieldConfigs.forEach(config => {
      const value = formData[config.name] || '';
      const result = validateField(value, config, formData);
      results[config.name] = result;

      if (config.required && value.trim()) {
        filledCount++;
      }

      if (config.required && !result.isValid) {
        allValid = false;
      }
    });

    return {
      results,
      allValid,
      filledCount,
      totalRequired,
      progress: totalRequired > 0 ? Math.round((filledCount / totalRequired) * 100) : 0
    };
  }, [fieldConfigs, formData]);

  const handleGenerate = () => {
    setAttemptedSubmit(true);
    if (validationStatus.allValid) {
      onGenerate();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-navy-900">
            {templates[selectedTemplate].name}
          </h3>
          <p className="text-sm text-navy-500 mt-1">
            Fill in the details below to generate your document
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-navy-500 mb-1">Completion</div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-navy-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    validationStatus.progress === 100
                      ? 'bg-green-500'
                      : validationStatus.progress > 50
                        ? 'bg-teal-500'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${validationStatus.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-navy-700">
                {validationStatus.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {attemptedSubmit && !validationStatus.allValid && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Please complete all required fields</p>
            <p className="text-sm text-amber-700 mt-1">
              {validationStatus.totalRequired - validationStatus.filledCount} required field(s) need your attention
            </p>
          </div>
        </div>
      )}

      {validationStatus.progress === 100 && validationStatus.allValid && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">All fields completed</p>
            <p className="text-sm text-green-700 mt-1">
              Your document is ready to generate
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {fieldConfigs.map((config) => (
          <ValidatedFormField
            key={config.name}
            config={config}
            value={formData[config.name] || ''}
            onChange={(value) => setFormData({ ...formData, [config.name]: value })}
            allValues={formData}
            showValidation={attemptedSubmit || (formData[config.name]?.length > 0)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-200">
        <div className="text-sm text-navy-500">
          <span className="text-red-500">*</span> Required fields
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-2.5 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleGenerate}
            disabled={attemptedSubmit && !validationStatus.allValid}
            className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
              validationStatus.allValid
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-navy-100 text-navy-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Generate Document
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [ocrPurpose, setOcrPurpose] = useState<'analyze' | 'draft'>('analyze');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [documentJurisdiction, setDocumentJurisdiction] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates | 'custom' | ''>('');
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [customDocumentType, setCustomDocumentType] = useState('');
  const [customDocumentDescription, setCustomDocumentDescription] = useState('');
  const [customDocumentParties, setCustomDocumentParties] = useState('');
  const [customDocumentDetails, setCustomDocumentDetails] = useState('');
  const [draftingMode, setDraftingMode] = useState<'quick_form' | 'associate' | 'partner'>('associate');
  const [draftingPresets, setDraftingPresets] = useState<Array<{
    mode: 'quick_form' | 'associate' | 'partner';
    display_name: string;
    description: string;
    min_tier: string;
    default_model: string;
    max_tokens: number;
    draft_passes: number;
    rag_top_k: number;
    system_prompt: string;
  }>>([]);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [analyzingDocument, setAnalyzingDocument] = useState<Document | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showIntelligenceHub, setShowIntelligenceHub] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isBusiness, isOrganization } = usePersonaRouting();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (searchParams.get('draft') !== '1') return;
    const goal = searchParams.get('goal') || '';
    const step = searchParams.get('step') || '';
    const detail = searchParams.get('detail') || '';
    if (!goal && !step) return;
    setSelectedTemplate('custom');
    setCustomDocumentType(step || 'Drafted document');
    setCustomDocumentDescription([goal, detail].filter(Boolean).join(' — '));
    setCustomDocumentDetails(detail);
    setDocumentTitle(step || goal);
    setShowModal(true);
    searchParams.delete('draft');
    searchParams.delete('goal');
    searchParams.delete('step');
    searchParams.delete('detail');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    async function loadPresets() {
      const { data } = await supabase
        .from('drafting_mode_presets')
        .select('mode, display_name, description, min_tier, default_model, max_tokens, draft_passes, rag_top_k, system_prompt')
        .order('display_order');
      if (!cancelled && data) {
        setDraftingPresets(data as typeof draftingPresets);
      }
    }
    loadPresets();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAdmin() {
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();
      if (!cancelled) setIsAdmin(Boolean(data?.is_admin));
    }
    loadAdmin();
    return () => { cancelled = true; };
  }, [user?.id]);

  const loadDocuments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleTemplateSelect = (template: keyof typeof templates) => {
    setSelectedTemplate(template);
    const templateData = templates[template];
    const initialFormData: { [key: string]: string } = {};
    templateData.fields.forEach(field => {
      initialFormData[field] = '';
    });
    setFormData(initialFormData);
    setDocumentTitle(templateData.name);
    setGeneratedContent('');
  };

  const generateDocument = () => {
    if (!selectedTemplate || selectedTemplate === 'custom') return;

    let content = templates[selectedTemplate].template;
    Object.entries(formData).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    });
    setGeneratedContent(content);
  };

  const generateCustomDocument = async () => {
    if (!customDocumentType.trim() || !customDocumentDescription.trim()) return;

    setIsGeneratingCustom(true);
    setGenerationStage('Preparing drafting brief');

    const preset = draftingPresets.find((p) => p.mode === draftingMode);
    const effectiveModel = selectedModel || preset?.default_model || undefined;
    const maxTokens = preset?.max_tokens ?? 8192;
    const draftPasses = preset?.draft_passes ?? 1;
    const ragTopK = preset?.rag_top_k ?? 0;

    try {
      let contextDocuments: Array<{ title: string; citation?: string; jurisdiction?: string; excerpt: string; url?: string }> = [];

      if (ragTopK > 0) {
        setGenerationStage('Retrieving controlling authorities');
        const retrievalQuery = `${customDocumentType}. ${customDocumentDescription}. ${customDocumentDetails}`.slice(0, 2000);
        try {
          const ragRes = await fetch(`${SUPABASE_URL}/functions/v1/legalbreeze-rag`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              query: retrievalQuery,
              sessionId: crypto.randomUUID(),
              jurisdiction: documentJurisdiction || 'Arizona',
              includeCompliance: false,
            }),
          });
          if (ragRes.ok) {
            const ragData = await ragRes.json();
            const citations = Array.isArray(ragData.citations) ? ragData.citations : [];
            contextDocuments = citations.slice(0, ragTopK).map((c: { title?: string; source?: string; jurisdiction?: string; excerpt?: string; url?: string }) => ({
              title: c.title || c.source || 'Authority',
              citation: c.source,
              jurisdiction: c.jurisdiction,
              excerpt: (c.excerpt || '').slice(0, 2400),
              url: c.url,
            }));
          }
        } catch (ragErr) {
          console.warn('RAG retrieval failed, continuing without grounding:', ragErr);
        }
      }

      setGenerationStage(
        draftingMode === 'partner'
          ? 'Drafting senior-partner document (multi-pass)'
          : draftingMode === 'associate'
          ? 'Drafting associate-level document'
          : 'Generating form'
      );

      const prompt = `Produce a complete legal document matching the specification below.

DOCUMENT TYPE: ${customDocumentType}

DESCRIPTION / PURPOSE: ${customDocumentDescription}

${customDocumentParties ? `PARTIES INVOLVED: ${customDocumentParties}\n` : ''}${customDocumentDetails ? `ADDITIONAL DETAILS: ${customDocumentDetails}\n` : ''}${documentJurisdiction ? `GOVERNING JURISDICTION: ${documentJurisdiction}\n` : ''}
Follow the drafting posture defined in your system instructions. Return the execution-ready document text only.`;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          sessionId: crypto.randomUUID(),
          userId: user?.id,
          jurisdiction: documentJurisdiction || 'General',
          modelOverride: effectiveModel,
          maxTokens,
          temperature: 0.2,
          draftingMode,
          draftPasses,
          contextDocuments,
          systemPromptOverride: preset?.system_prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const data = await response.json();
      let generatedText = data.response || '';

      const followUpStart = generatedText.indexOf('---FOLLOW_UP_QUESTIONS---');
      if (followUpStart !== -1) {
        generatedText = generatedText.substring(0, followUpStart).trim();
      }
      const thinkingEnd = generatedText.indexOf('---END_THINKING_DETAILS---');
      if (thinkingEnd !== -1) {
        generatedText = generatedText.substring(thinkingEnd + '---END_THINKING_DETAILS---'.length).trim();
      }

      setGeneratedContent(generatedText);
      setDocumentTitle(customDocumentType);

      if (user?.id) {
        await supabase.from('document_generation_requests').insert({
          user_id: user.id,
          document_type: customDocumentType,
          drafting_mode: draftingMode,
          model_used: data.modelUsed || effectiveModel || '',
          jurisdiction: documentJurisdiction || '',
          rag_context_count: data.ragContextCount ?? contextDocuments.length,
          draft_passes: data.draftPasses ?? draftPasses,
          tokens_used: data.usage?.totalTokens ?? 0,
          status: 'success',
        });
      }
    } catch (error) {
      console.error('Error generating custom document:', error);
      if (user?.id) {
        await supabase.from('document_generation_requests').insert({
          user_id: user.id,
          document_type: customDocumentType,
          drafting_mode: draftingMode,
          model_used: effectiveModel || '',
          jurisdiction: documentJurisdiction || '',
          rag_context_count: 0,
          draft_passes: draftPasses,
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      alert('Failed to generate document. Please try again.');
    } finally {
      setIsGeneratingCustom(false);
      setGenerationStage('');
    }
  };

  const handleSaveDocument = async () => {
    if (!generatedContent) return;

    if (!user) {
      const blob = new Blob([generatedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle || 'document'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Document downloaded! Sign up to save and manage all your documents online.');
      return;
    }

    const { error } = await supabase.from('documents').insert({
      user_id: user.id,
      title: documentTitle,
      document_type: selectedTemplate || 'custom',
      content: generatedContent,
      template_used: selectedTemplate || null,
      case_id: null,
      jurisdiction: documentJurisdiction || null,
    });

    if (!error) {
      setShowModal(false);
      setSelectedTemplate('');
      setFormData({});
      setGeneratedContent('');
      setDocumentTitle('');
      setDocumentJurisdiction('');
      loadDocuments();
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJurisdiction = !selectedJurisdiction || doc.jurisdiction === selectedJurisdiction;
    return matchesSearch && matchesJurisdiction;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {!user && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl px-6 py-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-navy-900">Try Document Generation Free!</p>
                <p className="text-sm text-navy-600">Generate documents now, sign up to save them online</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/signup"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold shadow-md text-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          {language === 'en' ? 'Legal Documents' : 'Documentos Legales'}
        </h1>
        <p className="text-navy-600">
          {language === 'en' ? 'Generate professional legal documents in minutes' : 'Genera documentos legales profesionales en minutos'}
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Workflow className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy-900">
                {language === 'en' ? 'Document Intelligence Hub' : 'Centro de Inteligencia Documental'}
              </h2>
              <p className="mt-0.5 max-w-2xl text-sm text-navy-600">
                {language === 'en'
                  ? 'Clause navigation, risk detection, drafting suggestions, intake triage, and multi-step research planning — all in one place.'
                  : 'Navegacion de clausulas, deteccion de riesgos, sugerencias de redaccion, triaje de admision y planificacion de investigacion.'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['Clause navigator', 'Risk detection', 'Clause suggestions', 'Intake triage', 'Research planner'].map((tag) => (
                  <span key={tag} className="rounded-full border border-teal-200 bg-white px-2 py-0.5 text-[11px] font-medium text-teal-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowIntelligenceHub((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Sparkles className="h-4 w-4" />
            {showIntelligenceHub
              ? language === 'en' ? 'Hide' : 'Ocultar'
              : language === 'en' ? 'Open hub' : 'Abrir'}
          </button>
        </div>
        {showIntelligenceHub && (
          <div className="mt-5">
            <DocumentIntelligencePanel documentId={null} documentContent="" />
            <p className="mt-3 text-xs text-navy-500">
              {language === 'en'
                ? 'To run clause navigation and risk detection on an existing document, click Analyze on any saved document card below.'
                : 'Para ejecutar navegacion de clausulas y deteccion de riesgos en un documento existente, haga clic en Analizar en cualquier tarjeta guardada.'}
            </p>
          </div>
        )}
      </div>

      {isOrganization && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Users className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 mb-1">
              {language === 'en' ? 'Organization Mode' : 'Modo Organizacion'}
            </p>
            <p className="text-amber-700">
              {language === 'en'
                ? 'Documents generated here are templates requiring attorney review before client distribution. Always verify jurisdiction-specific requirements.'
                : 'Los documentos generados aquí son plantillas que requieren revision de abogado antes de la distribucion al cliente. Siempre verifique los requisitos jurisdiccionales.'}
            </p>
          </div>
        </div>
      )}

      {isBusiness && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-800 mb-1">
              {language === 'en' ? 'Business Templates' : 'Plantillas de Negocios'}
            </p>
            <p className="text-blue-700">
              {language === 'en'
                ? 'Recommended: LLC Formation, Employment Agreements, NDAs, Consultant Agreements, and Master Service Agreements.'
                : 'Recomendados: Formacion de LLC, Contratos de Empleo, NDAs, Contratos de Consultor y Acuerdos de Servicios.'}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search documents...' : 'Buscar documentos...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="w-full lg:w-64">
            <div className="flex items-center gap-2">
              <MapPin className="text-navy-400 w-5 h-5 flex-shrink-0" />
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value)}
                className="flex-1 px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                aria-label="Filter by jurisdiction"
              >
                <option value="">All Jurisdictions</option>
                {JURISDICTION_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((jurisdiction) => (
                      <option key={jurisdiction.code} value={jurisdiction.code}>
                        {jurisdiction.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setOcrPurpose('analyze');
              setShowOCRScanner(true);
            }}
            className="bg-navy-700 hover:bg-navy-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Upload className="w-5 h-5" />
            {language === 'en' ? 'Upload to Analyze' : 'Subir para Analizar'}
          </button>
          <button
            onClick={() => {
              try {
                const storedGoal = sessionStorage.getItem('ezlegal-research-goal') || '';
                const storedStepRaw = sessionStorage.getItem('ezlegal-research-draft-step');
                const storedStep = storedStepRaw ? JSON.parse(storedStepRaw) : null;
                if (storedGoal || storedStep) {
                  setSelectedTemplate('custom');
                  setCustomDocumentType(storedStep?.title || 'Drafted document');
                  setCustomDocumentDescription(
                    [storedGoal, storedStep?.detail].filter(Boolean).join(' — ')
                  );
                  setCustomDocumentDetails(storedStep?.detail || '');
                  setDocumentTitle(storedStep?.title || storedGoal);
                }
              } catch {}
              setShowModal(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            {language === 'en' ? 'Generate Document' : 'Generar Documento'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy-900 mb-1 truncate">{doc.title}</h3>
                <p className="text-sm text-navy-500 capitalize">{doc.document_type.replace('_', ' ')}</p>
              </div>
            </div>

            <p className="text-sm text-navy-600 mb-4 line-clamp-3">
              {stripThinkingDetails(doc.content).substring(0, 150)}...
            </p>

            <div className="flex items-center justify-between text-xs text-navy-500">
              <div className="flex items-center gap-2">
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                {doc.jurisdiction && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                    <MapPin className="w-3 h-3" />
                    {getJurisdictionName(doc.jurisdiction)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAnalyzingDocument(doc)}
                  className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Workflow className="w-4 h-4" />
                  {language === 'en' ? 'Analyze' : 'Analizar'}
                </button>
                <button className="text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {language === 'en' ? 'Download' : 'Descargar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-navy-200">
          <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-navy-400" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            {language === 'en' ? 'No documents found' : 'No se encontraron documentos'}
          </h3>
          <p className="text-navy-600 mb-4">
            {language === 'en' ? 'Generate your first legal document' : 'Genera tu primer documento legal'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            {language === 'en' ? 'Generate Document' : 'Generar Documento'}
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-navy-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-navy-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy-900">
                {language === 'en' ? 'Generate Legal Document' : 'Generar Documento Legal'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTemplate('');
                  setFormData({});
                  setGeneratedContent('');
                  setDocumentTitle('');
                  setDocumentJurisdiction('');
                  setCustomDocumentType('');
                  setCustomDocumentDescription('');
                  setCustomDocumentParties('');
                  setCustomDocumentDetails('');
                }}
                className="text-navy-400 hover:text-navy-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {!selectedTemplate ? (
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">Choose a Template</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(templates).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => handleTemplateSelect(key as keyof typeof templates)}
                        className="p-4 border-2 border-navy-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
                      >
                        <FileText className="w-8 h-8 text-teal-600 mb-2" />
                        <h4 className="font-semibold text-navy-900">{template.name}</h4>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedTemplate('custom');
                        setDocumentTitle('');
                        setGeneratedContent('');
                      }}
                      className="p-4 border-2 border-dashed border-teal-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-left bg-gradient-to-br from-teal-50 to-white"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Wand2 className="w-8 h-8 text-teal-600" />
                        <span className="text-xs font-medium px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">AI-Powered</span>
                      </div>
                      <h4 className="font-semibold text-navy-900">Custom Document</h4>
                      <p className="text-sm text-navy-500 mt-1">Describe any document type and let AI generate it for you</p>
                    </button>
                  </div>
                </div>
              ) : selectedTemplate === 'custom' && !generatedContent ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-navy-900">Create Custom Document</h3>
                      <p className="text-sm text-navy-500 mt-1">Describe the document you need and AI will generate it</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-full">
                      <Wand2 className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-medium text-teal-700">AI-Powered</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Document Type <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customDocumentType}
                        onChange={(e) => setCustomDocumentType(e.target.value)}
                        placeholder="e.g., Independent Contractor Agreement, Cease and Desist Letter, Release of Liability..."
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <p className="text-xs text-navy-500 mt-1">Enter any type of legal document you need</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Description & Purpose <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={customDocumentDescription}
                        onChange={(e) => setCustomDocumentDescription(e.target.value)}
                        placeholder="Describe what this document is for, its purpose, and any specific requirements..."
                        rows={4}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Parties Involved
                      </label>
                      <input
                        type="text"
                        value={customDocumentParties}
                        onChange={(e) => setCustomDocumentParties(e.target.value)}
                        placeholder="e.g., Company ABC (Employer) and John Doe (Contractor)"
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Additional Details
                      </label>
                      <textarea
                        value={customDocumentDetails}
                        onChange={(e) => setCustomDocumentDetails(e.target.value)}
                        placeholder="Any specific terms, clauses, dates, amounts, or other details to include..."
                        rows={3}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Jurisdiction
                      </label>
                      <select
                        value={documentJurisdiction}
                        onChange={(e) => setDocumentJurisdiction(e.target.value)}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Select Jurisdiction (optional)</option>
                        {JURISDICTION_GROUPS.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((jurisdiction) => (
                              <option key={jurisdiction.code} value={jurisdiction.code}>
                                {jurisdiction.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <p className="text-xs text-navy-500 mt-1">If applicable, select the state whose laws should govern this document</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-navy-900 mb-3">
                      Drafting Posture
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { mode: 'quick_form' as const, icon: FileText, label: 'Quick Form', blurb: 'Clean fillable template. Ready in seconds.', badge: 'Free' },
                        { mode: 'associate' as const, icon: Scale, label: 'Associate Draft', blurb: 'Mid-level associate quality. Jurisdiction-aware.', badge: 'Free' },
                        { mode: 'partner' as const, icon: Award, label: 'Senior Partner', blurb: 'Am Law 100 execution-quality. Multi-pass with authority grounding.', badge: 'Premium' },
                      ].map(({ mode, icon: Icon, label, blurb, badge }) => {
                        const isSelected = draftingMode === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setDraftingMode(mode)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-teal-500 bg-teal-50 shadow-md'
                                : 'border-navy-200 bg-white hover:border-teal-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-navy-50 text-navy-600'}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-navy-900 text-sm">{label}</h4>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge === 'Premium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {badge}
                                  </span>
                                </div>
                                <p className="text-xs text-navy-600 mt-1 leading-relaxed">{blurb}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {draftingMode === 'partner' && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <Gavel className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-900">
                          Senior-partner mode retrieves controlling statutes and case law, drafts in three passes with self-critique, and produces a Drafting Notes appendix citing only verified authorities. Generation may take 30-90 seconds.
                        </p>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <AIModelSelector
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        variant="compact"
                        label="AI Model for Document Generation"
                        showDescription={false}
                      />
                      <p className="text-xs text-navy-500 mt-2">Admin only: Premium models (GPT-5 series) provide more comprehensive legal documents</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-200">
                    <div className="text-sm text-navy-500">
                      <span className="text-red-500">*</span> Required fields
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedTemplate('');
                          setCustomDocumentType('');
                          setCustomDocumentDescription('');
                          setCustomDocumentParties('');
                          setCustomDocumentDetails('');
                        }}
                        className="px-6 py-2.5 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={generateCustomDocument}
                        disabled={!customDocumentType.trim() || !customDocumentDescription.trim() || isGeneratingCustom}
                        className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                          customDocumentType.trim() && customDocumentDescription.trim() && !isGeneratingCustom
                            ? 'bg-teal-600 hover:bg-teal-700 text-white'
                            : 'bg-navy-200 text-navy-400 cursor-not-allowed'
                        }`}
                      >
                        {isGeneratingCustom ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {generationStage || 'Generating...'}
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5" />
                            Generate Document
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedTemplate !== 'custom' && !generatedContent ? (
                <DocumentFormFields
                  selectedTemplate={selectedTemplate as keyof typeof templates}
                  templates={templates}
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => {
                    setSelectedTemplate('');
                    setFormData({});
                  }}
                  onGenerate={generateDocument}
                />
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">Preview & Save</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Document Title
                      </label>
                      <input
                        type="text"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Jurisdiction
                      </label>
                      <div className="flex items-center gap-2">
                        <MapPin className="text-navy-400 w-5 h-5 flex-shrink-0" />
                        <select
                          value={documentJurisdiction}
                          onChange={(e) => setDocumentJurisdiction(e.target.value)}
                          className="flex-1 px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          aria-label="Select document jurisdiction"
                        >
                          <option value="">Select Jurisdiction</option>
                          {JURISDICTION_GROUPS.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                              {group.options.map((jurisdiction) => (
                                <option key={jurisdiction.code} value={jurisdiction.code}>
                                  {jurisdiction.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-navy-500 mt-1">
                        Select the jurisdiction this document applies to
                      </p>
                    </div>
                  </div>
                  <div className="bg-navy-50 border border-navy-200 rounded-lg p-6 mb-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-navy-700 font-mono">
                      {generatedContent}
                    </pre>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setGeneratedContent('')}
                      className="px-6 py-2 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleSaveDocument}
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                    >
                      {user ? 'Save Document' : 'Download Document'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {analyzingDocument && (
        <div className="fixed inset-0 bg-navy-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-4xl w-full my-8">
            <DocumentIntelligencePanel
              documentId={analyzingDocument.id}
              documentContent={analyzingDocument.content}
              onClose={() => setAnalyzingDocument(null)}
            />
          </div>
        </div>
      )}

      {showOCRScanner && (
        <div className="fixed inset-0 bg-navy-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="max-w-3xl w-full">
            <DocumentOCRProcessor
              onClose={() => setShowOCRScanner(false)}
              onTextExtracted={async (text) => {
                setShowOCRScanner(false);
                if (ocrPurpose === 'analyze') {
                  if (!user) return;
                  const title = `Uploaded document — ${new Date().toLocaleString()}`;
                  const { data, error } = await supabase
                    .from('documents')
                    .insert({
                      user_id: user.id,
                      title,
                      document_type: 'uploaded',
                      content: text,
                      template_used: null,
                      jurisdiction: selectedJurisdiction || null,
                    })
                    .select('id, title, document_type, content, template_used, created_at, jurisdiction')
                    .maybeSingle();
                  if (!error && data) {
                    loadDocuments();
                    setAnalyzingDocument(data as Document);
                  }
                } else {
                  setCustomDocumentDescription(text);
                  setSelectedTemplate('custom');
                  setShowModal(true);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

```

---

## src/pages/Negotiate.tsx

```tsx
import { useState } from 'react';
import { Target, TrendingUp, ArrowRight, Check, Shield, Brain, Sparkles, Handshake as HandshakeIcon, Building2, DollarSign, Clock, BookOpen, Play, Star, MessageSquare, Info, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import { useLanguage } from '../contexts/LanguageContext';
import usePersonaRouting from '../hooks/usePersonaRouting';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import NegotiationStrategyPlanner from '../components/NegotiationStrategyPlanner';
import NegotiationStrategyQuiz from '../components/NegotiationStrategyQuiz';

export default function Negotiate() {
  const { language } = useLanguage();
  const { isOrganization, isBusiness } = usePersonaRouting();
  const [showPlanner, setShowPlanner] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const features = [
    {
      icon: Target,
      title: language === 'en' ? 'BATNA Analysis' : 'Analisis BATNA',
      description: language === 'en'
        ? 'Calculate your negotiating leverage by evaluating alternatives'
        : 'Calcula tu poder de negociacion evaluando alternativas',
    },
    {
      icon: TrendingUp,
      title: language === 'en' ? 'ZOPA Calculator' : 'Calculadora ZOPA',
      description: language === 'en'
        ? 'Find the Zone of Possible Agreement where deals get done'
        : 'Encuentra la Zona de Posible Acuerdo donde se cierran tratos',
    },
    {
      icon: Sparkles,
      title: language === 'en' ? 'Anchoring Strategy' : 'Estrategia de Anclaje',
      description: language === 'en'
        ? 'Get AI-recommended opening numbers to maximize your outcome'
        : 'Obtiene numeros de apertura recomendados por IA para maximizar tu resultado',
    },
    {
      icon: MessageSquare,
      title: language === 'en' ? 'Ready Scripts' : 'Guiones Listos',
      description: language === 'en'
        ? 'Copy-and-send scripts for demands, counters, and tactics'
        : 'Guiones listos para copiar y enviar para demandas, contraofertas y tacticas',
    },
  ];

  const disputeTypes = [
    { name: language === 'en' ? 'Landlord Disputes' : 'Disputas con Casero', example: 'Security deposit, repairs, lease terms' },
    { name: language === 'en' ? 'Wage Claims' : 'Reclamos de Salarios', example: 'Unpaid wages, overtime, severance' },
    { name: language === 'en' ? 'Debt Collection' : 'Cobro de Deudas', example: 'Settlement negotiations, validation' },
    { name: language === 'en' ? 'Insurance Claims' : 'Reclamaciones de Seguro', example: 'Denied claims, low offers' },
    { name: language === 'en' ? 'Contract Disputes' : 'Disputas de Contratos', example: 'Breach, non-performance' },
    { name: language === 'en' ? 'Consumer Issues' : 'Problemas de Consumidor', example: 'Refunds, defective products' },
  ];

  const tactics = [
    {
      name: language === 'en' ? 'Anchoring' : 'Anclaje',
      description: language === 'en'
        ? 'The first number mentioned heavily influences the final outcome. Start ambitiously.'
        : 'El primer numero mencionado influye fuertemente en el resultado final. Empieza ambiciosamente.',
    },
    {
      name: language === 'en' ? 'Bracketing' : 'Acotamiento',
      description: language === 'en'
        ? '"If you move to X, I could accept Y" - a conditional offer that defines the settlement range.'
        : '"Si te mueves a X, podria aceptar Y" - una oferta condicional que define el rango de acuerdo.',
    },
    {
      name: language === 'en' ? 'Silence' : 'Silencio',
      description: language === 'en'
        ? 'After making an offer, wait. The discomfort of silence often leads them to improve their offer.'
        : 'Despues de hacer una oferta, espera. La incomodidad del silencio a menudo los lleva a mejorar su oferta.',
    },
    {
      name: language === 'en' ? 'Walk-Away Power' : 'Poder de Retirarse',
      description: language === 'en'
        ? 'A strong BATNA means you can walk away. This is your greatest source of leverage.'
        : 'Un BATNA fuerte significa que puedes retirarte. Esta es tu mayor fuente de poder.',
    },
  ];

  if (showPlanner) {
    return (
      <div className="min-h-screen bg-navy-50">
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <button
                  onClick={() => setShowPlanner(false)}
                  className="text-sm text-teal-600 hover:text-navy-700 mb-2"
                >
                  &larr; {language === 'en' ? 'Back to overview' : 'Volver a resumen'}
                </button>
                <h1 className="text-2xl font-bold text-navy-900">
                  {language === 'en' ? 'Negotiation Strategy Planner' : 'Planificador de Estrategia de Negociacion'}
                </h1>
                <p className="text-navy-600">
                  {language === 'en'
                    ? 'AmLaw 100 tactics, simplified for everyone'
                    : 'Tacticas de AmLaw 100, simplificadas para todos'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-navy-500">
                <Shield className="w-4 h-4" />
                <span>{language === 'en' ? 'Your data stays private' : 'Tus datos permanecen privados'}</span>
              </div>
            </div>

            <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-600">
              <Info className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
              <div>
                <span>
                  {language === 'en'
                    ? 'This tool provides legal information, not legal advice. It does not create an attorney-client relationship. For specific guidance on your situation, '
                    : 'Esta herramienta proporciona información legal, no asesoramiento legal. No crea una relacion abogado-cliente. Para orientación especifica sobre su situación, '
                  }
                </span>
                <Link to="/find-attorney" className="text-teal-600 hover:text-teal-700 font-medium">
                  {language === 'en' ? 'consult an attorney' : 'consulte a un abogado'}
                </Link>
                <span>
                  {language === 'en' ? ' or ' : ' o '}
                </span>
                <Link to="/pro-bono" className="text-teal-600 hover:text-teal-700 font-medium">
                  {language === 'en' ? 'check pro bono eligibility' : 'verifique elegibilidad pro bono'}
                </Link>
                <span>.</span>
              </div>
            </div>

            {isOrganization && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-800 mb-1">
                    {language === 'en' ? 'Organization Mode: Triage First' : 'Modo Organizacion: Triaje Primero'}
                  </p>
                  <p className="text-amber-700">
                    {language === 'en'
                      ? 'For client-facing negotiations, ensure the client has been screened for safety risks, active court orders, and crisis situations before generating scripts. Use this tool for case preparation -- not as direct client advice.'
                      : 'Para negociaciones con clientes, asegurese de que el cliente haya sido evaluado por riesgos de seguridad, ordenes judiciales activas y situaciones de crisis antes de generar guiones. Use esta herramienta para preparacion de casos, no como consejo directo al cliente.'}
                  </p>
                </div>
              </div>
            )}

            {isBusiness && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-800 mb-1">
                    {language === 'en' ? 'Business Disputes' : 'Disputas Comerciales'}
                  </p>
                  <p className="text-blue-700">
                    {language === 'en'
                      ? 'This tool supports contract disputes, vendor negotiations, lease terms, and B2B collections. For complex commercial litigation, we recommend consulting an attorney.'
                      : 'Esta herramienta apoya disputas de contratos, negociaciones con proveedores, terminos de arrendamiento y cobros B2B. Para litigios comerciales complejos, recomendamos consultar a un abogado.'}
                  </p>
                  <Link to="/find-attorney" className="text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block">
                    {language === 'en' ? 'Find a business attorney' : 'Encontrar un abogado de negocios'} &rarr;
                  </Link>
                </div>
              </div>
            )}

            <NegotiationStrategyPlanner />
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-full mb-6">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">
                {language === 'en' ? 'AI-Powered Negotiation Coach' : 'Coach de Negociacion Impulsado por IA'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'en'
                ? 'Stand Up for Yourself with the Right Words'
                : 'Defiendete con las Palabras Correctas'
              }
            </h1>

            <p className="text-xl text-white/70 mb-8">
              {language === 'en'
                ? 'Free AI-powered scripts and strategies for handling disputes with landlords, debt collectors, insurance companies, and employers. No legal experience needed.'
                : 'Scripts y estrategias gratuitas impulsadas por IA para manejar disputas con caseros, cobradores de deudas, aseguradoras y empleadores. No se necesita experiencia legal.'
              }
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowPlanner(true)}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Play className="w-5 h-5" />
                {language === 'en' ? 'Start Planning My Negotiation' : 'Empezar a Planificar Mi Negociacion'}
              </button>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {language === 'en' ? 'Learn the tactics first' : 'Aprende las tacticas primero'}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-navy-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              {language === 'en' ? 'The Tactics They Use Against You' : 'Las Tacticas Que Usan Contra Ti'}
            </h2>
            <p className="text-navy-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Insurance adjusters, debt collectors, landlords, and employers all use proven negotiation tactics. Now you can too.'
                : 'Ajustadores de seguros, cobradores de deudas, caseros y empleadores todos usan tacticas de negociacion probadas. Ahora tu también puedes.'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tactics.map((tactic, index) => (
              <div key={index} className="bg-navy-900 rounded-xl p-6 text-white">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-amber-400 font-bold">{index + 1}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{tactic.name}</h3>
                <p className="text-sm text-white/60">{tactic.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              {language === 'en' ? 'Works for Any Dispute' : 'Funciona para Cualquier Disputa'}
            </h2>
            <p className="text-navy-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Our negotiation framework adapts to your specific situation'
                : 'Nuestro marco de negociacion se adapta a tu situación especifica'
              }
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {disputeTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-xl p-5 border border-navy-200">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-navy-900">{type.name}</h3>
                    <p className="text-sm text-navy-500">{type.example}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  {language === 'en'
                    ? 'Why This Works'
                    : 'Por Que Esto Funciona'
                  }
                </h2>
                <div className="space-y-4 text-white/70">
                  <p>
                    {language === 'en'
                      ? "When a debt collector calls, they have scripts. When an insurance adjuster makes an offer, they have guidelines. When a landlord refuses your deposit, they're betting you don't know your rights."
                      : "Cuando un cobrador de deudas llama, tienen guiones. Cuando un ajustador de seguros hace una oferta, tienen pautas. Cuando un casero rechaza tu depósito, apuestan a que no conoces tus derechos."
                    }
                  </p>
                  <p>
                    {language === 'en'
                      ? "Our Negotiation Strategy Planner levels the playing field. It's built on proven negotiation frameworks and gives you the same preparation tools that make professional negotiators effective."
                      : "Nuestro Planificador de Estrategia de Negociacion nivela el campo de juego. Esta construido sobre marcos de negociacion probados y te da las mismas herramientas de preparacion que hacen efectivos a los negociadores profesionales."
                    }
                  </p>
                </div>

                <button
                  onClick={() => setShowPlanner(true)}
                  className="mt-8 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-900 px-6 py-3 rounded-xl font-bold transition-all"
                >
                  {language === 'en' ? 'Start My Negotiation Plan' : 'Comenzar Mi Plan de Negociacion'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold">73%</div>
                  </div>
                  <p className="text-sm text-white/60">
                    {language === 'en'
                      ? 'of people who prepare a negotiation strategy get better outcomes than those who wing it (Harvard PON research)'
                      : 'de las personas que preparan una estrategia de negociacion obtienen mejores resultados que los que improvisan (investigacion Harvard PON)'
                    }
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold">2-3x</div>
                  </div>
                  <p className="text-sm text-white/60">
                    {language === 'en'
                      ? 'the initial offer - typical improvement from proper anchoring technique (Galinsky & Mussweiler, negotiation research)'
                      : 'la oferta inicial - mejora tipica de la tecnica de anclaje adecuada (Galinsky & Mussweiler, investigacion de negociacion)'
                    }
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold">15 min</div>
                  </div>
                  <p className="text-sm text-white/60">
                    {language === 'en'
                      ? 'average time to complete your negotiation strategy - worth hours of better outcomes'
                      : 'tiempo promedio para completar tu estrategia de negociacion - vale horas de mejores resultados'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {language === 'en' ? 'Free Tool' : 'Herramienta Gratis'}
            </span>
          </div>

          <h2 className="text-3xl font-bold text-navy-900 mb-4">
            {language === 'en'
              ? 'Ready to Negotiate?'
              : 'Listo para Negociar?'
            }
          </h2>

          <p className="text-navy-600 mb-8 max-w-2xl mx-auto">
            {language === 'en'
              ? "Stop going into negotiations unprepared. In 15 minutes, you'll have a complete strategy with scripts, tactics, and numbers."
              : "Deja de entrar a negociaciones sin preparacion. En 15 minutos, tendras una estrategia completa con guiones, tacticas y numeros."
            }
          </p>

          <button
            onClick={() => setShowPlanner(true)}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <HandshakeIcon className="w-5 h-5" />
            {language === 'en' ? 'Start My Negotiation Strategy' : 'Comenzar Mi Estrategia de Negociacion'}
          </button>

          <p className="text-sm text-navy-500 mt-4">
            {language === 'en'
              ? 'No signup required. Your data stays private.'
              : 'Sin registro requerido. Tus datos permanecen privados.'
            }
          </p>

          <div className="mt-6 bg-white/80 border border-navy-200 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-xs text-navy-600 text-center">
              {language === 'en'
                ? 'Want a complete, downloadable PDF strategy document with all scenarios and risk assessments?'
                : 'Quieres un documento PDF completo y descargable con todos los escenarios y evaluaciones de riesgo?'}
            </p>
            <Link
              to="/issue-packs?topic=negotiation#negotiation"
              className="flex items-center justify-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 mt-2"
            >
              {language === 'en' ? 'Get Negotiation Strategy Pack - $49' : 'Obtener Paquete de Negociacion - $49'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <RelatedLinks />
      <Footer />
    </div>
  );
}

```

---

## src/pages/CasePredictor.tsx

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import {
  Sparkles, CheckCircle, ArrowRight, Shield, AlertTriangle,
  BarChart3, FileText, Scale, Brain, Clock, Lock, Users, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import VerifiableTrustStrip from '../components/VerifiableTrustStrip';
import InlineEmailCapture from '../components/InlineEmailCapture';
import CoverageConfidenceIndicator from '../components/CoverageConfidenceIndicator';
import AttorneyReferralDisclosure from '../components/AttorneyReferralDisclosure';
import { AttorneyServiceDisclosure } from '../components/shared';

export default function CasePredictor() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [sampleExpanded, setSampleExpanded] = useState(false);

  const startPrediction = () => {
    navigate('/case-predictor/start');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <VerifiableTrustStrip className="mt-[73px]" />
      <Breadcrumbs />

      <main id="main-content" className="pt-4">
        <section className="bg-gradient-to-br from-teal-800 to-teal-900 py-10 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-teal-100 mb-6">
                  <Sparkles className="w-4 h-4 text-gold-300" />
                  {language === 'en' ? 'AI CASE PREDICTOR' : 'PREDICTOR DE CASOS IA'}
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  {language === 'en'
                    ? 'Should You Fight Your Case?'
                    : 'Debes Pelear Tu Caso?'
                  }
                </h1>
                <p className="text-base sm:text-xl text-teal-100 mb-6 sm:mb-8 leading-relaxed">
                  {language === 'en'
                    ? 'See how likely you are to win in 2\u20133 minutes. Built for renters, workers, and small businesses \u2014 not lawyers.'
                    : 'Ve que tan probable es que ganes en 2\u20133 minutos. Hecho para inquilinos, trabajadores y pequeños negocios.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button
                    onClick={startPrediction}
                    className="bg-white text-teal-800 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    {language === 'en' ? 'Start Free \u2014 2 min' : 'Comenzar Gratis \u2014 2 min'}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-teal-100">
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold-300" /> {language === 'en' ? '2\u20133 min' : '2\u20133 min'}</div>
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-gold-300" /> {language === 'en' ? '1st prediction free' : '1ra gratis'}</div>
                  <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-gold-300" /> {language === 'en' ? 'Private & secure' : 'Privado'}</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/20 relative">
                <div className="absolute top-3 right-3 bg-amber-400/90 text-navy-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {language === 'en' ? 'Example' : 'Ejemplo'}
                </div>
                <div className="mb-4 sm:mb-6 pr-20 sm:pr-0 sm:text-center">
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1">{language === 'en' ? 'Sample Report' : 'Informe de Ejemplo'}</h3>
                  <p className="text-teal-200 text-xs sm:text-sm">{language === 'en' ? 'Eviction Defense \u2014 Arizona' : 'Defensa de Desalojo \u2014 Arizona'}</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-teal-200 text-xs sm:text-sm font-medium">{language === 'en' ? 'Likely outcome' : 'Resultado probable'}</span>
                      <span className="text-2xl font-bold text-green-400 font-serif">65-78%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '72%' }} />
                    </div>
                    <p className="text-teal-100 text-xs mt-2">{language === 'en' ? 'Chance of winning an eviction defense' : 'Probabilidad de ganar una defensa'}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSampleExpanded(!sampleExpanded)}
                    className="sm:hidden w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
                    aria-expanded={sampleExpanded}
                  >
                    {sampleExpanded
                      ? (language === 'en' ? 'Hide details' : 'Ocultar detalles')
                      : (language === 'en' ? 'See what\u2019s inside a report' : 'Ver que incluye un informe')}
                    {sampleExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className={`${sampleExpanded ? 'block' : 'hidden'} sm:block space-y-4`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white font-serif">{language === 'en' ? 'Hundreds' : 'Cientos'}</div>
                        <div className="text-teal-300 text-xs">{language === 'en' ? 'Similar cases compared' : 'Casos similares comparados'}</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-white font-serif">5</div>
                        <div className="text-teal-300 text-xs">{language === 'en' ? 'Key factors identified' : 'Factores clave'}</div>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-teal-200 text-xs font-medium mb-2">{language === 'en' ? 'TOP FACTORS IN YOUR FAVOR:' : 'FACTORES A TU FAVOR:'}</p>
                      <ul className="space-y-1.5">
                        {[
                          language === 'en' ? 'Written lease violation by landlord' : 'Violacion escrita del arrendador',
                          language === 'en' ? 'Notice period not met (ARS 33-1368)' : 'Periodo de aviso no cumplido',
                          language === 'en' ? 'Habitability complaints documented' : 'Quejas de habitabilidad documentadas',
                        ].map((text, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-teal-100">
                            <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-teal-300/70 text-[10px] text-center italic mt-3 border-t border-white/10 pt-2">
                      {language === 'en'
                        ? 'Fictional example. Actual reports are based on your specific case details.'
                        : 'Ejemplo ficticio. Los informes reales se basan en los detalles de tu caso.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-navy-900 mb-3">
                {language === 'en' ? 'How the Case Predictor Works' : 'Como Funciona el Predictor'}
              </h2>
              <p className="text-navy-500 text-sm">
                {language === 'en'
                  ? 'Takes about 2\u20133 minutes. You can review your results before subscribing.'
                  : 'Toma unos 2\u20133 minutos. Puedes ver tus resultados antes de suscribirte.'}
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: FileText,
                  title: language === 'en' ? 'Share Details' : 'Comparte Detalles',
                  desc: language === 'en'
                    ? 'Tell us your case type, state, and key facts.'
                    : 'Dinos el tipo de caso, estado y hechos clave.',
                },
                {
                  icon: Brain,
                  title: language === 'en' ? 'AI Analysis' : 'Analisis IA',
                  desc: language === 'en'
                    ? 'Our model compares your case to similar outcomes in your state.'
                    : 'Nuestro modelo compara tu caso con resultados similares.',
                },
                {
                  icon: BarChart3,
                  title: language === 'en' ? 'Get Your Estimate' : 'Obtén Tu Estimacion',
                  desc: language === 'en'
                    ? 'See an estimated likelihood range and confidence level.'
                    : 'Ve un rango de probabilidad estimado y nivel de confianza.',
                },
                {
                  icon: ArrowRight,
                  title: language === 'en' ? 'Get Next Steps' : 'Próximos Pasos',
                  desc: language === 'en'
                    ? 'Key factors and practical actions, including when to consult an attorney.'
                    : 'Factores clave y acciones practicas, incluyendo cuando consultar un abogado.',
                },
              ].map((item, i) => (
                <div key={item.title} className="text-center group">
                  <div className="w-14 h-14 bg-teal-50 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                    <item.icon className="w-7 h-7 text-teal-600" />
                  </div>
                  <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">{i + 1}</div>
                  <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-navy-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={startPrediction}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5" />
                {language === 'en' ? 'Start Free Case Prediction' : 'Iniciar Prediccion Gratis'}
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-navy-400 mt-3">
                {language === 'en'
                  ? 'Not legal advice. Statistical estimate only. No attorney-client relationship created.'
                  : 'No es asesoramiento legal. Solo estimacion estadistica.'}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50 border-y border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">
                {language === 'en' ? 'What You Get' : 'Que Obtienes'}
              </h2>
              <p className="text-navy-500 text-sm">
                {language === 'en'
                  ? 'Every prediction includes four deliverables in one report.'
                  : 'Cada prediccion incluye cuatro entregables en un informe.'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Estimated Likelihood Range' : 'Rango de Probabilidad Estimado'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'A percentage range\u2014with a confidence level\u2014based on comparable cases in your jurisdiction. Not a guarantee.'
                    : 'Un rango de porcentaje con nivel de confianza basado en casos comparables en tu jurisdicción.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Scale className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Key Factor Analysis' : 'Analisis de Factores Clave'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'The factors most likely to increase or decrease your estimated likelihood\u2014ranked by impact.'
                    : 'Los factores que mas aumentan o reducen tu probabilidad estimada, clasificados por impacto.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Similar Case Comparisons' : 'Comparaciones de Casos Similares'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'Examples of comparable cases in your state and how they were resolved, so you can see the pattern.'
                    : 'Ejemplos de casos comparables en tu estado y como se resolvieron para que puedas ver el patron.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Recommended Next Steps' : 'Próximos Pasos Recomendados'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'Practical next actions based on your estimate, including when it makes sense to consult an attorney.'
                    : 'Acciones practicas basadas en tu estimacion, incluyendo cuando tiene sentido consultar un abogado.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-navy-900 mb-3">{language === 'en' ? 'Pricing' : 'Precios'}</h2>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl border-2 border-teal-200 p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl font-bold font-serif text-navy-900 mb-2">$4.99</div>
                <p className="text-navy-500">{language === 'en' ? 'per prediction' : 'por prediccion'}</p>
              </div>
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-bold text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                {language === 'en' ? 'First prediction is FREE' : 'Primera prediccion es GRATIS'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                {[
                  language === 'en' ? 'Full prediction report' : 'Informe completo',
                  language === 'en' ? 'Factor analysis' : 'Analisis de factores',
                  language === 'en' ? 'Similar case data' : 'Datos de casos similares',
                  language === 'en' ? 'Next step recommendations' : 'Recomendaciones',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <button
                onClick={startPrediction}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                {language === 'en' ? 'Try Free Prediction' : 'Probar Prediccion Gratis'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="py-12 bg-navy-50 border-y border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-navy-900 mb-6 text-center">
              {language === 'en' ? 'Assumptions & Data Coverage' : 'Supuestos y Cobertura de Datos'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-navy-200 p-5">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'What Affects Accuracy' : 'Que Afecta la Precision'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Completeness of details you provide (more detail = narrower range)',
                    'Availability of comparable cases in your specific jurisdiction',
                    'Recency of case data (newer cases weighted more heavily)',
                    'Unique factors in your case that may not match historical patterns',
                  ] : [
                    'Completitud de los detalles que proporcionas (mas detalle = rango mas estrecho)',
                    'Disponibilidad de casos comparables en tu jurisdicción',
                    'Actualidad de los datos (casos recientes tienen mas peso)',
                    'Factores unicos en tu caso que pueden no coincidir con patrones historicos',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-navy-200 p-5">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'Data Coverage & Limitations' : 'Cobertura y Limitaciones de Datos'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Based on publicly available case outcome data from state and federal courts',
                    'Settlement outcomes (which are private) are not fully represented',
                    'Coverage varies by state and case type -- some areas have richer data',
                    'Data is updated periodically, not in real-time',
                  ] : [
                    'Basado en datos publicos de resultados de tribunales estatales y federales',
                    'Los acuerdos privados no estan completamente representados',
                    'La cobertura varia por estado y tipo de caso',
                    'Los datos se actualizan periodicamente, no en tiempo real',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 max-w-xl mx-auto">
              <CoverageConfidenceIndicator
                level="medium"
                caseType={language === 'en' ? 'Housing / Eviction' : 'Vivienda / Desalojo'}
                jurisdiction="Arizona"
              />
            </div>

            <div className="mt-8 max-w-xl mx-auto bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                {language === 'en' ? 'How We Calculate Coverage & Confidence' : 'Como Calculamos Cobertura y Confianza'}
              </h4>
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    {language === 'en' ? 'Source Coverage (25-95%)' : 'Cobertura de Fuentes (25-95%)'}
                  </p>
                  <p>
                    {language === 'en'
                      ? 'Measures how many relevant statutes, case outcomes, and legal references our system found for your specific case type and jurisdiction. Higher coverage means more data points inform the estimate. It does not measure prediction accuracy.'
                      : 'Mide cuantos estatutos, resultados de casos y referencias legales relevantes encontro nuestro sistema para tu tipo de caso y jurisdicción. Mayor cobertura significa mas datos informando la estimacion. No mide la precision de la prediccion.'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    {language === 'en' ? 'Coverage Confidence (High / Medium / Low)' : 'Confianza de Cobertura (Alta / Media / Baja)'}
                  </p>
                  <p>
                    {language === 'en'
                      ? 'Reflects the density and recency of publicly available case data for your state and case type. "High" means many recent comparable cases exist; "Low" means limited public data is available. Settlements and sealed cases are excluded from all calculations.'
                      : 'Refleja la densidad y actualidad de datos publicos de casos para tu estado y tipo de caso. "Alta" significa muchos casos recientes comparables; "Baja" significa datos publicos limitados. Los acuerdos y casos sellados se excluyen de todos los calculos.'}
                  </p>
                </div>
                <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-3">
                  {language === 'en'
                    ? 'These indicators help you understand the breadth of data behind your estimate -- not its correctness. Every legal situation is unique. Always consult a licensed attorney before making decisions.'
                    : 'Estos indicadores te ayudan a entender la amplitud de datos detras de tu estimacion, no su exactitud. Cada situación legal es unica. Siempre consulta un abogado antes de tomar decisiones.'}
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-md mx-auto">
              <InlineEmailCapture
                source="case_predictor"
                context="case_predictor"
                label={{
                  en: 'Email me a sample prediction report',
                  es: 'Enviar un informe de prediccion de muestra',
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AttorneyServiceDisclosure variant="expandable" context="case-predictor" />
          </div>
        </section>

        <section className="py-12 bg-amber-50 border-y border-amber-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">
                  {language === 'en' ? 'Important: What Case Predictor Is and Is Not' : 'Importante: Que Es y No Es el Predictor'}
                </h3>
                <div className="text-sm text-amber-800 space-y-2">
                  <p>{language === 'en' ? 'Case Predictor provides a statistical estimate based on publicly available case outcome data. It is NOT:' : 'El Predictor proporciona una estimacion estadistica. NO es:'}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{language === 'en' ? 'Legal advice or a guarantee of outcome' : 'Asesoramiento legal o garantia de resultado'}</li>
                    <li>{language === 'en' ? 'A substitute for consulting with a licensed attorney' : 'Un sustituto para consultar un abogado'}</li>
                    <li>{language === 'en' ? 'A determination of legal merit or viability of your case' : 'Una determinacion del merito legal de tu caso'}</li>
                  </ul>
                  <p>{language === 'en' ? 'Every case has unique circumstances. We strongly recommend consulting with an attorney before making legal decisions based on any prediction.' : 'Cada caso tiene circunstancias unicas. Recomendamos consultar un abogado antes de tomar decisiones legales.'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
              <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                {language === 'en' ? 'When NOT to Rely on This Tool' : 'Cuando NO Confiar en Esta Herramienta'}
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-left">
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Imminent deadlines' : 'Fechas limite inminentes'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'If you have a court date or statute of limitations expiring soon, contact an attorney immediately.' : 'Si tienes una fecha de corte próximo, contacta un abogado.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Criminal charges' : 'Cargos criminales'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'Criminal matters require attorney representation. Predictions cannot account for prosecutor discretion.' : 'Los asuntos penales requieren representacion legal.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Custody disputes' : 'Disputas de custodia'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'Family court decisions depend on judicial discretion that predictions cannot capture.' : 'Las decisiones de custodia dependen de la discrecion judicial.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Safety concerns' : 'Preocupaciones de seguridad'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'If you are in danger, call 911 or a crisis hotline immediately.' : 'Si estas en peligro, llama al 911 inmediatamente.'}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
                <Link to="/find-attorney" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? 'Find an attorney now' : 'Encontrar abogado ahora'}</Link>
                <span className="text-red-300">|</span>
                <Link to="/pro-bono" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? "Can't afford an attorney? Pro bono options" : 'Opciones pro bono'}</Link>
                <span className="text-red-300">|</span>
                <Link to="/emergency-resources" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? 'Emergency resources' : 'Recursos de emergencia'}</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">{language === 'en' ? 'Have Questions First?' : 'Tienes Preguntas Primero?'}</h2>
            <p className="text-navy-100 mb-8 text-lg">
              {language === 'en' ? 'Start with a free question to understand your situation, then use Case Predictor when ready.' : 'Comienza con una pregunta gratis, luego usa el Predictor cuando estes listo.'}
            </p>
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
            >
              {language === 'en' ? 'Ask My Question Free' : 'Hacer Mi Pregunta Gratis'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <RelatedLinks />
      <Footer />
    </div>
  );
}

```

---

## src/pages/IssuePacks.tsx

```tsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, Building2, Users, Briefcase, FileWarning, Handshake, CheckCircle, ArrowRight, Shield, Clock, FileText, AlertTriangle, Lock, Eye, RefreshCw, Phone, Ligature as FileSignature, UserCog, Landmark, BookOpen, BarChart3, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import HighRiskPackGate from '../components/HighRiskPackGate';
import VerifiableTrustStrip from '../components/VerifiableTrustStrip';
import InlineEmailCapture from '../components/InlineEmailCapture';
import AttorneyReferralDisclosure from '../components/AttorneyReferralDisclosure';
import RelatedLinks from '../components/RelatedLinks';
import IssuePackPreviewModal from '../components/IssuePackPreviewModal';
import IssuePackDeadlineScreening from '../components/IssuePackDeadlineScreening';

type Audience = 'individuals' | 'business' | 'legal_aid';

interface PackDef {
  id: string;
  icon: typeof Globe;
  color: string;
  highRisk: boolean;
  price: number;
  audience: Audience[];
  en: { name: string; desc: string; who: string; includes: string[]; sample: string };
  es: { name: string; desc: string; who: string; includes: string[]; sample: string };
}

const PACKS: PackDef[] = [
  {
    id: 'immigration',
    icon: Globe,
    color: 'amber',
    highRisk: true,
    price: 39,
    audience: ['individuals'],
    en: {
      name: 'Immigration Help Pack',
      desc: 'Deportation defense, visa issues, status questions, and ICE encounter rights.',
      who: 'People facing immigration questions, visa renewals, or deportation concerns.',
      includes: ['Step-by-step action plan for your issue type', 'Know Your Rights document (ICE encounters)', 'Emergency contact templates', 'Deadline checklist', 'Attorney referral matched to your area'],
      sample: 'Includes a 5-page action plan with state-specific contacts, fillable ICE encounter card, and 30-day access to updates.',
    },
    es: {
      name: 'Paquete de Inmigracion',
      desc: 'Defensa contra deportacion, problemas de visa, preguntas de estatus y derechos ante ICE.',
      who: 'Personas enfrentando preguntas de inmigracion o preocupaciones de deportacion.',
      includes: ['Plan de accion paso a paso', 'Documento de Conoce Tus Derechos (ICE)', 'Plantillas de contactos de emergencia', 'Lista de fechas limite', 'Referencia a abogado'],
      sample: 'Incluye un plan de accion de 5 paginas con contactos estatales.',
    },
  },
  {
    id: 'housing',
    icon: Building2,
    color: 'sky',
    highRisk: true,
    price: 29,
    audience: ['individuals'],
    en: {
      name: 'Housing & Eviction Pack',
      desc: 'Eviction defense, tenant rights, security deposits, and landlord disputes.',
      who: 'Tenants facing eviction, deposit disputes, or unsafe housing conditions.',
      includes: ['Eviction response template', 'Tenant rights guide for your state', 'Court calendar and preparation checklist', 'Evidence collection checklist', 'Attorney referral matched to your area'],
      sample: 'Includes a fillable eviction response, state-specific tenant rights summary, and 30-day deadline tracker.',
    },
    es: {
      name: 'Paquete de Vivienda y Desalojo',
      desc: 'Defensa contra desalojo, derechos de inquilino y depositos de seguridad.',
      who: 'Inquilinos enfrentando desalojo o disputas de depósito.',
      includes: ['Plantilla de respuesta a desalojo', 'Guia de derechos del inquilino', 'Calendario del tribunal', 'Lista de evidencia', 'Referencia a abogado'],
      sample: 'Incluye respuesta de desalojo rellenable y resumen de derechos.',
    },
  },
  {
    id: 'family',
    icon: Users,
    color: 'rose',
    highRisk: true,
    price: 39,
    audience: ['individuals'],
    en: {
      name: 'Family Matters Pack',
      desc: 'Divorce, child custody, support calculations, and domestic law guidance.',
      who: 'People navigating divorce, custody disputes, or family court proceedings.',
      includes: ['Self-representation guide', 'Custody and visitation templates', 'Child support calculator worksheet', 'Document preparation checklist', 'Attorney referral matched to your area'],
      sample: 'Includes custody proposal template, support calculation worksheet, and court prep guide.',
    },
    es: {
      name: 'Paquete de Asuntos Familiares',
      desc: 'Divorcio, custodia de hijos, calculos de manutencion y orientación.',
      who: 'Personas navegando divorcio o disputas de custodia.',
      includes: ['Guia de autorepresentacion', 'Plantillas de custodia', 'Hoja de calculo de manutencion', 'Lista de documentos', 'Referencia a abogado'],
      sample: 'Incluye plantilla de propuesta de custodia y guia de preparacion.',
    },
  },
  {
    id: 'employment',
    icon: Briefcase,
    color: 'emerald',
    highRisk: false,
    price: 29,
    audience: ['individuals'],
    en: {
      name: 'Employment & Wages Pack',
      desc: 'Wage claims, wrongful termination, workplace discrimination, and labor rights.',
      who: 'Workers dealing with unpaid wages, termination, or workplace issues.',
      includes: ['Wage claim filing guide', 'Demand letter templates', 'Evidence documentation guide', 'Filing deadline tracker', 'Attorney referral matched to your area'],
      sample: 'Includes fillable demand letter, wage calculation worksheet, and agency contact list.',
    },
    es: {
      name: 'Paquete de Empleo y Salarios',
      desc: 'Reclamos salariales, despido injustificado y derechos laborales.',
      who: 'Trabajadores con salarios impagos o problemas laborales.',
      includes: ['Guia de reclamo salarial', 'Plantillas de carta de demanda', 'Guia de documentacion', 'Rastreador de fechas', 'Referencia a abogado'],
      sample: 'Incluye carta de demanda rellenable y hoja de calculo salarial.',
    },
  },
  {
    id: 'debt',
    icon: FileWarning,
    color: 'teal',
    highRisk: false,
    price: 29,
    audience: ['individuals'],
    en: {
      name: 'Debt Defense Pack',
      desc: 'Debt validation, collection harassment, lawsuit response, and statute of limitations.',
      who: 'People being contacted by collectors or facing debt-related lawsuits.',
      includes: ['Debt validation letter templates', 'Lawsuit response guide', 'Statute of limitations checker', 'Negotiation scripts', 'Attorney referral matched to your area'],
      sample: 'Includes 3 letter templates, negotiation script library, and statute tracker.',
    },
    es: {
      name: 'Paquete de Defensa de Deudas',
      desc: 'Validacion de deudas, acoso de cobradores y respuesta a demandas.',
      who: 'Personas contactadas por cobradores o enfrentando demandas.',
      includes: ['Plantillas de carta de validacion', 'Guia de respuesta a demandas', 'Verificador de prescripción', 'Guiones de negociacion', 'Referencia a abogado'],
      sample: 'Incluye 3 plantillas de cartas y biblioteca de guiones de negociacion.',
    },
  },
  {
    id: 'smb_contract',
    icon: FileSignature,
    color: 'teal',
    highRisk: false,
    price: 249,
    audience: ['business'],
    en: {
      name: 'Contract Review Pack',
      desc: 'Plain-language contract review with risk flags and suggested redlines for small businesses.',
      who: 'SMB owners reviewing vendor, client, or partnership agreements before signing.',
      includes: ['Clause-by-clause risk breakdown', 'Suggested redlines in Word format', 'Plain-language summary memo', 'Negotiation leverage points', 'Attorney referral if escalation needed'],
      sample: 'Includes annotated contract with risk flags, redline suggestions, and 2-page summary memo.',
    },
    es: {
      name: 'Paquete de Revision de Contratos',
      desc: 'Revision de contratos en lenguaje claro con banderas de riesgo y sugerencias de cambios.',
      who: 'Dueños de pequenas empresas revisando acuerdos antes de firmar.',
      includes: ['Desglose de riesgo por clausula', 'Sugerencias de cambios en Word', 'Memo de resumen', 'Puntos de negociacion', 'Referencia a abogado si escala'],
      sample: 'Incluye contrato anotado con banderas de riesgo y memo de resumen.',
    },
  },
  {
    id: 'smb_employee',
    icon: UserCog,
    color: 'sky',
    highRisk: false,
    price: 199,
    audience: ['business'],
    en: {
      name: 'Employee Issue Pack',
      desc: 'Documentation, warning letters, and termination guidance that keeps you compliant.',
      who: 'SMB owners and managers handling performance issues, warnings, or terminations.',
      includes: ['Performance documentation templates', 'Progressive discipline letter library', 'Termination checklist by state', 'Separation agreement template', 'Attorney referral for wrongful-termination risk'],
      sample: 'Includes 4 warning-letter templates, termination checklist, and separation agreement.',
    },
    es: {
      name: 'Paquete de Problemas con Empleados',
      desc: 'Documentacion, cartas de advertencia y guia de terminacion que mantiene cumplimiento.',
      who: 'Dueños y gerentes manejando problemas de desempeno o terminaciones.',
      includes: ['Plantillas de documentacion', 'Biblioteca de cartas disciplinarias', 'Lista de terminacion por estado', 'Plantilla de acuerdo de separacion', 'Referencia a abogado'],
      sample: 'Incluye 4 plantillas de cartas y lista de terminacion.',
    },
  },
  {
    id: 'smb_vendor',
    icon: FileWarning,
    color: 'amber',
    highRisk: false,
    price: 149,
    audience: ['business'],
    en: {
      name: 'Vendor Dispute Pack',
      desc: 'Recover money and resolve vendor or client disputes without jumping to court.',
      who: 'SMBs dealing with unpaid invoices, non-delivery, or breach-of-contract claims.',
      includes: ['Demand letter template library', 'Small claims filing guide by state', 'Settlement negotiation scripts', 'Evidence and documentation checklist', 'Attorney referral for claims over $10k'],
      sample: 'Includes demand letter, small claims guide, and 3 negotiation scripts.',
    },
    es: {
      name: 'Paquete de Disputas con Proveedores',
      desc: 'Recupera dinero y resuelve disputas con proveedores o clientes sin ir a corte.',
      who: 'Empresas con facturas impagas o incumplimientos de contrato.',
      includes: ['Biblioteca de cartas de demanda', 'Guia de reclamos menores', 'Guiones de negociacion', 'Lista de evidencia', 'Referencia a abogado'],
      sample: 'Incluye carta de demanda y guiones de negociacion.',
    },
  },
  {
    id: 'negotiation',
    icon: Handshake,
    color: 'gold',
    highRisk: false,
    price: 49,
    audience: ['individuals', 'business'],
    en: {
      name: 'Negotiation Strategy Planner',
      desc: 'Your complete, exportable strategy document. Explore free tools at /negotiate first, then purchase your personalized PDF pack.',
      who: 'Anyone negotiating a settlement, debt resolution, lease terms, or business dispute.',
      includes: ['Tailored opening statement scripts', 'Settlement range calculator', 'Counter-offer strategies', 'Red flag detection for bad deals', 'Downloadable PDF strategy document'],
      sample: 'Includes personalized strategy document with 3 negotiation scenarios and risk assessment.',
    },
    es: {
      name: 'Planificador de Estrategia de Negociacion',
      desc: 'Estrategias de negociacion generadas por IA para acuerdos y disputas.',
      who: 'Cualquiera negociando un acuerdo, resolucion de deuda o disputa.',
      includes: ['Guiones de declaracion inicial', 'Calculadora de rango de acuerdo', 'Estrategias de contraoferta', 'Deteccion de banderas rojas', 'Documento PDF descargable'],
      sample: 'Incluye documento de estrategia personalizado con 3 escenarios.',
    },
  },
];

export default function IssuePacks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightTopic = searchParams.get('topic');
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeAudience, setActiveAudience] = useState<Audience>('individuals');
  const [previewPack, setPreviewPack] = useState<PackDef | null>(null);
  const [screeningPack, setScreeningPack] = useState<PackDef | null>(null);
  const [safetyGatePack, setSafetyGatePack] = useState<{ id: string; name: string } | null>(null);
  const [lsoForm, setLsoForm] = useState({ org: '', name: '', email: '', orgType: 'legal_aid', seats: '', notes: '' });
  const [lsoSubmitted, setLsoSubmitted] = useState(false);
  const [lsoSubmitting, setLsoSubmitting] = useState(false);
  const lang = language === 'en' ? 'en' : 'es';

  const visiblePacks = activeAudience === 'legal_aid'
    ? PACKS.filter((p) => p.audience.includes('individuals'))
    : PACKS.filter((p) => p.audience.includes(activeAudience));

  const proceedToCheckout = (packId: string) => {
    if (user) navigate(`/checkout?plan=${packId}`);
    else navigate(`/signup?plan=${packId}`);
  };

  const handlePurchase = (pack: PackDef) => {
    if (pack.highRisk) {
      setScreeningPack(pack);
    } else {
      proceedToCheckout(pack.id);
    }
  };

  const submitLsoInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLsoSubmitting(true);
    try {
      await supabase.from('lso_pricing_inquiries').insert({
        organization_name: lsoForm.org,
        contact_name: lsoForm.name,
        contact_email: lsoForm.email,
        org_type: lsoForm.orgType,
        seats_estimated: lsoForm.seats ? parseInt(lsoForm.seats, 10) : null,
        languages: ['en', 'es'],
        notes: lsoForm.notes,
      });
      setLsoSubmitted(true);
    } catch {
      setLsoSubmitted(true);
    } finally {
      setLsoSubmitting(false);
    }
  };

  const logScreeningOutcome = async (packId: string, outcome: 'proceeded' | 'declined') => {
    try {
      await supabase.from('issue_pack_safety_screenings').insert({
        user_id: user?.id ?? null,
        pack_id: packId,
        language,
        acknowledged: outcome === 'proceeded',
        outcome,
      });
    } catch {
      // non-blocking audit
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <VerifiableTrustStrip className="mt-[73px]" />

      <main id="main-content" className="pt-4">
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gold-400/20 text-gold-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <FileText className="w-4 h-4" />
              {language === 'en' ? 'ISSUE PACKS' : 'PAQUETES DE TEMAS'}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {language === 'en' ? 'Your Action Plan, Ready to Go' : 'Tu Plan de Accion, Listo para Usar'}
            </h1>
            <p className="text-xl text-navy-100 max-w-3xl mx-auto mb-8">
              {language === 'en'
                ? 'Each Issue Pack gives you a complete action plan built from attorney-reviewed templates, with document checklists, deadline trackers, and a matched attorney referral for your specific legal situation.'
                : 'Cada Paquete te da un plan de accion completo basado en plantillas revisadas por abogados, con listas de verificacion, rastreadores de fechas y referencia a abogado.'
              }
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-navy-200">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-400" /> {language === 'en' ? '30-day access' : '30 dias de acceso'}</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-teal-400" /> {language === 'en' ? 'State-specific' : 'Especifico por estado'}</div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-teal-400" /> {language === 'en' ? 'Secure checkout' : 'Pago seguro'}</div>
            </div>
          </div>
        </section>

        <section className="pt-10 pb-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <h2 className="text-base font-bold text-red-900 mb-1">
                    {language === 'en' ? 'In an emergency? Do not buy a pack first.' : 'En una emergencia? No compres un paquete primero.'}
                  </h2>
                  <p className="text-sm text-red-800 mb-3">
                    {language === 'en'
                      ? 'If you are currently detained, facing a hearing in the next 48 hours, locked out of your home, or in danger, get free urgent help before purchasing anything.'
                      : 'Si estas detenido, tienes audiencia en 48 horas, estas fuera de tu casa o en peligro, obten ayuda gratis y urgente antes de comprar.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/emergency-resources"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg"
                    >
                      <Phone className="w-4 h-4" />
                      {language === 'en' ? 'Emergency resources' : 'Recursos de emergencia'}
                    </Link>
                    <Link
                      to="/ask"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 text-sm font-semibold rounded-lg"
                    >
                      {language === 'en' ? 'Ask a free question first' : 'Hacer una pregunta gratis primero'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-navy-50 border border-navy-200 rounded-2xl" role="tablist" aria-label={language === 'en' ? 'Audience' : 'Audiencia'}>
              {([
                { id: 'individuals' as Audience, en: 'For Individuals & Families', es: 'Individuos y Familias', icon: Users },
                { id: 'business' as Audience, en: 'For Small Business', es: 'Pequenas Empresas', icon: Briefcase },
                { id: 'legal_aid' as Audience, en: 'For Legal Aid & Nonprofits', es: 'Ayuda Legal y ONG', icon: Landmark },
              ]).map((tab) => {
                const Icon = tab.icon;
                const active = activeAudience === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveAudience(tab.id)}
                    className={`flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active ? 'bg-white text-navy-900 shadow-sm border border-navy-200' : 'text-navy-600 hover:text-navy-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {language === 'en' ? tab.en : tab.es}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {activeAudience === 'legal_aid' && (
          <section className="py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-gold-400/20 rounded-xl flex items-center justify-center">
                    <Landmark className="w-6 h-6 text-gold-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {language === 'en' ? 'Legal Services Organization Plans' : 'Planes para Organizaciones de Servicios Legales'}
                    </h2>
                    <p className="text-sm text-navy-200">
                      {language === 'en' ? 'Volume access, caseworker dashboards, and shared intake for LSOs and nonprofits.' : 'Acceso por volumen, paneles de caseworkers y admision compartida.'}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-6 mb-8">
                  {([
                    { tier: 'Starter', seats: '1-5', price: 199, en: 'Single-office legal aid clinic', es: 'Clinica de ayuda legal de una oficina' },
                    { tier: 'Community', seats: '6-25', price: 499, en: 'County-wide nonprofit with caseworkers', es: 'Sin fines de lucro con caseworkers' },
                    { tier: 'Statewide', seats: '25+', price: 1499, en: 'Statewide LSO with multi-office access', es: 'LSO estatal con multi-oficina' },
                  ]).map((t) => (
                    <div key={t.tier} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="text-xs uppercase tracking-wide text-gold-300 font-bold mb-1">{t.tier}</div>
                      <div className="text-3xl font-bold font-serif mb-1">${t.price}<span className="text-sm font-normal text-navy-300">/mo</span></div>
                      <div className="text-xs text-navy-300 mb-3">{t.seats} {language === 'en' ? 'caseworker seats' : 'asientos'}</div>
                      <p className="text-sm text-navy-100">{language === 'en' ? t.en : t.es}</p>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-8 text-sm">
                  {([
                    { icon: BarChart3, en: 'Caseworker dashboard with client pipeline', es: 'Panel de caseworker con pipeline de clientes' },
                    { icon: Users, en: 'Shared intake forms with team access controls', es: 'Formularios de admision con controles de equipo' },
                    { icon: BookOpen, en: 'Grant reporting and aggregated impact metrics', es: 'Reportes de subvencion y metricas de impacto' },
                    { icon: Shield, en: 'SOC 2 + HIPAA-ready data handling', es: 'Manejo de datos SOC 2 y HIPAA-ready' },
                  ]).map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <Icon className="w-4 h-4 text-gold-300 flex-shrink-0 mt-0.5" />
                        <span className="text-navy-100">{language === 'en' ? f.en : f.es}</span>
                      </div>
                    );
                  })}
                </div>

                {!lsoSubmitted ? (
                  <form onSubmit={submitLsoInquiry} className="bg-white rounded-2xl p-5 sm:p-6 text-navy-900">
                    <h3 className="font-bold mb-1">{language === 'en' ? 'Get a custom quote' : 'Obten una cotizacion personalizada'}</h3>
                    <p className="text-xs text-navy-500 mb-4">{language === 'en' ? 'We respond within 2 business days with pricing and a pilot plan.' : 'Respondemos en 2 dias habiles.'}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input required placeholder={language === 'en' ? 'Organization name' : 'Nombre de la organizacion'} value={lsoForm.org} onChange={(e) => setLsoForm({ ...lsoForm, org: e.target.value })} className="px-3 py-2 border border-navy-200 rounded-lg text-sm" />
                      <input required placeholder={language === 'en' ? 'Your name' : 'Tu nombre'} value={lsoForm.name} onChange={(e) => setLsoForm({ ...lsoForm, name: e.target.value })} className="px-3 py-2 border border-navy-200 rounded-lg text-sm" />
                      <input required type="email" placeholder={language === 'en' ? 'Work email' : 'Correo de trabajo'} value={lsoForm.email} onChange={(e) => setLsoForm({ ...lsoForm, email: e.target.value })} className="px-3 py-2 border border-navy-200 rounded-lg text-sm" />
                      <input type="number" min="1" placeholder={language === 'en' ? 'Caseworker seats' : 'Asientos'} value={lsoForm.seats} onChange={(e) => setLsoForm({ ...lsoForm, seats: e.target.value })} className="px-3 py-2 border border-navy-200 rounded-lg text-sm" />
                      <select value={lsoForm.orgType} onChange={(e) => setLsoForm({ ...lsoForm, orgType: e.target.value })} className="px-3 py-2 border border-navy-200 rounded-lg text-sm sm:col-span-2">
                        <option value="legal_aid">{language === 'en' ? 'Legal aid organization' : 'Organizacion de ayuda legal'}</option>
                        <option value="nonprofit">{language === 'en' ? 'Nonprofit / community org' : 'Sin fines de lucro'}</option>
                        <option value="law_school">{language === 'en' ? 'Law school clinic' : 'Clinica de escuela de derecho'}</option>
                        <option value="court">{language === 'en' ? 'Court self-help center' : 'Centro de autoayuda de corte'}</option>
                      </select>
                      <textarea placeholder={language === 'en' ? 'Which practice areas? Anything else we should know?' : 'Que areas? Algo mas?'} value={lsoForm.notes} onChange={(e) => setLsoForm({ ...lsoForm, notes: e.target.value })} rows={3} className="px-3 py-2 border border-navy-200 rounded-lg text-sm sm:col-span-2" />
                    </div>
                    <button type="submit" disabled={lsoSubmitting} className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-navy-300 text-white rounded-xl font-bold text-sm">
                      <Mail className="w-4 h-4" />
                      {lsoSubmitting ? (language === 'en' ? 'Sending...' : 'Enviando...') : (language === 'en' ? 'Request LSO quote' : 'Solicitar cotizacion')}
                    </button>
                  </form>
                ) : (
                  <div className="bg-white rounded-2xl p-6 text-navy-900 text-center">
                    <CheckCircle className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                    <h3 className="font-bold mb-1">{language === 'en' ? 'Inquiry received' : 'Consulta recibida'}</h3>
                    <p className="text-sm text-navy-600">{language === 'en' ? 'We will reach out within 2 business days with pricing and next steps.' : 'Te contactaremos en 2 dias habiles.'}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeAudience === 'legal_aid' && (
              <div className="text-center mb-8">
                <p className="text-sm text-navy-500">
                  {language === 'en'
                    ? 'Your caseworkers can also use any individual pack on behalf of clients. Volume licensing is included in the plans above.'
                    : 'Tus caseworkers tambien pueden usar cualquier paquete individual para clientes.'}
                </p>
              </div>
            )}
            <div className="grid lg:grid-cols-2 gap-8">
              {visiblePacks.map((pack) => {
                const isHighlighted = highlightTopic === pack.id;
                const PackIcon = pack.icon;
                return (
                  <div
                    key={pack.id}
                    className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl ${
                      isHighlighted ? 'border-teal-400 shadow-lg ring-2 ring-teal-200' : 'border-navy-200'
                    } ${pack.id === 'negotiation' ? 'lg:col-span-2 max-w-2xl mx-auto w-full' : ''}`}
                  >
                    <div className={`p-6 sm:p-8 bg-gradient-to-br ${
                      pack.id === 'negotiation' ? 'from-navy-900 to-navy-800' : 'from-white to-navy-50'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            pack.id === 'negotiation' ? 'bg-gold-400' : `bg-${pack.color}-50`
                          }`}>
                            <PackIcon className={`w-7 h-7 ${pack.id === 'negotiation' ? 'text-navy-900' : `text-${pack.color}-600`}`} />
                          </div>
                          <div>
                            <h3 className={`text-xl font-bold ${pack.id === 'negotiation' ? 'text-white' : 'text-navy-900'}`}>
                              {pack[lang].name}
                            </h3>
                            <p className={`text-sm ${pack.id === 'negotiation' ? 'text-navy-200' : 'text-navy-500'}`}>
                              {pack[lang].desc}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className={`text-3xl font-bold font-serif ${pack.id === 'negotiation' ? 'text-gold-400' : 'text-navy-900'}`}>
                            ${pack.price}
                          </div>
                          <div className={`text-xs ${pack.id === 'negotiation' ? 'text-navy-300' : 'text-navy-400'}`}>
                            {language === 'en' ? 'one-time' : 'unico pago'}
                          </div>
                        </div>
                      </div>

                      {pack.highRisk && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span className="text-xs text-amber-700 font-medium">
                            {language === 'en' ? 'High-stakes situation - includes safety screening before purchase' : 'Situación de alto riesgo - incluye evaluacion de seguridad'}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${pack.id === 'negotiation' ? 'bg-white/10 text-navy-100' : 'bg-teal-50 text-teal-700 border border-teal-100'}`}>
                          <Globe className="w-3 h-3" />
                          {language === 'en' ? 'English + Español' : 'Ingles + Español'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${pack.id === 'negotiation' ? 'bg-white/10 text-navy-100' : 'bg-navy-50 text-navy-600 border border-navy-100'}`}>
                          <RefreshCw className="w-3 h-3" />
                          {language === 'en' ? '7-day refund if unused' : 'Reembolso 7 dias si no se usa'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewPack(pack)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium transition-colors ${pack.id === 'negotiation' ? 'bg-white/10 text-navy-100 hover:bg-white/20' : 'bg-navy-50 text-navy-600 border border-navy-100 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700'}`}
                        >
                          <Eye className="w-3 h-3" />
                          {language === 'en' ? 'Preview before pay' : 'Vista previa antes de pagar'}
                        </button>
                      </div>

                      <div className={`rounded-xl p-4 mb-4 ${pack.id === 'negotiation' ? 'bg-white/10' : 'bg-navy-50'}`}>
                        <h4 className={`text-xs font-bold uppercase tracking-wide mb-1 ${pack.id === 'negotiation' ? 'text-gold-300' : 'text-navy-500'}`}>
                          {language === 'en' ? 'WHO IS THIS FOR' : 'PARA QUIEN ES'}
                        </h4>
                        <p className={`text-sm ${pack.id === 'negotiation' ? 'text-navy-100' : 'text-navy-600'}`}>
                          {pack[lang].who}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className={`text-xs font-bold uppercase tracking-wide mb-3 ${pack.id === 'negotiation' ? 'text-gold-300' : 'text-navy-500'}`}>
                          {language === 'en' ? 'WHAT YOU GET' : 'QUE INCLUYE'}
                        </h4>
                        <ul className="space-y-2">
                          {pack[lang].includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${pack.id === 'negotiation' ? 'text-gold-400' : 'text-teal-600'}`} />
                              <span className={`text-sm ${pack.id === 'negotiation' ? 'text-navy-100' : 'text-navy-700'}`}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`rounded-lg p-3 mb-6 ${pack.id === 'negotiation' ? 'bg-white/5 border border-white/10' : 'bg-teal-50 border border-teal-100'}`}>
                        <p className={`text-xs ${pack.id === 'negotiation' ? 'text-navy-200' : 'text-teal-700'}`}>
                          <span className="font-semibold">{language === 'en' ? 'Sample output:' : 'Ejemplo:'}</span> {pack[lang].sample}
                        </p>
                      </div>

                      <button
                        onClick={() => handlePurchase(pack)}
                        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                          pack.id === 'negotiation'
                            ? 'bg-gold-400 hover:bg-gold-300 text-navy-900 shadow-lg hover:shadow-xl'
                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {pack.highRisk ? (
                          <>
                            <Shield className="w-4 h-4" />
                            {language === 'en' ? 'Start safety check' : 'Iniciar revision de seguridad'}
                          </>
                        ) : (
                          <>
                            {language === 'en' ? `Get ${pack[lang].name}` : `Obtener ${pack[lang].name}`}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <p className={`text-[11px] mt-2 text-center ${pack.id === 'negotiation' ? 'text-navy-300' : 'text-navy-400'}`}>
                        {language === 'en'
                          ? 'Legal information, not legal advice. Purchase does not create an attorney-client relationship.'
                          : 'Informacion legal, no asesoria legal. La compra no crea una relacion abogado-cliente.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50 border-t border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-navy-900 mb-3">
                {language === 'en' ? 'Free vs. Issue Packs' : 'Gratis vs. Paquetes de Temas'}
              </h2>
              <p className="text-navy-500">{language === 'en' ? 'Understand the difference' : 'Entiende la diferencia'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-navy-200 overflow-hidden">
              <div className="grid grid-cols-3">
                <div className="p-4 bg-navy-50 border-b border-r border-navy-200 font-bold text-navy-700 text-sm">{language === 'en' ? 'Feature' : 'Caracteristica'}</div>
                <div className="p-4 bg-navy-50 border-b border-r border-navy-200 text-center font-bold text-navy-700 text-sm">{language === 'en' ? 'Free Q&A' : 'Preguntas Gratis'}</div>
                <div className="p-4 bg-teal-50 border-b border-navy-200 text-center font-bold text-teal-700 text-sm">{language === 'en' ? 'Issue Pack' : 'Paquete'}</div>
              </div>
              {[
                { feature: language === 'en' ? 'AI legal answers' : 'Respuestas legales IA', free: true, pack: true },
                { feature: language === 'en' ? 'Unlimited follow-ups' : 'Seguimientos ilimitados', free: true, pack: true },
                { feature: language === 'en' ? 'Action plan document' : 'Documento de plan de accion', free: false, pack: true },
                { feature: language === 'en' ? 'Fillable templates' : 'Plantillas rellenables', free: false, pack: true },
                { feature: language === 'en' ? 'Deadline tracker' : 'Rastreador de fechas', free: false, pack: true },
                { feature: language === 'en' ? 'Attorney referral' : 'Referencia a abogado', free: false, pack: true },
                { feature: language === 'en' ? '30-day updates' : 'Actualizaciones por 30 dias', free: false, pack: true },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3">
                  <div className="p-3 border-b border-r border-navy-100 text-sm text-navy-700">{row.feature}</div>
                  <div className="p-3 border-b border-r border-navy-100 text-center">
                    {row.free ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <span className="text-navy-300">--</span>}
                  </div>
                  <div className="p-3 border-b border-navy-100 text-center bg-teal-50/50">
                    <CheckCircle className="w-5 h-5 text-teal-600 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-white border-t border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'What "Attorney-Reviewed Templates" Means' : 'Que Significa "Plantillas Revisadas por Abogados"'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Template documents and checklists are reviewed by licensed attorneys for legal accuracy',
                    'Templates are general-purpose, not customized legal advice for your specific case',
                    'Review is at the template level, not per-user or per-purchase',
                    'This does not create an attorney-client relationship',
                  ] : [
                    'Las plantillas son revisadas por abogados licenciados para precision legal',
                    'Las plantillas son de proposito general, no asesoria legal personalizada',
                    'La revision es a nivel de plantilla, no por usuario o por compra',
                    'Esto no crea una relacion abogado-cliente',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'What You\'ll Receive' : 'Lo Que Recibiras'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'PDF action plan with step-by-step instructions',
                    'Fillable document templates (Word/PDF format)',
                    'Interactive deadline checklist with key dates',
                    'Matched attorney referral in your area',
                    '30-day access to updates and revisions',
                  ] : [
                    'Plan de accion PDF con instrucciones paso a paso',
                    'Plantillas de documentos rellenables (Word/PDF)',
                    'Lista interactiva de fechas limite',
                    'Referencia a abogado en tu area',
                    '30 dias de acceso a actualizaciones',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-navy-50 border border-navy-200 rounded-lg p-3">
                  <p className="text-xs text-navy-500">
                    <span className="font-semibold">{language === 'en' ? 'After purchase:' : 'Despues de la compra:'}</span>{' '}
                    {language === 'en'
                      ? 'Instant access via your dashboard. Download or print at any time. Full refund available within 7 days if unused.'
                      : 'Acceso instantaneo en tu panel. Descarga o imprime en cualquier momento. Reembolso completo en 7 dias si no se usa.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <AttorneyReferralDisclosure variant="expandable" />
            </div>
            <div className="mt-8 max-w-md mx-auto">
              <InlineEmailCapture
                source="issue_packs_preview"
                context="issue_packs"
                label={{
                  en: 'Email me a sample action plan',
                  es: 'Enviar un plan de accion de muestra',
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">{language === 'en' ? 'Not Sure Which Pack You Need?' : 'No Sabes Cual Paquete Necesitas?'}</h2>
            <p className="text-navy-100 mb-8 text-lg">
              {language === 'en'
                ? 'Start with a free question. Our AI will help you understand your situation and recommend the right pack if one applies.'
                : 'Comienza con una pregunta gratis. Nuestra IA te ayudara a entender tu situación.'
              }
            </p>
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              {language === 'en' ? 'Ask My Question Free' : 'Hacer Mi Pregunta Gratis'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {screeningPack && (
        <IssuePackDeadlineScreening
          packId={screeningPack.id}
          packName={screeningPack[lang].name}
          onClose={() => {
            logScreeningOutcome(screeningPack.id, 'declined');
            setScreeningPack(null);
          }}
          onProceed={() => {
            const packId = screeningPack.id;
            logScreeningOutcome(packId, 'proceeded');
            setScreeningPack(null);
            proceedToCheckout(packId);
          }}
        />
      )}

      {previewPack && (
        <IssuePackPreviewModal
          packId={previewPack.id}
          packName={previewPack[lang].name}
          onClose={() => setPreviewPack(null)}
          onPurchase={() => {
            const pack = previewPack;
            setPreviewPack(null);
            handlePurchase(pack);
          }}
        />
      )}

      {safetyGatePack && (
        <HighRiskPackGate
          packId={safetyGatePack.id}
          packName={safetyGatePack.name}
          language={language}
          onContinue={() => {
            const packId = safetyGatePack.id;
            logScreeningOutcome(packId, 'proceeded');
            setSafetyGatePack(null);
            proceedToCheckout(packId);
          }}
          onClose={() => {
            logScreeningOutcome(safetyGatePack.id, 'declined');
            setSafetyGatePack(null);
          }}
        />
      )}

      <RelatedLinks fromPath="/issue-packs" />

      <Footer />
    </div>
  );
}

```

---

## src/pages/Toolkit.tsx

```tsx
import { useEffect, useState } from 'react';
import { FileText, QrCode, ScanText, Table as TableIcon, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { buildPdf, templateDefaults, type PdfTemplate } from '../lib/toolkit/pdf';
import { generateQrDataUrl, dataUrlToBlob, type QrEcc } from '../lib/toolkit/qr';
import { runOcr, type OcrLanguage } from '../lib/toolkit/ocr';
import { parseCsv, toCsv, downloadCsv } from '../lib/toolkit/csv';
import { savePdfJob, saveQrCode, saveOcrJob, saveCsvImport, loadHistory, type ToolkitHistory } from '../lib/toolkit/persist';

type Tab = 'pdf' | 'qr' | 'ocr' | 'csv';

const TABS: Array<{ id: Tab; label: string; icon: typeof FileText }> = [
  { id: 'pdf', label: 'PDF Builder', icon: FileText },
  { id: 'qr', label: 'QR Codes', icon: QrCode },
  { id: 'ocr', label: 'OCR', icon: ScanText },
  { id: 'csv', label: 'CSV Tools', icon: TableIcon },
];

export default function Toolkit() {
  const [tab, setTab] = useState<Tab>('pdf');
  const [history, setHistory] = useState<ToolkitHistory>({ pdfs: [], qrs: [], ocrs: [], csvs: [] });

  const refresh = async () => setHistory(await loadHistory());
  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Toolkit</h1>
          <p className="mt-2 text-slate-600">Generate PDFs, QR codes, run OCR, and manage CSVs. All results are stored securely to your account.</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                tab === id
                  ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {tab === 'pdf' && <PdfPanel onSaved={refresh} />}
            {tab === 'qr' && <QrPanel onSaved={refresh} />}
            {tab === 'ocr' && <OcrPanel onSaved={refresh} />}
            {tab === 'csv' && <CsvPanel onSaved={refresh} />}
          </div>
          <aside className="lg:col-span-1">
            <HistoryPanel tab={tab} history={history} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Card({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Status({ kind, children }: { kind: 'idle' | 'loading' | 'success' | 'error'; children: React.ReactNode }) {
  const styles = {
    idle: 'text-slate-500',
    loading: 'text-teal-700',
    success: 'text-emerald-700',
    error: 'text-rose-700',
  }[kind];
  const Icon = kind === 'loading' ? Loader2 : kind === 'success' ? CheckCircle2 : kind === 'error' ? AlertCircle : null;
  return (
    <div className={`flex items-center gap-2 text-sm ${styles}`}>
      {Icon && <Icon className={`w-4 h-4 ${kind === 'loading' ? 'animate-spin' : ''}`} />}
      <span>{children}</span>
    </div>
  );
}

function PdfPanel({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState('Matter Summary');
  const [template, setTemplate] = useState<PdfTemplate>('contract-summary');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const applyTemplate = (t: PdfTemplate) => {
    setTemplate(t);
    const d = templateDefaults(t);
    setTitle(d.title);
    setBody(d.sections.map((s) => `${s.heading ? `# ${s.heading}\n` : ''}${s.body}`).join('\n\n'));
  };

  const generate = async () => {
    setStatus('loading');
    try {
      const sections = body.split(/\n\n+/).map((chunk) => {
        const match = chunk.match(/^#\s+(.+)\n([\s\S]*)$/);
        return match ? { heading: match[1], body: match[2] } : { body: chunk };
      });
      const { blob } = buildPdf({ title, template, sections, footer: 'ezLegal.ai - Legal information, not legal advice.' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      await savePdfJob({ title, template, meta: { sections: sections.length } });
      setStatus('success');
      onSaved();
    } catch {
      setStatus('error');
    }
  };

  return (
    <Card title="PDF Builder" subtitle="Generate professional PDFs from built-in templates.">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
          <div className="grid grid-cols-2 gap-2">
            {(['contract-summary', 'intake-packet', 'risk-report', 'blank'] as PdfTemplate[]).map((t) => (
              <button
                key={t}
                onClick={() => applyTemplate(t)}
                className={`text-left px-3 py-2 rounded-lg border text-sm capitalize ${
                  template === t ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
          <p className="text-xs text-slate-500 mb-1">Use "# Heading" on its own line to add sections. Separate sections with a blank line.</p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <Status kind={status}>
            {status === 'idle' && 'Ready to generate.'}
            {status === 'loading' && 'Generating PDF...'}
            {status === 'success' && 'PDF downloaded and saved to history.'}
            {status === 'error' && 'Something went wrong. Try again.'}
          </Status>
          <button
            onClick={generate}
            disabled={status === 'loading'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            Generate PDF
          </button>
        </div>
      </div>
    </Card>
  );
}

function QrPanel({ onSaved }: { onSaved: () => void }) {
  const [label, setLabel] = useState('Intake link');
  const [payload, setPayload] = useState('https://ezlegal.ai');
  const [size, setSize] = useState(256);
  const [ecc, setEcc] = useState<QrEcc>('M');
  const [dataUrl, setDataUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const generate = async () => {
    setStatus('loading');
    try {
      const url = await generateQrDataUrl(payload, { size, ecc });
      setDataUrl(url);
      await saveQrCode({ label, payload, size, ecc, data_url: url });
      setStatus('success');
      onSaved();
    } catch {
      setStatus('error');
    }
  };

  const download = () => {
    if (!dataUrl) return;
    const blob = dataUrlToBlob(dataUrl);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label.replace(/\s+/g, '-').toLowerCase() || 'qr'}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card title="QR Codes" subtitle="Create shareable QR codes with error-correction control.">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payload (URL or text)</label>
            <textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Size (px)</label>
              <input
                type="number"
                min={128}
                max={1024}
                value={size}
                onChange={(e) => setSize(Number(e.target.value) || 256)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Error correction</label>
              <select value={ecc} onChange={(e) => setEcc(e.target.value as QrEcc)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Status kind={status}>
              {status === 'idle' && 'Enter a payload and generate.'}
              {status === 'loading' && 'Generating QR...'}
              {status === 'success' && 'QR saved to history.'}
              {status === 'error' && 'Failed to generate QR.'}
            </Status>
            <button onClick={generate} disabled={status === 'loading'} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:opacity-60">
              Generate
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 min-h-[280px]">
          {dataUrl ? (
            <>
              <img src={dataUrl} alt={label} className="rounded-lg shadow-sm bg-white" style={{ width: Math.min(size, 220), height: Math.min(size, 220) }} />
              <button onClick={download} className="mt-4 inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-800 font-medium">
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </>
          ) : (
            <div className="text-center text-slate-500 text-sm">
              <QrCode className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              Preview appears here.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function OcrPanel({ onSaved }: { onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<OcrLanguage>('eng');
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const run = async () => {
    if (!file) return;
    setStatus('loading');
    setProgress(0);
    try {
      const result = await runOcr(file, language, setProgress);
      setText(result.text);
      setConfidence(result.confidence);
      await saveOcrJob({ file_name: file.name, language, text: result.text, confidence: result.confidence });
      setStatus('success');
      onSaved();
    } catch {
      setStatus('error');
    }
  };

  return (
    <Card title="OCR" subtitle="Extract text from images. Processed locally in your browser.">
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image file</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white hover:file:bg-teal-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value as OcrLanguage)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="eng+spa">English + Spanish</option>
            </select>
          </div>
        </div>

        {status === 'loading' && (
          <div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">Recognizing text... {progress}%</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Status kind={status}>
            {status === 'idle' && (file ? 'Ready to run OCR.' : 'Choose an image file.')}
            {status === 'loading' && 'Running OCR in your browser...'}
            {status === 'success' && `Done. Confidence ${confidence ?? 0}%.`}
            {status === 'error' && 'OCR failed.'}
          </Status>
          <button onClick={run} disabled={!file || status === 'loading'} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:opacity-60">
            Run OCR
          </button>
        </div>

        {text && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Extracted text</label>
            <textarea readOnly value={text} rows={10} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm bg-slate-50" />
          </div>
        )}
      </div>
    </Card>
  );
}

function CsvPanel({ onSaved }: { onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [errors, setErrors] = useState<Array<{ line: number; message: string }>>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleFile = async () => {
    if (!file) return;
    setStatus('loading');
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setErrors(parsed.errors);
      await saveCsvImport({
        file_name: file.name,
        row_count: parsed.rows.length,
        error_count: parsed.errors.length,
        sample: parsed.rows.slice(0, 5),
      });
      setStatus('success');
      onSaved();
    } catch {
      setStatus('error');
    }
  };

  const exportClean = () => {
    if (headers.length === 0) return;
    downloadCsv('cleaned.csv', toCsv(headers, rows));
  };

  return (
    <Card title="CSV Tools" subtitle="Parse, validate, and export CSV files with schema feedback.">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">CSV file</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white hover:file:bg-teal-700"
          />
        </div>
        <div className="flex items-center justify-between">
          <Status kind={status}>
            {status === 'idle' && (file ? 'Ready to parse.' : 'Choose a CSV file.')}
            {status === 'loading' && 'Parsing CSV...'}
            {status === 'success' && `Parsed ${rows.length} rows. ${errors.length} issues.`}
            {status === 'error' && 'Failed to parse CSV.'}
          </Status>
          <div className="flex gap-2">
            <button onClick={handleFile} disabled={!file || status === 'loading'} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:opacity-60">
              Parse
            </button>
            <button onClick={exportClean} disabled={rows.length === 0} className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg disabled:opacity-60">
              Export
            </button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <div className="font-medium mb-1">Warnings</div>
            <ul className="list-disc ml-5 space-y-0.5">
              {errors.slice(0, 5).map((e, i) => (
                <li key={i}>Line {e.line}: {e.message}</li>
              ))}
              {errors.length > 5 && <li>...and {errors.length - 5} more.</li>}
            </ul>
          </div>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium border-b border-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-slate-50">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2 border-b border-slate-100 text-slate-700">{r[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && <div className="px-3 py-2 text-xs text-slate-500 bg-slate-50">Showing 10 of {rows.length} rows.</div>}
          </div>
        )}
      </div>
    </Card>
  );
}

function HistoryPanel({ tab, history }: { tab: Tab; history: ToolkitHistory }) {
  const items =
    tab === 'pdf'
      ? history.pdfs.map((p) => ({ id: p.id, title: p.title, sub: p.template, date: p.created_at }))
      : tab === 'qr'
      ? history.qrs.map((q) => ({ id: q.id, title: q.label || 'QR', sub: q.payload, date: q.created_at }))
      : tab === 'ocr'
      ? history.ocrs.map((o) => ({ id: o.id, title: o.file_name, sub: `${o.language} - ${o.confidence}%`, date: o.created_at }))
      : history.csvs.map((c) => ({ id: c.id, title: c.file_name, sub: `${c.row_count} rows, ${c.error_count} issues`, date: c.created_at }));

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent activity</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No items yet. Generate something to see it here.</p>
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 8).map((it) => (
            <li key={it.id} className="border-b border-slate-100 pb-3 last:border-none last:pb-0">
              <div className="text-sm font-medium text-slate-900 truncate">{it.title}</div>
              <div className="text-xs text-slate-500 truncate">{it.sub}</div>
              <div className="text-xs text-slate-400 mt-1">{new Date(it.date).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-slate-500">Saved securely via Supabase (row-level security).</p>
    </section>
  );
}

```

---

## src/pages/LawyerProfiles.tsx

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Award, Globe, MessageSquare,
  ArrowRight, Users, Briefcase, Info
} from 'lucide-react';
import AttorneyMatchingDisclosure from '../components/AttorneyMatchingDisclosure';
import LawyerProfileModal from '../components/LawyerProfileModal';
import { arizonaLawyers, practiceAreaCategories, type LawyerProfile } from '../data/arizonaLawyers';

export default function LawyerProfiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState<'experience' | 'price'>('experience');
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [spanishOnly, setSpanishOnly] = useState(false);
  const [freeConsultation, setFreeConsultation] = useState(false);
  const [flatFee, setFlatFee] = useState(false);
  const [contingencyFee, setContingencyFee] = useState(false);
  const [showRankingInfo, setShowRankingInfo] = useState(false);

  const filteredLawyers = arizonaLawyers
    .filter((lawyer) => {
      const matchesSearch =
        searchTerm === '' ||
        lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.practiceAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lawyer.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty =
        selectedSpecialty === 'all' || lawyer.practiceAreas.some(area =>
          area.toLowerCase().includes(selectedSpecialty.toLowerCase())
        );
      const matchesLanguage = !spanishOnly || lawyer.languages.includes('Spanish');
      const matchesFreeConsult = !freeConsultation || lawyer.offers?.includes('Free Consultation');
      const matchesFlatFee = !flatFee || lawyer.flatFeeAvailable;
      const matchesContingency = !contingencyFee || lawyer.offers?.includes('Contingency Fee');
      return matchesSearch && matchesSpecialty && matchesLanguage && matchesFreeConsult && matchesFlatFee && matchesContingency;
    })
    .sort((a, b) => {
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'price') return a.averageBillingRate - b.averageBillingRate;
      return 0;
    });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSpanishOnly(false);
    setFreeConsultation(false);
    setFlatFee(false);
    setContingencyFee(false);
  };

  const hasActiveFilters = selectedSpecialty !== 'all' || spanishOnly || searchTerm || freeConsultation || flatFee || contingencyFee;

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-semibold text-teal-300 uppercase tracking-wider">
              Attorney Directory
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Find Your Attorney
          </h1>
          <p className="text-navy-300 mb-8 max-w-xl">
            Browse verified, bar-licensed Arizona attorneys. Filter by specialty,
            language, and experience.
          </p>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, specialty, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-navy-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-base"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-navy-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedSpecialty('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSpecialty === 'all'
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
              }`}
            >
              All
            </button>
            {practiceAreaCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedSpecialty(
                  selectedSpecialty === cat.name ? 'all' : cat.name
                )}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSpecialty === cat.name
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={() => setFreeConsultation(!freeConsultation)}
              aria-pressed={freeConsultation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                freeConsultation
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              Free Consultation
            </button>
            <button
              onClick={() => setFlatFee(!flatFee)}
              aria-pressed={flatFee}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                flatFee
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              Flat Fee
            </button>
            <button
              onClick={() => setContingencyFee(!contingencyFee)}
              aria-pressed={contingencyFee}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                contingencyFee
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              Contingency Fee
            </button>
            <div className="w-px h-5 bg-navy-200 mx-1" />
            <button
              onClick={() => setSpanishOnly(!spanishOnly)}
              aria-pressed={spanishOnly}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                spanishOnly
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Spanish-Speaking Attorneys
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-navy-500 hidden sm:inline">Sort:</span>
              {([
                { key: 'experience' as const, label: 'Most Experience' },
              ]).map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSortBy(option.key)}
                  aria-pressed={sortBy === option.key}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    sortBy === option.key
                      ? 'bg-navy-900 text-white'
                      : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <div className="relative">
                <button
                  onClick={() => setShowRankingInfo(!showRankingInfo)}
                  className="flex items-center gap-1 text-xs text-navy-500 hover:text-teal-600 transition-colors"
                  aria-expanded={showRankingInfo}
                  aria-label="How is this sorted?"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline underline decoration-dotted underline-offset-2">How is this sorted?</span>
                </button>
                {showRankingInfo && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-navy-200 rounded-xl shadow-lg p-4 z-20">
                    <p className="text-sm text-navy-700 leading-relaxed">
                      Results are ranked by verified client reviews, relevance to your search, and location proximity.{' '}
                      <span className="font-semibold">No attorney pays for placement or priority positioning.</span>{' '}
                      ezLegal.ai has no sponsorship or commercial relationships that influence ordering.
                    </p>
                    <button
                      onClick={() => setShowRankingInfo(false)}
                      className="text-xs text-teal-600 hover:underline mt-2 font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-navy-600">
            <span className="font-semibold text-navy-900">{filteredLawyers.length}</span> verified attorney{filteredLawyers.length !== 1 ? 's' : ''}
            {selectedSpecialty !== 'all' && (
              <span> in <span className="font-semibold text-teal-700">{selectedSpecialty}</span></span>
            )}
            {spanishOnly && (
              <span> who speak <span className="font-semibold text-teal-700">Spanish</span></span>
            )}
            {freeConsultation && (
              <span> offering <span className="font-semibold text-green-700">free consultation</span></span>
            )}
            {flatFee && (
              <span>{freeConsultation ? ', ' : ' offering '}<span className="font-semibold text-green-700">flat fee</span></span>
            )}
            {contingencyFee && (
              <span>{(freeConsultation || flatFee) ? ', ' : ' offering '}<span className="font-semibold text-green-700">contingency fee</span></span>
            )}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-teal-600 hover:underline font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        <AttorneyMatchingDisclosure variant="panel" className="mb-6" />

        {filteredLawyers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-navy-200">
            <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-navy-400" />
            </div>
            <h2 className="text-lg font-semibold text-navy-900 mb-2">No attorneys found</h2>
            <p className="text-navy-600 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="text-teal-600 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-white rounded-2xl border border-navy-200 overflow-hidden hover:shadow-lg hover:border-navy-300 transition-all cursor-pointer group flex flex-col"
                onClick={() => setSelectedLawyer(lawyer)}
              >
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={lawyer.image}
                        alt={lawyer.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        lawyer.availability === 'Available' ? 'bg-green-500' :
                        lawyer.availability === 'Busy' ? 'bg-amber-500' : 'bg-navy-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-bold text-navy-900 truncate group-hover:text-teal-700 transition-colors">
                          {lawyer.name}
                        </h3>
                        {lawyer.verified && (
                          <div className="relative group/verified flex-shrink-0">
                            <Award className="w-4 h-4 text-teal-600" aria-label="Bar license verified by ezLegal.ai" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/verified:opacity-100 pointer-events-none transition-opacity shadow-lg">
                              Bar license verified by ezLegal.ai
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs text-teal-600 font-medium">{lawyer.experience} years experience</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-navy-600">
                        <MapPin className="w-3.5 h-3.5 text-navy-400 flex-shrink-0" />
                        <span className="truncate">{lawyer.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {lawyer.practiceAreas.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className="px-2 py-0.5 rounded-md text-xs font-medium bg-navy-100 text-navy-700"
                      >
                        {area}
                      </span>
                    ))}
                    {lawyer.practiceAreas.length > 3 && (
                      <span className="px-2 py-0.5 text-xs text-navy-400">
                        +{lawyer.practiceAreas.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-navy-400" />
                      {lawyer.experience} yrs
                    </span>
                    {lawyer.flatFeeAvailable && (
                      <span className="text-green-700 font-medium">Flat fee</span>
                    )}
                    {lawyer.averageBillingRate > 0 && (
                      <span className="font-medium">${lawyer.averageBillingRate}/hr</span>
                    )}
                    {lawyer.languages.includes('Spanish') && (
                      <span className="flex items-center gap-1 text-teal-700 font-medium">
                        <Globe className="w-3 h-3" />
                        Español
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-navy-600 line-clamp-2 mb-4 flex-1">{lawyer.bio}</p>

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedLawyer(lawyer); }}
                    className="w-full bg-navy-900 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-navy-900 to-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Not sure which attorney you need?
              </h3>
              <p className="text-navy-300 max-w-lg">
                Chat with our AI legal assistant to understand your situation first.
                Get matched to the right attorney for your specific needs.
              </p>
            </div>
            <Link
              to="/chat"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg whitespace-nowrap"
            >
              <MessageSquare className="w-5 h-5" />
              Chat with AI
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {selectedLawyer && (
        <LawyerProfileModal
          lawyer={selectedLawyer}
          onClose={() => setSelectedLawyer(null)}
        />
      )}
    </div>
  );
}

```

---

## src/pages/EZReads.tsx

```tsx
import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Users,
  Shield,
  Home,
  X,
  MapPin,
  ShieldCheck,
  Landmark,
  ChevronDown,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import Footer from '../components/Footer';
import ArticleModal from '../components/ArticleModal';
import ShareButton from '../components/ShareButton';
import GuidesSearch from '../components/guides/GuidesSearch';
import UrgentHelpBanner from '../components/guides/UrgentHelpBanner';
import SafetyEscalationStrip from '../components/guides/SafetyEscalationStrip';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { US_STATES, getJurisdictionName } from '../data/jurisdictions';
import { getArticleImage, onArticleImageError } from '../lib/article-images';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  image_url: string | null;
  is_featured: boolean;
  author_name: string;
  published_at: string;
  jurisdiction: string | null;
  review_status: string;
  sources: string | null;
  updated_at: string;
  last_reviewed_at: string | null;
}

const FALLBACK_ARTICLES_EN = [
  {
    slug: 'tenant-protection-laws',
    title: 'Understanding Your Rights: A Complete Guide to Tenant Protection Laws',
    excerpt:
      'Learn about your rights as a tenant, from security deposits to eviction protection. This comprehensive guide breaks down complex housing laws into plain English.',
    category: 'Housing Law',
    read_time: '12 min read',
    image_url:
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'security-deposit-rights',
    title: 'Security Deposits: What Landlords Can and Cannot Deduct',
    excerpt:
      'Understand the rules around security deposits, including legal limits, what can be deducted, and how to get your full deposit back when you move out.',
    category: 'Housing Law',
    read_time: '8 min read',
    image_url:
      'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'eviction-process-guide',
    title: 'Eviction Process Explained: Know Your Rights and Timeline',
    excerpt:
      'A step-by-step guide to the eviction process, including required notices, court procedures, and how to respond if you receive an eviction notice.',
    category: 'Housing Law',
    read_time: '15 min read',
    image_url:
      'https://images.pexels.com/photos/7578901/pexels-photo-7578901.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'small-claims-court-guide',
    title: 'Small Claims Court: How to File and Win Your Case',
    excerpt:
      'A step-by-step guide to navigating small claims court without an attorney. Learn what cases qualify, how to file, and tips for presenting your case.',
    category: 'Civil Law',
    read_time: '8 min read',
    image_url:
      'https://images.pexels.com/photos/6077123/pexels-photo-6077123.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'employment-rights-guide',
    title: 'Employment Rights Every Worker Should Know',
    excerpt:
      'From minimum wage to workplace discrimination, understand your fundamental rights as an employee and when to take action.',
    category: 'Employment Law',
    read_time: '10 min read',
    image_url:
      'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'creating-will-guide',
    title: 'Creating a Will Without a Lawyer: What You Need to Know',
    excerpt:
      'Essential information about estate planning for individuals and families. Learn what makes a will legally valid and common mistakes to avoid.',
    category: 'Estate Planning',
    read_time: '15 min read',
    image_url:
      'https://images.pexels.com/photos/4057663/pexels-photo-4057663.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const FALLBACK_ARTICLES_ES = [
  {
    slug: 'leyes-proteccion-inquilinos',
    title: 'Entendiendo Tus Derechos: Guia Completa de Leyes de Proteccion al Inquilino',
    excerpt:
      'Aprende sobre tus derechos como inquilino, desde depositos de seguridad hasta proteccion contra desalojos. Esta guia explica las leyes de vivienda en lenguaje simple.',
    category: 'Derecho de Vivienda',
    read_time: '12 min de lectura',
    image_url:
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'derechos-depósito-seguridad',
    title: 'Depositos de Seguridad: Que Puede y No Puede Descontar Tu Arrendador',
    excerpt:
      'Entiende las reglas sobre depositos de seguridad, incluyendo limites legales, que se puede descontar y como recuperar tu depósito completo cuando te mudas.',
    category: 'Derecho de Vivienda',
    read_time: '8 min de lectura',
    image_url:
      'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'guia-proceso-desalojo',
    title: 'Proceso de Desalojo Explicado: Conoce Tus Derechos y Plazos',
    excerpt:
      'Una guia paso a paso del proceso de desalojo, incluyendo avisos requeridos, procedimientos judiciales y como responder si recibes un aviso de desalojo.',
    category: 'Derecho de Vivienda',
    read_time: '15 min de lectura',
    image_url:
      'https://images.pexels.com/photos/7578901/pexels-photo-7578901.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'guia-reclamos-menores',
    title: 'Tribunal de Reclamos Menores: Como Presentar y Ganar Tu Caso',
    excerpt:
      'Guia paso a paso para navegar el tribunal de reclamos menores sin abogado. Aprende que casos califican, como presentar y consejos para tu caso.',
    category: 'Derecho Civil',
    read_time: '8 min de lectura',
    image_url:
      'https://images.pexels.com/photos/6077123/pexels-photo-6077123.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'derechos-laborales-guia',
    title: 'Derechos Laborales que Todo Trabajador Debe Conocer',
    excerpt:
      'Desde el salario minimo hasta la discriminacion laboral, entiende tus derechos fundamentales como empleado y cuando tomar accion.',
    category: 'Derecho Laboral',
    read_time: '10 min de lectura',
    image_url:
      'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'crear-testamento-guia',
    title: 'Crear un Testamento Sin Abogado: Lo Que Necesitas Saber',
    excerpt:
      'Información esencial sobre planificacion patrimonial para individuos y familias. Aprende que hace un testamento legalmente valido y errores comunes a evitar.',
    category: 'Testamentos y Sucesiones',
    read_time: '15 min de lectura',
    image_url:
      'https://images.pexels.com/photos/4057663/pexels-photo-4057663.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'horas-extra-no-pagadas',
    title: 'Horas Extra No Pagadas: Como Reclamar Lo Que Te Deben',
    excerpt:
      'Aprende como identificar si tu empleador te debe horas extra, los pasos para presentar una queja, y los plazos legales para reclamar salarios no pagados.',
    category: 'Derecho Laboral',
    read_time: '9 min de lectura',
    image_url:
      'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'proteccion-contra-cobradores',
    title: 'Proteccion Contra Cobradores de Deudas: Tus Derechos Bajo la Ley',
    excerpt:
      'Los cobradores de deudas tienen reglas que deben seguir. Conoce que pueden y no pueden hacer, como detener llamadas de acoso, y cuando disputar una deuda.',
    category: 'Proteccion al Consumidor',
    read_time: '10 min de lectura',
    image_url:
      'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'estafas-comunes-como-protegerte',
    title: 'Estafas Comunes y Como Protegerte: Guia del Consumidor',
    excerpt:
      'Identifica las estafas mas comunes que afectan a los consumidores, aprende a reconocer senales de alerta y conoce tus opciones legales si fuiste victima.',
    category: 'Proteccion al Consumidor',
    read_time: '11 min de lectura',
    image_url:
      'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'guia-divorcio-basica',
    title: 'Guia Basica de Divorcio: Proceso, Costos y Tus Derechos',
    excerpt:
      'Todo lo que necesitas saber sobre el proceso de divorcio, desde como presentar los documentos hasta la division de bienes y custodia de hijos.',
    category: 'Derecho Familiar',
    read_time: '14 min de lectura',
    image_url:
      'https://images.pexels.com/photos/4098232/pexels-photo-4098232.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'custodia-de-hijos-derechos',
    title: 'Custodia de Hijos: Entiende Tus Derechos y Opciones',
    excerpt:
      'Aprende sobre los diferentes tipos de custodia, como los tribunales toman decisiones, y que factores consideran para determinar el mejor interes del menor.',
    category: 'Derecho Familiar',
    read_time: '12 min de lectura',
    image_url:
      'https://images.pexels.com/photos/1683975/pexels-photo-1683975.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'disputas-entre-vecinos',
    title: 'Disputas Entre Vecinos: Soluciones Legales y Practicas',
    excerpt:
      'Desde ruido excesivo hasta limites de propiedad, aprende como resolver disputas con vecinos legalmente y cuando es necesario involucrar a las autoridades.',
    category: 'Derecho Civil',
    read_time: '8 min de lectura',
    image_url:
      'https://images.pexels.com/photos/2079234/pexels-photo-2079234.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

function formatUpdatedDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (lang === 'es') {
    if (diffDays < 1) return 'Actualizado hoy';
    if (diffDays < 7) return `Actualizado hace ${diffDays}d`;
    if (diffDays < 30) return `Actualizado hace ${Math.floor(diffDays / 7)}sem`;
    return `Actualizado ${date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
  }
  if (diffDays < 1) return 'Updated today';
  if (diffDays < 7) return `Updated ${diffDays}d ago`;
  if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)}w ago`;
  return `Updated ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

function toArticle(
  a: (typeof FALLBACK_ARTICLES_EN)[number],
  i: number
): Article {
  return {
    ...a,
    id: `fallback-${i}`,
    content: '',
    is_featured: i === 0,
    author_name: 'EZLegal.ai',
    published_at: new Date().toISOString(),
    jurisdiction: null,
    review_status: 'editorial_review',
    sources: null,
    updated_at: new Date().toISOString(),
    last_reviewed_at: null,
  };
}

function useCategories(t: (key: string) => string) {
  return useMemo(() => [
    { name: t('ezreads.category.housingLaw'), icon: Home, count: 14, examples: t('ezreads.category.housingExamples'), dbName: 'Housing Law' },
    { name: t('ezreads.category.employmentLaw'), icon: Users, count: 18, examples: t('ezreads.category.employmentExamples'), dbName: 'Employment Law' },
    { name: t('ezreads.category.consumerProtection'), icon: Shield, count: 15, examples: t('ezreads.category.consumerExamples'), dbName: 'Consumer Protection' },
    { name: t('ezreads.category.familyLaw'), icon: FileText, count: 12, examples: t('ezreads.category.familyExamples'), dbName: 'Family Law' },
    { name: t('ezreads.category.willsProbate'), icon: BookOpen, count: 8, examples: t('ezreads.category.willsExamples'), dbName: 'Wills & Probate' },
    { name: t('ezreads.category.civilLaw'), icon: Scale, count: 14, examples: t('ezreads.category.civilExamples'), dbName: 'Civil Law' },
  ], [t]);
}

export default function EZReads() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArticleLoading, setIsArticleLoading] = useState(false);
  const { language, t } = useLanguage();

  const categories = useCategories(t);
  const fallbackArticles = language === 'es' ? FALLBACK_ARTICLES_ES : FALLBACK_ARTICLES_EN;
  const dateLocale = language === 'es' ? 'es-ES' : 'en-US';

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, selectedJurisdiction, language]);

  async function fetchArticles() {
    setIsLoading(true);

    if (language === 'es') {
      setArticlesFromFallback();
      setIsLoading(false);
      return;
    }

    try {
      const dbCategory = selectedCategory
        ? categories.find(c => c.name === selectedCategory)?.dbName || selectedCategory
        : null;

      let query = supabase
        .from('ezreads_articles')
        .select(
          'id, slug, title, excerpt, category, read_time, image_url, is_featured, author_name, published_at, jurisdiction, review_status, sources, updated_at, last_reviewed_at'
        )
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (dbCategory) {
        query = query.eq('category', dbCategory);
      }
      if (selectedJurisdiction) {
        query = query.or(
          `jurisdiction.eq.${selectedJurisdiction},jurisdiction.is.null`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        setArticles(data.map((a) => ({ ...a, content: '' })));
      } else {
        setArticlesFromFallback();
      }
    } catch {
      setArticlesFromFallback();
    } finally {
      setIsLoading(false);
    }
  }

  function setArticlesFromFallback() {
    if (!selectedCategory) {
      setArticles(fallbackArticles.map(toArticle));
      return;
    }
    const dbCategory = categories.find(c => c.name === selectedCategory)?.dbName || selectedCategory;
    const filtered = fallbackArticles.filter(
      (a) => a.category === dbCategory || a.category === selectedCategory
    );
    setArticles(filtered.map(toArticle));
  }

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  async function openArticle(articleSlug: string) {
    setIsModalOpen(true);
    setIsArticleLoading(true);
    setSelectedArticle(null);

    try {
      const { data, error } = await supabase
        .from('ezreads_articles')
        .select('*')
        .eq('slug', articleSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSelectedArticle(data);
      } else {
        loadFallbackArticle(articleSlug);
      }
    } catch {
      loadFallbackArticle(articleSlug);
    } finally {
      setIsArticleLoading(false);
    }
  }

  function loadFallbackArticle(slug: string) {
    const fallback = fallbackArticles.find((a) => a.slug === slug);
    if (fallback) {
      setSelectedArticle({
        ...toArticle(fallback, 0),
        content: generatePlaceholderContent(fallback.title, fallback.excerpt),
      });
    }
  }

  function generatePlaceholderContent(title: string, excerpt: string): string {
    if (language === 'es') {
      return `
        <p class="text-lg font-medium text-navy-800 mb-6">${excerpt}</p>
        <h2>Resumen</h2>
        <p>Esta guia explica ${title.toLowerCase()} en pasos cortos. Conocer tus derechos te ayuda a tomar buenas decisiones.</p>
        <h2>Puntos Clave</h2>
        <ul>
          <li>Conoce tus derechos bajo las leyes federales y estatales aplicables</li>
          <li>Documenta todo por escrito cuando sea posible</li>
          <li>Busca asistencia legal si crees que tus derechos han sido violados</li>
          <li>Los plazos pueden aplicar - actua rapidamente para preservar tus opciones</li>
        </ul>
        <h2>Que Debes Hacer</h2>
        <p>Si te encuentras en una situación relacionada con este tema, considera los siguientes pasos:</p>
        <ol>
          <li>Reune todos los documentos y comunicaciones relevantes</li>
          <li>Investiga las leyes especificas que aplican en tu jurisdicción</li>
          <li>Considera consultar con un profesional legal para asesoramiento personalizado</li>
          <li>Mantene registros detallados de cualquier interaccion o incidente</li>
        </ol>
        <blockquote>
          <strong>Importante:</strong> Esto es información general, no consejo legal. Cada caso es distinto y las leyes cambian segun el lugar. Habla con un abogado para tu caso.
        </blockquote>
        <h2>Recursos Adicionales</h2>
        <p>Para información mas detallada sobre este tema, puedes usar nuestro asistente legal de IA para obtener respuestas a preguntas especificas sobre tu situación.</p>
      `;
    }
    return `
      <p class="text-lg font-medium text-navy-800 mb-6">${excerpt}</p>
      <h2>Overview</h2>
      <p>This article provides comprehensive information about ${title.toLowerCase()}. Understanding your legal rights is essential for protecting yourself and making informed decisions.</p>
      <h2>Key Points</h2>
      <ul>
        <li>Know your rights under applicable federal and state laws</li>
        <li>Document everything in writing whenever possible</li>
        <li>Seek legal assistance if you believe your rights have been violated</li>
        <li>Time limits may apply - act promptly to preserve your options</li>
      </ul>
      <h2>What You Should Do</h2>
      <p>If you find yourself in a situation related to this topic, consider the following steps:</p>
      <ol>
        <li>Gather all relevant documents and communications</li>
        <li>Research the specific laws that apply in your jurisdiction</li>
        <li>Consider consulting with a legal professional for personalized advice</li>
        <li>Keep detailed records of any interactions or incidents</li>
      </ol>
      <blockquote>
        <strong>Important:</strong> This article provides general legal information, not legal advice. Every situation is unique, and laws vary by jurisdiction. For guidance specific to your circumstances, consult with a qualified attorney.
      </blockquote>
      <h2>Additional Resources</h2>
      <p>For more detailed information on this topic, you can use our AI legal assistant to get answers to specific questions about your situation.</p>
    `;
  }

  function handleSearch(query: string, category?: string) {
    setSearchQuery(query);
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
  }

  function handleSearchClear() {
    setSearchQuery('');
  }

  function handleClearAllFilters() {
    setSelectedCategory(null);
    setSelectedJurisdiction('');
    setSearchQuery('');
  }

  const featuredArticle = filteredArticles.find((a) => a.is_featured) || filteredArticles[0];
  const regularArticles = filteredArticles.filter((a) => a !== featuredArticle);
  const hasActiveFilters = !!selectedCategory || !!selectedJurisdiction || !!searchQuery;

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8" />
              <span className="text-xl font-semibold">{t('ezreads.title')}</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">{t('ezreads.heroTitle')}</h1>
            <p className="text-xl text-navy-100 leading-relaxed mb-10">
              {t('ezreads.heroSubtitle')}
            </p>
            <GuidesSearch onSearch={handleSearch} onClear={handleSearchClear} />
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-navy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-navy-900">{t('ezreads.browseByCategory')}</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                <select
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="pl-9 pr-8 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer"
                  aria-label={t('ezreads.allStates')}
                >
                  <option value="">{t('ezreads.allStates')}</option>
                  {US_STATES.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy-600 hover:text-navy-900 bg-navy-100 hover:bg-navy-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t('ezreads.clearAll')}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.name ? null : category.name
                  )
                }
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all group ${
                  selectedCategory === category.name
                    ? 'bg-teal-600 border-teal-600'
                    : 'bg-navy-50 hover:bg-teal-50 border-navy-200 hover:border-teal-300'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-teal-500'
                      : 'bg-teal-50 group-hover:bg-teal-600'
                  }`}
                >
                  <category.icon
                    className={`w-6 h-6 transition-colors ${
                      selectedCategory === category.name
                        ? 'text-white'
                        : 'text-teal-600 group-hover:text-white'
                    }`}
                  />
                </div>
                <div className="text-center">
                  <div
                    className={`font-semibold text-sm ${
                      selectedCategory === category.name ? 'text-white' : 'text-navy-900'
                    }`}
                  >
                    {category.name}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      selectedCategory === category.name ? 'text-teal-200' : 'text-navy-500'
                    }`}
                  >
                    {category.count} {language === 'es' ? 'articulos' : 'articles'}
                  </div>
                  <div
                    className={`text-xs mt-1 leading-tight ${
                      selectedCategory === category.name ? 'text-teal-100' : 'text-navy-400'
                    }`}
                  >
                    {category.examples}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedCategory && (
            <div className="mt-6">
              <UrgentHelpBanner category={selectedCategory} />
            </div>
          )}
        </div>
      </section>

      <SafetyEscalationStrip />

      {searchQuery && (
        <section className="py-4 bg-teal-50 border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy-700">
                {t('ezreads.showingResults')}{' '}
                <span className="font-semibold">&ldquo;{searchQuery}&rdquo;</span>
                {selectedCategory && <span> {language === 'es' ? 'en' : 'in'} {selectedCategory}</span>}
                <span className="text-navy-500 ml-2">
                  ({filteredArticles.length}{' '}
                  {filteredArticles.length === 1
                    ? (language === 'es' ? 'articulo' : 'article')
                    : (language === 'es' ? 'articulos' : 'articles')})
                </span>
              </p>
              <button
                onClick={handleSearchClear}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {t('ezreads.clearSearch')}
              </button>
            </div>
          </div>
        </section>
      )}

      {isLoading ? (
        <section className="py-24 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-navy-600">{t('ezreads.loadingArticles')}</p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {!selectedCategory && !searchQuery && featuredArticle && (
            <section className="py-16 bg-navy-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-navy-900 mb-2">{t('ezreads.featuredArticle')}</h2>
                  <p className="text-navy-600">{t('ezreads.popularThisWeek')}</p>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow border border-navy-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="relative h-64 lg:h-auto">
                      <img
                        src={getArticleImage(featuredArticle.image_url, featuredArticle.category)}
                        alt={featuredArticle.title}
                        loading="lazy"
                        onError={onArticleImageError(featuredArticle.category)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-3 py-1 bg-teal-600 text-white text-sm font-semibold rounded-full">
                          {featuredArticle.category}
                        </span>
                        {featuredArticle.jurisdiction && (
                          <span className="px-3 py-1 bg-navy-700/80 backdrop-blur-sm text-white text-sm font-medium rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getJurisdictionName(featuredArticle.jurisdiction)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-navy-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredArticle.read_time}
                        </div>
                        <span className="text-navy-300">|</span>
                        <span>
                          {new Date(featuredArticle.published_at).toLocaleDateString(dateLocale, {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {featuredArticle.review_status === 'attorney_reviewed' && (
                          <>
                            <span className="text-navy-300">|</span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <ShieldCheck className="w-4 h-4" />
                              {t('ezreads.attorneyReviewed')}
                            </span>
                          </>
                        )}
                        {featuredArticle.review_status === 'official_sources' && (
                          <>
                            <span className="text-navy-300">|</span>
                            <span className="inline-flex items-center gap-1 text-teal-600 font-medium">
                              <Landmark className="w-4 h-4" />
                              {t('ezreads.officialSources')}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-3xl font-bold text-navy-900 mb-4 leading-tight">
                        {featuredArticle.title}
                      </h3>
                      <p className="text-lg text-navy-600 mb-4 leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                      {!featuredArticle.jurisdiction && (
                        <p className="text-xs text-navy-400 mb-4 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {t('ezreads.generalGuidance')}
                        </p>
                      )}
                      <button
                        onClick={() => openArticle(featuredArticle.slug)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors group w-fit"
                      >
                        {t('ezreads.readArticle')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-2">
                  {selectedCategory
                    ? `${selectedCategory}`
                    : searchQuery
                      ? t('ezreads.searchResults')
                      : t('ezreads.recentArticles')}
                </h2>
                <p className="text-navy-600">
                  {selectedCategory
                    ? `${filteredArticles.length} ${t('ezreads.articlesAbout')} ${selectedCategory.toLowerCase()}`
                    : searchQuery
                      ? `${filteredArticles.length} ${t('ezreads.articlesMatching')}`
                      : t('ezreads.latestGuides')}
                </p>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 mx-auto text-navy-300 mb-4" />
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">{t('ezreads.noArticles')}</h3>
                  <p className="text-navy-600 mb-6">
                    {searchQuery
                      ? t('ezreads.noArticlesSearch')
                      : t('ezreads.noArticlesCategory')}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAllFilters}
                      className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                    >
                      {t('ezreads.clearAllFilters')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(selectedCategory || searchQuery ? filteredArticles : regularArticles).map(
                    (article) => (
                      <article
                        key={article.id}
                        className="bg-white border border-navy-200 rounded-xl overflow-hidden hover:shadow-xl transition-all group"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={getArticleImage(article.image_url, article.category)}
                            alt={article.title}
                            loading="lazy"
                            onError={onArticleImageError(article.category)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-teal-600 text-xs font-semibold rounded-full">
                              {article.category}
                            </span>
                            {article.jurisdiction && (
                              <span className="px-2 py-1 bg-navy-800/80 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {getJurisdictionName(article.jurisdiction)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-navy-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.read_time}
                            </div>
                            {article.review_status === 'attorney_reviewed' && (
                              <>
                                <span className="text-navy-300">|</span>
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                  <ShieldCheck className="w-3 h-3" />
                                  {t('ezreads.attorneyReviewed')}
                                </span>
                              </>
                            )}
                            {article.review_status === 'official_sources' && (
                              <>
                                <span className="text-navy-300">|</span>
                                <span className="inline-flex items-center gap-1 text-teal-600 font-medium">
                                  <Landmark className="w-3 h-3" />
                                  {t('ezreads.officialSources')}
                                </span>
                              </>
                            )}
                          </div>
                          <details className="mb-3 text-xs text-navy-500">
                            <summary className="cursor-pointer select-none text-navy-500 hover:text-navy-700 list-none inline-flex items-center gap-1">
                              <span className="underline-offset-2 hover:underline">
                                {language === 'es' ? 'Detalles' : 'Details'}
                              </span>
                            </summary>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span>
                                {language === 'es' ? 'Publicado ' : 'Published '}
                                {new Date(article.published_at).toLocaleDateString(dateLocale, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              {article.updated_at !== article.published_at && (
                                <>
                                  <span className="text-navy-300">|</span>
                                  <span>{formatUpdatedDate(article.updated_at, language)}</span>
                                </>
                              )}
                              {article.jurisdiction && (
                                <>
                                  <span className="text-navy-300">|</span>
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {getJurisdictionName(article.jurisdiction)}
                                  </span>
                                </>
                              )}
                            </div>
                          </details>
                          <h3 className="text-xl font-bold text-navy-900 mb-3 leading-tight group-hover:text-teal-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-navy-600 mb-4 leading-relaxed text-sm">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => openArticle(article.slug)}
                                className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all"
                              >
                                {t('ezreads.readMore')}
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                            <ShareButton
                              variant="compact"
                              context="article"
                              title={article.title}
                              url={`${window.location.origin}/ezreads#${article.slug}`}
                            />
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section className="py-16 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-orange-200" />
          <h2 className="text-4xl font-bold mb-6">{t('ezreads.stayInformed')}</h2>
          <p className="text-xl text-navy-100 mb-8 max-w-2xl mx-auto">
            {t('ezreads.stayInformedDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder={t('ezreads.enterEmail')}
              className="flex-1 px-4 py-3 rounded-lg text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <button className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap">
              {t('ezreads.subscribe')}
            </button>
          </div>
          <p className="text-navy-200 text-sm mt-4">
            {t('ezreads.freeResources')}
          </p>
        </div>
      </section>

      <RelatedLinks />
      <Footer />

      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedArticle(null);
        }}
        isLoading={isArticleLoading}
      />
    </div>
  );
}

```

---

## src/pages/ForBusiness.tsx

```tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, FileText, Scale, Clock,
  Building2, Users, CheckCircle, Lock, AlertTriangle,
  DollarSign, Briefcase
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ScopeNotice } from '../components/shared/AISafetyMicrocopy';
import { trackEvent } from '../services/analytics-service';
import TrustCTABlock from '../components/trust/TrustCTABlock';
import BusinessIssueCards from '../components/BusinessIssueCards';
import { useLanguage } from '../contexts/LanguageContext';

const PROBLEMS = [
  {
    icon: FileText,
    title: 'Contracts & agreements',
    desc: 'Review vendor contracts, NDAs, and service agreements before you sign.',
    prompt: 'I need help reviewing a business contract before signing.',
  },
  {
    icon: Users,
    title: 'Employee issues',
    desc: 'Hiring, firing, harassment complaints, or wage questions.',
    prompt: 'I have an employee issue and need to understand my obligations.',
  },
  {
    icon: Scale,
    title: 'Customer disputes',
    desc: 'Refund demands, chargebacks, or threatening letters.',
    prompt: 'A customer is threatening legal action against my business.',
  },
  {
    icon: Building2,
    title: 'Business formation',
    desc: 'LLC vs. Corp, registered agents, operating agreements.',
    prompt: 'I need help choosing the right business structure.',
  },
  {
    icon: AlertTriangle,
    title: 'Compliance & regulations',
    desc: 'Licenses, permits, privacy policies, ADA, industry rules.',
    prompt: 'I need to understand compliance requirements for my business.',
  },
  {
    icon: DollarSign,
    title: 'Debt & collections',
    desc: 'Someone owes you money, or a vendor is threatening collections.',
    prompt: 'I need help with a business debt or collections issue.',
  },
];

const WORKFLOWS = [
  { title: 'Contract review', desc: 'Upload a contract and get a plain-language summary of risks and obligations.' },
  { title: 'Cease & desist drafting', desc: 'Generate a professional cease & desist letter with your facts.' },
  { title: 'Employee handbook check', desc: 'Identify missing policies that could expose you to liability.' },
  { title: 'LLC operating agreement', desc: 'Build a customized operating agreement with guided questions.' },
  { title: 'Privacy policy builder', desc: 'Generate a compliant privacy policy for your website.' },
  { title: 'Demand letter', desc: 'Create a demand letter to collect unpaid invoices from clients.' },
];

export default function ForBusiness() {
  useEffect(() => {
    trackEvent('page_view', { path: '/for-business' });
  }, []);

  const handleProblemClick = (prompt: string) => {
    try {
      window.sessionStorage.setItem('ez_chatbot_prefill', prompt);
    } catch { /* ignore */ }
    trackEvent('business_problem_selected', { prompt: prompt.slice(0, 40) });
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navigation />

      <main id="main-content">
        {/* Hero */}
        <section className="pt-24 sm:pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1.5 mb-6">
              <Briefcase className="w-4 h-4 text-sky-700" aria-hidden="true" />
              <span className="text-sm font-medium text-sky-800">For small & medium businesses</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              Practical legal workflows for small businesses.
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-7 text-slate-600">
              Contracts, compliance, employee issues, demand letters, and predictable pricing. ezLegal is not a law firm and does not replace attorney advice — but helps you prepare and know when you need one.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/start?persona=business"
                onClick={() => trackEvent('business_cta_clicked', { cta: 'hero_start_intake' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-700/20 hover:bg-sky-800 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                Start business intake
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/schedule-demo"
                onClick={() => trackEvent('business_cta_clicked', { cta: 'hero_demo' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                Schedule demo
              </Link>
              <Link
                to="/pricing"
                onClick={() => trackEvent('business_cta_clicked', { cta: 'hero_pricing' })}
                className="inline-flex items-center justify-center gap-2 rounded-full text-sm text-sky-700 hover:text-sky-900 font-medium px-4 py-3.5 transition"
              >
                View pricing
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              No credit card required. Free tier available.
            </p>
          </div>
        </section>

        {/* Common problems */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="problems-heading">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="problems-heading" className="text-2xl font-black text-center mb-3">
              Common business problems we help with
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
              Select your situation to start a conversation with context already loaded.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROBLEMS.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to="/chat"
                    onClick={() => handleProblemClick(card.prompt)}
                    className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 text-sky-700 shrink-0 group-hover:bg-sky-100 transition">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{card.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Productized workflows */}
        <section className="py-14" aria-labelledby="workflows-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="workflows-heading" className="text-2xl font-black text-center mb-3">
              Tools that save you time and money
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              Guided workflows that turn hours of legal work into minutes.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {WORKFLOWS.map((w) => (
                <div key={w.title} className="flex items-start gap-3 p-5 rounded-xl border border-slate-200 bg-white">
                  <CheckCircle className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{w.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Procurement trust strip */}
        <section className="py-10 bg-slate-50 border-y border-slate-200" aria-labelledby="trust-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="trust-heading" className="sr-only">Security and compliance</h2>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-6">
              {[
                { icon: Shield, text: 'Information, not legal advice — scope is clear' },
                { icon: Lock, text: 'Encrypted in transit and at rest' },
                { icon: Users, text: 'Connect to a lawyer when you need one' },
                { icon: Clock, text: 'Answers in under 60 seconds' },
              ].map(({ icon: I, text }) => (
                <div key={text} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <I className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/trust-center" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                Trust Center
              </Link>
              <Link to="/enterprise-security" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                Enterprise Security
              </Link>
              <Link to="/sla" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                SLA & Uptime
              </Link>
              <Link to="/ai-governance" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                AI Governance
              </Link>
            </div>
          </div>
        </section>

        {/* Business onboarding cards */}
        <section className="py-14" aria-labelledby="onboarding-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="onboarding-heading" className="text-2xl font-black text-center mb-3">
              Get started in 3 simple steps
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
              No jargon, no appointments, no surprise bills.
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { num: 1, title: 'Tell us your concern', desc: 'Pick a category above, or just describe your situation in plain language.' },
                { num: 2, title: 'Get organized guidance', desc: 'We summarize risks, obligations, and deadlines in clear language.' },
                { num: 3, title: 'Take action', desc: 'Use our document tools, or connect with an attorney if needed.' },
              ].map((card) => (
                <div key={card.num} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                  <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sm font-bold text-sky-700">{card.num}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{card.title}</h3>
                  <p className="text-sm text-slate-600">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="py-14" aria-labelledby="pricing-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="pricing-heading" className="text-2xl font-black mb-3">
              Predictable pricing, not surprise invoices
            </h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Most business owners pay $300-500 per hour for legal help. We start at a fraction of that.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { name: 'Free', price: '$0', desc: '3 questions/month, basic guidance' },
                { name: 'Business', price: '$99/mo', desc: 'Unlimited questions, document tools, team access' },
                { name: 'Enterprise', price: 'Custom', desc: 'Dedicated support, API, compliance features' },
              ].map((tier) => (
                <div key={tier.name} className="p-5 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm font-medium text-slate-500 mb-1">{tier.name}</p>
                  <p className="text-2xl font-black text-slate-900 mb-2">{tier.price}</p>
                  <p className="text-sm text-slate-600">{tier.desc}</p>
                </div>
              ))}
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1 mt-6 text-sm font-medium text-sky-700 hover:text-sky-900 transition"
            >
              See full pricing details
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Trust links */}
        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <TrustCTABlock variant="standard" />
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <ScopeNotice className="max-w-xl mx-auto" />
            <p className="text-xs text-slate-500 text-center mt-3 max-w-lg mx-auto">
              ezLegal helps organize legal information and generate documents. It does not replace a lawyer.
            </p>
          </div>
        </section>

        {/* Not sure section */}
        <section className="py-8 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-slate-600 mb-3">Not sure which option is right for your business?</p>
            <Link
              to="/start"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-900 transition"
            >
              Take the guided questionnaire
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* SMB use-case breakdown */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="smb-breakdown-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="smb-breakdown-heading" className="text-2xl font-black text-center mb-3">
              What you can do — and when to get help
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-lg mx-auto">
              For each business situation, here is what is free, when human help matters, and what may cost extra.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Contract review',
                  free: 'AI summary of key terms, risks, and deadlines.',
                  human: 'When terms are unusual, high-value, or disputed.',
                  paid: 'Detailed clause-by-clause analysis. Attorney review when available.',
                },
                {
                  title: 'Hiring / employee issue',
                  free: 'General employment law information. Common next steps.',
                  human: 'When termination, discrimination, or wages are involved.',
                  paid: 'Document preparation for HR actions. Compliance checklists.',
                },
                {
                  title: 'Customer nonpayment',
                  free: 'Demand letter template. Explanation of small claims process.',
                  human: 'When amount exceeds small claims limit or debtor is unresponsive.',
                  paid: 'Custom demand letter preparation. Filing guidance.',
                },
                {
                  title: 'Lease / vendor dispute',
                  free: 'Plain-language lease summary. Identify key obligations.',
                  human: 'When breach is alleged or eviction is threatened.',
                  paid: 'Response letter preparation. Dispute documentation.',
                },
                {
                  title: 'Business formation / compliance',
                  free: 'Entity comparison (LLC vs Corp vs Sole Prop). State requirements.',
                  human: 'When tax implications or existing liabilities are involved.',
                  paid: 'Formation document preparation. Compliance calendar setup.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="font-bold text-slate-900 mb-3">{item.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold shrink-0 mt-0.5">F</span>
                      <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Free:</span> {item.free}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold shrink-0 mt-0.5">H</span>
                      <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Human help:</span> {item.human}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold shrink-0 mt-0.5">$</span>
                      <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">May cost extra:</span> {item.paid}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business issue cards — bilingual, with cost transparency */}
        <section className="py-12 bg-white" aria-labelledby="issue-cards-heading">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="issue-cards-heading" className="text-xl font-bold text-slate-900 text-center mb-2">
              Choose your issue
            </h2>
            <p className="text-center text-sm text-slate-600 mb-6 max-w-lg mx-auto">
              Each card shows what you can do for free and when optional paid lawyer review is available. You always see cost before you pay.
            </p>
            <BusinessIssueCards />
            <p className="mt-6 text-center text-xs text-slate-500">
              Lawyer review is always optional. You will see the exact cost before any payment is processed.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-950 py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              Stop guessing. Start protecting your business.
            </h2>
            <p className="text-slate-400 text-sm mb-7">
              Prevent problems before they become expensive. Get information fast.
            </p>
            <Link
              to="/start?persona=business"
              onClick={() => trackEvent('business_cta_clicked', { cta: 'bottom' })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 hover:bg-sky-50 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Start business intake
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

```

---

## src/pages/ForStartups.tsx

```tsx
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ICP_CONTENT } from '../lib/gtm-content';
import { LegalReadinessWizard, ROICalculator, FAQSection } from '../components/gtm';
import { track } from '../lib/gtm-analytics';
import { useEffect } from 'react';

const content = ICP_CONTENT.startups;

export default function ForStartups() {
  useEffect(() => { track('page_view', { page: 'for_startups' }); }, []);

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-teal-600/20 text-teal-300 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              For Startups & SMBs
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
              Stop losing time to disorganized legal work
            </h1>
            <p className="text-lg text-navy-200 mb-8 max-w-2xl mx-auto">{content.outcome}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/resources/legal-readiness-checklist"
                onClick={() => track('cta_click', { cta: 'startups_hero_primary' })}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg text-lg"
              >
                {content.cta} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/schedule-demo"
                onClick={() => track('demo_click', { source: 'startups_hero' })}
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all text-lg"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-4 text-center">The Problem</h2>
            <p className="text-lg text-navy-700 text-center mb-8">{content.pain}</p>
            <h3 className="text-lg font-semibold text-navy-800 mb-4">Common use cases:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {content.useCases.map((uc) => (
                <div key={uc} className="flex items-center gap-3 p-4 bg-navy-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-navy-800">{uc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-navy-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">Estimate Your Savings</h2>
            <ROICalculator />
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-2 text-center">Run Your Free Legal Readiness Check</h2>
            <p className="text-navy-600 text-center mb-8">Answer a few questions to get personalized recommendations.</p>
            <LegalReadinessWizard />
          </div>
        </section>

        <section className="py-16 px-4 bg-navy-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">Frequently Asked Questions</h2>
            <FAQSection />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

```

---

## src/pages/ForLawFirms.tsx

```tsx
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ICP_CONTENT } from '../lib/gtm-content';
import { LegalReadinessWizard, FAQSection } from '../components/gtm';
import { track } from '../lib/gtm-analytics';
import { useEffect } from 'react';

const content = ICP_CONTENT.law_firms;

export default function ForLawFirms() {
  useEffect(() => { track('page_view', { page: 'for_law_firms' }); }, []);

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-teal-600/20 text-teal-300 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              For Law Firms
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
              Standardize intake. Qualify faster. Prepare structured summaries.
            </h1>
            <p className="text-lg text-navy-200 mb-8 max-w-2xl mx-auto">{content.outcome}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/resources/legal-readiness-checklist"
                onClick={() => track('cta_click', { cta: 'lawfirms_hero_primary' })}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg text-lg"
              >
                {content.cta} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/schedule-demo"
                onClick={() => track('demo_click', { source: 'lawfirms_hero' })}
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all text-lg"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-4 text-center">The Problem</h2>
            <p className="text-lg text-navy-700 text-center mb-8">{content.pain}</p>
            <h3 className="text-lg font-semibold text-navy-800 mb-4">Common use cases:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {content.useCases.map((uc) => (
                <div key={uc} className="flex items-center gap-3 p-4 bg-navy-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-navy-800">{uc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-navy-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-2 text-center">See How It Works for Your Firm</h2>
            <p className="text-navy-600 text-center mb-8">Answer a few questions to see how intake automation fits your practice.</p>
            <LegalReadinessWizard />
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">Frequently Asked Questions</h2>
            <FAQSection />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

```

---

## src/pages/ForOrganizations.tsx

```tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Users, FileText, BarChart3,
  Building2, Globe, CheckCircle, Lock, Scale, Heart
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ScopeNotice } from '../components/shared/AISafetyMicrocopy';
import { trackEvent } from '../services/analytics-service';
import TrustCTABlock from '../components/trust/TrustCTABlock';
import ReferralPacketPreview from '../components/ReferralPacketPreview';
import OrganizationIntakeQueue from '../components/OrganizationIntakeQueue';
import { useLanguage } from '../contexts/LanguageContext';

const CAPABILITIES = [
  'AI-assisted client intake and eligibility screening',
  'Multilingual support (English + Spanish built in)',
  'Case triage, priority routing, and escalation pathways',
  'Document generation from guided templates',
  'Reporting and analytics on intake volume and triage outcomes',
  'Integration-ready architecture (API, embed widgets, white-label)',
];

const USE_CASES = [
  {
    icon: Heart,
    title: 'Legal aid organizations',
    desc: 'Screen more clients, triage faster, and stretch limited attorney hours with AI-assisted intake.',
  },
  {
    icon: Building2,
    title: 'Law school clinics',
    desc: 'Give students guided intake tools and case-matching that surfaces relevant precedent.',
  },
  {
    icon: Users,
    title: 'Bar associations',
    desc: 'Offer a modern pro bono portal that matches volunteer attorneys to cases by expertise.',
  },
  {
    icon: Globe,
    title: 'Community organizations',
    desc: 'Embed a legal self-help widget on your site to serve clients in their language.',
  },
  {
    icon: Scale,
    title: 'Court self-help centers',
    desc: 'Reduce counter wait times with guided document preparation and next-step checklists.',
  },
];

const GOVERNANCE_LINKS = [
  { title: 'AI Governance Framework', to: '/ai-governance', desc: 'How we build, test, and monitor our AI systems.' },
  { title: 'Bias Monitoring Dashboard', to: '/bias-monitoring', desc: 'Live metrics on fairness across demographics.' },
  { title: 'Model Card', to: '/ai-model-card', desc: 'Technical details on model capabilities and limitations.' },
  { title: 'Algorithmic Impact Assessment', to: '/algorithmic-impact-assessment', desc: 'Risk assessment for our AI applications.' },
];

export default function ForOrganizations() {
  useEffect(() => {
    trackEvent('page_view', { path: '/for-organizations' });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navigation />

      <main id="main-content">
        {/* Hero */}
        <section className="pt-24 sm:pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
              <Building2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span className="text-sm font-medium text-emerald-800">For organizations &amp; partners</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              AI-assisted intake that multiplies your capacity.
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-7 text-slate-600">
              Serve more people with the same team. Our platform handles intake, triage, and guided self-help so your attorneys can focus on what matters.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/schedule-demo"
                onClick={() => trackEvent('demo_requested', { source: 'org_hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Schedule organization demo
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/partners"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Create partner intake page
              </Link>
              <Link
                to="/ai-governance"
                className="inline-flex items-center justify-center gap-2 rounded-full text-sm text-emerald-700 hover:text-emerald-900 font-medium px-4 py-3.5 transition"
              >
                Review AI governance
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500 max-w-lg mx-auto">
              We do not claim to replace lawyers or legal aid staff. Our tools support and augment your team.
            </p>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="capabilities-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="capabilities-heading" className="text-2xl font-black text-center mb-8">
              Platform capabilities
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {CAPABILITIES.map((cap) => (
                <div key={cap} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-sm text-slate-800 leading-relaxed">{cap}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-14" aria-labelledby="use-cases-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="use-cases-heading" className="text-2xl font-black text-center mb-3">
              Built for access-to-justice organizations
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              Whether you serve hundreds or hundreds of thousands, our platform scales with your mission.
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((uc) => {
                const Icon = uc.icon;
                return (
                  <div key={uc.title} className="p-5 rounded-xl border border-slate-200 bg-white">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 mb-3">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-bold text-slate-900 mb-1">{uc.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{uc.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Governance */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="governance-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="governance-heading" className="text-2xl font-black text-center mb-3">
              Governance &amp; transparency
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
              We publish our AI governance documentation so partners can evaluate our approach.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {GOVERNANCE_LINKS.map((link) => (
                <Link
                  key={link.title}
                  to={link.to}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition group"
                >
                  <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-0.5 group-hover:text-emerald-800 transition">{link.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{link.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Key workflow areas */}
        <section className="py-14" aria-labelledby="workflows-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="workflows-heading" className="text-2xl font-black text-center mb-3">
              How organizations use the platform
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              Triage, intake support, education, referral routing, and document preparation support.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Users, title: 'Client-facing intake support', desc: 'Guided questionnaires that gather key facts before attorney review.' },
                { icon: Globe, title: 'Spanish-language access', desc: 'Full bilingual intake and self-help flows for Spanish-speaking clients.' },
                { icon: Scale, title: 'Referral and escalation', desc: 'Route high-risk cases to attorneys and surface emergency resources.' },
                { icon: BarChart3, title: 'Admin and audit visibility', desc: 'Track intake volume, triage outcomes, and response quality.' },
                { icon: Lock, title: 'Privacy and consent', desc: 'Configurable consent gates and data handling policies.' },
                { icon: FileText, title: 'Reporting', desc: 'Grant reporting templates and demographic analytics.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-5 rounded-xl border border-slate-200 bg-white">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 mb-3">
                      <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                    </span>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Implementation notes */}
        <section className="py-10 bg-amber-50 border-y border-amber-200" aria-labelledby="implementation-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="implementation-heading" className="text-lg font-bold text-amber-900 mb-4 text-center">
              Implementation guidance
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Human review recommended', desc: 'AI output should be reviewed by qualified staff before client action.' },
                { title: 'Use with local eligibility rules', desc: 'Configure screening criteria for your jurisdiction and funding source.' },
                { title: 'Configure emergency escalation', desc: 'Set up high-risk detection and crisis resource routing for your community.' },
              ].map((note) => (
                <div key={note.title} className="bg-white rounded-lg border border-amber-200 p-4">
                  <h3 className="text-sm font-bold text-amber-900 mb-1">{note.title}</h3>
                  <p className="text-xs text-amber-800 leading-relaxed">{note.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration ready */}
        <section className="py-14" aria-labelledby="integration-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="integration-heading" className="text-2xl font-black mb-3">
              Integration-ready
            </h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Designed to support future integrations with your existing case management and intake systems. Embed our intake widget, connect via API, or use our white-label solution.
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {[
                { icon: Lock, text: 'Encrypted data at rest and in transit' },
                { icon: BarChart3, text: 'Real-time partner dashboard' },
                { icon: FileText, text: 'API & embeddable widgets' },
                { icon: Globe, text: 'Multi-language support' },
              ].map(({ icon: I, text }) => (
                <div key={text} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <I className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust links */}
        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <TrustCTABlock variant="standard" />
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <ScopeNotice className="max-w-xl mx-auto" />
          </div>
        </section>

        {/* Partner workflow features */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="partner-features-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="partner-features-heading" className="text-2xl font-black text-center mb-3">
              What partners can do
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              Tools designed for legal-aid teams, pro bono coordinators, and community organizations.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Referral triage', desc: 'AI-generated intake summaries that surface issue type, urgency, and jurisdiction.' },
                { title: 'Language access', desc: 'Full intake and output in English and Spanish, with more languages planned.' },
                { title: 'Deadline and urgency flags', desc: 'Automatic detection of court dates, filing deadlines, and safety concerns.' },
                { title: 'Consent-based handoff', desc: 'Users control when and how their summary is shared with your team.' },
                { title: 'Anonymized reporting', desc: 'Aggregate intake data for grant reporting without exposing individual details.' },
                { title: 'Human review workflow', desc: 'Staff can review, annotate, and route AI-generated summaries before action.' },
              ].map((item) => (
                <div key={item.title} className="p-5 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mock referral card */}
        <section className="py-14" aria-labelledby="sample-referral-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="sample-referral-heading" className="text-2xl font-black text-center mb-3">
              Sample referral summary
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-md mx-auto">
              This is what a triage summary looks like when shared with your team.
            </p>
            <div className="border-2 border-dashed border-amber-300 rounded-xl p-6 bg-amber-50/30 relative">
              <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                Example only
              </span>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue type</p>
                  <p className="text-sm text-slate-800">Housing — Eviction notice received</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Urgency</p>
                  <p className="text-sm text-slate-800">High — Court date in 12 days</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jurisdiction</p>
                  <p className="text-sm text-slate-800">Arizona — Maricopa County</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Language</p>
                  <p className="text-sm text-slate-800">Spanish (intake completed in Spanish)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">AI summary</p>
                  <p className="text-sm text-slate-800">Tenant received 5-day eviction notice. No prior violations. May qualify for emergency rental assistance. Deadline: response due before court date.</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Suggested routing</p>
                  <p className="text-sm text-slate-800">Housing unit — urgent queue</p>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-amber-700 italic">
                This is a fictional example for demonstration purposes. No real client data is shown.
              </p>
            </div>
          </div>
        </section>

        {/* Partner CTAs */}
        <section className="py-10 bg-white border-y border-slate-200" aria-labelledby="partner-ctas-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="partner-ctas-heading" className="text-lg font-bold text-slate-900 mb-4">
              Ready to explore?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/schedule-demo"
                onClick={() => trackEvent('partner_cta_clicked', { cta: 'book_partner_demo' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Book a partner demo
              </Link>
              <a
                href="#sample-referral-heading"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                See sample referral
              </a>
              <Link
                to="/enterprise-security"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Download security &amp; AI overview
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              We do not imply existing partnerships. All integration features require a signed agreement.
            </p>
          </div>
        </section>

        {/* Partner workflow demos */}
        <section className="py-12 bg-slate-50" aria-labelledby="workflow-demos-heading" id="workflow">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="workflow-demos-heading" className="text-xl font-bold text-slate-900 text-center mb-8">
              Partner workflow previews
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Referral packet format</h3>
                <ReferralPacketPreview isDemo={true} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Intake queue interface</h3>
                <OrganizationIntakeQueue />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-950 py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              Ready to expand your reach?
            </h2>
            <p className="text-slate-400 text-sm mb-7">
              See how ezLegal.ai can serve your community. No commitment required.
            </p>
            <Link
              to="/schedule-demo"
              onClick={() => trackEvent('demo_requested', { source: 'org_bottom' })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 hover:bg-emerald-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Schedule a partner demo
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

```

---

## src/pages/EspanolLanding.tsx

```tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, AlertTriangle, Home, Briefcase,
  Heart, Scale, Globe, Clock, CheckCircle, Shield, Lock
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEvent } from '../services/analytics-service';
import { SpanishScopeNotice } from '../components/shared/AISafetyMicrocopy';
import TrustCTABlock from '../components/trust/TrustCTABlock';

const ISSUE_CARDS = [
  {
    icon: Home,
    title: 'Vivienda y desalojo',
    desc: 'Renta, reparaciones, aviso de desalojo, depósito de seguridad.',
    prompt: 'Tengo un problema con mi vivienda o un aviso de desalojo.',
  },
  {
    icon: Briefcase,
    title: 'Trabajo y salarios',
    desc: 'Salario no pagado, despido injusto, horas extra, discriminación.',
    prompt: 'Mi empleador no me ha pagado lo que me debe.',
  },
  {
    icon: Heart,
    title: 'Familia',
    desc: 'Custodia, manutención, divorcio, orden de protección.',
    prompt: 'Necesito ayuda con un problema de custodia o familia.',
  },
  {
    icon: Scale,
    title: 'Deudas',
    desc: 'Cobradores, demandas, embargo de salario, disputas de crédito.',
    prompt: 'Recibí una carta de cobro o demanda por deuda.',
  },
  {
    icon: Globe,
    title: 'Inmigración',
    desc: 'Organizar documentos, preparar preguntas, entender opciones.',
    prompt: 'Necesito ayuda para organizar mis documentos de inmigración.',
  },
  {
    icon: Clock,
    title: 'Pequeñas reclamaciones',
    desc: 'Alguien me debe dinero o tengo un reclamo menor.',
    prompt: 'Quiero hacer una pequeña reclamación.',
  },
];

const STEPS = [
  { num: 1, title: 'Cuéntenos qué pasó', desc: 'Escriba su situación en sus propias palabras. No necesita términos legales.' },
  { num: 2, title: 'Organizamos la información', desc: 'Identificamos el tipo de problema, fechas importantes y opciones disponibles.' },
  { num: 3, title: 'Recibe un plan de acción', desc: 'Pasos claros y numerados que puede seguir hoy.' },
  { num: 4, title: 'Documentos, recursos o referencias', desc: 'Le mostramos qué documentos necesita, recursos gratuitos y cómo encontrar un abogado si lo necesita.' },
];

export default function EspanolLanding() {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage('es');
    trackEvent('espanol_landing_viewed', {});
  }, [setLanguage]);

  const handleIssueClick = (prompt: string) => {
    try {
      window.sessionStorage.setItem('ez_chatbot_prefill', prompt);
    } catch { /* ignore */ }
    trackEvent('espanol_issue_selected', { prompt: prompt.slice(0, 40) });
  };

  return (
    <div lang="es" className="min-h-screen bg-white text-slate-950">
      <Navigation />

      <main id="main-content">
        {/* Emergency warning */}
        <section className="bg-red-50 border-b border-red-100 py-4 mt-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-red-900 text-center sm:text-left">
              Si está en peligro inmediato, llame al <strong>911</strong>. Si tiene una audiencia o fecha límite, díganos la fecha al comenzar.
            </p>
            <Link
              to="/emergency-resources"
              className="inline-flex items-center gap-2 shrink-0 rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Recursos urgentes
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Hero */}
        <section className="pt-16 sm:pt-24 pb-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-6">
              <Globe className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span className="text-sm font-medium text-teal-800">Experiencia completa en español</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              Ayuda legal clara, paso a paso.
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-7 text-slate-600">
              Explique su problema en español. Le ayudamos a entender su situación, encontrar próximos pasos, organizar documentos y saber cuándo necesita un abogado o ayuda de emergencia.
            </p>

            <p className="mt-3 text-sm font-medium text-slate-500">
              Esto es información legal, no asesoría legal.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/es/chat"
                onClick={() => trackEvent('espanol_cta_clicked', { cta: 'empezar' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-700/20 hover:bg-teal-800 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Empezar en español
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/pro-bono?lang=es"
                onClick={() => trackEvent('espanol_cta_clicked', { cta: 'ayuda_gratis' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-teal-300 bg-white px-7 py-3.5 text-base font-semibold text-teal-800 hover:bg-teal-50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <Heart className="w-5 h-5" aria-hidden="true" />
                Necesito ayuda gratis o de bajo costo
              </Link>
              <Link
                to="/emergency-resources"
                onClick={() => trackEvent('espanol_cta_clicked', { cta: 'urgente' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-red-300 bg-white px-7 py-3.5 text-base font-semibold text-red-800 hover:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                Recursos urgentes
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Sin cuenta ni pago. Comience en menos de 60 segundos.
            </p>
          </div>
        </section>

        {/* Issue cards */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="issues-heading">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="issues-heading" className="text-2xl font-black text-center mb-8">
              ¿Cuál es su situación?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ISSUE_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to="/es/chat"
                    onClick={() => handleIssueClick(card.prompt)}
                    className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-700 shrink-0 group-hover:bg-teal-100 transition">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{card.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-14" aria-labelledby="steps-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="steps-heading" className="text-2xl font-black text-center mb-10">
              Qué pasa después
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {STEPS.map((step) => (
                <div key={step.num} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white font-bold text-sm">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <section className="py-10 bg-slate-50 border-y border-slate-200">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {[
                { icon: Shield, text: 'Información legal, no asesoría legal' },
                { icon: Lock, text: 'Conversaciones cifradas' },
                { icon: Globe, text: 'Experiencia completa en español' },
                { icon: CheckCircle, text: 'Sin juicio, sin importar su estatus' },
              ].map(({ icon: I, text }) => (
                <div key={text} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <I className="w-4 h-4 text-teal-600" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SpanishScopeNotice className="max-w-xl mx-auto" />
            <p className="text-sm text-slate-600 leading-7 text-center mt-4">
              ezLegal.ai ofrece información legal y herramientas de autoayuda. No somos un bufete de abogados y no reemplazamos el consejo de un abogado.{' '}
              <Link to="/scope-disclaimers" className="underline text-teal-700 hover:text-teal-900">
                Alcance y límites
              </Link>
            </p>
          </div>
        </section>

        {/* Hardship-aware help */}
        <section className="py-14" aria-labelledby="hardship-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="hardship-heading" className="text-2xl font-black text-center mb-3">
              ¿El costo es un problema?
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
              Creemos que todos merecen entender sus derechos. Si no puede pagar, hay opciones.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                to="/pro-bono?lang=es"
                className="block p-5 bg-teal-50 rounded-xl border border-teal-200 hover:border-teal-400 transition text-center"
              >
                <Heart className="w-7 h-7 text-teal-700 mx-auto mb-2" aria-hidden="true" />
                <h3 className="font-bold text-slate-900 mb-1">Ayuda gratuita</h3>
                <p className="text-xs text-slate-600">Programas pro bono y asistencia legal gratuita</p>
              </Link>
              <Link
                to="/legal-safety-net"
                className="block p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 transition text-center"
              >
                <Scale className="w-7 h-7 text-slate-700 mx-auto mb-2" aria-hidden="true" />
                <h3 className="font-bold text-slate-900 mb-1">Bajo costo</h3>
                <p className="text-xs text-slate-600">Opciones de pago reducido y planes de pago</p>
              </Link>
              <Link
                to="/es/chat"
                className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition text-center"
              >
                <CheckCircle className="w-7 h-7 text-green-600 mx-auto mb-2" aria-hidden="true" />
                <h3 className="font-bold text-slate-900 mb-1">Gratis para siempre</h3>
                <p className="text-xs text-slate-600">Preguntas ilimitadas sin costo ni registro</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Language continuity notice */}
        <section className="bg-amber-50 border-y border-amber-200 py-4">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex items-center gap-3 justify-center">
            <Globe className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
            <p className="text-sm text-amber-800">
              Algunas páginas pueden mostrarse en inglés. Su preferencia de idioma se mantiene y siempre puede regresar aquí.
            </p>
          </div>
        </section>

        {/* Trust links */}
        <section className="py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <TrustCTABlock variant="compact" />
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-950 py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              ¿Listo para entender sus opciones?
            </h2>
            <p className="text-slate-400 text-sm mb-7">
              Empiece gratis. Sin registro. Sin tarjeta de crédito.
            </p>
            <Link
              to="/es/chat"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 hover:bg-teal-50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Empezar en español
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

```

---

## src/pages/PersonaIntake.tsx

```tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  User, Building2, Users, ArrowRight, ArrowLeft,
  Shield, AlertTriangle, Clock, Globe, Heart, CheckCircle,
  Search, MapPin, Save, X
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ReferralConsentCard from '../components/ReferralConsentCard';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEvent } from '../services/analytics-service';
import { trackReviewScreenViewed } from '../components/EthicalAnalytics';
import { US_STATES } from '../data/jurisdictions';

type Persona = 'individual' | 'business' | 'organization';
type Step = 'who' | 'what' | 'urgency' | 'state' | 'results';

const TRIAGE_STORAGE_KEY = 'ezlegal_triage_context';
const TRIAGE_DRAFT_KEY = 'ezlegal_triage_draft';
const STATE_STORAGE_KEY = 'ezlegal_state';

const INDIVIDUAL_ISSUES = [
  { id: 'housing', label: 'Housing or eviction', labelEs: 'Vivienda o desalojo', urgent: true },
  { id: 'debt', label: 'Debt or consumer problem', labelEs: 'Deuda o problema de consumo', urgent: false },
  { id: 'family', label: 'Family or safety concern', labelEs: 'Familia o preocupación de seguridad', urgent: true },
  { id: 'immigration', label: 'Immigration', labelEs: 'Inmigración', urgent: true },
  { id: 'employment', label: 'Employment', labelEs: 'Empleo', urgent: false },
  { id: 'court', label: 'Court papers or deadline', labelEs: 'Documentos del tribunal o fecha límite', urgent: true },
  { id: 'other', label: 'Not sure', labelEs: 'No estoy seguro/a', urgent: false },
];

const BUSINESS_ISSUES = [
  { id: 'contract', label: 'Contract or lease', labelEs: 'Contrato o arrendamiento', urgent: false },
  { id: 'employee', label: 'Employee or contractor issue', labelEs: 'Empleado o contratista', urgent: false },
  { id: 'compliance', label: 'Compliance or licensing', labelEs: 'Cumplimiento o licencias', urgent: false },
  { id: 'dispute', label: 'Demand letter or dispute', labelEs: 'Carta de demanda o disputa', urgent: true },
  { id: 'formation', label: 'Business formation', labelEs: 'Formación de negocio', urgent: false },
  { id: 'collections', label: 'Debt, invoice, or collections', labelEs: 'Deuda, factura o cobranzas', urgent: false },
  { id: 'other', label: 'Not sure', labelEs: 'No estoy seguro/a', urgent: false },
];

const ORG_ISSUES = [
  { id: 'intake', label: 'Client intake', labelEs: 'Admisión de clientes', urgent: false },
  { id: 'referral', label: 'Referral routing', labelEs: 'Flujo de referencias', urgent: false },
  { id: 'documents', label: 'Document preparation', labelEs: 'Preparación de documentos', urgent: false },
  { id: 'rights', label: 'Know-your-rights materials', labelEs: 'Materiales de derechos', urgent: false },
  { id: 'reporting', label: 'Reporting / outcomes', labelEs: 'Informes / resultados', urgent: false },
  { id: 'other', label: 'Not sure', labelEs: 'No estoy seguro/a', urgent: false },
];

type UrgencyLevel = 'court-date' | 'unsafe' | 'legal-papers' | 'soon' | 'none';

const URGENCY_OPTIONS: { id: UrgencyLevel; label: string; labelEs: string; isHighRisk: boolean; icon: typeof Clock }[] = [
  { id: 'court-date', label: 'I have a court date or deadline', labelEs: 'Tengo una fecha de tribunal o plazo', isHighRisk: true, icon: Clock },
  { id: 'unsafe', label: 'I may be unsafe', labelEs: 'Puedo estar en peligro', isHighRisk: true, icon: AlertTriangle },
  { id: 'legal-papers', label: 'I received legal papers', labelEs: 'Recibí documentos legales', isHighRisk: true, icon: AlertTriangle },
  { id: 'soon', label: 'I need help soon but not today', labelEs: 'Necesito ayuda pronto pero no hoy', isHighRisk: false, icon: Clock },
  { id: 'none', label: 'Not urgent / just exploring', labelEs: 'No es urgente / solo estoy explorando', isHighRisk: false, icon: Shield },
];

function getIssues(persona: Persona) {
  if (persona === 'individual') return INDIVIDUAL_ISSUES;
  if (persona === 'business') return BUSINESS_ISSUES;
  return ORG_ISSUES;
}

function getIssueLabel(persona: Persona, issueId: string, en: boolean) {
  const issues = getIssues(persona);
  const found = issues.find((i) => i.id === issueId);
  return found ? (en ? found.label : found.labelEs) : issueId;
}

interface TriageDraft {
  persona?: Persona | null;
  issue?: string | null;
  urgency?: UrgencyLevel | null;
  state?: string | null;
  step?: Step;
}

function loadDraft(): TriageDraft | null {
  try {
    const raw = localStorage.getItem(TRIAGE_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveDraft(draft: TriageDraft) {
  try { localStorage.setItem(TRIAGE_DRAFT_KEY, JSON.stringify(draft)); } catch { /* ignore */ }
}

function clearDraft() {
  try { localStorage.removeItem(TRIAGE_DRAFT_KEY); } catch { /* ignore */ }
}

function loadSavedState(): string | null {
  try { return localStorage.getItem(STATE_STORAGE_KEY); } catch { return null; }
}

export default function PersonaIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam === 'es') setLanguage('es');
    const pathParam = searchParams.get('path');
    if (pathParam === 'legal-aid' && !persona) {
      setPersona('individual');
      setStep('what');
    } else if (pathParam === 'smb' && !persona) {
      setPersona('business');
      setStep('what');
    } else if (pathParam === 'organizations' && !persona) {
      setPersona('organization');
      setStep('what');
    }
  }, [searchParams, setLanguage]);

  const en = language === 'en';

  const [showResume, setShowResume] = useState(false);
  const [step, setStep] = useState<Step>('who');
  const [persona, setPersona] = useState<Persona | null>(null);
  const [issue, setIssue] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<UrgencyLevel | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(loadSavedState);
  const [stateSearch, setStateSearch] = useState('');

  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.persona && draft.step && draft.step !== 'who') {
      setShowResume(true);
    }
  }, []);

  const handleResume = () => {
    const draft = loadDraft();
    if (draft) {
      setPersona(draft.persona || null);
      setIssue(draft.issue || null);
      setUrgency(draft.urgency || null);
      setSelectedState(draft.state || loadSavedState());
      setStep(draft.step || 'who');
    }
    setShowResume(false);
  };

  const handleStartOver = () => {
    clearDraft();
    setShowResume(false);
    setStep('who');
    setPersona(null);
    setIssue(null);
    setUrgency(null);
  };

  const stepNumber = step === 'who' ? 1 : step === 'what' ? 2 : step === 'urgency' ? 3 : step === 'state' ? 4 : 4;
  const totalSteps = 4;
  const progressPercent = step === 'results' ? 100 : (stepNumber / totalSteps) * 100;

  const handlePersonaSelect = (p: Persona) => {
    setPersona(p);
    saveDraft({ persona: p, step: 'what' });
    trackEvent('triage_persona_selected', { persona: p });
    setStep('what');
  };

  const handleIssueSelect = (issueId: string) => {
    setIssue(issueId);
    saveDraft({ persona, issue: issueId, step: 'urgency' });
    trackEvent('triage_issue_selected', { issue: issueId });
    setStep('urgency');
  };

  const handleUrgencySelect = (u: UrgencyLevel) => {
    setUrgency(u);
    saveDraft({ persona, issue, urgency: u, step: 'state' });
    trackEvent('triage_urgency_selected', { urgency: u });
    setStep('state');
  };

  const handleStateSelect = (code: string | null) => {
    setSelectedState(code);
    if (code) {
      try { localStorage.setItem(STATE_STORAGE_KEY, code); } catch { /* ignore */ }
    }
    completeFlow(code);
  };

  const completeFlow = (state: string | null) => {
    clearDraft();
    const ctx = { persona, issue, urgency, state, language, ts: new Date().toISOString() };
    try { localStorage.setItem(TRIAGE_STORAGE_KEY, JSON.stringify(ctx)); } catch { /* ignore */ }
    trackEvent('triage_completed', { persona, issue, urgency, state });
    trackReviewScreenViewed();
    setStep('results');
  };

  const isHighRisk = urgency === 'court-date' || urgency === 'unsafe' || urgency === 'legal-papers' ||
    (issue && INDIVIDUAL_ISSUES.find((i) => i.id === issue)?.urgent && urgency !== 'none');

  const isDV = issue === 'family' && (urgency === 'unsafe' || urgency === 'court-date');
  const isImmigration = issue === 'immigration';

  const goBack = () => {
    if (step === 'results') setStep('state');
    else if (step === 'state') setStep('urgency');
    else if (step === 'urgency') setStep('what');
    else if (step === 'what') setStep('who');
  };

  const handleSaveAndExit = () => {
    saveDraft({ persona, issue, urgency, state: selectedState, step });
    navigate('/');
  };

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return US_STATES;
    const q = stateSearch.toLowerCase();
    return US_STATES.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [stateSearch]);

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col">
      <Navigation />

      <main id="main-content" className="flex-1 pt-20">
        {showResume && (
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <p className="text-sm text-teal-800 flex-1">
                {en ? 'You have an unfinished question. Resume or start over?' : 'Tienes una pregunta sin terminar. ¿Continuar o empezar de nuevo?'}
              </p>
              <div className="flex gap-2">
                <button onClick={handleResume} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                  {en ? 'Resume' : 'Continuar'}
                </button>
                <button onClick={handleStartOver} className="px-3 py-1.5 border border-teal-300 text-teal-700 text-xs font-semibold rounded-lg hover:bg-teal-100 transition-colors">
                  {en ? 'Start over' : 'Empezar de nuevo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step !== 'results' && (
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">
                {en ? `Step ${stepNumber} of ${totalSteps}` : `Paso ${stepNumber} de ${totalSteps}`}
              </span>
              <div className="flex items-center gap-3">
                {step !== 'who' && (
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
                  >
                    <ArrowLeft className="w-3 h-3" /> {en ? 'Back' : 'Atrás'}
                  </button>
                )}
                {step !== 'who' && (
                  <button
                    onClick={handleSaveAndExit}
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 transition"
                    title={en ? 'Save and finish later' : 'Guardar y terminar después'}
                  >
                    <Save className="w-3 h-3" /> {en ? 'Save' : 'Guardar'}
                  </button>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Step 1: Who */}
          {step === 'who' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-center mb-2">
                {en ? 'Who needs help?' : '¿Quién necesita ayuda?'}
              </h1>
              <p className="text-center text-slate-600 mb-2">
                {en ? 'This helps us show you the right options.' : 'Esto nos ayuda a mostrarte las opciones correctas.'}
              </p>
              <p className="text-center text-xs text-slate-500 mb-8">
                {en ? 'Not a law firm. Not legal advice. No account needed.' : 'No es un bufete. No es asesoría legal. Sin necesidad de cuenta.'}
              </p>
              <div className="grid gap-3">
                {([
                  { id: 'individual' as const, icon: User, label: 'Individual or family', labelEs: 'Persona o familia', desc: en ? 'Housing, family, debt, employment, immigration' : 'Vivienda, familia, deuda, empleo, inmigración' },
                  { id: 'business' as const, icon: Building2, label: 'Small business', labelEs: 'Pequeño negocio', desc: en ? 'Contracts, employees, compliance, disputes' : 'Contratos, empleados, cumplimiento, disputas' },
                  { id: 'organization' as const, icon: Users, label: 'Legal aid or community organization', labelEs: 'Organización legal o comunitaria', desc: en ? 'Intake, triage, referrals, partner tools' : 'Admisión, triaje, referencias, herramientas' },
                ]).map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePersonaSelect(p.id)}
                      className="flex items-center gap-4 w-full p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left group"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-700 shrink-0 group-hover:bg-teal-100 transition">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900">{en ? p.label : p.labelEs}</p>
                        <p className="text-sm text-slate-500">{p.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-teal-600 transition" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: What issue */}
          {step === 'what' && persona && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">
                {en ? 'What kind of issue is this?' : '¿Qué tipo de problema es?'}
              </h2>
              <p className="text-center text-slate-600 mb-8">
                {en ? 'Pick the closest match.' : 'Elige la opción más cercana.'}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {getIssues(persona).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleIssueSelect(item.id)}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left font-medium text-slate-800"
                  >
                    {en ? item.label : item.labelEs}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Urgency */}
          {step === 'urgency' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">
                {en ? 'Is anything urgent?' : '¿Hay algo urgente?'}
              </h2>
              <p className="text-center text-slate-600 mb-8">
                {en ? 'This helps us prioritize the right information.' : 'Esto nos ayuda a priorizar la información correcta.'}
              </p>
              <div className="grid gap-3">
                {URGENCY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleUrgencySelect(opt.id)}
                      className={`flex items-center gap-4 w-full p-4 bg-white rounded-xl border transition-all text-left ${
                        opt.isHighRisk ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-teal-300'
                      } hover:shadow-md`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${opt.isHighRisk ? 'text-amber-600' : 'text-slate-400'}`} aria-hidden="true" />
                      <span className="font-medium text-slate-800">{en ? opt.label : opt.labelEs}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: State */}
          {step === 'state' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">
                {en ? 'What state are you in?' : '¿En qué estado estás?'}
              </h2>
              <p className="text-center text-slate-600 mb-6">
                {en ? 'Laws vary by state. This helps us give better information.' : 'Las leyes varían por estado. Esto nos ayuda a dar mejor información.'}
              </p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  type="text"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  placeholder={en ? 'Search states...' : 'Buscar estados...'}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  autoFocus
                />
                {stateSearch && (
                  <button
                    onClick={() => setStateSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={en ? 'Clear search' : 'Borrar búsqueda'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl mb-4">
                {filteredStates.map((s) => (
                  <button
                    key={s.code}
                    onClick={() => handleStateSelect(s.code)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm border-b border-slate-100 last:border-0 transition-colors ${
                      selectedState === s.code ? 'bg-teal-50 text-teal-800 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    {s.name}
                    {selectedState === s.code && <CheckCircle className="w-4 h-4 text-teal-600 ml-auto" aria-hidden="true" />}
                  </button>
                ))}
                {filteredStates.length === 0 && (
                  <p className="px-4 py-3 text-sm text-slate-500">{en ? 'No states match your search.' : 'Ningún estado coincide con tu búsqueda.'}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStateSelect(null)}
                  className="w-full p-3 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-left"
                >
                  {en ? "I'm not sure / it may be federal or immigration-related" : 'No estoy seguro/a / puede ser federal o de inmigración'}
                </button>
              </div>

              {!selectedState && (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  {en
                    ? 'Laws can vary by state. We can still help you understand the issue, but results may be more general.'
                    : 'Las leyes pueden variar por estado. Aún podemos ayudarte a entender el problema, pero los resultados pueden ser más generales.'}
                </p>
              )}
            </div>
          )}

          {/* Results */}
          {step === 'results' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-teal-600" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-black mb-2">
                  {en ? 'Here is what we recommend' : 'Esto es lo que recomendamos'}
                </h2>
              </div>

              {/* Safety warning for DV */}
              {isDV && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-red-900 text-sm mb-1">
                        {en ? 'Safety notice' : 'Aviso de seguridad'}
                      </p>
                      <p className="text-xs text-red-800">
                        {en
                          ? 'If someone monitors your device, consider using a safer device before saving or searching. Call 911 for immediate danger, or the National DV Hotline: 1-800-799-7233.'
                          : 'Si alguien vigila su dispositivo, considere usar un dispositivo más seguro antes de guardar o buscar. Llame al 911 para peligro inmediato, o a la Línea Nacional de Violencia Doméstica: 1-800-799-7233.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Immigration warning */}
              {isImmigration && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-blue-900 text-sm mb-1">
                        {en ? 'Immigration matters require qualified help' : 'Los asuntos de inmigración requieren ayuda calificada'}
                      </p>
                      <p className="text-xs text-blue-800">
                        {en
                          ? 'Immigration law is complex and errors can have serious consequences. We encourage you to contact an accredited immigration attorney or BIA-recognized organization before taking action.'
                          : 'La ley de inmigración es compleja y los errores pueden tener consecuencias serias. Le animamos a contactar a un abogado de inmigración acreditado o una organización reconocida por la BIA antes de tomar acción.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-2">{en ? 'What we understood' : 'Lo que entendimos'}</h3>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">{en ? 'Issue:' : 'Problema:'}</span>{' '}
                  {persona && issue ? getIssueLabel(persona, issue, en) : (en ? 'General' : 'General')}
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  <span className="font-semibold">{en ? 'Urgency:' : 'Urgencia:'}</span>{' '}
                  {URGENCY_OPTIONS.find((o) => o.id === urgency)?.[en ? 'label' : 'labelEs'] || '-'}
                </p>
                {selectedState && (
                  <p className="text-sm text-slate-700 mt-1">
                    <span className="font-semibold">{en ? 'State:' : 'Estado:'}</span>{' '}
                    {US_STATES.find((s) => s.code === selectedState)?.name || selectedState}
                  </p>
                )}
                <p className="text-sm text-slate-700 mt-1">
                  <span className="font-semibold">{en ? 'Language:' : 'Idioma:'}</span>{' '}
                  {en ? 'English' : 'Espa\u00f1ol'}
                </p>
              </div>

              {/* Referral consent for organization handoff */}
              {persona === 'organization' && (
                <div className="mb-6">
                  <ReferralConsentCard onConsent={(consented) => {
                    trackEvent('referral_consent_decision', { consented: String(consented) });
                  }} />
                </div>
              )}

              {/* High-risk warning */}
              {isHighRisk && !isDV && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-amber-900 text-sm mb-1">
                        {en ? 'Talk to a qualified legal professional or legal aid provider if possible.' : 'Hable con un profesional legal calificado o proveedor de ayuda legal si es posible.'}
                      </p>
                      <p className="text-xs text-amber-800">
                        {en
                          ? 'Your situation may involve deadlines or safety concerns that require professional help.'
                          : 'Su situación puede involucrar plazos o preocupaciones de seguridad que requieren ayuda profesional.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action cards */}
              <div className="grid gap-3">
                {isHighRisk && (
                  <Link
                    to="/urgent-resources"
                    className="flex items-center gap-4 w-full p-5 bg-amber-50 rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-left group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-600 text-white shrink-0">
                      <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-amber-900">{en ? 'Find urgent resources' : 'Encontrar recursos urgentes'}</p>
                      <p className="text-sm text-amber-700">{en ? 'Hotlines, legal aid, and emergency help' : 'Líneas de ayuda, asistencia legal y ayuda de emergencia'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600" />
                  </Link>
                )}

                {isHighRisk && (
                  <Link
                    to="/find-attorney"
                    className="flex items-center gap-4 w-full p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 text-teal-700 shrink-0">
                      <Users className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{en ? 'Find a lawyer or legal aid' : 'Encontrar abogado o ayuda legal'}</p>
                      <p className="text-sm text-slate-600">{en ? 'Free and low-cost options available' : 'Opciones gratuitas y de bajo costo disponibles'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                  </Link>
                )}

                {persona === 'organization' ? (
                  <Link
                    to="/partners"
                    className={`flex items-center gap-4 w-full p-5 rounded-xl border hover:shadow-md transition-all text-left group ${
                      isHighRisk ? 'bg-white border-slate-200 hover:border-teal-300' : 'bg-teal-50 border-teal-200 hover:border-teal-400'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${isHighRisk ? 'bg-slate-100 text-slate-700' : 'bg-teal-700 text-white'}`}>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{en ? 'Explore partner workflow' : 'Explorar flujo de socios'}</p>
                      <p className="text-sm text-slate-600">{en ? 'Intake, triage, and referral tools' : 'Herramientas de admisión, triaje y referencia'}</p>
                    </div>
                  </Link>
                ) : persona === 'business' ? (
                  <Link
                    to="/chat"
                    className={`flex items-center gap-4 w-full p-5 rounded-xl border hover:shadow-md transition-all text-left group ${
                      isHighRisk ? 'bg-white border-slate-200 hover:border-teal-300' : 'bg-teal-50 border-teal-200 hover:border-teal-400'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${isHighRisk ? 'bg-slate-100 text-slate-700' : 'bg-teal-700 text-white'}`}>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{en ? 'Get business information' : 'Obtener información para negocio'}</p>
                      <p className="text-sm text-slate-600">{en ? 'Contracts, compliance, and dispute guidance' : 'Contratos, cumplimiento y orientación de disputas'}</p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    to="/chat"
                    className={`flex items-center gap-4 w-full p-5 rounded-xl border hover:shadow-md transition-all text-left group ${
                      isHighRisk ? 'bg-white border-slate-200 hover:border-teal-300' : 'bg-teal-50 border-teal-200 hover:border-teal-400'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${isHighRisk ? 'bg-slate-100 text-slate-700' : 'bg-teal-700 text-white'}`}>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{en ? 'Continue with general information' : 'Continuar con información general'}</p>
                      <p className="text-sm text-slate-600">{en ? 'Ask questions and get plain-language guidance' : 'Haz preguntas y obtén orientación en lenguaje simple'}</p>
                    </div>
                  </Link>
                )}

                {!isHighRisk && (
                  <Link
                    to="/find-attorney"
                    className="flex items-center gap-4 w-full p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                      <Heart className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{en ? 'Find free or low-cost help' : 'Encontrar ayuda gratuita o de bajo costo'}</p>
                      <p className="text-sm text-slate-600">{en ? 'Legal aid and community resources' : 'Ayuda legal y recursos comunitarios'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                  </Link>
                )}
              </div>

              <p className="mt-6 text-center text-xs text-slate-500 max-w-md mx-auto">
                {en
                  ? 'This is legal information, not legal advice. Using this does not create an attorney-client relationship. For advice about your specific situation, contact a licensed attorney or legal aid organization.'
                  : 'Esto es información legal, no asesoría legal. Usar esto no crea una relación abogado-cliente. Para asesoría sobre su situación específica, contacte a un abogado licenciado o una organización de ayuda legal.'}
              </p>
            </div>
          )}

          {/* Footer disclaimer */}
          {step !== 'results' && (
            <div className="mt-10">
              <p className="text-center text-xs text-slate-500 max-w-md mx-auto">
                {en
                  ? 'Not a law firm. Not legal advice.'
                  : 'No es un bufete. No es asesoría legal.'}
              </p>
              {step !== 'who' && (
                <p className="text-center text-xs text-slate-400 mt-2">
                  {en ? 'Only save details on a device you trust.' : 'Solo guarde detalles en un dispositivo de confianza.'}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

```

---

