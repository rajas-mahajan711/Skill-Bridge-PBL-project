import React from 'react';
import { X, AlertCircle, Loader2, Inbox } from 'lucide-react';

export const Logo = ({ dark = false, size = 32 }) => (
  <div className="flex items-center gap-2.5">
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill={dark ? '#FFFFFF' : '#0B1F3A'} fillOpacity={dark ? 0.12 : 1} />
      <path d="M6 27Q20 8 34 27" stroke="#0EA5A4" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M5 28H35" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13 28V20M20 28V15M27 28V20" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.5" />
      {[[13, 20], [20, 15], [27, 20]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" fill={i === 1 ? '#4F46E5' : '#FFFFFF'} stroke="#0EA5A4" strokeWidth="1.2" />
      ))}
    </svg>
    <span className={`font-bold text-lg tracking-tight ${dark ? 'text-white' : 'text-navy'}`}>
      Skill<span className="text-teal">Bridge</span>
    </span>
  </div>
);

export const Card = ({ children, className = '', ...props }) => (
  <div
    {...props}
    className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-5 transition-all ${className}`}
  >
    {children}
  </div>
);

export const Title = ({ children, sub, action }) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="font-semibold text-ink text-base">{children}</h3>
      {sub && <p className="text-xs text-mute mt-0.5">{sub}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const Btn = ({
  children,
  v = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  const variants = {
    primary: 'bg-indigo text-white hover:bg-indigo-700 shadow-sm border border-transparent',
    teal: 'bg-teal text-white hover:bg-teal-700 shadow-sm border border-transparent',
    secondary: 'border border-slate-200 bg-white text-ink hover:bg-slate-50',
    ghost: 'text-mute hover:text-ink hover:bg-slate-100/60',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200',
    outline: 'border border-indigo/30 text-indigo hover:bg-indigo/5'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-5 py-2.5 text-base rounded-xl'
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[v] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const colorFor = (v) => (v >= 80 ? '#10B981' : v >= 60 ? '#4F46E5' : '#F59E0B');

export const Bar = ({ v = 0, color, h = 8 }) => (
  <div className="w-full bg-slate-100 rounded-full overflow-hidden" style={{ height: h }}>
    <div
      className="h-full rounded-full transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, v))}%`, background: color || colorFor(v) }}
    />
  </div>
);

export const Badge = ({ status, variant, children }) => {
  const key = (variant || status || '').toLowerCase();
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    connected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    degraded: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    offline: 'bg-rose-50 text-rose-700 border-rose-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    low: 'bg-rose-50 text-rose-700 border-rose-200',
    
    demo: 'bg-purple-50 text-purple-700 border-purple-200',
    configured: 'bg-blue-50 text-blue-700 border-blue-200',
    student: 'bg-indigo/10 text-indigo border-indigo/20',
    faculty: 'bg-teal/10 text-teal-700 border-teal/20',
    recruiter: 'bg-amber-50 text-amber-700 border-amber-200',
    admin: 'bg-slate-900 text-white border-transparent'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${styles[key] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children || status || variant}
    </span>
  );
};

export const StatCard = ({ label, value, sub, icon: Icon, color = '#4F46E5', trend }) => (
  <Card className="flex items-center gap-4">
    <div
      className="w-12 h-12 rounded-xl grid place-items-center shrink-0"
      style={{ background: `${color}18`, color }}
    >
      {Icon && <Icon size={22} />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs text-mute truncate">{label}</div>
      <div className="text-2xl font-bold leading-tight mt-0.5">{value}</div>
      <div className="text-xs text-mute flex items-center gap-1 mt-0.5">
        {trend && <span className="text-emerald-600 font-medium">{trend}</span>}
        <span>{sub}</span>
      </div>
    </div>
  </Card>
);

export const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-ink">{title}</h3>
            {subtitle && <p className="text-xs text-mute mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-mute hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const LoadingState = ({ message = 'Loading platform data...' }) => (
  <div className="py-12 flex flex-col items-center justify-center text-center">
    <Loader2 size={32} className="text-teal animate-spin mb-3" />
    <p className="text-sm text-mute">{message}</p>
  </div>
);

export const EmptyState = ({ title = 'No data found', description = 'Try adjusting your filters or search terms.' }) => (
  <div className="py-12 px-4 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
    <Inbox size={40} className="text-slate-300 mb-3" />
    <h4 className="text-sm font-semibold text-ink">{title}</h4>
    <p className="text-xs text-mute mt-1 max-w-sm">{description}</p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 flex items-start gap-3 text-rose-800">
    <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
    <div className="flex-1">
      <h4 className="text-sm font-semibold">Service Request Error</h4>
      <p className="text-xs text-rose-700 mt-1">{message || 'Could not load data from backend server.'}</p>
      {onRetry && (
        <Btn size="sm" v="secondary" className="mt-3 bg-white" onClick={onRetry}>
          Try Again
        </Btn>
      )}
    </div>
  </div>
);
