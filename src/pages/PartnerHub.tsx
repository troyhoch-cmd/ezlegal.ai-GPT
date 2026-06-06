import { Link } from 'react-router-dom';
import { BookOpen, BarChart3, Code, Zap, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Resource {
  icon: typeof BookOpen;
  title: string;
  description: string;
  url: string;
}

const RESOURCES: Resource[] = [
  {
    icon: BookOpen,
    title: 'Integration Guide',
    description: 'Complete API documentation and implementation examples.',
    url: '/partner-hub/api-docs',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time metrics on user engagement and conversions.',
    url: '/partner-hub/analytics',
  },
  {
    icon: Code,
    title: 'Code Samples',
    description: 'Ready-to-use code examples for common integrations.',
    url: '/partner-hub/samples',
  },
  {
    icon: Zap,
    title: 'Quick Start',
    description: 'Get up and running in 30 minutes.',
    url: '/partner-hub/quickstart',
  },
];

export default function PartnerHub() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {en ? 'Partner Hub' : 'Centro de Asociados'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Resources, APIs, and analytics for our partner ecosystem.'
                : 'Recursos, APIs y análisis para nuestro ecosistema de asociados.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {RESOURCES.map((resource) => {
              const Icon = resource.icon;
              return (
                <Link
                  key={resource.title}
                  to={resource.url}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 text-teal-600" />
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-slate-600">{resource.description}</p>
                </Link>
              );
            })}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {en ? 'Need Help?' : 'Necesitas Ayuda?'}
            </h2>
            <p className="text-slate-700 mb-6">
              {en
                ? 'Our partner success team is here to support your integration.'
                : 'Nuestro equipo de éxito de asociados está aquí para apoyar tu integración.'}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              {en ? 'Contact Support' : 'Contactar Soporte'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
