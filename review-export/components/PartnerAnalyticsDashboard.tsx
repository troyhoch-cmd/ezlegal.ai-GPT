import { useState, useEffect } from 'react';
import {
  Building2, TrendingUp, Users, DollarSign, ArrowUpRight,
  ArrowDownRight, BarChart3, Clock, CheckCircle, Globe,
  Loader2, RefreshCw, Calendar, Target
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PipelineMetrics {
  totalPartners: number;
  byStage: Record<string, number>;
  byType: Record<string, number>;
  totalMonthlyValue: number;
  avgDaysInPipeline: number;
  conversionRate: number;
  newThisMonth: number;
  activePartners: number;
}

interface ReferralMetrics {
  totalReferrals: number;
  convertedReferrals: number;
  pendingReferrals: number;
  totalReferralRevenue: number;
  topReferrers: Array<{ partner_name: string; count: number; revenue: number }>;
}

interface CoBrandedMetrics {
  totalPages: number;
  activePages: number;
  totalViews: number;
  totalConversions: number;
  avgConversionRate: number;
}

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  discovery: 'Discovery',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  pilot: 'Pilot',
  onboarding: 'Onboarding',
  active: 'Active',
  paused: 'Paused',
  churned: 'Churned',
};

const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-slate-400',
  contacted: 'bg-blue-400',
  discovery: 'bg-sky-400',
  proposal: 'bg-amber-400',
  negotiation: 'bg-orange-400',
  pilot: 'bg-teal-400',
  onboarding: 'bg-emerald-400',
  active: 'bg-green-500',
  paused: 'bg-gray-400',
  churned: 'bg-red-400',
};

const TYPE_LABELS: Record<string, string> = {
  legal_aid: 'Legal Aid',
  enterprise: 'Enterprise',
  technology: 'Technology',
  nonprofit: 'Nonprofit',
  government: 'Government',
};

