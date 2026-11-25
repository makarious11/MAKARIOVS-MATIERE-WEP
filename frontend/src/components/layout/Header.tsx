'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, Globe } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { isAdminRoute } from '@/lib/constants';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount } = useCartStore();
  const { openCart, isMenuOpen, toggleMenu, closeMenu, setLocale } = useUIStore();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide storefront header on dedicated Admin Console routes
  if (isAdminRoute(pathname)) return null;

  const isArabic = pathname ? pathname.startsWith('/ar') : false;
  // Only pages with a full-bleed dark hero banner use light transparent chrome before scrolling
  const hasDarkHeroTop =
    !pathname || pathname === '/' || pathname === '/ar' || pathname === '/shop' || pathname === '/ar/shop';
  const useLightChrome = !isScrolled && hasDarkHeroTop;

  const changeLanguage = (newLocale: 'en' | 'ar') => {
    try {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
    setLocale(newLocale);

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

  const navLinks = [
    { href: isArabic ? '/ar/shop' : '/shop', label: isArabic ? 'الإبداعات' : 'Créations' },
    { href: isArabic ? '/ar/lip-gloss' : '/lip-gloss', label: isArabic ? 'كوتور الشفاه' : 'Lip Gloss' },
    { href: isArabic ? '/ar/story' : '/story', label: isArabic ? 'عالم الدار' : 'La Maison' },
    { href: isArabic ? '/ar/contact' : '/contact', label: isArabic ? 'تواصل معنا' : 'Atelier & Contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          useLightChrome
            ? 'bg-gradient-to-b from-[#0D0A08]/80 via-[#0D0A08]/40 to-transparent py-3.5 sm:py-5 text-[#FDFBF7]'
            : 'bg-[#FDFBF7]/95 dark:bg-[#0D0A08]/95 backdrop-blur-xl border-b border-[#B08D57]/25 shadow-[0_6px_28px_rgba(20,17,15,0.08)] py-2.5 sm:py-3 text-[#14110F] dark:text-[#FDFBF7]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex md:grid md:grid-cols-12 items-center justify-between gap-2">
            {/* Left Nav (Desktop) / Hamburger (Mobile) */}
            <div className="flex items-center gap-3 md:col-span-5 shrink-0 relative z-20">
              <button
                onClick={toggleMenu}
                className={`md:hidden p-2 -ms-1 transition-colors cursor-pointer ${
                  useLightChrome
                    ? 'text-[#FDFBF7] hover:text-[#B08D57]'
                    : 'text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F]'
                }`}
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? <X size={22} strokeWidth={1.25} /> : <Menu size={22} strokeWidth={1.25} />}
              </button>

              <nav className={`hidden md:flex items-center ${isArabic ? 'gap-5 lg:gap-6' : 'gap-5 lg:gap-7'}`}>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-display text-xs whitespace-nowrap transition-colors duration-200 relative group py-1 ${
                      isArabic ? 'tracking-[0.02em] font-medium text-[13px]' : 'uppercase tracking-[0.2em]'
                    } ${
                      useLightChrome
                        ? 'text-[#FDFBF7]/90 hover:text-[#DFCA9B]'
                        : 'text-[#14110F]/85 dark:text-[#FDFBF7]/90 hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B]'
                    }`}
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 inset-x-0 w-0 h-[1px] bg-[#B08D57] transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center Brand Wordmark with VINUS_LOSO icon */}
            <div className="flex-1 md:flex-none md:col-span-4 flex flex-col items-center justify-center text-center px-1 sm:px-2 min-w-0 relative z-10 pointer-events-auto">
              <Link href={isArabic ? '/ar' : '/'} className="group inline-flex flex-col items-center max-w-full">
                <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-0.5">
                  <img
                    src="/brand/VINUS_LOSO.svg"
                    alt="L'VENUS"
                    className={`w-7 h-7 sm:w-9 sm:h-9 object-contain shrink-0 transition-all duration-300 drop-shadow-sm ${
                      useLightChrome ? 'brightness-0 invert' : 'brightness-0 dark:brightness-0 dark:invert'
                    }`}
                  />
                  <span
                    className={`uppercase text-lg sm:text-xl md:text-2xl whitespace-nowrap transition-colors font-normal ${
                      isArabic ? 'tracking-[0.02em]' : 'tracking-[0.22em] sm:tracking-[0.26em]'
                    } ${
                      useLightChrome
                        ? 'text-[#FDFBF7] group-hover:text-[#B08D57]'
                        : 'text-[#14110F] dark:text-[#FDFBF7] group-hover:text-[#6B1D2F] dark:group-hover:text-[#DFCA9B]'
                    }`}
                    style={{
                      fontFamily: isArabic
                        ? "'Noto Naskh Arabic', 'Cairo', serif"
                        : "'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    {isArabic ? 'لوفينوس' : "L’VENUS"}
                  </span>
                </div>
                <span
                  className={`hidden sm:block text-[10px] md:text-[11px] whitespace-nowrap leading-tight transition-colors ${
                    useLightChrome ? 'text-[#DFCA9B]' : 'text-[#8C6E3D] dark:text-[#DFCA9B]'
                  }`}
                  style={{
                    fontFamily: isArabic ? "'Amiri', 'Cairo', serif" : "'Pinyon Script', cursive",
                    fontStyle: isArabic ? 'normal' : 'italic',
                  }}
                >
                  {isArabic ? 'خلاصة العطر — بإتقان مكاريوس' : 'Extrait de Parfum — Crafted by Makarious'}
                </span>
              </Link>
            </div>

            {/* Right Action Icons: Currency, Theme, Language, Account, Cart */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-3 md:col-span-3 shrink-0 relative z-20">
              {/* Currency Selector */}
              <div className="hidden sm:block">
                <CurrencySelector darkSurface={useLightChrome} />
              </div>

              {/* Theme Toggle (Header Mode) */}
              <ThemeToggle variant="header" darkSurface={useLightChrome} />

              {/* Language Switcher — always visible & clearly labeled (AR / EN) */}
              <button
                type="button"
                onClick={() => changeLanguage(isArabic ? 'en' : 'ar')}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-display uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                  useLightChrome
                    ? 'border-[#B08D57]/50 text-[#FDFBF7] hover:border-[#DFCA9B] hover:text-[#DFCA9B]'
                    : 'border-[#B08D57]/35 text-[#14110F] dark:text-[#FDFBF7] hover:border-[#6B1D2F] dark:hover:border-[#DFCA9B]'
                }`}
                aria-label={isArabic ? 'Switch to English' : 'التحويل للعربية'}
                title={isArabic ? 'Switch to English' : 'التحويل للعربية'}
              >
                <Globe size={13} strokeWidth={1.5} className="text-[#B08D57]" />
                <span className="font-semibold">{isArabic ? 'EN' : 'AR'}</span>
              </button>

              {/* Account Link */}
              <Link
                href={isArabic ? '/ar/account' : '/account'}
                className={`p-1.5 transition-colors cursor-pointer ${
                  useLightChrome
                    ? 'text-[#FDFBF7]/90 hover:text-[#DFCA9B]'
                    : 'text-[#14110F]/85 dark:text-[#FDFBF7]/85 hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B]'
                }`}
                aria-label="Customer account"
              >
                <User size={19} strokeWidth={1.35} />
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className={`relative p-1.5 transition-colors cursor-pointer ${
                  useLightChrome
                    ? 'text-[#FDFBF7]/90 hover:text-[#DFCA9B]'
                    : 'text-[#14110F]/85 dark:text-[#FDFBF7]/85 hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B]'
                }`}
                aria-label={`View cart with ${itemCount} items`}
              >
                <ShoppingBag size={19} strokeWidth={1.35} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6B1D2F] text-[#FDFBF7] text-[10px] font-bold flex items-center justify-center border border-[#FDFBF7]/40 shadow-sm"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Luxury Salon Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#0D0A08] text-[#FDFBF7] flex flex-col justify-between pt-20 pb-10 px-8 md:hidden overflow-hidden"
          >
            {/* Top Close Button & Brand Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-[#B08D57]/20 pb-5">
              <div className="flex items-center gap-3">
                <img
                  src="/brand/VINUS_LOSO.svg"
                  alt="L'VENUS"
                  className="w-10 h-10 object-contain brightness-0 invert"
                />
                <div className="flex flex-col">
                  <span
                    className="font-serif text-2xl tracking-[0.2em] text-[#FDFBF7] uppercase"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {isArabic ? 'لوفينوس' : "L’VENUS"}
                  </span>
                  <span
                    className="text-[11px] text-[#B08D57] italic"
                    style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
                  >
                    {isArabic ? 'دار العطور الفاخرة' : 'Maison de Parfum'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeMenu}
                className="p-2 text-[#FDFBF7]/70 hover:text-[#FDFBF7] cursor-pointer"
                aria-label="Close menu"
              >
                <X size={26} strokeWidth={1.25} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="relative z-10 flex flex-col space-y-6 my-auto">
              <nav className="flex flex-col space-y-5">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: isArabic ? 24 : -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * idx, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="font-display text-3xl sm:text-4xl text-[#FDFBF7] hover:text-[#B08D57] uppercase tracking-wider transition-colors block pb-2 border-b border-[#B08D57]/15"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, x: isArabic ? 24 : -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28, duration: 0.4 }}
                >
                  <Link
                    href={isArabic ? '/ar/account' : '/account'}
                    onClick={closeMenu}
                    className="font-display text-3xl sm:text-4xl text-[#FDFBF7] hover:text-[#B08D57] uppercase tracking-wider transition-colors block pb-2 border-b border-[#B08D57]/15"
                  >
                    {isArabic ? 'حساب العميل' : 'Account'}
                  </Link>
                </motion.div>
              </nav>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 pt-6 border-t border-[#B08D57]/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    changeLanguage(isArabic ? 'en' : 'ar');
                  }}
                  className="px-4 py-2.5 rounded-full border border-[#B08D57]/50 bg-[#1B1612] text-xs font-display uppercase tracking-widest text-[#B08D57] hover:bg-[#6B1D2F] hover:text-[#FDFBF7] transition-all cursor-pointer shadow-md"
                >
                  {isArabic ? 'English' : 'العربية'}
                </button>
                <CurrencySelector darkSurface />
                <ThemeToggle variant="header" darkSurface />
              </div>

              <WaxSeal size={48} rotating />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
