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
