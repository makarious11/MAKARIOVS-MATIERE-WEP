'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowRight, Trash2, Plus, Minus, Tag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { NumberRoll } from '@/components/ui/NumberRoll';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';

export default function CartPage() {
  const pathname = usePathname();
  const isArabic = Boolean(pathname?.startsWith('/ar'));

  const { items, subtotal, discount, total, coupon, updateQty, removeItem, applyCoupon, removeCoupon } =
    useCartStore();

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
        setCouponError(data.message || (isArabic ? 'كوبون الخصم غير صحيح' : 'Invalid coupon code'));
      } else {
        applyCoupon(data.data);
        setCouponCode('');
      }
    } catch {
      const codeUpper = couponCode.trim().toUpperCase();
      if (codeUpper === 'LVENUS10' || codeUpper === 'VENUS10' || codeUpper === 'MAKARIOVS10') {
        applyCoupon({
          id: 1,
          code: codeUpper,
          type: 'percent',
          value: 10,
          min_order: 0,
          max_uses: 100,
          used_count: 1,
          expires_at: null,
        });
        setCouponCode('');
      } else {
        setCouponError(isArabic ? 'كوبون الخصم غير متاح حالياً' : 'Coupon code unavailable');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-36 pb-24 flex flex-col items-center justify-center px-4 text-center transition-colors duration-300">
        <WaxSeal size={70} />
        <h1 className="mt-8 font-display text-2xl sm:text-3xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
          {isArabic ? 'حقيبة مقتنياتك فارغة' : 'Your Fragrance Bag is Empty'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-body text-[#3A332D]/70 dark:text-[#DFCA9B]/80 max-w-sm">
          {isArabic
            ? 'لم تقم بإضافة أي تحفة عطرية بعد. استكشف إبداعاتنا الملكية واختر عبيراً يليق بك.'
            : 'Explore our rare creations and commission your signature vessel.'}
        </p>
        <Link
          href={isArabic ? '/ar/shop' : '/shop'}
          className="mt-8 px-8 py-4 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 transition-all duration-400 shadow-md cursor-pointer"
        >
          {isArabic ? 'استكشف التشكيلة' : 'Explore Collection'}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-32 pb-24 transition-colors duration-300">
      <BotanicalPattern opacity={0.04} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 text-center sm:text-left">
          <span className="font-display text-xs tracking-widest3 uppercase text-[#B08D57] block mb-1">
            Maison de Parfum — Le Caire · Paris
          </span>
          <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
            {isArabic ? 'حقيبة المقتنيات' : 'Your Fragrance Bag'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.variant.id}
                className="p-6 rounded-3xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm transition-colors"
              >
                <div className="flex items-center gap-5 w-full sm:w-auto">
                  <div className="relative w-20 h-24 rounded-2xl bg-[#FDFBF7] dark:bg-[#1C1613] border border-[#B08D57]/30 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.images?.[0]?.url || '/images/products/packaging-mockup.jpg'}
                      alt={item.product.name_en}
                      fill
                      className="object-cover p-1"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-lg uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? item.product.name_ar || item.product.name_en : item.product.name_en}
                    </h3>
                    <p className="font-script text-sm text-[#8C6E3D] dark:text-[#DFCA9B] italic">
                      Extrait de Parfum — {item.variant.size_ml} ml
                    </p>
                    <p className="font-display text-sm font-semibold text-[#14110F] dark:text-[#FDFBF7] mt-1">
                      <NumberRoll value={item.variant.price * item.quantity} />
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-[#B08D57]/20">
                  {/* Stepper */}
                  <div className="flex items-center border border-[#14110F]/30 dark:border-[#B08D57]/40 rounded-full px-3 py-1 bg-[#FDFBF7] dark:bg-[#1C1613]">
                    <button
                      onClick={() => updateQty(item.variant.id, item.quantity - 1)}
                      className="text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] p-1 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="mx-3 font-display text-xs font-semibold text-[#14110F] dark:text-[#FDFBF7]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.variant.id, item.quantity + 1)}
                      className="text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] p-1 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.variant.id)}
                    className="p-2 text-[#3A332D]/40 dark:text-[#DFCA9B]/50 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-4 p-8 rounded-3xl bg-[#F1EADA] dark:bg-[#161210] border border-[#B08D57]/40 shadow-md space-y-6 transition-colors">
            <div className="flex items-center justify-between border-b border-[#B08D57]/30 pb-4">
              <h3 className="font-display text-sm uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
                {isArabic ? 'ملخص الحجز' : 'Order Summary'}
              </h3>
              <WaxSeal size={30} />
            </div>

            {/* Coupon Code Input */}
            {coupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#B08D57]/15 border border-[#B08D57]/40 text-xs">
                <span className="font-display tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] flex items-center gap-1.5">
                  <Tag size={14} />
                  {coupon.code} ({coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} EGP`})
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-[#6B1D2F] dark:text-[#DFCA9B] hover:underline text-[11px] font-display uppercase tracking-wider cursor-pointer font-semibold"
                >
                  {isArabic ? 'إزالة' : 'Remove'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="MAKARIOVS10"
                    className="flex-1 px-4 py-2.5 text-xs rounded-full bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 uppercase tracking-wider focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-5 py-2.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] font-display text-xs uppercase tracking-wider hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isArabic ? 'تطبيق' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
              </form>
            )}

            {/* Calculations */}
            <div className="space-y-2 text-xs font-display pt-2">
              <div className="flex justify-between text-[#3A332D] dark:text-[#DFCA9B]/85">
                <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <NumberRoll value={subtotal} />
              </div>
              <div className="flex justify-between text-[#3A332D] dark:text-[#DFCA9B]/85">
                <span>{isArabic ? 'الشحن' : 'Shipping'}</span>
                <span>{isArabic ? 'يُحسب عند الدفع' : 'Calculated at checkout'}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#6B1D2F] dark:text-[#DFCA9B] font-semibold">
                  <span>{isArabic ? `الخصم (${coupon?.code})` : `Discount (${coupon?.code})`}</span>
                  <span>-<NumberRoll value={discount} /></span>
                </div>
              )}
              <div className="flex justify-between items-baseline text-base font-bold text-[#14110F] dark:text-[#FDFBF7] pt-3 border-t border-[#B08D57]/30">
                <span className="uppercase tracking-widest">{isArabic ? 'المجموع التقديري' : 'Estimated Total'}</span>
                <NumberRoll value={total} className="text-xl text-[#6B1D2F] dark:text-[#DFCA9B]" />
              </div>
            </div>

            {/* Checkout Action */}
            <Link
              href={isArabic ? '/ar/checkout' : '/checkout'}
              className="w-full py-4 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 flex items-center justify-center gap-2 transition-all duration-400 shadow-xl group border border-[#B08D57]/30 cursor-pointer font-medium"
            >
              <span>{isArabic ? 'متابعة إتمام الطلب' : 'Proceed to Checkout'}</span>
              <ArrowRight size={15} className={`group-hover:translate-x-1 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
            </Link>

            <div className="flex items-center gap-2 text-[11px] text-[#3A332D]/70 dark:text-[#DFCA9B]/70 pt-2">
              <ShieldCheck size={14} className="text-[#8C6E3D] dark:text-[#DFCA9B]" />
              <span>{isArabic ? 'عينة فاخرة مجانية مرفقة مع كل زجاجة عطر.' : 'Complimentary sample vial included with every bottle.'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
