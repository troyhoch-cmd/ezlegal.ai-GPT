import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { chatService, DocumentAttachment, ThinkingDetails } from '../services/chat-service';
import { extractTextFromFiles, convertPdfToImages, convertImageToBase64, DocumentImage } from '../lib/document-extractor';
import {
  Send, Bot, User, Sparkles, Download, Mic, MicOff, Upload, FileText, Trash2, ChevronDown, ChevronUp, BookOpen, X, Zap, Loader2, Scale
} from 'lucide-react';
import { practiceAreas } from '../data/practiceAreas';
import DocumentUploadWarning from '../components/DocumentUploadWarning';
import CitationDisplay, { Citation } from '../components/CitationDisplay';
import CourtReadyOutputBuilder, { CourtReadyOutput } from '../components/CourtReadyOutputBuilder';
import LegalResponseFormatter from '../components/LegalResponseFormatter';
import ThinkingDetailsPanel from '../components/ThinkingDetailsPanel';
import ChatSharePrompt from '../components/ChatSharePrompt';
import EmailCapturePanel from '../components/EmailCapturePanel';
import InFlowTrustStrip from '../components/InFlowTrustStrip';
import PersonaNextSteps from '../components/PersonaNextSteps';
import UserMenu from '../components/UserMenu';
import { useEngagementThrottle } from '../hooks/useEngagementThrottle';

interface Message {
  id: string;
  message: string;
  response: string;
  created_at: string;
  model_used?: string;
  tokens_used?: number;
  citations?: Citation[];
  jurisdiction?: string;
  thinkingDetails?: ThinkingDetails;
}

