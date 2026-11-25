'use client';

import React from 'react';
import Image from 'next/image';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { Price } from '@/components/ui/Price';
import type { CartItem, Coupon } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  giftBoxFee?: number;
  total: number;
  coupon: Coupon | null;
  isArabic?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  shippingFee,
  discount,
  giftBoxFee = 0,
  total,
  coupon,
  isArabic = false,
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl ios-glass dark:ios-glass-dark bg-[#FDFBF7]/90 dark:bg-[#161210] border border-white/60 dark:border-[#B08D57]/30 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-[#B08D57]/30 pb-4">
        <h3 className="font-display text-base uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
          {isArabic ? 'ملخص الطلب الملكي' : 'Order Summary'}
        </h3>
        <WaxSeal size={28} />
      </div>

      {/* Item list */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.variant.id} className="flex items-center gap-3">
            <div className="relative w-12 h-16 rounded-lg bg-[#FBF8EE] dark:bg-[#1C1613] border border-[#B08D57]/20 overflow-hidden flex-shrink-0">
              <Image
                src={item.product.images?.[0]?.url || '/images/products/packaging-mockup.jpg'}
                alt={isArabic ? item.product.name_ar : item.product.name_en}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] truncate">
                {isArabic ? item.product.name_ar : item.product.name_en}
              </h4>
              <p className="font-body text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                <span dir="ltr" className="ltr-isolate">
                  {item.variant.size_ml} ml × {item.quantity}
                </span>
              </p>
            </div>
            <span className="font-display text-xs font-semibold text-[#14110F] dark:text-[#FDFBF7]">
              <Price amount={item.variant.price * item.quantity} />
            </span>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-2 pt-4 border-t border-[#B08D57]/30 text-xs font-display">
        <div className="flex justify-between text-[#3A332D] dark:text-[#DFCA9B]">
          <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
          <Price amount={subtotal} />
        </div>

        <div className="flex justify-between text-[#3A332D] dark:text-[#DFCA9B]">
          <span>{isArabic ? 'الشحن والتوصيل' : 'Shipping'}</span>
          <span>{shippingFee === 0 ? (isArabic ? 'مجاني' : 'Free') : <Price amount={shippingFee} />}</span>
        </div>

        {giftBoxFee > 0 && (
          <div className="flex justify-between text-[#8C6E3D] dark:text-[#DFCA9B]">
            <span>{isArabic ? 'تغليف الهدايا الملكي' : 'Gift Presentation Box'}</span>
            <Price amount={giftBoxFee} />
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-[#6B1D2F] dark:text-[#DFCA9B] font-semibold">
            <span>
              {isArabic ? 'الخصم' : 'Discount'}{' '}
              {coupon && `(${coupon.code})`}
            </span>
            <span>-<Price amount={discount} /></span>
          </div>
        )}

        <div className="flex justify-between items-baseline text-base font-bold text-[#14110F] dark:text-[#FDFBF7] pt-3 border-t border-[#B08D57]/30">
          <span className="uppercase tracking-widest">{isArabic ? 'الإجمالي' : 'Total'}</span>
          <Price amount={total} className="text-lg text-[#6B1D2F] dark:text-[#DFCA9B]" />
        </div>
      </div>
    </div>
  );
};

