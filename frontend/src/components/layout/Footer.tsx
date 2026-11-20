'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const isArabic = pathname ? pathname.startsWith('/ar') : false;
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const changeLanguage = (newLocale: 'en' | 'ar') => {
    try {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : (pathname || '/');
    let nextPath = '/';

    if (newLocale === 'ar') {
      if (currentPath.startsWith('/ar')) {
        nextPath = currentPath;
      } else {
        nextPath = currentPath === '/' ? '/ar' : `/ar${currentPath}`;
      }
    } else {
      if (currentPath.startsWith('/ar')) {
        nextPath = currentPath.replace(/^\/ar(\/|$)/, '$1') || '/';
      } else {
        nextPath = currentPath;
      }
    }

    if (typeof window !== 'undefined') {
      window.location.assign(nextPath);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/v1/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubscribed(true);
      setEmail('');
    } catch {
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative bg-[#0D0A08] text-[#FDFBF7] overflow-hidden pt-24 pb-14 border-t border-[#B08D57]/25">
      {/* Background botanical engraving at 5% opacity */}
      <BotanicalPattern inverted opacity={0.05} />

      {/* Subtle Mystical Snake Watermark in Footer */}
      <div className="absolute right-10 bottom-10 w-44 h-auto opacity-10 pointer-events-none select-none">
        <img src="/brand/Snake.svg" alt="" className="w-full h-auto brightness-0 invert" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Grand Wordmark + Venus Wax Seal */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#B08D57]/20 pb-16 gap-8">
          <div className="max-w-2xl">
            <span className="font-display text-xs tracking-[0.3em] text-[#B08D57] uppercase block mb-3 font-medium">
              {isArabic ? 'دار العطور الفاخرة — القاهرة · باريس' : 'MAISON DE PARFUM — LE CAIRE · PARIS'}
            </span>
            <div className="flex items-center gap-4">
              <img
                src="/brand/VINUS_LOSO.svg"
                alt="L'VENUS"
                className="w-16 h-16 sm:w-20 sm:h-20 brightness-0 invert object-contain shrink-0"
              />
              <h2
                className="text-4xl sm:text-6xl md:text-7xl uppercase leading-none text-[#FDFBF7]"
                style={{
                  fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif",
                  letterSpacing: isArabic ? '0.04em' : '0.1em',
                  fontWeight: 300,
                }}
              >
                {isArabic ? 'لوفينوس' : "L’VENUS"}
              </h2>
            </div>
            <p
              className="text-lg sm:text-xl text-[#B08D57] mt-3 italic"
              style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
            >
              {isArabic ? 'خلاصة العطر — بإتقان مكاريوس' : 'Extrait de Parfum — Crafted by Makarious'}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <WaxSeal size={76} rotating />
          </div>
        </div>

        {/* Middle Section: Columns & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-16 border-b border-[#B08D57]/20">
          {/* Col 1: Brand philosophy */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display text-xs tracking-[0.25em] text-[#B08D57] uppercase font-semibold">
              {isArabic ? 'الفلسفة العطرية' : 'The Philosophy'}
            </h4>
            <p
              className="text-sm text-[#FDFBF7]/70 leading-relaxed max-w-sm"
              style={{ fontFamily: isArabic ? "'Amiri', serif" : "'EB Garamond', Georgia, serif" }}
            >
              {isArabic
                ? 'دار عطور نيش مستقلة تمزج أسرار العطارة الكيميائية المصرية القديمة مع دقة ونقاء صناعة العطور الفرنسية الفاخرة. أربعة إبداعات حصرية تصاغ في دفعات محدودة بتركيز إكستري دو بارفان فائق الثبات.'
                : 'An independent luxury perfume house bridging ancient Egyptian botanical alchemy with the quiet elegance of haute French perfumery. Four uncompromising Extraits de Parfum, hand-sealed in small artisanal batches.'}
            </p>
          </div>

          {/* Col 2: Navigation Links (Canonical 4 perfumes) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-display text-xs tracking-[0.25em] text-[#B08D57] uppercase font-semibold">
              {isArabic ? 'المجموعة' : 'The Extraits'}
            </h4>
            <ul className="space-y-2.5 font-display text-xs uppercase tracking-wider text-[#FDFBF7]/80">
              <li>
                <Link href={isArabic ? '/ar/product/la-fleur-du-nil' : '/product/la-fleur-du-nil'} className="hover:text-[#B08D57] transition-colors">
                  {isArabic ? 'زهرة النيل' : 'La Fleur du Nil'}
                </Link>
              </li>
              <li>
                <Link href={isArabic ? '/ar/product/ambre-dalexandrie' : '/product/ambre-dalexandrie'} className="hover:text-[#B08D57] transition-colors">
                  {isArabic ? 'عنبر الإسكندرية' : "Ambre d'Alexandrie"}
                </Link>
              </li>
              <li>
                <Link href={isArabic ? '/ar/product/bois-de-louxor' : '/product/bois-de-louxor'} className="hover:text-[#B08D57] transition-colors">
                  {isArabic ? 'خشب الأقصر' : 'Bois de Louxor'}
                </Link>
              </li>
              <li>
                <Link href={isArabic ? '/ar/product/al-oud-al-aswad' : '/product/al-oud-al-aswad'} className="hover:text-[#B08D57] transition-colors">
                  {isArabic ? 'العود الأسود' : 'Al Oud Al Aswad'}
                </Link>
              </li>
              <li>
                <Link href={isArabic ? '/ar/product/coffret-decouverte' : '/product/coffret-decouverte'} className="text-[#B08D57] hover:text-[#DFCA9B] font-semibold transition-colors">
                  {isArabic ? 'مجموعة الاستكشاف' : 'Le Coffret Découverte'}
                </Link>
              </li>
              <li>
                <Link href={isArabic ? '/ar/lip-gloss' : '/lip-gloss'} className="text-[#E8A5B2] hover:text-white font-semibold transition-colors">
                  {isArabic ? 'إكسير الشفاه — ليب غلوس كوتور' : 'Élixir Lèvres — Lip Gloss'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Maison */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-display text-xs tracking-[0.25em] text-[#B08D57] uppercase font-semibold">
              {isArabic ? 'الدار' : 'The Maison'}
            </h4>
            <ul className="space-y-2.5 font-display text-xs uppercase tracking-wider text-[#FDFBF7]/80">
              <li>
                <Link href={isArabic ? '/ar/story' : '/story'} className="hover:text-[#B08D57] transition-colors">
                  {isArabic ? 'قصة الدار' : 'Story'}
                </Link>
              </li>
              <li>
                <Link href={isArabic ? '/ar/shop' : '/shop'} className="hover:text-[#B08D57] transition-colors">
                  {isArabic ? 'المتجر' : 'Shop'}
                </Link>
              </li>
              <li>
                <Link href={isArabic ? '/ar/contact' : '/contact'} className="hover:text-[#B08D57] transition-colors">
                  {isArabic ? 'تواصل معنا' : 'Contact'}
                </Link>
              </li>
              <li>
                <Link href={isArabic ? '/ar/account' : '/account'} className="hover:text-[#B08D57] transition-colors">
                  {isArabic ? 'حساب العميل' : 'Account'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display text-xs tracking-[0.25em] text-[#B08D57] uppercase font-semibold">
              {isArabic ? 'النشرة الحصرية' : 'The Gazette'}
            </h4>
            <p className="text-xs text-[#FDFBF7]/70 leading-relaxed font-body">
              {isArabic
                ? 'اشترك لتصلك إشعارات إطلاق الدفعات المحدودة وشهادات الحصاد الموسمي.'
                : 'Receive private notifications for limited vintage bottle releases and seasonal botanical harvests.'}
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-[#B08D57] p-3 rounded-xl bg-[#1B1612] border border-[#B08D57]/30">
                <CheckCircle2 size={16} />
                <span>{isArabic ? 'تم الاشتراك في النشرة الخاصة بنجاح.' : 'You are now entered into our private ledger.'}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder={isArabic ? 'بريدك الإلكتروني' : 'Enter your email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#1B1612] border border-[#B08D57]/35 text-xs text-[#FDFBF7] placeholder-[#FDFBF7]/40 focus:outline-none focus:border-[#B08D57]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] text-[#FDFBF7] text-xs font-display uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center shrink-0 border border-[#B08D57]/40 shadow-md"
                >
                  <ArrowRight size={14} className={isArabic ? 'rotate-180' : ''} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Location */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-10 text-xs text-[#FDFBF7]/45 gap-4">
          <p>© {new Date().getFullYear()} L’VENUS Maison de Parfum. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => changeLanguage(isArabic ? 'en' : 'ar')}
              className="hover:text-[#B08D57] transition-colors cursor-pointer uppercase font-display tracking-widest text-[11px]"
            >
              {isArabic ? 'English' : 'العربية'}
            </button>
            <span className="text-[#B08D57]/40">·</span>
            <Link href={isArabic ? '/ar/legal/shipping' : '/legal/shipping'} className="hover:text-[#B08D57] transition-colors">
              {isArabic ? 'الشحن والتوصيل' : 'Shipping'}
            </Link>
            <span className="text-[#B08D57]/40">·</span>
            <Link href={isArabic ? '/ar/legal/returns' : '/legal/returns'} className="hover:text-[#B08D57] transition-colors">
              {isArabic ? 'سياسة الإرجاع' : 'Returns'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
