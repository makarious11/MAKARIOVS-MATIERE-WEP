import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'wax' | 'ink' | 'paper';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  className = '',
}) => {
  const variantStyles = {
    gold: 'border border-[#B08D57]/40 bg-[#B08D57]/10 text-[#8C6E3D]',
    wax: 'border border-[#6E1423]/30 bg-[#6E1423]/10 text-[#6E1423]',
    ink: 'border border-[#14110F]/20 bg-[#14110F] text-[#FBF8EE]',
    paper: 'border border-[#B08D57]/30 bg-[#F1EADA] text-[#14110F]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-display text-[10px] tracking-widest uppercase font-medium ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};

