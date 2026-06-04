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
              {en ? 'Legal information only' : 'Solo información legal'}
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
            <span className="inline-flex items-center gap-1 font-medium">
              {language === 'en' ? 'EN' : 'ES'}
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
