import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Mic, Paperclip, Sparkles, ArrowUp, ChevronDown, MessageSquare, FileText, Clock, Search } from 'lucide-react';
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
import JurisdictionSelector from '../components/shared/JurisdictionSelector';
import UserMenu from '../components/UserMenu';
import { detectUrgentSignals, type UrgentSignal } from '../lib/urgent-signal-detector';
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
  const actionSteps: Message['parsed']['actionSteps'] = [];
  const sources: Message['parsed']['sources'] = [];

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
  const [answerMode, setAnswerMode] = useState<AnswerMode>('simple');
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingUrgentSignals, setPendingUrgentSignals] = useState<UrgentSignal[]>([]);
  const [pendingMessageContent, setPendingMessageContent] = useState<string | null>(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());
  const [hasTrackedFirstAction, setHasTrackedFirstAction] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [showJurisdictionPicker, setShowJurisdictionPicker] = useState(false);
  const [previousSession, setPreviousSession] = useState<{ title: string; date: string; id: string } | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackMetric('chat_started', 1);
  }, []);

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
  }, [isLoading, hasTrackedFirstAction, sessionStartTime, messages.length, en]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const signals = detectUrgentSignals(trimmed);
    if (signals.length > 0) {
      setPendingUrgentSignals(signals);
      setPendingMessageContent(trimmed);
      return;
    }
    void dispatchMessage(trimmed);
  }, [input, isLoading, dispatchMessage]);

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
        setInput('Draft a letter I can send based on this.');
        inputRef.current?.focus();
        break;
      case 'find_legal_help':
        window.location.href = '/lawyer-profiles';
        break;
      case 'upgrade':
        window.location.href = '/pricing';
        break;
      case 'continue':
      default:
        inputRef.current?.focus();
    }
  }

  return (
    <div className="flex h-screen bg-white">
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
              {/* Language toggle */}
              <LanguageToggle />
              {messages.length > 0 && (
                <AnswerModeSelector value={answerMode} onChange={setAnswerMode} compact />
              )}
              <UserMenu />
            </div>
          </div>
        </header>
        <UnifiedTrustStrip
          jurisdiction={jurisdiction}
          onChangeJurisdiction={() => setShowJurisdictionPicker(!showJurisdictionPicker)}
        />

        {/* Jurisdiction selector - expanded when no state, or when user clicks Change */}
        {(!jurisdiction || showJurisdictionPicker) && (
          <div className="border-b border-slate-200 bg-white px-4 py-2.5">
            <div className="max-w-3xl mx-auto">
              <JurisdictionSelector
                id="chat-jurisdiction-picker"
                variant="compact"
                value={jurisdiction}
                onChange={(v) => {
                  handleJurisdictionChange(v);
                  setShowJurisdictionPicker(false);
                }}
                label={en ? 'Jurisdiction' : 'Jurisdiccion'}
                description={
                  !jurisdiction
                    ? (en
                        ? 'Answers are tailored to the law of the state, territory, or federal circuit you pick.'
                        : 'Las respuestas se adaptan a la ley del estado, territorio o circuito federal que elija.')
                    : undefined
                }
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-4 sm:py-6">
                <div className="flex justify-center mb-3">
                  <CrisisStrip variant="hero" />
                </div>

                {previousSession && user && (
                  <div className="max-w-md mx-auto mb-4 text-left p-3.5 bg-teal-50 border border-teal-200 rounded-xl">
                    <p className="text-[11px] font-medium text-teal-700 uppercase tracking-wide mb-0.5">
                      {en
                        ? `Continue your ${jurisdiction || ''} issue`
                        : `Continua tu asunto ${jurisdiction ? `de ${jurisdiction}` : ''}`}
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
                        {en ? 'View action plan' : 'Ver plan de accion'}
                      </Link>
                    </div>
                  </div>
                )}

                <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                  {en ? 'What do you need help with?' : 'En que necesitas ayuda?'}
                </h1>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  {en
                    ? 'Legal information, not legal advice.'
                    : 'Informacion legal, no asesoria legal.'}{' '}
                  <Link to="/scope-disclaimers" className="underline text-teal-600 hover:text-teal-800">
                    {en ? 'Learn more' : 'Saber mas'}
                  </Link>
                </p>

                {/* Quick actions */}
                <div className="max-w-sm mx-auto mb-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => inputRef.current?.focus()}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    {en ? 'Ask a question' : 'Hacer una pregunta'}
                  </button>
                  <button
                    onClick={() => {
                      setInput(en ? 'I need help understanding a document.' : 'Necesito ayuda para entender un documento.');
                      inputRef.current?.focus();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    {en ? 'Upload a document' : 'Subir un documento'}
                  </button>
                  <button
                    onClick={() => {
                      setInput(en ? 'What deadlines should I be aware of for my case?' : 'Que fechas limite debo conocer para mi caso?');
                      inputRef.current?.focus();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                  >
                    <Clock className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    {en ? 'Review deadlines' : 'Revisar fechas'}
                  </button>
                  <Link
                    to="/lawyer-profiles"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                  >
                    <Search className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    {en ? 'Find legal aid' : 'Encontrar ayuda legal'}
                  </Link>
                </div>

                <div className="max-w-sm mx-auto mb-4 flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {en ? 'Answer style' : 'Estilo de respuesta'}
                  </span>
                  <AnswerModeSelector value={answerMode} onChange={setAnswerMode} />
                </div>

                {isAdmin && (
                  <div className="max-w-4xl mx-auto mb-8">
                    <AIModelSelector
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                      variant="compact"
                      label={en ? 'Admin: Select AI Model' : 'Admin: Seleccionar Modelo de IA'}
                      showDescription={false}
                    />
                  </div>
                )}

                <div className="max-w-3xl mx-auto mb-8 text-left">
                  <GuidedIssueLauncher
                    audience="all"
                    onSelect={(card) => {
                      const seed = card.prompt_seed || '';
                      setInput(seed);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                  />
                </div>

                {(() => {
                  const state = jurisdiction || (en ? 'your state' : 'tu estado');
                  const allSuggestions = [
                    en ? `Can my landlord raise rent mid-lease in ${state}?` : `¿Puede mi arrendador subir la renta a mitad del contrato en ${state}?`,
                    en ? `What happens if I miss my court date in ${state}?` : `¿Qué pasa si pierdo mi fecha de corte en ${state}?`,
                    en ? `How do I get my security deposit back in ${state}?` : `¿Cómo recupero mi depósito de seguridad en ${state}?`,
                    en ? `Can I be fired for taking sick leave in ${state}?` : `¿Me pueden despedir por tomar licencia por enfermedad en ${state}?`,
                    en ? 'How do I respond to a contract breach notice?' : '¿Cómo respondo a un aviso de incumplimiento de contrato?',
                    en ? 'What are my options if a customer refuses to pay?' : '¿Cuáles son mis opciones si un cliente se niega a pagar?',
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

                        {message.id === lastAssistantId && !isLoading && (
                          <EthicalConversionPanel onAction={handleConversionAction} />
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
                      ? `Ask in plain English, like "Can my landlord raise rent mid-lease in ${jurisdiction || 'your state'}?"`
                      : `Pregunta en español simple, como "¿Puede mi arrendador subir la renta a mitad del contrato en ${jurisdiction || 'tu estado'}?"`
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

            <p className="mt-2 text-[11px] text-slate-500 text-center">
              {en
                ? "You'll get a plain-language explanation, possible next steps, and trusted resources when available."
                : 'Recibirás una explicación en lenguaje simple, posibles próximos pasos y recursos de confianza cuando estén disponibles.'}
            </p>

            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] text-slate-400">
                {en ? (
                  <>
                    AI provides legal information, not legal advice. Always consult a licensed attorney for specific guidance.{' '}
                    <Link to="/privacy-at-a-glance" className="underline hover:text-slate-600">
                      Privacy
                    </Link>
                  </>
                ) : (
                  <>
                    La IA proporciona información legal, no asesoría legal. Siempre consulta a un abogado licenciado para orientación específica.{' '}
                    <Link to="/privacy-at-a-glance" className="underline hover:text-slate-600">
                      Privacidad
                    </Link>
                  </>
                )}
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
