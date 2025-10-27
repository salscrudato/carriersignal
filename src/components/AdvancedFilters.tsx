import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface FilterState {
  lob: string[];
  perils: string[];
  regions: string[];
  impactLevel: string[];
  regulatory: boolean | null;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  articles: any[];
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedFilters({ onFilterChange, articles, isOpen, onClose }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    lob: [],
    perils: [],
    regions: [],
    impactLevel: [],
    regulatory: null,
  });

  // Extract unique values from articles
  const extractUnique = (key: keyof any) => {
    const values = new Set<string>();
    articles.forEach(article => {
      if (article.tags?.[key]) {
        article.tags[key].forEach((v: string) => values.add(v));
      }
    });
    return Array.from(values).sort();
  };

  const lobs = extractUnique('lob');
  const perils = extractUnique('perils');
  const regions = extractUnique('regions');

  const handleFilterChange = (category: keyof FilterState, value: string) => {
    const newFilters = { ...filters };
    if (category === 'regulatory') {
      newFilters.regulatory = newFilters.regulatory === true ? null : true;
    } else if (Array.isArray(newFilters[category])) {
      const arr = newFilters[category] as string[];
      if (arr.includes(value)) {
        newFilters[category] = arr.filter(v => v !== value);
      } else {
        newFilters[category] = [...arr, value];
      }
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      lob: [],
      perils: [],
      regions: [],
      impactLevel: [],
      regulatory: null,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center md:justify-center" onClick={onClose}>
      <div
        className="w-full md:w-96 bg-white rounded-t-2xl md:rounded-2xl liquid-glass border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-lg font-bold text-slate-900">Advanced Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 space-y-6">
          {/* Lines of Business */}
          <FilterSection title="Lines of Business" items={lobs} selected={filters.lob} onChange={(v) => handleFilterChange('lob', v)} />

          {/* Perils */}
          <FilterSection title="Perils" items={perils} selected={filters.perils} onChange={(v) => handleFilterChange('perils', v)} />

          {/* Regions */}
          <FilterSection title="Regions" items={regions} selected={filters.regions} onChange={(v) => handleFilterChange('regions', v)} />

          {/* Impact Level */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Impact Level</h3>
            <div className="space-y-2">
              {['High', 'Medium', 'Low'].map((level) => (
                <label key={level} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.impactLevel.includes(level)}
                    onChange={() => handleFilterChange('impactLevel', level)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Regulatory */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Regulatory</h3>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.regulatory === true}
                onChange={() => handleFilterChange('regulatory', '')}
                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">Regulatory News Only</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  items: string[];
  selected: string[];
  onChange: (value: string) => void;
}

function FilterSection({ title, items, selected, onChange }: FilterSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
        <ChevronDown size={16} className={`text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="space-y-2">
          {items.map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => onChange(item)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{item}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

