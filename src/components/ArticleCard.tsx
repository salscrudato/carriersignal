

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
  tags?: { lob?: string[]; perils?: string[]; regions?: string[]; companies?: string[] };
  recencyScore?: number;
  relevanceScore?: number;
  combinedScore?: number;
  disasterScore?: number;
  weatherScore?: number;
  financialScore?: number;
}

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const timeAgo = article.publishedAt ? getTimeAgo(new Date(article.publishedAt)) : '';

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-350 flex flex-col h-full touch-manipulation hover:border-opacity-100">
      {/* Accent line at top */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>

      {/* Header */}
      <div className="px-7 py-7 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50">
        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="block text-lg font-black text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 rounded leading-snug mb-4"
        >
          {article.title}
        </a>
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="font-bold text-slate-700 uppercase tracking-widest">{article.source}</span>
          {timeAgo && <span className="text-slate-500 font-semibold">{timeAgo}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="px-7 py-7 flex-1 flex flex-col">
        {/* Description */}
        {article.description && (
          <p className="text-sm text-slate-700 leading-relaxed mb-5 font-medium">
            {article.description}
          </p>
        )}

        {/* AI Key Points - Insurance Sector Insights */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-lg transition-all duration-350 group/insights">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover/insights:scale-115 transition-transform duration-350">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Key Insights</h4>
              <span className="ml-auto text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full">{article.bullets5.length}</span>
            </div>
            <ul className="space-y-3">
              {article.bullets5.slice(0, 5).map((bullet, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700 leading-relaxed font-medium">
                  <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5 text-lg">•</span>
                  <span className="flex-1">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Read More Link */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-all duration-350 group/link"
          >
            Read Full Article
            <svg className="w-4 h-4 group-hover/link:translate-x-2 transition-transform duration-350" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

