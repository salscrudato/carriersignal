import { ExternalLink, X, AlertTriangle } from 'lucide-react';

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
  smartScore?: number;
  regulatory?: boolean;
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
  onClose: () => void;
}

export function BriefPanel({ article, onClose }: BriefPanelProps) {

  if (!article) {
    return (
      <div className="flex flex-col w-full lg:w-1/2 liquid-glass border-l border-slate-200 p-6 items-center justify-center text-slate-400">
        <p className="text-sm font-medium">Select an article to view details</p>
      </div>
    );
  }

  const publishDate = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unknown';

  // Extract citation URLs from citations array
  const citationUrls = article.citations || [];

  return (
    <div className="flex flex-col w-full lg:w-1/2 bg-white lg:border-l border-slate-200 overflow-y-auto animate-slideInRight">
      {/* Header with Liquid Glass */}
      <div className="sticky top-0 liquid-glass border-b border-slate-200 p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">{article.title}</h2>
            <p className="text-sm text-slate-600">{article.source} • {publishDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-lg p-2 transition-all duration-300 hover:scale-110 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* Lead Quote with Liquid Glass */}
        {article.leadQuote && (
          <div className="glass rounded-xl border-l-4 border-blue-500 p-4 hover:shadow-lg transition-all duration-300">
            <p className="text-sm italic text-slate-700 leading-relaxed">"{article.leadQuote}"</p>
          </div>
        )}

        {/* Impact Score & Breakdown with Premium Styling */}
        {article.impactScore !== undefined && (
          <div className="space-y-3 p-4 glass rounded-xl hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Impact Score</h3>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{article.impactScore}</span>
            </div>
            {article.impactBreakdown && (
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(article.impactBreakdown).map(([key, value]) => (
                  <div key={key} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 text-center hover:shadow-md transition-all duration-300 hover:scale-105">
                    <p className="text-xs font-semibold text-slate-600 capitalize">{key}</p>
                    <p className="text-lg font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Score & Regulatory Badge with Premium Styling */}
        <div className="flex items-center gap-3 flex-wrap">
          {article.smartScore !== undefined && (
            <div className="glass rounded-lg px-4 py-3 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <p className="text-xs text-slate-600 font-medium">SmartScore</p>
              <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{article.smartScore.toFixed(1)}</p>
            </div>
          )}
          {article.regulatory && (
            <div className="glass rounded-lg px-4 py-3 border border-red-200 flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <AlertTriangle size={14} className="text-red-700" />
              <p className="text-xs font-semibold text-red-700">REGULATORY</p>
            </div>
          )}
          {article.stormName && (
            <div className="glass rounded-lg px-4 py-3 border border-orange-200 flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <AlertTriangle size={14} className="text-orange-700" />
              <p className="text-xs font-semibold text-orange-700">{article.stormName}</p>
            </div>
          )}
        </div>



        {/* Key Points with Citations */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Key Points</h3>
            <ul className="space-y-2">
              {article.bullets5.map((bullet, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700 hover:text-slate-900 transition-colors duration-300 hover:translate-x-1">
                  <span className="font-semibold text-blue-600 flex-shrink-0">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confidence Rationale with Liquid Glass */}
        {article.confidenceRationale && (
          <div className="glass rounded-xl p-4 hover:shadow-lg transition-all duration-300">
            <p className="text-xs font-semibold text-slate-600 mb-2">Confidence Rationale</p>
            <p className="text-sm text-slate-700">{article.confidenceRationale}</p>
          </div>
        )}

        {/* Disclosure with Premium Styling */}
        {article.disclosure && (
          <div className="glass rounded-xl border border-yellow-200/50 p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-yellow-700" />
              <p className="text-xs font-semibold text-yellow-800">Disclosure</p>
            </div>
            <p className="text-sm text-yellow-900">{article.disclosure}</p>
          </div>
        )}

        {/* Citations with Premium Styling */}
        {citationUrls.length > 0 && (
          <div className="space-y-3 border-t border-slate-200/50 pt-4">
            <h3 className="font-semibold text-slate-900">Citations</h3>
            <ul className="space-y-2">
              {citationUrls.map((url, idx) => (
                <li key={idx} className="flex items-start gap-2 group">
                  <span className="text-xs font-semibold text-slate-500 flex-shrink-0">[{idx + 1}]</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline break-all flex items-center gap-1 transition-all duration-300 group-hover:drop-shadow-md"
                  >
                    {url}
                    <ExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags with Premium Styling */}
        {article.tags && (
          <div className="space-y-3 border-t border-slate-200/50 pt-4">
            <h3 className="font-semibold text-slate-900">Tags</h3>
            <div className="space-y-2">
              {article.tags.lob && article.tags.lob.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">Lines of Business</p>
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
                  <p className="text-xs font-semibold text-slate-600 mb-1">Perils</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.perils.map(tag => (
                      <span key={tag} className="tag-pill tag-peril hover:shadow-lg hover:scale-110 transition-all duration-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Source Link with Premium Styling */}
        <div className="border-t border-slate-200/50 pt-4">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-all duration-300 hover:drop-shadow-md group"
          >
            Read Full Article
            <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:scale-110 transition-all" />
          </a>
        </div>
      </div>
    </div>
  );
}

