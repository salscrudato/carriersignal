/**
 * Company Health Dashboard
 * Displays financial health of insurance companies based on SEC filings and credit ratings
 */

interface CompanyHealth {
  name: string;
  ticker?: string;
  healthScore: number;
  recentFilings: number;
  creditRating?: string;
  financialStress: boolean;
  lastUpdated: string;
}

interface CompanyHealthDashboardProps {
  companies: CompanyHealth[];
}

function getHealthColor(score: number): string {
  if (score >= 8) return 'from-emerald-50 to-green-50';
  if (score >= 6) return 'from-amber-50 to-yellow-50';
  if (score >= 4) return 'from-orange-50 to-red-50';
  return 'from-red-50 to-rose-50';
}

function getHealthBadgeColor(score: number): string {
  if (score >= 8) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (score >= 6) return 'bg-amber-100 text-amber-800 border-amber-300';
  if (score >= 4) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

function getHealthLabel(score: number): string {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Fair';
  return 'At Risk';
}

export function CompanyHealthDashboard({ companies }: CompanyHealthDashboardProps) {
  if (companies.length === 0) {
    return null;
  }

  const averageHealth = companies.reduce((sum, c) => sum + c.healthScore, 0) / companies.length;
  const atRiskCount = companies.filter(c => c.financialStress).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.16 2.75a.75.75 0 00-1.32 0l-.478 1.435a.75.75 0 01-.564.564l-1.435.478a.75.75 0 000 1.32l1.435.478c.247.082.45.285.564.564l.478 1.435a.75.75 0 001.32 0l.478-1.435c.082-.247.285-.45.564-.564l1.435-.478a.75.75 0 000-1.32l-1.435-.478a.75.75 0 01-.564-.564l-.478-1.435zm7.84 7a.75.75 0 00-1.32 0l-.478 1.435a.75.75 0 01-.564.564l-1.435.478a.75.75 0 000 1.32l1.435.478c.247.082.45.285.564.564l.478 1.435a.75.75 0 001.32 0l.478-1.435c.082-.247.285-.45.564-.564l1.435-.478a.75.75 0 000-1.32l-1.435-.478a.75.75 0 01-.564-.564l-.478-1.435z" />
        </svg>
        Company Financial Health
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{averageHealth.toFixed(1)}</div>
          <div className="text-xs text-slate-600 font-medium">Average Health</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{companies.length}</div>
          <div className="text-xs text-slate-600 font-medium">Companies Tracked</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${atRiskCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {atRiskCount}
          </div>
          <div className="text-xs text-slate-600 font-medium">At Risk</div>
        </div>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${getHealthColor(company.healthScore)} rounded-lg p-4 border border-slate-200`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900">{company.name}</h3>
                {company.ticker && (
                  <p className="text-xs text-slate-600">{company.ticker}</p>
                )}
              </div>
              <div className={`px-2 py-1 rounded-full border text-xs font-semibold ${getHealthBadgeColor(company.healthScore)}`}>
                {getHealthLabel(company.healthScore)}
              </div>
            </div>

            {/* Health Score Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700">Health Score</span>
                <span className="text-xs font-bold text-slate-900">{company.healthScore.toFixed(1)}/10</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${
                    company.healthScore >= 8
                      ? 'from-emerald-500 to-green-500'
                      : company.healthScore >= 6
                      ? 'from-amber-500 to-yellow-500'
                      : company.healthScore >= 4
                      ? 'from-orange-500 to-red-500'
                      : 'from-red-600 to-rose-600'
                  }`}
                  style={{ width: `${(company.healthScore / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Recent Filings:</span>
                <span className="font-semibold text-slate-900">{company.recentFilings}</span>
              </div>
              {company.creditRating && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Credit Rating:</span>
                  <span className="font-semibold text-slate-900">{company.creditRating}</span>
                </div>
              )}
              {company.financialStress && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-300">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                  </svg>
                  <span className="text-xs font-semibold text-red-700">Financial Stress Detected</span>
                </div>
              )}
            </div>

            {/* Last Updated */}
            <div className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-300">
              Updated: {new Date(company.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

