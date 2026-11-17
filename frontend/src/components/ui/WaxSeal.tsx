'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WaxSealProps {
  size?: number;
  className?: string;
  animateStamp?: boolean;
  rotating?: boolean;
  onClick?: () => void;
}

export const WaxSeal: React.FC<WaxSealProps> = ({
  size = 64,
  className = '',
  animateStamp = false,
  rotating = false,
  onClick,
}) => {
  const content = (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer filter drop-shadow-[0_6px_16px_rgba(107,29,47,0.45)] ${className}`}
      onClick={onClick}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={rotating ? 'animate-[spin_25s_linear_infinite]' : ''}
      >
        <defs>
          <radialGradient id="waxGradVenus" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#8A1D2E" />
            <stop offset="55%" stopColor="#6B1D2F" />
            <stop offset="100%" stopColor="#4A0E1C" />
          </radialGradient>
        </defs>

        {/* Outer wax puddle with organic edge */}
        <path
          d="M50 3C64 2.5 76 6 86 16C95 25 98 38 97 51C96 66 91 78 80 88C69 97 54 98 41 96C27 94 14 87 7 74C0 62 1 47 4 34C8 20 20 8 35 4C40 2.5 45 3.2 50 3Z"
          fill="url(#waxGradVenus)"
        />

        {/* Inner pressed concentric rims */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="#420B16"
          strokeWidth="2.5"
          strokeDasharray="2 3"
          opacity="0.65"
        />
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke="#9E2B3E"
          strokeWidth="1.2"
          opacity="0.8"
        />

        {/* Highlight sheen */}
        <path
          d="M28 20C34 14 43 11 52 11C58 11 65 13 71 16"
          stroke="#FFA5B5"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>

      {/* Embossed Venus Face Relief Emblem in Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/brand/VINUS_LOSO.svg"
          alt="Venus Relief"
          className="w-[64%] h-[64%] object-contain brightness-0 invert opacity-95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]"
        />
      </div>
    </div>
  );

  if (animateStamp) {
    return (
      <motion.div
        initial={{ scale: 2.4, opacity: 0, rotate: -25 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 22,
          mass: 0.8,
        }}
        className="inline-block"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
