'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  CANONICAL_PERFUMES,
  MAISON_CATEGORIES,
  PerfumeData,
  MaisonCategory,
  getStoredCatalog,
  getStoredCategories,
} from '@/lib/catalog';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';
import { Price } from '@/components/ui/Price';
import { ScentFinderQuiz } from '@/components/ui/ScentFinderQuiz';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function LocalizedShopPage({ params }: PageProps) {
  const resolved = use(params);
  const isArabic = resolved?.locale === 'ar';

  const [products, setProducts] = useState<PerfumeData[]>(CANONICAL_PERFUMES);
  const [categories, setCategories] = useState<MaisonCategory[]>(MAISON_CATEGORIES);
  const [viewMode, setViewMode] = useState<'categories' | 'products'>('categories');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  useEffect(() => {
    const syncData = () => {
      setProducts(getStoredCatalog());
      setCategories(getStoredCategories());
    };
    syncData();

    // Sync live catalog from server database so edits from admin reflect immediately
    fetch('/api/v1/products')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setProducts(json.data);
          localStorage.setItem('lvenus_custom_catalog', JSON.stringify(json.data));
        }
      })
      .catch(() => {});

    window.addEventListener('lv_catalog_updated', syncData);
    window.addEventListener('lv_categories_updated', syncData);
    window.addEventListener('storage', syncData);
    return () => {
      window.removeEventListener('lv_catalog_updated', syncData);
      window.removeEventListener('lv_categories_updated', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  const filterOptions = [
    { id: 'all', label_en: 'All Creations', label_ar: 'كافة الإبداعات' },
    { id: 'parfums', label_en: 'Haute Parfumerie', label_ar: 'العطور الاستثنائية' },
    { id: 'soin', label_en: 'Couture Lip Gloss', label_ar: 'كوتور الشفاه (Lip Gloss)' },
    { id: 'brume', label_en: 'Body & Hair Splash', label_ar: 'بدي اسبلاش ومعطر شعر' },
    { id: 'coffrets', label_en: 'Discovery Sets', label_ar: 'صناديق الاستكشاف' },
    { id: 'floral', label_en: 'Floral Notes', label_ar: 'زهري نباتي' },
    { id: 'amber', label_en: 'Amber Notes', label_ar: 'عنبري دافئ' },
    { id: 'oud', label_en: 'Oud Notes', label_ar: 'عود نقي' },
  ];

  const filtered = products
    .filter((p) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'parfums') return p.category_slug === 'parfums' || p.product_type === 'perfume' || !p.product_type;
      if (activeFilter === 'soin') return p.category_slug === 'soin' || p.product_type === 'skincare' || p.product_type === 'lipgloss';
      if (activeFilter === 'brume') return p.category_slug === 'brume' || p.product_type === 'mist';
      if (activeFilter === 'coffrets') return p.category_slug === 'coffrets' || p.product_type === 'coffret';
      return p.family === activeFilter.toLowerCase();
    })
    .sort((a, b) => {
      const minPriceA = Math.min(...(a.variants || [{ price: 0 }]).map((v) => v.price));
      const minPriceB = Math.min(...(b.variants || [{ price: 0 }]).map((v) => v.price));
      if (sortBy === 'price-asc') return minPriceA - minPriceB;
      if (sortBy === 'price-desc') return minPriceB - minPriceA;
      return a.id - b.id;
    });

  const selectCategory = (categoryKey: string) => {
    setActiveFilter(categoryKey);
    setViewMode('products');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // High-level Category definitions for the Collections View
  const mainCategoriesList = [
    {
      id: 'parfums',
      slug: 'parfums',
      title_ar: 'العطور الاستثنائية',
      title_en: 'Haute Parfumerie',
      chapter_ar: 'الفصل الأول · مستخلصات عطرية بتركيز فائق',
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
      price_from_ar: 'ابتداءً من ٢,٤٠٠ ج.م',
      price_from_en: 'From 2,400 EGP',
      highlights_ar: ['عود نقي', 'عنبر الإسكندرية', 'زهر النيل', 'خشب الأقصر'],
      highlights_en: ['Imperial Oud', 'Alexandrian Amber', 'Nile Bloom', 'Luxor Woods'],
      action_ar: 'استعراض العطور الفاخرة',
      action_en: 'Explore Haute Parfumerie',
    },
    {
      id: 'soin',
      slug: 'soin',
      title_ar: 'كوتور الشفاه (Lip Gloss)',
      title_en: 'Élixir Lèvres & Lip Gloss',
      chapter_ar: 'الفصل الثاني · إصدار الكوتور الجديد ثلاثي الأبعاد',
      chapter_en: 'Chapitre II · Haute Cosmétique & 3D Interactive Studio',
      subtitle_ar: 'مجموعة الظلال الثلاثية — بريق زجاجي غير لزج وترطيب عميق',
      subtitle_en: 'The Iconic 3-Shade Collection in Pure Crystal Flacons',
      description_ar:
        'ثلاث درجات حصرية ومميزة (نود خوخي دافئ، وردي كوتور، وتوتي ملكي) في قوارير كريستالية فاخرة بلمعان زجاجي ممتلئ، مع إمكانية تجربة الزجاجة 3D التفاعلية.',
      description_en:
        'Three bespoke shades (01 Nude Peach, 02 Dusty Rose, 03 Deep Berry) formulated with cold-distilled Damask petals and desert date seed oil.',
      image: '/images/lipgloss/shade-collection-trio.jpg',
      badge_ar: '٣ درجات كوتور + طقم ثلاثي',
      badge_en: '3 Couture Shades + Trio Set',
      price_from_ar: '٧٥٠ ج.م / للدرجة · ١,٨٥٠ ج.م / للطقم',
      price_from_en: '750 EGP / shade · 1,850 EGP / Trio',
      highlights_ar: ['٠١ نود خوخي', '٠٢ وردي كوتور', '٠٣ توتي ملكي', 'طقم ثلاثي'],
      highlights_en: ['01 Nude Peach', '02 Dusty Rose', '03 Deep Berry', 'Trio Set'],
      action_ar: 'استعراض ألوان ودرجات الشفاه',
      action_en: 'Explore Lip Gloss Shades',
      specialUrl: isArabic ? '/ar/lip-gloss' : '/lip-gloss',
      specialAction_ar: 'دخول استوديو 3D التفاعلي',
      specialAction_en: 'Enter 3D Lip Studio',
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
      title_ar: 'بدي اسبلاش ومعطر الجسم والشعر',
      title_en: 'Brume & Body Splash',
      chapter_ar: 'الفصل الثالث · رذاذ عطري ناعم وفواح',
      chapter_en: 'Chapitre III · Fine Refreshing Mists & Hair Veils',
      subtitle_ar: 'انتعاش ملكي يدوم طوال اليوم بنفحات النيرولي والمسك الحريري',
      subtitle_en: 'Long-Wearing Delicate Body Splashes & Hair Veils',
      description_ar:
        'رذاذ خفيف فاخر صُمم ليغمر الجسم والشعر بهالة منعشة من زهر البرتقال ونسمات البحر الأبيض المتوسط والمسك الأبيض النقي.',
      description_en:
        'Delicate, long-wearing body and hair mists blended with neroli, Mediterranean sea breeze, and sheer white musks.',
      image: '/images/products/la-fleur-du-nil-bottle.jpg',
      badge_ar: 'رذاذ الجسم والشعر',
      badge_en: 'Body & Hair Splashes',
      price_from_ar: 'ابتداءً من ٩٥٠ ج.م',
      price_from_en: 'From 950 EGP',
      highlights_ar: ['نيرولي سكندري', 'مسك أبيض', 'ترطيب خفيف', 'ثبات منعش'],
      highlights_en: ['Alexandrian Neroli', 'White Musk', 'Hydrating Mist', 'Long-Lasting'],
      action_ar: 'استعراض بدي اسبلاش',
      action_en: 'Explore Body Splash',
    },
    {
      id: 'coffrets',
      slug: 'coffrets',
      title_ar: 'صناديق الاستكشاف والبوكسات الفاخرة',
      title_en: 'Discovery Coffrets & Sets',
      chapter_ar: 'الفصل الرابع · مجموعات الهدايا والاستكشاف الفاخرة',
      chapter_en: 'Chapitre IV · Curated Discovery Sets & Travel Chests',
      subtitle_ar: 'صناديق ورنيشية راقية تضم قوارير مصغرة من أندر إبداعات الدار',
      subtitle_en: 'Lacquered Presentation Chests & Miniature Discovery Coffrets',
      description_ar:
        'صناديق فاخرة تضم قوارير مصغرة ومجموعات مختارة من خلاصة إبداعات الدار لتجربة لا تُنسى ولإهداء راقٍ يليق بأرقى المناسبات.',
      description_en:
        'Lacquered presentation chests featuring miniature vials of our canonical extraits and bespoke artisanal botanicals.',
      image: '/images/products/packaging-mockup.jpg',
      badge_ar: 'صناديق وهدايا ملكية',
      badge_en: 'Royal Gift Chests',
      price_from_ar: 'ابتداءً من ١,٨٥٠ ج.م',
      price_from_en: 'From 1,850 EGP',
      highlights_ar: ['صندوق هدايا فاخر', 'مجموعة الاستكشاف', 'قوارير مصغرة'],
      highlights_en: ['Luxury Gift Chest', 'Discovery Vials', 'Travel Coffret'],
      action_ar: 'استعراض الصناديق الفاخرة',
      action_en: 'Explore Coffrets',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] select-none transition-colors duration-300">
      {/* Hero Banner */}
      <section
        className="relative w-full h-[46vh] min-h-[350px] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#0D0A08' }}
      >
        <BotanicalPattern opacity={0.08} inverted />

        {/* Breadcrumb */}
        <span
          className={`absolute top-6 ${isArabic ? 'right-6 sm:right-10' : 'left-6 sm:left-10'} font-display text-[10px] uppercase tracking-[0.3em] text-[#FDFBF7]/50 z-10`}
        >
          {isArabic ? 'دار لوفينوس للأناقة / الكاتالوج الملكي' : 'Maison L’VENUS / Royal Catalog'}
        </span>

        {/* Giant outline heading */}
        <h1
          className="relative z-10 text-center uppercase leading-none text-5xl sm:text-7xl md:text-9xl"
          style={{
            fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif",
            color: 'transparent',
            WebkitTextStroke: '1.5px #FDFBF7',
            letterSpacing: isArabic ? '0.02em' : '0.08em',
            fontWeight: 300,
          }}
        >
          {isArabic ? 'إبداعات الدار' : 'Les Créations'}
        </h1>

        {/* Script subheading */}
        <p
          className="relative z-10 mt-5 italic text-center px-4"
          style={{
            fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive",
            fontSize: isArabic ? 22 : 28,
            color: '#B08D57',
          }}
        >
          {isArabic
            ? 'تصفح حسب الأصناف: عطور استثنائية، كوتور الشفاه، بدي اسبلاش، وصناديق الهدايا'
            : 'Explore by Collections: Haute Parfumerie, Lip Gloss, Body Splash & Discovery Sets'}
        </p>

        {/* Scent Finder Floating in Banner */}
        <div className="relative z-10 mt-6">
          <ScentFinderQuiz />
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Navigation Mode Switcher: Categories vs All Products */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 border-b border-[#B08D57]/20 pb-6">
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#F1EADA] dark:bg-[#1C1613] border border-[#B08D57]/30 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('categories')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-display text-xs uppercase tracking-widest transition-all cursor-pointer ${
                viewMode === 'categories'
                  ? 'bg-[#6B1D2F] text-[#FDFBF7] shadow-md font-semibold'
                  : 'text-[#3A332D] dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7]'
              }`}
            >
              <Layers size={14} />
              <span>{isArabic ? 'تصفح حسب الأصناف (Collections)' : 'Browse by Category'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('products');
                setActiveFilter('all');
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-display text-xs uppercase tracking-widest transition-all cursor-pointer ${
                viewMode === 'products'
                  ? 'bg-[#6B1D2F] text-[#FDFBF7] shadow-md font-semibold'
                  : 'text-[#3A332D] dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7]'
              }`}
            >
              <LayoutGrid size={14} />
              <span>{isArabic ? 'عرض كافة المنتجات (All Products)' : 'View All Products'}</span>
            </button>
          </div>

          {/* Quick 3D Lip Gloss Shortcut Pill */}
          <Link
            href={isArabic ? '/ar/lip-gloss' : '/lip-gloss'}
            className="group flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#FAF1ED] to-[#F2D6DC] dark:from-[#21161B] dark:to-[#2A1821] border border-[#B08D57]/40 shadow-sm hover:shadow-md transition-all text-xs font-display uppercase tracking-wider text-[#2B171D] dark:text-[#DFCA9B]"
          >
            <span className="w-2 h-2 rounded-full bg-[#B67583] animate-pulse" />
            <span className="font-semibold">
              {isArabic ? 'استوديو الشفاه 3D التفاعلي' : '3D Lip Gloss Studio'}
            </span>
            <Sparkles size={13} className="text-[#B08D57]" />
          </Link>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            VIEW 1: CATEGORIES / LINES FIRST (الصنف الأول في الكاتالوج)
        ────────────────────────────────────────────────────────────── */}
        {viewMode === 'categories' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-12"
          >
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="font-display text-xs uppercase tracking-[0.3em] text-[#B08D57]">
                {isArabic ? 'أقسام إبداعات لوفينوس' : 'The Signature Collections'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#14110F] dark:text-[#FDFBF7]">
                {isArabic ? 'اختر الصنف لاستكشاف الأنواع والألوان' : 'Select a Category to Explore Shades & Items'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                {isArabic
                  ? 'تم تقسيم الكاتالوج لأصناف واضحة تتيح لك الدخول في تجربة كل صنف، استعراض ألوانه، وتفاصيله الحصرية.'
                  : 'Curated into distinct luxury lines allowing you to explore the exact shades, formulas, and artisanal details.'}
              </p>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {mainCategoriesList.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="group relative flex flex-col rounded-3xl overflow-hidden ios-glass-card border border-white/60 dark:border-[#B08D57]/30 shadow-lg hover:shadow-2xl transition-all duration-500 bg-[#FAF7F2] dark:bg-[#161210]"
                >
                  {/* Top Badge Accent */}
                  <div className="absolute top-5 inset-x-5 z-20 flex items-center justify-between pointer-events-none">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-display uppercase tracking-widest bg-white/80 dark:bg-black/70 backdrop-blur-md text-[#6B1D2F] dark:text-[#DFCA9B] border border-[#B08D57]/30 font-semibold shadow-sm">
                      {isArabic ? cat.badge_ar : cat.badge_en}
                    </span>

                    {cat.isNew && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-widest bg-[#6B1D2F] text-white shadow-md flex items-center gap-1 font-bold">
                        <Sparkles size={10} className="text-[#DFCA9B]" />
                        <span>{isArabic ? 'إصدار 3D' : '3D Edition'}</span>
                      </span>
                    )}
                  </div>

                  {/* Arched Visual Area */}
                  <div className="relative w-full h-80 sm:h-96 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#F1EADA]/60 to-[#FAF7F2] dark:from-[#1C1613] dark:to-[#161210]">
                    {/* Arch Frame */}
                    <div className="absolute inset-x-8 bottom-0 h-[88%] bg-[#F5EFE6] dark:bg-[#201815] rounded-t-[160px] border border-[#B08D57]/25 transition-transform duration-700 group-hover:scale-105" />

                    <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
                      <Image
                        src={cat.image}
                        alt={isArabic ? cat.title_ar : cat.title_en}
                        fill
                        className="object-contain p-6 drop-shadow-[0_20px_35px_rgba(20,17,15,0.22)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
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
                      <h3 className="text-2xl sm:text-3xl font-serif text-[#14110F] dark:text-[#FDFBF7]">
                        {isArabic ? cat.title_ar : cat.title_en}
                      </h3>
                      <p className="text-xs text-[#8C6E3D] dark:text-[#DFCA9B] font-serif italic">
                        {isArabic ? cat.subtitle_ar : cat.subtitle_en}
                      </p>
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                        {isArabic ? cat.description_ar : cat.description_en}
                      </p>

                      {/* If category has shade swatches (Lip Gloss) */}
                      {cat.shades && (
                        <div className="pt-2">
                          <span className="text-[10px] font-display uppercase tracking-widest text-stone-500 block mb-2">
                            {isArabic ? 'الدرجات الثلاث الحصرية:' : 'The Three Couture Shades:'}
                          </span>
                          <div className="flex items-center gap-3">
                            {cat.shades.map((shade) => (
                              <div
                                key={shade.hex}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/50 border border-[#B08D57]/30 text-xs shadow-sm"
                              >
                                <span
                                  className="w-3.5 h-3.5 rounded-full shadow-inner border border-white"
                                  style={{ backgroundColor: shade.hex }}
                                />
                                <span className="font-display text-[11px] text-[#2B171D] dark:text-stone-200">
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
                            className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/70 dark:bg-stone-900/60 text-[#3A332D] dark:text-[#FDFBF7]/80 border border-[#B08D57]/20"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-4 border-t border-[#B08D57]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-xs font-display text-[#8C6E3D] dark:text-[#DFCA9B] font-semibold">
                        {isArabic ? cat.price_from_ar : cat.price_from_en}
                      </span>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {cat.specialUrl ? (
                          <Link
                            href={cat.specialUrl}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#6B1D2F] text-[#FDFBF7] hover:bg-[#8A1D2E] text-xs font-display uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-semibold"
                          >
                            <span>{isArabic ? cat.action_ar : cat.action_en}</span>
                            <Sparkles size={13} className="text-[#DFCA9B]" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => selectCategory(cat.id)}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#14110F] dark:bg-[#1E1714] text-[#FDFBF7] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-xs font-display uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>{isArabic ? cat.action_ar : cat.action_en}</span>
                            <ArrowRight
                              size={13}
                              className={isArabic ? 'rotate-180' : ''}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VIEW 2: PRODUCTS GRID (مع الفلاتر والترتيب والعودة للأصناف)
        ────────────────────────────────────────────────────────────── */}
        {viewMode === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Back to Categories bar & Filter Chips */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[#B08D57]/20 pb-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('categories')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#B08D57]/40 hover:bg-[#B08D57]/10 text-xs font-display uppercase tracking-widest transition-colors cursor-pointer text-[#6B1D2F] dark:text-[#DFCA9B]"
                >
                  {isArabic ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                  <span>{isArabic ? '← العودة للأصناف الرئيسية' : '← Back to Collections'}</span>
                </button>

                <span className="text-xs text-stone-500 font-display">
                  ({filtered.length} {isArabic ? 'منتج متاح' : 'creations found'})
                </span>
              </div>

              {/* Filter Chips */}
              <nav className="flex flex-wrap items-center gap-2 font-display text-[11px] uppercase tracking-widest ios-glass-pill px-4 py-2 rounded-full border border-white/60 dark:border-[#B08D57]/30 shadow-md">
                {filterOptions.map((opt, i) => (
                  <React.Fragment key={opt.id}>
                    {i > 0 && <span className="text-[#B08D57]/40 select-none mx-1">·</span>}
                    <button
                      type="button"
                      onClick={() => setActiveFilter(opt.id)}
                      className={`transition-colors duration-200 px-3 py-1 rounded-full cursor-pointer ${
                        activeFilter === opt.id
                          ? 'text-[#FDFBF7] bg-[#6B1D2F] font-medium shadow-sm'
                          : 'text-[#3A332D]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7]'
                      }`}
                    >
                      {isArabic ? opt.label_ar : opt.label_en}
                    </button>
                  </React.Fragment>
                ))}
              </nav>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs font-display tracking-wider text-[#3A332D] dark:text-[#FDFBF7] shrink-0">
                <ArrowUpDown size={14} className="text-[#B08D57]" />
                <label htmlFor="sort-select" className="uppercase text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B] font-medium">
                  {isArabic ? 'الترتيب:' : 'Sort:'}
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border border-[#B08D57]/40 rounded-full px-3 py-1.5 text-xs text-[#14110F] dark:text-[#FDFBF7] dark:bg-[#161210] uppercase tracking-wider focus:outline-none focus:border-[#6B1D2F] cursor-pointer"
                >
                  <option value="featured">{isArabic ? 'المختارة' : 'Maison Selection'}</option>
                  <option value="price-asc">{isArabic ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                  <option value="price-desc">{isArabic ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                </select>
              </div>
            </div>

            {/* Special Callout if Lip Gloss is selected */}
            {(activeFilter === 'soin' || activeFilter === 'all') && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FAF1ED] via-[#F2D6DC] to-[#FAF1ED] dark:from-[#21161B] dark:via-[#2A1821] dark:to-[#1E1117] border border-[#B08D57]/30 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center md:text-start">
                  <span className="text-[10px] font-display uppercase tracking-[0.25em] text-[#8C4A5A] dark:text-[#DFCA9B] font-bold">
                    {isArabic ? 'تجربة تفاعلية ثلاثية الأبعاد' : '3D Interactive Studio'}
                  </span>
                  <h3 className="font-display text-lg sm:text-xl uppercase tracking-wider text-[#2B171D] dark:text-white font-semibold">
                    {isArabic ? 'استوديو قوارير الليب جلوس 3D مع حركة السكرول وتغيير الألوان' : 'Interactive 3D Crystal Flacon Studio'}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    {isArabic
                      ? 'يمكنك فحص القارورة الكريستالية بحرية ثلاثية الأبعاد ومشاهدة درجات ٠١ نود خوخي، ٠٢ وردي كوتور، و٠٣ توتي ملكي.'
                      : 'Freely inspect the crystal flacon in full 3D and switch through shades with realistic reflection.'}
                  </p>
                </div>
                <Link
                  href={isArabic ? '/ar/lip-gloss' : '/lip-gloss'}
                  className="shrink-0 px-6 py-3 rounded-full bg-[#2B171D] text-white hover:bg-[#8C4A5A] text-xs font-display uppercase tracking-widest transition-colors shadow-md flex items-center gap-2"
                >
                  <span>{isArabic ? 'دخول استوديو 3D الآن' : 'Enter 3D Studio'}</span>
                  <Sparkles size={14} className="text-[#DFCA9B]" />
                </Link>
              </div>
            )}

            {/* Product Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter + sortBy}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
              >
                {filtered.map((perfume) => {
                  const defaultVariant = perfume.variants.find((v) => v.is_default) || perfume.variants[0];
                  const lowestPrice = Math.min(...perfume.variants.map((v) => v.price));
                  const isLipGloss = perfume.product_type === 'lipgloss' || perfume.category_slug === 'soin' || perfume.slug.startsWith('lip-gloss') || perfume.slug === 'elixir-levres-satine';
                  const productUrl = isLipGloss
                    ? (isArabic ? '/ar/lip-gloss' : '/lip-gloss')
                    : (isArabic ? `/ar/product/${perfume.slug}` : `/product/${perfume.slug}`);

                  return (
                    <div key={perfume.id} className="relative group product-card">
                      <Link
                        href={productUrl}
                        className="group relative flex flex-col ios-glass-card rounded-3xl overflow-hidden border border-white/60 dark:border-[#B08D57]/30 transition-all duration-500 hover:shadow-[0_22px_55px_rgba(20,17,15,0.14)] no-underline bg-[#FAF7F2] dark:bg-[#161210]"
                      >
                        {/* Rotating Venus Wax Seal Accent in Corner */}
                        <div className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} z-20 pointer-events-none`}>
                          <div className="w-10 h-10 rounded-full bg-[#6B1D2F] border border-[#B08D57]/40 flex items-center justify-center shadow-lg transition-transform duration-700 group-hover:rotate-45">
                            <img
                              src="/brand/VINUS_LOSO.svg"
                              alt="L’VENUS Seal"
                              className="w-6 h-6 brightness-0 invert object-contain"
                            />
                          </div>
                        </div>

                        {/* Shade Indicator badge if it's a lip gloss shade */}
                        {perfume.shade_hex && (
                          <div className={`absolute top-4 ${isArabic ? 'right-4' : 'left-4'} z-20`}>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-black/80 border border-[#B08D57]/30 shadow-md">
                              <span
                                className="w-3 h-3 rounded-full shadow-inner border border-white"
                                style={{ backgroundColor: perfume.shade_hex }}
                              />
                              <span className="text-[10px] font-display font-bold text-[#2B171D] dark:text-stone-200">
                                {isArabic ? perfume.shade_name_ar : perfume.shade_name_en}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Arch Image Area with Bottle Lift */}
                        <div
                          className="relative w-full flex items-end justify-center overflow-hidden"
                          style={{ height: 380 }}
                        >
                          {/* Arch backdrop */}
                          <div className="absolute inset-x-8 bottom-0 h-[92%] bg-[#F1EADA]/90 dark:bg-[#1A1412] rounded-t-[180px] transition-all duration-700 group-hover:shadow-[0_0_60px_rgba(176,141,87,0.22)]">
                            <div className="absolute inset-2 rounded-t-[174px] border border-[#B08D57]/30 pointer-events-none" />
                          </div>

                          {/* Primary Bottle with Lift */}
                          <div className="relative z-10 w-48 sm:w-56 h-64 sm:h-72 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-3">
                            <Image
                              src={perfume.images.bottle || perfume.images.hero}
                              alt={perfume.name_en}
                              fill
                              className="object-contain drop-shadow-[0_16px_32px_rgba(20,17,15,0.22)] transition-opacity duration-700 group-hover:opacity-95"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        </div>

                        {/* Editorial Card Footer */}
                        <div className="p-8 flex flex-col space-y-4 bg-gradient-to-b from-transparent to-[#F1EADA]/40 dark:to-[#161210]">
                          <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-3">
                            <span className="font-display text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold">
                              {isArabic ? perfume.family_ar : perfume.family_en}
                            </span>
                            <span className="text-[11px] text-[#3A332D]/70 dark:text-[#FDFBF7]/70 font-mono tracking-wider">
                              {perfume.concentration}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-2xl sm:text-3xl text-[#14110F] dark:text-[#FDFBF7] uppercase group-hover:text-[#6B1D2F] dark:group-hover:text-[#DFCA9B] transition-colors font-serif font-normal">
                              {isArabic ? perfume.name_ar : perfume.name_en}
                            </h3>
                            <p className="text-sm text-[#8C6E3D] dark:text-[#DFCA9B] italic mt-1 font-serif">
                              {isArabic ? perfume.tagline_ar : perfume.tagline_en}
                            </p>
                          </div>

                          {/* Notes / Highlights Chips */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(isArabic ? perfume.top_notes_ar : perfume.top_notes_en).slice(0, 3).map((note) => (
                              <span
                                key={note}
                                className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/70 dark:bg-black/40 text-[#3A332D] dark:text-[#FDFBF7]/80 border border-[#B08D57]/20"
                              >
                                {note}
                              </span>
                            ))}
                          </div>

                          {/* Pricing + Action Bar */}
                          <div className="pt-3 border-t border-[#B08D57]/20 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] tracking-widest uppercase text-[#8C6E3D] dark:text-[#DFCA9B] block">
                                {isArabic ? 'ابتداءً من' : 'From'}
                              </span>
                              <div className="font-display text-lg font-bold text-[#14110F] dark:text-[#FDFBF7]">
                                <Price amount={lowestPrice} />
                              </div>
                            </div>

                            <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#14110F] dark:bg-[#1E1714] text-[#FDFBF7] text-xs font-display uppercase tracking-widest group-hover:bg-[#6B1D2F] dark:group-hover:bg-[#8A1D2E] border border-[#B08D57]/30 transition-all shadow-md">
                              {isArabic ? 'اكتشف القطعة' : 'Discover'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}