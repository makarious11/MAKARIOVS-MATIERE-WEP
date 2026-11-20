'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

export interface ShadeConfig {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  hex: string;
  secondary_hex: string;
  accent_gradient: string;
  image_bottle: string;
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
    image_bottle: '/images/lipgloss/cutout-nude-peach.png',
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
    image_bottle: '/images/lipgloss/cutout-dusty-rose.png',
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
    image_bottle: '/images/lipgloss/cutout-deep-berry.png',
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt tracking
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);
      setMouseTilt({
        x: Math.max(-1, Math.min(1, deltaX)),
        y: Math.max(-1, Math.min(1, deltaY)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Compute 3D rotation angles combining scroll parallax and mouse movement
  const scrollRotateY = Math.sin(scrollY * 0.0025) * 18;
  const scrollRotateX = Math.cos(scrollY * 0.002) * 9;
  const scrollTranslateY = scrollY * -0.14;
  const scrollScale = Math.max(0.92, 1 - scrollY * 0.0002);

  const finalRotateY = scrollRotateY + mouseTilt.x * 16;
  const finalRotateX = -scrollRotateX - mouseTilt.y * 14;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative select-none flex flex-col items-center justify-center ${className}`}
      style={{ perspective: '1600px' }}
    >
      {/* Dynamic Ambient Color Glow (Matches Active Shade) */}
      <motion.div
        animate={{
          background: `radial-gradient(circle, ${currentShade.hex}55 0%, ${currentShade.secondary_hex}22 40%, transparent 70%)`,
          scale: isHovered ? 1.2 : 1,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 -m-20 rounded-full blur-3xl pointer-events-none -z-10"
      />

      {/* Floating Shimmer Sparks in 3D Space */}
      <div className="absolute inset-0 pointer-events-none -z-5 overflow-visible">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, 20, -20],
              x: [-12, 12, -12],
              opacity: [0.2, 0.85, 0.2],
              scale: [0.7, 1.3, 0.7],
            }}
            transition={{
              duration: 4.5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.6,
            }}
            className="absolute rounded-full"
            style={{
              width: `${5 + (i % 3) * 4}px`,
              height: `${5 + (i % 3) * 4}px`,
              top: `${12 + i * 13}%`,
              left: `${8 + (i % 4) * 26}%`,
              background: `radial-gradient(circle, #FFF 10%, ${currentShade.hex} 85%)`,
              boxShadow: `0 0 16px ${currentShade.hex}`,
            }}
          />
        ))}
      </div>

      {/* 3D Rotating Stage — Bottle ONLY, NO Background, Enlarged Size */}
      <motion.div
        style={{
          transformStyle: 'preserve-3d',
          transform: `perspective(1600px) rotateY(${finalRotateY}deg) rotateX(${finalRotateX}deg) translateY(${scrollTranslateY}px) scale(${scrollScale})`,
          transition: 'transform 0.16s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative w-[180px] sm:w-[220px] md:w-[260px] h-[520px] sm:h-[620px] md:h-[680px] flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* Soft 3D Ground Shadow underneath the bottle */}
        <div
          className="absolute -bottom-6 w-[180px] sm:w-[230px] h-[34px] rounded-[100%] blur-md pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, rgba(30,10,18,0.35) 0%, ${currentShade.hex}44 40%, transparent 75%)`,
            transform: `rotateX(82deg) translateZ(-40px) scale(${1 + mouseTilt.y * 0.1})`,
          }}
        />

        {/* Transparent Cutout Bottle with Cross-fade on Shade Change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentShade.id}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full flex items-center justify-center"
            style={{ transform: 'translateZ(35px)' }}
          >
            <Image
              src={currentShade.image_bottle}
              alt={isArabic ? currentShade.name_ar : currentShade.name_en}
              fill
              priority
              className="object-contain drop-shadow-[0_28px_50px_rgba(40,15,22,0.32)] hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width: 768px) 240px, 320px"
            />

            {/* Dynamic Specular Gleam across the crystal bottle */}
            <motion.div
              style={{
                transform: `translateX(${-mouseTilt.x * 60}px) translateY(${-mouseTilt.y * 40}px) rotate(${18 + mouseTilt.x * 12}deg)`,
              }}
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50 bg-gradient-to-r from-transparent via-white/70 to-transparent w-full h-full"
            />
          </motion.div>
        </AnimatePresence>

        {/* 3D Floating Interactive Badge */}
        <motion.div
          style={{ transform: 'translateZ(75px)' }}
          className="absolute -top-2 -right-6 sm:-right-8 z-20"
        >
          <div
            className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-display tracking-widest uppercase backdrop-blur-md border shadow-xl flex items-center gap-2"
            style={{
              backgroundColor: `${currentShade.hex}25`,
              borderColor: `${currentShade.hex}77`,
              color: '#2B171D',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shadow-md animate-pulse"
              style={{ backgroundColor: currentShade.hex }}
            />
            <span className="font-bold text-stone-900 dark:text-stone-100">
              {isArabic ? currentShade.name_ar : currentShade.name_en}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Specs Pill below the 3D stage */}
      <div className="mt-6 flex items-center gap-4 text-xs font-body text-stone-600 dark:text-stone-300">
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#B08D57]" />
          <span>{isArabic ? currentShade.finish_ar : currentShade.finish_en}</span>
        </span>
        <span className="w-1 h-1 rounded-full bg-stone-400" />
        <span>{isArabic ? currentShade.undertone_ar : currentShade.undertone_en}</span>
      </div>
    </div>
  );
};
