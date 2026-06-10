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
