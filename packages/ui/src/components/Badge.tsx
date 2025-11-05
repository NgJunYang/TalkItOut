import React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'positive' | 'neutral' | 'negative' | 'warning' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    positive: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    neutral: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    negative: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
