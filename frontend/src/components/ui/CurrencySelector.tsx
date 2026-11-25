'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrencyStore, CURRENCIES, CurrencyCode } from '@/store/currencyStore';
import { ChevronDown, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface CurrencySelectorProps {
  darkSurface?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ darkSurface = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currency, setCurrency } = useCurrencyStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isArabic = pathname ? pathname.startsWith('/ar') : false;

  useEffect(() => {
    setMounted(true);
    // Use bubble-phase 'click' + Escape so first clicks on other page links/buttons execute cleanly instead of being swallowed
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!mounted) {
    return <span className="text-xs uppercase tracking-widest text-[#B08D57]">EGP</span>;
  }

  const current = CURRENCIES[currency] || CURRENCIES.EGP;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-display tracking-widest transition-colors cursor-pointer ${
          darkSurface
            ? 'border-[#B08D57]/60 bg-[#161210]/85 text-[#FDFBF7] hover:border-[#DFCA9B]'
            : 'border-[#B08D57]/35 bg-[#FDFBF7]/90 dark:bg-[#161210]/85 text-[#14110F] dark:text-[#FDFBF7] hover:border-[#B08D57]'
        }`}
        aria-label="Select Currency"
        aria-expanded={isOpen}
      >
        <span className={darkSurface ? 'text-[#DFCA9B] font-semibold' : 'text-[#8C6E3D] dark:text-[#DFCA9B] font-semibold'}>
          {current.code}
        </span>
        <span className="text-[10px] opacity-80">({isArabic ? current.symbol_ar : current.symbol_en})</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className={`absolute ${isArabic ? 'left-0' : 'right-0'} mt-1.5 w-36 rounded-xl border border-[#B08D57]/40 bg-[#FDFBF7] dark:bg-[#161210] shadow-2xl py-1 z-50 overflow-hidden`}
          >
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const item = CURRENCIES[code];
              const isSelected = item.code === currency;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setCurrency(code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#B08D57]/15 text-[#8C6E3D] dark:text-[#DFCA9B] font-semibold'
                      : 'text-[#14110F] dark:text-[#FDFBF7] hover:bg-[#B08D57]/10'
                  }`}
                >
                  <span className="font-display tracking-wider">{item.code}</span>
                  <span className="text-[11px] opacity-75">{isArabic ? item.symbol_ar : item.symbol_en}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

