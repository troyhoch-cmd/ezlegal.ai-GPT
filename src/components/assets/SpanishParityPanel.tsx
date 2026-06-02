import { useState } from 'react';
import {
  Languages, ChevronDown, ChevronRight, AlertTriangle,
  CheckCircle, Clock, CircleDot, ArrowRight
} from 'lucide-react';
import type { SpanishParityDetail, ReadinessStatus } from '../../services/asset-service';

interface SpanishParityPanelProps {
  parity: SpanishParityDetail;
  onResolve?: (assetId: string) => void;
}

const statusConfig: Record<ReadinessStatus, { label: string; color: string; bg: string }> = {
  complete: { label: 'Complete', color: 'text-green-700', bg: 'bg-green-100' },
  in_review: { label: 'In Review', color: 'text-amber-700', bg: 'bg-amber-100' },
  draft: { label: 'Draft', color: 'text-red-600', bg: 'bg-red-50' },
  not_applicable: { label: 'N/A', color: 'text-navy-400', bg: 'bg-navy-50' },
};

export function SpanishParityPanel({ parity, onResolve }: SpanishParityPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-navy-200 overflow-hidden" role="region" aria-label="Spanish language parity dashboard">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-navy-50/30 transition-colors text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Languages className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-navy-900">Spanish Parity</h4>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-2xl font-bold text-navy-900">{parity.pct}%</span>
              <span className="text-xs text-navy-400">coverage</span>
              {parity.missingAssets.length > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  {parity.missingAssets.length} missing
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
              {parity.complete} Ready
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
              {parity.inReview} Review
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" />
              {parity.draft} Draft
            </span>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-navy-400" /> : <ChevronRight className="w-4 h-4 text-navy-400" />}
        </div>
      </button>

      <div
        className="w-full bg-navy-100 h-2 overflow-hidden"
        role="progressbar"
        aria-valuenow={parity.pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${parity.pct}% of assets have Spanish translations complete`}
      >
        <div className="h-full flex">
          <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${(parity.complete / Math.max(parity.total, 1)) * 100}%` }} />
          <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${(parity.inReview / Math.max(parity.total, 1)) * 100}%` }} />
          <div className="bg-red-400 h-full transition-all duration-500" style={{ width: `${(parity.draft / Math.max(parity.total, 1)) * 100}%` }} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-navy-100 p-4 space-y-4">
          {parity.missingAssets.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-navy-700 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Top Missing Spanish Assets (by usage)
              </h5>
              <div className="space-y-1.5">
                {parity.missingAssets.slice(0, 5).map(asset => {
                  const cfg = statusConfig[asset.status];
                  return (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-navy-50 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${cfg.bg} ${cfg.color}`}>
                          {asset.status === 'in_review' ? (
                            <><Clock className="w-2.5 h-2.5 inline mr-0.5" />{cfg.label}</>
                          ) : (
                            <><CircleDot className="w-2.5 h-2.5 inline mr-0.5" />{cfg.label}</>
                          )}
                        </span>
                        <span className="text-xs text-navy-800 font-medium truncate">{asset.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {asset.downloads > 0 && (
                          <span className="text-[10px] text-navy-400">{asset.downloads} downloads</span>
                        )}
                        {onResolve && (
                          <button
                            onClick={() => onResolve(asset.id)}
                            className="text-[10px] text-white bg-teal-600 hover:bg-teal-500 font-semibold flex items-center gap-0.5 transition-colors px-2 py-1 rounded-md"
                          >
                            Resolve <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(parity.byType).length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-navy-700 mb-2">By Asset Type</h5>
                <div className="space-y-1.5">
                  {Object.entries(parity.byType).map(([type, counts]) => {
                    const pct = Math.round((counts.complete / Math.max(counts.total, 1)) * 100);
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-navy-500 uppercase w-10">{type}</span>
                        <div className="flex-1 bg-navy-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-400' : 'bg-red-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-navy-500 w-12 text-right">{counts.complete}/{counts.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {Object.keys(parity.byJurisdiction).length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-navy-700 mb-2">By Jurisdiction</h5>
                <div className="space-y-1.5">
                  {Object.entries(parity.byJurisdiction).map(([jur, counts]) => {
                    const pct = Math.round((counts.complete / Math.max(counts.total, 1)) * 100);
                    return (
                      <div key={jur} className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-navy-600 w-16 truncate">{jur}</span>
                        <div className="flex-1 bg-navy-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-400' : 'bg-red-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-navy-500 w-12 text-right">{counts.complete}/{counts.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {parity.missingAssets.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">All applicable assets have complete Spanish translations</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
