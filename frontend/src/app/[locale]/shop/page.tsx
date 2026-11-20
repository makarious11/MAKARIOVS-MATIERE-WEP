'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Sparkles, Compass } from 'lucide-react';
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
    { id: 'soin', label_en: 'Soin & Lip Care', label_ar: 'العناية والشفاه (Lip Gloss)' },
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

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] select-none transition-colors duration-300">
      {/* Hero Banner */}
      <section
        className="relative w-full h-[45vh] min-h-[340px] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#0D0A08' }}
      >
        <BotanicalPattern opacity={0.08} inverted />

        {/* Breadcrumb */}
        <span
          className={`absolute top-6 ${isArabic ? 'right-6 sm:right-10' : 'left-6 sm:left-10'} font-display text-[10px] uppercase tracking-[0.3em] text-[#FDFBF7]/50 z-10`}
        >
          {isArabic ? 'دار لوفينوس للأناقة / إبداعات الدار' : 'Maison L’VENUS / Les Créations'}
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
            ? 'صياغة فنية راقية تجمع بين نقاء المواد وأصالة الحرفة — بإتقان مكاريوس'
            : 'Sovereign Artistry — Extrait de Parfum & Rare Botanical Formulations'}
        </p>

        {/* Scent Finder Floating in Banner */}
        <div className="relative z-10 mt-6">
          <ScentFinderQuiz />
        </div>
      </section>

      {/* Filter + Sorting Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 border-b border-[#B08D57]/20 pb-6">
          {/* Filter chips */}
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

        {/* Couture Lip Gloss Spotlight Banner */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#F6EBE6] via-[#F2D6DC] to-[#EBD0D8] dark:from-[#21161B] dark:via-[#2A1821] dark:to-[#1E1117] border border-[#B08D57]/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-start">
            <span className="text-[10px] font-display uppercase tracking-[0.25em] text-[#8C4A5A] dark:text-[#DFCA9B] font-semibold">
              {isArabic ? 'إصدار الشفاه الكوتور الجديد' : 'New Haute Cosmétique Edition'}
            </span>
            <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-[#2B171D] dark:text-white">
              {isArabic ? 'مجموعة ظلال الشفاه الثلاثية — استوديو 3D تفاعلي' : 'The Shade Collection — 3D Interactive Studio'}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xl">
              {isArabic ? 'اكتشفي درجات النود الخوخي، والوردي الكوتور، والتوتي الملكي واستعرضي القارورة الكريستالية بتقنية 3D التفاعلية.' : 'Explore 01 Nude Peach, 02 Dusty Rose, and 03 Deep Berry with the real-time 3D interactive flacon viewer.'}
            </p>
          </div>
          <Link
            href={isArabic ? '/ar/lip-gloss' : '/lip-gloss'}
            className="shrink-0 px-6 py-3 rounded-full bg-[#2B171D] text-white hover:bg-[#8C4A5A] text-xs font-display uppercase tracking-widest transition-colors shadow-md flex items-center gap-2"
          >
            <span>{isArabic ? 'دخول استوديو الشفاه 3D' : 'Enter 3D Lip Studio'}</span>
            <Sparkles size={14} className="text-[#B08D57]" />
          </Link>
        </div>

        {/* Editorial Product Grid */}
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
              const productUrl = isArabic ? `/ar/product/${perfume.slug}` : `/product/${perfume.slug}`;

              return (
                <div key={perfume.id} className="relative group product-card">
                  <Link
                    href={productUrl}
                    className="group relative flex flex-col ios-glass-card rounded-3xl overflow-hidden border border-white/60 transition-all duration-500 hover:shadow-[0_22px_55px_rgba(20,17,15,0.14)] no-underline"
                  >
                    {/* Rotating Venus Wax Seal Accent in Top-Right Corner */}
                    <div className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} z-20 pointer-events-none`}>
                      <div className="w-10 h-10 rounded-full bg-[#6B1D2F] border border-[#B08D57]/40 flex items-center justify-center shadow-lg transition-transform duration-700 group-hover:rotate-45">
                        <img
                          src="/brand/VINUS_LOSO.svg"
                          alt="L’VENUS Seal"
                          className="w-6 h-6 brightness-0 invert object-contain"
                        />
                      </div>
                    </div>

                    {/* Arch Image Area with Bottle Lift & Lifestyle Crossfade on Hover */}
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
                        <h3
                          className="text-2xl sm:text-3xl text-[#14110F] dark:text-[#FDFBF7] uppercase group-hover:text-[#6B1D2F] dark:group-hover:text-[#DFCA9B] transition-colors font-serif font-normal"
                        >
                          {isArabic ? perfume.name_ar : perfume.name_en}
                        </h3>
                        <p
                          className="text-sm text-[#8C6E3D] dark:text-[#DFCA9B] italic mt-1 font-serif"
                        >
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
      </section>
    </div>
  );
}
