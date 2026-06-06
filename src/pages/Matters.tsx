import { useState } from 'react';
import { FileText, CheckCircle, Clock, Trash2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Matter {
  id: string;
  title: string;
  status: 'open' | 'closed';
  createdDate: string;
  lastUpdated: string;
}

const MATTERS: Matter[] = [
  {
    id: '1',
    title: 'Tenant Eviction Defense',
    status: 'open',
    createdDate: '2024-04-15',
    lastUpdated: '2024-06-01',
  },
  {
    id: '2',
    title: 'Employment Contract Review',
    status: 'open',
    createdDate: '2024-05-20',
    lastUpdated: '2024-05-28',
  },
  {
    id: '3',
    title: 'Small Claims Settlement',
    status: 'closed',
    createdDate: '2024-02-10',
    lastUpdated: '2024-05-15',
  },
];

export default function Matters() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [matters, setMatters] = useState(MATTERS);

  const handleDelete = (id: string) => {
    setMatters(matters.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {en ? 'My Legal Matters' : 'Mis Asuntos Legales'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Track and manage your open and closed legal matters.'
                : 'Rastrea y administra tus asuntos legales abiertos y cerrados.'}
            </p>
          </div>

          <div className="space-y-4">
            {matters.map((matter) => (
              <div
                key={matter.id}
                className={`flex items-start justify-between p-6 rounded-xl border ${
                  matter.status === 'open'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      matter.status === 'open'
                        ? 'bg-blue-100'
                        : 'bg-slate-200'
                    }`}
                  >
                    {matter.status === 'open' ? (
                      <Clock className={`w-5 h-5 ${matter.status === 'open' ? 'text-blue-600' : 'text-slate-600'}`} />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{matter.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {en ? 'Created' : 'Creado'}: {new Date(matter.createdDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600">
                      {en ? 'Updated' : 'Actualizado'}: {new Date(matter.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      matter.status === 'open'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-slate-300 text-slate-800'
                    }`}
                  >
                    {matter.status === 'open'
                      ? en
                        ? 'Open'
                        : 'Abierto'
                      : en
                        ? 'Closed'
                        : 'Cerrado'}
                  </span>
                  <button
                    onClick={() => handleDelete(matter.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
