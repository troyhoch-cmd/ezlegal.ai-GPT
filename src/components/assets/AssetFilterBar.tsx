import { useState } from 'react';
import {
  Filter, Save, Trash2, ChevronDown, Star, X
} from 'lucide-react';
import type { AssetFilters, SavedView, PartnerAsset } from '../../services/asset-service';

interface AssetFilterBarProps {
  filters: AssetFilters;
  onFilterChange: (filters: AssetFilters) => void;
  savedViews: SavedView[];
  onSaveView: (name: string) => void;
  onLoadView: (view: SavedView) => void;
  onDeleteView: (viewId: string) => void;
  assets: PartnerAsset[];
  resultCount: number;
}

export function AssetFilterBar({
  filters,
  onFilterChange,
  savedViews,
  onSaveView,
  onLoadView,
  onDeleteView,
  assets,
  resultCount,
}: AssetFilterBarProps) {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [viewName, setViewName] = useState('');
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);

  const allJurisdictions = [...new Set(assets.flatMap(a => a.jurisdictions))].sort();
  const allStages = [...new Set(assets.flatMap(a => a.pipeline_stages))].sort();
  const allTypes = [...new Set(assets.map(a => a.asset_type))].sort();
  const allTeams = [...new Set(assets.map(a => a.owner_team))].sort();

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => {
    if (k === 'recommended_only') return v === true;
    return v && v !== 'all';
  });

  const clearFilters = () => {
    onFilterChange({
      language: 'all',
      jurisdiction: 'all',
      pipeline_stage: 'all',
      readiness: 'all',
      asset_type: 'all',
      owner_team: 'all',
      recommended_only: false,
    });
  };

  const handleSave = () => {
    if (viewName.trim()) {
      onSaveView(viewName.trim());
      setViewName('');
      setShowSaveInput(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-navy-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-navy-500" />
          <span className="text-xs font-bold text-navy-700 uppercase tracking-wider">Filters</span>
          <span className="text-[10px] text-navy-400 ml-1">{resultCount} asset{resultCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          {savedViews.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                className="flex items-center gap-1 text-xs text-navy-500 hover:text-navy-700 transition-colors px-2 py-1 rounded-md hover:bg-navy-50"
                aria-expanded={showViewsDropdown}
                aria-haspopup="listbox"
              >
                <Save className="w-3 h-3" />
                Saved Views
                <ChevronDown className="w-3 h-3" />
              </button>
              {showViewsDropdown && (
                <div
                  className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-navy-200 py-1 z-20 min-w-[200px]"
                  role="listbox"
                >
                  {savedViews.map(view => (
                    <div key={view.id} className="flex items-center justify-between px-3 py-2 hover:bg-navy-50 group">
                      <button
                        onClick={() => { onLoadView(view); setShowViewsDropdown(false); }}
                        className="text-xs text-navy-700 font-medium flex-1 text-left"
                        role="option"
                      >
                        {view.is_default && <Star className="w-3 h-3 text-amber-400 inline mr-1" />}
                        {view.name}
                      </button>
                      <button
                        onClick={() => onDeleteView(view.id)}
                        className="opacity-0 group-hover:opacity-100 text-navy-400 hover:text-red-500 ml-2"
                        aria-label={`Delete saved view ${view.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {hasActiveFilters && (
            <>
              {!showSaveInput ? (
                <button
                  onClick={() => setShowSaveInput(true)}
                  className="text-xs text-teal-600 hover:text-teal-500 font-semibold"
                >
                  Save View
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={viewName}
                    onChange={e => setViewName(e.target.value)}
                    placeholder="View name..."
                    className="text-xs border border-navy-200 rounded px-2 py-1 w-32 focus:ring-1 focus:ring-teal-500 outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    autoFocus
                  />
                  <button onClick={handleSave} className="text-xs text-teal-600 font-semibold px-1">Save</button>
                  <button onClick={() => setShowSaveInput(false)} className="text-navy-400"><X className="w-3 h-3" /></button>
                </div>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-navy-400 hover:text-red-500 font-medium"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        <FilterSelect
          label="Language"
          value={filters.language || 'all'}
          onChange={v => onFilterChange({ ...filters, language: v as AssetFilters['language'] })}
          options={[
            { value: 'all', label: 'All Languages' },
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'both', label: 'EN + ES' },
          ]}
        />
        <FilterSelect
          label="Readiness"
          value={filters.readiness || 'all'}
          onChange={v => onFilterChange({ ...filters, readiness: v as AssetFilters['readiness'] })}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'ready', label: 'Ready' },
            { value: 'partial', label: 'Partial' },
            { value: 'blocked', label: 'Blocked' },
          ]}
        />
        <FilterSelect
          label="Jurisdiction"
          value={filters.jurisdiction || 'all'}
          onChange={v => onFilterChange({ ...filters, jurisdiction: v })}
          options={[
            { value: 'all', label: 'All Jurisdictions' },
            ...allJurisdictions.map(j => ({ value: j, label: j })),
          ]}
        />
        <FilterSelect
          label="Stage"
          value={filters.pipeline_stage || 'all'}
          onChange={v => onFilterChange({ ...filters, pipeline_stage: v })}
          options={[
            { value: 'all', label: 'All Stages' },
            ...allStages.map(s => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Type"
          value={filters.asset_type || 'all'}
          onChange={v => onFilterChange({ ...filters, asset_type: v })}
          options={[
            { value: 'all', label: 'All Types' },
            ...allTypes.map(t => ({ value: t, label: t.toUpperCase() })),
          ]}
        />
        <FilterSelect
          label="Team"
          value={filters.owner_team || 'all'}
          onChange={v => onFilterChange({ ...filters, owner_team: v })}
          options={[
            { value: 'all', label: 'All Teams' },
            ...allTeams.map(t => ({ value: t, label: t })),
          ]}
        />
        <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-navy-200 cursor-pointer hover:bg-navy-50 transition-colors">
          <input
            type="checkbox"
            checked={filters.recommended_only || false}
            onChange={e => onFilterChange({ ...filters, recommended_only: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-navy-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-[10px] font-semibold text-navy-600 whitespace-nowrap">
            <Star className="w-3 h-3 inline text-amber-400 mr-0.5" />Recommended
          </span>
        </label>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-[9px] font-bold text-navy-400 uppercase tracking-wider block mb-0.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-[11px] border border-navy-200 rounded-lg px-2 py-1.5 text-navy-700 bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
        aria-label={`Filter by ${label}`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
