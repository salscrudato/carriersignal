/**
 * Mobile-Optimized Layout for CarrierSignal v2
 * 
 * Design Principles:
 * - Mobile-first approach (optimized for 375px-480px screens)
 * - Minimal scrolling, maximum content visibility
 * - Large touch targets (48px minimum)
 * - Clean typography hierarchy
 * - Smooth animations and transitions
 * - Accessibility-first (WCAG 2.1 AA)
 */

import { useState } from 'react';
import { ChevronDown, Search, Settings, Zap } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  onSortChange: (sort: string) => void;
  currentSort: string;
}

export function MobileOptimizedLayout({ children, onSortChange, currentSort }: MobileLayoutProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const sortOptions = [
    { value: 'smart', label: '🎯 SmartSort v2', description: 'AI-ranked' },
    { value: 'recency', label: '🕐 Most Recent', description: 'Latest first' },
    { value: 'impact', label: '📊 Highest Impact', description: 'Most important' },
    { value: 'regulatory', label: '🔴 Regulatory', description: 'Compliance alerts' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Mobile Header - Sticky */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 space-y-3">
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Carrier Signal
              </h1>
              <p className="text-xs text-slate-500 font-semibold">AI Insurance News</p>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition">
              <Settings size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex gap-2">
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-sm font-medium text-slate-700"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-sm font-bold text-blue-700 border border-blue-200"
              >
                <Zap size={16} />
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown size={14} className={`transition ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort Menu */}
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left transition flex flex-col gap-0.5 ${
                        currentSort === option.value
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-slate-900">{option.label}</span>
                      <span className="text-xs text-slate-500">{option.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Input - Conditional */}
          {showSearch && (
            <input
              type="text"
              placeholder="Search insurance news..."
              className="w-full px-4 py-2 bg-slate-100 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="flex justify-around">
          <button className="flex-1 py-3 text-center text-xs font-bold text-blue-600 border-t-2 border-blue-600">
            📰 Feed
          </button>
          <button className="flex-1 py-3 text-center text-xs font-bold text-slate-600 hover:text-slate-900">
            🎯 Trending
          </button>
          <button className="flex-1 py-3 text-center text-xs font-bold text-slate-600 hover:text-slate-900">
            ⚙️ Filters
          </button>
        </div>
      </nav>
    </div>
  );
}

/**
 * Mobile Article Card - Optimized for touch
 */
interface MobileArticleCardProps {
  title: string;
  source: string;
  publishedAt?: string;
  description?: string;
  image?: string;
  smartScore?: number;
  regulatory?: boolean;
  stormName?: string;
  impactScore?: number;
  onClick: () => void;
  isSelected?: boolean;
}

export function MobileArticleCard({
  title,
  source,
  publishedAt,
  description,
  smartScore,
  regulatory,
  stormName,
  impactScore,
  onClick,
  isSelected,
}: MobileArticleCardProps) {
  const timeAgo = publishedAt ? getTimeAgo(new Date(publishedAt)) : 'Unknown';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-200 transition active:bg-blue-50 ${
        isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
      }`}
    >
      <div className="space-y-2">
        {/* Title */}
        <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-600 line-clamp-2">
            {description}
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <span className="font-medium">{source}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-1">
          {smartScore !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
              ⚡ {smartScore.toFixed(0)}
            </span>
          )}
          {regulatory && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
              🔴 Regulatory
            </span>
          )}
          {stormName && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
              ⚠️ {stormName}
            </span>
          )}
          {impactScore !== undefined && impactScore > 75 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
              🔥 High Impact
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Utility: Format time ago
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

