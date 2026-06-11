import { useState } from 'react';
import { Building2, Scale, Briefcase, CheckCircle } from 'lucide-react';
import { ICP_CONTENT, type ICPKey } from '../../lib/gtm-content';
import { track } from '../../lib/gtm-analytics';
import { useLanguage } from '../../contexts/LanguageContext';
import CTAButton from './CTAButton';

interface ICPSelectorProps {
  onSelect?: (icp: ICPKey) => void;
  defaultIcp?: ICPKey;
}

const ICP_ICONS: Record<ICPKey, typeof Building2> = {
  startups: Briefcase,
  law_firms: Scale,
  in_house: Building2,
};

const ICP_LABELS_ES: Record<ICPKey, string> = {
  startups: 'Startups y PYMEs',
  law_firms: 'Bufetes de Abogados',
  in_house: 'Legal Interno',
};

const ICP_PAIN_ES: Record<ICPKey, string> = {
  startups: 'Las preguntas legales se acumulan en torno a contratos, contrataciones, privacidad, recaudación y riesgo de proveedores.',
  law_firms: 'La admisión, recolección de documentos y resúmenes iniciales consumen tiempo no facturable.',
  in_house: 'Los equipos legales reciben solicitudes dispersas de ventas, RRHH, compras y operaciones con hechos incompletos.',
};

const ICP_OUTCOME_ES: Record<ICPKey, string> = {
  startups: 'Obtenga hechos organizados, identificación de problemas, listas de verificación y resúmenes listos para abogados.',
  law_firms: 'Estandarice la admisión de clientes, califique asuntos más rápido y prepare resúmenes estructurados.',
  in_house: 'Triaje de solicitudes, recopilación de hechos, estandarización de flujos y enrutamiento por urgencia.',
};

const ICP_USE_CASES_ES: Record<ICPKey, string[]> = {
  startups: [
    'Preparación de revisión de NDA',
    'Triaje de contratos con proveedores',
    'Listas de incorporación de empleados/contratistas',
    'Preparación de diligencia para recaudación',
    'Preparación de política de privacidad',
  ],
  law_firms: [
    'Automatización de admisión de clientes',
    'Cuestionarios de paquetes de tarifa fija',
    'Admisión de revisión de contratos',
    'Admisión de patrimonio/formación empresarial',
    'Organización de documentos de descubrimiento',
  ],
  in_house: [
    'Admisión de NDA',
    'Revisión de proveedores',
    'Triaje de contratos de ventas',
    'Solicitudes de políticas laborales',
    'Cuestionarios de privacidad/seguridad',
  ],
};

const ICP_CTA_ES: Record<ICPKey, string> = {
  startups: 'Verificar preparación legal de mi empresa',
  law_firms: 'Ver automatización de admisión para bufetes',
  in_house: 'Triaje de solicitudes legales más rápido',
};

export default function ICPSelector({ onSelect, defaultIcp }: ICPSelectorProps) {
  const [selected, setSelected] = useState<ICPKey | null>(defaultIcp || null);
  const { language } = useLanguage();
  const es = language === 'es';

  const handleSelect = (key: ICPKey) => {
    setSelected(key);
    track('icp_selected', { icp: key });
    onSelect?.(key);
  };

  const content = selected ? ICP_CONTENT[selected] : null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {(Object.keys(ICP_CONTENT) as ICPKey[]).map((key) => {
          const Icon = ICP_ICONS[key];
          const isActive = selected === key;
          const label = es ? ICP_LABELS_ES[key] : ICP_CONTENT[key].label;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? 'border-teal-600 bg-teal-50 shadow-md'
                  : 'border-navy-200 bg-white hover:border-teal-400 hover:shadow-sm'
              }`}
              aria-pressed={isActive}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-teal-600 text-white' : 'bg-navy-100 text-navy-600'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`font-semibold text-sm ${isActive ? 'text-teal-700' : 'text-navy-800'}`}>
                {label}
              </span>
              {isActive && (
                <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-teal-600" />
              )}
            </button>
          );
        })}
      </div>

      {content && selected && (
        <div className="bg-white rounded-xl border border-navy-200 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-navy-700 mb-4 text-lg font-medium">
            {es ? ICP_PAIN_ES[selected] : content.pain}
          </p>
          <p className="text-navy-600 mb-6">
            {es ? ICP_OUTCOME_ES[selected] : content.outcome}
          </p>
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-navy-500 uppercase tracking-wide mb-3">
              {es ? 'Casos de Uso' : 'Use Cases'}
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(es ? ICP_USE_CASES_ES[selected] : content.useCases).map((uc) => (
                <li key={uc} className="flex items-start gap-2 text-sm text-navy-700">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  {uc}
                </li>
              ))}
            </ul>
          </div>
          <CTAButton
            text={es ? ICP_CTA_ES[selected] : content.cta}
            to={content.ctaRoute}
            variant="primary"
            trackEvent="cta_click"
          />
        </div>
      )}
    </div>
  );
}
