'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NumberRollProps {
  value: number;
  currency?: string;
  className?: string;
}

export const NumberRoll: React.FC<NumberRollProps> = ({
  value,
  currency = 'EGP',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const formatted = new Intl.NumberFormat('en-US').format(displayValue);

  return (
    <span className={`inline-flex items-baseline font-display ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={displayValue}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {formatted}
        </motion.span>
      </AnimatePresence>
      {currency && (
        <span className="ml-1.5 font-body text-xs text-[#3A332D]/70 font-normal uppercase tracking-wider">
          {currency}
        </span>
      )}
    </span>
  );
};

