'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoaderScreen: React.FC = () => {
  const [shouldShow, setShouldShow] = useState(false);
  const [step, setStep] = useState<'draw' | 'stamp' | 'reveal' | 'done'>('draw');

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('lv_loader_viewed');
    if (hasLoaded) {
      setStep('done');
      return;
    }

    setShouldShow(true);

    const stampTimer = setTimeout(() => setStep('stamp'), 750);
    const revealTimer = setTimeout(() => setStep('reveal'), 1350);
    const doneTimer = setTimeout(() => {
      setStep('done');
      sessionStorage.setItem('lv_loader_viewed', 'true');
    }, 1800);

    return () => {
      clearTimeout(stampTimer);
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (!shouldShow || step === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
      >
        {/* Full screen warm cream background */}
        <div className="absolute inset-0 bg-[#FDFBF7]" />

        {/* Subtle paper grain texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Top curtain — splits upward on reveal */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: step === 'reveal' ? '-100%' : 0 }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-x-0 top-0 h-1/2 bg-[#FDFBF7] origin-top z-20"
        >
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent" />
        </motion.div>

        {/* Bottom curtain — splits downward on reveal */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: step === 'reveal' ? '100%' : 0 }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-x-0 bottom-0 h-1/2 bg-[#FDFBF7] origin-bottom z-20"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent" />
        </motion.div>

        {/* Central emblem */}
        <motion.div
          animate={{
            opacity: step === 'reveal' ? 0 : 1,
            scale: step === 'reveal' ? 0.9 : 1,
            y: step === 'reveal' ? -15 : 0,
          }}
          transition={{ duration: 0.35 }}
          className="relative z-10 flex flex-col items-center justify-center gap-6"
        >
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Rotating botanical gold circle */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 144 144"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.circle
                cx="72"
                cy="72"
                r="68"
                stroke="#B08D57"
                strokeWidth="0.75"
                strokeDasharray="4 6"
                fill="none"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 0.6, rotate: 360 }}
                transition={{
                  opacity: { duration: 0.4 },
                  rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
                }}
                style={{ transformOrigin: '72px 72px' }}
              />
              <motion.circle
                cx="72"
                cy="72"
                r="58"
                stroke="#B08D57"
                strokeWidth="0.5"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </svg>

            {/* Venus Statue Engraving */}
            <motion.div
              className="relative w-28 h-28 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src="/brand/Statue.svg"
                alt="Venus Statue"
                className="w-24 h-24 object-contain drop-shadow-sm select-none"
              />
            </motion.div>

            {/* Burgundy Wax Seal Stamp with Venus Relief Stamp */}
            <AnimatePresence>
              {step === 'stamp' && (
                <motion.div
                  initial={{ scale: 2.8, opacity: 0, y: -40, rotate: -25 }}
                  animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 650, damping: 22 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="relative w-28 h-28 rounded-full bg-[#6B1D2F] shadow-[0_12px_36px_rgba(107,29,47,0.65)] flex items-center justify-center border-2 border-[#942940]">
                    {/* Inner gold/crimson ridge ring */}
                    <div className="absolute inset-1.5 rounded-full border border-[#B08D57]/30" />
                    {/* Venus classical logo relief embossed */}
                    <img
                      src="/brand/VINUS_LOSO.svg"
                      alt="L'VENUS Wax Seal"
                      className="w-16 h-16 object-contain brightness-0 invert opacity-95"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* L'VENUS Brand Text */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <span
              className="text-sm tracking-[0.45em] uppercase text-[#14110F] font-semibold"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
            >
              L’VENUS
            </span>
            <span
              className="text-xs italic text-[#B08D57] tracking-wider"
              style={{ fontFamily: "'Pinyon Script', cursive, serif" }}
            >
              Extrait de Parfum — Crafted by Makarious
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#3A332D]/70 font-sans mt-0.5">
              MAISON DE PARFUM — LE CAIRE · PARIS
            </span>
          </motion.div>

          {/* Golden Loading Line */}
          <motion.div
            className="h-[1px] bg-gradient-to-r from-transparent via-[#B08D57] to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 140, opacity: 1 }}
            transition={{ delay: 0.15, duration: 1.0, ease: 'easeOut' }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
