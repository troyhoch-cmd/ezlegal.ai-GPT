import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Stats {
  totalUsers: number;
  activeTrials: number;
  totalConversations: number;
  totalDocuments: number;
  recentActivity: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeTrials: 0,
    totalConversations: 0,
    totalDocuments: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersResult, trialsResult, conversationsResult, documentsResult, activityResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('trial_users').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('chat_messages').select('conversation_id', { count: 'exact', head: true }),
        supabase.from('chatbot_documents').select('id', { count: 'exact', head: true }),
        supabase
          .from('unified_activity_log')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        activeTrials: trialsResult.count || 0,
        totalConversations: conversationsResult.count || 0,
        totalDocuments: documentsResult.count || 0,
        recentActivity: activityResult.count || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      link: '/admin/users'
    },
    {
      label: 'Active Trials',
      value: stats.activeTrials,
      icon: Clock,
      color: 'amber',
      link: '/admin/users'
    },
    {
      label: 'Conversations',
      value: stats.totalConversations,
      icon: MessageSquare,
      color: 'teal',
      link: '/admin/chat'
    },
    {
      label: 'Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'purple',
      link: '/admin/content'
    },
    {
      label: 'Activity (24h)',
      value: stats.recentActivity,
      icon: Activity,
      color: 'green',
      link: '/admin/audit-log'
    }
  ];

  const quickLinks = [
    { label: 'Manage Users', description: 'View and edit user accounts', link: '/admin/users', icon: Users },
    { label: 'Content Library', description: 'Manage documents and templates', link: '/admin/content', icon: FileText },
    { label: 'Chat Management', description: 'Monitor conversations', link: '/admin/chat', icon: MessageSquare },
    { label: 'Partner Pipeline', description: 'Track partner onboarding', link: '/admin/partners', icon: TrendingUp },
    { label: 'System Settings', description: 'Configure RBAC and widgets', link: '/admin/system', icon: Activity },
    { label: 'Audit Log', description: 'View admin activity trail', link: '/admin/audit-log', icon: Clock }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Admin Overview</h1>
        <p className="text-navy-600">System statistics and quick access</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                amber: 'bg-amber-100 text-amber-600',
                teal: 'bg-teal-100 text-teal-600',
                purple: 'bg-purple-100 text-purple-600',
                green: 'bg-green-100 text-green-600'
              }[stat.color];

              return (
                <Link
                  key={stat.label}
                  to={stat.link}
                  className="bg-white rounded-xl border border-navy-200 p-6 hover:shadow-md hover:border-teal-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-navy-900 mb-1">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-navy-600">{stat.label}</div>
                </Link>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-navy-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.link}
                    to={link.link}
                    className="flex items-center gap-3 p-4 rounded-lg border border-navy-200 hover:border-teal-300 hover:bg-teal-50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-navy-900 group-hover:text-teal-700 transition-colors">
                        {link.label}
                      </div>
                      <div className="text-xs text-navy-600">{link.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-teal-600 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
