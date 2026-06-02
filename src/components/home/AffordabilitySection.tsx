import { Link } from 'react-router-dom';
import { Search, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function AffordabilitySection() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <section className="py-6 bg-teal-50/50 border-y border-teal-100" aria-labelledby="afford-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 id="afford-heading" className="text-lg font-bold text-slate-900 mb-2">
          {en ? "Can't afford a lawyer?" : "¿No puedes pagar un abogado?"}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto mb-4">
          {en
            ? "We'll help you understand your options, check for free or low-cost resources, and prepare a clearer summary before you contact a legal-aid office or lawyer."
            : 'Te ayudaremos a entender tus opciones, buscar recursos gratuitos o de bajo costo, y preparar un resumen más claro antes de contactar una oficina de ayuda legal o abogado.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/start?path=legal-aid"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 no-underline"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {en ? 'Check free or low-cost options' : 'Buscar opciones gratuitas o de bajo costo'}
          </Link>
          <Link
            to="/urgent-resources"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-teal-200 bg-white px-5 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 no-underline"
          >
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            {en ? 'Find urgent resources' : 'Encontrar recursos urgentes'}
          </Link>
        </div>
      </div>
    </section>
  );
}
