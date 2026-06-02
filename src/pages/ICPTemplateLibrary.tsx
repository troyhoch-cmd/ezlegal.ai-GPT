import { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Search,
  ExternalLink,
  MapPin,
  Tag,
  Loader2,
  Download,
  X,
  Building2,
} from 'lucide-react';
import {
  listCategories,
  listTemplates,
  ICPCategory,
  ICPTemplate,
} from '../services/icp-template-service';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

export default function ICPTemplateLibrary() {
  const [categories, setCategories] = useState<ICPCategory[]>([]);
  const [templates, setTemplates] = useState<ICPTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [state, setState] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [selected, setSelected] = useState<ICPTemplate | null>(null);

  useEffect(() => {
    listCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listTemplates({
      jurisdiction: state || undefined,
      categoryId: categoryId || undefined,
      query: query || undefined,
      limit: 200,
    })
      .then((rows) => {
        if (!cancelled) setTemplates(rows);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state, categoryId, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, ICPTemplate[]>();
    for (const t of templates) {
      const key = t.category_id ?? 'uncat';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [templates]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Independent Contractor Template Library
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-3xl">
            State-official forms, agreements, and compliance documents for independent contractors.
            Always verify the latest version on the source agency's website before filing.
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="relative block">
            <span className="sr-only">Search templates</span>
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, e.g. W-9, LLC, workers comp"
              className="w-full pl-9 pr-3 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">State</span>
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" aria-hidden />
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full pl-9 pr-3 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All states</option>
              <option value="FED">Federal</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="relative block">
            <span className="sr-only">Category</span>
            <Tag className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" aria-hidden />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full pl-9 pr-3 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
            <span>Loading templates...</span>
          </div>
        )}

        {!loading && templates.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" aria-hidden />
            <h2 className="text-lg font-semibold text-slate-800">No templates match your filters</h2>
            <p className="text-sm text-slate-500 mt-1">Try clearing the state or category filter.</p>
          </div>
        )}

        {!loading && templates.length > 0 && (
          <div className="space-y-10">
            {categories.map((cat) => {
              const rows = grouped.get(cat.id) ?? [];
              if (!rows.length) return null;
              return (
                <div key={cat.id}>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">{cat.name}</h2>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{cat.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rows.map((t) => (
                      <TemplateCard key={t.id} t={t} onOpen={() => setSelected(t)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selected && <TemplateDetailModal t={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function TemplateCard({ t, onOpen }: { t: ICPTemplate; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group text-left w-full bg-white rounded-xl border border-slate-200 p-5 hover:border-teal-400 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      <header className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900 leading-snug">
            {t.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
            {t.jurisdiction}
            {t.source_agency ? ` - ${t.source_agency}` : ''}
          </p>
        </div>
      </header>
      {t.description && (
        <p className="text-sm text-slate-600 mt-3 leading-relaxed line-clamp-3">{t.description}</p>
      )}
      <footer className="mt-4 flex items-center justify-between text-sm">
        <span className="text-xs text-slate-500">v{t.version}</span>
        <span className="inline-flex items-center gap-1 text-teal-700 font-medium">
          View details <ExternalLink className="w-3.5 h-3.5" aria-hidden />
        </span>
      </footer>
    </button>
  );
}

function TemplateDetailModal({ t, onClose }: { t: ICPTemplate; onClose: () => void }) {
  const isPdf = t.file_url && /\.pdf($|\?)/i.test(t.file_url);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tmpl-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between p-6 border-b border-slate-200">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 id="tmpl-title" className="text-lg font-semibold text-slate-900 leading-snug">
                {t.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
                {t.jurisdiction}
                {t.source_agency ? ` - ${t.source_agency}` : ''} - v{t.version}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </header>

        <div className="p-6 overflow-y-auto space-y-4">
          {t.description && (
            <p className="text-sm text-slate-700 leading-relaxed">{t.description}</p>
          )}

          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            {t.source_agency && (
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" aria-hidden />
                <span>{t.source_agency}</span>
              </div>
            )}
            {t.source_url && (
              <div className="flex items-start gap-2 text-slate-700">
                <ExternalLink className="w-4 h-4 text-slate-400 mt-0.5" aria-hidden />
                <a
                  href={t.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 hover:text-teal-800 break-all"
                >
                  {t.source_url}
                </a>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
            This link points to the official government agency. Form numbers and versions change -
            always download the latest copy directly from the source before filing.
          </div>
        </div>

        <footer className="p-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
          {isPdf && (
            <a
              href={t.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
            >
              <Download className="w-4 h-4" aria-hidden /> Download PDF
            </a>
          )}
          {t.source_url && (
            <a
              href={t.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm font-medium hover:bg-slate-50"
            >
              <ExternalLink className="w-4 h-4" aria-hidden /> Open source site
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-100"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
