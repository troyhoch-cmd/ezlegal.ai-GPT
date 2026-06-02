import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Send, Shield, Clock, MessageSquare, Scale, Sparkles, Check,
  Globe, Home as HomeIcon, Users, Briefcase, FileWarning, Handshake, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { StandardDisclaimer } from '../components/templates/LegalDisclosureModule';
import { FormTrustSignals } from '../components/templates/TrustModule';
import { getAffordabilityMessage } from '../lib/microcopy';

const TOPIC_CONFIG: Record<string, { icon: typeof Scale; color: string; en: { title: string; subtitle: string; placeholder: string; questions: string[] }; es: { title: string; subtitle: string; placeholder: string; questions: string[] } }> = {
  immigration: {
    icon: Globe,
    color: 'amber',
    en: {
      title: 'Immigration Legal Help',
      subtitle: 'Get clear answers about visas, deportation defense, work permits, and your rights.',
      placeholder: "Describe your immigration situation... (e.g., 'I received a notice to appear, what should I do?')",
      questions: [
        "I'm worried about my immigration status. What are my rights?",
        "What should I do if I receive a notice to appear?",
        "How do I apply for a work permit or visa renewal?",
        "Can ICE enter my home without a warrant?",
      ],
    },
    es: {
      title: 'Ayuda Legal de Inmigracion',
      subtitle: 'Obtén respuestas claras sobre visas, defensa contra deportacion, permisos de trabajo y tus derechos.',
      placeholder: "Describe tu situación migratoria...",
      questions: [
        "Estoy preocupado por mi estatus migratorio. Cuáles son mis derechos?",
        "Qué debo hacer si recibo una notificación para comparecer?",
        "Cómo solicito un permiso de trabajo o renovacion de visa?",
        "Puede ICE entrar a mi casa sin una orden judicial?",
      ],
    },
  },
  housing: {
    icon: HomeIcon,
    color: 'sky',
    en: {
      title: 'Housing & Eviction Help',
      subtitle: 'Understand tenant rights, eviction defense, security deposits, and landlord disputes.',
      placeholder: "Describe your housing situation... (e.g., 'I received an eviction notice, what are my options?')",
      questions: [
        "I received an eviction notice. What are my options?",
        "My landlord won't return my security deposit. How do I get it back?",
        "Can my landlord raise rent without notice?",
        "My apartment has mold/pest issues. What can I do?",
      ],
    },
    es: {
      title: 'Ayuda de Vivienda y Desalojo',
      subtitle: 'Entiende derechos de inquilino, defensa contra desalojo y depositos de seguridad.',
      placeholder: "Describe tu situación de vivienda...",
      questions: [
        "Recibí un aviso de desalojo. Cuáles son mis opciones?",
        "Mi casero no devuelve mi depósito. Como lo recupero?",
        "Puede mi casero subir la renta sin aviso?",
        "Mi apartamento tiene moho/plagas. Qué puedo hacer?",
      ],
    },
  },
  family: {
    icon: Users,
    color: 'rose',
    en: {
      title: 'Family Law Help',
      subtitle: 'Get answers about divorce, child custody, support, and domestic matters.',
      placeholder: "Describe your family law situation... (e.g., 'I'm going through a divorce, how does custody work?')",
      questions: [
        "I'm going through a divorce. How does child custody work?",
        "How is child support calculated in my state?",
        "I need a restraining order. What are the steps?",
        "Can I modify an existing custody agreement?",
      ],
    },
    es: {
      title: 'Ayuda de Derecho Familiar',
      subtitle: 'Obtén respuestas sobre divorcio, custodia, manutencion y asuntos domesticos.',
      placeholder: "Describe tu situación de derecho familiar...",
      questions: [
        "Me estoy divorciando. Como funciona la custodia?",
        "Como se calcula la manutencion en mi estado?",
        "Necesito una orden de restricción. Cuáles son los pasos?",
        "Puedo modificar un acuerdo de custodia existente?",
      ],
    },
  },
  employment: {
    icon: Briefcase,
    color: 'emerald',
    en: {
      title: 'Employment Law Help',
      subtitle: 'Understand wage disputes, wrongful termination, discrimination, and workplace rights.',
      placeholder: "Describe your employment situation... (e.g., 'My employer hasn't paid me for 3 weeks')",
      questions: [
        "My employer hasn't paid me for 3 weeks. What can I do?",
        "I think I was wrongfully terminated. Do I have a case?",
        "I'm being harassed at work. What are my options?",
        "Am I entitled to overtime pay?",
      ],
    },
    es: {
      title: 'Ayuda de Derecho Laboral',
      subtitle: 'Entiende disputas salariales, despido injustificado y derechos laborales.',
      placeholder: "Describe tu situación laboral...",
      questions: [
        "Mi empleador no me ha pagado en 3 semanas. Qué puedo hacer?",
        "Creo que fui despedido injustamente. Tengo un caso?",
        "Me estan acosando en el trabajo. Cuáles son mis opciones?",
        "Tengo derecho a pago por horas extras?",
      ],
    },
  },
  debt: {
    icon: FileWarning,
    color: 'teal',
    en: {
      title: 'Debt & Collections Help',
      subtitle: 'Learn about debt collection rights, wage garnishment, and bankruptcy basics.',
      placeholder: "Describe your debt situation... (e.g., 'A debt collector keeps calling me')",
      questions: [
        "A debt collector is harassing me. Is this legal?",
        "Can my wages be garnished without warning?",
        "What is the statute of limitations on my debt?",
        "Should I consider bankruptcy? What are my options?",
      ],
    },
    es: {
      title: 'Ayuda de Deudas y Cobros',
      subtitle: 'Conoce tus derechos sobre cobranza, embargo salarial y opciones de bancarrota.',
      placeholder: "Describe tu situación de deuda...",
      questions: [
        "Un cobrador me esta acosando. Es esto legal?",
        "Pueden embargar mi salario sin aviso?",
        "Cuál es el plazo de prescripción de mi deuda?",
        "Debería considerar bancarrota? Cuáles son mis opciones?",
      ],
    },
  },
  criminal: {
    icon: Shield,
    color: 'slate',
    en: {
      title: 'Criminal Law Help',
      subtitle: 'Understand your rights when facing charges, traffic violations, or police encounters.',
      placeholder: "Describe your situation... (e.g., 'I was charged with a misdemeanor')",
      questions: [
        "I was arrested. What are my rights?",
        "What's the difference between a misdemeanor and felony?",
        "Can I get a charge expunged from my record?",
        "I got a traffic ticket. Should I contest it?",
      ],
    },
    es: {
      title: 'Ayuda de Derecho Penal',
      subtitle: 'Entiende tus derechos ante cargos, infracciones de transito o encuentros con la policia.',
      placeholder: "Describe tu situación...",
      questions: [
        "Fui arrestado. Cuáles son mis derechos?",
        "Cuál es la diferencia entre un delito menor y un delito grave?",
        "Puedo borrar un cargo de mi record?",
        "Recibí una multa de transito. Debería impugnarla?",
      ],
    },
  },
};

