import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Menu as MenuIcon, User, Video as LucideIcon } from 'lucide-react';
import { fetchBottomNavItems, NavItem } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  BookOpen,
  User,
};

interface Props {
  onOpenMenu: () => void;
}

export default function MobileBottomNav({ onOpenMenu }: Props) {
  const [items, setItems] = useState<NavItem[]>([]);
  const { language } = useLanguage();
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    fetchBottomNavItems().then(setItems);
  }, []);

  const hideOn = ['/chat', '/chatbot', '/ask'];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      aria-label={language === 'es' ? 'Navegación inferior' : 'Bottom navigation'}
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur border-t border-navy-200 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="flex items-stretch justify-around" role="list">
        {items.slice(0, 2).map((item) => {
          const Icon = ICONS[item.icon] ?? Sparkles;
          const label = language === 'es' ? item.label_es || item.label_en : item.label_en;
          return (
            <li key={item.id} className="flex-1">
              <NavLink
                to={item.route}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] text-[11px] font-medium transition-colors ${
                    isActive ? 'text-teal-600' : 'text-navy-500 hover:text-navy-800'
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          );
        })}
        <li className="flex-1">
          <NavLink
            to={user ? '/dashboard' : '/login'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] text-[11px] font-medium transition-colors ${
                isActive ? 'text-teal-600' : 'text-navy-500 hover:text-navy-800'
              }`
            }
          >
            <User className="h-5 w-5" aria-hidden="true" />
            <span>{language === 'es' ? 'Cuenta' : 'Account'}</span>
          </NavLink>
        </li>
        <li className="flex-1">
          <button
            onClick={onOpenMenu}
            className="w-full flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] text-[11px] font-medium text-navy-500 hover:text-navy-800 transition-colors"
            aria-haspopup="dialog"
          >
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
            <span>{language === 'es' ? 'Menú' : 'More'}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
