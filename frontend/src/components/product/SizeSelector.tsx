'use client';

import React from 'react';
import { Price } from '@/components/ui/Price';

interface VariantItem {
  id: number;
  size_ml: number;
  price: number;
  stock?: number;
  name_ar?: string;
  name_en?: string;
}

interface SizeSelectorProps {
  sizes?: VariantItem[];
  variants?: VariantItem[];
  selectedId?: number;
  selectedVariantId?: number;
  onSelect: (id: number) => void;
  isArabic?: boolean;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  variants,
  selectedId,
  selectedVariantId,
  onSelect,
  isArabic = false,
}) => {
  const items = variants || sizes || [];
  const currentId = selectedVariantId !== undefined ? selectedVariantId : selectedId;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs tracking-widest uppercase text-[#14110F] dark:text-[#FDFBF7]">
          {isArabic ? 'الحجم والتركيز' : 'Size Selection'}
        </span>
        <span dir="ltr" className="ltr-isolate font-body text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/80 italic">
          Extrait de Parfum (32%–38%)
        </span>
      </div>

      <div
        className={`grid gap-3 ${
          items.length === 1
            ? 'grid-cols-1 max-w-xs'
            : items.length === 2
            ? 'grid-cols-2 max-w-sm'
            : 'grid-cols-3'
        }`}
      >
        {items.map((v) => {
          const isSelected = v.id === currentId;

          // Silhouette height proportional to volume
          const bottleHeight =
            v.size_ml <= 15
              ? 20
              : v.size_ml <= 30
              ? 24
              : v.size_ml <= 50
              ? 30
              : v.size_ml <= 100
              ? 38
              : 42;

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              className={`p-3.5 rounded-2xl border transition-all duration-300 flex ${
                items.length === 1 ? 'flex-row items-center justify-between px-6' : 'flex-col items-center justify-between'
              } gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#14110F] dark:bg-[#201815] text-[#FDFBF7] border-[#B08D57] shadow-lg scale-102 ring-1 ring-[#B08D57]'
                  : 'bg-[#F1EADA]/60 dark:bg-[#161210] text-[#14110F] dark:text-[#FDFBF7] border-[#B08D57]/30 dark:border-[#B08D57]/40 hover:border-[#B08D57] hover:bg-[#F1EADA] dark:hover:bg-[#1C1613]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Bottle Silhouette SVG */}
                <div className="h-10 flex items-end justify-center">
                  <svg
                    width={bottleHeight * 0.55}
                    height={bottleHeight}
                    viewBox="0 0 24 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={isSelected ? 'text-[#B08D57]' : 'text-[#3A332D]/60 dark:text-[#DFCA9B]/60'}
                  >
                    {/* Cap */}
                    <rect x="8" y="2" width="8" height="6" rx="1.5" fill="currentColor" />
                    {/* Neck */}
                    <rect x="10" y="8" width="4" height="4" fill="currentColor" opacity="0.6" />
                    {/* Body with Arch Shoulder */}
                    <path
                      d="M3 17 C3 12, 7 12, 10 12 H14 C17 12, 21 12, 21 17 V36 C21 38, 19 39, 17 39 H7 C5 39, 3 38, 3 36 Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill={isSelected ? 'rgba(176,141,87,0.2)' : 'none'}
                    />
                    {/* Wax seal dot */}
                    <circle cx="12" cy="24" r="2.5" fill="#6B1D2F" />
                  </svg>
                </div>

                {items.length === 1 && (
                  <div className="text-left">
                    <span className="font-display text-xs uppercase tracking-wider block font-semibold">
                      {isArabic ? 'الحجم الحصري المتاح' : 'Exclusive Artisan Size'}
                    </span>
                    <span className="text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B]/70 block">
                      {v.name_ar || v.name_en || `${v.size_ml} ml`}
                    </span>
                  </div>
                )}
              </div>

              {/* Volume & Price */}
              <div className={items.length === 1 ? 'text-end' : 'text-center'}>
                <span dir="ltr" className="ltr-isolate font-display text-sm uppercase tracking-wider block font-semibold">
                  {v.size_ml} ml
                </span>
                <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-[#B08D57]' : 'text-[#8C6E3D]'}`}>
                  <Price amount={v.price} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
