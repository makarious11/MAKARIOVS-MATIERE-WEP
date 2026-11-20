'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Droplets, ShieldCheck } from 'lucide-react';
import {
  LIP_GLOSS_SHADES,
  LipGloss3DBottle,
} from '@/components/lipgloss/LipGloss3DBottle';

interface LipGlossHomeFeatureProps {
  isArabic?: boolean;
}

export const LipGlossHomeFeature: React.FC<LipGlossHomeFeatureProps> = ({
  isArabic = false,
}) => {
  const [activeShadeId, setActiveShadeId] = useState<string>('dusty-rose');
  const [isOpenWand, setIsOpenWand] = useState<boolean>(false);

  const activeShade =
    LIP_GLOSS_SHADES.find((s) => s.id === activeShadeId) || LIP_GLOSS_SHADES[1];

  return (
    <section className="relative py-28 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-[#FAF2ED] via-[#F6E6E1] to-[#FAF1ED] dark:from-[#130E10] dark:via-[#191014] dark:to-[#120D0F] border-y border-[#B08D57]/25 transition-colors duration-500">
      {/* Background Soft Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 blur-3xl -z-10"
        style={{
          background: `radial-gradient(circle at 60% 40%, ${activeShade.hex}44 0%, transparent 60%)`,
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Narrative & Swatches */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-start z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-white/70 dark:bg-stone-900/60 border border-[#B08D57]/30 text-xs font-display tracking-[0.25em] uppercase text-[#8C4A5A] dark:text-[#DFCA9B]">
            <Sparkles size={12} className="text-[#B08D57]" />
            <span>
              {isArabic
                ? 'الفصل الثاني — إكسير الشفاه والغلوس الكوتور'
                : 'Chapitre II · Haute Cosmétique Edition'}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-wide text-[#2B171D] dark:text-[#FDFBF7] font-light">
              THE SHADE{' '}
              <span className="font-script lowercase text-4xl sm:text-6xl text-[#B67583] dark:text-[#E8A5B2] block sm:inline">
                collection
              </span>
            </h2>
            <p className="font-script text-xl sm:text-2xl text-[#8C4A5A] dark:text-[#DFCA9B] italic">
              {isArabic
                ? 'بريق زجاجي مرطب بورد الإسكندرية النادر'
                : 'Couture Plumping Mirror-Glass Lip Gloss'}
            </p>
          </div>

          <p className="font-body text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            {isArabic
              ? 'توليفة ملكية راقية تجمع بين البريق الساتاني الفاتن والعناية الخلوية العميقة. ثلاث درجات حصرية صُممت لتمنح الشفاه امتلاءً طبيعياً ولمعاناً زجاجياً فائق النعومة وخالٍ تماماً من اللزوجة.'
              : 'An exquisite alchemy of mirror-glass radiance and deep cellular care. Three bespoke shades formulated with cold-distilled Damask rose petals, desert date seed oil, and botanical squalane.'}
          </p>

          {/* Quick Interactive Shade Selector */}
          <div className="pt-2 space-y-2">
            <span className="font-display text-[11px] tracking-widest uppercase text-stone-500 block">
              {isArabic ? 'اختاري الدرجة لتجربتها ثلاثية الأبعاد:' : 'Select Shade To Preview in 3D:'}
            </span>
            <div className="inline-flex items-center gap-3 p-2 rounded-full backdrop-blur-md bg-white/70 dark:bg-stone-900/70 border border-[#B08D57]/30 shadow-md">
              {LIP_GLOSS_SHADES.map((s) => {
                const isSelected = s.id === activeShadeId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveShadeId(s.id)}
                    className="flex items-center gap-2 p-1.5 rounded-full transition-all cursor-pointer group"
                  >
                    <span
                      className={`w-7 h-7 rounded-full border-2 transition-transform duration-300 ${
                        isSelected
                          ? 'scale-110 border-[#2B171D] dark:border-white shadow-md'
                          : 'border-white/80 group-hover:scale-105'
                      }`}
                      style={{ backgroundColor: s.hex }}
                    />
                    <span
                      className={`text-xs font-display pe-2 ${
                        isSelected
                          ? 'font-bold text-[#2B171D] dark:text-white'
                          : 'text-stone-500'
                      }`}
                    >
                      {isArabic ? s.name_ar.split('—')[0] : s.name_en.split('—')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link
              href={isArabic ? '/ar/lip-gloss' : '/lip-gloss'}
              className="px-8 py-3.5 rounded-full bg-[#2B171D] dark:bg-[#FDFBF7] text-[#FDFBF7] dark:text-[#2B171D] hover:bg-[#8C4A5A] dark:hover:bg-[#E8A5B2] font-display text-xs uppercase tracking-[0.25em] shadow-xl transition-all flex items-center gap-3 cursor-pointer group"
            >
              <span>{isArabic ? 'استكشفي استوديو الشفاه التفاعلي 3D' : 'Enter 3D Lip Studio'}</span>
              <ArrowRight
                size={14}
                className={`transition-transform group-hover:translate-x-1 ${
                  isArabic ? 'rotate-180 group-hover:-translate-x-1' : ''
                }`}
              />
            </Link>

            <span className="font-display text-lg font-semibold text-[#8C4A5A] dark:text-[#DFCA9B]">
              750 EGP
            </span>
          </div>
        </div>

        {/* Right Column: 3D Interactive Bottle */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <LipGloss3DBottle
            activeShadeId={activeShadeId}
            isOpenWand={isOpenWand}
            onToggleOpenWand={() => setIsOpenWand(!isOpenWand)}
            isArabic={isArabic}
          />
        </div>
      </div>
    </section>
  );
};
