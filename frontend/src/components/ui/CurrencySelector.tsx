'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrencyStore, CURRENCIES, CurrencyCode } from '@/store/currencyStore';
import { ChevronDown, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export const CurrencySelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currency, setCurrency } = useCurrencyStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isArabic = pathname ? pathname.startsWith('/ar') : false;

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return <span className="text-xs uppercase tracking-widest text-[#B08D57]">EGP</span>;
  }

  const current = CURRENCIES[currency] || CURRENCIES.EGP;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#B08D57]/30 hover:border-[#B08D57] bg-[#FDFBF7]/40 dark:bg-[#161210]/60 text-xs font-display tracking-widest transition-all cursor-pointer text-[#14110F] dark:text-[#FDFBF7]"
        aria-label="Select Currency"
      >
        <span className="text-[#B08D57] font-semibold">{current.code}</span>
        <span className="text-[10px] opacity-70">({isArabic ? current.symbol_ar : current.symbol_en})</span>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-1.5 w-36 rounded-xl border border-[#B08D57]/30 bg-[#FDFBF7] dark:bg-[#161210] shadow-2xl py-1 z-50 overflow-hidden"
          >
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const item = CURRENCIES[code];
              const isSelected = item.code === currency;
              return (
                <button
                  key={code}
                  onClick={() => {
                    setCurrency(code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#B08D57]/15 text-[#B08D57] font-semibold'
                      : 'text-[#14110F] dark:text-[#FDFBF7] hover:bg-[#B08D57]/10'
                  }`}
                >
                  <span className="font-display tracking-wider">{item.code}</span>
                  <span className="text-[11px] opacity-70">{isArabic ? item.symbol_ar : item.symbol_en}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

