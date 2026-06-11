import { useNavigate } from 'react-router-dom';
import { User, Building2, Heart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Audience = 'individual' | 'business' | 'legal_aid';

interface Card {
  key: Audience;
  icon: typeof User;
  titleEn: string;
  titleEs: string;
  bodyEn: string;
  bodyEs: string;
  ctaEn: string;
  ctaEs: string;
  href: string;
}

const CARDS: Card[] = [
  {
    key: 'individual',
    icon: User,
    titleEn: 'Myself or my family',
    titleEs: 'Para mi o mi familia',
    bodyEn: 'Understand your issue and next steps in plain English or Spanish.',
    bodyEs: 'Entiende tu problema y los próximos pasos en inglés o español simple.',
    ctaEn: 'Ask a free question',
    ctaEs: 'Haz una pregunta gratis',
    href: '/chat',
  },
  {
    key: 'business',
    icon: Building2,
    titleEn: 'My business',
    titleEs: 'Mi negocio',
    bodyEn: 'Review contracts, employment, and compliance risk before you call counsel.',
    bodyEs: 'Revisa contratos, empleo y riesgos de cumplimiento antes de llamar a un abogado.',
    ctaEn: 'Get business clarity',
    ctaEs: 'Obtén claridad empresarial',
    href: '/pricing?audience=business',
  },
  {
    key: 'legal_aid',
    icon: Heart,
    titleEn: 'My legal-aid organization',
    titleEs: 'Mi organización de asistencia legal',
    bodyEn: 'Triage, summarize, and support clients safely with auditable workflows.',
    bodyEs: 'Filtra, resume y apoya a clientes de forma segura con flujos auditables.',
    ctaEn: 'Explore legal-aid tools',
    ctaEs: 'Explora herramientas de asistencia legal',
    href: '/pricing?audience=legal-aid',
  },
];

export default function HomeAudienceRouting() {
  const { language } = useLanguage();
  const en = language === 'en';
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelect = async (card: Card) => {
    try {
      await supabase.from('persona_intake_sessions').insert({
        user_id: user?.id ?? null,
        persona_type: card.key,
        intake_data: { source: 'home_audience_card', language: en ? 'en' : 'es' },
      });
    } catch {
      // analytics-only; never block navigation
    }
    navigate(card.href);
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
            {en ? 'What kind of help do you need?' : 'Qué tipo de ayuda necesitas?'}
          </h2>
          <p className="text-navy-500 text-sm sm:text-base">
            {en
              ? 'Pick the path that fits you. Each one leads somewhere useful in under a minute.'
              : 'Elige el camino que te corresponda. Cada uno te lleva a algo útil en menos de un minuto.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => handleSelect(card)}
                className="group text-left rounded-2xl border border-navy-200 hover:border-teal-500 bg-white p-5 sm:p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-teal-600 mb-4 group-hover:bg-teal-100 transition-colors">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-navy-900 mb-2">
                  {en ? card.titleEn : card.titleEs}
                </h3>
                <p className="text-sm text-navy-600 mb-4 leading-relaxed">
                  {en ? card.bodyEn : card.bodyEs}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 group-hover:text-teal-600">
                  {en ? card.ctaEn : card.ctaEs}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
