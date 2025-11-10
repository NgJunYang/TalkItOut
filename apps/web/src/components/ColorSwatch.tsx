import React from 'react';
import { motion } from 'framer-motion';

interface ColorSwatchProps {
  color: string;
  label: string;
  isActive: boolean;
  onSelect: (color: string) => void;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, label, isActive, onSelect }) => {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(color)}
      className="flex flex-col items-center gap-2 focus-visible:ring-2 focus-visible:ring-beige1 rounded-xl"
      aria-pressed={isActive}
    >
      <div
        className={`h-12 w-12 rounded-2xl border-2 transition-all duration-200 ${isActive ? 'scale-105 border-beige1 shadow-soft' : 'border-transparent'}`}
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-muted">{label}</span>
    </motion.button>
  );
};

