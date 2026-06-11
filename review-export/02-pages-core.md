# ezLegal.ai Code Review - Core Pages

> Homepage, chat, authentication, and pricing pages.

Generated: 2026-06-03T00:51:49.796Z
Files included: 8

---

## src/pages/Home.tsx

```tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../services/analytics-service';
import { type AudiencePath } from '../data/audiencePaths';
import {
  HomeShell,
  UrgentStrip,
  HeroIntake,
  SituationExplorer,
  SMBConversionSection,
  LegalAidPartnerSection,
  BilingualParityNotice,
  SafetyNotice,
  FinalCTA,
} from '../components/home';

export default function Home() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPath = (searchParams.get('path') || 'legal-aid') as AudiencePath;

  useEffect(() => {
    if (user) navigate('/chat', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    trackEvent('homepage_viewed', { language });
  }, []);

  return (
    <HomeShell>
      <UrgentStrip />
      <HeroIntake currentPath={currentPath} />
      <SituationExplorer />
      <SMBConversionSection />
      <LegalAidPartnerSection />
      <BilingualParityNotice />
      <SafetyNotice />
      <FinalCTA />
    </HomeShell>
  );
}

```

---

## src/pages/ChatV2.tsx

```tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Mic, Paperclip, ArrowUp, MessageSquare, Shield, Lock, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, type Language } from '../contexts/LanguageContext';
import {
  UnifiedTrustStrip,
  TabbedResponse,
  MoreHelpDrawer,
  CollapsibleSidebar,
  ContextualCrisisAlert,
  detectCrisisSignal,
} from '../components/cognitive-load';
import AIModelSelector from '../components/AIModelSelector';
import AnswerModeSelector, { type AnswerMode } from '../components/AnswerModeSelector';
import GuidedIssueLauncher from '../components/GuidedIssueLauncher';
import UrgentSignalCard from '../components/UrgentSignalCard';
import CrisisStrip from '../components/CrisisStrip';
import EthicalConversionPanel from '../components/EthicalConversionPanel';
import UserMenu from '../components/UserMenu';
import { detectUrgentSignals, type UrgentSignal } from '../lib/urgent-signal-detector';
import { detectSensitiveData, disclaimerCopy } from '../lib/legalSafetyConfig';
import ChatPrivacyGate from '../components/ChatPrivacyGate';
import HandoffRequestForm from '../components/HandoffRequestForm';
import { JurisdictionModal, UrgencyScreening, IssueCategoryGrid, FinalActionCards, ChatDisclaimer } from '../components/chat';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { chatService } from '../services/chat-service';
import type { ChatMessage, ThinkingDetails } from '../services/chat-service';
import {
  trackMetric,
  trackTimeToFirstAction,
  trackFollowUpClick,
  trackTabSwitch,
} from '../lib/ab-test-config';
import { trackEvent, setAnalyticsJurisdiction } from '../services/analytics-service';
import { US_STATES, US_TERRITORIES } from '../data/jurisdictions';

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

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-semibold">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-md transition-colors ${language === 'en' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}
        aria-label="English"
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-2 py-1 rounded-md transition-colors ${language === 'es' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}
        aria-label="Espanol"
      >
        ES
      </button>
    </div>
  );
}

export default function ChatV2() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const en = language === 'en';

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
      setJurisdictionConfirmed(true);
      setAnalyticsJurisdiction(value);
      trackEvent('jurisdiction_entered', { jurisdiction: value });
      try {
        localStorage.setItem('ezlegal-jurisdiction', value);
        localStorage.setItem('ezlegal-jurisdiction-confirmed', 'true');
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
  const [answerMode, setAnswerMode] = useState<AnswerMode>(() => language === 'es' ? 'spanish' : 'simple');
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingUrgentSignals, setPendingUrgentSignals] = useState<UrgentSignal[]>([]);
  const [pendingMessageContent, setPendingMessageContent] = useState<string | null>(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());
  const [hasTrackedFirstAction, setHasTrackedFirstAction] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [showJurisdictionPicker, setShowJurisdictionPicker] = useState(false);
  const [jurisdictionConfirmed, setJurisdictionConfirmed] = useState<boolean>(() => {
    try { return localStorage.getItem('ezlegal-jurisdiction-confirmed') === 'true'; } catch { return false; }
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previousSession, setPreviousSession] = useState<{ title: string; date: string; id: string } | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(() => {
    try { return sessionStorage.getItem('ezlegal-chat-privacy-accepted') === 'true'; } catch { return false; }
  });
  const [showHandoffForm, setShowHandoffForm] = useState(false);
  const [sensitiveDataWarning, setSensitiveDataWarning] = useState<string | null>(null);
  const [showWhyPanel, setShowWhyPanel] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didConsumePrefillRef = useRef(false);
  const [wasPrefilled, setWasPrefilled] = useState(false);

  useEffect(() => {
    trackMetric('chat_started', 1);

    if (didConsumePrefillRef.current) return;
    didConsumePrefillRef.current = true;

    try {
      const raw = window.sessionStorage.getItem('ez_chatbot_prefill');
      if (!raw) return;
      window.sessionStorage.removeItem('ez_chatbot_prefill');

      const sanitized = raw
        .slice(0, 4000)
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 1000);

      if (!sanitized) return;

      setInput(sanitized);
      setWasPrefilled(true);

      window.requestAnimationFrame(() => {
        inputRef.current?.focus?.();
        inputRef.current?.setSelectionRange?.(sanitized.length, sanitized.length);
      });
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  useEffect(() => {
    if (language === 'es' && answerMode !== 'spanish') setAnswerMode('spanish');
    else if (language === 'en' && answerMode === 'spanish') setAnswerMode('simple');
  }, [language]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (input.trim() && messages.length === 0) {
        trackEvent('intake_abandoned', { partial_input_length: input.trim().length });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('chat_messages')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const d = data as { id: string; content: string; created_at: string };
          const dateStr = new Date(d.created_at).toLocaleDateString(language === 'es' ? 'es' : 'en-US', {
            month: 'short', day: 'numeric',
          });
          setPreviousSession({
            id: d.id,
            title: d.content.substring(0, 60) + (d.content.length > 60 ? '...' : ''),
            date: dateStr,
          });
        }
      });
  }, [user?.id, language]);

  useEffect(() => {
    if (!user?.id) { setIsAdmin(false); return; }
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(Boolean((data as { is_admin?: boolean } | null)?.is_admin));
      });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('onboarding_tour_completed_at')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const completedAt = (data as { onboarding_tour_completed_at?: string | null } | null)
          ?.onboarding_tour_completed_at;
        if (completedAt) {
          // onboarding tour already completed
          try {
            localStorage.setItem('ezlegal-chat-tour-completed', 'true');
          } catch {
            // ignore
          }
        }
      });
  }, [user?.id]);

  useEffect(() => {
    chatService.setConfig({
      jurisdiction,
      modelOverride: isAdmin && selectedModel ? selectedModel : undefined,
      answerMode,
    });
    if (user?.id) {
      chatService.setUserId(user.id);
    }
  }, [user, jurisdiction, selectedModel, answerMode, isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const dispatchMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    if (!hasTrackedFirstAction) {
      trackTimeToFirstAction(sessionStartTime);
      setHasTrackedFirstAction(true);
    }

    trackMetric('first_question_submitted', messages.length === 0 ? 1 : 0);
    trackMetric('messages_sent', 1);

    if (messages.length === 0) {
      trackEvent('intake_started', { first_message_length: content.length });
      trackEvent('first_question_submitted', {
        jurisdiction: jurisdiction || 'unset',
        input_chars: content.length,
        language,
        prefill_used: wasPrefilled,
      });
    }
    trackEvent('ai_answer_requested', { message_count: messages.length + 1 });

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatMessage = await chatService.sendMessage(content.trim());

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
      const isFallback = response.modelUsed?.includes('Fallback') || response.modelUsed?.includes('Local');
      trackEvent('ai_answer_shown', { model: response.modelUsed || 'unknown' });
      if (isFallback) {
        trackEvent('chat_started', { type: response.modelUsed || 'fallback', jurisdiction: jurisdiction || 'unset', language });
      }
      trackEvent('intake_step_completed', { step: 'answer_received', message_count: messages.length + 2 });
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
  }, [isLoading, hasTrackedFirstAction, sessionStartTime, messages.length, en, jurisdiction, language, wasPrefilled]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (isLoading) return;
    if (!trimmed) {
      setValidationError(
        language === 'es'
          ? 'Describe tu problema legal. Este campo es obligatorio.'
          : 'Please describe your legal issue. This field is required.'
      );
      return;
    }
    if (!jurisdictionConfirmed) {
      setValidationError(
        language === 'es'
          ? 'Selecciona tu estado o jurisdicción para que la información sea relevante a tu situación.'
          : 'Please select your state or jurisdiction so the information is relevant to your situation.'
      );
      setShowJurisdictionPicker(true);
      return;
    }

    const sensitiveCheck = detectSensitiveData(trimmed);
    if (sensitiveCheck.detected && !sensitiveDataWarning) {
      setSensitiveDataWarning(
        language === 'es'
          ? disclaimerCopy.sensitiveDataWarning.es
          : disclaimerCopy.sensitiveDataWarning.en
      );
      trackEvent('sensitive_data_warning_shown', { types: sensitiveCheck.types.join(',') });
      return;
    }
    setSensitiveDataWarning(null);

    setValidationError(null);
    const signals = detectUrgentSignals(trimmed);
    if (signals.length > 0) {
      setPendingUrgentSignals(signals);
      setPendingMessageContent(trimmed);
      trackEvent('urgent_signal_detected', { signals: signals.map(s => s.category).join(',') });
      return;
    }
    void dispatchMessage(trimmed);
  }, [input, isLoading, dispatchMessage, language, sensitiveDataWarning]);

  const handleUrgentContinue = useCallback(() => {
    const content = pendingMessageContent;
    setPendingUrgentSignals([]);
    setPendingMessageContent(null);
    if (content) void dispatchMessage(content);
  }, [pendingMessageContent, dispatchMessage]);

  const handleUrgentDismiss = useCallback(() => {
    setPendingUrgentSignals([]);
    setPendingMessageContent(null);
  }, []);

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
    (m) => m.role === 'user' && detectCrisisSignal(m.content)
  );

  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id;

  function handleConversionAction(action: 'save' | 'checklist' | 'letter' | 'find_legal_help' | 'continue' | 'upgrade') {
    switch (action) {
      case 'save':
        window.location.href = '/dashboard?tab=cases';
        break;
      case 'checklist':
        setInput('Turn this into a numbered checklist I can follow.');
        inputRef.current?.focus();
        break;
      case 'letter':
        window.print();
        break;
      case 'find_legal_help':
        window.location.href = '/lawyer-profiles';
        break;
      case 'upgrade':
        window.location.href = '/pricing';
        break;
      case 'continue':
        handleNewChat();
        break;
      default:
        inputRef.current?.focus();
    }
  }

  return (
    <div className="flex h-screen bg-white" data-testid="intake-form">
      {!privacyAccepted && (
        <ChatPrivacyGate onAccept={() => setPrivacyAccepted(true)} />
      )}

      {showHandoffForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <HandoffRequestForm
            conversationSummary={messages.length > 0 ? messages.map(m => `${m.role}: ${m.content.slice(0, 200)}`).join('\n') : undefined}
            jurisdiction={jurisdiction}
            issueCategory={undefined}
            onClose={() => setShowHandoffForm(false)}
            onSuccess={() => {}}
          />
        </div>
      )}

      {pendingUrgentSignals.length > 0 && (
        <UrgentSignalCard
          signals={pendingUrgentSignals}
          onContinue={handleUrgentContinue}
          onDismiss={handleUrgentDismiss}
        />
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

      <JurisdictionModal
        open={showJurisdictionPicker}
        value={jurisdiction}
        onChange={(v) => {
          handleJurisdictionChange(v);
          setShowJurisdictionPicker(false);
        }}
        onClose={() => setShowJurisdictionPicker(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header
          role="banner"
          className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded"
              aria-label="ezLegal.ai"
            >
              <img
                src="/red-and-grey-minamali-business-card-2-1-2.svg"
                alt="ezLegal.ai"
                width={120}
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              {messages.length > 0 && (
                <AnswerModeSelector value={answerMode} onChange={setAnswerMode} compact />
              )}
              <UserMenu />
            </div>
          </div>

          {/* Compact trust/jurisdiction bar */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 px-4 py-1.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3 h-3 text-teal-600" aria-hidden="true" />
              {en ? 'AI legal information' : 'Información legal con IA'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-teal-600" aria-hidden="true" />
              {en ? 'Encrypted' : 'Cifrado'}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-teal-600" aria-hidden="true" />
              {jurisdiction
                ? `${(US_STATES.find(s => s.code === jurisdiction) || US_TERRITORIES.find(s => s.code === jurisdiction))?.name || jurisdiction} ${en ? 'law' : 'ley'}`
                : (en ? 'No state selected' : 'Sin estado seleccionado')}
              <button
                onClick={() => setShowJurisdictionPicker(true)}
                className="ml-1 font-medium text-teal-600 hover:text-teal-800 underline"
                data-testid="jurisdiction-input"
              >
                {en ? 'Change' : 'Cambiar'}
              </button>
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="py-4 sm:py-6 space-y-6">
                {/* Crisis strip */}
                <div className="flex justify-center">
                  <CrisisStrip variant="hero" />
                </div>

                {/* Resume previous session */}
                {previousSession && user && (
                  <div className="max-w-md mx-auto text-left p-3.5 bg-teal-50 border border-teal-200 rounded-xl">
                    <p className="text-[11px] font-medium text-teal-700 uppercase tracking-wide mb-0.5">
                      {en
                        ? `Continue your ${jurisdiction || ''} issue`
                        : `Continúa tu asunto ${jurisdiction ? `de ${jurisdiction}` : ''}`}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{previousSession.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {en ? `Last updated ${previousSession.date}` : `Actualizado ${previousSession.date}`}
                    </p>
                    <div className="flex gap-2 mt-2.5">
                      <button
                        onClick={() => inputRef.current?.focus()}
                        className="px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        {en ? 'Continue' : 'Continuar'}
                      </button>
                      <Link
                        to="/dashboard/action-plan"
                        className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-white border border-teal-300 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        {en ? 'View next steps' : 'Ver próximos pasos'}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Urgency screening */}
                <UrgencyScreening
                  onSelect={(urgency) => {
                    trackEvent('persona_intake_step', { step: 'urgency', urgency });
                    if (urgency === 'unsafe') {
                      trackEvent('urgent_signal_detected', { signals: 'unsafe_threatened' });
                    } else if (urgency === 'deadline') {
                      setInput(en ? 'I have a court date or deadline coming up and need to prepare.' : 'Tengo una fecha de corte o plazo próximo y necesito prepararme.');
                      inputRef.current?.focus();
                    } else if (urgency === 'losing') {
                      setInput(en ? 'I may lose my housing, income, or benefits soon and need help.' : 'Podría perder mi vivienda, ingresos o beneficios pronto y necesito ayuda.');
                      inputRef.current?.focus();
                    }
                  }}
                />

                {/* Issue category cards */}
                <IssueCategoryGrid
                  onSelect={(prompt) => {
                    if (prompt) {
                      setInput(prompt);
                      inputRef.current?.focus();
                    } else {
                      inputRef.current?.focus();
                    }
                    trackEvent('issue_card_clicked', { prompt: prompt.slice(0, 40) });
                  }}
                />

                {isAdmin && (
                  <div className="max-w-4xl mx-auto">
                    <AIModelSelector
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                      variant="compact"
                      label={en ? 'Admin: Select AI Model' : 'Admin: Seleccionar Modelo de IA'}
                      showDescription={false}
                    />
                  </div>
                )}

                {/* Example questions */}
                {(() => {
                  const state = jurisdiction || (en ? 'your state' : 'tu estado');
                  const allSuggestions = [
                    en ? `Can my landlord raise rent mid-lease in ${state}?` : `¿Puede mi arrendador subir la renta a mitad del contrato en ${state}?`,
                    en ? `What happens if I miss my court date in ${state}?` : `¿Qué pasa si pierdo mi fecha de corte en ${state}?`,
                    en ? `How do I get my security deposit back in ${state}?` : `¿Cómo recupero mi depósito de seguridad en ${state}?`,
                  ];

                  return (
                    <div className="max-w-lg mx-auto">
                      <p className="text-xs font-medium text-slate-500 text-center mb-2">
                        {en ? 'Or try an example:' : 'O prueba un ejemplo:'}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {allSuggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setInput(suggestion);
                              inputRef.current?.focus();
                            }}
                            className="text-left px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
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
                      <div className="space-y-3" data-testid="ai-answer">
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

                        {message.id === lastAssistantId && !isLoading && (
                          <>
                            <FinalActionCards
                              onAction={(action) => {
                                if (action === 'next-steps') handleConversionAction('save');
                                else if (action === 'legal-help') handleConversionAction('find_legal_help');
                                else if (action === 'documents') handleConversionAction('letter');
                                else if (action === 'follow-up') handleConversionAction('continue');
                              }}
                            />
                            <EthicalConversionPanel onAction={handleConversionAction} />
                          </>
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
                      ? 'Describe your issue in your own words...'
                      : 'Describa su problema con sus propias palabras...'
                  }
                  rows={1}
                  data-testid="issue-description"
                  className="w-full px-4 py-3 pr-24 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  disabled={isLoading}
                />
                {showAdvancedFeatures && (
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      aria-label={en ? 'Attach file' : 'Adjuntar archivo'}
                      title={en ? 'Attach document (redact sensitive info like SSN before sharing)' : 'Adjuntar documento (oculte información sensible como NSS antes de compartir)'}
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
                disabled={isLoading}
                data-testid="submit-intake"
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

            {validationError && (
              <p data-testid="field-error" className="mt-2 text-xs text-red-600" role="alert">
                {validationError}
              </p>
            )}

            {sensitiveDataWarning && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg" role="alert">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-xs text-amber-800 font-medium">{sensitiveDataWarning}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => { setSensitiveDataWarning(null); inputRef.current?.focus(); }}
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-amber-300 text-amber-800 rounded-lg hover:bg-amber-50 transition-colors"
                      >
                        {en ? 'Edit my message' : 'Editar mi mensaje'}
                      </button>
                      <button
                        onClick={() => { setSensitiveDataWarning(null); void dispatchMessage(input.trim()); }}
                        className="px-3 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
                      >
                        {en ? 'Send anyway' : 'Enviar de todas formas'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-2 text-[11px] text-slate-500 text-center">
              {en
                ? "You'll get a plain-language explanation, possible next steps, and sources when available."
                : 'Recibirá una explicación en lenguaje sencillo, posibles próximos pasos y fuentes cuando estén disponibles.'}
            </p>

            <div className="mt-3 flex items-start justify-between gap-3">
              <ChatDisclaimer />
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm(en ? 'Delete this conversation? This cannot be undone.' : 'Eliminar esta conversación? No se puede deshacer.')) {
                        handleNewChat();
                        trackEvent('conversation_deleted', {});
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 transition-colors"
                    aria-label={en ? 'Delete conversation' : 'Eliminar conversación'}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">{en ? 'Delete' : 'Eliminar'}</span>
                  </button>
                )}
                <MoreHelpDrawer
                  onExportChat={() => console.log('Export')}
                  onShareChat={() => console.log('Share')}
                  onPrediction={() => console.log('Prediction')}
                  onReportIssue={() => console.log('Report')}
                  hasMessages={messages.length > 0}
                />
              </div>
            </div>

            {/* Why am I seeing this? - Audit panel */}
            {messages.length > 0 && (
              <details className="mt-2 text-[11px]">
                <summary className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
                  {en ? 'Why am I seeing this?' : 'Por qué veo esto?'}
                </summary>
                <div className="mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 space-y-1">
                  <p><span className="font-medium">{en ? 'Jurisdiction:' : 'Jurisdicción:'}</span> {jurisdiction || (en ? 'Not set' : 'No establecida')}</p>
                  <p><span className="font-medium">{en ? 'Language:' : 'Idioma:'}</span> {en ? 'English' : 'Español'}</p>
                  <p><span className="font-medium">{en ? 'Answer mode:' : 'Modo de respuesta:'}</span> {answerMode}</p>
                  {pendingUrgentSignals.length > 0 && (
                    <p><span className="font-medium text-amber-700">{en ? 'Urgency detected:' : 'Urgencia detectada:'}</span> {pendingUrgentSignals.map(s => s.category).join(', ')}</p>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

```

