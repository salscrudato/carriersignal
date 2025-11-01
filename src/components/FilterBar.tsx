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
    <div className="bg-white border-b border-gray-200 p-4 space-y-3">
      {/* Time Window */}
      <div className="flex gap-2 flex-wrap">
        {(['today', 'week', 'month', 'all'] as const).map(window => (
          <button
            key={window}
            onClick={() => handleTimeWindowChange(window)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.timeWindow === window
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {window.charAt(0).toUpperCase() + window.slice(1)}
          </button>
        ))}
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        {/* States */}
        <div className="border border-gray-200 rounded">
          <button
            onClick={() => setExpandedSection(expandedSection === 'states' ? null : 'states')}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">
              States {filters.states && filters.states.length > 0 && `(${filters.states.length})`}
            </span>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'states' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'states' && (
            <div className="p-2 border-t border-gray-200 grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
              {US_STATES.map(state => (
                <label key={state} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.states?.includes(state) || false}
                    onChange={() => handleStateToggle(state)}
                    className="w-3 h-3"
                  />
                  <span className="text-xs text-gray-700">{state}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* LOBs */}
        <div className="border border-gray-200 rounded">
          <button
            onClick={() => setExpandedSection(expandedSection === 'lobs' ? null : 'lobs')}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">
              Lines of Business {filters.lobs && filters.lobs.length > 0 && `(${filters.lobs.length})`}
            </span>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'lobs' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'lobs' && (
            <div className="p-2 border-t border-gray-200 space-y-1 max-h-48 overflow-y-auto">
              {LOB_OPTIONS.map(lob => (
                <label key={lob} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.lobs?.includes(lob) || false}
                    onChange={() => handleLobToggle(lob)}
                    className="w-3 h-3"
                  />
                  <span className="text-sm text-gray-700">{lob}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Regulators */}
        <div className="border border-gray-200 rounded">
          <button
            onClick={() => setExpandedSection(expandedSection === 'regulators' ? null : 'regulators')}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">
              Regulators {filters.regulators && filters.regulators.length > 0 && `(${filters.regulators.length})`}
            </span>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'regulators' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'regulators' && (
            <div className="p-2 border-t border-gray-200 space-y-1 max-h-48 overflow-y-auto">
              {REGULATOR_OPTIONS.map(regulator => (
                <label key={regulator} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.regulators?.includes(regulator) || false}
                    onChange={() => handleRegulatorToggle(regulator)}
                    className="w-3 h-3"
                  />
                  <span className="text-sm text-gray-700">{regulator}</span>
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
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            filters.hazardOnly
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🌪️ Hazards Only
        </button>
        <button
          onClick={handleWatchlistToggle}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            filters.watchlistOnly
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ⭐ Watchlist Only
        </button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X size={14} />
          Clear all filters
        </button>
      )}
    </div>
  );
};

