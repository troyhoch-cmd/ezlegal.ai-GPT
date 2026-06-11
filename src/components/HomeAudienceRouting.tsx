import { useNavigate } from 'react-router-dom';
import { User, Building2, Heart, Globe, Briefcase, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../services/analytics-service';

type Audience = 'individual' | 'spanish' | 'legal_aid' | 'business' | 'attorney';

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
    titleEn: 'Legal help made understandable',
    titleEs: 'Ayuda legal comprensible',
    bodyEn: 'Get plain-English help with eviction, debt, work, family safety, immigration, benefits, and more.',
    bodyEs: 'Recibe ayuda clara sobre desalojo, deudas, trabajo, seguridad familiar, inmigración, beneficios y más.',
    ctaEn: 'Start with a question',
    ctaEs: 'Comienza con una pregunta',
    href: '/chat',
  },
  {
    key: 'spanish',
    icon: Globe,
    titleEn: 'Ayuda legal en español',
    titleEs: 'Ayuda legal en español',
    bodyEn: 'Ayuda legal clara y segura para entender su problema y saber cómo empezar.',
    bodyEs: 'Ayuda legal clara y segura para entender su problema y saber cómo empezar.',
    ctaEn: 'Hacer una pregunta en español',
    ctaEs: 'Hacer una pregunta en español',
    href: '/es/chat',
  },
  {
    key: 'legal_aid',
    icon: Heart,
    titleEn: 'Reduce intake burden',
    titleEs: 'Reduzca la carga de admisión',
    bodyEn: 'Help people understand their issue, gather the right facts, and route them to the right next step.',
    bodyEs: 'Ayude a las personas a entender su problema, reunir los datos correctos y avanzar al siguiente paso.',
    ctaEn: 'Explore organization tools',
    ctaEs: 'Explora herramientas para organizaciones',
    href: '/for-organizations',
  },
  {
    key: 'business',
    icon: Building2,
    titleEn: 'A safe first step for employee legal issues',
    titleEs: 'Un primer paso seguro para problemas legales de empleados',
    bodyEn: 'Give employees practical guidance for everyday legal problems before they escalate.',
    bodyEs: 'Ofrece a los empleados orientación práctica antes de que los problemas legales escalen.',
    ctaEn: 'Explore employee support',
    ctaEs: 'Explore apoyo para empleados',
    href: '/for-business',
  },
  {
    key: 'attorney',
    icon: Briefcase,
    titleEn: 'Better-prepared potential clients',
    titleEs: 'Clientes potenciales mejor preparados',
    bodyEn: 'Receive issue summaries with jurisdiction context, facts gathered, and urgency signals.',
    bodyEs: 'Reciba resúmenes con contexto jurisdiccional, hechos reunidos y señales de urgencia.',
    ctaEn: 'Join attorney network',
    ctaEs: 'Únase a la red de abogados',
    href: '/for-partners',
  },
];

export default function HomeAudienceRouting() {
  const { language } = useLanguage();
  const en = language === 'en';
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelect = async (card: Card) => {
    trackEvent('icp_card_clicked', { icp: card.key, href: card.href });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
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
