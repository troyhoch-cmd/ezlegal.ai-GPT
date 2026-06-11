import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, UserCheck, Crown, X, Save, Loader2, MessageSquare, FolderTree, FileText, Cpu, Settings, ChevronDown, ChevronRight, Plus, Trash2, CreditCard as Edit, Eye, ToggleLeft, ToggleRight, Clock, ArrowLeft, Layers, Sparkles, Home, Upload, CheckCircle, FileUp, MessagesSquare, Paperclip, UserPlus, Mail, FileDown, FileInput, Code2, Globe, MousePointer, BarChart3, Scale, Shield, HelpCircle, Brain, Handshake, AlertCircle, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import RBACAdminPanel from '../components/RBACAdminPanel';
import OutcomePredictionWidget from '../components/OutcomePredictionWidget';
import AccessRequestQueue from '../components/AccessRequestQueue';
import PartnerPipelineAdmin from '../components/PartnerPipelineAdmin';
import PartnerAnalyticsDashboard from '../components/PartnerAnalyticsDashboard';
import PartnerAssetsReview from '../components/PartnerAssetsReview';
import SocialTemplatesSection from '../components/SocialTemplatesAdmin';
import KPIDashboard from '../components/KPIDashboard';

type AdminSection =
  | 'overview'
  | 'users'
  | 'team-access'
  | 'trial-users'
  | 'users-chat'
  | 'conversations'
  | 'embed-widgets'
  | 'rbac'
  | 'documents'
  | 'categories'
  | 'subcategories'
  | 'prompts'
  | 'ai-models'
  | 'access-requests'
  | 'partner-pipeline'
  | 'partner-analytics'
  | 'partner-assets'
  | 'social-templates'
  | 'kpi-dashboard';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  company: string;
  status: string;
  subscription_tier: string;
  is_admin: boolean;
  created_at: string;
  last_login_at: string;
  trial_started_at?: string;
  trial_expires_at?: string;
}

interface PromptCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface PromptSubcategory {
  id: number;
  category_id: number;
  name: string;
  description: string;
  keywords: string[];
  model_override: string;
  system_prompt_template: string;
  display_order: number;
  is_active: boolean;
  category_name?: string;
}

interface ChatbotPrompt {
  id: number;
  category_id: number;
  subcategory_id: number;
  title: string;
  prompt_text: string;
  description: string;
  jurisdiction: string;
  tags: string[];
  usage_count: number;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  category_name?: string;
  subcategory_name?: string;
}

interface AIModel {
  id: string;
  model_name: string;
  display_name: string;
  provider: string;
  is_active: boolean;
  is_default: boolean;
  priority: number;
  cost_per_token: number;
  max_tokens: number;
  settings: Record<string, unknown>;
}

interface ChatSession {
  id: string;
  session_token: string;
  question_count: number;
  created_at: string;
  last_question_at: string;
  ip_address: string;
  converted_to_trial: boolean;
  user_id?: string;
  user_email?: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ChatbotDocument {
  id: number;
  name: string;
  category: string;
  size_kb: number;
  file_path: string | null;
  is_parsed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [loading, setLoading] = useState(true);
  const [, setIsCurrentUserAdmin] = useState(false);
  const [sidebarExpanded, _setSidebarExpanded] = useState(true);
  const [chatbotMenuExpanded, setChatbotMenuExpanded] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data?.is_admin) {
      navigate('/');
      return;
    }

    setIsCurrentUserAdmin(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview' as AdminSection, label: 'Overview', icon: Home },
    { id: 'users' as AdminSection, label: 'User Management', icon: Users },
    { id: 'team-access' as AdminSection, label: 'Admin Team Access', icon: Crown },
    { id: 'trial-users' as AdminSection, label: 'Trial Users', icon: Clock },
    { id: 'users-chat' as AdminSection, label: 'Users Chat Listing', icon: MessagesSquare },
    { id: 'conversations' as AdminSection, label: 'Chat Conversations', icon: MessageSquare },
    { id: 'embed-widgets' as AdminSection, label: 'Embed Widgets', icon: Code2 },
    { id: 'rbac' as AdminSection, label: 'Roles & Approvals', icon: Shield },
    { id: 'access-requests' as AdminSection, label: 'Access Requests', icon: UserPlus },
    { id: 'partner-pipeline' as AdminSection, label: 'Partner Pipeline', icon: Handshake },
    { id: 'partner-analytics' as AdminSection, label: 'Partner Analytics', icon: BarChart3 },
    { id: 'partner-assets' as AdminSection, label: 'Partner Assets & Flyers', icon: FileDown },
    { id: 'social-templates' as AdminSection, label: 'Social Media Templates', icon: Mail },
    { id: 'kpi-dashboard' as AdminSection, label: 'KPI & Guardrails', icon: Activity },
  ];

