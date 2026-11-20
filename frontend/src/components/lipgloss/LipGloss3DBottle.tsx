'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export interface ShadeConfig {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  hex: string;
  secondary_hex: string;
  accent_gradient: string;
  image_bottle: string;  // Full original studio photo (with marble base & atmosphere)
  cutout_bottle: string; // Isolated transparent bottle cutout exclusively for 3D stage
  image_open: string;
  description_en: string;
  description_ar: string;
  undertone_en: string;
  undertone_ar: string;
  finish_en: string;
  finish_ar: string;
}

export const LIP_GLOSS_SHADES: ShadeConfig[] = [
  {
    id: 'nude-peach',
    slug: 'lip-gloss-nude-peach',
    name_en: '01 Nude Peach',
    name_ar: '٠١ نود خوخي دافئ',
    hex: '#D49678',
    secondary_hex: '#E8B9A0',
    accent_gradient: 'from-[#FAF1ED] via-[#F4D9C8] to-[#D49678]',
    image_bottle: '/images/lipgloss/shade-nude-peach.jpg',
    cutout_bottle: '/images/lipgloss/cutout-nude-peach.png',
    image_open: '/images/lipgloss/shade-nude-peach-open.jpg',
    description_en: 'Warm sun-drenched nude peach inspired by Alexandrian coastal dawns.',
    description_ar: 'درجة نود خوخي دافئة مستوحاة من إشراقة فجر الإسكندرية بلمعان زجاجي ممتلئ.',
    undertone_en: 'Warm Apricot & Honey',
    undertone_ar: 'نغمات مشمش وعسل دافئ',
    finish_en: 'Mirror-Glass Cushion',
    finish_ar: 'بريق زجاجي مرطب',
  },
  {
    id: 'dusty-rose',
    slug: 'lip-gloss-dusty-rose',
    name_en: '02 Dusty Rose',
    name_ar: '٠٢ وردي كوتور',
    hex: '#B67583',
    secondary_hex: '#D89FA9',
    accent_gradient: 'from-[#FAF1ED] via-[#F2D6DC] to-[#B67583]',
    image_bottle: '/images/lipgloss/shade-dusty-rose.jpg',
    cutout_bottle: '/images/lipgloss/cutout-dusty-rose.png',
    image_open: '/images/lipgloss/shade-dusty-rose-open.jpg',
    description_en: 'The iconic L’VENUS signature shade. An elegant couture dusty rose with cool mauve undertones.',
    description_ar: 'درجة الدار الأيقونية الفاتنة، وردي كوتور ساتاني بنغمات هادئة تليق بكافة ألوان البشرة.',
    undertone_en: 'Cool Mauve & Petal',
    undertone_ar: 'موف بارد وبتلات الورد',
    finish_en: 'Couture Glaze',
    finish_ar: 'تألق كوتور زجاجي',
  },
  {
    id: 'deep-berry',
    slug: 'lip-gloss-deep-berry',
    name_en: '03 Deep Berry',
    name_ar: '٠٣ توتي ملكي',
    hex: '#783B4B',
    secondary_hex: '#A1596D',
    accent_gradient: 'from-[#FAF1ED] via-[#E2BAC6] to-[#783B4B]',
    image_bottle: '/images/lipgloss/shade-deep-berry.jpg',
    cutout_bottle: '/images/lipgloss/cutout-deep-berry.png',
    image_open: '/images/lipgloss/shade-deep-berry-open.jpg',
    description_en: 'A deep sovereign berry tone radiating quiet luxury, juicy cushion and dramatic allure.',
    description_ar: 'توتي ملكي عميق يفيض بالسيادة والفخامة مع لمعان نقي وترطيب خيالي بدون أي لزوجة.',
    undertone_en: 'Rich Royal Cassis & Wine',
    undertone_ar: 'كشمش ملكي ونبيذي غني',
    finish_en: 'High-Lacquer Depth',
    finish_ar: 'ورنيش زجاجي غني',
  },
];

interface LipGloss3DBottleProps {
  activeShadeId: string;
  isOpenWand?: boolean;
  onToggleOpenWand?: () => void;
  scrollY?: number;
  className?: string;
  isArabic?: boolean;
}

