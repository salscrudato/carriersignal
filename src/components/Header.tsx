import { Shield, Zap, FileText, AlertCircle, Handshake, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  isLoading: boolean;
  roles?: string[];
  onRolesChange?: (roles: string[]) => void;
}

const ROLE_OPTIONS = [
  { id: 'underwriting', label: 'Underwriting', icon: FileText },
  { id: 'claims', label: 'Claims', icon: AlertCircle },
  { id: 'brokerage', label: 'Brokerage', icon: Handshake },
  { id: 'actuarial', label: 'Actuarial', icon: TrendingUp },
];

export function Header({
  isLoading,
  roles = ['underwriting'],
  onRolesChange,
}: HeaderProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-blue-200/30 transition-all duration-350"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >

      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden">
        <div className="flex items-center justify-center h-16 sm:h-20 gap-4 touch-manipulation relative w-full max-w-full overflow-x-hidden">
          {/* Center: Logo & Branding - Centered */}
          <div className="flex items-center justify-center gap-2 group flex-shrink-0">
            {/* Modern Shield Icon with Blue-Purple-Pink Glow */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 animate-deepGlow">
              {/* Glow backdrop - subtle blue-purple-pink glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-300"></div>
              <Shield size={16} className="text-white sm:w-5 sm:h-5 animate-iconGlow relative z-10" />
            </div>

            {/* Title & Tagline */}
            <div className="flex flex-col justify-center items-center">
              <h1
                className="text-sm sm:text-lg font-bold tracking-tight transition-all duration-350 group-hover:scale-105 whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #a855f7 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                AI-Curated Insurance News
              </h1>
            </div>
          </div>

          {/* Right: Role Selector, Density Toggle & Status */}
          <div className="flex items-center gap-2 flex-shrink-0 absolute right-0">
            {/* A2: Role Selector Dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg hover:bg-blue-50/50 transition-all duration-300 text-xs font-semibold text-blue-700"
              >
                {(() => {
                  const roleOption = ROLE_OPTIONS.find(r => r.id === roles[0]);
                  const IconComponent = roleOption?.icon;
                  return IconComponent ? <IconComponent size={16} /> : null;
                })()}
                <span className="hidden md:inline">{ROLE_OPTIONS.find(r => r.id === roles[0])?.label}</span>
              </button>

              {/* Role Menu Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-lg z-50 border border-blue-200/30">
                  {ROLE_OPTIONS.map(role => {
                    const IconComponent = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          onRolesChange?.([role.id]);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          roles.includes(role.id)
                            ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                            : 'text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        <IconComponent size={16} />
                        <span>{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulseGlow opacity-50"></div>
                </div>
                <span className="text-xs font-semibold text-blue-700 hidden sm:inline">Analyzing…</span>
              </div>
            )}

            {/* Professional Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass rounded-full">
              <Zap size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-700">Pro</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

