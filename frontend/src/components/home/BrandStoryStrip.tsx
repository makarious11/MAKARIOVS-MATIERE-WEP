'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HairlineDivider } from '@/components/ui/HairlineDivider';
import { SnakeDivider } from '@/components/ui/SnakeDivider';

interface BrandStoryStripProps {
  isArabic?: boolean;
}

export const BrandStoryStrip: React.FC<BrandStoryStripProps> = ({ isArabic = false }) => {
  return (
    <section className="relative bg-[#FDFBF7] dark:bg-[#0D0A08] py-20 sm:py-32 overflow-hidden border-t border-b border-[#B08D57]/20 transition-colors duration-300">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 -translate-y-1/2 rounded-full bg-[#B08D57]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Vertical Editorial Column: Side Profile Classical Line-Art (2 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center border-r border-[#B08D57]/20 pr-6"
          >
            <div className="relative w-full aspect-[1/3] max-h-[380px] flex flex-col items-center justify-between">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#B08D57] -rotate-90 origin-center whitespace-nowrap mb-6">
                EST. LE CAIRE · PARIS
              </span>
              <img
                src="/brand/Side_profile.svg"
                alt="Classical Torso & Laurel Accent"
                className="w-28 h-auto object-contain opacity-75 dark:opacity-90 dark:brightness-0 dark:invert drop-shadow-sm select-none"
              />
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#B08D57] rotate-90 origin-center whitespace-nowrap mt-6">
                L’VENUS MAISON
              </span>
            </div>
          </motion.div>

          {/* Center Text Column: Drop-cap & Philosophy (6 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="space-y-3">
              <span className="font-display text-xs tracking-[0.35em] uppercase text-[#B08D57] font-semibold block">
                {isArabic ? 'فلسفة الدار — بين القاهرة وباريس' : 'LA MAISON — LE CAIRE · PARIS'}
              </span>
              <h2
                className="text-3xl sm:text-5xl text-[#14110F] dark:text-[#FDFBF7] leading-[1.15]"
                style={{
                  fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 400,
                  letterSpacing: isArabic ? '0.01em' : '0.04em',
                }}
              >
                {isArabic
                  ? 'حرفية أصيلة تصوغ الجمال الأزلي بأعلى معايير الإتقان'
                  : 'Timeless Artistry Born of Noble Egyptian Heritage'}
              </h2>
            </div>

            <HairlineDivider animated />

            <div
              className="space-y-5 text-[#3A332D] dark:text-[#C8C0B7] leading-[1.85]"
              style={{
                fontFamily: isArabic ? "'Amiri', serif" : "'EB Garamond', Georgia, serif",
                fontSize: isArabic ? '18px' : '17px',
              }}
            >
              <p className="relative">
                {/* Drop-cap L */}
                <span
                  className={`${isArabic ? 'float-right pl-4 pr-1' : 'float-left pr-4 pl-1'} text-6xl sm:text-7xl leading-none text-[#6B1D2F] select-none`}
                  style={{
                    fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', serif",
                    fontWeight: 300,
                  }}
                >
                  {isArabic ? 'لـ' : 'L'}
                </span>
                {isArabic
                  ? '’VENUS (لوفينوس) تأسست برؤية معمارية وفنية صاغها مكاريوس، تجمع بين نقاء المواد الطبيعية النادرة وأصالة الحرفة اليدوية في القاهرة، مع دقة وأناقة التصميم الباريسي الرفيع. نؤمن بأن الفخامة الحقيقية ليست مجرد موضة عابرة، بل هي فن ابتكار قطع راقية تخلّد حضور صاحبها وترافقه عبر الزمن.'
                  : '’VENUS is an independent luxury Maison founded in Cairo by Makarious. Built upon a profound dialogue between the rare natural flora of Egypt and the exacting architectural discipline of Parisian luxury houses, we craft objects of timeless presence, unhurried distinction, and uncompromising beauty.'}
              </p>

              <p>
                {isArabic
                  ? 'نستهل مسيرة الدار بفصلها الأول: مجموعة عطور استثنائية (Extraits de Parfum) تصاغ يدوياً في دفعات محدودة بتركيز نقي فائق الثبات يصل إلى ٣٨٪، لتتوج كل زجاجة بغطاء من خشب الجوز المحفور يدوياً وتُختم بشمع الختم العنابي الإمبراطوري لوجه فينوس، كرمز أصيل للإتقان والتميز.'
                  : 'We open the Maison’s lineage with Chapter I: a curated collection of rare Extraits de Parfum. Each creation is formulated with an exceptional concentration of 32% to 38% pure oil, hand-poured in numbered editions, crowned with hand-carved walnut, and sealed with our signature burgundy wax relief of Venus.'}
              </p>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-[#B08D57]/20">
              <span
                className="text-xl sm:text-2xl text-[#8C6E3D]"
                style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
              >
                {isArabic ? '— مكاريوس، مؤسس الدار' : '— Makarious, Founder & Creative Director'}
              </span>

              <span className="font-display text-[10px] tracking-[0.2em] uppercase text-[#B08D57] border border-[#B08D57]/30 px-3 py-1 rounded-full">
                {isArabic ? 'إصدارات محدودة مرقمة' : 'Numbered Editions'}
              </span>
            </div>
          </motion.div>

          {/* Right Column: Architectural Packaging Visual (4 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-4 relative"
          >
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-[#B08D57]/35 shadow-[0_24px_60px_rgba(20,17,15,0.12)] bg-[#F1EADA] group">
              <Image
                src="/images/products/packaging-mockup.jpg"
                alt="L’VENUS Luxury Packaging Box and Hand-Sealed Bottle"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 35vw"
              />
              {/* Inner gold frame */}
              <div className="absolute inset-4 rounded-2xl border border-[#B08D57]/40 pointer-events-none" />

              {/* Bottom gradient overlay with brand title */}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#14110F]/85 via-[#14110F]/40 to-transparent flex items-center justify-between text-[#FDFBF7]">
                <div>
                  <span className="font-display text-xs tracking-widest uppercase block text-[#B08D57]">
                    L’VENUS COFFRET
                  </span>
                  <span className="text-sm font-serif">Hand-Crafted Presentation Box</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#6B1D2F] border border-[#B08D57]/40 flex items-center justify-center">
                  <img src="/brand/VINUS_LOSO.svg" alt="" className="w-5 h-5 brightness-0 invert" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sinuous Serpent Section Divider at the bottom */}
        <SnakeDivider opacity={0.35} />
      </div>
    </section>
  );
};
