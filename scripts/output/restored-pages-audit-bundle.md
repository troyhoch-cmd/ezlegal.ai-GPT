# ezLegal.ai -- Restored Pages Audit Bundle

**Generated:** 2026-06-10T00:29:40.994Z

**Purpose:** GPT-5.5 Pro compliance audit of 11 restored pages after content regression fix + compliance pass.

## Audit Checklist

For each page, verify:
1. **Lang narrowing**: `const lang = language === 'es' ? 'es' : 'en'` present (bilingual pages only)
2. **Softened claims**: No "attorney-reviewed", "reviewed by licensed attorneys", unverified time claims
3. **Bilingual parity**: EN and ES copy have equivalent meaning and length
4. **Scope disclaimers**: AI-generated content disclaimers present where applicable
5. **normalizeForCrisis**: Used in chat pages before crisis detection
6. **No UPL violations**: No unauthorized practice of law claims
7. **Security**: No exposed keys, proper auth checks, XSS prevention

---

# Part 1: Restored Pages (11 files)

## src/pages/ChatV2.tsx (580 lines)

```tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Mic, Paperclip, Sparkles, ArrowUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  UnifiedTrustStrip,
  TabbedResponse,
  MoreHelpDrawer,
  CollapsibleSidebar,
  ContextualCrisisAlert,
  detectCrisisSignal,
} from '../components/cognitive-load';
import GuidedChatTour from '../components/GuidedChatTour';
import AIModelSelector from '../components/AIModelSelector';
import JurisdictionSelector from '../components/shared/JurisdictionSelector';
import { supabase } from '../lib/supabase';
import { normalizeForCrisis } from '../lib/text-utils';
import { chatService } from '../services/chat-service';
import type { ChatMessage, ThinkingDetails } from '../services/chat-service';
import {
  trackMetric,
  trackTimeToFirstAction,
  trackFollowUpClick,
} from '../lib/ab-test-config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelUsed?: string;
  thinkingDetails?: ThinkingDetails;
  followUpQuestions?: string[];
  parsed?: {
    summary: string;
    actionSteps: Array<{
      step: number;
      title: string;
      description: string;
      priority?: 'high' | 'medium' | 'low';
      deadline?: string;
    }>;
    sources: Array<{
      title: string;
      url?: string;
      citation?: string;
      confidence?: number;
    }>;
  };
}

function parseResponseToTabs(content: string): Message['parsed'] {
  const lines = content.split('\n');
  const summary: string[] = [];
  const actionSteps: NonNullable<Message['parsed']>['actionSteps'] = [];
  const sources: NonNullable<Message['parsed']>['sources'] = [];

  let currentSection = 'summary';
  let stepCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^#{1,3}\s/.test(trimmed) || /^(\*\*|__).*?(Step|Action|Guidance|What to Do)/i.test(trimmed)) {
      currentSection = 'actions';
      continue;
    }

    if (/^(\*\*|__).*?(Source|Citation|Reference)/i.test(trimmed) || /^---\s*$/.test(trimmed)) {
      currentSection = 'sources';
      continue;
    }

    if (currentSection === 'summary' && trimmed) {
      if (summary.length < 5 || /^(\*\*|__)?(Direct Answer|Summary|Overview)/i.test(trimmed)) {
        summary.push(trimmed.replace(/^\*\*|\*\*$/g, '').replace(/^__$|^__$/g, ''));
      }
    }

    if (currentSection === 'actions' && /^\d+\.|^-|^\*/.test(trimmed)) {
      stepCount++;
      const stepText = trimmed.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '');
      const [title, ...rest] = stepText.split(':');
      actionSteps.push({
        step: stepCount,
        title: title.replace(/^\*\*|\*\*$/g, '').trim(),
        description: rest.join(':').trim() || title,
        priority: stepCount <= 2 ? 'high' : stepCount <= 4 ? 'medium' : 'low',
      });
    }

    if (currentSection === 'sources' && /^\d+\.|^-|^\*/.test(trimmed)) {
      const sourceText = trimmed.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '');
      const urlMatch = sourceText.match(/\[([^\]]+)\]\(([^)]+)\)/);
      sources.push({
        title: urlMatch ? urlMatch[1] : sourceText.split(' - ')[0] || sourceText,
        url: urlMatch ? urlMatch[2] : undefined,
        citation: sourceText,
        confidence: 0.85,
      });
    }
  }

  return {
    summary: summary.slice(0, 3).join(' ').substring(0, 500) || content.substring(0, 300),
    actionSteps: actionSteps.slice(0, 6),
    sources,
  };
}

export default function ChatV2() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const en = lang === 'en';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jurisdiction, setJurisdiction] = useState<string>(() => {
    try {
      return localStorage.getItem('ezlegal-jurisdiction') || 'Arizona';
    } catch {
      return 'Arizona';
    }
  });

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('preferred_jurisdiction')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const pref = (data as { preferred_jurisdiction?: string } | null)?.preferred_jurisdiction;
        if (pref) setJurisdiction(pref);
      });
  }, [user?.id]);

  const handleJurisdictionChange = useCallback(
    (value: string) => {
      if (!value) return;
      setJurisdiction(value);
      try {
        localStorage.setItem('ezlegal-jurisdiction', value);
      } catch {
        // ignore
      }
      if (user?.id) {
        supabase
          .from('profiles')
          .update({ preferred_jurisdiction: value })
          .eq('id', user.id)
          .then(() => undefined);
      }
    },
    [user?.id]
  );
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());
  const [hasTrackedFirstAction, setHasTrackedFirstAction] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(() => {
    try {
      const hasSeenTour = localStorage.getItem('ezlegal-chat-tour-completed');
      return !hasSeenTour;
    } catch {
      return false;
    }
  });
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackMetric('chat_started', 1);
  }, []);

  useEffect(() => {
    chatService.setConfig({
      jurisdiction,
      modelOverride: selectedModel || undefined
    });
    if (user?.id) {
      chatService.setUserId(user.id);
    }
  }, [user, jurisdiction, selectedModel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversationId && user?.id) {
      supabase
        .from('chat_messages')
        .select('id, message, role, created_at')
        .eq('user_id', user.id)
        .eq('session_id', conversationId)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setMessages(data.map(m => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.message,
              timestamp: new Date(m.created_at),
            })));
          }
        });
    }
  }, [conversationId, user?.id]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    if (!hasTrackedFirstAction) {
      trackTimeToFirstAction(sessionStartTime);
      setHasTrackedFirstAction(true);
    }

    trackMetric('first_question_submitted', messages.length === 0 ? 1 : 0);
    trackMetric('messages_sent', 1);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatMessage = await chatService.sendMessage(input.trim());

      const parsed = parseResponseToTabs(response.content);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        modelUsed: response.modelUsed,
        thinkingDetails: response.thinkingDetails,
        followUpQuestions: response.followUpQuestions,
        parsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: en
          ? 'Sorry, there was an error processing your request. Please try again.'
          : 'Lo sentimos, hubo un error al procesar su solicitud. Por favor, intente de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, en, hasTrackedFirstAction, sessionStartTime, messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    chatService.resetSession();
    setMessages([]);
    inputRef.current?.focus();
  };

  const handleFollowUp = (question: string, index: number) => {
    trackFollowUpClick(index);
    setInput(question);
    inputRef.current?.focus();
  };

  const handleTourComplete = () => {
    try {
      localStorage.setItem('ezlegal-chat-tour-completed', 'true');
    } catch { /* ignore */ }
    setShowGuidedTour(false);
  };

  const handleTourSkip = () => {
    try {
      localStorage.setItem('ezlegal-chat-tour-completed', 'true');
    } catch { /* ignore */ }
    setShowGuidedTour(false);
  };

  useEffect(() => {
    if (messages.length > 0 && messages.some(m => m.role === 'assistant')) {
      setShowAdvancedFeatures(true);
    }
  }, [messages]);

  const recentChats = messages.length > 0
    ? [{
        id: chatService.getSessionId(),
        title: messages[0]?.content.substring(0, 30) + '...',
        date: 'Now',
      }]
    : [];

  const hasCrisisSignal = messages.some(
    (m) => m.role === 'user' && detectCrisisSignal(normalizeForCrisis(m.content))
  );

  return (
    <div className="flex h-screen bg-white">
      {showGuidedTour && messages.length === 0 && (
        <GuidedChatTour onComplete={handleTourComplete} onSkip={handleTourSkip} />
      )}

      <CollapsibleSidebar
        onNewChat={handleNewChat}
        recentChats={recentChats}
        currentChatId={chatService.getSessionId()}
        jurisdiction={jurisdiction}
        onChangeJurisdiction={() => {
          document.getElementById('chat-jurisdiction-picker')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          document.getElementById('chat-jurisdiction-picker')?.focus();
        }}
        hasActiveSession={messages.length > 0}
        className="hidden lg:flex"
      />

      <main className="flex-1 flex flex-col min-w-0">
        <UnifiedTrustStrip jurisdiction={jurisdiction} />

        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <JurisdictionSelector
              id="chat-jurisdiction-picker"
              variant="compact"
              value={jurisdiction}
              onChange={handleJurisdictionChange}
              label={en ? 'Jurisdiction' : 'Jurisdiccion'}
              description={
                en
                  ? 'Answers are tailored to the law of the state, territory, or federal circuit you pick.'
                  : 'Las respuestas se adaptan a la ley del estado, territorio o circuito federal que elija.'
              }
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                  {en ? 'How can I help you today?' : 'Como puedo ayudarte hoy?'}
                </h1>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  {en
                    ? `Ask any legal question about ${jurisdiction || 'your state'} law. I provide information, not legal advice.`
                    : `Haga cualquier pregunta legal sobre la ley de ${jurisdiction || 'su estado'}. Proporciono informacion, no asesoramiento legal.`}
                </p>

                <div className="max-w-4xl mx-auto mb-8">
                  <AIModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    variant="compact"
                    label={en ? 'Select AI Model' : 'Seleccionar Modelo de IA'}
                    showDescription={false}
                  />
                </div>

                {(() => {
                  const allSuggestions = [
                    en ? 'Can my landlord raise rent mid-lease in Arizona?' : 'Puede mi arrendador subir la renta a mitad del contrato en Arizona?',
                    en ? 'What happens if I miss my court date?' : 'Que pasa si pierdo mi fecha de corte?',
                    en ? 'How do I get my security deposit back?' : 'Como recupero mi deposito de seguridad?',
                    en ? 'Can I be fired for taking sick leave?' : 'Me pueden despedir por tomar licencia por enfermedad?',
                    en ? 'How do I respond to a contract breach notice?' : 'Como respondo a un aviso de incumplimiento de contrato?',
                    en ? 'What are my options if a customer refuses to pay?' : 'Cuales son mis opciones si un cliente se niega a pagar?',
                  ];
                  const visibleSuggestions = showAllSuggestions ? allSuggestions : allSuggestions.slice(0, 3);

                  return (
                    <div className="max-w-lg mx-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {visibleSuggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setInput(suggestion);
                              inputRef.current?.focus();
                            }}
                            className="text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                      {!showAllSuggestions && (
                        <button
                          onClick={() => setShowAllSuggestions(true)}
                          className="flex items-center justify-center gap-1 w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                          {en ? 'More examples' : 'Mas ejemplos'}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-6">
                {hasCrisisSignal && (
                  <ContextualCrisisAlert
                    messages={messages.map((m) => ({ content: m.content, role: m.role }))}
                    className="mb-4"
                  />
                )}

                {messages.map((message) => (
                  <div key={message.id} className="animate-in fade-in duration-300">
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] bg-teal-600 text-white rounded-2xl rounded-br-md px-4 py-3">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {message.parsed ? (
                          <TabbedResponse
                            summary={message.parsed.summary}
                            actionSteps={message.parsed.actionSteps}
                            sources={message.parsed.sources}
                            fullContent={message.content}
                            jurisdiction={jurisdiction}
                          />
                        ) : (
                          <div className="bg-slate-50 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        )}

                        {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pl-4">
                            {message.followUpQuestions.slice(0, 3).map((q, i) => (
                              <button
                                key={i}
                                onClick={() => handleFollowUp(q, i)}
                                className="text-xs px-3 py-1.5 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 rounded-full text-slate-600 hover:text-teal-700 transition-colors"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}

                        {message.modelUsed && (
                          <p className="text-[10px] text-slate-400 pl-4">
                            {message.modelUsed}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">
                      {en ? 'Researching your question...' : 'Investigando su pregunta...'}
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    en
                      ? 'Ask in plain English, like "Can my landlord raise rent mid-lease in Texas?"'
                      : 'Pregunta en espanol simple, como "Puede mi arrendador subir la renta a mitad del contrato en Texas?"'
                  }
                  rows={1}
                  className="w-full px-4 py-3 pr-24 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  disabled={isLoading}
                />
                {showAdvancedFeatures && (
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      aria-label={en ? 'Attach file' : 'Adjuntar archivo'}
                      title="Attach document"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      aria-label={en ? 'Voice input' : 'Entrada de voz'}
                      title="Voice input"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex items-center justify-center w-12 h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                aria-label={en ? 'Send message' : 'Enviar mensaje'}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] text-slate-400">
                {en
                  ? 'AI provides legal information, not legal advice. Always consult a licensed attorney for specific guidance.'
                  : 'La IA proporciona informacion legal, no asesoramiento legal. Siempre consulte a un abogado licenciado para orientacion especifica.'}
              </p>

              <MoreHelpDrawer
                onExportChat={() => console.log('Export')}
                onShareChat={() => console.log('Share')}
                onPrediction={() => console.log('Prediction')}
                onReportIssue={() => console.log('Report')}
                hasMessages={messages.length > 0}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

```

---

## src/pages/Dashboard.tsx (725 lines)

```tsx
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
                    <p className="text-2xl font-bold text-navy-900">${(stats.chatsThisMonth * 150).toLocaleString()}</p>
                    <p className="text-sm text-navy-600">{t('dash.estimatedValue')}</p>
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

```

---

## src/pages/Checkout.tsx (402 lines)

