import { useState } from 'react';
import { MessageCircle, Smartphone, Link, Check, Heart, X, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { tenantManager } from '../lib/tenant-config';

interface ChatSharePromptProps {
  onDismiss?: () => void;
  messageCount?: number;
}

export default function ChatSharePrompt({ onDismiss, messageCount = 1 }: ChatSharePromptProps) {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [shared, setShared] = useState(false);
  const { language } = useLanguage();

  const isSpanish = language === 'es' || (typeof navigator !== 'undefined' && navigator.language.startsWith('es'));

  const shareUrl = tenantManager.getPageUrl('/chatbot');

  const shareMessage = isSpanish
    ? `Encontre ayuda legal gratuita en ezLegal.ai - me explico mis derechos en español simple. Quiza te ayude a ti o a tu familia: ${shareUrl}`
    : `I found free legal help at ezLegal.ai - it explained my rights in plain language. Maybe it can help you or your family: ${shareUrl}`;

  const trackShare = async (platform: string) => {
    try {
      await supabase.from('engagement_events').insert({
        event_type: 'chat_share_prompt',
        platform,
        url: shareUrl,
        language: isSpanish ? 'es' : 'en',
        context: 'post_chat_response',
        metadata: { message_count: messageCount }
      });
    } catch {
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    trackShare('whatsapp');
    setShared(true);
  };

  const handleSMS = () => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`sms:?&body=${encoded}`, '_blank');
    trackShare('sms');
    setShared(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackShare('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  if (shared) {
    return (
      <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-green-700">
          <Heart className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium">
            {isSpanish ? 'Gracias por compartir!' : 'Thank you for sharing!'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-green-200/60 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-800 mb-1">
            {isSpanish
              ? 'Te ayudo esto? Comparte con familia que lo necesite'
              : 'Did this help? Share with family who might need this'}
          </p>
          <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-500 flex-shrink-0" />
            {isSpanish
              ? 'Solo se comparte el enlace a ezLegal.ai, no el contenido de tu conversacion.'
              : 'Only shares a link to ezLegal.ai, not your conversation content.'}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1DA851] text-white text-xs font-semibold rounded-lg transition-all hover:scale-105 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              onClick={handleSMS}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-all hover:scale-105 shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5" />
              SMS
            </button>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:scale-105 shadow-sm ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
              {copied
                ? (isSpanish ? 'Copiado!' : 'Copied!')
                : (isSpanish ? 'Copiar' : 'Copy')}
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mt-1 -mr-1"
          aria-label={isSpanish ? 'Cerrar' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
