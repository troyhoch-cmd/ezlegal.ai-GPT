import { Link } from 'react-router-dom';
import { Shield, Globe, Lock, Users, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function TrustAndScopeStrip() {
  const { language } = useLanguage();
  const en = language === 'en';

  const items = [
    {
      icon: Shield,
      en: 'Plain-language guidance',
      es: 'Orientación en lenguaje simple',
    },
    {
      icon: Globe,
      en: 'English / Español',
      es: 'English / Español',
    },
    {
      icon: Lock,
      en: 'Privacy-first design',
      es: 'Diseño con privacidad primero',
      href: '/privacy-at-a-glance',
    },
    {
      icon: Users,
      en: 'Human escalation when needed',
      es: 'Escalación humana cuando sea necesario',
    },
    {
      icon: AlertTriangle,
      en: 'Not a law firm — scope limits apply',
      es: 'No somos bufete — aplican límites de alcance',
      href: '/scope-disclaimers',
    },
  ];

  return (
    <section
      className="border-y border-slate-200 bg-slate-50 py-3"
      aria-label={en ? 'Trust and scope information' : 'Información de confianza y alcance'}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {items.map((item, i) => {
            const Icon = item.icon;
            const content = (
              <li key={i} className="inline-flex items-center gap-2 text-sm text-slate-600">
                <Icon className="w-4 h-4 text-teal-600 flex-shrink-0" aria-hidden="true" />
                {item.href ? (
                  <Link
                    to={item.href}
                    className="underline underline-offset-2 hover:text-teal-700 transition-colors"
                  >
                    {en ? item.en : item.es}
                  </Link>
                ) : (
                  <span>{en ? item.en : item.es}</span>
                )}
              </li>
            );
            return content;
          })}
        </ul>
      </div>
    </section>
  );
}
