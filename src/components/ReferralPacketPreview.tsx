import { FileText, Clock, MapPin, Globe, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  isDemo?: boolean;
}

export default function ReferralPacketPreview({ isDemo = true }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 max-w-lg shadow-sm" role="region" aria-labelledby="packet-preview-title">
      {isDemo && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
          <AlertTriangle className="w-3 h-3" aria-hidden="true" />
          {en ? 'Example only — not a real referral' : 'Solo ejemplo — no es una referencia real'}
        </div>
      )}

      <h3 id="packet-preview-title" className="font-semibold text-slate-900 text-sm mb-3">
        {en ? 'Referral packet preview' : 'Vista previa del paquete de referencia'}
      </h3>

      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5 text-xs">
          <FileText className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <span className="font-medium text-slate-800">{en ? 'Issue type:' : 'Tipo de problema:'}</span>
            <span className="ml-1.5 text-slate-600">{en ? 'Eviction — Notice to vacate received' : 'Desalojo — Aviso de desocupar recibido'}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs">
          <Clock className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <span className="font-medium text-slate-800">{en ? 'Urgency:' : 'Urgencia:'}</span>
            <span className="ml-1.5 text-red-600 font-medium">{en ? 'High — Court date within 14 days' : 'Alta — Fecha de tribunal dentro de 14 días'}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs">
          <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <span className="font-medium text-slate-800">{en ? 'Jurisdiction:' : 'Jurisdicción:'}</span>
            <span className="ml-1.5 text-slate-600">Arizona (Maricopa County)</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs">
          <Globe className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <span className="font-medium text-slate-800">{en ? 'Preferred language:' : 'Idioma preferido:'}</span>
            <span className="ml-1.5 text-slate-600">{en ? 'Spanish' : 'Español'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-[10px] text-slate-500">
          {en
            ? 'Referral packets include structured data only. Free-text descriptions are shared only with explicit client consent.'
            : 'Los paquetes de referencia incluyen solo datos estructurados. Las descripciones en texto libre se comparten solo con el consentimiento explícito del cliente.'}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
          CSV
        </span>
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
          API
        </span>
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
          Webhook
        </span>
        {isDemo && (
          <span className="text-[10px] text-slate-400 self-center ml-1">
            ({en ? 'Export formats — demo labels' : 'Formatos de exportación — etiquetas de demostración'})
          </span>
        )}
      </div>
    </div>
  );
}
