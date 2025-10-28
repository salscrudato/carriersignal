/**
 * Search-First UI Component for CarrierSignal v2
 * 
 * Innovative search interface with:
 * - Fuzzy search with typo tolerance
 * - Semantic understanding (synonyms)
 * - Real-time suggestions
 * - Visual match indicators
 * - Mobile-optimized
 */

import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, Clock, Shield } from 'lucide-react';
import { rankArticlesByAI, rankArticlesByRecency } from '../utils/rankingSystem';
import { getSourceCredibility, getCredibilityBadgeColor } from '../utils/sourceCredibility';

interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  description?: string;
  image?: string;
  bullets5?: string[];
  tags?: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    companies?: string[];
    trends?: string[];
    regulations?: string[];
  };
  smartScore?: number;
  aiScore?: number;
  impactScore?: number;
  regulatory?: boolean;
  stormName?: string;
}

interface SearchFirstProps {
  articles: Article[];
  onArticleSelect: (article: Article) => void;
  selectedArticle?: Article | null;
}

export function SearchFirst({ articles, onArticleSelect, selectedArticle }: SearchFirstProps) {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'ai' | 'recency'>('ai');

  // Display all articles with sorting (no search)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Show all articles
      const results = articles.map(article => ({
        article,
        score: article.aiScore || article.smartScore || 0,
        matchType: 'combined',
        highlights: [],
      }));

      // Apply filters
      const filtered = applyFilters(results);

      // Apply sorting
      const sorted = applySorting(filtered, sortBy);
      setSearchResults(sorted);
    }, 300);

    return () => clearTimeout(timer);
  }, [articles, sortBy]);

  // No filtering - show all articles
  const applyFilters = (results: any[]) => {
    return results;
  };

  // Sorting function
  const applySorting = (results: any[], sortType: string) => {
    const articles = results.map(r => r.article);

    let sorted;
    if (sortType === 'ai') {
      sorted = rankArticlesByAI(articles);
    } else {
      sorted = rankArticlesByRecency(articles);
    }

    // Map back to result format
    return sorted.map(article => ({
      article,
      score: article.aiScore || 0,
      matchType: 'combined',
      highlights: [],
    }));
  };





  return (
    <div className="w-full space-y-0 flex flex-col h-full">
      {/* Sort Controls Header - Mobile Optimized */}
      <div className="sticky top-0 z-40 liquid-glass shadow-md p-3 sm:p-4 flex-shrink-0">
        <div className="max-w-full">
          {/* Sort Buttons - Compact Mobile Layout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sort Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 glass rounded-lg p-1">
              <button
                onClick={() => setSortBy('ai')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                  sortBy === 'ai'
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Zap size={13} className="hidden sm:inline" />
                <Zap size={12} className="sm:hidden" />
                <span className="hidden sm:inline">AI Ranking</span>
                <span className="sm:hidden">AI</span>
              </button>
              <button
                onClick={() => setSortBy('recency')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                  sortBy === 'recency'
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Clock size={13} className="hidden sm:inline" />
                <Clock size={12} className="sm:hidden" />
                <span className="hidden sm:inline">Recency</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>

            {/* Results Count - Right Aligned */}
            <div className="ml-auto text-xs text-slate-600 font-semibold whitespace-nowrap">
              <span className="hidden sm:inline">{searchResults.length} articles</span>
              <span className="sm:hidden">{searchResults.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-full px-4 pb-20 pt-4">
          <div className="space-y-3">
            {searchResults.map((result, idx) => (
              <SearchResultCard
                key={`${result.article.url}-${idx}`}
                result={result}
                isSelected={selectedArticle?.url === result.article.url}
                onSelect={() => onArticleSelect(result.article)}
                index={idx}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * Individual search result card
 */
interface SearchResultCardProps {
  result: any;
  isSelected: boolean;
  onSelect: () => void;
  index?: number;
}

function SearchResultCard({ result, isSelected, onSelect, index = 0 }: SearchResultCardProps) {
  const { article, score } = result;
  const timeAgo = article.publishedAt ? getTimeAgo(new Date(article.publishedAt)) : 'Unknown';
  const impactLevel = article.impactScore ? (article.impactScore > 75 ? 'High' : article.impactScore > 50 ? 'Medium' : 'Low') : null;
  const sourceCredibility = getSourceCredibility(article.source || 'Unknown');
  const credibilityBadgeColor = getCredibilityBadgeColor(sourceCredibility.credibilityScore);

  return (
    <button
      onClick={onSelect}
      style={{ animationDelay: `${index * 50}ms` }}
      className={`w-full text-left rounded-xl border-2 transition-all duration-300 active:scale-98 animate-slideInWithBounce overflow-hidden flex flex-col ${
        isSelected
          ? 'liquid-glass-premium border-blue-400 shadow-lg'
          : 'glass border-slate-200 hover:border-slate-300 hover:shadow-lg hover:scale-102'
      }`}
    >
      {/* Content Section */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Header with Source and Time (moved to top right) */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full inline-block">
              {article.source}
            </span>
          </div>
          {timeAgo && (
            <span className="text-xs text-slate-500 font-medium flex-shrink-0">{timeAgo}</span>
          )}
        </div>

        {/* Title - Enhanced Typography */}
        <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug line-clamp-3 hover:text-blue-700 transition-colors">
          {article.title}
        </h3>

        {/* AI-Generated Summary - Expanded with larger font */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <div className="space-y-3 py-3 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">AI-Generated Summary</span>
            </div>
            <div className="space-y-2">
              {article.bullets5.slice(0, 3).map((bullet: string, idx: number) => (
                <div key={idx} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                  <span className="text-indigo-600 font-bold flex-shrink-0 mt-0.5">→</span>
                  <span className="flex-1">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Row - Regulatory and Category Tags Only */}
        <div className="flex flex-wrap gap-2 pt-2 mt-auto border-t border-slate-100 pt-3">
          {/* Regulatory Badge */}
          {article.regulatory && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-100 to-orange-100 text-red-700 rounded-full text-xs font-bold transition-all duration-300 hover:scale-110 hover:shadow-md">
              <AlertTriangle size={12} /> Regulatory
            </span>
          )}

          {/* Storm Badge */}
          {article.stormName && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-xs font-bold transition-all duration-300 hover:scale-110 hover:shadow-md">
              <AlertTriangle size={12} /> {article.stormName}
            </span>
          )}

          {/* Category Tags */}
          {article.tags?.lob && article.tags.lob.length > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full text-xs font-bold transition-all duration-300 hover:scale-110 hover:shadow-md">
              {article.tags.lob[0]}
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

