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
