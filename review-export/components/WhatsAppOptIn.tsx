import { useState } from 'react';
import {
  MessageCircle, Shield, CheckCircle, ArrowRight, Phone,
  AlertTriangle, X, Globe, Clock, Lock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface WhatsAppOptInProps {
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  variant?: 'full' | 'compact' | 'banner';
  onSuccess?: () => void;
}

const LEGAL_TOPICS = [
  { id: 'immigration', en: 'Immigration', es: 'Inmigracion' },
  { id: 'work', en: 'Workplace / Wage Theft', es: 'Trabajo / Robo de Salario' },
  { id: 'housing', en: 'Housing / Eviction', es: 'Vivienda / Desalojo' },
  { id: 'family', en: 'Family Law', es: 'Derecho Familiar' },
  { id: 'accident', en: 'Accident / Injury', es: 'Accidente / Lesion' },
  { id: 'criminal', en: 'Criminal Defense', es: 'Defensa Criminal' },
  { id: 'other', en: 'Other', es: 'Otro' },
];

export default function WhatsAppOptIn({
  source = 'direct',
  utmSource,
  utmMedium,
  utmCampaign,
  variant = 'full',
  onSuccess
}: WhatsAppOptInProps) {
  const { language } = useLanguage();
  const es = language === 'es';
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError(es ? 'Debes aceptar recibir mensajes.' : 'You must consent to receive messages.');
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError(es ? 'Ingresa un numero de telefono valido.' : 'Enter a valid phone number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await supabase.from('whatsapp_opt_ins').insert({
        phone_number: phone,
        legal_topic: topic || null,
        language: es ? 'es' : 'en',
        consent_given: true,
        source,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
      });
      setStep('success');
      onSuccess?.();
    } catch {
      setError(es ? 'Error al enviar. Intenta de nuevo.' : 'Error submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (variant === 'banner') {
    return (
      <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {es ? 'Recibe ayuda legal por WhatsApp' : 'Get Legal Help via WhatsApp'}
            </h3>
            <p className="text-xs text-slate-600">
              {es ? 'Respuesta en menos de 24 horas' : 'Response within 24 hours'}
            </p>
          </div>
        </div>
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (___) ___-____"
              className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
              required
            />
            <button
              type="submit"
              onClick={() => setConsent(true)}
              disabled={submitting}
              className="px-4 py-2.5 bg-[#25D366] text-white rounded-lg font-semibold text-sm hover:bg-[#1DA851] transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              {es ? 'Enviar' : 'Send'}
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 text-[#25D366] font-semibold text-sm">
            <CheckCircle className="w-5 h-5" />
            {es ? 'Te contactaremos pronto por WhatsApp.' : "We'll contact you via WhatsApp soon."}
          </div>
        )}
        <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
          <Lock className="w-3 h-3 flex-shrink-0" />
          {es
            ? 'Tu numero nunca se comparte con terceros ni agencias del gobierno.'
            : 'Your number is never shared with third parties or government agencies.'}
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">
            {es ? 'Ayuda por WhatsApp' : 'WhatsApp Help'}
          </span>
        </div>
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder={es ? 'Tu numero de WhatsApp' : 'Your WhatsApp number'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
              required
            />
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-0.5 accent-[#25D366]"
              />
              <span className="text-[11px] text-slate-600 leading-tight">
                {es
                  ? 'Acepto recibir mensajes de ayuda legal por WhatsApp. Puedo cancelar en cualquier momento.'
                  : 'I agree to receive legal help messages via WhatsApp. I can unsubscribe anytime.'}
              </span>
            </label>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !consent}
              className="w-full py-2 bg-[#25D366] text-white rounded-lg font-semibold text-sm hover:bg-[#1DA851] transition-colors disabled:opacity-50"
            >
              {submitting
                ? (es ? 'Enviando...' : 'Sending...')
                : (es ? 'Recibir Ayuda' : 'Get Help')}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-[#25D366] mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">
              {es ? 'Te contactaremos pronto.' : "We'll reach out soon."}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden max-w-lg mx-auto">
      <div className="bg-[#25D366] p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {es ? 'Ayuda Legal por WhatsApp' : 'Legal Help via WhatsApp'}
            </h3>
            <p className="text-green-100 text-sm">
              {es ? 'Confidencial y seguro' : 'Confidential & secure'}
            </p>
          </div>
        </div>
      </div>

      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Shield, en: 'Confidential', es: 'Confidencial' },
              { icon: Clock, en: 'Within 24hrs', es: 'En 24 horas' },
              { icon: Globe, en: 'Bilingual', es: 'Bilingue' },
            ].map(item => (
              <div key={item.en} className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-lg">
                <item.icon className="w-4 h-4 text-[#25D366]" />
                <span className="text-[11px] font-medium text-slate-700">{es ? item.es : item.en}</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              <Phone className="w-4 h-4 inline mr-1.5" />
              {es ? 'Tu Numero de WhatsApp' : 'Your WhatsApp Number'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (___) ___-____"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              {es ? 'Necesito ayuda con...' : 'I need help with...'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LEGAL_TOPICS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    topic === t.id
                      ? 'bg-[#25D366]/10 border-[#25D366] text-[#25D366]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {es ? t.es : t.en}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <p className="font-semibold">
                  {es ? 'Aviso de Privacidad y Seguridad' : 'Privacy & Safety Notice'}
                </p>
                <p>
                  {es
                    ? 'Tu numero NUNCA se comparte con ICE, la policia, ni ninguna agencia del gobierno. Toda comunicacion es confidencial.'
                    : 'Your number is NEVER shared with ICE, law enforcement, or any government agency. All communication is confidential.'}
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#25D366]"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              {es
                ? 'Acepto recibir mensajes de información legal por WhatsApp de ezLegal.ai. Entiendo que esto NO es asesoria legal y puedo cancelar en cualquier momento respondiendo STOP.'
                : 'I agree to receive legal information messages via WhatsApp from ezLegal.ai. I understand this is NOT legal advice and I can unsubscribe anytime by replying STOP.'}
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !consent}
            className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold text-lg hover:bg-[#1DA851] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                {es ? 'Quiero Recibir Ayuda' : 'Get Help on WhatsApp'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            {es
              ? 'ezLegal.ai proporciona información legal, no asesoria legal. Consulte a un abogado para asesoramiento especifico.'
              : 'ezLegal.ai provides legal information, not legal advice. Consult an attorney for specific counsel.'}
          </p>
        </form>
      ) : (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#25D366]" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {es ? 'Recibimos tu solicitud' : 'We Got Your Request'}
          </h3>
          <p className="text-slate-600 mb-4">
            {es
              ? 'Un miembro de nuestro equipo bilingue te contactara por WhatsApp dentro de 24 horas.'
              : 'A member of our bilingual team will contact you via WhatsApp within 24 hours.'}
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
              {es ? 'Que esperar:' : 'What to expect:'}
            </p>
            {[
              { en: 'A WhatsApp message from our team', es: 'Un mensaje de WhatsApp de nuestro equipo' },
              { en: 'Free initial assessment of your situation', es: 'Evaluacion inicial gratuita de tu situación' },
              { en: 'Connection to a licensed attorney if needed', es: 'Conexion con un abogado licenciado si es necesario' },
            ].map(item => (
              <div key={item.en} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                {es ? item.es : item.en}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
