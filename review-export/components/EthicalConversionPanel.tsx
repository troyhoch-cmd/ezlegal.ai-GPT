import { BookmarkPlus, ListChecks, File as FileEdit, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onAction: (action: 'save' | 'checklist' | 'letter' | 'find_legal_help' | 'continue' | 'upgrade') => void;
}

export default function EthicalConversionPanel({ onAction }: Props) {
  function track(action: string) {
    supabase.from('engagement_analytics').insert({
      event_name: 'post_answer_conversion_clicked',
      event_data: { action },
    }).then(() => {}, () => {});
  }

  function handle(action: Parameters<Props['onAction']>[0]) {
    track(action);
    onAction(action);
  }

  return (
    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
      <h3 className="text-base font-semibold text-slate-900">Want help organizing this?</h3>
      <p className="mt-1 text-sm text-slate-700">
        Save this issue, create a checklist, or prepare questions for legal aid.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <ActionBtn icon={BookmarkPlus} label="Save my issue" onClick={() => handle('save')} />
        <ActionBtn icon={ListChecks} label="Create checklist" onClick={() => handle('checklist')} />
        <ActionBtn icon={FileEdit} label="Draft a letter" onClick={() => handle('letter')} />
        <ActionBtn icon={MapPin} label="Find local legal help" onClick={() => handle('find_legal_help')} />
      </div>
      <div className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-emerald-100 pt-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => handle('continue')}
          className="text-sm font-medium text-slate-700 hover:text-emerald-700"
        >
          Continue free
        </button>
        <button
          type="button"
          onClick={() => handle('upgrade')}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Upgrade for more help <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof BookmarkPlus;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-800 hover:border-emerald-400 hover:text-emerald-700"
    >
      <Icon className="h-4 w-4 text-emerald-600" />
      {label}
    </button>
  );
}
