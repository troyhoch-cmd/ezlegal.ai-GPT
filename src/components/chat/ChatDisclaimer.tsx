import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ChatDisclaimer() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="text-center">
      <p className="text-[11px] text-slate-500">
        {en
          ? 'This is legal information, not legal advice. Using this does not create an attorney-client relationship.'
          : 'Esto es información legal, no asesoría legal. Usar esto no crea una relación abogado-cliente.'}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 mt-1 text-[11px] text-teal-600 hover:text-teal-800 transition-colors"
        aria-expanded={expanded}
      >
        <Info className="w-3 h-3" aria-hidden="true" />
        {en ? 'How this works' : 'Cómo funciona'}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-2 mx-auto max-w-md text-left text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
          <p>{en
            ? 'AI provides legal information, not legal advice.'
            : 'La IA proporciona información legal, no asesoría legal.'}</p>
          <p>{en
            ? 'No attorney-client relationship is created.'
            : 'No se crea una relación abogado-cliente.'}</p>
          <p>{en
            ? 'You should consult a licensed attorney for advice about your specific situation.'
            : 'Debe consultar a un abogado licenciado para asesoría sobre su situación específica.'}</p>
          <p>{en
            ? 'Emergency and deadline issues may require immediate professional help.'
            : 'Problemas de emergencia o con plazos pueden requerir ayuda profesional inmediata.'}</p>
          <p>
            <Link to="/scope-disclaimers" className="underline text-teal-600 hover:text-teal-800">
              {en ? 'Full scope and disclaimers' : 'Alcance y descargos completos'}
            </Link>
            {' | '}
            <Link to="/privacy-at-a-glance" className="underline text-teal-600 hover:text-teal-800">
              {en ? 'Privacy' : 'Privacidad'}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
