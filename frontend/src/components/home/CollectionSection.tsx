'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Star } from 'lucide-react';
import { PERFUMES, getStoredCatalog, PerfumeData } from '@/lib/catalog';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';
import { NumberRoll } from '@/components/ui/NumberRoll';

interface CollectionSectionProps {
  isArabic?: boolean;
}

export const CollectionSection: React.FC<CollectionSectionProps> = ({ isArabic = false }) => {
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);
  const [products, setProducts] = useState<PerfumeData[]>(PERFUMES);

  useEffect(() => {
    const syncCatalog = () => {
      const catalog = getStoredCatalog();
      const featured = catalog
        .filter((p) => p.featured_on_home !== false)
        .sort((a, b) => (a.home_order || 99) - (b.home_order || 99));
      setProducts(featured.length > 0 ? featured : catalog);
    };

    syncCatalog();

    // Sync live catalog from server database so admin featured choices display across all devices
    fetch('/api/v1/products')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          const featured = json.data
            .filter((p: any) => p.featured_on_home !== false)
            .sort((a: any, b: any) => (a.home_order || 99) - (b.home_order || 99));
          setProducts(featured.length > 0 ? featured : json.data);
          localStorage.setItem('lvenus_custom_catalog', JSON.stringify(json.data));
        }
      })
      .catch(() => {});

    window.addEventListener('lv_catalog_updated', syncCatalog);
    window.addEventListener('storage', syncCatalog);
    return () => {
      window.removeEventListener('lv_catalog_updated', syncCatalog);
      window.removeEventListener('storage', syncCatalog);
    };
  }, []);

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
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6 border-b border-[#B08D57]/20 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-px bg-[#B08D57]" />
              <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57]">
                {isArabic ? 'المجموعة المختارة' : 'The Signature Catalog'}
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
              {isArabic ? 'إبداعات الدار المختارة' : 'Featured Creations'}
            </h2>
          </div>

          <div className="text-left md:text-right">
            <p
              className="text-lg sm:text-xl text-[#B08D57]"
              style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
            >
              {isArabic ? 'عطور استثنائية · عناية نباتية وشفاه · بدي اسبلاش' : 'Extraits de Parfum · Skincare & Lip Radiance · Body Mist'}
            </p>
            <span className="font-display text-[11px] tracking-[0.2em] uppercase text-[#FDFBF7]/50 block mt-1">
              {isArabic ? 'صيغت بدقة في القاهرة بحرفية باريسية رفيعة' : 'Maison de Parfum — Le Caire · Paris'}
            </span>
          </div>
        </div>

        {/* DESKTOP VIEW: High-Fashion Editorial Rows */}
        <div className="hidden lg:flex flex-col space-y-10">
          {products.map((perfume, index) => {
            const productUrl = isArabic ? `/ar/product/${perfume.slug}` : `/product/${perfume.slug}`;
            const lowestPrice = Math.min(...(perfume.variants || [{ price: 0 }]).map((v) => v.price));
            const formattedIndex = String(index + 1).padStart(2, '0');

            return (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: index * 0.12 }}
                className="group relative p-8 sm:p-10 rounded-3xl ios-glass-dark border border-white/10 hover:border-[#B08D57]/50 transition-all duration-500 flex items-center justify-between gap-12 overflow-hidden hover:shadow-[0_24px_60px_rgba(0,0,0,0.65)] hover:-translate-y-1"
              >
                {/* Background botanical subtle touch */}
                <div className="absolute right-1/4 inset-y-0 w-96 opacity-10 pointer-events-none group-hover:opacity-25 transition-opacity duration-700">
                  <Image
                    src="/images/brand/brand-identity.jpg"
                    alt="Botanical ornament"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Left: Index Number & Typography */}
                <div className="relative z-10 flex items-start gap-8 flex-1">
                  {/* Big Editorial Row Number */}
                  <span
                    className="text-7xl font-light text-transparent select-none shrink-0"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      WebkitTextStroke: '1px rgba(176,141,87,0.35)',
                    }}
                  >
                    {formattedIndex}
                  </span>

                  <div className="space-y-3.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[11px] tracking-[0.2em] uppercase text-[#B08D57] px-3 py-1 rounded-full border border-[#B08D57]/35 bg-[#1B1612]/60">
                        {isArabic ? perfume.family_ar : perfume.family_en}
                      </span>
                      <div className="flex items-center gap-1 text-[#B08D57]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} className="fill-[#B08D57]" />
                        ))}
                        <span className="text-xs text-[#FDFBF7]/60 ml-1.5 font-sans">5.0</span>
                      </div>
                    </div>

                    <Link href={productUrl} className="block group/title">
                      <h3
                        className="text-4xl xl:text-5xl uppercase tracking-wider text-[#FDFBF7] group-hover/title:text-[#B08D57] transition-colors leading-tight"
                        style={{
                          fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif",
                          letterSpacing: isArabic ? '0.01em' : '0.06em',
                        }}
                      >
                        {isArabic ? perfume.name_ar : perfume.name_en}
                      </h3>
                    </Link>

                    <p
                      className="text-base text-[#B08D57]/90 italic max-w-lg"
                      style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
                    >
                      {isArabic ? perfume.tagline_ar : perfume.tagline_en}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs uppercase tracking-widest text-[#FDFBF7]/55">
                      <span className="text-[#B08D57] text-sm">✦</span>
                      <span>{(isArabic ? perfume.top_notes_ar : perfume.top_notes_en).join(' · ')}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Arch Frame with Bottle */}
                <div className="relative w-52 xl:w-60 aspect-[3/4] flex items-center justify-center shrink-0">
                  {/* Arched Background */}
                  <div className="absolute inset-x-3 bottom-0 top-6 ios-glass-dark rounded-t-[120px] border border-[#B08D57]/30 shadow-inner" />
                  <div className="relative w-4/5 h-4/5 group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-500 rounded-t-[90px] overflow-hidden">
                    <Image
                      src={perfume.images.bottle}
                      alt={isArabic ? perfume.name_ar : perfume.name_en}
                      fill
                      className="object-cover filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.65)]"
                    />
                  </div>
                </div>

                {/* Right: Price & CTA */}
                <div className="relative z-10 flex flex-col items-end space-y-5 shrink-0 pl-4">
                  <div className="text-right">
                    <span className="font-body text-xs text-[#FDFBF7]/50 uppercase tracking-widest block mb-1">
                      {isArabic ? 'يبدأ من' : 'From'}
                    </span>
                    <span className="font-display text-3xl font-light text-[#FDFBF7] tracking-wider">
                      <NumberRoll value={lowestPrice} />
                      <span className="text-xs text-[#B08D57] ml-1.5 font-sans uppercase">
                        {isArabic ? 'ج.م' : 'EGP'}
                      </span>
                    </span>
                  </div>

                  <Link
                    href={productUrl}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#FDFBF7] text-[#14110F] hover:bg-[#6B1D2F] hover:text-[#FDFBF7] font-display text-xs uppercase tracking-[0.2em] transition-all duration-400 group/btn shadow-md border border-[#B08D57]/40"
                  >
                    <span>{isArabic ? 'اكتشف العطر' : 'Discover'}</span>
                    <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* MOBILE VIEW: Luxury Arch Showcase Carousel */}
        <div className="lg:hidden">
          <div className="relative flex items-center justify-center py-6">
            {products.map((perfume, idx) => {
              const isActive = idx === activeMobileIdx;
              const productUrl = isArabic ? `/ar/product/${perfume.slug}` : `/product/${perfume.slug}`;
              const lowestPrice = Math.min(...(perfume.variants || [{ price: 0 }]).map((v) => v.price));

              if (!isActive) return null;

              return (
                <motion.div
                  key={perfume.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-sm flex flex-col items-center text-center space-y-6 bg-[#14100D] p-6 rounded-3xl border border-[#B08D57]/30 shadow-xl"
                >
                  {/* Arched Frame with bottle */}
                  <div className="relative w-64 aspect-[3/4] flex items-center justify-center">
                    <div className="absolute inset-x-4 bottom-0 top-6 bg-[#1D1713] rounded-t-[120px] border border-[#B08D57]/40 shadow-inner" />
                    <div className="relative w-4/5 h-4/5">
                      <Image
                        src={perfume.images.bottle}
                        alt={isArabic ? perfume.name_ar : perfume.name_en}
                        fill
                        className="object-contain filter drop-shadow-[0_20px_36px_rgba(0,0,0,0.7)]"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2.5">
                    <span className="font-display text-[10px] tracking-[0.2em] uppercase text-[#B08D57] px-3 py-1 rounded-full border border-[#B08D57]/35 bg-[#1B1612]">
                      {isArabic ? perfume.family_ar : perfume.family_en}
                    </span>
                    <h3
                      className="text-3xl uppercase tracking-wider text-[#FDFBF7]"
                      style={{
                        fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      {isArabic ? perfume.name_ar : perfume.name_en}
                    </h3>
                    <p
                      className="text-sm text-[#B08D57] italic"
                      style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
                    >
                      {isArabic ? perfume.tagline_ar : perfume.tagline_en}
                    </p>
                    <p className="font-display text-2xl font-light text-[#FDFBF7] pt-1">
                      <NumberRoll value={lowestPrice} />
                      <span className="text-xs text-[#B08D57] ml-1 font-sans uppercase">
                        {isArabic ? 'ج.م' : 'EGP'}
                      </span>
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    href={productUrl}
                    className="w-full py-4 rounded-full bg-[#FDFBF7] text-[#14110F] hover:bg-[#6B1D2F] hover:text-[#FDFBF7] font-display text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>{isArabic ? 'اكتشف العطر' : 'Discover'}</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {products.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveMobileIdx(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  i === activeMobileIdx ? 'bg-[#B08D57] w-8' : 'bg-white/20'
                }`}
                aria-label={`Perfume ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
