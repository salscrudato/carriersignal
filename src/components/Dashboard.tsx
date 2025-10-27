import { TrendingUp, AlertTriangle, Zap, BarChart3, Globe, Shield } from 'lucide-react';

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

  return (
    <div className="space-y-6 p-6">
      {/* Key Metrics */}
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
          color="purple"
        />
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Trends */}
        <InsightCard title="Top Trends" icon={<TrendingUp size={20} />} color="indigo">
          <div className="space-y-3">
            {topTrends.map(([trend, count]) => (
              <div key={trend} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{trend}</span>
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">{count}</span>
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

        {/* Top LOBs */}
        <InsightCard title="Top Lines of Business" icon={<Globe size={20} />} color="green">
          <div className="space-y-3">
            {topLobs.map(([lob, count]) => (
              <div key={lob} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{lob}</span>
                <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">{count}</span>
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
  color: 'blue' | 'red' | 'orange' | 'purple';
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-600',
    red: 'from-red-50 to-rose-50 border-red-200 text-red-600',
    orange: 'from-orange-50 to-amber-50 border-orange-200 text-orange-600',
    purple: 'from-purple-50 to-pink-50 border-purple-200 text-purple-600',
  };

  return (
    <div className={`liquid-glass rounded-xl border p-6 bg-gradient-to-br ${colorClasses[color]} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white/50 ${colorClasses[color].split(' ')[2]}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  icon: React.ReactNode;
  color: 'indigo' | 'red' | 'green';
  children: React.ReactNode;
}

function InsightCard({ title, icon, color, children }: InsightCardProps) {
  const colorClasses = {
    indigo: 'from-indigo-50 to-purple-50 border-indigo-200 text-indigo-600',
    red: 'from-red-50 to-rose-50 border-red-200 text-red-600',
    green: 'from-green-50 to-emerald-50 border-green-200 text-green-600',
  };

  return (
    <div className={`liquid-glass rounded-xl border p-6 bg-gradient-to-br ${colorClasses[color]} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-white/50">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

