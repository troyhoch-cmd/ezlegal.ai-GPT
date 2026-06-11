import { useState, useId, useRef } from 'react';
import { Mail, ArrowRight, Check, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface InlineEmailCaptureProps {
  source: string;
  context?: string;
  label?: { en: string; es: string };
  variant?: 'light' | 'dark';
}

export default function InlineEmailCapture({ source, context, label, variant = 'light' }: InlineEmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { language } = useLanguage();

  const uid = useId();
  const emailId = `${uid}-email`;
  const errorId = `${uid}-error`;
  const emailRef = useRef<HTMLInputElement>(null);

  const defaultLabel = {
    en: 'Email me a sample plan',
    es: 'Enviar un plan de muestra',
  };
  const displayLabel = label || defaultLabel;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !consent) {
      if (!email.trim()) {
        setError(language === 'en' ? 'Please enter your email.' : 'Por favor ingresa tu correo.');
        emailRef.current?.focus();
      }
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError(language === 'en' ? 'Please enter a valid email address.' : 'Por favor ingresa un correo valido.');
      emailRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('email_captures')
        .insert({
          email: email.trim().toLowerCase(),
          source,
          page_url: window.location.pathname,
          user_agent: navigator.userAgent,
          metadata: { context, capture_type: 'inline_product', consent_marketing: false, consent_transactional: true }
        });

      if (insertError && insertError.code !== '23505') {
        throw insertError;
      }
      setIsSubmitted(true);
    } catch {
      setError(language === 'en' ? 'Something went wrong.' : 'Algo salio mal.');
      emailRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`rounded-xl p-4 ${variant === 'dark' ? 'bg-white/10' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center gap-2">
          <Check className={`w-5 h-5 ${variant === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
          <span className={`font-semibold text-sm ${variant === 'dark' ? 'text-white' : 'text-green-700'}`}>
            {language === 'en' ? 'Sent! Check your inbox.' : 'Enviado! Revisa tu bandeja.'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-4 ${variant === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-navy-50 border border-navy-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Mail className={`w-4 h-4 ${variant === 'dark' ? 'text-teal-300' : 'text-teal-600'}`} aria-hidden="true" />
        <label htmlFor={emailId} className={`font-semibold text-sm ${variant === 'dark' ? 'text-white' : 'text-navy-900'}`}>
          {displayLabel[language === 'en' ? 'en' : 'es']}
        </label>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-2">
        <div className="flex gap-2">
          <input
            ref={emailRef}
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
            placeholder={language === 'en' ? 'Your email' : 'Tu correo'}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            className="flex-1 px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-navy-900"
          />
          <button
            type="submit"
            disabled={isSubmitting || !email.trim() || !consent}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 disabled:bg-navy-300 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
          >
            {isSubmitting ? '...' : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded border-navy-300 text-teal-600 focus:ring-teal-500"
          />
          <span className={`text-xs leading-tight ${variant === 'dark' ? 'text-navy-200' : 'text-navy-500'}`}>
            {language === 'en'
              ? 'I agree to receive this content by email. No marketing emails.'
              : 'Acepto recibir este contenido por correo. Sin correos de marketing.'}
            {' '}
            <a href="/privacy-policy" className="text-teal-600 hover:underline">{language === 'en' ? 'Privacy Policy' : 'Privacidad'}</a>
          </span>
        </label>
        {error && <p id={errorId} role="alert" className="text-red-500 text-xs">{error}</p>}
        <div className="flex items-center gap-1.5">
          <Shield className={`w-3 h-3 ${variant === 'dark' ? 'text-navy-300' : 'text-navy-400'}`} aria-hidden="true" />
          <span className={`text-xs ${variant === 'dark' ? 'text-navy-300' : 'text-navy-400'}`}>
            {language === 'en' ? 'We respect your privacy. No spam, ever.' : 'Respetamos tu privacidad. Sin spam.'}
          </span>
        </div>
      </form>
    </div>
  );
}
