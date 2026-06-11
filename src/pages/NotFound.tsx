import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, MessageSquare, ArrowLeft } from 'lucide-react';
import { reportRouteNotFound } from '../lib/link-health';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotFound() {
  const location = useLocation();
  const { language } = useLanguage();
  const en = language === 'en';

  useEffect(() => {
    reportRouteNotFound(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main id="main-content" className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold text-navy-900 mb-4">
            {en ? 'Page Not Found' : 'Página No Encontrada'}
          </h1>
          <p className="text-navy-500 text-lg mb-8 leading-relaxed">
            {en
              ? <>The page <code className="bg-navy-100 px-2 py-1 rounded text-sm font-mono">{location.pathname}</code> doesn't exist or has been moved.</>
              : <>La página <code className="bg-navy-100 px-2 py-1 rounded text-sm font-mono">{location.pathname}</code> no existe o ha sido movida.</>}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <Home className="w-5 h-5" />
              {en ? 'Go Home' : 'Ir al Inicio'}
            </Link>
            <Link
              to="/ask"
              className="inline-flex items-center justify-center gap-2 bg-navy-100 hover:bg-navy-200 text-navy-800 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              {en ? 'Ask a Question' : 'Haz una Pregunta'}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 text-navy-500 hover:text-navy-700 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              {en ? 'Go Back' : 'Regresar'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
