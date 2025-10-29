/**
 * Advanced Filter Component
 * Multi-faceted filtering for articles and events
 */

import { useState } from 'react';
import { GlassCard, GlowButton, Badge, Input } from '../primitives';
import { ChevronDown } from 'lucide-react';

export interface FilterState {
  lob: string[];
  perils: string[];
  regions: string[];
  companies: string[];
  riskPulse: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterState) => void;
  onSave?: (name: string) => void;
}

const LOB_OPTIONS = [
  'Commercial Auto',
  'General Liability',
  'Property',
  'Workers Comp',
  'Cyber',
  'Professional Liability',
];

const PERIL_OPTIONS = [
  'Wildfire',
  'Hurricane',
  'Flood',
  'Earthquake',
  'Hail',
  'Tornado',
  'Winter Storm',
];

const REGION_OPTIONS = [
  'Northeast',
  'Southeast',
  'Midwest',
  'Southwest',
  'West Coast',
  'National',
];

const RISK_PULSE_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

export function AdvancedFilter({ onFilterChange, onSave }: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    lob: [],
    perils: [],
    regions: [],
    companies: [],
    riskPulse: [],
    dateRange: {
      start: '',
      end: '',
    },
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    lob: true,
    perils: true,
    regions: false,
    companies: false,
    riskPulse: false,
    dateRange: false,
  });

  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFilter = (category: keyof Omit<FilterState, 'dateRange'>, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev };
      const arr = updated[category] as string[];
      const index = arr.indexOf(value);
      if (index > -1) {
        arr.splice(index, 1);
      } else {
        arr.push(value);
      }
      onFilterChange(updated);
      return updated;
    });
  };

  const updateDateRange = (field: 'start' | 'end', value: string) => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        dateRange: { ...prev.dateRange, [field]: value },
      };
      onFilterChange(updated);
      return updated;
    });
  };

  const clearFilters = () => {
    const empty: FilterState = {
      lob: [],
      perils: [],
      regions: [],
      companies: [],
      riskPulse: [],
      dateRange: { start: '', end: '' },
    };
    setFilters(empty);
    onFilterChange(empty);
  };

  const handleSaveFilter = () => {
    if (filterName.trim() && onSave) {
      onSave(filterName);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const activeFilterCount = [
    ...filters.lob,
    ...filters.perils,
    ...filters.regions,
    ...filters.companies,
    ...filters.riskPulse,
  ].length;

  return (
    <GlassCard variant="premium" className="w-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#0F172A]">Advanced Filters</h3>
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">
                {activeFilterCount} active
              </Badge>
              <button
                onClick={clearFilters}
                className="text-xs text-[#64748B] hover:text-[#5AA6FF] transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* LOB Filter */}
        <FilterSection
          title="Lines of Business"
          expanded={expandedSections.lob}
          onToggle={() => toggleSection('lob')}
        >
          <div className="grid grid-cols-2 gap-2">
            {LOB_OPTIONS.map((lob) => (
              <label key={lob} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.lob.includes(lob)}
                  onChange={() => toggleFilter('lob', lob)}
                  className="w-4 h-4 rounded border-[#C7D2E1] text-[#5AA6FF]"
                />
                <span className="text-sm text-[#0F172A]">{lob}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Peril Filter */}
        <FilterSection
          title="Perils"
          expanded={expandedSections.perils}
          onToggle={() => toggleSection('perils')}
        >
          <div className="grid grid-cols-2 gap-2">
            {PERIL_OPTIONS.map((peril) => (
              <label key={peril} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.perils.includes(peril)}
                  onChange={() => toggleFilter('perils', peril)}
                  className="w-4 h-4 rounded border-[#C7D2E1] text-[#5AA6FF]"
                />
                <span className="text-sm text-[#0F172A]">{peril}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Region Filter */}
        <FilterSection
          title="Regions"
          expanded={expandedSections.regions}
          onToggle={() => toggleSection('regions')}
        >
          <div className="grid grid-cols-2 gap-2">
            {REGION_OPTIONS.map((region) => (
              <label key={region} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.regions.includes(region)}
                  onChange={() => toggleFilter('regions', region)}
                  className="w-4 h-4 rounded border-[#C7D2E1] text-[#5AA6FF]"
                />
                <span className="text-sm text-[#0F172A]">{region}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Risk Pulse Filter */}
        <FilterSection
          title="Risk Pulse"
          expanded={expandedSections.riskPulse}
          onToggle={() => toggleSection('riskPulse')}
        >
          <div className="flex gap-2">
            {RISK_PULSE_OPTIONS.map((pulse) => (
              <button
                key={pulse}
                onClick={() => toggleFilter('riskPulse', pulse)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filters.riskPulse.includes(pulse)
                    ? 'bg-[#5AA6FF] text-white'
                    : 'bg-[#E8F2FF] text-[#5AA6FF] hover:bg-[#D8E8FF]'
                }`}
              >
                {pulse}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Date Range Filter */}
        <FilterSection
          title="Date Range"
          expanded={expandedSections.dateRange}
          onToggle={() => toggleSection('dateRange')}
        >
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => updateDateRange('start', e.target.value)}
              label="From"
            />
            <Input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => updateDateRange('end', e.target.value)}
              label="To"
            />
          </div>
        </FilterSection>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-[#C7D2E1]/20">
          <GlowButton
            variant="primary"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            disabled={activeFilterCount === 0}
          >
            Save Filter
          </GlowButton>
          <GlowButton variant="secondary" size="sm" onClick={clearFilters}>
            Reset
          </GlowButton>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="p-3 bg-[#F9FBFF] border border-[#C7D2E1] rounded-lg space-y-2">
            <Input
              placeholder="Filter name (e.g., 'High Risk Catastrophes')"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            <div className="flex gap-2">
              <GlowButton variant="primary" size="sm" onClick={handleSaveFilter}>
                Save
              </GlowButton>
              <GlowButton variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </GlowButton>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

interface FilterSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, expanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-[#C7D2E1]/20 pb-3 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-semibold text-[#0F172A] hover:text-[#5AA6FF] transition-colors"
      >
        {title}
        <ChevronDown
          size={16}
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

