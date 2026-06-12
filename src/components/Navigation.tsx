import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronDown, ChevronRight, Globe, Shield, ShieldCheck, Handshake, MessageSquare, FileText, Users, Building2, Scale, CreditCard, Info, AlertTriangle, BookOpen, Sparkles, User, Search, Home, ShoppingBag, Video as LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useDemo } from '../contexts/DemoContext';
import { useChromePersona } from '../hooks/useChromePersona';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import TrustSafetyReportModal from './TrustSafetyReportModal';
import MobileBottomNav from './MobileBottomNav';
import { trackEngagement } from '../services/engagement-service';
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

  const visibleGroups = groups
    .filter((g) => g.audiences.length === 0 || g.audiences.includes(chrome.persona))
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

              {/* Visible EN | ES toggle on all viewports */}
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-bold rounded-md border border-navy-200 bg-navy-50 hover:bg-navy-100 text-navy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              >
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                <span className={language === 'es' ? 'text-navy-400' : 'font-extrabold text-teal-600'}>EN</span>
                <span className="text-navy-300">|</span>
                <span className={language === 'en' ? 'text-navy-400' : 'font-extrabold text-teal-600'}>ES</span>
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
                to="/chat"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {language === 'es' ? 'Hacer una pregunta' : 'Ask a question'}
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
                aria-label={drawerOpen ? (language === 'en' ? 'Close menu' : 'Cerrar menú') : (language === 'en' ? 'Open menu' : 'Abrir menú')}
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
        aria-label={language === 'en' ? 'Navigation menu' : 'Menú de navegación'}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 ease-out shadow-2xl ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-navy-100">
            <span className="font-bold text-navy-900">{language === 'en' ? 'Menu' : 'Menú'}</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label={language === 'en' ? 'Close menu' : 'Cerrar menú'}
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
              <span className="text-sm">{language === 'es' ? 'Buscar guías, temas…' : 'Search guides, topics…'}</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2" role="navigation" aria-label={language === 'en' ? 'Main navigation' : 'Navegación principal'}>
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
