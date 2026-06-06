import { Link } from 'react-router-dom';
import { Package, Tag, Users, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface IssuePack {
  id: string;
  title: string;
  description: string;
  topics: string[];
  price: number;
  icon: typeof Package;
}

const PACKS: IssuePack[] = [
  {
    id: 'tenant-rights',
    title: 'Tenant Rights',
    description: 'Complete guide to evictions, security deposits, and landlord disputes.',
    topics: ['Eviction Defense', 'Security Deposits', 'Lease Agreements'],
    price: 29.99,
    icon: Package,
  },
  {
    id: 'employment-dispute',
    title: 'Employment Dispute',
    description: 'Navigate wage disputes, discrimination, and wrongful termination.',
    topics: ['Wage Claims', 'Discrimination', 'Termination Rights'],
    price: 34.99,
    icon: Users,
  },
  {
    id: 'small-claims',
    title: 'Small Claims Court',
    description: 'Step-by-step guide to filing and winning small claims cases.',
    topics: ['Filing Process', 'Evidence', 'Court Testimony'],
    price: 24.99,
    icon: TrendingUp,
  },
  {
    id: 'consumer-rights',
    title: 'Consumer Rights',
    description: 'Protect yourself from fraud, defective products, and bad debt.',
    topics: ['Fraud Protection', 'Warranties', 'Debt Defense'],
    price: 19.99,
    icon: Tag,
  },
];

export default function IssuePacks() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              {en ? 'Issue Packs' : 'Paquetes de Problemas'}
            </h1>
            <p className="text-lg text-slate-600">
              {en
                ? 'Curated bundles of legal resources for common issues.'
                : 'Colecciones curadas de recursos legales para problemas comunes.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {PACKS.map((pack) => {
              const Icon = pack.icon;
              return (
                <div
                  key={pack.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 text-teal-600" />
                    <span className="text-lg font-bold text-teal-600">
                      ${pack.price}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {pack.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{pack.description}</p>
                  <div className="mb-6 space-y-2">
                    {pack.topics.map((topic) => (
                      <div key={topic} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {topic}
                      </div>
                    ))}
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium">
                    {en ? 'Get Pack' : 'Obtener Paquete'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {en ? 'More Coming Soon' : 'Más Próximamente'}
            </h2>
            <p className="text-slate-700">
              {en
                ? 'We are continuously adding new issue packs to cover more legal topics.'
                : 'Continuamos añadiendo nuevos paquetes de problemas para cubrir más temas legales.'}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
