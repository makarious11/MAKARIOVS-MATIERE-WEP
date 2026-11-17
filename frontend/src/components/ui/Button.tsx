'use client';

import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'wax' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  magnetic?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  magnetic = true,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || shouldReduceMotion || !ref.current || disabled || loading) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.18; // ~8px max pull
    const y = (clientY - (top + height / 2)) * 0.18;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const sizeClasses = {
    sm: 'px-5 py-2 text-xs tracking-wider',
    md: 'px-8 py-3.5 text-xs sm:text-sm tracking-widest',
    lg: 'px-10 py-4.5 text-sm sm:text-base tracking-widest',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#14110F] text-[#FBF8EE] border border-transparent hover:bg-[#6E1423] hover:border-[#B08D57]/60 hover:shadow-[0_8px_30px_rgba(110,20,35,0.3)]',
    wax:
      'bg-[#6E1423] text-[#FBF8EE] border border-[#B08D57]/40 hover:bg-[#8A1D2E] hover:border-[#B08D57] hover:shadow-[0_8px_30px_rgba(110,20,35,0.4)]',
    secondary:
      'bg-transparent text-[#14110F] border border-[#14110F]/40 hover:border-[#6E1423] hover:text-[#6E1423] hover:bg-[#F1EADA]/50',
    ghost:
      'bg-transparent text-[#14110F] hover:text-[#6E1423] hover:bg-[#F1EADA]/30',
  }[variant];

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 20, mass: 0.5 }}
      disabled={disabled || loading}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full font-display font-medium uppercase select-none transition-colors duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...(props as any)}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

