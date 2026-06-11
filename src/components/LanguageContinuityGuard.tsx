import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { shouldShowSpanishContinuityWarning, getSpanishFallbackRoute } from '../lib/languageRoutes';

export default function LanguageContinuityGuard() {
  const { language } = useLanguage();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (!shouldShowSpanishContinuityWarning(location.pathname, language)) return null;

  const fallback = getSpanishFallbackRoute(location.pathname);

  return (
    <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Globe className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
          <p className="text-amber-800">
            Esta página todavía no está completamente disponible en español.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="px-3 py-1 text-xs font-medium text-amber-700 hover:text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
          >
            Continuar
          </button>
          <Link
            to={fallback}
            className="px-3 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            Ir a ayuda en español
          </Link>
        </div>
      </div>
    </div>
  );
}