---

## src/pages/Login.tsx

```tsx
import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import TrustBadges, { SecurityDisclosure } from '../components/TrustBadges';
import { Shield, Zap, Lock, Globe, Loader2 } from 'lucide-react';
import { translateAuthError } from '../lib/microcopy';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const { signIn, signInWithOAuth } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(translateAuthError(error.message, language));
      setLoading(false);
    } else {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setError('');
    setOauthLoading(provider);
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    const { error } = await signInWithOAuth(provider, `${window.location.origin}${redirectTo}`);
    if (error) {
      setError(translateAuthError(error.message, language));
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-navy-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-navy-900 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
          aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Español' : 'English'}</span>
        </button>
      </div>

      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block">
            <div className="text-center mb-6">
              <img
                src="/red-and-grey-minamali-business-card-2-1-2.svg"
                alt="ezLegal.ai"
                className="h-14 w-auto mx-auto mb-6"
              />
            </div>

            <h1 className="text-3xl font-bold text-navy-900 mb-4">
              {t('login.welcomeBack')}
            </h1>
            <p className="text-lg text-navy-600 mb-8">
              {t('login.continueHelp')}
            </p>

            <div className="bg-gradient-to-br from-navy-50 to-white rounded-xl p-6 mb-6 border border-navy-200">
              <div className="text-2xl font-bold text-teal-600 mb-2">{t('login.freeToStart')}</div>
              <div className="text-navy-600 font-medium mb-1">{t('login.freeForever')}</div>
              <div className="text-sm text-navy-600">{t('login.noCreditCard')}</div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-navy-600">
                <div className="w-8 h-8 bg-navy-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-teal-600" />
                </div>
                <span><strong>{t('login.ethicalAi')}</strong> {t('login.neverTrains')}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-navy-600">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <span><strong>{t('login.access247')}</strong> {t('login.wheneverYouNeed')}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-navy-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-blue-600" />
                </div>
                <span><strong>{t('login.bankSecurity')}</strong> {t('login.encryption')}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-center mb-6 md:hidden">
              <img
                src="/red-and-grey-minamali-business-card-2-1-2.svg"
                alt="ezLegal.ai"
                className="h-12 w-auto mx-auto mb-4"
              />
              <p className="text-navy-600">{t('auth.login.subtitle')}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={oauthLoading !== null}
                  className="w-full bg-white hover:bg-navy-50 text-navy-800 font-medium py-3 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Continue with Google"
                >
                  {oauthLoading === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthLogin('azure')}
                  disabled={oauthLoading !== null}
                  className="w-full bg-white hover:bg-navy-50 text-navy-800 font-medium py-3 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Continue with Microsoft"
                >
                  {oauthLoading === 'azure' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                  )}
                  Continue with Microsoft
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-navy-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-navy-500">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy-600 mb-2">
                    {t('auth.login.email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-navy-600">
                      {t('auth.login.password')}
                    </label>
                    <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                      {t('auth.login.forgot')}
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                    placeholder={t('login.enterPassword')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('login.signingIn') : t('auth.login.submit')}
                </button>
              </form>

              <div className="mt-6 text-center text-sm space-y-2">
                <div>
                  <span className="text-navy-600">{t('auth.login.noAccount')} </span>
                  <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                    {t('auth.login.signUp')}
                  </Link>
                </div>
                <div>
                  <Link to="/pricing" className="text-navy-600 hover:text-teal-600 font-medium">
                    {t('login.viewPricing')}
                  </Link>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-navy-200">
                <TrustBadges variant="inline" className="justify-center" />
              </div>

              <SecurityDisclosure className="mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## src/pages/Signup.tsx

```tsx
import { useState } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Shield, Users, CheckCircle, Zap, DollarSign, Lock,
  ArrowRight, Star, TrendingUp, Globe, Loader2
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { translateAuthError } from '../lib/microcopy';
import { setPendingPlan, readPendingPlan } from '../lib/plan-context';
import { recordConsent } from '../lib/consent';
import { trackEvent } from '../services/analytics-service';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const { signUp, signInWithOAuth } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError(t('auth.signup.passwordMismatch'));
    }

    if (password.length < 6) {
      return setError(t('auth.signup.passwordWeak'));
    }

    if (!ageConfirmed) {
      return setError(
        language === 'en'
          ? 'You must be at least 13 years old to create an account.'
          : 'Debes tener al menos 13 años para crear una cuenta.'
      );
    }

    setLoading(true);
    trackEvent('signup_started', { source: 'signup_page' });

    const planParam = searchParams.get('plan');
    if (planParam) setPendingPlan(planParam, 'signup');

    const { error } = await signUp(email, password);

    if (error) {
      setError(translateAuthError(error.message, language));
      setLoading(false);
    } else {
      trackEvent('signup_completed', { source: 'signup_page' });
      void recordConsent({
        consentType: 'privacy_notice',
        source: 'signup_age_gate',
        language,
      });
      const pending = readPendingPlan();
      const redirectTo =
        (location.state as { redirectTo?: string })?.redirectTo ||
        searchParams.get('redirect') ||
        (pending ? `/checkout?plan=${pending.planId}` : '/dashboard');
      navigate(redirectTo);
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'azure') => {
    setError('');
    setOauthLoading(provider);
    const planParam = searchParams.get('plan');
    if (planParam) setPendingPlan(planParam, 'signup-oauth');
    const pending = readPendingPlan();
    const redirectTo =
      (location.state as { redirectTo?: string })?.redirectTo ||
      searchParams.get('redirect') ||
      (pending ? `/checkout?plan=${pending.planId}` : '/dashboard');
    const { error } = await signInWithOAuth(provider, `${window.location.origin}${redirectTo}`);
    if (error) {
      setError(translateAuthError(error.message, language));
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <div className="absolute top-20 right-4 z-10">
        <button
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-navy-900 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
          aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Español' : 'English'}</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-2 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{t('signup.freeBanner')}</span>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-navy-50 to-navy-50/30 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="hidden lg:block">
              <h1 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-4">
                {t('signup.heroTitle')}{' '}
                <span className="text-teal-600">{t('signup.heroHighlight')}</span>{' '}
                {t('signup.heroSuffix')}
              </h1>
              <p className="text-xl text-navy-600 mb-8 leading-relaxed">
                {t('signup.heroSubtitle')}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-success-200 ring-2 ring-success-100">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <div className="font-bold text-navy-900 mb-1">{t('signup.benefit1Title')}</div>
                    <div className="text-sm text-navy-600">{t('signup.benefit1Desc')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-navy-200">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 mb-1">{t('signup.benefit2Title')}</div>
                    <div className="text-sm text-navy-600">{t('signup.benefit2Desc')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-navy-200">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 mb-1">{t('signup.benefit3Title')}</div>
                    <div className="text-sm text-navy-600">{t('signup.benefit3Desc')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-navy-200">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 mb-1">{t('signup.benefit4Title')}</div>
                    <div className="text-sm text-navy-600">{t('signup.benefit4Desc')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-navy-900 font-semibold">
                  <Users className="w-4 h-4" />
                  <span>{t('signup.socialProof')}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-center mb-6 lg:hidden">
                <h1 className="text-2xl font-bold text-navy-900 mb-2">
                  {t('signup.mobileTitle')}
                </h1>
                <p className="text-navy-600">{t('signup.mobileSubtitle')}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-navy-200">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1 rounded-full mb-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{t('signup.freeForever')}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 mb-2">
                    {t('signup.formTitle')}
                  </h2>
                  <p className="text-sm text-navy-600">
                    {t('signup.formSubtitle')}
                  </p>
                </div>

                <div className="bg-success-50 border border-success-200 rounded-xl p-4 mb-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-success-700 font-bold text-sm mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('signup.unlimitedQuestions')}</span>
                  </div>
                  <p className="text-success-600 text-xs">
                    {t('signup.payOnlyForPacks')}
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignup('google')}
                    disabled={oauthLoading !== null || loading}
                    className="w-full bg-white hover:bg-navy-50 text-navy-800 font-medium py-3 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('signup.continueGoogle')}
                  >
                    {oauthLoading === 'google' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    {t('signup.continueGoogle')}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthSignup('azure')}
                    disabled={oauthLoading !== null || loading}
                    className="w-full bg-white hover:bg-navy-50 text-navy-800 font-medium py-3 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('signup.continueMicrosoft')}
                  >
                    {oauthLoading === 'azure' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 23 23" aria-hidden="true">
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                      </svg>
                    )}
                    {t('signup.continueMicrosoft')}
                  </button>
                </div>

                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-navy-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-navy-500">{t('signup.orEmail')}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm" role="alert">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-2">
                      {t('auth.signup.email')}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="email"
                      className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-navy-900 placeholder-navy-400"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-navy-700 mb-2">
                      {t('auth.signup.password')}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-navy-900 placeholder-navy-400"
                      placeholder={t('signup.createPassword')}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-700 mb-2">
                      {t('auth.signup.confirm')}
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-navy-900 placeholder-navy-400"
                      placeholder={t('signup.confirmPassword')}
                    />
                  </div>

                  <label className="flex items-start gap-2 text-sm text-navy-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-navy-300 text-teal-600 focus:ring-teal-500"
                      required
                    />
                    <span>
                      {language === 'en'
                        ? 'I confirm I am at least 13 years old and agree to the '
                        : 'Confirmo que tengo al menos 13 años y acepto los '}
                      <Link to="/terms" className="text-teal-700 underline hover:text-teal-800">
                        {language === 'en' ? 'Terms' : 'Términos'}
                      </Link>
                      {language === 'en' ? ' and ' : ' y la '}
                      <Link to="/privacy" className="text-teal-700 underline hover:text-teal-800">
                        {language === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
                      </Link>
                      {'.'}
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading || !ageConfirmed}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      t('signup.creating')
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {t('signup.createFreeAccount')}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-xs text-navy-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-success-500" />
                      <span>{t('hero.noCreditCard')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-success-500" />
                      <span>{t('signup.guarantee')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-success-500" />
                      <span>{t('signup.secure')}</span>
                    </div>
                  </div>
                </form>

                <div className="mt-6 text-center text-sm space-y-3">
                  <div>
                    <span className="text-navy-600">{t('auth.signup.hasAccount')} </span>
                    <Link to="/login" className="text-teal-600 hover:text-navy-700 font-medium">
                      {t('auth.signup.signIn')}
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-navy-200">
                    <div className="flex items-center justify-center gap-4 text-xs text-navy-500">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>{t('login.bankSecurity')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t('trust.ssl')}</span>
                      </div>
                    </div>
                    <p className="text-xs text-navy-400 mt-2">
                      {t('signup.agreeTerms')}{' '}
                      <Link to="/terms" className="text-teal-600 hover:underline">{t('auth.signup.termsLink')}</Link>
                      {' '}{t('auth.signup.and')}{' '}
                      <Link to="/privacy" className="text-teal-600 hover:underline">{t('auth.signup.privacyLink')}</Link>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center lg:hidden">
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-navy-600">
                    <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                    <span>{t('signup.fiveStarRated')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-navy-600">
                    <TrendingUp className="w-4 h-4 text-success-500" />
                    <span>{t('signup.savingsAmount')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

```

---

## src/pages/ForgotPassword.tsx

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, ArrowLeft, CheckCircle, Globe } from 'lucide-react';
import { translateAuthError } from '../lib/microcopy';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(translateAuthError(error.message, language));
      setLoading(false);
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-navy-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-navy-900 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
          aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Español' : 'English'}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/red-and-grey-minamali-business-card-2-1-2.svg"
            alt="ezLegal.ai"
            className="h-14 w-auto mx-auto mb-6"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {emailSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mb-2">{t('forgot.checkEmail')}</h1>
              <p className="text-navy-600 mb-6">
                {t('forgot.sentTo')} <strong>{email}</strong>. {t('forgot.clickLink')}
              </p>
              <p className="text-sm text-navy-500 mb-6">
                {t('forgot.checkSpam')}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                >
                  {t('forgot.tryAgain')}
                </button>
                <Link
                  to="/login"
                  className="block w-full text-center text-teal-600 hover:text-teal-500 font-medium py-2"
                >
                  {t('auth.forgot.back')}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-teal-600" />
                </div>
                <h1 className="text-2xl font-bold text-navy-900 mb-2">{t('auth.forgot.title')}</h1>
                <p className="text-navy-600">
                  {t('auth.forgot.subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy-600 mb-2">
                    {t('auth.forgot.email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('forgot.sending') : t('auth.forgot.submit')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-500 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('auth.forgot.back')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

```

---

## src/pages/ResetPassword.tsx

```tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(true);
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setIsValidSession(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  if (!isValidSession && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-navy-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/red-and-grey-minamali-business-card-2-1-2.svg"
              alt="ezLegal.ai"
              className="h-14 w-auto mx-auto mb-6"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mb-2">Invalid or Expired Link</h1>
              <p className="text-navy-600 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-4 rounded-lg transition-all text-center"
              >
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-navy-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/red-and-grey-minamali-business-card-2-1-2.svg"
            alt="ezLegal.ai"
            className="h-14 w-auto mx-auto mb-6"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mb-2">Password Updated</h1>
              <p className="text-navy-600 mb-6">
                Your password has been successfully reset. You will be redirected to sign in shortly.
              </p>
              <Link
                to="/login"
                className="inline-block w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-4 rounded-lg transition-all text-center"
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-teal-600" />
                </div>
                <h1 className="text-2xl font-bold text-navy-900 mb-2">Create New Password</h1>
                <p className="text-navy-600">
                  Enter your new password below. Make sure it's at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-navy-600 mb-2">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-600 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

```

---

## src/pages/Pricing.tsx

```tsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Shield, HelpCircle, Globe, ArrowRight, Zap } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PricingCard from '../components/pricing/PricingCard';
import HelpMeChoose from '../components/pricing/HelpMeChoose';
import PricingFAQ from '../components/pricing/PricingFAQ';
import MarketplaceSection from '../components/pricing/MarketplaceSection';
import ComparisonTable from '../components/pricing/ComparisonTable';
import { pricingAudiences } from '../data/pricing';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEngagement } from '../services/engagement-service';

type AudienceId = 'individuals' | 'business' | 'legal-aid';

const TAB_IDS: AudienceId[] = ['individuals', 'business', 'legal-aid'];

export default function Pricing() {
  const { language } = useLanguage();
  const l = language === 'es' ? 'es' : 'en';
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('audience') as AudienceId) || 'individuals';
  const [activeTab, setActiveTab] = useState<AudienceId>(TAB_IDS.includes(initialTab) ? initialTab : 'individuals');
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const param = searchParams.get('audience') as AudienceId;
    if (param && TAB_IDS.includes(param) && param !== activeTab) {
      setActiveTab(param);
    }
  }, [searchParams]);

  const handleTabChange = (id: AudienceId) => {
    setActiveTab(id);
    setSearchParams({ audience: id });
    trackEngagement({
      featureName: 'pricing_tab_selected',
      engagementType: 'click',
      metadata: { tab: id },
    });
  };

  const currentAudience = pricingAudiences.find((a) => a.id === activeTab) ?? pricingAudiences[0];

  const mainPlans = currentAudience.plans.filter((p) => !p.isAddOn);
  const addOnPlans = currentAudience.plans.filter((p) => p.isAddOn);

  const gridCols = mainPlans.length >= 4
    ? 'sm:grid-cols-2 lg:grid-cols-4'
    : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main id="main-content" className="pt-16">
        {/* Compressed Hero */}
        <section className="pt-6 pb-4 sm:pt-8 sm:pb-5 bg-slate-50 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2 leading-tight">
              {l === 'es'
                ? 'Comienza gratis. Mejora solo cuando necesites mas ayuda.'
                : 'Start free. Upgrade only when you need more help.'
              }
            </h1>
            <p className="text-sm sm:text-base text-navy-600 max-w-xl mx-auto mb-2">
              {l === 'es'
                ? 'Haz preguntas legales, entiende documentos y prepara proximos pasos en ingles o espanol.'
                : 'Ask legal questions, understand documents, and prepare next steps in English or Spanish.'
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <p className="inline-flex items-center gap-1.5 text-xs text-navy-500">
                <Shield className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />
                {l === 'es'
                  ? 'Enlaces de ayuda urgente gratis. Respuestas claras. No es asesoria legal.'
                  : 'Free urgent-help links. Plain-language answers. Not legal advice.'
                }
              </p>
              <p className="inline-flex items-center gap-1.5 text-xs text-navy-500">
                <Globe className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />
                Available in English and Spanish / Disponible en inglés y español
              </p>
            </div>
          </div>
        </section>

        {/* Tabs + Cards */}
        <section className="py-6 sm:py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Tabs */}
            <div className="flex flex-col items-center gap-2 mb-5">
              <div
                className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200"
                role="tablist"
                aria-label={l === 'es' ? 'Tipo de audiencia' : 'Audience type'}
              >
                {pricingAudiences.map((aud) => (
                  <button
                    key={aud.id}
                    role="tab"
                    aria-selected={activeTab === aud.id}
                    onClick={() => handleTabChange(aud.id)}
                    className={`px-4 sm:px-5 py-2 text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
                      activeTab === aud.id
                        ? 'bg-white text-navy-900 shadow-sm'
                        : 'text-navy-500 hover:text-navy-700'
                    }`}
                  >
                    {aud.label[l]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowWizard(true);
                  document.getElementById('help-me-choose')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs text-navy-400 hover:text-teal-600 transition-colors"
              >
                {l === 'es' ? 'No estás seguro? Ayúdame a elegir.' : 'Not sure? Help me choose.'}
              </button>
            </div>

            {/* Audience headline + subline */}
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-navy-700">{currentAudience.headline[l]}</p>
              {currentAudience.subline && (
                <p className="text-xs text-navy-500 mt-1 max-w-lg mx-auto">{currentAudience.subline[l]}</p>
              )}
            </div>

            {/* Main plan cards */}
            <div
              className={`grid gap-4 ${gridCols}`}
              role="tabpanel"
              aria-label={currentAudience.label[l]}
            >
              {mainPlans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} language={l} />
              ))}
            </div>

            {/* Add-on cards (Boost) */}
            {addOnPlans.length > 0 && (
              <div className="mt-6 max-w-lg mx-auto">
                {addOnPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                        <Zap className="w-4 h-4 text-amber-700" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-navy-900">
                          {plan.name[l]} — {plan.price[l]} {plan.priceNote && <span className="font-normal text-navy-500">{plan.priceNote[l]}</span>}
                          {!plan.isFinalPrice && <span className="ml-1 text-[10px] text-amber-600 font-medium">{l === 'es' ? 'precio piloto' : 'pilot pricing'}</span>}
                        </p>
                        <p className="text-xs text-navy-600 mt-0.5">{plan.description[l]}</p>
                      </div>
                    </div>
                    <Link
                      to={plan.ctaHref}
                      onClick={() => {
                        trackEngagement({
                          featureName: 'pricing_plan_cta_clicked',
                          engagementType: 'click',
                          metadata: { planId: plan.id, audience: plan.audience },
                        });
                      }}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-navy-900 bg-white border border-navy-300 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {plan.ctaLabel[l]}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Help Me Choose trigger */}
            <div id="help-me-choose" className="mt-8 text-center">
              <button
                onClick={() => {
                  setShowWizard(true);
                  trackEngagement({
                    featureName: 'pricing_help_me_choose_started',
                    engagementType: 'click',
                    metadata: {},
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                {l === 'es' ? 'Ayudame a elegir' : 'Help me choose'}
              </button>
            </div>

            {/* Wizard */}
            {showWizard && (
              <div className="mt-6">
                <HelpMeChoose language={l} onClose={() => setShowWizard(false)} />
              </div>
            )}
          </div>
        </section>

        {/* Comparison table (individuals only) */}
        {activeTab === 'individuals' && <ComparisonTable language={l} />}

        {/* Marketplace */}
        <MarketplaceSection language={l} />

        {/* FAQ */}
        <PricingFAQ language={l} />

        {/* Ethical pricing line */}
        <section className="py-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs text-navy-500 leading-relaxed">
              {l === 'es'
                ? 'ezLegal.ai proporciona informacion legal, no asesoramiento legal. Los recursos gratuitos y de ayuda urgente no se clasifican por quien nos paga.'
                : 'ezLegal.ai provides legal information, not legal advice. Free and urgent-help resources are not ranked by who pays us.'
              }
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

```

---

## src/pages/Checkout.tsx

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
import { trackEvent } from '../services/analytics-service';
import AccessToJusticeScreening, { hasCompletedA2JScreening } from '../components/AccessToJusticeScreening';

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
    description: { en: 'Divorce, custody, and family court guidance', es: 'Orientación sobre divorcio, custodia y tribunal familiar' },
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
      es: ['Rango de probabilidad', 'Analisis de factores', 'Comparaciones de casos', 'Próximos pasos'],
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
  const lang = language === 'en' ? 'en' : 'es';

  const queryPlan = searchParams.get('plan');
  const pending = readPendingPlan();
  const plan = queryPlan || pending?.planId || 'housing';
  const product = PRODUCT_DETAILS[plan] || PRODUCT_DETAILS['housing'];
  const price = PRICES[plan] || 29;

  const [a2jPassed, setA2jPassed] = useState(() => hasCompletedA2JScreening());
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
            {language === 'en' ? 'Sign in to continue' : 'Inicia sesion para continuar'}
          </h1>
          <p className="text-navy-600 mb-6">
            {language === 'en' ? 'Create a free account to complete your purchase and access your materials.' : 'Crea una cuenta gratis para completar tu compra y acceder a tus materiales.'}
          </p>
          <Link
            to={`/login?redirect=${encodeURIComponent(`/checkout?plan=${plan}`)}`}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            {language === 'en' ? 'Sign In to Continue' : 'Iniciar Sesion'}
          </Link>
          <p className="text-xs text-navy-500 mt-3">
            {language === 'en' ? 'No credit card required for account creation' : 'No se requiere tarjeta para crear cuenta'}
          </p>
        </div>
      </div>
    );
  }

  const showA2JScreening = !isBusiness && !isOrganization && !a2jPassed;

  if (showA2JScreening) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
        <AccessToJusticeScreening onContinueToCheckout={() => setA2jPassed(true)} />
      </div>
    );
  }

  const handleSubmitPayment = async () => {
    setProcessing(true);
    setErrorMsg('');
    setWaitlistMsg('');
    trackEvent('payment_started', { plan });
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) {
        setErrorMsg(language === 'en' ? 'Your session expired. Please sign in again.' : 'Sesion expirada. Inicia sesion de nuevo.');
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
        setErrorMsg(data?.error ?? (language === 'en' ? 'Could not start checkout.' : 'No se pudo iniciar el pago.'));
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
        language === 'en'
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
              <span>{language === 'en' ? 'Secure Checkout' : 'Pago Seguro'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="sr-only">{language === 'en' ? 'Secure Checkout' : 'Pago Seguro'}</h1>
        <button
          onClick={() => step === 'review' ? navigate(-1) : setStep('review')}
          className="flex items-center gap-2 text-navy-600 hover:text-navy-900 mb-6 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'review'
            ? (language === 'en' ? 'Back' : 'Volver')
            : (language === 'en' ? 'Back to review' : 'Volver a revision')}
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
                {s === 'review' ? (language === 'en' ? 'Review' : 'Revision') :
                 s === 'payment' ? (language === 'en' ? 'Payment' : 'Pago') :
                 (language === 'en' ? 'Confirmation' : 'Confirmacion')}
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
                  {language === 'en' ? 'Order Review' : 'Revision del Pedido'}
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
                      {language === 'en' ? 'Organization plans include multi-seat licensing and grant-eligible invoicing.' : 'Planes de organizacion incluyen licencias multi-usuario.'}
                    </p>
                  </div>
                )}

                {isBusiness && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      {language === 'en' ? 'Business plans include priority support and team sharing.' : 'Planes de negocios incluyen soporte prioritario.'}
                    </p>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">{language === 'en' ? '7-day satisfaction guarantee' : 'Garantia de 7 dias'}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1 ml-6">
                    {language === 'en' ? 'Full refund if not satisfied. No questions asked.' : 'Reembolso completo si no estas satisfecho.'}
                  </p>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {language === 'en' ? 'Continue to Payment' : 'Continuar al Pago'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sm:p-8">
                <div className="text-center mb-6">
                  <CreditCard className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-navy-900">{language === 'en' ? 'Payment' : 'Pago'}</h2>
                </div>

                <div className="bg-navy-50 border border-navy-200 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-navy-900 text-sm">{language === 'en' ? 'Payment Security' : 'Seguridad de Pago'}</h3>
                      <p className="text-xs text-navy-600 mb-2">
                        {language === 'en' ? 'Your connection is protected with TLS 1.3 encryption. Payment processing via Stripe is in progress.' : 'Tu conexion esta protegida con cifrado TLS 1.3. El procesamiento de pagos via Stripe esta en progreso.'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-navy-500">
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> TLS 1.3</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> AES-256</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> {language === 'en' ? 'Stripe (coming soon)' : 'Stripe (proximamente)'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">{language === 'en' ? 'Email for receipt' : 'Email para recibo'}</label>
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
                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> {language === 'en' ? 'Processing...' : 'Procesando...'}</>
                  ) : (
                    <><Lock className="w-4 h-4" /> {language === 'en' ? `Pay $${price}` : `Pagar $${price}`}</>
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
                    {language === 'en' ? 'Purchase Complete!' : 'Compra Completada!'}
                  </h2>
                  <p className="text-navy-600">
                    {language === 'en' ? 'Your materials are ready in your dashboard.' : 'Tus materiales estan listos en tu panel.'}
                  </p>
                </div>

                <div className="bg-navy-50 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-navy-900 mb-3">
                    {language === 'en' ? 'What happens next' : 'Que sigue'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: Download, text: language === 'en' ? 'Download your action plan and templates now' : 'Descarga tu plan de accion y plantillas ahora' },
                      { icon: FileText, text: language === 'en' ? 'Fill in templates with your specific details' : 'Completa las plantillas con tus datos' },
                      { icon: Calendar, text: language === 'en' ? 'Review your deadline checklist and key dates' : 'Revisa tu lista de fechas limite' },
                      { icon: Mail, text: language === 'en' ? 'Receipt sent to ' + email : 'Recibo enviado a ' + email },
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

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center">
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">{language === 'en' ? 'Refund policy:' : 'Politica de reembolso:'}</span>{' '}
                    {language === 'en' ? '7-day full refund if not satisfied. Contact support@ezlegal.ai' : '7 dias de reembolso completo. Contacta support@ezlegal.ai'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/dashboard"
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {language === 'en' ? 'Go to Dashboard' : 'Ir al Panel'}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/find-attorney"
                    className="flex-1 bg-white hover:bg-navy-50 text-navy-700 font-semibold py-4 px-6 rounded-xl transition-all border border-navy-300 flex items-center justify-center gap-2"
                  >
                    {language === 'en' ? 'Find an Attorney' : 'Encontrar Abogado'}
                  </Link>
                </div>

                <p className="text-center text-xs text-navy-500 mt-4">
                  {language === 'en' ? 'Need help? Email support@ezlegal.ai' : 'Necesitas ayuda? Email support@ezlegal.ai'}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4">{language === 'en' ? 'Order Summary' : 'Resumen del Pedido'}</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">{product?.name[lang] || plan}</p>
                    <p className="text-xs text-navy-500">{language === 'en' ? 'One-time purchase' : 'Compra unica'}</p>
                  </div>
                  <p className="font-bold text-navy-900">${price}</p>
                </div>
              </div>
              <div className="border-t border-navy-200 pt-3 mb-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-navy-900">{language === 'en' ? 'Total' : 'Total'}</span>
                  <span className="text-teal-600">${price}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-navy-500">
                <div className="flex items-center gap-2"><Lock className="w-3 h-3 text-green-600" /> TLS 1.3 + AES-256</div>
                <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-green-600" /> {language === 'en' ? '7-day refund guarantee' : 'Garantia de 7 dias'}</div>
                <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-green-600" /> {language === 'en' ? 'Instant access' : 'Acceso instantaneo'}</div>
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

