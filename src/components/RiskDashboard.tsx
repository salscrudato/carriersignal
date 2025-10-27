interface Article {
  riskPulse?: 'LOW' | 'MEDIUM' | 'HIGH';
  tags: { perils: string[] };
}

interface RiskDashboardProps {
  articles: Article[];
}

export function RiskDashboard({ articles }: RiskDashboardProps) {
  // Calculate risk distribution
  const riskCounts = {
    HIGH: articles.filter(a => a.riskPulse === 'HIGH').length,
    MEDIUM: articles.filter(a => a.riskPulse === 'MEDIUM').length,
    LOW: articles.filter(a => a.riskPulse === 'LOW').length,
  };

  const totalArticles = articles.length;
  const highRiskPercentage = totalArticles > 0 ? Math.round((riskCounts.HIGH / totalArticles) * 100) : 0;
  const mediumRiskPercentage = totalArticles > 0 ? Math.round((riskCounts.MEDIUM / totalArticles) * 100) : 0;
  const lowRiskPercentage = totalArticles > 0 ? Math.round((riskCounts.LOW / totalArticles) * 100) : 0;

  // Get top perils
  const perilCounts: Record<string, number> = {};
  articles.forEach(article => {
    article.tags.perils.forEach(peril => {
      perilCounts[peril] = (perilCounts[peril] || 0) + 1;
    });
  });

  const topPerils = Object.entries(perilCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([peril, count]) => ({ peril, count }));

  // Determine market sentiment
  const getSentiment = () => {
    if (highRiskPercentage > 40) return { label: 'High Alert', color: 'text-red-600', bg: 'bg-red-50' };
    if (highRiskPercentage > 20) return { label: 'Elevated Risk', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Stable', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const sentiment = getSentiment();

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Market Sentiment */}
      <div className={`${sentiment.bg} rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Market Sentiment</h3>
          <div className={`w-3 h-3 rounded-full ${
            sentiment.label === 'High Alert' ? 'bg-red-600 animate-pulse' :
            sentiment.label === 'Elevated Risk' ? 'bg-amber-600 animate-pulse' :
            'bg-green-600'
          }`}></div>
        </div>
        <p className={`text-2xl font-bold ${sentiment.color}`}>{sentiment.label}</p>
        <p className="text-xs text-slate-600 mt-2">Based on {totalArticles} articles</p>
      </div>

      {/* Risk Distribution */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Risk Distribution</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-red-700">High Risk</span>
              <span className="text-xs font-bold text-red-700">{riskCounts.HIGH}</span>
            </div>
            <div className="w-full bg-red-100 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${highRiskPercentage}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-amber-700">Medium Risk</span>
              <span className="text-xs font-bold text-amber-700">{riskCounts.MEDIUM}</span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-2">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${mediumRiskPercentage}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-green-700">Low Risk</span>
              <span className="text-xs font-bold text-green-700">{riskCounts.LOW}</span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${lowRiskPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Perils */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Top Perils</h3>
        <div className="space-y-2">
          {topPerils.length > 0 ? (
            topPerils.map(({ peril, count }, idx) => (
              <div key={peril} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-600">#{idx + 1}</span>
                  <span className="text-sm font-medium text-slate-700 truncate">{peril}</span>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                  {count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No peril data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