export default function Ask() {
  const { topic } = useParams<{ topic?: string }>();
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const topicConfig = topic ? TOPIC_CONFIG[topic] : null;
  const lang = language === 'en' ? 'en' : 'es';

  useEffect(() => {
    window.scrollTo(0, 0);
    inputRef.current?.focus();
  }, [topic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsSubmitting(true);
    const topicPrefix = topicConfig ? `[${topic}] ` : '';
    try {
      sessionStorage.setItem('ez_chatbot_prefill', topicPrefix + question.trim());
    } catch {
      // storage disabled -- navigate without prefill
    }
    navigate('/chat');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const title = topicConfig
    ? topicConfig[lang].title
    : (language === 'en' ? "What's your legal question?" : "Cuál es tu pregunta legal?");

  const subtitle = topicConfig
    ? topicConfig[lang].subtitle
    : (language === 'en' ? "Ask anything. Get a clear answer in plain language. Free, no signup required." : "Pregunta lo que sea. Obtén una respuesta clara. Gratis, sin registro.");

  const placeholder = topicConfig
    ? topicConfig[lang].placeholder
    : (language === 'en' ? "Type your legal question here..." : "Escribe tu pregunta legal aquí...");

  const questions = topicConfig
    ? topicConfig[lang].questions
    : (language === 'en' ? [
      "I received an eviction notice. What are my options?",
      "My employer hasn't paid me for 3 weeks. What can I do?",
      "I'm worried about my immigration status. What are my rights?",
      "My landlord won't return my security deposit. How do I get it back?",
      "I'm going through a divorce. How does child custody work?",
      "A debt collector is harassing me. Is this legal?",
    ] : [
      "Recibí un aviso de desalojo. Cuáles son mis opciones?",
      "Mi empleador no me ha pagado en 3 semanas. Qué puedo hacer?",
      "Estoy preocupado por mi estatus migratorio. Cuáles son mis derechos?",
      "Mi casero no devuelve mi depósito. Cómo lo recupero?",
      "Me estoy divorciando. Cómo funciona la custodia de los hijos?",
      "Un cobrador me está acosando. Es esto legal?",
    ]);

  const TopicIcon = topicConfig?.icon || Scale;

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        {topic && (
          <nav aria-label={language === 'en' ? 'Legal topic categories' : 'Categorias de temas legales'}>
            <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label={language === 'en' ? 'Filter by topic' : 'Filtrar por tema'}>
              {Object.entries(TOPIC_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={key === topic}
                  tabIndex={key === topic ? 0 : -1}
                  onClick={() => navigate(`/ask/${key}`)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    key === topic
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-navy-200 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <cfg.icon className="w-3.5 h-3.5" />
                  {language === 'en' ? cfg.en.title.replace(' Help', '').replace(' Legal', '') : cfg.es.title.replace(' Ayuda', '').replace(' Legal', '')}
                </button>
              ))}
              <button
                role="tab"
                aria-selected={false}
                tabIndex={-1}
                onClick={() => navigate('/ask')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-navy-200 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
              >
                {language === 'en' ? 'All Topics' : 'Todos'}
              </button>
            </div>
          </nav>
        )}

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${topicConfig ? `bg-${topicConfig.color}-500/20` : 'bg-amber-500/20'} mb-6`}>
            <TopicIcon className={`w-8 h-8 ${topicConfig ? `text-${topicConfig.color}-400` : 'text-amber-400'}`} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h1>
          <p className="text-lg text-navy-100 max-w-xl mx-auto">{subtitle}</p>
          {language !== 'en' && (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-teal-200 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              {language === 'es' && 'Puedes hacer preguntas y recibir respuestas en español.'}
              {language === 'ar' && 'يمكنك طرح الأسئلة وتلقي الإجابات بالعربية.'}
              {language === 'he' && 'ניתן לשאול שאלות ולקבל תשובות בעברית.'}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-6 py-5 text-lg text-navy-900 placeholder-navy-400 resize-none focus:outline-none"
              rows={4}
              autoFocus
            />
            <div className="flex items-center justify-between px-6 py-4 bg-navy-50 border-t border-navy-100">
              <div className="flex items-center gap-4 text-sm text-navy-500">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-green-600" />
                  {language === 'en' ? 'Private & secure' : 'Privado y seguro'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  {language === 'en' ? 'Answer in ~30 seconds' : 'Respuesta en ~30 segundos'}
                </span>
              </div>
              <button
                type="submit"
                disabled={!question.trim() || isSubmitting}
                className="flex items-center gap-2 bg-teal-600 hover:bg-gold-400 disabled:bg-navy-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    {language === 'en' ? 'Getting answer...' : 'Obteniendo respuesta...'}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {language === 'en' ? 'Get My Answer' : 'Obtener Mi Respuesta'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mb-12">
          <p className="text-navy-200 text-sm text-center mb-4">
            {language === 'en' ? 'Or click a common question:' : 'O haz clic en una pregunta comun:'}
          </p>
          <div className="grid gap-3">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                className="text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 rounded-xl text-navy-100 hover:text-white transition-all group"
              >
                <span className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-amber-500/70 group-hover:text-amber-400 flex-shrink-0" />
                  <span className="text-sm">{q}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {topicConfig && (
          <div className="mb-8 text-center">
            <p className="text-navy-300 text-sm mb-3">{language === 'en' ? 'Looking for a detailed action plan?' : 'Buscas un plan de accion detallado?'}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/issue-packs?topic=${topic}`)}
                className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-navy-900 px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
              >
                {language === 'en' ? `Get ${topicConfig[lang].title.replace(' Help', '').replace(' Legal', '')} Pack` : `Obtener Paquete`}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/case-predictor')}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {language === 'en' ? 'Predict My Outcome' : 'Predecir Mi Resultado'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 mb-8">
          <p className="text-navy-200 text-sm text-center mb-3 font-medium">
            {language === 'en' ? 'Not sure where to start?' : '¿No sabes por dónde empezar?'}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <span className="text-white font-semibold text-sm">{language === 'en' ? 'Quick Ask' : 'Pregunta Rápida'}</span>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-1.5 py-0.5 rounded">{language === 'en' ? 'YOU ARE HERE' : 'ESTÁS AQUÍ'}</span>
              </div>
              <p className="text-navy-200 text-xs leading-relaxed">
                {language === 'en'
                  ? 'Type one question, get a focused answer. Best when you know what you want to ask.'
                  : 'Escribe una pregunta, obtén una respuesta enfocada. Mejor cuando sabes que quieres preguntar.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/chat')}
              className="bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-xl p-4 text-left transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-white font-semibold text-sm">{language === 'en' ? 'AI Chatbot' : 'Chatbot IA'}</span>
                <ArrowRight className="w-3 h-3 text-navy-400 group-hover:text-amber-400 transition-colors ml-auto" />
              </div>
              <p className="text-navy-200 text-xs leading-relaxed">
                {language === 'en'
                  ? 'Have a back-and-forth conversation. Best when you need to explore your situation step by step.'
                  : 'Ten una conversacion interactiva. Mejor cuando necesitas explorar tu situación paso a paso.'}
              </p>
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4 text-center">
            {language === 'en' ? 'What you get - free, always:' : 'Lo que obtienes - gratis, siempre:'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: language === 'en' ? 'Plain-language answer' : 'Respuesta en lenguaje simple', desc: language === 'en' ? 'No confusing legal jargon' : 'Sin jerga legal confusa' },
              { title: language === 'en' ? 'Unlimited follow-ups' : 'Seguimientos ilimitados', desc: language === 'en' ? 'Ask as many questions as you need' : 'Pregunta todo lo que necesites' },
              { title: language === 'en' ? 'Your rights explained' : 'Tus derechos explicados', desc: language === 'en' ? 'Understand what the law says' : 'Entiende lo que dice la ley' },
              { title: language === 'en' ? 'Next steps to take' : 'Próximos pasos a seguir', desc: language === 'en' ? 'Know exactly what to do' : 'Sabe exactamente que hacer' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-navy-200 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-lg mx-auto">
          <p className="text-center text-white/80 text-sm">
            {language === 'en'
              ? "ezLegal.ai provides legal information and workflow support — not legal advice. We are not a law firm and no attorney-client relationship is created. If you need an attorney, we'll help you find one."
              : "ezLegal.ai proporciona información legal y apoyo de flujo de trabajo, no asesoría legal. No somos un bufete de abogados y no se crea relación abogado-cliente."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
