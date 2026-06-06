import { Clock, BookOpen } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: number;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Know Your Tenant Rights',
    excerpt: 'Understanding your rights as a tenant, including eviction procedures and security deposits.',
    category: 'Housing',
    readingTime: 8,
  },
  {
    id: '2',
    title: 'Employment Discrimination Guide',
    excerpt: 'Learn about your protections against discrimination in the workplace.',
    category: 'Employment',
    readingTime: 10,
  },
  {
    id: '3',
    title: 'Small Claims Court Explained',
    excerpt: 'A complete guide to filing and winning a small claims case.',
    category: 'Civil',
    readingTime: 7,
  },
  {
    id: '4',
    title: 'Consumer Rights and Fraud Protection',
    excerpt: 'How to protect yourself from scams and assert your consumer rights.',
    category: 'Consumer',
    readingTime: 6,
  },
  {
    id: '5',
    title: 'Immigration Process Overview',
    excerpt: 'An introduction to common immigration benefits and applications.',
    category: 'Immigration',
    readingTime: 12,
  },
];

export default function EZReads() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
              {en ? 'EZ Reads' : 'EZ Lecturas'}
            </h1>
            <p className="text-lg text-slate-600">
              {en
                ? 'Learn about legal topics through our comprehensive guides and articles.'
                : 'Aprende sobre temas legales a través de nuestras guías y artículos integrales.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTICLES.map((article) => (
              <article
                key={article.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  {article.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4">{article.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {article.readingTime} {en ? 'min' : 'min'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{en ? 'Read Article' : 'Leer Artículo'}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
