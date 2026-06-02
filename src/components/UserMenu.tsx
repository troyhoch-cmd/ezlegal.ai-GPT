import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogOut,
  User as UserIcon,
  Sparkles,
  CreditCard,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserAvatar from './UserAvatar';

export default function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const tier = profile?.subscription_tier ?? 'free';
  const isFree = tier === 'free' || tier === '';
  const t = (en: string, es: string) => (language === 'es' ? es : en);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    navigate('/');
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-navy-200 bg-white hover:border-teal-400 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('Account menu', 'Menu de cuenta')}
      >
        <UserAvatar
          avatarUrl={profile?.avatar_url}
          name={profile?.full_name}
          email={user.email}
          size="sm"
        />
        <ChevronDown
          className={`h-3.5 w-3.5 text-navy-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-xl border border-navy-200 bg-white shadow-2xl overflow-hidden z-[80]"
        >
          <div className="px-4 py-3 border-b border-navy-100 bg-navy-50">
            <p className="text-sm font-semibold text-navy-900 truncate">
              {profile?.full_name || t('Signed in', 'Conectado')}
            </p>
            <p className="text-xs text-navy-500 truncate">{user.email}</p>
            <p className="mt-2 text-xs text-navy-600">
              {t('Current plan:', 'Plan actual:')}{' '}
              <span className="font-semibold capitalize text-navy-900">
                {isFree ? t('Free', 'Gratis') : tier}
              </span>
            </p>
          </div>

          {isFree && (
            <Link
              to="/pricing"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-4 py-3 bg-gradient-to-r from-teal-50 via-teal-50 to-navy-50 hover:from-teal-100 hover:to-navy-100 border-b border-navy-100 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy-900">
                  {t('Upgrade to Pro', 'Actualiza a Pro')}
                </p>
                <p className="text-xs text-navy-600 mt-0.5">
                  {t(
                    'Unlimited chats, PDF exports, priority models',
                    'Chats ilimitados, PDF, modelos avanzados',
                  )}
                </p>
              </div>
            </Link>
          )}

          <div className="py-1">
            <Link
              to="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-navy-800 hover:bg-navy-50"
            >
              <UserIcon className="h-4 w-4 text-navy-500" />
              {t('Dashboard', 'Panel')}
            </Link>
            <Link
              to="/dashboard/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-navy-800 hover:bg-navy-50"
            >
              <UserIcon className="h-4 w-4 text-navy-500" />
              {t('Profile', 'Perfil')}
            </Link>
            <Link
              to="/dashboard/billing"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-navy-800 hover:bg-navy-50"
            >
              <CreditCard className="h-4 w-4 text-navy-500" />
              {t('Plans & billing', 'Planes y facturacion')}
            </Link>
            {profile?.is_admin && (
              <Link
                to="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-navy-800 hover:bg-navy-50"
              >
                <ShieldCheck className="h-4 w-4 text-navy-500" />
                {t('Admin', 'Admin')}
              </Link>
            )}
          </div>

          <button
            role="menuitem"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 border-t border-navy-100"
          >
            <LogOut className="h-4 w-4" />
            {t('Sign out', 'Cerrar sesion')}
          </button>
        </div>
      )}
    </div>
  );
}
