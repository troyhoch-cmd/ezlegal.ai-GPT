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
