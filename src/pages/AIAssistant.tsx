import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  Send, Bot, User, Sparkles, Download, Mic, MicOff, Upload, FileText,
  Trash2, MessageSquare, Zap, TrendingUp, Users,
  Shield, Award, ArrowRight, CheckCircle2, Star, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import RealLawyerDirectory from '../components/RealLawyerDirectory';

interface Message {
  id: string;
  message: string;
  response: string;
  created_at: string;
  suggested_practice_area?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const promptsLibrary = {
  'Adult Guardianship': [
    'What is adult guardianship and when is it needed?',
    'How do I become a guardian for an incapacitated adult?',
    'What are the responsibilities of a guardian?',
    'Can a guardianship be challenged or terminated?',
    'What are alternatives to guardianship in Arizona?',
  ],
  'Consumer Protection': [
    'What are my rights under consumer protection laws?',
    'How do I report fraud or deceptive business practices?',
    'Can I get a refund for defective products?',
    'What protections do I have against debt collectors?',
    'How do I file a complaint with the Attorney General?',
  ],
  'Criminal Matter': [
    'What are my rights if I am arrested?',
    'How does the criminal court process work?',
    'What is the difference between a misdemeanor and felony?',
    'Can I get my criminal record expunged or set aside?',
    'What should I do if I receive a court summons?',
  ],
  'Dependency & Juvenile Court': [
    'What happens in a dependency case involving my child?',
    'What are my rights as a parent in juvenile court?',
    'How can I get reunification services?',
    'What is the timeline for a dependency case?',
    'Can I appeal a dependency court decision?',
  ],
  'DUIs': [
    'What are the penalties for a first-time DUI in Arizona?',
    'Can I refuse a breathalyzer test?',
    'How long will a DUI stay on my record?',
    'What is an ignition interlock device?',
    'Can I get my license back after a DUI?',
  ],
  'Employment': [
    'What are my rights if I was wrongfully terminated?',
    'Can my employer reduce my salary without notice?',
    'How do I file a workplace discrimination complaint?',
    'What qualifies as harassment at work?',
    'Am I entitled to overtime pay in Arizona?',
  ],
  'Family Law': [
    'How does child custody work in Arizona?',
    'What is the divorce process in Arizona?',
    'Can I modify a child support order?',
    'What are grounds for an annulment?',
    'How is property divided in an Arizona divorce?',
  ],
  'Guardianship of a Minor': [
    'How do I become a guardian of a minor child?',
    'What is the difference between custody and guardianship?',
    'Can a grandparent get guardianship of a grandchild?',
    'How long does guardianship of a minor last?',
    'What documents do I need for guardianship?',
  ],
  'Healthcare, Medicare & Medicaid': [
    'How do I qualify for Medicaid in Arizona?',
    'What healthcare services are covered by Medicare?',
    'Can I appeal a denial of medical coverage?',
    'What are my rights regarding medical billing disputes?',
    'How do I apply for AHCCCS coverage?',
  ],
  'Housing': [
    'What are my rights as a tenant in Arizona?',
    'Can a landlord evict me without cause?',
    'What should be in a lease agreement?',
    'How do I handle security deposit disputes?',
    'What repairs is a landlord required to make?',
  ],
  'Immigration': [
    'How do I apply for a green card?',
    'What is DACA and am I eligible?',
    'Can I work in the U.S. while my visa is pending?',
    'How do I sponsor a family member for immigration?',
    'What should I do if I receive a deportation notice?',
  ],
  'Personal Injury': [
    'What should I do after a car accident?',
    'How long do I have to file a personal injury claim?',
    'What damages can I recover in a slip and fall?',
    'Do I need a lawyer for a personal injury case?',
    'How is fault determined in Arizona accidents?',
  ],
  'Rights Restoration': [
    'How can I restore my voting rights after a felony?',
    'What is the process for restoring gun rights?',
    'Can I get my civil rights restored in Arizona?',
    'How long does rights restoration take?',
    'Do I need a lawyer for rights restoration?',
  ],
  'Section 8 Housing': [
    'How do I apply for Section 8 housing assistance?',
    'What are the eligibility requirements for Section 8?',
    'Can my Section 8 voucher be terminated?',
    'How long is the Section 8 waiting list?',
    'Can I use Section 8 in any rental property?',
  ],
  'Social Security': [
    'How do I apply for Social Security disability benefits?',
    'What is the difference between SSI and SSDI?',
    'Can I work while receiving Social Security disability?',
    'How long does it take to get approved for disability?',
    'What should I do if my Social Security claim is denied?',
  ],
  'Traffic Tickets': [
    'How do I fight a traffic ticket in Arizona?',
    'Will a traffic ticket affect my insurance rates?',
    'Can I take defensive driving school to dismiss a ticket?',
    'What happens if I ignore a traffic ticket?',
    'How do I request a hearing for a traffic violation?',
  ],
  'Trusts': [
    'What is a living trust and do I need one?',
    'How do I create a revocable trust in Arizona?',
    'What is the difference between a trust and a will?',
    'Can I be my own trustee?',
    'How do I transfer property into a trust?',
  ],
  'Wills & Probate': [
    'Do I need a will or a trust?',
    'How do I name a guardian for my children?',
    'What is the probate process in Arizona?',
    'Can I avoid probate in Arizona?',
    'How do I contest a will?',
  ],
};

const quickActions: QuickAction[] = [
  {
    id: 'contract',
    title: 'Review Contract',
    description: 'Get contract analysis',
    icon: <FileText className="w-5 h-5" />,
    prompt: 'I need help reviewing a contract. What should I look for?',
  },
  {
    id: 'lawsuit',
    title: 'Legal Dispute',
    description: 'Understand your options',
    icon: <Shield className="w-5 h-5" />,
    prompt: 'I\'m considering legal action. What are my options?',
  },
  {
    id: 'business',
    title: 'Start Business',
    description: 'Formation guidance',
    icon: <TrendingUp className="w-5 h-5" />,
    prompt: 'I want to start a business in Arizona. What do I need to know?',
  },
  {
    id: 'employment',
    title: 'Employment Issue',
    description: 'Know your rights',
    icon: <Users className="w-5 h-5" />,
    prompt: 'I\'m having issues at work. What are my employment rights?',
  },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showLawyerMatch, setShowLawyerMatch] = useState(false);
  const [suggestedPracticeArea, setSuggestedPracticeArea] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    loadMessages();
    initializeSpeechRecognition();
  }, []);

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
      recognitionRef.current.lang = language === 'es' ? 'es-ES' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const saveAttachmentToDatabase = async (messageId: string, file: File) => {
    if (!user) return;

    try {
      await supabase.from('chat_attachments').insert({
        chat_message_id: messageId,
        user_id: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: `chat-uploads/${user.id}/${messageId}/${file.name}`,
      });
    } catch (err) {
      console.error('Error saving attachment:', err);
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

  const detectPracticeArea = (message: string): string | undefined => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('dui') || lowerMessage.includes('drunk driving') || lowerMessage.includes('breathalyzer') || lowerMessage.includes('ignition interlock')) return 'DUIs';
    if (lowerMessage.includes('traffic ticket') || lowerMessage.includes('speeding') || lowerMessage.includes('traffic violation') || lowerMessage.includes('defensive driving')) return 'Traffic Tickets';
    if (lowerMessage.includes('adult guardian') || lowerMessage.includes('incapacitated adult') || lowerMessage.includes('conservatorship')) return 'Adult Guardianship';
    if (lowerMessage.includes('minor guardian') || lowerMessage.includes('grandparent') || lowerMessage.includes('guardian of child')) return 'Guardianship of a Minor';
    if (lowerMessage.includes('consumer protection') || lowerMessage.includes('fraud') || lowerMessage.includes('debt collector') || lowerMessage.includes('scam')) return 'Consumer Protection';
    if (lowerMessage.includes('criminal') || lowerMessage.includes('charged') || lowerMessage.includes('arrest') || lowerMessage.includes('expunge') || lowerMessage.includes('felony') || lowerMessage.includes('misdemeanor')) return 'Criminal Matter';
    if (lowerMessage.includes('dependency') || lowerMessage.includes('juvenile court') || lowerMessage.includes('cps') || lowerMessage.includes('child protective')) return 'Dependency & Juvenile Court';
    if (lowerMessage.includes('employment') || lowerMessage.includes('workplace') || lowerMessage.includes('fired') || lowerMessage.includes('wrongful termination') || lowerMessage.includes('discrimination') || lowerMessage.includes('harassment')) return 'Employment';
    if (lowerMessage.includes('divorce') || lowerMessage.includes('custody') || lowerMessage.includes('child support') || lowerMessage.includes('family law') || lowerMessage.includes('annulment')) return 'Family Law';
    if (lowerMessage.includes('medicare') || lowerMessage.includes('medicaid') || lowerMessage.includes('ahcccs') || lowerMessage.includes('health insurance') || lowerMessage.includes('medical billing')) return 'Healthcare, Medicare & Medicaid';
    if (lowerMessage.includes('landlord') || lowerMessage.includes('tenant') || lowerMessage.includes('eviction') || lowerMessage.includes('lease') || lowerMessage.includes('rent') || lowerMessage.includes('security deposit')) return 'Housing';
    if (lowerMessage.includes('section 8') || lowerMessage.includes('housing assistance') || lowerMessage.includes('voucher')) return 'Section 8 Housing';
    if (lowerMessage.includes('immigration') || lowerMessage.includes('green card') || lowerMessage.includes('visa') || lowerMessage.includes('daca') || lowerMessage.includes('deportation') || lowerMessage.includes('citizenship')) return 'Immigration';
    if (lowerMessage.includes('injury') || lowerMessage.includes('accident') || lowerMessage.includes('malpractice') || lowerMessage.includes('slip and fall')) return 'Personal Injury';
    if (lowerMessage.includes('rights restoration') || lowerMessage.includes('voting rights') || lowerMessage.includes('gun rights') || lowerMessage.includes('civil rights restoration')) return 'Rights Restoration';
    if (lowerMessage.includes('social security') || lowerMessage.includes('ssdi') || lowerMessage.includes('ssi') || lowerMessage.includes('disability benefits')) return 'Social Security';
    if (lowerMessage.includes('trust') || lowerMessage.includes('living trust') || lowerMessage.includes('revocable trust') || lowerMessage.includes('trustee')) return 'Trusts';
    if (lowerMessage.includes('will') || lowerMessage.includes('probate') || lowerMessage.includes('estate') || lowerMessage.includes('inheritance') || lowerMessage.includes('executor')) return 'Wills & Probate';

    return undefined;
  };

  const callOpenAIEdgeFunction = async (userMessage: string): Promise<string> => {
    try {
      const sessionId = user?.id || `guest-${Date.now()}`;
      const practiceArea = detectPracticeArea(userMessage);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-chat`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          sessionId,
          userId: user?.id,
          jurisdiction: 'Arizona',
          category: practiceArea,
          maxTokens: 8192,
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      let aiResponse = data.response || '';

      const followUpMatch = aiResponse.match(/---FOLLOW_UP_QUESTIONS---[\s\S]*?---END_FOLLOW_UP_QUESTIONS---/);
      if (followUpMatch) {
        aiResponse = aiResponse.replace(followUpMatch[0], '');
      }

      return aiResponse.trim();
    } catch (err) {
      console.error('OpenAI edge function error:', err);
      return generateFallbackResponse(userMessage);
    }
  };

  const generateFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('contract') || lowerMessage.includes('agreement')) {
      return "**PART 1: ANALYSIS SUMMARY**\n\nYour question relates to contract law in Arizona. Contract law governs the formation, enforcement, and remedies for breaches of agreements between parties.\n\n**PART 2: WHAT YOU CAN DO (Checklist)**\n\n1. Review all contract terms carefully before signing\n2. Ensure all essential elements are present (offer, acceptance, consideration, capacity, legality)\n3. Check for compliance with Arizona Statute of Frauds ([A.R.S. § 44-101](https://www.azleg.gov/ars/44/00101.htm))\n4. Document all negotiations and amendments in writing\n5. Consult with a contract attorney for complex agreements\n\n**PART 3: OVERVIEW**\n\nArizona follows common law contract principles. Key considerations include:\n- Written contracts have a 6-year statute of limitations\n- Oral contracts have a 3-year limitation period\n- Certain contracts must be in writing under the Statute of Frauds\n\n**LEGAL DISCLAIMERS**\n\nThis information is provided for educational purposes and does not constitute legal advice. For advice specific to your situation, consult with a licensed attorney in Arizona.";
    } else if (lowerMessage.includes('lawsuit') || lowerMessage.includes('sue') || lowerMessage.includes('litigation')) {
      return "**PART 1: ANALYSIS SUMMARY**\n\nYour question relates to civil litigation in Arizona. Before filing a lawsuit, careful evaluation of your case is essential.\n\n**PART 2: WHAT YOU CAN DO (Checklist)**\n\n1. Document all evidence supporting your claim\n2. Identify the correct statute of limitations for your claim type\n3. Determine the appropriate court (Justice Court, Superior Court, or Small Claims)\n4. Consider sending a demand letter before filing\n5. Evaluate whether mediation or arbitration may be appropriate\n\n**PART 3: OVERVIEW**\n\n**Arizona Court System:**\n- Justice Courts: Claims under $10,000\n- Superior Court: Claims over $10,000\n- Small Claims Division: Claims under $3,500 (simplified process)\n\n**Key Steps:**\n1. File complaint with appropriate court\n2. Pay filing fees\n3. Serve defendant according to Arizona Rules of Civil Procedure\n4. Participate in case management conferences\n5. Engage in discovery\n6. Attempt settlement or proceed to trial\n\n**LEGAL DISCLAIMERS**\n\nThis information is provided for educational purposes and does not constitute legal advice. For advice specific to your situation, consult with a licensed attorney in Arizona.";
    } else {
      return "**Welcome to ezLegal.ai™ - Your AI Legal Research Assistant**\n\nI'm powered by advanced AI trained on Arizona law and can provide comprehensive legal research assistance.\n\n**PART 2: WHAT YOU CAN DO**\n\n1. Ask specific legal questions about Arizona law\n2. Request statute summaries (e.g., 'Summarize Title 34 of Arizona Revised Statutes')\n3. Get guidance on legal procedures and deadlines\n4. Learn about your rights in various legal situations\n5. Request document drafting assistance\n\n**I Can Assist With:**\n- Contract law and agreements\n- Business formation and operations\n- Employment law matters\n- Estate planning and probate\n- Family law issues\n- Landlord-tenant disputes\n- Personal injury claims\n- Criminal matter questions\n- Consumer protection\n- Real estate transactions\n- And much more\n\n**How It Works:**\n1. Type your legal question in detail below\n2. I'll provide comprehensive, structured guidance with statute citations\n3. All Arizona statutes are hyperlinked to official sources\n4. If needed, connect with verified Arizona attorneys\n\n**LEGAL DISCLAIMERS**\n\nThis information is provided for educational purposes and does not constitute legal advice. For advice specific to your situation, consult with a licensed attorney in Arizona.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError('');
    const userMessage = input.trim();
    setInput('');

    const practiceArea = detectPracticeArea(userMessage);

    if (practiceArea) {
      setSuggestedPracticeArea(practiceArea);
    }

    try {
      const aiResponse = await callOpenAIEdgeFunction(userMessage);

      if (user) {
        const { data, error: dbError } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: userMessage,
            response: aiResponse,
          })
          .select()
          .single();

        if (dbError) {
          setError('Failed to save message: ' + dbError.message);
          console.error('Database error:', dbError);
          const tempMessage: Message = {
            id: Date.now().toString(),
            message: userMessage,
            response: aiResponse,
            created_at: new Date().toISOString(),
            suggested_practice_area: practiceArea,
          };
          setMessages([...messages, tempMessage]);
        } else if (data) {
          setMessages([...messages, data]);

          if (uploadedFiles.length > 0) {
            for (const file of uploadedFiles) {
              await saveAttachmentToDatabase(data.id, file);
            }
            setUploadedFiles([]);
          }
        }
      } else {
        const tempMessage: Message = {
          id: Date.now().toString(),
          message: userMessage,
          response: aiResponse,
          created_at: new Date().toISOString(),
          suggested_practice_area: practiceArea,
        };
        setMessages([...messages, tempMessage]);
      }
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError('Failed to get AI response. Please try again.');
    }

    setLoading(false);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
      }
    }, 100);
  };

  const getQuickActions = (): QuickAction[] => [
    {
      id: 'contract',
      title: t('ai.reviewContract'),
      description: t('ai.reviewContractDesc'),
      icon: <FileText className="w-5 h-5" />,
      prompt: 'I need help reviewing a contract. What should I look for?',
    },
    {
      id: 'lawsuit',
      title: t('ai.legalDispute'),
      description: t('ai.legalDisputeDesc'),
      icon: <Shield className="w-5 h-5" />,
      prompt: language === 'es' ? 'Estoy considerando una accion legal. Cuales son mis opciones?' : "I'm considering legal action. What are my options?",
    },
    {
      id: 'business',
      title: t('ai.startBusiness'),
      description: t('ai.startBusinessDesc'),
      icon: <TrendingUp className="w-5 h-5" />,
      prompt: language === 'es' ? 'Quiero iniciar un negocio en Arizona. Que necesito saber?' : 'I want to start a business in Arizona. What do I need to know?',
    },
    {
      id: 'employment',
      title: t('ai.employmentIssue'),
      description: t('ai.employmentIssueDesc'),
      icon: <Users className="w-5 h-5" />,
      prompt: language === 'es' ? 'Tengo problemas en el trabajo. Cuales son mis derechos laborales?' : "I'm having issues at work. What are my employment rights?",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-xl" aria-hidden="true">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-navy-900">
                ezLegal.ai<sup className="text-lg">TM</sup>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-medium text-navy-500 uppercase tracking-wide">{t('ai.poweredBy')}</span>
                <span className="text-sm font-bold text-navy-700">Legalbreeze®</span>
              </div>
              <p className="text-base text-navy-600 mt-1">{t('ai.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 border-2 border-teal-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-navy-900">5 seconds</div>
              </div>
              <p className="text-sm text-navy-700">{t('ai.responseTime')}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-navy-900">~90%</div>
              </div>
              <p className="text-sm text-navy-700">Estimated time saved on initial intake organization</p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 border-2 border-teal-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-navy-900">2-4 min</div>
              </div>
              <p className="text-sm text-navy-700">{t('ai.lawyerResponse')}</p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-navy-200 overflow-hidden">
              <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-white" />
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        ezLegal.ai<sup className="text-xs">TM</sup>
                      </h2>
                      <span className="text-[9px] text-navy-400 uppercase tracking-wide">Powered by Legalbreeze®</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                      <button
                        onClick={exportConversation}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                        title="Export conversation"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('ai.export')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="h-[500px] overflow-y-auto px-6 py-6 bg-gradient-to-b from-navy-50 to-white"
                role="log"
                aria-live="polite"
                aria-label="Chat conversation"
              >
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg" aria-hidden="true">
                      <Sparkles className="w-10 h-10 text-teal-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900 mb-3">
                      {t('ai.askAnything')}
                    </h3>
                    <p className="text-navy-600 mb-6 max-w-md mx-auto">
                      {t('ai.getGuidance')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {getQuickActions().map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.prompt)}
                          className="group flex items-center gap-4 p-4 bg-white border-2 border-navy-200 rounded-xl hover:border-teal-600 hover:shadow-lg transition-all text-left"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                            {action.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-navy-900 group-hover:text-teal-600 transition-colors">
                              {action.title}
                            </h4>
                            <p className="text-sm text-navy-600">{action.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg) => (
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
                          <div className="bg-white border-2 border-navy-200 rounded-2xl rounded-tl-md px-5 py-4 max-w-2xl shadow-md">
                            <p className="text-[15px] text-navy-700 leading-relaxed whitespace-pre-line">
                              {msg.response}
                            </p>
                            {msg.suggested_practice_area && (
                              <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-teal-100 border-2 border-teal-200 rounded-xl">
                                <p className="text-sm text-navy-700 mb-2 font-medium">
                                  💡 {t('ai.talkToAttorney')} {msg.suggested_practice_area}.
                                </p>
                                <button
                                  onClick={() => {
                                    setSuggestedPracticeArea(msg.suggested_practice_area || '');
                                    setShowLawyerMatch(true);
                                    document.getElementById('lawyer-section')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white rounded-lg font-semibold transition-all shadow-md text-sm"
                                >
                                  <Users className="w-4 h-4" />
                                  {t('ai.viewAttorneys')} {msg.suggested_practice_area}
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="bg-white border-t-2 border-navy-200 px-6 py-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-navy-600 flex items-center gap-2">
                    <Upload className="w-3 h-3" aria-hidden="true" />
                    {t('ai.tipUpload')}
                  </p>
                  <p className="text-xs text-navy-500">
                    {user ? t('ai.signedIn') : t('ai.guestMode')}
                  </p>
                </div>

                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowPromptLibrary(!showPromptLibrary)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 border-2 border-teal-200 text-teal-600 rounded-lg transition-all font-semibold text-sm w-full justify-between"
                  >
                    <span>📚 {t('ai.browseTopics')}</span>
                    {showPromptLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showPromptLibrary && (
                    <div className="mt-3 bg-gradient-to-br from-navy-50 to-white border-2 border-navy-200 rounded-xl p-4 max-h-80 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(promptsLibrary).map(([category, prompts]) => (
                          <div key={category} className="bg-white rounded-lg border border-navy-200 p-3">
                            <h4 className="font-bold text-navy-900 text-sm mb-2 pb-2 border-b border-navy-200">
                              {category}
                            </h4>
                            <div className="space-y-1">
                              {prompts.map((prompt, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setInput(prompt);
                                    setShowPromptLibrary(false);
                                  }}
                                  className="w-full text-left text-xs text-navy-700 hover:text-teal-600 hover:bg-teal-50 px-2 py-1.5 rounded transition-colors"
                                >
                                  • {prompt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  {error && (
                    <div
                      className="mb-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg"
                      role="alert"
                      aria-live="assertive"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-teal-600" aria-hidden="true" />
                        <span className="text-sm font-semibold text-navy-700">
                          {t('ai.attachedFiles')} ({uploadedFiles.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2" role="list" aria-label="Uploaded files">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-teal-50 border-2 border-teal-200 rounded-lg px-3 py-2"
                            role="listitem"
                          >
                            <FileText className="w-4 h-4 text-teal-600" aria-hidden="true" />
                            <span className="text-sm text-navy-700">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-navy-400 hover:text-red-600 transition-colors"
                              aria-label={`Remove ${file.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
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
                      className="bg-navy-100 hover:bg-navy-200 text-navy-700 p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      aria-label="Upload documents (PDF, DOC, DOCX, TXT, max 10MB)"
                      title="Upload documents"
                    >
                      <Upload className="w-5 h-5" aria-hidden="true" />
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
                      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                      aria-pressed={isListening}
                    >
                      {isListening ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
                    </button>

                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('ai.askPlaceholder')}
                      disabled={loading}
                      className="flex-1 px-5 py-3 border-2 border-navy-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 placeholder-navy-400 text-[15px]"
                      aria-label="Legal question input"
                      autoComplete="off"
                    />

                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      aria-label={loading ? 'Sending message...' : 'Send message'}
                    >
                      <Send className="w-5 h-5" aria-hidden="true" />
                      <span className="sr-only">Send</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {messages.length > 0 && (
            <div id="lawyer-section" className="w-full">
              <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-t-2xl px-6 py-6 border-2 border-b-0 border-navy-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                      <Users className="w-7 h-7" />
                      {suggestedPracticeArea ? `${suggestedPracticeArea} ${t('ai.attorneys')}` : t('ai.connectAttorneys')}
                    </h2>
                    <p className="text-navy-300">
                      {suggestedPracticeArea
                        ? t('ai.basedOnQuestion')
                        : t('ai.allVerified')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-white">
                      <div className="text-2xl font-bold">{t('ai.fast')}</div>
                      <div className="text-xs text-navy-300">{t('ai.responseTimeLabel')}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-white">
                      <div className="text-2xl font-bold flex items-center gap-1">
                        {t('ai.verified2')}
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="text-xs text-navy-300">{t('ai.barLicensed')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-b-2xl shadow-xl border-2 border-navy-200 p-6">
                {!showLawyerMatch ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-teal-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900 mb-3">
                      {t('ai.readyForAdvice')}
                    </h3>
                    <p className="text-navy-600 mb-6 max-w-2xl mx-auto">
                      {t('ai.whileAI')}
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-bold text-navy-900">{t('ai.freeConsultations')}</p>
                        <p className="text-sm text-navy-600">{t('ai.freeConsultationsDesc')}</p>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 rounded-xl p-4">
                        <Shield className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                        <p className="font-bold text-navy-900">{t('ai.verified')}</p>
                        <p className="text-sm text-navy-600">{t('ai.verifiedDesc')}</p>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 rounded-xl p-4">
                        <Award className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                        <p className="font-bold text-navy-900">{t('ai.clientRated')}</p>
                        <p className="text-sm text-navy-600">{t('ai.clientRatedDesc')}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowLawyerMatch(true)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                      <Users className="w-6 h-6" />
                      {t('ai.browseAttorneys')}
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className="text-xs text-navy-500 mt-4">{t('ai.noObligation')}</p>
                  </div>
                ) : (
                  <RealLawyerDirectory
                    suggestedPracticeArea={suggestedPracticeArea}
                    onClose={() => setShowLawyerMatch(false)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
