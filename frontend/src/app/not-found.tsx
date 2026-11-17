'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';

export default function NotFoundPage() {
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isArPath = window.location.pathname.startsWith('/ar');
      const isArCookie = document.cookie.includes('NEXT_LOCALE=ar');
      setIsArabic(isArPath || isArCookie);
    }
  }, []);

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] flex flex-col items-center justify-center px-4 text-center select-none pt-24 pb-20 relative overflow-hidden transition-colors duration-300"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <BotanicalPattern opacity={0.06} />

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        {/* Cracked Venus Wax Seal SVG Graphic */}
        <div className="flex justify-center relative">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg
              width="112"
              height="112"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_8px_24px_rgba(107,29,47,0.5)]"
            >
              <defs>
                <radialGradient id="crackedWaxGradVenus" cx="38%" cy="32%" r="68%">
                  <stop offset="0%" stopColor="#8A1D2E" />
                  <stop offset="55%" stopColor="#6B1D2F" />
                  <stop offset="100%" stopColor="#4A0E1C" />
                </radialGradient>
              </defs>

              {/* Main Wax Puddle with organic edge */}
              <path
                d="M50 3C64 2.5 76 6 86 16C95 25 98 38 97 51C96 66 91 78 80 88C69 97 54 98 41 96C27 94 14 87 7 74C0 62 1 47 4 34C8 20 20 8 35 4C40 2.5 45 3.2 50 3Z"
                fill="url(#crackedWaxGradVenus)"
              />

              {/* Inner rims */}
              <circle cx="50" cy="50" r="36" stroke="#420B16" strokeWidth="2" strokeDasharray="2 3" opacity="0.7" />
              <circle cx="50" cy="50" r="32" stroke="#9E2B3E" strokeWidth="1" opacity="0.8" />

              {/* THE DRAMATIC FRACTURE CRACK THROUGH WAX */}
              <path
                d="M14 26 L34 46 L48 42 L52 56 L68 62 L88 78"
                stroke="#FDFBF7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />
              <path
                d="M48 42 L42 32 M52 56 L62 52"
                stroke="#FDFBF7"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>

            {/* Venus Relief in Center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src="/brand/VINUS_LOSO.svg"
                alt="Venus Emblem"
                className="w-12 h-12 brightness-0 invert opacity-80"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57]">
            {isArabic ? 'خطأ ٤٠٤ — أثر العطر مفقود' : '404 Error — Scent Untraceable'}
          </span>
          <h1
            className="text-3xl sm:text-4xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]"
            style={{ fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : 'var(--font-display)' }}
          >
            {isArabic ? 'تِهْت في أروقة دار لوفينوس' : 'Lost in the Maison'}
          </h1>
          <p
            className="text-2xl text-[#6B1D2F] dark:text-[#DFCA9B] italic"
            style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
          >
            {isArabic ? 'تبخرت هذه الوصفة في طيات الذاكرة' : 'This vial has vanished into memory'}
          </p>
          <p
            className="text-xs sm:text-sm text-[#3A332D]/75 dark:text-[#DFCA9B]/80 leading-relaxed pt-2"
            style={{ fontFamily: isArabic ? "'Amiri', serif" : 'var(--font-body)' }}
          >
            {isArabic
              ? 'التركيبة أو الصفحة التي تبحث عنها إما أُعيدت إلى الأرشيف السري أو فُتح ختمها قبل أوان نضوجها.'
              : 'The formula or page you are seeking has either been retired to the archives or unsealed before its time.'}
          </p>
        </div>

        <div className="pt-4">
          <Link
            href={isArabic ? '/ar/shop' : '/shop'}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#14110F] hover:bg-[#6B1D2F] text-[#FDFBF7] font-display text-xs uppercase tracking-[0.25em] transition-all duration-400 shadow-lg group border border-[#B08D57]/30"
          >
            <span>{isArabic ? 'العودة إلى المجموعة' : 'Return to the Collection'}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
