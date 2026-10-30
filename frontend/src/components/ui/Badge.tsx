import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, HelpCircle, Sparkles } from 'lucide-react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'teal'
  | 'purple'
  | 'blue'
  | 'navy';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon = false,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    navy: 'bg-slate-900 text-blue-200 border border-slate-700',
    teal: 'bg-blue-50 text-blue-700 border border-blue-200/80', // compatibility alias mapping to blue
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    purple: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const renderIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'blue':
      case 'teal':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'warning':
        return <Clock className="w-3.5 h-3.5" />;
      case 'danger':
        return <XCircle className="w-3.5 h-3.5" />;
      case 'info':
        return <HelpCircle className="w-3.5 h-3.5" />;
      case 'purple':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && renderIcon()}
      {children}
    </span>
  );
};
