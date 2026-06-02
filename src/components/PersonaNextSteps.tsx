import { Link } from 'react-router-dom';
import {
  ArrowRight, MessageSquare, Users, FileText, Heart, Brain,
  Shield, BookOpen, Handshake, BarChart3, ClipboardList, Clock,
  Briefcase, Gauge
} from 'lucide-react';
import usePersonaRouting from '../hooks/usePersonaRouting';
import { useLanguage } from '../contexts/LanguageContext';

const ICON_MAP: Record<string, typeof MessageSquare> = {
  'message-square': MessageSquare,
  'users': Users,
  'file-text': FileText,
  'heart': Heart,
  'brain': Brain,
  'shield': Shield,
  'book-open': BookOpen,
  'handshake': Handshake,
  'bar-chart-3': BarChart3,
  'clipboard': ClipboardList,
  'clock': Clock,
  'briefcase': Briefcase,
  'gauge': Gauge,
};

interface PersonaNextStepsProps {
  context: 'chat' | 'dashboard' | 'general';
  maxItems?: number;
  compact?: boolean;
}

export default function PersonaNextSteps({ context, maxItems = 3, compact = false }: PersonaNextStepsProps) {
  const { content, persona } = usePersonaRouting();
  const { language } = useLanguage();
  const en = language === 'en';

  const routes = context === 'chat' ? content.chatFollowUp : content.quickActions;
  const items = routes.slice(0, maxItems);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] || ArrowRight;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 hover:bg-teal-50 border border-navy-200 hover:border-teal-300 rounded-lg text-sm text-navy-700 hover:text-teal-700 transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  const accentColor = persona === 'business' ? 'teal' : persona === 'organization' ? 'amber' : 'teal';

  return (
    <div className="bg-white rounded-xl border border-navy-200 p-5">
      <h4 className="text-sm font-bold text-navy-900 mb-3">
        {en ? 'Recommended Next Steps' : 'Próximos Pasos Recomendados'}
      </h4>
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] || ArrowRight;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`group flex items-center gap-3 p-3 rounded-lg border border-navy-100 hover:border-${accentColor}-300 hover:bg-${accentColor}-50 transition-all`}
            >
              <div className={`w-9 h-9 rounded-lg bg-${accentColor}-50 group-hover:bg-${accentColor}-100 flex items-center justify-center transition-colors`}>
                <Icon className={`w-4.5 h-4.5 text-${accentColor}-600`} />
              </div>
              <span className="text-sm font-medium text-navy-800 group-hover:text-teal-700 transition-colors flex-1">
                {item.label}
              </span>
              <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-navy-100">
        <Link
          to={content.upgradeCTA.primary.href}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {content.upgradeCTA.primary.label}
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to={content.upgradeCTA.secondary.href}
          className="flex items-center justify-center gap-1 w-full py-2 text-navy-600 hover:text-teal-600 text-xs font-medium transition-colors mt-1"
        >
          {content.upgradeCTA.secondary.label}
        </Link>
      </div>
    </div>
  );
}
