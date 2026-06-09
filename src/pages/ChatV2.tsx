import { useState } from 'react';
import { Send, AlertCircle, Globe, Lock, ArrowLeft, AlertTriangle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import JurisdictionSelector from '../components/shared/JurisdictionSelector';
import { normalizeForCrisis } from '../lib/text-utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CRISIS_KEYWORDS_EN = [
  'emergency', 'danger', 'urgent', 'violence', 'abuse',
  'suicide', 'harm', 'threat', 'kill', 'die', 'hurt',
  'domestic violence', 'sexual assault',
];

const CRISIS_KEYWORDS_ES = [
  'emergencia', 'peligro', 'urgente', 'violencia', 'abuso',
  'suicidio', 'dano', 'amenaza', 'matar', 'morir', 'lastimar',
  'violencia domestica', 'agresion sexual',
];

export default function ChatV2() {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const lang = language === 'es' ? 'es' : 'en' as const;
  const en = lang === 'en';
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

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: en
          ? 'This is a demo response. The AI legal information service is being configured. For now, please use ezLegal.ai resources or consult a licensed attorney.'
          : 'Esta es una respuesta de demostración. El servicio de informacion legal con IA se esta configurando. Por ahora, usa los recursos de ezLegal.ai o consulta un abogado licenciado.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 800);

    setInputValue('');
  };

  const detectCrisis = (text: string): boolean => {
    const normalized = normalizeForCrisis(text);
    return CRISIS_KEYWORDS_EN.some((kw) => normalized.includes(kw))
      || CRISIS_KEYWORDS_ES.some((kw) => normalized.includes(kw));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setShowUrgencyWarning(detectCrisis(e.target.value));
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
              {en ? 'Legal Information Assistant' : 'Asistente de Informacion Legal'}
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

        {/* Non-dismissible scope boundary */}
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-4">
          <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg flex items-start gap-3" role="region" aria-label={en ? 'Legal scope notice' : 'Aviso de alcance legal'}>
            <AlertTriangle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700">
              {en
                ? 'This tool provides legal information only — not legal advice. Do not share sensitive personal information unless you understand who can access it. Always consult a licensed attorney for your specific situation.'
                : 'Esta herramienta proporciona solo informacion legal — no asesoramiento legal. No compartas informacion personal sensible a menos que entiendas quien puede acceder a ella. Siempre consulta un abogado licenciado para tu situacion especifica.'}
            </p>
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
                    ? 'Ask a Legal Information Question'
                    : 'Haz una Pregunta de Informacion Legal'}
                </h2>
                <p className="text-slate-600 max-w-md">
                  {en
                    ? 'Get general legal information about your jurisdiction. This is not legal advice and does not create an attorney-client relationship.'
                    : 'Obtén informacion legal general sobre tu jurisdiccion. Esto no es asesoramiento legal y no crea una relacion abogado-cliente.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((message: Message) => (
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
              <div className="text-sm text-red-800 space-y-2">
                <p className="font-semibold">
                  {en ? 'If you are in immediate danger:' : 'Si estas en peligro inmediato:'}
                </p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {en ? 'Emergency: Call 911' : 'Emergencia: Llama al 911'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {en ? 'Suicide Prevention: 988' : 'Prevencion del Suicidio: 988'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {en ? 'Domestic Violence: 1-800-799-7233' : 'Violencia Domestica: 1-800-799-7233'}
                  </li>
                </ul>
                <p className="text-xs">
                  {en
                    ? 'This tool cannot help with emergencies. Please contact the resources above.'
                    : 'Esta herramienta no puede ayudar con emergencias. Contacta los recursos anteriores.'}
                </p>
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
                  ? 'Ask a legal information question...'
                  : 'Haz una pregunta de informacion legal...'
              }
              className="w-full resize-none outline-none text-slate-900 placeholder-slate-500"
              rows={3}
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-slate-500">
                {en
                  ? 'This is legal information, not legal advice.'
                  : 'Esta es informacion legal, no asesoramiento legal.'}
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
                ? 'ezLegal.ai provides legal information for educational purposes. This is not legal advice and does not create an attorney-client relationship or legal representation. Always consult a licensed attorney for specific legal matters.'
                : 'ezLegal.ai proporciona informacion legal con fines educativos. Esto no es asesoramiento legal y no crea una relacion abogado-cliente ni representacion legal. Siempre consulta un abogado licenciado para asuntos legales especificos.'}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
