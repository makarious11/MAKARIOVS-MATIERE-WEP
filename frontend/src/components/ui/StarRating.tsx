'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 1-5
  max?: number;
  size?: number;
  className?: string;
  showCount?: boolean;
  count?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  size = 14,
  className = '',
  showCount = false,
  count,
}) => {
  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <div className="flex items-center gap-0.5 text-[#B08D57]">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < Math.round(rating) ? 'fill-[#B08D57] text-[#B08D57]' : 'text-[#B08D57]/30'}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="font-body text-xs text-[#3A332D]/70 tracking-wider">
          ({count})
        </span>
      )}
    </div>
  );
};

