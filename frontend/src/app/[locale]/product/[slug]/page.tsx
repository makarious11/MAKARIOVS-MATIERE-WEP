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
  Bell,
} from 'lucide-react';
import { getPerfumeBySlug, getOtherPerfumes, PERFUMES, PerfumeData, addProductReview, saveProductToCatalog } from '@/lib/catalog';
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
import { WaitingListModal } from '@/components/product/WaitingListModal';
import { Price } from '@/components/ui/Price';

interface ProductPageProps {
  params: Promise<{ slug: string; locale?: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const isArabic = resolvedParams.locale === 'ar';

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

    // Fetch live product data & reviews from server database
    fetch(`/api/v1/products/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setPerfume(json.data);
          if (json.data.images?.bottle) setSelectedImage(json.data.images.bottle);
        }
      })
      .catch(() => {});

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
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

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

      // 2. Persist to server database so admin and all website visitors see it immediately
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
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.product) {
            setPerfume(data.product);
            saveProductToCatalog(data.product);
          }
        })
        .catch(() => {});

      setReviewSubmitted(true);
      setReviewName('');
      setReviewBody('');
      setTimeout(() => {
        setReviewSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewSubmitted(true);
    }
  };

  const accordions = [
    {
      id: 'story',
      title: isArabic ? 'حكاية العطر الخيميائية' : 'The Alchemical Story',
      content: isArabic ? perfume.story_ar : perfume.story_en,
    },
    {
      id: 'wear',
      title: isArabic ? 'طقوس الاستخدام والارتداء' : 'How to Wear & Ritual',
      content: isArabic
        ? 'بفضل تركيز خلاصة العطر (Extrait de Parfum)، تكفي لمسة واحدة أو اثنتان فقط على مواضع النبض: خلف العنق، معصم اليد، وفوق الترقوة. يندمج العطر بشكل فريد مع حرارة بشرتك الطبيعية ليترك أثراً ملكياً يدوم أياماً.'
        : 'Extrait de Parfum requires only one to two measured applications upon high-pulse sanctuaries: the nape of the neck, wrist hollows, and collarbone hollows. For an unforgettable aura, mist lightly onto silk scarves or cashmere linings. Macerates uniquely with your natural skin warmth.',
    },
    {
      id: 'ingredients',
      title: isArabic ? 'المكونات النبيلة والنقاء' : 'Noble Ingredients & Extraction',
      content: isArabic
        ? 'زيوت عطرية نقية بتركيز ٣٢٪ إلى ٣٨٪، كحول عضوي خاص بالعطور، ومستخلصات زهرية وبحرية وصموغ طبيعية عتيقة. خالٍ تماماً من البارابين والمواد الكيميائية الضارة.'
        : '32%–38% pure perfume oils, organic perfumers alcohol, cold-pressed botanical essences, and sustainably aged natural resins. Free of parabens, phthalates, synthetic colorants, or animal cruelty. Hand-bottled and sealed in our Le Caire / Paris ateliers.',
    },
    {
      id: 'shipping',
      title: isArabic ? 'الشحن والتوصيل والاسترجاع' : 'Shipping, Delivery & Returns',
      content: isArabic
        ? 'توصيل فاخر لجميع محافظات مصر خلال ١ إلى ٣ أيام عمل عبر شحن مبرد ومحكم. يتضمن كل طلب عينة استكشافية مجانية سعة ٢ مل من مستخلص آخر.'
        : 'Hand-delivered across Egypt within 1–3 business days via temperature-controlled courier. Each order includes a complimentary 2ml discovery vial of another Extrait. Returnable within 14 days in unopened, wax-sealed packaging.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-28 sm:pt-36 pb-24 overflow-hidden transition-colors duration-300">
      <BotanicalPattern opacity={0.04} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-display text-xs uppercase tracking-widest text-[#3A332D]/60 dark:text-[#DFCA9B]/70 mb-10">
          <Link href={isArabic ? '/ar' : '/'} className="hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] transition-colors">
            {isArabic ? 'الرئيسية' : 'Maison'}
          </Link>
          <span>/</span>
          <Link href={isArabic ? '/ar/shop' : '/shop'} className="hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] transition-colors">
            {isArabic ? 'المجموعة' : 'Collection'}
          </Link>
          <span>/</span>
          <span className="text-[#14110F] dark:text-[#FDFBF7] font-semibold">
            {isArabic ? perfume.name_ar : perfume.name_en}
          </span>
        </div>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Sticky Gallery & Callout Dots               */}
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
                    alt={isArabic ? perfume.name_ar : perfume.name_en}
                    className="max-h-[85%] max-w-[85%] object-contain filter drop-shadow-[0_22px_40px_rgba(20,17,15,0.25)] select-none transition-all duration-300"
                  />
                </motion.div>
              </ArchFrame>

              {/* FLOATING CALLOUT DOTS */}
              <CalloutDot
                topPercent={20}
                leftPercent={50}
                label={isArabic ? 'غطاء الجوز المنحوت' : 'Carved Cap'}
                detail={isArabic ? perfume.callout_cap.ar : perfume.callout_cap.en}
                lineDirection="right"
                lineWidth={70}
              />
              <CalloutDot
                topPercent={42}
                leftPercent={36}
                label={isArabic ? 'القمة العطرية' : 'Extraction'}
                detail={isArabic ? perfume.callout_top.ar : perfume.callout_top.en}
                lineDirection="left"
                lineWidth={60}
              />
              <CalloutDot
                topPercent={70}
                leftPercent={58}
                label={isArabic ? 'ختم فينوس البرغندي' : 'Venus Seal'}
                detail={isArabic ? perfume.callout_seal.ar : perfume.callout_seal.en}
                lineDirection="right"
                lineWidth={65}
              />
            </div>

            {/* Thumbnail switcher */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {[
                { url: perfume.images.bottle, label: isArabic ? 'القارورة' : 'Bottle' },
                { url: perfume.images.hero, label: isArabic ? 'الصورة الكلية' : 'Editorial' },
                { url: perfume.images.box, label: isArabic ? 'الصندوق' : 'Coffret' },
                { url: perfume.images.texture, label: isArabic ? 'الهوية' : 'Identity' },
              ].map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative h-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer bg-white/50 dark:bg-[#161210] p-1 flex items-center justify-center group ${
                    selectedImage === img.url
                      ? 'border-[#B08D57] shadow-lg ring-2 ring-[#B08D57]/40 scale-105'
                      : 'border-[#B08D57]/25 dark:border-[#B08D57]/30 opacity-70 hover:opacity-100 hover:border-[#B08D57]/60'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 inset-x-0 text-[9px] font-display uppercase tracking-wider text-center bg-black/70 text-[#FDFBF7] py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Scrolling Information & Actions             */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3 border-b border-[#B08D57]/20 pb-6">
              <div className="flex items-center justify-between">
                <Badge variant="gold">{isArabic ? perfume.family_ar : perfume.family_en}</Badge>
                <div className="flex items-center gap-2">
                  <StarRating rating={5} count={perfume.reviews?.length || 0} />
                  <button
                    type="button"
                    onClick={() => setIsLiked(!isLiked)}
                    className="p-2 rounded-full hover:bg-[#F1EADA] dark:hover:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] transition-colors cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <Heart size={18} className={isLiked ? 'fill-[#6B1D2F] text-[#6B1D2F]' : ''} />
                  </button>
                </div>
              </div>

              <h1
                className="text-4xl sm:text-5xl uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] font-light leading-tight"
                style={{ fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif" }}
              >
                {isArabic ? perfume.name_ar : perfume.name_en}
              </h1>

              <p
                className="text-xl sm:text-2xl text-[#8C6E3D] dark:text-[#DFCA9B] italic"
                style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
              >
                {isArabic ? perfume.tagline_ar : perfume.tagline_en}
              </p>

              <div className="flex items-baseline gap-3 pt-3">
                <Price
                  amount={totalVariantPrice}
                  className="font-display text-4xl sm:text-5xl font-light text-[#14110F] dark:text-[#FDFBF7]"
                />
                {selectedVariant.compare_at_price && (
                  <span className="text-sm line-through text-[#3A332D]/40 dark:text-[#FDFBF7]/40 font-mono">
                    <Price amount={selectedVariant.compare_at_price} />
                  </span>
                )}
              </div>
            </div>

            {/* SIZE SELECTOR WITH BOTTLE SILHOUETTES */}
            <div className="space-y-3">
              <span className="font-display text-xs tracking-widest uppercase text-[#14110F] dark:text-[#FDFBF7]">
                {isArabic ? 'الحجم والتركيز' : 'Select Volume'}
              </span>
              <SizeSelector
                variants={perfume.variants}
                selectedVariantId={selectedVariantId}
                onSelect={(id) => {
                  setSelectedVariantId(id);
                  setSelectedImage(perfume.images.bottle);
                }}
                isArabic={isArabic}
              />
            </div>

            {/* QUANTITY & PRIMARY ADD TO CART CTA */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Stepper */}
                <div className="flex items-center border border-[#14110F]/20 dark:border-[#B08D57]/30 rounded-full px-4 py-2.5 bg-[#F1EADA]/50 dark:bg-[#161210]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#B08D57] p-1 cursor-pointer"
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="mx-4 font-display text-sm font-semibold min-w-[20px] text-center text-[#14110F] dark:text-[#FDFBF7]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#B08D57] p-1 cursor-pointer"
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Primary CTA Button or Waitlist */}
                {selectedVariant.stock === 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsWaitlistOpen(true)}
                    className="flex-1 py-4 px-6 rounded-full bg-[#8A1D2E] hover:bg-[#6B1D2F] text-[#FDFBF7] font-display text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl border border-[#B08D57]/60 cursor-pointer"
                  >
                    <Bell size={16} />
                    <span>{isArabic ? 'حجز أولوية — الدفعة القادمة' : 'Sold Out — Join Private Waitlist'}</span>
                  </button>
                ) : (
                  <button
                    id="main-add-to-cart-button"
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-4 px-8 rounded-full bg-[#14110F] dark:bg-[#1C1613] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-[0.25em] transition-all duration-400 flex items-center justify-center gap-3 shadow-xl border border-[#B08D57]/40 cursor-pointer group hover:scale-[1.02]"
                  >
                    <ShoppingBag size={16} />
                    <span>
                      {isArabic ? 'أضف للحقيبة — ' : 'Acquire Extrait — '}
                      <Price amount={totalVariantPrice} />
                    </span>
                  </button>
                )}
              </div>

              {/* Free delivery badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-[#8C6E3D] pt-1 font-sans">
                <Check size={14} className="text-[#6B1D2F]" />
                <span>
                  {isArabic
                    ? 'شحن مجاني ومؤمن لجميع المحافظات عند الطلب بمبلغ ٢٥٠٠ ج.م فأكثر'
                    : 'Complimentary white-glove delivery across Egypt on orders above 2,500 EGP'}
                </span>
              </div>
            </div>

            {/* GIFT OPTION (Wax-sealed coffret & handwritten note) */}
            <GiftOption
              enabled={giftBox.enabled}
              note={giftBox.note}
              onChange={(enabled, note) => setGiftBox({ enabled, note })}
              isArabic={isArabic}
            />

            {/* INTERACTIVE 3-TIER NOTES PYRAMID */}
            <div className="pt-4 border-t border-[#B08D57]/20">
              <NotesPyramid
                topNotes={isArabic ? perfume.top_notes_ar : perfume.top_notes_en}
                heartNotes={isArabic ? perfume.heart_notes_ar : perfume.heart_notes_en}
                baseNotes={isArabic ? perfume.base_notes_ar : perfume.base_notes_en}
                isArabic={isArabic}
              />
            </div>

            {/* PERFORMANCE METERS (Longevity / Sillage) */}
            <div className="pt-4 border-t border-[#B08D57]/20">
              <PerformanceMeter
                longevity={perfume.longevity}
                sillage={perfume.sillage}
                intensity={perfume.intensity}
                isArabic={isArabic}
              />
            </div>

            {/* ACCORDIONS (Story, Ritual, Ingredients, Shipping) */}
            <div className="pt-4 border-t border-[#B08D57]/20 divide-y divide-[#B08D57]/20">
              {accordions.map((acc) => (
                <div key={acc.id} className="py-4">
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === acc.id ? null : acc.id)}
                    className="w-full flex items-center justify-between text-left sm:text-right font-display text-sm uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] transition-colors cursor-pointer"
                  >
                    <span>{acc.title}</span>
                    <ChevronDown
                      size={16}
                      className={`text-[#B08D57] transition-transform duration-300 ${
                        activeAccordion === acc.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === acc.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pt-3 text-sm text-[#3A332D]/85 dark:text-[#FDFBF7]/80 leading-relaxed"
                        style={{ fontFamily: isArabic ? "'Amiri', serif" : 'var(--font-body)' }}
                      >
                        <p>{acc.content}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* CUSTOMER REVIEWS & FORM */}
            <div className="pt-8 border-t border-[#B08D57]/20 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? 'آراء نخبة العملاء' : 'Patron Reviews'}
                </h3>
                <span className="font-display text-xs text-[#B08D57]">
                  {perfume.reviews?.length || 0} {isArabic ? 'تقييمات موثقة' : 'Verified Impressions'}
                </span>
              </div>

              {/* Existing Reviews List */}
              <div className="space-y-4">
                {(!perfume.reviews || perfume.reviews.length === 0) ? (
                  <p className="p-6 rounded-2xl bg-[#F1EADA]/40 dark:bg-[#161210] border border-[#B08D57]/20 text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/70 text-center">
                    {isArabic ? 'كن أول من يكتب انطباعه العطري عن هذا الإبداع' : 'Be the first to record an olfactory impression for this creation.'}
                  </p>
                ) : (
                  perfume.reviews.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xs uppercase tracking-wider font-semibold text-[#14110F] dark:text-[#FDFBF7]">
                          {r.name}
                        </span>
                        <StarRating rating={r.rating} />
                      </div>
                      <p
                        className="text-sm text-[#3A332D] dark:text-[#FDFBF7]/90 italic"
                        style={{ fontFamily: isArabic ? "'Amiri', serif" : "'EB Garamond', Georgia, serif" }}
                      >
                        “{isArabic ? r.body_ar || r.body_en : r.body_en || r.body_ar}”
                      </p>
                      <span className="text-[10px] text-[#3A332D]/50 dark:text-[#DFCA9B]/50 font-mono block">{r.date}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Leave a review form */}
              <div className="p-6 rounded-2xl bg-[#F1EADA]/80 dark:bg-[#161210] border border-[#B08D57]/30 space-y-4">
                <h4 className="font-display text-sm uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? 'أضف انطباعك العطري' : 'Record Your Olfactory Impression'}
                </h4>

                {reviewSubmitted ? (
                  <div className="p-4 rounded-xl bg-[#B08D57]/15 text-[#6B1D2F] dark:text-[#DFCA9B] text-xs font-display tracking-wider">
                    {isArabic
                      ? 'نشكرك على تقييمك النبيل. سيظهر تقييمك بعد المراجعة.'
                      : 'Thank you for your refined review. It has been recorded into the maison archive.'}
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display text-[#3A332D] dark:text-[#DFCA9B]">
                        {isArabic ? 'التقييم:' : 'Rating:'}
                      </span>
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

                    <input
                      type="text"
                      required
                      placeholder={isArabic ? 'اسمك الكريم' : 'Your name'}
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] border border-[#B08D57]/30 text-[#14110F] dark:text-[#FDFBF7] focus:outline-none focus:border-[#B08D57]"
                    />

                    <textarea
                      required
                      rows={3}
                      placeholder={isArabic ? 'صف أثر العطر ونفحاته على بشرتك...' : 'Describe the longevity, notes, and sillage...'}
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] border border-[#B08D57]/30 text-[#14110F] dark:text-[#FDFBF7] focus:outline-none focus:border-[#B08D57]"
                    />

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      {isArabic ? 'إرسال التقييم' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PERFUMES STRIP */}
        <div className="mt-28 pt-16 border-t border-[#B08D57]/20">
          <div className="text-center mb-12">
            <span className="font-display text-xs tracking-[0.3em] uppercase text-[#B08D57] block mb-2">
              {isArabic ? 'استكشف بقية المجموعة' : 'Complete The Collection'}
            </span>
            <h2
              className="text-3xl sm:text-4xl uppercase text-[#14110F] dark:text-[#FDFBF7]"
              style={{ fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif" }}
            >
              {isArabic ? 'مستخلصات عطرية مكملة' : 'Companion Extraits'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherPerfumes.slice(0, 3).map((p) => (
              <ProductCard key={p.id} perfume={p} isArabic={isArabic} />
            ))}
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR FOR MOBILE */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 inset-x-0 z-40 lg:hidden p-4 ios-glass dark:ios-glass-dark bg-[#FDFBF7]/90 dark:bg-[#14110F]/90 text-[#14110F] dark:text-[#FDFBF7] border-t border-[#B08D57]/30 shadow-2xl flex items-center justify-between gap-4"
          >
            <div>
              <span className="font-display text-xs uppercase tracking-wider block text-[#14110F] dark:text-[#FDFBF7] truncate max-w-[140px]">
                {isArabic ? perfume.name_ar : perfume.name_en}
              </span>
              <span className="font-display text-sm font-semibold text-[#6B1D2F] dark:text-[#DFCA9B]">
                {(totalVariantPrice).toLocaleString()} EGP
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3 px-5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span>{isArabic ? 'أضف للحقيبة' : 'Add to Bag'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIP Waitlist Modal */}
      <WaitingListModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        product={perfume}
        variant={selectedVariant}
      />
    </div>
  );
}
