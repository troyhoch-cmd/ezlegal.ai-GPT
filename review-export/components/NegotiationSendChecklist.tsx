import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare, Square, AlertTriangle, Shield, FileText,
  Download, Scale
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ChecklistItem {
  id: string;
  label: { en: string; es: string };
  description: { en: string; es: string };
  critical: boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'facts',
    label: {
      en: 'Verify all facts, names, dates, and amounts',
      es: 'Verifique todos los hechos, nombres, fechas y montos',
    },
    description: {
      en: 'Confirm every name, date, dollar amount, and factual claim in the script is accurate.',
      es: 'Confirme que cada nombre, fecha, monto y afirmacion factual en el guion sea preciso.',
    },
    critical: true,
  },
  {
    id: 'sensitive',
    label: {
      en: 'Remove sensitive personal information',
      es: 'Elimine información personal sensible',
    },
    description: {
      en: 'Do not include SSNs, account numbers, medical details, or other private data unless necessary.',
      es: 'No incluya numeros de seguro social, numeros de cuenta, detalles medicos u otros datos privados a menos que sea necesario.',
    },
    critical: true,
  },
  {
    id: 'jurisdiction',
    label: {
      en: 'Confirm your state/jurisdiction is correct',
      es: 'Confirme que su estado/jurisdicción es correcto',
    },
    description: {
      en: 'Legal rights vary by location. Verify the script reflects the right jurisdiction.',
      es: 'Los derechos legales varian por ubicacion. Verifique que el guion refleje la jurisdicción correcta.',
    },
    critical: true,
  },
  {
    id: 'tone',
    label: {
      en: 'Review tone and language',
      es: 'Revise el tono y el lenguaje',
    },
    description: {
      en: 'Ensure the message is professional and factual. Avoid threats, insults, or language that could be seen as harassment.',
      es: 'Asegurese de que el mensaje sea profesional y basado en hechos. Evite amenazas, insultos o lenguaje que pueda considerarse acoso.',
    },
    critical: false,
  },
  {
    id: 'consequences',
    label: {
      en: 'Consider possible consequences',
      es: 'Considere las posibles consecuencias',
    },
    description: {
      en: 'Think about how the other party may respond. Could this escalate the situation or trigger retaliation?',
      es: 'Piense en como podria responder la otra parte. Podria esto escalar la situación o provocar represalias?',
    },
    critical: false,
  },
  {
    id: 'copy',
    label: {
      en: 'Keep a copy for your records',
      es: 'Guarde una copia para sus registros',
    },
    description: {
      en: 'Save or screenshot everything you send. A paper trail protects you if the dispute escalates.',
      es: 'Guarde o capture todo lo que envie. Un registro escrito lo protege si la disputa escala.',
    },
    critical: false,
  },
];

const t = {
  en: {
    collapsedTitle: 'Review Before Sending Checklist',
    completed: 'completed',
    headerTitle: 'Review Before Sending',
    headerDesc: 'Complete this checklist before copying or sending any script.',
    minimize: 'Minimize',
    required: 'Required',
    warningIncomplete: 'Please complete all required items before sending any negotiation communication.',
    allComplete: 'All critical checks completed. Remember: these scripts are legal information, not legal advice. For high-stakes matters, have an attorney review before sending.',
    jurisdiction: 'Jurisdiction:',
    scopeLink: 'What We Do & Don\'t Do',
    export: 'Export',
  },
  es: {
    collapsedTitle: 'Lista de Verificacion Antes de Enviar',
    completed: 'completados',
    headerTitle: 'Revise Antes de Enviar',
    headerDesc: 'Complete esta lista de verificacion antes de copiar o enviar cualquier guion.',
    minimize: 'Minimizar',
    required: 'Obligatorio',
    warningIncomplete: 'Complete todos los elementos obligatorios antes de enviar cualquier comunicacion de negociacion.',
    allComplete: 'Todas las verificaciones criticas completadas. Recuerde: estos guiones son información legal, no asesoramiento legal. Para asuntos de alto riesgo, consulte a un abogado antes de enviar.',
    jurisdiction: 'Jurisdicción:',
    scopeLink: 'Lo Que Hacemos y No Hacemos',
    export: 'Exportar',
  },
};

