'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface ReviewsMarqueeProps {
  isArabic?: boolean;
}

export const ReviewsMarquee: React.FC<ReviewsMarqueeProps> = ({ isArabic = false }) => {
  const testimonials = [
    {
      name: 'Dr. Farouk El-Baz',
      name_ar: 'د. فاروق الباز',
      city: 'Cairo',
      city_ar: 'القاهرة',
      quote_en: 'The depth of La Fleur du Nil is unlike anything in modern retail perfumery. It evokes royal gardens of antiquity.',
      quote_ar: 'عمق زهرة النيل لا يشبه أي عطر تجاري معاصر، يذكرني بحدائق العصور القديمة الملكية.',
      perfume: 'La Fleur du Nil',
      perfume_ar: 'زهرة النيل',
    },
    {
      name: 'Hélène Vance',
      name_ar: 'هيلين فانس',
      city: 'Paris',
      city_ar: 'باريس',
      quote_en: 'Bois de Louxor has an extraordinary sillage. Sacred papyrus and ancient cedar that stay close like a second skin.',
      quote_ar: 'خشب الأقصر يمتلك هالة عطرية مذهلة. البردي المقدس والأرز العتيق يلتصقان بالبشرة كجلد ثانٍ.',
      perfume: 'Bois de Louxor',
      perfume_ar: 'خشب الأقصر',
    },
    {
      name: 'Yasmine Mansour',
      name_ar: 'ياسمين منصور',
      city: 'Alexandria',
      city_ar: 'الإسكندرية',
      quote_en: "Ambre d'Alexandrie is golden, resinous, and deeply comforting. The wax-sealed bottle on my vanity is a true work of art.",
      quote_ar: 'عنبر الإسكندرية دافئ ومريح للنفس لأقصى حد. والزجاجة المختومة بالشمع على طاولة زينتي تحفة فنية حقيقية.',
      perfume: "Ambre d'Alexandrie",
      perfume_ar: 'عنبر الإسكندرية',
    },
    {
      name: 'Karim Al-Husseini',
      name_ar: 'كريم الحسيني',
      city: 'Dubai',
      city_ar: 'دبي',
      quote_en: 'Al Oud Al Aswad is a masterclass in sovereign prestige. The Cambodian wild oud and saffron projection lasts into the next morning.',
      quote_ar: 'العود الأسود مدرسة في الهيبة والسيادة. فوحان العود الكمبودي والزعفران يدوم لليوم التالي بكل فخامة.',
      perfume: 'Al Oud Al Aswad',
      perfume_ar: 'العود الأسود',
    },
    {
      name: 'Claire Dupont',
      name_ar: 'كلير دوبون',
      city: 'Lyon',
      city_ar: 'ليون',
      quote_en: 'The packaging presentation, walnut cap, and burgundy wax seal made unboxing feel like a sacred ritual.',
      quote_ar: 'صندوق التقديم الفاخر والغطاء الخشبي وختم الشمع البرغندي جعل تجربة فتح الصندوق طقساً ملكياً مقدساً.',
      perfume: 'L’VENUS Coffret',
      perfume_ar: 'صندوق لوفينوس',
    },
  ];

  return (
    <section className="relative bg-[#FDFBF7] dark:bg-[#0D0A08] py-20 sm:py-28 overflow-hidden border-b border-[#B08D57]/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57] block mb-2">
          {isArabic ? 'شهادات عشاق العطور' : 'Connoisseurs & Patronage'}
        </span>
        <h2
          className="text-3xl sm:text-5xl uppercase text-[#14110F] dark:text-[#FDFBF7]"
          style={{ fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif" }}
        >
          {isArabic ? 'أصداء من القاهرة وباريس' : 'Echoes From Le Caire & Paris'}
        </h2>
      </div>

      {/* Infinite Scrolling Track */}
      <div className="relative w-full overflow-hidden">
        {/* Left & Right Edge Blur Gradients */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#FDFBF7] dark:from-[#0D0A08] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#FDFBF7] dark:from-[#0D0A08] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-6 w-max animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused]">
          {[...testimonials, ...testimonials].map((t, idx) => (
            <div
              key={`${t.name}-${idx}`}
              className="w-80 sm:w-96 p-7 rounded-2xl bg-[#F1EADA] dark:bg-[#161210] border border-[#B08D57]/30 shadow-sm flex flex-col justify-between space-y-4 shrink-0"
            >
              <div className="flex items-center gap-1 text-[#B08D57]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className="fill-[#B08D57]" />
                ))}
              </div>

              <p
                className="text-sm text-[#14110F] dark:text-[#FDFBF7] leading-relaxed italic"
                style={{ fontFamily: isArabic ? "'Amiri', serif" : "'EB Garamond', Georgia, serif" }}
              >
                “{isArabic ? t.quote_ar : t.quote_en}”
              </p>

              <div className="pt-3 border-t border-[#B08D57]/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-display uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] font-semibold block">
                    {isArabic ? t.name_ar : t.name}
                  </span>
                  <span className="text-[11px] text-[#3A332D]/70 dark:text-[#DFCA9B]/70">
                    {isArabic ? t.city_ar : t.city}
                  </span>
                </div>
                <span className="text-[10px] font-display uppercase tracking-widest text-[#B08D57] bg-[#FDFBF7] dark:bg-[#1E1714] px-2.5 py-1 rounded-full border border-[#B08D57]/30">
                  {isArabic ? t.perfume_ar : t.perfume}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
