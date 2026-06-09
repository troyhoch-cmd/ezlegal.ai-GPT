import { useState } from 'react';
import { ChevronDown, HelpCircle, AlertTriangle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

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

export default function Ask() {
  const { language } = useLanguage();
  const en = language === 'en';
  const lang = language === 'es' ? 'es' : 'en' as const;
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const currentTopic = TOPICS.find((t) => t.id === selectedTopic);

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
              {TOPICS.map((topic) => (
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
                  {currentTopic.questions.map((q) => (
                    <button
                      key={q.en}
                      onClick={() => setUserQuestion(q[lang])}
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
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder={en ? 'Ask your legal question...' : 'Haz tu pregunta legal...'}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                  rows={6}
                />
              </div>

              <button
                onClick={() => setSubmitted(true)}
                disabled={!userQuestion.trim()}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {en ? 'Get Guidance' : 'Obtener Orientacion'}
              </button>

              {submitted && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    {en ? 'What happens next' : 'Que sucede ahora'}
                  </h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>{en ? '1. Your question is processed using licensed legal sources.' : '1. Tu pregunta se procesa usando fuentes legales licenciadas.'}</li>
                    <li>{en ? '2. You will receive legal information (not legal advice) tailored to your jurisdiction.' : '2. Recibiras informacion legal (no asesoramiento) adaptada a tu jurisdiccion.'}</li>
                    <li>{en ? '3. If your issue needs a lawyer, we will show free/low-cost options.' : '3. Si tu caso necesita un abogado, te mostraremos opciones gratuitas o de bajo costo.'}</li>
                  </ul>
                  <p className="mt-3 text-xs text-green-700">
                    {en
                      ? 'Remember: this is legal information only. For your specific situation, consult a licensed attorney.'
                      : 'Recuerda: esto es solo informacion legal. Para tu situacion especifica, consulta un abogado licenciado.'}
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
