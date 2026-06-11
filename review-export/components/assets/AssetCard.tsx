import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown, ChevronRight, FileText, Download, Copy, Check,
  Pin, CheckCircle, Clock, CircleDot, Star, AlertCircle,
  Ban, User, Calendar, Pencil, X, Save, History, Loader2, MessageSquare,
  FileDown, Send
} from 'lucide-react';
import type { PartnerAsset, ReadinessStatus, AssetReadiness, ReadinessDimension, ReadinessAuditEntry } from '../../services/asset-service';
import { getOverallReadiness, getReadinessLabel, getBlockedReasons, updateAssetReadiness, fetchReadinessAuditLog } from '../../services/asset-service';
import { getAssetPreview } from '../asset-previews';
import { exportPreviewAsPDF } from '../../services/pdf-export-service';

const readinessConfig: Record<ReadinessStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  complete: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_review: { label: 'Review Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  draft: { label: 'Not Started', color: 'bg-red-50 text-red-600', icon: CircleDot },
  not_applicable: { label: 'N/A', color: 'bg-navy-100 text-navy-400', icon: CircleDot },
};

const assetTypeColors: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700',
  html: 'bg-blue-100 text-blue-700',
  docx: 'bg-sky-100 text-sky-700',
  pptx: 'bg-amber-100 text-amber-700',
  zip: 'bg-green-100 text-green-700',
  'community-flyer': 'bg-teal-100 text-teal-700',
};

const STATUS_OPTIONS: { value: ReadinessStatus; label: string }[] = [
  { value: 'complete', label: 'Approved' },
  { value: 'in_review', label: 'In Review' },
  { value: 'draft', label: 'Not Started' },
  { value: 'not_applicable', label: 'N/A' },
];

const dimensionLabels: Record<ReadinessDimension, string> = {
  english: 'English Translation',
  spanish: 'Spanish Translation',
  legal: 'Legal Review',
  brand: 'Brand Approval',
};

