/**
 * SignalCard Component
 * Displays a single news signal with metadata, impact ribbon, and badges
 */

import React from 'react';
import { ExternalLink, AlertCircle, MapPin, TrendingUp, Clock } from 'lucide-react';
import { SEVERITY_LABELS } from '../constants/news';
import { getFeedSourceName, getFeedSourceColor } from '../constants/feedSources';
import type { NewsArticle } from '../types/news';

interface SignalCardProps {
  article: NewsArticle;
  clusterSize?: number;
  onExpand?: () => void;
  isExpanded?: boolean;
}

export const SignalCard: React.FC<SignalCardProps> = ({
  article,
  clusterSize = 1,
  onExpand,
  isExpanded = false,
}) => {

  // Format time ago
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Severity color mapping
  const severityColor = {
    5: 'bg-[#FEE2E2] text-[#EF4444] border-[#EF4444]/20',
    4: 'bg-[#FEF3C7] text-[#F59E0B] border-[#F59E0B]/20',
    3: 'bg-[#FEF08A] text-[#FBBF24] border-[#FBBF24]/20',
    2: 'bg-[#E8F5F0] text-[#10A37F] border-[#10A37F]/20',
    1: 'bg-[#F7F7F8] text-[#565869] border-[#E5E7EB]',
  } as const;

  const actionabilityColor = {
    'Monitor': 'bg-[#E8F5F0] text-[#10A37F] border-[#10A37F]/20',
    'Review Portfolio': 'bg-[#E8F5F0] text-[#10A37F] border-[#10A37F]/20',
    'File Response': 'bg-[#FEE2E2] text-[#EF4444] border-[#EF4444]/20',
    'Client Advisory': 'bg-[#E8F5F0] text-[#10A37F] border-[#10A37F]/20',
  } as const;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200">
      {/* Header with title and source */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[#0D0D0D] line-clamp-2 hover:text-[#10A37F] transition-colors duration-200">
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {article.title}
            </a>
          </h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-[#8B8B9A]">
            <span className={`inline-block px-2 py-1 rounded-md text-[#0D0D0D] font-medium border ${getFeedSourceColor(article.sourceId)}`}>
              {getFeedSourceName(article.sourceId)}
            </span>
            <span className="flex items-center gap-1 text-[#8B8B9A]">
              <Clock size={12} />
              {timeAgo(article.publishedAt)}
            </span>
          </div>
        </div>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-[#ABABBA] hover:text-[#10A37F] transition-all duration-200"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Excerpt */}
      <p className="text-sm text-[#565869] line-clamp-2 mb-3 leading-relaxed">{article.excerpt}</p>

      {/* Impact Ribbon */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E5E7EB]">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${severityColor[article.severity as keyof typeof severityColor]}`}>
          <AlertCircle size={14} />
          {SEVERITY_LABELS[article.severity as keyof typeof SEVERITY_LABELS]}
        </div>
        <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${actionabilityColor[article.actionability as keyof typeof actionabilityColor]}`}>
          {article.actionability}
        </div>
        {article.hazard && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#FEF3C7] text-[#F59E0B] border border-[#F59E0B]/20">
            <MapPin size={14} />
            Hazard
          </div>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="space-y-2 mb-3">
        {/* States */}
        {article.states.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.states.slice(0, 3).map(state => (
              <span key={state} className="inline-block px-2 py-1 bg-[#E8F5F0] text-[#10A37F] rounded-md text-xs font-medium border border-[#10A37F]/20 hover:bg-[#D1E8E0] transition-colors">
                {state}
              </span>
            ))}
            {article.states.length > 3 && (
              <span className="inline-block px-2 py-1 bg-[#F7F7F8] text-[#565869] rounded-md text-xs font-medium border border-[#E5E7EB]">
                +{article.states.length - 3}
              </span>
            )}
          </div>
        )}

        {/* LOBs */}
        {article.lobs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.lobs.slice(0, 3).map(lob => (
              <span key={lob} className="inline-block px-2 py-1 bg-[#E8F5F0] text-[#10A37F] rounded-md text-xs font-medium border border-[#10A37F]/20 hover:bg-[#D1E8E0] transition-colors">
                {lob}
              </span>
            ))}
            {article.lobs.length > 3 && (
              <span className="inline-block px-2 py-1 bg-[#F7F7F8] text-[#565869] rounded-md text-xs font-medium border border-[#E5E7EB]">
                +{article.lobs.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Carriers */}
        {article.carriers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.carriers.slice(0, 3).map(carrier => (
              <span key={carrier} className="inline-block px-2 py-1 bg-[#E8F5F0] text-[#10A37F] rounded-md text-xs font-medium border border-[#10A37F]/20 hover:bg-[#D1E8E0] transition-colors">
                {carrier}
              </span>
            ))}
            {article.carriers.length > 3 && (
              <span className="inline-block px-2 py-1 bg-[#F7F7F8] text-[#565869] rounded-md text-xs font-medium border border-[#E5E7EB]">
                +{article.carriers.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer with score and cluster info */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#565869] font-medium">
            <TrendingUp size={14} className="text-[#10A37F]" />
            <span className="text-[#0D0D0D]">{Math.round(article.score)}</span>
            <span className="text-[#ABABBA]">/ 100</span>
          </div>
          {article.confidence && (
            <span className="text-xs text-[#8B8B9A] font-medium">
              {Math.round(article.confidence * 100)}% confidence
            </span>
          )}
        </div>
        {clusterSize > 1 && (
          <button
            onClick={onExpand}
            className="text-xs font-medium text-[#10A37F] hover:text-[#0D8B6F] transition-all duration-200"
          >
            {isExpanded ? 'Hide' : `Show`} {clusterSize} related
          </button>
        )}
      </div>
    </div>
  );
};

