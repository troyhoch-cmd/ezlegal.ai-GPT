import { useState, useMemo } from 'react';
import {
  X, Package, Check, CheckCircle, AlertCircle, Ban,
  Languages, Shield, Printer, FileDown, Loader2
} from 'lucide-react';
import type { PartnerAsset, ReadinessStatus } from '../../services/asset-service';
import { getOverallReadiness } from '../../services/asset-service';

const assetTypeColors: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700',
  html: 'bg-blue-100 text-blue-700',
  docx: 'bg-sky-100 text-sky-700',
  pptx: 'bg-amber-100 text-amber-700',
  zip: 'bg-green-100 text-green-700',
};

function ReadinessBadge({ status, label }: { status: ReadinessStatus; label: string }) {
  const configs: Record<ReadinessStatus, { label: string; color: string }> = {
    complete: { label: 'OK', color: 'bg-green-100 text-green-700' },
    in_review: { label: 'Review', color: 'bg-amber-100 text-amber-700' },
    draft: { label: 'Draft', color: 'bg-red-50 text-red-600' },
    not_applicable: { label: 'N/A', color: 'bg-navy-100 text-navy-400' },
  };
  const cfg = configs[status];
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded font-semibold ${cfg.color}`}
      aria-label={`${label}: ${cfg.label}`}
    >
      {label}
    </span>
  );
}

interface PartnerKitModalProps {
  assets: PartnerAsset[];
  onClose: () => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onSaveKit?: (params: {
    languageFilter: string;
    jurisdictionFilter: string;
    stageFilter: string;
    selectedAssetIds: string[];
    spanishOnlyEnforced: boolean;
    printOptimized: boolean;
    kitContent: string;
  }) => void;
  onExportPDF?: (selectedAssets: PartnerAsset[], kitOptions: {
    language: string;
    jurisdiction: string;
    stage: string;
  }) => Promise<void>;
}

export function PartnerKitModal({ assets, onClose, onCopy, copiedId, onSaveKit, onExportPDF }: PartnerKitModalProps) {
  const [language, setLanguage] = useState<'en' | 'es' | 'both'>('both');
  const [jurisdiction, setJurisdiction] = useState('all');
  const [stage, setStage] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [spanishStrict, setSpanishStrict] = useState(false);
  const [printOptimized, setPrintOptimized] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const allJurisdictions = useMemo(() => {
    const set = new Set<string>();
    assets.forEach(a => a.jurisdictions.forEach(j => set.add(j)));
    return Array.from(set).sort();
  }, [assets]);

  const allStages = useMemo(() => {
    const set = new Set<string>();
    assets.forEach(a => a.pipeline_stages.forEach(s => set.add(s)));
    return Array.from(set).filter(Boolean).sort();
  }, [assets]);

  const filtered = useMemo(() => {
    return assets.filter(a => {
      if (!a.readiness) return false;
      if (language === 'en' && a.readiness.english_status === 'not_applicable') return false;
      if (language === 'es' && a.readiness.spanish_status === 'not_applicable') return false;
      if (language === 'es' && a.readiness.spanish_status === 'draft') return false;
      if (jurisdiction !== 'all' && a.jurisdictions.length > 0 && !a.jurisdictions.includes(jurisdiction)) return false;
      if (stage !== 'all' && !a.pipeline_stages.includes(stage)) return false;
      return true;
    });
  }, [assets, language, jurisdiction, stage]);

  const spanishIncompleteSelected = useMemo(() => {
    if (!spanishStrict) return [];
    return filtered.filter(a =>
      selected.has(a.id) &&
      a.readiness &&
      a.readiness.spanish_status !== 'complete' &&
      a.readiness.spanish_status !== 'not_applicable'
    );
  }, [filtered, selected, spanishStrict]);

  const canGenerate = selected.size > 0 && (spanishStrict ? spanishIncompleteSelected.length === 0 : true);

  const toggleAsset = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(a => a.id)));
    }
  };

  const generateKit = () => {
    const selectedAssets = assets.filter(a => selected.has(a.id));
    const kitContent = selectedAssets.map(a => {
      const sections = a.content_sections.map(s => `${s.heading}:\n${s.content.join('\n')}`).join('\n\n');
      return `=== ${a.name} (${a.asset_type.toUpperCase()}) ===\n${sections || '(Content in original document format)'}`;
    }).join('\n\n\n');

    const hasFlyer = selectedAssets.some(a => a.slug === 'spanish-flyer' || a.asset_type === 'pdf');
    const referralNote = hasFlyer
      ? '\nIMPORTANT: Replace [PARTNER_ID] in flyer QR/URLs with the actual partner referral code before distribution.'
      : '';

    const header = [
      'PARTNER KIT',
      `Format: ${printOptimized ? 'Print-Optimized (no interactive elements, min 11pt fonts)' : 'Digital (interactive links enabled)'}`,
      `Language: ${language === 'both' ? 'English + Spanish' : language === 'en' ? 'English' : 'Spanish'}`,
      `Jurisdiction: ${jurisdiction === 'all' ? 'All' : jurisdiction}`,
      `Pipeline Stage: ${stage === 'all' ? 'All stages' : stage}`,
      `Assets: ${selectedAssets.length}`,
      spanishStrict ? 'Spanish Strict Mode: ON (no English fallbacks)' : '',
      `Generated: ${new Date().toISOString().split('T')[0]}`,
      referralNote,
      '---',
    ].filter(Boolean).join('\n');

    const fullKit = `${header}\n\n${kitContent}`;
    onCopy(fullKit, 'partner-kit');

    if (onSaveKit) {
      onSaveKit({
        languageFilter: language,
        jurisdictionFilter: jurisdiction,
        stageFilter: stage,
        selectedAssetIds: Array.from(selected),
        spanishOnlyEnforced: spanishStrict,
        printOptimized,
        kitContent: fullKit,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Generate Partner Kit">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-navy-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-navy-900">Generate Partner Kit</h3>
            <p className="text-xs text-navy-500 mt-0.5">Filter, select, and bundle assets for a specific partner</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-navy-100 flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 text-navy-400" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-navy-100 bg-navy-50/50 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-navy-500 uppercase tracking-wider block mb-1.5">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as typeof language)}
                className="w-full text-xs border border-navy-200 rounded-lg px-3 py-2 text-navy-700 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="both">English + Spanish</option>
                <option value="en">English Only</option>
                <option value="es">Spanish Only</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy-500 uppercase tracking-wider block mb-1.5">Jurisdiction</label>
              <select
                value={jurisdiction}
                onChange={e => setJurisdiction(e.target.value)}
                className="w-full text-xs border border-navy-200 rounded-lg px-3 py-2 text-navy-700 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="all">All Jurisdictions</option>
                {allJurisdictions.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy-500 uppercase tracking-wider block mb-1.5">Pipeline Stage</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value)}
                className="w-full text-xs border border-navy-200 rounded-lg px-3 py-2 text-navy-700 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="all">All Stages</option>
                {allStages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <label className="flex-1 flex items-center gap-2 p-2 rounded-lg border border-navy-200 bg-white cursor-pointer hover:border-teal-300 transition-colors">
              <input
                type="checkbox"
                checked={spanishStrict}
                onChange={e => setSpanishStrict(e.target.checked)}
                className="w-4 h-4 rounded border-navy-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" aria-hidden="true" />
                <div>
                  <span className="text-xs font-bold text-navy-800">Spanish Strict Mode</span>
                  <p className="text-[10px] text-navy-500">Block if missing Spanish translation</p>
                </div>
              </div>
            </label>
            <label className="flex-1 flex items-center gap-2 p-2 rounded-lg border border-navy-200 bg-white cursor-pointer hover:border-teal-300 transition-colors">
              <input
                type="checkbox"
                checked={printOptimized}
                onChange={e => setPrintOptimized(e.target.checked)}
                className="w-4 h-4 rounded border-navy-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-teal-600" aria-hidden="true" />
                <div>
                  <span className="text-xs font-bold text-navy-800">Print Optimized</span>
                  <p className="text-[10px] text-navy-500">Strip interactive elements, enforce min fonts</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-navy-500">{filtered.length} assets match filters</p>
            <button
              onClick={selectAll}
              className="text-xs font-semibold text-teal-600 hover:text-teal-500"
            >
              {selected.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="space-y-1.5">
            {filtered.map(asset => {
              if (!asset.readiness) return null;
              const overall = getOverallReadiness(asset.readiness);
              const isSpanishBlocked = spanishStrict &&
                asset.readiness.spanish_status !== 'complete' &&
                asset.readiness.spanish_status !== 'not_applicable';

              return (
                <label
                  key={asset.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSpanishBlocked && selected.has(asset.id)
                      ? 'border-red-300 bg-red-50'
                      : selected.has(asset.id)
                      ? 'border-teal-300 bg-teal-50'
                      : 'border-navy-200 hover:bg-navy-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(asset.id)}
                    onChange={() => toggleAsset(asset.id)}
                    className="w-4 h-4 rounded border-navy-300 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-navy-900 truncate">{asset.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${assetTypeColors[asset.asset_type]}`}>
                        {asset.asset_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <ReadinessBadge status={asset.readiness.english_status} label="EN" />
                      <ReadinessBadge status={asset.readiness.spanish_status} label="ES" />
                      {overall === 'ready' && (
                        <span className="text-[9px] text-green-600 font-semibold flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5" aria-hidden="true" /> Ready
                        </span>
                      )}
                      {overall === 'partial' && (
                        <span className="text-[9px] text-amber-600 font-semibold flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5" aria-hidden="true" /> Review Needed
                        </span>
                      )}
                      {isSpanishBlocked && selected.has(asset.id) && (
                        <span className="text-[9px] text-red-600 font-semibold flex items-center gap-0.5">
                          <Ban className="w-2.5 h-2.5" aria-hidden="true" /> Missing ES
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-navy-400">{asset.file_size}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-navy-200 bg-navy-50">
          {spanishStrict && spanishIncompleteSelected.length > 0 && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 rounded-lg border border-red-200">
              <Languages className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
              <p className="text-[11px] text-red-600">
                {spanishIncompleteSelected.length} selected asset{spanishIncompleteSelected.length > 1 ? 's' : ''} missing Spanish translation:
                {' '}{spanishIncompleteSelected.map(a => a.name).join(', ')}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs text-navy-500">
              {selected.size} asset{selected.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {onExportPDF && (
                <button
                  onClick={async () => {
                    if (!canGenerate || !onExportPDF) return;
                    setExportingPDF(true);
                    const selectedAssets = assets.filter(a => selected.has(a.id));
                    await onExportPDF(selectedAssets, { language, jurisdiction, stage });
                    setExportingPDF(false);
                  }}
                  disabled={!canGenerate || exportingPDF}
                  className="px-4 py-2 text-xs font-bold text-navy-700 bg-navy-100 rounded-lg hover:bg-navy-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {exportingPDF ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting...</>
                  ) : (
                    <><FileDown className="w-3.5 h-3.5" /> Export as PDF</>
                  )}
                </button>
              )}
              <button
                onClick={generateKit}
                disabled={!canGenerate}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {copiedId === 'partner-kit' ? (
                  <><Check className="w-3.5 h-3.5" /> Kit Copied!</>
                ) : (
                  <><Package className="w-3.5 h-3.5" /> Generate & Copy Kit</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
