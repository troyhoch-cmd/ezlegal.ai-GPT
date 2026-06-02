import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, AlertTriangle, CheckCircle, Briefcase, Users, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { type AudiencePath } from '../../data/audiencePaths';
import { homepageHero } from '../../data/homepageContent';
import { safetyCopy } from '../../data/safetyCopy';
import { heroTrustItems } from '../../data/trustSignals';
import { track } from '../../lib/gtm-analytics';
import { trackEvent } from '../../services/analytics-service';
import { trackCheckupStarted, trackPathSelected } from '../EthicalAnalytics';

interface HeroIntakeProps {
  currentPath: AudiencePath;
}

const icpCards: { id: AudiencePath; icon: typeof User; label: { en: string; es: string }; route: string; event: 'icp_individual_click' | 'icp_smb_click' | 'icp_legal_aid_click' }[] = [
  { id: 'legal-aid', icon: User, label: { en: 'Find free or low-cost legal help', es: 'Encontrar ayuda legal gratuita o de bajo costo' }, route: '/start?path=legal-aid', event: 'icp_individual_click' },
  { id: 'smb', icon: Briefcase, label: { en: 'View business legal tools', es: 'Ver herramientas legales para negocios' }, route: '/start?path=smb', event: 'icp_smb_click' },
  { id: 'organizations', icon: Users, label: { en: 'Request partner demo', es: 'Solicitar demo para socios' }, route: '/for-organizations', event: 'icp_legal_aid_click' },
];

const whatHappensNext = {
  steps: [
    { en: 'Tell us what happened', es: 'Cuéntanos qué pasó' },
    { en: 'Get plain-language options', es: 'Recibe opciones en lenguaje simple' },
    { en: 'Save, print, or find help', es: 'Guarda, imprime o busca ayuda' },
  ],
};