  const chatbotItems = [
    { id: 'documents' as AdminSection, label: 'Documents', icon: FileUp },
    { id: 'categories' as AdminSection, label: 'Categories', icon: FolderTree },
    { id: 'subcategories' as AdminSection, label: 'Subcategories', icon: Layers },
    { id: 'prompts' as AdminSection, label: 'Prompts Library', icon: FileText },
    { id: 'ai-models' as AdminSection, label: 'AI Model Config', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-navy-100 flex">
      <aside
        className={`bg-gradient-to-b from-navy-900 to-navy-950 text-white transition-all duration-300 flex flex-col ${
          sidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4 border-b border-navy-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
              <Scale className="w-5 h-5 text-white" />
            </div>
            {sidebarExpanded && (
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-teal-400 to-teal-400 bg-clip-text text-transparent">ezLegal.ai</h2>
                <p className="text-xs text-navy-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Admin Panel
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeSection === item.id
                  ? 'bg-teal-600 text-white'
                  : 'text-navy-300 hover:bg-navy-800'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && <span>{item.label}</span>}
            </button>
          ))}

          <div className="mt-4 border-t border-navy-800 pt-4">
            <button
              onClick={() => setChatbotMenuExpanded(!chatbotMenuExpanded)}
              className="w-full flex items-center justify-between px-4 py-2 text-navy-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                {sidebarExpanded && <span className="font-semibold text-sm">Chatbot Actions</span>}
              </div>
              {sidebarExpanded &&
                (chatbotMenuExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                ))}
            </button>

            {(chatbotMenuExpanded || !sidebarExpanded) && (
              <div className="mt-1">
                {chatbotItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      sidebarExpanded ? 'pl-12' : ''
                    } ${
                      activeSection === item.id
                        ? 'bg-teal-600 text-white'
                        : 'text-navy-400 hover:bg-navy-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {sidebarExpanded && <span className="text-sm">{item.label}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-navy-800/50">
          <div className="px-4 pt-3 pb-1">
            {sidebarExpanded && <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">External Pages</span>}
          </div>
          <div className="px-2 space-y-0.5">
            <button
              onClick={() => navigate('/grant-reporting')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-navy-400 hover:text-white hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && <span className="text-sm">Grant Reporting</span>}
            </button>
            <button
              onClick={() => navigate('/lso-dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-navy-400 hover:text-white hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              <Scale className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && <span className="text-sm">LSO Dashboard</span>}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-navy-400 hover:text-white hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && <span className="text-sm">Back to Site</span>}
            </button>
          </div>

          {sidebarExpanded && (
            <div className="px-4 pb-4">
              <div className="bg-navy-800/30 rounded-lg p-3 border border-navy-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-500 rounded flex items-center justify-center">
                    <Scale className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-navy-300">ezLegal.ai</span>
                </div>
                <p className="text-xs text-navy-500 leading-relaxed">
                  Ethical AI for Access to Justice
                </p>
                <p className="text-xs text-navy-600 mt-1">
                  v2.0 Admin Console
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {activeSection === 'overview' && <OverviewSection onNavigate={setActiveSection} />}
        {activeSection === 'users' && <UsersSection />}
        {activeSection === 'team-access' && <TeamAccessSection />}
        {activeSection === 'trial-users' && <TrialUsersSection />}
        {activeSection === 'users-chat' && <UsersChatListingSection />}
        {activeSection === 'conversations' && <ConversationsSection />}
        {activeSection === 'embed-widgets' && <EmbedWidgetsAdminSection />}
        {activeSection === 'rbac' && <RBACAdminPanel />}
        {activeSection === 'access-requests' && <AccessRequestQueue />}
        {activeSection === 'partner-pipeline' && <PartnerPipelineAdmin />}
        {activeSection === 'partner-analytics' && <PartnerAnalyticsDashboard />}
        {activeSection === 'partner-assets' && <PartnerAssetsReview />}
        {activeSection === 'social-templates' && <SocialTemplatesSection />}
        {activeSection === 'kpi-dashboard' && <KPIDashboard />}
        {activeSection === 'documents' && <DocumentsSection />}
        {activeSection === 'categories' && <CategoriesSection />}
        {activeSection === 'subcategories' && <SubcategoriesSection />}
        {activeSection === 'prompts' && <PromptsSection />}
        {activeSection === 'ai-models' && <AIModelsSection />}
      </main>
    </div>
  );
}

function OverviewSection({ onNavigate }: { onNavigate: (section: AdminSection) => void }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    trialUsers: 0,
    totalConversations: 0,
    totalPrompts: 0,
    activeModels: 0,
    totalPredictions: 0,
  });
  const [governanceStats, setGovernanceStats] = useState({
    safetyReports: 0,
    openReports: 0,
    auditEvents: 0,
    crisisIncidents: 0,
    escalatedCrises: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [showPredictionNotice, setShowPredictionNotice] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [profiles, sessions, prompts, models, predictions, safetyReports, auditLogs, crisisIncidents] = await Promise.all([
        supabase.from('profiles').select('id, status, subscription_tier'),
        supabase.from('free_chat_sessions').select('id'),
        supabase.from('chatbot_prompts').select('id'),
        supabase.from('ai_model_configs').select('id, is_active'),
        supabase.from('case_outcome_predictions').select('id'),
        supabase.from('trust_safety_reports').select('id, status'),
        supabase.from('lso_audit_logs').select('id'),
        supabase.from('crisis_incidents').select('id, escalated_to_human'),
      ]);

      const users = profiles.data || [];
      const reports = safetyReports.data || [];
      const crises = crisisIncidents.data || [];

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === 'active').length,
        trialUsers: users.filter((u) => u.subscription_tier === 'trial').length,
        totalConversations: sessions.data?.length || 0,
        totalPrompts: prompts.data?.length || 0,
        activeModels: models.data?.filter((m) => m.is_active).length || 0,
        totalPredictions: predictions.data?.length || 0,
      });

      setGovernanceStats({
        safetyReports: reports.length,
        openReports: reports.filter((r) => r.status === 'pending' || r.status === 'investigating').length,
        auditEvents: auditLogs.data?.length || 0,
        crisisIncidents: crises.length,
        escalatedCrises: crises.filter((c) => c.escalated_to_human).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-navy-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          color="blue"
          onClick={() => onNavigate('users')}
          description="View and manage all registered users"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={stats.activeUsers}
          color="green"
          onClick={() => onNavigate('users')}
          description="View currently active users"
        />
        <StatCard
          icon={Clock}
          label="Trial Users"
          value={stats.trialUsers}
          color="amber"
          onClick={() => onNavigate('trial-users')}
          description="Manage users on trial subscriptions"
        />
        <StatCard
          icon={MessageSquare}
          label="Chat Sessions"
          value={stats.totalConversations}
          color="emerald"
          onClick={() => onNavigate('conversations')}
          description="View all chat conversations"
        />
        <StatCard
          icon={FileText}
          label="Prompts"
          value={stats.totalPrompts}
          color="sky"
          onClick={() => onNavigate('prompts')}
          description="Browse and edit prompt library"
        />
        <StatCard
          icon={Cpu}
          label="Active AI Models"
          value={stats.activeModels}
          color="teal"
          onClick={() => onNavigate('ai-models')}
          description="Configure AI model settings"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setShowPredictionNotice(true)}
            className="group bg-navy-800 rounded-xl p-6 text-left hover:shadow-lg hover:bg-navy-700 transition-all border border-navy-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Outcome Scenarios</h3>
                <p className="text-sm text-navy-300">Governed scenario estimates</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 rounded px-1.5 py-0.5 text-white font-medium">Governed</span>
                <span className="text-sm text-white/80">{stats.totalPredictions} scenarios run</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigate('embed-widgets')}
            className="group bg-teal-700 rounded-xl p-6 text-left hover:shadow-lg hover:bg-teal-600 transition-all border border-teal-600"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Embed Widgets</h3>
                <p className="text-sm text-teal-200">Manage website integrations</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-white/80">Configure widgets</span>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigate('rbac')}
            className="group bg-amber-700 rounded-xl p-6 text-left hover:shadow-lg hover:bg-amber-600 transition-all border border-amber-600"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Access Control</h3>
                <p className="text-sm text-amber-200">RBAC & permissions</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-white/80">Manage roles</span>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-navy-900">Governance & Safety</h2>
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Oversight</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-navy-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4.5 h-4.5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy-900">{governanceStats.safetyReports}</div>
                <div className="text-xs text-navy-500">Safety Reports</div>
              </div>
            </div>
            {governanceStats.openReports > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="font-medium">{governanceStats.openReports} open / needs review</span>
              </div>
            )}
            {governanceStats.openReports === 0 && (
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-medium">All reports resolved</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 border border-navy-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy-900">{governanceStats.auditEvents}</div>
                <div className="text-xs text-navy-500">Audit Log Events</div>
              </div>
            </div>
            <div className="text-xs text-navy-500 bg-navy-50 rounded-lg px-2.5 py-1.5">
              LSO compliance trail
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-navy-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center">
                <Handshake className="w-4.5 h-4.5 text-rose-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy-900">{governanceStats.crisisIncidents}</div>
                <div className="text-xs text-navy-500">Crisis Incidents</div>
              </div>
            </div>
            {governanceStats.escalatedCrises > 0 && (
              <div className="text-xs text-navy-600 bg-navy-50 rounded-lg px-2.5 py-1.5">
                <span className="font-medium">{governanceStats.escalatedCrises}</span> escalated to human
              </div>
            )}
            {governanceStats.escalatedCrises === 0 && (
              <div className="text-xs text-navy-500 bg-navy-50 rounded-lg px-2.5 py-1.5">
                No escalations recorded
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 border border-navy-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                <Brain className="w-4.5 h-4.5 text-teal-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy-900">{stats.totalPredictions}</div>
                <div className="text-xs text-navy-500">Outcome Scenarios</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 rounded-lg px-2.5 py-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span className="font-medium">Governed capability</span>
            </div>
          </div>
        </div>
      </div>

      {showPredictionNotice && !showPredictionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900">Governance Notice</h3>
                <p className="text-sm text-navy-500">Outcome Scenario Estimates</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <ul className="space-y-2 text-sm text-navy-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold mt-0.5">1.</span>
                  Outcome scenarios are <span className="font-semibold">statistical estimates only</span> and do not constitute legal advice.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold mt-0.5">2.</span>
                  All predictions are logged in the audit trail for compliance review.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold mt-0.5">3.</span>
                  Results must not be presented to end users without appropriate disclaimers.
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPredictionNotice(false)}
                className="flex-1 px-4 py-2.5 border border-navy-200 rounded-xl text-sm font-medium text-navy-600 hover:bg-navy-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPredictionNotice(false);
                  setShowPredictionModal(true);
                }}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                I Understand, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {showPredictionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <OutcomePredictionWidget onClose={() => setShowPredictionModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  onClick,
  description,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
  description?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-teal-100 text-teal-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    sky: 'bg-sky-100 text-sky-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={onClick ? `${label}: ${value}. ${description || 'Click to view details'}` : undefined}
      className={`bg-white rounded-xl p-6 shadow-sm border border-navy-200 group relative overflow-hidden ${
        onClick
          ? 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-navy-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
          : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-200 ${colorClasses[color]} ${onClick ? 'group-hover:scale-110' : ''}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="text-3xl font-bold text-navy-900">{value}</div>
          <div className="text-sm text-navy-600">{label}</div>
        </div>
        {onClick && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 text-navy-400">
            <span className="text-xs font-medium">View</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        )}
      </div>
      {onClick && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );
}

function TeamAccessSection() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('is_admin', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error) {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const toggleAdminAccess = async (userId: string, currentIsAdmin: boolean) => {
    if (userId === currentUser?.id) {
      alert("You cannot remove your own admin access.");
      return;
    }

    if (!confirm(
      currentIsAdmin
        ? "Remove admin access from this user?"
        : "Grant admin access to this user? They will be able to manage all system data."
    )) {
      return;
    }

    setUpdating(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentIsAdmin })
      .eq('id', userId);

    if (error) {
      alert(`Error updating admin access: ${error.message}`);
    } else {
      await fetchUsers();
    }

    setUpdating(null);
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminUsers = filteredUsers.filter(u => u.is_admin);
  const regularUsers = filteredUsers.filter(u => !u.is_admin);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Admin Team Access</h2>
          <p className="text-navy-600 mt-1">
            Grant or revoke admin access for team members. Admins can access all system features.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-lg">
          <Crown className="w-5 h-5 text-teal-600" />
          <span className="text-sm font-semibold text-teal-900">
            {adminUsers.length} Active Admin{adminUsers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-navy-200 p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-navy-200">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-navy-900">
                Admin Users ({adminUsers.length})
              </h3>
            </div>
            {adminUsers.length === 0 ? (
              <p className="text-navy-500 text-sm py-4">No admin users found</p>
            ) : (
              <div className="space-y-2">
                {adminUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-navy-900">{user.full_name || 'Unnamed'}</div>
                        <div className="text-sm text-navy-600">{user.email}</div>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-amber-600 font-medium">(You)</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAdminAccess(user.id, true)}
                      disabled={updating === user.id || user.id === currentUser?.id}
                      className="px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {updating === user.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Revoke Admin
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-navy-200">
              <Users className="w-5 h-5 text-navy-500" />
              <h3 className="text-lg font-semibold text-navy-900">
                Regular Users ({regularUsers.length})
              </h3>
            </div>
            {regularUsers.length === 0 ? (
              <p className="text-navy-500 text-sm py-4">No regular users found</p>
            ) : (
              <div className="space-y-2">
                {regularUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-white border border-navy-200 rounded-lg hover:bg-navy-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-navy-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-navy-900">{user.full_name || 'Unnamed'}</div>
                        <div className="text-sm text-navy-600">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAdminAccess(user.id, false)}
                      disabled={updating === user.id}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {updating === user.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4" />
                          Grant Admin
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              <li>Admin users can access all system features and data</li>
              <li>Users must log out and log back in for changes to take effect</li>
              <li>You cannot remove your own admin access</li>
              <li>Grant admin access only to trusted team members</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCreated, setFilterCreated] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    user_type: 'consumer',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      subscription_tier: user.subscription_tier,
      is_admin: user.is_admin,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);

    const { error } = await supabase.from('profiles').update(editForm).eq('id', selectedUser.id);

    if (!error) {
      fetchUsers();
      setShowModal(false);
    }
    setSaving(false);
  };

  const handleToggleSelect = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const getUserType = (user: UserProfile) => {
    if (user.subscription_tier === 'enterprise') return 'Lawyer';
    return 'Consumer';
  };

  const handleExport = () => {
    const csvContent = [
      ['Full Name', 'Email', 'Phone', 'Type', 'Status', 'Created'].join(','),
      ...filteredUsers.map((u) =>
        [u.full_name, u.email, u.phone || '', getUserType(u), u.status, new Date(u.created_at).toLocaleDateString()].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.csv';
    a.click();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    const userType = getUserType(u);
    const matchesType = filterType === 'all' ||
      (filterType === 'consumers' && userType === 'Consumer') ||
      (filterType === 'lawyers' && userType === 'Lawyer');
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-navy-900">User management</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Add user
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm font-medium"
            >
              <FileDown className="w-4 h-4" />
              Export
            </button>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm font-medium">
              <FileInput className="w-4 h-4" />
              Import csv
            </button>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm font-medium">
              <FileInput className="w-4 h-4" />
              Import csv (sample)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 mb-6">
          <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium">
            Resend welcome email
          </button>
          <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium">
            Send custom email
          </button>
          <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium">
            Send custom sms
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-sm text-navy-600 mb-1">Account created:</label>
            <select
              value={filterCreated}
              onChange={(e) => setFilterCreated(e.target.value)}
              className="px-3 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            >
              <option value="all">Show all</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-navy-600 mb-1">User status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            >
              <option value="all">Show all</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-navy-600 mb-1">User type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            >
              <option value="all">Show all</option>
              <option value="consumers">Consumers</option>
              <option value="lawyers">Lawyers</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search for a user by email, phone or name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium">
                Filter
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-navy-200">
                <tr>
                  <th className="text-left px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </th>
                  <th className="text-left px-4 py-3 w-10"></th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-navy-700">Full name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-navy-700">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-navy-700">Cell / SMS #</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-navy-700">Profile phone</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-navy-700">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-navy-700">Source</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-navy-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-navy-50 cursor-pointer"
                    onClick={() => handleEdit(user)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleToggleSelect(user.id)}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-navy-900">{user.full_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-navy-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-navy-600">{user.phone || 'n/a'}</td>
                    <td className="px-4 py-3 text-sm text-navy-600">{user.phone || 'n/a'}</td>
                    <td className="px-4 py-3 text-sm text-navy-600">{getUserType(user)}</td>
                    <td className="px-4 py-3 text-sm text-navy-600">-</td>
                    <td className="px-4 py-3 text-sm text-navy-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedUser && (
        <Modal title="Edit User" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Full Name</label>
              <input
                type="text"
                value={editForm.full_name || ''}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
              <input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Phone</label>
              <input
                type="tel"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Status</label>
                <select
                  value={editForm.status || 'active'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Type</label>
                <select
                  value={editForm.subscription_tier || 'free'}
                  onChange={(e) => setEditForm({ ...editForm, subscription_tier: e.target.value })}
                  className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="free">Consumer (Free)</option>
                  <option value="trial">Consumer (Trial)</option>
                  <option value="basic">Consumer (Basic)</option>
                  <option value="premium">Consumer (Premium)</option>
                  <option value="enterprise">Lawyer</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_admin"
                checked={editForm.is_admin || false}
                onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                className="w-4 h-4 text-teal-600"
              />
              <label htmlFor="is_admin" className="text-sm font-medium text-navy-700">
                Administrator Access
              </label>
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-navy-700 hover:bg-navy-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </Modal>
      )}

      {showAddModal && (
        <Modal title="Add New User" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Full Name</label>
              <input
                type="text"
                value={newUserForm.full_name}
                onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
              <input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Phone</label>
              <input
                type="tel"
                value={newUserForm.phone}
                onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">User Type</label>
              <select
                value={newUserForm.user_type}
                onChange={(e) => setNewUserForm({ ...newUserForm, user_type: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="consumer">Consumer</option>
                <option value="lawyer">Lawyer</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-navy-700 hover:bg-navy-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowAddModal(false);
              }}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TrialUsersSection() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrialUsers();
  }, []);

  const fetchTrialUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('subscription_tier', 'trial')
      .order('trial_started_at', { ascending: false });

    if (!error) {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const daysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-navy-900 mb-6">Trial Users</h1>

      <div className="bg-white rounded-xl shadow-sm border border-navy-200">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-navy-500">No trial users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    User
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Trial Started
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Days Remaining
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-200">
                {users.map((user) => {
                  const days = user.trial_expires_at ? daysRemaining(user.trial_expires_at) : 0;
                  return (
                    <tr key={user.id} className="hover:bg-navy-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy-900">
                          {user.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-navy-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-navy-600">
                        {user.trial_started_at
                          ? new Date(user.trial_started_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            days <= 3
                              ? 'bg-red-100 text-red-700'
                              : days <= 7
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {days} days
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-navy-100 text-navy-700'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatUser {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  total_questions: number;
}

interface UserChatMessage {
  id: string;
  message: string;
  response: string;
  created_at: string;
  attachments?: { file_name: string; file_size: number; file_type: string }[];
}

function UsersChatListingSection() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [userMessages, setUserMessages] = useState<UserChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, subscription_tier')
      .order('created_at', { ascending: false });

    if (profilesError || !profiles) {
      setLoading(false);
      return;
    }

    const { data: chatCounts } = await supabase
      .from('chat_messages')
      .select('user_id');

    const countMap = new Map<string, number>();
    chatCounts?.forEach((msg) => {
      countMap.set(msg.user_id, (countMap.get(msg.user_id) || 0) + 1);
    });

    const usersWithCounts: ChatUser[] = profiles.map((p) => ({
      id: p.id,
      full_name: p.full_name || '',
      email: p.email || '',
      user_type: p.subscription_tier === 'enterprise' ? 'Lawyer' : 'Consumer',
      total_questions: countMap.get(p.id) || 0,
    }));

    usersWithCounts.sort((a, b) => b.total_questions - a.total_questions);
    setUsers(usersWithCounts.filter((u) => u.total_questions > 0));
    setLoading(false);
  };

  const fetchUserMessages = async (user: ChatUser) => {
    setLoadingMessages(true);
    setSelectedUser(user);

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('id, message, response, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const { data: attachments } = await supabase
      .from('chat_attachments')
      .select('chat_message_id, file_name, file_size, file_type')
      .eq('user_id', user.id);

    const attachmentMap = new Map<string, { file_name: string; file_size: number; file_type: string }[]>();
    attachments?.forEach((a) => {
      if (a.chat_message_id) {
        const existing = attachmentMap.get(a.chat_message_id) || [];
        existing.push({ file_name: a.file_name, file_size: a.file_size || 0, file_type: a.file_type });
        attachmentMap.set(a.chat_message_id, existing);
      }
    });

    const messagesWithAttachments: UserChatMessage[] = (messages || []).map((m) => ({
      ...m,
      attachments: attachmentMap.get(m.id),
    }));

    setUserMessages(messagesWithAttachments);
    setLoadingMessages(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (selectedUser) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <button
              onClick={() => setSelectedUser(null)}
              className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg flex items-center gap-2 hover:bg-navy-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to screen
            </button>

            <button className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg hover:bg-navy-50 transition-colors">
              Document Listing
            </button>

            <button className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg hover:bg-navy-50 transition-colors font-medium">
              Users Chat Listing
            </button>

            <div className="bg-white rounded-xl border border-navy-200 p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {selectedUser.full_name?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase()}
              </div>
              <h3 className="text-lg font-semibold text-teal-600">{selectedUser.full_name || 'No name'}</h3>
              <p className="text-sm text-navy-600 mt-1">{selectedUser.email}</p>
              <div className="mt-4">
                <p className="text-sm text-navy-600">Total Asked Questions</p>
                <p className="text-2xl font-bold text-teal-600">{selectedUser.total_questions}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : userMessages.length === 0 ? (
              <div className="bg-white rounded-xl border border-navy-200 p-8 text-center text-navy-500">
                No messages found for this user
              </div>
            ) : (
              userMessages.map((msg) => (
                <div key={msg.id} className="bg-navy-100 rounded-xl p-4">
                  <p className="text-navy-900">{msg.message}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="bg-navy-700 text-white rounded-lg p-3 flex items-center gap-3"
                        >
                          <Paperclip className="w-5 h-5 text-navy-300" />
                          <div>
                            <p className="text-sm font-medium">{att.file_name}</p>
                            <p className="text-xs text-navy-400">
                              {att.file_type} {formatFileSize(att.file_size)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-navy-500 mt-2">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-navy-900">Users Chat Listing</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-navy-200">
        <div className="p-4 border-b border-navy-200">
          <div className="max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-navy-500">
            {searchTerm ? 'No users match your search' : 'No users with chat messages found'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                      Id
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                      Type
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                      Total Questions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-200">
                  {paginatedUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-navy-50">
                      <td className="px-6 py-4 text-sm text-navy-600">
                        {(currentPage - 1) * usersPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-navy-900">{user.full_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-navy-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-navy-600">{user.user_type}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => fetchUserMessages(user)}
                          className="text-teal-600 hover:text-teal-800 hover:underline font-medium"
                        >
                          {user.total_questions}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-navy-200 flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-teal-600 text-white'
                        : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ConversationsSection() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('free_chat_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error) {
      setSessions(data || []);
    }
    setLoading(false);
  };

  const viewConversation = async (session: ChatSession) => {
    setSelectedSession(session);
    setLoadingMessages(true);

    const { data, error } = await supabase
      .from('free_chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (!error) {
      setMessages(data || []);
    }
    setLoadingMessages(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-navy-900 mb-6">Chat Conversations</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-navy-200">
          <div className="p-4 border-b border-navy-200">
            <h2 className="font-semibold text-navy-900">Sessions ({sessions.length})</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => viewConversation(session)}
                  className={`w-full text-left p-4 border-b border-navy-100 hover:bg-navy-50 transition-colors ${
                    selectedSession?.id === session.id ? 'bg-teal-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-navy-900 text-sm">
                      Session #{session.session_token?.slice(0, 8)}
                    </span>
                    {session.converted_to_trial && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        Converted
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-navy-500">
                    {session.question_count} questions | {new Date(session.created_at).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-navy-200">
          <div className="p-4 border-b border-navy-200">
            <h2 className="font-semibold text-navy-900">
              {selectedSession ? 'Conversation' : 'Select a session'}
            </h2>
          </div>
          {loadingMessages ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
            </div>
          ) : selectedSession ? (
            <div className="max-h-[600px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <p className="text-navy-500 text-center py-8">No messages in this session</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user' ? 'bg-teal-50 ml-8' : 'bg-navy-50 mr-8'
                    }`}
                  >
                    <div className="text-xs text-navy-500 mb-1">
                      {msg.role === 'user' ? 'User' : 'Assistant'}
                    </div>
                    <div className="text-sm text-navy-900 whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-navy-500">
              Click on a session to view the conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentsSection() {
  const [documents, setDocuments] = useState<ChatbotDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ChatbotDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<ChatbotDocument | null>(null);
  const [form, setForm] = useState({ name: '', category: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('chatbot_documents')
      .select('*')
      .order('id', { ascending: false });

    if (!error) {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (doc: ChatbotDocument) => {
    setEditingDocument(doc);
    setForm({ name: doc.name, category: doc.category });
    setShowModal(true);
  };

  const handleView = (doc: ChatbotDocument) => {
    setViewingDocument(doc);
    setShowViewModal(true);
  };

  const handleSave = async () => {
    if (!editingDocument) return;
    setSaving(true);

    const { error } = await supabase
      .from('chatbot_documents')
      .update({ name: form.name, category: form.category })
      .eq('id', editingDocument.id);

    if (!error) {
      fetchDocuments();
      setShowModal(false);
    }
    setSaving(false);
  };

  const handleDelete = async (doc: ChatbotDocument) => {
    if (!confirm(`Delete "${doc.name}"? This action cannot be undone.`)) return;

    await supabase.from('chatbot_documents').delete().eq('id', doc.id);
    fetchDocuments();
  };

  const handleToggleStatus = async (doc: ChatbotDocument) => {
    await supabase
      .from('chatbot_documents')
      .update({ is_active: !doc.is_active })
      .eq('id', doc.id);
    fetchDocuments();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    const sizeKb = Math.round(file.size / 1024);

    const { error } = await supabase.from('chatbot_documents').insert({
      name: file.name,
      category: 'Uncategorized',
      size_kb: sizeKb,
      is_parsed: false,
      is_active: true,
    });

    if (!error) {
      fetchDocuments();
    }
    setUploading(false);
    e.target.value = '';
  };

  const formatSize = (sizeKb: number) => {
    if (sizeKb >= 1024) {
      return `${(sizeKb / 1024).toFixed(1)}MB`;
    }
    return `${sizeKb}kb`;
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-navy-900">Documents Management</h1>
        <div className="text-sm text-navy-500">{documents.length} documents</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-navy-200">
        <div className="p-4 border-b border-navy-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <label className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 cursor-pointer">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload PDF
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-navy-500">
            {searchTerm ? 'No documents match your search' : 'No documents uploaded yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Id
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Size
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Actions
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-navy-50">
                    <td className="px-6 py-4 text-sm text-navy-600">{doc.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="font-medium text-navy-900 max-w-xs truncate" title={doc.name}>
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-navy-600 max-w-xs truncate" title={doc.category}>
                      {doc.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-navy-600">{formatSize(doc.size_kb)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(doc)}
                          className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleEdit(doc)}
                          className="px-2 py-1 text-xs font-medium bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleView(doc)}
                          className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          View
                        </button>
                        <button
                          className="px-2 py-1 text-xs font-medium bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                        >
                          Download
                        </button>
                        <span className="ml-2 flex items-center gap-1 text-xs text-navy-600">
                          {doc.is_parsed ? (
                            <>
                              <span>Parsed</span>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </>
                          ) : (
                            <span className="text-amber-600">Pending</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(doc)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          doc.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                        }`}
                      >
                        {doc.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && editingDocument && (
        <Modal title="Edit Document" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Document Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-navy-700 hover:bg-navy-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.category}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </Modal>
      )}

      {showViewModal && viewingDocument && (
        <Modal title="Document Details" onClose={() => setShowViewModal(false)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-navy-50 rounded-lg">
              <FileText className="w-12 h-12 text-red-500" />
              <div>
                <div className="font-semibold text-navy-900">{viewingDocument.name}</div>
                <div className="text-sm text-navy-500">{formatSize(viewingDocument.size_kb)}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1">ID</label>
                <div className="text-navy-900">{viewingDocument.id}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1">Category</label>
                <div className="text-navy-900">{viewingDocument.category}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1">Status</label>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    viewingDocument.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-navy-100 text-navy-600'
                  }`}
                >
                  {viewingDocument.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1">Parsed</label>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    viewingDocument.is_parsed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {viewingDocument.is_parsed ? 'Yes' : 'Pending'}
                </span>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-navy-500 mb-1">Created</label>
                <div className="text-navy-900">
                  {new Date(viewingDocument.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowViewModal(false)}
              className="px-4 py-2 text-navy-700 hover:bg-navy-100 rounded-lg"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CategoriesSection() {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PromptCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', description: '', icon: 'folder', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('prompt_categories')
      .select('*')
      .order('id', { ascending: true });

    if (!error) {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '', icon: 'folder', is_active: true });
    setShowModal(true);
  };

  const handleEdit = (category: PromptCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'folder',
      is_active: category.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);

    if (editingCategory) {
      await supabase.from('prompt_categories').update(form).eq('id', editingCategory.id);
    } else {
      await supabase.from('prompt_categories').insert(form);
    }

    fetchCategories();
    setShowModal(false);
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    await supabase.from('prompt_categories').delete().eq('id', id);
    fetchCategories();
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-navy-900">Categories Management</h1>
        <div className="text-sm text-navy-500">{categories.length} categories</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-navy-200">
        <div className="p-4 border-b border-navy-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search Category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-navy-500">
            {searchTerm ? 'No categories match your search' : 'No categories found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Id
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Category
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-200">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-navy-50">
                    <td className="px-6 py-4 text-sm text-navy-600">{cat.id}</td>
                    <td className="px-6 py-4 font-medium text-navy-900">{cat.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="px-3 py-1.5 text-xs font-medium bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editingCategory ? 'Edit Category' : 'Add Category'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-teal-600"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-navy-700">
                Active
              </label>
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-navy-700 hover:bg-navy-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SubcategoriesSection() {
  const [subcategories, setSubcategories] = useState<PromptSubcategory[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PromptSubcategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    category_id: 0,
    name: '',
    description: '',
    keywords: '',
    model_override: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [subcatResult, catResult] = await Promise.all([
      supabase.from('prompt_subcategories').select('*').order('id', { ascending: true }),
      supabase.from('prompt_categories').select('id, name').order('id'),
    ]);

    if (!subcatResult.error && !catResult.error) {
      const cats = catResult.data || [];
      const catMap = new Map(cats.map((c) => [c.id, c.name]));
      const subcats = (subcatResult.data || []).map((s) => ({
        ...s,
        category_name: catMap.get(s.category_id) || 'Unknown',
      }));
      setSubcategories(subcats);
      setCategories(cats as PromptCategory[]);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm({ category_id: categories[0]?.id || 0, name: '', description: '', keywords: '', model_override: '', is_active: true });
    setShowModal(true);
  };

  const handleEdit = (item: PromptSubcategory) => {
    setEditingItem(item);
    setForm({
      category_id: item.category_id,
      name: item.name,
      description: item.description || '',
      keywords: item.keywords?.join(', ') || '',
      model_override: item.model_override || '',
      is_active: item.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
    };

    if (editingItem) {
      await supabase.from('prompt_subcategories').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('prompt_subcategories').insert(payload);
    }

    fetchData();
    setShowModal(false);
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this subcategory?')) return;
    await supabase.from('prompt_subcategories').delete().eq('id', id);
    fetchData();
  };

  const filteredSubcategories = subcategories.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-navy-900">Subcategories Management</h1>
        <div className="text-sm text-navy-500">{subcategories.length} subcategories</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-navy-200">
        <div className="p-4 border-b border-navy-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search Sub Category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Sub Category
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          </div>
        ) : filteredSubcategories.length === 0 ? (
          <div className="p-8 text-center text-navy-500">
            {searchTerm ? 'No subcategories match your search' : 'No subcategories found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Id
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Sub Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Description
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-200">
                {filteredSubcategories.map((item) => (
                  <tr key={item.id} className="hover:bg-navy-50">
                    <td className="px-6 py-4 text-sm text-navy-600">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-navy-900">{item.category_name}</td>
                    <td className="px-6 py-4 font-medium text-navy-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-navy-600 max-w-md">
                      <span className="line-clamp-2">{item.description || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1.5 text-xs font-medium bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editingItem ? 'Edit Subcategory' : 'Add Subcategory'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="eviction, tenant, landlord"
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Model Override</label>
              <input
                type="text"
                value={form.model_override}
                onChange={(e) => setForm({ ...form, model_override: e.target.value })}
                placeholder="gpt-4, gpt-4o-mini, etc."
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="subcat_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-teal-600"
              />
              <label htmlFor="subcat_active" className="text-sm font-medium text-navy-700">
                Active
              </label>
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-navy-700 hover:bg-navy-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.category_id}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PromptsSection() {
  const [prompts, setPrompts] = useState<ChatbotPrompt[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [subcategories, setSubcategories] = useState<PromptSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ChatbotPrompt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    category_id: 0,
    subcategory_id: 0,
    title: '',
    prompt_text: '',
    description: '',
    jurisdiction: 'Arizona',
    tags: '',
    is_active: true,
    is_featured: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [promptsRes, catsRes, subcatsRes] = await Promise.all([
      supabase.from('chatbot_prompts').select('*').order('id', { ascending: true }),
      supabase.from('prompt_categories').select('id, name').order('id'),
      supabase.from('prompt_subcategories').select('id, name, category_id').order('id'),
    ]);

    if (!promptsRes.error && !catsRes.error && !subcatsRes.error) {
      const cats = catsRes.data || [];
      const subcats = subcatsRes.data || [];
      const catMap = new Map(cats.map((c) => [c.id, c.name]));
      const subcatMap = new Map(subcats.map((s) => [s.id, s.name]));

      const mappedPrompts = (promptsRes.data || []).map((p) => ({
        ...p,
        category_name: catMap.get(p.category_id) || 'Uncategorized',
        subcategory_name: subcatMap.get(p.subcategory_id) || '-',
      }));

      setPrompts(mappedPrompts);
      setCategories(cats as PromptCategory[]);
      setSubcategories(subcats as PromptSubcategory[]);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm({
      category_id: categories[0]?.id || 0,
      subcategory_id: 0,
      title: '',
      prompt_text: '',
      description: '',
      jurisdiction: 'Arizona',
      tags: '',
      is_active: true,
      is_featured: false,
    });
    setShowModal(true);
  };

  const handleEdit = (item: ChatbotPrompt) => {
    setEditingItem(item);
    setForm({
      category_id: item.category_id || 0,
      subcategory_id: item.subcategory_id || 0,
      title: item.title,
      prompt_text: item.prompt_text,
      description: item.description || '',
      jurisdiction: item.jurisdiction || 'Arizona',
      tags: item.tags?.join(', ') || '',
      is_active: item.is_active,
      is_featured: item.is_featured,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      subcategory_id: form.subcategory_id || null,
    };

    if (editingItem) {
      await supabase.from('chatbot_prompts').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('chatbot_prompts').insert(payload);
    }

    fetchData();
    setShowModal(false);
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this prompt?')) return;
    await supabase.from('chatbot_prompts').delete().eq('id', id);
    fetchData();
  };

  const filteredPrompts = prompts.filter(
    (item) =>
      item.prompt_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubcategories = form.category_id
    ? subcategories.filter((s) => s.category_id === form.category_id)
    : subcategories;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-navy-900">Prompts Management</h1>
        <div className="text-sm text-navy-500">{prompts.length} prompts</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-navy-200">
        <div className="p-4 border-b border-navy-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search Prompt"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Prompt
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="p-8 text-center text-navy-500">
            {searchTerm ? 'No prompts match your search' : 'No prompts found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Id
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Sub Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Prompt
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-200">
                {filteredPrompts.map((item) => (
                  <tr key={item.id} className="hover:bg-navy-50">
                    <td className="px-6 py-4 text-sm text-navy-600">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-navy-900">{item.category_name}</td>
                    <td className="px-6 py-4 text-sm text-navy-900">{item.subcategory_name}</td>
                    <td className="px-6 py-4 text-sm text-navy-600 max-w-lg">
                      <span className="line-clamp-2">{item.prompt_text}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1.5 text-xs font-medium bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editingItem ? 'Edit Prompt' : 'Add Prompt'} onClose={() => setShowModal(false)} wide>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-navy-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value), subcategory_id: 0 })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={0}>Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Subcategory</label>
              <select
                value={form.subcategory_id}
                onChange={(e) => setForm({ ...form, subcategory_id: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={0}>None</option>
                {filteredSubcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-navy-700 mb-1">Prompt Text</label>
              <textarea
                value={form.prompt_text}
                onChange={(e) => setForm({ ...form, prompt_text: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Jurisdiction</label>
              <input
                type="text"
                value={form.jurisdiction}
                onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="eviction, tenant, housing"
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-teal-600"
                />
                <span className="text-sm font-medium text-navy-700">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4 text-teal-600"
                />
                <span className="text-sm font-medium text-navy-700">Featured</span>
              </label>
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-navy-700 hover:bg-navy-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title || !form.prompt_text}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AIModelsSection() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AIModel | null>(null);
  const [form, setForm] = useState({
    model_name: '',
    display_name: '',
    provider: 'openai',
    is_active: true,
    is_default: false,
    priority: 0,
    max_tokens: 4096,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    const { data, error } = await supabase
      .from('ai_model_configs')
      .select('*')
      .order('priority', { ascending: false });

    if (!error) {
      setModels(data || []);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm({
      model_name: '',
      display_name: '',
      provider: 'openai',
      is_active: true,
      is_default: false,
      priority: 0,
      max_tokens: 4096,
    });
    setShowModal(true);
  };

  const handleEdit = (item: AIModel) => {
    setEditingItem(item);
    setForm({
      model_name: item.model_name,
      display_name: item.display_name,
      provider: item.provider,
      is_active: item.is_active,
      is_default: item.is_default,
      priority: item.priority,
      max_tokens: item.max_tokens,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);

    if (form.is_default) {
      await supabase.from('ai_model_configs').update({ is_default: false }).neq('id', editingItem?.id || '');
    }

    if (editingItem) {
      await supabase.from('ai_model_configs').update(form).eq('id', editingItem.id);
    } else {
      await supabase.from('ai_model_configs').insert(form);
    }

    fetchModels();
    setShowModal(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this model configuration?')) return;
    await supabase.from('ai_model_configs').delete().eq('id', id);
    fetchModels();
  };

  const handleSetDefault = async (model: AIModel) => {
    await supabase.from('ai_model_configs').update({ is_default: false }).neq('id', model.id);
    await supabase.from('ai_model_configs').update({ is_default: true }).eq('id', model.id);
    fetchModels();
  };

  const handleToggleActive = async (model: AIModel) => {
    await supabase.from('ai_model_configs').update({ is_active: !model.is_active }).eq('id', model.id);
    fetchModels();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">AI Model Configuration</h1>
          <p className="text-navy-600 mt-1">Configure available ChatGPT models and versions</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Model
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-navy-200">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Model
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Provider
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Max Tokens
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Priority
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-navy-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-200">
                {models.map((model) => (
                  <tr key={model.id} className="hover:bg-navy-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-navy-900">{model.display_name}</div>
                        {model.is_default && (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-navy-500">{model.model_name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-navy-600 capitalize">{model.provider}</td>
                    <td className="px-6 py-4 text-sm text-navy-600">{model.max_tokens.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-navy-600">{model.priority}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          model.is_active ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-600'
                        }`}
                      >
                        {model.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!model.is_default && (
                          <button
                            onClick={() => handleSetDefault(model)}
                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                            title="Set as default"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(model)}
                          className={`p-2 rounded-lg ${
                            model.is_active
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {model.is_active ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(model)}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(model.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editingItem ? 'Edit Model' : 'Add Model'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Model Name (API)</label>
              <input
                type="text"
                value={form.model_name}
                onChange={(e) => setForm({ ...form, model_name: e.target.value })}
                placeholder="gpt-4o-mini"
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Display Name</label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                placeholder="ChatGPT 4o Mini"
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Provider</label>
                <select
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="meta">Meta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Max Tokens</label>
                <input
                  type="number"
                  value={form.max_tokens}
                  onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) || 4096 })}
                  className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Priority (higher = shown first)</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-teal-600"
                />
                <span className="text-sm font-medium text-navy-700">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="w-4 h-4 text-teal-600"
                />
                <span className="text-sm font-medium text-navy-700">Default Model</span>
              </label>
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-navy-700 hover:bg-navy-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.model_name || !form.display_name}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface AdminWidget {
  id: string;
  user_id: string;
  name: string;
  widget_type: string;
  api_key: string;
  config: {
    appearance: {
      primaryColor: string;
      position: string;
      headerTitle: string;
      showBranding: boolean;
    };
    behavior: {
      greetingMessage: string;
    };
  };
  allowed_domains: string[];
  is_active: boolean;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface WidgetAnalyticsData {
  widget_id: string;
  impressions: number;
  opens: number;
  messages: number;
  emails: number;
}

interface DomainAnalytics {
  domain: string;
  impressions: number;
  opens: number;
  messages: number;
  emails: number;
}

interface DailyTrend {
  date: string;
  impressions: number;
  opens: number;
  messages: number;
  emails: number;
}

interface DetailedAnalytics {
  byDomain: DomainAnalytics[];
  byWidget: { widget_id: string; widget_name: string; impressions: number; opens: number; messages: number; emails: number }[];
  dailyTrend: DailyTrend[];
  totalEvents: number;
  uniqueVisitors: number;
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'contact_form';
  content: string;
  timestamp: string;
  legalIssue?: string;
  phone?: string;
}

interface WidgetConversation {
  id: string;
  widget_id: string;
  visitor_id: string;
  visitor_email: string | null;
  visitor_name: string | null;
  messages: ConversationMessage[];
  metadata: { domain?: string; source?: string };
  status: 'active' | 'closed' | 'escalated';
  created_at: string;
  updated_at: string;
  widget_name?: string;
}

type AnalyticsMetricType = 'impressions' | 'messages' | 'domains' | 'widgets' | 'opens' | 'emails' | 'conversations';

function EmbedWidgetsAdminSection() {
  const [widgets, setWidgets] = useState<AdminWidget[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, WidgetAnalyticsData>>({});
  const [detailedAnalytics, setDetailedAnalytics] = useState<DetailedAnalytics | null>(null);
  const [conversations, setConversations] = useState<WidgetConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedWidget, setSelectedWidget] = useState<AdminWidget | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetricType>('impressions');
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null);

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    try {
      const { data: widgetsData, error: widgetsError } = await supabase
        .from('embed_widgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (widgetsError) throw widgetsError;

      const userIds = [...new Set((widgetsData || []).map(w => w.user_id))];

      let usersMap: Record<string, { email: string; full_name: string }> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        (usersData || []).forEach(u => {
          usersMap[u.id] = { email: u.email, full_name: u.full_name };
        });
      }

      const widgetsWithUsers = (widgetsData || []).map(w => ({
        ...w,
        user_email: usersMap[w.user_id]?.email || 'Unknown',
        user_name: usersMap[w.user_id]?.full_name || '',
      }));

      setWidgets(widgetsWithUsers);

      if (widgetsData && widgetsData.length > 0) {
        await fetchAnalytics(widgetsData.map(w => w.id));
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (widgetIds: string[]) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('widget_analytics')
        .select('widget_id, event_type')
        .in('widget_id', widgetIds)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const analyticsMap: Record<string, WidgetAnalyticsData> = {};
      widgetIds.forEach(id => {
        analyticsMap[id] = { widget_id: id, impressions: 0, opens: 0, messages: 0, emails: 0 };
      });

      (data || []).forEach(event => {
        if (!analyticsMap[event.widget_id]) return;
        switch (event.event_type) {
          case 'impression':
            analyticsMap[event.widget_id].impressions++;
            break;
          case 'open':
            analyticsMap[event.widget_id].opens++;
            break;
          case 'message':
            analyticsMap[event.widget_id].messages++;
            break;
          case 'email_collected':
            analyticsMap[event.widget_id].emails++;
            break;
        }
      });

      setAnalytics(analyticsMap);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchDetailedAnalytics = async (metric?: AnalyticsMetricType) => {
    setLoadingDetailed(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: rawData, error } = await supabase
        .from('widget_analytics')
        .select('widget_id, event_type, domain, visitor_id, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const domainMap: Record<string, DomainAnalytics> = {};
      const widgetMap: Record<string, { impressions: number; opens: number; messages: number; emails: number }> = {};
      const dailyMap: Record<string, DailyTrend> = {};
      const uniqueVisitors = new Set<string>();

      (rawData || []).forEach(event => {
        const domain = event.domain || 'unknown';
        const widgetId = event.widget_id;
        const eventDate = new Date(event.created_at).toISOString().split('T')[0];

        if (event.visitor_id) uniqueVisitors.add(event.visitor_id);

        if (!domainMap[domain]) {
          domainMap[domain] = { domain, impressions: 0, opens: 0, messages: 0, emails: 0 };
        }
        if (!widgetMap[widgetId]) {
          widgetMap[widgetId] = { impressions: 0, opens: 0, messages: 0, emails: 0 };
        }
        if (!dailyMap[eventDate]) {
          dailyMap[eventDate] = { date: eventDate, impressions: 0, opens: 0, messages: 0, emails: 0 };
        }

        switch (event.event_type) {
          case 'impression':
            domainMap[domain].impressions++;
            widgetMap[widgetId].impressions++;
            dailyMap[eventDate].impressions++;
            break;
          case 'open':
            domainMap[domain].opens++;
            widgetMap[widgetId].opens++;
            dailyMap[eventDate].opens++;
            break;
          case 'message':
            domainMap[domain].messages++;
            widgetMap[widgetId].messages++;
            dailyMap[eventDate].messages++;
            break;
          case 'email_collected':
            domainMap[domain].emails++;
            widgetMap[widgetId].emails++;
            dailyMap[eventDate].emails++;
            break;
        }
      });

      const byDomain = Object.values(domainMap).sort((a, b) => b.impressions - a.impressions);
      const byWidget = Object.entries(widgetMap).map(([widget_id, stats]) => ({
        widget_id,
        widget_name: widgets.find(w => w.id === widget_id)?.name || 'Unknown Widget',
        ...stats,
      })).sort((a, b) => b.impressions - a.impressions);
      const dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

      setDetailedAnalytics({
        byDomain,
        byWidget,
        dailyTrend,
        totalEvents: rawData?.length || 0,
        uniqueVisitors: uniqueVisitors.size,
      });

      if (metric) setSelectedMetric(metric);
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
    } finally {
      setLoadingDetailed(false);
    }
  };

  const fetchConversations = async () => {
    setLoadingDetailed(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('widget_conversations')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversationsWithWidgetNames = (data || []).map(conv => ({
        ...conv,
        widget_name: widgets.find(w => w.id === conv.widget_id)?.name || 'Unknown Widget',
      }));

      setConversations(conversationsWithWidgetNames);
      setSelectedMetric('conversations');
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingDetailed(false);
    }
  };

  const toggleWidgetStatus = async (widget: AdminWidget) => {
    try {
      const { error } = await supabase
        .from('embed_widgets')
        .update({ is_active: !widget.is_active })
        .eq('id', widget.id);

      if (error) throw error;

      setWidgets(widgets.map(w =>
        w.id === widget.id ? { ...w, is_active: !w.is_active } : w
      ));
    } catch (error) {
      console.error('Error toggling widget status:', error);
    }
  };

  const getWidgetTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      chat: 'AI Chat Widget',
      lawyer_search: 'Lawyer Search',
      contact_form: 'Contact Form',
      document_analyzer: 'Document Analyzer',
      outcome_predictor: 'Outcome Predictor',
      negotiation_planner: 'Negotiation Planner',
    };
    return types[type] || type;
  };

  const filteredWidgets = widgets.filter(widget => {
    const matchesSearch =
      widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      widget.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      widget.allowed_domains.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || widget.widget_type === filterType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && widget.is_active) ||
      (filterStatus === 'inactive' && !widget.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalStats = {
    totalWidgets: widgets.length,
    activeWidgets: widgets.filter(w => w.is_active).length,
    totalImpressions: Object.values(analytics).reduce((sum, a) => sum + a.impressions, 0),
    totalMessages: Object.values(analytics).reduce((sum, a) => sum + a.messages, 0),
    uniqueDomains: [...new Set(widgets.flatMap(w => w.allowed_domains))].length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Embed Widgets</h1>
          <p className="text-navy-600">Manage all widgets across all users</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <button
          onClick={() => fetchDetailedAnalytics('widgets')}
          disabled={loadingDetailed}
          className="bg-white rounded-xl p-4 border border-navy-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
              <Code2 className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">{totalStats.totalWidgets}</p>
              <p className="text-xs text-navy-500">Total Widgets</p>
            </div>
          </div>
          <p className="text-xs text-teal-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to view breakdown</p>
        </button>
        <button
          onClick={() => fetchDetailedAnalytics('widgets')}
          disabled={loadingDetailed}
          className="bg-white rounded-xl p-4 border border-navy-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">{totalStats.activeWidgets}</p>
              <p className="text-xs text-navy-500">Active Widgets</p>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to view breakdown</p>
        </button>
        <button
          onClick={() => fetchDetailedAnalytics('impressions')}
          disabled={loadingDetailed}
          className="bg-white rounded-xl p-4 border border-navy-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              {loadingDetailed ? <Loader2 className="w-5 h-5 text-amber-600 animate-spin" /> : <Eye className="w-5 h-5 text-amber-600" />}
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">{totalStats.totalImpressions.toLocaleString()}</p>
              <p className="text-xs text-navy-500">Impressions (30d)</p>
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to see where from</p>
        </button>
        <button
          onClick={() => fetchConversations()}
          disabled={loadingDetailed}
          className="bg-white rounded-xl p-4 border border-navy-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
              {loadingDetailed ? <Loader2 className="w-5 h-5 text-teal-600 animate-spin" /> : <MessagesSquare className="w-5 h-5 text-teal-600" />}
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">{totalStats.totalMessages.toLocaleString()}</p>
              <p className="text-xs text-navy-500">Messages (30d)</p>
            </div>
          </div>
          <p className="text-xs text-teal-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to view conversations</p>
        </button>
        <button
          onClick={() => fetchDetailedAnalytics('domains')}
          disabled={loadingDetailed}
          className="bg-white rounded-xl p-4 border border-navy-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
              <Globe className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">{totalStats.uniqueDomains}</p>
              <p className="text-xs text-navy-500">Unique Domains</p>
            </div>
          </div>
          <p className="text-xs text-teal-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to see breakdown</p>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-navy-200 shadow-sm">
        <div className="p-4 border-b border-navy-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search by name, user, or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value="chat">AI Chat</option>
              <option value="lawyer_search">Lawyer Search</option>
              <option value="contact_form">Contact Form</option>
              <option value="document_analyzer">Document Analyzer</option>
              <option value="outcome_predictor">Outcome Predictor</option>
              <option value="negotiation_planner">Negotiation Planner</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Widget</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Domains</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Analytics (30d)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-200">
              {filteredWidgets.map((widget) => {
                const widgetAnalytics = analytics[widget.id] || { impressions: 0, opens: 0, messages: 0, emails: 0 };
                return (
                  <tr key={widget.id} className="hover:bg-navy-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${widget.config?.appearance?.primaryColor || '#0067FF'}20` }}
                        >
                          {widget.widget_type === 'chat' && <MessageSquare className="w-5 h-5" style={{ color: widget.config?.appearance?.primaryColor || '#0067FF' }} />}
                          {widget.widget_type === 'lawyer_search' && <Search className="w-5 h-5" style={{ color: widget.config?.appearance?.primaryColor || '#0067FF' }} />}
                          {widget.widget_type === 'contact_form' && <Mail className="w-5 h-5" style={{ color: widget.config?.appearance?.primaryColor || '#0067FF' }} />}
                          {widget.widget_type === 'document_analyzer' && <FileText className="w-5 h-5" style={{ color: widget.config?.appearance?.primaryColor || '#0067FF' }} />}
                          {widget.widget_type === 'outcome_predictor' && <Brain className="w-5 h-5" style={{ color: widget.config?.appearance?.primaryColor || '#0067FF' }} />}
                          {widget.widget_type === 'negotiation_planner' && <Handshake className="w-5 h-5" style={{ color: widget.config?.appearance?.primaryColor || '#0067FF' }} />}
                        </div>
                        <div>
                          <p className="font-medium text-navy-900">{widget.name}</p>
                          <p className="text-xs text-navy-500">{getWidgetTypeLabel(widget.widget_type)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-navy-900">{widget.user_name || widget.user_email}</p>
                      {widget.user_name && <p className="text-xs text-navy-500">{widget.user_email}</p>}
                    </td>
                    <td className="px-4 py-4">
                      {widget.allowed_domains.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {widget.allowed_domains.slice(0, 2).map((domain, i) => (
                            <span key={i} className="px-2 py-0.5 bg-navy-100 text-navy-600 rounded text-xs">
                              {domain}
                            </span>
                          ))}
                          {widget.allowed_domains.length > 2 && (
                            <span className="px-2 py-0.5 bg-navy-100 text-navy-600 rounded text-xs">
                              +{widget.allowed_domains.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600">All domains</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-navy-600">
                          <Eye className="w-4 h-4" />
                          <span>{widgetAnalytics.impressions}</span>
                        </div>
                        <div className="flex items-center gap-1 text-navy-600">
                          <MousePointer className="w-4 h-4" />
                          <span>{widgetAnalytics.opens}</span>
                        </div>
                        <div className="flex items-center gap-1 text-navy-600">
                          <MessageSquare className="w-4 h-4" />
                          <span>{widgetAnalytics.messages}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        widget.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-navy-100 text-navy-600'
                      }`}>
                        {widget.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleWidgetStatus(widget)}
                          className={`p-2 rounded-lg transition-colors ${
                            widget.is_active
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-navy-400 hover:bg-navy-100'
                          }`}
                          title={widget.is_active ? 'Disable widget' : 'Enable widget'}
                        >
                          {widget.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWidget(widget);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-navy-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredWidgets.length === 0 && (
            <div className="text-center py-12">
              <Code2 className="w-12 h-12 text-navy-300 mx-auto mb-3" />
              <p className="text-navy-600">No widgets found</p>
              <p className="text-sm text-navy-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {showDetailsModal && selectedWidget && (
        <Modal title="Widget Details" onClose={() => setShowDetailsModal(false)} wide>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${selectedWidget.config?.appearance?.primaryColor || '#0067FF'}20` }}
              >
                <MessageSquare className="w-8 h-8" style={{ color: selectedWidget.config?.appearance?.primaryColor || '#0067FF' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-navy-900">{selectedWidget.name}</h3>
                <p className="text-navy-600">{getWidgetTypeLabel(selectedWidget.widget_type)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedWidget.is_active ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-600'
                  }`}>
                    {selectedWidget.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-navy-500">
                    Created {new Date(selectedWidget.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-navy-900 mb-3">Owner Information</h4>
                <div className="bg-navy-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-navy-500" />
                    <span className="text-sm text-navy-700">{selectedWidget.user_name || 'No name'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-navy-500" />
                    <span className="text-sm text-navy-700">{selectedWidget.user_email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-navy-900 mb-3">Analytics (30 days)</h4>
                <div className="bg-navy-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-navy-900">
                        {(analytics[selectedWidget.id]?.impressions || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-navy-500">Impressions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy-900">
                        {(analytics[selectedWidget.id]?.opens || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-navy-500">Opens</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy-900">
                        {(analytics[selectedWidget.id]?.messages || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-navy-500">Messages</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy-900">
                        {(analytics[selectedWidget.id]?.emails || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-navy-500">Emails Collected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-navy-900 mb-3">Allowed Domains</h4>
              {selectedWidget.allowed_domains.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedWidget.allowed_domains.map((domain, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-navy-100 text-navy-700 rounded-lg text-sm">
                      <Globe className="w-4 h-4" />
                      {domain}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-amber-600 text-sm">Widget allows all domains (not recommended)</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-navy-900 mb-3">Configuration</h4>
              <div className="bg-navy-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-navy-600">Primary Color</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border border-navy-300"
                      style={{ backgroundColor: selectedWidget.config?.appearance?.primaryColor || '#0067FF' }}
                    />
                    <span className="text-sm font-mono text-navy-900">
                      {selectedWidget.config?.appearance?.primaryColor || '#0067FF'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-navy-600">Position</span>
                  <span className="text-sm text-navy-900">{selectedWidget.config?.appearance?.position || 'bottom-right'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-navy-600">Header Title</span>
                  <span className="text-sm text-navy-900">{selectedWidget.config?.appearance?.headerTitle || 'Legal Assistant'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-navy-600">Show Branding</span>
                  <span className={`text-sm ${selectedWidget.config?.appearance?.showBranding ? 'text-green-600' : 'text-navy-500'}`}>
                    {selectedWidget.config?.appearance?.showBranding ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-navy-900 mb-3">API Key</h4>
              <div className="bg-navy-900 rounded-lg p-3 overflow-x-auto">
                <code className="text-sm text-green-400 font-mono">{selectedWidget.api_key}</code>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showAnalyticsModal && (detailedAnalytics || selectedMetric === 'conversations') && (
        <Modal title={selectedMetric === 'conversations' ? 'Widget Conversations' : 'Widget Analytics Breakdown'} onClose={() => { setShowAnalyticsModal(false); setExpandedConversation(null); }} wide>
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {(['impressions', 'messages', 'domains', 'widgets', 'conversations'] as AnalyticsMetricType[]).map((metric) => (
                <button
                  key={metric}
                  onClick={() => {
                    if (metric === 'conversations') {
                      fetchConversations();
                    } else if (!detailedAnalytics) {
                      fetchDetailedAnalytics(metric);
                    } else {
                      setSelectedMetric(metric);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMetric === metric
                      ? 'bg-teal-600 text-white'
                      : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                  }`}
                >
                  {metric === 'impressions' && 'By Domain (Impressions)'}
                  {metric === 'messages' && 'By Domain (Messages)'}
                  {metric === 'domains' && 'All Domains'}
                  {metric === 'widgets' && 'By Widget'}
                  {metric === 'conversations' && 'View Conversations'}
                </button>
              ))}
            </div>

            {selectedMetric === 'conversations' && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
                    <p className="text-3xl font-bold text-teal-700">{conversations.length}</p>
                    <p className="text-sm text-teal-600">Total Conversations</p>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
                    <p className="text-3xl font-bold text-teal-700">{conversations.reduce((sum, c) => sum + c.messages.length, 0)}</p>
                    <p className="text-sm text-teal-600">Total Messages</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <p className="text-3xl font-bold text-amber-700">{[...new Set(conversations.map(c => c.metadata?.domain || 'unknown'))].length}</p>
                    <p className="text-sm text-amber-600">Domains</p>
                  </div>
                </div>

                {conversations.length === 0 ? (
                  <div className="bg-navy-50 rounded-xl p-8 text-center">
                    <MessagesSquare className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                    <p className="text-navy-600">No conversations recorded yet</p>
                    <p className="text-sm text-navy-500">Conversations will appear once users start chatting through embedded widgets</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                      <MessagesSquare className="w-5 h-5 text-teal-600" />
                      Recent Conversations
                    </h4>
                    {conversations.map((conv) => {
                      const isExpanded = expandedConversation === conv.id;
                      const userMessages = conv.messages.filter(m => m.role === 'user' || m.role === 'contact_form');
                      const previewMessage = userMessages[0]?.content || 'No message content';
                      return (
                        <div key={conv.id} className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedConversation(isExpanded ? null : conv.id)}
                            className="w-full p-4 text-left hover:bg-navy-50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-navy-900 truncate">{conv.widget_name}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    conv.status === 'active' ? 'bg-green-100 text-green-700' :
                                    conv.status === 'escalated' ? 'bg-red-100 text-red-700' :
                                    'bg-navy-100 text-navy-600'
                                  }`}>
                                    {conv.status}
                                  </span>
                                </div>
                                <p className="text-sm text-navy-600 truncate">{previewMessage}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-navy-500">
                                  <span className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {conv.metadata?.domain || 'unknown'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {conv.messages.length} messages
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(conv.created_at).toLocaleDateString()}
                                  </span>
                                  {conv.visitor_email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {conv.visitor_email}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-navy-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="border-t border-navy-200 p-4 bg-navy-50">
                              <div className="space-y-3 max-h-80 overflow-y-auto">
                                {conv.messages.map((msg, idx) => (
                                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' || msg.role === 'contact_form' ? 'justify-end' : 'justify-start'}`}>
                                    {(msg.role === 'assistant') && (
                                      <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Brain className="w-4 h-4 text-white" />
                                      </div>
                                    )}
                                    <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                                      msg.role === 'user' || msg.role === 'contact_form'
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-white border border-navy-200 text-navy-700'
                                    }`}>
                                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                      <p className={`text-xs mt-1 ${msg.role === 'user' || msg.role === 'contact_form' ? 'text-teal-200' : 'text-navy-400'}`}>
                                        {new Date(msg.timestamp).toLocaleString()}
                                      </p>
                                    </div>
                                    {(msg.role === 'user' || msg.role === 'contact_form') && (
                                      <div className="w-8 h-8 bg-navy-300 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Users className="w-4 h-4 text-navy-600" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectedMetric !== 'conversations' && detailedAnalytics && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
                    <p className="text-3xl font-bold text-teal-700">{detailedAnalytics.totalEvents.toLocaleString()}</p>
                    <p className="text-sm text-teal-600">Total Events (30d)</p>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
                    <p className="text-3xl font-bold text-teal-700">{detailedAnalytics.uniqueVisitors.toLocaleString()}</p>
                    <p className="text-sm text-teal-600">Unique Visitors</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <p className="text-3xl font-bold text-amber-700">{detailedAnalytics.byDomain.length}</p>
                    <p className="text-sm text-amber-600">Active Domains</p>
                  </div>
                </div>
              </>
            )}

            {selectedMetric !== 'conversations' && detailedAnalytics && (selectedMetric === 'impressions' || selectedMetric === 'messages' || selectedMetric === 'domains') && (
              <div>
                <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-600" />
                  Traffic by Domain
                </h4>
                {detailedAnalytics.byDomain.length === 0 ? (
                  <div className="bg-navy-50 rounded-xl p-8 text-center">
                    <Globe className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                    <p className="text-navy-600">No domain data recorded yet</p>
                    <p className="text-sm text-navy-500">Analytics will appear once widgets receive traffic</p>
                  </div>
                ) : (
                  <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-navy-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Domain</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-navy-600 uppercase">Impressions</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-navy-600 uppercase">Opens</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-navy-600 uppercase">Messages</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-navy-600 uppercase">Emails</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-navy-600 uppercase">Conv. Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-200">
                        {detailedAnalytics.byDomain.slice(0, 10).map((domain, idx) => {
                          const convRate = domain.impressions > 0 ? ((domain.messages / domain.impressions) * 100).toFixed(1) : '0';
                          return (
                            <tr key={domain.domain} className="hover:bg-navy-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                                    idx === 1 ? 'bg-navy-200 text-navy-700' :
                                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                                    'bg-navy-100 text-navy-600'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span className="font-medium text-navy-900">{domain.domain}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="font-semibold text-navy-900">{domain.impressions.toLocaleString()}</span>
                              </td>
                              <td className="px-4 py-3 text-right text-navy-600">{domain.opens.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">
                                <span className="inline-flex items-center gap-1 text-teal-600">
                                  <MessageSquare className="w-3 h-3" />
                                  {domain.messages.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-navy-600">{domain.emails.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  parseFloat(convRate) >= 5 ? 'bg-green-100 text-green-700' :
                                  parseFloat(convRate) >= 1 ? 'bg-amber-100 text-amber-700' :
                                  'bg-navy-100 text-navy-600'
                                }`}>
                                  {convRate}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {detailedAnalytics.byDomain.length > 10 && (
                      <div className="px-4 py-3 bg-navy-50 text-center text-sm text-navy-600">
                        +{detailedAnalytics.byDomain.length - 10} more domains
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedMetric !== 'conversations' && detailedAnalytics && selectedMetric === 'widgets' && (
              <div>
                <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-teal-600" />
                  Traffic by Widget
                </h4>
                {detailedAnalytics.byWidget.length === 0 ? (
                  <div className="bg-navy-50 rounded-xl p-8 text-center">
                    <Code2 className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                    <p className="text-navy-600">No widget data recorded yet</p>
                  </div>
                ) : (
                  <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-navy-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Widget</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-navy-600 uppercase">Impressions</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-navy-600 uppercase">Opens</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-navy-600 uppercase">Messages</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-navy-600 uppercase">Emails</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-200">
                        {detailedAnalytics.byWidget.map((widget, idx) => (
                          <tr key={widget.widget_id} className="hover:bg-navy-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  idx === 0 ? 'bg-amber-100 text-amber-700' :
                                  idx === 1 ? 'bg-navy-200 text-navy-700' :
                                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-navy-100 text-navy-600'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className="font-medium text-navy-900">{widget.widget_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-navy-900">{widget.impressions.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-navy-600">{widget.opens.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-teal-600">{widget.messages.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-navy-600">{widget.emails.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {selectedMetric !== 'conversations' && detailedAnalytics && detailedAnalytics.dailyTrend.length > 0 && (
              <div>
                <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  Daily Trend (Last 30 Days)
                </h4>
                <div className="bg-white border border-navy-200 rounded-xl p-4">
                  <div className="flex items-end gap-1 h-32">
                    {detailedAnalytics.dailyTrend.slice(-14).map((day, idx) => {
                      const maxImpressions = Math.max(...detailedAnalytics.dailyTrend.map(d => d.impressions), 1);
                      const height = (day.impressions / maxImpressions) * 100;
                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col items-center group"
                        >
                          <div
                            className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t hover:from-teal-600 hover:to-teal-500 transition-colors cursor-pointer relative"
                            style={{ height: `${Math.max(height, 4)}%` }}
                            title={`${day.date}: ${day.impressions} impressions, ${day.messages} messages`}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {day.impressions} imp / {day.messages} msg
                            </div>
                          </div>
                          {idx % 2 === 0 && (
                            <span className="text-xs text-navy-500 mt-1 transform -rotate-45 origin-top-left">
                              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-navy-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-teal-500 rounded"></div>
                      <span className="text-sm text-navy-600">Impressions</span>
                    </div>
                    <div className="text-sm text-navy-500">
                      Hover over bars for details
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl w-full max-h-[90vh] overflow-y-auto ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="p-6 border-b border-navy-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-navy-900">{title}</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
