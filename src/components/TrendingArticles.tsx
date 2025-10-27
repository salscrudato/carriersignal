interface Article {
  title: string;
  url: string;
  source: string;
  riskPulse?: 'LOW' | 'MEDIUM' | 'HIGH';
  publishedAt?: string;
}

interface TrendingArticlesProps {
  articles: Article[];
  onArticleClick?: (article: Article) => void;
}

export function TrendingArticles({ articles, onArticleClick }: TrendingArticlesProps) {
  // Get trending articles (HIGH risk + recent)
  const trendingArticles = articles
    .filter(a => a.riskPulse === 'HIGH')
    .slice(0, 3);

  if (trendingArticles.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-md">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">🔥 Trending Now</h2>
        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
          High Risk
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trendingArticles.map((article, idx) => (
          <a
            key={idx}
            href={article.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => onArticleClick?.(article)}
            className="group bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200 p-4 hover:shadow-lg hover:border-red-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm">
                  {idx + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">{article.source}</span>
                  <svg className="w-4 h-4 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                    <path fill="currentColor" d="M8.293 4.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L10.414 3l3.293 3.293a1 1 0 01-1.414 1.414l-4-4z" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

