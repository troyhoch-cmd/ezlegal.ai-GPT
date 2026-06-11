import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const rows = {
  en: [
    { label: 'Cost', diy: 'Free', ez: 'Free to start', law: '$200–$500/hr' },
    { label: 'Speed', diy: 'Hours of research', ez: 'Under 5 minutes', law: 'Days to weeks' },
    { label: 'Language', diy: 'Mostly English', ez: 'English & Spanish', law: 'Varies' },
    { label: 'Next steps', diy: 'You figure it out', ez: 'Plain-language plan', law: 'Attorney advises' },
    { label: 'Document help', diy: 'Templates only', ez: 'Guided preparation', law: 'Full drafting' },
    { label: 'Human help', diy: 'None', ez: 'Referrals when needed', law: 'Direct representation' },
    { label: 'Best for', diy: 'Simple lookups', ez: 'Most legal situations', law: 'Complex litigation' },
  ],
  es: [
    { label: 'Costo', diy: 'Gratis', ez: 'Gratis para empezar', law: '$200–$500/hr' },
    { label: 'Velocidad', diy: 'Horas investigando', ez: 'Menos de 5 minutos', law: 'Días a semanas' },
    { label: 'Idioma', diy: 'Mayormente inglés', ez: 'Inglés y español', law: 'Varía' },
    { label: 'Próximos pasos', diy: 'Tú lo descifras', ez: 'Plan en lenguaje simple', law: 'El abogado aconseja' },
    { label: 'Documentos', diy: 'Solo plantillas', ez: 'Preparación guiada', law: 'Redacción completa' },
    { label: 'Ayuda humana', diy: 'Ninguna', ez: 'Referencias cuando sea necesario', law: 'Representación directa' },
    { label: 'Mejor para', diy: 'Búsquedas simples', ez: 'La mayoría de situaciones', law: 'Litigio complejo' },
  ],
};

export function ComparisonTable() {
  const { language } = useLanguage();
  const en = language === 'en';
  const items = en ? rows.en : rows.es;

  return (
    <section className="py-10 sm:py-12" aria-labelledby="compare-heading">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 id="compare-heading" className="text-lg sm:text-xl font-bold text-slate-900 text-center mb-2">
          {en ? 'How does ezLegal compare?' : 'Cómo se compara ezLegal?'}
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6 max-w-lg mx-auto">
          {en ? 'Three ways to deal with a legal problem — compared side by side.' : 'Tres formas de manejar un problema legal — comparadas lado a lado.'}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 pr-4 font-semibold text-slate-700 text-xs">{en ? 'Factor' : 'Factor'}</th>
                <th className="py-3 px-3 font-semibold text-slate-400 text-xs text-center">{en ? 'DIY search' : 'Buscar solo'}</th>
                <th className="py-3 px-3 font-bold text-teal-800 text-xs text-center bg-teal-50/50 rounded-t-lg">ezLegal AI</th>
                <th className="py-3 px-3 font-semibold text-slate-400 text-xs text-center">{en ? 'Traditional lawyer' : 'Abogado tradicional'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(({ label, diy, ez, law }) => (
                <tr key={label}>
                  <td className="py-2.5 pr-4 font-medium text-slate-700 text-xs">{label}</td>
                  <td className="py-2.5 px-3 text-center text-xs text-slate-500">{diy}</td>
                  <td className="py-2.5 px-3 text-center text-xs text-teal-800 font-semibold bg-teal-50/50">{ez}</td>
                  <td className="py-2.5 px-3 text-center text-xs text-slate-500">{law}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 text-center">
          <Link to="/start" className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 no-underline">
            {en ? 'Start free — no account needed' : 'Empieza gratis — sin cuenta'}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