```tsx
import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Lock, ArrowLeft, ArrowRight, Zap, Shield, CreditCard,
  Building2, Users, FileText, Download, Calendar, AlertTriangle, Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import usePersonaRouting from '../hooks/usePersonaRouting';
import { supabase } from '../lib/supabase';
import { clearPendingPlan, readPendingPlan, setPendingPlan } from '../lib/plan-context';

type CheckoutStep = 'review' | 'payment' | 'confirmation';

const PRODUCT_DETAILS: Record<string, {
  name: { en: string; es: string };
  description: { en: string; es: string };
  includes: { en: string[]; es: string[] };
}> = {
  immigration: {
    name: { en: 'Immigration Help Pack', es: 'Paquete de Inmigracion' },
    description: { en: 'Complete action plan for immigration situations', es: 'Plan de accion completo para situaciones de inmigracion' },
    includes: {
      en: ['5-page action plan', 'Know Your Rights document', 'Emergency contacts', 'Deadline checklist', 'Attorney referral'],
      es: ['Plan de accion de 5 paginas', 'Documento de derechos', 'Contactos de emergencia', 'Lista de fechas', 'Referencia a abogado'],
    },
  },
  housing: {
    name: { en: 'Housing & Eviction Pack', es: 'Paquete de Vivienda' },
    description: { en: 'Eviction defense and tenant rights toolkit', es: 'Kit de defensa contra desalojo y derechos del inquilino' },
    includes: {
      en: ['Eviction response template', 'Tenant rights guide', 'Court prep checklist', 'Evidence guide', 'Attorney referral'],
      es: ['Plantilla de respuesta', 'Guia de derechos', 'Lista del tribunal', 'Guia de evidencia', 'Referencia a abogado'],
    },
  },
  family: {
    name: { en: 'Family Matters Pack', es: 'Paquete Familiar' },
    description: { en: 'Divorce, custody, and family court guidance', es: 'Orientacion sobre divorcio, custodia y tribunal familiar' },
    includes: {
      en: ['Self-representation guide', 'Custody templates', 'Support calculator', 'Court prep', 'Attorney referral'],
      es: ['Guia de autorepresentacion', 'Plantillas de custodia', 'Calculadora', 'Preparacion', 'Referencia a abogado'],
    },
  },
  employment: {
    name: { en: 'Employment & Wages Pack', es: 'Paquete de Empleo' },
    description: { en: 'Wage claims and workplace rights tools', es: 'Herramientas de reclamos salariales y derechos laborales' },
    includes: {
      en: ['Wage claim guide', 'Demand letter templates', 'Evidence guide', 'Filing deadlines', 'Attorney referral'],
      es: ['Guia de reclamo', 'Plantillas de demanda', 'Guia de evidencia', 'Fechas limite', 'Referencia a abogado'],
    },
  },
  debt: {
    name: { en: 'Debt Defense Pack', es: 'Paquete de Deudas' },
    description: { en: 'Debt collection defense and negotiation tools', es: 'Herramientas de defensa contra cobro de deudas' },
    includes: {
      en: ['Validation letters', 'Response guide', 'Statute checker', 'Negotiation scripts', 'Attorney referral'],
      es: ['Cartas de validacion', 'Guia de respuesta', 'Verificador', 'Guiones', 'Referencia a abogado'],
    },
  },
  negotiation: {
    name: { en: 'Negotiation Strategy Planner', es: 'Planificador de Negociacion' },
    description: { en: 'AI-generated negotiation strategy document', es: 'Documento de estrategia generado por IA' },
    includes: {
      en: ['Opening scripts', 'Settlement calculator', 'Counter-offer strategies', 'Red flag detection', 'PDF strategy doc'],
      es: ['Guiones de apertura', 'Calculadora', 'Contraofertas', 'Deteccion de riesgos', 'Documento PDF'],
    },
  },
  predictor: {
    name: { en: 'AI Case Predictor', es: 'Predictor de Casos IA' },
    description: { en: 'Data-informed probability range for your case', es: 'Rango de probabilidad basado en datos para tu caso' },
    includes: {
      en: ['Probability range', 'Key factor analysis', 'Similar case comparisons', 'Recommended next steps'],
      es: ['Rango de probabilidad', 'Analisis de factores', 'Comparaciones de casos', 'Proximos pasos'],
    },
  },
};

const PRICES: Record<string, number> = {
  immigration: 39, housing: 29, family: 39, employment: 29, debt: 29, negotiation: 49, predictor: 4.99,
};

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isBusiness, isOrganization } = usePersonaRouting();
  const lang = language === 'es' ? 'es' : 'en';

  const queryPlan = searchParams.get('plan');
  const pending = readPendingPlan();
  const plan = queryPlan || pending?.planId || 'housing';
  const product = PRODUCT_DETAILS[plan] || PRODUCT_DETAILS['housing'];
  const price = PRICES[plan] || 29;

  const [step, setStep] = useState<CheckoutStep>('review');
  const [email, setEmail] = useState(user?.email || '');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [waitlistMsg, setWaitlistMsg] = useState('');

  if (!user) {
    setPendingPlan(plan, 'checkout-gate');
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">
            {lang === 'en' ? 'Sign in to continue' : 'Inicia sesion para continuar'}
          </h1>
          <p className="text-navy-600 mb-6">
            {lang === 'en' ? 'Create a free account to complete your purchase and access your materials.' : 'Crea una cuenta gratis para completar tu compra y acceder a tus materiales.'}
          </p>
          <Link
            to={`/login?redirect=${encodeURIComponent(`/checkout?plan=${plan}`)}`}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            {lang === 'en' ? 'Sign In to Continue' : 'Iniciar Sesion'}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitPayment = async () => {
    setProcessing(true);
    setErrorMsg('');
    setWaitlistMsg('');
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) {
        setErrorMsg(lang === 'en' ? 'Your session expired. Please sign in again.' : 'Sesion expirada. Inicia sesion de nuevo.');
        setProcessing(false);
        return;
      }
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout-session`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan,
          successUrl: `${window.location.origin}/dashboard/billing?status=success`,
          cancelUrl: `${window.location.origin}/checkout?plan=${plan}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error ?? (lang === 'en' ? 'Could not start checkout.' : 'No se pudo iniciar el pago.'));
        setProcessing(false);
        return;
      }
      if (data.mode === 'stripe' && data.url) {
        clearPendingPlan();
        window.location.href = data.url;
        return;
      }
      clearPendingPlan();
      setWaitlistMsg(
        lang === 'en'
          ? 'Stripe is being finalized. Your interest is queued and we will email you within one business day.'
          : 'Stripe esta en configuracion. Guardamos tu interes y te contactaremos en un dia habil.',
      );
      setStep('confirmation');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <header className="bg-white border-b border-navy-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <img src="/red-and-grey-minamali-business-card-2-1-2.svg" alt="ezLegal.ai" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-navy-600">
              <Lock className="w-4 h-4 text-green-600" />
              <span>{lang === 'en' ? 'Secure Checkout' : 'Pago Seguro'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="sr-only">{lang === 'en' ? 'Secure Checkout' : 'Pago Seguro'}</h1>
        <button
          onClick={() => step === 'review' ? navigate(-1) : setStep('review')}
          className="flex items-center gap-2 text-navy-600 hover:text-navy-900 mb-6 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'review'
            ? (lang === 'en' ? 'Back' : 'Volver')
            : (lang === 'en' ? 'Back to review' : 'Volver a revision')}
        </button>

        <div className="flex items-center gap-2 mb-8">
          {(['review', 'payment', 'confirmation'] as CheckoutStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-teal-600 text-white' :
                (['review', 'payment', 'confirmation'].indexOf(step) > i) ? 'bg-teal-100 text-teal-700' :
                'bg-navy-200 text-navy-500'
              }`}>
                {(['review', 'payment', 'confirmation'].indexOf(step) > i) ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === s ? 'text-navy-900' : 'text-navy-500'} hidden sm:block`}>
                {s === 'review' ? (lang === 'en' ? 'Review' : 'Revision') :
                 s === 'payment' ? (lang === 'en' ? 'Payment' : 'Pago') :
                 (lang === 'en' ? 'Confirmation' : 'Confirmacion')}
              </span>
              {i < 2 && <div className="w-8 sm:w-16 h-px bg-navy-200" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'review' && product && (
              <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-navy-900 mb-4">
                  {lang === 'en' ? 'Order Review' : 'Revision del Pedido'}
                </h2>
                <div className="bg-navy-50 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-navy-900 mb-1">{product.name[lang]}</h3>
                  <p className="text-sm text-navy-600 mb-3">{product.description[lang]}</p>
                  <ul className="space-y-1">
                    {product.includes[lang].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {isOrganization && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <Users className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      {lang === 'en' ? 'Organization plans include multi-seat licensing and grant-eligible invoicing.' : 'Planes de organizacion incluyen licencias multi-usuario.'}
                    </p>
                  </div>
                )}

                {isBusiness && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      {lang === 'en' ? 'Business plans include priority support and team sharing.' : 'Planes de negocios incluyen soporte prioritario.'}
                    </p>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">{lang === 'en' ? '7-day satisfaction guarantee' : 'Garantia de 7 dias'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  disabled
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {lang === 'en' ? 'Continue to Payment' : 'Continuar al Pago'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sm:p-8">
                <div className="text-center mb-6">
                  <CreditCard className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-navy-900">{lang === 'en' ? 'Payment' : 'Pago'}</h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">{lang === 'en' ? 'Email for receipt' : 'Email para recibo'}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-navy-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{errorMsg}</p>
                  </div>
                )}
                {waitlistMsg && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-2">
                    <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{waitlistMsg}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmitPayment}
                  disabled={processing}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> {lang === 'en' ? 'Processing...' : 'Procesando...'}</>
                  ) : (
                    <><Lock className="w-4 h-4" /> {lang === 'en' ? `Pay $${price}` : `Pagar $${price}`}</>
                  )}
                </button>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 mb-2">
                    {lang === 'en' ? 'Purchase Complete!' : 'Compra Completada!'}
                  </h2>
                  <p className="text-navy-600">
                    {lang === 'en' ? 'Your materials are ready in your dashboard.' : 'Tus materiales estan listos en tu panel.'}
                  </p>
                </div>

                <div className="bg-navy-50 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-navy-900 mb-3">
                    {lang === 'en' ? 'What happens next' : 'Que sigue'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: Download, text: lang === 'en' ? 'Download your action plan and templates now' : 'Descarga tu plan de accion y plantillas ahora' },
                      { icon: FileText, text: lang === 'en' ? 'Fill in templates with your specific details' : 'Completa las plantillas con tus datos' },
                      { icon: Calendar, text: lang === 'en' ? 'Review your deadline checklist and key dates' : 'Revisa tu lista de fechas limite' },
                      { icon: Mail, text: lang === 'en' ? 'Receipt sent to ' + email : 'Recibo enviado a ' + email },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-sm text-navy-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/dashboard"
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {lang === 'en' ? 'Go to Dashboard' : 'Ir al Panel'}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4">{lang === 'en' ? 'Order Summary' : 'Resumen del Pedido'}</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">{product?.name[lang] || plan}</p>
                    <p className="text-xs text-navy-500">{lang === 'en' ? 'One-time purchase' : 'Compra unica'}</p>
                  </div>
                  <p className="font-bold text-navy-900">${price}</p>
                </div>
              </div>
              <div className="border-t border-navy-200 pt-3 mb-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-navy-900">Total</span>
                  <span className="text-teal-600">${price}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-navy-500">
                <div className="flex items-center gap-2"><Lock className="w-3 h-3 text-green-600" /> TLS 1.3 + AES-256</div>
                <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-green-600" /> {lang === 'en' ? '7-day refund guarantee' : 'Garantia de 7 dias'}</div>
                <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-green-600" /> {lang === 'en' ? 'Instant access' : 'Acceso instantaneo'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## src/pages/Profile.tsx (948 lines)

```tsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Briefcase, Building2, FileText, Bell, Lock, Save, Camera, Download, Trash2, Shield, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  bio: string;
  avatar_url: string;
  notification_email: boolean;
  notification_sms: boolean;
}

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security' | 'data'>('profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    bio: '',
    avatar_url: '',
    notification_email: true,
    notification_sms: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [dataExporting, setDataExporting] = useState(false);
  const [dataDeleting, setDataDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportRequests, setExportRequests] = useState<Array<{
    id: string;
    status: string;
    requested_at: string;
    completed_at: string | null;
  }>>([]);
  const [deletionRequests, setDeletionRequests] = useState<Array<{
    id: string;
    status: string;
    request_type: string;
    scheduled_for: string | null;
    created_at: string;
  }>>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'data') {
      loadDataRequests();
    }
  }, [user, activeTab]);

  const loadDataRequests = async () => {
    if (!user) return;

    const [exportRes, deletionRes] = await Promise.all([
      supabase
        .from('data_export_requests')
        .select('id, status, requested_at, completed_at')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false })
        .limit(5),
      supabase
        .from('data_deletion_requests')
        .select('id, status, request_type, scheduled_for, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (exportRes.data) setExportRequests(exportRes.data);
    if (deletionRes.data) setDeletionRequests(deletionRes.data);
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          company: data.company || '',
          job_title: data.job_title || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          notification_email: data.notification_email ?? true,
          notification_sms: data.notification_sms ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const trimmedEmail = profileData.email.trim().toLowerCase();
      const emailChanged = !!user?.email && trimmedEmail && trimmedEmail !== user.email.toLowerCase();
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

      if (emailChanged && !emailValid) {
        setMessage({ type: 'error', text: 'Please enter a valid email address.' });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          company: profileData.company,
          job_title: profileData.job_title,
          bio: profileData.bio,
          notification_email: profileData.notification_email,
          notification_sms: profileData.notification_sms,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      if (emailChanged) {
        const { error: emailErr } = await supabase.auth.updateUser({ email: trimmedEmail });
        if (emailErr) throw emailErr;
        setMessage({
          type: 'success',
          text: 'Profile saved. Check your new inbox to confirm the email change.',
        });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      }

      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      const text = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv' = 'json') => {
    if (!user) return;
    setDataExporting(true);
    setMessage(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-export`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            format,
            includeChatHistory: true,
            includeDocuments: true,
            includeProfile: true,
            includeActivityLogs: false,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ezlegal_data_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'Your data has been exported successfully' });
      loadDataRequests();
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to export data' });
    } finally {
      setDataExporting(false);
    }
  };

  const handleRequestDeletion = async (immediate: boolean = false) => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    setDataDeleting(true);
    setMessage(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-deletion`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: 'chat_only',
            reason: 'User requested deletion',
            legalBasis: 'user_request',
            immediate,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Deletion request failed');
      }

      if (result.blockedByLegalHold) {
        setMessage({ type: 'error', text: result.message });
      } else if (result.status === 'scheduled') {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'success', text: 'Your data has been deleted successfully' });
      }

      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      loadDataRequests();
    } catch (error) {
      console.error('Deletion error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to request deletion' });
    } finally {
      setDataDeleting(false);
    }
  };

  const handleCancelDeletion = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('data_deletion_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Deletion request cancelled' });
      loadDataRequests();
    } catch (error) {
      console.error('Cancel error:', error);
      setMessage({ type: 'error', text: 'Failed to cancel deletion request' });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2097152) {
      setMessage({ type: 'error', text: 'File size must be less than 2MB' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPEG, PNG, WebP, and GIF images are allowed' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const updatedProfileData = { ...profileData, avatar_url: publicUrl };
      setProfileData(updatedProfileData);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
        });

      if (updateError) throw updateError;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile photo updated successfully' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to upload photo' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900">{t('profile.title')}</h1>
          <p className="mt-2 text-navy-600">{t('profile.subtitle')}</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-navy-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <User className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabProfile')}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <Bell className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabPreferences')}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <Lock className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabSecurity')}
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'data'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <Shield className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabData')}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-navy-200">
                  <div className="relative">
                    {profileData.avatar_url ? (
                      <img
                        src={profileData.avatar_url}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-navy-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-3xl font-semibold">
                        {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-navy-200 hover:bg-navy-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Upload photo"
                    >
                      <Camera className="w-4 h-4 text-navy-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-900">{t('profile.photoTitle')}</h3>
                    <p className="text-sm text-navy-600 mt-1">
                      {uploading ? t('profile.photoUploading') : t('profile.photoDesc')}
                    </p>
                    <p className="text-xs text-navy-500 mt-1">{t('profile.photoFormats')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <User className="w-4 h-4 inline-block mr-1" />
                      {t('profile.fullName')}
                    </label>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Mail className="w-4 h-4 inline-block mr-1" />
                      {t('profile.emailAddress')}
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="email"
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-navy-900"
                    />
                    <p className="mt-1 text-xs text-navy-500">
                      Changing your email sends a confirmation link to the new address. The change
                      takes effect after you confirm it.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Phone className="w-4 h-4 inline-block mr-1" />
                      {t('profile.phoneNumber')}
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Briefcase className="w-4 h-4 inline-block mr-1" />
                      {t('profile.jobTitle')}
                    </label>
                    <input
                      type="text"
                      value={profileData.job_title}
                      onChange={(e) => setProfileData({ ...profileData, job_title: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Senior Attorney"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Building2 className="w-4 h-4 inline-block mr-1" />
                      {t('profile.company')}
                    </label>
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="ABC Organization"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <FileText className="w-4 h-4 inline-block mr-1" />
                      {t('profile.bio')}
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      placeholder={t('profile.bioPlaceholder')}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-navy-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? t('profile.saving') : t('profile.saveChanges')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('profile.notifTitle')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
                      <div>
                        <div className="font-medium text-navy-900">{t('profile.emailNotif')}</div>
                        <div className="text-sm text-navy-600 mt-1">
                          {t('profile.emailNotifDesc')}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.notification_email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, notification_email: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-navy-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-navy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
                      <div>
                        <div className="font-medium text-navy-900">{t('profile.smsNotif')}</div>
                        <div className="text-sm text-navy-600 mt-1">
                          {t('profile.smsNotifDesc')}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.notification_sms}
                          onChange={(e) =>
                            setProfileData({ ...profileData, notification_sms: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-navy-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-navy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-navy-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? t('profile.saving') : t('profile.savePreferences')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('profile.changePassword')}</h3>
                  <p className="text-sm text-navy-600 mb-6">
                    {t('profile.changePasswordDesc')}
                  </p>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {t('profile.newPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {t('profile.confirmPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleChangePassword}
                        disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        {saving ? t('profile.updating') : t('profile.updatePassword')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-navy-200">
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{t('profile.accountInfo')}</h3>
                  <div className="space-y-2 text-sm text-navy-600">
                    <p>
                      <span className="font-medium text-navy-700">{t('profile.accountId')}</span> {user?.id}
                    </p>
                    <p>
                      <span className="font-medium text-navy-700">{t('profile.emailLabel')}</span> {user?.email}
                    </p>
                    <p>
                      <span className="font-medium text-navy-700">{t('profile.accountCreated')}</span>{' '}
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-8">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-2">{t('profile.dataRights')}</h3>
                      <p className="text-sm text-navy-600">
                        {t('profile.dataRightsDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('profile.exportTitle')}</h3>
                  <p className="text-sm text-navy-600 mb-4">
                    {t('profile.exportDesc')}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleExportData('json')}
                      disabled={dataExporting}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {dataExporting ? t('profile.exportingData') : t('profile.exportJSON')}
                    </button>
                    <button
                      onClick={() => handleExportData('csv')}
                      disabled={dataExporting}
                      className="px-4 py-2 bg-white text-navy-700 border border-navy-300 rounded-lg font-medium hover:bg-navy-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {dataExporting ? t('profile.exportingData') : t('profile.exportCSV')}
                    </button>
                  </div>

                  {exportRequests.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-navy-700 mb-2">{t('profile.recentExports')}</h4>
                      <div className="space-y-2">
                        {exportRequests.map((req) => (
                          <div key={req.id} className="flex items-center gap-3 text-sm text-navy-600 bg-navy-50 p-3 rounded-lg">
                            {req.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : req.status === 'failed' ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                            <span className="capitalize">{req.status}</span>
                            <span className="text-navy-400">-</span>
                            <span>{new Date(req.requested_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-navy-200">
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{t('profile.dataRetention')}</h3>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-navy-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-navy-500" />
                        <span className="font-medium text-navy-700">{t('profile.chatHistory')}</span>
                      </div>
                      <p className="text-sm text-navy-600">{t('profile.chatRetention')}</p>
                    </div>
                    <div className="bg-navy-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-navy-500" />
                        <span className="font-medium text-navy-700">{t('profile.documentsLabel')}</span>
                      </div>
                      <p className="text-sm text-navy-600">{t('profile.docRetention')}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-navy-200">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">{t('profile.deleteTitle')}</h3>
                  <p className="text-sm text-navy-600 mb-4">
                    {t('profile.deleteDesc')}
                  </p>

                  {deletionRequests.some(r => ['pending', 'verified', 'scheduled'].includes(r.status)) ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">{t('profile.deletionPending')}</p>
                          {deletionRequests.filter(r => ['pending', 'verified', 'scheduled'].includes(r.status)).map((req) => (
                            <div key={req.id} className="mt-2 text-sm text-amber-700">
                              <p>
                                Status: <span className="capitalize font-medium">{req.status}</span>
                                {req.scheduled_for && (
                                  <> - Scheduled for {new Date(req.scheduled_for).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</>
                                )}
                              </p>
                              <button
                                onClick={() => handleCancelDeletion(req.id)}
                                className="mt-2 text-amber-800 underline hover:no-underline"
                              >
                                {t('profile.cancelRequest')}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : !showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('profile.requestDeletion')}
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800">{t('profile.confirmDeletion')}</p>
                          <p className="text-sm text-red-700 mt-1">
                            {t('profile.confirmDeletionDesc')}
                          </p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder='Type "DELETE" to confirm'
                        className="w-full max-w-xs px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                      />
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleRequestDeletion(false)}
                          disabled={dataDeleting || deleteConfirmText !== 'DELETE'}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          {dataDeleting ? t('profile.processing') : t('profile.scheduleDeletion')}
                        </button>
                        <button
                          onClick={() => handleRequestDeletion(true)}
                          disabled={dataDeleting || deleteConfirmText !== 'DELETE'}
                          className="px-4 py-2 bg-red-800 text-white rounded-lg font-medium hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {dataDeleting ? t('profile.processing') : t('profile.deleteImmediately')}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          className="px-4 py-2 bg-white text-navy-700 border border-navy-300 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                        >
                          {t('profile.cancel')}
                        </button>
                      </div>
                    </div>
                  )}

                  {deletionRequests.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-navy-700 mb-2">{t('profile.deletionHistory')}</h4>
                      <div className="space-y-2">
                        {deletionRequests.map((req) => (
                          <div key={req.id} className="flex items-center gap-3 text-sm text-navy-600 bg-navy-50 p-3 rounded-lg">
                            {req.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : req.status === 'blocked' ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : req.status === 'cancelled' ? (
                              <XCircle className="w-4 h-4 text-navy-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                            <span className="capitalize">{req.status}</span>
                            <span className="text-navy-400">-</span>
                            <span className="capitalize">{req.request_type.replace('_', ' ')}</span>
                            <span className="text-navy-400">-</span>
                            <span>{new Date(req.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## src/pages/Negotiate.tsx (459 lines)

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
  const lang = language === 'es' ? 'es' : 'en';
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
                    : 'Esta herramienta proporciona informacion legal, no asesoramiento legal. No crea una relacion abogado-cliente. Para orientacion especifica sobre su situacion, '
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
                : 'Ajustadores de seguros, cobradores de deudas, caseros y empleadores todos usan tacticas de negociacion probadas. Ahora tu tambien puedes.'
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
                : 'Nuestro marco de negociacion se adapta a tu situacion especifica'
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
                      : "Cuando un cobrador de deudas llama, tienen guiones. Cuando un ajustador de seguros hace una oferta, tienen pautas. Cuando un casero rechaza tu deposito, apuestan a que no conoces tus derechos."
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

## src/pages/Research.tsx (777 lines)

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  Search, BookOpen, Clock, Tag, MapPin, Scale, FileText,
  Building2, Landmark, Loader2, ChevronDown, ChevronUp,
  ExternalLink, Sparkles, Filter, History, Bookmark
} from 'lucide-react';
import { JURISDICTION_GROUPS, getJurisdictionName } from '../data/jurisdictions';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface ResearchQuery {
  id: string;
  query: string;
  results: string;
  category: string | null;
  created_at: string;
  jurisdiction?: string | null;
  source_types?: string[] | null;
}

interface ResearchResult {
  type: 'case_law' | 'statute' | 'regulation' | 'precedent' | 'secondary';
  title: string;
  citation: string;
  jurisdiction: string;
  date?: string;
  summary: string;
  relevance: 'high' | 'medium' | 'low';
  keyPoints?: string[];
}

interface ParsedResults {
  summary: string;
  results: ResearchResult[];
  practicalGuidance: string;
  disclaimer: string;
}

const categories = [
  'Contract Law',
  'Criminal Law',
  'Family Law',
  'Corporate Law',
  'Intellectual Property',
  'Employment Law',
  'Real Estate Law',
  'Tax Law',
  'Immigration Law',
  'Personal Injury',
  'Bankruptcy',
  'Civil Rights',
  'Environmental Law',
  'Healthcare Law',
  'Securities Law',
];

const sourceTypes = [
  { id: 'case_law', label: 'Case Law', icon: Scale, description: 'Court decisions and judicial opinions' },
  { id: 'statutes', label: 'Statutes', icon: FileText, description: 'Federal and state legislation' },
  { id: 'regulations', label: 'Regulations', icon: Building2, description: 'Administrative rules and agency guidance' },
  { id: 'precedents', label: 'Legal Precedents', icon: Landmark, description: 'Binding and persuasive authority' },
];

export default function Research() {
  const [queries, setQueries] = useState<ResearchQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('FED');
  const [selectedSources, setSelectedSources] = useState<string[]>(['case_law', 'statutes', 'regulations', 'precedents']);
  const [searchResults, setSearchResults] = useState('');
  const [parsedResults, setParsedResults] = useState<ParsedResults | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('research_queries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setQueries(data);
    }
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const toggleResultExpanded = (index: number) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const parseAIResults = (rawResults: string): ParsedResults => {
    const sections = {
      summary: '',
      results: [] as ResearchResult[],
      practicalGuidance: '',
      disclaimer: ''
    };

    const summaryMatch = rawResults.match(/RESEARCH SUMMARY[:\s]*([\s\S]*?)(?=RELEVANT\s+(?:AUTHORITIES|CASE\s+LAW)|APPLICABLE\s+STATUTES|ADMINISTRATIVE\s+REGULATIONS|KEY\s+LEGAL\s+PRECEDENTS|CASE[:\s]|STATUTE[:\s]|REGULATION[:\s]|PRACTICAL\s+GUIDANCE|DISCLAIMER|$)/i);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }

    const caseMatches = rawResults.matchAll(/(?:CASE|DECISION):\s*([^\n]+)\n(?:CITATION:\s*([^\n]+)\n)?(?:COURT|JURISDICTION):\s*([^\n]+)\n(?:DATE:\s*([^\n]+)\n)?(?:SUMMARY|HOLDING):\s*([\s\S]*?)(?=(?:CASE|DECISION|STATUTE|REGULATION|PRACTICAL|DISCLAIMER|$))/gi);
    for (const match of caseMatches) {
      sections.results.push({
        type: 'case_law',
        title: match[1]?.trim() || '',
        citation: match[2]?.trim() || '',
        jurisdiction: match[3]?.trim() || '',
        date: match[4]?.trim(),
        summary: match[5]?.trim() || '',
        relevance: 'high'
      });
    }

    const statuteMatches = rawResults.matchAll(/STATUTE:\s*([^\n]+)\n(?:CITATION:\s*([^\n]+)\n)?(?:JURISDICTION:\s*([^\n]+)\n)?(?:SUMMARY|PROVISION):\s*([\s\S]*?)(?=(?:CASE|STATUTE|REGULATION|PRACTICAL|DISCLAIMER|$))/gi);
    for (const match of statuteMatches) {
      sections.results.push({
        type: 'statute',
        title: match[1]?.trim() || '',
        citation: match[2]?.trim() || '',
        jurisdiction: match[3]?.trim() || '',
        summary: match[4]?.trim() || '',
        relevance: 'high'
      });
    }

    const regulationMatches = rawResults.matchAll(/REGULATION:\s*([^\n]+)\n(?:CITATION:\s*([^\n]+)\n)?(?:AGENCY:\s*([^\n]+)\n)?(?:SUMMARY|PROVISION):\s*([\s\S]*?)(?=(?:CASE|STATUTE|REGULATION|PRACTICAL|DISCLAIMER|$))/gi);
    for (const match of regulationMatches) {
      sections.results.push({
        type: 'regulation',
        title: match[1]?.trim() || '',
        citation: match[2]?.trim() || '',
        jurisdiction: match[3]?.trim() || '',
        summary: match[4]?.trim() || '',
        relevance: 'medium'
      });
    }

    const guidanceMatch = rawResults.match(/PRACTICAL GUIDANCE[:\s]*([\s\S]*?)(?=DISCLAIMER|$)/i);
    if (guidanceMatch) {
      sections.practicalGuidance = guidanceMatch[1].trim();
    }

    const disclaimerMatch = rawResults.match(/DISCLAIMER[:\s]*([\s\S]*?)$/i);
    if (disclaimerMatch) {
      sections.disclaimer = disclaimerMatch[1].trim();
    }

    if (sections.results.length === 0 && !sections.summary) {
      sections.summary = rawResults;
    }

    return sections;
  };

  const performResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || selectedSources.length === 0) return;

    setLoading(true);
    setParsedResults(null);
    setSearchResults('');

    try {
      const jurisdictionName = getJurisdictionName(selectedJurisdiction) || selectedJurisdiction;
      const sourceLabels = selectedSources.map(s => sourceTypes.find(st => st.id === s)?.label || s).join(', ');

      const prompt = `You are a legal research assistant. Conduct comprehensive legal research on the following query.

RESEARCH QUERY: ${searchQuery}

JURISDICTION: ${jurisdictionName}
${selectedCategory ? `PRACTICE AREA: ${selectedCategory}` : ''}
SOURCES TO SEARCH: ${sourceLabels}

Please provide a thorough legal research response in the following structured format:

RESEARCH SUMMARY:
Provide a 2-3 paragraph overview of the legal landscape for this query, including the current state of the law and any recent developments.

${selectedSources.includes('case_law') ? `
RELEVANT CASE LAW:
For each relevant case, provide:
CASE: [Full case name]
CITATION: [Official citation]
COURT: [Court name and jurisdiction]
DATE: [Decision date]
SUMMARY: [2-3 sentence summary of holding and relevance]
` : ''}

${selectedSources.includes('statutes') ? `
APPLICABLE STATUTES:
For each relevant statute, provide:
STATUTE: [Statute name/title]
CITATION: [Citation, e.g., 42 U.S.C. § 1983]
JURISDICTION: [Federal/State]
SUMMARY: [Key provisions and how they apply]
` : ''}

${selectedSources.includes('regulations') ? `
ADMINISTRATIVE REGULATIONS:
For each relevant regulation, provide:
REGULATION: [Regulation name/title]
CITATION: [CFR or state regulatory citation]
AGENCY: [Issuing agency]
SUMMARY: [Key requirements and applicability]
` : ''}

${selectedSources.includes('precedents') ? `
KEY LEGAL PRECEDENTS:
Identify binding and persuasive precedents that would apply to this matter in ${jurisdictionName}.
` : ''}

PRACTICAL GUIDANCE:
Based on this research, provide practical guidance for someone dealing with this legal issue, including:
- Key considerations
- Potential legal strategies
- Important deadlines or limitations
- Recommended next steps

DISCLAIMER:
This research is for informational purposes only and does not constitute legal advice. Laws and regulations change frequently. Consult with a licensed attorney in your jurisdiction for advice specific to your situation.`;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          sessionId: crypto.randomUUID(),
          jurisdiction: jurisdictionName,
          maxTokens: 4000,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform research');
      }

      const data = await response.json();
      let results = data.response || '';

      const followUpStart = results.indexOf('---FOLLOW_UP_QUESTIONS---');
      if (followUpStart !== -1) {
        results = results.substring(0, followUpStart).trim();
      }

      setSearchResults(results);
      setParsedResults(parseAIResults(results));

      if (user) {
        const { data: insertedData, error } = await supabase
          .from('research_queries')
          .insert({
            user_id: user.id,
            query: searchQuery,
            results: results,
            category: selectedCategory || null,
          })
          .select()
          .single();

        if (!error && insertedData) {
          setQueries([insertedData, ...queries]);
        }
      }
    } catch (error) {
      console.error('Research error:', error);
      setSearchResults('An error occurred while performing the research. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (type: ResearchResult['type']) => {
    switch (type) {
      case 'case_law': return Scale;
      case 'statute': return FileText;
      case 'regulation': return Building2;
      case 'precedent': return Landmark;
      default: return BookOpen;
    }
  };

  const getSourceColor = (type: ResearchResult['type']) => {
    switch (type) {
      case 'case_law': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'statute': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'regulation': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'precedent': return 'bg-navy-100 text-navy-700 border-navy-300';
      default: return 'bg-navy-50 text-navy-700 border-navy-200';
    }
  };

  const getRelevanceBadge = (relevance: ResearchResult['relevance']) => {
    switch (relevance) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-navy-100 text-navy-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {!user && (
        <div className="bg-gradient-to-r from-teal-50 to-teal-50 border-2 border-teal-200 rounded-xl px-6 py-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-navy-900">{t('research.title')}</p>
                <p className="text-sm text-navy-600">{t('research.signupPrompt')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/signup"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all font-semibold shadow-md text-sm"
              >
                {t('research.createAccount')}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-navy-900">{t('research.heading')}</h1>
            <p className="text-navy-600">{t('research.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
            activeTab === 'search'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50'
          }`}
        >
          <Search className="w-4 h-4" />
          {t('research.newResearch')}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50'
          }`}
        >
          <History className="w-4 h-4" />
          {t('research.researchHistory')}
          {queries.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === 'history' ? 'bg-teal-500 text-white' : 'bg-navy-100'
            }`}>
              {queries.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'search' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 mb-8">
            <form onSubmit={performResearch} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  {t('research.queryLabel')}
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('research.queryPlaceholder')}
                    className="w-full pl-12 pr-4 py-4 border border-navy-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t('research.jurisdiction')}
                  </label>
                  <select
                    value={selectedJurisdiction}
                    onChange={(e) => setSelectedJurisdiction(e.target.value)}
                    className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
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

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    {t('research.practiceArea')}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">{t('research.allPracticeAreas')}</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  {t('research.sourceFilters')}
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showFilters && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {sourceTypes.map((source) => {
                      const Icon = source.icon;
                      const isSelected = selectedSources.includes(source.id);
                      const sourceLabels: Record<string, string> = {
                        case_law: t('research.caseLaw'),
                        statutes: t('research.statutes'),
                        regulations: t('research.regulations'),
                        precedents: t('research.legalPrecedents'),
                      };
                      const sourceDescs: Record<string, string> = {
                        case_law: t('research.caseLawDesc'),
                        statutes: t('research.statutesDesc'),
                        regulations: t('research.regulationsDesc'),
                        precedents: t('research.legalPrecedentsDesc'),
                      };
                      return (
                        <button
                          key={source.id}
                          type="button"
                          onClick={() => toggleSource(source.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-navy-200 bg-white hover:border-navy-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-teal-500 text-white' : 'bg-navy-100 text-navy-500'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`font-medium ${isSelected ? 'text-teal-700' : 'text-navy-700'}`}>
                              {sourceLabels[source.id] || source.label}
                            </span>
                          </div>
                          <p className="text-xs text-navy-500">{sourceDescs[source.id] || source.description}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !searchQuery.trim() || selectedSources.length === 0}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg shadow-teal-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {t('research.researching')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    {t('research.conductResearch')}
                  </>
                )}
              </button>

              {selectedSources.length === 0 && (
                <p className="text-sm text-amber-600 text-center">{t('research.selectSource')}</p>
              )}
            </form>
          </div>

          {(searchResults || parsedResults) && (
            <div className="space-y-6">
              {parsedResults?.summary && (
                <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900">{t('research.summary')}</h3>
                  </div>
                  <div className="text-navy-700 leading-relaxed whitespace-pre-wrap">{parsedResults.summary}</div>
                </div>
              )}

              {parsedResults && parsedResults.results.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Scale className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-navy-900">{t('research.relevantAuthorities')}</h3>
                    </div>
                    <span className="text-sm text-navy-500">{parsedResults.results.length} {t('research.sourcesFound')}</span>
                  </div>

                  <div className="space-y-4">
                    {parsedResults.results.map((result, index) => {
                      const Icon = getSourceIcon(result.type);
                      const isExpanded = expandedResults.has(index);
                      return (
                        <div
                          key={index}
                          className={`border rounded-xl overflow-hidden transition-all ${getSourceColor(result.type)}`}
                        >
                          <button
                            onClick={() => toggleResultExpanded(index)}
                            className="w-full p-4 flex items-start justify-between text-left"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-semibold text-navy-900">{result.title}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRelevanceBadge(result.relevance)}`}>
                                    {result.relevance === 'high' ? t('research.highRelevance') : result.relevance === 'medium' ? t('research.mediumRelevance') : t('research.lowRelevance')}
                                  </span>
                                </div>
                                {result.citation && (
                                  <p className="text-sm text-navy-600 font-mono">{result.citation}</p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-navy-500 mt-1">
                                  {result.jurisdiction && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {result.jurisdiction}
                                    </span>
                                  )}
                                  {result.date && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {result.date}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-navy-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-0">
                              <div className="pl-11">
                                <div className="bg-white/50 rounded-lg p-4 border border-navy-100">
                                  <p className="text-sm text-navy-700 leading-relaxed whitespace-pre-wrap">
                                    {result.summary}
                                  </p>
                                  {result.keyPoints && result.keyPoints.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-navy-100">
                                      <p className="text-xs font-medium text-navy-500 mb-2">{t('research.keyPoints')}:</p>
                                      <ul className="space-y-1">
                                        {result.keyPoints.map((point, i) => (
                                          <li key={i} className="text-sm text-navy-600 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-navy-400 rounded-full mt-1.5 flex-shrink-0" />
                                            {point}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {parsedResults?.practicalGuidance && (
                <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Bookmark className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900">{t('research.practicalGuidance')}</h3>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                    <p className="text-navy-700 leading-relaxed whitespace-pre-wrap">{parsedResults.practicalGuidance}</p>
                  </div>
                </div>
              )}

              {!parsedResults?.summary && !parsedResults?.results.length && searchResults && (
                <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6">
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('research.results')}</h3>
                  <div className="bg-navy-50 border border-navy-200 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap text-sm text-navy-700 font-sans leading-relaxed">
                      {searchResults}
                    </pre>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>{t('research.disclaimer')}:</strong> {parsedResults?.disclaimer || t('research.disclaimerText')}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div>
          <div className="space-y-4">
            {queries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-navy-200">
                <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-navy-400" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{t('research.noHistory')}</h3>
                <p className="text-navy-600 mb-4">Start researching legal topics to build your history</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                >
                  {t('research.startResearching')}
                </button>
              </div>
            ) : (
              queries.map((query) => (
                <div
                  key={query.id}
                  className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy-900 mb-1">{query.query}</h3>
                        <div className="flex items-center gap-3 text-sm text-navy-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(query.created_at).toLocaleDateString()}
                          </span>
                          {query.category && (
                            <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                              {query.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery(query.query);
                        setSelectedCategory(query.category || '');
                        setActiveTab('search');
                      }}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('research.researchAgain')}
                    </button>
                  </div>
                  <div className="bg-navy-50 border border-navy-200 rounded-lg p-4 mt-4">
                    <p className={`text-sm text-navy-700 whitespace-pre-wrap ${expandedHistoryIds.has(query.id) ? '' : 'line-clamp-4'}`}>{query.results}</p>
                    {query.results && query.results.length > 300 && (
                      <button
                        onClick={() => setExpandedHistoryIds(prev => {
                          const next = new Set(prev);
                          if (next.has(query.id)) next.delete(query.id);
                          else next.add(query.id);
                          return next;
                        })}
                        className="text-teal-600 hover:text-teal-700 text-xs font-medium mt-2"
                      >
                        {expandedHistoryIds.has(query.id) ? t('research.showLess') : t('research.showFull')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

```

---

## src/pages/IssuePacks.tsx (448 lines)

```tsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Globe, Building2, Users, Briefcase, FileWarning, Handshake,
  CheckCircle, ArrowRight, Shield, Clock, FileText, AlertTriangle,
  Sparkles, Star, Lock, Scale
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import HighRiskPackGate from '../components/HighRiskPackGate';
import VerifiableTrustStrip from '../components/VerifiableTrustStrip';
import InlineEmailCapture from '../components/InlineEmailCapture';
import AttorneyReferralDisclosure from '../components/AttorneyReferralDisclosure';
import RelatedLinks from '../components/RelatedLinks';

const PACKS = [
  {
    id: 'immigration',
    icon: Globe,
    color: 'amber',
    highRisk: true,
    price: 39,
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
      who: 'Inquilinos enfrentando desalojo o disputas de deposito.',
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
    en: {
      name: 'Family Matters Pack',
      desc: 'Divorce, child custody, support calculations, and domestic law guidance.',
      who: 'People navigating divorce, custody disputes, or family court proceedings.',
      includes: ['Self-representation guide', 'Custody and visitation templates', 'Child support calculator worksheet', 'Document preparation checklist', 'Attorney referral matched to your area'],
      sample: 'Includes custody proposal template, support calculation worksheet, and court prep guide.',
    },
    es: {
      name: 'Paquete de Asuntos Familiares',
      desc: 'Divorcio, custodia de hijos, calculos de manutencion y orientacion.',
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
      includes: ['Plantillas de carta de validacion', 'Guia de respuesta a demandas', 'Verificador de prescripcion', 'Guiones de negociacion', 'Referencia a abogado'],
      sample: 'Incluye 3 plantillas de cartas y biblioteca de guiones de negociacion.',
    },
  },
  {
    id: 'negotiation',
    icon: Handshake,
    color: 'gold',
    highRisk: false,
    price: 49,
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
  const [safetyGatePack, setSafetyGatePack] = useState<{ id: string; name: string } | null>(null);
  const lang = language === 'es' ? 'es' : 'en';

  const handlePurchase = (pack: typeof PACKS[0]) => {
    if (pack.highRisk) {
      setSafetyGatePack({ id: pack.id, name: pack[lang].name });
    } else if (user) {
      navigate(`/checkout?plan=${pack.id}`);
    } else {
      navigate(`/signup?plan=${pack.id}`);
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
                ? 'Each Issue Pack gives you a complete action plan built from structured templates, with document checklists, deadline trackers, and a matched attorney referral for your specific legal situation.'
                : 'Cada Paquete te da un plan de accion completo basado en plantillas estructuradas, con listas de verificacion, rastreadores de fechas y referencia a abogado.'
              }
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-navy-200">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-400" /> {language === 'en' ? '30-day access' : '30 dias de acceso'}</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-teal-400" /> {language === 'en' ? 'State-specific' : 'Especifico por estado'}</div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-teal-400" /> {language === 'en' ? 'Secure checkout' : 'Pago seguro'}</div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {PACKS.map((pack) => {
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
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span className="text-xs text-amber-700 font-medium">
                            {language === 'en' ? 'High-stakes situation - includes safety screening before purchase' : 'Situacion de alto riesgo - incluye evaluacion de seguridad'}
                          </span>
                        </div>
                      )}

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
                        {language === 'en' ? `Get ${pack[lang].name}` : `Obtener ${pack[lang].name}`}
                        <ArrowRight className="w-4 h-4" />
                      </button>
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
                  {language === 'en' ? 'What "Structured Templates" Means' : 'Que Significa "Plantillas Estructuradas"'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Template documents and checklists are designed for common legal workflows',
                    'Templates are general-purpose, not customized legal advice for your specific case',
                    'Content is periodically reviewed for accuracy and completeness',
                    'This does not create an attorney-client relationship',
                  ] : [
                    'Las plantillas estan disenadas para flujos legales comunes',
                    'Las plantillas son de proposito general, no asesoria legal personalizada',
                    'El contenido se revisa periodicamente para precision y completitud',
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
                : 'Comienza con una pregunta gratis. Nuestra IA te ayudara a entender tu situacion.'
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

      {safetyGatePack && (
        <HighRiskPackGate
          packId={safetyGatePack.id}
          packName={safetyGatePack.name}
          onConfirm={() => {
            setSafetyGatePack(null);
            if (user) navigate('/dashboard');
            else navigate(`/signup?plan=${safetyGatePack.id}`);
          }}
          onClose={() => setSafetyGatePack(null)}
        />
      )}

      <RelatedLinks fromPath="/issue-packs" />

      <Footer />
    </div>
  );
}

```

---

## src/pages/Matters.tsx (653 lines)

```tsx
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
  const { t, language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
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


```

---

## src/pages/TrustCenter.tsx (1007 lines)

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import {
  Shield, Lock, FileText, AlertCircle, Eye, Database, Server,
  CheckCircle, Clock, Trash2, Download, MessageSquare,
  ExternalLink, HelpCircle, Flag, Users, Brain, ShieldCheck,
  Fingerprint, Building2, Layers, Key, Globe, Ban, Network
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import TrustSafetyReportModal from '../components/TrustSafetyReportModal';
import TrustFAQ from '../components/TrustFAQ';
import SafeUseChecklist from '../components/SafeUseChecklist';

function generatePDF(title: string, content: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ezLegal.ai&trade;</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #102A43; line-height: 1.6; }
        h1 { color: #0D9488; border-bottom: 2px solid #0D9488; padding-bottom: 10px; }
        h2 { color: #0A8A8A; margin-top: 30px; }
        h3 { color: #102A43; margin-top: 20px; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
        .header { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #0D9488; }
        .date { color: #627D98; font-size: 14px; margin-top: 5px; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #D9E2EC; color: #627D98; font-size: 12px; }
        .check { color: #16a34a; }
        .tm { font-size: 0.7em; vertical-align: super; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ezLegal.ai<span class="tm">&trade;</span></div>
      </div>
      <h1>${title}</h1>
      <p class="date">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      ${content}
      <div class="footer">
        <p>ezLegal.ai&trade; - AI-Powered Legal Information Platform</p>
        <p>Powered by LegalBreeze&trade;</p>
        <p>This document is for informational purposes only and does not constitute legal advice.</p>
        <p>Contact: trust@ezlegal.ai | www.ezlegal.ai/trust-center</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');

  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}

const pdfContents = {
  privacy: {
    title: 'Privacy & Data Practices Policy',
    content: `
      <h2>Data Collection</h2>
      <ul>
        <li><span class="check">&#10003;</span> We collect only information necessary to provide our services</li>
        <li><span class="check">&#10003;</span> Chat conversations are stored to improve your experience</li>
        <li><span class="check">&#10003;</span> Account information for registered users</li>
      </ul>

      <h2>Data Use</h2>
      <ul>
        <li><span class="check">&#10003;</span> <strong>Never used to train AI models</strong></li>
        <li><span class="check">&#10003;</span> Not sold to third parties</li>
        <li><span class="check">&#10003;</span> Used only to provide and improve services</li>
      </ul>

      <h2>Data Retention</h2>
      <ul>
        <li><span class="check">&#10003;</span> Chat history automatically deleted after 90 days</li>
        <li><span class="check">&#10003;</span> Documents retained for 1 year, then automatically deleted</li>
        <li><span class="check">&#10003;</span> Free chat sessions expire after 24 hours of inactivity</li>
      </ul>

      <h2>Your Rights</h2>
      <ul>
        <li><span class="check">&#10003;</span> Export your data in JSON or CSV format from your profile</li>
        <li><span class="check">&#10003;</span> Request data deletion with immediate or scheduled options</li>
        <li><span class="check">&#10003;</span> Access and correct your personal information</li>
      </ul>

      <h2>Contact</h2>
      <p>For privacy-related inquiries, contact us at: privacy@ezlegal.ai</p>
    `
  },
  dataSovereignty: {
    title: 'Data Sovereignty & AI Training Policy',
    content: `
      <h2>Zero Training Guarantee</h2>
      <p><strong>Your client data is NEVER used to train foundational large language models.</strong> This is a core principle of our platform architecture, not just a policy choice.</p>

      <h2>Inference-Only Architecture</h2>
      <p>Our AI uses pre-trained models in inference-only mode. Your queries and conversations are processed to generate responses but are never fed back into model training pipelines.</p>

      <h2>Isolated Processing</h2>
      <p>Your data runs in its own space. It is never mixed with another client's data at any step.</p>

      <h2>White-Label Client Guarantees</h2>
      <h3>Logical Isolation</h3>
      <p>Each white-label setup runs in its own space. It has its own database, API routes, and access rules.</p>

      <h3>Encryption</h3>
      <p>All data is encrypted at rest (AES-256) and in transit (TLS 1.3) via our cloud infrastructure provider (Supabase).</p>

      <h3>Data Hosting</h3>
      <p>Data is hosted in the United States via Supabase's managed cloud infrastructure.</p>

      <h2>What We Guarantee</h2>
      <ul>
        <li><span class="check">&#10003;</span> Your data is never used to train, fine-tune, or improve any AI models</li>
        <li><span class="check">&#10003;</span> Your data is never shared with AI model providers for their training purposes</li>
        <li><span class="check">&#10003;</span> Your data is never accessible to other ezLegal.ai&trade; clients or tenants</li>
        <li><span class="check">&#10003;</span> Complete data deletion is available within 30 days upon request</li>
      </ul>

      <h2>Audit & Verification</h2>
      <ul>
        <li><span class="check">&#10003;</span> Infrastructure provider (Supabase) maintains SOC 2 Type II certification</li>
        <li><span class="check">&#10003;</span> Row Level Security enforces data access controls at the database level</li>
        <li><span class="check">&#10003;</span> Activity audit logs track user actions and data access</li>
        <li><span class="check">&#10003;</span> Data export and deletion available through account settings</li>
      </ul>
    `
  },
  security: {
    title: 'Security Whitepaper',
    content: `
      <h2>Encryption</h2>
      <h3>TLS 1.3 (in transit) + AES-256 (at rest)</h3>
      <p>All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption via our cloud infrastructure provider.</p>
      <p><strong>Last verified:</strong> January 2026</p>

      <h2>Secure Cloud Infrastructure</h2>
      <p>Built on enterprise-grade cloud infrastructure with continuous monitoring, automated backups, and redundancy.</p>
      <p><strong>Infrastructure provider:</strong> Supabase (SOC 2 Type II certified)</p>

      <h2>Compliance</h2>
      <h3>CCPA Compliant</h3>
      <p>We comply with the California Consumer Privacy Act and honor data access and deletion requests.</p>

      <h2>Security Practices</h2>
      <ul>
        <li><span class="check">&#10003;</span> Multi-factor authentication available</li>
        <li><span class="check">&#10003;</span> Secure session management via Supabase Auth</li>
        <li><span class="check">&#10003;</span> Row Level Security for database access control</li>
        <li><span class="check">&#10003;</span> Activity logging and audit trails</li>
      </ul>

      <h2>Infrastructure Security</h2>
      <ul>
        <li>Hosted on Supabase (SOC 2 Type II certified infrastructure)</li>
        <li>Automated database backups and point-in-time recovery</li>
        <li>Managed PostgreSQL with high availability</li>
        <li>Serverless edge functions for secure API processing</li>
      </ul>
    `
  },
  aiEthics: {
    title: 'AI Ethics & Governance Policy',
    content: `
      <h2>Accuracy & Limitations</h2>
      <h3>Citations & Sources</h3>
      <p>Where possible, AI responses include references to relevant laws, statutes, and jurisdiction-specific information. We indicate when information may be outdated or when uncertainty exists.</p>

      <h3>Jurisdiction Awareness</h3>
      <p>We ask for your location to provide jurisdiction-relevant information. Laws vary significantly between states and countries.</p>

      <h3>Uncertainty & Limitations</h3>
      <p>AI explicitly indicates when it's uncertain or when a question is too complex for general guidance. We recommend attorney consultation for high-stakes matters.</p>

      <h2>Ethical Commitments</h2>
      <ul>
        <li><span class="check">&#10003;</span> <strong>No Dark Patterns:</strong> No urgency pressure, hidden fees, or manipulative upgrade prompts</li>
        <li><span class="check">&#10003;</span> <strong>Clear Escalation Paths:</strong> Always provide routes to human attorneys and free legal aid</li>
        <li><span class="check">&#10003;</span> <strong>Crisis Safety Rails:</strong> Automatic detection and escalation for crisis situations</li>
        <li><span class="check">&#10003;</span> <strong>Access to Justice:</strong> Free tier and pro bono pathways ensure access regardless of ability to pay</li>
        <li><span class="check">&#10003;</span> <strong>Bias Monitoring:</strong> Regular audits for bias in AI responses across demographics</li>
      </ul>

      <h2>AI Governance Framework</h2>
      <ul>
        <li>Human oversight of AI decision-making</li>
        <li>Regular model evaluation and testing</li>
        <li>Transparent disclosure of AI capabilities and limitations</li>
        <li>Continuous improvement based on user feedback</li>
      </ul>

      <h2>Responsible AI Principles</h2>
      <ul>
        <li>Fairness: AI treats all users equitably</li>
        <li>Transparency: Clear about what AI can and cannot do</li>
        <li>Accountability: Human oversight and review processes</li>
        <li>Privacy: Minimal data collection, maximum protection</li>
      </ul>
    `
  }
};

export default function TrustCenter() {
  const [showReportModal, setShowReportModal] = useState(false);

  const handleDownloadPDF = (type: keyof typeof pdfContents) => {
    const pdf = pdfContents[type];
    generatePDF(pdf.title, pdf.content);
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />
      <Breadcrumbs className="mt-24" />
      <TrustSafetyReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-16 pt-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-4 py-2 rounded-full mb-6">
              <ShieldCheck className="w-4 h-4 text-gold-300" />
              <span className="text-sm font-semibold">Trust & Safety</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Trust Center</h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              Transparency, security, and ethical AI practices are foundational to ezLegal.ai™.
              Learn how we protect your data and ensure responsible AI use.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-navy-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Quick Answers</h2>
            <p className="text-navy-600 mb-6">Find specific information quickly</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                to="/privacy-faq"
                className="p-4 bg-teal-50 border border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-100 transition-all group"
              >
                <Eye className="w-6 h-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-navy-900 mb-1 group-hover:text-teal-700">Privacy FAQ</h3>
                <p className="text-sm text-navy-600">Common privacy questions</p>
              </Link>

              <Link
                to="/security-faq"
                className="p-4 bg-teal-50 border border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-100 transition-all group"
              >
                <Shield className="w-6 h-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-navy-900 mb-1 group-hover:text-teal-700">Security FAQ</h3>
                <p className="text-sm text-navy-600">How we protect your data</p>
              </Link>

              <Link
                to="/scope-disclaimers"
                className="p-4 bg-teal-50 border border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-100 transition-all group"
              >
                <HelpCircle className="w-6 h-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-navy-900 mb-1 group-hover:text-teal-700">Scope FAQ</h3>
                <p className="text-sm text-navy-600">What we can and can't do</p>
              </Link>
            </div>
          </div>

          <h2 className="text-xl font-bold text-navy-900 mb-4">Full Documentation</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors group overflow-hidden">
              <a href="#privacy" className="flex items-center gap-3 p-4">
                <Lock className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-navy-900 group-hover:text-teal-600">Privacy & Data</span>
              </a>
              <button
                onClick={() => handleDownloadPDF('privacy')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-navy-50 text-teal-600 hover:bg-teal-100 text-sm font-medium border-t border-navy-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            <div className="bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors group overflow-hidden">
              <a href="#data-sovereignty" className="flex items-center gap-3 p-4">
                <Fingerprint className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-navy-900 group-hover:text-teal-600">Data Sovereignty</span>
              </a>
              <button
                onClick={() => handleDownloadPDF('dataSovereignty')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 hover:bg-teal-100 text-sm font-medium border-t border-navy-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            <div className="bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors group overflow-hidden">
              <a href="#security" className="flex items-center gap-3 p-4">
                <Shield className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-navy-900 group-hover:text-teal-600">Security</span>
              </a>
              <button
                onClick={() => handleDownloadPDF('security')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-navy-50 text-teal-600 hover:bg-teal-100 text-sm font-medium border-t border-navy-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            <div className="bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors group overflow-hidden">
              <a href="#ai-ethics" className="flex items-center gap-3 p-4">
                <Brain className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-navy-900 group-hover:text-teal-600">AI Ethics</span>
              </a>
              <button
                onClick={() => handleDownloadPDF('aiEthics')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-navy-50 text-teal-600 hover:bg-teal-100 text-sm font-medium border-t border-navy-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            <div className="bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors group overflow-hidden">
              <a href="#report" className="flex items-center gap-3 p-4">
                <Flag className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-navy-900 group-hover:text-teal-600">Report Concern</span>
              </a>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium border-t border-navy-200 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-navy-900 mb-1">Important Legal Notice</h3>
              <p className="text-navy-700 text-sm">
                <strong>ezLegal.ai™ gives legal information, not legal advice.</strong> We are not a law firm.
                Using this service does not create an attorney-client relationship, and your messages here
                do not carry attorney-client privilege. For complex matters, court representation, or
                advice on your case, talk to a licensed attorney.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TrustFAQ />
      <SafeUseChecklist />

      <section id="privacy" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Privacy & Data Practices</h2>
              <p className="text-navy-600">How we collect, use, and protect your information</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-start gap-4">
                <Database className="w-5 h-5 text-teal-600 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Data Collection</h3>
                  <ul className="text-navy-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>We collect only information necessary to provide our services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Chat conversations are stored to improve your experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Account information for registered users</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-start gap-4">
                <Eye className="w-5 h-5 text-teal-600 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Data Use</h3>
                  <ul className="text-navy-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Never used to train AI models</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Not sold to third parties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Used only to provide and improve services</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-teal-600 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Data Retention</h3>
                  <ul className="text-navy-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Chat history automatically deleted after 90 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Documents retained for 1 year, then automatically deleted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Free chat sessions expire after 24 hours of inactivity</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-start gap-4">
                <Trash2 className="w-5 h-5 text-teal-600 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Your Rights</h3>
                  <ul className="text-navy-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Export your data in JSON or CSV format from your profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Request data deletion with immediate or scheduled options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Access and correct your personal information</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-navy-700 font-semibold"
            >
              <FileText className="w-4 h-4" />
              Full Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-navy-700 font-semibold"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      <section id="data-sovereignty" className="py-16 bg-navy-50 border-b border-navy-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Data Sovereignty & AI Training Policy</h2>
              <p className="text-navy-600">Your data remains yours - never used to train AI models</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl border-2 border-teal-200 p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Ban className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Zero Training Guarantee</h3>
                <p className="text-navy-700 text-lg">
                  <strong>Your client data is NEVER used to train foundational large language models.</strong> This is a core principle of our platform architecture, not just a policy choice.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5 border border-navy-200">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-navy-900">Inference-Only Architecture</h4>
                </div>
                <p className="text-navy-600 text-sm">
                  Our AI uses pre-trained models in inference-only mode. Your queries and conversations are processed to generate responses but are never fed back into model training pipelines.
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-navy-200">
                <div className="flex items-center gap-3 mb-3">
                  <Network className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-navy-900">Isolated Processing</h4>
                </div>
                <p className="text-navy-600 text-sm">
                  All data processing occurs in logically isolated environments. Your organization's data is never commingled with other clients' data during any stage of processing.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-navy-600" />
              White-Label Client Guarantees
            </h3>
            <div className="bg-white rounded-xl border border-navy-200 overflow-hidden">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-navy-200">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Layers className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-navy-900">Logical Isolation</h4>
                  </div>
                  <p className="text-navy-600 text-sm">
                    Each white-label setup runs in its own space. It has its own database, API routes, and access rules.
                  </p>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Key className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-navy-900">Encryption Standards</h4>
                  </div>
                  <p className="text-navy-600 text-sm">
                    All data encrypted at rest (AES-256) and in transit (TLS 1.3) via our infrastructure provider (Supabase).
                  </p>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-navy-900">US-Based Hosting</h4>
                  </div>
                  <p className="text-navy-600 text-sm">
                    Data is hosted in the United States via Supabase's managed cloud infrastructure with automated backups.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <h4 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                What We Guarantee
              </h4>
              <ul className="space-y-3 text-sm text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your data is never used to train, fine-tune, or improve any AI models</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your data is never shared with AI model providers for their training purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your data is never accessible to other ezLegal.ai™ clients or tenants</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Complete data deletion is available within 30 days upon request</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <h4 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                Audit & Verification
              </h4>
              <ul className="space-y-3 text-sm text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Infrastructure provider (Supabase) maintains SOC 2 Type II certification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Contractual DPA (Data Processing Agreement) for enterprise clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Annual third-party security assessments available on request</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Real-time access logs available for enterprise clients</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/partner-hub"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold"
            >
              <Building2 className="w-4 h-4" />
              Learn more about our Partner Program
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      <section id="security" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Security</h2>
              <p className="text-navy-600">Enterprise-grade protection for your information</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <Lock className="w-8 h-8 text-success-600 mb-4" />
              <h3 className="font-bold text-navy-900 mb-2">TLS 1.3 (in transit) + AES-256 (at rest)</h3>
              <p className="text-navy-600 text-sm">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption via our cloud infrastructure provider.
              </p>
              <div className="mt-3 pt-3 border-t border-navy-100">
                <p className="text-xs text-navy-500">
                  <span className="font-semibold">Last verified:</span> January 2026
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <Server className="w-8 h-8 text-success-600 mb-4" />
              <h3 className="font-bold text-navy-900 mb-2">Secure Cloud Infrastructure</h3>
              <p className="text-navy-600 text-sm">
                Built on enterprise-grade cloud infrastructure with continuous monitoring, automated backups, and redundancy.
              </p>
              <div className="mt-3 pt-3 border-t border-navy-100">
                <p className="text-xs text-navy-500">
                  <span className="font-semibold">Infrastructure:</span> Hosted on Supabase (SOC 2 Type II certified)
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <ShieldCheck className="w-8 h-8 text-success-600 mb-4" />
              <h3 className="font-bold text-navy-900 mb-2">CCPA Compliant</h3>
              <p className="text-navy-600 text-sm">
                We comply with the California Consumer Privacy Act and honor data access and deletion requests.
              </p>
              <div className="mt-3 pt-3 border-t border-navy-100">
                <p className="text-xs text-navy-500">
                  <span className="font-semibold">Compliance verified:</span> January 2026
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl p-6 border border-navy-200">
            <h3 className="font-bold text-navy-900 mb-4">Security Practices</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-navy-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Row Level Security for database access control</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Multi-factor authentication available</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Secure session management</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Activity logging and audit trails</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Automated database backups via Supabase</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Role-based access permissions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ai-ethics" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">AI Ethics & Accuracy</h2>
              <p className="text-navy-600">How we ensure responsible, accurate AI guidance</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-navy-900 mb-4">Accuracy & Limitations</h3>
              <div className="space-y-4">
                <div className="bg-navy-50 rounded-lg p-4 border border-navy-200">
                  <h4 className="font-semibold text-navy-900 mb-2">Citations & Sources</h4>
                  <p className="text-navy-600 text-sm">
                    Where possible, AI responses include references to relevant laws, statutes, and
                    jurisdiction-specific information. We indicate when information may be outdated
                    or when uncertainty exists.
                  </p>
                </div>
                <div className="bg-navy-50 rounded-lg p-4 border border-navy-200">
                  <h4 className="font-semibold text-navy-900 mb-2">Jurisdiction Awareness</h4>
                  <p className="text-navy-600 text-sm">
                    We ask for your location to provide jurisdiction-relevant information. Laws vary
                    significantly between states and countries.
                  </p>
                </div>
                <div className="bg-navy-50 rounded-lg p-4 border border-navy-200">
                  <h4 className="font-semibold text-navy-900 mb-2">Uncertainty & Limitations</h4>
                  <p className="text-navy-600 text-sm">
                    AI explicitly indicates when it's uncertain or when a question is too complex
                    for general guidance. We recommend attorney consultation for high-stakes matters.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-navy-900 mb-4">Ethical Commitments</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-navy-900">No Dark Patterns</h4>
                    <p className="text-navy-600 text-sm">No urgency pressure, hidden fees, or manipulative upgrade prompts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-navy-900">Clear Escalation Paths</h4>
                    <p className="text-navy-600 text-sm">Always provide routes to human attorneys and free legal aid</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-navy-900">Crisis Safety Rails</h4>
                    <p className="text-navy-600 text-sm">Automatic detection and escalation for crisis situations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-navy-900">Access to Justice</h4>
                    <p className="text-navy-600 text-sm">Free tier and pro bono pathways ensure access regardless of ability to pay</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-navy-900">Bias Monitoring</h4>
                    <p className="text-navy-600 text-sm">Regular audits for bias in AI responses across demographics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-navy-50 rounded-xl p-6 border border-navy-200">
            <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-navy-600" />
              Attorney Matching & Referral Transparency
            </h3>
            <div className="text-sm text-navy-600 space-y-2">
              <p>
                We match attorneys on four factors: practice area, jurisdiction, availability, and user rating. Attorneys cannot pay for higher rankings.
              </p>
              <p>
                Attorneys opt into our directory and we verify their profiles. We do not endorse any attorney. Check their credentials and disciplinary history yourself before you hire.
              </p>
              <Link
                to="/find-attorney"
                className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-semibold mt-1"
              >
                View Lawyer Directory
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/ai-governance"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <FileText className="w-5 h-5" />
              View Full AI Governance Policy
            </Link>
          </div>
        </div>
      </section>

      <section id="report" className="py-16 bg-navy-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Flag className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Report a Concern</h2>
              <p className="text-navy-600">Help us improve by reporting issues</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <h3 className="font-bold text-navy-900 mb-4">What You Can Report</h3>
              <ul className="space-y-3 text-sm text-navy-600">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Inaccurate Information:</strong> AI provided incorrect or misleading legal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Bias or Discrimination:</strong> AI showed bias based on demographics or case type</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Privacy Concerns:</strong> Issues with data handling or privacy</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Ethical Issues:</strong> AI behaved unethically or inappropriately</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Safety Concerns:</strong> Missed crisis detection or inappropriate responses</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <h3 className="font-bold text-navy-900 mb-4">How It Works</h3>
              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-navy-700">1</span>
                  </div>
                  <p className="text-sm text-navy-600"><strong>Submit:</strong> File your report via the button below or email trust@ezlegal.ai. You will receive an acknowledgment within 1 business day.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-navy-700">2</span>
                  </div>
                  <p className="text-sm text-navy-600"><strong>Review:</strong> Our Trust & Safety team investigates every report within 24 hours. Critical safety issues are escalated immediately.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-navy-700">3</span>
                  </div>
                  <p className="text-sm text-navy-600"><strong>Resolution:</strong> We take corrective action (model adjustments, content fixes, policy updates) and document findings internally.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-navy-700">4</span>
                  </div>
                  <p className="text-sm text-navy-600"><strong>Follow-Up:</strong> If you provided contact information, we will notify you of the outcome and any changes made.</p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors justify-center"
                >
                  <Flag className="w-4 h-4" />
                  Submit a Concern Report
                </button>
                <a
                  href="mailto:trust@ezlegal.ai"
                  className="flex items-center gap-2 w-full border border-navy-300 bg-white hover:bg-navy-50 text-navy-700 px-4 py-3 rounded-lg font-semibold transition-colors justify-center"
                >
                  <MessageSquare className="w-4 h-4" />
                  Email: trust@ezlegal.ai
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-teal-50 border-t border-teal-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">Enterprise Security Documentation</h3>
              <p className="text-navy-600">
                For legal aid organizations and nonprofits: security architecture overview, infrastructure details, and data handling documentation.
              </p>
            </div>
            <Link
              to="/enterprise-security"
              className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View Enterprise Security
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-navy-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">Quick Links</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/privacy"
              className="flex items-center gap-3 p-4 bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors"
            >
              <Lock className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-navy-900">Privacy Policy</span>
            </Link>
            <Link
              to="/terms"
              className="flex items-center gap-3 p-4 bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors"
            >
              <FileText className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-navy-900">Terms of Service</span>
            </Link>
            <Link
              to="/ai-governance"
              className="flex items-center gap-3 p-4 bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors"
            >
              <Brain className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-navy-900">AI Governance</span>
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-3 p-4 bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-navy-900">Contact Support</span>
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

## src/pages/ForPartners.tsx (836 lines)

```tsx
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import { Building2, Shield, Lock, Key, Globe, Code, CheckCircle, ArrowRight, FileText, Users, Zap, Fingerprint, Eye, MessageSquare, BookOpen, Puzzle, Palette, BarChart3, Headphones as HeadphonesIcon, Clock, Award, Handshake, Database, AlertTriangle, Server, Heart, Briefcase } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function ForPartners() {
  const integrationTiers = [
    {
      tier: 'Embed',
      title: 'Embed Widget',
      subtitle: 'Add AI to Your Website',
      description: 'Drop a chat widget on your existing website. No development work required.',
      icon: Puzzle,
      price: '$79',
      pricePeriod: '/month',
      billingUnit: '1 conversation = 1 unique chat session (unlimited messages within session)',
      included: '500 conversations/mo included',
      overage: '$0.15 per additional conversation',
      typicalCost: '$79 - $150/mo for most organizations',
      recommendedWhen: 'You want the fastest path to live -- no developers needed',
      idealFor: 'Legal aid orgs, nonprofits, community organizations',
      details: [
        'Copy-paste installation (5 minutes)',
        'Customize colors and branding',
        'Lead capture and email collection',
        'Real-time analytics dashboard',
        'Conversation history and export',
        'Bilingual (English + Spanish)',
      ],
      notIncluded: [
        'Custom domain',
        'Remove ezLegal branding',
        'API access',
      ],
      standards: {
        support: 'Email (24hr response)',
        uptime: '99.9% target uptime',
        onboarding: 'Self-serve + guide',
        environments: 'Production only',
        sites: '1 domain',
      },
      primaryLink: '/dashboard/website-integration',
      primaryText: 'Get Embed Code',
      primaryStyle: 'primary',
      secondaryLink: '/schedule-demo',
      secondaryText: 'View Live Demo',
      trial: '14-day free trial included',
    },
    {
      tier: 'API',
      title: 'API Access',
      subtitle: 'Build Custom Integrations',
      description: 'RESTful APIs for developers building legal AI into their own applications.',
      icon: Code,
      price: '$0.02',
      pricePeriod: '/query',
      billingUnit: '1 query = 1 POST to /v1/chat/completions (includes all follow-up reasoning)',
      included: 'Free sandbox: 100 queries/day for 14 days',
      overage: 'Pay-as-you-go after sandbox; volume discounts at 10K+ queries/mo',
      typicalCost: '$40 - $200/mo for 2K-10K queries',
      recommendedWhen: 'You have developers and want full control over the UX',
      idealFor: 'Legal tech startups, custom app builders, in-house dev teams',
      details: [
        'Full API documentation + Postman collection',
        'Sandbox environment (no credit card)',
        'Webhook notifications',
        'Rate limiting: 60 req/min (sandbox), 300 req/min (production)',
        'Technical support via email',
        'Bearer token + API key authentication',
      ],
      notIncluded: [
        'White-label rights',
        'Dedicated support manager',
        'Custom model training',
      ],
      standards: {
        support: 'Email (24hr response)',
        uptime: '99.9% target uptime',
        onboarding: 'API docs + sandbox',
        environments: 'Sandbox + Production',
        sites: 'Unlimited',
      },
      primaryLink: '/schedule-demo',
      primaryText: 'Request Sandbox Access',
      primaryStyle: 'primary',
      secondaryLink: '/schedule-demo',
      secondaryText: 'Read API Docs',
      trial: 'Free sandbox -- no credit card required',
    },
    {
      tier: 'Enterprise',
      title: 'White Label',
      subtitle: 'Deploy as Your Own Product',
      description: 'Full white-label solution with your branding, domain, and complete customization.',
      icon: Palette,
      price: 'Custom',
      pricePeriod: '',
      billingUnit: 'Annual platform license + usage-based tiers',
      included: 'Dedicated infrastructure + custom SLA',
      overage: 'Usage tiers negotiated in contract',
      typicalCost: 'Typically $1,500 - $5,000/mo depending on volume',
      recommendedWhen: 'You need your own brand, domain, SSO, and full control',
      idealFor: 'Large organizations, legal tech companies, franchises',
      details: [
        'Custom domain (yourorg.ai)',
        'Complete brand customization',
        'Remove all ezLegal branding',
        'SSO/SAML integration',
        'Dedicated account manager',
        'Custom AI training on your content',
        '99.95%+ target uptime (contractual SLA available)',
      ],
      notIncluded: [],
      standards: {
        support: 'Dedicated manager (4hr response)',
        uptime: '99.95% target uptime',
        onboarding: '2-4 weeks guided setup',
        environments: 'Staging + Production',
        sites: 'Unlimited domains',
      },
      primaryLink: '/schedule-demo',
      primaryText: 'Request Architecture Review',
      primaryStyle: 'primary',
      secondaryLink: '/schedule-demo',
      secondaryText: 'Download Security Packet',
      trial: 'Scoping call required',
    },
  ];

  const comparisonFeatures = [
    { feature: 'Setup Time', widget: '5 minutes', api: '1-2 weeks', whiteLabel: '2-4 weeks' },
    { feature: 'Technical Skills', widget: 'None', api: 'Developer', whiteLabel: 'None (we handle it)' },
    { feature: 'Branding', widget: 'Colors only', api: 'Via your app', whiteLabel: 'Fully custom' },
    { feature: 'Your Domain', widget: 'No', api: 'Via your app', whiteLabel: 'Yes' },
    { feature: 'Lead Capture', widget: 'Built-in', api: 'Build your own', whiteLabel: 'Built-in' },
    { feature: 'Analytics', widget: 'Basic dashboard', api: 'Via /analytics API', whiteLabel: 'Advanced dashboard' },
    { feature: 'Support SLA', widget: 'Email (24hr)', api: 'Email (24hr)', whiteLabel: 'Dedicated (4hr)' },
    { feature: 'Target Uptime', widget: '99.9%', api: '99.9%', whiteLabel: '99.95%+' },
    { feature: 'Onboarding', widget: 'Self-serve', api: 'Sandbox + docs', whiteLabel: 'Guided (2-4 wks)' },
    { feature: 'Environments', widget: 'Production', api: 'Sandbox + Prod', whiteLabel: 'Staging + Prod' },
    { feature: 'Languages', widget: 'EN + ES', api: 'EN + ES', whiteLabel: 'EN + ES + custom' },
    { feature: 'SSO/SAML', widget: 'No', api: 'No', whiteLabel: 'Yes' },
    { feature: 'Billing Model', widget: 'Fixed monthly', api: 'Per-query', whiteLabel: 'Annual license' },
  ];

  const securityFeatures = [
    {
      title: 'SOC 2 Type II Infrastructure',
      description: 'Built on Supabase, which maintains SOC 2 Type II certification for security, availability, and confidentiality.',
      icon: Award,
    },
    {
      title: 'AES-256 & TLS 1.3 Encryption',
      description: 'All data encrypted at rest and in transit via our cloud infrastructure provider.',
      icon: Shield,
    },
    {
      title: 'US-Based Hosting',
      description: 'Data hosted in the United States via Supabase managed cloud infrastructure.',
      icon: Globe,
    },
    {
      title: 'Row Level Security',
      description: 'Database-enforced access controls ensure users only access their authorized data.',
      icon: Key,
    },
    {
      title: 'Authenticated Access',
      description: 'Supabase Auth with MFA support. Every API request authenticated and authorized.',
      icon: Lock,
    },
    {
      title: 'Audit Logging',
      description: 'Activity audit trails of user actions and data access stored in database tables.',
      icon: Eye,
    },
  ];

  const apiEndpoints = [
    {
      method: 'POST',
      endpoint: '/v1/chat/completions',
      description: 'Send a legal question and receive an AI-generated response with citations.',
    },
    {
      method: 'GET',
      endpoint: '/v1/documents/{id}',
      description: 'Retrieve generated documents, templates, or user-uploaded files.',
    },
    {
      method: 'POST',
      endpoint: '/v1/documents/generate',
      description: 'Generate legal documents based on provided parameters and jurisdiction.',
    },
    {
      method: 'GET',
      endpoint: '/v1/jurisdictions',
      description: 'List supported jurisdictions and their available practice areas.',
    },
    {
      method: 'POST',
      endpoint: '/v1/webhooks',
      description: 'Register webhooks for real-time event notifications.',
    },
    {
      method: 'GET',
      endpoint: '/v1/analytics/usage',
      description: 'Retrieve usage statistics and analytics for your organization.',
    },
  ];

  const legalTechEssentials = [
    {
      icon: Database,
      title: 'Data Retention & Isolation',
      items: [
        'Conversation data retained for 90 days by default (configurable)',
        'Per-tenant data isolation via Row Level Security',
        'Data export available on request (JSON/CSV)',
        'Data deletion within 30 days of account termination',
      ],
    },
    {
      icon: Eye,
      title: 'Zero Training on Client Data',
      items: [
        'Your users\' conversations are never used to train our models',
        'No data sharing with third-party AI providers for training',
        'OpenAI API used with zero-retention data processing agreement',
        'Audit-ready documentation available on request',
      ],
    },
    {
      icon: AlertTriangle,
      title: 'UPL Boundaries & Disclaimers',
      items: [
        'All AI responses carry "legal information, not legal advice" disclaimers',
        'Configurable disclaimer text for white-label deployments',
        'Crisis escalation detection routes to human resources',
        'Attorney referral system for cases requiring licensed counsel',
      ],
    },
    {
      icon: FileText,
      title: 'Audit & Compliance',
      items: [
        'Full audit logs of all user actions and data access',
        'LSO compliance features for legal aid organizations',
        'Grant reporting dashboards with demographic tracking',
        'CCPA-compliant data handling with user consent management',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <main id="main-content">
        <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white pt-12 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <Building2 className="w-4 h-4 text-gold-300" />
                <span className="text-sm font-semibold">Organization & Community Programs</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Enterprise-Grade Legal AI for Your Organization
              </h1>
              <p className="text-xl text-navy-300 mb-4">
                Whether you're deploying for your own team or offering access to the communities you serve,
                ezLegal.ai has a program built for you.
              </p>
              <p className="text-sm text-navy-400">
                <span className="font-semibold text-navy-300">Community programs</span> are for organizations that distribute or sponsor access for others.{' '}
                <span className="font-semibold text-navy-300">Organization plans</span> are for internal staff and team use.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
              <Link
                to="/partner-hub"
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-teal-400/50 hover:bg-white/15 transition-all"
              >
                <div className="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-teal-300" />
                </div>
                <h2 className="text-xl font-bold mb-2">Offer to My Community</h2>
                <p className="text-navy-300 text-sm mb-4">
                  Sponsor, refer, or white-label legal AI for the people and organizations you serve.
                  Referral revenue share, community access, and white-label models available.
                </p>
                <span className="inline-flex items-center gap-2 text-teal-300 font-semibold text-sm group-hover:gap-3 transition-all">
                  View Community Models <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <a
                href="#integration"
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-gold-400/50 hover:bg-white/15 transition-all"
              >
                <div className="w-14 h-14 bg-gold-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7 text-gold-300" />
                </div>
                <h2 className="text-xl font-bold mb-2">Buy for My Organization</h2>
                <p className="text-navy-300 text-sm mb-4">
                  Embed, integrate via API, or white-label for your internal team. Widget, API, and
                  enterprise deployment options with clear pricing.
                </p>
                <span className="inline-flex items-center gap-2 text-gold-300 font-semibold text-sm group-hover:gap-3 transition-all">
                  View Organization Pricing <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/schedule-demo"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Schedule a Demo
              </Link>
              <Link
                to="/partner-hub"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm"
              >
                Existing partner? Access Partner Portal
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b border-navy-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 text-navy-400">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">SOC 2 Type II Infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">CCPA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span className="text-sm font-medium">AES-256 Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">TLS 1.3 In Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                <span className="text-sm font-medium">Zero Training on Client Data</span>
              </div>
            </div>
          </div>
        </section>

        <section id="integration" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                <Briefcase className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold text-navy-900">Organization Integration Pricing</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-4">Choose Your Integration Level</h2>
              <p className="text-navy-600 max-w-3xl mx-auto mb-4">
                Deploy legal AI for your internal team. From simple widget embedding to full white-label deployment -- pick the option that matches your technical resources.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link to="/pricing" className="text-teal-600 hover:text-navy-700 font-medium inline-flex items-center gap-1">
                  View individual/business pricing
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link to="/partner-hub" className="text-navy-500 hover:text-navy-700 font-medium inline-flex items-center gap-1">
                  Looking to distribute to a community instead?
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-16">
              {integrationTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-6 flex flex-col relative ${
                    index === 0
                      ? 'bg-gradient-to-b from-navy-50 to-white border-2 border-teal-500 shadow-xl'
                      : 'bg-navy-50 border border-navy-200'
                  }`}
                >
                  <div className="absolute -top-3 left-4 right-4">
                    <div className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                      index === 0 ? 'bg-teal-500 text-white' :
                      index === 1 ? 'bg-navy-700 text-white' :
                      'bg-amber-500 text-white'
                    }`}>
                      Recommended when: {tier.recommendedWhen}
                    </div>
                  </div>

                  <div className="mt-4 mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      tier.tier === 'Embed' ? 'bg-teal-100 text-navy-700' :
                      tier.tier === 'API' ? 'bg-teal-100 text-teal-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {tier.tier}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-teal-100' : 'bg-navy-200'
                    }`}>
                      <tier.icon className={`w-5 h-5 ${index === 0 ? 'text-teal-600' : 'text-navy-600'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-900">{tier.title}</h3>
                      <p className="text-xs text-navy-500">{tier.subtitle}</p>
                    </div>
                  </div>

                  <div className="my-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-navy-900">{tier.price}</span>
                      <span className="text-navy-500 text-sm">{tier.pricePeriod}</span>
                    </div>
                    <p className="text-xs text-navy-500 mt-1">{tier.included}</p>
                  </div>

                  <div className="bg-navy-100 rounded-lg px-3 py-2 mb-4 space-y-1">
                    <div className="flex items-start gap-1.5">
                      <span className="text-xs text-navy-500 whitespace-nowrap">Billing unit:</span>
                      <span className="text-xs text-navy-700">{tier.billingUnit}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-xs text-navy-500 whitespace-nowrap">Overages:</span>
                      <span className="text-xs text-navy-700">{tier.overage}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-xs text-navy-500 whitespace-nowrap">Typical cost:</span>
                      <span className="text-xs font-semibold text-navy-800">{tier.typicalCost}</span>
                    </div>
                  </div>

                  <p className="text-sm text-navy-600 mb-3">{tier.description}</p>

                  <div className="bg-teal-50 rounded-lg px-3 py-2 mb-4">
                    <p className="text-xs text-navy-500">Ideal for:</p>
                    <p className="text-sm font-medium text-navy-700">{tier.idealFor}</p>
                  </div>

                  <ul className="space-y-2 flex-1 mb-4">
                    {tier.details.map((detail, dIndex) => (
                      <li key={dIndex} className="flex items-start gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {tier.notIncluded.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-navy-200">
                      <p className="text-xs text-navy-400 mb-2">Not included:</p>
                      <ul className="space-y-1">
                        {tier.notIncluded.map((item, nIndex) => (
                          <li key={nIndex} className="flex items-center gap-2 text-xs text-navy-400">
                            <span className="w-3 h-3 rounded-full border border-navy-300 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mb-4 pt-3 border-t border-navy-200">
                    <p className="text-xs font-semibold text-navy-600 mb-2">Service Standards</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {Object.entries(tier.standards).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-navy-400">
                            {key === 'uptime' ? 'Target Uptime' : key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                          <span className="text-xs font-medium text-navy-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mt-auto">
                    <Link
                      to={tier.primaryLink}
                      className="w-full py-3 rounded-lg font-semibold text-center transition-colors block bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      {tier.primaryText}
                    </Link>
                    <Link
                      to={tier.secondaryLink}
                      className="w-full py-2.5 rounded-lg font-medium text-center transition-colors block bg-navy-100 hover:bg-navy-200 text-navy-700 text-sm"
                    >
                      {tier.secondaryText}
                    </Link>
                    <p className="text-xs text-center text-navy-500 pt-1">{tier.trial}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-navy-50 rounded-2xl border border-navy-200 overflow-hidden">
              <div className="px-6 py-4 bg-navy-100 border-b border-navy-200">
                <h3 className="font-bold text-navy-900">Full Comparison</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navy-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-navy-700">Feature</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-teal-600">Widget</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-teal-600">API</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-amber-600">White Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-200">
                    {comparisonFeatures.map((row, index) => (
                      <tr key={index} className="hover:bg-navy-50">
                        <td className="px-6 py-3 text-sm font-medium text-navy-700">{row.feature}</td>
                        <td className="px-6 py-3 text-sm text-center text-navy-600">{row.widget}</td>
                        <td className="px-6 py-3 text-sm text-center text-navy-600">{row.api}</td>
                        <td className="px-6 py-3 text-sm text-center text-navy-600">{row.whiteLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                <Code className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold text-teal-900">API Reference</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-4">RESTful API Endpoints</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Comprehensive API for integrating legal AI capabilities into your applications.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-navy-200 overflow-hidden">
              <div className="bg-navy-900 px-6 py-4">
                <div className="flex items-center gap-2 text-navy-400 text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 font-mono">api.ezlegal.ai</span>
                </div>
              </div>
              <div className="divide-y divide-navy-200">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="px-6 py-4 flex items-start gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {endpoint.method}
                    </span>
                    <div className="flex-1">
                      <code className="text-sm font-mono text-navy-900">{endpoint.endpoint}</code>
                      <p className="text-sm text-navy-600 mt-1">{endpoint.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-navy-50 px-6 py-4 border-t border-navy-200 flex flex-wrap items-center gap-6">
                <Link
                  to="/schedule-demo"
                  className="inline-flex items-center gap-2 text-teal-600 hover:text-navy-700 font-semibold text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Request Full API Documentation
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/schedule-demo"
                  className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-700 font-medium text-sm"
                >
                  <Code className="w-4 h-4" />
                  Download Postman Collection
                </Link>
              </div>
            </div>

            <div className="mt-8 bg-teal-50 rounded-2xl p-6 border border-teal-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Quick Start Code Example</h3>
                  <div className="bg-navy-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                    <pre>{`curl -X POST https://api.ezlegal.ai/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "What are the requirements for a valid will in California?",
    "jurisdiction": "CA",
    "include_citations": true
  }'`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Enterprise Security</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-4">Built for Enterprise Trust</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Security and compliance are foundational to our platform, not afterthoughts.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-navy-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/trust-center#data-sovereignty"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-navy-700 font-semibold"
              >
                <Fingerprint className="w-4 h-4" />
                Read our Data Sovereignty Commitment
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
                <Server className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-semibold text-amber-900">LegalTech Integration Essentials</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-4">What Legal Organizations Need to Know</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Answers to the questions your security, compliance, and legal teams will ask before approving an integration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {legalTechEssentials.map((section, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-navy-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-amber-700" />
                    </div>
                    <h3 className="font-bold text-navy-900">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, iIndex) => (
                      <li key={iIndex} className="flex items-start gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/schedule-demo"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-navy-700 font-semibold"
              >
                <FileText className="w-4 h-4" />
                Request full security and compliance documentation
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white border-t border-navy-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border-2 border-teal-200 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-teal-100 px-3 py-1 rounded-full text-sm font-semibold text-teal-700 mb-4">
                  <Heart className="w-4 h-4" />
                  Community Programs
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-3">
                  Want to Offer Legal AI to Your Community Instead?
                </h2>
                <p className="text-navy-600 mb-4">
                  Refer, sponsor, or white-label ezLegal.ai for the people and organizations you serve. Full economics, commitments, and application form.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    Referral Partner -- Earn 20% revenue share
                  </li>
                  <li className="flex items-center gap-2 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    Community Access -- Sponsor access from $2/member/mo
                  </li>
                  <li className="flex items-center gap-2 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    White-Label -- Deploy under your own brand
                  </li>
                </ul>
                <Link
                  to="/partner-hub"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-teal-600/20"
                >
                  View Community Models
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="hidden md:flex flex-col items-center gap-3 flex-shrink-0">
                <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center">
                  <Handshake className="w-10 h-10 text-teal-600" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy-900">Growing</div>
                  <div className="text-xs text-navy-500">Partner Network</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-t border-navy-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">What Every Organization Gets</h2>
              <p className="text-navy-600">Comprehensive support and resources for successful deployment, regardless of integration level.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <HeadphonesIcon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Technical Support</h3>
                <p className="text-sm text-navy-600">Email support (24hr) for Widget/API; dedicated manager for Enterprise</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Target Uptime</h3>
                <p className="text-sm text-navy-600">99.9% target standard; 99.95%+ for Enterprise (<Link to="/sla" className="text-teal-600 hover:text-teal-700 underline">view SLA details</Link>)</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Documentation</h3>
                <p className="text-sm text-navy-600">API docs, Postman collection, implementation guides, and code examples</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-7 h-7 text-rose-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Analytics</h3>
                <p className="text-sm text-navy-600">Usage tracking, conversation analytics, and billing dashboards</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Integrate?</h2>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              Schedule a technical deep-dive with our partnerships team. We'll discuss your use case,
              integration requirements, and demonstrate our platform capabilities.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/schedule-demo"
                className="inline-flex items-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold hover:bg-navy-50 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Schedule Technical Demo
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                <Users className="w-5 h-5" />
                Contact Partnerships
              </Link>
            </div>
            <p className="mt-8 text-navy-200 text-sm">
              Or email us directly at{' '}
              <a href="mailto:partners@ezlegal.ai" className="text-white underline">
                partners@ezlegal.ai
              </a>
            </p>
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

## src/pages/PartnerHub.tsx (924 lines)

```tsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Users, Globe, Shield, ArrowRight, CheckCircle, Zap, BookOpen, Headphones as HeadphonesIcon, TrendingUp, ChevronRight, ExternalLink, Handshake, DollarSign, Lock, FileText, Heart, Megaphone, QrCode, LineChart, UserCheck, Code, ChevronDown, Star } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const PARTNER_MODELS = [
  {
    id: 'referral',
    icon: Megaphone,
    color: 'teal',
    startingAt: { en: 'Free to join', es: 'Gratis para unirse' },
    en: {
      name: 'Referral Partner',
      tagline: 'Share. Refer. Earn.',
      description: 'Share ezLegal with your community using your custom link, QR codes, and branded materials. You earn revenue share on every referred user who becomes a paid subscriber.',
      idealFor: 'Nonprofits, churches, community organizations, legal clinics, ESL programs',
      economics: [
        '20% revenue share on referred paid conversions',
        'No minimum volume requirements',
        'Monthly payouts via direct deposit',
        'Real-time referral tracking dashboard',
      ],
      commitments: [
        'Share resources with your community',
        'Display QR codes and flyers in your space',
        'Report quarterly on community reach',
      ],
    },
    es: {
      name: 'Aliado de Referencia',
      tagline: 'Comparte. Refiere. Gana.',
      description: 'Comparte ezLegal con tu comunidad usando tu enlace personalizado, codigos QR y materiales de marca. Ganas comision por cada usuario referido que se convierte en suscriptor.',
      idealFor: 'ONGs, iglesias, organizaciones comunitarias, clinicas legales, programas de ESL',
      economics: [
        '20% de comision sobre conversiones de pago referidas',
        'Sin requisitos minimos de volumen',
        'Pagos mensuales por deposito directo',
        'Panel de seguimiento de referidos en tiempo real',
      ],
      commitments: [
        'Compartir recursos con tu comunidad',
        'Colocar codigos QR y volantes en tu espacio',
        'Reportar trimestralmente sobre alcance comunitario',
      ],
    },
  },
  {
    id: 'sponsored',
    icon: Heart,
    color: 'green',
    highlight: true,
    startingAt: { en: 'From $2/member/mo', es: 'Desde $2/miembro/mes' },
    en: {
      name: 'Community Access Partner',
      tagline: 'Sponsor access for your members.',
      description: 'Pay a per-member or flat monthly fee so your community, clients, or constituents can access ezLegal for free on a branded portal with your logo and reporting.',
      idealFor: 'Government agencies, counties, large nonprofits with grant funding, bar associations, United Way chapters',
      economics: [
        'Per-member pricing starting at $2/member/month',
        'Flat-fee options for organizations under 500 members',
        'Volume discounts for 1,000+ members',
        'Grant-compatible invoicing and reporting',
      ],
      commitments: [
        'Define and verify your community/member base',
        'Co-brand deployment with your logo and colors',
        'Participate in quarterly impact review',
        'Minimum 6-month engagement',
      ],
    },
    es: {
      name: 'Aliado de Acceso Comunitario',
      tagline: 'Patrocina acceso para tus miembros.',
      description: 'Paga por miembro o tarifa mensual fija para que tu comunidad, clientes o constituyentes accedan a ezLegal gratis en un portal con tu marca y reportes.',
      idealFor: 'Agencias gubernamentales, condados, grandes ONGs con financiamiento, colegios de abogados, capitulos de United Way',
      economics: [
        'Precio por miembro desde $2/miembro/mes',
        'Opciones de tarifa fija para organizaciones con menos de 500 miembros',
        'Descuentos por volumen para 1,000+ miembros',
        'Facturacion y reportes compatibles con subvenciones',
      ],
      commitments: [
        'Definir y verificar tu base comunitaria/miembros',
        'Co-brandar el despliegue con tu logo y colores',
        'Participar en revision de impacto trimestral',
        'Compromiso minimo de 6 meses',
      ],
    },
  },
  {
    id: 'whitelabel',
    icon: Building2,
    color: 'navy',
    startingAt: { en: 'Custom pricing', es: 'Precio personalizado' },
    en: {
      name: 'White-Label Partner',
      tagline: 'Your brand. Our AI. Their trust.',
      description: 'Deploy the full ezLegal platform under your own brand with a custom domain, dedicated infrastructure, and tailored AI configuration. No ezLegal branding visible to your end users.',
      idealFor: 'Legal aid networks, state bar associations, large law firms, enterprise legal departments, technology integrators',
      economics: [
        'Platform licensing fee (annual contract)',
        'Usage-based tiers with predictable billing',
        'Custom SLA with uptime guarantees',
        'Pricing structured for enterprise procurement',
      ],
      commitments: [
        'Dedicated integration and brand alignment',
        'Minimum 12-month contract',
        'Designated partner success contact',
        'Quarterly business reviews',
      ],
    },
    es: {
      name: 'Aliado de Marca Blanca',
      tagline: 'Tu marca. Nuestra IA. Su confianza.',
      description: 'Despliega la plataforma completa de ezLegal bajo tu propia marca con dominio personalizado, infraestructura dedicada y configuracion de IA adaptada.',
      idealFor: 'Redes de ayuda legal, colegios de abogados estatales, grandes firmas de abogados, departamentos legales empresariales, integradores de tecnologia',
      economics: [
        'Licencia de plataforma (contrato anual)',
        'Niveles basados en uso con facturacion predecible',
        'SLA personalizado con garantias de disponibilidad',
        'Precios estructurados para adquisiciones empresariales',
      ],
      commitments: [
        'Integracion dedicada y alineacion de marca',
        'Contrato minimo de 12 meses',
        'Contacto designado para exito del aliado',
        'Revisiones de negocio trimestrales',
      ],
    },
  },
];

const PARTNER_BENEFITS = [
  {
    icon: LineChart,
    en: { title: 'Partner Dashboard', desc: 'Real-time analytics on referrals, usage, conversions, and community impact -- all in one place.' },
    es: { title: 'Panel de Aliado', desc: 'Analitica en tiempo real sobre referidos, uso, conversiones e impacto comunitario -- todo en un solo lugar.' },
  },
  {
    icon: Globe,
    en: { title: 'Bilingual by Default', desc: 'All partner materials, flyers, social posts, and the platform itself are available in English and Spanish.' },
    es: { title: 'Bilingue por Defecto', desc: 'Todos los materiales, volantes, posts sociales y la plataforma estan disponibles en ingles y espanol.' },
  },
  {
    icon: QrCode,
    en: { title: 'Branded Materials', desc: 'Custom QR codes, printable flyers, social media templates, and co-branded collateral -- ready to distribute.' },
    es: { title: 'Materiales de Marca', desc: 'Codigos QR personalizados, volantes impresos, plantillas para redes sociales y material co-branded -- listos para distribuir.' },
  },
  {
    icon: UserCheck,
    en: { title: 'Dedicated Partner Success', desc: 'Every partner gets a named success manager for onboarding, troubleshooting, and quarterly reviews.' },
    es: { title: 'Exito de Aliado Dedicado', desc: 'Cada aliado tiene un gerente de exito asignado para incorporacion, resolucion de problemas y revisiones trimestrales.' },
  },
  {
    icon: FileText,
    en: { title: 'Impact Reporting', desc: 'Monthly reports on users served, questions answered, topics covered, and community demographics.' },
    es: { title: 'Reportes de Impacto', desc: 'Reportes mensuales sobre usuarios atendidos, preguntas respondidas, temas cubiertos y demografia comunitaria.' },
  },
  {
    icon: Shield,
    en: { title: 'Compliance & Security', desc: 'SOC 2-aligned security, clear UPL disclaimers, data privacy controls, and audit-ready documentation.' },
    es: { title: 'Cumplimiento y Seguridad', desc: 'Seguridad alineada con SOC 2, avisos claros de UPL, controles de privacidad de datos y documentacion lista para auditoria.' },
  },
];

const PIPELINE_STEPS = [
  { en: 'Apply', es: 'Solicitar', icon: BookOpen },
  { en: 'Discovery Call', es: 'Llamada Inicial', icon: HeadphonesIcon },
  { en: 'Pilot (30 days)', es: 'Piloto (30 dias)', icon: Zap },
  { en: 'Onboarding', es: 'Incorporacion', icon: Star },
  { en: 'Go Live', es: 'En Vivo', icon: TrendingUp },
];

function getModelColors(color: string) {
  const map: Record<string, { bg: string; border: string; accent: string; icon: string }> = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'text-teal-700', icon: 'text-teal-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', accent: 'text-green-700', icon: 'text-green-600' },
    navy: { bg: 'bg-navy-50', border: 'border-navy-200', accent: 'text-navy-700', icon: 'text-navy-600' },
  };
  return map[color] || map.teal;
}

export default function PartnerHub() {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const { user } = useAuth();
  const es = language === 'es';
  const [searchParams] = useSearchParams();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    organization_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    partner_model: '',
    partner_type: 'nonprofit',
    community_size: '',
    language_preference: language,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, notes: `Referral: ${ref}` }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('partners').insert({
        organization_name: formData.organization_name,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || null,
        website: formData.website || null,
        partner_type: formData.partner_type,
        language_preference: formData.language_preference,
        notes: [
          formData.partner_model ? `Model: ${formData.partner_model}` : '',
          formData.community_size ? `Community Size: ${formData.community_size}` : '',
          formData.notes,
        ].filter(Boolean).join(' | '),
        pipeline_stage: 'lead',
        source: searchParams.get('utm_source') || 'partner_hub',
        metadata: {
          utm_campaign: searchParams.get('utm_campaign'),
          utm_medium: searchParams.get('utm_medium'),
          referral_code: searchParams.get('ref'),
          selected_model: formData.partner_model,
          community_size: formData.community_size,
        },
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">

        <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-6">
                <Handshake className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-teal-300">
                  {es ? 'Programa de Alianzas' : 'Partner Program'}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {es
                  ? 'Lleva Acceso Legal a Tu Comunidad'
                  : 'Bring Legal Access to Your Community'}
              </h1>
              <p className="text-lg text-navy-200 mb-4 leading-relaxed">
                {es
                  ? 'Ya seas una ONG compartiendo recursos, un gobierno patrocinando acceso, o una empresa desplegando nuestra IA bajo tu marca -- hay un modelo de alianza para ti.'
                  : "Whether you're a nonprofit sharing resources, a government sponsoring access, or an enterprise deploying our AI under your brand -- there's a partnership model for you."}
              </p>
              <p className="text-sm text-navy-400 mb-8">
                {es
                  ? 'Buscas comprar ezLegal directamente para tu organizacion?'
                  : 'Looking to buy ezLegal directly for your organization?'}
                {' '}
                <Link to="/pricing" className="text-teal-400 hover:text-teal-300 underline">
                  {es ? 'Ver Planes y Precios' : 'See Plans & Pricing'}
                </Link>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                    >
                      {es ? 'Acceder al Portal de Aliados' : 'Access Partner Portal'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="#apply"
                      className="inline-flex items-center gap-2 px-8 py-3.5 border border-navy-500 text-white rounded-xl font-semibold hover:bg-navy-700 transition-all"
                    >
                      {es ? 'Solicitar Nuevo Modelo' : 'Apply for a New Model'}
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="#apply"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                    >
                      {es ? 'Solicitar Alianza' : 'Apply to Partner'}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <Link
                      to="/schedule-demo"
                      className="inline-flex items-center gap-2 px-8 py-3.5 border border-navy-500 text-white rounded-xl font-semibold hover:bg-navy-700 transition-all"
                    >
                      {es ? 'Agendar Llamada' : 'Schedule a Discovery Call'}
                    </Link>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 border-t border-navy-700/50 pt-8">
                {[
                  { value: '50', en: 'U.S. States', es: 'Estados' },
                  { value: '24/7', en: 'AI Availability', es: 'Disponibilidad IA' },
                  { value: '99.9%', en: 'Target Uptime', es: 'Meta de Disponibilidad' },
                  { value: '2', en: 'Languages', es: 'Idiomas' },
                ].map(stat => (
                  <div key={stat.en} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-navy-400 mt-1">{es ? stat.es : stat.en}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-navy-50 border border-navy-200 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-sm mb-1">
                    {es ? 'Quieres ofrecer ezLegal a tu comunidad?' : 'Want to offer ezLegal to your community?'}
                  </h3>
                  <p className="text-xs text-navy-600 mb-2">
                    {es
                      ? 'Estas en el lugar correcto. Explora nuestros modelos de alianza abajo.'
                      : "You're in the right place. Explore our partnership models below."}
                  </p>
                  <a href="#models" className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                    {es ? 'Ver modelos' : 'See models'} <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="bg-navy-50 border border-navy-200 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-navy-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-navy-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-sm mb-1">
                    {es ? 'Comprando para uso interno de tu organizacion?' : "Buying for your organization's internal use?"}
                  </h3>
                  <p className="text-xs text-navy-600 mb-2">
                    {es
                      ? 'Consulta nuestros planes directos de suscripcion para organizaciones en la pagina de precios.'
                      : 'Check our direct subscription plans for organizations on the pricing page.'}
                  </p>
                  <Link to="/pricing?tab=organizations" className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                    {es ? 'Ver precios' : 'View pricing'} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="models" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Como Quieres Trabajar con Nosotros?' : 'How Do You Want to Work With Us?'}
              </h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                {es
                  ? 'Elige el modelo que se ajuste a tu organizacion. Cada uno tiene su propia estructura economica, compromisos y herramientas.'
                  : 'Choose the model that fits your organization. Each has its own economics, commitments, and enablement tools.'}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {PARTNER_MODELS.map(model => {
                const m = es ? model.es : model.en;
                const colors = getModelColors(model.color);
                const Icon = model.icon;
                return (
                  <div
                    key={model.id}
                    className={`relative rounded-2xl border-2 ${
                      model.highlight ? 'border-green-400 shadow-xl shadow-green-100' : colors.border
                    } bg-white overflow-hidden flex flex-col`}
                  >
                    {model.highlight && (
                      <div className="bg-green-600 text-white text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                        {es ? 'Mas Solicitado' : 'Most Requested'}
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-navy-900">{m.name}</h3>
                          <p className={`text-sm ${colors.accent} font-medium`}>{m.tagline}</p>
                        </div>
                      </div>
                      <div className={`${colors.bg} rounded-lg px-3 py-2 mb-4`}>
                        <span className={`text-lg font-bold ${colors.accent}`}>
                          {es ? model.startingAt.es : model.startingAt.en}
                        </span>
                      </div>

                      <p className="text-sm text-navy-600 mb-4 leading-relaxed">{m.description}</p>

                      <div className="mb-4">
                        <span className={`text-xs font-bold uppercase tracking-wider ${colors.accent}`}>
                          {es ? 'Ideal para' : 'Ideal for'}
                        </span>
                        <p className="text-xs text-navy-500 mt-1">{m.idealFor}</p>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <DollarSign className={`w-3.5 h-3.5 ${colors.icon}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${colors.accent}`}>
                            {es ? 'Economia' : 'Economics'}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {m.economics.map(item => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle className={`w-3.5 h-3.5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                              <span className="text-xs text-navy-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Handshake className={`w-3.5 h-3.5 ${colors.icon}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${colors.accent}`}>
                            {es ? 'Tu Compromiso' : 'Your Commitment'}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {m.commitments.map(item => (
                            <li key={item} className="flex items-start gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-navy-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <a
                        href="#apply"
                        className={`mt-auto block text-center py-3 rounded-xl font-semibold transition-all text-sm ${
                          model.highlight
                            ? 'bg-green-600 text-white hover:bg-green-500'
                            : 'bg-navy-900 text-white hover:bg-navy-800'
                        }`}
                      >
                        {es ? `Solicitar: ${m.name}` : `Apply: ${m.name}`}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-navy-500">
                {es
                  ? 'No sabes cual modelo es el adecuado?'
                  : "Not sure which model is right?"}
                {' '}
                <Link to="/schedule-demo" className="text-teal-600 hover:text-teal-700 font-semibold underline">
                  {es ? 'Habla con nuestro equipo' : 'Talk to our team'}
                </Link>
                {' '}
                {es ? '-- te ayudamos a elegir.' : "-- we'll help you decide."}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Lo Que Recibe Cada Aliado' : 'What Every Partner Gets'}
              </h2>
              <p className="text-navy-600 max-w-xl mx-auto">
                {es
                  ? 'Sin importar el modelo que elijas, todos los aliados reciben estas herramientas y soporte.'
                  : 'Regardless of which model you choose, every partner receives these tools and support.'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PARTNER_BENEFITS.map(benefit => {
                const b = es ? benefit.es : benefit.en;
                const Icon = benefit.icon;
                return (
                  <div key={b.title} className="bg-white rounded-xl p-6 border border-navy-100 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="font-bold text-navy-900 mb-1">{b.title}</h3>
                    <p className="text-sm text-navy-600 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Pruebas y Seguridad' : 'Proof & Risk Controls'}
              </h2>
              <p className="text-navy-600 max-w-xl mx-auto">
                {es
                  ? 'Sabemos que las alianzas en tecnologia legal requieren confianza. Esto es lo que puedes compartir con tu equipo legal y de adquisiciones.'
                  : 'We know LegalTech partnerships require trust. Here is what you can share with your legal and procurement teams.'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-navy-50 rounded-xl p-6 border border-navy-100">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-navy-700" />
                  <h3 className="font-bold text-navy-900">{es ? 'Seguridad de Datos' : 'Data Security'}</h3>
                </div>
                <ul className="space-y-2 text-sm text-navy-600">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Cifrado AES-256 en reposo y en transito' : 'AES-256 encryption at rest and in transit'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Controles de acceso alineados con SOC 2' : 'SOC 2-aligned access controls'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Politicas de retencion de datos configurables' : 'Configurable data retention policies'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'DPA disponible para aliados empresariales' : 'DPA available for enterprise partners'}</li>
                </ul>
              </div>
              <div className="bg-navy-50 rounded-xl p-6 border border-navy-100">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-navy-700" />
                  <h3 className="font-bold text-navy-900">{es ? 'Limites de la IA y UPL' : 'AI Boundaries & UPL'}</h3>
                </div>
                <ul className="space-y-2 text-sm text-navy-600">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Avisos claros: informacion legal, no asesoria legal' : 'Clear disclaimers: legal information, not legal advice'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Nunca se implica relacion abogado-cliente' : 'No attorney-client relationship implied'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Escalamiento a abogados reales integrado' : 'Escalation to real attorneys built in'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Registros de auditoria para cumplimiento y gobernanza' : 'Audit logs for compliance and governance'}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">
              {es ? 'Como Funciona' : 'How It Works'}
            </h2>
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              {PIPELINE_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.en} className="flex-1 flex flex-col items-center text-center relative">
                    <div className="w-14 h-14 bg-teal-50 border-2 border-teal-200 rounded-full flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
                      {es ? `Paso ${index + 1}` : `Step ${index + 1}`}
                    </div>
                    <p className="font-semibold text-navy-900 text-sm">{es ? step.es : step.en}</p>
                    {index < PIPELINE_STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed border-navy-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Preguntas Frecuentes de Aliados' : 'Partner Program FAQ'}
              </h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  en: { q: 'How do partners make money?', a: 'Referral Partners earn 20% revenue share on every paid subscriber they refer. Community Access Partners negotiate per-member or flat-fee pricing funded by grants or organizational budgets. White-Label Partners license the platform at an annual contract rate with usage-based tiers.' },
                  es: { q: 'Como ganan dinero los aliados?', a: 'Los Aliados de Referencia ganan 20% de comision por cada suscriptor pagado que refieren. Los Aliados de Acceso Comunitario negocian precios por miembro o tarifa fija financiados por subvenciones o presupuestos organizacionales. Los Aliados de Marca Blanca licencian la plataforma con contrato anual y niveles basados en uso.' },
                },
                {
                  en: { q: 'What are the eligibility requirements?', a: 'We partner with nonprofits, legal aid organizations, government agencies, bar associations, community organizations, churches, and enterprises. You need a defined community or member base and a willingness to participate in quarterly impact reviews. There are no minimum size requirements for Referral Partners.' },
                  es: { q: 'Cuales son los requisitos de elegibilidad?', a: 'Nos asociamos con ONGs, organizaciones de ayuda legal, agencias gubernamentales, colegios de abogados, organizaciones comunitarias, iglesias y empresas. Necesitas una base comunitaria o de miembros definida y disposicion a participar en revisiones de impacto trimestrales. No hay requisitos minimos de tamano para Aliados de Referencia.' },
                },
                {
                  en: { q: 'How long does the onboarding process take?', a: 'Referral Partners can be active within 48 hours after approval. Community Access Partners typically launch within 2-4 weeks depending on co-branding requirements. White-Label deployments take 4-8 weeks for full brand alignment and infrastructure setup.' },
                  es: { q: 'Cuanto tiempo toma el proceso de incorporacion?', a: 'Los Aliados de Referencia pueden estar activos dentro de 48 horas despues de la aprobacion. Los Aliados de Acceso Comunitario generalmente lanzan en 2-4 semanas dependiendo de los requisitos de co-branding. Las implementaciones de Marca Blanca toman 4-8 semanas para la alineacion completa de marca e infraestructura.' },
                },
                {
                  en: { q: 'Is there a cost to become a partner?', a: 'Referral Partners pay nothing -- you earn from referrals. Community Access Partners pay per-member pricing (starting at $2/member/month) or negotiate flat-fee options. White-Label Partners pay annual platform licensing. All models include partner success support at no extra cost.' },
                  es: { q: 'Hay algun costo para convertirse en aliado?', a: 'Los Aliados de Referencia no pagan nada -- ganan por referidos. Los Aliados de Acceso Comunitario pagan precio por miembro (desde $2/miembro/mes) o negocian opciones de tarifa fija. Los Aliados de Marca Blanca pagan licencia anual de plataforma. Todos los modelos incluyen soporte de exito de aliado sin costo adicional.' },
                },
                {
                  en: { q: 'Can I use grant funding to pay for a partnership?', a: 'Yes. Our Community Access and White-Label models are structured for grant-compatible invoicing. We provide impact reporting, demographic tracking, and funder-ready documentation to support your grant requirements.' },
                  es: { q: 'Puedo usar fondos de subvenciones para pagar una alianza?', a: 'Si. Nuestros modelos de Acceso Comunitario y Marca Blanca estan estructurados para facturacion compatible con subvenciones. Proporcionamos informes de impacto, seguimiento demografico y documentacion lista para financiadores para apoyar tus requisitos de subvencion.' },
                },
                {
                  en: { q: 'What if I need technical integration (API, widgets)?', a: 'Visit our Technical Integration page for details on embed widgets, API access, and white-label deployment options with full pricing and comparison tables.' },
                  es: { q: 'Que pasa si necesito integracion tecnica (API, widgets)?', a: 'Visita nuestra pagina de Integracion Tecnica para detalles sobre widgets embebidos, acceso a API y opciones de implementacion de marca blanca con precios y tablas comparativas completas.' },
                },
              ].map((faq, idx) => {
                const f = es ? faq.es : faq.en;
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-navy-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-navy-50 transition-colors"
                    >
                      <span className="font-semibold text-navy-900 pr-4">{f.q}</span>
                      <ChevronDown className={`w-5 h-5 text-navy-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <p className="text-sm text-navy-600 leading-relaxed">{f.a}</p>
                        {idx === 5 && (
                          <Link to="/for-partners" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-semibold mt-2">
                            {es ? 'Ver Integracion Tecnica' : 'View Technical Integration'} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 bg-navy-50 border-y border-navy-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-navy-200 p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Code className="w-8 h-8 text-teal-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-navy-900 mb-2">
                  {es ? 'Necesitas Integracion Tecnica?' : 'Need Technical Integration?'}
                </h3>
                <p className="text-sm text-navy-600 mb-1">
                  {es
                    ? 'Para equipos de desarrollo que quieren integrar via API, incrustar widgets, o desplegar una solucion de marca blanca completa.'
                    : 'For development teams looking to integrate via API, embed widgets, or deploy a full white-label solution.'}
                </p>
                <p className="text-xs text-navy-500">
                  {es
                    ? 'Widget desde $79/mes -- API a $0.02/consulta -- Marca Blanca a precio personalizado'
                    : 'Widget from $79/mo -- API at $0.02/query -- White-Label custom pricing'}
                </p>
              </div>
              <Link
                to="/for-partners"
                className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-800 transition-all flex-shrink-0"
              >
                {es ? 'Ver Opciones Tecnicas' : 'View Technical Options'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="apply" className="py-16 bg-navy-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Solicitar Alianza' : 'Apply to Partner'}
              </h2>
              <p className="text-navy-600">
                {es
                  ? 'Completa el formulario y nuestro equipo se pondra en contacto dentro de 2 dias habiles.'
                  : "Fill out the form below and our team will be in touch within 2 business days."}
              </p>
            </div>

            {submitted ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-navy-200 shadow-sm">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy-900 mb-2">
                  {es ? 'Solicitud Recibida' : 'Application Received'}
                </h3>
                <p className="text-navy-600 mb-6">
                  {es
                    ? 'Gracias por su interes. Nuestro equipo de alianzas revisara su solicitud y se pondra en contacto dentro de 2 dias habiles.'
                    : "Thank you for your interest. Our partnerships team will review your application and reach out within 2 business days."}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/media-kit" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold">
                    {es ? 'Ver Kit de Medios' : 'View Media Kit'} <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link to="/schedule-demo" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold">
                    {es ? 'Agendar Llamada' : 'Schedule a Call'} <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-navy-200 shadow-sm space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Nombre de la Organizacion' : 'Organization Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organization_name}
                      onChange={e => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Nombre de Contacto' : 'Contact Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={e => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Correo Electronico' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contact_email}
                      onChange={e => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Telefono' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={e => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Tipo de Organizacion' : 'Organization Type'} *
                    </label>
                    <select
                      required
                      value={formData.partner_type}
                      onChange={e => setFormData(prev => ({ ...prev, partner_type: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="nonprofit">{es ? 'ONG / Sin Fines de Lucro' : 'Nonprofit / NGO'}</option>
                      <option value="legal_aid">{es ? 'Organizacion de Ayuda Legal' : 'Legal Aid Organization'}</option>
                      <option value="government">{es ? 'Agencia Gubernamental / Condado' : 'Government Agency / County'}</option>
                      <option value="bar_association">{es ? 'Colegio de Abogados' : 'Bar Association'}</option>
                      <option value="enterprise">{es ? 'Empresa / Firma Legal' : 'Enterprise / Law Firm'}</option>
                      <option value="community_org">{es ? 'Organizacion Comunitaria / Iglesia' : 'Community Organization / Church'}</option>
                      <option value="other">{es ? 'Otro' : 'Other'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Modelo de Interes' : 'Partnership Model of Interest'}
                    </label>
                    <select
                      value={formData.partner_model}
                      onChange={e => setFormData(prev => ({ ...prev, partner_model: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="">{es ? 'No estoy seguro / Ayudame a decidir' : "Not sure / Help me decide"}</option>
                      <option value="referral">{es ? 'Aliado de Referencia (ganar por referidos)' : 'Referral Partner (earn on referrals)'}</option>
                      <option value="sponsored">{es ? 'Acceso Comunitario (patrocinar acceso)' : 'Community Access (sponsor access)'}</option>
                      <option value="whitelabel">{es ? 'Marca Blanca (desplegar bajo tu marca)' : 'White-Label (deploy under your brand)'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Tamano de Comunidad' : 'Community / Member Size'}
                    </label>
                    <select
                      value={formData.community_size}
                      onChange={e => setFormData(prev => ({ ...prev, community_size: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="">{es ? 'Seleccionar' : 'Select'}</option>
                      <option value="under-100">{es ? 'Menos de 100' : 'Under 100'}</option>
                      <option value="100-500">100 - 500</option>
                      <option value="500-1000">500 - 1,000</option>
                      <option value="1000-5000">1,000 - 5,000</option>
                      <option value="5000+">5,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Sitio Web' : 'Website'}
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1">
                    {es ? 'Notas Adicionales' : 'Additional Notes'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    placeholder={es
                      ? 'Cuentanos sobre tu comunidad y como planeas usar ezLegal...'
                      : 'Tell us about your community and how you plan to use ezLegal...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      {es ? 'Enviar Solicitud' : 'Submit Application'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-xs text-navy-400 text-center">
                  {es
                    ? 'Al enviar, acepta nuestros terminos de servicio. ezLegal.ai proporciona informacion legal, no asesoria legal.'
                    : 'By submitting, you agree to our terms of service. ezLegal.ai provides legal information, not legal advice.'}
                </p>
              </form>
            )}
          </div>
        </section>

        <section className="bg-navy-900 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {es ? 'Preguntas? Habla con Nuestro Equipo' : 'Questions? Talk to Our Team'}
            </h2>
            <p className="text-navy-300 mb-2">
              {es ? 'Escribenos a' : 'Email us at'}{' '}
              <a href="mailto:partners@ezlegal.ai" className="text-teal-400 hover:text-teal-300 font-semibold">
                partners@ezlegal.ai
              </a>
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
              <Link to="/schedule-demo" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Agendar Demo' : 'Schedule a Demo'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link to="/media-kit" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Kit de Medios' : 'Media Kit'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link to="/for-partners" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Integracion Tecnica' : 'Technical Integration'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link to="/contact" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Contactar Ventas' : 'Contact Sales'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

```

---

# Part 2: Key Supporting Files

## src/lib/text-utils.ts (7 lines)

```typescript
/**
 * Strips Unicode diacritical marks for accent-insensitive matching.
 */
export function normalizeForCrisis(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

```

---

## src/components/cognitive-load/index.ts (7 lines)

```typescript
export { default as UnifiedTrustStrip } from './UnifiedTrustStrip';
export { default as TabbedResponse } from './TabbedResponse';
export { default as MoreHelpDrawer } from './MoreHelpDrawer';
export { default as CollapsibleSidebar } from './CollapsibleSidebar';
export { default as ContextualCrisisAlert, detectCrisisSignal } from './ContextualCrisisAlert';
export type { CrisisSignal } from './ContextualCrisisAlert';

```

---

## src/components/cognitive-load/ContextualCrisisAlert.tsx (248 lines)

```tsx
import { useState, useEffect, useCallback } from 'react';
import { Phone, Heart, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export type CrisisSignal = 'self_harm' | 'domestic_violence' | 'homelessness' | 'emergency';

interface CrisisConfig {
  title: string;
  titleEs: string;
  message: string;
  messageEs: string;
  primaryAction: {
    label: string;
    labelEs: string;
    phone?: string;
    href?: string;
  };
  color: string;
  bgColor: string;
}

const CRISIS_CONFIGS: Record<CrisisSignal, CrisisConfig> = {
  self_harm: {
    title: 'You Are Not Alone',
    titleEs: 'No Estas Solo/a',
    message: 'Free, confidential support is available 24/7.',
    messageEs: 'Apoyo gratuito y confidencial disponible 24/7.',
    primaryAction: {
      label: 'Call 988 Now',
      labelEs: 'Llamar 988 Ahora',
      phone: '988',
    },
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
  domestic_violence: {
    title: 'Safety Resources Available',
    titleEs: 'Recursos de Seguridad Disponibles',
    message: 'Trained advocates are ready to help 24/7.',
    messageEs: 'Defensores capacitados estan listos para ayudar 24/7.',
    primaryAction: {
      label: 'National DV Hotline',
      labelEs: 'Linea Nacional de VD',
      phone: '1-800-799-7233',
    },
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
  homelessness: {
    title: 'Housing Help Available',
    titleEs: 'Ayuda de Vivienda Disponible',
    message: 'Connect with housing resources and emergency shelter.',
    messageEs: 'Conectese con recursos de vivienda y refugio de emergencia.',
    primaryAction: {
      label: 'Find Local Help',
      labelEs: 'Encontrar Ayuda Local',
      href: '/emergency-resources',
    },
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  emergency: {
    title: 'Need Immediate Help?',
    titleEs: 'Necesita Ayuda Inmediata?',
    message: 'Crisis resources are available.',
    messageEs: 'Hay recursos de crisis disponibles.',
    primaryAction: {
      label: 'View Resources',
      labelEs: 'Ver Recursos',
      href: '/emergency-resources',
    },
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
};

const CRISIS_KEYWORDS: Record<CrisisSignal, string[]> = {
  self_harm: [
    'kill myself',
    'end my life',
    'suicide',
    'want to die',
    'hurt myself',
    'self harm',
    'no reason to live',
    'better off dead',
  ],
  domestic_violence: [
    'domestic violence',
    'abusive relationship',
    'partner abuse',
    'hit me',
    'hurting me',
    'restraining order',
    'protective order',
    'scared of',
    'abuser',
  ],
  homelessness: [
    'homeless',
    'evicted',
    'kicked out',
    'nowhere to go',
    'living in car',
    'on the street',
    'about to lose my home',
    'eviction notice',
  ],
  emergency: [],
};

interface ContextualCrisisAlertProps {
  messages: Array<{ content: string; role: 'user' | 'assistant' }>;
  forceShow?: CrisisSignal;
  onDismiss?: () => void;
  className?: string;
}

export function detectCrisisSignal(text: string): CrisisSignal | null {
  const lowerText = text.toLowerCase();

  for (const [signal, keywords] of Object.entries(CRISIS_KEYWORDS) as [CrisisSignal, string[]][]) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      return signal;
    }
  }

  return null;
}

export default function ContextualCrisisAlert({
  messages,
  forceShow,
  onDismiss,
  className = '',
}: ContextualCrisisAlertProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [dismissed, setDismissed] = useState(false);
  const [detectedSignal, setDetectedSignal] = useState<CrisisSignal | null>(null);

  useEffect(() => {
    if (forceShow) {
      setDetectedSignal(forceShow);
      setDismissed(false);
      return;
    }

    const userMessages = messages.filter((m) => m.role === 'user');
    for (const msg of userMessages.slice(-3)) {
      const signal = detectCrisisSignal(msg.content);
      if (signal) {
        setDetectedSignal(signal);
        setDismissed(false);
        return;
      }
    }
  }, [messages, forceShow]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (!detectedSignal || dismissed) {
    return null;
  }

  const config = CRISIS_CONFIGS[detectedSignal];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`${config.bgColor} border-2 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          detectedSignal === 'self_harm' || detectedSignal === 'domestic_violence'
            ? 'bg-rose-100'
            : detectedSignal === 'homelessness'
            ? 'bg-amber-100'
            : 'bg-red-100'
        }`}>
          {detectedSignal === 'self_harm' || detectedSignal === 'domestic_violence' ? (
            <Heart className={`w-5 h-5 ${config.color}`} aria-hidden="true" />
          ) : (
            <AlertTriangle className={`w-5 h-5 ${config.color}`} aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${config.color}`}>
            {en ? config.title : config.titleEs}
          </h4>
          <p className="text-sm text-slate-600 mt-0.5">
            {en ? config.message : config.messageEs}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {config.primaryAction.phone ? (
              <a
                href={`tel:${config.primaryAction.phone}`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                  detectedSignal === 'self_harm' || detectedSignal === 'domestic_violence'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {en ? config.primaryAction.label : config.primaryAction.labelEs}
              </a>
            ) : config.primaryAction.href ? (
              <Link
                to={config.primaryAction.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                  detectedSignal === 'emergency'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {en ? config.primaryAction.label : config.primaryAction.labelEs}
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </Link>
            ) : null}

            <Link
              to="/emergency-resources"
              className="text-sm text-slate-600 hover:text-slate-800 underline"
            >
              {en ? 'All crisis resources' : 'Todos los recursos de crisis'}
            </Link>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1.5 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
          aria-label={en ? 'Dismiss alert' : 'Cerrar alerta'}
        >
          <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

```

---

## src/services/entitlement-service.ts (64 lines)

```typescript
import { supabase } from '../lib/supabase';

export interface Entitlement {
  id: string;
  user_id: string;
  product_type: 'issue_pack' | 'subscription' | 'case_prediction' | 'negotiation_pack';
  product_id: string;
  status: 'active' | 'pending' | 'expired' | 'refunded' | 'payment_failed';
  payment_provider: 'stripe' | 'manual' | 'trial' | 'free';
  payment_reference: string | null;
  granted_at: string;
  expires_at: string | null;
}

export async function getUserEntitlements(userId: string): Promise<Entitlement[]> {
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'pending', 'expired', 'payment_failed', 'refunded'])
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function hasActiveEntitlement(
  userId: string,
  productType: string,
  productId?: string
): Promise<boolean> {
  let query = supabase
    .from('user_entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('product_type', productType)
    .eq('status', 'active');

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data } = await query.limit(1).maybeSingle();
  return !!data;
}

export function getEntitlementStatusLabel(status: Entitlement['status']): {
  label: string;
  color: string;
} {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'text-green-700 bg-green-50 border-green-200' };
    case 'pending':
      return { label: 'Processing', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'expired':
      return { label: 'Expired', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    case 'refunded':
      return { label: 'Refunded', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    case 'payment_failed':
      return { label: 'Payment Failed', color: 'text-red-700 bg-red-50 border-red-200' };
  }
}

```

---

## src/services/chat-service.ts (809 lines)

```typescript
import type { Citation } from '../lib/legalbreeze-api';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface DocumentAttachment {
  type: 'image' | 'pdf_page';
  data: string;
  mimeType: string;
  filename?: string;
  pageNumber?: number;
}

interface ThinkingStep {
  type: 'analysis' | 'research' | 'consideration' | 'conclusion';
  content: string;
}

interface ThinkingDetails {
  legalArea: string;
  jurisdiction: string;
  keyIssues: string[];
  considerations: string[];
  relevantStatutes: string[];
  riskFactors: string[];
  confidenceLevel: 'high' | 'medium' | 'low' | 'needs_verification';
  thinkingSteps: ThinkingStep[];
  processingTimeMs?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  complianceScore?: number;
  modelUsed?: string;
  followUpQuestions?: string[];
  thinkingDetails?: ThinkingDetails;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface ChatServiceConfig {
  useRAGPipeline: boolean;
  useOpenAI: boolean;
  jurisdiction?: string;
  category?: string;
  subcategory?: string;
  includeCompliance?: boolean;
  modelOverride?: string;
  answerMode?: 'simple' | 'stepbystep' | 'legal_aid_prep' | 'draft' | 'spanish';
  maxTokens?: number;
  temperature?: number;
}

interface OpenAIChatRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  sessionId: string;
  userId?: string;
  jurisdiction?: string;
  category?: string;
  modelOverride?: string;
  answerMode?: 'simple' | 'stepbystep' | 'legal_aid_prep' | 'draft' | 'spanish';
  maxTokens?: number;
  temperature?: number;
  documentAttachments?: DocumentAttachment[];
}

interface OpenAIChatResponse {
  response: string;
  modelUsed: string;
  modelDisplayName: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  jurisdiction: string;
  responseTimeMs: number;
  error?: string;
}

const DEFAULT_CONFIG: ChatServiceConfig = {
  useRAGPipeline: false,
  useOpenAI: true,
  jurisdiction: 'Arizona',
  includeCompliance: true,
};

type FallbackType = 'network_fallback' | 'api_fallback';

function isLikelyNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /TypeError|fetch|network|failed to fetch|load failed|abort|ECONNRESET|ENOTFOUND|ETIMEDOUT/i.test(message);
}

export type AnswerBasis = ThinkingDetails;

function parseThinkingDetails(response: string): { content: string; thinking: ThinkingDetails | null } {
  const basisStart = '---ANSWER_BASIS---';
  const basisEnd = '---END_ANSWER_BASIS---';
  const legacyStart = '---THINKING_DETAILS---';
  const legacyEnd = '---END_THINKING_DETAILS---';

  let thinkingStartMarker = basisStart;
  let thinkingEndMarker = basisEnd;
  let startIdx = response.indexOf(basisStart);
  let endIdx = response.indexOf(basisEnd);

  if (startIdx === -1 || endIdx === -1) {
    thinkingStartMarker = legacyStart;
    thinkingEndMarker = legacyEnd;
    startIdx = response.indexOf(legacyStart);
    endIdx = response.indexOf(legacyEnd);
  }

  if (startIdx === -1 || endIdx === -1) {
    return { content: response, thinking: null };
  }

  const contentBefore = response.substring(0, startIdx).trim();
  const contentAfter = response.substring(endIdx + thinkingEndMarker.length).trim();
  const cleanContent = (contentBefore + '\n\n' + contentAfter).trim();

  const thinkingText = response.substring(startIdx + thinkingStartMarker.length, endIdx).trim();

  const thinking: ThinkingDetails = {
    legalArea: 'General Legal Information',
    jurisdiction: 'Arizona',
    keyIssues: [],
    considerations: [],
    relevantStatutes: [],
    riskFactors: [],
    confidenceLevel: 'medium',
    thinkingSteps: [],
  };

  const lines = thinkingText.split('\n').filter(l => l.trim());
  for (const line of lines) {
    if (line.startsWith('LEGAL_AREA:')) {
      thinking.legalArea = line.replace('LEGAL_AREA:', '').trim();
    } else if (line.startsWith('JURISDICTION:')) {
      thinking.jurisdiction = line.replace('JURISDICTION:', '').trim();
    } else if (line.startsWith('KEY_ISSUE:')) {
      thinking.keyIssues.push(line.replace('KEY_ISSUE:', '').trim());
    } else if (line.startsWith('CONSIDERATION:')) {
      thinking.considerations.push(line.replace('CONSIDERATION:', '').trim());
    } else if (line.startsWith('STATUTE:')) {
      thinking.relevantStatutes.push(line.replace('STATUTE:', '').trim());
    } else if (line.startsWith('RISK:')) {
      thinking.riskFactors.push(line.replace('RISK:', '').trim());
    } else if (line.startsWith('CONFIDENCE:')) {
      const level = line.replace('CONFIDENCE:', '').trim().toLowerCase();
      if (level === 'high' || level === 'medium' || level === 'low' || level === 'needs_verification') {
        thinking.confidenceLevel = level as ThinkingDetails['confidenceLevel'];
      }
    } else if (line.startsWith('STEP:')) {
      thinking.thinkingSteps.push({
        type: 'analysis',
        content: line.replace('STEP:', '').trim(),
      });
    }
  }

  return { content: cleanContent, thinking };
}

function parseFollowUpQuestions(response: string): { content: string; followUpQuestions: string[] } {
  const followUpMarkerStart = '---FOLLOW_UP_QUESTIONS---';
  const followUpMarkerEnd = '---END_FOLLOW_UP_QUESTIONS---';

  const startIndex = response.indexOf(followUpMarkerStart);
  const endIndex = response.indexOf(followUpMarkerEnd);

  if (startIndex === -1 || endIndex === -1) {
    return { content: response, followUpQuestions: [] };
  }

  const contentBeforeFollowUps = response.substring(0, startIndex).trim();
  const followUpSection = response.substring(startIndex + followUpMarkerStart.length, endIndex).trim();

  const questions = followUpSection
    .split('\n')
    .map(line => line.trim())
    .filter(line => /^\d+\./.test(line))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(q => q.length > 0);

  return { content: contentBeforeFollowUps, followUpQuestions: questions };
}

class ChatService {
  private config: ChatServiceConfig;
  private sessionId: string;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private userId: string | null = null;

  constructor(config: Partial<ChatServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = crypto.randomUUID();
  }

  setConfig(config: Partial<ChatServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  async sendMessage(
    query: string,
    documentContent?: string,
    documentAttachments?: DocumentAttachment[]
  ): Promise<ChatMessage> {
    let fullQuery = query;
    if (documentContent && documentContent.trim() && (!documentAttachments || documentAttachments.length === 0)) {
      fullQuery = `${query}\n\n--- ATTACHED DOCUMENT CONTENT ---\n${documentContent}\n--- END OF DOCUMENT ---`;
    }

    this.conversationHistory.push({ role: 'user', content: fullQuery });

    if (this.config.useOpenAI) {
      return this.sendToOpenAI(fullQuery, documentAttachments);
    }

    if (this.config.useRAGPipeline) {
      return this.sendToRAGPipeline(fullQuery);
    }

    return this.generateLocalResponse(fullQuery);
  }

  private async sendToOpenAI(
    _query: string,
    documentAttachments?: DocumentAttachment[]
  ): Promise<ChatMessage> {
    try {
      const messages = this.conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      const request: OpenAIChatRequest = {
        messages,
        sessionId: this.sessionId,
        userId: this.userId || undefined,
        jurisdiction: this.config.jurisdiction,
        category: this.config.category,
        modelOverride: this.config.modelOverride,
        answerMode: this.config.answerMode,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        documentAttachments,
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);

        let errorDetail = 'Unable to connect to AI service';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.includes('API key')) {
            errorDetail = 'AI service configuration error. Please contact support.';
          }
        } catch {
          // Use default error message
        }

        const errorContent = `**AI Service Temporarily Unavailable**\n\nWe're experiencing a temporary issue connecting to our AI service. Please try again in a moment.\n\nError: ${errorDetail}\n\nIn the meantime, you can:\n- Refresh the page and try again\n- Contact support if this persists\n- Browse our Legal Guides`;

        this.conversationHistory.push({ role: 'assistant', content: errorContent });
        return {
          role: 'assistant',
          content: errorContent,
          modelUsed: 'System Message',
        };
      }

      const data: OpenAIChatResponse = await response.json();

      if (data.error) {
        console.error('OpenAI response error:', data.error);

        const errorContent = `**AI Response Error**\n\nOur AI encountered an issue processing your request: ${data.error}\n\nPlease try rephrasing your question or contact support if this continues.`;

        this.conversationHistory.push({ role: 'assistant', content: errorContent });
        return {
          role: 'assistant',
          content: errorContent,
          modelUsed: 'System Message',
        };
      }

      if (!data.response) {
        console.error('OpenAI returned empty response');

        const errorContent = `**Empty Response**\n\nThe AI service returned an empty response. This may be due to:\n- The question being too complex\n- A temporary service issue\n\nPlease try rephrasing your question or breaking it into smaller parts.`;

        this.conversationHistory.push({ role: 'assistant', content: errorContent });
        return {
          role: 'assistant',
          content: errorContent,
          modelUsed: 'System Message',
        };
      }

      const { content: contentWithoutThinking, thinking } = parseThinkingDetails(data.response);
      const { content, followUpQuestions } = parseFollowUpQuestions(contentWithoutThinking);

      this.conversationHistory.push({ role: 'assistant', content });

      return {
        role: 'assistant',
        content,
        modelUsed: data.modelDisplayName,
        followUpQuestions,
        thinkingDetails: thinking || undefined,
        usage: data.usage,
      };
    } catch (error) {
      const fallbackType: FallbackType = isLikelyNetworkError(error)
        ? 'network_fallback'
        : 'api_fallback';

      console.error('OpenAI chat error; using local fallback', { fallbackType, error });
      this.conversationHistory.pop();

      try {
        const localResponse = await this.generateLocalResponse(_query);
        localResponse.modelUsed = `Local (${fallbackType})`;
        return localResponse;
      } catch (fallbackError) {
        console.error('Local fallback also failed', fallbackError);
        const content = 'I\'m having trouble reaching the AI service right now. Please try again shortly. This is general information only and not legal advice.';
        this.conversationHistory.push({ role: 'assistant', content });
        return { role: 'assistant', content, modelUsed: `Fallback (${fallbackType})` };
      }
    }
  }

  private async sendToRAGPipeline(query: string): Promise<ChatMessage> {
    try {
      const ragRequest = {
        query,
        sessionId: this.sessionId,
        tenantId: 'ezlegal',
        jurisdiction: this.config.jurisdiction || 'Arizona',
        category: this.config.category,
        subcategory: this.config.subcategory,
        includeCompliance: this.config.includeCompliance !== false,
        conversationHistory: this.conversationHistory.slice(-6).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/legalbreeze-rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'X-Tenant-ID': 'ezlegal',
        },
        body: JSON.stringify(ragRequest),
      });

      if (!response.ok) {
        throw new Error(`RAG API returned ${response.status}`);
      }

      const data = await response.json();
      let content = data.response;

      if (data.citations && data.citations.length > 0) {
        content += '\n\n---\n**Sources:**\n';
        data.citations.forEach((citation: Citation, index: number) => {
          content += `${index + 1}. ${citation.title}`;
          if (citation.jurisdiction) {
            content += ` (${citation.jurisdiction})`;
          }
          if (citation.url) {
            content += ` - [View](${citation.url})`;
          }
          content += '\n';
        });
      }

      if (data.complianceManifest) {
        const score = data.complianceManifest.enforcementScore;
        if (score < 70) {
          content += `\n\n*Note: This response has a compliance score of ${score}%. Please consult with a licensed attorney for verification.*`;
        }
      }

      this.conversationHistory.push({ role: 'assistant', content });

      return {
        role: 'assistant',
        content,
        citations: data.citations,
        complianceScore: data.complianceManifest?.enforcementScore,
        modelUsed: data.modelUsed || data.backendUsed || 'RAG Pipeline',
      };
    } catch (error) {
      console.error('RAG pipeline error:', error);
      return this.sendToOpenAI(query);
    }
  }

  private generateLocalResponse(query: string): ChatMessage {
    const lowerQuery = query.toLowerCase();

    const responses: Record<string, string> = {
      'prompt pay': `### Arizona Prompt Pay Act - A.R.S. § 23-351 et seq.

**Direct Answer**
The Arizona Prompt Pay Act requires employers to pay employees their earned wages on regularly scheduled paydays. Employees who are terminated must receive their final wages within specific timeframes, and employers who violate these requirements can face penalties.

**Legal Background**
Under Arizona Revised Statutes § 23-351 through § 23-361:

**Regular Pay Requirements:**
- Employers must pay wages at least twice per month on regular paydays designated in advance
- Wages must be paid within 16 days following the end of the pay period
- Wages can be paid by cash, check, direct deposit, or payroll card

**Final Pay Requirements (A.R.S. § 23-353):**
- **Termination by employer**: Wages due within 7 working days OR the next regular payday, whichever is sooner
- **Voluntary resignation**: Wages due by the next regular payday
- **Laid off employees**: Within 7 working days or next regular payday

**Potential Steps to Discuss with Counsel**
If you believe your employer violated the Prompt Pay Act:

1. **Document Everything**: Keep records of hours worked, pay stubs, pay dates, and any communications
2. **Send Written Demand**: Request unpaid wages in writing (keeps record and may trigger penalties)
3. **File a Wage Claim**: Contact the Industrial Commission of Arizona (ICA) to file a formal complaint
4. **File in Court**: For amounts under $3,500, use Small Claims Court; larger amounts go to Superior Court

**Penalties for Employers**
- **Treble Damages**: Courts can award up to THREE TIMES the unpaid wages
- **Waiting Time Penalties**: Additional wages for each day payment is delayed
- **Attorney's Fees**: Successful employees may recover legal costs

**Important Deadlines**
- **Statute of Limitations**: 1 year for wage claims under A.R.S. § 23-355
- **Federal Claims (FLSA)**: 2 years (or 3 years for willful violations)

**When Professional Legal Help May Be Warranted**
Consider consulting an attorney if:
- The amount owed exceeds $5,000
- Your employer disputes the wages owed
- You were misclassified as an independent contractor
- You believe multiple employees are affected (potential class action)

*This is legal information for educational purposes — not legal advice. No attorney-client relationship is created. Have an attorney review your specific situation before taking action.*`,

      eviction: `### Arizona Eviction Laws - A.R.S. Title 33, Chapter 10

**Direct Answer**
Arizona landlords must follow strict procedures to evict tenants, including providing proper written notice. Tenants have important rights throughout the eviction process and can contest improper evictions in court.

**Legal Background**
Arizona evictions are governed by the Arizona Residential Landlord and Tenant Act (A.R.S. § 33-1301 et seq.):

**Notice Requirements:**
- **5-Day Notice**: Required for non-payment of rent (A.R.S. § 33-1368(B))
- **10-Day Notice**: For curable lease violations (A.R.S. § 33-1368(A))
- **Immediate Notice**: For material health/safety violations, illegal activity
- **30-Day Notice**: For month-to-month tenancies without cause

**Potential Eviction Defense Steps (Review with an Attorney)**
1. **Verify Notice**: Confirm proper notice was served correctly
2. **Respond in Writing**: Document any disputes with the landlord's claims
3. **Appear in Court**: ALWAYS attend the eviction hearing - failure to appear results in default judgment
4. **Present Defenses**: Improper notice, habitability issues, retaliation, discrimination
5. **Request Continuance**: If you need more time to prepare

**Important Deadlines**
- You have 5 days to pay rent after receiving a 5-day notice
- Court hearing typically scheduled within 3-6 days of filing
- Appeal must be filed within 5 days of judgment

**Tenant Rights**
- Right to cure violations within notice period
- Right to a court hearing before forced removal
- Protection from "self-help" evictions (changing locks, removing belongings)
- Right to assert counterclaims for landlord violations

*This is legal information, not legal advice. No attorney-client relationship is created. Complex eviction situations benefit from professional legal representation.*`,

      landlord: `### Arizona Landlord-Tenant Law - A.R.S. Title 33, Chapter 10

**Direct Answer**
Arizona's Residential Landlord and Tenant Act provides comprehensive protections for both landlords and tenants, covering security deposits, repairs, habitability standards, and dispute resolution.

**Legal Background**

**Security Deposits (A.R.S. § 33-1321):**
- Maximum deposit: 1.5 months' rent
- Must be returned within 14 business days of move-out
- Landlord must provide itemized statement of any deductions
- Wrongful withholding: Tenant can recover up to twice the deposit

**Repair Obligations (A.R.S. § 33-1324):**
- Landlord must maintain habitability and make repairs
- Tenant must notify landlord in writing
- Landlord has 10 days to respond for non-emergency repairs
- Emergency repairs: Landlord must respond within 24 hours

**Tenant Remedies for Repairs:**
1. Written notice to landlord
2. If no response in 10 days: Tenant may hire repair and deduct up to $300 or half month's rent
3. For major violations: Tenant may terminate lease or seek rent reduction

**Habitability Standards Include:**
- Working plumbing, heating, electrical systems
- Hot and cold running water
- Functioning smoke detectors
- Pest-free conditions
- Structurally sound premises

*This is legal information, not legal advice. For specific disputes, consider consulting with a tenant rights organization or attorney before taking action.*`,

      divorce: `### Arizona Divorce Law - A.R.S. Title 25

**Direct Answer**
Arizona is a "no-fault" divorce state, meaning neither spouse needs to prove wrongdoing. The court divides community property equally and determines custody based on the child's best interests.

**Legal Background**

**Residency Requirements (A.R.S. § 25-312):**
- At least one spouse must be an Arizona resident for 90+ days before filing
- File in Superior Court in the county where either spouse resides

**Divorce Process:**
1. **Petition**: File dissolution of marriage petition
2. **Service**: Serve spouse with papers (or acceptance of service)
3. **Response**: 20 days for spouse to respond (30 if served out of state)
4. **Waiting Period**: 60 days minimum from service date
5. **Discovery**: Exchange financial information
6. **Trial/Settlement**: Resolve or litigate disputed issues

**Property Division (Community Property State):**
- Assets acquired during marriage are community property
- Community property divided "equitably" (usually 50/50)
- Separate property (owned before marriage, gifts, inheritance) stays with owner
- Debts are also divided

**Child Custody (Legal Decision-Making):**
- Based on child's best interests (A.R.S. § 25-403)
- Joint custody preferred unless against child's interests
- Factors: Child's wishes, parents' wishes, relationships, health, history of abuse

**Important Deadlines:**
- Response to petition: 20-30 days
- Waiting period: 60 days minimum
- Default judgment: If spouse doesn't respond in 20 days

*This is legal information, not legal advice. Divorce involves significant financial and family consequences — an attorney can review your specific circumstances.*`,

      custody: `### Arizona Child Custody (Legal Decision-Making) - A.R.S. § 25-401 et seq.

**Direct Answer**
Arizona uses "legal decision-making" (custody) and "parenting time" (visitation) to determine children's care. Courts prioritize the child's best interests and generally favor arrangements that maximize both parents' involvement.

**Legal Background**

**Legal Decision-Making Authority (A.R.S. § 25-401):**
- **Joint**: Both parents share major decisions (education, healthcare, religion)
- **Sole**: One parent makes all major decisions
- Courts prefer joint decision-making absent evidence it's harmful

**Parenting Time:**
- Schedule for physical time with each parent
- Not necessarily 50/50 - based on child's best interests
- Courts consider parents' work schedules, proximity, child's age

**Best Interest Factors (A.R.S. § 25-403):**
1. Past, present, and potential future relationship with each parent
2. Child's adjustment to home, school, community
3. Mental and physical health of all parties
4. Which parent is more likely to allow frequent contact with other parent
5. History of domestic violence or abuse
6. Child's wishes (if appropriate age and maturity)

**Modification of Custody:**
- Must show "substantial and continuing change in circumstances"
- Generally cannot modify within 1 year unless child's safety at risk

**Relocation:**
- 45-day written notice required before moving 100+ miles
- Other parent can object; court hearing required

*This is legal information, not legal advice. Custody matters are complex — consider consulting with a family law attorney to review your specific situation.*`,

      employment: `### Arizona Employment Law

**Direct Answer**
Arizona is an "at-will" employment state, meaning employers can terminate employees for any reason (or no reason) that isn't illegal. However, significant protections exist against discrimination, retaliation, and wage violations.

**Legal Background**

**At-Will Employment Exceptions:**
- **Discrimination**: Cannot fire based on race, color, religion, sex, national origin, age (40+), disability, pregnancy (Title VII, ADEA, ADA)
- **Retaliation**: Cannot fire for filing complaints, whistleblowing, workers' comp claims
- **Contract**: Written or implied employment contracts may limit termination
- **Public Policy**: Cannot fire for refusing illegal acts, exercising legal rights

**Wage and Hour Laws:**
- Arizona minimum wage: $14.35/hour (2024)
- Overtime: 1.5x for hours over 40/week (federal FLSA)
- Prompt Pay Act: Wages must be paid on regular pay schedule
- Final Pay: Within 7 working days or next payday if terminated

**Discrimination Claims:**
1. File with EEOC (federal) within 300 days, OR
2. File with Arizona Civil Rights Division within 180 days
3. Obtain "right to sue" letter before filing lawsuit
4. File lawsuit within 90 days of receiving letter

**Wrongful Termination — Risk Areas to Review:**
- Consider documenting everything (emails, performance reviews, witnesses)
- Filing an unemployment claim promptly is generally advisable
- Suggested question for counsel: review any severance agreement before signing

*This is legal information, not legal advice. If you believe your rights were violated, an employment attorney can review your specific circumstances — many offer free consultations.*`,

      contract: `### Arizona Contract Law

**Direct Answer**
Arizona follows common law principles for contracts, requiring offer, acceptance, consideration, and capacity. Written contracts are generally required for agreements involving land, debts over certain amounts, or performance taking longer than one year.

**Legal Background**

**Essential Elements of a Valid Contract:**
1. **Offer**: Clear terms proposed by one party
2. **Acceptance**: Unambiguous agreement to terms
3. **Consideration**: Something of value exchanged
4. **Capacity**: Parties must be legally able to contract (adults, mentally competent)
5. **Legality**: Purpose cannot be illegal

**Statute of Frauds (A.R.S. § 44-101):**
Written contract required for:
- Sale of real property
- Agreements that cannot be performed within one year
- Promises to pay another's debt
- Sale of goods over $500 (UCC)

**Breach of Contract Remedies:**
- **Compensatory Damages**: Money to put you in position if contract performed
- **Consequential Damages**: Foreseeable losses resulting from breach
- **Specific Performance**: Court orders party to perform (rare, usually for unique property)
- **Rescission**: Contract cancelled, parties restored to original positions

**Statute of Limitations:**
- Written contracts: 6 years (A.R.S. § 12-548)
- Oral contracts: 3 years (A.R.S. § 12-543)

**Common Contract Disputes:**
- Non-payment for services
- Failure to deliver goods
- Breach of warranty
- Misrepresentation

*This is legal information, not legal advice. Contract disputes often involve significant amounts — have an attorney review agreements and communications before taking action.*`,

      business: `### Starting a Business in Arizona

**Direct Answer**
Arizona is a business-friendly state with straightforward registration processes. Most businesses need to register with the Arizona Corporation Commission, obtain appropriate licenses, and comply with tax requirements.

**Legal Background**

**Business Structure Options:**
1. **Sole Proprietorship**: Simplest, no separate registration required (just trade name if not using own name)
2. **LLC**: Limited liability, pass-through taxation, flexible management - most popular for small businesses
3. **Corporation**: Strongest liability protection, more formalities, potential double taxation
4. **Partnership**: Two or more owners, various types (general, limited, LLP)

**Step-by-Step Business Formation (LLC):**
1. **Choose Name**: Must include "LLC" and be distinguishable from existing entities
2. **File Articles of Organization**: With Arizona Corporation Commission ($50 online)
3. **Obtain EIN**: Free from IRS (irs.gov)
4. **Create Operating Agreement**: Not required but strongly recommended
5. **Register for State Taxes**: Arizona Department of Revenue
6. **Obtain Business Licenses**: City, county, and industry-specific

**Tax Requirements:**
- Arizona Transaction Privilege Tax (TPT): Sales tax, varies by city (8-11%)
- Withholding: Required if you have employees
- Annual Report: LLCs don't require annual reports in Arizona!

**Important Deadlines:**
- Articles of Organization: File before conducting business
- EIN: Before opening bank accounts or hiring
- TPT License: Before first sale

**Costs to Expect:**
- Articles of Organization: $50 (online) or $60 (paper)
- Business license: Varies by city ($50-$500)
- Operating Agreement preparation: $500-$1,500 if using attorney

*This is legal information, not legal advice. Business formation has long-term legal and tax implications — consider consulting with a business attorney and CPA before finalizing decisions.*`,

      default: `### Legal Information Request

**Direct Answer**
I understand you have a legal question. Let me provide helpful guidance based on Arizona law.

**How I Can Help**
I'm trained to provide comprehensive legal information on topics including:

**Common Practice Areas:**
- **Employment**: Wages, discrimination, wrongful termination
- **Housing**: Tenant rights, evictions, landlord disputes
- **Family**: Divorce, custody, child support
- **Business**: Formation, contracts, licensing
- **Consumer**: Debt collection, fraud, warranties
- **Criminal**: Rights, process, expungement

**Getting Better Answers**
For the most helpful response, please include:
1. **Specific Issue**: What exactly happened or what do you need to know?
2. **Key Facts**: Dates, amounts, parties involved
3. **Timeline**: Any deadlines or court dates approaching
4. **Prior Actions**: What have you already tried?

**Example Questions That Get Great Answers:**
- "What are my rights if my landlord refuses to return my security deposit?"
- "How do I file for divorce in Arizona and what is the process?"
- "My employer hasn't paid me in 3 weeks - what can I do?"
- "Summarize the Arizona Prompt Pay Act"

**Important Disclaimer**
This is legal information for educational purposes — not legal advice. No attorney-client relationship is created. For guidance specific to your situation, consult with a licensed attorney.

*Please rephrase your question with more specific details, and I'll provide a comprehensive, citation-backed response.*`,
    };

    let responseKey = 'default';
    const keywordMatches: [string, number][] = [];

    for (const key of Object.keys(responses)) {
      if (key === 'default') continue;
      const keywords = key.split(/\s+/);
      let matchCount = 0;
      for (const kw of keywords) {
        if (lowerQuery.includes(kw)) {
          matchCount++;
        }
      }
      if (matchCount > 0) {
        keywordMatches.push([key, matchCount]);
      }
    }

    keywordMatches.sort((a, b) => b[1] - a[1]);
    if (keywordMatches.length > 0) {
      responseKey = keywordMatches[0][0];
    }

    const content = responses[responseKey];
    this.conversationHistory.push({ role: 'assistant', content });

    return {
      role: 'assistant',
      content,
      modelUsed: 'EZLegal Knowledge Base',
    };
  }

  resetSession(): void {
    this.sessionId = crypto.randomUUID();
    this.conversationHistory = [];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

export const chatService = new ChatService();

export { ChatService };
export type { ChatMessage, ChatServiceConfig, DocumentAttachment, ThinkingDetails, ThinkingStep };

```

---

## src/lib/plan-context.ts (46 lines)

```typescript
const STORAGE_KEY = 'ezlegal.pendingPlan';

export interface PendingPlan {
  planId: string;
  source?: string;
  timestamp: number;
}

export function setPendingPlan(planId: string, source?: string): void {
  if (typeof window === 'undefined' || !planId) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ planId, source: source ?? '', timestamp: Date.now() }),
    );
  } catch {
    // sessionStorage unavailable
  }
}

export function readPendingPlan(): PendingPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPlan;
    if (!parsed?.planId) return null;
    if (Date.now() - parsed.timestamp > 1000 * 60 * 60 * 2) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPlan(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

```

---

## src/data/practiceAreas.ts (312 lines)

```typescript
import {
  Landmark, Scale, Heart, Briefcase, Globe, Copyright,
  AlertTriangle, Home, Users, ScrollText
} from 'lucide-react';

export interface Subcategory {
  id: string;
  name: string;
}

export interface PracticeArea {
  id: string;
  name: string;
  icon: typeof Landmark;
  color: string;
  subcategories: Subcategory[];
}

export const practiceAreas: PracticeArea[] = [
  {
    id: 'bankruptcy',
    name: 'Bankruptcy',
    icon: Landmark,
    color: 'slate',
    subcategories: [
      { id: 'chapter-13-company-employed', name: 'Chapter 13 Filing - Company Employed Debtors' },
      { id: 'chapter-13-includes-filing-fee', name: 'Chapter 13 Filing - Includes Bankruptcy Court Filing Fee and Credit Report' },
      { id: 'chapter-13-national-average', name: 'Chapter 13 Filing - National Average' },
      { id: 'chapter-13-self-employed', name: 'Chapter 13 Filing - Self-Employed Debtors' },
      { id: 'chapter-13-motion-relief', name: 'Chapter 13 Motion for Relief' },
      { id: 'chapter-13-objection-plan', name: 'Chapter 13 Objection to Plan' },
      { id: 'chapter-13-presumptive-fee', name: 'Chapter 13 Presumptively Reasonable Fee' },
      { id: 'chapter-13-proof-claim', name: 'Chapter 13 Proof of Claim Review and Preparation' },
      { id: 'chapter-7-13-court-fee', name: 'Chapter 7 and Chapter 13 Bankruptcy Court Filing Fee' },
      { id: 'chapter-7-court-fee', name: 'Chapter 7 Bankruptcy Court Filing Fee' },
      { id: 'chapter-7-individual-below-median', name: 'Chapter 7 Filing - Individual and Below Median Income' },
      { id: 'chapter-7-married-above-median', name: 'Chapter 7 Filing - Married and Above Median Income' },
      { id: 'chapter-7-married-below-median', name: 'Chapter 7 Filing - Married and Below Median Income' },
      { id: 'chapter-7-no-assets', name: 'Chapter 7 Filing - No Assets' },
      { id: 'chapter-7-simple-normal', name: 'Chapter 7 Filing - Simple - Normal Employment - Less than 40 Creditors' },
      { id: 'chapter-7-with-creditors', name: 'Chapter 7 Filing - With Creditors' },
      { id: 'chapter-7-court-accounting', name: 'Chapter 7 Filing Including Court Accounting' },
      { id: 'chapter-7-involving-real-estate', name: 'Chapter 7 Filing Involving Real Estate' },
      { id: 'chapter-7-not-involving-real-estate', name: 'Chapter 7 Filing Not Involving Real Estate' },
      { id: 'chapter-7-motion-relief', name: 'Chapter 7 Motion for Relief' },
      { id: 'chapter-7-proof-claim', name: 'Chapter 7 Proof of Claim Review and Preparation' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'mediation-first', name: 'Mediation - First Session' },
      { id: 'mediation-second', name: 'Mediation - Second Session' },
      { id: 'response-final-cure', name: 'Response to Final Cure Payment' },
    ],
  },
  {
    id: 'criminal',
    name: 'Criminal',
    icon: Scale,
    color: 'red',
    subcategories: [
      { id: 'aggravated-assault', name: 'Aggravated Assault' },
      { id: 'aggravated-domestic-violence', name: 'Aggravated Domestic Violence' },
      { id: 'aggravated-dui', name: 'Aggravated DUI' },
      { id: 'animal-cruelty', name: 'Animal Cruelty' },
      { id: 'appeal', name: 'Appeal' },
      { id: 'arson', name: 'Arson' },
      { id: 'assault', name: 'Assault' },
      { id: 'bail-hearing', name: 'Bail Hearing' },
      { id: 'burglary', name: 'Burglary' },
      { id: 'child-abuse', name: 'Child Abuse' },
      { id: 'conspiracy', name: 'Conspiracy' },
      { id: 'disorderly-conduct', name: 'Disorderly Conduct' },
      { id: 'domestic-violence', name: 'Domestic Violence' },
      { id: 'drug-possession', name: 'Drug Possession' },
      { id: 'dui-first-offense', name: 'DUI - First Offense' },
      { id: 'dui-second-offense', name: 'DUI - Second Offense' },
      { id: 'expungement', name: 'Expungement' },
      { id: 'felony-defense', name: 'Felony Defense' },
      { id: 'fraud', name: 'Fraud' },
      { id: 'harassment', name: 'Harassment' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'juvenile-defense', name: 'Juvenile Defense' },
      { id: 'misdemeanor-defense', name: 'Misdemeanor Defense' },
      { id: 'probation-violation', name: 'Probation Violation' },
      { id: 'restraining-order', name: 'Restraining Order' },
      { id: 'robbery', name: 'Robbery' },
      { id: 'theft', name: 'Theft' },
      { id: 'traffic-violations', name: 'Traffic Violations' },
      { id: 'weapons-charges', name: 'Weapons Charges' },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    icon: Heart,
    color: 'rose',
    subcategories: [
      { id: 'adoption-agency', name: 'Adoptions - Agency Adoption' },
      { id: 'adoption-contested', name: 'Adoptions - Contested' },
      { id: 'adoption-direct-placement', name: 'Adoptions - Direct Placement' },
      { id: 'adoption-stepparent', name: 'Adoptions - Stepparent' },
      { id: 'alimony-modification', name: 'Alimony Modification' },
      { id: 'annulment', name: 'Annulment' },
      { id: 'child-custody', name: 'Child Custody' },
      { id: 'child-support', name: 'Child Support' },
      { id: 'child-support-modification', name: 'Child Support Modification' },
      { id: 'custody-modification', name: 'Custody Modification' },
      { id: 'divorce-contested', name: 'Divorce - Contested' },
      { id: 'divorce-uncontested', name: 'Divorce - Uncontested' },
      { id: 'domestic-partnership', name: 'Domestic Partnership' },
      { id: 'guardianship', name: 'Guardianship' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'legal-separation', name: 'Legal Separation' },
      { id: 'mediation', name: 'Mediation' },
      { id: 'name-change', name: 'Name Change' },
      { id: 'paternity', name: 'Paternity' },
      { id: 'prenuptial-agreement', name: 'Prenuptial Agreement' },
      { id: 'postnuptial-agreement', name: 'Postnuptial Agreement' },
      { id: 'protective-order', name: 'Protective Order' },
      { id: 'relocation', name: 'Relocation' },
      { id: 'visitation-rights', name: 'Visitation Rights' },
    ],
  },
  {
    id: 'general-practice',
    name: 'General Practice',
    icon: Briefcase,
    color: 'blue',
    subcategories: [
      { id: '501c3-formation', name: '501(c)(3) Formation' },
      { id: 'general-partnership', name: 'General Partnership Formation' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'llc-dissolution', name: 'LLC Dissolution' },
      { id: 'llc-formation', name: 'LLC Formation' },
      { id: 'business-contracts', name: 'Business Contracts' },
      { id: 'contract-review', name: 'Contract Review' },
      { id: 'corporate-formation', name: 'Corporate Formation' },
      { id: 'employment-agreement', name: 'Employment Agreement' },
      { id: 'independent-contractor', name: 'Independent Contractor Agreement' },
      { id: 'non-compete-agreement', name: 'Non-Compete Agreement' },
      { id: 'non-disclosure-agreement', name: 'Non-Disclosure Agreement' },
      { id: 'operating-agreement', name: 'Operating Agreement' },
      { id: 'partnership-agreement', name: 'Partnership Agreement' },
      { id: 'shareholder-agreement', name: 'Shareholder Agreement' },
    ],
  },
  {
    id: 'immigration',
    name: 'Immigration',
    icon: Globe,
    color: 'sky',
    subcategories: [
      { id: 'b1-b2-visa', name: 'B-1/B-2 Nonimmigrant Visa' },
      { id: 'certificate-citizenship', name: 'Certificate of Citizenship' },
      { id: 'change-status-f1', name: 'Change of Status to F-1 Student' },
      { id: 'citizenship-application', name: 'Citizenship Application' },
      { id: 'daca-renewal', name: 'DACA Renewal' },
      { id: 'deportation-defense', name: 'Deportation Defense' },
      { id: 'eb-1-visa', name: 'EB-1 Visa' },
      { id: 'eb-2-visa', name: 'EB-2 Visa' },
      { id: 'eb-3-visa', name: 'EB-3 Visa' },
      { id: 'family-based-green-card', name: 'Family-Based Green Card' },
      { id: 'fiance-visa-k1', name: 'Fiance Visa (K-1)' },
      { id: 'green-card-renewal', name: 'Green Card Renewal' },
      { id: 'h1b-visa', name: 'H-1B Visa' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'l1-visa', name: 'L-1 Visa' },
      { id: 'naturalization', name: 'Naturalization' },
      { id: 'o-1-visa', name: 'O-1 Visa' },
      { id: 'removal-proceedings', name: 'Removal Proceedings' },
      { id: 'spousal-visa', name: 'Spousal Visa' },
      { id: 'travel-document', name: 'Travel Document' },
      { id: 'visa-appeal', name: 'Visa Appeal' },
      { id: 'work-permit', name: 'Work Permit (EAD)' },
    ],
  },
  {
    id: 'intellectual-property',
    name: 'Intellectual Property',
    icon: Copyright,
    color: 'teal',
    subcategories: [
      { id: 'appeal-brief', name: 'Appeal Brief' },
      { id: 'copyright-application', name: 'Copyright Application' },
      { id: 'design-patent', name: 'Design Patent Application' },
      { id: 'extended-search', name: 'Extended Search' },
      { id: 'foreign-filing', name: 'Foreign Filing' },
      { id: 'infringement-analysis', name: 'Infringement Analysis' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'licensing-agreement', name: 'Licensing Agreement' },
      { id: 'patent-application', name: 'Patent Application' },
      { id: 'patent-prosecution', name: 'Patent Prosecution' },
      { id: 'patent-search', name: 'Patent Search' },
      { id: 'trademark-application', name: 'Trademark Application' },
      { id: 'trademark-opposition', name: 'Trademark Opposition' },
      { id: 'trademark-renewal', name: 'Trademark Renewal' },
      { id: 'trademark-search', name: 'Trademark Search' },
      { id: 'trade-secret-protection', name: 'Trade Secret Protection' },
      { id: 'utility-patent', name: 'Utility Patent Application' },
    ],
  },
  {
    id: 'personal-injury',
    name: 'Personal Injury',
    icon: AlertTriangle,
    color: 'orange',
    subcategories: [
      { id: '3m-earplugs', name: '3M Combat Arms Earplugs, Version 2' },
      { id: 'accutane', name: 'Accutane' },
      { id: 'actos', name: 'Actos' },
      { id: 'auto-accidents', name: 'Auto Accidents' },
      { id: 'avandia', name: 'Avandia' },
      { id: 'bicycle-accidents', name: 'Bicycle Accidents' },
      { id: 'birth-injury', name: 'Birth Injury' },
      { id: 'brain-injury', name: 'Brain Injury' },
      { id: 'burn-injury', name: 'Burn Injury' },
      { id: 'construction-accidents', name: 'Construction Accidents' },
      { id: 'dog-bites', name: 'Dog Bites' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'medical-malpractice', name: 'Medical Malpractice' },
      { id: 'motorcycle-accidents', name: 'Motorcycle Accidents' },
      { id: 'nursing-home-abuse', name: 'Nursing Home Abuse' },
      { id: 'pedestrian-accidents', name: 'Pedestrian Accidents' },
      { id: 'premises-liability', name: 'Premises Liability' },
      { id: 'product-liability', name: 'Product Liability' },
      { id: 'slip-and-fall', name: 'Slip and Fall' },
      { id: 'spinal-cord-injury', name: 'Spinal Cord Injury' },
      { id: 'truck-accidents', name: 'Truck Accidents' },
      { id: 'workers-compensation', name: 'Workers Compensation' },
      { id: 'wrongful-death', name: 'Wrongful Death' },
    ],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: Home,
    color: 'green',
    subcategories: [
      { id: 'landlord-tenant-consultation', name: 'Consultation on Landlord and Tenant Matters' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'commercial-lease', name: 'Prepare Commercial Lease' },
      { id: 'commercial-purchase', name: 'Commercial Property Purchase' },
      { id: 'commercial-sale', name: 'Commercial Property Sale' },
      { id: 'deed-preparation', name: 'Deed Preparation' },
      { id: 'easement-agreement', name: 'Easement Agreement' },
      { id: 'eviction', name: 'Eviction' },
      { id: 'foreclosure-defense', name: 'Foreclosure Defense' },
      { id: 'home-purchase', name: 'Home Purchase' },
      { id: 'home-sale', name: 'Home Sale' },
      { id: 'landlord-representation', name: 'Landlord Representation' },
      { id: 'lease-agreement', name: 'Lease Agreement' },
      { id: 'lease-review', name: 'Lease Review' },
      { id: 'property-dispute', name: 'Property Dispute' },
      { id: 'quiet-title', name: 'Quiet Title Action' },
      { id: 'refinance', name: 'Refinance' },
      { id: 'tenant-representation', name: 'Tenant Representation' },
      { id: 'title-search', name: 'Title Search' },
      { id: 'zoning-issues', name: 'Zoning Issues' },
    ],
  },
  {
    id: 'trusts-estates',
    name: 'Trusts & Estates',
    icon: Users,
    color: 'amber',
    subcategories: [
      { id: 'estate-plan-complex', name: 'Estate Plan - Complex' },
      { id: 'estate-plan-routine', name: 'Estate Plan - Routine' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'asset-protection-trust', name: 'Asset Protection Trust' },
      { id: 'charitable-trust', name: 'Charitable Trust' },
      { id: 'estate-administration', name: 'Estate Administration' },
      { id: 'estate-litigation', name: 'Estate Litigation' },
      { id: 'family-trust', name: 'Family Trust' },
      { id: 'generation-skipping-trust', name: 'Generation-Skipping Trust' },
      { id: 'irrevocable-trust', name: 'Irrevocable Trust' },
      { id: 'living-trust', name: 'Living Trust' },
      { id: 'medicaid-planning', name: 'Medicaid Planning' },
      { id: 'pet-trust', name: 'Pet Trust' },
      { id: 'power-of-attorney', name: 'Power of Attorney' },
      { id: 'revocable-trust', name: 'Revocable Trust' },
      { id: 'special-needs-trust', name: 'Special Needs Trust' },
      { id: 'spendthrift-trust', name: 'Spendthrift Trust' },
      { id: 'trust-amendment', name: 'Trust Amendment' },
      { id: 'trust-funding', name: 'Trust Funding' },
    ],
  },
  {
    id: 'wills-probate',
    name: 'Wills & Probate',
    icon: ScrollText,
    color: 'slate',
    subcategories: [
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'basic-family-will', name: 'Prepare Basic Family Will Plan' },
      { id: 'basic-will', name: 'Prepare Basic Will Plan' },
      { id: 'complex-will', name: 'Prepare Complex Will' },
      { id: 'advance-directive', name: 'Advance Directive' },
      { id: 'codicil', name: 'Codicil' },
      { id: 'estate-inventory', name: 'Estate Inventory' },
      { id: 'healthcare-proxy', name: 'Healthcare Proxy' },
      { id: 'holographic-will', name: 'Holographic Will' },
      { id: 'living-will', name: 'Living Will' },
      { id: 'pour-over-will', name: 'Pour-Over Will' },
      { id: 'probate-administration', name: 'Probate Administration' },
      { id: 'probate-contested', name: 'Probate - Contested' },
      { id: 'probate-uncontested', name: 'Probate - Uncontested' },
      { id: 'small-estate-affidavit', name: 'Small Estate Affidavit' },
      { id: 'will-contest', name: 'Will Contest' },
      { id: 'will-review', name: 'Will Review' },
    ],
  },
];

```

---

## src/data/jurisdictions.ts (127 lines)

```typescript
export interface Jurisdiction {
  code: string;
  name: string;
  type: 'us-state' | 'federal' | 'territory' | 'international';
}

export interface JurisdictionGroup {
  label: string;
  options: Jurisdiction[];
}

export const US_STATES: Jurisdiction[] = [
  { code: 'AL', name: 'Alabama', type: 'us-state' },
  { code: 'AK', name: 'Alaska', type: 'us-state' },
  { code: 'AZ', name: 'Arizona', type: 'us-state' },
  { code: 'AR', name: 'Arkansas', type: 'us-state' },
  { code: 'CA', name: 'California', type: 'us-state' },
  { code: 'CO', name: 'Colorado', type: 'us-state' },
  { code: 'CT', name: 'Connecticut', type: 'us-state' },
  { code: 'DE', name: 'Delaware', type: 'us-state' },
  { code: 'FL', name: 'Florida', type: 'us-state' },
  { code: 'GA', name: 'Georgia', type: 'us-state' },
  { code: 'HI', name: 'Hawaii', type: 'us-state' },
  { code: 'ID', name: 'Idaho', type: 'us-state' },
  { code: 'IL', name: 'Illinois', type: 'us-state' },
  { code: 'IN', name: 'Indiana', type: 'us-state' },
  { code: 'IA', name: 'Iowa', type: 'us-state' },
  { code: 'KS', name: 'Kansas', type: 'us-state' },
  { code: 'KY', name: 'Kentucky', type: 'us-state' },
  { code: 'LA', name: 'Louisiana', type: 'us-state' },
  { code: 'ME', name: 'Maine', type: 'us-state' },
  { code: 'MD', name: 'Maryland', type: 'us-state' },
  { code: 'MA', name: 'Massachusetts', type: 'us-state' },
  { code: 'MI', name: 'Michigan', type: 'us-state' },
  { code: 'MN', name: 'Minnesota', type: 'us-state' },
  { code: 'MS', name: 'Mississippi', type: 'us-state' },
  { code: 'MO', name: 'Missouri', type: 'us-state' },
  { code: 'MT', name: 'Montana', type: 'us-state' },
  { code: 'NE', name: 'Nebraska', type: 'us-state' },
  { code: 'NV', name: 'Nevada', type: 'us-state' },
  { code: 'NH', name: 'New Hampshire', type: 'us-state' },
  { code: 'NJ', name: 'New Jersey', type: 'us-state' },
  { code: 'NM', name: 'New Mexico', type: 'us-state' },
  { code: 'NY', name: 'New York', type: 'us-state' },
  { code: 'NC', name: 'North Carolina', type: 'us-state' },
  { code: 'ND', name: 'North Dakota', type: 'us-state' },
  { code: 'OH', name: 'Ohio', type: 'us-state' },
  { code: 'OK', name: 'Oklahoma', type: 'us-state' },
  { code: 'OR', name: 'Oregon', type: 'us-state' },
  { code: 'PA', name: 'Pennsylvania', type: 'us-state' },
  { code: 'RI', name: 'Rhode Island', type: 'us-state' },
  { code: 'SC', name: 'South Carolina', type: 'us-state' },
  { code: 'SD', name: 'South Dakota', type: 'us-state' },
  { code: 'TN', name: 'Tennessee', type: 'us-state' },
  { code: 'TX', name: 'Texas', type: 'us-state' },
  { code: 'UT', name: 'Utah', type: 'us-state' },
  { code: 'VT', name: 'Vermont', type: 'us-state' },
  { code: 'VA', name: 'Virginia', type: 'us-state' },
  { code: 'WA', name: 'Washington', type: 'us-state' },
  { code: 'WV', name: 'West Virginia', type: 'us-state' },
  { code: 'WI', name: 'Wisconsin', type: 'us-state' },
  { code: 'WY', name: 'Wyoming', type: 'us-state' },
];

export const FEDERAL_JURISDICTIONS: Jurisdiction[] = [
  { code: 'FED', name: 'Federal (All Circuits)', type: 'federal' },
  { code: 'SCOTUS', name: 'U.S. Supreme Court', type: 'federal' },
  { code: '1CIR', name: '1st Circuit', type: 'federal' },
  { code: '2CIR', name: '2nd Circuit', type: 'federal' },
  { code: '3CIR', name: '3rd Circuit', type: 'federal' },
  { code: '4CIR', name: '4th Circuit', type: 'federal' },
  { code: '5CIR', name: '5th Circuit', type: 'federal' },
  { code: '6CIR', name: '6th Circuit', type: 'federal' },
  { code: '7CIR', name: '7th Circuit', type: 'federal' },
  { code: '8CIR', name: '8th Circuit', type: 'federal' },
  { code: '9CIR', name: '9th Circuit', type: 'federal' },
  { code: '10CIR', name: '10th Circuit', type: 'federal' },
  { code: '11CIR', name: '11th Circuit', type: 'federal' },
  { code: 'DCCIR', name: 'D.C. Circuit', type: 'federal' },
  { code: 'FEDCIR', name: 'Federal Circuit', type: 'federal' },
];

export const US_TERRITORIES: Jurisdiction[] = [
  { code: 'DC', name: 'District of Columbia', type: 'territory' },
  { code: 'PR', name: 'Puerto Rico', type: 'territory' },
  { code: 'GU', name: 'Guam', type: 'territory' },
  { code: 'VI', name: 'U.S. Virgin Islands', type: 'territory' },
  { code: 'AS', name: 'American Samoa', type: 'territory' },
  { code: 'MP', name: 'Northern Mariana Islands', type: 'territory' },
];

export const INTERNATIONAL_JURISDICTIONS: Jurisdiction[] = [
  { code: 'UK', name: 'United Kingdom', type: 'international' },
  { code: 'CA-CAN', name: 'Canada', type: 'international' },
  { code: 'AU', name: 'Australia', type: 'international' },
  { code: 'EU', name: 'European Union', type: 'international' },
  { code: 'DE', name: 'Germany', type: 'international' },
  { code: 'FR', name: 'France', type: 'international' },
  { code: 'JP', name: 'Japan', type: 'international' },
  { code: 'IN', name: 'India', type: 'international' },
  { code: 'BR', name: 'Brazil', type: 'international' },
  { code: 'MX', name: 'Mexico', type: 'international' },
];

export const JURISDICTION_GROUPS: JurisdictionGroup[] = [
  { label: 'Federal', options: FEDERAL_JURISDICTIONS },
  { label: 'U.S. States', options: US_STATES },
  { label: 'U.S. Territories', options: US_TERRITORIES },
  { label: 'International', options: INTERNATIONAL_JURISDICTIONS },
];

export const ALL_JURISDICTIONS: Jurisdiction[] = [
  ...FEDERAL_JURISDICTIONS,
  ...US_STATES,
  ...US_TERRITORIES,
  ...INTERNATIONAL_JURISDICTIONS,
];

export function getJurisdictionByCode(code: string): Jurisdiction | undefined {
  return ALL_JURISDICTIONS.find(j => j.code === code);
}

export function getJurisdictionName(code: string): string {
  const jurisdiction = getJurisdictionByCode(code);
  return jurisdiction?.name || code;
}

```

---

