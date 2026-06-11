import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { comparisonFeatures, comparisonData } from '../../data/pricing';

interface Props {
  language: 'en' | 'es';
}

const PLAN_COLS = [
  { id: 'justice_free', en: 'Free', es: 'Gratis' },
  { id: 'everyday-plus', en: 'Everyday Plus', es: 'Diario Plus' },
  { id: 'family', en: 'Family', es: 'Familia' },
];

export default function ComparisonTable({ language }: Props) {
  const l = language === 'es' ? 'es' : 'en';
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-expanded={expanded}
        >
          <span className="font-semibold text-navy-900 text-sm sm:text-base">
            {l === 'es' ? 'Comparar planes' : 'Compare plans'}
          </span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-navy-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-navy-500" />
          )}
        </button>

        {expanded && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-semibold text-navy-700 min-w-[140px]">
                    {l === 'es' ? 'Caracteristica' : 'Feature'}
                  </th>
                  {PLAN_COLS.map((col) => (
                    <th key={col.id} className="text-center p-3 font-semibold text-navy-700 min-w-[100px]">
                      {col[l]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feat, i) => (
                  <tr
                    key={feat.key}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td className="p-3 text-navy-700 font-medium">{feat[l]}</td>
                    {PLAN_COLS.map((col) => {
                      const val = comparisonData[col.id]?.[feat.key]?.[l] ?? '--';
                      return (
                        <td key={col.id} className="text-center p-3 text-navy-600">
                          {val === 'Yes' || val === 'Si' ? (
                            <span className="inline-block w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold leading-5">&#10003;</span>
                          ) : val === '--' ? (
                            <span className="text-navy-300">--</span>
                          ) : (
                            val
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
