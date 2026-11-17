'use client';

import React from 'react';

interface BotanicalPatternProps {
  className?: string;
  opacity?: number;
  inverted?: boolean;
}

export const BotanicalPattern: React.FC<BotanicalPatternProps> = ({
  className = '',
  opacity = 0.08,
  inverted = false,
}) => {
  const strokeColor = inverted ? '#FBF8EE' : '#14110F';

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id={`botanicalTile-${inverted ? 'inv' : 'reg'}`}
            width="320"
            height="320"
            patternUnits="userSpaceOnUse"
          >
            {/* Poppy blossom */}
            <g stroke={strokeColor} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40 70 C30 50, 45 30, 65 35 C85 20, 105 40, 95 65 C115 80, 95 110, 75 100 C60 115, 35 100, 40 70 Z" />
              <circle cx="70" cy="65" r="9" strokeWidth="1.5" />
              <path d="M70 56 L70 42 M76 58 L86 50 M78 65 L92 65 M76 72 L86 80 M70 74 L70 88 M64 72 L54 80 M62 65 L48 65 M64 58 L54 50" strokeWidth="0.8" />
              {/* Stem */}
              <path d="M70 100 C68 135, 78 160, 72 200" strokeWidth="1.4" />
              <path d="M74 135 C90 125, 105 130, 110 120" strokeWidth="1.1" />
              <path d="M70 160 C50 155, 38 165, 35 158" strokeWidth="1.1" />

              {/* Cornflower & Daisy bouquet */}
              <g transform="translate(180, 140)">
                <circle cx="40" cy="40" r="7" strokeWidth="1.5" />
                {/* Daisy Petals */}
                <path d="M40 33 C38 20, 42 20, 40 33 Z M45 35 C55 25, 58 30, 45 35 Z M47 40 C60 38, 60 42, 47 40 Z M45 45 C55 55, 50 58, 45 45 Z M40 47 C42 60, 38 60, 40 47 Z M35 45 C25 55, 22 50, 35 45 Z M33 40 C20 42, 20 38, 33 40 Z M35 35 C25 25, 30 22, 35 35 Z" strokeWidth="1" />
                <path d="M40 47 C42 80, 36 110, 45 130" strokeWidth="1.3" />
              </g>

              {/* Honeybee engraving */}
              <g transform="translate(210, 50) rotate(-15)">
                {/* Body segments */}
                <ellipse cx="25" cy="20" rx="9" ry="6" strokeWidth="1.2" />
                <path d="M22 14 L22 26 M25 14 L25 26 M28 14 L28 26" strokeWidth="0.8" />
                <circle cx="36" cy="20" r="3.5" />
                {/* Wings */}
                <path d="M22 14 C20 4, 10 2, 8 10 C6 18, 16 18, 22 15" strokeWidth="0.9" />
                <path d="M26 14 C28 5, 38 4, 38 12 C38 17, 30 17, 26 15" strokeWidth="0.9" />
                {/* Legs */}
                <path d="M19 24 L14 30 M24 25 L22 32 M29 24 L31 31" strokeWidth="0.8" />
              </g>

              {/* Butterfly engraving */}
              <g transform="translate(60, 210) rotate(20)">
                <line x1="25" y1="10" x2="25" y2="30" strokeWidth="1.5" />
                {/* Wings */}
                <path d="M25 14 C12 6, 2 12, 6 22 C10 30, 25 20, 25 18" strokeWidth="1" />
                <path d="M25 20 C14 22, 10 32, 16 36 C22 40, 25 28, 25 24" strokeWidth="0.9" />
                <path d="M25 14 C38 6, 48 12, 44 22 C40 30, 25 20, 25 18" strokeWidth="1" />
                <path d="M25 20 C36 22, 40 32, 34 36 C28 40, 25 28, 25 24" strokeWidth="0.9" />
                {/* Antennae */}
                <path d="M25 10 C21 5, 17 6, 16 8 M25 10 C29 5, 33 6, 34 8" strokeWidth="0.8" />
              </g>

              {/* Fine stippling & botanical flourishes */}
              <circle cx="140" cy="110" r="1" fill={strokeColor} />
              <circle cx="145" cy="115" r="0.8" fill={strokeColor} />
              <circle cx="138" cy="120" r="1.1" fill={strokeColor} />
              <circle cx="280" cy="240" r="1" fill={strokeColor} />
              <circle cx="285" cy="245" r="0.8" fill={strokeColor} />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#botanicalTile-${inverted ? 'inv' : 'reg'})`} />
      </svg>
    </div>
  );
};

