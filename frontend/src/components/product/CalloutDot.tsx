'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalloutDotProps {
  topPercent: number;    // 0-100%
  leftPercent: number;   // 0-100%
  label: string;
  detail: string;
  lineDirection?: 'left' | 'right';
  lineWidth?: number;
}

export const CalloutDot: React.FC<CalloutDotProps> = ({
  topPercent,
  leftPercent,
  label,
  detail,
  lineDirection = 'right',
  lineWidth = 65,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
    >
      {/* Center Interactive Dot with Pulsing Halo */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="relative group p-2 cursor-pointer focus:outline-none"
        aria-label={label}
      >
        {/* Pulsing Outer Ring */}
        <span className="absolute inset-1 rounded-full bg-[#B08D57]/30 animate-ping pointer-events-none" />

        {/* Center Golden/Crimson Dot */}
        <span className="relative block w-3.5 h-3.5 rounded-full bg-[#6B1D2F] border-2 border-[#FDFBF7] shadow-[0_2px_8px_rgba(107,29,47,0.7)] group-hover:scale-125 transition-transform" />
      </button>

      {/* Floating Tooltip Callout Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.25 }}
            style={{
              [lineDirection === 'right' ? 'left' : 'right']: '100%',
              transform: 'translateY(-50%)',
            }}
            className="absolute top-1/2 z-40 w-48 sm:w-56 p-3.5 rounded-xl ios-glass border border-[#B08D57]/40 shadow-xl pointer-events-none text-left"
          >
            <span className="font-display text-[10px] uppercase tracking-widest text-[#B08D57] block font-semibold mb-0.5">
              {label}
            </span>
            <p className="font-body text-xs text-[#14110F] leading-tight">
              {detail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
