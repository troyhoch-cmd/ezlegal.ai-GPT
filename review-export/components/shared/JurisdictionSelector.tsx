import { MapPin, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { US_STATES, US_TERRITORIES, JURISDICTION_GROUPS } from '../../data/jurisdictions';
import type { Jurisdiction } from '../../data/jurisdictions';
import { AccessibleCombobox } from '../inclusive';

const TYPE_LABEL: Record<Jurisdiction['type'], string> = {
  'us-state': 'State',
  federal: 'Federal',
  territory: 'Territory',
  international: 'International',
};

interface JurisdictionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  variant?: 'default' | 'compact' | 'card';
  showGroups?: boolean;
  statesOnly?: boolean;
  id?: string;
}

export default function JurisdictionSelector({
  value,
  onChange,
  label,
  description,
  variant = 'default',
  showGroups = false,
  statesOnly = true,
  id,
}: JurisdictionSelectorProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const selectId = id || 'jurisdiction-selector';

  const defaultLabel = en ? 'What state are you in?' : 'En que estado se encuentra?';
  const defaultDesc = en
    ? 'Laws vary significantly by state. This helps us provide relevant information.'
    : 'Las leyes varian significativamente por estado. Esto nos ayuda a proporcionar información relevante.';
  const placeholder = en ? 'Select your state...' : 'Seleccione su estado...';

  const jurisdictions: Jurisdiction[] = statesOnly
    ? [...US_STATES, ...US_TERRITORIES]
    : JURISDICTION_GROUPS.flatMap(g => g.options);

  if (variant === 'compact') {
    return (
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label || defaultLabel}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
        >
          <option value="">{placeholder}</option>
          {showGroups ? (
            JURISDICTION_GROUPS.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map(j => (
                  <option key={j.code} value={j.code}>{j.name}</option>
                ))}
              </optgroup>
            ))
          ) : (
            jurisdictions.map(j => (
              <option key={j.code} value={j.code}>{j.name}</option>
            ))
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-stone-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900" id={`${selectId}-label`}>
              {label || (en ? 'Confirm Your Jurisdiction' : 'Confirma Tu Jurisdicción')}
            </h3>
            <p className="text-xs text-stone-500">{description || defaultDesc}</p>
          </div>
        </div>
        <div className="relative">
          <select
            id={selectId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-labelledby={`${selectId}-label`}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="">{placeholder}</option>
            {jurisdictions.map(j => (
              <option key={j.code} value={j.code}>{j.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" aria-hidden="true" />
        </div>
        {value && (
          <div className="mt-3 flex items-center gap-2 text-sm text-stone-600">
            <MapPin className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span>
              <strong>{jurisdictions.find(j => j.code === value)?.name}</strong>
              <button
                onClick={() => onChange('')}
                className="ml-2 text-teal-600 hover:text-teal-700 underline"
              >
                {en ? 'Change' : 'Cambiar'}
              </button>
            </span>
          </div>
        )}
      </div>
    );
  }

  const options = jurisdictions.map((j) => ({
    value: j.code,
    label: j.name,
    description: TYPE_LABEL[j.type],
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-[#0067FF]" aria-hidden="true" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 mb-1" id={`${selectId}-label`}>
            {label || defaultLabel}
          </h4>
          <p className="text-sm text-slate-600">{description || defaultDesc}</p>
        </div>
      </div>
      <AccessibleCombobox
        label={label || defaultLabel}
        helpText={description || defaultDesc}
        options={options}
        value={value || null}
        onChange={(v) => onChange(v ?? '')}
        placeholder={placeholder}
        name={selectId}
      />
    </div>
  );
}
