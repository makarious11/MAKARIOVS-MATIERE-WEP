'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PERFUMES, getStoredCatalog, PerfumeData } from '@/lib/catalog';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';

/* ─────────────────────────────────────────────
   Inline Editorial Product Card (arch + hover)
───────────────────────────────────────────── */
function ShopCard({ perfume }: { perfume: (typeof PERFUMES)[0] }) {
  const [hovered, setHovered] = useState(false);
  const lowestPrice = Math.min(...perfume.variants.map((v) => v.price));

  return (
    <Link
      href={`/product/${perfume.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col bg-[#FDFBF7] dark:bg-[#161210] rounded-2xl overflow-hidden border border-[#B08D57]/20 dark:border-[#B08D57]/30 transition-all duration-500 hover:shadow-[0_16px_48px_rgba(20,17,15,0.10)] no-underline"
    >
      {/* Arch Image Area */}
      <div
        className="relative w-full flex items-end justify-center overflow-hidden"
        style={{ height: 350 }}
      >
        {/* arch backdrop */}
        <div
          className={`absolute inset-x-6 bottom-0 h-[92%] bg-[#F1EADA] dark:bg-[#1C1613] rounded-t-[160px] transition-all duration-700 ${
            hovered ? 'shadow-[0_0_60px_rgba(176,141,87,0.22)]' : ''
          }`}
        >
          {/* inner gold hairline */}
          <div className="absolute inset-2 rounded-t-[154px] border border-[#B08D57]/25 pointer-events-none" />
        </div>

        {/* Bottle */}
        <motion.div
          animate={{ scale: hovered ? 1.05 : 1, y: hovered ? -8 : 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-[52%] h-[82%]"
        >
          <Image
            src={perfume.images.bottle}
            alt={perfume.name_en}
            fill
            className="object-contain drop-shadow-[0_14px_28px_rgba(20,17,15,0.18)]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </motion.div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 p-6 space-y-3">
        {/* Family Pill */}
        <span
          className={`self-start px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-widest border transition-colors duration-300 ${
            hovered ? 'border-[#B08D57] text-[#B08D57]' : 'border-[#B08D57]/50 text-[#B08D57]'
          }`}
        >
          {perfume.family_en}
        </span>

        {/* Name */}
        <h3 className="font-display uppercase tracking-tight text-[#14110F] dark:text-[#FDFBF7] text-3xl sm:text-[34px] leading-none">
          {perfume.name_en}
        </h3>

        {/* Tagline */}
        <p
          className="font-script italic text-[#B08D57]"
          style={{ fontSize: 18 }}
        >
          {perfume.tagline_en}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-display text-xs uppercase tracking-widest text-[#3A332D]/60 dark:text-[#DFCA9B]/70">
            From
          </span>
          <span className="font-display text-2xl font-semibold text-[#14110F] dark:text-[#FDFBF7]">
            {lowestPrice.toLocaleString()}
          </span>
          <span className="font-display text-xs uppercase tracking-widest text-[#3A332D]/60 dark:text-[#DFCA9B]/70">
            EGP
          </span>
        </div>

        {/* CTA */}
        <button
          className={`mt-auto w-full py-3.5 rounded-full font-display text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
            hovered
              ? 'bg-[#14110F] text-[#FBF8EE] border border-[#B08D57] shadow-[0_0_20px_rgba(176,141,87,0.18)]'
              : 'bg-[#14110F] text-[#FBF8EE] border border-transparent'
          }`}
        >
          Discover &amp; Acquire
        </button>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Shop Page
───────────────────────────────────────────── */
const FAMILIES = ['All', 'Floral', 'Woody', 'Amber', 'Oud', 'Botanical'] as const;
type Family = (typeof FAMILIES)[number];

export default function ShopPage() {
  const [activeFamily, setActiveFamily] = useState<Family>('All');
  const [catalog, setCatalog] = useState<PerfumeData[]>(PERFUMES);

  useEffect(() => {
    const sync = () => setCatalog(getStoredCatalog());
    sync();

    fetch('/api/v1/products')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setCatalog(json.data);
          localStorage.setItem('lvenus_custom_catalog', JSON.stringify(json.data));
        }
      })
      .catch(() => {});

    window.addEventListener('lv_catalog_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('lv_catalog_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const filtered = catalog.filter((p) => {
    if (activeFamily === 'All') return true;
    return p.family === activeFamily.toLowerCase();
  });

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] transition-colors duration-300">
      {/* ── Hero Banner ── */}
      <section
        className="relative w-full h-[45vh] min-h-[300px] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#0F0D0B' }}
      >
        {/* Botanical pattern at 8% */}
        <BotanicalPattern opacity={0.08} inverted />

        {/* Breadcrumb top-left */}
        <span className="absolute top-6 left-6 sm:left-10 font-display text-[10px] uppercase tracking-[0.3em] text-[#FBF8EE]/40 z-10">
          Maison de Parfum&nbsp;/&nbsp;The Extraits
        </span>

        {/* Giant outline heading */}
        <h1
          className="relative z-10 text-center font-display uppercase leading-none text-6xl sm:text-8xl md:text-9xl"
          style={{
            color: 'transparent',
            WebkitTextStroke: '1.5px #FBF8EE',
            letterSpacing: '0.08em',
          }}
        >
          The Collection
        </h1>

        {/* Script subheading */}
        <p
          className="relative z-10 mt-5 font-script italic"
          style={{ fontSize: 24, color: '#B08D57' }}
        >
          Four Rare Extraits de Parfum
        </p>
      </section>

      {/* ── Filter + Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filter bar */}
        <div className="flex items-center justify-end mb-10">
          <nav className="flex items-center gap-1 font-display text-[11px] uppercase tracking-widest">
            {FAMILIES.map((fam, i) => (
              <React.Fragment key={fam}>
                {i > 0 && (
                  <span className="text-[#B08D57]/40 select-none mx-1">·</span>
                )}
                <button
                  onClick={() => setActiveFamily(fam)}
                  className={`transition-colors duration-200 px-1 ${
                    activeFamily === fam
                      ? 'text-[#14110F] underline underline-offset-4 decoration-[#B08D57]'
                      : 'text-[#3A332D]/50 hover:text-[#14110F]'
                  }`}
                >
                  {fam}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Couture Lip Gloss Spotlight Banner */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#F6EBE6] via-[#F2D6DC] to-[#EBD0D8] dark:from-[#21161B] dark:via-[#2A1821] dark:to-[#1E1117] border border-[#B08D57]/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-start">
            <span className="text-[10px] font-display uppercase tracking-[0.25em] text-[#8C4A5A] dark:text-[#DFCA9B] font-semibold">
              New Haute Cosmétique Edition
            </span>
            <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-[#2B171D] dark:text-white">
              The Shade Collection — 3D Interactive Studio
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xl">
              Explore 01 Nude Peach, 02 Dusty Rose, and 03 Deep Berry with the real-time 3D interactive flacon viewer.
            </p>
          </div>
          <Link
            href="/lip-gloss"
            className="shrink-0 px-6 py-3 rounded-full bg-[#2B171D] text-white hover:bg-[#8C4A5A] text-xs font-display uppercase tracking-widest transition-colors shadow-md flex items-center gap-2"
          >
            <span>Enter 3D Lip Studio</span>
            <span className="text-amber-400">✦</span>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <AnimatePresence mode="popLayout">
            {filtered.map((perfume) => (
              <motion.div
                key={perfume.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.4 }}
              >
                <ShopCard perfume={perfume} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <p className="font-display text-lg uppercase tracking-wider text-[#14110F]">
              No fragrance matches this filter
            </p>
            <button
              onClick={() => setActiveFamily('All')}
              className="px-8 py-3 rounded-full bg-[#14110F] text-[#FBF8EE] font-display text-xs uppercase tracking-widest"
            >
              View All Extraits
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
