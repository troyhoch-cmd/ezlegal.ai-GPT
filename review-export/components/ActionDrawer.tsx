import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal, Download, Share2, Brain, Users, BookOpen,
  AlertTriangle, Flag, FileText, X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ActionDrawerProps {
  onShareChat?: () => void;
  onExportChat?: () => void;
  onPrediction?: () => void;
  onReportIssue?: () => void;
  showPrediction?: boolean;
  className?: string;
}

export default function ActionDrawer({
  onShareChat, onExportChat, onPrediction, onReportIssue,
  showPrediction = true, className = '',
}: ActionDrawerProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const actions = [
    ...(showPrediction && onPrediction ? [{
      icon: Brain, label: en ? 'Outcome Estimate' : 'Estimacion de Resultado',
      desc: en ? 'AI scenario analysis' : 'Analisis de escenarios con IA',
      onClick: onPrediction, color: 'text-amber-600',
    }] : []),
    {
      icon: Users, label: en ? 'Find an Attorney' : 'Encontrar un Abogado',
      desc: en ? 'Connect with a licensed attorney' : 'Conectar con un abogado licenciado',
      href: '/find-attorney', color: 'text-teal-600',
    },
    {
      icon: FileText, label: en ? 'Issue Packs' : 'Paquetes de Ayuda',
      desc: en ? 'Action plans & document templates' : 'Planes de accion y plantillas',
      href: '/pricing', color: 'text-green-600',
    },
    ...(onExportChat ? [{
      icon: Download, label: en ? 'Export Conversation' : 'Exportar Conversacion',
      desc: en ? 'Download as PDF or text' : 'Descargar como PDF o texto',
      onClick: onExportChat, color: 'text-navy-600',
    }] : []),
    ...(onShareChat ? [{
      icon: Share2, label: en ? 'Share with Advocate' : 'Compartir con Defensor',
      desc: en ? 'Generate a shareable summary' : 'Generar un resumen compartible',
      onClick: onShareChat, color: 'text-navy-600',
    }] : []),
    {
      icon: BookOpen, label: en ? 'Legal Guides' : 'Guias Legales',
      desc: en ? 'Browse EZ Reads articles' : 'Explorar articulos de EZ Reads',
      href: '/ezreads', color: 'text-navy-600',
    },
    {
      icon: AlertTriangle, label: en ? 'Emergency Resources' : 'Recursos de Emergencia',
      desc: en ? 'Crisis lines & immediate help' : 'Lineas de crisis y ayuda inmediata',
      href: '/emergency-resources', color: 'text-red-600',
    },
    ...(onReportIssue ? [{
      icon: Flag, label: en ? 'Report an Issue' : 'Reportar un Problema',
      desc: en ? 'Flag inaccurate or harmful content' : 'Marcar contenido inexacto o danino',
      onClick: onReportIssue, color: 'text-navy-500',
    }] : []),
  ];

  return (
    <div ref={drawerRef} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-navy-100 transition-colors"
        aria-label={en ? 'Actions and resources' : 'Acciones y recursos'}
        aria-expanded={open}
      >
        <MoreHorizontal className="w-5 h-5 text-navy-600" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl shadow-2xl border border-navy-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-navy-50 border-b border-navy-200">
            <span className="text-sm font-bold text-navy-800">
              {en ? 'Actions & Resources' : 'Acciones y Recursos'}
            </span>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-navy-200 rounded">
              <X className="w-3.5 h-3.5 text-navy-500" />
            </button>
          </div>
          <div className="py-1 max-h-80 overflow-y-auto">
            {actions.map((action, i) => {
              const Icon = action.icon;
              const content = (
                <div className="flex items-start gap-3 px-4 py-2.5 hover:bg-navy-50 transition-colors cursor-pointer">
                  <Icon className={`w-4 h-4 mt-0.5 ${action.color}`} />
                  <div>
                    <div className="text-sm font-medium text-navy-800">{action.label}</div>
                    <div className="text-xs text-navy-500">{action.desc}</div>
                  </div>
                </div>
              );

              if ('href' in action && action.href) {
                return (
                  <Link key={i} to={action.href} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={i}
                  onClick={() => { 'onClick' in action && action.onClick?.(); setOpen(false); }}
                  className="w-full text-left"
                >
                  {content}
                </button>
              );
            })}
          </div>
          <div className="px-4 py-2 bg-navy-50 border-t border-navy-200">
            <p className="text-[10px] text-navy-400">
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
