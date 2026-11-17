'use client';

import React from 'react';

interface ArchFrameProps {
  children?: React.ReactNode;
  className?: string;
  bgColor?: string;
  archHeightRatio?: string; // e.g. "h-[85%]"
}

export const ArchFrame: React.FC<ArchFrameProps> = ({
  children,
  className = '',
  bgColor = 'bg-[#F1EADA]',
  archHeightRatio = 'h-[90%]',
}) => {
  return (
    <div className={`relative w-full h-full min-h-[380px] sm:min-h-[460px] flex items-center justify-center ${className}`}>
      {/* Arch backdrop */}
      <div
        className={`absolute inset-x-4 bottom-0 ${archHeightRatio} ${bgColor} rounded-t-[100px] sm:rounded-t-[140px] md:rounded-t-[180px] shadow-[inset_0_2px_12px_rgba(20,17,15,0.04)] z-0 transition-all duration-700`}
        aria-hidden="true"
      >
        {/* Subtle inner gold arch hairline */}
        <div className="absolute inset-1.5 rounded-t-[94px] sm:rounded-t-[134px] md:rounded-t-[174px] border border-[#B08D57]/20 pointer-events-none" />
      </div>

      {/* Foreground content (Bottle etc.) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-6 sm:p-10 pointer-events-none">
        <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

