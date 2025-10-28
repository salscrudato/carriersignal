import { TrendingUp, AlertTriangle, Zap, BarChart3, Globe, Shield, Cloud, FileText, Clock } from 'lucide-react';

interface Article {
  title: string;
  tags?: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    trends?: string[];
    regulations?: string[];
  };
  impactScore?: number;
  regulatory?: boolean;
  stormName?: string;
}

interface DashboardProps {
  articles: Article[];
}

export function Dashboard({ articles }: DashboardProps) {
  // Calculate statistics
  const stats = {
    totalArticles: articles.length,
    highImpact: articles.filter(a => (a.impactScore || 0) > 75).length,
    regulatory: articles.filter(a => a.regulatory).length,
    catastrophes: articles.filter(a => a.stormName).length,
  };

  // Extract top trends
  const trends = new Map<string, number>();
  articles.forEach(article => {
    article.tags?.trends?.forEach(trend => {
      trends.set(trend, (trends.get(trend) || 0) + 1);
    });
  });
  const topTrends = Array.from(trends.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Extract top perils
  const perils = new Map<string, number>();
  articles.forEach(article => {
    article.tags?.perils?.forEach(peril => {
      perils.set(peril, (perils.get(peril) || 0) + 1);
    });
  });
  const topPerils = Array.from(perils.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Extract top LOBs
  const lobs = new Map<string, number>();
  articles.forEach(article => {
    article.tags?.lob?.forEach(lob => {
      lobs.set(lob, (lobs.get(lob) || 0) + 1);
    });
  });
  const topLobs = Array.from(lobs.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Extract top regions
  const regions = new Map<string, number>();
  articles.forEach(article => {
    article.tags?.regions?.forEach(region => {
      regions.set(region, (regions.get(region) || 0) + 1);
    });
  });
  const topRegions = Array.from(regions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Extract catastrophes (storms)
  const storms = articles
    .filter(a => a.stormName)
    .map(a => a.stormName)
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 5);

  // Extract regulatory items (this week)
  const regulatoryItems = articles
    .filter(a => a.regulatory)
    .slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      {/* Today's Signal - Key Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap size={28} className="text-blue-600" />
          Today's Signal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<BarChart3 size={24} />}
            label="Total Articles"
            value={stats.totalArticles}
            color="blue"
          />
          <MetricCard
            icon={<Zap size={24} />}
            label="High Impact"
            value={stats.highImpact}
            color="red"
          />
          <MetricCard
            icon={<AlertTriangle size={24} />}
            label="Regulatory"
            value={stats.regulatory}
            color="orange"
          />
          <MetricCard
            icon={<Shield size={24} />}
            label="Catastrophes"
            value={stats.catastrophes}
            color="blue"
          />
        </div>
      </div>

      {/* CAT Ticker & Regulatory Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CAT Ticker */}
        <InsightCard title="Active Catastrophes" icon={<Cloud size={20} />} color="blue">
          {storms.length > 0 ? (
            <div className="space-y-3">
              {storms.map((storm, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <Cloud size={16} className="text-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">{storm}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-bold">Active</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No active catastrophes tracked</p>
          )}
        </InsightCard>

        {/* Regulatory Tracker */}
        <InsightCard title="Regulatory Updates" icon={<FileText size={20} />} color="red">
          {regulatoryItems.length > 0 ? (
            <div className="space-y-3">
              {regulatoryItems.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-all duration-300">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 line-clamp-2">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.tags?.regulations?.[0] || 'Regulatory'}</p>
                  </div>
                  <Clock size={14} className="text-red-500 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No regulatory updates this week</p>
          )}
        </InsightCard>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Top Trends */}
        <InsightCard title="Top Trends" icon={<TrendingUp size={20} />} color="blue">
          <div className="space-y-3">
            {topTrends.map(([trend, count]) => (
              <div key={trend} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{trend}</span>
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Top Perils */}
        <InsightCard title="Top Perils" icon={<AlertTriangle size={20} />} color="red">
          <div className="space-y-3">
            {topPerils.map(([peril, count]) => (
              <div key={peril} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{peril}</span>
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Top States */}
        <InsightCard title="Top States" icon={<Globe size={20} />} color="green">
          <div className="space-y-3">
            {topRegions.map(([region, count]) => (
              <div key={region} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{region}</span>
                <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Top LOBs */}
        <InsightCard title="Top Lines of Business" icon={<Shield size={20} />} color="blue">
          <div className="space-y-3">
            {topLobs.map(([lob, count]) => (
              <div key={lob} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{lob}</span>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </InsightCard>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'red' | 'orange';
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-50 to-purple-50 border-blue-200/40 text-blue-600',
    red: 'from-red-50 to-rose-50 border-red-200/40 text-red-600',
    orange: 'from-orange-50 to-amber-50 border-orange-200/40 text-orange-600',
  };

  return (
    <div className={`liquid-glass-premium rounded-xl border p-6 bg-gradient-to-br ${colorClasses[color]} hover:shadow-lg transition-all duration-300 animate-enhancedPremiumGlow elevated-glow`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg liquid-glass-light ${colorClasses[color].split(' ')[2]} animate-iconGlow shadow-md border border-white/50`}>
          {icon}
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-600 mb-1">{label}</p>
      <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{value}</p>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'green';
  children: React.ReactNode;
}

function InsightCard({ title, icon, color, children }: InsightCardProps) {
  const colorClasses = {
    blue: 'from-blue-50 to-purple-50 border-blue-200/40 text-blue-600',
    red: 'from-red-50 to-rose-50 border-red-200/40 text-red-600',
    green: 'from-green-50 to-emerald-50 border-green-200/40 text-green-600',
  };

  return (
    <div className={`liquid-glass-premium rounded-xl border p-6 bg-gradient-to-br ${colorClasses[color]} hover:shadow-lg transition-all duration-300 animate-enhancedPremiumGlow elevated-glow`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg liquid-glass-light animate-iconGlow shadow-md border border-white/50">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

