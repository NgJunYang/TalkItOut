import React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'positive' | 'neutral' | 'negative' | 'warning' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    positive: 'bg-accent-mint text-brand-green border border-brand-green/30',
    neutral: 'bg-blue-50 text-blue-700 border border-blue-200',
    negative: 'bg-red-50 text-red-700 border border-red-200',
    warning: 'bg-accent-peach text-orange-700 border border-orange-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
