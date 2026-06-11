import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { chatService } from '../services/chat-service';
import { extractTextFromFiles } from '../lib/document-extractor';
import { useActivityLog } from '../hooks/useActivityLog';
import { useLanguage } from '../contexts/LanguageContext';
import { storeAnonymizedSearch, classifyQueryIntent, detectCaseType } from '../services/engagement-service';
import UserAvatar from '../components/UserAvatar';
import UserMenu from '../components/UserMenu';
import TriageIntake from '../components/TriageIntake';
// PersonaAwareSafetyGate merged into TriageIntake flow
import InFlowTrustStrip from '../components/InFlowTrustStrip';
import ActionDrawer from '../components/ActionDrawer';
import CrisisEscalationCard, { detectCrisis, CrisisType } from '../components/CrisisEscalationCard';
import ChatHandoffToolbar from '../components/ChatHandoffToolbar';
import { PrivacyMicroPanelInline } from '../components/PrivacyMicroPanel';
import {
  Send, Bot, User, Sparkles, Plus, Mic, MicOff, Upload, FileText,
  Trash2, X, Menu, ChevronLeft, ChevronDown, ChevronUp, Clock, MessageSquare, Search, BookOpen,
  LogOut, Car, Building2, Copyright, Landmark, Briefcase,
  AlertTriangle, Scale, Users as UsersIcon, Shield, Lightbulb, Zap, Settings2, Check, Loader2, HelpCircle, Info
} from 'lucide-react';
import ShareButton from '../components/ShareButton';
import ChatSharePrompt from '../components/ChatSharePrompt';
import ContextualOutcomePrediction from '../components/ContextualOutcomePrediction';
import NextBestStep from '../components/NextBestStep';
import EmailCapturePanel from '../components/EmailCapturePanel';
import JurisdictionSelector from '../components/shared/JurisdictionSelector';

interface Message {
  id: string;
  message: string;
  response: string;
  created_at: string;
  model_used?: string;
  tokens_used?: number;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  date: string;
  messageCount: number;
}

interface PromptSuggestion {
  id: number;
  title: string;
  prompt_text: string;
  category_name: string;
}

interface LegalTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  questions: string[];
}

interface AIModel {
  id: string;
  model_name: string;
  display_name: string;
  description: string;
  tier_required: string;
  display_order: number;
}

function getSourceCoverage(text: string): { level: 'high' | 'medium' | 'low'; label: string; color: string; pct: number } {
  const citationPattern = /\b(A\.R\.S\.|§|U\.S\.C\.|USC|statute|code section|regulation|rule \d|amendment|article \d)/i;
  const specificPattern = /\b(according to|under|pursuant to|as stated in|per section|section \d)/i;
  const hedgePattern = /\b(may|might|could|possibly|generally|typically|often|usually|it depends|varies)/i;
  const hasCitations = citationPattern.test(text);
  const hasSpecific = specificPattern.test(text);
  const hasHedging = hedgePattern.test(text);
  let score = 50;
  if (hasCitations) score += 30;
  if (hasSpecific) score += 15;
  if (hasHedging) score -= 10;
  if (text.length > 500) score += 5;
  score = Math.min(95, Math.max(25, score));
  if (score >= 75) return { level: 'high', label: 'High source coverage', color: 'text-green-600', pct: score };
  if (score >= 50) return { level: 'medium', label: 'Moderate source coverage', color: 'text-amber-600', pct: score };
  return { level: 'low', label: 'Limited source coverage', color: 'text-red-600', pct: score };
}

const legalTopics: LegalTopic[] = [
  {
    id: 'transportation',
    title: 'Public Transportation Accidents',
    description: 'Demand Letters',
    icon: <Car className="w-5 h-5" />,
    questions: [
      "What should I do immediately after a bus or train accident?",
      "How do I file a claim against a public transit company for injuries?",
      "What compensation can I receive for a public transportation accident?",
      "What is the statute of limitations for transit accident claims?",
      "Can I sue a city or government entity for a bus accident?"
    ]
  },
  {
    id: 'premises',
    title: 'Premises Liability',
    description: 'Claims & Defenses',
    icon: <Building2 className="w-5 h-5" />,
    questions: [
      "What are my rights if I slip and fall at a business?",
      "How do I prove negligence in a premises liability case?",
      "What damages can I recover from a slip and fall accident?",
      "How long do I have to file a premises liability claim?",
      "Is a landlord responsible for injuries on their property?"
    ]
  },
  {
    id: 'ip',
    title: 'Intellectual Property',
    description: 'Trademarks, Patents, AI',
    icon: <Copyright className="w-5 h-5" />,
    questions: [
      "How do I register a trademark?",
      "What is the difference between a trademark and copyright?",
      "How do I protect my business name and logo legally?",
      "What should I do if someone is infringing on my copyright?",
      "Do I need a patent for my invention and how do I get one?"
    ]
  },
  {
    id: 'forms',
    title: 'Legal Forms',
    description: 'State Forms & Checklists',
    icon: <FileText className="w-5 h-5" />,
    questions: [
      "What forms do I need to file for divorce?",
      "How do I create a valid power of attorney document?",
      "What documents are required to form an LLC?",
      "How do I prepare a last will and testament?",
      "What forms do I need for a small claims court case?"
    ]
  },
  {
    id: 'consultant',
    title: 'Legal Consulting',
    description: 'Professional Advice',
    icon: <Briefcase className="w-5 h-5" />,
    questions: [
      "When should I hire a lawyer versus handle things myself?",
      "How much does a lawyer typically cost?",
      "What questions should I ask during a legal consultation?",
      "How do I find a reputable attorney in my area?",
      "What is the difference between a lawyer and paralegal?"
    ]
  },
  {
    id: 'enforceability',
    title: 'Enforceability Analysis',
    description: 'Legal Review',
    icon: <Landmark className="w-5 h-5" />,
    questions: [
      "Is my contract legally enforceable?",
      "What makes a non-compete agreement valid?",
      "Can I get out of a contract I signed under pressure?",
      "What are the requirements for a valid contract?",
      "How do I enforce a settlement agreement?"
    ]
  },
  {
    id: 'consumer',
    title: 'Consumer Protection',
    description: 'Product & Financial Issues',
    icon: <Shield className="w-5 h-5" />,
    questions: [
      "What are my rights if I was sold a defective product?",
      "How do I dispute fraudulent charges on my credit card?",
      "Can I sue a company for false advertising?",
      "What should I do if a debt collector is harassing me?",
      "How do I file a complaint against a business?"
    ]
  },
  {
    id: 'criminal',
    title: 'Criminal Matters',
    description: 'Charges & Defenses',
    icon: <Scale className="w-5 h-5" />,
    questions: [
      "What are my rights if I'm arrested?",
      "What is the difference between a misdemeanor and felony?",
      "How do I get a criminal record expunged?",
      "What should I do if I'm charged with a DUI?",
      "Can I represent myself in criminal court?"
    ]
  },
  {
    id: 'employment',
    title: 'Employment Law',
    description: 'Rights & Contracts',
    icon: <UsersIcon className="w-5 h-5" />,
    questions: [
      "What are my rights if I was wrongfully terminated?",
      "Is my employer required to pay overtime?",
      "Can my employer fire me without cause?",
      "What should I do if I experience workplace discrimination?",
      "How do I file a wage theft complaint?"
    ]
  },
  {
    id: 'injury',
    title: 'Personal Injury',
    description: 'Accidents & Malpractice',
    icon: <AlertTriangle className="w-5 h-5" />,
    questions: [
      "What should I do immediately after a car accident?",
      "How long do I have to file a personal injury lawsuit?",
      "What compensation can I receive for my injuries?",
      "Do I need a lawyer for a personal injury claim?",
      "How is fault determined in a car accident?"
    ]
  }
];

