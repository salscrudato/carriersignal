import { useEffect, useState } from 'react';
import { Settings, Save, FileText, AlertCircle, Handshake, TrendingUp, Sparkles, Clock, Check } from 'lucide-react';

interface SettingsPanelProps {
  onRolesChange?: (roles: string[]) => void;
  onSortChange?: (sort: 'smart' | 'recency') => void;
}

const ROLE_OPTIONS = [
  { id: 'underwriting', label: 'Underwriting', icon: FileText },
  { id: 'claims', label: 'Claims', icon: AlertCircle },
  { id: 'brokerage', label: 'Brokerage', icon: Handshake },
  { id: 'actuarial', label: 'Actuarial', icon: TrendingUp },
];

const SORT_OPTIONS = [
  { id: 'smart', label: 'AI Sort (AI + Recency)', icon: Sparkles },
  { id: 'recency', label: 'Recent', icon: Clock },
];

export function SettingsPanel({
  onRolesChange,
  onSortChange,
}: SettingsPanelProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['underwriting']);
  const [selectedSort, setSelectedSort] = useState<'smart' | 'recency'>('smart');
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const roles = localStorage.getItem('carriersignal_roles');
    const sort = localStorage.getItem('carriersignal_sort') as any;

    if (roles) setSelectedRoles(JSON.parse(roles));
    if (sort) setSelectedSort(sort);
  }, []);

  const handleSave = () => {
    localStorage.setItem('carriersignal_roles', JSON.stringify(selectedRoles));
    localStorage.setItem('carriersignal_sort', selectedSort);

    onRolesChange?.(selectedRoles);
    onSortChange?.(selectedSort);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <Settings size={20} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        </div>

        {/* Roles Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Your Roles</h3>
          <p className="text-sm text-slate-600">Select your roles to personalize insights</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map(role => {
              const IconComponent = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedRoles.includes(role.id)
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="mb-2 text-blue-600">
                    <IconComponent size={24} />
                  </div>
                  <div className="font-semibold text-slate-900">{role.label}</div>
                </button>
              );
            })}
          </div>
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
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
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
        <div className="flex gap-3 pt-6 border-t border-slate-200">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold"
          >
            <Save size={18} />
            Save Settings
          </button>
          {saved && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
              <Check size={18} />
              Saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

