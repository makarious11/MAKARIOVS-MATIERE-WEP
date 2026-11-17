'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface NotesExplorerProps {
  isArabic?: boolean;
}

export const NotesExplorer: React.FC<NotesExplorerProps> = ({ isArabic = false }) => {
  const [selectedIngredient, setSelectedIngredient] = useState<string>('poppy');

  const ingredients = [
    {
      id: 'poppy',
      name_en: 'Egyptian Poppy & White Peony',
      name_ar: 'خشخاش مصري وفوانيا بيضاء',
      perfumeSlug: 'la-fleur-du-nil',
      perfumeName: isArabic ? 'زهرة النيل' : 'La Fleur du Nil',
      type: isArabic ? 'زهري نباتي' : 'Floral Botanical',
      description_en: 'Delicate scarlet petals unfurling along the dawn banks of the Nile, releasing an ethereal, dewy floral mist.',
      description_ar: 'بتلات قرمزية نضرة تتفتح عند ضفاف النيل مع الفجر، تضفي هالة زهرية نقية وندية.',
    },
    {
      id: 'amber',
      name_en: 'Golden Amber & Sea Salt',
      name_ar: 'عنبر ذهبي وملح الإسكندرية',
      perfumeSlug: 'ambre-dalexandrie',
      perfumeName: isArabic ? 'عنبر الإسكندرية' : "Ambre d'Alexandrie",
      type: isArabic ? 'عنبر دافئ' : 'Warm Resinous Amber',
      description_en: 'Sun-warmed Mediterranean stones coated with golden resins, benzoin of Siam, and smoked Madagascar vanilla.',
      description_ar: 'أحجار ساحل الإسكندرية المشبعة بأشعة الشمس والمغلفة براتنجات العنبر الدافئ والفانيليا المدخنة.',
    },
    {
      id: 'papyrus',
      name_en: 'Temple Papyrus & Sacred Cedar',
      name_ar: 'بردي المعابد وأرز لبنان',
      perfumeSlug: 'bois-de-louxor',
      perfumeName: isArabic ? 'خشب الأقصر' : 'Bois de Louxor',
      type: isArabic ? 'خشبي بخوري' : 'Sacred Temple Woods',
      description_en: 'Dried Nile papyrus reeds, ancient temple cedar beams, and sacred frankincense tears that linger like silent prayer.',
      description_ar: 'قصب البردي المجفف وعارضات خشب الأرز العتيقة المحفوظة في معابد الأقصر مع نفحات البخور المقدس.',
    },
    {
      id: 'oud',
      name_en: 'Wild Cambodian Oud & Saffron',
      name_ar: 'عود كمبودي بري وزعفران فارسي',
      perfumeSlug: 'al-oud-al-aswad',
      perfumeName: isArabic ? 'العود الأسود' : 'Al Oud Al Aswad',
      type: isArabic ? 'عود وتوابل مقدسة' : 'Oud & Sacred Spice',
      description_en: 'Aged pure distillation of wild jungle oud infused with fiery Persian saffron threads, dark leather, and black musk.',
      description_ar: 'تقطير نقي ومعتق لخلاصة العود الكمبودي النادر ممزوج بخيوط الزعفران الفارسي والجلود الملكية.',
    },
  ];

  const current = ingredients.find((i) => i.id === selectedIngredient) || ingredients[0];

  return (
    <section className="relative bg-[#0D0A08] text-[#FDFBF7] py-24 sm:py-32 overflow-hidden border-b border-[#B08D57]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#B08D57]">
            <Sparkles size={14} />
            <span className="font-display text-xs tracking-[0.3em] uppercase">
              {isArabic ? 'مستكشف المكونات الخيميائية' : 'The Botanical Compendium'}
            </span>
          </div>
          <h2
            className="text-3xl sm:text-5xl uppercase font-light text-[#FDFBF7]"
            style={{
              fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif",
              letterSpacing: isArabic ? '0.01em' : '0.06em',
            }}
          >
            {isArabic ? 'مفتاح النفحات العطرية' : 'Notes Explorer'}
          </h2>
          <p
            className="text-sm text-[#B08D57] italic"
            style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
          >
            {isArabic ? 'انقر على المكون لتكتشف العطر الذي يتوجه' : 'Select an ingredient to unveil its sovereign pairing'}
          </p>
        </div>

        {/* Ingredient Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
          {ingredients.map((ing) => {
            const isSelected = ing.id === selectedIngredient;
            return (
              <button
                key={ing.id}
                type="button"
                onClick={() => setSelectedIngredient(ing.id)}
                className={`px-5 py-3 rounded-full text-xs font-display tracking-widest uppercase transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#6B1D2F] text-[#FDFBF7] border-[#B08D57] shadow-[0_4px_20px_rgba(107,29,47,0.6)] scale-105'
                    : 'bg-[#1B1612] text-[#FDFBF7]/70 border-[#B08D57]/25 hover:border-[#B08D57]/60 hover:text-[#FDFBF7]'
                }`}
              >
                {isArabic ? ing.name_ar : ing.name_en}
              </button>
            );
          })}
        </div>

        {/* Selected Card Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto ios-glass-dark p-8 sm:p-12 rounded-3xl border border-[#B08D57]/35 text-center space-y-6 shadow-2xl"
          >
            <div className="space-y-2">
              <span className="font-display text-[10px] tracking-[0.25em] uppercase text-[#B08D57] px-3 py-1 rounded-full border border-[#B08D57]/30 bg-[#14110F]">
                {current.type}
              </span>
              <h3
                className="text-3xl sm:text-4xl uppercase text-[#FDFBF7] tracking-wider pt-2"
                style={{ fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif" }}
              >
                {isArabic ? current.name_ar : current.name_en}
              </h3>
            </div>

            <p
              className="text-sm sm:text-base text-[#FDFBF7]/80 leading-relaxed max-w-lg mx-auto"
              style={{ fontFamily: isArabic ? "'Amiri', serif" : 'var(--font-body)' }}
            >
              {isArabic ? current.description_ar : current.description_en}
            </p>

            <div className="pt-4 border-t border-[#B08D57]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-widest text-[#B08D57] block">
                  {isArabic ? 'العطر المتوج' : 'Found in Extrait'}
                </span>
                <span className="font-display text-lg text-[#FDFBF7]">{current.perfumeName}</span>
              </div>

              <Link
                href={isArabic ? `/ar/product/${current.perfumeSlug}` : `/product/${current.perfumeSlug}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FDFBF7] text-[#14110F] hover:bg-[#6B1D2F] hover:text-[#FDFBF7] font-display text-xs uppercase tracking-widest transition-colors shadow-md"
              >
                <span>{isArabic ? 'اكتشف العطر' : 'Discover Perfume'}</span>
                <ArrowRight size={13} className={isArabic ? 'rotate-180' : ''} />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
