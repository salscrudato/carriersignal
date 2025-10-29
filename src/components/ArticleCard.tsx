/**
 * Enhanced Article Card Component
 * Displays article with liquid glass styling, animations, and interactions
 */

import { Bookmark, Share2, TrendingUp } from 'lucide-react';
import type { Article } from '../types';
import { Badge } from './primitives/Badge';
import { GlassCard } from './primitives/GlassCard';
import { Tooltip } from './primitives/Tooltip';
import { getTimeAgo } from '../utils/validation';

interface ArticleCardProps {
  article: Article;
  isSelected?: boolean;
  onClick?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

export function ArticleCard({
  article,
  isSelected = false,
  onClick,
  onBookmark,
  onShare,
}: ArticleCardProps) {
  const score = article.smartScore || article.aiScore || 0;
  const scoreColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <GlassCard
      variant={isSelected ? 'premium' : 'default'}
      interactive
      onClick={onClick}
      className={`group cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-2 ring-[#5AA6FF] shadow-lg' : ''
      }`}
    >
      <div className="space-y-3">
        {/* Header with source and date */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#5AA6FF] uppercase tracking-wide truncate">
              {article.source}
            </p>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {article.publishedAt ? getTimeAgo(article.publishedAt) : 'Recently'}
            </p>
          </div>
          {score > 0 && (
            <Tooltip content={`Relevance Score: ${Math.round(score)}`}>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E8F2FF] ${scoreColor}`}>
                <TrendingUp size={14} />
                <span className="text-xs font-semibold">{Math.round(score)}</span>
              </div>
            </Tooltip>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#0F172A] line-clamp-2 group-hover:text-[#5AA6FF] transition-colors">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-xs text-[#64748B] line-clamp-2">
            {article.description}
          </p>
        )}

        {/* Tags */}
        {article.tags && (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.perils && article.tags.perils.slice(0, 2).map((peril) => (
              <Badge key={peril} variant="warning" size="sm">
                {peril}
              </Badge>
            ))}
            {article.tags.lob && article.tags.lob.slice(0, 1).map((lob) => (
              <Badge key={lob} variant="info" size="sm">
                {lob}
              </Badge>
            ))}
            {article.tags.regions && article.tags.regions.slice(0, 1).map((region) => (
              <Badge key={region} variant="default" size="sm">
                {region}
              </Badge>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#C7D2E1]/20 opacity-0 group-hover:opacity-100 transition-opacity">
          {onBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className="p-1.5 hover:bg-[#E8F2FF] rounded-lg transition-colors"
              aria-label="Bookmark article"
            >
              <Bookmark size={16} className="text-[#64748B]" />
            </button>
          )}
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="p-1.5 hover:bg-[#E8F2FF] rounded-lg transition-colors"
              aria-label="Share article"
            >
              <Share2 size={16} className="text-[#64748B]" />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

