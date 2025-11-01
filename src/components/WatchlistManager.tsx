/**
 * WatchlistManager Component
 * Manages user watchlists for carriers, states, and topics
 */

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { MAJOR_CARRIERS, US_STATES } from '../constants/news';
import type { WatchlistItem } from '../types/news';

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
    return <div className="p-4 text-gray-600">Loading watchlist...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">My Watchlist</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {(['carriers', 'states', 'topics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
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
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
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
          <p className="text-gray-500 text-sm text-center py-4">No items in this category</p>
        ) : (
          (activeTab === 'carriers'
            ? carrierItems
            : activeTab === 'states'
              ? stateItems
              : topicItems
          ).map(item => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.value}</p>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={item.weight}
                    onChange={e => handleWeightChange(item.id, parseFloat(e.target.value))}
                    className="w-20 h-2"
                  />
                  <span className="text-xs text-gray-600">{Math.round(item.weight * 100)}%</span>
                </div>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

