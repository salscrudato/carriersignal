/**
 * Regulatory Dashboard
 * Displays regulatory news and compliance tracking by state
 */

interface RegulatoryNews {
  id: string;
  state: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

interface RegulatoryDashboardProps {
  regulatoryNews: RegulatoryNews[];
}

function getCategoryBadgeColor(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('rate') || lower.includes('premium')) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (lower.includes('claim') || lower.includes('coverage')) return 'bg-purple-100 text-purple-800 border-purple-300';
  if (lower.includes('compliance') || lower.includes('requirement')) return 'bg-amber-100 text-amber-800 border-amber-300';
  if (lower.includes('enforcement') || lower.includes('penalty')) return 'bg-red-100 text-red-800 border-red-300';
  return 'bg-slate-100 text-slate-800 border-slate-300';
}

export function RegulatoryDashboard({ regulatoryNews }: RegulatoryDashboardProps) {
  if (regulatoryNews.length === 0) {
    return null;
  }

  // Group by state
  const byState = new Map<string, RegulatoryNews[]>();
  for (const news of regulatoryNews) {
    if (!byState.has(news.state)) {
      byState.set(news.state, []);
    }
    byState.get(news.state)!.push(news);
  }

  // Get top states by news count
  const topStates = Array.from(byState.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);

  // Get recent news
  const recentNews = regulatoryNews
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-7 mb-8 hover:shadow-xl transition-all duration-350 relative">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-t-2xl opacity-70"></div>

      <h2 className="text-2xl font-black text-slate-900 mb-7 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
        Regulatory Compliance
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6.5">
        {/* Top States */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 hover:shadow-lg transition-all duration-350">
          <h3 className="font-black text-amber-900 mb-5 flex items-center gap-2 text-lg">
            <svg className="w-5 h-5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            Most Active States
          </h3>
          <ul className="space-y-3.5">
            {topStates.map(([state, news]) => (
              <li key={state} className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all duration-350">
                <div>
                  <div className="font-bold text-slate-900">{state}</div>
                  <div className="text-xs text-slate-600 font-semibold">{news.length} regulatory updates</div>
                </div>
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 shadow-sm">
                  <span className="text-sm font-bold text-amber-700">{news.length}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent News */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-350">
          <h3 className="font-black text-slate-900 mb-5 flex items-center gap-2 text-lg">
            <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 9.414l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
            Recent Updates
          </h3>
          <ul className="space-y-3.5">
            {recentNews.map(news => (
              <li key={news.id} className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-350">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="font-bold text-slate-900 text-sm line-clamp-2">{news.title}</div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${getCategoryBadgeColor(news.category)}`}>
                    {news.category}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mb-2 font-semibold">{news.state}</div>
                <div className="text-xs text-slate-500">{new Date(news.date).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4.5 mt-7 pt-7 border-t border-slate-200">
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-all duration-350">
          <div className="text-3xl font-black text-blue-600">{regulatoryNews.length}</div>
          <div className="text-xs text-slate-600 font-bold uppercase tracking-widest mt-2">Total Updates</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 hover:shadow-md transition-all duration-350">
          <div className="text-3xl font-black text-amber-600">{byState.size}</div>
          <div className="text-xs text-slate-600 font-bold uppercase tracking-widest mt-2">States Covered</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-all duration-350">
          <div className="text-3xl font-black text-purple-600">
            {new Set(regulatoryNews.map(n => n.category)).size}
          </div>
          <div className="text-xs text-slate-600 font-bold uppercase tracking-widest mt-2">Categories</div>
        </div>
      </div>
    </div>
  );
}

