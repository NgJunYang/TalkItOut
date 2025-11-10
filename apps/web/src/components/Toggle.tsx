import React from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const spring = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

export const Toggle: React.FC<ToggleProps> = ({ isOn, onToggle, label, className = '', disabled }) => {
  return (
    <button
      type="button"
      aria-pressed={isOn}
      onClick={onToggle}
      disabled={disabled}
      className={`flex items-center justify-between gap-3 w-full rounded-2xl border border-border/60 dark:border-borderDark/60 bg-surface/80 px-4 py-3 text-left transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-beige1 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {label && <span className="text-base font-medium text-text">{label}</span>}
      <div
        className={`w-12 h-6 rounded-full px-0.5 flex items-center ${isOn ? 'bg-beige1/90' : 'bg-border'} ${
          disabled ? 'opacity-70' : ''
        }`}
      >
        <motion.span
          layout
          transition={spring}
          className="h-5 w-5 rounded-full bg-white shadow-soft"
          style={{ justifySelf: isOn ? 'flex-end' : 'flex-start' }}
        />
      </div>
    </button>
  );
};

