'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ShoppingBag,
  Share2,
} from 'lucide-react';
import { getPerfumeBySlug, getOtherPerfumes, PERFUMES, PerfumeData, addProductReview } from '@/lib/catalog';
import { ArchFrame } from '@/components/ui/ArchFrame';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { SizeSelector } from '@/components/product/SizeSelector';
import { NotesPyramid } from '@/components/product/NotesPyramid';
import { PerformanceMeter } from '@/components/product/PerformanceMeter';
import { CalloutDot } from '@/components/product/CalloutDot';
import { GiftOption } from '@/components/product/GiftOption';
import { NumberRoll } from '@/components/ui/NumberRoll';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';
import { ProductCard } from '@/components/product/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const [perfume, setPerfume] = useState<PerfumeData>(() => getPerfumeBySlug(slug) || PERFUMES[0]);
  const otherPerfumes = getOtherPerfumes(perfume.slug);

  const [selectedVariantId, setSelectedVariantId] = useState<number>(
    perfume.variants?.find((v: any) => v.is_default)?.id || perfume.variants?.[0]?.id || 1
  );
  const [selectedImage, setSelectedImage] = useState<string>(perfume.images.bottle);

  useEffect(() => {
    const sync = () => {
      const latest = getPerfumeBySlug(slug);
      if (latest) {
        setPerfume(latest);
        if (latest.images?.bottle) {
          setSelectedImage(latest.images.bottle);
        }
        const defVariant = latest.variants?.find((v: any) => v.is_default)?.id || latest.variants?.[0]?.id;
        if (defVariant) setSelectedVariantId(defVariant);
      }
    };

    sync();
    window.addEventListener('lv_catalog_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('lv_catalog_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, [slug]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('story');
  const [giftBox, setGiftBox] = useState<{ enabled: boolean; note: string }>({
    enabled: false,
    note: '',
  });

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { addItem } = useCartStore();
  const { openCart } = useUIStore();

  const selectedVariant =
    perfume.variants?.find((v: any) => v.id === selectedVariantId) || perfume.variants?.[0] || { price: 0, size_ml: 50 };

  const totalVariantPrice = selectedVariant.price * quantity + (giftBox.enabled ? 150 : 0);

  // Track scroll for sticky mobile Add to Cart bar
  useEffect(() => {
    const handleScroll = () => {
      const cta = document.getElementById('main-add-to-cart-button');
      if (cta) {
        const rect = cta.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    const cartProduct: any = {
      id: perfume.id,
      slug: perfume.slug,
      name_en: perfume.name_en,
      name_ar: perfume.name_ar,
      images: [
        {
          id: 1,
          product_id: perfume.id,
          url: perfume.images.bottle,
          alt_en: perfume.name_en,
          alt_ar: perfume.name_ar,
          sort_order: 1,
        },
      ],
      variants: perfume.variants,
    };
    addItem(cartProduct, selectedVariant, quantity);
    openCart();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewBody.trim()) return;
    try {
      // 1. Immediately persist review into catalog and localStorage
      const updated = addProductReview(perfume.slug, {
        name: reviewName.trim(),
        rating: reviewRating,
        body_en: reviewBody.trim(),
        body_ar: reviewBody.trim(),
      });

      if (updated) {
        setPerfume(updated);
      }

      // 2. Background sync to reviews API
      fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewName.trim(),
          rating: reviewRating,
          body: reviewBody.trim(),
          product_id: perfume.id,
          product_slug: perfume.slug,
        }),
      }).catch(() => {});

      setReviewSubmitted(true);
      setReviewName('');
      setReviewBody('');
      setTimeout(() => setReviewSubmitted(false), 5000);
    } catch {
      setReviewSubmitted(true);
    }
  };

  const accordions = [
    {
      id: 'story',
      title: 'The Alchemical Story',
      content: perfume.story_en,
    },
    {
      id: 'wear',
      title: 'How to Wear & Ritual',
      content:
        'Extrait de Parfum requires only one to two measured applications upon high-pulse sanctuaries: the nape of the neck, wrist hollows, and collarbone hollows. For an unforgettable aura, mist lightly onto silk scarves or cashmere linings. Macerates uniquely with your natural skin warmth.',
    },
    {
      id: 'ingredients',
      title: 'Noble Ingredients & Extraction',
      content:
        '32%–38% pure perfume oils, organic perfumers alcohol, cold-pressed botanical essences, and sustainably aged natural resins. Free of parabens, phthalates, synthetic colorants, or animal cruelty. Hand-bottled and sealed in our Le Caire / Paris ateliers.',
    },
    {
      id: 'shipping',
      title: 'Shipping, Delivery & Returns',
      content:
        'Hand-delivered across Egypt within 1–3 business days via temperature-controlled courier. Each order includes a complimentary 2ml discovery vial of another Extrait. Returnable within 14 days in unopened, wax-sealed packaging.',
    },
  ];

  // JSON-LD Product Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: perfume.name_en,
    image: perfume.images.hero,
    description: perfume.story_en,
    brand: {
      '@type': 'Brand',
      name: 'MAKARIOVS & MATIÈRE',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EGP',
      price: selectedVariant.price,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: perfume.reviews.length,
    },
  };

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-28 sm:pt-32 pb-24 overflow-hidden transition-colors duration-300">
      {/* JSON-LD Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BotanicalPattern opacity={0.04} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-display text-xs uppercase tracking-widest text-[#3A332D]/60 dark:text-[#DFCA9B]/70 mb-8">
          <Link href="/" className="hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] transition-colors">
            Maison
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] transition-colors">
            Collection
          </Link>
          <span>/</span>
          <span className="text-[#14110F] dark:text-[#FDFBF7] font-semibold">{perfume.name_en}</span>
        </div>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Sticky Gallery & Callout Dots (Douro Ref) */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 space-y-6">
            <div className="relative aspect-[4/5] w-full rounded-3xl bg-[#F1EADA] dark:bg-[#161210] border border-[#B08D57]/30 shadow-xl overflow-hidden flex items-center justify-center p-6 sm:p-10">
              <ArchFrame className="w-full h-full" bgColor="bg-[#FAF6ED] dark:bg-[#1C1613]">
                {/* Center Hero Bottle with gentle float & instant thumbnail update */}
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1, y: [-4, 6, -4] }}
                  transition={{
                    opacity: { duration: 0.35 },
                    scale: { duration: 0.35 },
                    y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <img
                    src={selectedImage}
                    alt={perfume.name_en}
                    className="max-h-[85%] max-w-[85%] object-contain filter drop-shadow-[0_22px_40px_rgba(20,17,15,0.25)] select-none transition-all duration-300"
                  />
                </motion.div>
              </ArchFrame>

              {/* FLOATING CALLOUT DOTS (Douro Valley / "me." reference) */}
              {/* Dot 1: Cap */}
              <CalloutDot
                topPercent={22}
                leftPercent={50}
                label="Carved Cap"
                detail="Hand-carved dark walnut cap bearing the classical Venus relief."
                lineDirection="right"
                lineWidth={70}
              />
              {/* Dot 2: Top Notes */}
              <CalloutDot
                topPercent={42}
                leftPercent={36}
                label="Extraction"
                detail={`Extrait concentration with pure ${perfume.top_notes_en[0]}.`}
                lineDirection="left"
                lineWidth={60}
              />
              {/* Dot 3: Wax Seal */}
              <CalloutDot
                topPercent={70}
                leftPercent={58}
                label="Wax Seal"
                detail="Genuine burgundy botanical wax seal stamped individually on each bottle."
                lineDirection="right"
                lineWidth={65}
              />
            </div>

            {/* Thumbnail Gallery Strip */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {[perfume.images.bottle, perfume.images.hero, perfume.images.box].map(
                (imgSrc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgSrc)}
                    className={`relative w-20 h-24 rounded-xl bg-[#F1EADA] dark:bg-[#161210] border-2 transition-all duration-300 overflow-hidden flex-shrink-0 cursor-pointer p-1 flex items-center justify-center ${
                      selectedImage === imgSrc
                        ? 'border-[#B08D57] shadow-lg scale-105'
                        : 'border-[#B08D57]/30 dark:border-[#B08D57]/40 hover:border-[#6B1D2F]'
                    }`}
                  >
                    <img
                      src={imgSrc}
                      alt={`${perfume.name_en} view ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                )
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Scrolling Details & Customizers           */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 space-y-8">
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="wax">{perfume.family_en}</Badge>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="p-2 rounded-full border border-[#B08D57]/30 text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] hover:border-[#6B1D2F] transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart
                      size={18}
                      className={isLiked ? 'fill-[#6B1D2F] text-[#6B1D2F]' : ''}
                    />
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: perfume.name_en,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="p-2 rounded-full border border-[#B08D57]/30 text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] hover:border-[#6B1D2F] transition-colors"
                    aria-label="Share"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Giant Serif Name with Ink Texture Background (Vandal Ref) */}
              <div className="relative py-2">
                <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7] leading-none">
                  {perfume.name_en}
                </h1>
                <p className="font-script text-xl sm:text-2xl text-[#8C6E3D] dark:text-[#DFCA9B] mt-2 italic">
                  {perfume.tagline_en}
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-3 pt-1">
                <StarRating rating={5} size={15} showCount count={perfume.reviews.length} />
                <span className="text-xs font-display text-[#8C6E3D] dark:text-[#DFCA9B]/80 uppercase tracking-wider">
                  Extrait Grade — 5.0 / 5.0
                </span>
              </div>
            </div>

            {/* Price Banner with Rolling Price Animation */}
            <div className="p-6 rounded-2xl bg-[#F1EADA] dark:bg-[#161210] border border-[#B08D57]/40 flex items-center justify-between shadow-2xs">
              <div>
                <span className="font-display text-xs uppercase tracking-widest text-[#3A332D]/70 dark:text-[#DFCA9B]/70 block">
                  Price ({selectedVariant.size_ml} ml)
                </span>
                <span className="font-display text-3xl font-bold text-[#14110F] dark:text-[#FDFBF7]">
                  <NumberRoll value={totalVariantPrice} />
                </span>
              </div>
              <WaxSeal size={42} />
            </div>

            {/* Size Selector with Bottle Silhouettes */}
            <SizeSelector
              sizes={perfume.variants}
              selectedId={selectedVariantId}
              onSelect={(id) => setSelectedVariantId(id)}
            />

            {/* Quantity Stepper & Add to Cart Primary Button */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#14110F]/30 dark:border-[#B08D57]/40 rounded-full px-4 py-3 bg-[#FBF8EE] dark:bg-[#161210]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] p-1"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="mx-4 font-display text-sm font-semibold text-[#14110F] dark:text-[#FDFBF7]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] p-1"
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Primary Add to Cart Black Pill CTA */}
                <button
                  id="main-add-to-cart-button"
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-4.5 px-8 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FBF8EE] font-display text-xs sm:text-sm uppercase tracking-widest3 flex items-center justify-center gap-3 transition-all duration-400 shadow-xl group border border-[#B08D57]/30"
                >
                  <ShoppingBag size={18} />
                  <span>
                    Add to Bag — <NumberRoll value={totalVariantPrice} />
                  </span>
                </button>
              </div>

              {/* Gift Presentation Box Option */}
              <GiftOption
                onToggle={(enabled, note) => setGiftBox({ enabled, note })}
              />
            </div>

            {/* Notes Pyramid (Top / Heart / Base) */}
            <NotesPyramid
              topNotes={perfume.top_notes_en}
              heartNotes={perfume.heart_notes_en}
              baseNotes={perfume.base_notes_en}
            />

            {/* Performance Meters (Longevity, Sillage, Intensity) */}
            <PerformanceMeter
              longevity={perfume.longevity}
              sillage={perfume.sillage}
              intensity={perfume.intensity}
            />

            {/* Editorial Accordions */}
            <div className="space-y-3 pt-4 border-t border-[#B08D57]/30">
              {accordions.map((item) => {
                const isOpen = activeAccordion === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#B08D57]/30 bg-[#F1EADA]/40 dark:bg-[#161210] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(isOpen ? null : item.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-display text-xs sm:text-sm uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]"
                    >
                      <span>{item.title}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#6B1D2F] dark:text-[#DFCA9B]' : 'text-[#3A332D]/60 dark:text-[#DFCA9B]/60'
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 sm:px-5 pb-5 font-body text-xs sm:text-sm text-[#3A332D] dark:text-[#FDFBF7]/85 leading-relaxed border-t border-[#B08D57]/20 pt-3"
                        >
                          {item.content}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Customer Reviews Section */}
            <div className="pt-8 border-t border-[#B08D57]/30 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
                    Customer Reviews
                  </h3>
                  <span className="font-body text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                    5.0 from {perfume.reviews?.length || 0} verified collectors
                  </span>
                </div>
                <WaxSeal size={32} />
              </div>

              {/* Existing Reviews */}
              <div className="space-y-4">
                {!perfume.reviews || perfume.reviews.length === 0 ? (
                  <p className="text-xs text-[#3A332D]/70 dark:text-[#DFCA9B]/70 italic py-4">
                    Be the first to share your olfactory impressions of this creation.
                  </p>
                ) : (
                  perfume.reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-[#F1EADA]/60 dark:bg-[#161210] border border-[#B08D57]/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xs font-semibold uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                          {r.name}
                        </span>
                        <StarRating rating={r.rating} size={12} />
                      </div>
                      <p className="font-body text-xs sm:text-sm text-[#3A332D] dark:text-[#FDFBF7]/90 leading-relaxed italic">
                        “{r.body_ar || r.body_en}”
                      </p>
                      <span className="font-body text-[10px] text-[#3A332D]/50 dark:text-[#DFCA9B]/50 block">
                        {r.date}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Submit Review Form */}
              <div className="p-6 rounded-2xl bg-[#F1EADA] dark:bg-[#161210] border border-[#B08D57]/40 space-y-4">
                <h4 className="font-display text-xs uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
                  Write an Atelier Review
                </h4>

                {reviewSubmitted ? (
                  <div className="p-4 rounded-xl bg-[#B08D57]/20 border border-[#B08D57] text-xs font-display text-[#14110F] dark:text-[#DFCA9B] flex items-center gap-2">
                    <Check size={16} className="text-[#6B1D2F] dark:text-[#DFCA9B]" />
                    <span>Your correspondence has been received and added to the maison archive.</span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display text-[#3A332D] dark:text-[#DFCA9B]">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={`p-1 cursor-pointer text-sm ${
                              star <= reviewRating ? 'text-[#B08D57]' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        required
                        className="w-full p-3 rounded-xl bg-[#FBF8EE] dark:bg-[#1C1613] border border-[#B08D57]/30 text-xs font-body text-[#14110F] dark:text-[#FDFBF7] focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={3}
                        placeholder="Share your olfactory impressions of this Extrait..."
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        required
                        className="w-full p-3 rounded-xl bg-[#FBF8EE] dark:bg-[#1C1613] border border-[#B08D57]/30 text-xs font-body text-[#14110F] dark:text-[#FDFBF7] focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FBF8EE] font-display text-xs uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Complete the Collection Section (Other 3 Perfumes) */}
        <div className="mt-28 pt-16 border-t border-[#B08D57]/30 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="font-display text-xs tracking-widest3 uppercase text-[#B08D57]">
              Harmonize Your Scent Wardrobe
            </span>
            <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
              Complete The Collection
            </h2>
            <p className="font-script text-base text-[#8C6E3D] dark:text-[#DFCA9B] italic">
              The other three signature Extraits de Parfum
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherPerfumes.map((other) => (
              <ProductCard key={other.id} perfume={other} />
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR (Triggered after scrolling past CTA) */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 inset-x-0 z-50 p-4 bg-[#FBF8EE]/95 dark:bg-[#14110F]/95 backdrop-blur-md border-t border-[#B08D57]/30 shadow-2xl lg:hidden flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] font-bold truncate max-w-[140px]">
                {perfume.name_en}
              </p>
              <p className="font-body text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]">
                {selectedVariant.size_ml} ml — <NumberRoll value={totalVariantPrice} />
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              className="py-3 px-6 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FBF8EE] font-display text-xs uppercase tracking-widest flex items-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span>Add to Bag</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

