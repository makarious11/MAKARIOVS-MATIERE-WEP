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
  ArrowLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  Check,
  Move3d,
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

  // View state: 'categories' shows the primary category portals, 'all' shows all products
  const [viewMode, setViewMode] = useState<'categories' | 'all'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  useEffect(() => {
    const syncData = () => {
      setProducts(getStoredCatalog());
      setCategories(getStoredCategories());
    };
    syncData();

    // Check URL query param for category on mount
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get('category');
      if (catParam) {
        setSelectedCategory(catParam);
        setViewMode('categories');
      }
    }

    // Sync live catalog from server database
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

  // Category Line Portals definition
  const categoryLines = [
    {
      id: 'parfums',
      title_ar: 'العطور الاستثنائية',
      title_en: 'Haute Parfumerie',
      subtitle_ar: 'خلاصات ملكية بتركيز إكستري دو بارفان',
      subtitle_en: 'Extrait de Parfum · Sovereign Concentrates',
      description_ar:
        'عطور استثنائية تم ابتكارها بحرفية ملكية مستوحاة من فخامة التاريخ المصري وأصالة باريس، بتركيز ۳۰٪ من أنقى الزيوت العطرية النادرة.',
      description_en:
        'Sovereign artistic formulations crafted with 30% pure perfume extract, celebrating historic majesty and timeless French-Egyptian elegance.',
      image: '/images/perfumes/or-thebes.png',
      badge_ar: '٤ إبداعات ملكية',
      badge_en: '4 Sovereign Flacons',
      accent: '#B08D57',
      bg_gradient: 'from-[#FAF6F0] via-[#F4EDE2] to-[#ECE1D0] dark:from-[#1A1412] dark:via-[#221B18] dark:to-[#161210]',
    },
    {
      id: 'soin',
      title_ar: 'كوتور الشفاه والليب جلوس',
      title_en: 'Couture Lip Gloss & Care',
      subtitle_ar: 'إكسير الشفاه الساتاني · استوديو 3D التفاعلي',
      subtitle_en: 'Élixir Lèvres Satiné · 3D Interactive Studio',
      description_ar:
        'ثلاث درجات أيقونية (نود خوخي، وردي كوتور، توتي ملكي) مع بريق زجاجي وترطيب عميق بزيت ورد الإسكندرية وبلح الصحراء واستوديو 3D حقيقي.',
      description_en:
        'Three bespoke couture shades (01 Nude Peach, 02 Dusty Rose, 03 Deep Berry) with mirror-glass radiance, rich rose oil hydration, and live 3D flacon interaction.',
      image: '/images/lipgloss/shade-dusty-rose.jpg',
      badge_ar: '٣ درجات كوتور + المجموعة',
      badge_en: '3 Couture Shades + Trio',
      accent: '#B67583',
      bg_gradient: 'from-[#FAF1ED] via-[#F4DCE1] to-[#E9CAD1] dark:from-[#21161B] dark:via-[#2A1821] dark:to-[#190F14]',
      has3D: true,
      directUrl: isArabic ? '/ar/lip-gloss' : '/lip-gloss',
    },
    {
      id: 'brume',
      title_ar: 'بدي سبلاش ومعطر الشعر',
      title_en: 'Body Splash & Hair Mist',
      subtitle_ar: 'رذاذ عطري منعش غني بنقاء زهر البرتقال',
      subtitle_en: 'Refreshing Botanical Fine Mist',
      description_ar:
        'رذاذ خفيف فاخر يلف الجسم والشعر بهالة عطرية منعشة غنية بنقاء زهر البرتقال والمسك الأبيض لترطيب وانتعاش يدوم طوال اليوم.',
      description_en:
        'Lightweight sovereign brumes crafted to envelop the hair and body in an airy veil of orange blossom and soft white musk.',
      image: '/images/perfumes/fleur-de-minuit.png',
      badge_ar: 'رذاذ منعش فاخر',
      badge_en: 'Fine Aromatic Splash',
      accent: '#8C6E3D',
      bg_gradient: 'from-[#F5F8F6] via-[#E6ECE8] to-[#D9E3DC] dark:from-[#111A15] dark:via-[#16211C] dark:to-[#0F1612]',
    },
    {
      id: 'coffrets',
      title_ar: 'صناديق الاستكشاف والهدايا',
      title_en: 'Discovery Coffrets & Sets',
      subtitle_ar: 'تجربة الدار الملكية الكاملة في صناديق فاخرة',
      subtitle_en: 'Curated Connoisseur Presentation Sets',
      description_ar:
        'مجموعات استكشاف فاخرة تتيح لك تجربة إبداعات لوفينوس الاستثنائية في علبة ملكية أنيقة مغلفة بختم شمع لوفينوس ومناسبة للإهداء.',
      description_en:
        'Sovereign discovery coffrets allowing you to experience the complete spectrum of Maison L’VENUS creations in regal gift chests.',
      image: '/images/lipgloss/shade-collection-trio.jpg',
      badge_ar: 'مجموعات استكشاف وهدايا',
      badge_en: 'Gift Chests & Samplers',
      accent: '#6B1D2F',
      bg_gradient: 'from-[#FAF3F4] via-[#F3E3E6] to-[#EAD2D7] dark:from-[#231217] dark:via-[#2C161D] dark:to-[#1A0C10]',
    },
  ];

  // Filter products by selected category
  const filteredProducts = products
    .filter((p) => {
      if (!selectedCategory && viewMode === 'all') return true;
      if (!selectedCategory) return true;

      if (selectedCategory === 'parfums') {
        return (
          p.category_slug === 'parfums' ||
          p.product_type === 'perfume' ||
          (!p.product_type && p.id <= 4)
        );
      }
      if (selectedCategory === 'soin') {
        return (
          p.category_slug === 'soin' ||
          p.product_type === 'skincare' ||
          p.product_type === 'lipgloss' ||
          p.slug.includes('lip-gloss') ||
          p.slug.includes('elixir-levres')
        );
      }
      if (selectedCategory === 'brume') {
        return p.category_slug === 'brume' || p.product_type === 'mist' || p.slug.includes('mist');
      }
      if (selectedCategory === 'coffrets') {
        return (
          p.category_slug === 'coffrets' ||
          p.product_type === 'coffret' ||
          p.slug.includes('coffret') ||
          p.slug.includes('discovery') ||
          p.slug.includes('trio')
        );
      }
      return true;
    })
    .sort((a, b) => {
      const minPriceA = Math.min(...(a.variants || [{ price: 0 }]).map((v) => v.price));
      const minPriceB = Math.min(...(b.variants || [{ price: 0 }]).map((v) => v.price));
      if (sortBy === 'price-asc') return minPriceA - minPriceB;
      if (sortBy === 'price-desc') return minPriceB - minPriceA;
      return a.id - b.id;
    });

  const activeCategoryLine = categoryLines.find((c) => c.id === selectedCategory);

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] select-none transition-colors duration-300">
      {/* ──────────────────────────────────────────────────────────
          HERO BANNER
      ────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full h-[45vh] min-h-[360px] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#0D0A08' }}
      >
        <BotanicalPattern opacity={0.08} inverted />

        {/* Breadcrumb Bar */}
        <div
          className={`absolute top-6 ${isArabic ? 'right-6 sm:right-10' : 'left-6 sm:left-10'} flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.25em] text-[#FDFBF7]/60 z-10`}
        >
          <span>{isArabic ? 'دار لوفينوس' : 'Maison L’VENUS'}</span>
          <span>/</span>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              setViewMode('categories');
            }}
            className="hover:text-[#DFCA9B] transition-colors cursor-pointer"
          >
            {isArabic ? 'الكتالوج الملكي' : 'Royal Catalog'}
          </button>
          {activeCategoryLine && (
            <>
              <span>/</span>
              <span className="text-[#DFCA9B]">
                {isArabic ? activeCategoryLine.title_ar : activeCategoryLine.title_en}
              </span>
            </>
          )}
        </div>

        {/* Outline heading */}
        <h1
          className="relative z-10 text-center uppercase leading-none text-5xl sm:text-7xl md:text-8xl"
          style={{
            fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif",
            color: 'transparent',
            WebkitTextStroke: '1.5px #FDFBF7',
            letterSpacing: isArabic ? '0.02em' : '0.08em',
            fontWeight: 300,
          }}
        >
          {selectedCategory && activeCategoryLine
            ? isArabic
              ? activeCategoryLine.title_ar
              : activeCategoryLine.title_en
            : isArabic
            ? 'أصناف الدار الملكية'
            : 'Maison Collections'}
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
          {selectedCategory && activeCategoryLine
            ? isArabic
              ? activeCategoryLine.subtitle_ar
              : activeCategoryLine.subtitle_en
            : isArabic
            ? 'تصفح حسب الأصناف: عطور استثنائية، كوتور الشفاه، بدي سبلاش، وصناديق الاستكشاف'
            : 'Explore by Line: Haute Parfumerie, Couture Lip Care, Fine Mist & Coffrets'}
        </p>

        {/* Scent Finder floating in banner */}
        <div className="relative z-10 mt-6">
          <ScentFinderQuiz />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          NAVIGATION & CATEGORY GATEWAY
      ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* View Switcher & Category Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 border-b border-[#B08D57]/20 pb-6">
          {/* Main View Toggle: Browse by Categories vs View All Products */}
          <div className="flex items-center gap-2 p-1.5 rounded-full ios-glass-pill border border-[#B08D57]/30 shadow-md">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setViewMode('categories');
              }}
              className={`px-4 py-2 rounded-full text-xs font-display uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'categories' && !selectedCategory
                  ? 'bg-[#2B171D] text-white dark:bg-[#FDFBF7] dark:text-[#2B171D] shadow-md font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <Layers size={14} className="text-[#B08D57]" />
              <span>{isArabic ? 'تصفح حسب الأصناف' : 'Browse by Category Lines'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setViewMode('all');
              }}
              className={`px-4 py-2 rounded-full text-xs font-display uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'all'
                  ? 'bg-[#2B171D] text-white dark:bg-[#FDFBF7] dark:text-[#2B171D] shadow-md font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <LayoutGrid size={14} className="text-[#B08D57]" />
              <span>{isArabic ? 'كافة المنتجات' : 'All Creations'}</span>
            </button>
          </div>

          {/* If inside a category: show category breadcrumb button */}
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#B08D57]/40 text-xs font-display uppercase tracking-wider text-[#6B1D2F] dark:text-[#DFCA9B] hover:bg-[#B08D57]/10 transition-all cursor-pointer shadow-sm"
            >
              {isArabic ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              <span>{isArabic ? 'العودة إلى قائمة الأصناف' : 'Back to Category Lines'}</span>
            </button>
          )}

          {/* Sort Dropdown (Visible when viewing products) */}
          {(selectedCategory || viewMode === 'all') && (
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
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────
            CASE 1: CATEGORY LINES GATEWAY (عرض الأصناف أولاً)
        ────────────────────────────────────────────────────────── */}
        {!selectedCategory && viewMode === 'categories' && (
          <div className="space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[11px] font-display uppercase tracking-[0.3em] text-[#B08D57]">
                {isArabic ? 'مجموعات الدار الإبداعية' : 'Maison Heritage Collections'}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-wider text-[#14110F] dark:text-white">
                {isArabic ? 'اختر الصنف لاستعراض تشكيلته' : 'Select a Category Line to Explore'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                {isArabic
                  ? 'تم تنظيم إبداعات لوفينوس في خطوط إنتاج ملكية: اضغط على أي صنف لمشاهدة كافة منتجاته ودرجاته وخياراته.'
                  : 'Browse through our bespoke lines: choose a category to unveil its complete collection, varieties, and shades.'}
              </p>
            </div>

            {/* 4 Luxury Category Showcase Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {categoryLines.map((cat, idx) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative rounded-3xl overflow-hidden border border-[#B08D57]/30 bg-gradient-to-br ${cat.bg_gradient} p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between`}
                >
                  {/* Subtle Background Glow & Badge */}
                  <div className="flex items-center justify-between z-10">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-display uppercase tracking-[0.2em] font-bold bg-white/70 dark:bg-black/50 text-[#14110F] dark:text-[#DFCA9B] border border-[#B08D57]/30 shadow-sm">
                      {isArabic ? cat.badge_ar : cat.badge_en}
                    </span>

                    {cat.has3D && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-widest bg-[#2B171D] text-[#DFCA9B] shadow-md flex items-center gap-1.5 animate-pulse">
                        <Move3d size={12} />
                        <span>{isArabic ? 'استوديو 3D' : '3D Studio'}</span>
                      </span>
                    )}
                  </div>

                  {/* Centered Imagery with Hover Lift */}
                  <div className="relative w-full h-56 sm:h-64 my-6 flex items-center justify-center">
                    <div className="relative w-44 sm:w-52 h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:-translate-y-2">
                      <Image
                        src={cat.image}
                        alt={isArabic ? cat.title_ar : cat.title_en}
                        fill
                        className="object-contain drop-shadow-[0_20px_35px_rgba(20,17,15,0.22)]"
                        sizes="(max-width: 768px) 180px, 240px"
                      />
                    </div>
                  </div>

                  {/* Text Narrative & Actions */}
                  <div className="space-y-4 z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] font-display uppercase tracking-widest text-[#B08D57] font-semibold">
                        {isArabic ? cat.subtitle_ar : cat.subtitle_en}
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-[#14110F] dark:text-white group-hover:text-[#6B1D2F] dark:group-hover:text-[#DFCA9B] transition-colors">
                        {isArabic ? cat.title_ar : cat.title_en}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed">
                      {isArabic ? cat.description_ar : cat.description_en}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-[#B08D57]/20">
                      <span className="text-xs font-display uppercase tracking-widest text-[#6B1D2F] dark:text-[#DFCA9B] font-bold flex items-center gap-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                        <span>{isArabic ? 'دخول واستعراض الصنف' : 'Enter Line & View Products'}</span>
                        {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                      </span>

                      {cat.has3D && (
                        <Link
                          href={cat.directUrl || '/lip-gloss'}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-stone-900/80 border border-[#B08D57]/40 hover:bg-[#2B171D] hover:text-white transition-colors text-[10px] font-display uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5 shadow-sm"
                        >
                          <Sparkles size={11} className="text-[#B08D57]" />
                          <span>{isArabic ? 'استوديو 3D المباشر' : '3D Studio'}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            CASE 2: PRODUCT DRILLDOWN (منتجات الصنف المختار أو الكل)
        ────────────────────────────────────────────────────────── */}
        {(selectedCategory || viewMode === 'all') && (
          <div>
            {/* Category Line Header if single category is selected */}
            {activeCategoryLine && (
              <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FAF6F0] via-[#F4EDE2] to-[#ECE1D0] dark:from-[#1A1412] dark:via-[#221B18] dark:to-[#161210] border border-[#B08D57]/30 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-start">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-black/40 text-[10px] font-display uppercase tracking-widest text-[#B08D57] border border-[#B08D57]/30">
                    <Sparkles size={11} />
                    <span>{isArabic ? activeCategoryLine.badge_ar : activeCategoryLine.badge_en}</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-[#14110F] dark:text-white">
                    {isArabic ? activeCategoryLine.title_ar : activeCategoryLine.title_en}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl">
                    {isArabic ? activeCategoryLine.description_ar : activeCategoryLine.description_en}
                  </p>
                </div>

                {/* Direct 3D studio button if Lip Gloss category */}
                {activeCategoryLine.id === 'soin' && (
                  <Link
                    href={isArabic ? '/ar/lip-gloss' : '/lip-gloss'}
                    className="shrink-0 px-6 py-3 rounded-full bg-[#2B171D] text-white hover:bg-[#8C4A5A] text-xs font-display uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 group hover:scale-105"
                  >
                    <Move3d size={15} className="text-[#DFCA9B]" />
                    <span>{isArabic ? 'فتح استوديو القارورة 3D' : 'Open 3D Flacon Studio'}</span>
                  </Link>
                )}
              </div>
            )}

            {/* Quick Category Switcher Pills */}
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-display uppercase tracking-widest text-[#B08D57] me-2 font-medium">
                {isArabic ? 'الانتقال السريع للصنف:' : 'Quick Jump:'}
              </span>
              {categoryLines.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-display uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[#6B1D2F] text-white shadow-sm font-semibold'
                      : 'bg-white/60 dark:bg-stone-900/60 border border-[#B08D57]/20 text-stone-700 dark:text-stone-300 hover:border-[#B08D57]'
                  }`}
                >
                  {isArabic ? c.title_ar : c.title_en}
                </button>
              ))}
            </div>

            {/* Editorial Product Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={(selectedCategory || 'all') + sortBy}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
              >
                {filteredProducts.map((perfume) => {
                  const lowestPrice = Math.min(
                    ...(perfume.variants || [{ price: 0 }]).map((v) => v.price)
                  );
                  const isLipGloss =
                    perfume.product_type === 'lipgloss' ||
                    perfume.category_slug === 'soin' ||
                    perfume.slug.includes('lip-gloss') ||
                    perfume.slug.includes('elixir-levres');

                  // Link to dedicated lip gloss experience or normal product detail
                  const productUrl = isLipGloss
                    ? isArabic
                      ? `/ar/lip-gloss`
                      : `/lip-gloss`
                    : isArabic
                    ? `/ar/product/${perfume.slug}`
                    : `/product/${perfume.slug}`;

                  return (
                    <div key={perfume.id} className="relative group product-card">
                      <Link
                        href={productUrl}
                        className="group relative flex flex-col ios-glass-card rounded-3xl overflow-hidden border border-white/60 dark:border-[#B08D57]/30 transition-all duration-500 hover:shadow-[0_22px_55px_rgba(20,17,15,0.14)] no-underline"
                      >
                        {/* Rotating Seal Accent */}
                        <div className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} z-20 pointer-events-none`}>
                          <div className="w-10 h-10 rounded-full bg-[#6B1D2F] border border-[#B08D57]/40 flex items-center justify-center shadow-lg transition-transform duration-700 group-hover:rotate-45">
                            <img
                              src="/brand/VINUS_LOSO.svg"
                              alt="L’VENUS Seal"
                              className="w-6 h-6 brightness-0 invert object-contain"
                            />
                          </div>
                        </div>

                        {/* Lip Gloss 3D Ready Badge if applicable */}
                        {isLipGloss && (
                          <div className={`absolute top-4 ${isArabic ? 'right-4' : 'left-4'} z-20`}>
                            <span className="px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-widest bg-[#2B171D] text-[#DFCA9B] shadow-md flex items-center gap-1.5 border border-[#B08D57]/40">
                              <Move3d size={12} />
                              <span>{isArabic ? '3D متاح' : '3D Ready'}</span>
                            </span>
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

                          {/* Primary Bottle */}
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

                          {/* Shade Swatch Preview if Lip Gloss */}
                          {perfume.shade_hex ? (
                            <div className="flex items-center gap-3 pt-1">
                              <span
                                className="w-5 h-5 rounded-full border border-white shadow-md"
                                style={{ backgroundColor: perfume.shade_hex }}
                              />
                              <span className="text-xs font-display uppercase tracking-wider text-stone-700 dark:text-stone-300 font-semibold">
                                {isArabic ? perfume.shade_name_ar : perfume.shade_name_en}
                              </span>
                              <span className="text-[11px] text-[#B08D57] font-mono">
                                ({perfume.shade_hex})
                              </span>
                            </div>
                          ) : (
                            /* Notes / Highlights Chips */
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(isArabic ? perfume.top_notes_ar : perfume.top_notes_en)
                                .slice(0, 3)
                                .map((note) => (
                                  <span
                                    key={note}
                                    className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/70 dark:bg-black/40 text-[#3A332D] dark:text-[#FDFBF7]/80 border border-[#B08D57]/20"
                                  >
                                    {note}
                                  </span>
                                ))}
                            </div>
                          )}

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
                              {isLipGloss
                                ? isArabic
                                  ? 'استكشف الدرجة في 3D'
                                  : 'Explore Shade in 3D'
                                : isArabic
                                ? 'اكتشف القطعة'
                                : 'Discover'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
