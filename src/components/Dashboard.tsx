import { TrendingUp, AlertTriangle, Zap, BarChart3, Globe, Shield, Cloud, FileText, Clock } from 'lucide-react';
import { useMemo } from 'react';
import type { Article } from '../types';

interface DashboardProps {
  articles: Article[];
}

export function Dashboard({ articles }: DashboardProps) {
  // Calculate statistics with useMemo
  const stats = useMemo(() => ({
    totalArticles: articles.length,
    highImpact: articles.filter(a => (a.impactScore || 0) > 75).length,
    regulatory: articles.filter(a => a.regulatory).length,
    catastrophes: articles.filter(a => a.stormName).length,
  }), [articles]);

  // Extract top trends with useMemo
  const topTrends = useMemo(() => {
    const trends = new Map<string, number>();
    articles.forEach(article => {
      article.tags?.trends?.forEach(trend => {
        trends.set(trend, (trends.get(trend) || 0) + 1);
      });
    });
    return Array.from(trends.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [articles]);

  // Extract top perils with useMemo
  const topPerils = useMemo(() => {
    const perils = new Map<string, number>();
    articles.forEach(article => {
      article.tags?.perils?.forEach(peril => {
        perils.set(peril, (perils.get(peril) || 0) + 1);
      });
    });
    return Array.from(perils.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [articles]);

  // Extract top LOBs with useMemo
  const topLobs = useMemo(() => {
    const lobs = new Map<string, number>();
    articles.forEach(article => {
      article.tags?.lob?.forEach(lob => {
        lobs.set(lob, (lobs.get(lob) || 0) + 1);
      });
    });
    return Array.from(lobs.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [articles]);

  // Extract top regions with useMemo
  const topRegions = useMemo(() => {
    const regions = new Map<string, number>();
    articles.forEach(article => {
      article.tags?.regions?.forEach(region => {
        regions.set(region, (regions.get(region) || 0) + 1);
      });
    });
    return Array.from(regions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [articles]);

  // Extract catastrophes (storms) with useMemo
  const storms = useMemo(() => articles
    .filter(a => a.stormName)
    .map(a => a.stormName)
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 5), [articles]);

  // Extract regulatory items (this week)
  const regulatoryItems = articles
    .filter(a => a.regulatory)
    .slice(0, 5);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Today's Signal - Key Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2 group">
          <Zap size={28} className="text-[#5AA6FF] group-hover:animate-pulse transition-all duration-250" />
          Today's Signal
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* CAT Ticker */}
        <InsightCard title="Active Catastrophes" icon={<Cloud size={20} />} color="blue">
          {storms.length > 0 ? (
            <div className="space-y-2.5">
              {storms.map((storm, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#F9FBFF]/60 rounded-lg hover:bg-[#F0F7FF]/80 transition-all duration-250 hover:shadow-md hover:scale-102 transform">
                  <div className="flex items-center gap-2">
                    <Cloud size={16} className="text-[#5AA6FF] group-hover:animate-pulse" />
                    <span className="text-sm font-semibold text-[#0F172A]">{storm}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#E8F2FF] to-[#E8F2FF] text-[#5AA6FF] text-xs font-bold hover:shadow-md transition-all duration-250">Active</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748B] italic">No active catastrophes tracked</p>
          )}
        </InsightCard>

        {/* Regulatory Tracker */}
        <InsightCard title="Regulatory Updates" icon={<FileText size={20} />} color="red">
          {regulatoryItems.length > 0 ? (
            <div className="space-y-2.5">
              {regulatoryItems.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-[#F9FBFF]/60 rounded-lg hover:bg-[#FEE2E2]/60 transition-all duration-250 hover:shadow-md hover:scale-102 transform">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] line-clamp-2">{item.title}</p>
                    <p className="text-xs text-[#64748B] mt-1">{item.tags?.regulations?.[0] || 'Regulatory'}</p>
                  </div>
                  <Clock size={14} className="text-[#EF4444] flex-shrink-0 ml-2 group-hover:animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748B] italic">No regulatory updates this week</p>
          )}
        </InsightCard>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Top Trends */}
        <InsightCard title="Top Trends" icon={<TrendingUp size={20} />} color="blue">
          <div className="space-y-3">
            {topTrends.map(([trend, count]) => (
              <div key={trend} className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0F172A]">{trend}</span>
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#E8F2FF] to-[#E8F2FF] text-[#5AA6FF] text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Top Perils */}
        <InsightCard title="Top Perils" icon={<AlertTriangle size={20} />} color="red">
          <div className="space-y-3">
            {topPerils.map(([peril, count]) => (
              <div key={peril} className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0F172A]">{peril}</span>
                <span className="px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#EF4444] text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Top States */}
        <InsightCard title="Top States" icon={<Globe size={20} />} color="green">
          <div className="space-y-3">
            {topRegions.map(([region, count]) => (
              <div key={region} className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0F172A]">{region}</span>
                <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Top LOBs */}
        <InsightCard title="Top Lines of Business" icon={<Shield size={20} />} color="blue">
          <div className="space-y-3">
            {topLobs.map(([lob, count]) => (
              <div key={lob} className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0F172A]">{lob}</span>
                <span className="px-2.5 py-1 rounded-full bg-[#E8F2FF] text-[#5AA6FF] text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </InsightCard>
      </div>
    </div>
  );
}

export default Dashboard;

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'red' | 'orange';
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-[#E8F2FF]/70 to-[#E8F2FF]/50 border-[#5AA6FF]/60 text-[#5AA6FF]',
    red: 'from-[#FEE2E2]/70 to-[#FEE2E2]/50 border-[#EF4444]/60 text-[#EF4444]',
    orange: 'from-[#FEF3C7]/70 to-[#FEF3C7]/50 border-[#F59E0B]/60 text-[#F59E0B]',
  };

  return (
    <div className={`liquid-glass-premium rounded-xl border p-5 bg-gradient-to-br ${colorClasses[color]} hover:shadow-lg hover:shadow-[#5AA6FF]/20 transition-all duration-300 animate-enhancedPremiumGlow elevated-glow hover:scale-105`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg liquid-glass-light ${colorClasses[color].split(' ')[2]} animate-iconGlow shadow-sm border border-white/50`}>
          {icon}
        </div>
      </div>
      <p className="text-xs font-semibold text-[#64748B] mb-1.5">{label}</p>
      <p className="text-3xl font-bold bg-gradient-to-r from-[#0F172A] via-[#5AA6FF] to-[#0F172A] bg-clip-text text-transparent">{value}</p>
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
    blue: 'from-[#E8F2FF]/70 to-[#E8F2FF]/50 border-[#5AA6FF]/60 text-[#5AA6FF]',
    red: 'from-[#FEE2E2]/70 to-[#FEE2E2]/50 border-[#EF4444]/60 text-[#EF4444]',
    green: 'from-[#DCFCE7]/70 to-[#DCFCE7]/50 border-[#16A34A]/60 text-[#16A34A]',
  };

  return (
    <div className={`liquid-glass-premium rounded-xl border p-6 bg-gradient-to-br ${colorClasses[color]} hover:shadow-xl hover:shadow-[#5AA6FF]/20 transition-all duration-300 animate-enhancedPremiumGlow elevated-glow hover:scale-[1.01]`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg liquid-glass-light animate-iconGlow shadow-md border border-white/60">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-[#0F172A]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

