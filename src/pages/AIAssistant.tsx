import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function AIAssistant() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16 flex flex-col items-center justify-center">
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageSquare className="w-16 h-16 text-teal-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            {en ? 'AI Assistant' : 'Asistente IA'}
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            {en
              ? 'Get instant legal guidance from our AI-powered assistant.'
              : 'Obtén orientación legal instantánea de nuestro asistente impulsado por IA.'}
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            {en ? 'Start Chat' : 'Iniciar Chat'} <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
