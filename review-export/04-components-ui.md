# ezLegal.ai Code Review - UI Components

> Navigation, layout, and shared interface components.

Generated: 2026-06-03T00:51:49.800Z
Files included: 18

---

## src/components/Navigation.tsx

```tsx
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronDown, ChevronRight, Globe, Shield, ShieldCheck, Handshake, MessageSquare, FileText, Users, Building2, Scale, CreditCard, Info, AlertTriangle, BookOpen, Sparkles, User, Search, Home, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useDemo } from '../contexts/DemoContext';
import { useChromePersona } from '../hooks/useChromePersona';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import TrustSafetyReportModal from './TrustSafetyReportModal';
import MobileBottomNav from './MobileBottomNav';
import { trackEngagement } from '../services/engagement-service';
import { trackEvent } from '../services/analytics-service';
import { fetchNavigation, consolidateNavGroups, NavGroup, NavItem } from '../lib/navigation';

const ICONS: Record<string, LucideIcon> = {
  Sparkles, Handshake, Scale, AlertTriangle, BookOpen, Users, ShieldCheck,
  FileText, User, Building2, CreditCard, Info, MessageSquare, Shield, Home, ChevronRight, ShoppingBag,
};

function iconFor(name: string): LucideIcon {
  return ICONS[name] ?? ChevronRight;
}

export default function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openDrawerSection, setOpenDrawerSection] = useState<string | null>(null);
  const [groups, setGroups] = useState<NavGroup[]>([]);
  const { user, profile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDemoMode } = useDemo();
  const chrome = useChromePersona();
  const showAuthLinks = !!user || isDemoMode;
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownTimer = useRef<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchNavigation().then((g) => setGroups(consolidateNavGroups(g)));
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setOpenDropdown(null);
    setOpenDrawerSection(null);
  }, [location.pathname]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      const firstFocusable = drawerRef.current?.querySelector('button, a') as HTMLElement;
      firstFocusable?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (drawerOpen) {
          setDrawerOpen(false);
          menuButtonRef.current?.focus();
        }
        setOpenDropdown(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [drawerOpen]);

  const isHomepage = location.pathname === '/';
  const visibleGroups = groups
    .filter((g) => g.audiences.length === 0 || g.audiences.includes(chrome.persona))
    .filter((g) => !(isHomepage && g.slug === 'pricing'))
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => item.audiences.length === 0 || item.audiences.includes(chrome.persona)),
    }))
    .filter((g) => g.items.length > 0);

  const labelOf = (n: { label_en: string; label_es: string }) =>
    language === 'es' && n.label_es ? n.label_es : n.label_en;
  const descOf = (n: NavItem) =>
    language === 'es' && n.description_es ? n.description_es : n.description_en;

  const openDropdownHandler = (slug: string) => {
    if (dropdownTimer.current) window.clearTimeout(dropdownTimer.current);
    setOpenDropdown(slug);
  };
  const closeDropdownHandler = () => {
    if (dropdownTimer.current) window.clearTimeout(dropdownTimer.current);
    dropdownTimer.current = window.setTimeout(() => setOpenDropdown(null), 120);
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-navy-900 focus:underline focus:ring-2 focus:ring-teal-500"
      >
        {t('a11y.skipToMain')}
      </a>

      <header
        role="banner"
        aria-label={language === 'en' ? 'Site header' : 'Encabezado del sitio'}
        className={`fixed left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl border-b border-navy-200 shadow-sm ${isDemoMode ? 'top-10' : 'top-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link
              to="/"
              className="flex items-center flex-shrink-0 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded"
              aria-label={language === 'es' ? 'ezLegal.ai - Inicio' : 'ezLegal.ai - Home'}
            >
              <img
                src="/red-and-grey-minamali-business-card-2-1-2.svg"
                alt="ezLegal.ai"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </Link>

            <nav
              aria-label={language === 'en' ? 'Primary' : 'Principal'}
              className="hidden lg:flex items-center gap-1 flex-1 justify-center"
            >
              {visibleGroups.map((group) => {
                const primary = group.items.find((i) => i.is_primary) ?? group.items[0];
                if (!primary) return null;
                const hasSubmenu = group.items.length > 1;
                const isOpen = openDropdown === group.slug;
                if (!hasSubmenu) {
                  return (
                    <NavLink
                      key={group.id}
                      to={primary.route}
                      end
                      className={({ isActive }) =>
                        `px-3 py-2 text-sm font-medium rounded-md no-underline transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          isActive ? 'text-teal-700 bg-teal-50' : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
                        }`
                      }
                    >
                      {labelOf(group)}
                    </NavLink>
                  );
                }
                return (
                  <div
                    key={group.id}
                    className="relative"
                    onMouseEnter={() => openDropdownHandler(group.slug)}
                    onMouseLeave={closeDropdownHandler}
                  >
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : group.slug)}
                      className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        isOpen ? 'text-teal-700 bg-teal-50' : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
                      }`}
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                    >
                      {labelOf(group)}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {isOpen && (
                      <div
                        role="menu"
                        className="absolute left-0 top-full mt-1 w-80 bg-white border border-navy-200 rounded-xl shadow-xl p-2 z-[70]"
                        onMouseEnter={() => openDropdownHandler(group.slug)}
                        onMouseLeave={closeDropdownHandler}
                      >
                        {group.items.slice(0, 7).map((item) => {
                          const Icon = iconFor(item.icon);
                          const isActive = location.pathname === item.route;
                          return (
                            <Link
                              key={item.id}
                              to={item.route}
                              role="menuitem"
                              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-teal-50 text-teal-700'
                                  : item.highlight
                                  ? 'hover:bg-warning-50 text-warning-700'
                                  : 'hover:bg-navy-50 text-navy-700'
                              }`}
                            >
                              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${item.highlight ? 'text-warning-600' : 'text-teal-600'}`} aria-hidden="true" />
                              <span>
                                <span className="block font-semibold text-sm">{labelOf(item)}</span>
                                {descOf(item) && (
                                  <span className={`block text-xs mt-0.5 ${item.highlight ? 'text-warning-600' : 'text-navy-500'}`}>
                                    {descOf(item)}
                                  </span>
                                )}
                              </span>
                            </Link>
                          );
                        })}
                        {group.items.length > 7 && (
                          <Link
                            to={primary.route}
                            role="menuitem"
                            className="flex items-center justify-center gap-1 p-3 mt-1 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border-t border-navy-100"
                          >
                            {language === 'es' ? 'Ver todo' : 'See all'}
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {location.pathname !== '/' && (
                <Link
                  to="/ask"
                  className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 text-sm text-navy-500 bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[180px]"
                  aria-label={language === 'es' ? 'Buscar' : 'Search'}
                >
                  <Search className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{language === 'es' ? 'Buscar temas...' : 'Search topics...'}</span>
                </Link>
              )}

              {/* Prominent EN | ES toggle - visible on all viewports */}
              <button
                type="button"
                onClick={() => { const next = language === 'en' ? 'es' : 'en'; setLanguage(next); trackEvent(next === 'es' ? 'language_toggle_es' : 'language_toggle_en', {}); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-full border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              >
                <Globe className="h-4 w-4 text-teal-600" aria-hidden="true" />
                <span className={language === 'es' ? 'text-teal-400' : 'font-extrabold text-teal-700'}>EN</span>
                <span className="text-teal-300">|</span>
                <span className={language === 'en' ? 'text-teal-400' : 'font-extrabold text-teal-700'}>ES</span>
              </button>
              <ThemeToggle className="hidden md:block" />
              <Link
                to="/checkout"
                className="hidden sm:inline-flex items-center justify-center p-2 text-navy-500 hover:text-navy-800 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 relative"
                aria-label={language === 'es' ? 'Carrito' : 'Cart'}
              >
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                to="/start"
                onClick={() => { trackEngagement({ featureName: 'nav_start_checkup', engagementType: 'click', metadata: { page: location.pathname } }); }}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {language === 'es' ? 'Comenzar revisión gratis de 2 minutos' : 'Start free 2-minute checkup'}
              </Link>

              {user ? (
                <UserMenu />
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-navy-700 hover:text-navy-900 no-underline transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {t('nav.signIn')}
                </Link>
              )}

              <button
                ref={menuButtonRef}
                onClick={() => {
                  const newState = !drawerOpen;
                  setDrawerOpen(newState);
                  if (newState) {
                    trackEngagement({
                      featureName: 'homepage_menu_open',
                      engagementType: 'click',
                      metadata: { page: location.pathname, timestamp: new Date().toISOString() },
                    });
                  }
                }}
                className="lg:hidden p-2 text-navy-500 hover:text-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-lg"
                aria-expanded={drawerOpen}
                aria-controls="nav-drawer"
                aria-label={drawerOpen ? (language === 'en' ? 'Close menu' : 'Cerrar menu') : (language === 'en' ? 'Open menu' : 'Abrir menu')}
              >
                {drawerOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <MenuIcon className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div
          className="fixed inset-0 bg-navy-900/50 z-[45]"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        id="nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={language === 'en' ? 'Navigation menu' : 'Menu de navegacion'}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 ease-out shadow-2xl ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-navy-100">
            <span className="font-bold text-navy-900">{language === 'en' ? 'Menu' : 'Menu'}</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label={language === 'en' ? 'Close menu' : 'Cerrar menu'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 py-3 border-b border-navy-100">
            <Link
              to="/search"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2.5 bg-navy-50 hover:bg-navy-100 text-navy-600 rounded-lg transition-colors"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">{language === 'es' ? 'Buscar guias, temas…' : 'Search guides, topics…'}</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2" role="navigation" aria-label={language === 'en' ? 'Main navigation' : 'Navegacion principal'}>
              {visibleGroups.map((section) => {
                const hasMultiple = section.items.length > 1;
                const isExpanded = openDrawerSection === section.slug;
                if (!hasMultiple) {
                  const item = section.items[0];
                  const Icon = iconFor(item.icon);
                  return (
                    <Link
                      key={section.id}
                      to={item.route}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        location.pathname === item.route ? 'bg-teal-50 text-teal-700' : 'hover:bg-navy-50 text-navy-700'
                      }`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0 text-teal-600" aria-hidden="true" />
                      <span className="font-semibold text-sm">{labelOf(section)}</span>
                    </Link>
                  );
                }
                return (
                  <div key={section.id} className="rounded-lg border border-navy-100 overflow-hidden">
                    <button
                      onClick={() => setOpenDrawerSection(isExpanded ? null : section.slug)}
                      className="w-full flex items-center justify-between px-3 py-3 text-left hover:bg-navy-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                      aria-expanded={isExpanded}
                    >
                      <span className="font-semibold text-sm text-navy-800">{labelOf(section)}</span>
                      <ChevronDown className={`h-4 w-4 text-navy-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    <div
                      className={`transition-all duration-200 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <ul className="px-2 pb-2 space-y-0.5" role="list">
                        {section.items.map((item) => {
                          const Icon = iconFor(item.icon);
                          const isActive = location.pathname === item.route;
                          return (
                            <li key={item.id}>
                              <Link
                                to={item.route}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                  isActive
                                    ? 'bg-teal-50 text-teal-700'
                                    : item.highlight
                                    ? 'bg-warning-50 hover:bg-warning-100 text-warning-700'
                                    : 'hover:bg-navy-50 text-navy-700'
                                }`}
                                onClick={() => setDrawerOpen(false)}
                              >
                                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-teal-600' : item.highlight ? 'text-warning-600' : 'text-teal-600'}`} aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">{labelOf(item)}</div>
                                  {descOf(item) && (
                                    <div className={`text-xs mt-0.5 ${item.highlight ? 'text-warning-600' : 'text-navy-400'}`}>{descOf(item)}</div>
                                  )}
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-navy-100 space-y-3 bg-navy-50">
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-navy-700 hover:bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Globe className="h-5 w-5 text-teal-600" aria-hidden="true" />
              <span className="font-medium text-sm">{language === 'en' ? 'Cambiar a Español' : 'Switch to English'}</span>
            </button>

            {showAuthLinks && (profile?.is_admin || isDemoMode) && (
              <Link
                to="/admin"
                className="flex items-center gap-3 w-full px-3 py-2.5 text-warning-700 hover:bg-warning-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-warning-500"
                onClick={() => setDrawerOpen(false)}
              >
                <Shield className="h-5 w-5 text-warning-600" aria-hidden="true" />
                <span className="font-medium text-sm">{t('nav.adminDashboard')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav onOpenMenu={() => setDrawerOpen(true)} />

      <TrustSafetyReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </>
  );
}

```

---

## src/components/Layout.tsx

```tsx
import { useState } from 'react';
import { useLocation, Outlet, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Menu } from 'lucide-react';
import { useDemo } from '../contexts/DemoContext';
import { useLanguage } from '../contexts/LanguageContext';
import Footer from './Footer';
import CollapsibleSidebar from './cognitive-load/CollapsibleSidebar';
import UserMenu from './UserMenu';
import LocalePicker from './LocalePicker';
import ThemeToggle from './ThemeToggle';
import MobileBottomNav from './MobileBottomNav';
import MobileDrawer from './MobileDrawer';
import RouteDisclaimerBanner from './RouteDisclaimerBanner';
import LanguageContinuityGuard from './LanguageContinuityGuard';
import { useChromePersona } from '../hooks/useChromePersona';
import { useLayoutPreferences } from '../hooks/useLayoutPreferences';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDemoMode } = useDemo();
  const { language } = useLanguage();
  const chrome = useChromePersona();
  const { prefs: layoutPrefs } = useLayoutPreferences();
  const { isDesktop } = useBreakpoint();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNewChat = () => {
    setMobileNavOpen(false);
    navigate('/chat');
  };

  const isHomePage = location.pathname === '/chatbot';
  const showSidebar = chrome.showSidebar && !layoutPrefs.hide_sidebar;

  return (
    <div
      className={`bg-slate-50 flex flex-col ${
        isHomePage ? 'h-dvh overflow-hidden' : 'min-h-dvh'
      }`}
    >
      <div className={`flex flex-1 min-h-0 ${isHomePage ? 'overflow-hidden' : ''}`}>
        {showSidebar && isDesktop && <CollapsibleSidebar onNewChat={handleNewChat} />}

        {showSidebar && !isDesktop && (
          <MobileDrawer
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            title="ezLegal.ai"
            labelledById="mobile-nav-title"
          >
            <CollapsibleSidebar onNewChat={handleNewChat} className="w-full border-r-0" />
          </MobileDrawer>
        )}

        <div
          className={`flex-1 flex flex-col min-w-0 ${isHomePage ? 'overflow-hidden' : ''}`}
        >
          <header
            role="banner"
            aria-label={language === 'es' ? 'Encabezado del panel' : 'Dashboard header'}
            className={`sticky ${
              isDemoMode ? 'top-10' : 'top-0'
            } z-40 bg-white/95 backdrop-blur-xl border-b border-navy-200 shadow-sm`}
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
              {showSidebar && !isDesktop && (
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label={language === 'es' ? 'Abrir menu' : 'Open menu'}
                  className="touch-target tap-highlight-none flex items-center justify-center -ml-2 rounded-lg text-navy-700 hover:bg-navy-100"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
              )}

              <Link
                to="/dashboard"
                className="flex items-center gap-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded"
                aria-label={language === 'es' ? 'Panel' : 'Dashboard'}
              >
                <img
                  src="/red-and-grey-minamali-business-card-2-1-2.svg"
                  alt="ezLegal.ai"
                  width={120}
                  height={36}
                  className="h-8 sm:h-9 w-auto"
                />
              </Link>

              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                <LocalePicker className="hidden md:block" />
                <ThemeToggle className="hidden md:block" />
                <Link
                  to="/chat"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {language === 'es' ? 'Preguntar' : 'Ask'}
                </Link>
                <UserMenu />
              </div>
            </div>
          </header>

          <LanguageContinuityGuard />
          <RouteDisclaimerBanner />

          <main
            id="main-content"
            tabIndex={-1}
            aria-label="Main content"
            className={
              isHomePage
                ? 'flex-1 overflow-hidden focus:outline-none pb-[calc(env(safe-area-inset-bottom,0px))]'
                : 'flex-1 focus:outline-none pb-16 lg:pb-0'
            }
          >
            <Outlet />
          </main>

          {!isHomePage && <Footer />}
        </div>
      </div>

      <MobileBottomNav onOpenMenu={() => setMobileNavOpen(true)} />
    </div>
  );
}

```

---

## src/components/Footer.tsx

```tsx
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, FileText, AlertCircle, Phone, Scale, Heart, Flag, Building2, Brain, ClipboardCheck, Handshake, Share2, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import NAPBlock from './NAPBlock';

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer
      role="contentinfo"
      aria-label={language === 'en' ? 'Site footer' : 'Pie de página'}
      className="bg-navy-900 text-white py-16 border-t border-navy-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-6 mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">{t('footer.legalNotice')}</h4>
              <p className="text-navy-100 text-sm leading-relaxed">
                <strong className="text-white">{t('footer.notLawFirm')}</strong> {t('footer.legalNoticeText')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/emergency-resources" className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors font-semibold">
              <Phone className="w-4 h-4" />
              {t('footer.crisisResources')}
            </Link>
            <Link to="/pro-bono" className="inline-flex items-center gap-1.5 text-success-400 hover:text-success-300 transition-colors font-semibold">
              <Heart className="w-4 h-4" />
              {t('footer.freeLegalAid')}
            </Link>
            <Link to="/find-attorney" className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 transition-colors font-semibold">
              <Scale className="w-4 h-4" />
              {t('footer.findAttorney')}
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div>
            <img
              src="/red-and-grey-minamali-business-card-2-1-2.svg"
              alt="ezLegal.ai"
              className="h-12 w-auto bg-white px-3 py-1 rounded mb-3"
            />
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] text-navy-300 font-medium uppercase tracking-wider">{t('footer.poweredBy')}</span>
              <span className="text-sm font-bold">
                <span className="text-navy-300">Legalbre</span><span className="text-teal-400">ez</span><span className="text-navy-300">e</span><sup className="text-[7px] text-navy-400">TM</sup>
              </span>
            </div>
            <NAPBlock variant="stacked" className="text-navy-200 [&_a]:text-navy-200 [&_a:hover]:text-gold-400 [&_svg]:text-teal-400" />
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2 text-navy-200">
              <li><Link to="/features" className="hover:text-gold-400 transition-colors">{t('nav.features')}</Link></li>
              <li><Link to="/pricing" className="hover:text-gold-400 transition-colors">{t('nav.pricing')}</Link></li>
              <li><Link to="/ezreads" className="hover:text-gold-400 transition-colors">{t('nav.legalGuides')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-navy-200">
              <li><Link to="/about" className="hover:text-gold-400 transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/for-organizations" className="hover:text-gold-400 transition-colors">{t('footer.forOrganizations')}</Link></li>
              <li><Link to="/partner-hub" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Handshake className="w-3 h-3" />{t('nav.partnerProgram')}</Link></li>
              <li><Link to="/media-kit" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Share2 className="w-3 h-3" />{language === 'es' ? 'Kit de Medios' : 'Media Kit'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">{t('nav.trustSafety')}</h4>
            <ul className="space-y-2 text-navy-200">
              <li><Link to="/trust-center" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" />{t('footer.trustCenter')}</Link></li>
              <li><Link to="/how-it-works" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Brain className="w-3 h-3" />{t('nav.howAiWorks')}</Link></li>
              <li><Link to="/privacy" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Lock className="w-3 h-3" />{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><FileText className="w-3 h-3" />{t('footer.terms')}</Link></li>
              <li><Link to="/privacy#cookies" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><FileText className="w-3 h-3" />{language === 'es' ? 'Preferencias de Cookies' : 'Cookie Preferences'}</Link></li>
              <li><Link to="/ai-governance" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" />{t('nav.aiGovernance')}</Link></li>
              <li><Link to="/enterprise-security" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Building2 className="w-3 h-3" />{t('footer.enterpriseSecurity')}</Link></li>
              <li><Link to="/sla" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Clock className="w-3 h-3" />SLA & Uptime</Link></li>
              <li><Link to="/trust-center#report" className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-red-400"><Flag className="w-3 h-3" />{t('footer.reportConcern')}</Link></li>
              <li><Link to="/how-reports-are-reviewed" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><ClipboardCheck className="w-3 h-3" />{t('footer.howReportsReviewed')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">{t('nav.getHelp')}</h4>
            <ul className="space-y-2 text-navy-200">
              <li><Link to="/ask" className="hover:text-gold-400 transition-colors">{language === 'es' ? 'Hacer una Pregunta' : 'Ask a Question'}</Link></li>
              <li><Link to="/scope-disclaimers" className="hover:text-gold-400 transition-colors">{language === 'es' ? 'Alcance y Limitaciones' : 'What We Can Help With'}</Link></li>
              <li><Link to="/accessibility" className="hover:text-gold-400 transition-colors">{language === 'es' ? 'Accesibilidad' : 'Accessibility'}</Link></li>
            </ul>
          </div>
        </div>

        <div className="bg-navy-800/30 border border-navy-700 rounded-lg p-4 mb-8">
          <h5 className="font-semibold text-white mb-2 text-sm">{t('footer.aboutAiData')}</h5>
          <ul className="text-navy-200 text-xs space-y-1">
            <li>{t('footer.dataNotUsed')}</li>
            <li>{t('footer.encrypted')}</li>
            <li>{t('footer.deleteData')}</li>
            <li>{t('footer.ccpaCompliant')}</li>
            <li>{t('footer.aiCitations')}</li>
          </ul>
        </div>

        <div className="bg-navy-800/30 border border-navy-700 rounded-lg p-4 mb-8">
          <h5 className="font-semibold text-white mb-2 text-sm">{t('footer.legalFreshness')}</h5>
          <div className="text-navy-200 text-xs space-y-1.5">
            <p><strong className="text-white">{t('footer.citationDatabase')}:</strong> {t('footer.citationUpdated')}</p>
            <p><strong className="text-white">{t('footer.courtInfo')}:</strong> {t('footer.courtUpdated')}</p>
            <p><strong className="text-white">{t('footer.verificationCycle')}:</strong> {t('footer.verificationText')}</p>
            <p><strong className="text-white">{t('footer.lastUpdate')}:</strong> {t('footer.lastUpdateDate')}</p>
            <p className="text-navy-300 italic mt-2">{t('footer.lawsVary')}</p>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-800 text-center text-navy-300 text-sm space-y-3">
          <p>&copy; 2026 ezLegal.ai<sup className="text-[8px]">TM</sup>, a <span className="text-navy-200">Legalbre</span><span className="text-teal-400">ez</span><span className="text-navy-200">e</span><sup className="text-[8px]">TM</sup> company. {t('footer.copyright')}</p>
          <p className="text-xs max-w-3xl mx-auto text-navy-200" data-testid="legal-disclaimer">
            {t('footer.commitmentText')}
          </p>
          <div className="pt-3 border-t border-navy-800/50">
            <p className="text-[11px] text-navy-300 font-medium tracking-wide">
              {t('footer.patentPending')}
            </p>
            <p className="text-[10px] text-navy-300 mt-1 max-w-xl mx-auto">
              {t('footer.patentText')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

```

---

## src/components/MobileBottomNav.tsx

```tsx
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Menu as MenuIcon, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
      aria-label={language === 'es' ? 'Navegacion inferior' : 'Bottom navigation'}
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
            <span>{language === 'es' ? 'Menu' : 'More'}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

```

---

## src/components/MobileDrawer.tsx

```tsx
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right' | 'bottom';
  children: React.ReactNode;
  widthClass?: string;
  labelledById?: string;
}

export default function MobileDrawer({
  open,
  onClose,
  title,
  side = 'left',
  children,
  widthClass = 'w-[85vw] max-w-sm',
  labelledById,
}: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      previousFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const sideClasses =
    side === 'left'
      ? `left-0 top-0 bottom-0 ${widthClass} translate-x-0`
      : side === 'right'
      ? `right-0 top-0 bottom-0 ${widthClass} translate-x-0`
      : `left-0 right-0 bottom-0 max-h-[85vh] rounded-t-2xl`;

  const enterAnim =
    side === 'bottom'
      ? 'animate-[slide-up_240ms_ease-out]'
      : side === 'right'
      ? 'animate-[slide-in-right_240ms_ease-out]'
      : 'animate-[slide-in-left_240ms_ease-out]';

  return (
    <div
      className="fixed inset-0 z-[60] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledById}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fade-in_180ms_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`absolute ${sideClasses} bg-white shadow-2xl flex flex-col outline-none ${enterAnim}`}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
            <h2 id={labelledById} className="text-base font-semibold text-slate-900">
              {title ?? ''}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 -m-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}

```

---

## src/components/UserMenu.tsx

```tsx
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

```

---

## src/components/ErrorBoundary.tsx

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logError } from '../lib/error-handler';

interface Props {
  children: ReactNode;
  fallback?: (err: Error, reset: () => void) => ReactNode;
  scope?: string;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void logError(error, {
      category: 'render',
      severity: 'fatal',
      context: { componentStack: info.componentStack, scope: this.props.scope },
    });
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-[60vh] flex items-center justify-center p-6"
        style={{ backgroundColor: 'var(--surface-page)', color: 'var(--text-primary)' }}
      >
        <div className="max-w-md w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-md)] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong on this page</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            We logged the problem and the team is notified. You can try again, or head back to the home page.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={this.reset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-teal)] hover:bg-[var(--accent-teal-hover)] text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--surface-muted)] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

```

---

## src/components/Breadcrumbs.tsx

```tsx
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { resolveBreadcrumbs } from '../lib/route-meta';

interface BreadcrumbsProps {
  className?: string;
  pathname?: string;
}

export default function Breadcrumbs({ className = '', pathname }: BreadcrumbsProps) {
  const location = useLocation();
  const { language } = useLanguage();
  const path = pathname ?? location.pathname;

  if (path === '/') return null;

  const crumbs = resolveBreadcrumbs(path).filter((c) => c.path !== '/');
  if (crumbs.length === 0) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const homeLabel = language === 'es' ? 'Inicio' : 'Home';

  const itemListElement = [
    { '@type': 'ListItem', position: 1, name: homeLabel, item: `${origin}/` },
    ...crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: language === 'es' ? c.label.es : c.label.en,
      item: `${origin}${c.path}`,
    })),
  ];
  const jsonLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement };

  return (
    <nav
      aria-label={language === 'es' ? 'Migas de pan' : 'Breadcrumb'}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 ${className}`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex items-center flex-wrap gap-1 text-sm text-navy-500" role="list">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-teal-600 transition-colors">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">{homeLabel}</span>
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          const text = language === 'es' ? c.label.es : c.label.en;
          return (
            <li key={c.path} className="inline-flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-navy-300" aria-hidden="true" />
              {isLast ? (
                <span aria-current="page" className="font-semibold text-navy-800">
                  {text}
                </span>
              ) : (
                <Link to={c.path} className="hover:text-teal-600 transition-colors">
                  {text}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

```

---

## src/components/LocalePicker.tsx

```tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../lib/i18n';

interface LocalePickerProps {
  className?: string;
  align?: 'left' | 'right';
}

export default function LocalePicker({ className = '', align = 'right' }: LocalePickerProps) {
  const { language, setLanguage, supportedLocales, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((code: string) => {
    setLanguage(code as Language);
    setOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [setLanguage]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = supportedLocales.find((l) => l.code === language) ?? supportedLocales[0];
  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={ref} className={`relative ${className}`} dir={dir}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={language === 'es' ? 'Cambiar idioma' : 'Switch language'}
        data-testid="language-toggle"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors text-sm"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="font-medium whitespace-nowrap" dir={current.dir}>
          {current.nativeLabel}
        </span>
      </button>
      {saved && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-teal-700 whitespace-nowrap bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shadow-sm z-50" role="status" aria-live="polite">
          {language === 'es' ? 'Idioma guardado' : 'Language saved'}
        </span>
      )}
      {open && (
        <ul
          role="listbox"
          aria-label="Choose language"
          className={`absolute ${alignClass} mt-2 w-52 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-lg py-1 z-50`}
        >
          {supportedLocales.map((loc) => {
            const selected = loc.code === language;
            return (
              <li key={loc.code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(loc.code)}
                  dir={loc.dir}
                  className={`flex items-center justify-between w-full gap-2 px-3 py-2 text-sm text-start transition-colors focus:outline-none focus:bg-[var(--surface-muted)] ${
                    selected
                      ? 'bg-[var(--surface-muted)] text-[var(--text-primary)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className="flex flex-col items-start">
                    <span>{loc.nativeLabel}</span>
                    <span className="text-xs text-[var(--text-muted)]">{loc.label}</span>
                  </span>
                  {selected && <Check className="w-4 h-4 text-[var(--accent-teal)]" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

```

---

## src/components/ThemeToggle.tsx

```tsx
import { useEffect, useRef, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '../hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';

interface ThemeToggleProps {
  variant?: 'button' | 'menu';
  className?: string;
}

const LABELS = {
  en: { theme: 'Theme', system: 'System', light: 'Light', dark: 'Dark', switchTo: 'Switch to' },
  es: { theme: 'Tema', system: 'Sistema', light: 'Claro', dark: 'Oscuro', switchTo: 'Cambiar a' },
};

export default function ThemeToggle({ variant = 'menu', className = '' }: ThemeToggleProps) {
  const { mode, resolved, setTheme, toggle } = useTheme();
  const { language } = useLanguage();
  const L = LABELS[language === 'es' ? 'es' : 'en'];
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const nextLabel = resolved === 'dark' ? L.light : L.dark;

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={`${L.switchTo} ${nextLabel}`}
        title={`${L.switchTo} ${nextLabel}`}
        className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors ${className}`}
      >
        {resolved === 'dark' ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
      </button>
    );
  }

  const options: Array<{ value: ThemeMode; icon: typeof Sun; label: string }> = [
    { value: 'system', icon: Monitor, label: L.system },
    { value: 'light', icon: Sun, label: L.light },
    { value: 'dark', icon: Moon, label: L.dark },
  ];

  const ActiveIcon = mode === 'system' ? Monitor : mode === 'dark' ? Moon : Sun;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${L.theme}: ${options.find((o) => o.value === mode)?.label}`}
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors"
      >
        <ActiveIcon className="w-5 h-5" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={L.theme}
          className="absolute right-0 mt-2 w-40 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-lg py-1 z-50"
        >
          {options.map(({ value, icon: Icon, label }) => {
            const selected = value === mode;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors focus:outline-none focus:bg-[var(--surface-muted)] ${
                  selected
                    ? 'bg-[var(--surface-muted)] text-[var(--text-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

```

---

## src/components/SkipLink.tsx

```tsx
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-navy-900 focus:text-white focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

```

---

## src/components/home/index.ts

```typescript
export { UrgentStrip } from './UrgentStrip';
export { HeroIntake } from './HeroIntake';
export { HomeShell } from './HomeShell';
export { SituationExplorer } from './SituationExplorer';
export { ICPRouteSelector } from './ICPRouteSelector';
export { TrustProofStrip } from './TrustProofStrip';
export { SMBConversionSection } from './SMBConversionSection';
export { LegalAidPartnerSection } from './LegalAidPartnerSection';
export { BilingualParityNotice } from './BilingualParityNotice';
export { SafetyNotice } from './SafetyNotice';
export { FinalCTA } from './FinalCTA';
export { MobileStickyBar } from './MobileStickyBar';

```

---

## src/components/home/HomeShell.tsx

```tsx
import { ReactNode } from 'react';
import Navigation from '../Navigation';
import Footer from '../Footer';
import { MobileStickyBar } from './MobileStickyBar';

interface HomeShellProps {
  children: ReactNode;
}

export function HomeShell({ children }: HomeShellProps) {
  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-950">
      <Navigation />
      <main id="main-content" className="pt-16 pb-16 sm:pb-0">
        {children}
      </main>
      <MobileStickyBar />
      <Footer />
    </div>
  );
}

```

---

## src/components/home/HeroIntake.tsx

```tsx
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

```

---

## src/components/home/SituationExplorer.tsx

```tsx
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEvent } from '../../services/analytics-service';

interface SituationItem {
  label: { en: string; es: string };
  href: string;
}

const situations: SituationItem[] = [
  { label: { en: 'Eviction or housing', es: 'Desalojo o vivienda' }, href: '/start?path=legal-aid' },
  { label: { en: 'Debt or collections', es: 'Deuda o cobranzas' }, href: '/start?path=legal-aid' },
  { label: { en: 'Family or safety', es: 'Familia o seguridad' }, href: '/start?path=legal-aid' },
  { label: { en: 'Immigration', es: 'Inmigraci\u00f3n' }, href: '/start?path=legal-aid' },
  { label: { en: 'Court papers or deadline', es: 'Documentos de corte o plazo' }, href: '/start?path=legal-aid' },
  { label: { en: 'Employment', es: 'Empleo' }, href: '/start?path=legal-aid' },
  { label: { en: 'Contract or lease (business)', es: 'Contrato o arrendamiento (negocio)' }, href: '/start?path=smb' },
  { label: { en: 'Not sure / other', es: 'No estoy seguro/a / otro' }, href: '/start' },
];

export function SituationExplorer() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <section className="py-8 sm:py-10 border-t border-slate-100" aria-labelledby="situations-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 id="situations-heading" className="text-lg font-bold text-slate-900 text-center mb-4">
          {en ? 'Common situations we help with' : 'Situaciones comunes con las que ayudamos'}
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {situations.map((s, i) => (
            <Link
              key={i}
              to={s.href}
              onClick={() => trackEvent('situation_chip_click', { label: s.label.en })}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 hover:border-teal-300 hover:bg-teal-50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 no-underline"
            >
              {en ? s.label.en : s.label.es}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

```

---

## src/components/home/MobileStickyBar.tsx

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackLanguageSelected } from '../EthicalAnalytics';
import { track } from '../../lib/gtm-analytics';
import { trackEvent } from '../../services/analytics-service';

export function MobileStickyBar() {
  const { language, setLanguage } = useLanguage();
  const [visible, setVisible] = useState(false);
  const en = language === 'en';

  useEffect(() => {
    const target = document.querySelector('[data-hero-primary-cta]');
    if (!target) { setVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function handleSpanish() {
    setLanguage('es');
    trackLanguageSelected('es');
    track('home_cta_clicked', { cta: 'espanol' });
    trackEvent('home_cta_clicked', { cta: 'espanol' });
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-2.5 flex items-center gap-2" aria-label={en ? 'Mobile actions' : 'Acciones móviles'}>
      <Link
        to="/start"
        onClick={() => trackEvent('mobile_sticky_start_click', {})}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white no-underline focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        {en ? 'Start free 2-minute checkup' : 'Comenzar revisión gratis de 2 minutos'}
      </Link>
      <button
        type="button"
        onClick={handleSpanish}
        className="inline-flex items-center justify-center rounded-full border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        Español
      </button>
    </div>
  );
}

```

---

## src/components/home/FinalCTA.tsx

```tsx
import { Link } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { homepageFinalCTA } from '../../data/homepageContent';
import { trackEvent } from '../../services/analytics-service';

export function FinalCTA() {
  const { language } = useLanguage();
  const en = language === 'en';
  const c = homepageFinalCTA;

  return (
    <section className="bg-slate-900 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          {en ? c.heading.en : c.heading.es}
        </h2>
        <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
          {en ? c.subline.en : c.subline.es}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/start"
            onClick={() => trackEvent('home_cta_clicked', { cta: 'final_section' })}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-teal-50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 no-underline"
          >
            {en ? 'Start free 2-minute checkup' : 'Comenzar revisión gratis de 2 minutos'}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            to="/start?lang=es"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 no-underline"
          >
            <Globe className="w-4 h-4" aria-hidden="true" />
            {c.spanishCta}
          </Link>
        </div>
      </div>
    </section>
  );
}

```

---

## src/components/home/UrgentStrip.tsx

```tsx
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { safetyCopy } from '../../data/safetyCopy';
import { trackUrgentResourcesOpened } from '../EthicalAnalytics';
import { trackEvent } from '../../services/analytics-service';

export function UrgentStrip() {
  const { language } = useLanguage();
  const en = language === 'en';
  const c = safetyCopy.urgentStrip;

  function handleClick() {
    trackUrgentResourcesOpened();
    trackEvent('urgent_strip_click', { source: 'home_strip' });
  }

  return (
    <section className="bg-rose-50 border-b border-rose-100" aria-label={en ? 'Urgent deadline or danger' : 'Plazo urgente o peligro'}>
      {/* Mobile: single-line compact */}
      <div className="sm:hidden mx-auto max-w-3xl px-4 py-1 flex items-center gap-1.5 justify-center">
        <AlertTriangle className="w-3 h-3 text-rose-600 flex-shrink-0" aria-hidden="true" />
        <Link
          to="/urgent-resources"
          onClick={handleClick}
          className="text-[11px] text-rose-700 font-semibold underline underline-offset-2 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded min-h-[44px] inline-flex items-center"
        >
          {en ? 'Urgent? View emergency resources' : '\u00bfUrgente? Recursos de emergencia'}
        </Link>
      </div>

      {/* Desktop: full layout */}
      <div className="hidden sm:flex mx-auto max-w-3xl px-6 py-2.5 items-center gap-3 justify-center">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs text-rose-700 font-medium">
            {en ? c.heading.en : c.heading.es}
          </p>
        </div>
        <p className="text-[11px] text-rose-600">
          {en ? c.examples.en : c.examples.es}
        </p>
        <Link
          to="/urgent-resources"
          onClick={handleClick}
          className="inline-flex items-center gap-1 rounded-full bg-rose-700 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-800 transition focus:outline-none focus:ring-2 focus:ring-rose-500 whitespace-nowrap no-underline"
        >
          {en ? c.cta.en : c.cta.es}
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

```

---

