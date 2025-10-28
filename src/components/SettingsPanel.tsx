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
    const sort = localStorage.getItem('carriersignal_sort') as any;

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
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg liquid-glass-premium flex items-center justify-center border border-blue-200/30">
            <Settings size={20} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        </div>

        {/* Sort Preference */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Default Sort</h3>
          <p className="text-sm text-slate-600">Choose how articles are sorted by default</p>
          <div className="space-y-2">
            {SORT_OPTIONS.map(sort => {
              const IconComponent = sort.icon;
              return (
                <button
                  key={sort.id}
                  onClick={() => setSelectedSort(sort.id as any)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left flex items-center gap-3 ${
                    selectedSort === sort.id
                      ? 'liquid-glass-premium border-blue-300/50'
                      : 'liquid-glass-light border-blue-200/30 hover:border-blue-300/50'
                  }`}
                >
                  <div className="text-blue-600">
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{sort.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-6 border-t border-blue-200/20">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 liquid-glass-premium text-blue-700 rounded-lg hover:border-blue-300/50 transition-all duration-300 font-semibold border border-blue-200/30 elevated-glow"
          >
            <Save size={18} />
            Save Settings
          </button>
          {saved && (
            <div className="flex items-center gap-2 px-4 py-3 liquid-glass-light text-green-700 rounded-lg text-sm font-medium border border-green-200/30">
              <Check size={18} />
              Saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

