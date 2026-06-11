# Merge Review — P1 — Significant content regression (>40% size reduction)

Generated: 2026-06-07T01:56:38.618Z
Baseline commit: 739dfcf178546bfb1600b870bbe71196cbe83b89

---

## src/pages/ChatV2.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 20.5 KB | 8.7 KB |
| Lines | 556 | 228 |
| Delta | — | 41% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { useState, useRef, useEffect, useCallback } from 'react';
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
  }, [input, isLoading, en]);

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
    } catch {}
    setShowGuidedTour(false);
  };

  const handleTourSkip = () => {
    try {
      localStorage.setItem('ezlegal-chat-tour-completed', 'true');
    } catch {}
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
    (m) => m.role === 'user' && detectCrisisSignal(m.content)
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
                    en ? 'Can my landlord raise rent mid-lease in Arizona?' : '¿Puede mi arrendador subir la renta a mitad del contrato en Arizona?',
                    en ? 'What happens if I miss my court date?' : '¿Qué pasa si pierdo mi fecha de corte?',
                    en ? 'How do I get my security deposit back?' : '¿Cómo recupero mi depósito de seguridad?',
                    en ? 'Can I be fired for taking sick leave?' : '¿Me pueden despedir por tomar licencia por enfermedad?',
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
                      ? 'Ask in plain English, like "Can my landlord raise rent mid‑lease in Texas?"'
                      : 'Pregunta en inglés simple, como "¿Puede mi arrendador subir la renta a mitad del contrato en Texas?"'
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

### CURRENT VERSION

```tsx
import { useState } from 'react';
import { Send, AlertCircle, Globe, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import JurisdictionSelector from '../components/shared/JurisdictionSelector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatV2() {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const en = language === 'en';
  const [jurisdiction, setJurisdiction] = useState('CA');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showUrgencyWarning, setShowUrgencyWarning] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: en
          ? 'This is legal information, not legal advice. For specific legal matters, please consult with a licensed attorney in your jurisdiction.'
          : 'Esta es información legal, no asesoramiento legal. Para asuntos legales específicos, consulte con un abogado licenciado en su jurisdicción.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 800);

    setInputValue('');
  };

  const detectCrisis = (text: string): boolean => {
    const crisisKeywords = [
      'emergency',
      'danger',
      'urgent',
      'violence',
      'abuse',
      'suicide',
      'harm',
      'threat',
    ];
    return crisisKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword)
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (detectCrisis(e.target.value)) {
      setShowUrgencyWarning(true);
    } else {
      setShowUrgencyWarning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col pt-20">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-6">
          {user && (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {en ? 'Back to Dashboard' : 'Volver al Panel'}
            </Link>
          )}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              {en ? 'AI Assistant' : 'Asistente IA'}
            </h1>

            <div className="flex items-center gap-3">
              <JurisdictionSelector
                value={jurisdiction}
                onChange={setJurisdiction}
                variant="compact"
                statesOnly
              />

              <button
                onClick={() => setLanguage(en ? 'es' : 'en')}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {en ? 'ES' : 'EN'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {en
                    ? 'Start Your Legal Consultation'
                    : 'Inicia Tu Consulta Legal'}
                </h2>
                <p className="text-slate-600 max-w-md">
                  {en
                    ? 'Ask any legal question about your jurisdiction. Remember: this is legal information, not legal advice.'
                    : 'Haz cualquier pregunta legal sobre tu jurisdicción. Recuerda: esto es información legal, no asesoramiento legal.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-teal-100'
                          : 'text-slate-600'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showUrgencyWarning && (
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                {en
                  ? 'If you are in immediate danger, please call 911 or your local emergency number.'
                  : 'Si estás en peligro inmediato, llama al 911 o a tu número de emergencia local.'}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-4">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              placeholder={
                en
                  ? 'Ask a legal question...'
                  : 'Haz una pregunta legal...'
              }
              className="w-full resize-none outline-none text-slate-900 placeholder-slate-500"
              rows={3}
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-slate-500">
                {en
                  ? 'This is legal information, not legal advice.'
                  : 'Esta es información legal, no asesoramiento legal.'}
              </p>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                {en ? 'Send' : 'Enviar'}
              </button>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">{en ? 'Scope Disclaimer' : 'Aviso de Alcance'}</p>
            <p>
              {en
                ? 'ezLegal.ai provides legal information for educational purposes. This is not legal advice, attorney-client relationship, or legal representation. Always consult a licensed attorney for specific legal matters.'
                : 'ezLegal.ai proporciona información legal con fines educativos. Esto no es asesoramiento legal, relación abogado-cliente, ni representación legal. Siempre consulta un abogado licenciado para asuntos legales específicos.'}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

```

---

## src/pages/Dashboard.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 33.9 KB | 7.0 KB |
| Lines | 743 | 180 |
| Delta | — | 24% of baseline |

### BASELINE VERSION (Apr 28)

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
    } catch {}
    setShowDashboardTour(false);
  };

  const handleTourSkip = () => {
    try {
      localStorage.setItem('ezlegal-dashboard-tour-completed', 'true');
    } catch {}
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
                  to="/chat-v2"
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
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-xs text-teal-200 mb-1">{t('dash.issuePacksPrice')}</div>
                  <ul className="space-y-1 text-xs text-teal-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-300" />
                      {t('dash.actionPlans')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-300" />
                      {t('dash.docTemplates')}
                    </li>
                  </ul>
                </div>
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
                    ? (language === 'en' ? 'Advanced tools' : 'Herramientas avanzadas')
                    : (language === 'en' ? 'Show all tools' : 'Mostrar todas')
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
              <div className="absolute top-2 right-2">
                <span className="bg-yellow-400 text-navy-900 text-xs font-bold px-2 py-1 rounded-full">NEW</span>
              </div>
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
              to="/chat-v2"
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
              <div className="absolute top-2 right-2">
                <span className="bg-white text-teal-700 text-xs font-bold px-2 py-1 rounded-full">AI</span>
              </div>
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
                    to="/chat-v2"
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
                <p className="text-xs text-center text-navy-500 mt-2">{t('dash.actionPlansTemplates')}</p>
              </div>
            </div>
          </div>
        </div>

        {!isSimpleMode && <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
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
                      to="/chat-v2"
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

### CURRENT VERSION

```tsx
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, TrendingUp, CreditCard, Calendar, RefreshCw } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'overdue';
  dueDate: string;
}

const TASKS: Task[] = [
  {
    id: '1',
    title: 'Review eviction notice deadline',
    status: 'pending',
    dueDate: '2024-06-15',
  },
  {
    id: '2',
    title: 'File employment complaint',
    status: 'overdue',
    dueDate: '2024-06-01',
  },
  {
    id: '3',
    title: 'Prepare small claims documents',
    status: 'completed',
    dueDate: '2024-05-28',
  },
];

export default function Dashboard() {
  const { language, t } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {en ? 'My Action Plan' : 'Mi Plan de Acción'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Track your legal tasks and progress.'
                : 'Rastrear tus tareas legales y progreso.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">
                  {en ? 'Active Tasks' : 'Tareas Activas'}
                </h3>
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">5</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">
                  {en ? 'Completed' : 'Completado'}
                </h3>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">12</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">
                  {en ? 'Overdue' : 'Vencido'}
                </h3>
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">1</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-12">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {en ? 'Your Legal Tasks' : 'Tus Tareas Legales'}
            </h2>
            <div className="space-y-3">
              {TASKS.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    task.status === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : task.status === 'overdue'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {task.status === 'overdue' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    {task.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-400" />
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          task.status === 'completed'
                            ? 'line-through text-slate-500'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              {t('dash.purchases')}
            </h2>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Professional Plan</p>
                  <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    {t('dash.expires')}: June 30, 2024
                  </p>
                </div>
                <span className="text-sm font-semibold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
                  {en ? 'Active' : 'Activo'}
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Document Pack</p>
                  <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    {t('dash.expired')}: March 15, 2024
                  </p>
                </div>
                <button className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {t('dash.renew')}
                </button>
              </div>

              <button className="w-full flex items-center justify-center gap-2 mt-6 px-6 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium">
                <CreditCard className="w-4 h-4" />
                {t('dash.updatePayment')}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

```

---

## src/pages/Negotiate.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 22.9 KB | 5.7 KB |
| Lines | 458 | 124 |
| Delta | — | 27% of baseline |

### BASELINE VERSION (Apr 28)

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

### CURRENT VERSION

```tsx
import { useState } from 'react';
import { AlertCircle, DollarSign, Users, TrendingUp, Shield } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function Negotiate() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [showDVWarning, setShowDVWarning] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {en ? 'Negotiation Tool' : 'Herramienta de Negociación'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Strategic guidance for settlements and disputes.'
                : 'Orientación estratégica para acuerdos y disputas.'}
            </p>
          </div>

          {showDVWarning && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {en ? 'Safety Alert' : 'Alerta de Seguridad'}
                  </h2>
                  <p className="text-slate-700 mb-4">
                    {en
                      ? 'If you are experiencing domestic violence or abuse, please reach out to the National Domestic Violence Hotline: 1-800-799-7233'
                      : 'Si estás experimentando violencia doméstica o abuso, comunícate con la Línea Nacional de Violencia Doméstica: 1-800-799-7233'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <DollarSign className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {en ? 'Settlement Strategy' : 'Estrategia de Acuerdo'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Learn how to negotiate fair settlement terms.'
                  : 'Aprende cómo negociar términos de acuerdo justos.'}
              </p>
              <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                {en ? 'Explore' : 'Explorar'}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <Users className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {en ? 'Dispute Resolution' : 'Resolución de Disputas'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Navigate common disputes and find resolution paths.'
                  : 'Navega disputas comunes y encuentra caminos de resolución.'}
              </p>
              <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                {en ? 'Explore' : 'Explorar'}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <TrendingUp className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {en ? 'Negotiation Tips' : 'Consejos de Negociación'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Best practices for effective negotiation.'
                  : 'Mejores prácticas para negociación efectiva.'}
              </p>
              <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                {en ? 'Learn' : 'Aprender'}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <AlertCircle className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {en ? 'Safety Screening' : 'Evaluación de Seguridad'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Check for safety concerns in your situation.'
                  : 'Verifica preocupaciones de seguridad en tu situación.'}
              </p>
              <button
                onClick={() => setShowDVWarning(!showDVWarning)}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                {en ? 'Check Now' : 'Verificar Ahora'}
              </button>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <p className="text-slate-700">
              {en
                ? 'This tool provides educational guidance only. For serious disputes or legal matters, consult with a licensed attorney.'
                : 'Esta herramienta proporciona solo orientación educativa. Para disputas serias o asuntos legales, consulta con un abogado licenciado.'}
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

## src/pages/Research.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 32.8 KB | 4.2 KB |
| Lines | 776 | 125 |
| Delta | — | 16% of baseline |

### BASELINE VERSION (Apr 28)

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
  const { t } = useLanguage();

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

### CURRENT VERSION

```tsx
import { useState } from 'react';
import { Search, Home, Briefcase, Plane, Heart, TrendingUp, DollarSign } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Topic {
  id: string;
  icon: typeof Home;
  title: string;
  description: string;
}

const TOPICS: Topic[] = [
  {
    id: 'housing',
    icon: Home,
    title: 'Housing Rights',
    description: 'Eviction, tenant rights, landlord disputes',
  },
  {
    id: 'employment',
    icon: Briefcase,
    title: 'Employment Law',
    description: 'Wages, discrimination, wrongful termination',
  },
  {
    id: 'immigration',
    icon: Plane,
    title: 'Immigration',
    description: 'Visa, green card, citizenship processes',
  },
  {
    id: 'family',
    icon: Heart,
    title: 'Family Law',
    description: 'Divorce, custody, child support',
  },
  {
    id: 'business',
    icon: TrendingUp,
    title: 'Business Law',
    description: 'Contracts, compliance, entity formation',
  },
  {
    id: 'consumer',
    icon: DollarSign,
    title: 'Consumer Rights',
    description: 'Fraud, debt, warranties',
  },
];

export default function Research() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredTopics = TOPICS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              {en ? 'Legal Research' : 'Investigación Legal'}
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              {en
                ? 'Explore legal topics and find authoritative resources.'
                : 'Explora temas legales y encuentra recursos autorizados.'}
            </p>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={en ? 'Search legal topics...' : 'Buscar temas legales...'}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              const isSelected = selectedTopic === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(isSelected ? null : topic.id)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-teal-200' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-teal-600' : 'text-slate-600'}`} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{topic.title}</h3>
                  <p className="text-sm text-slate-600">{topic.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

```

---

## src/pages/IssuePacks.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 24.4 KB | 4.4 KB |
| Lines | 448 | 121 |
| Delta | — | 27% of baseline |

### BASELINE VERSION (Apr 28)

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
  const lang = language === 'en' ? 'en' : 'es';

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

### CURRENT VERSION

```tsx
import { Link } from 'react-router-dom';
import { Package, Tag, Users, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface IssuePack {
  id: string;
  title: string;
  description: string;
  topics: string[];
  price: number;
  icon: typeof Package;
}

const PACKS: IssuePack[] = [
  {
    id: 'tenant-rights',
    title: 'Tenant Rights',
    description: 'Complete guide to evictions, security deposits, and landlord disputes.',
    topics: ['Eviction Defense', 'Security Deposits', 'Lease Agreements'],
    price: 29.99,
    icon: Package,
  },
  {
    id: 'employment-dispute',
    title: 'Employment Dispute',
    description: 'Navigate wage disputes, discrimination, and wrongful termination.',
    topics: ['Wage Claims', 'Discrimination', 'Termination Rights'],
    price: 34.99,
    icon: Users,
  },
  {
    id: 'small-claims',
    title: 'Small Claims Court',
    description: 'Step-by-step guide to filing and winning small claims cases.',
    topics: ['Filing Process', 'Evidence', 'Court Testimony'],
    price: 24.99,
    icon: TrendingUp,
  },
  {
    id: 'consumer-rights',
    title: 'Consumer Rights',
    description: 'Protect yourself from fraud, defective products, and bad debt.',
    topics: ['Fraud Protection', 'Warranties', 'Debt Defense'],
    price: 19.99,
    icon: Tag,
  },
];

export default function IssuePacks() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              {en ? 'Issue Packs' : 'Paquetes de Problemas'}
            </h1>
            <p className="text-lg text-slate-600">
              {en
                ? 'Curated bundles of legal resources for common issues.'
                : 'Colecciones curadas de recursos legales para problemas comunes.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {PACKS.map((pack) => {
              const Icon = pack.icon;
              return (
                <div
                  key={pack.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 text-teal-600" />
                    <span className="text-lg font-bold text-teal-600">
                      ${pack.price}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {pack.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{pack.description}</p>
                  <div className="mb-6 space-y-2">
                    {pack.topics.map((topic) => (
                      <div key={topic} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {topic}
                      </div>
                    ))}
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium">
                    {en ? 'Get Pack' : 'Obtener Paquete'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {en ? 'More Coming Soon' : 'Más Próximamente'}
            </h2>
            <p className="text-slate-700">
              {en
                ? 'We are continuously adding new issue packs to cover more legal topics.'
                : 'Continuamos añadiendo nuevos paquetes de problemas para cubrir más temas legales.'}
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

