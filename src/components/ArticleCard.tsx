/**
 * Enhanced Article Card Component
 * Displays article with liquid glass styling, animations, and interactions
 * Features: Micro-animations, accessibility, responsive design, loading states
 */

import { Bookmark, Share2, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';
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

export function ArticleCard({
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
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-[#5AA6FF]/10 ${
        isSelected ? 'ring-2 ring-[#5AA6FF] shadow-lg shadow-[#5AA6FF]/20' : 'hover:ring-1 hover:ring-[#5AA6FF]/30'
      } ${isLoading ? 'opacity-60 pointer-events-none' : ''} animate-fadeIn`}
      role="article"
      aria-label={ariaLabel || `Article: ${article.title}`}
      aria-selected={isSelected}
    >
      <div className="space-y-3">
        {/* Header with source and date */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#5AA6FF] uppercase tracking-wide truncate group-hover:text-[#3B82F6] transition-colors duration-200">
              {article.source}
            </p>
            <p className="text-xs text-[#94A3B8] mt-0.5 group-hover:text-[#64748B] transition-colors duration-200">
              {article.publishedAt ? getTimeAgo(article.publishedAt) : 'Recently'}
            </p>
          </div>
          {score > 0 && (
            <Tooltip content={`Relevance Score: ${Math.round(score)}`}>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E8F2FF] ${scoreColor} transition-all duration-200 group-hover:shadow-md group-hover:shadow-[#5AA6FF]/20 animate-scoreGlow`}>
                <TrendingUp size={14} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs font-semibold">{Math.round(score)}</span>
              </div>
            </Tooltip>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#0F172A] line-clamp-2 group-hover:text-[#5AA6FF] transition-colors duration-200">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-xs text-[#64748B] line-clamp-2 group-hover:text-[#475569] transition-colors duration-200">
            {article.description}
          </p>
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
        <div className="flex items-center gap-2 pt-2 border-t border-[#C7D2E1]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onBookmark && (
            <Tooltip content={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}>
              <button
                onClick={handleBookmark}
                className={`p-1.5 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                  isBookmarked
                    ? 'bg-[#5AA6FF] text-white shadow-md shadow-[#5AA6FF]/30'
                    : 'hover:bg-[#E8F2FF] text-[#64748B] hover:shadow-sm hover:shadow-[#5AA6FF]/20'
                }`}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                aria-pressed={isBookmarked}
              >
                <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </Tooltip>
          )}
          {onShare && (
            <Tooltip content="Share article">
              <button
                onClick={handleShare}
                disabled={isSharing}
                className={`p-1.5 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                  isSharing
                    ? 'bg-green-100 text-green-600 shadow-md shadow-green-500/30'
                    : 'hover:bg-[#E8F2FF] text-[#64748B] hover:shadow-sm hover:shadow-[#5AA6FF]/20'
                }`}
                aria-label="Share article"
              >
                <Share2 size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

