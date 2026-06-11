import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getCurrentCheckup,
  saveCheckup,
  type CheckupAnswers,
  type CheckupRow,
  type PlanEntitlements,
} from '../services/safety-net-service';

interface Props {
  entitlements: PlanEntitlements | null;
  onComplete?: () => void;
}

const ACTION_COPY: Record<string, { en: string; es: string; route: string }> = {
  upload_documents: { en: 'Upload new documents to your vault', es: 'Sube documentos nuevos a tu boveda', route: '/safety-net#vault' },
  review_deadlines: { en: 'Review and reschedule deadlines', es: 'Revisa y reprograma fechas limite', route: '/safety-net#deadlines' },
  update_emergency_contact: { en: 'Update your emergency contact', es: 'Actualiza tu contacto de emergencia', route: '/profile' },
  update_address: { en: 'Update your address', es: 'Actualiza tu direccion', route: '/profile' },
  request_attorney_handoff: { en: 'Request an attorney handoff', es: 'Solicita conexion con un abogado', route: '/lawyer-profiles' },
};

const INITIAL: CheckupAnswers = {
  address_still_current: true,
  new_notice_received: false,
  new_documents_to_upload: false,
  deadline_changed: false,
  emergency_contact_current: true,
  attorney_needed: false,
  notes: '',
};

const QUESTIONS: { key: keyof CheckupAnswers; en: string; es: string; invertTone?: boolean }[] = [
  { key: 'address_still_current', en: 'Is your address still current?', es: 'Tu direccion sigue actualizada?' },
  { key: 'new_notice_received', en: 'Have you received any new legal notices?', es: 'Has recibido avisos legales nuevos?', invertTone: true },
  { key: 'new_documents_to_upload', en: 'Do you have new documents to add to the vault?', es: 'Tienes documentos nuevos para la boveda?', invertTone: true },
  { key: 'deadline_changed', en: 'Has any deadline changed or passed?', es: 'Ha cambiado o pasado alguna fecha limite?', invertTone: true },
  { key: 'emergency_contact_current', en: 'Is your emergency contact still correct?', es: 'Tu contacto de emergencia sigue siendo correcto?' },
  { key: 'attorney_needed', en: 'Do you want us to connect you with an attorney?', es: 'Quieres que te conectemos con un abogado?', invertTone: true },
];

export default function MonthlyCheckupFlow({ entitlements, onComplete }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [existing, setExisting] = useState<CheckupRow | null>(null);
  const [answers, setAnswers] = useState<CheckupAnswers>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const enabled = entitlements?.monthly_checkup_enabled ?? false;

  useEffect(() => {
    getCurrentCheckup().then((row) => {
      setExisting(row);
      if (row) setAnswers(row.answers);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    const saved = await saveCheckup(answers);
    setExisting(saved);
    setSaving(false);
    setShowForm(false);
    onComplete?.();
  }

  if (loading) return null;

  if (!enabled) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-navy-200 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-navy-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-navy-900 mb-1">
              {en ? 'Monthly legal checkup' : 'Revision legal mensual'}
            </h3>
            <p className="text-sm text-navy-600 mb-3">
              {en
                ? 'Get a 60-second monthly check-in with AI-generated action items. Included with Plus and Protection.'
                : 'Revision mensual de 60 segundos con acciones sugeridas por IA. Incluido en Plus y Proteccion.'}
            </p>
            <Link to="/pricing" className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:underline">
              {en ? 'See plans' : 'Ver planes'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (existing && !showForm) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-teal-200 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-teal-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-navy-900">
                {en ? 'Checkup complete this month' : 'Revision completada este mes'}
              </h3>
              <button onClick={() => setShowForm(true)} className="text-xs font-semibold text-teal-700 hover:underline">
                {en ? 'Update' : 'Actualizar'}
              </button>
            </div>
            <p className="text-xs text-navy-500 mb-3">
              {new Date(existing.completed_at).toLocaleDateString(en ? 'en-US' : 'es-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
            {existing.action_items.length > 0 ? (
              <>
                <div className="text-xs font-bold uppercase text-navy-500 mb-1.5">
                  {en ? 'Action items' : 'Acciones sugeridas'}
                </div>
                <ul className="space-y-1.5">
                  {existing.action_items.map((key) => {
                    const copy = ACTION_COPY[key];
                    if (!copy) return null;
                    return (
                      <li key={key}>
                        <Link
                          to={copy.route}
                          className="flex items-center gap-2 bg-navy-50 hover:bg-navy-100 rounded-lg p-2 text-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span className="flex-1 text-navy-800">{en ? copy.en : copy.es}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-navy-400" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="text-sm text-teal-700 bg-teal-50 rounded-lg p-3">
                {en ? 'All clear. Nothing to act on this month.' : 'Todo bien. Nada por hacer este mes.'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-navy-200 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-5 h-5 text-teal-600" />
        <h3 className="font-bold text-navy-900">
          {en ? 'Monthly legal checkup' : 'Revision legal mensual'}
        </h3>
      </div>
      <p className="text-sm text-navy-600 mb-4">
        {en
          ? '60 seconds. We will turn your answers into clear next steps.'
          : '60 segundos. Convertimos tus respuestas en acciones claras.'}
      </p>

      <div className="space-y-2 mb-4">
        {QUESTIONS.map((q) => {
          const value = answers[q.key] as boolean;
          return (
            <div key={q.key} className="flex items-center gap-3 bg-navy-50 rounded-lg p-3">
              <span className="flex-1 text-sm text-navy-800">{en ? q.en : q.es}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: true }))}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                    value ? 'bg-teal-600 text-white' : 'bg-white text-navy-600 border border-navy-200'
                  }`}
                >
                  {en ? 'Yes' : 'Si'}
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: false }))}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                    !value ? 'bg-navy-700 text-white' : 'bg-white text-navy-600 border border-navy-200'
                  }`}
                >
                  {en ? 'No' : 'No'}
                </button>
              </div>
            </div>
          );
        })}
        <textarea
          value={answers.notes}
          onChange={(e) => setAnswers((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder={en ? 'Anything else on your mind? (optional)' : 'Algo mas? (opcional)'}
          className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm"
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-navy-300 text-white font-bold text-sm py-2.5 rounded-lg"
        >
          <Circle className="w-4 h-4" />
          {saving ? (en ? 'Saving...' : 'Guardando...') : (en ? 'Complete checkup' : 'Completar revision')}
        </button>
        {existing && (
          <button
            onClick={() => setShowForm(false)}
            className="px-4 border border-navy-200 text-navy-700 text-sm font-semibold rounded-lg"
          >
            {en ? 'Cancel' : 'Cancelar'}
          </button>
        )}
      </div>
    </div>
  );
}