export default function Chatbot() {
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedDocumentText, setExtractedDocumentText] = useState<string>('');
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [showSafetyCheckpoint, setShowSafetyCheckpoint] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('restart') === '1' || params.get('newMatter') === '1') return true;
      if (localStorage.getItem('ezlegal-triage-completed') === 'true') return false;
      if (localStorage.getItem('ezlegal-jurisdiction')) return false;
      // For any authenticated-looking session (Supabase token present), default to hidden
      // and let the async profile check decide. This prevents a flash of triage UI on re-login.
      const hasSupabaseSession = Object.keys(localStorage).some((k) =>
        k.startsWith('sb-') && k.endsWith('-auth-token')
      );
      if (hasSupabaseSession) return false;
    } catch {
      // fall through
    }
    return true;
  });
  const [triageIssueType, setTriageIssueType] = useState<string>('');
  const [userJurisdiction, setUserJurisdiction] = useState<string>('');
  const [activeCrisis, setActiveCrisis] = useState<CrisisType | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [showPromptSearch, setShowPromptSearch] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<PromptSuggestion[]>([]);
  const [promptSearchQuery, setPromptSearchQuery] = useState('');
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [useRAGMode, setUseRAGMode] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(() => localStorage.getItem('ezlegal-advanced-mode') === 'true');
  const [disclaimerCollapsed, setDisclaimerCollapsed] = useState(() => localStorage.getItem('ezlegal-safety-checkpoint') === 'true');
  const [showInlineJurisdiction, setShowInlineJurisdiction] = useState(false);
  const [activeThreadDate, setActiveThreadDate] = useState<string | null>(null);
  const [sharePromptDismissed, setSharePromptDismissed] = useState(false);
  const [coverageExplainerOpen, setCoverageExplainerOpen] = useState(false);
  const [nextStepDismissed, setNextStepDismissed] = useState(false);
  const [emailCaptureDismissed, setEmailCaptureDismissed] = useState(false);
  const [showContextualPrediction, setShowContextualPrediction] = useState(false);
  const [sessionDocuments, setSessionDocuments] = useState<{ filename: string; extractedText: string; documentType: string }[]>([]);
  const [storageFallbackNotice, setStorageFallbackNotice] = useState(false);
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const { logChat } = useActivityLog();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const promptDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('restart') === '1' || params.get('newMatter') === '1') return;
    supabase
      .from('profiles')
      .select('preferred_jurisdiction')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const pref = (data as { preferred_jurisdiction?: string } | null)?.preferred_jurisdiction;
        if (pref) {
          setUserJurisdiction(pref);
          setShowSafetyCheckpoint(false);
          try {
            localStorage.setItem('ezlegal-jurisdiction', pref);
            localStorage.setItem('ezlegal-triage-completed', 'true');
          } catch {
            // ignore
          }
        } else {
          const completedBefore = localStorage.getItem('ezlegal-triage-completed') === 'true';
          const storedJurisdiction = localStorage.getItem('ezlegal-jurisdiction');
          if (!completedBefore && !storedJurisdiction) {
            setShowSafetyCheckpoint(true);
          }
        }
      });
  }, [user?.id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topicParam = params.get('topic');
    const topicFromDashboard = (location.state as { topic?: string })?.topic;
    const hasTopicOverride = !!topicParam || !!topicFromDashboard;

    if (!hasTopicOverride) {
      loadMessages();
    }
    loadChatHistory();
    loadAvailableModels();
    initializeSpeechRecognition();
    refreshProfile();
    const savedJurisdiction = localStorage.getItem('ezlegal-jurisdiction');
    if (savedJurisdiction) {
      setUserJurisdiction(savedJurisdiction);
    }
    const savedModelName = localStorage.getItem('ezlegal-selected-model');
    if (savedModelName) {
      loadSelectedModel(savedModelName);
    }
    let prefillFromStorage: string | null = null;
    let storageAvailable = true;
    try {
      prefillFromStorage = sessionStorage.getItem('ez_chatbot_prefill');
      if (prefillFromStorage) {
        setInput(prefillFromStorage);
        sessionStorage.removeItem('ez_chatbot_prefill');
      }
    } catch {
      storageAvailable = false;
    }
    const cameFromAsk = document.referrer.includes('/ask') || document.referrer.includes('/case-predictor');
    if (!storageAvailable && !prefillFromStorage && cameFromAsk) {
      setStorageFallbackNotice(true);
    }
    const prefillQuestion = params.get('q');
    if (prefillQuestion && !prefillFromStorage) {
      setInput(decodeURIComponent(prefillQuestion));
      window.history.replaceState({}, '', '/chatbot');
    }
    if (topicParam) {
      const topicLabels: Record<string, string> = {
        immigration: 'Immigration Law',
        housing: 'Housing & Tenant Rights',
        family: 'Family Law',
        employment: 'Employment & Wages',
        debt: 'Debt & Collections',
        criminal: 'Criminal Law',
        traffic: 'Traffic & Licenses',
      };
      const topicLabel = topicLabels[topicParam] || topicParam;
      setMessages([]);
      setFollowUpQuestions([]);
      setSelectedTopic(topicLabel);
      const question = `I need help with ${topicLabel}. Can you explain what this involves, the typical process, costs to expect, and what documents I might need?`;
      submitTopicQuestion(question);
      window.history.replaceState({}, '', '/chatbot');
    }
  }, []);

  const resetSafetyCheckpoint = () => {
    localStorage.removeItem('ezlegal-jurisdiction');
    localStorage.removeItem('ezlegal-safety-checkpoint');
    setDisclaimerCollapsed(false);
    setUserJurisdiction('');
  };

  const loadAvailableModels = async () => {
    const { data, error } = await supabase
      .from('ai_models')
      .select('id, model_name, display_name, description, tier_required, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setAvailableModels(data);
      const defaultModel = data.find(m => m.model_name === 'chatgpt');
      if (defaultModel && !selectedModel) {
        setSelectedModel(defaultModel);
      }
    }
  };

  const loadSelectedModel = async (modelName: string) => {
    const { data } = await supabase
      .from('ai_models')
      .select('id, model_name, display_name, description, tier_required, display_order')
      .eq('model_name', modelName)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setSelectedModel(data);
      chatService.setConfig({ modelOverride: data.model_name });
    }
  };

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
    chatService.setConfig({ modelOverride: model.model_name });
    localStorage.setItem('ezlegal-selected-model', model.model_name);
    setShowModelSelector(false);
  };

  const searchPrompts = async (query: string) => {
    if (!query || query.length < 1) {
      setPromptSuggestions([]);
      return;
    }

    const { data, error } = await supabase
      .from('chatbot_prompts')
      .select(`
        id,
        title,
        prompt_text,
        prompt_categories!inner(name)
      `)
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,prompt_text.ilike.%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(8);

    if (!error && data) {
      const formatted = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        prompt_text: p.prompt_text,
        category_name: p.prompt_categories?.name || 'General',
      }));
      setPromptSuggestions(formatted);
      setSelectedPromptIndex(0);
    }
  };

  const loadFeaturedPrompts = async () => {
    const { data, error } = await supabase
      .from('chatbot_prompts')
      .select(`
        id,
        title,
        prompt_text,
        prompt_categories!inner(name)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('usage_count', { ascending: false })
      .limit(8);

    if (!error && data) {
      const formatted = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        prompt_text: p.prompt_text,
        category_name: p.prompt_categories?.name || 'General',
      }));
      setPromptSuggestions(formatted);
    }
  };

  const handlePromptSelect = (prompt: PromptSuggestion) => {
    setInput(prompt.prompt_text);
    setShowPromptSearch(false);
    setPromptSearchQuery('');
    setPromptSuggestions([]);
    supabase
      .from('chatbot_prompts')
      .update({ usage_count: supabase.rpc('increment_usage', { row_id: prompt.id }) })
      .eq('id', prompt.id)
      .then(() => {});
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.startsWith('/')) {
      const searchTerm = value.slice(1);
      setPromptSearchQuery(searchTerm);
      setShowPromptSearch(true);
      if (searchTerm.length > 0) {
        searchPrompts(searchTerm);
      } else {
        loadFeaturedPrompts();
      }
    } else {
      setShowPromptSearch(false);
      setPromptSearchQuery('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showPromptSearch && promptSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedPromptIndex(prev =>
          prev < promptSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedPromptIndex(prev =>
          prev > 0 ? prev - 1 : promptSuggestions.length - 1
        );
      } else if (e.key === 'Enter' && showPromptSearch) {
        e.preventDefault();
        handlePromptSelect(promptSuggestions[selectedPromptIndex]);
      } else if (e.key === 'Escape') {
        setShowPromptSearch(false);
        setPromptSearchQuery('');
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (promptDropdownRef.current && !promptDropdownRef.current.contains(event.target as Node)) {
        setShowPromptSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadThreadMessages = async (date: string) => {
    if (!user) return;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      setActiveThreadDate(date);
    }
  };

  const handleSafetyCheckpointComplete = (data: { jurisdiction: string; hasUrgentDeadline: boolean }) => {
    setUserJurisdiction(data.jurisdiction);
    setShowSafetyCheckpoint(false);
    localStorage.setItem('ezlegal-jurisdiction', data.jurisdiction);
    localStorage.setItem('ezlegal-safety-checkpoint', 'true');
    localStorage.setItem('ezlegal-triage-completed', 'true');
    if (user?.id) {
      supabase
        .from('profiles')
        .update({ preferred_jurisdiction: data.jurisdiction })
        .eq('id', user.id)
        .then(() => undefined);
    }
  };

  useEffect(() => {
    const topicFromDashboard = (location.state as { topic?: string })?.topic;
    if (topicFromDashboard) {
      setMessages([]);
      setFollowUpQuestions([]);
      setSelectedTopic(topicFromDashboard);
      const question = `I need help with ${topicFromDashboard}. Can you explain what this involves, the typical process, costs to expect, and what documents I might need?`;
      submitTopicQuestion(question);
      window.history.replaceState({}, document.title);
    }
  }, [location.key]);

  const submitTopicQuestion = async (question: string) => {
    setLoading(true);
    setFollowUpQuestions([]);

    try {
      if (user) {
        chatService.setUserId(user.id);
      }
      if (userJurisdiction) {
        chatService.setConfig({ jurisdiction: userJurisdiction });
      }

      const aiResult = await chatService.sendMessage(question);
      const aiResponse = aiResult.content;
      const modelUsed = aiResult.modelUsed;
      const tokensUsed = aiResult.usage?.totalTokens;
      const aiFollowUps = aiResult.followUpQuestions || [];

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
          setMessages(prev => [...prev, { ...data, model_used: modelUsed, tokens_used: tokensUsed }]);
          loadChatHistory();
        }
      } else {
        const tempMessage: Message = {
          id: Date.now().toString(),
          message: question,
          response: aiResponse,
          created_at: new Date().toISOString(),
          model_used: modelUsed,
          tokens_used: tokensUsed,
        };
        setMessages(prev => [...prev, tempMessage]);
      }

      setFollowUpQuestions(aiFollowUps.length > 0 ? aiFollowUps : generateFallbackFollowUps(question));
    } catch (error) {
      console.error('Failed to get AI response:', error);
    }

    setLoading(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fillInputWithQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'es' ? 'es-MX' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInput(prev => prev + finalTranscript);
        } else if (interimTranscript) {
          setInput(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone access in your browser settings and try again.');
        } else if (event.error === 'no-speech') {
          alert('No speech was detected. Please try again and speak clearly into your microphone.');
        } else if (event.error === 'audio-capture') {
          alert('No microphone was found. Please ensure a microphone is connected and try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      if (!recognitionRef.current) {
        initializeSpeechRecognition();
      }

      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('Microphone access was denied. Please allow microphone access in your browser settings:\n\n1. Click the lock/info icon in the address bar\n2. Find "Microphone" in the permissions\n3. Set it to "Allow"\n4. Refresh the page and try again');
      } else if (err.name === 'NotFoundError') {
        alert('No microphone was found. Please connect a microphone and try again.');
      } else {
        alert('Could not access microphone. Please check your browser settings and try again.');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadedFiles(prev => [...prev, ...files]);
    setIsExtractingText(true);

    try {
      const allFiles = [...uploadedFiles, ...files];
      const extractedText = await extractTextFromFiles(allFiles);
      setExtractedDocumentText(extractedText);
    } catch (error) {
      console.error('Failed to extract text from documents:', error);
    } finally {
      setIsExtractingText(false);
    }
  };

  const removeFile = async (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);

    if (newFiles.length === 0) {
      setExtractedDocumentText('');
    } else {
      setIsExtractingText(true);
      try {
        const extractedText = await extractTextFromFiles(newFiles);
        setExtractedDocumentText(extractedText);
      } catch (error) {
        console.error('Failed to re-extract text:', error);
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

  const exportSummary = () => {
    const topics = messages.map(msg => msg.message.substring(0, 100)).join('\n- ');
    const summaryText = `EZLEGAL.AI CONVERSATION SUMMARY
Generated: ${new Date().toLocaleString()}
${userJurisdiction ? `Jurisdiction: ${userJurisdiction}` : ''}

TOPICS DISCUSSED:
- ${topics}

TOTAL MESSAGES: ${messages.length}

NEXT STEPS:
- Review the AI responses for accuracy
- Consult with a licensed attorney for legal advice
- Keep documentation for your records

IMPORTANT: This is legal information, not legal advice.
ezLegal.ai is not a law firm. For representation, consult a licensed attorney.

Full transcript available via "Export Transcript" option.
`;

    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startNewConversation = async () => {
    if (messages.length === 0 && !activeThreadDate) return;

    if (confirm('Are you sure you want to start a new conversation? This will clear the current chat.')) {
      setMessages([]);
      setInput('');
      setUploadedFiles([]);
      setActiveThreadDate(null);
      setFollowUpQuestions([]);
      chatService.clearHistory();
      loadChatHistory();
    }
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

  const loadChatHistory = async () => {
    if (!user) {
      setChatHistory([]);
      return;
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, message, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      const historyMap = new Map<string, ChatHistory>();

      data.forEach((msg) => {
        const msgDate = new Date(msg.created_at);
        const dateStr = msgDate.toLocaleDateString();
        const isoDate = msgDate.toISOString().split('T')[0];
        if (!historyMap.has(dateStr)) {
          historyMap.set(dateStr, {
            id: msg.id,
            title: msg.message.substring(0, 50) + (msg.message.length > 50 ? '...' : ''),
            timestamp: dateStr,
            date: isoDate,
            messageCount: 1
          });
        } else {
          const existing = historyMap.get(dateStr)!;
          existing.messageCount++;
        }
      });

      setChatHistory(Array.from(historyMap.values()));
    }
  };


  const generateFallbackFollowUps = (userQuestion: string): string[] => {
    const lowerQuestion = userQuestion.toLowerCase();

    if (lowerQuestion.includes('contract') || lowerQuestion.includes('agreement')) {
      return [
        "What are common pitfalls to avoid when signing a contract?",
        "How can I terminate or cancel an existing contract?",
        "What remedies are available if the other party breaches the contract?"
      ];
    } else if (lowerQuestion.includes('lawsuit') || lowerQuestion.includes('sue') || lowerQuestion.includes('litigation')) {
      return [
        "What evidence should I gather to strengthen my case?",
        "How much does it typically cost to file a lawsuit?",
        "What are the alternatives to going to court?"
      ];
    } else if (lowerQuestion.includes('copyright') || lowerQuestion.includes('trademark') || lowerQuestion.includes('patent') || lowerQuestion.includes('intellectual property')) {
      return [
        "How long does the trademark registration process take?",
        "What should I do if I receive a cease and desist letter?",
        "How can I license my intellectual property to others?"
      ];
    } else if (lowerQuestion.includes('employment') || lowerQuestion.includes('employee') || lowerQuestion.includes('workplace') || lowerQuestion.includes('terminated') || lowerQuestion.includes('fired')) {
      return [
        "What documentation should I keep about my employment situation?",
        "Can I file for unemployment benefits in my situation?",
        "What is the process for filing a complaint with the EEOC?"
      ];
    } else if (lowerQuestion.includes('will') || lowerQuestion.includes('estate') || lowerQuestion.includes('inheritance') || lowerQuestion.includes('trust')) {
      return [
        "How often should I update my estate planning documents?",
        "What happens if I die without a will?",
        "How can I protect my assets from creditors or lawsuits?"
      ];
    } else if (lowerQuestion.includes('divorce') || lowerQuestion.includes('custody') || lowerQuestion.includes('family')) {
      return [
        "How is child support calculated?",
        "What factors does the court consider for custody decisions?",
        "Can I modify a custody agreement after it's finalized?"
      ];
    } else if (lowerQuestion.includes('business') || lowerQuestion.includes('llc') || lowerQuestion.includes('corporation')) {
      return [
        "What ongoing compliance requirements do I need to meet?",
        "How do I protect my personal assets from business liabilities?",
        "What tax implications should I consider for my business structure?"
      ];
    } else if (lowerQuestion.includes('landlord') || lowerQuestion.includes('tenant') || lowerQuestion.includes('eviction') || lowerQuestion.includes('rent') || lowerQuestion.includes('lease')) {
      return [
        "What are my options if my landlord refuses to make repairs?",
        "How can I break my lease legally?",
        "What should I document when moving in or out of a rental?"
      ];
    } else if (lowerQuestion.includes('accident') || lowerQuestion.includes('injury') || lowerQuestion.includes('slip') || lowerQuestion.includes('fall') || lowerQuestion.includes('car')) {
      return [
        "What medical documentation should I collect for my case?",
        "How are pain and suffering damages calculated?",
        "Should I accept the insurance company's settlement offer?"
      ];
    } else if (lowerQuestion.includes('criminal') || lowerQuestion.includes('arrest') || lowerQuestion.includes('dui') || lowerQuestion.includes('charge')) {
      return [
        "What are my rights during a police encounter?",
        "How can a criminal record affect my future opportunities?",
        "What is the difference between a plea deal and going to trial?"
      ];
    } else if (lowerQuestion.includes('consumer') || lowerQuestion.includes('fraud') || lowerQuestion.includes('scam') || lowerQuestion.includes('defective')) {
      return [
        "What agencies can I report consumer fraud to?",
        "How do I document evidence of a defective product?",
        "Can I join a class action lawsuit against a company?"
      ];
    } else {
      return [
        "What documents should I gather to support my legal matter?",
        "What is the typical timeline for resolving this type of issue?",
        "When should I consider hiring an attorney for help?"
      ];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isExtractingText) return;
    if (showPromptSearch) {
      setShowPromptSearch(false);
      return;
    }

    setLoading(true);
    setFollowUpQuestions([]);
    setActiveCrisis(null);
    const userMessage = input.trim();
    setInput('');
    setActiveThreadDate(null);

    const detectedCrisis = detectCrisis(userMessage);
    if (detectedCrisis) {
      setActiveCrisis(detectedCrisis);
    }

    const documentTextToSend = extractedDocumentText;
    if (extractedDocumentText && uploadedFiles.length > 0) {
      setSessionDocuments(prev => [...prev, {
        filename: uploadedFiles.map(f => f.name).join(', '),
        extractedText: extractedDocumentText,
        documentType: uploadedFiles.length > 1 ? 'multiple' : uploadedFiles[0]?.type || 'document'
      }]);
    }
    setUploadedFiles([]);
    setExtractedDocumentText('');

    try {
      if (user) {
        chatService.setUserId(user.id);
      }
      if (userJurisdiction) {
        chatService.setConfig({ jurisdiction: userJurisdiction });
      }
      chatService.setConfig({ useRAGPipeline: useRAGMode, useOpenAI: !useRAGMode });

      const aiResult = await chatService.sendMessage(userMessage, documentTextToSend);
      const aiResponse = aiResult.content;
      const modelUsed = aiResult.modelUsed;
      const tokensUsed = aiResult.usage?.totalTokens;
      const aiFollowUps = aiResult.followUpQuestions || [];

      if (user) {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: userMessage,
            response: aiResponse,
          })
          .select()
          .single();

        if (!error && data) {
          setMessages([...messages, { ...data, model_used: modelUsed, tokens_used: tokensUsed }]);
          loadChatHistory();
          logChat({
            title: userMessage.substring(0, 80) + (userMessage.length > 80 ? '...' : ''),
            description: aiResponse.substring(0, 150),
            jurisdiction: userJurisdiction || undefined,
            messageCount: messages.length + 1,
            relatedId: data.id
          });

          storeAnonymizedSearch({
            queryText: userMessage,
            caseType: detectCaseType(userMessage) || undefined,
            jurisdiction: userJurisdiction || undefined,
            intent: classifyQueryIntent(userMessage)
          });
        }
      } else {
        const tempMessage: Message = {
          id: Date.now().toString(),
          message: userMessage,
          response: aiResponse,
          created_at: new Date().toISOString(),
          model_used: modelUsed,
          tokens_used: tokensUsed,
        };
        setMessages([...messages, tempMessage]);
      }

      setFollowUpQuestions(aiFollowUps.length > 0 ? aiFollowUps : generateFallbackFollowUps(userMessage));

      if (!userJurisdiction) {
        const highRiskKeywords = ['eviction', 'custody', 'immigration', 'deportation', 'arrested', 'domestic violence', 'restraining order', 'asylum', 'detained', 'criminal', 'felony', 'housing', 'family court'];
        if (highRiskKeywords.some(kw => userMessage.toLowerCase().includes(kw))) {
          setShowInlineJurisdiction(true);
        }
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    }

    setLoading(false);
  };

  const quickPrompts = language === 'es' ? [
    "Ayúdame a entender el derecho contractual",
    "¿Qué debo saber sobre la propiedad intelectual?",
    "Explica mis derechos laborales",
    "¿Cómo empiezo un negocio?",
    "¿Cuáles son mis derechos como inquilino?",
    "Explica el proceso de divorcio",
    "¿Cómo presento un caso en corte de reclamos menores?",
    "¿Qué es la planificación patrimonial?",
  ] : [
    "Help me understand contract law",
    "What should I know about intellectual property?",
    "Explain my employment rights",
    "How do I start a business?",
    "What are my tenant rights?",
    "Explain divorce proceedings",
    "How do I file a small claims case?",
    "What is estate planning?",
  ];

  const filteredTopics = legalTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showSafetyCheckpoint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-teal-50 flex items-center justify-center p-4">
        <TriageIntake
          onComplete={(result) => {
            const issueLabels: Record<string, string> = {
              housing: 'Housing & Tenant Rights', employment: 'Employment & Wages',
              family: 'Family Law', immigration: 'Immigration Law',
              debt: 'Debt & Collections', criminal: 'Criminal Law',
              injury: 'Personal Injury', business: 'Business & Contracts',
              benefits: 'Government Benefits', other: 'General Legal Question',
            };
            handleSafetyCheckpointComplete({
              jurisdiction: result.jurisdiction,
              hasUrgentDeadline: result.urgency === 'emergency' || result.urgency === 'urgent',
            });
            if (result.issueType) {
              setSelectedTopic(issueLabels[result.issueType] || result.issueType);
              setTriageIssueType(result.issueType);
            }
            setShowSafetyCheckpoint(false);
          }}
          onSkip={() => setShowSafetyCheckpoint(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-navy-50 relative">
      <h1 className="sr-only">{language === 'es' ? 'Asistente Legal IA' : 'AI Legal Assistant'}</h1>
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'} fixed inset-y-0 left-0 z-40 lg:relative lg:z-auto transition-all duration-300 bg-white border-r border-navy-200 flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-navy-200">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/red-and-grey-minamali-business-card-2-1-2.svg"
                alt="ezLegal.ai"
                width={128}
                height={32}
                decoding="async"
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-navy-100 rounded-lg transition-colors lg:hidden"
            >
              <ChevronLeft className="w-5 h-5 text-navy-600" />
            </button>
          </div>

          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            {t('chat.newChat')}
          </button>
        </div>

        {/* Jurisdiction */}
        {userJurisdiction && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-4 py-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-blue-800">{userJurisdiction}</span>
              </div>
              <button
                onClick={resetSafetyCheckpoint}
                className="text-xs text-teal-600 hover:text-blue-800 hover:underline"
              >
                {language === 'es' ? 'Cambiar' : 'Change'}
              </button>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="p-4 space-y-1 flex-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold text-navy-500 uppercase tracking-wide">
            {language === 'es' ? 'Principal' : 'Main'}
          </p>

          <Link
            to="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2 text-navy-700 hover:bg-navy-100 rounded-lg transition-colors"
          >
            <Briefcase className="w-4 h-4 text-navy-400" />
            <span className="font-medium text-sm">{t('sidebar.dashboard')}</span>
          </Link>

          <Link
            to="/dashboard/ai-assistant"
            className="w-full flex items-center gap-3 px-3 py-2 text-navy-700 hover:bg-navy-100 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4 text-navy-400" />
            <span className="font-medium text-sm flex-1">{t('sidebar.aiLawyerMatch')}</span>
            <span className="bg-yellow-400 text-navy-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
          </Link>

          <button
            onClick={() => setShowContextualPrediction(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-navy-700 hover:bg-navy-100 rounded-lg transition-colors group text-left"
          >
            <Scale className="w-4 h-4 text-navy-400 group-hover:text-amber-500" />
            <span className="font-medium text-sm flex-1">{language === 'es' ? 'Predictor de Resultados' : 'Case Outcome Predictor'}</span>
            {(uploadedFiles.length > 0 || messages.length > 0) && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">READY</span>
            )}
          </button>

          <button
            onClick={() => setShowTopicsModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-navy-700 hover:bg-navy-100 rounded-lg transition-colors text-left"
          >
            <BookOpen className="w-4 h-4 text-navy-400" />
            <span className="font-medium text-sm">{t('ai.browseTopics')}</span>
          </button>

          <Link
            to="/dashboard/history"
            className="w-full flex items-center gap-3 px-3 py-2 text-navy-700 hover:bg-navy-100 rounded-lg transition-colors"
          >
            <Clock className="w-4 h-4 text-navy-400" />
            <span className="font-medium text-sm">{language === 'es' ? 'Historial de Chats' : 'Recent Chat History'}</span>
          </Link>

          <Link
            to="/dashboard/documents"
            className="w-full flex items-center gap-3 px-3 py-2 text-navy-700 hover:bg-navy-100 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 text-navy-400" />
            <span className="font-medium text-sm">{t('sidebar.documents')}</span>
          </Link>

          <Link
            to="/dashboard/research"
            className="w-full flex items-center gap-3 px-3 py-2 text-navy-700 hover:bg-navy-100 rounded-lg transition-colors"
          >
            <Search className="w-4 h-4 text-navy-400" />
            <span className="font-medium text-sm">{t('sidebar.research')}</span>
          </Link>

          <Link
            to="/dashboard/lawyer-profiles"
            className="w-full flex items-center gap-3 px-3 py-2 text-navy-700 hover:bg-navy-100 rounded-lg transition-colors"
          >
            <UsersIcon className="w-4 h-4 text-navy-400" />
            <span className="font-medium text-sm">{t('sidebar.lawyerProfiles')}</span>
          </Link>
        </div>

        {/* Share Section */}
        <div className="p-4 border-t border-navy-200 flex-shrink-0">
          <ShareButton variant="default" context="legal-help" path="/chatbot" />
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-navy-200 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard/profile" className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <UserAvatar
                  avatarUrl={profile?.avatar_url}
                  name={profile?.full_name}
                  email={user.email}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-navy-900 truncate">
                    {profile?.full_name || user.email}
                  </p>
                  <p className="text-[10px] text-navy-400">
                    {profile?.subscription_tier === 'premium' ? (language === 'es' ? 'Premium' : 'Premium') : (language === 'es' ? 'Gratuito' : 'Free')}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => signOut()}
                className="p-1.5 text-navy-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title={t('sidebar.signOut')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white rounded-lg transition-all font-semibold text-xs shadow-sm"
              >
                {t('sidebar.signIn')}
              </Link>
              <Link
                to="/signup"
                className="flex-1 flex items-center justify-center px-3 py-2 bg-navy-100 hover:bg-navy-200 text-navy-700 rounded-lg transition-colors font-medium text-xs"
              >
                {t('sidebar.createAccount')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-navy-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-navy-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5 text-navy-600" />
                </button>
              )}
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img
                  src="/red-and-grey-minamali-business-card-2-1-2.svg"
                  alt="ezLegal.ai"
                  width={160}
                  height={40}
                  decoding="async"
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = !advancedMode;
                  setAdvancedMode(next);
                  localStorage.setItem('ezlegal-advanced-mode', String(next));
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${advancedMode ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-navy-50 border-navy-200 text-navy-500'}`}
                title={advancedMode ? 'Switch to Basic mode' : 'Switch to Advanced mode'}
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{advancedMode ? 'Advanced' : 'Basic'}</span>
              </button>
              {advancedMode && (
                <button
                  onClick={() => setShowModelSelector(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-navy-100 hover:bg-navy-200 text-navy-700 rounded-xl transition-all font-medium border border-navy-200"
                  title="Select ChatGPT Version"
                >
                  <Settings2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{selectedModel?.display_name || 'ChatGPT'}</span>
                  <ChevronDown className="w-4 h-4 text-navy-400" />
                </button>
              )}
              <ActionDrawer
                onExportChat={messages.length > 0 ? exportConversation : undefined}
                onShareChat={messages.length > 0 ? exportSummary : undefined}
                onPrediction={() => setShowContextualPrediction(true)}
                showPrediction={messages.length >= 2}
              />
              <UserMenu />
            </div>
          </div>
        </div>

        <InFlowTrustStrip jurisdiction={userJurisdiction} compact showEscalation />

        {selectedTopic && (
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-6 py-3 shadow-md">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider leading-none mb-0.5">
                    {language === 'es' ? 'Estás preguntando sobre' : "You're asking about"}
                  </p>
                  <p className="text-sm font-bold text-white">{selectedTopic}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/find-attorney"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <UsersIcon className="w-3.5 h-3.5" />
                  {language === 'es' ? 'Buscar abogado' : 'Find a lawyer'}
                </Link>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Clear topic"
                >
                  <X className="w-4 h-4 text-navy-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-navy-50 to-white">
          <div className="max-w-4xl mx-auto space-y-6">
            {!disclaimerCollapsed ? (
              <div className="bg-navy-50 border border-navy-200 rounded-xl p-3 flex items-start gap-3">
                <Info className="w-4 h-4 text-navy-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-navy-600">
                    {language === 'es'
                      ? 'ezLegal.ai proporciona información legal, no asesoramiento legal. No se crea relacion abogado-cliente.'
                      : 'ezLegal.ai provides legal information, not legal advice. No attorney-client relationship is created.'}
                    {' '}
                    <Link to="/scope-disclaimers" className="underline font-medium text-teal-600">
                      {language === 'es' ? 'Mas información' : 'Learn more'}
                    </Link>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDisclaimerCollapsed(true);
                    localStorage.setItem('ezlegal-safety-checkpoint', 'true');
                  }}
                  className="text-navy-400 hover:text-navy-600 transition-colors flex-shrink-0"
                  aria-label="Collapse safety notice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => setDisclaimerCollapsed(false)}
                  className="flex items-center gap-1.5 text-xs text-navy-400 hover:text-navy-600 transition-colors"
                  aria-label="Show safety and scope notice"
                >
                  <Shield className="w-3 h-3" />
                  <span>{language === 'es' ? 'Seguridad y alcance' : 'Safety & Scope'}</span>
                </button>
              </div>
            )}

            {showInlineJurisdiction && !userJurisdiction && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4" role="status" aria-live="polite">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800 mb-1">
                      {language === 'es' ? 'Pregunta sensible detectada' : 'Sensitive topic detected'}
                    </p>
                    <p className="text-xs text-amber-700 mb-2">
                      {language === 'es'
                        ? 'Para darte orientación mas precisa, necesitamos saber tu estado.'
                        : 'To give you more accurate guidance, we need your state. Legal rights vary significantly by jurisdiction.'}
                    </p>
                    <details className="mb-3">
                      <summary className="text-xs text-amber-600 cursor-pointer hover:text-amber-800 font-medium">
                        {language === 'es' ? '¿Por qué preguntamos?' : 'Why are we asking?'}
                      </summary>
                      <p className="text-xs text-amber-700 mt-1 pl-2 border-l-2 border-amber-300">
                        {language === 'es'
                          ? 'Las leyes varían significativamente entre estados. Por ejemplo, los derechos de inquilinos, plazos de custodia y procedimientos de desalojo difieren dramáticamente.'
                          : 'Laws vary significantly between states. For example, tenant rights, custody timelines, and eviction procedures differ dramatically. Without your state, we can only provide general guidance.'}
                      </p>
                    </details>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 max-w-md">
                        <JurisdictionSelector
                          variant="compact"
                          value={userJurisdiction}
                          onChange={(value) => {
                            setUserJurisdiction(value);
                            if (value) {
                              localStorage.setItem('ezlegal-jurisdiction', value);
                              setShowInlineJurisdiction(false);
                            }
                          }}
                        />
                      </div>
                      <button
                        onClick={() => setShowInlineJurisdiction(false)}
                        className="text-xs text-amber-700 hover:text-amber-900 underline mt-2"
                      >
                        {language === 'es' ? 'Omitir' : "Not sure / Skip"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!user && (
              <div className="bg-gradient-to-r from-teal-50 to-teal-100 border-2 border-teal-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-navy-900 mb-2">{language === 'es' ? 'Bienvenido, Invitado' : 'Welcome, Guest!'}</h4>
                    <p className="text-sm text-navy-700 mb-3">
                      {language === 'es'
                        ? 'Estás usando el Asistente Legal IA como invitado. El historial no se guardará. Crea una cuenta gratis para guardar tus conversaciones.'
                        : "You're using the AI Legal Assistant as a guest. Chat history won't be saved. Create a free account to save your conversations and access premium features."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/signup"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white rounded-lg transition-all font-semibold shadow-md text-sm"
                      >
                        {t('signup.createFreeAccount')}
                      </Link>
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-navy-50 text-navy-700 border-2 border-navy-200 rounded-lg transition-colors font-medium text-sm"
                      >
                        {t('sidebar.signIn')}
                      </Link>
                    </div>
                  </div>
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
                  {language === 'es'
                    ? 'Haz cualquier pregunta legal y obtén orientación instantánea. Estoy entrenado en la ley de EE.UU. para ayudar a consumidores y pequeñas empresas a entender su situación legal.'
                    : "Ask any legal question and get instant guidance. I'm trained on U.S. law to help consumers and small businesses understand their legal situation before consulting with an attorney."}
                </p>

                <div className="bg-white rounded-2xl p-6 shadow-xl border border-navy-200 mb-8 text-left max-w-2xl mx-auto">
                  <h4 className="font-bold text-navy-900 mb-3">{language === 'es' ? 'Cómo funciona:' : 'How it works:'}</h4>
                  <ol className="space-y-2 text-navy-700 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>{language === 'es' ? 'Escribe tu pregunta legal en el cuadro de abajo' : 'Type your legal question in the box below'}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>{language === 'es' ? 'Obtén respuestas instantáneas basadas en la ley de EE.UU.' : 'Get instant answers based on U.S. law'}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>{language === 'es' ? 'Haz preguntas de seguimiento para aclarar dudas' : 'Ask follow-up questions for clarification'}</span>
                    </li>
                  </ol>
                </div>

                <h4 className="text-lg font-semibold text-navy-900 mb-4">{t('chat.suggestedQuestions')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => fillInputWithQuestion(prompt)}
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
                    <UserAvatar
                      avatarUrl={profile?.avatar_url}
                      name={profile?.full_name}
                      email={user?.email}
                      size="md"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 max-w-2xl">
                      <div className="bg-white border-2 border-navy-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md">
                        <p className="text-[15px] text-navy-700 leading-relaxed whitespace-pre-line">{msg.response}</p>
                        {(() => {
                          const conf = getSourceCoverage(msg.response);
                          return (
                            <div className="mt-3 pt-3 border-t border-navy-100">
                              <div className="flex items-center gap-3">
                                <div className="group relative flex items-center gap-1.5">
                                  <Shield className={`w-3.5 h-3.5 ${conf.color}`} />
                                  <span className={`text-xs font-medium ${conf.color}`}>{conf.label}</span>
                                  <button
                                    onClick={() => setCoverageExplainerOpen(!coverageExplainerOpen)}
                                    className="text-navy-300 hover:text-navy-500 transition-colors"
                                    aria-label="How to read source coverage"
                                    aria-expanded={coverageExplainerOpen}
                                  >
                                    <HelpCircle className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="flex-1 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${conf.level === 'high' ? 'bg-green-500' : conf.level === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ width: `${conf.pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-navy-400">{conf.pct}%</span>
                              </div>

                              {coverageExplainerOpen && (
                                <div className="mt-2 p-3 bg-navy-50 rounded-lg border border-navy-100 text-xs space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold text-navy-800">How to read source coverage</p>
                                    <button
                                      onClick={() => setCoverageExplainerOpen(false)}
                                      className="text-navy-400 hover:text-navy-600"
                                      aria-label="Close"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-navy-600">
                                    Source coverage measures how well this response is supported by legal citations
                                    and authoritative sources. It is <strong>not</strong> a measure of legal correctness.
                                  </p>
                                  <div className="space-y-1.5">
                                    <div className="flex items-start gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                                      <p className="text-navy-600"><span className="font-medium text-green-700">75-95%</span> -- Response cites specific statutes, regulations, or authoritative sources.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                                      <p className="text-navy-600"><span className="font-medium text-amber-700">50-74%</span> -- Response references legal principles but may lack specific citations.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                                      <p className="text-navy-600"><span className="font-medium text-red-700">25-49%</span> -- Response is general guidance with limited source support.</p>
                                    </div>
                                  </div>
                                  <div className="pt-1.5 border-t border-navy-200 space-y-1">
                                    <p className="text-navy-500 font-medium">Limitations</p>
                                    <ul className="text-navy-500 space-y-0.5 list-disc list-inside">
                                      <li>Coverage is estimated from response text patterns, not verified retrieval</li>
                                      <li>High coverage does not guarantee accuracy or applicability to your situation</li>
                                      <li>Laws vary by jurisdiction and change over time</li>
                                    </ul>
                                  </div>
                                  {conf.level === 'low' && (
                                    <div className="pt-1.5 border-t border-navy-200">
                                      <p className="text-amber-700 font-medium flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Low coverage? Here's what to do:
                                      </p>
                                      <ul className="text-navy-600 mt-1 space-y-0.5 list-disc list-inside">
                                        <li>Rephrase your question with more specific details (jurisdiction, dates, parties)</li>
                                        <li><Link to="/find-attorney" className="text-teal-600 hover:underline">Consult an attorney</Link> for matters requiring verified legal analysis</li>
                                        <li><Link to="/ezreads" className="text-teal-600 hover:underline">Browse legal guides</Link> for curated, reviewed information</li>
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {msg.model_used && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy-100">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-navy-400">
                              Powered by {msg.model_used}
                              {msg.tokens_used && ` (${msg.tokens_used} tokens)`}
                            </span>
                          </div>
                        )}
                      </div>
                      {messages.indexOf(msg) === messages.length - 1 && messages.length >= 1 && !sharePromptDismissed && !loading && (
                        <ChatSharePrompt
                          messageCount={messages.length}
                          onDismiss={() => setSharePromptDismissed(true)}
                        />
                      )}
                      {messages.indexOf(msg) === messages.length - 1 && messages.length >= 1 && !nextStepDismissed && !loading && (
                        <NextBestStep
                          messageCount={messages.length}
                          lastMessage={msg.response}
                          onDismiss={() => setNextStepDismissed(true)}
                        />
                      )}
                      {messages.indexOf(msg) === messages.length - 1 && messages.length >= 1 && !emailCaptureDismissed && !loading && !user && (
                        <EmailCapturePanel
                          context={msg.response.slice(0, 200)}
                          onDismiss={() => setEmailCaptureDismissed(true)}
                        />
                      )}
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
                <div className="bg-white border-2 border-navy-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            {!loading && followUpQuestions.length > 0 && messages.length > 0 && (
              <div className="mt-6 bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200 rounded-2xl p-5 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900">{language === 'es' ? 'Preguntas relacionadas que podrías explorar' : 'Related Questions You Might Want to Explore'}</h4>
                    <p className="text-sm text-navy-600">{language === 'es' ? 'Haz clic en cualquier pregunta para saber más' : 'Click any question below to learn more'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {followUpQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => fillInputWithQuestion(question)}
                      className="w-full text-left p-3 bg-white border border-navy-200 rounded-xl hover:border-teal-600 hover:bg-teal-50 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 transition-colors">
                          <span className="text-sm font-bold text-teal-600 group-hover:text-white transition-colors">{index + 1}</span>
                        </div>
                        <span className="text-sm text-navy-700 group-hover:text-teal-600 transition-colors font-medium">{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!loading && messages.length >= 2 && (
              <button
                onClick={() => setShowContextualPrediction(true)}
                className="mt-6 w-full text-left bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-amber-400 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Scale className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-navy-900">{language === 'es' ? 'Predictor IA de Resultados' : 'AI Case Outcome Predictor'}</h4>
                      {uploadedFiles.length > 0 ? (
                        <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{uploadedFiles.length} DOC{uploadedFiles.length > 1 ? 'S' : ''} READY</span>
                      ) : (
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>
                      )}
                    </div>
                    <p className="text-sm text-navy-600 mb-3">
                      {uploadedFiles.length > 0
                        ? `Analyze your ${uploadedFiles.length} uploaded document${uploadedFiles.length > 1 ? 's' : ''} and conversation to predict case outcomes. Our AI will extract key facts, identify legal issues, and estimate your chances.`
                        : 'Get an AI-powered analysis of your case\'s potential outcomes. Our predictor analyzes similar cases in your jurisdiction to estimate settlement ranges, trial prospects, and key factors.'}
                    </p>
                    <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm group-hover:text-amber-800">
                      <span>{uploadedFiles.length > 0 ? 'Analyze My Documents' : 'Try Case Predictor'}</span>
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            )}
            {activeCrisis && (
              <CrisisEscalationCard
                crisisType={activeCrisis}
                onDismiss={() => setActiveCrisis(null)}
                triggerMessage={messages.length > 0 ? messages[messages.length - 1].message : undefined}
                jurisdiction={userJurisdiction}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Handoff Toolbar */}
        <ChatHandoffToolbar
          hasMessages={messages.length > 0}
          onExportTranscript={exportConversation}
          onExportSummary={exportSummary}
        />

        {storageFallbackNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
            <p className="text-sm text-amber-800">
              <Info className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Your browser's storage is restricted, so we couldn't prefill your question. Please paste or retype it below.
            </p>
            <button onClick={() => setStorageFallbackNotice(false)} className="text-amber-600 hover:text-amber-800 ml-4 flex-shrink-0" aria-label="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-navy-200 px-6 py-5 shadow-xl">
          <form ref={formRef} onSubmit={handleSubmit} className="max-w-4xl mx-auto">
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
                  <div className="flex items-center gap-2 text-sm text-teal-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting document text...</span>
                  </div>
                ) : extractedDocumentText ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Document content ready ({Math.round(extractedDocumentText.length / 1024)} KB extracted)</span>
                  </div>
                ) : null}
              </div>
            )}

            <div className="relative" ref={promptDropdownRef}>
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="bg-navy-100 hover:bg-navy-200 text-navy-700 p-2.5 sm:p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
                  title="Upload documents"
                >
                  <Upload className="w-5 h-5" />
                </button>

                {advancedMode && (
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    disabled={loading}
                    className={`${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-navy-100 hover:bg-navy-200 text-navy-700'
                    } hidden sm:flex items-center justify-center p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-shrink-0`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}

                {advancedMode && (
                  <button
                    type="button"
                    onClick={() => setUseRAGMode(!useRAGMode)}
                    className={`hidden sm:flex items-center justify-center p-3 rounded-xl transition-all shadow-sm flex-shrink-0 ${
                      useRAGMode
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-navy-100 hover:bg-navy-200 text-navy-700'
                    }`}
                    title={useRAGMode ? 'RAG Mode: ON (uses LegalBreeze knowledge base)' : 'RAG Mode: OFF (uses standard AI)'}
                  >
                    <BookOpen className="w-5 h-5" />
                  </button>
                )}

                <div className="flex-1 relative">
                  <label htmlFor="chat-input" className="sr-only">Ask your legal question</label>
                  <input
                    id="chat-input"
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder={
                      advancedMode
                        ? (language === 'es' ? 'Haz tu pregunta (escribe "/" para buscar)' : 'Ask your question (type "/" to search prompts)')
                        : (language === 'es' ? 'Haz tu pregunta legal...' : 'Ask your legal question...')
                    }
                    disabled={loading}
                    aria-label="Ask your legal question"
                    className="w-full px-5 py-3 border-2 border-navy-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 placeholder-navy-400 text-[15px]"
                  />

                  {showPromptSearch && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-navy-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
                      <div className="p-3 border-b border-navy-100 bg-navy-50 rounded-t-xl">
                        <div className="flex items-center gap-2 text-sm text-navy-600">
                          <Search className="w-4 h-4" />
                          <span>
                            {promptSearchQuery
                              ? `Searching: "${promptSearchQuery}"`
                              : 'Type to search prompts or use arrow keys'}
                          </span>
                        </div>
                      </div>
                      {promptSuggestions.length === 0 ? (
                        <div className="p-4 text-center text-navy-500">
                          {promptSearchQuery ? 'No prompts found' : 'Loading featured prompts...'}
                        </div>
                      ) : (
                        <div className="py-1">
                          {promptSuggestions.map((prompt, index) => (
                            <button
                              key={prompt.id}
                              type="button"
                              onClick={() => handlePromptSelect(prompt)}
                              className={`w-full text-left px-4 py-3 transition-colors ${
                                selectedPromptIndex === index
                                  ? 'bg-teal-50 border-l-4 border-teal-600'
                                  : 'hover:bg-navy-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  selectedPromptIndex === index
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-navy-100 text-navy-600'
                                }`}>
                                  <Lightbulb className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm ${
                                    selectedPromptIndex === index ? 'text-teal-600' : 'text-navy-900'
                                  }`}>
                                    {prompt.title}
                                  </p>
                                  <p className="text-xs text-navy-500 truncate mt-0.5">
                                    {prompt.prompt_text}
                                  </p>
                                  <span className="inline-block mt-1 text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded">
                                    {prompt.category_name}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="p-2 border-t border-navy-100 bg-navy-50 rounded-b-xl">
                        <p className="text-xs text-navy-500 text-center">
                          Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Enter</kbd> to select
                          or <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Esc</kbd> to close
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !input.trim() || isExtractingText || showPromptSearch}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white px-4 sm:px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {useRAGMode && (
                <div className="flex items-center gap-2 mt-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <BookOpen className="w-4 h-4" />
                  <span>RAG Mode Active - Using LegalBreeze legal knowledge base with citations</span>
                </div>
              )}
            </div>
            <div className="mt-3">
              <PrivacyMicroPanelInline context="chat" />
            </div>
          </form>
        </div>
      </div>

      {/* Topics Modal */}
      {showTopicsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTopicsModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">{language === 'es' ? 'Explorar Temas Legales' : 'Browse Legal Topics'}</h3>
              <button
                onClick={() => setShowTopicsModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-8">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="text"
                  placeholder={language === 'es' ? 'Buscar temas o preguntas...' : 'Search topics or questions...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 border-2 border-navy-200 rounded-xl focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 focus:outline-none text-base"
                />
              </div>

              <p className="text-sm text-navy-600 mb-4">Click a topic to see common questions, then select a question to get started.</p>

              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
                {filteredTopics.map((topic) => (
                  <div key={topic.id} className="border-2 border-navy-200 rounded-xl overflow-hidden transition-all hover:border-teal-600/50">
                    <button
                      onClick={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)}
                      className="w-full flex items-center gap-4 p-4 bg-gradient-to-br from-navy-50 to-white text-left group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center flex-shrink-0 text-teal-600 group-hover:scale-105 transition-transform">
                        {topic.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-navy-900 group-hover:text-teal-600 transition-colors">{topic.title}</h4>
                        <p className="text-sm text-navy-600">{topic.description}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${expandedTopicId === topic.id ? 'bg-teal-600 text-white' : 'bg-navy-100 text-navy-500'}`}>
                        {expandedTopicId === topic.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {expandedTopicId === topic.id && (
                      <div className="bg-navy-50 border-t border-navy-200 p-4 space-y-2">
                        <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-3">Select a question to ask:</p>
                        {topic.questions.map((question, qIndex) => (
                          <button
                            key={qIndex}
                            onClick={() => {
                              setSelectedTopic(topic.title);
                              setShowTopicsModal(false);
                              setExpandedTopicId(null);
                              fillInputWithQuestion(question);
                            }}
                            className="w-full text-left p-3 bg-white border border-navy-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition-all group/q"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/q:bg-teal-600 transition-colors">
                                <span className="text-xs font-bold text-teal-600 group-hover/q:text-white transition-colors">{qIndex + 1}</span>
                              </div>
                              <span className="text-sm text-navy-700 group-hover/q:text-teal-600 transition-colors">{question}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Selector Modal */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModelSelector(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Please Select ChatGPT Version</h3>
              <button
                onClick={() => setShowModelSelector(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-4 max-h-[65vh] overflow-y-auto">
              <div className="space-y-2">
                {availableModels.map((model) => {
                  const isSelected = selectedModel?.model_name === model.model_name;
                  const isPremium = model.tier_required === 'premium';
                  const userTier = profile?.subscription_tier || 'free';
                  const canSelect = !isPremium || userTier === 'premium' || userTier === 'enterprise';

                  return (
                    <button
                      key={model.id}
                      onClick={() => canSelect && handleModelSelect(model)}
                      disabled={!canSelect}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50'
                          : canSelect
                            ? 'border-navy-200 hover:border-teal-600/50 hover:bg-navy-50'
                            : 'border-navy-100 bg-navy-50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-navy-100 text-navy-600'
                          }`}>
                            <Bot className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${isSelected ? 'text-teal-600' : 'text-navy-900'}`}>
                                {model.display_name}
                              </span>
                              {isPremium && (
                                <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                  PRO
                                </span>
                              )}
                            </div>
                            {model.description && (
                              <p className="text-sm text-navy-500 mt-0.5">{model.description}</p>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {profile?.subscription_tier !== 'premium' && profile?.subscription_tier !== 'enterprise' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Upgrade to Premium</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Get access to advanced AI models with better reasoning for complex legal questions.
                      </p>
                      <Link
                        to="/pricing"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800 mt-2"
                      >
                        View Plans
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showContextualPrediction && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pb-24 md:pb-4 overflow-y-auto">
          <div className="max-w-3xl w-full my-4">
            <ContextualOutcomePrediction
              chatMessages={messages.map(m => [
                { role: 'user' as const, content: m.message },
                { role: 'assistant' as const, content: m.response }
              ]).flat()}
              documents={sessionDocuments.length > 0 ? sessionDocuments : (extractedDocumentText ? [{
                filename: uploadedFiles.map(f => f.name).join(', '),
                extractedText: extractedDocumentText,
                documentType: 'multiple'
              }] : [])}
              onClose={() => setShowContextualPrediction(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
