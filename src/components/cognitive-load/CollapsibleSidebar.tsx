import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  MessageSquare,
  History,
  Wrench,
  BookOpen,
  HelpCircle,
  Phone,
  User,
  Sparkles,
  Brain,
  Scale,
  List,
  FileText,
  FolderOpen,
  Search,
  Users,
  Code2,
  Info,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  labelEs: string;
  icon: typeof MessageSquare;
  href: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  descriptionEs?: string;
}

interface DropdownSection {
  id: string;
  label: string;
  labelEs: string;
  icon: typeof Wrench;
  items: NavItem[];
  tooltip?: string;
  tooltipEs?: string;
}

interface CollapsibleSidebarProps {
  onNewChat?: () => void;
  recentChats?: Array<{ id: string; title: string; date: string }>;
  currentChatId?: string;
  jurisdiction?: string;
  onChangeJurisdiction?: () => void;
  hasActiveSession?: boolean;
  className?: string;
}

const SIDEBAR_EXPANDED_KEY = 'ezlegal-sidebar-expanded';

export default function CollapsibleSidebar({
  onNewChat,
  recentChats = [],
  currentChatId,
  className = '',
}: CollapsibleSidebarProps) {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const en = language === 'en';
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const [hovering, setHovering] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const [expanded, setExpanded] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
    return stored === 'true';
  });

  const classNameHasWidth = /(^|\s)w-/.test(className);
  const collapsedWidth = classNameHasWidth ? '' : 'w-16';
  const expandedWidth = classNameHasWidth ? '' : 'w-64';

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(expanded));
  }, [expanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        expanded &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setExpanded(false);
        setOpenDropdown(null);
      }
    };

    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  const handleMouseEnter = () => {
    if (!expanded) {
      hoverTimeoutRef.current = setTimeout(() => {
        setHovering(true);
        setExpanded(true);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHovering(false);
  };

  const handleTapExpand = () => {
    if (!expanded) {
      setExpanded(true);
    } else {
      setExpanded(false);
      setOpenDropdown(null);
    }
  };

  const topNavItems: (NavItem | DropdownSection)[] = [
    {
      id: 'workspace',
      label: 'Ask a Question',
      labelEs: 'Hacer una Pregunta',
      icon: MessageSquare,
      href: '/chat',
      description: 'Ask questions and get help',
      descriptionEs: 'Haz preguntas y obtén ayuda',
    },
    {
      id: 'action-plan',
      label: 'My Next Steps',
      labelEs: 'Mis Próximos Pasos',
      icon: List,
      href: '/dashboard/action-plan',
      description: 'Tasks and next steps',
      descriptionEs: 'Tareas y próximos pasos',
    },
    {
      id: 'find-help',
      label: 'Find Legal Help',
      labelEs: 'Encontrar Ayuda Legal',
      icon: Users,
      href: '/find-attorney',
      description: 'Browse attorneys and legal aid',
      descriptionEs: 'Busca abogados y ayuda legal',
    },
    {
      id: 'history',
      label: 'Past Questions',
      labelEs: 'Preguntas Anteriores',
      icon: History,
      href: '/dashboard/history',
      description: 'Saved summaries and past chats',
      descriptionEs: 'Resúmenes guardados y chats anteriores',
    },
    {
      id: 'tools',
      label: 'Document Help',
      labelEs: 'Ayuda con Documentos',
      icon: Wrench,
      tooltip: 'Upload, review, or draft documents',
      tooltipEs: 'Sube, revisa o redacta documentos',
      items: [
        {
          id: 'documents',
          label: 'My Documents',
          labelEs: 'Mis Documentos',
          icon: FileText,
          href: '/dashboard/documents',
          description: 'Your uploads and drafts',
          descriptionEs: 'Tus cargas y borradores',
        },
        {
          id: 'icp-templates',
          label: 'Contractor Forms',
          labelEs: 'Formularios de Contratista',
          icon: FolderOpen,
          href: '/dashboard/icp-templates',
          badge: 'NEW',
          badgeColor: 'bg-teal-500',
          description: 'State forms for independent contractors',
          descriptionEs: 'Formularios estatales para contratistas independientes',
        },
        {
          id: 'lawyer-match',
          label: 'Find a Lawyer',
          labelEs: 'Encontrar Abogado',
          icon: Users,
          href: '/find-attorney',
          badge: 'NEW',
          badgeColor: 'bg-teal-500',
          description: 'Get matched with legal help',
          descriptionEs: 'Encuentra ayuda legal',
        },
        {
          id: 'predictor',
          label: 'Check My Chances',
          labelEs: 'Ver Mis Probabilidades',
          icon: Brain,
          href: '/case-predictor',
          badge: 'READY',
          badgeColor: 'bg-blue-500',
          description: 'Estimate possible outcomes',
          descriptionEs: 'Estima resultados posibles',
        },
        {
          id: 'research',
          label: 'Research a Topic',
          labelEs: 'Investigar un Tema',
          icon: Search,
          href: '/dashboard/research',
          description: 'Look up legal topics',
          descriptionEs: 'Investiga temas legales',
        },
        {
          id: 'lawyer-profiles',
          label: 'Lawyer Directory',
          labelEs: 'Directorio de Abogados',
          icon: Users,
          href: '/dashboard/lawyer-profiles',
          description: 'Browse attorneys near you',
          descriptionEs: 'Encuentra abogados cerca',
        },
        {
          id: 'widgets',
          label: 'Website Widgets',
          labelEs: 'Widgets Web',
          icon: Code2,
          href: '/dashboard/website-integration',
          description: 'Embed tools',
          descriptionEs: 'Herramientas incrustadas',
        },
      ],
    },
    {
      id: 'resources',
      label: 'Learn More',
      labelEs: 'Aprender Más',
      icon: BookOpen,
      tooltip: 'Guides, articles, and referrals',
      tooltipEs: 'Guías, artículos y referencias',
      items: [
        {
          id: 'guides',
          label: 'Legal Guides',
          labelEs: 'Guías Legales',
          icon: BookOpen,
          href: '/ezreads',
          description: 'Plain-language articles',
          descriptionEs: 'Artículos en lenguaje simple',
        },
        {
          id: 'negotiate',
          label: 'Negotiation Planner',
          labelEs: 'Planificador de Negociación',
          icon: Scale,
          href: '/negotiate',
          description: 'Build a strategy',
          descriptionEs: 'Construye una estrategia',
        },
        {
          id: 'about',
          label: 'About Us',
          labelEs: 'Sobre Nosotros',
          icon: Info,
          href: '/about',
          description: 'Our mission',
          descriptionEs: 'Nuestra misión',
        },
      ],
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      id: 'account',
      label: 'Profile',
      labelEs: 'Perfil',
      icon: User,
      href: '/dashboard/profile',
      description: 'Account and billing',
      descriptionEs: 'Cuenta y facturación',
    },
    {
      id: 'privacy',
      label: 'Privacy',
      labelEs: 'Privacidad',
      icon: HelpCircle,
      href: '/privacy-at-a-glance',
      description: 'How your data is used',
      descriptionEs: 'Cómo se usan tus datos',
    },
    {
      id: 'contact',
      label: 'Contact Support',
      labelEs: 'Contactar Soporte',
      icon: Phone,
      href: '/contact',
      description: 'Get help or talk to a person',
      descriptionEs: 'Obtén ayuda o habla con una persona',
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  const isDropdown = (item: NavItem | DropdownSection): item is DropdownSection => {
    return 'items' in item;
  };

  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  if (!expanded) {
    return (
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleTapExpand}
        className={`${collapsedWidth} bg-slate-50 border-r border-slate-200 flex flex-col py-4 transition-all duration-200 ${className}`}
        aria-label={en ? 'Navigation sidebar (collapsed)' : 'Barra lateral de navegacion (colapsada)'}
      >
        <div className="flex-1 flex flex-col items-center gap-2 mt-2">
          {topNavItems.map((item) => {
            if (isDropdown(item)) {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="relative group"
                  title={en ? (item.tooltip || item.label) : (item.tooltipEs || item.labelEs)}
                >
                  <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-slate-600 hover:bg-slate-200"
                    aria-label={en ? item.label : item.labelEs}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {en ? item.label : item.labelEs}
                  </span>
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <div key={item.id} className="relative group">
                <Link
                  to={item.href}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    active
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label={en ? item.label : item.labelEs}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {item.badge && (
                    <span
                      className={`absolute -top-1 -right-1 w-2 h-2 ${item.badgeColor} rounded-full`}
                    />
                  )}
                </Link>
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {en ? item.label : item.labelEs}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-slate-200 pt-4 mt-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <div key={item.id} className="relative group">
                <Link
                  to={item.href}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    active
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label={en ? item.label : item.labelEs}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </Link>
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {en ? item.label : item.labelEs}
                </span>
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside
      ref={sidebarRef}
      className={`${expandedWidth} bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-200 ${className}`}
      aria-label={en ? 'Navigation sidebar' : 'Barra lateral de navegacion'}
    >
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-slate-800">ezLegal.ai</span>
          </Link>
          <button
            onClick={() => {
              setExpanded(false);
              setOpenDropdown(null);
            }}
            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label={en ? 'Collapse sidebar' : 'Colapsar barra lateral'}
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" aria-hidden="true" />
          </button>
        </div>

        {onNewChat && (
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            {en ? 'New Chat' : 'Nuevo Chat'}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-0.5 px-2">
          {topNavItems.map((item) => {
            if (isDropdown(item)) {
              const Icon = item.icon;
              const isOpen = openDropdown === item.id;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm font-medium">
                        {en ? item.label : item.labelEs}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-0.5 ml-4 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                      {item.items.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const active = isActive(subItem.href);
                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              active
                                ? 'bg-teal-100 text-teal-700'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                            aria-current={active ? 'page' : undefined}
                          >
                            <SubIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            <span className="text-sm truncate">
                              {en ? subItem.label : subItem.labelEs}
                            </span>
                            {subItem.badge && (
                              <span
                                className={`ml-auto text-[10px] px-1.5 py-0.5 ${subItem.badgeColor} text-white rounded-full font-semibold`}
                              >
                                {subItem.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium truncate">
                  {en ? item.label : item.labelEs}
                </span>
                {item.badge && (
                  <span
                    className={`ml-auto text-[10px] px-1.5 py-0.5 ${item.badgeColor} text-white rounded-full font-semibold`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {recentChats.length > 0 && (
          <div className="mt-4 px-2 pt-4 border-t border-slate-200">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {en ? 'Recent' : 'Reciente'}
              </span>
              {onNewChat && (
                <button
                  onClick={() => {
                    if (window.confirm(en ? 'Delete this conversation? This cannot be undone.' : 'Eliminar esta conversación? No se puede deshacer.')) {
                      onNewChat();
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                  aria-label={en ? 'Delete conversation' : 'Eliminar conversación'}
                  title={en ? 'Delete conversation' : 'Eliminar conversación'}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {recentChats.slice(0, 5).map((chat) => (
                <Link
                  key={chat.id}
                  to={`/chat?id=${chat.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currentChatId === chat.id
                      ? 'bg-slate-200 text-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{chat.title}</p>
                    <p className="text-[10px] text-slate-400">{chat.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-0.5">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium truncate">
                {en ? item.label : item.labelEs}
              </span>
            </Link>
          );
        })}

        {profile?.is_admin && (
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">{en ? 'Admin Panel' : 'Panel Admin'}</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
