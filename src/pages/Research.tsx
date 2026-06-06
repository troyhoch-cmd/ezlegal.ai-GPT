import { useState } from 'react';
import { Search, Home, Briefcase, Plane, Heart, TrendingUp, DollarSign } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Topic {
  id: string;
  icon: typeof Home;
  title: string;
  description: string;
}

const TOPICS: Topic[] = [
  {
    id: 'housing',
    icon: Home,
    title: 'Housing Rights',
    description: 'Eviction, tenant rights, landlord disputes',
  },
  {
    id: 'employment',
    icon: Briefcase,
    title: 'Employment Law',
    description: 'Wages, discrimination, wrongful termination',
  },
  {
    id: 'immigration',
    icon: Plane,
    title: 'Immigration',
    description: 'Visa, green card, citizenship processes',
  },
  {
    id: 'family',
    icon: Heart,
    title: 'Family Law',
    description: 'Divorce, custody, child support',
  },
  {
    id: 'business',
    icon: TrendingUp,
    title: 'Business Law',
    description: 'Contracts, compliance, entity formation',
  },
  {
    id: 'consumer',
    icon: DollarSign,
    title: 'Consumer Rights',
    description: 'Fraud, debt, warranties',
  },
];

export default function Research() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredTopics = TOPICS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              {en ? 'Legal Research' : 'Investigación Legal'}
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              {en
                ? 'Explore legal topics and find authoritative resources.'
                : 'Explora temas legales y encuentra recursos autorizados.'}
            </p>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={en ? 'Search legal topics...' : 'Buscar temas legales...'}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              const isSelected = selectedTopic === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(isSelected ? null : topic.id)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-teal-200' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-teal-600' : 'text-slate-600'}`} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{topic.title}</h3>
                  <p className="text-sm text-slate-600">{topic.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
