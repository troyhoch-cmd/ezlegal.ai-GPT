import { useState, useMemo } from 'react';
import { APP_ROUTE_META } from '../config/routes';
import type { RouteAudience } from '../config/routes';
import Navigation from '../components/Navigation';
import { CheckCircle, AlertTriangle, XCircle, Shield, Users, Globe, Brain, Target } from 'lucide-react';

const PROHIBITED_PHRASES = [
  'legal advice',
  'we guarantee',
  'guaranteed outcome',
  'attorney-client',
  'your lawyer',
  'we are your lawyers',
  'always correct',
  '100% accurate',
  'no risk',
  'risk-free',
];

const ICP_SEGMENTS: { id: RouteAudience; label: string; minRoutes: number }[] = [
  { id: 'individual', label: 'Individuals', minRoutes: 3 },
  { id: 'spanish-individual', label: 'Spanish Speakers', minRoutes: 2 },
  { id: 'business', label: 'Small Business', minRoutes: 2 },
  { id: 'legal-aid', label: 'Legal Aid Orgs', minRoutes: 2 },
  { id: 'attorney-partner', label: 'Attorney Partners', minRoutes: 1 },
];

function StatusBadge({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
      <CheckCircle className="w-3 h-3" /> Pass
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      <XCircle className="w-3 h-3" /> Fail
    </span>
  );
}

