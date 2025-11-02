import { useEffect, useState } from 'react';
import { Settings, Save, Sparkles, Clock, Check } from 'lucide-react';

interface SettingsPanelProps {
  onSortChange?: (sort: 'smart' | 'recency') => void;
}

const SORT_OPTIONS = [
  { id: 'smart', label: 'AI Sort (AI + Recency)', icon: Sparkles },
  { id: 'recency', label: 'Recent', icon: Clock },
];

export function SettingsPanel({
  onSortChange,
}: SettingsPanelProps) {
  const [selectedSort, setSelectedSort] = useState<'smart' | 'recency'>('smart');
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const sort = localStorage.getItem('carriersignal_sort') as 'smart' | 'recency' | null;

    if (sort) setSelectedSort(sort);
  }, []);

  const handleSave = () => {
    localStorage.setItem('carriersignal_sort', selectedSort);

    onSortChange?.(selectedSort);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#E8F5F0] flex items-center justify-center border border-[#10A37F]/20">
            <Settings size={20} className="text-[#10A37F]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#0D0D0D]">Settings</h2>
        </div>

        {/* Sort Preference */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-[#0D0D0D]">Default Sort</h3>
          <p className="text-sm text-[#8B8B9A]">Choose how articles are sorted by default</p>
          <div className="space-y-2">
            {SORT_OPTIONS.map(sort => {
              const IconComponent = sort.icon;
              return (
                <button
                  key={sort.id}
                  onClick={() => setSelectedSort(sort.id as 'smart' | 'recency')}
                  className={`w-full p-4 rounded-lg border transition-all duration-200 text-left flex items-center gap-3 ${
                    selectedSort === sort.id
                      ? 'bg-[#E8F5F0] border-[#10A37F]/30 text-[#10A37F]'
                      : 'bg-white border-[#E5E7EB] text-[#565869] hover:border-[#D1D5DB] hover:bg-[#F7F7F8]'
                  }`}
                >
                  <div className={selectedSort === sort.id ? 'text-[#10A37F]' : 'text-[#8B8B9A]'}>
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <div className="font-medium">{sort.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#10A37F] text-white rounded-lg hover:bg-[#0D8B6F] transition-all duration-200 font-medium border border-[#10A37F]"
          >
            <Save size={18} />
            Save Settings
          </button>
          {saved && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#E8F5F0] text-[#10A37F] rounded-lg text-sm font-medium border border-[#10A37F]/20">
              <Check size={18} />
              Saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
