import { User, Building2, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export type UserType = 'individual' | 'business' | 'organization';

interface PersonaSelectorProps {
  compact?: boolean;
}

const PERSONAS: { value: UserType; icon: typeof User; labelEn: string; labelEs: string; descEn: string; descEs: string }[] = [
  {
    value: 'individual', icon: User,
    labelEn: 'Individual', labelEs: 'Individual',
    descEn: 'Personal legal questions & self-help tools',
    descEs: 'Preguntas legales personales y herramientas de autoayuda',
  },
  {
    value: 'business', icon: Building2,
    labelEn: 'Small Business', labelEs: 'Pequeno Negocio',
    descEn: 'Business formation, contracts & compliance',
    descEs: 'Formacion empresarial, contratos y cumplimiento',
  },
  {
    value: 'organization', icon: Users,
    labelEn: 'Legal Aid / Org', labelEs: 'Ayuda Legal / Org',
    descEn: 'Client intake, reporting & team tools',
    descEs: 'Admision de clientes, reportes y herramientas de equipo',
  },
];

export default function PersonaSelector({ compact = false }: PersonaSelectorProps) {
  const { profile, updateUserType } = useAuth();
  const { language } = useLanguage();
  const en = language === 'en';
  const currentType = (profile?.user_type as UserType) || 'individual';

  const handleSelect = async (type: UserType) => {
    if (type === currentType) return;
    await updateUserType(type);
  };

  if (compact) {
    return (
      <div
        className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-lg p-1"
        role="radiogroup"
        aria-label={en ? 'Select your user type' : 'Seleccione su tipo de usuario'}
      >
        {PERSONAS.map(p => {
          const Icon = p.icon;
          const isActive = currentType === p.value;
          return (
            <button
              key={p.value}
              role="radio"
              aria-checked={isActive}
              onClick={() => handleSelect(p.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isActive
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={en ? p.descEn : p.descEs}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {en ? p.labelEn : p.labelEs}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      role="radiogroup"
      aria-label={en ? 'Select your user type' : 'Seleccione su tipo de usuario'}
    >
      {PERSONAS.map(p => {
        const Icon = p.icon;
        const isActive = currentType === p.value;
        return (
          <button
            key={p.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => handleSelect(p.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
              isActive
                ? 'border-teal-500 bg-teal-50 shadow-md'
                : 'border-navy-200 bg-white hover:border-teal-300 hover:shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isActive ? 'bg-teal-600 text-white' : 'bg-navy-100 text-navy-600'
            }`}>
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="text-center">
              <div className={`text-sm font-bold ${isActive ? 'text-teal-700' : 'text-navy-800'}`}>
                {en ? p.labelEn : p.labelEs}
              </div>
              <div className="text-xs text-navy-500 mt-0.5">
                {en ? p.descEn : p.descEs}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
