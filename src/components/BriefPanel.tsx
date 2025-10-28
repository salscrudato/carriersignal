import { AlertTriangle } from 'lucide-react';

interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  bullets5?: string[];
  whyItMatters?: Record<string, string>;
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
  stormName?: string;
  regionsNormalized?: string[];
  companiesNormalized?: string[];
  tags?: {
    lob?: string[];
    perils?: string[];
    regulations?: string[];
  };
}

interface BriefPanelProps {
  article: Article | null;
}

export function BriefPanel({
  article,
}: BriefPanelProps) {
  if (!article) {
    return (
      <div className="flex flex-col w-full lg:w-1/2 bg-white border-l border-blue-200/30 p-6 items-center justify-center text-blue-400">
        <p className="text-sm font-medium">Select an article to view details</p>
      </div>
    );
  }

  const publishDate = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unknown';
  const timeAgo = article.publishedAt ? getTimeAgo(new Date(article.publishedAt)) : '';

  return (
    <div className="flex flex-col w-full max-w-full lg:w-1/2 liquid-glass-ultra lg:border-l border-blue-200/20 overflow-y-auto overflow-x-hidden animate-slideInRight">
      {/* Header with Title and Metadata */}
      <div className="sticky top-0 liquid-glass-premium border-b border-blue-200/20 p-4 sm:p-6 shadow-sm z-10 w-full max-w-full overflow-x-hidden">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 leading-tight break-words">{article.title}</h2>
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 flex-wrap w-full max-w-full overflow-x-hidden">
          <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full liquid-glass-light text-blue-700 font-semibold text-xs truncate border border-blue-200/30">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="truncate">{article.source}</span>
          </span>
          <span className="text-slate-500 flex-shrink-0">•</span>
          <span className="flex-shrink-0">{publishDate}</span>
          {timeAgo && (
            <>
              <span className="text-slate-500 flex-shrink-0">•</span>
              <span className="flex-shrink-0">{timeAgo}</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto w-full max-w-full overflow-x-hidden">
        {/* Lead Quote with Enhanced Styling */}
        {article.leadQuote && (
          <div className="liquid-glass-premium rounded-2xl border-l-4 border-blue-500 p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-200/30">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-base italic text-slate-700 leading-relaxed font-medium">{article.leadQuote}</p>
            </div>
          </div>
        )}

        {/* Storm Name Badge */}
        {article.stormName && (
          <div className="liquid-glass-premium rounded-xl px-5 py-3 border border-orange-200/50 flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 w-fit">
            <AlertTriangle size={16} className="text-orange-700" />
            <p className="text-sm font-bold text-orange-700">{article.stormName}</p>
          </div>
        )}


        {/* AI-Generated Summary - Enhanced */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="font-bold text-blue-900 text-base">AI-Generated Summary</h3>
            </div>
            <ul className="space-y-3">
              {article.bullets5.map((bullet, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700 leading-relaxed hover:text-slate-900 transition-colors duration-300 hover:translate-x-1">
                  <span className="font-bold text-blue-600 flex-shrink-0 mt-0.5">→</span>
                  <span className="flex-1">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Why It Matters - Professional Insights */}
        {article.whyItMatters && Object.keys(article.whyItMatters).length > 0 && (
          <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="font-bold text-blue-900 text-base">Why It Matters</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(article.whyItMatters).map(([role, insight]) => (
                <div key={role} className="bg-white/60 rounded-xl p-3 hover:bg-white/80 transition-all duration-300">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">{role}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Rationale - Enhanced */}
        {article.confidenceRationale && (
          <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-bold text-slate-700">Confidence Rationale</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{article.confidenceRationale}</p>
          </div>
        )}

        {/* Disclosure - Enhanced */}
        {article.disclosure && (
          <div className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-yellow-700" />
              <p className="text-sm font-bold text-yellow-800">Disclosure</p>
            </div>
            <p className="text-sm text-yellow-900 leading-relaxed">{article.disclosure}</p>
          </div>
        )}

        {/* Tags - Enhanced Styling */}
        {article.tags && (
          <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200/30 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="font-bold text-slate-900 text-base">Tags</h3>
            </div>
            <div className="space-y-3">
              {article.tags.lob && article.tags.lob.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Lines of Business</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.lob.map(tag => (
                      <span key={tag} className="tag-pill tag-lob hover:shadow-lg hover:scale-110 transition-all duration-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {article.tags.perils && article.tags.perils.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Perils</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.perils.map(tag => (
                      <span key={tag} className="tag-pill tag-peril hover:shadow-lg hover:scale-110 transition-all duration-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {article.tags.regulations && article.tags.regulations.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Regulations</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.regulations.map(tag => (
                      <span key={tag} className="tag-pill tag-regulation hover:shadow-lg hover:scale-110 transition-all duration-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

// Helper function for time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