interface NegotiationSendChecklistProps {
  jurisdiction?: string;
}

export default function NegotiationSendChecklist({ jurisdiction }: NegotiationSendChecklistProps) {
  const { language } = useLanguage();
  const s = t[language] || t.en;
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(true);

  const toggleItem = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setChecked(next);
  };

  const allCriticalChecked = CHECKLIST_ITEMS
    .filter(item => item.critical)
    .every(item => checked.has(item.id));

  const completedCount = checked.size;
  const totalCount = CHECKLIST_ITEMS.length;

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        aria-expanded="false"
        aria-label={`${s.collapsedTitle} - ${completedCount} of ${totalCount} ${s.completed}`}
        className="w-full p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-amber-600" aria-hidden="true" />
          <span className="font-medium text-amber-900">{s.collapsedTitle}</span>
        </div>
        <span className="text-sm text-amber-700">{completedCount}/{totalCount} {s.completed}</span>
      </button>
    );
  }

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl overflow-hidden" role="region" aria-label={s.headerTitle}>
      <div className="p-4 bg-amber-100/50 border-b border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-700" aria-hidden="true" />
          <div>
            <h3 className="font-bold text-amber-900">{s.headerTitle}</h3>
            <p className="text-xs text-amber-700">{s.headerDesc}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(false)}
          aria-expanded="true"
          aria-label={s.minimize}
          className="text-sm text-amber-600 hover:text-amber-800"
        >
          {s.minimize}
        </button>
      </div>

      <div className="p-4 space-y-2" role="group" aria-label={s.headerTitle}>
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = checked.has(item.id);
          const label = language === 'es' ? item.label.es : item.label.en;
          const description = language === 'es' ? item.description.es : item.description.en;
          return (
            <button
              key={item.id}
              role="checkbox"
              aria-checked={isChecked}
              aria-label={`${label}${item.critical ? ` (${s.required})` : ''}`}
              onClick={() => toggleItem(item.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                isChecked
                  ? 'bg-green-50 border-green-200'
                  : item.critical
                  ? 'bg-white border-amber-200 hover:border-amber-300'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              {isChecked ? (
                <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <Square className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div>
                <div className={`text-sm font-medium ${isChecked ? 'text-green-800 line-through' : 'text-stone-800'}`}>
                  {label}
                  {item.critical && !isChecked && (
                    <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">{s.required}</span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${isChecked ? 'text-green-600' : 'text-stone-500'}`}>
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-amber-200 space-y-3">
        {!allCriticalChecked && (
          <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-lg" role="status" aria-live="polite">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-amber-800">{s.warningIncomplete}</p>
          </div>
        )}

        {allCriticalChecked && (
          <div className="flex items-start gap-2 p-3 bg-green-100 rounded-lg" role="status" aria-live="polite">
            <CheckSquare className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-green-800">{s.allComplete}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-4">
            {jurisdiction && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {s.jurisdiction} {jurisdiction}
              </span>
            )}
            <Link
              to="/scope-disclaimers"
              className="flex items-center gap-1 text-teal-600 hover:text-teal-700"
            >
              <Scale className="w-3 h-3" />
              {s.scopeLink}
            </Link>
          </div>
          <button
            aria-label={`${s.export} checklist as text file`}
            onClick={() => {
              const text = `Review Checklist - ${completedCount}/${totalCount} items verified`;
              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'negotiation-checklist.txt';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1 text-stone-400 hover:text-stone-600"
          >
            <Download className="w-3 h-3" aria-hidden="true" />
            {s.export}
          </button>
        </div>
      </div>
    </div>
  );
}
