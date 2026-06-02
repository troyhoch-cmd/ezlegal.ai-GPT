import { useEffect, useState } from 'react';
import { X, Bell, Mail, MessageSquare, Phone, Smartphone, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  listReminders,
  scheduleReminders,
  type PlanEntitlements,
  type ReminderChannel,
  type SafetyDeadline,
} from '../services/safety-net-service';

interface Props {
  deadline: SafetyDeadline;
  entitlements: PlanEntitlements | null;
  onClose: () => void;
}

const ALL_CHANNELS: { id: ReminderChannel; en: string; es: string; icon: typeof Bell }[] = [
  { id: 'in_app', en: 'In-app', es: 'En la app', icon: Smartphone },
  { id: 'email', en: 'Email', es: 'Correo', icon: Mail },
  { id: 'sms', en: 'SMS', es: 'SMS', icon: Phone },
  { id: 'whatsapp', en: 'WhatsApp', es: 'WhatsApp', icon: MessageSquare },
];

const DAY_OPTIONS = [14, 7, 3, 1, 0];

export default function DeadlineDetailDrawer({ deadline, entitlements, onClose }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';

  const allowedChannels = entitlements?.reminder_channels ?? ['in_app'];
  const [channels, setChannels] = useState<ReminderChannel[]>(['in_app']);
  const [daysBefore, setDaysBefore] = useState<number[]>(deadline.reminder_days_before ?? [7, 1]);
  const [existing, setExisting] = useState<Array<{ id: string; channel: string; scheduled_for: string; status: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    listReminders(deadline.id).then((rows) => setExisting(rows as typeof existing));
  }, [deadline.id]);

  function toggleChannel(id: ReminderChannel) {
    if (!allowedChannels.includes(id)) return;
    setChannels((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  function toggleDay(n: number) {
    setDaysBefore((prev) => (prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n].sort((a, b) => b - a)));
  }

  async function handleSave() {
    setSaving(true);
    await scheduleReminders(deadline.id, deadline.due_at, daysBefore, channels);
    const rows = await listReminders(deadline.id);
    setExisting(rows as typeof existing);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-navy-900/60" onClick={onClose} aria-hidden />
      <aside className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
        <header className="sticky top-0 bg-white border-b border-navy-100 p-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-navy-900">{deadline.title}</h2>
            <p className="text-xs text-navy-500">
              {new Date(deadline.due_at).toLocaleString(en ? 'en-US' : 'es-US', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
              })}
            </p>
          </div>
          <button onClick={onClose} aria-label={en ? 'Close' : 'Cerrar'} className="w-8 h-8 rounded-full hover:bg-navy-100 flex items-center justify-center">
            <X className="w-5 h-5 text-navy-700" />
          </button>
        </header>

        <div className="p-5 space-y-6">
          {deadline.description && (
            <section>
              <h3 className="text-xs font-bold uppercase text-navy-500 mb-1">{en ? 'Details' : 'Detalles'}</h3>
              <p className="text-sm text-navy-800">{deadline.description}</p>
            </section>
          )}

          <section>
            <h3 className="text-sm font-bold text-navy-900 mb-2">{en ? 'Remind me' : 'Recuerdame'}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {DAY_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => toggleDay(n)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    daysBefore.includes(n)
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
                  }`}
                >
                  {n === 0 ? (en ? 'Day of' : 'El dia') : en ? `${n}d before` : `${n}d antes`}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-bold text-navy-900 mb-2">{en ? 'Send to' : 'Enviar por'}</h3>
            <div className="grid grid-cols-2 gap-2">
              {ALL_CHANNELS.map((c) => {
                const allowed = allowedChannels.includes(c.id);
                const active = channels.includes(c.id);
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleChannel(c.id)}
                    disabled={!allowed}
                    className={`relative flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-colors ${
                      active && allowed
                        ? 'bg-teal-600 text-white border-teal-600'
                        : allowed
                        ? 'bg-white text-navy-800 border-navy-200 hover:bg-navy-50'
                        : 'bg-navy-50 text-navy-400 border-navy-100 cursor-not-allowed'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{en ? c.en : c.es}</span>
                    {!allowed && <Lock className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
            {allowedChannels.length < ALL_CHANNELS.length && (
              <p className="text-[11px] text-navy-500 mt-2">
                {en
                  ? 'Email, SMS, and WhatsApp reminders are part of Plus and Protection plans.'
                  : 'Recordatorios por correo, SMS y WhatsApp son parte de los planes Plus y Proteccion.'}
              </p>
            )}
          </section>

          {existing.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase text-navy-500 mb-2">
                {en ? 'Scheduled' : 'Programados'} ({existing.length})
              </h3>
              <ul className="space-y-1.5">
                {existing.map((r) => (
                  <li key={r.id} className="flex items-center justify-between text-xs bg-navy-50 rounded-lg px-3 py-2">
                    <span className="font-semibold text-navy-800 uppercase">{r.channel}</span>
                    <span className="text-navy-600">
                      {new Date(r.scheduled_for).toLocaleDateString(en ? 'en-US' : 'es-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`text-[10px] font-bold ${r.status === 'sent' ? 'text-teal-700' : 'text-navy-500'}`}>
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <button
            onClick={handleSave}
            disabled={saving || channels.length === 0 || daysBefore.length === 0}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-navy-200 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl"
          >
            {saved ? (en ? 'Saved' : 'Guardado') : saving ? (en ? 'Saving...' : 'Guardando...') : en ? 'Save reminders' : 'Guardar recordatorios'}
          </button>
        </div>
      </aside>
    </div>
  );
}
