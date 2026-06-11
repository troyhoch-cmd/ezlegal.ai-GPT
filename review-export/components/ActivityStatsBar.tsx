import {
  MessageSquare,
  Users,
  FileText,
  TrendingUp,
  Star,
  Activity
} from 'lucide-react';
import { ActivityStats } from '../services/activity-service';

interface ActivityStatsBarProps {
  stats: ActivityStats | null;
  loading?: boolean;
}

export default function ActivityStatsBar({ stats, loading }: ActivityStatsBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
            <div className="h-8 w-8 bg-slate-200 rounded-lg mb-2" />
            <div className="h-6 w-12 bg-slate-200 rounded mb-1" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      icon: Activity,
      value: stats.total_activities,
      label: 'Total Activities',
      color: 'bg-slate-500',
      lightBg: 'bg-slate-50'
    },
    {
      icon: MessageSquare,
      value: stats.chat_count,
      label: 'Chat Sessions',
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50'
    },
    {
      icon: Users,
      value: stats.lawyer_match_count,
      label: 'Lawyer Matches',
      color: 'bg-emerald-500',
      lightBg: 'bg-emerald-50'
    },
    {
      icon: FileText,
      value: stats.document_count,
      label: 'Documents',
      color: 'bg-amber-500',
      lightBg: 'bg-amber-50'
    },
    {
      icon: TrendingUp,
      value: stats.prediction_count,
      label: 'Predictions',
      color: 'bg-rose-500',
      lightBg: 'bg-rose-50'
    },
    {
      icon: Star,
      value: stats.favorites_count,
      label: 'Favorites',
      color: 'bg-amber-400',
      lightBg: 'bg-amber-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statItems.map((item, index) => (
        <div
          key={index}
          className={`${item.lightBg} rounded-xl border border-slate-200/50 p-4 hover:shadow-sm transition-all`}
        >
          <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center mb-2`}>
            <item.icon className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {item.value.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
