import { ListChecks, Users, FileText, MessageSquare, Save, Printer, Search, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FinalActionCardsProps {
  onAction: (action: 'next-steps' | 'legal-help' | 'documents' | 'follow-up') => void;
}

export default function FinalActionCards({ onAction }: FinalActionCardsProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const actions = [
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
      label: en ? 'Find help' : 'Encontrar ayuda',
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
