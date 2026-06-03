# ezLegal.ai Code Review - Chat & Cognitive Load Components

> Chat interface, AI responses, cognitive load reduction.

Generated: 2026-06-03T00:51:49.801Z
Files included: 18

---

## src/components/chat/index.ts

```typescript
export { default as JurisdictionModal } from './JurisdictionModal';
export { default as UrgencyScreening } from './UrgencyScreening';
export { default as IssueCategoryGrid } from './IssueCategoryGrid';
export { default as FinalActionCards } from './FinalActionCards';
export { default as ChatDisclaimer } from './ChatDisclaimer';

```

---

## src/components/chat/ChatDisclaimer.tsx

```tsx
import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ChatDisclaimer() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="text-center">
      <p className="text-[11px] text-slate-500">
        {en
          ? 'This is legal information, not legal advice. Using this does not create an attorney-client relationship.'
          : 'Esto es información legal, no asesoría legal. Usar esto no crea una relación abogado-cliente.'}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 mt-1 text-[11px] text-teal-600 hover:text-teal-800 transition-colors"
        aria-expanded={expanded}
      >
        <Info className="w-3 h-3" aria-hidden="true" />
        {en ? 'How this works' : 'Cómo funciona'}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-2 mx-auto max-w-md text-left text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
          <p>{en
            ? 'AI provides legal information, not legal advice.'
            : 'La IA proporciona información legal, no asesoría legal.'}</p>
          <p>{en
            ? 'No attorney-client relationship is created.'
            : 'No se crea una relación abogado-cliente.'}</p>
          <p>{en
            ? 'You should consult a licensed attorney for advice about your specific situation.'
            : 'Debe consultar a un abogado licenciado para asesoría sobre su situación específica.'}</p>
          <p>{en
            ? 'Emergency and deadline issues may require immediate professional help.'
            : 'Problemas de emergencia o con plazos pueden requerir ayuda profesional inmediata.'}</p>
          <p>
            <Link to="/scope-disclaimers" className="underline text-teal-600 hover:text-teal-800">
              {en ? 'Full scope and disclaimers' : 'Alcance y descargos completos'}
            </Link>
            {' | '}
            <Link to="/privacy-at-a-glance" className="underline text-teal-600 hover:text-teal-800">
              {en ? 'Privacy' : 'Privacidad'}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

```

---

## src/components/chat/FinalActionCards.tsx

```tsx
import { ListChecks, Users, FileText, MessageSquare, Save, Printer, Search, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FinalActionCardsProps {
  onAction: (action: 'next-steps' | 'legal-help' | 'documents' | 'follow-up') => void;
}

export default function FinalActionCards({ onAction }: FinalActionCardsProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const actions = [
    {
      id: 'next-steps' as const,
      icon: Save,
      label: en ? 'Save next steps' : 'Guardar próximos pasos',
      color: 'bg-teal-50 border-teal-200 hover:border-teal-400 text-teal-800',
      iconColor: 'text-teal-600',
    },
    {
      id: 'legal-help' as const,
      icon: Users,
      label: en ? 'Find help' : 'Encontrar ayuda',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
    {
      id: 'documents' as const,
      icon: Printer,
      label: en ? 'Print' : 'Imprimir',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
    {
      id: 'follow-up' as const,
      icon: RotateCcw,
      label: en ? 'Start over' : 'Empezar de nuevo',
      color: 'bg-white border-slate-200 hover:border-teal-300 text-slate-800',
      iconColor: 'text-slate-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl border transition-all text-center min-h-[56px] ${action.color}`}
          >
            <Icon className={`w-5 h-5 ${action.iconColor}`} aria-hidden="true" />
            <span className="text-xs font-medium leading-tight">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

```

---

## src/components/chat/IssueCategoryGrid.tsx

```tsx
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

```

---

## src/components/chat/JurisdictionModal.tsx

```tsx
import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { US_STATES, US_TERRITORIES } from '../../data/jurisdictions';

