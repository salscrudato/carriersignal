import { memo, useState } from 'react';
import { Bookmark, ThumbsUp, ThumbsDown } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { useBookmarks } from '../hooks/useBookmarks';

interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  description?: string;
  content?: string;
  image?: string;
  bullets5?: string[];
  whyItMatters?: Record<string, string>;
  tags?: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    companies?: string[];
    trends?: string[];
    regulations?: string[];
  };
  riskPulse?: 'LOW' | 'MEDIUM' | 'HIGH';
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence?: number;
  recencyScore?: number;
  relevanceScore?: number;
  combinedScore?: number;
  disasterScore?: number;
  weatherScore?: number;
  financialScore?: number;
  // v2 fields
  citations?: string[];
  impactScore?: number;
  impactBreakdown?: {
    market: number;
    regulatory: number;
    catastrophe: number;
    technology: number;
  };
  confidenceRationale?: string;
  leadQuote?: string;
  disclosure?: string;
  smartScore?: number;
  aiScore?: number;
  regulatory?: boolean;
  stormName?: string;
}

interface ArticleCardProps {
  article: Article;
}

const ArticleCardComponent = ({ article }: ArticleCardProps) => {
  const timeAgo = article.publishedAt ? getTimeAgo(new Date(article.publishedAt)) : '';
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const [showBookmarkFeedback, setShowBookmarkFeedback] = useState(false);
  const [userFeedback, setUserFeedback] = useState<'up' | 'down' | null>(null);

  const bookmarked = isBookmarked(article.url);

  const handleFeedback = (feedback: 'up' | 'down') => {
    setUserFeedback(feedback);
    // TODO: Send feedback to backend
    setTimeout(() => setUserFeedback(null), 1500);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (bookmarked) {
      removeBookmark(article.url);
    } else {
      addBookmark({
        url: article.url,
        title: article.title,
        source: article.source,
        image: article.image,
      });
      setShowBookmarkFeedback(true);
      setTimeout(() => setShowBookmarkFeedback(false), 2000);
    }
  };

  // Generate 2-3 sentence AI summary from bullets
  const generateSummary = (): string => {
    if (!article.bullets5 || article.bullets5.length === 0) {
      return article.description || 'No summary available';
    }
    // Combine first 2-3 bullets into a cohesive executive summary
    const summaryBullets = article.bullets5.slice(0, 3);
    return summaryBullets.join(' ').substring(0, 280) + (summaryBullets.join(' ').length > 280 ? '...' : '');
  };

  const summary = generateSummary();
  const hasImage = !!article.image;

  return (
    <article className="group liquid-glass-premium rounded-2xl border border-slate-200/80 overflow-hidden transition-all duration-400 flex flex-col h-full touch-manipulation hover:shadow-2xl hover:border-blue-400 hover:border-opacity-100 animate-slideInWithBounce hover:scale-102">

      {/* Thumbnail Image Section - Professional & Modern */}
      {hasImage && article.image && (
        <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 group/image">
          <LazyImage
            src={article.image}
            alt={article.title}
            className="h-full w-full group-hover/image:scale-105 transition-transform duration-500 ease-out"
          />
          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>


        </div>
      )}

      {/* Header with liquid glass effect */}
      <div className={`px-6 py-5 border-b border-slate-100/60 bg-gradient-to-br from-white/50 to-slate-50/40 backdrop-blur-sm group-hover:from-white/60 group-hover:to-slate-50/50 transition-all duration-300 ${hasImage ? '' : 'pt-6'}`}>
        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="block text-base md:text-lg font-bold text-slate-900 hover:text-blue-600 transition-all duration-300 line-clamp-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 rounded leading-snug mb-3 group-hover:text-blue-700 group-hover:drop-shadow-md"
        >
          {article.title}
        </a>
        <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100/70 text-blue-700 font-bold uppercase tracking-widest text-xs group-hover:bg-blue-200/70 transition-colors duration-300">{article.source}</span>
          </div>
          <div className="flex items-center gap-2">
            {timeAgo && <span className="text-slate-500 font-semibold group-hover:text-slate-600 transition-colors duration-300">{timeAgo}</span>}
            <button
              onClick={handleBookmarkClick}
              className={`p-1.5 rounded-lg transition-all duration-300 ${
                bookmarked
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        {showBookmarkFeedback && (
          <div className="mt-2 text-xs font-semibold text-green-600 animate-fadeIn">
            ✓ Added to bookmarks
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-5 flex-1 flex flex-col">
        {/* AI Summary - 2-3 Sentences - Premium Display */}
        <div className="mb-5 p-4 liquid-glass rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 hover:shadow-lg hover:border-blue-300/80 transition-all duration-300 group/summary">
          <p className="text-sm text-slate-800 leading-relaxed font-medium line-clamp-3 group-hover/summary:text-slate-900 transition-colors duration-300">
            {summary}
          </p>
        </div>

        {/* User Feedback Buttons */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => handleFeedback('up')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
              userFeedback === 'up'
                ? 'bg-green-100 text-green-700 scale-105'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="This article is helpful"
          >
            <ThumbsUp size={14} />
            <span className="hidden sm:inline">Helpful</span>
          </button>
          <button
            onClick={() => handleFeedback('down')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
              userFeedback === 'down'
                ? 'bg-red-100 text-red-700 scale-105'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="This article is not helpful"
          >
            <ThumbsDown size={14} />
            <span className="hidden sm:inline">Not helpful</span>
          </button>
        </div>

        {/* AI Key Points - Insurance Sector Insights with Liquid Glass */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <div className="mb-5 p-4 liquid-glass rounded-xl border border-indigo-200/60 shadow-sm hover:shadow-lg transition-all duration-300 group/insights bg-gradient-to-br from-indigo-50/70 to-purple-50/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover/insights:scale-110 transition-all duration-300 shadow-md">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Key Insights</h4>
              <span className="ml-auto text-xs font-bold text-indigo-700 bg-gradient-to-r from-indigo-100 to-purple-100 px-2.5 py-1 rounded-full group-hover/insights:from-indigo-200 group-hover/insights:to-purple-200 transition-all duration-300">{article.bullets5.length}</span>
            </div>
            <ul className="space-y-2.5">
              {article.bullets5.slice(0, 3).map((bullet, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs text-slate-700 leading-relaxed font-medium group-hover/insights:text-slate-800 transition-colors duration-300 hover:translate-x-1">
                  <span className="text-indigo-600 font-bold flex-shrink-0 mt-0.5 group-hover/insights:text-indigo-700 transition-colors duration-300">→</span>
                  <span className="flex-1">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Category Tags Footer with Premium Styling */}
        {article.tags && (
          <div className="mt-4 pt-4 border-t border-slate-100/50 group-hover:border-slate-200 transition-colors duration-300">
            <div className="flex flex-wrap gap-1.5">
              {/* Lines of Business */}
              {article.tags.lob?.slice(0, 1).map((tag, idx) => (
                <span key={`lob-${idx}`} className="tag-pill tag-lob text-xs hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                  {tag}
                </span>
              ))}

              {/* Perils */}
              {article.tags.perils?.slice(0, 1).map((tag, idx) => (
                <span key={`peril-${idx}`} className="tag-pill tag-peril text-xs hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                  {tag}
                </span>
              ))}

              {/* Regions */}
              {article.tags.regions?.slice(0, 1).map((tag, idx) => (
                <span key={`region-${idx}`} className="tag-pill tag-region text-xs hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                  {tag}
                </span>
              ))}

              {/* Trends */}
              {article.tags.trends?.slice(0, 1).map((tag, idx) => (
                <span key={`trend-${idx}`} className="tag-pill tag-trend text-xs hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                  {tag}
                </span>
              ))}

              {/* Show total count if more tags exist */}
              {(() => {
                const totalTags = (article.tags?.lob?.length || 0) +
                                 (article.tags?.perils?.length || 0) +
                                 (article.tags?.regions?.length || 0) +
                                 (article.tags?.companies?.length || 0) +
                                 (article.tags?.trends?.length || 0) +
                                 (article.tags?.regulations?.length || 0);
                const shownTags = 4;
                return totalTags > shownTags ? (
                  <span className="text-xs text-slate-500 font-semibold px-2 py-1 group-hover:text-slate-600 transition-colors duration-300">
                    +{totalTags - shownTags}
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* Read More Link with Premium Styling */}
        <div className="mt-auto pt-4 border-t border-slate-100/50 group-hover:border-slate-200 transition-colors duration-300">
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-all duration-350 group/link hover:drop-shadow-md"
          >
            Read Full Article
            <svg className="w-3.5 h-3.5 group-hover/link:translate-x-1 group-hover/link:scale-110 transition-all duration-350" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ArticleCard = memo(ArticleCardComponent, (prevProps, nextProps) => {
  // Only re-render if the article URL changes (unique identifier)
  return prevProps.article.url === nextProps.article.url;
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
