import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Plus, Settings, Trash2, Copy, CheckCircle2, Globe,
  MessageSquare, Eye, MousePointer, BarChart3, AlertCircle,
  X, ChevronDown, ChevronUp, Play, Sparkles, Zap, Users,
  FileText, Mail, Search, ArrowRight, Shield, Brain,
  Handshake
} from 'lucide-react';
import WidgetDemoModal from '../components/WidgetDemoModal';

interface Integration {
  id: string;
  name: string;
  widget_type: string;
  api_key: string;
  config: IntegrationConfig;
  allowed_domains: string[];
  is_active: boolean;
  created_at: string;
}

interface IntegrationConfig {
  appearance: {
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left';
    headerTitle: string;
    showBranding: boolean;
  };
  behavior: {
    autoOpen: boolean;
    autoOpenDelay: number;
    greetingMessage: string;
  };
  features: {
    lawyerSearch: boolean;
    emailCapture: boolean;
    documentUpload: boolean;
    outcomePrediction: boolean;
  };
}

interface IntegrationAnalytics {
  impressions: number;
  opens: number;
  messages: number;
  emailsCollected: number;
}

const DEFAULT_CONFIG: IntegrationConfig = {
  appearance: {
    primaryColor: '#0067FF',
    position: 'bottom-right',
    headerTitle: 'Legal Assistant',
    showBranding: true,
  },
  behavior: {
    autoOpen: false,
    autoOpenDelay: 5000,
    greetingMessage: 'Hello! How can I help you with your legal questions today?',
  },
  features: {
    lawyerSearch: true,
    emailCapture: true,
    documentUpload: false,
    outcomePrediction: false,
  },
};

const WIDGET_TYPES = [
  { id: 'chat', name: 'AI Chat Widget', icon: MessageSquare, description: 'Embed 24/7 legal Q&A', color: '#0067FF' },
  { id: 'document_analyzer', name: 'Document Analyzer', icon: FileText, description: 'AI contract review & risk scoring', color: '#059669' },
  { id: 'outcome_predictor', name: 'Outcome Predictor', icon: BarChart3, description: 'AI case success probability', color: '#D97706' },
  { id: 'lawyer_search', name: 'Attorney Directory', icon: Search, description: 'Lawyer matching & referral', color: '#0D9488' },
  { id: 'negotiation_planner', name: 'Negotiation Planner', icon: Handshake, description: 'AI settlement strategies', color: '#0891B2' },
];

const getWidgetTypeInfo = (type: string) => {
  return WIDGET_TYPES.find(w => w.id === type) || WIDGET_TYPES[0];
};

const FEATURES = [
  {
    id: 'lawyerSearch',
    name: 'Lawyer Matching',
    description: 'Users can request to be matched with an attorney',
    icon: Users,
  },
  {
    id: 'emailCapture',
    name: 'Lead Capture',
    description: 'Collect email addresses for follow-up',
    icon: Mail,
  },
  {
    id: 'documentUpload',
    name: 'Document Analysis',
    description: 'Allow users to upload documents for review',
    icon: FileText,
  },
  {
    id: 'outcomePrediction',
    name: 'Outcome Prediction',
    description: 'AI-powered case outcome analysis by jurisdiction',
    icon: Brain,
  },
];

