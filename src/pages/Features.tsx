import { Link } from 'react-router-dom';
import { Brain, FileText, TrendingUp, Zap, Search, Lock, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Feature {
  id: string;
  icon: typeof Brain;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    id: 'ai-chat',
    icon: Brain,
    title: 'AI Chat Assistant',
    description: 'Get instant legal guidance powered by ethical AI.',
  },
  {
    id: 'doc-gen',
    icon: FileText,
    title: 'Document Generation',
    description: 'Create customizable legal documents in minutes.',
  },
  {
    id: 'predictor',
    icon: TrendingUp,
    title: 'Case Predictor',
    description: 'Understand likely outcomes based on case factors.',
  },
  {
    id: 'issue-packs',
    icon: Zap,
    title: 'Issue Packs',
    description: 'Pre-built bundles of resources for specific legal topics.',
  },
  {
    id: 'research',
    icon: Search,
    title: 'Legal Research',
    description: 'Access comprehensive legal research and resources.',
  },
  {
    id: 'safety-net',
    icon: Lock,
    title: 'Safety Net',
    description: 'Crisis detection and emergency resources.',
  },
];

export default function Features() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              {en ? 'Powerful Features' : 'Características Poderosas'}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {en
                ? 'Everything you need to navigate legal challenges with confidence.'
                : 'Todo lo que necesitas para navegar desafíos legales con confianza.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-white border border-slate-200 rounded-xl p-8 hover:border-teal-300 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-teal-50 border-y border-teal-200 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {en ? 'Built for Access to Justice' : 'Construido para Acceso a la Justicia'}
            </h2>
            <p className="text-lg text-slate-700 mb-8">
              {en
                ? 'Every feature is designed with equity and ethics at the core, ensuring accessibility for all.'
                : 'Cada característica está diseñada con equidad y ética en el centro, garantizando accesibilidad para todos.'}
            </p>
            <Link
              to="/start"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              {en ? 'Get Started' : 'Comenzar'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
