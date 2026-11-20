'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Layers,
  LayoutGrid,
  Move3d,
} from 'lucide-react';
import {
  CANONICAL_PERFUMES,
  PerfumeData,
  getStoredCatalog,
} from '@/lib/catalog';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';
import { Price } from '@/components/ui/Price';
import { ScentFinderQuiz } from '@/components/ui/ScentFinderQuiz';

export default function ShopPage() {
  const [products, setProducts] = useState<PerfumeData[]>(CANONICAL_PERFUMES);
  const [viewMode, setViewMode] = useState<'categories' | 'all'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  useEffect(() => {
    const syncData = () => {
      setProducts(getStoredCatalog());
    };
    syncData();

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get('category');
      if (catParam) {
        setSelectedCategory(catParam);
        setViewMode('categories');
      }
    }

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
    window.addEventListener('storage', syncData);
    return () => {
      window.removeEventListener('lv_catalog_updated', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  const categoryLines = [
    {
      id: 'parfums',
      title: 'Haute Parfumerie',
      subtitle: 'Extrait de Parfum · Sovereign Concentrates',
      description:
        'Sovereign artistic formulations crafted with 30% pure perfume extract, celebrating historic majesty and timeless French-Egyptian elegance.',
      image: '/images/perfumes/or-thebes.png',
      badge: '4 Sovereign Flacons',
      accent: '#B08D57',
      bg_gradient: 'from-[#FAF6F0] via-[#F4EDE2] to-[#ECE1D0] dark:from-[#1A1412] dark:via-[#221B18] dark:to-[#161210]',
    },
    {
      id: 'soin',
      title: 'Couture Lip Gloss & Care',
      subtitle: 'Élixir Lèvres Satiné · 3D Interactive Studio',
      description:
        'Three bespoke couture shades (01 Nude Peach, 02 Dusty Rose, 03 Deep Berry) with mirror-glass radiance, rich rose oil hydration, and live 3D flacon interaction.',
      image: '/images/lipgloss/shade-dusty-rose.jpg',
      badge: '3 Couture Shades + Trio',
      accent: '#B67583',
      bg_gradient: 'from-[#FAF1ED] via-[#F4DCE1] to-[#E9CAD1] dark:from-[#21161B] dark:via-[#2A1821] dark:to-[#190F14]',
      has3D: true,
      directUrl: '/lip-gloss',
    },
    {
      id: 'brume',
      title: 'Body Splash & Hair Mist',
      subtitle: 'Refreshing Botanical Fine Mist',
      description:
        'Lightweight sovereign brumes crafted to envelop the hair and body in an airy veil of orange blossom and soft white musk.',
      image: '/images/perfumes/fleur-de-minuit.png',
      badge: 'Fine Aromatic Splash',
      accent: '#8C6E3D',
      bg_gradient: 'from-[#F5F8F6] via-[#E6ECE8] to-[#D9E3DC] dark:from-[#111A15] dark:via-[#16211C] dark:to-[#0F1612]',
    },
    {
      id: 'coffrets',
      title: 'Discovery Coffrets & Sets',
      subtitle: 'Curated Connoisseur Presentation Sets',
      description:
        'Sovereign discovery coffrets allowing you to experience the complete spectrum of Maison L’VENUS creations in regal gift chests.',
      image: '/images/lipgloss/shade-collection-trio.jpg',
      badge: 'Gift Chests & Samplers',
      accent: '#6B1D2F',
      bg_gradient: 'from-[#FAF3F4] via-[#F3E3E6] to-[#EAD2D7] dark:from-[#231217] dark:via-[#2C161D] dark:to-[#1A0C10]',
    },
  ];

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
      {/* Hero Banner */}
      <section
        className="relative w-full h-[45vh] min-h-[360px] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#0D0A08' }}
      >
        <BotanicalPattern opacity={0.08} inverted />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-6 sm:left-10 flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.25em] text-[#FDFBF7]/60 z-10">
          <span>Maison L’VENUS</span>
          <span>/</span>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              setViewMode('categories');
            }}
            className="hover:text-[#DFCA9B] transition-colors cursor-pointer"
          >
            Royal Catalog
          </button>
          {activeCategoryLine && (
            <>
              <span>/</span>
              <span className="text-[#DFCA9B]">{activeCategoryLine.title}</span>
            </>
          )}
        </div>

        <h1
          className="relative z-10 text-center uppercase leading-none text-5xl sm:text-7xl md:text-8xl"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: 'transparent',
            WebkitTextStroke: '1.5px #FDFBF7',
            letterSpacing: '0.08em',
            fontWeight: 300,
          }}
        >
          {selectedCategory && activeCategoryLine ? activeCategoryLine.title : 'Maison Collections'}
        </h1>

        <p
          className="relative z-10 mt-5 italic text-center px-4"
          style={{
            fontFamily: "'Pinyon Script', cursive",
            fontSize: 28,
            color: '#B08D57',
          }}
        >
          {selectedCategory && activeCategoryLine
            ? activeCategoryLine.subtitle
            : 'Explore by Line: Haute Parfumerie, Couture Lip Care, Fine Mist & Coffrets'}
        </p>

        <div className="relative z-10 mt-6">
          <ScentFinderQuiz />
        </div>
      </section>

      {/* Main Catalog View */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 border-b border-[#B08D57]/20 pb-6">
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
              <span>Browse by Category Lines</span>
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
              <span>All Creations</span>
            </button>
          </div>

          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#B08D57]/40 text-xs font-display uppercase tracking-wider text-[#6B1D2F] dark:text-[#DFCA9B] hover:bg-[#B08D57]/10 transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>Back to Category Lines</span>
            </button>
          )}

          {(selectedCategory || viewMode === 'all') && (
            <div className="flex items-center gap-2 text-xs font-display tracking-wider text-[#3A332D] dark:text-[#FDFBF7] shrink-0">
              <ArrowUpDown size={14} className="text-[#B08D57]" />
              <label htmlFor="sort-select" className="uppercase text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B] font-medium">
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border border-[#B08D57]/40 rounded-full px-3 py-1.5 text-xs text-[#14110F] dark:text-[#FDFBF7] dark:bg-[#161210] uppercase tracking-wider focus:outline-none focus:border-[#6B1D2F] cursor-pointer"
              >
                <option value="featured">Maison Selection</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          )}
        </div>

        {/* 1. Category Lines Portals */}
        {!selectedCategory && viewMode === 'categories' && (
          <div className="space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[11px] font-display uppercase tracking-[0.3em] text-[#B08D57]">
                Maison Heritage Collections
              </span>
              <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-wider text-[#14110F] dark:text-white">
                Select a Category Line to Explore
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                Browse through our bespoke lines: choose a category to unveil its complete collection, varieties, and shades.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {categoryLines.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative rounded-3xl overflow-hidden border border-[#B08D57]/30 bg-gradient-to-br ${cat.bg_gradient} p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-display uppercase tracking-[0.2em] font-bold bg-white/70 dark:bg-black/50 text-[#14110F] dark:text-[#DFCA9B] border border-[#B08D57]/30 shadow-sm">
                      {cat.badge}
                    </span>

                    {cat.has3D && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-widest bg-[#2B171D] text-[#DFCA9B] shadow-md flex items-center gap-1.5 animate-pulse">
                        <Move3d size={12} />
                        <span>3D Studio</span>
                      </span>
                    )}
                  </div>

                  <div className="relative w-full h-56 sm:h-64 my-6 flex items-center justify-center">
                    <div className="relative w-44 sm:w-52 h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:-translate-y-2">
                      <Image
                        src={cat.image}
                        alt={cat.title}
                        fill
                        className="object-contain drop-shadow-[0_20px_35px_rgba(20,17,15,0.22)]"
                        sizes="(max-width: 768px) 180px, 240px"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] font-display uppercase tracking-widest text-[#B08D57] font-semibold">
                        {cat.subtitle}
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-[#14110F] dark:text-white group-hover:text-[#6B1D2F] dark:group-hover:text-[#DFCA9B] transition-colors">
                        {cat.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-[#B08D57]/20">
                      <span className="text-xs font-display uppercase tracking-widest text-[#6B1D2F] dark:text-[#DFCA9B] font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                        <span>Enter Line &amp; View Products</span>
                        <ArrowRight size={14} />
                      </span>

                      {cat.has3D && (
                        <Link
                          href={cat.directUrl || '/lip-gloss'}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-stone-900/80 border border-[#B08D57]/40 hover:bg-[#2B171D] hover:text-white transition-colors text-[10px] font-display uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5 shadow-sm"
                        >
                          <Sparkles size={11} className="text-[#B08D57]" />
                          <span>3D Studio</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Product Drilldown */}
        {(selectedCategory || viewMode === 'all') && (
          <div>
            {activeCategoryLine && (
              <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FAF6F0] via-[#F4EDE2] to-[#ECE1D0] dark:from-[#1A1412] dark:via-[#221B18] dark:to-[#161210] border border-[#B08D57]/30 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-start">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-black/40 text-[10px] font-display uppercase tracking-widest text-[#B08D57] border border-[#B08D57]/30">
                    <Sparkles size={11} />
                    <span>{activeCategoryLine.badge}</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-[#14110F] dark:text-white">
                    {activeCategoryLine.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl">
                    {activeCategoryLine.description}
                  </p>
                </div>

                {activeCategoryLine.id === 'soin' && (
                  <Link
                    href="/lip-gloss"
                    className="shrink-0 px-6 py-3 rounded-full bg-[#2B171D] text-white hover:bg-[#8C4A5A] text-xs font-display uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 group hover:scale-105"
                  >
                    <Move3d size={15} className="text-[#DFCA9B]" />
                    <span>Open 3D Flacon Studio</span>
                  </Link>
                )}
              </div>
            )}

            <div className="mb-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-display uppercase tracking-widest text-[#B08D57] me-2 font-medium">
                Quick Jump:
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
                  {c.title}
                </button>
              ))}
            </div>

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

                  const productUrl = isLipGloss
                    ? `/lip-gloss`
                    : `/product/${perfume.slug}`;

                  return (
                    <div key={perfume.id} className="relative group product-card">
                      <Link
                        href={productUrl}
                        className="group relative flex flex-col ios-glass-card rounded-3xl overflow-hidden border border-white/60 dark:border-[#B08D57]/30 transition-all duration-500 hover:shadow-[0_22px_55px_rgba(20,17,15,0.14)] no-underline"
                      >
                        <div className="absolute top-4 right-4 z-20 pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-[#6B1D2F] border border-[#B08D57]/40 flex items-center justify-center shadow-lg transition-transform duration-700 group-hover:rotate-45">
                            <img
                              src="/brand/VINUS_LOSO.svg"
                              alt="L’VENUS Seal"
                              className="w-6 h-6 brightness-0 invert object-contain"
                            />
                          </div>
                        </div>

                        {isLipGloss && (
                          <div className="absolute top-4 left-4 z-20">
                            <span className="px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-widest bg-[#2B171D] text-[#DFCA9B] shadow-md flex items-center gap-1.5 border border-[#B08D57]/40">
                              <Move3d size={12} />
                              <span>3D Ready</span>
                            </span>
                          </div>
                        )}

                        <div
                          className="relative w-full flex items-end justify-center overflow-hidden"
                          style={{ height: 380 }}
                        >
                          <div className="absolute inset-x-8 bottom-0 h-[92%] bg-[#F1EADA]/90 dark:bg-[#1A1412] rounded-t-[180px] transition-all duration-700 group-hover:shadow-[0_0_60px_rgba(176,141,87,0.22)]">
                            <div className="absolute inset-2 rounded-t-[174px] border border-[#B08D57]/30 pointer-events-none" />
                          </div>

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

                        <div className="p-8 flex flex-col space-y-4 bg-gradient-to-b from-transparent to-[#F1EADA]/40 dark:to-[#161210]">
                          <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-3">
                            <span className="font-display text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold">
                              {perfume.family_en}
                            </span>
                            <span className="text-[11px] text-[#3A332D]/70 dark:text-[#FDFBF7]/70 font-mono tracking-wider">
                              {perfume.concentration}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-2xl sm:text-3xl text-[#14110F] dark:text-[#FDFBF7] uppercase group-hover:text-[#6B1D2F] dark:group-hover:text-[#DFCA9B] transition-colors font-serif font-normal">
                              {perfume.name_en}
                            </h3>
                            <p className="text-sm text-[#8C6E3D] dark:text-[#DFCA9B] italic mt-1 font-serif">
                              {perfume.tagline_en}
                            </p>
                          </div>

                          {perfume.shade_hex ? (
                            <div className="flex items-center gap-3 pt-1">
                              <span
                                className="w-5 h-5 rounded-full border border-white shadow-md"
                                style={{ backgroundColor: perfume.shade_hex }}
                              />
                              <span className="text-xs font-display uppercase tracking-wider text-stone-700 dark:text-stone-300 font-semibold">
                                {perfume.shade_name_en}
                              </span>
                              <span className="text-[11px] text-[#B08D57] font-mono">
                                ({perfume.shade_hex})
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {perfume.top_notes_en.slice(0, 3).map((note) => (
                                <span
                                  key={note}
                                  className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/70 dark:bg-black/40 text-[#3A332D] dark:text-[#FDFBF7]/80 border border-[#B08D57]/20"
                                >
                                  {note}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="pt-3 border-t border-[#B08D57]/20 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] tracking-widest uppercase text-[#8C6E3D] dark:text-[#DFCA9B] block">
                                From
                              </span>
                              <div className="font-display text-lg font-bold text-[#14110F] dark:text-[#FDFBF7]">
                                <Price amount={lowestPrice} />
                              </div>
                            </div>

                            <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#14110F] dark:bg-[#1E1714] text-[#FDFBF7] text-xs font-display uppercase tracking-widest group-hover:bg-[#6B1D2F] dark:group-hover:bg-[#8A1D2E] border border-[#B08D57]/30 transition-all shadow-md">
                              {isLipGloss ? 'Explore Shade in 3D' : 'Discover'}
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
