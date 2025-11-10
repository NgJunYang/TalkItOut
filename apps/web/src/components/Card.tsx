import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-[#fdfcf9] dark:bg-[#2b2521] rounded-3xl p-6 shadow-soft border border-[#e8dcc8] dark:border-[#3a3330] transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

