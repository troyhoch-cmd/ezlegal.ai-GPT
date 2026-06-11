import { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchAssets, fetchSavedViews, createSavedView, deleteSavedView,
  saveKitGeneration, recordDownload, filterAssets, computeSpanishParity,
  type PartnerAsset, type AssetFilters, type SavedView
} from '../services/asset-service';
import { exportAssetContentAsPDF, exportKitAsPDF } from '../services/pdf-export-service';
import { logDistribution } from '../services/distribution-service';
import { DOWNLOADABLE_ASSETS } from '../data/partnerAssetContent';
import {
  AssetFilterBar,
  SpanishParityPanel,
  AssetCard,
  PartnerKitModal,
  EmailDistributionModal,
  ReadinessSummaryCard,
  TopAssetCard,
  KitGeneratorCard,
} from './assets';

interface AssetsDashboardProps {
  assets?: never;
  expandedTile?: string | null;
  onToggleTile?: (id: string) => void;
  onCopy?: (text: string, id: string) => void;
  copiedId?: string | null;
}

export function AssetsDashboard({ expandedTile: externalExpandedTile, onToggleTile: externalToggleTile, onCopy: externalCopy, copiedId: externalCopiedId }: AssetsDashboardProps) {
  const { user, profile } = useAuth();
  const [assets, setAssets] = useState<PartnerAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKitModal, setShowKitModal] = useState(false);
  const [emailAsset, setEmailAsset] = useState<PartnerAsset | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [filters, setFilters] = useState<AssetFilters>({
    language: 'all',
    jurisdiction: 'all',
    pipeline_stage: 'all',
    readiness: 'all',
    asset_type: 'all',
    owner_team: 'all',
    recommended_only: false,
  });

  const [internalExpandedTile, setInternalExpandedTile] = useState<string | null>(null);
  const [internalCopiedId, setInternalCopiedId] = useState<string | null>(null);
  const [resolveTargetId, setResolveTargetId] = useState<string | null>(null);

  const expandedTile = externalExpandedTile ?? internalExpandedTile;
  const copiedId = externalCopiedId ?? internalCopiedId;

  const toggleTile = useCallback((id: string) => {
    if (externalToggleTile) {
      externalToggleTile(id);
    } else {
      setInternalExpandedTile(prev => prev === id ? null : id);
    }
  }, [externalToggleTile]);

  const copyContent = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    if (externalCopy) {
      externalCopy(text, id);
    } else {
      setInternalCopiedId(id);
      setTimeout(() => setInternalCopiedId(null), 2000);
    }
  }, [externalCopy]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const dbAssets = await fetchAssets();

      if (cancelled) return;

      const mapLocal = (a: typeof DOWNLOADABLE_ASSETS[number]): PartnerAsset => ({
        id: a.id,
        slug: a.id,
        name: a.name,
        asset_type: a.type,
        file_size: a.size,
        description: a.description,
        audience: a.audience,
        content_sections: a.sections,
        jurisdictions: a.jurisdictions,
        owner_team: a.owner,
        pipeline_stages: a.pipelineStage.split(',').map(s => s.trim()),
        pinned: a.pinned,
        recommended: a.recommended,
        is_active: true,
        created_at: a.lastUpdated,
        updated_at: a.lastUpdated,
        readiness: {
          id: a.id,
          asset_id: a.id,
          english_status: a.readiness.english,
          spanish_status: a.readiness.spanish,
          legal_review_status: a.readiness.legalReviewed,
          brand_approval_status: a.readiness.brandApproved,
          legal_reviewer_id: null,
          legal_reviewed_at: null,
          brand_approver_id: null,
          brand_approved_at: null,
          spanish_reviewer_id: null,
          spanish_reviewed_at: null,
          version: 1,
          blocked_reasons: [],
        },
        download_count: a.downloads,
      });
      const dbSlugs = new Set(dbAssets.map(a => a.slug));
      const localOnly = DOWNLOADABLE_ASSETS.filter(a => !dbSlugs.has(a.id)).map(mapLocal);
      setAssets([...dbAssets, ...localOnly]);

      if (user) {
        const views = await fetchSavedViews(user.id);
        if (!cancelled) setSavedViews(views);
      }

      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const isAdmin = !!profile?.is_admin;

  const reloadAssets = useCallback(async () => {
    const dbAssets = await fetchAssets();
    if (dbAssets.length > 0) {
      setAssets(dbAssets);
    }
  }, []);

  const handleResolve = useCallback((assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setResolveTargetId(assetId);
      if (externalToggleTile) {
        externalToggleTile(`asset-${asset.slug}`);
      } else {
        setInternalExpandedTile(`asset-${asset.slug}`);
      }
    }
  }, [assets, externalToggleTile]);

  const filteredAssets = useMemo(() => filterAssets(assets, filters), [assets, filters]);
  const spanishParity = useMemo(() => computeSpanishParity(assets), [assets]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return b.download_count - a.download_count;
    });
  }, [filteredAssets]);

  const handleSaveView = async (name: string) => {
    if (!user) return;
    const view = await createSavedView(user.id, name, filters);
    if (view) setSavedViews(prev => [...prev, view]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters);
  };

  const handleDeleteView = async (viewId: string) => {
    await deleteSavedView(viewId);
    setSavedViews(prev => prev.filter(v => v.id !== viewId));
  };

  const handleSaveKit = async (params: {
    languageFilter: string;
    jurisdictionFilter: string;
    stageFilter: string;
    selectedAssetIds: string[];
    spanishOnlyEnforced: boolean;
    printOptimized: boolean;
    kitContent: string;
  }) => {
    if (!user) return;
    await saveKitGeneration({
      generatedBy: user.id,
      ...params,
    });
  };

  const handleCopyWithTracking = useCallback((text: string, id: string) => {
    copyContent(text, id);
    if (user && id.startsWith('asset-') && id.endsWith('-full')) {
      const slug = id.replace('asset-', '').replace('-full', '');
      const asset = assets.find(a => a.slug === slug);
      if (asset) {
        recordDownload(asset.id, user.id, null, 'full_download');
      }
    }
  }, [copyContent, user, assets]);

  const handleDownloadPDF = useCallback(async (asset: PartnerAsset) => {
    await exportAssetContentAsPDF(asset);
    if (user) {
      recordDownload(asset.id, user.id, null, 'pdf_download');
      await logDistribution({
        assetId: asset.id,
        sentBy: user.id,
        recipients: [],
        channel: 'download',
        notes: 'PDF download',
      });
    }
  }, [user]);

  const handleSendEmail = useCallback((asset: PartnerAsset) => {
    setEmailAsset(asset);
  }, []);

  const handleExportKitPDF = useCallback(async (
    selectedAssets: PartnerAsset[],
    kitOptions: { language: string; jurisdiction: string; stage: string }
  ) => {
    await exportKitAsPDF(selectedAssets, kitOptions);
    if (user) {
      await logDistribution({
        assetId: selectedAssets[0]?.id || '',
        sentBy: user.id,
        recipients: [],
        channel: 'download',
        notes: `Kit PDF export (${selectedAssets.length} assets)`,
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" aria-label="Loading assets" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-4">
          <SpanishParityPanel parity={spanishParity} onResolve={handleResolve} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ReadinessSummaryCard assets={assets} />
        <TopAssetCard assets={assets} />
        <KitGeneratorCard onOpen={() => setShowKitModal(true)} />
      </div>

      <AssetFilterBar
        filters={filters}
        onFilterChange={setFilters}
        savedViews={savedViews}
        onSaveView={handleSaveView}
        onLoadView={handleLoadView}
        onDeleteView={handleDeleteView}
        assets={assets}
        resultCount={sortedAssets.length}
      />

      <div className="space-y-3" role="list" aria-label="Partner assets list">
        {sortedAssets.map(asset => (
          <AssetCard
            key={asset.id}
            asset={asset}
            expanded={expandedTile === `asset-${asset.slug}`}
            onToggle={() => {
              toggleTile(`asset-${asset.slug}`);
              if (resolveTargetId && resolveTargetId !== asset.id) {
                setResolveTargetId(null);
              }
            }}
            onCopy={handleCopyWithTracking}
            copiedId={copiedId}
            isAdmin={isAdmin}
            userId={user?.id}
            onReadinessUpdate={reloadAssets}
            initialTab={resolveTargetId === asset.id ? 'governance' : undefined}
            onDownloadPDF={handleDownloadPDF}
            onSendEmail={handleSendEmail}
            onResolve={handleResolve}
          />
        ))}
        {sortedAssets.length === 0 && (
          <div className="text-center py-8 text-navy-400 text-sm">
            No assets match the current filters. Try adjusting your criteria.
          </div>
        )}
      </div>

      {showKitModal && (
        <PartnerKitModal
          assets={assets}
          onClose={() => setShowKitModal(false)}
          onCopy={copyContent}
          copiedId={copiedId}
          onSaveKit={handleSaveKit}
          onExportPDF={handleExportKitPDF}
        />
      )}

      {emailAsset && user && (
        <EmailDistributionModal
          asset={emailAsset}
          userId={user.id}
          onClose={() => setEmailAsset(null)}
        />
      )}
    </div>
  );
}
