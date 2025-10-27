interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  primary: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:shadow-sm transition-all duration-350',
  secondary: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 hover:shadow-sm transition-all duration-350',
  success: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:shadow-sm transition-all duration-350',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:shadow-sm transition-all duration-350',
  danger: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:shadow-sm transition-all duration-350',
  neutral: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:shadow-sm transition-all duration-350',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = ''
}: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border transition-all duration-300 hover:shadow-sm ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

