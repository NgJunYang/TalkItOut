import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, className = '', ...props }) => {
  return (
    <label className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <input
        type="range"
        {...props}
        className={`w-full accent-[var(--beige-1)] cursor-pointer appearance-none rounded-full bg-gradient-to-r from-beige1 to-beige2 h-2 ${className}`}
      />
    </label>
  );
};

