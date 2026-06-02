import { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  description?: string;
  color?: 'teal' | 'blue' | 'success' | 'warning' | 'error' | 'stone';
}

export default function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  description,
  color = 'teal'
}: StatCardProps) {
  const colorClasses = {
    teal: 'bg-teal-100 text-teal-600',
    blue: 'bg-blue-100 text-blue-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    stone: 'bg-stone-100 text-stone-600'
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
      <div className="flex items-start justify-between mb-3">
        {icon && <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>}
        {change && trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend === 'up' ? 'text-success-600' : trend === 'down' ? 'text-error-600' : 'text-stone-500'
          }`}>
            {trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
            {trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-stone-900">{value}</div>
      <div className="text-sm text-stone-500">{title}</div>
      {description && <div className="text-xs text-stone-400 mt-1">{description}</div>}
    </div>
  );
}
