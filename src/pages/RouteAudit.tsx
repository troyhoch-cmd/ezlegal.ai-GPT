import { APP_ROUTE_META } from '../config/routes';
import Navigation from '../components/Navigation';

export default function RouteAudit() {
  const routes = Object.values(APP_ROUTE_META);
  const totalRoutes = routes.length;
  const highRiskRoutes = routes.filter((r) => r.riskLevel === 'high');
  const missingMetadata = routes.filter(
    (r) => !r.navGroup || r.audience.length === 0
  );
  const spanishPartial = routes.filter(
    (r) => r.availableLanguages.length === 1 && r.availableLanguages[0] === 'en'
  );
  const highRiskNoDisclaimer = highRiskRoutes.filter(
    (r) => !r.showScopeDisclaimer
  );

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Route Metadata Audit</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-2xl font-bold text-slate-900">{totalRoutes}</p>
            <p className="text-sm text-slate-600">Total routes</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-2xl font-bold text-amber-900">{highRiskRoutes.length}</p>
            <p className="text-sm text-amber-700">High-risk routes</p>
          </div>
          <div className={`rounded-xl p-4 border ${missingMetadata.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className={`text-2xl font-bold ${missingMetadata.length > 0 ? 'text-red-900' : 'text-green-900'}`}>{missingMetadata.length}</p>
            <p className={`text-sm ${missingMetadata.length > 0 ? 'text-red-700' : 'text-green-700'}`}>Missing metadata</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-2xl font-bold text-slate-900">{spanishPartial.length}</p>
            <p className="text-sm text-slate-600">English-only routes</p>
          </div>
        </div>

        {highRiskNoDisclaimer.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="font-bold text-red-900 text-sm mb-1">High-risk routes without disclaimer:</p>
            <p className="text-sm text-red-800">
              {highRiskNoDisclaimer.map((r) => r.path).join(', ')}
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">Path</th>
                <th className="px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">Label</th>
                <th className="px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">Audience</th>
                <th className="px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">Risk</th>
                <th className="px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">Languages</th>
                <th className="px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">Disclaimer</th>
                <th className="px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">Escalation</th>
                <th className="px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">Nav Group</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => {
                const isMissing = !route.navGroup || route.audience.length === 0;
                const isHighRisk = route.riskLevel === 'high';
                const highRiskMissingDisclaimer = isHighRisk && !route.showScopeDisclaimer;
                const rowClass = highRiskMissingDisclaimer
                  ? 'bg-red-50'
                  : isMissing
                  ? 'bg-amber-50'
                  : '';

                return (
                  <tr key={route.path} className={`border-b border-slate-100 ${rowClass}`}>
                    <td className="px-3 py-2 font-mono text-xs">{route.path}</td>
                    <td className="px-3 py-2">{route.label.en}</td>
                    <td className="px-3 py-2 text-xs">{route.audience.join(', ')}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        route.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        route.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {route.riskLevel}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{route.availableLanguages.join(', ')}</td>
                    <td className="px-3 py-2 text-center">{route.showScopeDisclaimer ? 'Y' : '-'}</td>
                    <td className="px-3 py-2 text-center">{route.showLegalAidEscalation ? 'Y' : '-'}</td>
                    <td className="px-3 py-2 text-xs">{route.navGroup || <span className="text-amber-600 font-medium">MISSING</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
