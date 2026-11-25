'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Droplets, Sparkles, Scale } from 'lucide-react';
import { WaxSeal } from '@/components/ui/WaxSeal';

interface CraftSectionProps {
  isArabic?: boolean;
}

export const CraftSection: React.FC<CraftSectionProps> = ({ isArabic = false }) => {
  const stats = [
    {
      icon: Droplets,
      number: '32%–38%',
      title: isArabic ? 'تركيز إكستري دو بارفان' : 'Extrait Concentration',
      description: isArabic
        ? 'أعلى نسبة تركيز زيوت عطرية نقية، تدوم لأيام مع فوحان نقي وهادئ لا يزول.'
        : 'The pinnacle of fine perfumery. Pure oil maceration ensuring unmatched longevity and quiet sillage.',
    },
    {
      icon: Sparkles,
      number: '100%',
      title: isArabic ? 'مختوم يدوياً بالشمع' : 'Hand-Sealed With Wax',
      description: isArabic
        ? 'تُختم كل قطعة يدوياً في مشاغلنا بختم الشمع البرغندي الملكي البارز بتفاصيل فينوس.'
        : 'Each creation is sealed by hand in our ateliers with molten burgundy wax bearing the classical Venus relief.',
    },
    {
      icon: Scale,
      number: '120',
      title: isArabic ? 'إصدارات محدودة مرقمة' : 'Numbered Editions',
      description: isArabic
        ? 'إنتاج محدود ومعدود لا يتجاوز 120 قطعة لكل محصول للحفاظ على أعلى معايير الجودة والندرة.'
        : 'Small-batch maceration limited to 120 flacons per harvest to preserve sovereign excellence.',
    },
  ];

  return (
    <section className="relative bg-[#FDFBF7] dark:bg-[#0D0A08] py-24 sm:py-32 overflow-hidden border-b border-[#B08D57]/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57] font-semibold">
            {isArabic ? 'حرفية دار لوفينوس' : 'MAISON L’VENUS SAVOIR-FAIRE'}
          </span>
          <h2
            className="text-3xl sm:text-5xl text-[#14110F] dark:text-[#FDFBF7] uppercase"
            style={{
              fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif",
              fontWeight: 400,
            }}
          >
            {isArabic ? 'إتقان يدوي أصيل بلا مساومة' : 'The Uncompromising Standards'}
          </h2>
          <p
            className="text-lg text-[#B08D57] italic"
            style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
          >
            {isArabic ? 'خلاصة الفخامة — بإتقان مكاريوس' : 'Haute Creations — Crafted by Makarious'}
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="ios-glass p-8 sm:p-10 rounded-3xl border border-[#B08D57]/25 text-center flex flex-col items-center space-y-4 hover:border-[#B08D57]/50 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-[#F1EADA] dark:bg-[#1E1714] border border-[#B08D57]/30 flex items-center justify-center text-[#6B1D2F] dark:text-[#DFCA9B] shadow-sm">
                  <Icon size={24} strokeWidth={1.25} />
                </div>
                <span
                  dir="ltr"
                  className="ltr-isolate text-4xl sm:text-5xl font-light text-[#14110F] dark:text-[#FDFBF7]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {stat.number}
                </span>
                <h3
                  className="font-display text-base uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]"
                  style={{ fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : 'var(--font-display)' }}
                >
                  {stat.title}
                </h3>
                <p
                  className="text-sm text-[#3A332D]/80 dark:text-[#C8C0B7] leading-relaxed max-w-xs"
                  style={{ fontFamily: isArabic ? "'Amiri', serif" : 'var(--font-body)' }}
                >
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Visual Atelier Banner */}
        <div className="relative rounded-3xl overflow-hidden min-h-[260px] sm:aspect-[16/7] border border-[#B08D57]/30 shadow-2xl bg-[#F1EADA]">
          <Image
            src="/images/brand/NEW_brand-identity.png"
            alt="L’VENUS Atelier in Le Caire and Paris"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1200px"
          />
          <div className="relative sm:absolute inset-0 min-h-[260px] bg-gradient-to-t from-[#14110F]/90 via-[#14110F]/40 to-transparent flex items-end p-6 sm:p-12 text-[#FDFBF7]">
            <div className="max-w-xl space-y-2">
              <span className="font-display text-xs tracking-widest uppercase text-[#B08D57] font-semibold block">
                {isArabic ? 'أتيليه القاهرة · باريس' : 'ATELIER LE CAIRE · PARIS'}
              </span>
              <p className="text-xl sm:text-2xl font-serif font-light">
                {isArabic
                  ? 'مكونات نباتية نقية مقطرة بأعلى درجات العناية، تصاغ يدوياً لتخلّد أرقى لحظات الجمال.'
                  : 'Distilled botanicals and noble materials preserved in hand-carved vessels of enduring grace.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