export const LipGloss3DBottle: React.FC<LipGloss3DBottleProps> = ({
  activeShadeId,
  isOpenWand = false,
  onToggleOpenWand,
  scrollY = 0,
  className = '',
  isArabic = false,
}) => {
  const currentShade = LIP_GLOSS_SHADES.find((s) => s.id === activeShadeId) || LIP_GLOSS_SHADES[1];

  // Subtle scroll parallax only (NO mouse tracking, completely stable)
  const scrollTranslateY = Math.max(-25, Math.min(25, scrollY * -0.06));
  const scrollRotateY = Math.sin(scrollY * 0.0015) * 6;

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* Dynamic Ambient Soft Color Glow (Matches Active Shade) */}
      <motion.div
        animate={{
          background: `radial-gradient(circle, ${currentShade.hex}44 0%, ${currentShade.secondary_hex}18 45%, transparent 70%)`,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 -m-12 rounded-full blur-2xl pointer-events-none -z-10"
      />

      {/* Floating Shimmer Sparks in Background */}
      <div className="absolute inset-0 pointer-events-none -z-5 overflow-visible">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-12, 12, -12],
              opacity: [0.25, 0.75, 0.25],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.7,
            }}
            className="absolute rounded-full"
            style={{
              width: `${4 + (i % 3) * 3}px`,
              height: `${4 + (i % 3) * 3}px`,
              top: `${15 + i * 16}%`,
              left: `${12 + (i % 4) * 24}%`,
              background: `radial-gradient(circle, #FFF 15%, ${currentShade.hex} 85%)`,
              boxShadow: `0 0 12px ${currentShade.hex}`,
            }}
          />
        ))}
      </div>

      {/* 3D Stage: Compact, Elegant Bottle ONLY (Transparent Cutout, No mouse tilt) */}
      <motion.div
        style={{
          transformStyle: 'preserve-3d',
          transform: `perspective(1200px) rotateY(${scrollRotateY}deg) translateY(${scrollTranslateY}px)`,
        }}
        className="relative w-[110px] sm:w-[130px] md:w-[150px] h-[320px] sm:h-[370px] md:h-[410px] flex items-center justify-center"
      >
        {/* Soft 3D Ground Shadow underneath the bottle */}
        <div
          className="absolute -bottom-4 w-[110px] sm:w-[140px] h-[18px] rounded-[100%] blur-sm pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, rgba(30,10,18,0.32) 0%, ${currentShade.hex}33 45%, transparent 75%)`,
            transform: 'rotateX(80deg) translateZ(-20px)',
          }}
        />

        {/* Transparent Cutout Bottle with Smooth Cross-fade on Shade Change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentShade.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full flex items-center justify-center"
            style={{ transform: 'translateZ(20px)' }}
          >
            <Image
              src={currentShade.cutout_bottle}
              alt={isArabic ? currentShade.name_ar : currentShade.name_en}
              fill
              priority
              className="object-contain drop-shadow-[0_18px_32px_rgba(40,15,22,0.25)] transition-transform duration-500"
              sizes="(max-width: 768px) 140px, 180px"
            />

            {/* Subtle Glass Gleam Highlight */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35 bg-gradient-to-tr from-transparent via-white/50 to-transparent w-full h-full rounded-2xl"
            />
          </motion.div>
        </AnimatePresence>

        {/* 3D Floating Interactive Badge */}
        <div
          style={{ transform: 'translateZ(45px)' }}
          className="absolute -top-2 -right-4 sm:-right-6 z-20"
        >
          <div
            className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-display tracking-widest uppercase backdrop-blur-md border shadow-lg flex items-center gap-2"
            style={{
              backgroundColor: `${currentShade.hex}25`,
              borderColor: `${currentShade.hex}77`,
              color: '#2B171D',
            }}
          >
            <span
              className="w-2 h-2 rounded-full shadow-sm animate-pulse"
              style={{ backgroundColor: currentShade.hex }}
            />
            <span className="font-bold text-stone-900 dark:text-stone-100">
              {isArabic ? currentShade.name_ar : currentShade.name_en}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Floating Specs Pill below the 3D stage */}
      <div className="mt-4 flex items-center gap-3 text-xs font-body text-stone-600 dark:text-stone-300">
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-[#B08D57]" />
          <span>{isArabic ? currentShade.finish_ar : currentShade.finish_en}</span>
        </span>
        <span className="w-1 h-1 rounded-full bg-stone-400" />
        <span>{isArabic ? currentShade.undertone_ar : currentShade.undertone_en}</span>
      </div>
    </div>
  );
};
