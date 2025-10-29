/**
 * Bookmarks Component
 * Manage saved articles and events
 */

import { useState } from 'react';
import { GlassCard, GlowButton, Badge } from '../primitives';
import { Bookmark, Trash2, Share2, Download } from 'lucide-react';

export interface BookmarkedItem {
  id: string;
  url: string;
  title: string;
  source: string;
  savedAt: string;
  notes?: string;
  tags?: string[];
}

interface BookmarksProps {
  items: BookmarkedItem[];
  onRemove: (id: string) => void;
  onExport?: (format: 'pdf' | 'csv' | 'json') => void;
}

export function Bookmarks({ items, onRemove, onExport }: BookmarksProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(items.flatMap((item) => item.tags || [])));

  const filteredItems = filterTag
    ? items.filter((item) => item.tags?.includes(filterTag))
    : items;

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    }
    return a.title.localeCompare(b.title);
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === sortedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(sortedItems.map((item) => item.id)));
    }
  };

  const handleRemoveSelected = () => {
    selectedItems.forEach((id) => onRemove(id));
    setSelectedItems(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark size={24} className="text-[#5AA6FF]" />
          <h2 className="text-2xl font-bold text-[#0F172A]">Bookmarks</h2>
          <Badge variant="info">{items.length}</Badge>
        </div>
      </div>

      {items.length === 0 ? (
        <GlassCard variant="premium" className="text-center py-12">
          <Bookmark size={48} className="mx-auto text-[#C7D2E1] mb-4" />
          <p className="text-[#64748B]">No bookmarks yet. Save articles to get started.</p>
        </GlassCard>
      ) : (
        <>
          {/* Controls */}
          <GlassCard variant="default" className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedItems.size === sortedItems.length && sortedItems.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-[#C7D2E1] text-[#5AA6FF]"
              />
              <span className="text-sm text-[#64748B]">
                {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="px-3 py-1.5 text-sm rounded-lg bg-[#F9FBFF] border border-[#C7D2E1] text-[#0F172A]"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>

              {selectedItems.size > 0 && (
                <>
                  <GlowButton
                    variant="secondary"
                    size="sm"
                    icon={<Download size={16} />}
                    onClick={() => onExport?.('pdf')}
                  >
                    Export
                  </GlowButton>
                  <GlowButton
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    onClick={handleRemoveSelected}
                  >
                    Delete
                  </GlowButton>
                </>
              )}
            </div>
          </GlassCard>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterTag(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterTag === null
                    ? 'bg-[#5AA6FF] text-white'
                    : 'bg-[#E8F2FF] text-[#5AA6FF] hover:bg-[#D8E8FF]'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filterTag === tag
                      ? 'bg-[#5AA6FF] text-white'
                      : 'bg-[#E8F2FF] text-[#5AA6FF] hover:bg-[#D8E8FF]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Bookmarks List */}
          <div className="space-y-2">
            {sortedItems.map((item) => (
              <GlassCard
                key={item.id}
                variant="default"
                className="flex items-start gap-4 p-4 hover:shadow-md transition-all"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="w-4 h-4 rounded border-[#C7D2E1] text-[#5AA6FF] mt-1"
                />

                <div className="flex-1 min-w-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#5AA6FF] hover:underline line-clamp-2"
                  >
                    {item.title}
                  </a>
                  <p className="text-xs text-[#64748B] mt-1">{item.source}</p>
                  {item.notes && <p className="text-xs text-[#0F172A] mt-2 italic">{item.notes}</p>}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-[#94A3B8] mt-2">
                    Saved {new Date(item.savedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      navigator.share({ url: item.url, title: item.title });
                    }}
                    className="p-2 hover:bg-[#E8F2FF] rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 size={16} className="text-[#64748B]" />
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={16} className="text-[#EF4444]" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

