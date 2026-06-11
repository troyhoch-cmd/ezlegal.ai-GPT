import { useState } from 'react';
import { HelpCircle, AlertTriangle, AlertCircle, Phone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { normalizeForCrisis } from '../lib/text-utils';

interface Topic {
  id: string;
  name: { en: string; es: string };
  questions: { en: string; es: string }[];
}

const TOPICS: Topic[] = [
  {
    id: 'housing',
    name: { en: 'Housing Rights', es: 'Derechos de Vivienda' },
    questions: [
      { en: 'Eviction Notice', es: 'Aviso de Desalojo' },
      { en: 'Tenant Rights', es: 'Derechos del Inquilino' },
      { en: 'Security Deposit', es: 'Deposito de Seguridad' },
    ],
  },
  {
    id: 'employment',
    name: { en: 'Employment', es: 'Empleo' },
    questions: [
      { en: 'Wrongful Termination', es: 'Despido Injustificado' },
      { en: 'Wage Issues', es: 'Problemas de Salario' },
      { en: 'Discrimination', es: 'Discriminacion' },
    ],
  },
  {
    id: 'immigration',
    name: { en: 'Immigration', es: 'Inmigracion' },
    questions: [
      { en: 'Visa Applications', es: 'Solicitudes de Visa' },
      { en: 'Green Card', es: 'Residencia Permanente' },
      { en: 'Citizenship', es: 'Ciudadania' },
    ],
  },
  {
    id: 'family',
    name: { en: 'Family Law', es: 'Derecho Familiar' },
    questions: [
      { en: 'Divorce', es: 'Divorcio' },
      { en: 'Custody', es: 'Custodia' },
      { en: 'Child Support', es: 'Manutencion' },
    ],
  },
  {
    id: 'business',
    name: { en: 'Business Law', es: 'Derecho Empresarial' },
    questions: [
      { en: 'Contract Review', es: 'Revision de Contrato' },
      { en: 'LLC Formation', es: 'Formacion de LLC' },
      { en: 'Compliance', es: 'Cumplimiento' },
    ],
  },
  {
    id: 'consumer',
    name: { en: 'Consumer Rights', es: 'Derechos del Consumidor' },
    questions: [
      { en: 'Fraud', es: 'Fraude' },
      { en: 'Debt', es: 'Deudas' },
      { en: 'Product Liability', es: 'Responsabilidad del Producto' },
    ],
  },
];

const CRISIS_KEYWORDS = [
  'emergency', 'danger', 'violence', 'abuse', 'suicide', 'harm', 'threat',
  'kill', 'die', 'hurt', 'domestic violence',
  'emergencia', 'peligro', 'violencia', 'abuso', 'suicidio', 'dano', 'amenaza',
  'matar', 'morir', 'lastimar', 'violencia domestica',
];

export default function Ask() {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en' as const;
  const en = lang === 'en';
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showCrisisWarning, setShowCrisisWarning] = useState(false);

  const currentTopic = TOPICS.find((t: Topic) => t.id === selectedTopic);

  const handleQuestionChange = (value: string) => {
    setUserQuestion(value);
    const normalized = normalizeForCrisis(value);
    setShowCrisisWarning(
      CRISIS_KEYWORDS.some((kw) => normalized.includes(kw))
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {en ? 'Ask a Question' : 'Hacer una Pregunta'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Select a legal category and ask your question.'
                : 'Selecciona una categoria legal y haz tu pregunta.'}
            </p>
          </div>

          {/* Non-dismissible scope boundary */}
          <div className="mb-8 p-4 bg-slate-100 border border-slate-300 rounded-xl flex items-start gap-3" role="region" aria-label={en ? 'Legal scope notice' : 'Aviso de alcance legal'}>
            <AlertTriangle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">
              {en
                ? 'ezLegal.ai provides legal information only — not legal advice. Answers are for educational purposes and do not create an attorney-client relationship. Always consult a licensed attorney for your specific situation.'
                : 'ezLegal.ai proporciona solo informacion legal — no asesoramiento legal. Las respuestas son con fines educativos y no crean una relacion abogado-cliente. Siempre consulta un abogado licenciado para tu situacion especifica.'}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {en ? 'Select a Topic' : 'Selecciona un Tema'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TOPICS.map((topic: Topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    selectedTopic === topic.id
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium text-sm text-slate-900">
                    {topic.name[lang]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedTopic && currentTopic && (
            <>
              <div className="mb-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-teal-600" />
                  {en ? 'Common Questions' : 'Preguntas Comunes'}
                </h3>
                <div className="space-y-2">
                  {currentTopic.questions.map((q: { en: string; es: string }) => (
                    <button
                      key={q.en}
                      onClick={() => handleQuestionChange(q[lang])}
                      className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-teal-300 transition-colors"
                    >
                      {q[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-lg font-semibold text-slate-900 mb-3">
                  {en ? 'Your Question' : 'Tu Pregunta'}
                </label>
                <textarea
                  value={userQuestion}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  placeholder={en ? 'Ask your legal question...' : 'Haz tu pregunta legal...'}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                  rows={6}
                />
              </div>

              {showCrisisWarning && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
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
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSubmitted(true)}
                disabled={!userQuestion.trim()}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {en ? 'Submit Question' : 'Enviar Pregunta'}
              </button>

              {submitted && (
                <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-semibold text-teal-900">
                      {en ? 'Question Submitted' : 'Pregunta Enviada'}
                    </h3>
                  </div>
                  <p className="text-sm text-teal-800 mb-4">
                    {en
                      ? 'Your question has been submitted in this session. Here are your next steps:'
                      : 'Tu pregunta ha sido enviada en esta sesion. Estos son tus proximos pasos:'}
                  </p>
                  <ul className="space-y-2 text-sm text-teal-800">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">1.</span>
                      {en
                        ? 'Use our AI Assistant for immediate general legal information on this topic.'
                        : 'Usa nuestro Asistente de IA para informacion legal general inmediata sobre este tema.'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">2.</span>
                      {en
                        ? 'Browse EZ Reads articles for educational guides related to your question.'
                        : 'Consulta los articulos de EZ Reads para guias educativas relacionadas con tu pregunta.'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">3.</span>
                      {en
                        ? 'If you need personalized legal advice, consider consulting with a licensed attorney.'
                        : 'Si necesitas asesoramiento legal personalizado, considera consultar con un abogado licenciado.'}
                    </li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      to="/chat"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-100 px-3 py-1.5 rounded-lg hover:bg-teal-200 transition-colors"
                    >
                      {en ? 'Open AI Assistant' : 'Abrir Asistente IA'}
                    </Link>
                    <Link
                      to="/ezreads"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-100 px-3 py-1.5 rounded-lg hover:bg-teal-200 transition-colors"
                    >
                      {en ? 'Browse EZ Reads' : 'Ver EZ Reads'}
                    </Link>
                  </div>
                  <p className="mt-4 text-xs text-teal-700">
                    {en
                      ? 'Remember: ezLegal.ai provides legal information only — not legal advice.'
                      : 'Recuerda: ezLegal.ai proporciona solo informacion legal — no asesoramiento legal.'}
                  </p>
                </div>
              )}
            </>
          )}

          {!selectedTopic && (
            <div className="bg-slate-50 rounded-xl p-12 text-center border border-slate-200">
              <p className="text-slate-600">
                {en
                  ? 'Select a topic above to get started.'
                  : 'Selecciona un tema arriba para comenzar.'}
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
