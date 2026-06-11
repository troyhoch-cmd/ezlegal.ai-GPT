import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, MessageSquare, ArrowLeft } from 'lucide-react';
import { reportRouteNotFound } from '../lib/link-health';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function NotFound() {
  const location = useLocation();

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
          <h1 className="text-4xl font-bold text-navy-900 mb-4">Page Not Found</h1>
          <p className="text-navy-500 text-lg mb-8 leading-relaxed">
            The page <code className="bg-navy-100 px-2 py-1 rounded text-sm font-mono">{location.pathname}</code> doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
            <Link
              to="/ask"
              className="inline-flex items-center justify-center gap-2 bg-navy-100 hover:bg-navy-200 text-navy-800 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Ask a Question
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 text-navy-500 hover:text-navy-700 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
