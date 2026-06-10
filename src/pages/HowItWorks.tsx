import { Link } from 'react-router-dom';
import { CheckCircle, MessageSquare, FileText, Users, ArrowRight, Scale } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Step {
  icon: typeof MessageSquare;
  title: { en: string; es: string };
  description: { en: string; es: string };
}

const STEPS: Step[] = [
  {
    icon: MessageSquare,
    title: { en: 'Tell Us Your Situation', es: 'Cuéntenos Su Situación' },
    description: {
      en: 'Describe your legal issue and circumstances through guided questions.',
      es: 'Describa su problema legal y circunstancias a través de preguntas guiadas.',
    },
  },
  {
    icon: FileText,
    title: { en: 'Get AI Guidance', es: 'Obtenga Orientación de IA' },
    description: {
      en: 'Receive personalized legal information and recommendations.',
      es: 'Reciba información legal personalizada y recomendaciones.',
    },
  },
  {
    icon: Users,
    title: { en: 'Generate Documents', es: 'Genere Documentos' },
    description: {
      en: 'Create customizable legal documents tailored to your case.',
      es: 'Cree documentos legales personalizables adaptados a su caso.',
    },
  },
  {
    icon: CheckCircle,
    title: { en: 'Connect with Attorney', es: 'Conéctese con un Abogado' },
    description: {
      en: 'Find and connect with a licensed attorney if needed.',
      es: 'Encuentre y conéctese con un abogado licenciado si es necesario.',
    },
  },
];

export default function HowItWorks() {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en' as const;
  const en = lang === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              {en ? 'How It Works' : 'Cómo Funciona'}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {en
                ? 'Four simple steps to get legal information and support.'
                : 'Cuatro pasos simples para obtener información y apoyo legal.'}
            </p>
          </div>

          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 mb-12 flex items-start gap-3 max-w-3xl mx-auto">
            <Scale className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              {en
                ? 'ezLegal.ai provides legal information, not legal advice. We are not a law firm and do not replace licensed attorneys.'
                : 'ezLegal.ai proporciona información legal, no asesoramiento legal. No somos un bufete de abogados y no reemplazamos a abogados licenciados.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-white border border-slate-200 rounded-xl p-8 h-full">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="absolute -left-4 -top-4 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {step.title[lang]}
                    </h3>
                    <p className="text-slate-600">{step.description[lang]}</p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {en ? 'Ready to Get Started?' : '¿Listo para Comenzar?'}
            </h2>
            <p className="text-slate-700 mb-8 max-w-2xl mx-auto">
              {en
                ? 'Start your legal information journey today.'
                : 'Comience su viaje de información legal hoy.'}
            </p>
            <Link
              to="/start"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              {en ? 'Begin Now' : 'Comenzar Ahora'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