interface JurisdictionModalProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export default function JurisdictionModal({ open, value, onChange, onClose }: JurisdictionModalProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const jurisdictions = [...US_STATES, ...US_TERRITORIES];

  const filtered = search.trim()
    ? jurisdictions.filter(
        (j) =>
          j.name.toLowerCase().includes(search.toLowerCase()) ||
          j.code.toLowerCase().includes(search.toLowerCase())
      )
    : jurisdictions;

  useEffect(() => {
    if (open) {
      setPending(value);
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const selectedName = jurisdictions.find((j) => j.code === pending)?.name || pending;

  const handleConfirm = () => {
    if (pending) {
      onChange(pending);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={en ? 'Select your state' : 'Selecciona tu estado'}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-900">
              {en ? 'Select your state' : 'Selecciona tu estado'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={en ? 'Close' : 'Cerrar'}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <p className="px-5 text-sm text-slate-500 mb-3">
          {en
            ? 'Laws vary by state. Select yours so we can provide relevant information.'
            : 'Las leyes varían por estado. Selecciona el tuyo para recibir información relevante.'}
        </p>

        {/* Search */}
        <div className="px-5 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={en ? 'Search for your state...' : 'Busca tu estado...'}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              aria-label={en ? 'Search states' : 'Buscar estados'}
            />
          </div>
        </div>

        {/* State list */}
        <div className="flex-1 overflow-y-auto px-5 pb-3" role="listbox" aria-label={en ? 'States' : 'Estados'}>
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((j) => (
              <button
                key={j.code}
                role="option"
                aria-selected={pending === j.code}
                onClick={() => setPending(j.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  pending === j.code
                    ? 'bg-teal-50 border-2 border-teal-500 text-teal-800 font-semibold'
                    : 'border border-slate-200 hover:border-teal-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {pending === j.code && <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />}
                <span className="truncate">{j.name}</span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-6">
              {en ? 'No states match your search.' : 'Ningún estado coincide con tu búsqueda.'}
            </p>
          )}
        </div>

        {/* Confirm */}
        <div className="px-5 py-4 border-t border-slate-200">
          <button
            onClick={handleConfirm}
            disabled={!pending}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors"
          >
            {pending
              ? (en ? `Use ${selectedName}` : `Usar ${selectedName}`)
              : (en ? 'Select a state' : 'Selecciona un estado')}
          </button>
        </div>
      </div>
    </div>
  );
}

```

---

## src/components/chat/UrgencyScreening.tsx

```tsx
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

```

---

## src/components/cognitive-load/index.ts

```typescript
export { default as UnifiedTrustStrip } from './UnifiedTrustStrip';
export { default as TabbedResponse } from './TabbedResponse';
export { default as MoreHelpDrawer } from './MoreHelpDrawer';
export { default as CollapsibleSidebar } from './CollapsibleSidebar';
export { default as ContextualCrisisAlert, detectCrisisSignal } from './ContextualCrisisAlert';
export type { CrisisSignal } from './ContextualCrisisAlert';

```

---

## src/components/cognitive-load/TabbedResponse.tsx

```tsx
import { useState } from 'react';
import { FileText, ListChecks, BookOpen, ChevronDown, ChevronUp, ExternalLink, ThumbsUp, HelpCircle, AlertCircle, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEvent } from '../../services/analytics-service';

interface Source {
  title: string;
  url?: string;
  citation?: string;
  confidence?: number;
}

interface ActionStep {
  step: number;
  title: string;
  description: string;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface TabbedResponseProps {
  summary: string;
  actionSteps: ActionStep[];
  sources: Source[];
  fullContent?: string;
  jurisdiction?: string;
}

type TabId = 'summary' | 'actions' | 'sources';

export default function TabbedResponse({
  summary,
  actionSteps,
  sources,
  fullContent,
  jurisdiction,
}: TabbedResponseProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [showFullContent, setShowFullContent] = useState(false);

  const tabs: { id: TabId; label: string; icon: typeof FileText; count?: number }[] = [
    {
      id: 'summary',
      label: en ? 'Summary' : 'Resumen',
      icon: FileText,
    },
    {
      id: 'actions',
      label: en ? 'Action Steps' : 'Pasos a Seguir',
      icon: ListChecks,
      count: actionSteps.length,
    },
    {
      id: 'sources',
      label: en ? 'Sources' : 'Fuentes',
      icon: BookOpen,
      count: sources.length,
    },
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-200" role="tablist" aria-label="Response sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'sources') trackEvent('source_panel_opened');
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all relative min-h-[44px] ${
                isActive
                  ? 'text-teal-700 bg-teal-50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-teal-200 text-teal-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {activeTab === 'summary' && (
          <div
            role="tabpanel"
            id="panel-summary"
            aria-labelledby="tab-summary"
            className="animate-in fade-in duration-200"
          >
            {jurisdiction && (
              <div className="mb-3 px-3 py-1.5 bg-slate-100 rounded-lg inline-flex items-center gap-2 text-xs text-slate-600">
                <span className="font-medium">{en ? 'Jurisdiction:' : 'Jurisdicción:'}</span>
                {jurisdiction}
              </div>
            )}

            <div className="prose prose-sm max-w-none text-slate-700">
              <p className="leading-relaxed">{summary}</p>
            </div>

            {fullContent && fullContent !== summary && (
              <div className="mt-4">
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  {showFullContent ? (
                    <>
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      {en ? 'Show less' : 'Mostrar menos'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      {en ? 'Show full response' : 'Mostrar respuesta completa'}
                    </>
                  )}
                </button>
                {showFullContent && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 animate-in slide-in-from-top-2 duration-200">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {fullContent}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div
            role="tabpanel"
            id="panel-actions"
            aria-labelledby="tab-actions"
            className="animate-in fade-in duration-200"
          >
            {actionSteps.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {en
                  ? 'No specific action steps identified for this query.'
                  : 'No se identificaron pasos de accion especificos para esta consulta.'}
              </p>
            ) : (
              <ol className="space-y-3">
                {actionSteps.map((step, index) => (
                  <li
                    key={index}
                    className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-slate-800">{step.title}</h4>
                        {step.priority && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(
                              step.priority
                            )}`}
                          >
                            {step.priority === 'high'
                              ? en
                                ? 'Urgent'
                                : 'Urgente'
                              : step.priority === 'medium'
                              ? en
                                ? 'Important'
                                : 'Importante'
                              : en
                              ? 'Suggested'
                              : 'Sugerido'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                      {step.deadline && (
                        <p className="text-xs text-amber-700 mt-2 font-medium">
                          {en ? 'Deadline: ' : 'Fecha limite: '}
                          {step.deadline}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {activeTab === 'sources' && (
          <div
            role="tabpanel"
            id="panel-sources"
            aria-labelledby="tab-sources"
            data-testid="sources-panel"
            className="animate-in fade-in duration-200"
          >
            {sources.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm text-slate-600">
                  {en
                    ? 'Sources unavailable for this response. Verify with a lawyer, court self-help center, legal-aid organization, or official court website.'
                    : 'Fuentes no disponibles para esta respuesta. Verifique con un abogado, centro de autoayuda del tribunal, organización de ayuda legal, o sitio web oficial del tribunal.'}
                </p>
                <p className="text-xs text-slate-500">
                  {en
                    ? 'For jurisdiction-specific citations, try asking about a specific law, deadline, or procedure.'
                    : 'Para citaciones de su jurisdicción, pregunte sobre una ley, fecha límite o procedimiento específico.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-xs font-medium text-slate-600 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-slate-800 text-sm">{source.title}</p>
                        {source.confidence !== undefined && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              source.confidence >= 0.8
                                ? 'bg-green-100 text-green-700'
                                : source.confidence >= 0.5
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {Math.round(source.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      {source.citation && (
                        <p className="text-xs text-slate-500 mt-1">{source.citation}</p>
                      )}
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 mt-1"
                        >
                          {en ? 'View source' : 'Ver fuente'}
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/how-it-works"
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                {en
                  ? 'Learn how we cite sources and verify information'
                  : 'Conozca como citamos fuentes y verificamos la información'}
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-1">
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          {en
            ? 'This is legal information, not legal advice. Using this tool does not create an attorney-client relationship.'
            : 'Esto es información legal, no asesoría legal. Usar esta herramienta no crea una relación abogado-cliente.'}
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {en
            ? 'Sources shown when available. We recommend having an attorney review any actions before proceeding.'
            : 'Fuentes mostradas cuando están disponibles. Recomendamos que un abogado revise cualquier acción antes de proceder.'}
        </p>
      </div>

      {/* Feedback buttons */}
      <FeedbackBar />
    </div>
  );
}

function FeedbackBar() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [submitted, setSubmitted] = useState<string | null>(null);

  const feedbackOptions = [
    { id: 'helpful', icon: ThumbsUp, label: en ? 'This helped' : 'Esto ayudó' },
    { id: 'confusing', icon: HelpCircle, label: en ? 'Confusing' : 'Confuso' },
    { id: 'wrong', icon: AlertCircle, label: en ? 'May be wrong' : 'Puede ser incorrecto' },
    { id: 'human', icon: UserCheck, label: en ? 'Need a human' : 'Necesito una persona' },
  ];

  if (submitted) {
    return (
      <div className="px-4 py-2 bg-teal-50 border-t border-teal-100 text-center">
        <p className="text-[11px] text-teal-700 font-medium">
          {en ? 'Thank you for your feedback.' : 'Gracias por su comentario.'}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
      {feedbackOptions.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => {
            setSubmitted(id);
            trackEvent('response_feedback', { type: id });
            try {
              const existing = JSON.parse(localStorage.getItem('ezlegal_feedback') || '[]');
              existing.push({ type: id, timestamp: new Date().toISOString() });
              localStorage.setItem('ezlegal_feedback', JSON.stringify(existing));
            } catch { /* ignore */ }
          }}
          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <Icon className="w-3 h-3" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}

```

---

## src/components/cognitive-load/CollapsibleSidebar.tsx

```tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  MessageSquare,
  History,
  Wrench,
  BookOpen,
  HelpCircle,
  Phone,
  User,
  Sparkles,
  Brain,
  Scale,
  List,
  FileText,
  FolderOpen,
  Search,
  Users,
  Code2,
  Info,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  labelEs: string;
  icon: typeof MessageSquare;
  href: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  descriptionEs?: string;
}

interface DropdownSection {
  id: string;
  label: string;
  labelEs: string;
  icon: typeof Wrench;
  items: NavItem[];
  tooltip?: string;
  tooltipEs?: string;
}

interface CollapsibleSidebarProps {
  onNewChat?: () => void;
  recentChats?: Array<{ id: string; title: string; date: string }>;
  currentChatId?: string;
  jurisdiction?: string;
  onChangeJurisdiction?: () => void;
  hasActiveSession?: boolean;
  className?: string;
}

const SIDEBAR_EXPANDED_KEY = 'ezlegal-sidebar-expanded';

export default function CollapsibleSidebar({
  onNewChat,
  recentChats = [],
  currentChatId,
  className = '',
}: CollapsibleSidebarProps) {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const en = language === 'en';
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const [hovering, setHovering] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const [expanded, setExpanded] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
    return stored === 'true';
  });

  const classNameHasWidth = /(^|\s)w-/.test(className);
  const collapsedWidth = classNameHasWidth ? '' : 'w-16';
  const expandedWidth = classNameHasWidth ? '' : 'w-64';

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(expanded));
  }, [expanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        expanded &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setExpanded(false);
        setOpenDropdown(null);
      }
    };

    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  const handleMouseEnter = () => {
    if (!expanded) {
      hoverTimeoutRef.current = setTimeout(() => {
        setHovering(true);
        setExpanded(true);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHovering(false);
  };

  const handleTapExpand = () => {
    if (!expanded) {
      setExpanded(true);
    } else {
      setExpanded(false);
      setOpenDropdown(null);
    }
  };

  const topNavItems: (NavItem | DropdownSection)[] = [
    {
      id: 'workspace',
      label: 'Ask a Question',
      labelEs: 'Hacer una Pregunta',
      icon: MessageSquare,
      href: '/chat',
      description: 'Ask questions and get help',
      descriptionEs: 'Haz preguntas y obtén ayuda',
    },
    {
      id: 'action-plan',
      label: 'My Next Steps',
      labelEs: 'Mis Próximos Pasos',
      icon: List,
      href: '/dashboard/action-plan',
      description: 'Tasks and next steps',
      descriptionEs: 'Tareas y próximos pasos',
    },
    {
      id: 'find-help',
      label: 'Find Legal Help',
      labelEs: 'Encontrar Ayuda Legal',
      icon: Users,
      href: '/lawyer-profiles',
      description: 'Browse attorneys and legal aid',
      descriptionEs: 'Busca abogados y ayuda legal',
    },
    {
      id: 'history',
      label: 'Past Questions',
      labelEs: 'Preguntas Anteriores',
      icon: History,
      href: '/dashboard/history',
      description: 'Saved summaries and past chats',
      descriptionEs: 'Resúmenes guardados y chats anteriores',
    },
    {
      id: 'tools',
      label: 'Document Help',
      labelEs: 'Ayuda con Documentos',
      icon: Wrench,
      tooltip: 'Upload, review, or draft documents',
      tooltipEs: 'Sube, revisa o redacta documentos',
      items: [
        {
          id: 'documents',
          label: 'My Documents',
          labelEs: 'Mis Documentos',
          icon: FileText,
          href: '/dashboard/documents',
          description: 'Your uploads and drafts',
          descriptionEs: 'Tus cargas y borradores',
        },
        {
          id: 'icp-templates',
          label: 'Contractor Forms',
          labelEs: 'Formularios de Contratista',
          icon: FolderOpen,
          href: '/dashboard/icp-templates',
          badge: 'NEW',
          badgeColor: 'bg-teal-500',
          description: 'State forms for independent contractors',
          descriptionEs: 'Formularios estatales para contratistas independientes',
        },
        {
          id: 'lawyer-match',
          label: 'Find a Lawyer',
          labelEs: 'Encontrar Abogado',
          icon: Users,
          href: '/find-attorney',
          badge: 'NEW',
          badgeColor: 'bg-teal-500',
          description: 'Get matched with legal help',
          descriptionEs: 'Encuentra ayuda legal',
        },
        {
          id: 'predictor',
          label: 'Check My Chances',
          labelEs: 'Ver Mis Probabilidades',
          icon: Brain,
          href: '/case-predictor',
          badge: 'READY',
          badgeColor: 'bg-blue-500',
          description: 'Estimate possible outcomes',
          descriptionEs: 'Estima resultados posibles',
        },
        {
          id: 'research',
          label: 'Research a Topic',
          labelEs: 'Investigar un Tema',
          icon: Search,
          href: '/dashboard/research',
          description: 'Look up legal topics',
          descriptionEs: 'Investiga temas legales',
        },
        {
          id: 'lawyer-profiles',
          label: 'Lawyer Directory',
          labelEs: 'Directorio de Abogados',
          icon: Users,
          href: '/dashboard/lawyer-profiles',
          description: 'Browse attorneys near you',
          descriptionEs: 'Encuentra abogados cerca',
        },
        {
          id: 'widgets',
          label: 'Website Widgets',
          labelEs: 'Widgets Web',
          icon: Code2,
          href: '/dashboard/website-integration',
          description: 'Embed tools',
          descriptionEs: 'Herramientas incrustadas',
        },
      ],
    },
    {
      id: 'resources',
      label: 'Learn More',
      labelEs: 'Aprender Más',
      icon: BookOpen,
      tooltip: 'Guides, articles, and referrals',
      tooltipEs: 'Guías, artículos y referencias',
      items: [
        {
          id: 'guides',
          label: 'Legal Guides',
          labelEs: 'Guías Legales',
          icon: BookOpen,
          href: '/ezreads',
          description: 'Plain-language articles',
          descriptionEs: 'Artículos en lenguaje simple',
        },
        {
          id: 'negotiate',
          label: 'Negotiation Planner',
          labelEs: 'Planificador de Negociación',
          icon: Scale,
          href: '/negotiate',
          description: 'Build a strategy',
          descriptionEs: 'Construye una estrategia',
        },
        {
          id: 'about',
          label: 'About Us',
          labelEs: 'Sobre Nosotros',
          icon: Info,
          href: '/about',
          description: 'Our mission',
          descriptionEs: 'Nuestra misión',
        },
      ],
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      id: 'account',
      label: 'Profile',
      labelEs: 'Perfil',
      icon: User,
      href: '/dashboard/profile',
      description: 'Account and billing',
      descriptionEs: 'Cuenta y facturación',
    },
    {
      id: 'privacy',
      label: 'Privacy',
      labelEs: 'Privacidad',
      icon: HelpCircle,
      href: '/privacy-at-a-glance',
      description: 'How your data is used',
      descriptionEs: 'Cómo se usan tus datos',
    },
    {
      id: 'contact',
      label: 'Contact Support',
      labelEs: 'Contactar Soporte',
      icon: Phone,
      href: '/contact',
      description: 'Get help or talk to a person',
      descriptionEs: 'Obtén ayuda o habla con una persona',
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  const isDropdown = (item: NavItem | DropdownSection): item is DropdownSection => {
    return 'items' in item;
  };

  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  if (!expanded) {
    return (
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleTapExpand}
        className={`${collapsedWidth} bg-slate-50 border-r border-slate-200 flex flex-col py-4 transition-all duration-200 ${className}`}
        aria-label={en ? 'Navigation sidebar (collapsed)' : 'Barra lateral de navegacion (colapsada)'}
      >
        <div className="flex-1 flex flex-col items-center gap-2 mt-2">
          {topNavItems.map((item) => {
            if (isDropdown(item)) {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="relative group"
                  title={en ? (item.tooltip || item.label) : (item.tooltipEs || item.labelEs)}
                >
                  <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-slate-600 hover:bg-slate-200"
                    aria-label={en ? item.label : item.labelEs}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {en ? item.label : item.labelEs}
                  </span>
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <div key={item.id} className="relative group">
                <Link
                  to={item.href}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    active
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label={en ? item.label : item.labelEs}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {item.badge && (
                    <span
                      className={`absolute -top-1 -right-1 w-2 h-2 ${item.badgeColor} rounded-full`}
                    />
                  )}
                </Link>
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {en ? item.label : item.labelEs}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-slate-200 pt-4 mt-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <div key={item.id} className="relative group">
                <Link
                  to={item.href}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    active
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label={en ? item.label : item.labelEs}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </Link>
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {en ? item.label : item.labelEs}
                </span>
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside
      ref={sidebarRef}
      className={`${expandedWidth} bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-200 ${className}`}
      aria-label={en ? 'Navigation sidebar' : 'Barra lateral de navegacion'}
    >
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-slate-800">ezLegal.ai</span>
          </Link>
          <button
            onClick={() => {
              setExpanded(false);
              setOpenDropdown(null);
            }}
            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label={en ? 'Collapse sidebar' : 'Colapsar barra lateral'}
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" aria-hidden="true" />
          </button>
        </div>

        {onNewChat && (
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            {en ? 'New Chat' : 'Nuevo Chat'}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-0.5 px-2">
          {topNavItems.map((item) => {
            if (isDropdown(item)) {
              const Icon = item.icon;
              const isOpen = openDropdown === item.id;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm font-medium">
                        {en ? item.label : item.labelEs}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-0.5 ml-4 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                      {item.items.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const active = isActive(subItem.href);
                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              active
                                ? 'bg-teal-100 text-teal-700'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                            aria-current={active ? 'page' : undefined}
                          >
                            <SubIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            <span className="text-sm truncate">
                              {en ? subItem.label : subItem.labelEs}
                            </span>
                            {subItem.badge && (
                              <span
                                className={`ml-auto text-[10px] px-1.5 py-0.5 ${subItem.badgeColor} text-white rounded-full font-semibold`}
                              >
                                {subItem.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium truncate">
                  {en ? item.label : item.labelEs}
                </span>
                {item.badge && (
                  <span
                    className={`ml-auto text-[10px] px-1.5 py-0.5 ${item.badgeColor} text-white rounded-full font-semibold`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {recentChats.length > 0 && (
          <div className="mt-4 px-2 pt-4 border-t border-slate-200">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {en ? 'Recent' : 'Reciente'}
              </span>
              {onNewChat && (
                <button
                  onClick={() => {
                    if (window.confirm(en ? 'Delete this conversation? This cannot be undone.' : 'Eliminar esta conversación? No se puede deshacer.')) {
                      onNewChat();
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                  aria-label={en ? 'Delete conversation' : 'Eliminar conversación'}
                  title={en ? 'Delete conversation' : 'Eliminar conversación'}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {recentChats.slice(0, 5).map((chat) => (
                <Link
                  key={chat.id}
                  to={`/chat?id=${chat.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currentChatId === chat.id
                      ? 'bg-slate-200 text-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{chat.title}</p>
                    <p className="text-[10px] text-slate-400">{chat.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-0.5">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium truncate">
                {en ? item.label : item.labelEs}
              </span>
            </Link>
          );
        })}

        {profile?.is_admin && (
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">{en ? 'Admin Panel' : 'Panel Admin'}</span>
          </Link>
        )}
      </div>
    </aside>
  );
}

```

---

## src/components/cognitive-load/ContextualCrisisAlert.tsx

```tsx
import { useState, useEffect, useCallback } from 'react';
import { Phone, Heart, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export type CrisisSignal = 'self_harm' | 'domestic_violence' | 'homelessness' | 'emergency';

interface CrisisConfig {
  title: string;
  titleEs: string;
  message: string;
  messageEs: string;
  primaryAction: {
    label: string;
    labelEs: string;
    phone?: string;
    href?: string;
  };
  color: string;
  bgColor: string;
}

const CRISIS_CONFIGS: Record<CrisisSignal, CrisisConfig> = {
  self_harm: {
    title: 'You Are Not Alone',
    titleEs: 'No Estas Solo/a',
    message: 'Free, confidential support is available 24/7.',
    messageEs: 'Apoyo gratuito y confidencial disponible 24/7.',
    primaryAction: {
      label: 'Call 988 Now',
      labelEs: 'Llamar 988 Ahora',
      phone: '988',
    },
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
  domestic_violence: {
    title: 'Safety Resources Available',
    titleEs: 'Recursos de Seguridad Disponibles',
    message: 'Trained advocates are ready to help 24/7.',
    messageEs: 'Defensores capacitados estan listos para ayudar 24/7.',
    primaryAction: {
      label: 'National DV Hotline',
      labelEs: 'Linea Nacional de VD',
      phone: '1-800-799-7233',
    },
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
  homelessness: {
    title: 'Housing Help Available',
    titleEs: 'Ayuda de Vivienda Disponible',
    message: 'Connect with housing resources and emergency shelter.',
    messageEs: 'Conectese con recursos de vivienda y refugio de emergencia.',
    primaryAction: {
      label: 'Find Local Help',
      labelEs: 'Encontrar Ayuda Local',
      href: '/emergency-resources',
    },
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  emergency: {
    title: 'Need Immediate Help?',
    titleEs: 'Necesita Ayuda Inmediata?',
    message: 'Crisis resources are available.',
    messageEs: 'Hay recursos de crisis disponibles.',
    primaryAction: {
      label: 'View Resources',
      labelEs: 'Ver Recursos',
      href: '/emergency-resources',
    },
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
};

const CRISIS_KEYWORDS: Record<CrisisSignal, string[]> = {
  self_harm: [
    'kill myself',
    'end my life',
    'suicide',
    'want to die',
    'hurt myself',
    'self harm',
    'no reason to live',
    'better off dead',
  ],
  domestic_violence: [
    'domestic violence',
    'abusive relationship',
    'partner abuse',
    'hit me',
    'hurting me',
    'restraining order',
    'protective order',
    'scared of',
    'abuser',
  ],
  homelessness: [
    'homeless',
    'evicted',
    'kicked out',
    'nowhere to go',
    'living in car',
    'on the street',
    'about to lose my home',
    'eviction notice',
  ],
  emergency: [],
};

interface ContextualCrisisAlertProps {
  messages: Array<{ content: string; role: 'user' | 'assistant' }>;
  forceShow?: CrisisSignal;
  onDismiss?: () => void;
  className?: string;
}

export function detectCrisisSignal(text: string): CrisisSignal | null {
  const lowerText = text.toLowerCase();

  for (const [signal, keywords] of Object.entries(CRISIS_KEYWORDS) as [CrisisSignal, string[]][]) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      return signal;
    }
  }

  return null;
}

export default function ContextualCrisisAlert({
  messages,
  forceShow,
  onDismiss,
  className = '',
}: ContextualCrisisAlertProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [dismissed, setDismissed] = useState(false);
  const [detectedSignal, setDetectedSignal] = useState<CrisisSignal | null>(null);

  useEffect(() => {
    if (forceShow) {
      setDetectedSignal(forceShow);
      setDismissed(false);
      return;
    }

    const userMessages = messages.filter((m) => m.role === 'user');
    for (const msg of userMessages.slice(-3)) {
      const signal = detectCrisisSignal(msg.content);
      if (signal) {
        setDetectedSignal(signal);
        setDismissed(false);
        return;
      }
    }
  }, [messages, forceShow]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (!detectedSignal || dismissed) {
    return null;
  }

  const config = CRISIS_CONFIGS[detectedSignal];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`${config.bgColor} border-2 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          detectedSignal === 'self_harm' || detectedSignal === 'domestic_violence'
            ? 'bg-rose-100'
            : detectedSignal === 'homelessness'
            ? 'bg-amber-100'
            : 'bg-red-100'
        }`}>
          {detectedSignal === 'self_harm' || detectedSignal === 'domestic_violence' ? (
            <Heart className={`w-5 h-5 ${config.color}`} aria-hidden="true" />
          ) : (
            <AlertTriangle className={`w-5 h-5 ${config.color}`} aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${config.color}`}>
            {en ? config.title : config.titleEs}
          </h4>
          <p className="text-sm text-slate-600 mt-0.5">
            {en ? config.message : config.messageEs}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {config.primaryAction.phone ? (
              <a
                href={`tel:${config.primaryAction.phone}`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                  detectedSignal === 'self_harm' || detectedSignal === 'domestic_violence'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {en ? config.primaryAction.label : config.primaryAction.labelEs}
              </a>
            ) : config.primaryAction.href ? (
              <Link
                to={config.primaryAction.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                  detectedSignal === 'emergency'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {en ? config.primaryAction.label : config.primaryAction.labelEs}
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </Link>
            ) : null}

            <Link
              to="/emergency-resources"
              className="text-sm text-slate-600 hover:text-slate-800 underline"
            >
              {en ? 'All crisis resources' : 'Todos los recursos de crisis'}
            </Link>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1.5 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
          aria-label={en ? 'Dismiss alert' : 'Cerrar alerta'}
        >
          <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

```

---

## src/components/cognitive-load/MoreHelpDrawer.tsx

```tsx
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal,
  X,
  Scale,
  Users,
  Download,
  Share2,
  Brain,
  BookOpen,
  Flag,
  FileText,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { trackHelpDrawerOpen } from '../../lib/ab-test-config';
import { useLanguage } from '../../contexts/LanguageContext';

interface MoreHelpDrawerProps {
  onExportChat?: () => void;
  onShareChat?: () => void;
  onPrediction?: () => void;
  onReportIssue?: () => void;
  hasMessages?: boolean;
  className?: string;
}

interface ActionItem {
  id: string;
  icon: typeof Scale;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
}

export default function MoreHelpDrawer({
  onExportChat,
  onShareChat,
  onPrediction,
  onReportIssue,
  hasMessages = false,
  className = '',
}: MoreHelpDrawerProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const primaryActions: ActionItem[] = [
    {
      id: 'find-attorney',
      icon: Scale,
      label: en ? 'Find an Attorney' : 'Encontrar un Abogado',
      description: en ? 'Connect with licensed lawyers' : 'Conecte con abogados licenciados',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      href: '/find-attorney',
    },
    {
      id: 'free-legal',
      icon: Users,
      label: en ? 'Free Legal Aid' : 'Ayuda Legal Gratuita',
      description: en ? 'Check pro bono eligibility' : 'Verifique elegibilidad pro bono',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      href: '/pro-bono',
    },
  ];

  const crisisAction: ActionItem = {
    id: 'urgent-help',
    icon: AlertTriangle,
    label: en ? 'Need Urgent Help?' : 'Necesita Ayuda Urgente?',
    description: en ? 'Crisis resources & hotlines' : 'Recursos de crisis y lineas de ayuda',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    href: '/emergency-resources',
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      trackHelpDrawerOpen();
    }
  };

  const secondaryActions: ActionItem[] = [
    ...(onPrediction
      ? [
          {
            id: 'prediction',
            icon: Brain,
            label: en ? 'Case Outcome Estimate' : 'Estimacion de Resultado',
            description: en ? 'AI scenario analysis' : 'Analisis de escenarios con IA',
            color: 'text-amber-600',
            bgColor: 'hover:bg-slate-50',
            onClick: onPrediction,
          },
        ]
      : []),
    {
      id: 'legal-guides',
      icon: BookOpen,
      label: en ? 'Legal Guides' : 'Guias Legales',
      description: en ? 'Browse EZ Reads articles' : 'Explorar articulos de EZ Reads',
      color: 'text-slate-600',
      bgColor: 'hover:bg-slate-50',
      href: '/ezreads',
    },
    {
      id: 'issue-packs',
      icon: FileText,
      label: en ? 'Issue Packs' : 'Paquetes de Ayuda',
      description: en ? 'Action plans & templates' : 'Planes de accion y plantillas',
      color: 'text-slate-600',
      bgColor: 'hover:bg-slate-50',
      href: '/pricing',
    },
  ];

  const exportActions: ActionItem[] = hasMessages
    ? [
        ...(onExportChat
          ? [
              {
                id: 'export',
                icon: Download,
                label: en ? 'Export Conversation' : 'Exportar Conversacion',
                description: en ? 'Download as PDF' : 'Descargar como PDF',
                color: 'text-slate-600',
                bgColor: 'hover:bg-slate-50',
                onClick: onExportChat,
              },
            ]
          : []),
        ...(onShareChat
          ? [
              {
                id: 'share',
                icon: Share2,
                label: en ? 'Share with Advocate' : 'Compartir con Defensor',
                description: en ? 'Generate shareable link' : 'Generar enlace compartible',
                color: 'text-slate-600',
                bgColor: 'hover:bg-slate-50',
                onClick: onShareChat,
              },
            ]
          : []),
      ]
    : [];

  const renderActionItem = (action: ActionItem) => {
    const Icon = action.icon;
    const content = (
      <div className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${action.bgColor}`}>
        <div className={`w-8 h-8 ${action.color.replace('text-', 'bg-').replace('600', '100')} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${action.color}`} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800">{action.label}</p>
          <p className="text-xs text-slate-500">{action.description}</p>
        </div>
        {action.href && action.external && (
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-1" aria-hidden="true" />
        )}
      </div>
    );

    if (action.href) {
      return (
        <Link
          key={action.id}
          to={action.href}
          onClick={() => setOpen(false)}
          className="block"
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        key={action.id}
        onClick={() => {
          action.onClick?.();
          setOpen(false);
        }}
        className="w-full text-left"
      >
        {content}
      </button>
    );
  };

  return (
    <div ref={drawerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={en ? 'More help options' : 'Mas opciones de ayuda'}
      >
        <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
        <span className="hidden sm:inline">{en ? 'More Help' : 'Mas Ayuda'}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-800">
              {en ? 'Get More Help' : 'Obtener Mas Ayuda'}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              aria-label={en ? 'Close menu' : 'Cerrar menu'}
            >
              <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
            </button>
          </div>

          <div className="p-2">
            <Link
              to={crisisAction.href || '#'}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-700">{crisisAction.label}</p>
                <p className="text-xs text-red-600">{crisisAction.description}</p>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-2 mb-2">
              {primaryActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.id}
                    to={action.href || '#'}
                    onClick={() => setOpen(false)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${action.bgColor} border-slate-200`}
                  >
                    <div className={`w-10 h-10 ${action.color.replace('text-', 'bg-').replace('600', '100')} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${action.color}`} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center">
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {secondaryActions.length > 0 && (
              <>
                <div className="my-2 border-t border-slate-100" />
                <div className="space-y-0.5">
                  {secondaryActions.map(renderActionItem)}
                </div>
              </>
            )}

            {exportActions.length > 0 && (
              <>
                <div className="my-2 border-t border-slate-100" />
                <div className="space-y-0.5">
                  {exportActions.map(renderActionItem)}
                </div>
              </>
            )}

            {onReportIssue && (
              <>
                <div className="my-2 border-t border-slate-100" />
                <button
                  onClick={() => {
                    onReportIssue();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                  {en ? 'Report an issue with this response' : 'Reportar un problema con esta respuesta'}
                </button>
              </>
            )}
          </div>

          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center">
              {en
                ? 'ezLegal.ai provides legal information, not legal advice.'
                : 'ezLegal.ai proporciona información legal, no asesoramiento legal.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

```

---

## src/components/cognitive-load/TabbedResponse.tsx

```tsx
import { useState } from 'react';
import { FileText, ListChecks, BookOpen, ChevronDown, ChevronUp, ExternalLink, ThumbsUp, HelpCircle, AlertCircle, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEvent } from '../../services/analytics-service';

interface Source {
  title: string;
  url?: string;
  citation?: string;
  confidence?: number;
}

interface ActionStep {
  step: number;
  title: string;
  description: string;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface TabbedResponseProps {
  summary: string;
  actionSteps: ActionStep[];
  sources: Source[];
  fullContent?: string;
  jurisdiction?: string;
}

type TabId = 'summary' | 'actions' | 'sources';

export default function TabbedResponse({
  summary,
  actionSteps,
  sources,
  fullContent,
  jurisdiction,
}: TabbedResponseProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [showFullContent, setShowFullContent] = useState(false);

  const tabs: { id: TabId; label: string; icon: typeof FileText; count?: number }[] = [
    {
      id: 'summary',
      label: en ? 'Summary' : 'Resumen',
      icon: FileText,
    },
    {
      id: 'actions',
      label: en ? 'Action Steps' : 'Pasos a Seguir',
      icon: ListChecks,
      count: actionSteps.length,
    },
    {
      id: 'sources',
      label: en ? 'Sources' : 'Fuentes',
      icon: BookOpen,
      count: sources.length,
    },
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-200" role="tablist" aria-label="Response sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'sources') trackEvent('source_panel_opened');
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all relative min-h-[44px] ${
                isActive
                  ? 'text-teal-700 bg-teal-50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-teal-200 text-teal-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {activeTab === 'summary' && (
          <div
            role="tabpanel"
            id="panel-summary"
            aria-labelledby="tab-summary"
            className="animate-in fade-in duration-200"
          >
            {jurisdiction && (
              <div className="mb-3 px-3 py-1.5 bg-slate-100 rounded-lg inline-flex items-center gap-2 text-xs text-slate-600">
                <span className="font-medium">{en ? 'Jurisdiction:' : 'Jurisdicción:'}</span>
                {jurisdiction}
              </div>
            )}

            <div className="prose prose-sm max-w-none text-slate-700">
              <p className="leading-relaxed">{summary}</p>
            </div>

            {fullContent && fullContent !== summary && (
              <div className="mt-4">
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  {showFullContent ? (
                    <>
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      {en ? 'Show less' : 'Mostrar menos'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      {en ? 'Show full response' : 'Mostrar respuesta completa'}
                    </>
                  )}
                </button>
                {showFullContent && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 animate-in slide-in-from-top-2 duration-200">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {fullContent}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div
            role="tabpanel"
            id="panel-actions"
            aria-labelledby="tab-actions"
            className="animate-in fade-in duration-200"
          >
            {actionSteps.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {en
                  ? 'No specific action steps identified for this query.'
                  : 'No se identificaron pasos de accion especificos para esta consulta.'}
              </p>
            ) : (
              <ol className="space-y-3">
                {actionSteps.map((step, index) => (
                  <li
                    key={index}
                    className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-slate-800">{step.title}</h4>
                        {step.priority && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(
                              step.priority
                            )}`}
                          >
                            {step.priority === 'high'
                              ? en
                                ? 'Urgent'
                                : 'Urgente'
                              : step.priority === 'medium'
                              ? en
                                ? 'Important'
                                : 'Importante'
                              : en
                              ? 'Suggested'
                              : 'Sugerido'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                      {step.deadline && (
                        <p className="text-xs text-amber-700 mt-2 font-medium">
                          {en ? 'Deadline: ' : 'Fecha limite: '}
                          {step.deadline}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {activeTab === 'sources' && (
          <div
            role="tabpanel"
            id="panel-sources"
            aria-labelledby="tab-sources"
            data-testid="sources-panel"
            className="animate-in fade-in duration-200"
          >
            {sources.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm text-slate-600">
                  {en
                    ? 'Sources unavailable for this response. Verify with a lawyer, court self-help center, legal-aid organization, or official court website.'
                    : 'Fuentes no disponibles para esta respuesta. Verifique con un abogado, centro de autoayuda del tribunal, organización de ayuda legal, o sitio web oficial del tribunal.'}
                </p>
                <p className="text-xs text-slate-500">
                  {en
                    ? 'For jurisdiction-specific citations, try asking about a specific law, deadline, or procedure.'
                    : 'Para citaciones de su jurisdicción, pregunte sobre una ley, fecha límite o procedimiento específico.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-xs font-medium text-slate-600 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-slate-800 text-sm">{source.title}</p>
                        {source.confidence !== undefined && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              source.confidence >= 0.8
                                ? 'bg-green-100 text-green-700'
                                : source.confidence >= 0.5
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {Math.round(source.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      {source.citation && (
                        <p className="text-xs text-slate-500 mt-1">{source.citation}</p>
                      )}
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 mt-1"
                        >
                          {en ? 'View source' : 'Ver fuente'}
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/how-it-works"
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                {en
                  ? 'Learn how we cite sources and verify information'
                  : 'Conozca como citamos fuentes y verificamos la información'}
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-1">
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          {en
            ? 'This is legal information, not legal advice. Using this tool does not create an attorney-client relationship.'
            : 'Esto es información legal, no asesoría legal. Usar esta herramienta no crea una relación abogado-cliente.'}
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {en
            ? 'Sources shown when available. We recommend having an attorney review any actions before proceeding.'
            : 'Fuentes mostradas cuando están disponibles. Recomendamos que un abogado revise cualquier acción antes de proceder.'}
        </p>
      </div>

      {/* Feedback buttons */}
      <FeedbackBar />
    </div>
  );
}

function FeedbackBar() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [submitted, setSubmitted] = useState<string | null>(null);

  const feedbackOptions = [
    { id: 'helpful', icon: ThumbsUp, label: en ? 'This helped' : 'Esto ayudó' },
    { id: 'confusing', icon: HelpCircle, label: en ? 'Confusing' : 'Confuso' },
    { id: 'wrong', icon: AlertCircle, label: en ? 'May be wrong' : 'Puede ser incorrecto' },
    { id: 'human', icon: UserCheck, label: en ? 'Need a human' : 'Necesito una persona' },
  ];

  if (submitted) {
    return (
      <div className="px-4 py-2 bg-teal-50 border-t border-teal-100 text-center">
        <p className="text-[11px] text-teal-700 font-medium">
          {en ? 'Thank you for your feedback.' : 'Gracias por su comentario.'}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
      {feedbackOptions.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => {
            setSubmitted(id);
            trackEvent('response_feedback', { type: id });
            try {
              const existing = JSON.parse(localStorage.getItem('ezlegal_feedback') || '[]');
              existing.push({ type: id, timestamp: new Date().toISOString() });
              localStorage.setItem('ezlegal_feedback', JSON.stringify(existing));
            } catch { /* ignore */ }
          }}
          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <Icon className="w-3 h-3" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}

```

---

## src/components/cognitive-load/UnifiedTrustStrip.tsx

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Info, ChevronDown, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface UnifiedTrustStripProps {
  jurisdiction?: string;
  onChangeJurisdiction?: () => void;
  onDismiss?: () => void;
  persistDismissal?: boolean;
}

const STORAGE_KEY = 'ezlegal-trust-dismissed';

export default function UnifiedTrustStrip({
  jurisdiction,
  onChangeJurisdiction,
  onDismiss,
  persistDismissal = true,
}: UnifiedTrustStripProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (persistDismissal) {
      const wasDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (wasDismissed === 'true') {
        setDismissed(true);
      }
    }
  }, [persistDismissal]);

  const handleDismiss = () => {
    setDismissed(true);
    if (persistDismissal) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <div
      className="bg-slate-50 border-b border-slate-200 transition-all duration-200"
      role="region"
      aria-label={en ? 'Trust and safety information' : 'Información de confianza y seguridad'}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          aria-expanded={expanded}
          aria-controls="trust-details"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span className="font-medium">
              {en ? 'AI legal information' : 'Información legal IA'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="flex items-center gap-1.5 text-xs">
              <Lock className="w-3 h-3 text-green-600" aria-hidden="true" />
              {en ? 'Encrypted' : 'Encriptado'}
            </span>
            {jurisdiction && (
              <>
                <span className="text-slate-400">|</span>
                <span className="text-xs font-medium text-navy-700">
                  {jurisdiction} {en ? 'law' : 'ley'}
                </span>
                {onChangeJurisdiction && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onChangeJurisdiction(); }}
                    className="text-xs text-teal-600 hover:text-teal-800 font-medium underline underline-offset-2"
                  >
                    {en ? 'Change' : 'Cambiar'}
                  </button>
                )}
              </>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-slate-200 rounded transition-colors"
          aria-label={en ? 'Dismiss trust banner' : 'Cerrar banner de confianza'}
        >
          <X className="w-4 h-4 text-slate-400" aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <div
          id="trust-details"
          className="px-4 pb-3 animate-in slide-in-from-top-1 duration-200"
        >
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-amber-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {en ? 'Legal Information Only' : 'Solo Información Legal'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {en
                      ? 'This is not legal advice. No attorney-client relationship is formed.'
                      : 'Esto no es asesoramiento legal. No se forma relacion abogado-cliente.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-green-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {en ? 'AES-256 Encrypted' : 'Encriptado AES-256'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {en
                      ? 'Your conversations are encrypted and can be deleted anytime.'
                      : 'Sus conversaciones estan encriptadas y pueden eliminarse en cualquier momento.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/trust-center"
                className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
              >
                {en ? 'Trust Center' : 'Centro de Confianza'}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
              <Link
                to="/privacy"
                className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
              >
                {en ? 'Privacy & Deletion' : 'Privacidad y Eliminacion'}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
              <Link
                to="/scope-disclaimers"
                className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
              >
                {en ? 'Full Disclaimers' : 'Descargos Completos'}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```

---

## src/components/ChatPrivacyGate.tsx

```tsx
import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEvent } from '../services/analytics-service';

interface ChatPrivacyGateProps {
  onAccept: () => void;
}

const STORAGE_KEY = 'ezlegal-chat-privacy-accepted';

export default function ChatPrivacyGate({ onAccept }: ChatPrivacyGateProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const accepted = sessionStorage.getItem(STORAGE_KEY);
    if (accepted === 'true') {
      onAccept();
    }
  }, [onAccept]);

  function handleContinue() {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    trackEvent('intake_started', { source: 'privacy_gate', language });
    onAccept();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-teal-700" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {en ? 'Before you begin' : 'Antes de comenzar'}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              {en
                ? 'This tool provides legal information, not legal advice. No attorney-client relationship is created by using this service.'
                : 'Esta herramienta proporciona informacion legal, no asesoramiento legal. No se crea una relacion abogado-cliente al usar este servicio.'}
            </p>
          </div>

          <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
            <Lock className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 space-y-1">
              <p className="font-medium">
                {en ? 'Your privacy:' : 'Su privacidad:'}
              </p>
              <ul className="space-y-1 text-slate-600">
                <li>
                  {en
                    ? '- Conversations are encrypted and deletable anytime'
                    : '- Las conversaciones estan encriptadas y se pueden eliminar en cualquier momento'}
                </li>
                <li>
                  {en
                    ? '- Do not share Social Security numbers, passwords, or financial account numbers'
                    : '- No comparta numeros de Seguro Social, contrasenas ni numeros de cuentas financieras'}
                </li>
                <li>
                  {en
                    ? '- You can request full data deletion at any time'
                    : '- Puede solicitar la eliminacion completa de datos en cualquier momento'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
            {en
              ? 'I understand this is legal information only, not legal advice, and I will not share highly sensitive personal data.'
              : 'Entiendo que esto es solo informacion legal, no asesoramiento legal, y no compartire datos personales altamente sensibles.'}
          </span>
        </label>

        <button
          onClick={handleContinue}
          disabled={!acknowledged}
          className="w-full py-3 px-4 bg-teal-700 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-800 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          {en ? 'Continue to AI Assistant' : 'Continuar al Asistente de IA'}
        </button>

        <div className="text-center">
          <a
            href="/privacy"
            className="text-xs text-slate-500 hover:text-teal-700 inline-flex items-center gap-1"
          >
            {en ? 'Full Privacy Policy' : 'Politica de Privacidad Completa'}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

```

---

## src/components/HandoffRequestForm.tsx

```tsx
import { useState } from 'react';
import { Send, UserCheck, Phone, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../services/analytics-service';
import RevenueShareDisclosure from './RevenueShareDisclosure';

interface HandoffRequestFormProps {
  conversationSummary?: string;
  jurisdiction?: string;
  issueCategory?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function HandoffRequestForm({
  conversationSummary,
  jurisdiction,
  issueCategory,
  onClose,
  onSuccess,
}: HandoffRequestFormProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const en = language === 'en';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'phone' | 'email'>('phone');
  const [urgency, setUrgency] = useState<'asap' | 'this_week' | 'no_rush'>('this_week');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await supabase.from('lawyer_connections').insert({
        user_id: user?.id || null,
        contact_name: name,
        contact_phone: phone || null,
        contact_method: preferredContact,
        urgency,
        jurisdiction: jurisdiction || null,
        issue_category: issueCategory || null,
        conversation_summary: conversationSummary || null,
        additional_notes: notes || null,
        status: 'pending',
        language,
      });

      if (dbError) throw dbError;

      trackEvent('human_help_clicked', {
        source: 'handoff_form',
        urgency,
        jurisdiction: jurisdiction || '',
        issue_category: issueCategory || '',
      });

      setSubmitted(true);
      onSuccess?.();
    } catch {
      setError(en ? 'Something went wrong. Please try again.' : 'Algo salio mal. Intentelo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4 text-center">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <UserCheck className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          {en ? 'Request submitted' : 'Solicitud enviada'}
        </h3>
        <p className="text-sm text-slate-600">
          {en
            ? 'A licensed attorney in your area will review your situation and reach out within 1-2 business days.'
            : 'Un abogado licenciado en su area revisara su situacion y se comunicara dentro de 1-2 dias habiles.'}
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-teal-700 text-white rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors"
        >
          {en ? 'Back to chat' : 'Volver al chat'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">
          {en ? 'Connect with a lawyer' : 'Conectar con un abogado'}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {en
            ? 'We will pass your conversation context to help the attorney understand your situation.'
            : 'Pasaremos el contexto de su conversacion para ayudar al abogado a entender su situacion.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {en ? 'Your name' : 'Su nombre'}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder={en ? 'First and last name' : 'Nombre y apellido'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {en ? 'Phone (optional)' : 'Telefono (opcional)'}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {en ? 'How urgent is this?' : 'Que tan urgente es esto?'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'asap', label: en ? 'ASAP' : 'Lo antes posible', icon: AlertCircle },
              { value: 'this_week', label: en ? 'This week' : 'Esta semana', icon: Clock },
              { value: 'no_rush', label: en ? 'No rush' : 'Sin prisa', icon: Phone },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setUrgency(value)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  urgency === value
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {conversationSummary && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">
              {en ? 'Context being shared:' : 'Contexto que se compartira:'}
            </p>
            <p className="text-xs text-slate-600 line-clamp-3">
              {conversationSummary}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {en ? 'Anything else the attorney should know?' : 'Algo mas que el abogado deba saber?'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
          />
        </div>

        <RevenueShareDisclosure variant="expandable" />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {en ? 'Cancel' : 'Cancelar'}
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex-1 py-2.5 px-4 bg-teal-700 text-white rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting
              ? (en ? 'Sending...' : 'Enviando...')
              : (en ? 'Submit' : 'Enviar')}
          </button>
        </div>
      </form>
    </div>
  );
}

```

---

## src/components/UrgentSignalCard.tsx

```tsx
import { AlertTriangle, Phone, X } from 'lucide-react';
import { CATEGORY_COPY, type UrgentSignal } from '../lib/urgent-signal-detector';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef } from 'react';

interface Props {
  signals: UrgentSignal[];
  onContinue: () => void;
  onDismiss: () => void;
}

export default function UrgentSignalCard({ signals, onContinue, onDismiss }: Props) {
  const { user } = useAuth();
  const logged = useRef(false);
  const primary = signals[0];
  const copy = primary ? CATEGORY_COPY[primary.category] : null;
  const isCritical = signals.some((s) => s.severity === 'critical');

  useEffect(() => {
    if (logged.current || signals.length === 0) return;
    logged.current = true;
    supabase.from('crisis_incidents').insert({
      user_id: user?.id ?? null,
      trigger_category: primary?.category ?? 'unknown',
      trigger_phrase: primary?.matchedPhrase ?? '',
      severity: isCritical ? 'critical' : 'high',
      source: 'chat_pre_send',
    }).then(() => {}, () => {});
  }, [signals, user?.id, primary, isCritical]);

  if (!copy) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className={`flex items-start gap-3 rounded-t-2xl p-5 ${isCritical ? 'bg-rose-50' : 'bg-amber-50'}`}>
          <AlertTriangle className={`mt-0.5 h-6 w-6 ${isCritical ? 'text-rose-600' : 'text-amber-600'}`} />
          <div className="flex-1">
            <h2 className={`text-lg font-semibold ${isCritical ? 'text-rose-900' : 'text-amber-900'}`}>
              {copy.title}
            </h2>
            <p className={`mt-1 text-sm ${isCritical ? 'text-rose-800' : 'text-amber-800'}`}>{copy.help}</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-full p-1 text-slate-500 hover:bg-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <p className="text-sm text-slate-700">
            I can still give you general legal information, but this situation may need a human right away.
          </p>
          {isCritical && (
            <a
              href="tel:911"
              className="flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 font-medium text-white hover:bg-rose-700"
            >
              <Phone className="h-4 w-4" /> If you are in immediate danger, call 911
            </a>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href="/emergency-resources"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-800 hover:border-emerald-400 hover:text-emerald-700"
            >
              See emergency resources
            </a>
            <a
              href="/lawyer-profiles"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-800 hover:border-emerald-400 hover:text-emerald-700"
            >
              Find a local legal aid office
            </a>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Continue with general info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## src/components/CrisisStrip.tsx

```tsx
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  variant?: 'hero' | 'inline';
}

export default function CrisisStrip({ variant = 'hero' }: Props) {
  const { language, t } = useLanguage();

  const LABELS: Record<string, string> = {
    en: 'Facing eviction, ICE, or domestic violence?',
    es: '¿Estás enfrentando un desalojo, ICE o violencia doméstica?',
    ar: t('crisis.label'),
    he: t('crisis.label'),
  };
  const CTAS: Record<string, string> = {
    en: 'Get urgent help',
    es: 'Obtén ayuda urgente',
    ar: t('crisis.cta'),
    he: t('crisis.cta'),
  };
  const label = LABELS[language] ?? LABELS.en;
  const cta = CTAS[language] ?? CTAS.en;

  const base =
    'inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium rounded-full tap-highlight-none max-w-full';
  const styles =
    variant === 'hero'
      ? 'bg-red-50 text-red-900 border border-red-200 px-3 sm:px-4 py-2 hover:bg-red-100'
      : 'bg-white/10 text-white border border-white/30 px-3 sm:px-4 py-2 hover:bg-white/20';

  return (
    <Link
      to="/emergency-resources"
      className={`${base} ${styles} focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors`}
      aria-label={`${label} ${cta}`}
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <bdi className="truncate min-w-0" style={{ unicodeBidi: 'isolate' }}>{label}</bdi>
      <bdi className="font-semibold underline underline-offset-2 whitespace-nowrap hidden sm:inline" style={{ unicodeBidi: 'isolate' }}>{cta}</bdi>
      <ArrowRight className="h-4 w-4 flex-shrink-0 rtl-mirror" aria-hidden="true" />
    </Link>
  );
}

```

---

## src/components/AnswerModeSelector.tsx

```tsx
import { useEffect, useState } from 'react';
import { Sparkles, ListChecks, Scale, File as FileEdit, Languages, Check, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type AnswerMode = 'simple' | 'stepbystep' | 'legal_aid_prep' | 'draft' | 'spanish';

interface ModeDef {
  id: AnswerMode;
  label: string;
  description: string;
  icon: typeof Sparkles;
}

const MODES: ModeDef[] = [
  { id: 'simple', label: 'Simple explanation', description: 'Plain-language answer for everyday understanding', icon: Sparkles },
  { id: 'stepbystep', label: 'Step-by-step help', description: 'A numbered checklist to move forward', icon: ListChecks },
  { id: 'legal_aid_prep', label: 'Prepare for legal aid', description: 'Organize facts, questions, and documents for a lawyer', icon: Scale },
  { id: 'draft', label: 'Draft a letter or checklist', description: 'Generate a starting document you can edit', icon: FileEdit },
  { id: 'spanish', label: 'Español', description: 'Respuesta en español', icon: Languages },
];

interface Props {
  value?: AnswerMode;
  onChange?: (mode: AnswerMode) => void;
  compact?: boolean;
}

export default function AnswerModeSelector({ value, onChange, compact = false }: Props) {
  const { user } = useAuth();
  const [mode, setMode] = useState<AnswerMode>(value ?? 'simple');
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (value !== undefined) setMode(value);
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    async function loadPreference() {
      if (!user?.id) { setLoaded(true); return; }
      const { data } = await supabase
        .from('profiles')
        .select('answer_mode')
        .eq('id', user.id)
        .maybeSingle();
      if (!cancelled && data?.answer_mode) {
        const saved = data.answer_mode as AnswerMode;
        setMode(saved);
        onChange?.(saved);
      }
      if (!cancelled) setLoaded(true);
    }
    loadPreference();
    return () => { cancelled = true; };
  }, [user?.id]);

  async function persist(next: AnswerMode) {
    setMode(next);
    onChange?.(next);
    setOpen(false);
    if (user?.id) {
      await supabase.from('profiles').update({ answer_mode: next }).eq('id', user.id);
    }
  }

  const current = MODES.find((m) => m.id === mode) ?? MODES[0];
  const Icon = current.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={!loaded}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:border-emerald-400 hover:text-emerald-700 transition disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Icon className="h-4 w-4 text-emerald-600" />
        {!compact && <span className="font-medium">{current.label}</span>}
        {compact && <span className="font-medium">Answer mode</span>}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          {MODES.map((m) => {
            const MIcon = m.icon;
            const selected = m.id === mode;
            return (
              <button
                key={m.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => persist(m.id)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition ${
                  selected ? 'bg-emerald-50' : 'hover:bg-slate-50'
                }`}
              >
                <MIcon className={`mt-0.5 h-5 w-5 ${selected ? 'text-emerald-600' : 'text-slate-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{m.label}</span>
                    {selected && <Check className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="text-xs text-slate-600">{m.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

```

---

