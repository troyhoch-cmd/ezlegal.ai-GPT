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
