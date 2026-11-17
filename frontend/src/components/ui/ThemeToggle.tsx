'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { usePathname } from 'next/navigation';

interface ThemeToggleProps {
  variant?: 'floating' | 'header';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'floating' }) => {
  const { theme, toggleTheme, initTheme, isMounted } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isArabic = pathname ? pathname.startsWith('/ar') : false;

  useEffect(() => {
    initTheme();
    setMounted(true);
  }, [initTheme]);

  if (!mounted || !isMounted) {
    return null;
  }

  const isDark = theme === 'dark';

  if (variant === 'header') {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full transition-all duration-300 relative group cursor-pointer text-[#B08D57] hover:text-[#DFCA9B] hover:bg-[#B08D57]/10"
        aria-label={isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
        title={isDark ? (isArabic ? 'تفعيل الوضع النهاري' : 'Switch to Day Mode') : (isArabic ? 'تفعيل الوضع الليلي' : 'Switch to Night Mode')}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
            >
              <Sun size={17} strokeWidth={1.5} className="text-[#C8A97A]" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
            >
              <Moon size={17} strokeWidth={1.5} className="text-[#14110F] dark:text-[#C8A97A]" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  // Floating button variant
  return (
    <aside aria-label="Theme Mode Switcher" className="fixed bottom-24 right-5 sm:right-7 z-40">
      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-2xl transition-all duration-500 cursor-pointer border border-[#B08D57]/50 bg-[#FDFBF7] dark:bg-[#161210] text-[#14110F] dark:text-[#FDFBF7] hover:border-[#B08D57] hover:shadow-[0_8px_30px_rgba(176,141,87,0.35)] group"
        aria-label={isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
        title={isDark ? (isArabic ? 'تفعيل الوضع النهاري' : 'Switch to Day Mode') : (isArabic ? 'تفعيل الوضع الليلي' : 'Switch to Night Mode')}
      >
        {/* Subtle glowing halo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#B08D57]/20 to-[#6B1D2F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun-floating"
              initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center text-[#DFCA9B]"
            >
              <Sun size={20} strokeWidth={1.75} />
            </motion.div>
          ) : (
            <motion.div
              key="moon-floating"
              initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center text-[#6B1D2F]"
            >
              <Moon size={20} strokeWidth={1.75} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small tooltip on hover */}
        <span className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-[#161210] dark:bg-[#FDFBF7] text-[#FDFBF7] dark:text-[#161210] text-[11px] font-sans tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-xl border border-[#B08D57]/30">
          {isDark ? (isArabic ? 'الوضع النهاري' : 'Day Mode') : (isArabic ? 'الوضع الليلي' : 'Night Mode')}
        </span>
      </motion.button>
    </aside>
  );
};