export default function QADashboard() {
  const [activeTab, setActiveTab] = useState<'routes' | 'icp' | 'ethics' | 'cognitive'>('routes');

  const routes = useMemo(() => Object.values(APP_ROUTE_META), []);

  const routeChecks = useMemo(() => {
    const highRisk = routes.filter((r) => r.riskLevel === 'high');
    const highRiskWithDisclaimer = highRisk.filter((r) => r.showScopeDisclaimer);
    const missingNavGroup = routes.filter((r) => !r.navGroup);
    const missingAudience = routes.filter((r) => r.audience.length === 0);
    const bilingualRoutes = routes.filter((r) => r.availableLanguages.includes('es'));
    const englishOnly = routes.filter((r) => r.availableLanguages.length === 1 && r.availableLanguages[0] === 'en');

    return {
      total: routes.length,
      highRisk: highRisk.length,
      highRiskCovered: highRiskWithDisclaimer.length,
      highRiskUncovered: highRisk.length - highRiskWithDisclaimer.length,
      missingNavGroup: missingNavGroup.length,
      missingAudience: missingAudience.length,
      bilingualCount: bilingualRoutes.length,
      englishOnly: englishOnly.length,
      bilingualPct: Math.round((bilingualRoutes.length / routes.length) * 100),
    };
  }, [routes]);

  const icpChecks = useMemo(() => {
    return ICP_SEGMENTS.map((seg) => {
      const matchingRoutes = routes.filter((r) => r.audience.includes(seg.id));
      return {
        ...seg,
        routeCount: matchingRoutes.length,
        pass: matchingRoutes.length >= seg.minRoutes,
        routes: matchingRoutes.map((r) => r.path),
      };
    });
  }, [routes]);

  const ethicsChecks = useMemo(() => {
    const highRiskRoutes = routes.filter((r) => r.riskLevel === 'high');
    const allHaveDisclaimer = highRiskRoutes.every((r) => r.showScopeDisclaimer);
    const allHaveEscalation = highRiskRoutes.filter((r) => r.showLegalAidEscalation).length;
    const emergencyBannerRoutes = routes.filter((r) => r.showEmergencyBanner);

    return {
      allHighRiskDisclaimer: allHaveDisclaimer,
      highRiskWithEscalation: allHaveEscalation,
      highRiskTotal: highRiskRoutes.length,
      emergencyBannerCount: emergencyBannerRoutes.length,
      prohibitedPhrases: PROHIBITED_PHRASES,
    };
  }, [routes]);

  const cognitiveChecks = useMemo(() => {
    const navGroups = new Set(routes.filter((r) => r.navGroup).map((r) => r.navGroup));
    const routesPerGroup = Array.from(navGroups).map((g) => ({
      group: g!,
      count: routes.filter((r) => r.navGroup === g).length,
    }));
    const maxInGroup = Math.max(...routesPerGroup.map((g) => g.count));

    return {
      navGroupCount: navGroups.size,
      routesPerGroup,
      maxInGroup,
      overloadedGroups: routesPerGroup.filter((g) => g.count > 8),
    };
  }, [routes]);

  const tabs = [
    { id: 'routes' as const, label: 'Route Coverage', icon: Globe },
    { id: 'icp' as const, label: 'ICP Coverage', icon: Users },
    { id: 'ethics' as const, label: 'Ethics & Safety', icon: Shield },
    { id: 'cognitive' as const, label: 'Cognitive Load', icon: Brain },
  ];

  const overallScore = useMemo(() => {
    let points = 0;
    let total = 0;
    total += 4;
    if (routeChecks.highRiskUncovered === 0) points += 1;
    if (routeChecks.missingNavGroup === 0) points += 1;
    if (routeChecks.missingAudience === 0) points += 1;
    if (routeChecks.bilingualPct >= 50) points += 1;
    total += icpChecks.length;
    points += icpChecks.filter((c) => c.pass).length;
    total += 2;
    if (ethicsChecks.allHighRiskDisclaimer) points += 1;
    if (cognitiveChecks.overloadedGroups.length === 0) points += 1;
    return { points, total, pct: Math.round((points / total) * 100) };
  }, [routeChecks, icpChecks, ethicsChecks, cognitiveChecks]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">QA Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Internal QA and stakeholder review tool. Does not perform automated legal compliance review.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg border font-bold text-lg ${
              overallScore.pct >= 80 ? 'bg-green-50 border-green-200 text-green-800' :
              overallScore.pct >= 60 ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-red-50 border-red-200 text-red-800'
            }`}>
              {overallScore.pct}%
            </div>
            <span className="text-sm text-slate-500">{overallScore.points}/{overallScore.total} checks pass</span>
          </div>
        </div>

        <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'routes' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Total Routes" value={routeChecks.total} />
              <MetricCard label="Bilingual %" value={`${routeChecks.bilingualPct}%`} pass={routeChecks.bilingualPct >= 50} />
              <MetricCard label="High-Risk Uncovered" value={routeChecks.highRiskUncovered} pass={routeChecks.highRiskUncovered === 0} invert />
              <MetricCard label="Missing Metadata" value={routeChecks.missingNavGroup + routeChecks.missingAudience} pass={routeChecks.missingNavGroup + routeChecks.missingAudience === 0} invert />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Route Health Summary</h3>
              <div className="space-y-3">
                <CheckRow label="All high-risk routes have disclaimers" pass={routeChecks.highRiskUncovered === 0} />
                <CheckRow label="All routes have nav group" pass={routeChecks.missingNavGroup === 0} detail={routeChecks.missingNavGroup > 0 ? `${routeChecks.missingNavGroup} missing` : undefined} />
                <CheckRow label="All routes have audience" pass={routeChecks.missingAudience === 0} detail={routeChecks.missingAudience > 0 ? `${routeChecks.missingAudience} missing` : undefined} />
                <CheckRow label="50%+ routes bilingual" pass={routeChecks.bilingualPct >= 50} detail={`${routeChecks.bilingualPct}% (${routeChecks.bilingualCount}/${routeChecks.total})`} />
                <CheckRow label="English-only routes" pass={routeChecks.englishOnly <= 5} detail={`${routeChecks.englishOnly} routes`} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'icp' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                ICP Segment Coverage
              </h3>
              <div className="space-y-4">
                {icpChecks.map((seg) => (
                  <div key={seg.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge pass={seg.pass} />
                        <span className="font-medium text-slate-800">{seg.label}</span>
                      </div>
                      <span className="text-sm text-slate-500">{seg.routeCount}/{seg.minRoutes} min routes</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {seg.routes.map((r) => (
                        <span key={r} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{r}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ethics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Ethics & Safety Checks</h3>
              <div className="space-y-3">
                <CheckRow label="All high-risk routes show scope disclaimer" pass={ethicsChecks.allHighRiskDisclaimer} />
                <CheckRow label="High-risk routes with escalation path" pass={ethicsChecks.highRiskWithEscalation > 0} detail={`${ethicsChecks.highRiskWithEscalation}/${ethicsChecks.highRiskTotal}`} />
                <CheckRow label="Emergency banner configured" pass={ethicsChecks.emergencyBannerCount > 0} detail={`${ethicsChecks.emergencyBannerCount} routes`} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Prohibited Phrase Scanner</h3>
              <p className="text-sm text-slate-500 mb-4">These phrases must never appear in user-facing copy without proper qualifiers.</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {PROHIBITED_PHRASES.map((phrase) => (
                  <div key={phrase} className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-800 font-mono">"{phrase}"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cognitive' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Navigation Cognitive Load</h3>
              <div className="space-y-3 mb-6">
                <CheckRow label="Nav groups do not exceed 8 items" pass={cognitiveChecks.overloadedGroups.length === 0} detail={cognitiveChecks.overloadedGroups.length > 0 ? `${cognitiveChecks.overloadedGroups.map((g) => g.group).join(', ')} overloaded` : undefined} />
                <CheckRow label="Total nav groups manageable (max 7)" pass={cognitiveChecks.navGroupCount <= 7} detail={`${cognitiveChecks.navGroupCount} groups`} />
              </div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Routes per Nav Group</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cognitiveChecks.routesPerGroup.map((g) => (
                  <div key={g.group} className={`px-4 py-3 rounded-lg border ${g.count > 8 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-sm font-medium text-slate-800">{g.group}</span>
                    <span className={`ml-2 text-lg font-bold ${g.count > 8 ? 'text-amber-700' : 'text-slate-900'}`}>{g.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({ label, value, pass, invert }: { label: string; value: string | number; pass?: boolean; invert?: boolean }) {
  const isGood = pass !== undefined ? (invert ? !pass : pass) : undefined;
  return (
    <div className={`rounded-xl border p-4 ${
      isGood === undefined ? 'bg-white border-slate-200' :
      isGood ? 'bg-red-50 border-red-200' :
      'bg-green-50 border-green-200'
    }`}>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

function CheckRow({ label, pass, detail }: { label: string; pass: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        {pass ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      {detail && <span className="text-xs text-slate-500">{detail}</span>}
    </div>
  );
}
