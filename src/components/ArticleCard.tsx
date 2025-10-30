/**
 * Enhanced Article Card Component
 * Displays article with liquid glass styling, animations, and interactions
 * Features: Pull-quote, AI summary bullets, micro-animations, accessibility
 */

import { Bookmark, Share2, TrendingUp, AlertCircle, ChevronDown, Sparkles } from 'lucide-react';
import { useState, memo } from 'react';
import type { Article } from '../types';
import { Badge } from './primitives/Badge';
import { GlassCard } from './primitives/GlassCard';
import { Tooltip } from './primitives/Tooltip';
import { getTimeAgo } from '../utils/validation';

interface ArticleCardProps {
  article: Article;
  isSelected?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  ariaLabel?: string;
}

function ArticleCardComponent({
  article,
  isSelected = false,
  isLoading = false,
  onClick,
  onBookmark,
  onShare,
  ariaLabel,
}: ArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const score = article.smartScore || article.aiScore || 0;
  const scoreColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';

  // RAG quality indicator
  const ragQualityScore = typeof (article as unknown as Record<string, unknown>).ragQualityScore === 'number'
    ? ((article as unknown as Record<string, unknown>).ragQualityScore as number)
    : 100;
  const hasQualityIssues = ragQualityScore < 70;

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharing(true);
    onShare?.();
    setTimeout(() => setIsSharing(false), 1000);
  };

  return (
    <GlassCard
      variant={isSelected ? 'premium' : 'default'}
      interactive
      onClick={onClick}
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-[#5AA6FF]/20 hover:scale-102 ${
        isSelected ? 'ring-2 ring-[#5AA6FF]/70 shadow-xl shadow-[#5AA6FF]/25 scale-102' : 'hover:ring-1 hover:ring-[#5AA6FF]/40'
      } ${isLoading ? 'opacity-60 pointer-events-none' : ''} animate-fadeIn`}
      role="article"
      aria-label={ariaLabel || `Article: ${article.title}`}
      aria-selected={isSelected}
    >
      <div className="space-y-3.5">
        {/* Header with source and date */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#5AA6FF] uppercase tracking-widest truncate group-hover:text-[#3B82F6] transition-colors duration-200">
              {article.source}
            </p>
            <p className="text-xs text-[#94A3B8] mt-1 group-hover:text-[#64748B] transition-colors duration-200 font-medium">
              {article.publishedAt ? getTimeAgo(article.publishedAt) : 'Recently'}
            </p>
          </div>
          {score > 0 && (
            <Tooltip content={`Relevance Score: ${Math.round(score)}`}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E8F2FF] ${scoreColor} transition-all duration-200 group-hover:shadow-md group-hover:shadow-[#5AA6FF]/25 animate-scoreGlow font-bold text-xs`}>
                <TrendingUp size={14} className="group-hover:scale-125 transition-transform duration-200" />
                <span>{Math.round(score)}</span>
              </div>
            </Tooltip>
          )}
        </div>

        {/* Title - Enhanced Typography */}
        <h3 className="text-base font-bold text-[#0F172A] line-clamp-2 group-hover:text-[#5AA6FF] transition-colors duration-200 leading-tight">
          {article.title}
        </h3>

        {/* Pull Quote - Key verbatim excerpt */}
        {(article as any).leadQuote && (
          <div className="pl-3.5 border-l-2 border-[#5AA6FF]/50 py-2.5 bg-gradient-to-r from-[#F9FBFF]/80 to-[#F0F7FF]/40 rounded-r-lg hover:from-[#F0F7FF] hover:to-[#E8F2FF]/60 transition-all duration-200">
            <p className="text-xs italic text-[#475569] line-clamp-2 group-hover:text-[#0F172A] transition-colors duration-200 leading-relaxed">
              "{(article as any).leadQuote}"
            </p>
          </div>
        )}

        {/* AI Summary Bullets - Truncated with expand */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5AA6FF] uppercase tracking-wide">
              <Sparkles size={13} className="animate-pulse" />
              <span>AI Summary</span>
            </div>
            <div className={`space-y-1.5 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-14'}`}>
              {article.bullets5.slice(0, isExpanded ? 5 : 1).map((bullet, idx) => (
                <div key={idx} className="flex gap-2.5 text-xs text-[#64748B] group-hover:text-[#475569] transition-colors duration-200 leading-relaxed">
                  <span className="text-[#5AA6FF] font-bold flex-shrink-0 mt-0.5">•</span>
                  <span className="line-clamp-2">{bullet}</span>
                </div>
              ))}
            </div>
            {article.bullets5.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-xs text-[#5AA6FF] hover:text-[#3B82F6] font-bold flex items-center gap-1 transition-all duration-200 hover:gap-1.5 uppercase tracking-wide"
                aria-label={isExpanded ? 'Collapse summary' : 'Expand summary'}
              >
                {isExpanded ? 'Show less' : `Show ${article.bullets5.length - 1} more`}
                <ChevronDown size={13} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Tags with staggered animation */}
        {article.tags && (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.perils && article.tags.perils.slice(0, 2).map((peril, idx) => (
              <Badge key={peril} variant="warning" size="sm" className="animate-slideInUp" style={{ animationDelay: `${idx * 50}ms` }}>
                {peril}
              </Badge>
            ))}
            {article.tags.lob && article.tags.lob.slice(0, 1).map((lob, idx) => (
              <Badge key={lob} variant="info" size="sm" className="animate-slideInUp" style={{ animationDelay: `${(idx + 2) * 50}ms` }}>
                {lob}
              </Badge>
            ))}
            {article.tags.regions && article.tags.regions.slice(0, 1).map((region, idx) => (
              <Badge key={region} variant="default" size="sm" className="animate-slideInUp" style={{ animationDelay: `${(idx + 3) * 50}ms` }}>
                {region}
              </Badge>
            ))}
          </div>
        )}

        {/* Quality indicator */}
        {hasQualityIssues && (
          <Tooltip content={`RAG Quality: ${ragQualityScore}/100`}>
            <div className="flex items-center gap-1 text-xs text-amber-600 group-hover:text-amber-700 transition-colors duration-200">
              <AlertCircle size={14} className="group-hover:animate-pulse" />
              <span>Quality: {ragQualityScore}/100</span>
            </div>
          </Tooltip>
        )}

        {/* Action buttons with enhanced hover effects */}
        <div className="flex items-center gap-2.5 pt-3 border-t border-[#C7D2E1]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onBookmark && (
            <Tooltip content={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-all duration-250 transform hover:scale-120 active:scale-95 ${
                  isBookmarked
                    ? 'bg-gradient-to-br from-[#5AA6FF] to-[#4A96EF] text-white shadow-md shadow-[#5AA6FF]/40 hover:shadow-lg'
                    : 'hover:bg-[#E8F2FF] text-[#64748B] hover:shadow-md hover:shadow-[#5AA6FF]/25 hover:text-[#5AA6FF]'
                }`}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                aria-pressed={isBookmarked}
              >
                <Bookmark size={17} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </Tooltip>
          )}
          {onShare && (
            <Tooltip content="Share article">
              <button
                onClick={handleShare}
                disabled={isSharing}
                className={`p-2 rounded-lg transition-all duration-250 transform hover:scale-120 active:scale-95 ${
                  isSharing
                    ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md shadow-green-500/40 hover:shadow-lg'
                    : 'hover:bg-[#E8F2FF] text-[#64748B] hover:shadow-md hover:shadow-[#5AA6FF]/25 hover:text-[#5AA6FF]'
                }`}
                aria-label="Share article"
              >
                <Share2 size={17} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export const ArticleCard = memo(ArticleCardComponent, (prev, next) => {
  return (
    prev.article.id === next.article.id &&
    prev.isSelected === next.isSelected &&
    prev.isLoading === next.isLoading
  );
});
