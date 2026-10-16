import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

/** Appears before the composer; consent lasts only for this mounted workspace. */
export default function BeforeYouShare({ accepted, onChange }: { accepted: boolean; onChange: (accepted: boolean) => void }) {
  const { language } = useLanguage();
  const en = language === 'en';
  return (
    <section aria-label={en ? 'Before you share' : 'Antes de compartir'} className="mb-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-navy-800">
      <h2 className="font-bold mb-2">{en ? 'Before you share' : 'Antes de compartir'}</h2>
      <p>{en
        ? 'Arizona legal information, not legal advice. No attorney-client privilege. Avoid names, identification numbers, and confidential details.'
        : 'Información legal de Arizona, no asesoría legal. Sin privilegio abogado-cliente. Evita nombres, números de identificación y datos confidenciales.'}</p>
      <details className="mt-2">
        <summary className="cursor-pointer font-semibold py-1">{en ? 'How your information is handled' : 'Cómo se maneja tu información'}</summary>
        <p className="mt-1">{en ? 'Our service providers process your input to answer you. Conversations and documents are not used to train our AI models. We do not sell personal data. Disclosure may be required by law. See the privacy policy for retention, export, and deletion.' : 'Nuestros proveedores procesan tu información para responder. Las conversaciones y documentos no se usan para entrenar nuestros modelos de IA. No vendemos datos personales. La ley puede exigir su divulgación. Consulta la política para conocer los plazos de conservación, exportación y eliminación.'}</p>
      </details>
      <div className="my-2 flex flex-wrap gap-x-4 gap-y-2 font-semibold">
        <Link className="underline" to="/privacy">{en ? 'Privacy and data controls' : 'Privacidad y control de datos'}</Link>
        <Link className="underline" to="/find-attorney">{en ? 'Find human legal help' : 'Buscar ayuda legal humana'}</Link>
        <Link className="underline text-rose-800" to="/urgent-help">{en ? 'Urgent help' : 'Ayuda urgente'}</Link>
      </div>
      <label className="flex min-h-11 items-start gap-3 cursor-pointer pt-2">
        <input type="checkbox" checked={accepted} onChange={e => onChange(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-teal-700" />
        <span>{en ? 'I understand these limits and agree to processing by AI and service providers to respond to my submission.' : 'Entiendo estos límites y acepto que la IA y los proveedores procesen mi información para responder.'}</span>
      </label>
    </section>
  );
}
