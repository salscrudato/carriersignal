import { Shield, Zap, BarChart3, Search } from 'lucide-react';

interface HeaderProps {
  isLoading: boolean;
  view?: 'feed' | 'dashboard';
  onViewChange?: (view: 'feed' | 'dashboard') => void;
}

export function Header({ isLoading, view = 'feed', onViewChange }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 liquid-glass border-b border-slate-200 transition-all duration-350"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4 touch-manipulation">
          {/* Left: Logo & Branding */}
          <div className="flex items-center gap-3 group flex-shrink-0">
            {/* Professional Shield Icon */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <Shield size={20} className="text-white sm:w-6 sm:h-6" />
            </div>

            {/* Title & Tagline */}
            <div className="flex flex-col justify-center">
              <h1
                className="text-lg sm:text-2xl font-black tracking-tight transition-all duration-350 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                  fontWeight: 950,
                  letterSpacing: '-0.02em',
                }}
              >
                CarrierSignal
              </h1>
              <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase hidden sm:block">
                P&C Insurance Intelligence
              </p>
            </div>
          </div>

          {/* Center: View Toggle & Status */}
          <div className="hidden md:flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-1 glass rounded-lg p-1">
              <button
                onClick={() => onViewChange?.('feed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
                  view === 'feed'
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Search size={14} />
                Feed
              </button>
              <button
                onClick={() => onViewChange?.('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
                  view === 'dashboard'
                    ? 'bg-indigo-100 text-indigo-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <BarChart3 size={14} />
                Dashboard
              </button>
            </div>

            {/* Live Updates Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 bg-green-500 rounded-full animate-pulseGlow opacity-50"></div>
              </div>
              <span className="text-xs font-semibold text-slate-700">Live</span>
            </div>
          </div>

          {/* Right: Status Indicator */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulseGlow opacity-50"></div>
                </div>
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline">Analyzing…</span>
              </div>
            )}

            {/* Professional Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass rounded-full">
              <Zap size={14} className="text-amber-600" />
              <span className="text-xs font-bold text-slate-700">Pro</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

