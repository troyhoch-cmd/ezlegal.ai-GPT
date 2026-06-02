import { useLanguage } from '../../contexts/LanguageContext';
import { getDisclosure } from '../../lib/legal-disclosures';
import type { DisclosureKey } from '../../lib/legal-disclosures';

interface AcknowledgmentChecklistProps {
  items: DisclosureKey[];
  checkedItems: boolean[];
  onChange: (index: number, checked: boolean) => void;
  label?: string;
}

export default function AcknowledgmentChecklist({
  items,
  checkedItems,
  onChange,
  label,
}: AcknowledgmentChecklistProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div>
      <p className="text-sm font-bold text-slate-800 mb-3">
        {label || (en ? 'I understand and acknowledge:' : 'Entiendo y reconozco:')}
      </p>
      <div className="space-y-2.5">
        {items.map((key, i) => (
          <label key={key} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checkedItems[i] || false}
              onChange={(e) => onChange(i, e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">
              {getDisclosure(key, language)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
