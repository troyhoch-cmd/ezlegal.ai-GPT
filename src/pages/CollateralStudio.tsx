import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Clock, CheckCircle2, Send, Loader2, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PartnerAsset {
  id: string;
  name: string;
  slug: string;
  asset_type: string;
  description: string;
  audience: string;
  content_sections: Array<{ heading: string; content: string[] }>;
}

interface Draft {
  id: string;
  asset_id: string;
  title: string;
  status: 'draft' | 'ready' | 'sent' | 'archived';
  version: number;
  updated_at: string;
}

const STATUS_STYLE: Record<Draft['status'], string> = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  ready: 'bg-teal-50 text-teal-700 border-teal-200',
  sent: 'bg-navy-100 text-navy-700 border-navy-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function CollateralStudio() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [assets, setAssets] = useState<PartnerAsset[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: a }, { data: d }] = await Promise.all([
        supabase
          .from('partner_assets')
          .select('id, name, slug, asset_type, description, audience, content_sections')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('collateral_drafts')
          .select('id, asset_id, title, status, version, updated_at')
          .order('updated_at', { ascending: false }),
      ]);
      if (cancelled) return;
      setAssets((a as PartnerAsset[]) ?? []);
      setDrafts((d as Draft[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const draftsByAsset = useMemo(() => {
    const map = new Map<string, Draft[]>();
    drafts.forEach((d) => {
      const list = map.get(d.asset_id) ?? [];
      list.push(d);
      map.set(d.asset_id, list);
    });
    return map;
  }, [drafts]);

  const filteredAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q),
    );
  }, [assets, query]);

  async function createDraft(asset: PartnerAsset) {
    if (!profile?.id) return;
    setCreatingFor(asset.id);
    const { data, error } = await supabase
      .from('collateral_drafts')
      .insert({
        asset_id: asset.id,
        title: asset.name,
        subtitle: asset.audience,
        content_sections: asset.content_sections ?? [],
        created_by: profile.id,
        updated_by: profile.id,
      })
      .select('id')
      .maybeSingle();
    setCreatingFor(null);
    if (error || !data) {
      alert(`Could not create draft: ${error?.message ?? 'unknown error'}`);
      return;
    }
    navigate(`/admin/collateral/${data.id}`);
  }

  const recentDrafts = drafts.slice(0, 6);

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">
              Admin / Collateral Studio
            </p>
            <h1 className="text-3xl font-bold text-navy-900">Marketing Collateral</h1>
            <p className="text-navy-600 mt-1 max-w-2xl">
              Browse approved templates, customise the copy, embed QR codes, and export or email a
              finished PDF.
            </p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates"
              className="pl-9 pr-4 py-2.5 w-full lg:w-80 border border-navy-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-navy-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading templates
          </div>
        ) : (
          <>
            {recentDrafts.length > 0 && (
              <section className="mb-10">
                <h2 className="text-sm font-semibold text-navy-900 mb-3 uppercase tracking-wider">
                  Recent drafts
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recentDrafts.map((d) => (
                    <Link
                      key={d.id}
                      to={`/admin/collateral/${d.id}`}
                      className="group bg-white border border-navy-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-navy-900 truncate">{d.title}</p>
                          <p className="text-xs text-navy-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            v{d.version} &middot; {new Date(d.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[d.status]}`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <div className="flex items-center text-teal-700 text-sm font-medium">
                        Open editor
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm font-semibold text-navy-900 mb-3 uppercase tracking-wider">
                Templates ({filteredAssets.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAssets.map((a) => {
                  const assetDrafts = draftsByAsset.get(a.id) ?? [];
                  return (
                    <div
                      key={a.id}
                      className="bg-white border border-navy-200 rounded-xl overflow-hidden flex flex-col"
                    >
                      <div className="p-5 flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-navy-900">{a.name}</p>
                            <p className="text-xs text-navy-500 mt-0.5 uppercase">
                              {a.asset_type || 'template'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-navy-700 line-clamp-2 mb-3">{a.description}</p>
                        {assetDrafts.length > 0 && (
                          <div className="space-y-1">
                            {assetDrafts.slice(0, 2).map((d) => (
                              <Link
                                key={d.id}
                                to={`/admin/collateral/${d.id}`}
                                className="flex items-center justify-between text-xs bg-navy-50 hover:bg-teal-50 rounded-md px-2 py-1.5 text-navy-700"
                              >
                                <span className="truncate">
                                  v{d.version} &middot; {d.title}
                                </span>
                                {d.status === 'ready' && (
                                  <CheckCircle2 className="w-3 h-3 text-teal-600 ml-2 flex-shrink-0" />
                                )}
                                {d.status === 'sent' && (
                                  <Send className="w-3 h-3 text-navy-500 ml-2 flex-shrink-0" />
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => createDraft(a)}
                        disabled={creatingFor === a.id}
                        className="px-5 py-3 border-t border-navy-200 text-sm font-medium text-teal-700 hover:bg-teal-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                      >
                        {creatingFor === a.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        New draft
                      </button>
                    </div>
                  );
                })}
              </div>
              {filteredAssets.length === 0 && (
                <p className="text-navy-500 text-sm">No templates match your search.</p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
