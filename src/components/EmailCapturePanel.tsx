import { useState } from 'react';
import { Mail, ArrowRight, Check, X, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface EmailCapturePanelProps {
  context: string;
  onDismiss: () => void;
}

export default function EmailCapturePanel({ context, onDismiss }: EmailCapturePanelProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('email_captures')
        .insert({
          email: email.trim().toLowerCase(),
          source: 'chat_response',
          page_url: window.location.pathname,
          user_agent: navigator.userAgent,
          metadata: { context, capture_type: 'post_response' }
        });

      if (insertError && insertError.code !== '23505') {
        throw insertError;
      }
      setIsSubmitted(true);
    } catch {
      setError(language === 'en' ? 'Something went wrong. Please try again.' : 'Algo salio mal. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-green-700">
          <Check className="w-5 h-5" />
          <span className="font-semibold text-sm">
            {language === 'en' ? 'Sent! Check your inbox.' : 'Enviado! Revisa tu bandeja.'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-gradient-to-r from-navy-50 to-teal-50 border border-navy-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-teal-600" />
          <span className="font-semibold text-navy-900 text-sm">
            {language === 'en' ? 'Send this to my email' : 'Enviar a mi correo'}
          </span>
        </div>
        <button onClick={onDismiss} className="text-navy-400 hover:text-navy-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={language === 'en' ? 'Your email address' : 'Tu correo electronico'}
          required
          className="flex-1 px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-navy-900"
        />
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 disabled:bg-navy-300 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
        >
          {isSubmitting ? '...' : <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      <div className="flex items-center gap-1.5 mt-2">
        <Shield className="w-3 h-3 text-navy-400" />
        <span className="text-navy-400 text-xs">
          {language === 'en' ? 'We respect your privacy. No spam, ever.' : 'Respetamos tu privacidad. Sin spam.'}
        </span>
      </div>
    </div>
  );
}
