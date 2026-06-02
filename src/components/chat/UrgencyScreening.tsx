import { useState } from 'react';
import { Calendar, Home, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface UrgencyScreeningProps {
  onSelect: (urgency: 'deadline' | 'losing' | 'unsafe' | 'none') => void;
}

export default function UrgencyScreening({ onSelect }: UrgencyScreeningProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [showDangerAlert, setShowDangerAlert] = useState(false);

  const options = [
    {
      id: 'deadline' as const,
      icon: Calendar,
      label: en ? 'I have a court date or deadline' : 'Tengo una fecha en la corte o una fecha límite',
      color: 'border-amber-200 hover:border-amber-300 hover:bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      id: 'losing' as const,
      icon: Home,
      label: en
        ? 'I may lose housing, income, or benefits soon'
        : 'Podría perder vivienda, ingresos o beneficios pronto',
      color: 'border-amber-200 hover:border-amber-300 hover:bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      id: 'unsafe' as const,
      icon: ShieldAlert,
      label: en ? 'I feel unsafe or threatened' : 'Me siento en peligro o amenazado/a',
      color: 'border-red-200 hover:border-red-300 hover:bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      id: 'none' as const,
      icon: CheckCircle,
      label: en ? 'No immediate deadline' : 'No hay una fecha límite inmediata',
      color: 'border-slate-200 hover:border-teal-300 hover:bg-teal-50',
      iconColor: 'text-slate-500',
    },
  ];

  const handleSelect = (id: 'deadline' | 'losing' | 'unsafe' | 'none') => {
    if (id === 'unsafe') {
      setShowDangerAlert(true);
    }
    onSelect(id);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-sm font-semibold text-slate-700 mb-3 text-center">
        {en ? 'Is anything urgent?' : '¿Hay algo urgente?'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${opt.color}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${opt.iconColor}`} aria-hidden="true" />
              <span className="text-slate-700">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {showDangerAlert && (
        <div className="mt-3 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl" role="alert">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-800">
            {en
              ? 'If you are in immediate danger, call 911 or local emergency services.'
              : 'Si está en peligro inmediato, llame al 911 o a los servicios de emergencia locales.'}
          </p>
        </div>
      )}
    </div>
  );
}