export default function SimpleChatbot() {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedDocumentText, setExtractedDocumentText] = useState<string>('');
  const [documentImages, setDocumentImages] = useState<DocumentImage[]>([]);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showCourtReadyOutput, setShowCourtReadyOutput] = useState(false);
  const [courtReadyData, setCourtReadyData] = useState<CourtReadyOutput | null>(null);
  const [userTriggeredAction, setUserTriggeredAction] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const engagement = useEngagementThrottle();

  useEffect(() => {
    loadMessages();
    initializeSpeechRecognition();
  }, [user]);

  useEffect(() => {
    const topicFromDashboard = (location.state as { topic?: string })?.topic;
    if (topicFromDashboard) {
      setSelectedTopic(topicFromDashboard);
      const question = `I need help with ${topicFromDashboard}. Can you explain what this involves, the typical process, costs to expect, and what documents I might need?`;
      submitTopicQuestion(question);
      window.history.replaceState({}, document.title);
    }
  }, [location.key]);

  const submitTopicQuestion = async (question: string) => {
    setLoading(true);

    try {
      if (user) {
        chatService.setUserId(user.id);
      }

      const aiResult = await chatService.sendMessage(question);
      const aiResponse = aiResult.content;
      const modelUsed = aiResult.modelUsed;
      const tokensUsed = aiResult.usage?.totalTokens;
      const thinkingDetails = aiResult.thinkingDetails;

      if (user) {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: question,
            response: aiResponse,
          })
          .select()
          .single();

        if (!error && data) {
          setMessages(prev => [...prev, { ...data, model_used: modelUsed, tokens_used: tokensUsed, thinkingDetails }]);
        }
      } else {
        const tempMessage: Message = {
          id: Date.now().toString(),
          message: question,
          response: aiResponse,
          created_at: new Date().toISOString(),
          model_used: modelUsed,
          tokens_used: tokensUsed,
          thinkingDetails,
        };
        setMessages(prev => [...prev, tempMessage]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    }

    setLoading(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'es' ? 'es-US' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPendingFiles(files);
    setShowUploadWarning(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFilesAfterConsent = async () => {
    if (pendingFiles.length === 0) return;

    setShowUploadWarning(false);
    setUploadedFiles(prev => [...prev, ...pendingFiles]);
    setIsExtractingText(true);
    setExtractionError(null);

    try {
      const allFiles = [...uploadedFiles, ...pendingFiles];
      const allImages: DocumentImage[] = [];

      for (const file of allFiles) {
        const fileName = file.name.toLowerCase();
        const fileType = file.type;

        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
          const pdfImages = await convertPdfToImages(file, 5);
          allImages.push(...pdfImages);
        } else if (fileType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/.test(fileName)) {
          const imgData = await convertImageToBase64(file);
          if (imgData) {
            allImages.push(imgData);
          }
        }
      }

      setDocumentImages(allImages);

      const extractedText = await extractTextFromFiles(allFiles);
      setExtractedDocumentText(extractedText);

      if (allImages.length > 0) {
        setExtractionError(null);
      } else if (!extractedText || extractedText.trim().length < 50) {
        setExtractionError('Could not extract readable text from this document. The file may be scanned/image-based or encrypted.');
      }
    } catch (error) {
      console.error('Failed to process files:', error);
      setExtractionError('Failed to process document. Please try a different file format.');
    } finally {
      setIsExtractingText(false);
      setPendingFiles([]);
    }
  };

  const removeFile = async (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setExtractionError(null);

    if (newFiles.length === 0) {
      setExtractedDocumentText('');
      setDocumentImages([]);
    } else {
      setIsExtractingText(true);
      try {
        const allImages: DocumentImage[] = [];
        for (const file of newFiles) {
          const fileName = file.name.toLowerCase();
          const fileType = file.type;
          if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            const pdfImages = await convertPdfToImages(file, 5);
            allImages.push(...pdfImages);
          } else if (fileType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/.test(fileName)) {
            const imgData = await convertImageToBase64(file);
            if (imgData) allImages.push(imgData);
          }
        }
        setDocumentImages(allImages);

        const extractedText = await extractTextFromFiles(newFiles);
        setExtractedDocumentText(extractedText);
        if (allImages.length === 0 && (!extractedText || extractedText.trim().length < 50)) {
          setExtractionError('Could not extract readable text from this document.');
        }
      } catch (error) {
        console.error('Failed to process files:', error);
        setExtractionError('Failed to process document.');
      } finally {
        setIsExtractingText(false);
      }
    }
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg =>
      `User: ${msg.message}\n\nAI Assistant: ${msg.response}\n\n${'='.repeat(80)}\n\n`
    ).join('');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadMessages = async () => {
    if (!user) {
      setMessages([]);
      return;
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && data) {
      setMessages(data);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isExtractingText) return;

    setLoading(true);
    const userMessage = input.trim();
    setInput('');

    const documentTextToSend = extractedDocumentText;
    const imagesToSend = documentImages;
    const fileCount = uploadedFiles.length;
    const fileNames = uploadedFiles.map(f => f.name).join(', ');
    setUploadedFiles([]);
    setExtractedDocumentText('');
    setDocumentImages([]);

    try {
      if (user) {
        chatService.setUserId(user.id);
      }

      const attachments: DocumentAttachment[] = imagesToSend.map(img => ({
        type: 'pdf_page' as const,
        data: img.data,
        mimeType: img.mimeType,
        filename: img.filename,
        pageNumber: img.pageNumber,
      }));

      const aiResult = await chatService.sendMessage(
        userMessage,
        attachments.length === 0 ? documentTextToSend : undefined,
        attachments.length > 0 ? attachments : undefined
      );
      const aiResponse = aiResult.content;
      const modelUsed = aiResult.modelUsed;
      const tokensUsed = aiResult.usage?.totalTokens;
      const thinkingDetails = aiResult.thinkingDetails;

      const displayMessage = (documentTextToSend || attachments.length > 0) && fileCount > 0
        ? `${userMessage}\n[Attached: ${fileCount} document(s): ${fileNames}]`
        : userMessage;

      if (user) {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: displayMessage,
            response: aiResponse,
          })
          .select()
          .single();

        if (!error && data) {
          setMessages([...messages, { ...data, model_used: modelUsed, tokens_used: tokensUsed, thinkingDetails }]);
        }
      } else {
        const tempMessage: Message = {
          id: Date.now().toString(),
          message: displayMessage,
          response: aiResponse,
          created_at: new Date().toISOString(),
          model_used: modelUsed,
          tokens_used: tokensUsed,
          thinkingDetails,
        };
        setMessages([...messages, tempMessage]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    }

    setLoading(false);
  };

  const quickPrompts = [
    "Help me understand contract law",
    "What should I know about intellectual property?",
    "Explain employment rights in Arizona",
    "How do I start a business?",
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {user && (
        <header
          role="banner"
          className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-navy-200 shadow-sm"
        >
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 gap-4">
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
                className="h-9 w-auto"
              />
            </Link>
            <UserMenu />
          </div>
        </header>
      )}
      <InFlowTrustStrip compact />
      {!user && (
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 border-b-2 border-teal-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-teal-600" />
              <div>
                <p className="font-semibold text-navy-900">
                  {language === 'en' ? 'Welcome, Guest!' : 'Bienvenido, Invitado!'}
                </p>
                <p className="text-sm text-navy-600">
                  {language === 'en' ? 'Sign in to save your conversations' : 'Inicia sesion para guardar tus conversaciones'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/signup"
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white rounded-lg transition-all font-semibold shadow-md text-sm"
              >
                {language === 'en' ? 'Create Account' : 'Crear Cuenta'}
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-white hover:bg-navy-50 text-navy-700 border-2 border-navy-200 rounded-lg transition-colors font-medium text-sm"
              >
                {language === 'en' ? 'Sign In' : 'Iniciar Sesion'}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-navy-50 to-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {selectedTopic && (
            <div className="bg-gradient-to-r from-teal-600/10 to-teal-700/10 border-2 border-teal-600/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">
                      {language === 'en' ? 'Current Topic' : 'Tema Actual'}
                    </p>
                    <p className="font-bold text-navy-900">{selectedTopic}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 hover:bg-navy-200 rounded-lg transition-colors"
                  title="Clear topic"
                >
                  <X className="w-4 h-4 text-navy-500" />
                </button>
              </div>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bot className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-3xl font-bold text-navy-900 mb-2">
                ezLegal.ai<sup className="text-lg">TM</sup> Legal Assistant
              </h3>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-[10px] font-medium text-navy-500 uppercase tracking-wide">Powered by</span>
                <span className="text-sm font-bold text-navy-700">Legalbreeze®</span>
              </div>
              <p className="text-lg text-navy-600 max-w-2xl mx-auto mb-8">
                {language === 'en'
                  ? "Ask any legal question and get instant guidance. I'm trained on Arizona law to help consumers and small businesses understand their legal situation before consulting with an attorney."
                  : "Haga cualquier pregunta legal y obtenga orientación al instante. Estoy entrenado en la ley de Arizona para ayudar a consumidores y pequenas empresas a entender su situación legal antes de consultar con un abogado."}
              </p>

              <h4 className="text-lg font-semibold text-navy-900 mb-4">
                {language === 'en' ? 'Popular Questions' : 'Preguntas Populares'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(prompt);
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) {
                          const event = new Event('submit', { bubbles: true, cancelable: true });
                          form.dispatchEvent(event);
                        }
                      }, 100);
                    }}
                    className="text-left p-4 bg-white border border-navy-200 rounded-xl hover:border-teal-600 hover:shadow-lg transition-all group"
                  >
                    <p className="text-sm font-medium text-navy-700 group-hover:text-teal-600">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                <div className="flex gap-3 justify-end">
                  <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-2xl rounded-tr-md px-5 py-4 max-w-2xl shadow-lg">
                    <p className="text-[15px] leading-relaxed">{msg.message}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 max-w-2xl">
                    {msg.thinkingDetails && (
                      <ThinkingDetailsPanel thinking={msg.thinkingDetails} />
                    )}
                    <div className="bg-white border-2 border-navy-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md">
                      <LegalResponseFormatter content={msg.response} />
                      {msg.model_used && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy-100">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-navy-400">
                            Powered by {msg.model_used}
                            {msg.tokens_used && ` (${msg.tokens_used} tokens)`}
                          </span>
                        </div>
                      )}
                      <CitationDisplay
                        citations={msg.citations}
                        jurisdiction={msg.jurisdiction || 'Arizona'}
                        lastUpdated={new Date(msg.created_at).toLocaleDateString()}
                        verificationStatus={msg.citations && msg.citations.length > 0 ? 'verified' : 'unverified'}
                        showCompact={true}
                      />
                      {messages.indexOf(msg) === messages.length - 1 && (() => {
                        if (engagement.shouldShowNextBestStep(messages.length)) {
                          return <div className="mt-3"><PersonaNextSteps context="chat" compact maxItems={2} /></div>;
                        }
                        if (!user && engagement.shouldShowEmailCapture(userTriggeredAction, !!user)) {
                          return <EmailCapturePanel context={msg.response.slice(0, 200)} onDismiss={() => engagement.dismiss('emailCapture')} />;
                        }
                        if (engagement.shouldShowSharePrompt(messages.length)) {
                          return <ChatSharePrompt messageCount={messages.length} onDismiss={() => engagement.dismiss('sharePrompt')} />;
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 max-w-2xl">
                <ThinkingDetailsPanel thinking={null} isLoading={true} />
                <div className="bg-white border-2 border-navy-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-navy-200 px-6 py-5 shadow-xl">
        <div className="max-w-4xl mx-auto">
          {messages.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => { setUserTriggeredAction(true); exportConversation(); }}
                className="flex items-center gap-2 px-4 py-2 bg-navy-100 hover:bg-navy-200 text-navy-700 rounded-lg transition-all font-medium text-sm"
                title="Export conversation"
              >
                <Download className="w-4 h-4" />
                {language === 'en' ? 'Export Conversation' : 'Exportar Conversacion'}
              </button>
            </div>
          )}

          <div className="mb-4">
            <button
              onClick={() => setShowPromptLibrary(!showPromptLibrary)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-2 border-amber-300 text-amber-700 rounded-lg transition-all font-semibold text-sm w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {language === 'en' ? 'Browse Topics' : 'Explorar Temas'}
              </span>
              {showPromptLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showPromptLibrary && (
              <div className="mt-3 bg-gradient-to-br from-navy-50 to-white border-2 border-navy-200 rounded-xl p-4 max-h-96 overflow-y-auto">
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-navy-200">
                  {practiceAreas.map((area) => {
                    const Icon = area.icon;
                    return (
                      <button
                        key={area.id}
                        onClick={() => setExpandedCategory(expandedCategory === area.id ? null : area.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          expandedCategory === area.id
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'bg-white border border-navy-200 text-navy-700 hover:border-teal-600 hover:text-teal-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {area.name}
                        {expandedCategory === area.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {expandedCategory && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-teal-600">
                        {practiceAreas.find(a => a.id === expandedCategory)?.name} Services
                      </h4>
                      <button
                        onClick={() => setExpandedCategory(null)}
                        className="p-1 hover:bg-navy-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-navy-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {practiceAreas
                        .find(a => a.id === expandedCategory)
                        ?.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              const topic = `${practiceAreas.find(a => a.id === expandedCategory)?.name}: ${sub.name}`;
                              setSelectedTopic(topic);
                              setShowPromptLibrary(false);
                              setExpandedCategory(null);
                              const question = `I need help with ${topic}. Can you explain what this involves, the typical process, costs to expect, and what documents I might need?`;
                              submitTopicQuestion(question);
                            }}
                            className="flex items-center gap-2 p-2 bg-white rounded-lg border border-navy-200 hover:border-teal-600 hover:shadow-md transition-all text-left group"
                          >
                            <div className="w-2 h-2 bg-teal-600 rounded-full flex-shrink-0" />
                            <span className="text-sm text-navy-700 group-hover:text-teal-600 transition-colors">
                              {sub.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {!expandedCategory && (
                  <p className="text-sm text-navy-500 text-center py-4">
                    {language === 'en' ? 'Click a category above to see available services' : 'Haga clic en una categoria para ver los servicios disponibles'}
                  </p>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {uploadedFiles.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-teal-50 border-2 border-teal-200 rounded-lg px-3 py-2"
                    >
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span className="text-sm text-navy-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-navy-400 hover:text-red-600 transition-colors"
                        disabled={isExtractingText}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {isExtractingText ? (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing document(s) for AI analysis...</span>
                  </div>
                ) : extractionError && documentImages.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <X className="w-4 h-4" />
                    <span>{extractionError}</span>
                  </div>
                ) : documentImages.length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Document ready for AI Vision analysis ({documentImages.length} page{documentImages.length > 1 ? 's' : ''} captured)</span>
                  </div>
                ) : extractedDocumentText ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Document content ready ({Math.round(extractedDocumentText.length / 1000)}KB extracted)</span>
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp,image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-navy-100 hover:bg-navy-200 text-navy-700 p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Upload documents"
              >
                <Upload className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={loading}
                className={`${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-navy-100 hover:bg-navy-200 text-navy-700'
                } p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <label htmlFor="simple-chat-input" className="sr-only">Ask your legal question</label>
              <input
                id="simple-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'en' ? 'Ask your legal question...' : 'Haga su pregunta legal...'}
                disabled={loading}
                aria-label="Ask your legal question"
                className="flex-1 px-5 py-3 border-2 border-navy-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 placeholder-navy-400 text-[15px]"
              />

              <button
                type="submit"
                disabled={loading || !input.trim() || isExtractingText}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                title={documentImages.length > 0 ? `Send with ${documentImages.length} document page(s) for AI Vision analysis` : 'Send message'}
              >
                {isExtractingText ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>

          {messages.length > 0 && (
            <div className="mt-4 pt-4 border-t border-navy-200">
              <button
                onClick={() => {
                  const output: CourtReadyOutput = {
                    title: 'Court-Ready Action Plan',
                    jurisdiction: 'Arizona',
                    caseType: selectedTopic || 'Legal Matter',
                    generatedDate: new Date().toLocaleDateString(),
                    summary: 'Based on your conversation, here is an action plan to help you prepare for your legal matter.',
                    warnings: [
                      'Deadlines are critical in legal matters - missing a deadline can result in losing your case',
                      'This is informational guidance only and does not constitute legal advice',
                      'For complex matters, consult with a licensed attorney'
                    ],
                    checklist: [
                      { id: '1', text: 'Gather all relevant documents', priority: 'high' },
                      { id: '2', text: 'Note all important dates and deadlines', priority: 'high' },
                      { id: '3', text: 'Make copies of all documents for your records', priority: 'medium' },
                      { id: '4', text: 'Write a timeline of events', priority: 'medium' },
                      { id: '5', text: 'Identify potential witnesses', priority: 'medium' },
                      { id: '6', text: 'Research relevant laws and statutes', priority: 'low' },
                      { id: '7', text: 'Consider consulting with an attorney', priority: 'high' },
                    ],
                    documentsNeeded: [
                      'Any contracts or written agreements',
                      'Correspondence (emails, letters, texts)',
                      'Receipts or proof of payment',
                      'Photo or video evidence',
                      'Witness contact information',
                      'Government-issued ID',
                    ],
                    nextSteps: [
                      'Review the checklist and gather all documents',
                      'Research free legal aid resources in your area',
                      'Consider scheduling a consultation with an attorney',
                      'File any necessary court documents before deadlines',
                    ],
                    courtInfo: {
                      name: 'Maricopa County Superior Court',
                      address: '201 W. Jefferson St., Phoenix, AZ 85003',
                      phone: '(602) 506-3204',
                      hours: 'Monday - Friday, 8:00 AM - 5:00 PM',
                      website: 'https://superiorcourt.maricopa.gov',
                    },
                  };
                  setCourtReadyData(output);
                  setShowCourtReadyOutput(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-navy-700 to-navy-800 hover:from-navy-800 hover:to-navy-900 text-white rounded-lg transition-all font-medium text-sm shadow-md"
              >
                <Scale className="w-4 h-4" />
                {language === 'en' ? 'Generate Court-Ready Action Plan' : 'Generar Plan de Accion para el Tribunal'}
              </button>
            </div>
          )}
        </div>
      </div>

      <DocumentUploadWarning
        isOpen={showUploadWarning}
        onClose={() => {
          setShowUploadWarning(false);
          setPendingFiles([]);
        }}
        onConsent={processFilesAfterConsent}
        fileName={pendingFiles.length > 0 ? pendingFiles.map(f => f.name).join(', ') : undefined}
      />

      {showCourtReadyOutput && courtReadyData && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <CourtReadyOutputBuilder
            output={courtReadyData}
            onClose={() => {
              setShowCourtReadyOutput(false);
              setCourtReadyData(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
