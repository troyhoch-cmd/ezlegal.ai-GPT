import { Download, FileText, Globe, Code, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { bl } from '../lib/i18n';

type ExportFormat = 'csv' | 'json' | 'pdf' | 'api-webhook';

interface ExportOption {
  format: ExportFormat;
  label: { en: string; es: string };
  description: { en: string; es: string };
  icon: typeof Download;
  available: boolean;
}

interface ReferralExportOptionsProps {
  onExport?: (format: ExportFormat) => void;
  isDemo?: boolean;
}

const exportOptions: ExportOption[] = [
  {
    format: 'csv',
    label: { en: 'CSV export', es: 'Exportar CSV' },
    description: { en: 'De-identified referral summaries', es: 'Resúmenes de referencia desidentificados' },
    icon: FileText,
    available: true,
  },
  {
    format: 'pdf',
    label: { en: 'PDF report', es: 'Informe PDF' },
    description: { en: 'Formatted referral packet for printing', es: 'Paquete de referencia formateado para impresión' },
    icon: Download,
    available: true,
  },
  {
    format: 'json',
    label: { en: 'JSON (structured)', es: 'JSON (estructurado)' },
    description: { en: 'Machine-readable format for integrations', es: 'Formato legible por máquina para integraciones' },
    icon: Code,
    available: true,
  },
  {
    format: 'api-webhook',
    label: { en: 'API webhook', es: 'Webhook de API' },
    description: { en: 'Push to case management system', es: 'Enviar al sistema de gestión de casos' },
    icon: Globe,
    available: false,
  },
];

export function ReferralExportOptions({ onExport, isDemo = true }: ReferralExportOptionsProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span className="text-[11px] text-amber-700 font-medium">
            {en ? 'Demo — export options preview' : 'Demo — vista previa de opciones de exportación'}
          </span>
        </div>
      )}
      <div className="px-4 py-3 border-b border-slate-100">
        <h4 className="text-xs font-semibold text-slate-700">
          {en ? 'Export referral data' : 'Exportar datos de referencia'}
        </h4>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {en
            ? 'All exports contain de-identified data only. PII is never included without explicit consent.'
            : 'Todas las exportaciones contienen solo datos desidentificados. La PII nunca se incluye sin consentimiento explícito.'}
        </p>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.format}
              type="button"
              disabled={!option.available || isDemo}
              onClick={() => onExport?.(option.format)}
              className={`flex items-start gap-2.5 rounded-md border p-3 text-left transition ${
                option.available
                  ? 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 cursor-pointer'
                  : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              <Icon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800">
                  {bl(option.label, language)}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {bl(option.description, language)}
                </p>
                {!option.available && (
                  <p className="text-[9px] text-amber-600 mt-1 font-medium">
                    {en ? 'Coming soon' : 'Próximamente'}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
