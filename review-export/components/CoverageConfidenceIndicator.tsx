import { AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

type CoverageLevel = 'high' | 'medium' | 'low';

interface CoverageConfidenceIndicatorProps {
  level: CoverageLevel;
  caseType?: string;
  jurisdiction?: string;
}

const COVERAGE_CONFIG: Record<CoverageLevel, {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  label: { en: string; es: string };
  description: { en: string; es: string };
  guidance: { en: string; es: string };
}> = {
  high: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    label: { en: 'Strong Data Coverage', es: 'Cobertura de Datos Fuerte' },
    description: {
      en: 'We have substantial case data for this combination of case type and jurisdiction. The probability range reflects a well-supported estimate.',
      es: 'Tenemos datos sustanciales para esta combinacion de tipo de caso y jurisdicción. El rango de probabilidad refleja una estimacion bien respaldada.',
    },
    guidance: {
      en: 'This prediction draws from a large volume of similar cases.',
      es: 'Esta prediccion se basa en un gran volumen de casos similares.',
    },
  },
  medium: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Info,
    label: { en: 'Moderate Data Coverage', es: 'Cobertura de Datos Moderada' },
    description: {
      en: 'We have some case data for this combination, but coverage is limited. The probability range may be wider than for better-covered topics.',
      es: 'Tenemos algunos datos para esta combinacion, pero la cobertura es limitada. El rango de probabilidad puede ser mas amplio.',
    },
    guidance: {
      en: 'Providing more details about your case may help narrow the range.',
      es: 'Proporcionar mas detalles sobre tu caso puede ayudar a reducir el rango.',
    },
  },
  low: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
    label: { en: 'Limited Data Coverage', es: 'Cobertura de Datos Limitada' },
    description: {
      en: 'We have limited case data for this specific combination. The prediction should be treated as a rough directional estimate only.',
      es: 'Tenemos datos limitados para esta combinacion especifica. La prediccion debe tratarse solo como una estimacion direccional aproximada.',
    },
    guidance: {
      en: 'We recommend consulting an attorney for a more informed assessment of your specific situation.',
      es: 'Recomendamos consultar a un abogado para una evaluacion mas informada de tu situación.',
    },
  },
};

export default function CoverageConfidenceIndicator({ level, caseType, jurisdiction }: CoverageConfidenceIndicatorProps) {
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'es';
  const config = COVERAGE_CONFIG[level];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${config.color}`}>
              {config.label[lang]}
            </span>
            {caseType && jurisdiction && (
              <span className="text-xs text-navy-500">
                {caseType} &middot; {jurisdiction}
              </span>
            )}
          </div>
          <p className={`text-xs ${config.color} mb-2`}>
            {config.description[lang]}
          </p>
          <p className={`text-xs ${config.color} font-medium`}>
            {config.guidance[lang]}
          </p>

          {level === 'low' && (
            <div className="flex flex-wrap gap-3 mt-3">
              <Link
                to="/ask"
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
              >
                {language === 'en' ? 'Ask more questions' : 'Hacer mas preguntas'}
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                to="/find-attorney"
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
              >
                {language === 'en' ? 'Find an attorney' : 'Encontrar un abogado'}
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                to="/issue-packs"
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
              >
                {language === 'en' ? 'Browse Issue Packs' : 'Ver Paquetes'}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