export function HeroIntake({ currentPath }: HeroIntakeProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [question, setQuestion] = useState('');
  const [focused, setFocused] = useState(false);
  const en = language === 'en';
  const h = homepageHero;

  function handleAsk() {
    const q = question.trim();
    if (q) {
      try { window.sessionStorage.setItem('ez_chatbot_prefill', q); } catch { /* */ }
      trackEvent('intake_text_entered', { length: q.length });
    }
    track('home_cta_clicked', { cta: 'ask_question' });
    trackEvent('hero_start_checkup_click', { path: currentPath });
    trackCheckupStarted(currentPath);
    navigate(`/start?path=${currentPath}`);
  }

  function handlePathClick(path: AudiencePath, route: string, event: typeof icpCards[number]['event']) {
    trackPathSelected(path);
    trackEvent(event, { route: path });
    navigate(route);
  }

  return (
    <section className="pt-2 sm:pt-6 pb-2 sm:pb-3" aria-labelledby="hero-heading">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Headline */}
        <h1 id="hero-heading" className="text-[22px] sm:text-3xl font-black tracking-tight text-slate-950 leading-[1.15]">
          {en ? h.headline.en : h.headline.es}
        </h1>
        <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-base text-slate-600 leading-snug">
          {en ? h.subline.en : h.subline.es}
        </p>
        <p className="mt-0.5 text-[11px] sm:text-xs text-slate-500">
          {en ? h.scopeLine.en : h.scopeLine.es}
        </p>

        {/* Spanish reassurance */}
        {!en && (
          <p className="mt-1 inline-flex items-center gap-1 rounded-lg bg-teal-50 border border-teal-100 px-2 py-0.5 text-[11px] font-medium text-teal-800">
            <CheckCircle className="w-3 h-3 text-teal-600 flex-shrink-0" aria-hidden="true" />
            {h.spanishReassurance}
          </p>
        )}

        {/* Input panel */}
        <div className="mt-2 sm:mt-3 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 p-2.5 sm:p-4">
          <label htmlFor="home-question" className="block text-[13px] sm:text-sm font-semibold text-slate-800 mb-0.5 sm:mb-1">
            {en ? h.inputLabel.en : h.inputLabel.es}
          </label>
          <textarea
            ref={inputRef}
            id="home-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            placeholder={en ? h.inputPlaceholder.en : h.inputPlaceholder.es}
            rows={2}
            aria-label={en ? h.inputAriaLabel.en : h.inputAriaLabel.es}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />

          {/* Sensitive-info warning -- visible on focus */}
          {focused && (
            <div className="mt-1.5 rounded-lg border border-amber-100 bg-amber-50/50 px-2.5 py-1.5 flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5 text-[10px] sm:text-[11px] text-amber-800 leading-snug">
                <p>{en ? safetyCopy.inputSafety.noSSN.en : safetyCopy.inputSafety.noSSN.es}</p>
                <p>{en ? safetyCopy.inputSafety.notAdvice.en : safetyCopy.inputSafety.notAdvice.es}</p>
              </div>
            </div>
          )}

          {/* Primary CTA -- min 44px tap target */}
          <button
            type="button"
            onClick={handleAsk}
            data-hero-primary-cta
            className="mt-2 sm:mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-6 py-3 min-h-[44px] text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            {en ? h.primaryCta.en : h.primaryCta.es}
          </button>

          {/* What happens next -- inline compact */}
          <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] sm:text-[11px] text-slate-500">
            {whatHappensNext.steps.map((step, i) => (
              <span key={i} className="inline-flex items-center gap-0.5 whitespace-nowrap">
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-600 flex-shrink-0">{i + 1}</span>
                <span>{en ? step.en : step.es}</span>
                {i < 2 && <span className="text-slate-300 ml-0.5" aria-hidden="true">&middot;</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Urgent help -- 44px tap target */}
        <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 justify-center min-h-[44px]">
          <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 flex-shrink-0" aria-hidden="true" />
          <Link
            to="/urgent-resources"
            onClick={() => trackEvent('inline_emergency_resources_click', { source: 'hero_mobile' })}
            aria-label={en ? 'View emergency and deadline resources' : 'Ver recursos de emergencia y plazos'}
            className="sm:hidden text-[11px] text-rose-700 font-semibold underline underline-offset-2 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded"
          >
            {en ? 'Urgent? View deadline resources' : '\u00bfUrgente? Recursos de plazos'}
          </Link>
          <p className="hidden sm:block text-xs text-slate-600">
            {en ? h.urgentPrompt.en : h.urgentPrompt.es}{' '}
            <Link
              to="/urgent-resources"
              onClick={() => trackEvent('inline_emergency_resources_click', { source: 'hero_desktop' })}
              className="text-rose-700 font-semibold underline underline-offset-2 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded"
            >
              {en ? h.urgentLink.en : h.urgentLink.es}
            </Link>
          </p>
        </div>

        {/* ICP path cards -- full-width stacked on mobile, grid on desktop */}
        <div className="mt-2 sm:mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {icpCards.map(({ id, icon: Icon, label, route, event }) => (
              <button
                key={id}
                type="button"
                onClick={() => handlePathClick(id, route, event)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 min-h-[52px] text-left hover:border-teal-300 hover:bg-teal-50/50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 group"
              >
                <Icon className="w-5 h-5 text-teal-700 flex-shrink-0 group-hover:text-teal-800" aria-hidden="true" />
                <span className="text-xs sm:text-xs font-medium text-slate-800 group-hover:text-teal-900">{en ? label.en : label.es}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trust signals -- first 3 on mobile (wrapping row), all on desktop */}
        <div className="mt-2 sm:mt-3 flex flex-wrap sm:flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-slate-500" aria-label={en ? 'Trust signals' : 'Se\u00f1ales de confianza'}>
          {heroTrustItems.map((item, idx) => (
            <span key={item.id} className={`inline-flex items-start gap-1 leading-tight${idx >= 3 ? ' hidden sm:inline-flex' : ''}`}>
              <CheckCircle className="w-3 h-3 text-teal-500 flex-shrink-0 mt-px" aria-hidden="true" />
              <span>{en ? item.text.en : item.text.es}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
