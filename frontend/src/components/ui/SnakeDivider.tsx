import React from 'react';

interface SnakeDividerProps {
  className?: string;
  opacity?: number;
  inverted?: boolean;
}

export const SnakeDivider: React.FC<SnakeDividerProps> = ({
  className = '',
  opacity = 0.45,
  inverted = false,
}) => (
  <div className={`flex items-center justify-center py-8 sm:py-12 ${className}`}>
    <div
      className="h-[1px] flex-1 max-w-xs transition-opacity"
      style={{
        background: inverted
          ? 'linear-gradient(90deg, transparent, rgba(176,141,87,0.45))'
          : 'linear-gradient(90deg, transparent, rgba(176,141,87,0.35))',
      }}
    />
    <div className="mx-6 relative flex items-center justify-center">
      <img
        src="/brand/Snake.svg"
        alt="Serpent emblem"
        className={`w-7 sm:w-9 h-auto object-contain transition-opacity select-none ${
          inverted ? 'brightness-0 invert' : ''
        }`}
        style={{ opacity }}
      />
    </div>
    <div
      className="h-[1px] flex-1 max-w-xs transition-opacity"
      style={{
        background: inverted
          ? 'linear-gradient(90deg, rgba(176,141,87,0.45), transparent)'
          : 'linear-gradient(90deg, rgba(176,141,87,0.35), transparent)'
      }}
    />
  </div>
);

