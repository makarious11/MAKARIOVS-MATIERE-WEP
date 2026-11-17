'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Heart, ArrowUpRight } from 'lucide-react';
import { ArchFrame } from '@/components/ui/ArchFrame';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { NumberRoll } from '@/components/ui/NumberRoll';
import { Price } from '@/components/ui/Price';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import type { PerfumeData } from '@/lib/catalog';

interface ProductCardProps {
  perfume: PerfumeData;
  isArabic?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ perfume, isArabic = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();

  const defaultVariant = perfume.variants.find((v) => v.is_default) || perfume.variants[0];
  const lowestPrice = Math.min(...perfume.variants.map((v) => v.price));

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productPayload: any = {
      id: perfume.id,
      slug: perfume.slug,
      name_en: perfume.name_en,
      name_ar: perfume.name_ar,
      tagline_en: perfume.tagline_en,
      tagline_ar: perfume.tagline_ar,
      images: [{ id: 1, product_id: perfume.id, url: perfume.images.bottle, alt_en: perfume.name_en, alt_ar: perfume.name_ar, sort_order: 1 }],
      variants: perfume.variants,
    };
    addItem(productPayload, defaultVariant, 1);
    openCart();
  };

  const productUrl = isArabic ? `/ar/product/${perfume.slug}` : `/product/${perfume.slug}`;

  return (
    <div
      data-cursor="product"
      data-product="true"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="product-card group relative flex flex-col ios-glass-card rounded-3xl p-5 sm:p-7 transition-all duration-500 hover:shadow-[0_22px_55px_rgba(20,17,15,0.14)] border border-white/60 dark:border-white/10 dark:bg-[#161210]"
    >
      {/* Top badges: Family + Wishlist */}
      <div className="flex items-center justify-between w-full mb-3 z-20">
        <Badge variant="wax">
          {isArabic ? perfume.family_ar : perfume.family_en}
        </Badge>
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className="p-1.5 rounded-full text-[#3A332D]/40 dark:text-[#DFCA9B]/50 hover:text-[#6B1D2F] transition-colors cursor-pointer"
          aria-label="Save to wishlist"
        >
          <Heart size={18} className={isLiked ? 'fill-[#6B1D2F] text-[#6B1D2F]' : ''} />
        </button>
      </div>

      {/* Main Image in Arch Frame */}
      <Link href={productUrl} className="relative block w-full aspect-[4/5] my-2 overflow-hidden">
        <ArchFrame className="w-full h-full" bgColor="bg-[#F1EADA] dark:bg-[#1C1613]">
          {/* Bottle with hover lift animation */}
          <motion.div
            animate={{ y: isHovered ? -10 : 0, scale: isHovered ? 1.04 : 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full flex items-center justify-center rounded-t-[120px] overflow-hidden"
          >
            <Image
              src={perfume.images.bottle}
              alt={isArabic ? perfume.name_ar : perfume.name_en}
              fill
              className="object-cover transition-all duration-600 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 35vw"
            />
          </motion.div>
        </ArchFrame>

        {/* Floating rotating Venus wax seal in corner on hover */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.6, rotate: isHovered ? 0 : -30 }}
          transition={{ duration: 0.35 }}
          className="absolute bottom-3 right-3 z-20 pointer-events-none"
        >
          <WaxSeal size={38} />
        </motion.div>
      </Link>

      {/* Product Details */}
      <div className="mt-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-2 mb-1.5">
            <StarRating rating={5} size={12} />
            <span className="font-body text-[11px] text-[#8C6E3D]">
              5.0 ({perfume.reviews?.length || 5})
            </span>
          </div>

          {/* Name & Tagline */}
          <Link href={productUrl} className="group-hover:text-[#6B1D2F] dark:group-hover:text-[#DFCA9B] transition-colors">
            <h3 className="font-display uppercase text-lg sm:text-xl md:text-2xl tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
              {isArabic ? perfume.name_ar : perfume.name_en}
            </h3>
          </Link>
          <p className="font-script text-xs sm:text-sm text-[#8C6E3D] dark:text-[#DFCA9B] mt-0.5 italic">
            {isArabic ? perfume.tagline_ar : perfume.tagline_en}
          </p>

          {/* Key Notes */}
          <p className="font-display text-[10px] uppercase tracking-widest text-[#3A332D]/75 dark:text-[#FDFBF7]/70 mt-2 line-clamp-1">
            {(isArabic ? perfume.top_notes_ar : perfume.top_notes_en).slice(0, 3).join(' · ')}
          </p>
        </div>

        {/* Bottom row: Price from + Quick Add Button */}
        <div className="pt-3 border-t border-[#B08D57]/20 flex items-center justify-between">
          <div>
            <span className="font-body text-[10px] text-[#3A332D]/60 dark:text-[#FDFBF7]/60 uppercase tracking-wider block">
              {isArabic ? 'يبدأ من' : 'From'}
            </span>
            <div className="font-display text-base font-semibold text-[#14110F] dark:text-[#FDFBF7]">
              <Price amount={lowestPrice} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAdd}
              className="p-2.5 rounded-full bg-[#14110F] dark:bg-[#1E1815] text-[#FDFBF7] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] border border-[#B08D57]/30 hover:shadow-md transition-colors cursor-pointer"
              aria-label="Quick Add to Bag"
            >
              <Plus size={16} />
            </button>
            <Link
              href={productUrl}
              className="hidden sm:inline-flex p-2.5 rounded-full border border-[#14110F]/20 dark:border-[#B08D57]/30 text-[#14110F] dark:text-[#FDFBF7] hover:border-[#6B1D2F] hover:text-[#6B1D2F] transition-colors cursor-pointer"
              aria-label="View Product"
            >
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
