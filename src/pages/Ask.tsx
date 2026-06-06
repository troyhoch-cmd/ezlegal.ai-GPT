import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Topic {
  id: string;
  name: string;
  questions: string[];
}

const TOPICS: Topic[] = [
  {
    id: 'housing',
    name: 'Housing Rights',
    questions: ['Eviction Notice', 'Tenant Rights', 'Security Deposit'],
  },
  {
    id: 'employment',
    name: 'Employment',
    questions: ['Wrongful Termination', 'Wage Issues', 'Discrimination'],
  },
  {
    id: 'immigration',
    name: 'Immigration',
    questions: ['Visa Applications', 'Green Card', 'Citizenship'],
  },
  {
    id: 'family',
    name: 'Family Law',
    questions: ['Divorce', 'Custody', 'Child Support'],
  },
  {
    id: 'business',
    name: 'Business Law',
    questions: ['Contract Review', 'LLC Formation', 'Compliance'],
  },
  {
    id: 'consumer',
    name: 'Consumer Rights',
    questions: ['Fraud', 'Debt', 'Product Liability'],
  },
];

export default function Ask() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');

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
                : 'Selecciona una categoría legal y haz tu pregunta.'}
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
                    {topic.name}
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
                      key={q}
                      onClick={() => setUserQuestion(q)}
                      className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-teal-300 transition-colors"
                    >
                      {q}
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

              <button className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium">
                {en ? 'Get Guidance' : 'Obtener Orientación'}
              </button>
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
