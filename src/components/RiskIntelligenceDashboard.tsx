/**
 * Risk Intelligence Dashboard
 * Displays disaster events, weather alerts, and trending topics
 */

interface DisasterEvent {
  id: string;
  declarationDate: string;
  disasterType: string;
  state: string;
  county?: string;
  title: string;
}

interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  areaDesc: string;
  severity: string;
}

interface RiskIntelligenceDashboardProps {
  disasters: DisasterEvent[];
  weatherAlerts: WeatherAlert[];
  trendingTopics: Map<string, number>;
}

export function RiskIntelligenceDashboard({
  disasters,
  weatherAlerts,
  trendingTopics,
}: RiskIntelligenceDashboardProps) {
  const recentDisasters = disasters.slice(0, 5);
  const severeAlerts = weatherAlerts.filter(a => a.severity === 'Severe' || a.severity === 'Extreme').slice(0, 5);
  const topTopics = Array.from(trendingTopics.entries()).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-t-2xl opacity-60"></div>

      <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
          </svg>
        </div>
        Risk Intelligence
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Disasters */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-200 hover:shadow-md transition-shadow duration-300">
          <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2 text-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
            </svg>
            Recent Disasters
          </h3>
          {recentDisasters.length > 0 ? (
            <ul className="space-y-3">
              {recentDisasters.map(disaster => (
                <li key={disaster.id} className="text-sm p-2 rounded-lg bg-white border border-red-100 hover:border-red-300 hover:shadow-sm transition-all duration-300">
                  <div className="font-bold text-red-900">{disaster.disasterType}</div>
                  <div className="text-red-700 font-medium">{disaster.state}</div>
                  <div className="text-xs text-red-600 font-medium">
                    {new Date(disaster.declarationDate).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-red-700 font-medium">No recent disasters</p>
          )}
        </div>

        {/* Severe Weather Alerts */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-200 hover:shadow-md transition-shadow duration-300">
          <h3 className="font-bold text-cyan-900 mb-4 flex items-center gap-2 text-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 16H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V16H5.5z" />
            </svg>
            Severe Weather
          </h3>
          {severeAlerts.length > 0 ? (
            <ul className="space-y-3">
              {severeAlerts.map(alert => (
                <li key={alert.id} className="text-sm p-2 rounded-lg bg-white border border-cyan-100 hover:border-cyan-300 hover:shadow-sm transition-all duration-300">
                  <div className="font-bold text-cyan-900">{alert.event}</div>
                  <div className="text-cyan-700 line-clamp-2 font-medium">{alert.areaDesc}</div>
                  <div className="text-xs text-cyan-600 font-bold">{alert.severity}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cyan-700 font-medium">No severe weather alerts</p>
          )}
        </div>

        {/* Trending Topics */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200 hover:shadow-md transition-shadow duration-300">
          <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Trending Topics
          </h3>
          {topTopics.length > 0 ? (
            <ul className="space-y-2">
              {topTopics.map(([topic, count]) => (
                <li key={topic} className="text-sm p-2 rounded-lg bg-white border border-purple-100 hover:border-purple-300 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 capitalize">{topic}</span>
                    <span className="text-xs font-bold text-purple-700 bg-gradient-to-r from-purple-200 to-pink-200 px-2.5 py-1 rounded-full">
                      {count}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-purple-700 font-medium">No trending topics</p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 border border-red-100">
          <div className="text-3xl font-black text-red-600">{disasters.length}</div>
          <div className="text-xs text-slate-600 font-bold uppercase tracking-wide mt-1">Active Disasters</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
          <div className="text-3xl font-black text-cyan-600">{weatherAlerts.length}</div>
          <div className="text-xs text-slate-600 font-bold uppercase tracking-wide mt-1">Weather Alerts</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
          <div className="text-3xl font-black text-purple-600">{trendingTopics.size}</div>
          <div className="text-xs text-slate-600 font-bold uppercase tracking-wide mt-1">Trending Topics</div>
        </div>
      </div>
    </div>
  );
}

