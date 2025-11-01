/**
 * SignalCard Component
 * Displays a single news signal with metadata, impact ribbon, and badges
 */

import React from 'react';
import { ExternalLink, AlertCircle, MapPin, TrendingUp, Clock } from 'lucide-react';
import { SEVERITY_LABELS } from '../constants/news';
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
    5: 'bg-red-100 text-red-800 border-red-300',
    4: 'bg-orange-100 text-orange-800 border-orange-300',
    3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    2: 'bg-blue-100 text-blue-800 border-blue-300',
    1: 'bg-gray-100 text-gray-800 border-gray-300',
  } as const;

  const actionabilityColor = {
    'Monitor': 'bg-blue-50 text-blue-700 border-blue-200',
    'Review Portfolio': 'bg-purple-50 text-purple-700 border-purple-200',
    'File Response': 'bg-red-50 text-red-700 border-red-200',
    'Client Advisory': 'bg-green-50 text-green-700 border-green-200',
  } as const;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header with title and source */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-blue-600">
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {article.title}
            </a>
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
              {article.sourceId}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {timeAgo(article.publishedAt)}
            </span>
          </div>
        </div>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Excerpt */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{article.excerpt}</p>

      {/* Impact Ribbon */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${severityColor[article.severity as keyof typeof severityColor]}`}>
          <AlertCircle size={14} />
          {SEVERITY_LABELS[article.severity as keyof typeof SEVERITY_LABELS]}
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${actionabilityColor[article.actionability as keyof typeof actionabilityColor]}`}>
          {article.actionability}
        </div>
        {article.hazard && (
          <div className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <MapPin size={14} />
            Hazard
          </div>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="space-y-2 mb-3">
        {/* States */}
        {article.states.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.states.slice(0, 3).map(state => (
              <span key={state} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                {state}
              </span>
            ))}
            {article.states.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                +{article.states.length - 3}
              </span>
            )}
          </div>
        )}

        {/* LOBs */}
        {article.lobs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.lobs.slice(0, 3).map(lob => (
              <span key={lob} className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-200">
                {lob}
              </span>
            ))}
            {article.lobs.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                +{article.lobs.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Carriers */}
        {article.carriers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.carriers.slice(0, 3).map(carrier => (
              <span key={carrier} className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">
                {carrier}
              </span>
            ))}
            {article.carriers.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                +{article.carriers.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer with score and cluster info */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <TrendingUp size={14} />
            <span className="font-semibold">{Math.round(article.score)}</span>
            <span>/ 100</span>
          </div>
          {article.confidence && (
            <span className="text-xs text-gray-500">
              {Math.round(article.confidence * 100)}% confidence
            </span>
          )}
        </div>
        {clusterSize > 1 && (
          <button
            onClick={onExpand}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isExpanded ? 'Hide' : `Show`} {clusterSize} related
          </button>
        )}
      </div>
    </div>
  );
};

