interface FilterPanelProps {
  filters: {
    searchQuery: string;
    source?: string;
  };
  onFiltersChange: (filters: any) => void;
  filterOptions: {
    sources: string[];
  };
  isOpen: boolean;
  onToggle: () => void;
  activeFilterCount: number;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  filterOptions,
  isOpen,
  onToggle,
  activeFilterCount,
}: FilterPanelProps) {
  const handleSearchChange = (query: string) => {
    onFiltersChange({ ...filters, searchQuery: query });
  };

  const handleSourceChange = (source: string) => {
    onFiltersChange({
      ...filters,
      source: filters.source === source ? undefined : source
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchQuery: '',
      source: undefined,
    });
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Search & Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full font-bold shadow-md">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-slideInDown hover:shadow-2xl transition-shadow duration-300">
          {/* Accent line */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 opacity-60"></div>

          {/* Search */}
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Search Articles</label>
            <input
              type="text"
              placeholder="Enter keywords..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300"
            />
          </div>

          {/* Source Filter */}
          {filterOptions.sources.length > 0 && (
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Filter by Source</h3>
              <div className="space-y-2.5">
                {filterOptions.sources.map((source) => (
                  <label key={source} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-all duration-300 border border-transparent hover:border-slate-200">
                    <input
                      type="radio"
                      name="source"
                      checked={filters.source === source}
                      onChange={() => handleSourceChange(source)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 font-semibold">{source}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

