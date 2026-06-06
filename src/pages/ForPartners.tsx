import { Link } from 'react-router-dom';
import { Zap, Code, Share2, TrendingUp, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Benefit {
  icon: typeof Zap;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: Zap,
    title: 'White-Label Solution',
    description: 'Customize ezLegal.ai to match your brand and platform.',
  },
  {
    icon: Code,
    title: 'API Integration',
    description: 'Seamlessly integrate our legal AI into your systems.',
  },
  {
    icon: Share2,
    title: 'Revenue Share',
    description: 'Earn recurring revenue from each client you bring.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Support',
    description: 'Marketing materials and dedicated partner success team.',
  },
];

export default function ForPartners() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              {en ? 'Partner Program' : 'Programa de Asociados'}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {en
                ? 'Integrate legal AI into your platform and grow your business.'
                : 'Integra IA legal en tu plataforma y crece tu negocio.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-white border border-slate-200 rounded-xl p-8"
                >
                  <Icon className="w-12 h-12 text-teal-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {en ? "Let's Work Together" : 'Trabajemos Juntos'}
            </h2>
            <p className="text-slate-700 mb-8">
              {en
                ? 'Interested in becoming a partner? Schedule a call with our partnerships team.'
                : 'Interesado en convertirse en socio? Programa una llamada con nuestro equipo de asociaciones.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/schedule-demo"
                className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                {en ? 'Schedule Demo' : 'Programar Demostración'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 border border-teal-600 text-teal-600 px-8 py-3 rounded-lg hover:bg-teal-50 transition-colors font-medium"
              >
                {en ? 'Contact Us' : 'Contáctanos'}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
