import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sensitiveInfoWarnings } from '../data/aiSafety';
import { useLanguage } from '../contexts/LanguageContext';

export default function BeforeYouType() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3" role="note" aria-label={en ? 'Before you type' : 'Antes de escribir'}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-0.5 text-[11px] text-amber-800 leading-snug">
          <p className="font-semibold">{en ? 'Before you type:' : 'Antes de escribir:'}</p>
          {sensitiveInfoWarnings.map((w, i) => (
            <p key={i}>
              {i === sensitiveInfoWarnings.length - 1 ? (
                <>
                  {en ? 'If you are in immediate danger, use ' : 'Si estás en peligro inmediato, usa '}
                  <Link to="/urgent-resources" className="text-amber-900 underline font-medium hover:text-amber-950">
                    {en ? 'urgent resources' : 'recursos urgentes'}
                  </Link>.
                </>
              ) : (
                en ? w.text.en : w.text.es
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