export default function PartnerAnalyticsDashboard() {
  const [pipeline, setPipeline] = useState<PipelineMetrics>({
    totalPartners: 0,
    byStage: {},
    byType: {},
    totalMonthlyValue: 0,
    avgDaysInPipeline: 0,
    conversionRate: 0,
    newThisMonth: 0,
    activePartners: 0,
  });
  const [referrals, setReferrals] = useState<ReferralMetrics>({
    totalReferrals: 0,
    convertedReferrals: 0,
    pendingReferrals: 0,
    totalReferralRevenue: 0,
    topReferrers: [],
  });
  const [coBranded, setCoBranded] = useState<CoBrandedMetrics>({
    totalPages: 0,
    activePages: 0,
    totalViews: 0,
    totalConversions: 0,
    avgConversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllMetrics();
  }, []);

  const fetchAllMetrics = async () => {
    setLoading(true);
    await Promise.all([fetchPipelineMetrics(), fetchReferralMetrics(), fetchCoBrandedMetrics()]);
    setLoading(false);
  };

  const fetchPipelineMetrics = async () => {
    const { data: partners } = await supabase.from('partners').select('*');
    if (!partners) return;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const byStage: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalValue = 0;
    let newThisMonth = 0;
    let activeCount = 0;
    let totalDays = 0;
    let completedCount = 0;

    partners.forEach(p => {
      byStage[p.pipeline_stage] = (byStage[p.pipeline_stage] || 0) + 1;
      byType[p.partner_type] = (byType[p.partner_type] || 0) + 1;
      totalValue += p.monthly_value || 0;

      if (new Date(p.created_at) >= monthStart) newThisMonth++;
      if (p.pipeline_stage === 'active') {
        activeCount++;
        const days = Math.floor((now.getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24));
        totalDays += days;
        completedCount++;
      }
    });

    const everActive = partners.filter(p => ['active', 'paused', 'churned'].includes(p.pipeline_stage)).length;
    const conversionRate = partners.length > 0 ? (everActive / partners.length) * 100 : 0;

    setPipeline({
      totalPartners: partners.length,
      byStage,
      byType,
      totalMonthlyValue: totalValue,
      avgDaysInPipeline: completedCount > 0 ? Math.round(totalDays / completedCount) : 0,
      conversionRate: Math.round(conversionRate),
      newThisMonth,
      activePartners: activeCount,
    });
  };

  const fetchReferralMetrics = async () => {
    const { data: refs } = await supabase
      .from('partner_referrals')
      .select('*, partners(organization_name)');

    if (!refs) return;

    const converted = refs.filter(r => r.status === 'converted');
    const pending = refs.filter(r => r.status === 'pending');
    const totalRevenue = converted.reduce((sum, r) => sum + (r.conversion_value || 0), 0);

    const referrerMap = new Map<string, { count: number; revenue: number; name: string }>();
    refs.forEach(r => {
      const name = (r.partners as { organization_name: string })?.organization_name || 'Unknown';
      const existing = referrerMap.get(r.partner_id) || { count: 0, revenue: 0, name };
      existing.count++;
      existing.revenue += r.conversion_value || 0;
      referrerMap.set(r.partner_id, existing);
    });

    const topReferrers = Array.from(referrerMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(r => ({ partner_name: r.name, count: r.count, revenue: r.revenue }));

    setReferrals({
      totalReferrals: refs.length,
      convertedReferrals: converted.length,
      pendingReferrals: pending.length,
      totalReferralRevenue: totalRevenue,
      topReferrers,
    });
  };

  const fetchCoBrandedMetrics = async () => {
    const { data: pages } = await supabase.from('partner_co_branded_pages').select('*');
    if (!pages) return;

    const active = pages.filter(p => p.is_active);
    const totalViews = pages.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const totalConversions = pages.reduce((sum, p) => sum + (p.conversion_count || 0), 0);

    setCoBranded({
      totalPages: pages.length,
      activePages: active.length,
      totalViews,
      totalConversions,
      avgConversionRate: totalViews > 0 ? Math.round((totalConversions / totalViews) * 100 * 10) / 10 : 0,
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const maxStageCount = Math.max(...Object.values(pipeline.byStage), 1);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-navy-900">Partner Analytics</h2>
          <p className="text-navy-500 mt-1">Overview of partnership performance and pipeline health</p>
        </div>
        <button
          onClick={fetchAllMetrics}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-navy-200 rounded-xl text-navy-700 hover:bg-navy-50 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={Building2}
          label="Total Partners"
          value={pipeline.totalPartners}
          subtext={`${pipeline.newThisMonth} new this month`}
          iconColor="bg-blue-100 text-blue-600"
        />
        <MetricCard
          icon={CheckCircle}
          label="Active Partners"
          value={pipeline.activePartners}
          subtext={`${pipeline.conversionRate}% conversion rate`}
          iconColor="bg-green-100 text-green-600"
        />
        <MetricCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={`$${pipeline.totalMonthlyValue.toLocaleString()}`}
          subtext="From active partners"
          iconColor="bg-teal-100 text-teal-600"
        />
        <MetricCard
          icon={Target}
          label="Referral Conversions"
          value={referrals.convertedReferrals}
          subtext={`${referrals.totalReferrals} total referrals`}
          iconColor="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-navy-200 p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-6">Pipeline Stages</h3>
          <div className="space-y-3">
            {Object.entries(STAGE_LABELS).map(([key, label]) => {
              const count = pipeline.byStage[key] || 0;
              const pct = maxStageCount > 0 ? (count / maxStageCount) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-navy-600 w-24 text-right font-medium">{label}</span>
                  <div className="flex-1 h-7 bg-navy-50 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full rounded-lg transition-all duration-500 ${STAGE_COLORS[key]}`}
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-navy-700">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-navy-200 p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-6">Partner Types</h3>
          <div className="space-y-4">
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const count = pipeline.byType[key] || 0;
              const pct = pipeline.totalPartners > 0 ? Math.round((count / pipeline.totalPartners) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-navy-700 font-medium">{label}</span>
                    <span className="text-sm text-navy-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-navy-100">
            <h4 className="text-sm font-bold text-navy-700 mb-4">Quick Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-navy-50 rounded-lg">
                <p className="text-xs text-navy-500">Avg. Days to Active</p>
                <p className="text-lg font-bold text-navy-900">{pipeline.avgDaysInPipeline || '-'}</p>
              </div>
              <div className="p-3 bg-navy-50 rounded-lg">
                <p className="text-xs text-navy-500">Pipeline Conversion</p>
                <p className="text-lg font-bold text-navy-900">{pipeline.conversionRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-navy-200 p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Referral Performance</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-navy-50 rounded-xl">
              <p className="text-xs text-navy-500 mb-1">Total Referrals</p>
              <p className="text-2xl font-bold text-navy-900">{referrals.totalReferrals}</p>
            </div>
            <div className="p-4 bg-navy-50 rounded-xl">
              <p className="text-xs text-navy-500 mb-1">Referral Revenue</p>
              <p className="text-2xl font-bold text-teal-600">${referrals.totalReferralRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-navy-50 rounded-xl">
              <p className="text-xs text-navy-500 mb-1">Converted</p>
              <p className="text-2xl font-bold text-green-600">{referrals.convertedReferrals}</p>
            </div>
            <div className="p-4 bg-navy-50 rounded-xl">
              <p className="text-xs text-navy-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{referrals.pendingReferrals}</p>
            </div>
          </div>

          {referrals.topReferrers.length > 0 && (
            <>
              <h4 className="text-sm font-bold text-navy-700 mb-3">Top Referrers</h4>
              <div className="space-y-2">
                {referrals.topReferrers.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-navy-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-400 w-5">{idx + 1}</span>
                      <span className="text-sm text-navy-800">{r.partner_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-navy-500">{r.count} referrals</span>
                      <span className="text-xs font-semibold text-teal-600">${r.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl border border-navy-200 p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Co-Branded Pages</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-navy-50 rounded-xl">
              <p className="text-xs text-navy-500 mb-1">Total Pages</p>
              <p className="text-2xl font-bold text-navy-900">{coBranded.totalPages}</p>
            </div>
            <div className="p-4 bg-navy-50 rounded-xl">
              <p className="text-xs text-navy-500 mb-1">Active Pages</p>
              <p className="text-2xl font-bold text-green-600">{coBranded.activePages}</p>
            </div>
            <div className="p-4 bg-navy-50 rounded-xl">
              <p className="text-xs text-navy-500 mb-1">Total Views</p>
              <p className="text-2xl font-bold text-navy-900">{coBranded.totalViews.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-navy-50 rounded-xl">
              <p className="text-xs text-navy-500 mb-1">Conversions</p>
              <p className="text-2xl font-bold text-teal-600">{coBranded.totalConversions}</p>
            </div>
          </div>
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-800 font-medium">Average Conversion Rate</span>
              <span className="text-2xl font-bold text-teal-700">{coBranded.avgConversionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-navy-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-navy-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-xs text-navy-400 mt-1">{subtext}</p>
    </div>
  );
}