function GovernanceBadge({ dimension, status, readiness }: {
  dimension: 'EN' | 'ES' | 'Legal' | 'Brand';
  status: ReadinessStatus;
  readiness: AssetReadiness;
}) {
  const config = readinessConfig[status];
  const Icon = config.icon;

  let reviewerInfo = '';
  if (dimension === 'Legal' && readiness.legal_reviewed_at) {
    const date = new Date(readiness.legal_reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    reviewerInfo = ` (${date})`;
  }
  if (dimension === 'Brand' && readiness.brand_approved_at) {
    const date = new Date(readiness.brand_approved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    reviewerInfo = ` (${date})`;
  }
  if (dimension === 'ES' && readiness.spanish_reviewed_at) {
    const date = new Date(readiness.spanish_reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    reviewerInfo = ` (${date})`;
  }

  const fullLabel = dimension === 'Legal'
    ? `Legal ${config.label}${reviewerInfo}`
    : dimension === 'Brand'
    ? `Brand ${config.label}${reviewerInfo}`
    : `${dimension} ${config.label}${reviewerInfo}`;

  const isGating = dimension !== 'ES' && status !== 'complete' && status !== 'not_applicable';

  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-semibold ${config.color} ${isGating ? 'ring-1 ring-current ring-opacity-30' : ''}`}
      title={fullLabel}
      role="status"
      aria-label={fullLabel}
    >
      <Icon className="w-2.5 h-2.5" aria-hidden="true" />
      {dimension} {status === 'complete' ? 'Approved' : status === 'in_review' ? 'Pending' : status === 'draft' ? 'Needed' : 'N/A'}
    </span>
  );
}

interface AssetCardProps {
  asset: PartnerAsset;
  expanded: boolean;
  onToggle: () => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  isAdmin?: boolean;
  userId?: string;
  onReadinessUpdate?: () => void;
  initialTab?: 'preview' | 'content' | 'governance';
  onDownloadPDF?: (asset: PartnerAsset) => void;
  onSendEmail?: (asset: PartnerAsset) => void;
  onResolve?: (assetId: string) => void;
}

export function AssetCard({ asset, expanded, onToggle, onCopy, copiedId, isAdmin, userId, onReadinessUpdate, initialTab, onDownloadPDF, onSendEmail, onResolve }: AssetCardProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'content' | 'governance'>(initialTab || 'preview');
  const [pdfExporting, setPdfExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const PreviewComponent = getAssetPreview(asset.slug);

  const handlePreviewPDF = useCallback(async () => {
    if (!PreviewComponent) {
      onDownloadPDF?.(asset);
      return;
    }
    setPdfExporting(true);
    const prevTab = activeTab;
    if (activeTab !== 'preview') setActiveTab('preview');
    await new Promise(r => setTimeout(r, 300));
    const el = previewRef.current;
    if (el) {
      const safeName = asset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await exportPreviewAsPDF(el, `ezlegal-${safeName}`);
    } else {
      onDownloadPDF?.(asset);
    }
    if (prevTab !== 'preview') setActiveTab(prevTab);
    setPdfExporting(false);
  }, [PreviewComponent, activeTab, asset, onDownloadPDF]);

  useEffect(() => {
    if (expanded && initialTab) {
      setActiveTab(initialTab);
    }
  }, [expanded, initialTab]);

  if (!asset.readiness) return null;

  const overall = getOverallReadiness(asset.readiness);
  const blockedReasons = getBlockedReasons(asset.readiness);

  const fullContent = asset.content_sections
    .map(s => `${s.heading}:\n${s.content.join('\n')}`)
    .join('\n\n');

  const readinessLbl = getReadinessLabel(asset.readiness);
  const overallStyles = {
    ready: { border: 'border-l-green-500', bg: '', icon: CheckCircle, labelColor: 'text-green-700' },
    partial: { border: 'border-l-amber-400', bg: '', icon: AlertCircle, labelColor: 'text-amber-700' },
    blocked: { border: 'border-l-red-400', bg: 'bg-red-50/30', icon: Ban, labelColor: 'text-red-600' },
  };

  const style = overallStyles[overall];

  return (
    <div
      className={`bg-white rounded-xl border border-navy-200 border-l-4 ${style.border} ${style.bg} overflow-hidden transition-all`}
      role="article"
      aria-label={`${asset.name} - ${readinessLbl}`}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 hover:bg-navy-50/50 transition-colors text-left"
        aria-expanded={expanded}
        aria-controls={`asset-panel-${asset.slug}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0 relative">
            <FileText className="w-5 h-5 text-navy-500" aria-hidden="true" />
            {asset.pinned && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center" aria-label="Pinned asset">
                <Pin className="w-2.5 h-2.5 text-white" aria-hidden="true" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-navy-900 text-sm truncate">{asset.name}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase flex-shrink-0 ${assetTypeColors[asset.asset_type] || 'bg-navy-100 text-navy-600'}`}>
                {asset.asset_type}
              </span>
              {asset.recommended && (
                <span className="text-[9px] px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded font-bold flex items-center gap-0.5 flex-shrink-0">
                  <Star className="w-2.5 h-2.5" aria-hidden="true" /> Recommended
                </span>
              )}
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 flex-shrink-0 ${
                overall === 'ready' ? 'bg-green-100 text-green-700' :
                overall === 'partial' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-600'
              }`}>
                <style.icon className="w-2.5 h-2.5" aria-hidden="true" /> {readinessLbl}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <GovernanceBadge dimension="EN" status={asset.readiness.english_status} readiness={asset.readiness} />
              <GovernanceBadge dimension="ES" status={asset.readiness.spanish_status} readiness={asset.readiness} />
              <GovernanceBadge dimension="Legal" status={asset.readiness.legal_review_status} readiness={asset.readiness} />
              <GovernanceBadge dimension="Brand" status={asset.readiness.brand_approval_status} readiness={asset.readiness} />
            </div>
            {blockedReasons.length > 0 && overall !== 'ready' && (
              <p className="text-[10px] text-red-500 mt-1 truncate" title={blockedReasons.join(', ')}>
                Blocked: {blockedReasons.join(' / ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {isAdmin && overall !== 'ready' && !expanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onResolve) {
                  onResolve(asset.id);
                } else {
                  setActiveTab('governance');
                  onToggle();
                }
              }}
              className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                overall === 'blocked'
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-amber-500 text-white hover:bg-amber-400'
              }`}
            >
              <Pencil className="w-3 h-3" />
              {overall === 'blocked' ? 'Resolve' : 'Review'}
            </button>
          )}
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1 text-[10px] text-navy-400">
              <Download className="w-3 h-3" aria-hidden="true" /> {asset.download_count}
            </div>
            <p className="text-[9px] text-navy-300 mt-0.5">{asset.owner_team} -- v{asset.readiness.version}</p>
          </div>
          {asset.jurisdictions.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {asset.jurisdictions.map(j => (
                <span key={j} className="text-[8px] px-1.5 py-0.5 bg-navy-100 rounded text-navy-500 font-medium">{j}</span>
              ))}
            </div>
          )}
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-navy-400" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-4 h-4 text-navy-400" aria-label={`Expand details for ${asset.name}`} />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-navy-100" id={`asset-panel-${asset.slug}`} role="region" aria-label={`Details for ${asset.name}`}>
          <div className="px-4 py-3 bg-navy-50/50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex bg-navy-200/50 rounded-lg p-0.5" role="tablist">
                {['preview', 'content', 'governance'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      activeTab === tab
                        ? 'bg-white text-navy-900 shadow-sm'
                        : 'text-navy-500 hover:text-navy-700'
                    }`}
                    role="tab"
                    aria-selected={activeTab === tab}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <span className="text-xs text-navy-400">
                Audience: <span className="font-medium text-navy-600">{asset.audience}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (onDownloadPDF || PreviewComponent) && (
                <button
                  onClick={handlePreviewPDF}
                  disabled={pdfExporting}
                  className="flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-teal-600 transition-colors px-2 py-1 rounded-md hover:bg-teal-50 disabled:opacity-50"
                >
                  {pdfExporting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting...</>
                  ) : (
                    <><FileDown className="w-3.5 h-3.5" /> Download PDF</>
                  )}
                </button>
              )}
              {isAdmin && onSendEmail && (
                <button
                  onClick={() => onSendEmail(asset)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-teal-600 transition-colors px-2 py-1 rounded-md hover:bg-teal-50"
                >
                  <Send className="w-3.5 h-3.5" /> Send via Email
                </button>
              )}
              {fullContent && (
                <button
                  onClick={() => onCopy(fullContent, `asset-${asset.slug}-full`)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-500 transition-colors"
                >
                  {copiedId === `asset-${asset.slug}-full` ? (
                    <><Check className="w-3.5 h-3.5" /> Copied all</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy entire document</>
                  )}
                </button>
              )}
            </div>
          </div>

          {activeTab === 'preview' && PreviewComponent && (
            <div className="p-5 bg-navy-100/50 flex justify-center overflow-x-auto" role="tabpanel">
              <div ref={previewRef}>
                <PreviewComponent />
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="p-4 space-y-4" role="tabpanel">
              {asset.content_sections.length > 0 ? (
                asset.content_sections.map((section, sIdx) => (
                  <div key={sIdx} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-bold text-teal-600 uppercase tracking-wide">{section.heading}</h5>
                      <button
                        onClick={() => onCopy(`${section.heading}:\n${section.content.join('\n')}`, `asset-${asset.slug}-s${sIdx}`)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-navy-400 hover:text-teal-600 transition-all"
                        aria-label={`Copy ${section.heading} section`}
                      >
                        {copiedId === `asset-${asset.slug}-s${sIdx}` ? (
                          <><Check className="w-3 h-3" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </button>
                    </div>
                    <div className="bg-navy-50 rounded-lg px-4 py-3 space-y-1.5">
                      {section.content.map((line, lIdx) => (
                        <p key={lIdx} className="text-sm text-navy-700 leading-relaxed">{line}</p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-navy-400 italic">Content sections stored in original document format.</p>
              )}
            </div>
          )}

          {activeTab === 'governance' && (
            <GovernancePanel
              asset={asset}
              blockedReasons={blockedReasons}
              isAdmin={isAdmin}
              userId={userId}
              onReadinessUpdate={onReadinessUpdate}
            />
          )}
        </div>
      )}
    </div>
  );
}

function GovernancePanel({ asset, blockedReasons, isAdmin, userId, onReadinessUpdate }: {
  asset: PartnerAsset;
  blockedReasons: string[];
  isAdmin?: boolean;
  userId?: string;
  onReadinessUpdate?: () => void;
}) {
  const [editingDimension, setEditingDimension] = useState<ReadinessDimension | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLog, setAuditLog] = useState<ReadinessAuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const handleLoadAudit = async () => {
    if (showAuditLog && auditLog.length > 0) {
      setShowAuditLog(!showAuditLog);
      return;
    }
    setShowAuditLog(true);
    setLoadingAudit(true);
    const log = await fetchReadinessAuditLog(asset.id);
    setAuditLog(log);
    setLoadingAudit(false);
  };

  const handleUpdate = async (dimension: ReadinessDimension, newStatus: ReadinessStatus, note: string) => {
    if (!userId) return;
    const result = await updateAssetReadiness(asset.id, dimension, newStatus, userId, note);
    if (result.success) {
      setEditingDimension(null);
      onReadinessUpdate?.();
      if (showAuditLog) {
        const log = await fetchReadinessAuditLog(asset.id);
        setAuditLog(log);
      }
    }
  };

  const dimensions: { key: ReadinessDimension; status: ReadinessStatus; reviewerId?: string | null; reviewedAt?: string | null }[] = [
    { key: 'english', status: asset.readiness!.english_status },
    { key: 'spanish', status: asset.readiness!.spanish_status, reviewerId: asset.readiness!.spanish_reviewer_id, reviewedAt: asset.readiness!.spanish_reviewed_at },
    { key: 'legal', status: asset.readiness!.legal_review_status, reviewerId: asset.readiness!.legal_reviewer_id, reviewedAt: asset.readiness!.legal_reviewed_at },
    { key: 'brand', status: asset.readiness!.brand_approval_status, reviewerId: asset.readiness!.brand_approver_id, reviewedAt: asset.readiness!.brand_approved_at },
  ];

  return (
    <div className="p-4 space-y-4" role="tabpanel">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dimensions.map(dim => (
          editingDimension === dim.key ? (
            <GovernanceEditCard
              key={dim.key}
              dimension={dim.key}
              currentStatus={dim.status}
              onSave={(newStatus, note) => handleUpdate(dim.key, newStatus, note)}
              onCancel={() => setEditingDimension(null)}
            />
          ) : (
            <GovernanceDetailCard
              key={dim.key}
              dimension={dim.key}
              title={dimensionLabels[dim.key]}
              status={dim.status}
              reviewerId={dim.reviewerId}
              reviewedAt={dim.reviewedAt}
              isAdmin={isAdmin}
              onEdit={() => setEditingDimension(dim.key)}
            />
          )
        ))}
      </div>

      <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg text-xs text-navy-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" aria-hidden="true" />
            Last updated: {new Date(asset.updated_at).toLocaleDateString()}
          </span>
          <span>Version {asset.readiness!.version}</span>
          <span>Owner: {asset.owner_team}</span>
        </div>
        {isAdmin && (
          <button
            onClick={handleLoadAudit}
            className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-500 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            {showAuditLog ? 'Hide History' : 'Change History'}
          </button>
        )}
      </div>

      {showAuditLog && (
        <AuditLogPanel entries={auditLog} loading={loadingAudit} />
      )}

      {blockedReasons.length > 0 && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <h5 className="text-xs font-bold text-red-700 mb-1.5">Blocked Reasons</h5>
          <ul className="space-y-1">
            {blockedReasons.map((reason, i) => (
              <li key={i} className="text-xs text-red-600 flex items-center gap-1.5">
                <Ban className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function GovernanceDetailCard({
  dimension,
  title,
  status,
  reviewerId,
  reviewedAt,
  isAdmin,
  onEdit,
}: {
  dimension: ReadinessDimension;
  title: string;
  status: ReadinessStatus;
  reviewerId?: string | null;
  reviewedAt?: string | null;
  isAdmin?: boolean;
  onEdit?: () => void;
}) {
  const config = readinessConfig[status];
  const Icon = config.icon;
  const needsAction = status !== 'complete' && status !== 'not_applicable';

  return (
    <div className={`p-3 rounded-lg border group relative ${
      status === 'complete' ? 'border-green-200 bg-green-50/50' :
      status === 'in_review' ? 'border-amber-200 bg-amber-50/50' :
      status === 'draft' ? 'border-red-200 bg-red-50/50' :
      'border-navy-200 bg-navy-50/50'
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-navy-700">{title}</span>
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-semibold ${config.color}`}>
            <Icon className="w-3 h-3" aria-hidden="true" />
            {status === 'complete' ? 'Approved' : status === 'in_review' ? 'Review Pending' : status === 'draft' ? 'Not Started' : 'N/A'}
          </span>
          {isAdmin && (
            <button
              onClick={onEdit}
              className={`p-1 rounded transition-all ${
                needsAction
                  ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                  : 'text-navy-400 opacity-0 group-hover:opacity-100 hover:text-teal-600 hover:bg-teal-50'
              }`}
              aria-label={`Edit ${title} status`}
              title={needsAction ? `Resolve: ${title}` : `Edit ${title} status`}
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {(reviewerId || reviewedAt) && (
        <div className="flex items-center gap-2 text-[10px] text-navy-500">
          {reviewerId && (
            <span className="flex items-center gap-0.5">
              <User className="w-2.5 h-2.5" aria-hidden="true" />
              Reviewer assigned
            </span>
          )}
          {reviewedAt && (
            <span className="flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5" aria-hidden="true" />
              {new Date(reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      )}
      {!reviewerId && !reviewedAt && status !== 'complete' && status !== 'not_applicable' && (
        <p className="text-[10px] text-navy-400">No reviewer assigned</p>
      )}
    </div>
  );
}

function GovernanceEditCard({ dimension, currentStatus, onSave, onCancel }: {
  dimension: ReadinessDimension;
  currentStatus: ReadinessStatus;
  onSave: (newStatus: ReadinessStatus, note: string) => void;
  onCancel: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<ReadinessStatus>(currentStatus);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(selectedStatus, note);
    setSaving(false);
  };

  const hasChanged = selectedStatus !== currentStatus;

  return (
    <div className="p-3 rounded-lg border-2 border-teal-400 bg-teal-50/30 ring-2 ring-teal-200/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-navy-900">{dimensionLabels[dimension]}</span>
        <button
          onClick={onCancel}
          className="p-1 text-navy-400 hover:text-navy-600 rounded hover:bg-navy-100 transition-colors"
          aria-label="Cancel editing"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="block text-[10px] font-semibold text-navy-500 mb-1 uppercase tracking-wide">Status</label>
          <div className="grid grid-cols-2 gap-1.5">
            {STATUS_OPTIONS.map(opt => {
              const cfg = readinessConfig[opt.value];
              const isSelected = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`text-[10px] px-2 py-1.5 rounded-md font-semibold border transition-all text-left ${
                    isSelected
                      ? `${cfg.color} border-current ring-1 ring-current ring-opacity-40`
                      : 'border-navy-200 text-navy-500 hover:border-navy-300 bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-navy-500 mb-1 uppercase tracking-wide">
            Note (optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-2 top-2 w-3 h-3 text-navy-300" />
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Reason for change..."
              className="w-full text-xs pl-7 pr-3 py-1.5 border border-navy-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={!hasChanged || saving}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-teal-600 text-white hover:bg-teal-500"
          >
            {saving ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-3 h-3" /> Save</>
            )}
          </button>
          <button
            onClick={onCancel}
            className="text-xs font-semibold px-3 py-1.5 rounded-md text-navy-500 hover:bg-navy-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AuditLogPanel({ entries, loading }: { entries: ReadinessAuditEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-3 bg-navy-50 rounded-lg text-center">
        <p className="text-xs text-navy-400">No status changes recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="border border-navy-200 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-navy-50 border-b border-navy-200">
        <h5 className="text-xs font-bold text-navy-700 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Change History
        </h5>
      </div>
      <div className="divide-y divide-navy-100 max-h-48 overflow-y-auto">
        {entries.map(entry => {
          const oldCfg = readinessConfig[entry.old_status as ReadinessStatus] || readinessConfig.draft;
          const newCfg = readinessConfig[entry.new_status as ReadinessStatus] || readinessConfig.draft;
          return (
            <div key={entry.id} className="px-3 py-2 flex items-start gap-3 text-[10px]">
              <span className="text-navy-400 flex-shrink-0 pt-0.5 w-20">
                {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' '}
                {new Date(entry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-navy-700 capitalize">{entry.dimension}</span>
                  <span className={`px-1.5 py-0.5 rounded font-semibold ${oldCfg.color}`}>{oldCfg.label}</span>
                  <span className="text-navy-300">-&gt;</span>
                  <span className={`px-1.5 py-0.5 rounded font-semibold ${newCfg.color}`}>{newCfg.label}</span>
                </div>
                {entry.note && (
                  <p className="text-navy-500 mt-0.5 italic">"{entry.note}"</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
