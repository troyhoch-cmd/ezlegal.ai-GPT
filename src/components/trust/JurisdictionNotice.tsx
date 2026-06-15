import { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface JurisdictionNoticeProps {
  onJurisdictionChange?: (jurisdiction: string) => void;
  selectedJurisdiction?: string;
  required?: boolean;
  variant?: 'selector' | 'caveat';
  className?: string;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia',
];

export default function JurisdictionNotice({
  onJurisdictionChange,
  selectedJurisdiction,
  required = true,
  variant = 'selector',
  className = '',
}: JurisdictionNoticeProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [localJurisdiction, setLocalJurisdiction] = useState(selectedJurisdiction || '');

  const jurisdiction = selectedJurisdiction ?? localJurisdiction;

  const handleChange = (value: string) => {
    setLocalJurisdiction(value);
    onJurisdictionChange?.(value);
  };

  const content = {
    label: en ? 'Your State / Jurisdiction' : 'Su Estado / Jurisdicción',
    placeholder: en ? 'Select your state...' : 'Seleccione su estado...',
    required: en ? 'Required before proceeding' : 'Requerido antes de continuar',
    caveat: en
      ? 'Laws vary by state. Information shown is general and may not apply in your jurisdiction.'
      : 'Las leyes varían por estado. La información mostrada es general y puede no aplicarse en su jurisdicción.',
    tailored: en
      ? `Information tailored to ${jurisdiction} law where available.`
      : `Información adaptada a la ley de ${jurisdiction} cuando esté disponible.`,
    warning: en
      ? 'Always verify with local legal resources or a licensed attorney in your state.'
      : 'Siempre verifique con recursos legales locales o un abogado licenciado en su estado.',
  };

  if (variant === 'caveat') {
    return (
      <div
        data-testid="jurisdiction-notice"
        className={`bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 ${className}`}
      >
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-amber-800">
            {jurisdiction ? (
              <>
                <p className="font-medium">{content.tailored}</p>
                <p className="mt-0.5">{content.warning}</p>
              </>
            ) : (
              <p>{content.caveat}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="jurisdiction-notice"
      className={`bg-white border border-slate-200 rounded-xl p-4 ${className}`}
    >
      <label className="block">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <span className="text-sm font-medium text-slate-800">{content.label}</span>
          {required && (
            <span className="text-xs text-red-500 font-medium">*</span>
          )}
        </div>
        <select
          value={jurisdiction}
          onChange={(e) => handleChange(e.target.value)}
          required={required}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          aria-describedby="jurisdiction-caveat"
        >
          <option value="">{content.placeholder}</option>
          {US_STATES.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </label>
      <div id="jurisdiction-caveat" className="mt-2 flex items-start gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-slate-500">
          {jurisdiction ? content.tailored + ' ' + content.warning : content.caveat}
        </p>
      </div>
    </div>
  );
}