export default function WebsiteIntegration() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, IntegrationAnalytics>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showCodeForIntegration, setShowCodeForIntegration] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user]);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('embed_widgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);

      if (data && data.length > 0) {
        await loadAnalytics(data.map(w => w.id));
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (integrationIds: string[]) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('widget_analytics')
        .select('widget_id, event_type')
        .in('widget_id', integrationIds)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const analyticsMap: Record<string, IntegrationAnalytics> = {};
      integrationIds.forEach(id => {
        analyticsMap[id] = { impressions: 0, opens: 0, messages: 0, emailsCollected: 0 };
      });

      data?.forEach(event => {
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
            analyticsMap[event.widget_id].emailsCollected++;
            break;
        }
      });

      setAnalytics(analyticsMap);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const createIntegration = async (name: string, config: IntegrationConfig, domains: string[], widgetType: string = 'chat') => {
    try {
      const { data, error } = await supabase
        .from('embed_widgets')
        .insert({
          user_id: user?.id,
          name,
          widget_type: widgetType,
          config,
          allowed_domains: domains,
        })
        .select()
        .single();

      if (error) throw error;
      setIntegrations([data, ...integrations]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating integration:', error);
    }
  };

  const updateIntegration = async (integration: Integration) => {
    try {
      const { error } = await supabase
        .from('embed_widgets')
        .update({
          name: integration.name,
          config: integration.config,
          allowed_domains: integration.allowed_domains,
          is_active: integration.is_active,
        })
        .eq('id', integration.id);

      if (error) throw error;
      setIntegrations(integrations.map(w => w.id === integration.id ? integration : w));
      setEditingIntegration(null);
    } catch (error) {
      console.error('Error updating integration:', error);
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('embed_widgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIntegrations(integrations.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting integration:', error);
    }
  };

  const copyEmbedCode = (integration: Integration) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const embedCode = `<script>
(function() {
  var s = document.createElement('script');
  s.src = '${supabaseUrl}/functions/v1/embed-widget/loader.js?key=${integration.api_key}';
  s.async = true;
  document.head.appendChild(s);
})();
</script>`;

    navigator.clipboard.writeText(embedCode);
    setCopiedId(integration.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm">
                <strong>See it in action!</strong> Watch how ezLegal.ai transforms websites like Step Up to Justice
              </span>
            </div>
            <button
              onClick={() => setShowDemoModal(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Website Widget Integration</h1>
              </div>
              <p className="text-teal-100 max-w-lg">
                Embed AI-powered legal widgets on your website with a single line of code. Choose from chat assistants, intake forms, and more to engage visitors and capture leads.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDemoModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-lg font-semibold transition-all border border-white/30"
              >
                <Play className="w-5 h-5" />
                Live Demo
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-white text-teal-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-50 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create New Widget
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Total Views</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.impressions, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Conversations</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.opens, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Messages</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.messages, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Leads Captured</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.emailsCollected, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {integrations.length === 0 ? (
          <div className="bg-white rounded-xl border border-navy-200 shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-7 h-7 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-3">
                  Add an AI Legal Widget to Your Website
                </h2>
                <p className="text-navy-600 mb-6 leading-relaxed">
                  Embed a chat widget, intake form, or legal guide directly on your website. Visitors get instant
                  legal information while you capture leads and connect users with attorney directories.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">24/7 Legal Guidance</p>
                      <p className="text-sm text-navy-600">AI answers questions instantly, any time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Lead Capture Built-In</p>
                      <p className="text-sm text-navy-600">Automatically collect contact information</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Attorney Matching</p>
                      <p className="text-sm text-navy-600">Connect qualified users with your network</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Your Integration
                </button>
              </div>

              <div className="bg-gradient-to-br from-navy-100 to-navy-50 p-8 lg:p-12 flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border border-navy-200 overflow-hidden">
                    <div className="bg-teal-600 text-white px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Legal Assistant</p>
                        <p className="text-xs text-teal-100">Online now</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-navy-100 rounded-xl p-3 max-w-[85%]">
                        <p className="text-sm text-navy-700">Hello! How can I help you with your legal questions today?</p>
                      </div>
                      <div className="bg-teal-600 text-white rounded-xl p-3 max-w-[85%] ml-auto">
                        <p className="text-sm">I have a question about my lease agreement...</p>
                      </div>
                      <div className="bg-navy-100 rounded-xl p-3 max-w-[85%]">
                        <p className="text-sm text-navy-700">I'd be happy to help with lease questions. What specific concern do you have?</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-200 bg-white">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type your question..."
                          className="flex-1 px-3 py-2 bg-navy-100 rounded-lg text-sm"
                          disabled
                        />
                        <button className="p-2 bg-teal-600 text-white rounded-lg">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-teal-600 rounded-full shadow-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {integrations.map(integration => {
              const integrationAnalytics = analytics[integration.id] || { impressions: 0, opens: 0, messages: 0, emailsCollected: 0 };
              const isExpanded = expandedIntegration === integration.id;

              return (
                <div
                  key={integration.id}
                  className="bg-white rounded-xl border border-navy-200 shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {(() => {
                          const typeInfo = getWidgetTypeInfo(integration.widget_type);
                          const TypeIcon = typeInfo.icon;
                          return (
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${typeInfo.color}20` }}
                            >
                              <TypeIcon
                                className="w-6 h-6"
                                style={{ color: typeInfo.color }}
                              />
                            </div>
                          );
                        })()}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-navy-900">{integration.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              integration.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-navy-100 text-navy-600'
                            }`}>
                              {integration.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-navy-600 mt-1">
                            {getWidgetTypeInfo(integration.widget_type).name}
                          </p>
                          {integration.allowed_domains.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-navy-500">
                              <Globe className="w-3.5 h-3.5" />
                              <span>{integration.allowed_domains.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyEmbedCode(integration)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            copiedId === integration.id
                              ? 'bg-green-100 text-green-700'
                              : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                          }`}
                        >
                          {copiedId === integration.id ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Code
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingIntegration(integration)}
                          className="p-2 text-navy-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteIntegration(integration.id)}
                          className="p-2 text-navy-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setExpandedIntegration(isExpanded ? null : integration.id);
                            if (isExpanded) setShowCodeForIntegration(null);
                          }}
                          className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6">
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs">Views</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.impressions.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <MousePointer className="w-4 h-4" />
                          <span className="text-xs">Conversations</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.opens.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs">Messages</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.messages.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs">Leads</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.emailsCollected.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-navy-200">
                      <button
                        onClick={() => setShowCodeForIntegration(
                          showCodeForIntegration === integration.id ? null : integration.id
                        )}
                        className="w-full px-6 py-3 bg-navy-50 hover:bg-navy-100 transition-colors flex items-center justify-between text-left"
                      >
                        <span className="font-semibold text-navy-900">
                          {showCodeForIntegration === integration.id ? 'Hide' : 'Show'} Installation Code
                        </span>
                        {showCodeForIntegration === integration.id ? (
                          <ChevronUp className="w-5 h-5 text-navy-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-navy-400" />
                        )}
                      </button>
                      {showCodeForIntegration === integration.id && (
                        <div className="p-6 bg-navy-50">
                          <div className="bg-navy-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
{`<script>
(function() {
  var s = document.createElement('script');
  s.src = '${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-widget/loader.js?key=${integration.api_key}';
  s.async = true;
  document.head.appendChild(s);
})();
</script>`}
                            </pre>
                          </div>
                          <p className="text-sm text-navy-600 mt-3">
                            Add this code just before the closing <code className="bg-navy-200 px-1.5 py-0.5 rounded text-navy-800">&lt;/body&gt;</code> tag on your website.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-bold text-navy-900 mb-2">5-Minute Setup</h3>
            <p className="text-sm text-navy-600">
              Copy one line of code to your website. No technical skills required - works with any website builder.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-navy-900 mb-2">Secure & Compliant</h3>
            <p className="text-sm text-navy-600">
              Domain whitelisting prevents unauthorized use. All conversations are encrypted and protected.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-navy-900 mb-2">Real-Time Analytics</h3>
            <p className="text-sm text-navy-600">
              Track conversations, leads captured, and engagement metrics from your dashboard.
            </p>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateIntegrationModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createIntegration}
        />
      )}

      {editingIntegration && (
        <EditIntegrationModal
          integration={editingIntegration}
          onClose={() => setEditingIntegration(null)}
          onSave={updateIntegration}
        />
      )}

      {showDemoModal && (
        <WidgetDemoModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
}

function CreateIntegrationModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, config: IntegrationConfig, domains: string[], widgetType: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [widgetType, setWidgetType] = useState('chat');
  const [config, setConfig] = useState<IntegrationConfig>(DEFAULT_CONFIG);
  const [domainsInput, setDomainsInput] = useState('');

  const handleCreate = () => {
    const domains = domainsInput
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    onCreate(name, config, domains, widgetType);
  };

  const updateFeature = (featureId: string, value: boolean) => {
    setConfig({
      ...config,
      features: {
        ...config.features,
        [featureId]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-navy-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Create New Widget</h2>
            <p className="text-sm text-navy-600">Step {step} of 2</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-3">
                  Widget Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {WIDGET_TYPES.map((wt) => {
                    const WtIcon = wt.icon;
                    return (
                      <button
                        key={wt.id}
                        type="button"
                        onClick={() => setWidgetType(wt.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          widgetType === wt.id
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-navy-200 hover:border-navy-300'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${wt.color}15` }}
                        >
                          <WtIcon className="w-4.5 h-4.5" style={{ color: wt.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-medium text-sm ${widgetType === wt.id ? 'text-teal-700' : 'text-navy-900'}`}>
                            {wt.name}
                          </p>
                          <p className="text-xs text-navy-500 truncate">{wt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Integration Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Main Website, Landing Page"
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
                <p className="text-sm text-navy-500 mt-2">
                  Use a name that helps you identify where this is installed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-3">
                  Features
                </label>
                <div className="space-y-3">
                  {FEATURES.map(feature => (
                    <div
                      key={feature.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        config.features[feature.id as keyof typeof config.features]
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-navy-200 hover:border-navy-300'
                      }`}
                      onClick={() => updateFeature(
                        feature.id,
                        !config.features[feature.id as keyof typeof config.features]
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <feature.icon className={`w-5 h-5 ${
                          config.features[feature.id as keyof typeof config.features]
                            ? 'text-teal-600'
                            : 'text-navy-400'
                        }`} />
                        <div>
                          <p className="font-medium text-navy-900">{feature.name}</p>
                          <p className="text-sm text-navy-500">{feature.description}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        config.features[feature.id as keyof typeof config.features]
                          ? 'border-teal-600 bg-teal-600'
                          : 'border-navy-300'
                      }`}>
                        {config.features[feature.id as keyof typeof config.features] && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Appearance
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.appearance.primaryColor}
                      onChange={(e) => setConfig({
                        ...config,
                        appearance: { ...config.appearance, primaryColor: e.target.value }
                      })}
                      className="w-10 h-10 rounded-lg border border-navy-300 cursor-pointer"
                    />
                    <span className="text-sm text-navy-600">Brand Color</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={config.appearance.headerTitle}
                      onChange={(e) => setConfig({
                        ...config,
                        appearance: { ...config.appearance, headerTitle: e.target.value }
                      })}
                      placeholder="Header Title"
                      className="w-full px-3 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Allowed Domains
                </label>
                <textarea
                  value={domainsInput}
                  onChange={(e) => setDomainsInput(e.target.value)}
                  rows={3}
                  placeholder="example.com, www.example.com"
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none font-mono text-sm"
                />
                <p className="text-sm text-navy-600 mt-2">
                  Enter comma-separated domains where this can be installed. Leave empty to allow all domains.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Security Recommendation</p>
                    <p className="text-sm text-amber-800 mt-1">
                      We strongly recommend restricting to specific domains to prevent unauthorized usage.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Greeting Message
                </label>
                <textarea
                  value={config.behavior.greetingMessage}
                  onChange={(e) => setConfig({
                    ...config,
                    behavior: { ...config.behavior, greetingMessage: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-navy-50 rounded-xl p-6">
                <h4 className="font-semibold text-navy-900 mb-4">Preview</h4>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: config.appearance.primaryColor }}
                  >
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">{name || 'Your Integration'}</p>
                    <p className="text-sm text-navy-600">
                      {config.appearance.headerTitle} - {config.appearance.position}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-navy-50 border-t border-navy-200 px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-navy-700 font-medium hover:bg-navy-200 rounded-lg transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-navy-700 font-medium hover:bg-navy-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!name.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Create Integration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditIntegrationModal({
  integration,
  onClose,
  onSave,
}: {
  integration: Integration;
  onClose: () => void;
  onSave: (integration: Integration) => void;
}) {
  const [editedIntegration, setEditedIntegration] = useState<Integration>({ ...integration });
  const [domainsInput, setDomainsInput] = useState(integration.allowed_domains.join(', '));

  const config = editedIntegration.config as IntegrationConfig;

  const handleSave = () => {
    const domains = domainsInput
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    onSave({
      ...editedIntegration,
      allowed_domains: domains,
    });
  };

  const updateFeature = (featureId: string, value: boolean) => {
    setEditedIntegration({
      ...editedIntegration,
      config: {
        ...config,
        features: {
          ...(config.features || { lawyerSearch: true, emailCapture: true, documentUpload: false }),
          [featureId]: value,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-navy-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy-900">Edit Integration</h2>
          <button
            onClick={onClose}
            className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Integration Name
            </label>
            <input
              type="text"
              value={editedIntegration.name}
              onChange={(e) => setEditedIntegration({ ...editedIntegration, name: e.target.value })}
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
            <div>
              <p className="font-medium text-navy-900">Active</p>
              <p className="text-sm text-navy-600">Enable or disable this integration</p>
            </div>
            <button
              onClick={() => setEditedIntegration({ ...editedIntegration, is_active: !editedIntegration.is_active })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                editedIntegration.is_active ? 'bg-green-500' : 'bg-navy-300'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                editedIntegration.is_active ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-3">
              Features
            </label>
            <div className="space-y-3">
              {FEATURES.map(feature => {
                const features = config.features || { lawyerSearch: true, emailCapture: true, documentUpload: false };
                const isEnabled = features[feature.id as keyof typeof features];
                return (
                  <div
                    key={feature.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isEnabled
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-navy-200 hover:border-navy-300'
                    }`}
                    onClick={() => updateFeature(feature.id, !isEnabled)}
                  >
                    <div className="flex items-center gap-3">
                      <feature.icon className={`w-5 h-5 ${isEnabled ? 'text-teal-600' : 'text-navy-400'}`} />
                      <div>
                        <p className="font-medium text-navy-900">{feature.name}</p>
                        <p className="text-sm text-navy-500">{feature.description}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isEnabled ? 'border-teal-600 bg-teal-600' : 'border-navy-300'
                    }`}>
                      {isEnabled && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.appearance?.primaryColor || '#0067FF'}
                onChange={(e) => setEditedIntegration({
                  ...editedIntegration,
                  config: {
                    ...config,
                    appearance: { ...config.appearance, primaryColor: e.target.value }
                  }
                })}
                className="w-12 h-12 rounded-lg border border-navy-300 cursor-pointer"
              />
              <input
                type="text"
                value={config.appearance?.primaryColor || '#0067FF'}
                onChange={(e) => setEditedIntegration({
                  ...editedIntegration,
                  config: {
                    ...config,
                    appearance: { ...config.appearance, primaryColor: e.target.value }
                  }
                })}
                className="flex-1 px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Header Title
            </label>
            <input
              type="text"
              value={config.appearance?.headerTitle || 'Legal Assistant'}
              onChange={(e) => setEditedIntegration({
                ...editedIntegration,
                config: {
                  ...config,
                  appearance: { ...config.appearance, headerTitle: e.target.value }
                }
              })}
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Greeting Message
            </label>
            <textarea
              value={config.behavior?.greetingMessage || 'Hello! How can I help you with your legal questions today?'}
              onChange={(e) => setEditedIntegration({
                ...editedIntegration,
                config: {
                  ...config,
                  behavior: { ...config.behavior, greetingMessage: e.target.value }
                }
              })}
              rows={3}
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Allowed Domains
            </label>
            <textarea
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
              rows={2}
              placeholder="example.com, www.example.com"
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
            <div>
              <p className="font-medium text-navy-900">Show Branding</p>
              <p className="text-sm text-navy-600">Display "Powered by ezLegal.ai"</p>
            </div>
            <button
              onClick={() => setEditedIntegration({
                ...editedIntegration,
                config: {
                  ...config,
                  appearance: { ...config.appearance, showBranding: !config.appearance?.showBranding }
                }
              })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                config.appearance?.showBranding ? 'bg-teal-600' : 'bg-navy-300'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                config.appearance?.showBranding ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-navy-50 border-t border-navy-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-navy-700 font-medium hover:bg-navy-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
