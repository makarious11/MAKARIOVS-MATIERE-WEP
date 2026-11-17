'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'hover' | 'product'>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    const checkTouch = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    if (checkTouch()) {
      setIsTouchDevice(true);
      return;
    }
    setIsTouchDevice(false);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isProduct = target.closest('[data-cursor="product"], .product-card, [data-product]');
      const isInteractive = target.closest('a, button, input, [role="button"], [data-cursor="hover"]');

      if (isProduct) {
        setCursorType('product');
      } else if (isInteractive) {
        setCursorType('hover');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Outer follow ring */}
      <motion.div
        className="fixed pointer-events-none z-[10000] rounded-full border transition-colors duration-200"
        animate={{
          x: mousePosition.x - (cursorType === 'hover' ? 24 : cursorType === 'product' ? 18 : 12),
          y: mousePosition.y - (cursorType === 'hover' ? 24 : cursorType === 'product' ? 18 : 12),
          width: cursorType === 'hover' ? 48 : cursorType === 'product' ? 36 : 24,
          height: cursorType === 'hover' ? 48 : cursorType === 'product' ? 36 : 24,
          borderColor:
            cursorType === 'product'
              ? 'rgba(107, 29, 47, 0.9)'
              : cursorType === 'hover'
              ? 'rgba(176, 141, 87, 0.85)'
              : 'rgba(20, 17, 15, 0.35)',
          backgroundColor:
            cursorType === 'product'
              ? 'rgba(107, 29, 47, 0.18)'
              : cursorType === 'hover'
              ? 'rgba(176, 141, 87, 0.1)'
              : 'transparent',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.1 }}
      />

      {/* Center dot / Venus wax seal stamp indicator */}
      <motion.div
        className="fixed pointer-events-none z-[10001] rounded-full flex items-center justify-center"
        animate={{
          x: mousePosition.x - (cursorType === 'product' ? 7 : 2.5),
          y: mousePosition.y - (cursorType === 'product' ? 7 : 2.5),
          width: cursorType === 'product' ? 14 : 5,
          height: cursorType === 'product' ? 14 : 5,
          backgroundColor:
            cursorType === 'product'
              ? '#6B1D2F'
              : cursorType === 'hover'
              ? '#B08D57'
              : '#14110F',
          boxShadow:
            cursorType === 'product' ? '0 0 8px rgba(107,29,47,0.6)' : 'none',
        }}
        transition={{ type: 'spring', stiffness: 800, damping: 35 }}
      >
        {cursorType === 'product' && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] block" />
        )}
      </motion.div>
    </>
  );
};
