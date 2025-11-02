/**
 * WatchlistManager Component
 * Manages user watchlists for carriers, states, and topics
 */

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { MAJOR_CARRIERS, US_STATES } from '../constants/news';

interface WatchlistManagerProps {
  userId?: string;
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({ userId }) => {
  const { items, loading, error, addItem, removeItem, updateWeight } = useWatchlist({ userId });
  const [activeTab, setActiveTab] = useState<'carriers' | 'states' | 'topics'>('carriers');
  const [newValue, setNewValue] = useState('');

  const handleAddItem = async () => {
    if (!newValue.trim()) return;

    await addItem(activeTab === 'carriers' ? 'carrier' : activeTab === 'states' ? 'state' : 'topic', newValue);
    setNewValue('');
  };

  const handleRemoveItem = async (id: string) => {
    await removeItem(id);
  };

  const handleWeightChange = async (id: string, weight: number) => {
    await updateWeight(id, weight);
  };

  const carrierItems = items.filter(item => item.type === 'carrier');
  const stateItems = items.filter(item => item.type === 'state');
  const topicItems = items.filter(item => item.type === 'topic');

  if (loading) {
    return <div className="p-4 text-[#8B8B9A]">Loading watchlist...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
      <h2 className="text-lg font-semibold text-[#0D0D0D] mb-4">My Watchlist</h2>

      {error && (
        <div className="bg-[#FEE2E2] border border-[#EF4444]/20 text-[#EF4444] p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-[#E5E7EB]">
        {(['carriers', 'states', 'topics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-all duration-200 ${
              activeTab === tab
                ? 'text-[#10A37F] border-b-2 border-[#10A37F]'
                : 'text-[#8B8B9A] hover:text-[#565869]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="ml-2 text-xs bg-[#E8F5F0] text-[#10A37F] px-2 py-1 rounded-full">
                {activeTab === 'carriers'
                  ? carrierItems.length
                  : activeTab === 'states'
                    ? stateItems.length
                    : topicItems.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add Item */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAddItem()}
          placeholder={`Add ${activeTab.slice(0, -1)}...`}
          list={activeTab === 'carriers' ? 'carriers-list' : activeTab === 'states' ? 'states-list' : undefined}
          className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#0D0D0D] placeholder-[#ABABBA] focus:outline-none focus:ring-2 focus:ring-[#10A37F]/20 focus:border-[#10A37F] transition-all"
        />
        {activeTab === 'carriers' && (
          <datalist id="carriers-list">
            {MAJOR_CARRIERS.map(carrier => (
              <option key={carrier} value={carrier} />
            ))}
          </datalist>
        )}
        {activeTab === 'states' && (
          <datalist id="states-list">
            {US_STATES.map(state => (
              <option key={state} value={state} />
            ))}
          </datalist>
        )}
        <button
          onClick={handleAddItem}
          disabled={!newValue.trim()}
          className="px-4 py-2 bg-[#10A37F] text-white rounded-lg hover:bg-[#0D8B6F] disabled:opacity-50 transition-all duration-200 flex items-center gap-2 font-medium text-sm"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {(activeTab === 'carriers'
          ? carrierItems
          : activeTab === 'states'
            ? stateItems
            : topicItems
        ).length === 0 ? (
          <p className="text-[#ABABBA] text-sm text-center py-4">No items in this category</p>
        ) : (
          (activeTab === 'carriers'
            ? carrierItems
            : activeTab === 'states'
              ? stateItems
              : topicItems
          ).map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-[#F7F7F8] rounded-lg border border-[#E5E7EB]">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0D0D0D]">{item.value}</p>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={item.weight}
                    onChange={e => handleWeightChange(item.id, parseFloat(e.target.value))}
                    className="w-20 h-2 accent-[#10A37F]"
                  />
                  <span className="text-xs text-[#8B8B9A]">{Math.round(item.weight * 100)}%</span>
                </div>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="p-1 text-[#ABABBA] hover:text-[#EF4444] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

