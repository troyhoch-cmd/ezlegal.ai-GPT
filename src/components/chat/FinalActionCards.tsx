import { Save, Users, Printer, RotateCcw, FileText, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

type Persona = 'individual' | 'smb' | 'organization';

interface FinalActionCardsProps {
  onAction: (action: 'next-steps' | 'legal-help' | 'documents' | 'follow-up' | 'attorney-review' | 'partner-dashboard' | 'export') => void;
  persona?: Persona;
}

export default function FinalActionCards({ onAction, persona = 'individual' }: FinalActionCardsProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const individualActions = [
    {
      id: 'next-steps' as const,
      icon: Save,
      label: en ? 'Save next steps' : 'Guardar próximos pasos',
      color: 'bg-teal-50 border-teal-200 hover:border-teal-400 text-teal-800',
      iconColor: 'text-teal-600',
    },
    {
      id: 'legal-help' as const,
      icon: Users,
      label: en ? 'Find free help' : 'Encontrar ayuda gratuita',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
    {
      id: 'documents' as const,
      icon: Printer,
      label: en ? 'Print' : 'Imprimir',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
    {
      id: 'follow-up' as const,
      icon: RotateCcw,
      label: en ? 'Start over' : 'Empezar de nuevo',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
  ];

  const smbActions = [
    {
      id: 'next-steps' as const,
      icon: Save,
      label: en ? 'Save summary' : 'Guardar resumen',
      color: 'bg-teal-50 border-teal-200 hover:border-teal-400 text-teal-800',
      iconColor: 'text-teal-600',
    },
    {
      id: 'attorney-review' as const,
      icon: FileText,
      label: en ? 'Attorney review' : 'Revisión de abogado',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
    {
      id: 'documents' as const,
      icon: Printer,
      label: en ? 'Print' : 'Imprimir',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
    {
      id: 'follow-up' as const,
      icon: RotateCcw,
      label: en ? 'Start over' : 'Empezar de nuevo',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
  ];

  const orgActions = [
    {
      id: 'next-steps' as const,
      icon: FileText,
      label: en ? 'Create referral summary' : 'Crear resumen de referencia',
      color: 'bg-teal-50 border-teal-200 hover:border-teal-400 text-teal-800',
      iconColor: 'text-teal-600',
    },
    {
      id: 'partner-dashboard' as const,
      icon: ExternalLink,
      label: en ? 'Partner dashboard' : 'Panel de socios',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
    {
      id: 'export' as const,
      icon: Printer,
      label: en ? 'Export' : 'Exportar',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
    {
      id: 'follow-up' as const,
      icon: RotateCcw,
      label: en ? 'Start over' : 'Empezar de nuevo',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
  ];

  const actions = persona === 'smb' ? smbActions : persona === 'organization' ? orgActions : individualActions;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl border transition-all text-center min-h-[56px] ${action.color}`}
          >
            <Icon className={`w-5 h-5 ${action.iconColor}`} aria-hidden="true" />
            <span className="text-xs font-medium leading-tight">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
