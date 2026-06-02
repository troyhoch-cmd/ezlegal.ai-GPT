import { useMemo } from 'react';
import { CheckCircle, TrendingUp, Package } from 'lucide-react';
import type { PartnerAsset } from '../../services/asset-service';
import { getOverallReadiness } from '../../services/asset-service';

export function ReadinessSummaryCard({ assets }: { assets: PartnerAsset[] }) {
  const counts = useMemo(() => {
    let ready = 0, partial = 0, blocked = 0;
    assets.forEach(a => {
      if (!a.readiness) return;
      const r = getOverallReadiness(a.readiness);
      if (r === 'ready') ready++;
      else if (r === 'partial') partial++;
      else blocked++;
    });
    return { ready, partial, blocked };
  }, [assets]);

  return (
    <div className="bg-white rounded-xl border border-navy-200 p-4" role="region" aria-label="Distribution readiness summary">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true" />
        <h4 className="text-xs font-bold text-navy-700">Distribution Readiness</h4>
      </div>
      <div className="space-y-2">
        {[
          { label: 'Ready to Send', count: counts.ready, dot: 'bg-green-500', text: 'text-green-700' },
          { label: 'Review Needed', count: counts.partial, dot: 'bg-amber-400', text: 'text-amber-700' },
          { label: 'Blocked', count: counts.blocked, dot: 'bg-red-400', text: 'text-red-700' },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${row.dot}`} aria-hidden="true" />
              <span className="text-[11px] text-navy-600">{row.label}</span>
            </div>
            <span className={`text-sm font-bold ${row.text}`} aria-label={`${row.count} assets ${row.label.toLowerCase()}`}>{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopAssetCard({ assets }: { assets: PartnerAsset[] }) {
  const top = useMemo(() =>
    [...assets].sort((a, b) => b.download_count - a.download_count).slice(0, 3),
  [assets]);

  return (
    <div className="bg-white rounded-xl border border-navy-200 p-4" role="region" aria-label="Most downloaded assets">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-teal-600" aria-hidden="true" />
        <h4 className="text-xs font-bold text-navy-700">Most Used</h4>
      </div>
      <div className="space-y-2">
        {top.map((a, i) => (
          <div key={a.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-bold text-navy-300 w-3">{i + 1}</span>
              <span className="text-[11px] text-navy-700 truncate">{a.name}</span>
            </div>
            <span className="text-[11px] font-semibold text-navy-500 flex-shrink-0">
              {a.download_count}
            </span>
          </div>
        ))}
        {top.length === 0 && (
          <p className="text-[11px] text-navy-400 italic">No download data yet</p>
        )}
      </div>
    </div>
  );
}

export function KitGeneratorCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="bg-navy-800 rounded-xl p-4 flex flex-col justify-between border border-navy-700" role="region" aria-label="Generate partner kit">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-teal-400" aria-hidden="true" />
          <h4 className="text-xs font-bold text-white">Generate Partner Kit</h4>
        </div>
        <p className="text-[11px] text-navy-300 leading-relaxed">
          Bundle assets by language, jurisdiction, and pipeline stage. Enforce Spanish-only mode for bilingual launches.
        </p>
      </div>
      <button
        onClick={onOpen}
        className="mt-3 w-full bg-teal-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-teal-500 transition-colors focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-navy-800 outline-none"
      >
        Build Kit
      </button>
    </div>
  );
}
