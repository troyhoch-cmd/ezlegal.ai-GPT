import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, BarChart3, Target, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface KPISnapshot {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_target: number | null;
  metric_unit: string;
  period_start: string;
  period_end: string;
  metadata: Record<string, unknown>;
}

interface GuardrailAlert {
  id: string;
  guardrail_name: string;
  current_value: number;
  threshold_value: number;
  severity: 'info' | 'warning' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved';
  details: Record<string, unknown>;
  created_at: string;
}

const METRIC_CONFIG: Record<string, { label: string; icon: React.ElementType; format: (v: number, unit: string) => string }> = {
  free_to_paid_rate: { label: 'Free-to-Paid Conversion', icon: TrendingUp, format: (v, u) => u === 'percent' ? `${v.toFixed(1)}%` : String(v) },
  activation_completion: { label: 'Pack Activation Rate', icon: CheckCircle, format: (v, u) => u === 'percent' ? `${v.toFixed(1)}%` : String(v) },
  monthly_revenue: { label: 'Monthly Revenue', icon: BarChart3, format: (v) => `$${v.toLocaleString()}` },
  avg_session_depth: { label: 'Avg Session Depth', icon: Clock, format: (v) => `${v.toFixed(1)} pages` },
  churn_rate: { label: 'Churn Rate', icon: TrendingDown, format: (v, u) => u === 'percent' ? `${v.toFixed(1)}%` : String(v) },
  nps_score: { label: 'NPS Score', icon: Target, format: (v) => String(Math.round(v)) },
  modal_suppression_rate: { label: 'Modal Suppression Rate', icon: Shield, format: (v, u) => u === 'percent' ? `${v.toFixed(1)}%` : String(v) },
};

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  critical: 'bg-red-50 border-red-200 text-red-700',
};

export default function KPIDashboard() {
  const [kpis, setKpis] = useState<KPISnapshot[]>([]);
  const [alerts, setAlerts] = useState<GuardrailAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [kpiResult, alertResult] = await Promise.all([
      supabase
        .from('kpi_snapshots')
        .select('*')
        .order('period_end', { ascending: false })
        .limit(20),
      supabase
        .from('guardrail_alerts')
        .select('*')
        .in('status', ['open', 'acknowledged'])
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (kpiResult.data) setKpis(kpiResult.data);
    if (alertResult.data) setAlerts(alertResult.data as GuardrailAlert[]);
    setLoading(false);
  };

  const acknowledgeAlert = async (alertId: string) => {
    await supabase
      .from('guardrail_alerts')
      .update({ status: 'acknowledged' })
      .eq('id', alertId);
    loadData();
  };

  const latestByMetric = kpis.reduce<Record<string, KPISnapshot>>((acc, kpi) => {
    if (!acc[kpi.metric_name]) acc[kpi.metric_name] = kpi;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">KPI Dashboard</h2>
          <p className="text-sm text-navy-500 mt-1">Conversion funnel metrics and guardrails</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Active Guardrail Alerts ({alerts.length})
          </h3>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-xl p-4 ${SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-sm">{alert.guardrail_name.replace(/_/g, ' ')}</div>
                  <div className="text-xs mt-1">
                    Current: {alert.current_value} | Threshold: {alert.threshold_value}
                  </div>
                  {alert.details && typeof alert.details === 'object' && 'recommendation' in alert.details && (
                    <p className="text-xs mt-2 opacity-80">{String(alert.details.recommendation)}</p>
                  )}
                </div>
                {alert.status === 'open' && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-xs font-medium px-3 py-1 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(latestByMetric).map(([name, kpi]) => {
          const config = METRIC_CONFIG[name] || { label: name.replace(/_/g, ' '), icon: BarChart3, format: (v: number) => String(v) };
          const Icon = config.icon;
          const isOnTarget = kpi.metric_target != null && kpi.metric_value >= kpi.metric_target;
          const targetPct = kpi.metric_target ? Math.round((kpi.metric_value / kpi.metric_target) * 100) : null;

          return (
            <div key={name} className="bg-white rounded-xl border border-navy-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-xs font-medium text-navy-500 uppercase tracking-wide">{config.label}</span>
              </div>
              <div className="text-2xl font-bold text-navy-900 mb-1">
                {config.format(kpi.metric_value, kpi.metric_unit)}
              </div>
              {kpi.metric_target != null && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOnTarget ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(targetPct || 0, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isOnTarget ? 'text-green-600' : 'text-amber-600'}`}>
                    {targetPct}%
                  </span>
                </div>
              )}
              <div className="text-[10px] text-navy-400 mt-2">
                {new Date(kpi.period_start).toLocaleDateString()} - {new Date(kpi.period_end).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(latestByMetric).length === 0 && alerts.length === 0 && (
        <div className="text-center py-16 bg-navy-50 rounded-2xl border border-navy-100">
          <BarChart3 className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <h3 className="font-bold text-navy-900 mb-2">No KPI Data Yet</h3>
          <p className="text-sm text-navy-500 max-w-md mx-auto">
            KPI snapshots and guardrail alerts will appear here once the funnel event pipeline is active.
            Funnel events are being captured from user interactions across the platform.
          </p>
        </div>
      )}
    </div>
  );
}
