import { supabase } from '../lib/supabase';

export type ActivityType = 'chat' | 'lawyer_match' | 'document' | 'prediction' | 'case' | 'system';
export type ActivityStatus = 'completed' | 'pending' | 'in_progress' | 'failed';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  action: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  related_id: string | null;
  related_type: string | null;
  is_favorite: boolean;
  is_client_visible: boolean;
  status: ActivityStatus;
  created_at: string;
}

export interface ActivityStats {
  total_activities: number;
  chat_count: number;
  lawyer_match_count: number;
  document_count: number;
  prediction_count: number;
  favorites_count: number;
  pending_count: number;
  this_week: number;
  this_month: number;
}

export interface LogActivityParams {
  activityType: ActivityType;
  action: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  relatedId?: string;
  relatedType?: string;
  status?: ActivityStatus;
}

export async function logActivity(params: LogActivityParams): Promise<string | null> {
  const { data, error } = await supabase.rpc('log_user_activity', {
    p_activity_type: params.activityType,
    p_action: params.action,
    p_title: params.title,
    p_description: params.description || null,
    p_metadata: params.metadata || {},
    p_related_id: params.relatedId || null,
    p_related_type: params.relatedType || null,
    p_status: params.status || 'completed'
  });

  if (error) {
    console.error('Failed to log activity:', error);
    return null;
  }

  return data;
}

export async function getActivities(options: {
  limit?: number;
  offset?: number;
  activityTypes?: ActivityType[];
  status?: ActivityStatus;
  favoritesOnly?: boolean;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{ activities: Activity[]; total: number }> {
  let query = supabase
    .from('activity_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options.activityTypes && options.activityTypes.length > 0) {
    query = query.in('activity_type', options.activityTypes);
  }

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.favoritesOnly) {
    query = query.eq('is_favorite', true);
  }

  if (options.startDate) {
    query = query.gte('created_at', options.startDate.toISOString());
  }

  if (options.endDate) {
    query = query.lte('created_at', options.endDate.toISOString());
  }

  if (options.searchTerm) {
    query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to fetch activities:', error);
    return { activities: [], total: 0 };
  }

  return { activities: data || [], total: count || 0 };
}

export async function toggleActivityFavorite(activityId: string, isFavorite: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('activity_log')
    .update({ is_favorite: !isFavorite })
    .eq('id', activityId);

  return !error;
}

export async function deleteActivity(activityId: string): Promise<boolean> {
  const { error } = await supabase
    .from('activity_log')
    .delete()
    .eq('id', activityId);

  return !error;
}

export async function getActivityStats(days: number = 30): Promise<ActivityStats | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase.rpc('get_activity_stats', {
    p_user_id: user.user.id,
    p_days: days
  });

  if (error) {
    console.error('Failed to fetch activity stats:', error);
    return null;
  }

  return data;
}

export function getActivityTypeConfig(type: ActivityType) {
  const configs = {
    chat: {
      label: 'Chat Session',
      color: 'blue',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-500'
    },
    lawyer_match: {
      label: 'Lawyer Match',
      color: 'emerald',
      bgColor: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-500'
    },
    document: {
      label: 'Document',
      color: 'amber',
      bgColor: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-500'
    },
    prediction: {
      label: 'Prediction',
      color: 'rose',
      bgColor: 'bg-rose-500',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-500'
    },
    case: {
      label: 'Case',
      color: 'cyan',
      bgColor: 'bg-cyan-500',
      lightBg: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-500'
    },
    system: {
      label: 'System',
      color: 'slate',
      bgColor: 'bg-slate-500',
      lightBg: 'bg-slate-50',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-500'
    }
  };

  return configs[type] || configs.system;
}

export function groupActivitiesByDate(activities: Activity[]): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);

  activities.forEach(activity => {
    const activityDate = new Date(activity.created_at);
    let groupKey: string;

    if (activityDate >= today) {
      groupKey = 'Today';
    } else if (activityDate >= yesterday) {
      groupKey = 'Yesterday';
    } else if (activityDate >= lastWeek) {
      groupKey = 'Last 7 Days';
    } else if (activityDate >= lastMonth) {
      groupKey = 'Last 30 Days';
    } else {
      const month = activityDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      groupKey = month;
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(activity);
  });

  return groups;
}
