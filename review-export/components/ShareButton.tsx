import { useState, useEffect } from 'react';
import { Share2, MessageCircle, Facebook, Mail, Link, Check, X, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { tenantManager } from '../lib/tenant-config';

interface ShareButtonProps {
  url?: string;
  path?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'floating' | 'inline' | 'compact';
  context?: 'legal-help' | 'article' | 'resource' | 'general';
  showAfterScroll?: boolean;
  scrollThreshold?: number;
}

function resolveShareUrl(explicitUrl?: string, path?: string): string {
  if (explicitUrl) return explicitUrl;
  const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
  return tenantManager.getPageUrl(currentPath);
}

export default function ShareButton({
  url: explicitUrl,
  path,
  title = 'ezLegal.ai - Free Legal Help',
  description,
  variant = 'default',
  context = 'general',
  showAfterScroll = false,
  scrollThreshold = 400
}: ShareButtonProps) {
  const url = resolveShareUrl(explicitUrl, path);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(!showAfterScroll);
  const { language } = useLanguage();

  useEffect(() => {
    if (!showAfterScroll) return;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, scrollThreshold]);

  const isSpanish = language === 'es' || (typeof navigator !== 'undefined' && navigator.language.startsWith('es'));

  const messages = {
    'legal-help': {
      en: `I found this free legal help resource - ezLegal.ai explains legal questions in plain English with real citations. Maybe it can help you or someone you know: ${url}`,
      es: `Encontre este recurso de ayuda legal gratuita - ezLegal.ai explica preguntas legales en español simple con citas reales. Quiza te ayude a ti o a alguien que conozcas: ${url}`
    },
    'article': {
      en: `Check out this helpful legal article from ezLegal.ai: "${title}" - ${url}`,
      es: `Mira este articulo legal util de ezLegal.ai: "${title}" - ${url}`
    },
    'resource': {
      en: `This free legal resource might help - ${title}: ${url}`,
      es: `Este recurso legal gratuito podria ayudarte - ${title}: ${url}`
    },
    'general': {
      en: `I found something helpful on ezLegal.ai - free legal information explained simply: ${url}`,
      es: `Encontre algo util en ezLegal.ai - información legal gratuita explicada simplemente: ${url}`
    }
  };

  const getMessage = () => {
    const contextMessages = messages[context];
    return isSpanish ? contextMessages.es : contextMessages.en;
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#1DA851]',
      action: () => {
        const message = encodeURIComponent(getMessage());
        window.open(`https://wa.me/?text=${message}`, '_blank');
        trackShare('whatsapp');
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#0d65d9]',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(description || getMessage())}`, '_blank');
        trackShare('facebook');
      }
    },
    {
      name: 'SMS',
      icon: Mail,
      color: 'bg-slate-600 hover:bg-slate-700',
      action: () => {
        const message = encodeURIComponent(getMessage());
        window.open(`sms:?&body=${message}`, '_blank');
        trackShare('sms');
      }
    },
    {
      name: isSpanish ? 'Copiar enlace' : 'Copy Link',
      icon: copied ? Check : Link,
      color: copied ? 'bg-green-600' : 'bg-slate-500 hover:bg-slate-600',
      action: async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          trackShare('copy');
        } catch {
          const textArea = document.createElement('textarea');
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    }
  ];

  const trackShare = async (platform: string) => {
    try {
      await supabase.from('engagement_events').insert({
        event_type: 'share',
        platform,
        url,
        language: isSpanish ? 'es' : 'en',
        context
      });
    } catch {
    }
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[60] transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 mb-2 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 text-sm">
                {isSpanish ? 'Compartir con familia' : 'Share with family'}
              </span>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 flex items-start gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
              {isSpanish
                ? 'Comparte el enlace, no detalles sensibles de tu caso.'
                : 'Shares a link only. Do not include sensitive case details in messages.'}
            </p>
            <div className="space-y-2">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white font-medium transition-colors ${option.color}`}
                >
                  <option.icon className="w-5 h-5" />
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 animate-pulse"
          aria-label={isSpanish ? 'Compartir' : 'Share'}
          title={isSpanish ? 'Compartir con familia' : 'Share with family'}
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-primary-600 text-sm transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>{isSpanish ? 'Compartir' : 'Share'}</span>
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 min-w-[160px]">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => { option.action(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <option.icon className="w-4 h-4" />
                {option.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 mr-1">
          {isSpanish ? 'Compartir:' : 'Share:'}
        </span>
        {shareOptions.map((option) => (
          <button
            key={option.name}
            onClick={option.action}
            className={`w-9 h-9 rounded-full text-white flex items-center justify-center transition-all hover:scale-105 ${option.color}`}
            title={option.name}
          >
            <option.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-5 h-5 text-primary-600" />
        <span className="font-semibold text-slate-900">
          {isSpanish ? 'Compartir con familia y amigos' : 'Share with family & friends'}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-2">
        {isSpanish
          ? 'Ayuda a otros que puedan necesitar información legal gratuita.'
          : 'Help others who may need free legal information.'}
      </p>
      <p className="text-[11px] text-slate-500 mb-4 flex items-center gap-1">
        <ShieldAlert className="w-3 h-3 text-amber-500 flex-shrink-0" />
        {isSpanish
          ? 'Solo comparte el enlace. Nunca incluyas detalles personales de tu caso.'
          : 'Only shares a link. Never include personal case details in messages.'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {shareOptions.map((option) => (
          <button
            key={option.name}
            onClick={option.action}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium transition-all hover:scale-[1.02] ${option.color}`}
          >
            <option.icon className="w-5 h-5" />
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
}
