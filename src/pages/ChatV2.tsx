import { useState } from 'react';
import { Send, AlertCircle, Globe, Lock, ArrowLeft, AlertTriangle } from 'lucide-react';
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
