import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Trash2, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Conversation {
  id: string;
  title: string;
  date: string;
  messages: number;
}

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: 'Tenant Rights - Eviction Notice',
    date: '2024-06-01',
    messages: 12,
  },
  {
    id: '2',
    title: 'Employment Contract Review',
    date: '2024-05-28',
    messages: 8,
  },
  {
    id: '3',
    title: 'Small Claims Court Process',
    date: '2024-05-20',
    messages: 5,
  },
];

export default function History() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [conversations, setConversations] = useState(SAMPLE_CONVERSATIONS);

  const handleDelete = (id: string) => {
    setConversations(conversations.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {en ? 'Chat History' : 'Historial de chat'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Review your past conversations and continue where you left off.'
                : 'Revisa tus conversaciones anteriores y continúa desde donde las dejaste.'}
            </p>
          </div>

          {conversations.length === 0 ? (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                {en ? 'No conversations yet' : 'Sin conversaciones aún'}
              </h2>
              <p className="text-slate-600 mb-6">
                {en
                  ? 'Start a new chat to get legal guidance.'
                  : 'Inicia una nueva conversación para obtener asesoramiento legal.'}
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                {en ? 'Start Chat' : 'Iniciar Chat'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-300 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{conv.title}</h3>
                    <p className="text-sm text-slate-500">
                      {new Date(conv.date).toLocaleDateString()} •{' '}
                      {conv.messages} {en ? 'messages' : 'mensajes'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/chat/${conv.id}`}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                    >
                      {en ? 'Resume' : 'Reanudar'}
                    </Link>
                    <button
                      onClick={() => handleDelete(conv.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
