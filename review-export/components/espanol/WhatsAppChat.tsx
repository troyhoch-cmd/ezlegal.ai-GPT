import { useState } from 'react';
import {
  X,
  MessageCircle,
  Send,
  Phone,
  Shield,
  Clock,
  CheckCircle,
  Bot
} from 'lucide-react';

interface WhatsAppChatProps {
  onClose: () => void;
}

const QUICK_OPTIONS = [
  { id: 'immigration', label: 'Preguntas de inmigración', icon: '🌎' },
  { id: 'work', label: 'Problemas en el trabajo', icon: '💼' },
  { id: 'housing', label: 'Problemas con mi renta/casa', icon: '🏠' },
  { id: 'family', label: 'Asuntos familiares', icon: '👨‍👩‍👧' },
  { id: 'accident', label: 'Tuve un accidente', icon: '🚗' },
  { id: 'other', label: 'Otra situación', icon: '❓' }
];

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function WhatsAppChat({ onClose }: WhatsAppChatProps) {
  const [step, setStep] = useState<'intro' | 'topic' | 'chat' | 'connect'>('intro');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [questionsAsked, setQuestionsAsked] = useState(0);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    const topic = QUICK_OPTIONS.find(o => o.id === topicId);

    const initialMessages: Message[] = [
      {
        id: 1,
        text: `¡Hola! Gracias por contactarnos sobre "${topic?.label}". Soy Ana, asistente legal de ezLegal.`,
        sender: 'bot',
        timestamp: new Date()
      },
      {
        id: 2,
        text: 'Cuéntame un poco más sobre tu situación. ¿Qué está pasando?',
        sender: 'bot',
        timestamp: new Date()
      }
    ];

    setMessages(initialMessages);
    setStep('chat');
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setQuestionsAsked(prev => prev + 1);

    setTimeout(() => {
      let botResponse: string;

      if (questionsAsked >= 2) {
        botResponse = 'Gracias por compartir tu situación. Para darte la mejor ayuda posible, me gustaría conectarte con uno de nuestros abogados que habla español. ¿Quieres que te contactemos por WhatsApp?';
        setTimeout(() => setStep('connect'), 2000);
      } else if (selectedTopic === 'immigration') {
        botResponse = getImmigrationResponse(questionsAsked);
      } else if (selectedTopic === 'work') {
        botResponse = getWorkResponse(questionsAsked);
      } else {
        botResponse = getGenericResponse(questionsAsked);
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getImmigrationResponse = (count: number): string => {
    const responses = [
      'Entiendo. Tu situación migratoria es importante y hay que manejarla con cuidado. ¿Tienes algún documento de inmigración actualmente, como visa, permiso de trabajo, o DACA?',
      'Gracias por esa información. Hay varias opciones que podríamos explorar dependiendo de tu situación específica. ¿Hace cuánto tiempo que estás en Estados Unidos?'
    ];
    return responses[count] || responses[0];
  };

  const getWorkResponse = (count: number): string => {
    const responses = [
      'Lamento escuchar eso. Los problemas en el trabajo pueden ser muy estresantes. ¿Me puedes contar más? Por ejemplo, ¿te deben dinero, te discriminaron, o te despidieron injustamente?',
      'Eso es muy importante. En la mayoría de los estados, tienes derechos como trabajador sin importar tu estatus migratorio. ¿Tienes alguna evidencia como recibos de pago, mensajes de texto, o correos electrónicos?'
    ];
    return responses[count] || responses[0];
  };

  const getGenericResponse = (count: number): string => {
    const responses = [
      'Gracias por compartir eso conmigo. Para entender mejor tu situación, ¿me puedes dar un poco más de detalle sobre qué pasó y cuándo?',
      'Entiendo la situación. Parece que podrías tener opciones legales. ¿Hay algo más que deba saber antes de conectarte con un abogado?'
    ];
    return responses[count] || responses[0];
  };

  const handleConnectWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola, necesito ayuda legal con: ${QUICK_OPTIONS.find(o => o.id === selectedTopic)?.label}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div lang="es" className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-green-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">ezLegal en Español</div>
              <div className="text-sm text-green-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                En línea ahora
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 'intro' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Bienvenido a ezLegal
                </h3>
                <p className="text-slate-600">
                  Responde unas preguntas rápidas y te conectamos con ayuda legal en español.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>100% confidencial - protegido por privilegio abogado-cliente</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span>Respuesta en menos de 24 horas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Primeras 3 preguntas son GRATIS</span>
                </div>
              </div>

              <button
                onClick={() => setStep('topic')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Comenzar Chat
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Al continuar, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
          )}

          {step === 'topic' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                ¿En qué te podemos ayudar hoy?
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Selecciona el tema que mejor describe tu situación:
              </p>

              <div className="space-y-2">
                {QUICK_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleTopicSelect(option.id)}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 rounded-xl transition-colors text-left"
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium text-slate-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'chat' && (
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-green-600 text-white rounded-br-md'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md'
                      }`}
                    >
                      {message.sender === 'bot' && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-xs font-medium text-green-600">Ana</span>
                        </div>
                      )}
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-green-100' : 'text-slate-400'}`}>
                        {message.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-500">
                    {3 - questionsAsked > 0
                      ? `${3 - questionsAsked} preguntas gratis restantes`
                      : 'Conectando con abogado...'
                    }
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'connect' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Conectar con Abogado
                </h3>
                <p className="text-slate-600">
                  Un abogado hispanohablante te contactará por WhatsApp en menos de 24 horas.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tu número de WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (___) ___-____"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">Tu información está segura</p>
                      <p className="text-slate-600">
                        Solo usamos tu número para contactarte. Nunca lo compartimos con terceros ni agencias del gobierno.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConnectWhatsApp}
                  disabled={!phoneNumber}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Abrir WhatsApp
                </button>

                <div className="text-center">
                  <span className="text-slate-500 text-sm">o visita nuestra página de contacto:</span>
                  <a
                    href="/contact"
                    className="block text-green-600 font-semibold text-lg mt-1 hover:underline"
                  >
                    Contáctanos
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
