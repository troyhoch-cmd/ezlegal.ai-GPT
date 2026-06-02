import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal,
  X,
  Scale,
  Users,
  Download,
  Share2,
  Brain,
  BookOpen,
  Flag,
  FileText,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { trackHelpDrawerOpen } from '../../lib/ab-test-config';
import { useLanguage } from '../../contexts/LanguageContext';

interface MoreHelpDrawerProps {
  onExportChat?: () => void;
  onShareChat?: () => void;
  onPrediction?: () => void;
  onReportIssue?: () => void;
  hasMessages?: boolean;
  className?: string;
}

interface ActionItem {
  id: string;
  icon: typeof Scale;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
}

export default function MoreHelpDrawer({
  onExportChat,
  onShareChat,
  onPrediction,
  onReportIssue,
  hasMessages = false,
  className = '',
}: MoreHelpDrawerProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const primaryActions: ActionItem[] = [
    {
      id: 'find-attorney',
      icon: Scale,
      label: en ? 'Find an Attorney' : 'Encontrar un Abogado',
      description: en ? 'Connect with licensed lawyers' : 'Conecte con abogados licenciados',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      href: '/find-attorney',
    },
    {
      id: 'free-legal',
      icon: Users,
      label: en ? 'Free Legal Aid' : 'Ayuda Legal Gratuita',
      description: en ? 'Check pro bono eligibility' : 'Verifique elegibilidad pro bono',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      href: '/pro-bono',
    },
  ];

  const crisisAction: ActionItem = {
    id: 'urgent-help',
    icon: AlertTriangle,
    label: en ? 'Need Urgent Help?' : 'Necesita Ayuda Urgente?',
    description: en ? 'Crisis resources & hotlines' : 'Recursos de crisis y lineas de ayuda',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    href: '/emergency-resources',
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      trackHelpDrawerOpen();
    }
  };

  const secondaryActions: ActionItem[] = [
    ...(onPrediction
      ? [
          {
            id: 'prediction',
            icon: Brain,
            label: en ? 'Case Outcome Estimate' : 'Estimacion de Resultado',
            description: en ? 'AI scenario analysis' : 'Analisis de escenarios con IA',
            color: 'text-amber-600',
            bgColor: 'hover:bg-slate-50',
            onClick: onPrediction,
          },
        ]
      : []),
    {
      id: 'legal-guides',
      icon: BookOpen,
      label: en ? 'Legal Guides' : 'Guias Legales',
      description: en ? 'Browse EZ Reads articles' : 'Explorar articulos de EZ Reads',
      color: 'text-slate-600',
      bgColor: 'hover:bg-slate-50',
      href: '/ezreads',
    },
    {
      id: 'issue-packs',
      icon: FileText,
      label: en ? 'Issue Packs' : 'Paquetes de Ayuda',
      description: en ? 'Action plans & templates' : 'Planes de accion y plantillas',
      color: 'text-slate-600',
      bgColor: 'hover:bg-slate-50',
      href: '/pricing',
    },
  ];

  const exportActions: ActionItem[] = hasMessages
    ? [
        ...(onExportChat
          ? [
              {
                id: 'export',
                icon: Download,
                label: en ? 'Export Conversation' : 'Exportar Conversacion',
                description: en ? 'Download as PDF' : 'Descargar como PDF',
                color: 'text-slate-600',
                bgColor: 'hover:bg-slate-50',
                onClick: onExportChat,
              },
            ]
          : []),
        ...(onShareChat
          ? [
              {
                id: 'share',
                icon: Share2,
                label: en ? 'Share with Advocate' : 'Compartir con Defensor',
                description: en ? 'Generate shareable link' : 'Generar enlace compartible',
                color: 'text-slate-600',
                bgColor: 'hover:bg-slate-50',
                onClick: onShareChat,
              },
            ]
          : []),
      ]
    : [];

  const renderActionItem = (action: ActionItem) => {
    const Icon = action.icon;
    const content = (
      <div className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${action.bgColor}`}>
        <div className={`w-8 h-8 ${action.color.replace('text-', 'bg-').replace('600', '100')} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${action.color}`} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800">{action.label}</p>
          <p className="text-xs text-slate-500">{action.description}</p>
        </div>
        {action.href && action.external && (
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-1" aria-hidden="true" />
        )}
      </div>
    );

    if (action.href) {
      return (
        <Link
          key={action.id}
          to={action.href}
          onClick={() => setOpen(false)}
          className="block"
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        key={action.id}
        onClick={() => {
          action.onClick?.();
          setOpen(false);
        }}
        className="w-full text-left"
      >
        {content}
      </button>
    );
  };

  return (
    <div ref={drawerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={en ? 'More help options' : 'Mas opciones de ayuda'}
      >
        <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
        <span className="hidden sm:inline">{en ? 'More Help' : 'Mas Ayuda'}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-800">
              {en ? 'Get More Help' : 'Obtener Mas Ayuda'}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              aria-label={en ? 'Close menu' : 'Cerrar menu'}
            >
              <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
            </button>
          </div>

          <div className="p-2">
            <Link
              to={crisisAction.href || '#'}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-700">{crisisAction.label}</p>
                <p className="text-xs text-red-600">{crisisAction.description}</p>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-2 mb-2">
              {primaryActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.id}
                    to={action.href || '#'}
                    onClick={() => setOpen(false)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${action.bgColor} border-slate-200`}
                  >
                    <div className={`w-10 h-10 ${action.color.replace('text-', 'bg-').replace('600', '100')} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${action.color}`} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center">
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {secondaryActions.length > 0 && (
              <>
                <div className="my-2 border-t border-slate-100" />
                <div className="space-y-0.5">
                  {secondaryActions.map(renderActionItem)}
                </div>
              </>
            )}

            {exportActions.length > 0 && (
              <>
                <div className="my-2 border-t border-slate-100" />
                <div className="space-y-0.5">
                  {exportActions.map(renderActionItem)}
                </div>
              </>
            )}

            {onReportIssue && (
              <>
                <div className="my-2 border-t border-slate-100" />
                <button
                  onClick={() => {
                    onReportIssue();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                  {en ? 'Report an issue with this response' : 'Reportar un problema con esta respuesta'}
                </button>
              </>
            )}
          </div>

          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center">
              {en
                ? 'ezLegal.ai provides legal information, not legal advice.'
                : 'ezLegal.ai proporciona información legal, no asesoramiento legal.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
