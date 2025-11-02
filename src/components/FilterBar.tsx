/**
 * FilterBar Component
 * Provides filtering options for news signals
 */

import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { LOB_OPTIONS, REGULATOR_OPTIONS, US_STATES } from '../constants/news';
import type { NewsFilterState } from '../types/news';

interface FilterBarProps {
  filters: NewsFilterState;
  onFiltersChange: (filters: NewsFilterState) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleTimeWindowChange = (window: 'today' | 'week' | 'month' | 'all') => {
    onFiltersChange({ ...filters, timeWindow: window });
  };

  const handleStateToggle = (state: string) => {
    const states = filters.states || [];
    const updated = states.includes(state as any)
      ? states.filter(s => s !== state)
      : [...states, state as any];
    onFiltersChange({ ...filters, states: updated });
  };

  const handleLobToggle = (lob: string) => {
    const lobs = filters.lobs || [];
    const updated = lobs.includes(lob as any)
      ? lobs.filter(l => l !== lob)
      : [...lobs, lob as any];
    onFiltersChange({ ...filters, lobs: updated });
  };

  const handleRegulatorToggle = (regulator: string) => {
    const regulators = filters.regulators || [];
    const updated = regulators.includes(regulator as any)
      ? regulators.filter(r => r !== regulator)
      : [...regulators, regulator as any];
    onFiltersChange({ ...filters, regulators: updated });
  };

  const handleHazardToggle = () => {
    onFiltersChange({ ...filters, hazardOnly: !filters.hazardOnly });
  };

  const handleWatchlistToggle = () => {
    onFiltersChange({ ...filters, watchlistOnly: !filters.watchlistOnly });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.timeWindow ||
    (filters.states && filters.states.length > 0) ||
    (filters.lobs && filters.lobs.length > 0) ||
    (filters.regulators && filters.regulators.length > 0) ||
    filters.hazardOnly ||
    filters.watchlistOnly;

  return (
    <div className="bg-white border-b border-[#E5E7EB] p-4 space-y-3">
      {/* Time Window */}
      <div className="flex gap-2 flex-wrap">
        {(['today', 'week', 'month', 'all'] as const).map(window => (
          <button
            key={window}
            onClick={() => handleTimeWindowChange(window)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              filters.timeWindow === window
                ? 'bg-[#10A37F] text-white border border-[#10A37F]'
                : 'bg-[#F7F7F8] text-[#565869] border border-[#E5E7EB] hover:border-[#D1D5DB]'
            }`}
          >
            {window.charAt(0).toUpperCase() + window.slice(1)}
          </button>
        ))}
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        {/* States */}
        <div className="border border-[#E5E7EB] rounded-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === 'states' ? null : 'states')}
            className="w-full flex items-center justify-between p-3 hover:bg-[#F7F7F8] transition-colors"
          >
            <span className="text-sm font-medium text-[#0D0D0D]">
              States {filters.states && filters.states.length > 0 && `(${filters.states.length})`}
            </span>
            <ChevronDown size={16} className={`transition-transform text-[#8B8B9A] ${expandedSection === 'states' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'states' && (
            <div className="p-3 border-t border-[#E5E7EB] grid grid-cols-6 gap-2 max-h-48 overflow-y-auto bg-[#F7F7F8]">
              {US_STATES.map(state => (
                <label key={state} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.states?.includes(state) || false}
                    onChange={() => handleStateToggle(state)}
                    className="w-4 h-4 rounded border-[#D1D5DB] accent-[#10A37F]"
                  />
                  <span className="text-xs text-[#565869]">{state}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* LOBs */}
        <div className="border border-[#E5E7EB] rounded-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === 'lobs' ? null : 'lobs')}
            className="w-full flex items-center justify-between p-3 hover:bg-[#F7F7F8] transition-colors"
          >
            <span className="text-sm font-medium text-[#0D0D0D]">
              Lines of Business {filters.lobs && filters.lobs.length > 0 && `(${filters.lobs.length})`}
            </span>
            <ChevronDown size={16} className={`transition-transform text-[#8B8B9A] ${expandedSection === 'lobs' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'lobs' && (
            <div className="p-3 border-t border-[#E5E7EB] space-y-2 max-h-48 overflow-y-auto bg-[#F7F7F8]">
              {LOB_OPTIONS.map(lob => (
                <label key={lob} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.lobs?.includes(lob) || false}
                    onChange={() => handleLobToggle(lob)}
                    className="w-4 h-4 rounded border-[#D1D5DB] accent-[#10A37F]"
                  />
                  <span className="text-sm text-[#565869]">{lob}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Regulators */}
        <div className="border border-[#E5E7EB] rounded-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === 'regulators' ? null : 'regulators')}
            className="w-full flex items-center justify-between p-3 hover:bg-[#F7F7F8] transition-colors"
          >
            <span className="text-sm font-medium text-[#0D0D0D]">
              Regulators {filters.regulators && filters.regulators.length > 0 && `(${filters.regulators.length})`}
            </span>
            <ChevronDown size={16} className={`transition-transform text-[#8B8B9A] ${expandedSection === 'regulators' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'regulators' && (
            <div className="p-3 border-t border-[#E5E7EB] space-y-2 max-h-48 overflow-y-auto bg-[#F7F7F8]">
              {REGULATOR_OPTIONS.map(regulator => (
                <label key={regulator} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.regulators?.includes(regulator) || false}
                    onChange={() => handleRegulatorToggle(regulator)}
                    className="w-4 h-4 rounded border-[#D1D5DB] accent-[#10A37F]"
                  />
                  <span className="text-sm text-[#565869]">{regulator}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toggle Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleHazardToggle}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            filters.hazardOnly
              ? 'bg-[#FEF3C7] text-[#F59E0B] border border-[#F59E0B]/30'
              : 'bg-[#F7F7F8] text-[#565869] border border-[#E5E7EB] hover:border-[#D1D5DB]'
          }`}
        >
          🌪️ Hazards Only
        </button>
        <button
          onClick={handleWatchlistToggle}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            filters.watchlistOnly
              ? 'bg-[#E8F5F0] text-[#10A37F] border border-[#10A37F]/30'
              : 'bg-[#F7F7F8] text-[#565869] border border-[#E5E7EB] hover:border-[#D1D5DB]'
          }`}
        >
          ⭐ Watchlist Only
        </button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-sm text-[#8B8B9A] hover:text-[#0D0D0D] transition-colors"
        >
          <X size={14} />
          Clear all filters
        </button>
      )}
    </div>
  );
};

