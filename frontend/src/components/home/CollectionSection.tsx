'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { MAISON_CATEGORIES, getStoredCategories, MaisonCategory } from '@/lib/catalog';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';
import { Price } from '@/components/ui/Price';

interface CollectionSectionProps {
  isArabic?: boolean;
}

export const CollectionSection: React.FC<CollectionSectionProps> = ({ isArabic = false }) => {
  const [categories, setCategories] = useState<MaisonCategory[]>(MAISON_CATEGORIES);

  useEffect(() => {
    const syncCategories = () => {
      setCategories(getStoredCategories());
    };

    syncCategories();

    // Fetch live categories from server
    fetch('/api/v1/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
          localStorage.setItem('lvenus_custom_categories', JSON.stringify(json.data));
        }
      })
      .catch(() => {});

    window.addEventListener('lv_categories_updated', syncCategories);
    window.addEventListener('storage', syncCategories);
    return () => {
      window.removeEventListener('lv_categories_updated', syncCategories);
      window.removeEventListener('storage', syncCategories);
    };
  }, []);

  const catalogLines = [
    {
      id: 'parfums',
      slug: 'parfums',
      title_ar: 'العطور الاستثنائية',
      title_en: 'Haute Parfumerie',
      chapter_ar: 'الفصل الأول · خلاصات عطرية بتركيز فائق',
      chapter_en: 'Chapitre I · Rare Extraits de Parfum (32% - 38%)',
      subtitle_ar: 'عطور الدار الأيقونية الأربعة بنقاء الزيوت الملكية',
      subtitle_en: 'The Sovereign Quad — Cairo Savoir-Faire with Parisian Mastery',
      description_ar:
        'حجر الأساس لدار لوفينوس. توليفات عطرية نادرة تجمع بين الأناقة الباريسية ونقاء الشرق، تشمل إبداعات الدار الأربعة الكبرى بتركيز نقي وثبات ممتد.',
      description_en:
        'The sovereign cornerstone of L’VENUS. Handcrafted extraits with unprecedented concentrations, blending pure botanical absolutes and rare oils.',
      image: '/images/products/la-fleur-du-nil-bottle.jpg',
      badge_ar: '٤ عطور نادرة',
      badge_en: '4 Signature Extraits',
      price_from: 2350,
      highlights_ar: ['عود نقي', 'عنبر الإسكندرية', 'زهر النيل', 'خشب الأقصر'],
      highlights_en: ['Imperial Oud', 'Alexandrian Amber', 'Nile Bloom', 'Luxor Woods'],
      action_ar: 'استعراض العطور الفاخرة',
      action_en: 'Explore Haute Parfumerie',
      href: isArabic ? '/ar/shop?category=parfums' : '/shop?category=parfums',
    },
    {
      id: 'soin',
      slug: 'soin',
      title_ar: 'كوتور الشفاه',
      title_en: 'Élixir Lèvres & Lip Gloss',
      chapter_ar: 'الفصل الثاني · إكسير الشفاه الساتاني وتجربة ٣D',
      chapter_en: 'Chapitre II · Haute Cosmétique & 3D Interactive Studio',
      subtitle_ar: 'مجموعة الظلال الثلاثية — بريق زجاجي ناعم وترطيب عميق',
      subtitle_en: 'The Iconic 3-Shade Collection in Pure Crystal Flacons',
      description_ar:
        'ثلاث درجات حصرية مميزة (نود خوخي دافئ، وردي كوتور، وتوتي ملكي) في قوارير كريستالية فاخرة بلمعان زجاجي ممتلئ، مع تجربة استوديو الشفاه التفاعلي.',
      description_en:
        'Three bespoke shades (01 Nude Peach, 02 Dusty Rose, 03 Deep Berry) formulated with cold-distilled Damask petals and desert date seed oil.',
      image: '/images/lipgloss/lipgloss-trio-portrait.jpg',
      badge_ar: '٣ درجات + طقم ثلاثي',
      badge_en: '3 Couture Shades + Trio Set',
      price_from: 750,
      highlights_ar: ['٠١ نود خوخي', '٠٢ وردي كوتور', '٠٣ توتي ملكي', 'الطقم الثلاثي'],
      highlights_en: ['01 Nude Peach', '02 Dusty Rose', '03 Deep Berry', 'Trio Set'],
      action_ar: 'دخول استوديو الشفاه التفاعلي',
      action_en: 'Enter 3D Lip Studio',
      href: isArabic ? '/ar/lip-gloss' : '/lip-gloss',
      isNew: true,
      shades: [
        { name_ar: 'نود خوخي', name_en: 'Nude Peach', hex: '#D49678' },
        { name_ar: 'وردي كوتور', name_en: 'Dusty Rose', hex: '#B67583' },
        { name_ar: 'توتي ملكي', name_en: 'Deep Berry', hex: '#783B4B' },
      ],
    },
    {
      id: 'brume',
      slug: 'brume',
      title_ar: 'رذاذ الجسم والشعر الفاخر',
      title_en: 'Brume & Body Splash',
      chapter_ar: 'الفصل الثالث · رذاذ عطري ناعم وفواح',
      chapter_en: 'Chapitre III · Fine Refreshing Mists & Hair Veils',
      subtitle_ar: 'انتعاش ملكي يدوم طوال اليوم بنفحات النيرولي والمسك الحريري',
      subtitle_en: 'Long-Wearing Delicate Body Splashes & Hair Veils',
      description_ar:
        'رذاذ خفيف فاخر صُمم ليغمر الجسم والشعر بهالة منعشة من زهر البرتقال ونسمات البحر الأبيض المتوسط والمسك الأبيض النقي.',
      description_en:
        'Delicate, long-wearing body and hair mists blended with neroli, Mediterranean sea breeze, and sheer white musks.',
      image: '/images/products/brume-botanique-bottle.jpg',
      badge_ar: 'رذاذ الجسم والشعر',
      badge_en: 'Body & Hair Splashes',
      price_from: 950,
      highlights_ar: ['نيرولي سكندري', 'مسك أبيض', 'ترطيب خفيف', 'ثبات منعش'],
      highlights_en: ['Alexandrian Neroli', 'White Musk', 'Hydrating Mist', 'Long-Lasting'],
      action_ar: 'استعراض رذاذ الجسم والشعر',
      action_en: 'Explore Body Splash',
      href: isArabic ? '/ar/shop?category=brume' : '/shop?category=brume',
    },
    {
      id: 'coffrets',
      slug: 'coffrets',
      title_ar: 'صناديق الاستكشاف والهدايا',
      title_en: 'Discovery Coffrets & Sets',
      chapter_ar: 'الفصل الرابع · مجموعات الهدايا والاستكشاف الملكية',
      chapter_en: 'Chapitre IV · Curated Discovery Sets & Travel Chests',
      subtitle_ar: 'صناديق ورنيشية راقية تضم قوارير مصغرة من أندر إبداعات الدار',
      subtitle_en: 'Lacquered Presentation Chests & Miniature Discovery Coffrets',
      description_ar:
        'صناديق هدايا فاخرة تضم قوارير مصغرة ومجموعات مختارة من خلاصة إبداعات الدار لتجربة لا تُنسى ولإهداء راقٍ يليق بأرقى المناسبات.',
      description_en:
        'Lacquered presentation chests featuring miniature vials of our canonical extraits and bespoke artisanal botanicals.',
      image: '/images/products/coffret-decouverte-box.jpg',
      badge_ar: 'صناديق وهدايا ملكية',
      badge_en: 'Royal Gift Chests',
      price_from: 950,
      highlights_ar: ['صندوق هدايا فاخر', 'مجموعة الاستكشاف', 'قوارير مصغرة'],
      highlights_en: ['Luxury Gift Chest', 'Discovery Vials', 'Travel Coffret'],
      action_ar: 'استعراض صناديق الهدايا',
      action_en: 'Explore Coffrets',
      href: isArabic ? '/ar/shop?category=coffrets' : '/shop?category=coffrets',
    },
  ];

  return (
    <section
      id="collection-section"
      className="relative bg-[#0D0A08] text-[#FDFBF7] py-28 sm:py-36 overflow-hidden"
    >
      {/* Background botanical engraving at 4% */}
      <BotanicalPattern inverted opacity={0.04} />

      {/* Decorative side hairlines */}
      <div className="absolute top-0 bottom-0 left-8 md:left-14 w-px bg-[#B08D57]/15 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-8 md:right-14 w-px bg-[#B08D57]/15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Section Heading: The Royal Catalog */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-[#B08D57]/20 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-px bg-[#B08D57]" />
              <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57]">
                {isArabic ? 'الكاتالوج الملكي · أصناف الدار' : 'The Royal Catalog · Maison Collections'}
              </span>
            </div>
            <h2
              className="text-4xl sm:text-6xl md:text-7xl text-[#FDFBF7] uppercase leading-none"
              style={{
                fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif",
                letterSpacing: isArabic ? '0.01em' : '0.06em',
                fontWeight: 300,
              }}
            >
              {isArabic ? 'أصناف وخطوط لوفينوس' : 'Maison Collections'}
            </h2>
          </div>

          <div className="text-left md:text-right space-y-1">
            <p
              className="text-lg sm:text-xl text-[#B08D57]"
              style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
            >
              {isArabic ? 'عطور استثنائية · كوتور الشفاه · رذاذ الجسم · مجموعات الهدايا' : 'Haute Parfumerie · Lip Gloss 3D · Body Splash · Coffrets'}
            </p>
            <span className="font-display text-[11px] tracking-[0.2em] uppercase text-[#FDFBF7]/50 block">
              {isArabic ? 'اختر الصنف للدخول في تفاصيل الأنواع والألوان' : 'Select a line to explore creations and formulas'}
            </span>
          </div>
        </div>

        {/* 4 Category Showcase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {catalogLines.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative flex flex-col rounded-3xl overflow-hidden bg-[#161210] border border-white/10 hover:border-[#B08D57]/60 shadow-xl hover:shadow-[0_24px_60px_rgba(0,0,0,0.7)] transition-all duration-500 hover:-translate-y-1.5"
            >
              {/* Top Badge Accent */}
              <div className="absolute top-5 inset-x-5 z-20 flex items-center justify-between pointer-events-none">
                <span className="px-3.5 py-1 rounded-full text-[10px] font-display uppercase tracking-widest bg-black/70 backdrop-blur-md text-[#DFCA9B] border border-[#B08D57]/40 font-semibold shadow-sm">
                  {isArabic ? cat.badge_ar : cat.badge_en}
                </span>

                {cat.isNew && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-widest bg-[#6B1D2F] text-white shadow-md flex items-center gap-1 font-bold">
                    <Sparkles size={11} className="text-[#DFCA9B]" />
                    <span>{isArabic ? 'إصدار 3D' : '3D Edition'}</span>
                  </span>
                )}
              </div>

              {/* Arch Backdrop Image Area — full portrait fit matching the arch frame */}
              <div className="relative w-full h-80 sm:h-96 flex items-end justify-center overflow-hidden bg-gradient-to-b from-[#201815] to-[#14100E] px-8 pt-6">
                <div className="relative z-10 w-full max-w-[300px] h-full rounded-t-[160px] overflow-hidden border border-b-0 border-[#B08D57]/30 bg-[#1A1412] shadow-2xl">
                  <Image
                    src={cat.image}
                    alt={isArabic ? cat.title_ar : cat.title_en}
                    fill
                    className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Card Editorial Info */}
              <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#B08D57] font-semibold block">
                    {isArabic ? cat.chapter_ar : cat.chapter_en}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif text-[#FDFBF7]">
                    {isArabic ? cat.title_ar : cat.title_en}
                  </h3>
                  <p className="text-xs text-[#DFCA9B] font-serif italic">
                    {isArabic ? cat.subtitle_ar : cat.subtitle_en}
                  </p>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-body">
                    {isArabic ? cat.description_ar : cat.description_en}
                  </p>

                  {/* If category has shade swatches (Lip Gloss) */}
                  {cat.shades && (
                    <div className="pt-2">
                      <span className="text-[10px] font-display uppercase tracking-widest text-stone-400 block mb-2">
                        {isArabic ? 'الدرجات الثلاث الحصرية:' : 'The Three Couture Shades:'}
                      </span>
                      <div className="flex items-center gap-3">
                        {cat.shades.map((shade) => (
                          <div
                            key={shade.hex}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-[#B08D57]/30 text-xs shadow-sm"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shadow-inner border border-white/60"
                              style={{ backgroundColor: shade.hex }}
                            />
                            <span className="font-display text-[11px] text-stone-200">
                              {isArabic ? shade.name_ar : shade.name_en}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlight Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(isArabic ? cat.highlights_ar : cat.highlights_en).map((h) => (
                      <span
                        key={h}
                        className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-900/80 text-[#FDFBF7]/80 border border-[#B08D57]/25"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-4 border-t border-[#B08D57]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs font-display text-[#DFCA9B] font-semibold">
                    {isArabic ? 'ابتداءً من' : 'From'} <Price amount={cat.price_from} />
                  </span>

                  <Link
                    href={cat.href}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1F1815] text-[#FDFBF7] hover:bg-[#6B1D2F] text-xs font-display uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 border border-[#B08D57]/30 group-hover:border-[#B08D57] cursor-pointer"
                  >
                    <span>{isArabic ? cat.action_ar : cat.action_en}</span>
                    <ArrowRight
                      size={13}
                      className={isArabic ? 'rotate-180' : ''}
                    />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Shop CTA Footer */}
        <div className="mt-16 text-center">
          <Link
            href={isArabic ? '/ar/shop' : '/shop'}
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#6B1D2F] text-white hover:bg-[#8A1D2E] font-display text-xs uppercase tracking-[0.25em] shadow-2xl hover:scale-105 transition-all border border-[#B08D57]/40 cursor-pointer"
          >
            <Layers size={14} className="text-[#DFCA9B]" />
            <span>
              {isArabic
                ? 'استعراض كافة إبداعات دار لوفينوس في الكاتالوج الكامل'
                : 'Browse All Creations in The Royal Catalog'}
            </span>
            <ArrowRight
              size={13}
              className={isArabic ? 'rotate-180' : ''}
            />
          </Link>
        </div>
      </div>
    </section>
  );
};
