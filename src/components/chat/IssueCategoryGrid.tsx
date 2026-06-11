import { Home, Users, CreditCard, Briefcase, Globe, Building2, FileText, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface IssueCategoryGridProps {
  onSelect: (prompt: string) => void;
}

const CATEGORIES = [
  {
    icon: Home,
    en: 'Housing or eviction',
    es: 'Vivienda o desalojo',
    promptEn: 'I have a housing or eviction issue.',
    promptEs: 'Tengo un problema de vivienda o desalojo.',
  },
  {
    icon: Users,
    en: 'Family or custody',
    es: 'Familia o custodia',
    promptEn: 'I need help with a family or custody issue.',
    promptEs: 'Necesito ayuda con un problema de familia o custodia.',
  },
  {
    icon: CreditCard,
    en: 'Debt or bills',
    es: 'Deudas o facturas',
    promptEn: 'I have a debt or bills issue I need help with.',
    promptEs: 'Tengo un problema de deudas o facturas.',
  },
  {
    icon: Briefcase,
    en: 'Work or wages',
    es: 'Trabajo o salarios',
    promptEn: 'I have a problem with my employer or wages.',
    promptEs: 'Tengo un problema con mi empleador o salarios.',
  },
  {
    icon: Globe,
    en: 'Immigration',
    es: 'Inmigración',
    promptEn: 'I need help with an immigration question.',
    promptEs: 'Necesito ayuda con una pregunta de inmigración.',
  },
  {
    icon: Building2,
    en: 'Small business',
    es: 'Pequeño negocio',
    promptEn: 'I have a small business legal question.',
    promptEs: 'Tengo una pregunta legal sobre mi pequeño negocio.',
  },
  {
    icon: FileText,
    en: 'Documents',
    es: 'Documentos',
    promptEn: 'I need help understanding or preparing a legal document.',
    promptEs: 'Necesito ayuda para entender o preparar un documento legal.',
  },
  {
    icon: HelpCircle,
    en: 'Something else',
    es: 'Otro problema',
    promptEn: '',
    promptEs: '',
  },
];

export default function IssueCategoryGrid({ onSelect }: IssueCategoryGridProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="max-w-xl mx-auto">
      <h3 className="text-base font-bold text-slate-800 mb-1 text-center">
        {en ? 'What legal issue can we help you understand?' : '¿Qué problema legal podemos ayudarle a entender?'}
      </h3>
      <p className="text-sm text-slate-500 mb-4 text-center">
        {en
          ? 'You do not need to know the legal category. Describe what happened in your own words.'
          : 'No necesita saber la categoría legal. Describa lo que pasó con sus propias palabras.'}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const prompt = en ? cat.promptEn : cat.promptEs;
          return (
            <button
              key={cat.en}
              onClick={() => onSelect(prompt)}
              className="flex flex-col items-center gap-2 px-3 py-3.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-center group"
            >
              <Icon className="w-5 h-5 text-slate-500 group-hover:text-teal-600 transition-colors" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-700 group-hover:text-teal-800 leading-tight">
                {en ? cat.en : cat.es}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
