import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEvent } from '../../services/analytics-service';

interface SituationItem {
  label: { en: string; es: string };
  href: string;
}

const situations: SituationItem[] = [
  { label: { en: 'Eviction or housing', es: 'Desalojo o vivienda' }, href: '/start?path=legal-aid' },
  { label: { en: 'Debt or collections', es: 'Deuda o cobranzas' }, href: '/start?path=legal-aid' },
  { label: { en: 'Family or safety', es: 'Familia o seguridad' }, href: '/start?path=legal-aid' },
  { label: { en: 'Immigration', es: 'Inmigraci\u00f3n' }, href: '/start?path=legal-aid' },
  { label: { en: 'Court papers or deadline', es: 'Documentos de corte o plazo' }, href: '/start?path=legal-aid' },
  { label: { en: 'Employment', es: 'Empleo' }, href: '/start?path=legal-aid' },
  { label: { en: 'Contract or lease (business)', es: 'Contrato o arrendamiento (negocio)' }, href: '/start?path=smb' },
  { label: { en: 'Not sure / other', es: 'No estoy seguro/a / otro' }, href: '/start' },
];

export function SituationExplorer() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <section className="py-8 sm:py-10 border-t border-slate-100" aria-labelledby="situations-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 id="situations-heading" className="text-lg font-bold text-slate-900 text-center mb-4">
          {en ? 'Common situations we help with' : 'Situaciones comunes con las que ayudamos'}
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {situations.map((s, i) => (
            <Link
              key={i}
              to={s.href}
              onClick={() => trackEvent('situation_chip_click', { label: s.label.en })}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 hover:border-teal-300 hover:bg-teal-50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 no-underline"
            >
              {en ? s.label.en : s.label.es}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
