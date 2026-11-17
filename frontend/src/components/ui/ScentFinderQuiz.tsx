'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, ArrowLeft, Check, Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CANONICAL_PERFUMES, PerfumeData } from '@/lib/catalog';
import { Price } from '@/components/ui/Price';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

export const ScentFinderQuiz: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<PerfumeData | null>(null);
  const pathname = usePathname();
  const isArabic = pathname ? pathname.startsWith('/ar') : false;
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();

  const resetQuiz = () => {
    setStep(1);
    setSelectedWorld(null);
    setSelectedMoment(null);
    setRecommendation(null);
  };

  const handleOpen = () => {
    resetQuiz();
    setIsOpen(true);
  };

  const calculateResult = (world: string, moment: string) => {
    let slug = 'la-fleur-du-nil';
    if (world === 'oud' || moment === 'night') {
      slug = 'al-oud-al-aswad';
    } else if (world === 'amber') {
      slug = 'ambre-dalexandrie';
    } else if (world === 'woody') {
      slug = 'bois-de-louxor';
    } else if (world === 'floral') {
      slug = 'la-fleur-du-nil';
    }
    const found = CANONICAL_PERFUMES.find((p) => p.slug === slug) || CANONICAL_PERFUMES[0];
    setRecommendation(found);
    setStep(3);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#B08D57]/60 bg-[#161210]/60 dark:bg-[#161210]/80 backdrop-blur-md text-[#FDFBF7] text-xs font-display uppercase tracking-[0.2em] hover:bg-[#6B1D2F] hover:border-[#DFCA9B] transition-all duration-300 shadow-lg cursor-pointer group"
      >
        <Compass size={14} className="text-[#B08D57] group-hover:text-[#FDFBF7] transition-colors animate-spin-slow" />
        <span>{isArabic ? 'مستشار العطور — اكتشف بصمتك' : 'Scent Finder — Discover Your Aura'}</span>
      </button>

      {/* Luxury Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#0D0A08]/85 backdrop-blur-xl"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl rounded-2xl border border-[#B08D57]/30 bg-[#FDFBF7] dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden z-10"
            >
              {/* Top Accent Line */}
              <div className="h-1 w-full bg-gradient-to-r from-[#B08D57]/0 via-[#B08D57] to-[#6B1D2F]" />

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#B08D57]/15">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-[#B08D57]/40 flex items-center justify-center text-[#B08D57] bg-[#B08D57]/10">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg uppercase tracking-widest text-[#B08D57]">
                      {isArabic ? 'مستشار الدار العطري' : 'Atelier Fragrance Advisor'}
                    </h2>
                    <p className="text-xs text-[#14110F]/60 dark:text-[#FDFBF7]/60">
                      {isArabic ? `الخطوة ${step} من ٣` : `Step ${step} of 3`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-[#B08D57]/10 text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#B08D57] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content Area */}
              <div className="p-6 sm:p-8">
                {/* STEP 1: Olfactory World */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="font-serif text-2xl sm:text-3xl text-center mb-2">
                      {isArabic ? 'ما هو الطابع العطري الذي يأسر حواسك؟' : 'Which olfactory atmosphere calls to you?'}
                    </h3>
                    <p className="text-xs sm:text-sm text-center text-[#14110F]/60 dark:text-[#FDFBF7]/60 mb-6">
                      {isArabic ? 'اختر النوتة أو الطابع الذي يعبر عن حضورك الطبيعي' : 'Select the note profile that resonates with your true essence'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        {
                          id: 'floral',
                          title_ar: 'أزهار نيلية مشرقة ونقية',
                          title_en: 'Luminous Nile Florals',
                          desc_ar: 'ياسمين السامباك، زهر البرتقال، والفاوانيا البيضاء',
                          desc_en: 'Sambac jasmine, white peony, neroli',
                        },
                        {
                          id: 'amber',
                          title_ar: 'عنبر حسي دافئ وفانيليا',
                          title_en: 'Solar Warm Amber & Vanilla',
                          desc_ar: 'عنبر الإسكندرية، فانيليا بوربون، وبنزوين',
                          desc_en: 'Alexandrian ambergris, Bourbon vanilla, benzoin',
                        },
                        {
                          id: 'woody',
                          title_ar: 'أخشاب الأرز وبردي هادئ',
                          title_en: 'Noble Cedar & Green Papyrus',
                          desc_ar: 'أرز أطلس، نبات البردي، ولبان ملكي',
                          desc_en: 'Atlas cedar, green papyrus, frankincense',
                        },
                        {
                          id: 'oud',
                          title_ar: 'عود عتيق وجلود فاخرة',
                          title_en: 'Aged Wild Oud & Fine Leather',
                          desc_ar: 'عود كمبودي بري، زعفران فارسي، ومر',
                          desc_en: 'Cambodian wild oud, saffron, noble resins',
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedWorld(item.id);
                            setStep(2);
                          }}
                          className={`p-4 rounded-xl text-left border transition-all duration-300 cursor-pointer ${
                            selectedWorld === item.id
                              ? 'border-[#B08D57] bg-[#B08D57]/15 shadow-md'
                              : 'border-[#B08D57]/20 hover:border-[#B08D57]/60 bg-[#FDFBF7]/40 dark:bg-[#1A1512]/60 hover:bg-[#B08D57]/5'
                          }`}
                        >
                          <p className="font-serif text-base text-[#14110F] dark:text-[#FDFBF7] font-semibold mb-1">
                            {isArabic ? item.title_ar : item.title_en}
                          </p>
                          <p className="text-xs text-[#14110F]/65 dark:text-[#FDFBF7]/65">
                            {isArabic ? item.desc_ar : item.desc_en}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Occasion */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="font-serif text-2xl sm:text-3xl text-center mb-2">
                      {isArabic ? 'متى تفضل ارتداء عطرك الخاص؟' : 'When is your signature perfume worn?'}
                    </h3>
                    <p className="text-xs sm:text-sm text-center text-[#14110F]/60 dark:text-[#FDFBF7]/60 mb-6">
                      {isArabic ? 'سياق الحضور يساعدنا على ضبط الكثافة والتركيز المثالي' : 'The moment defines the required sillage and texture'}
                    </p>

                    <div className="grid grid-cols-1 gap-3.5 mb-6">
                      {[
                        {
                          id: 'daily',
                          title_ar: 'إشراقة يومية وأناقة مستمرة طوال النهار',
                          title_en: 'Daily Signature & Daytime Distinction',
                          desc_ar: 'حضور ناعم، مريح، وعالي الثبات يدوم معك',
                          desc_en: 'Refined, effortless, enduring presence',
                        },
                        {
                          id: 'night',
                          title_ar: 'أمسيات كبرى ومناسبات ذات طابع مهيب',
                          title_en: 'Sovereign Evenings & Grand Occasions',
                          desc_ar: 'فوحان قوي، فخم، ويترك بصمة لا تنسى في المكان',
                          desc_en: 'Commanding sillage, magnetic depth, royal aura',
                        },
                        {
                          id: 'intimate',
                          title_ar: 'تأمل شخصي، لقاءات خاصة وأوقات هادئة',
                          title_en: 'Intimate Moments & Contemplative Solitude',
                          desc_ar: 'رائحة قريبة من الجلد، دافئة وحسية',
                          desc_en: 'Skin-close warmth, velvet comfort',
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedMoment(item.id);
                            calculateResult(selectedWorld || 'floral', item.id);
                          }}
                          className="p-4 rounded-xl text-left border border-[#B08D57]/20 hover:border-[#B08D57] bg-[#FDFBF7]/40 dark:bg-[#1A1512]/60 hover:bg-[#B08D57]/10 transition-all duration-300 cursor-pointer flex items-center justify-between group"
                        >
                          <div>
                            <p className="font-serif text-base text-[#14110F] dark:text-[#FDFBF7] font-semibold mb-0.5">
                              {isArabic ? item.title_ar : item.title_en}
                            </p>
                            <p className="text-xs text-[#14110F]/65 dark:text-[#FDFBF7]/65">
                              {isArabic ? item.desc_ar : item.desc_en}
                            </p>
                          </div>
                          <ArrowRight size={18} className="text-[#B08D57] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setStep(1)}
                      className="text-xs uppercase tracking-widest text-[#B08D57] flex items-center gap-1.5 hover:underline cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>{isArabic ? 'العودة للخطوة السابقة' : 'Back to previous step'}</span>
                    </button>
                  </motion.div>
                )}

                {/* STEP 3: Recommendation Result */}
                {step === 3 && recommendation && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="text-center mb-6">
                      <span className="inline-block px-3 py-1 rounded-full border border-[#B08D57]/40 bg-[#B08D57]/10 text-[#B08D57] text-[11px] font-display uppercase tracking-[0.25em] mb-2">
                        {isArabic ? 'بصمتك العطرية المختارة' : 'Your Olfactory Signature'}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl text-[#14110F] dark:text-[#FDFBF7]">
                        {isArabic ? recommendation.name_ar : recommendation.name_en}
                      </h3>
                      <p className="text-xs text-[#B08D57] italic font-serif mt-1">
                        {recommendation.concentration}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-[#B08D57]/20 bg-[#FDFBF7]/50 dark:bg-[#1A1512]/60 mb-6">
                      <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg overflow-hidden shrink-0 border border-[#B08D57]/30 bg-black/5">
                        <img
                          src={recommendation.images.bottle}
                          alt={recommendation.name_en}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-[#14110F]/80 dark:text-[#FDFBF7]/80 line-clamp-3 mb-3">
                          {isArabic ? recommendation.story_ar : recommendation.story_en}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-4">
                          <Price amount={recommendation.variants[0].price} className="font-serif text-lg font-semibold text-[#B08D57]" />
                          <span className="text-xs opacity-60">({recommendation.variants[0].size_ml} ml)</span>
                        </div>
                      </div>
                    </div>

                    {/* Privilege Voucher Banner */}
                    <div className="p-3.5 rounded-lg border border-[#B08D57]/40 bg-[#6B1D2F]/10 dark:bg-[#6B1D2F]/20 text-center mb-6">
                      <p className="text-xs text-[#B08D57] font-semibold tracking-wider">
                        {isArabic
                          ? 'هدية الدار: استخدم كود MAISON10 عند إتمام الطلب للحصول على خصم ١٠٪'
                          : 'Courtesy Privilege: Apply code MAISON10 at checkout for 10% complimentary discount'}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          const variant = recommendation.variants[0];
                          const productPayload: any = {
                            id: recommendation.id,
                            slug: recommendation.slug,
                            name_en: recommendation.name_en,
                            name_ar: recommendation.name_ar,
                            tagline_en: recommendation.tagline_en,
                            tagline_ar: recommendation.tagline_ar,
                            images: [
                              {
                                id: 1,
                                product_id: recommendation.id,
                                url: recommendation.images.bottle,
                                alt_en: recommendation.name_en,
                                alt_ar: recommendation.name_ar,
                                sort_order: 1,
                              },
                            ],
                            variants: recommendation.variants,
                          };
                          addItem(productPayload, variant, 1);
                          setIsOpen(false);
                          openCart();
                        }}
                        className="flex-1 py-3 px-6 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] text-[#FDFBF7] text-xs font-display uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                      >
                        {isArabic ? 'إضافة إلى حقيبة المقتنيات' : 'Add to Shopping Bag'}
                      </button>

                      <Link
                        href={isArabic ? `/ar/product/${recommendation.slug}` : `/product/${recommendation.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="py-3 px-6 rounded-full border border-[#B08D57] hover:bg-[#B08D57]/15 text-[#14110F] dark:text-[#FDFBF7] text-xs font-display uppercase tracking-widest text-center transition-all"
                      >
                        {isArabic ? 'استكشاف تفاصيل القارورة' : 'Discover Creation'}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

