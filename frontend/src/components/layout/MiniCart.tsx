'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { NumberRoll } from '@/components/ui/NumberRoll';
import { Price } from '@/components/ui/Price';

export const MiniCart: React.FC = () => {
  const { isCartOpen, closeCart } = useUIStore();
  const { items, subtotal, discount, total, coupon, updateQty, removeItem, applyCoupon, removeCoupon } =
    useCartStore();
  const pathname = usePathname();
  const isArabic = pathname.startsWith('/ar');

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/v1/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.message || (isArabic ? 'رمز الخصم غير صالح' : 'Invalid coupon code'));
      } else {
        applyCoupon(data.data);
        setCouponCode('');
      }
    } catch {
      setCouponError(
        isArabic ? 'تعذر التحقق من الكود، يرجى المحاولة مرة أخرى' : 'Could not verify coupon code'
      );
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-[#14110F]/65 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: isArabic ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isArabic ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`relative z-10 w-full max-w-md ios-glass h-full shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col justify-between border-${
              isArabic ? 'r' : 'l'
            } border-white/60`}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#B08D57]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WaxSeal size={32} />
                <h3 className="font-display uppercase text-sm sm:text-base tracking-widest text-[#14110F]">
                  {isArabic ? 'حقيبة العطور' : 'Your Perfume Bag'}
                </h3>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-[#14110F] hover:text-[#6B1D2F] transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items list / Empty state */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                  <WaxSeal size={64} />
                  <p className="font-display text-lg uppercase tracking-wider text-[#14110F]">
                    {isArabic ? 'حقيبتك فارغة' : 'Your bag is empty'}
                  </p>
                  <p className="font-body text-xs text-[#3A332D]/70 max-w-xs">
                    {isArabic
                      ? 'اختر عطرك المفضل من مجموعة لوفينوس الحصرية لبدء رحلتك العطرية.'
                      : 'Discover our four signature Extraits de Parfum and begin your olfactory journey.'}
                  </p>
                  <Link
                    href={isArabic ? '/ar/shop' : '/shop'}
                    onClick={closeCart}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#14110F] hover:bg-[#6B1D2F] text-[#FDFBF7] font-display text-xs uppercase tracking-widest transition-colors shadow-md"
                  >
                    {isArabic ? 'استكشف المجموعة' : 'Explore Collection'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.variant.id}
                      className="p-4 rounded-xl bg-[#F1EADA]/70 border border-[#B08D57]/20 flex gap-4 items-center"
                    >
                      {/* Thumbnail bottle image */}
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[#FDFBF7] flex-shrink-0 border border-[#B08D57]/20">
                        <Image
                          src={item.product.images?.[0]?.url || '/images/products/packaging-mockup.jpg'}
                          alt={isArabic ? item.product.name_ar : item.product.name_en}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Info & steppers */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm uppercase tracking-wide text-[#14110F] dark:text-[#FDFBF7] truncate">
                          {isArabic ? item.product.name_ar : item.product.name_en}
                        </h4>
                        <p className="font-body text-xs text-[#8C6E3D] dark:text-[#DFCA9B]">
                          {item.variant.size_ml} ml — Extrait de Parfum
                        </p>
                        <div className="font-display text-xs font-semibold text-[#14110F] dark:text-[#FDFBF7] mt-1">
                          <Price amount={item.variant.price * item.quantity} />
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-[#14110F]/20 dark:border-[#B08D57]/30 rounded-full px-2 py-0.5 bg-[#FDFBF7] dark:bg-[#161210]">
                            <button
                              onClick={() => updateQty(item.variant.id, item.quantity - 1)}
                              className="text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#B08D57] p-0.5 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="mx-2 font-display text-xs text-[#14110F] dark:text-[#FDFBF7]">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.variant.id, item.quantity + 1)}
                              className="text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#B08D57] p-0.5 cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.variant.id)}
                            className="text-[#3A332D]/40 dark:text-[#FDFBF7]/40 hover:text-[#6B1D2F] transition-colors p-1 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with summary & checkout */}
            {items.length > 0 && (
              <div className="p-6 bg-[#F1EADA] dark:bg-[#161210] border-t border-[#B08D57]/30 space-y-4">
                {/* Coupon input */}
                {coupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#B08D57]/15 border border-[#B08D57]/40 text-xs">
                    <span className="font-display tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] flex items-center gap-1.5">
                      <Tag size={13} />
                      {coupon.code} ({coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} EGP`})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-[#6B1D2F] dark:text-[#DFCA9B] hover:underline text-[11px] font-display uppercase tracking-wider cursor-pointer"
                    >
                      {isArabic ? 'إزالة' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={isArabic ? 'رمز الخصم (جرب LVENUS10)' : 'Promo code (try LVENUS10)'}
                      className="flex-1 px-3 py-2 text-xs rounded-full bg-[#FDFBF7] dark:bg-[#0D0A08] border border-[#B08D57]/30 uppercase tracking-wider focus:outline-none focus:border-[#B08D57] text-[#14110F] dark:text-[#FDFBF7]"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-4 py-2 rounded-full bg-[#14110F] dark:bg-[#1E1714] text-[#FDFBF7] font-display text-xs uppercase tracking-wider hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] border border-[#B08D57]/40 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {couponLoading ? '...' : isArabic ? 'تطبيق' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-[#6B1D2F]">{couponError}</p>}

                {/* Subtotals */}
                <div className="space-y-1.5 text-xs font-display">
                  <div className="flex justify-between text-[#3A332D] dark:text-[#FDFBF7]/80">
                    <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <Price amount={subtotal} />
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#6B1D2F] dark:text-[#DFCA9B]">
                      <span>{isArabic ? 'الخصم' : 'Discount'}</span>
                      <span>-<Price amount={discount} /></span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#14110F] dark:text-[#FDFBF7] font-bold text-sm pt-2 border-t border-[#B08D57]/30">
                    <span>{isArabic ? 'الإجمالي التقديري' : 'Total'}</span>
                    <Price amount={total} />
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href={isArabic ? '/ar/checkout' : '/checkout'}
                  onClick={closeCart}
                  className="w-full py-4 rounded-full bg-[#14110F] dark:bg-[#1E1714] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] border border-[#B08D57]/50 text-[#FDFBF7] font-display text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-400 shadow-md group cursor-pointer"
                >
                  <span>{isArabic ? 'المتابعة للشراء' : 'Proceed to Checkout'}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
