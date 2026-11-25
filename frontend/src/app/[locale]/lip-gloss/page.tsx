'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShoppingBag,
  Check,
  Star,
  Heart,
  Droplets,
  ShieldCheck,
  ArrowRight,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  LIP_GLOSS_SHADES,
  LipGloss3DBottle,
  ShadeConfig,
} from '@/components/lipgloss/LipGloss3DBottle';
import {
  getPerfumeBySlug,
  getStoredCatalog,
  PerfumeData,
  saveProductToCatalog,
  addProductReview,
} from '@/lib/catalog';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { StarRating } from '@/components/ui/StarRating';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { Price } from '@/components/ui/Price';

interface PageProps {
  params: Promise<{ locale?: string }>;
}

export default function LipGlossCatalogPage({ params }: PageProps) {
  const resolved = use(params);
  const pathname = usePathname();
  const isArabic = resolved?.locale === 'ar' || pathname?.startsWith('/ar');

  // Active Shade State (Defaults to iconic Dusty Rose)
  const [activeShadeId, setActiveShadeId] = useState<string>('dusty-rose');
  const [isOpenWand, setIsOpenWand] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'shades' | 'formula' | 'swatches'>('shades');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);

  const { addItem } = useCartStore();
  const { openCart } = useUIStore();

  const activeShade =
    LIP_GLOSS_SHADES.find((s) => s.id === activeShadeId) || LIP_GLOSS_SHADES[1];

  // Scroll listener for 3D parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync with catalog products
  const [catalogProducts, setCatalogProducts] = useState<PerfumeData[]>([]);
  useEffect(() => {
    const sync = () => {
      const all = getStoredCatalog();
      setCatalogProducts(all);
    };
    sync();
    window.addEventListener('lv_catalog_updated', sync);
    return () => window.removeEventListener('lv_catalog_updated', sync);
  }, []);

  const activeCatalogProduct =
    catalogProducts.find((p) => p.slug === activeShade.slug) ||
    getPerfumeBySlug(activeShade.slug) ||
    catalogProducts.find((p) => p.slug === 'elixir-levres-satine');

  const trioProduct =
    catalogProducts.find((p) => p.slug === 'elixir-levres-satine') ||
    getPerfumeBySlug('elixir-levres-satine');

  // Add individual shade to cart
  const handleAddToCart = (shade: ShadeConfig, isTrio = false) => {
    const targetProd = isTrio ? trioProduct : activeCatalogProduct;
    if (!targetProd) return;

    const variant = targetProd.variants?.[0] || {
      id: isTrio ? 703 : 711,
      size_ml: isTrio ? 15 : 5,
      price: isTrio ? 1850 : 750,
      stock: 40,
      sku: isTrio ? 'LV-LIP-TRIO' : `LV-${shade.id}`,
      is_default: true,
    };

    const cartItem: any = {
      id: targetProd.id,
      slug: targetProd.slug,
      name_en: isTrio
        ? 'Élixir Lèvres Satiné — Complete Shade Trio'
        : `Élixir Lèvres Satiné — ${shade.name_en}`,
      name_ar: isTrio
        ? 'إكسير الشفاه الساتاني — المجموعة الثلاثية الكاملة'
        : `إكسير الشفاه الساتاني — ${shade.name_ar}`,
      images: [
        {
          id: 1,
          product_id: targetProd.id,
          url: isTrio ? '/images/lipgloss/shade-collection-trio.jpg' : shade.image_bottle,
          alt_en: shade.name_en,
          alt_ar: shade.name_ar,
          sort_order: 1,
        },
      ],
      variants: [variant],
    };

    addItem(cartItem, variant, selectedQuantity);
    openCart();
  };

  // Submit Review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const targetSlug = activeShade.slug;
    addProductReview(targetSlug, {
      name: reviewName.trim(),
      rating: reviewRating,
      body_ar: reviewComment.trim(),
      body_en: reviewComment.trim(),
    });

    fetch('/api/v1/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: reviewName.trim(),
        rating: reviewRating,
        body: reviewComment.trim(),
        product_slug: targetSlug,
      }),
    }).catch(() => {});

    setReviewSubmitted(true);
    setReviewName('');
    setReviewComment('');
    setTimeout(() => setReviewSubmitted(false), 5000);
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#FCF8F5] dark:bg-[#120D0F] text-[#24171A] dark:text-[#FDFBF7] transition-colors duration-500 overflow-x-hidden selection:bg-[#B67583]/20"
    >
      {/* ──────────────────────────────────────────────────────────
          1. IMMERSIVE HAUTE COSMÉTIQUE HERO WITH 3D INTERACTIVE BOTTLE
      ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[94vh] lg:min-h-screen flex items-center justify-center pt-28 pb-16 px-4 sm:px-8 overflow-hidden bg-[#FAF2ED] dark:bg-[#130E10] transition-colors duration-300">
        {/* Soft Couture Atmosphere Glow */}
        <div
          className="absolute inset-0 -z-10 transition-all duration-1000 opacity-70 dark:opacity-35"
          style={{
            background: `radial-gradient(120% 100% at 50% 20%, ${activeShade.hex}28 0%, transparent 72%)`,
          }}
        />

        {/* Subtle Luxury Damask Rose Silhouette Watermark */}
        <div className="absolute inset-0 -z-10 opacity-[0.035] bg-[radial-gradient(#B67583_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Couture Editorial Narrative */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-start z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full backdrop-blur-md bg-white/70 dark:bg-stone-900/60 border border-[#B08D57]/30 text-xs font-display tracking-[0.25em] uppercase text-[#8C4A5A] dark:text-[#DFCA9B]"
            >
              <Sparkles size={12} className="text-[#B08D57]" />
              <span>
                {isArabic
                  ? 'مجموعة الشفاه الملكية — إصدار الكوتور'
                  : 'Chapitre II · Haute Cosmétique Collection'}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-wide uppercase leading-tight text-[#2B171D] dark:text-[#FDFBF7]">
                {isArabic ? (
                  <>
                    مجموعة الظلال{' '}
                    <span className="text-[#B67583] dark:text-[#E8A5B2]">الملكية</span>
                  </>
                ) : (
                  <>
                    THE SHADE{' '}
                    <span className="font-script lowercase text-4xl sm:text-6xl lg:text-7xl text-[#B67583] dark:text-[#E8A5B2] block sm:inline">
                      collection
                    </span>
                  </>
                )}
              </h1>
              <p className="font-script text-lg sm:text-2xl text-[#8C4A5A] dark:text-[#DFCA9B] italic">
                {isArabic
                  ? 'إكسير الشفاه الساتاني — بورد الإسكندرية وبلح الصحراء'
                  : 'Élixir Lèvres Satiné · Plumping Mirror-Glass Radiance'}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-body text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {isArabic
                ? 'ثلاث درجات أيقونية صيغت ببراعة خيميائية فائقة النقاء: قطرات الورد الدمشقي المقطر على البارد، وزيت بذور بلح الصحراء، وحمض الهيالورونيك النباتي. لمعان زجاجي فائق الأنوثة وامتلاء مخملي فوري خالٍ تماماً من اللزوجة.'
                : 'An exquisite alchemy of couture radiance and deep cellular care. Three bespoke shades distilled with Alexandrian Damask rose petals, desert date seed oil, and botanical squalane. Non-sticky mirror gloss that cushions the lips in lasting hydration.'}
            </motion.p>

            {/* Interactive Shade Swatch Circles (Direct Selection) */}
            <div className="pt-2 flex flex-col items-center lg:items-start gap-3">
              <span className="font-display text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400">
                {isArabic ? 'اختر الدرجة للاستعراض:' : 'Select Shade Presentation:'}
              </span>
              <div className="flex items-center gap-4 p-2 rounded-full backdrop-blur-md bg-white/60 dark:bg-stone-900/60 border border-[#B08D57]/30 shadow-sm">
                {LIP_GLOSS_SHADES.map((s) => {
                  const isSelected = s.id === activeShadeId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveShadeId(s.id)}
                      className="group relative flex items-center gap-2 p-1.5 rounded-full transition-all cursor-pointer"
                    >
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-transform duration-300 flex items-center justify-center ${
                          isSelected
                            ? 'scale-110 border-[#14110F] dark:border-white shadow-md'
                            : 'border-white/80 hover:scale-105'
                        }`}
                        style={{ backgroundColor: s.hex }}
                      >
                        {isSelected && <Check size={13} className="text-white drop-shadow-sm" />}
                      </span>
                      <span
                        className={`text-xs font-display tracking-wider pe-2 ${
                          isSelected
                            ? 'font-bold text-[#2B171D] dark:text-white'
                            : 'text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        {isArabic ? s.name_ar.split('—')[0] : s.name_en.split('—')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pricing & 1-Click Purchase */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold text-[#2B171D] dark:text-[#FDFBF7]">
                  <Price amount={750} />
                </span>
                <span className="text-xs text-stone-400 line-through">
                  <Price amount={950} />
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(activeShade)}
                className="px-8 py-3.5 rounded-full font-display text-xs uppercase tracking-[0.25em] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 cursor-pointer"
                style={{ backgroundColor: activeShade.hex }}
              >
                <ShoppingBag size={16} />
                <span>
                  {isArabic
                    ? `إضافة درجة ${activeShade.name_ar} للحقيبة`
                    : `Add ${activeShade.name_en} To Bag`}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Parallax Rotating Bottle Showcase */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <LipGloss3DBottle
              activeShadeId={activeShadeId}
              isOpenWand={isOpenWand}
              onToggleOpenWand={() => setIsOpenWand(!isOpenWand)}
              scrollY={scrollY}
              isArabic={isArabic}
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          2. THE TRILOGY SPOTLIGHT: THE 3 SHADES DETAILED COMPARISON
      ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-8 border-t border-[#B08D57]/20 bg-[#FAF4F0] dark:bg-[#150F12]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57]">
              {isArabic ? 'الطيف اللوني الملكي' : 'The Haute Color Spectrum'}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-widest text-[#2B171D] dark:text-[#FDFBF7]">
              {isArabic ? 'ثلاث درجات استثنائية تناسب كل إطلالة' : 'Three Signature Shades'}
            </h2>
            <p className="font-script text-base sm:text-lg text-[#8C4A5A] dark:text-[#DFCA9B] italic">
              {isArabic
                ? 'مستوحاة من الفجر السكندري وورد باريس وليالي الشرق الملكية'
                : 'From sunlit dawn to sovereign midnight allure'}
            </p>
          </div>

          {/* 3 Shade Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LIP_GLOSS_SHADES.map((s, idx) => {
              const isSelected = s.id === activeShadeId;
              return (
                <motion.div
                  key={s.id}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.35 }}
                  className={`rounded-3xl p-6 transition-all duration-300 relative flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-white dark:bg-[#1E1518] border-[#B08D57] shadow-xl ring-2 ring-[#B08D57]/30'
                      : 'bg-white/60 dark:bg-[#1A1215] border-[#B08D57]/20 hover:border-[#B08D57]/60 shadow-sm'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Bottle preview */}
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#F7ECE7] to-white dark:from-[#21161A] dark:to-[#170F12] flex items-center justify-center">
                      <Image
                        src={s.image_bottle}
                        alt={isArabic ? s.name_ar : s.name_en}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <span
                        className="absolute top-3 right-3 w-6 h-6 rounded-full border border-white/80 shadow-md"
                        style={{ backgroundColor: s.hex }}
                      />
                      <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-widest backdrop-blur-md bg-white/80 dark:bg-black/70 text-[#2B171D] dark:text-white">
                        {`0${idx + 1}`}
                      </span>
                    </div>

                    {/* Shade Details */}
                    <div>
                      <h3 className="font-display text-lg font-semibold tracking-wide text-[#2B171D] dark:text-[#FDFBF7]">
                        {isArabic ? s.name_ar : s.name_en}
                      </h3>
                      <p className="font-script text-sm text-[#8C4A5A] dark:text-[#DFCA9B] italic">
                        {isArabic ? s.undertone_ar : s.undertone_en}
                      </p>
                    </div>

                    <p className="text-xs font-body text-stone-600 dark:text-stone-300 leading-relaxed">
                      {isArabic ? s.description_ar : s.description_en}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-[#B08D57]/20">
                      <span className="text-stone-500">{isArabic ? 'اللمعان:' : 'Finish:'}</span>
                      <span className="font-medium text-[#8C4A5A] dark:text-[#DFCA9B]">
                        {isArabic ? s.finish_ar : s.finish_en}
                      </span>
                    </div>
                  </div>

                  {/* Quick Acquire Button */}
                  <div className="pt-6 mt-4 border-t border-[#B08D57]/15 flex items-center justify-between gap-3">
                    <span className="font-display text-lg font-semibold text-[#2B171D] dark:text-[#FDFBF7]">
                      <Price amount={750} />
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveShadeId(s.id);
                        handleAddToCart(s);
                      }}
                      className="px-5 py-2.5 rounded-full text-xs font-display tracking-widest uppercase text-white shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: s.hex }}
                    >
                      <ShoppingBag size={13} />
                      <span>{isArabic ? 'اقتناء' : 'Acquire'}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Complete 3-Shade Trio Collector's Box Offer */}
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#F6E6E1] via-[#F2D6DC] to-[#E7CBD3] dark:from-[#21161B] dark:via-[#26171E] dark:to-[#2F1B24] border border-[#B08D57]/40 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4 text-center lg:text-start">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#B67583]/20 border border-[#B67583]/40 text-xs font-display tracking-widest uppercase text-[#8C4A5A] dark:text-[#DFCA9B]">
                  {isArabic ? 'عرض المجموعة الثلاثية الحصري' : 'The Complete Collector’s Trio'}
                </span>
                <h3 className="font-display text-2xl sm:text-4xl uppercase tracking-wider text-[#2B171D] dark:text-[#FDFBF7]">
                  {isArabic ? 'طقم الشفاه الكامل — الدرجات الثلاث في صندوق واحد' : 'The Complete Shade Wardrobe'}
                </h3>
                <p className="text-sm font-body text-stone-700 dark:text-stone-300 leading-relaxed max-w-xl">
                  {isArabic
                    ? 'اقتني المجموعة الثلاثية الكاملة (نود خوخي، وردي كوتور، وتوتي ملكي) داخل صندوق مخملي فاخر بخصم خاص، لتتألقي بدرجة تناسب كل وقت من اليوم.'
                    : 'Own all three bespoke shades (01 Nude Peach, 02 Dusty Rose, and 03 Deep Berry) presented in the L’VENUS signature velvet presentation box at exclusive privilege pricing.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-[#8C4A5A] dark:text-[#DFCA9B]">
                      <Price amount={1850} />
                    </span>
                    <span className="text-sm text-stone-500 line-through">
                      <Price amount={2250} />
                    </span>
                    <span className="text-xs font-display px-2 py-0.5 rounded bg-green-800/10 text-green-700 dark:text-green-300">
                      {isArabic ? (
                        <>وفر <Price amount={400} /></>
                      ) : (
                        <>Save <Price amount={400} /></>
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(activeShade, true)}
                    className="px-8 py-3.5 rounded-full bg-[#2B171D] dark:bg-[#FDFBF7] text-[#FDFBF7] dark:text-[#2B171D] font-display text-xs uppercase tracking-[0.25em] shadow-xl hover:bg-[#8C4A5A] dark:hover:bg-[#E8A5B2] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag size={15} />
                    <span>{isArabic ? 'اقتناء المجموعة الثلاثية' : 'Acquire The Trio Set'}</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden">
                <Image
                  src="/images/lipgloss/shade-collection-trio.jpg"
                  alt="L’VENUS Lip Gloss Trio Collection"
                  fill
                  className="object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          3. REAL ON-SKIN SWATCH GALLERY (AUTHENTIC HAND PHOTO)
      ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 border-t border-[#B08D57]/20 bg-[#FCF8F5] dark:bg-[#120D0F]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative h-[380px] sm:h-[460px] w-full rounded-3xl overflow-hidden shadow-2xl border border-[#B08D57]/30">
            <Image
              src="/images/lipgloss/shade-collection-swatches.jpg"
              alt="L’VENUS Shade Collection Swatches on Skin"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <span className="text-white text-xs font-display tracking-widest uppercase">
                {isArabic ? 'سواتشات حقيقية على البشرة — إضاءة طبيعية' : 'Real Skin Swatches · Daylight Radiance'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57]">
              {isArabic ? 'نقاء الصبغة وانعكاس الضوء' : 'Pigment Purity & Light Reflection'}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-widest text-[#2B171D] dark:text-[#FDFBF7]">
              {isArabic ? 'لون شفاف متألق لا يثقل الشفاه' : 'Cushion Radiance on Every Skin Tone'}
            </h2>
            <p className="font-body text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              {isArabic
                ? 'تم ضبط كثافة الصبغة النباتية بعناية لتمنحك لوناً ساتانياً صافياً يبرز جمال شفتيك الطبيعي دون أن يخفيه، مع لمعان زجاجي عاكس يعطي إيحاء بامتلاء طبيعي فوري يدوم لساعات.'
                : 'Engineered with micronized botanical pigments that adapt harmoniously to your natural lip tone. Delivers transparent buildable coverage with zero tackiness, high-lacquer mirror shine, and cushion comfort.'}
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#D49678] text-white text-[10px] font-bold">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-display font-semibold uppercase text-[#2B171D] dark:text-[#FDFBF7]">
                    {isArabic ? '٠١ نود خوخي دافئ (Nude Peach)' : '01 Nude Peach — Warm Honey Glow'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {isArabic ? 'إشراقة يومية طبيعية منعشة' : 'Natural daytime effortless polish'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#B67583] text-white text-[10px] font-bold">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-display font-semibold uppercase text-[#2B171D] dark:text-[#FDFBF7]">
                    {isArabic ? '٠٢ وردي كوتور (Dusty Rose)' : '02 Dusty Rose — The Iconic Parisian Mauve'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {isArabic ? 'الدرجة الأكثر طلباً التي تليق بكل المناسبات' : 'The universally flattering signature'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#783B4B] text-white text-[10px] font-bold">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-display font-semibold uppercase text-[#2B171D] dark:text-[#FDFBF7]">
                    {isArabic ? '٠٣ توتي ملكي (Deep Berry)' : '03 Deep Berry — Sovereign Velvet Depth'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {isArabic ? 'عمق مسائي ساحر يفيض بالجاذبية' : 'Dramatic evening allure & juicy cushion'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          4. BOTANICAL ALCHEMY: INGREDIENTS & SENSORY RITUAL
      ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 border-t border-[#B08D57]/20 bg-[#FAF1ED] dark:bg-[#181114]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57]">
              {isArabic ? 'الخيمياء النباتية الصافية' : 'Botanical Alchemy'}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-widest text-[#2B171D] dark:text-[#FDFBF7]">
              {isArabic ? 'أربعة مكونات نقية لعناية خلوية فائقة' : 'Cellular Radiance Actives'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-stone-900/60 border border-[#B08D57]/20 space-y-3">
              <Droplets className="text-[#B67583]" size={24} />
              <h4 className="font-display text-sm font-semibold uppercase text-[#2B171D] dark:text-[#FDFBF7]">
                {isArabic ? 'الورد الدمشقي السكندري' : 'Damask Rose Absolute'}
              </h4>
              <p className="text-xs font-body text-stone-600 dark:text-stone-300 leading-relaxed">
                {isArabic
                  ? 'مقطر على البارد لتهدئة الشفاه وتغذيتها ومنحها شذى طبيعياً منعشاً.'
                  : 'Cold-distilled for antioxidant defense and soothing petal-soft nourishment.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/80 dark:bg-stone-900/60 border border-[#B08D57]/20 space-y-3">
              <Sparkles className="text-[#D49678]" size={24} />
              <h4 className="font-display text-sm font-semibold uppercase text-[#2B171D] dark:text-[#FDFBF7]">
                {isArabic ? 'زيت بذور بلح الصحراء' : 'Desert Date Seed Nectar'}
              </h4>
              <p className="text-xs font-body text-stone-600 dark:text-stone-300 leading-relaxed">
                {isArabic
                  ? 'إكسير مصري عريق غني بالأحماض الدهنية الأساسية لترميم حاجز الشفاه.'
                  : 'Ancient Egyptian botanical elixir packed with omegas to seal in deep moisture.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/80 dark:bg-stone-900/60 border border-[#B08D57]/20 space-y-3">
              <Layers className="text-[#8C4A5A]" size={24} />
              <h4 className="font-display text-sm font-semibold uppercase text-[#2B171D] dark:text-[#FDFBF7]">
                {isArabic ? 'حمض الهيالورونيك النباتي' : 'Botanical Hyaluronic Acid'}
              </h4>
              <p className="text-xs font-body text-stone-600 dark:text-stone-300 leading-relaxed">
                {isArabic
                  ? 'يجذب الرطوبة داخل أنسجة الشفاه ليمنحها امتلاءً زجاجياً ونعومة تدوم.'
                  : 'Micro-spheres that draw moisture deep to visibly plump and smooth fine lines.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/80 dark:bg-stone-900/60 border border-[#B08D57]/20 space-y-3">
              <ShieldCheck className="text-[#B08D57]" size={24} />
              <h4 className="font-display text-sm font-semibold uppercase text-[#2B171D] dark:text-[#FDFBF7]">
                {isArabic ? 'سكوالين الحرير وفيتامين E' : 'Silk Squalane & Vitamin E'}
              </h4>
              <p className="text-xs font-body text-stone-600 dark:text-stone-300 leading-relaxed">
                {isArabic
                  ? 'يمنح اللمعان الزجاجي الخفيف دون أي إحساس بالالتصاق أو الثقل.'
                  : 'Delivers high-refractive glass shine with 100% weightless non-sticky comfort.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          5. REVIEWS & ATELIER EXPERIENCES
      ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 border-t border-[#B08D57]/20 bg-[#FCF8F5] dark:bg-[#120D0F]">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57]">
                {isArabic ? 'آراء عملاء الدار' : 'Atelier Correspondence'}
              </span>
              <h2 className="font-display text-2xl uppercase tracking-widest text-[#2B171D] dark:text-[#FDFBF7]">
                {isArabic ? 'انطباعات وتجارب حقيقية' : 'Patron Impressions'}
              </h2>
            </div>
            <WaxSeal size={36} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 border border-[#B08D57]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs uppercase font-bold text-[#2B171D] dark:text-[#FDFBF7]">
                  سارة المنشاوي
                </span>
                <StarRating rating={5} />
              </div>
              <p className="font-body text-xs sm:text-sm text-stone-600 dark:text-stone-300 italic">
                “أفضل ليب غلوس جربته في حياتي! لمعانه زجاجي راقي وريحته ورد طبيعي خفيف ومفيهوش أي تلزيق نهائياً، وبيرطب الشفايف طول اليوم.”
              </p>
              <span className="text-[10px] text-stone-400 block font-mono">2026-11-18</span>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 border border-[#B08D57]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs uppercase font-bold text-[#2B171D] dark:text-[#FDFBF7]">
                  ياسمين خليل
                </span>
                <StarRating rating={5} />
              </div>
              <p className="font-body text-xs sm:text-sm text-stone-600 dark:text-stone-300 italic">
                “فخامة لا توصف! درجة الدستي روز مثالية ومريحة جداً على الشفايف، وشكل العبوة الكريستالية قطعة مجوهرات على التسريحة.”
              </p>
              <span className="text-[10px] text-stone-400 block font-mono">2026-11-19</span>
            </div>
          </div>

          {/* Add Review Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-stone-900/80 border border-[#B08D57]/30 space-y-4">
            <h4 className="font-display text-sm uppercase tracking-wider text-[#2B171D] dark:text-[#FDFBF7]">
              {isArabic ? 'شاركينا انطباعك عن إكسير شفاه لوفينوس' : 'Record Your Experience'}
            </h4>

            {reviewSubmitted ? (
              <div className="p-4 rounded-xl bg-green-900/10 text-green-700 dark:text-green-300 text-xs font-display tracking-wider flex items-center gap-2">
                <Check size={16} />
                <span>
                  {isArabic
                    ? 'نشكرك على تقييمك النبيل. تم تسجيل رأيك في أرشيف الدار.'
                    : 'Thank you for your refined review. It has been recorded into the maison archive.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-display text-stone-600 dark:text-stone-300">
                    {isArabic ? 'تقييمك:' : 'Rating:'}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-base cursor-pointer ${
                          star <= reviewRating ? 'text-[#B08D57]' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={isArabic ? 'اسمك الكريم' : 'Your Name'}
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    required
                    className="p-3 rounded-xl bg-[#FAF4F0] dark:bg-[#1C1618] border border-[#B08D57]/30 text-xs font-body focus:outline-none focus:border-[#B67583]"
                  />
                  <div className="flex items-center px-3 rounded-xl bg-[#FAF4F0]/60 dark:bg-[#1C1618]/60 text-xs text-stone-500">
                    <span>
                      {isArabic
                        ? `الدرجة المقيّمة: ${activeShade.name_ar}`
                        : `Reviewing: ${activeShade.name_en}`}
                    </span>
                  </div>
                </div>

                <textarea
                  rows={3}
                  placeholder={
                    isArabic
                      ? 'شاركينا رأيك في لمعان وثبات وترطيب إكسير الشفاه...'
                      : 'Share your impressions of the texture, radiance, and comfort...'
                  }
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-[#FAF4F0] dark:bg-[#1C1618] border border-[#B08D57]/30 text-xs font-body focus:outline-none focus:border-[#B67583]"
                />

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#2B171D] dark:bg-[#FDFBF7] text-[#FDFBF7] dark:text-[#2B171D] hover:bg-[#8C4A5A] dark:hover:bg-[#E8A5B2] font-display text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  {isArabic ? 'إرسال التقييم' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          6. DISCOVER THE ATELIER FOOTER CTA
      ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center border-t border-[#B08D57]/20 bg-[#F6ECE7] dark:bg-[#171013]">
        <div className="max-w-xl mx-auto space-y-4">
          <span className="font-display text-xs tracking-widest3 uppercase text-[#B08D57]">
            {isArabic ? 'كوتور الشفاه — دار لوفينوس' : 'Maison L’VENUS Haute Cosmétique'}
          </span>
          <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-widest text-[#2B171D] dark:text-[#FDFBF7]">
            {isArabic ? 'استكشفي عطور الدار الملكية' : 'Harmonize With Haute Parfumerie'}
          </h3>
          <p className="font-script text-base text-[#8C4A5A] dark:text-[#DFCA9B] italic">
            {isArabic
              ? 'أكملي طقس أناقتك مع مستخلصات العطور النادرة'
              : 'Pair your lip radiance with our canonical Extraits de Parfum'}
          </p>
          <div className="pt-2">
            <Link
              href={isArabic ? '/ar/shop' : '/shop'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2B171D] text-white hover:bg-[#8C4A5A] font-display text-xs uppercase tracking-widest transition-colors"
            >
              <span>{isArabic ? 'تصفح كافة العطور' : 'Discover Perfume Vault'}</span>
              <ArrowRight size={14} className={isArabic ? 'rotate-180' : ''} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
