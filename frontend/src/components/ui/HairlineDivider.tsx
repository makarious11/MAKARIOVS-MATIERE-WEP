'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HairlineDividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  animated?: boolean;
}

export const HairlineDivider: React.FC<HairlineDividerProps> = ({
  className = '',
  orientation = 'horizontal',
  color = 'bg-[#B08D57]/30',
  animated = true,
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`relative w-[1px] h-full ${className}`}>
        {animated ? (
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`w-[1px] h-full origin-top ${color}`}
          />
        ) : (
          <div className={`w-[1px] h-full ${color}`} />
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[1px] ${className}`}>
      {animated ? (
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full h-[1px] origin-left ${color}`}
        />
      ) : (
        <div className={`w-full h-[1px] ${color}`} />
      )}
    </div>
  );
};

