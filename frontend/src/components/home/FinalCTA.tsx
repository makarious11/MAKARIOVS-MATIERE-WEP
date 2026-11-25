'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';

interface FinalCTAProps {
  isArabic?: boolean;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ isArabic = false }) => {
  return (
    <section className="relative bg-[#F1EADA] dark:bg-[#0D0A08] py-24 sm:py-32 overflow-hidden text-center transition-colors duration-300">
      {/* Background botanical engraving */}
      <BotanicalPattern opacity={0.06} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="ios-glass dark:bg-[#161210]/95 dark:border-[#B08D57]/35 p-8 sm:p-14 rounded-3xl border border-white/70 shadow-2xl space-y-8 flex flex-col items-center transition-colors duration-300">
          {/* Large Burgundy Wax Seal with Venus Relief */}
          <WaxSeal size={96} animateStamp />

          <div className="space-y-3">
            <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57] dark:text-[#DFCA9B] font-semibold">
              {isArabic ? 'خلاصة الفخامة الهادئة' : 'The Sovereign Ritual'}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
              {isArabic ? 'اختر عطرك النادر' : 'Acquire Your Extrait'}
            </h2>
            <p className="font-script text-xl sm:text-3xl text-[#6B1D2F] dark:text-[#DFCA9B] italic tracking-wide">
              {isArabic ? 'خلاصة العطر — بإتقان مكاريوس' : 'Extrait de Parfum — Crafted by Makarious'}
            </p>
            <p className="font-body text-xs sm:text-sm text-[#3A332D]/80 dark:text-[#DFCA9B]/85 max-w-md mx-auto pt-2 leading-relaxed">
              {isArabic
                ? 'أربع تحف عطرية بتركيز نقي، مختومة يدوياً ومقدمة في صناديق خشبية نباتية فاخرة تُشحن لكافة محافظات مصر.'
                : 'Four rare compositions delivered in our signature wax-sealed presentation box across Egypt and internationally.'}
            </p>
          </div>

          <Link
            href={isArabic ? '/ar/shop' : '/shop'}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] font-display text-xs uppercase tracking-[0.25em] transition-all duration-400 border border-[#B08D57]/40 dark:border-[#B08D57]/60 shadow-xl hover:scale-105 cursor-pointer font-medium"
          >
            <span>{isArabic ? 'استكشف المجموعة الكاملة' : 'Explore The Collection'}</span>
            <ArrowRight size={14} className={isArabic ? 'rotate-180' : ''} />
          </Link>

          <span className="text-[10px] tracking-[0.2em] uppercase text-[#3A332D]/60 dark:text-[#DFCA9B]/60 font-sans block">
            {isArabic ? 'دار العطور الفاخرة — القاهرة · باريس' : 'MAISON DE PARFUM — LE CAIRE · PARIS'}
          </span>
        </div>
      </div>
    </section>
  );
};
