'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, RotateCw } from 'lucide-react';

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
    image_bottle: '/images/lipgloss/shade-nude-peach.jpg',
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
  const scrollRotateY = Math.sin(scrollY * 0.0025) * 16;
  const scrollRotateX = Math.cos(scrollY * 0.002) * 8;
  const scrollTranslateY = scrollY * -0.12;
  const scrollScale = Math.max(0.88, 1 - scrollY * 0.00025);

  const finalRotateY = scrollRotateY + mouseTilt.x * 14;
  const finalRotateX = -scrollRotateX - mouseTilt.y * 12;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative select-none flex flex-col items-center justify-center ${className}`}
      style={{ perspective: '1400px' }}
    >
      {/* Dynamic Ambient Color Halo */}
      <motion.div
        animate={{
          background: `radial-gradient(circle, ${currentShade.hex}44 0%, ${currentShade.secondary_hex}15 45%, transparent 70%)`,
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 -m-16 rounded-full blur-3xl pointer-events-none -z-10"
      />

      {/* Floating Shimmer Sparks */}
      <div className="absolute inset-0 pointer-events-none -z-5 overflow-visible">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-15, 15, -15],
              x: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
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
              width: `${6 + (i % 3) * 3}px`,
              height: `${6 + (i % 3) * 3}px`,
              top: `${15 + i * 14}%`,
              left: `${10 + (i % 4) * 24}%`,
              background: `radial-gradient(circle, #FFF 10%, ${currentShade.hex} 80%)`,
              boxShadow: `0 0 14px ${currentShade.hex}`,
            }}
          />
        ))}
      </div>

      {/* 3D Rotating Flacon Stage */}
      <motion.div
        style={{
          transformStyle: 'preserve-3d',
          transform: `perspective(1400px) rotateY(${finalRotateY}deg) rotateX(${finalRotateX}deg) translateY(${scrollTranslateY}px) scale(${scrollScale})`,
          transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative w-[280px] sm:w-[340px] md:w-[380px] h-[380px] sm:h-[440px] md:h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* Glass pedestal reflection */}
        <div
          className="absolute -bottom-8 w-[240px] sm:w-[300px] h-[36px] rounded-[100%] blur-md pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${currentShade.hex}77 0%, ${currentShade.secondary_hex}33 50%, transparent 75%)`,
            transform: 'rotateX(80deg) translateZ(-40px)',
          }}
        />

        {/* High-Resolution Bottle Presentation (Switchable Open/Closed) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentShade.id}-${isOpenWand ? 'open' : 'bottle'}`}
            initial={{ opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full flex items-center justify-center"
            style={{ transform: 'translateZ(30px)' }}
          >
            <Image
              src={isOpenWand ? currentShade.image_open : currentShade.image_bottle}
              alt={isArabic ? currentShade.name_ar : currentShade.name_en}
              fill
              priority
              className="object-contain drop-shadow-[0_24px_45px_rgba(40,15,22,0.28)]"
              sizes="(max-width: 768px) 300px, 400px"
            />

            {/* Simulated 3D Glass Light Glint layer */}
            <motion.div
              style={{
                transform: `translateX(${-mouseTilt.x * 40}px) translateY(${-mouseTilt.y * 30}px) rotate(${15 + mouseTilt.x * 10}deg)`,
              }}
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full"
            />
          </motion.div>
        </AnimatePresence>

        {/* 3D Floating Interactive Badge */}
        <motion.div
          style={{ transform: 'translateZ(60px)' }}
          className="absolute -top-3 -right-2 sm:right-4 z-20"
        >
          <div
            className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-display tracking-widest uppercase backdrop-blur-md border shadow-lg flex items-center gap-1.5"
            style={{
              backgroundColor: `${currentShade.hex}22`,
              borderColor: `${currentShade.hex}66`,
              color: '#3A1E26',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse"
              style={{ backgroundColor: currentShade.hex }}
            />
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {isArabic ? currentShade.name_ar : currentShade.name_en}
            </span>
          </div>
        </motion.div>

        {/* View Toggle (Closed Flacon vs Open Wand with Droplet) */}
        {onToggleOpenWand && (
          <motion.button
            type="button"
            onClick={onToggleOpenWand}
            style={{ transform: 'translateZ(70px)' }}
            className="absolute -bottom-2 sm:bottom-2 z-20 px-4 py-2 rounded-full backdrop-blur-md bg-white/70 dark:bg-stone-900/80 border border-[#B08D57]/40 shadow-xl hover:bg-white dark:hover:bg-stone-800 transition-all text-xs font-display tracking-wider text-[#3A1E26] dark:text-[#FDFBF7] flex items-center gap-2 cursor-pointer group"
          >
            <RotateCw size={13} className="text-[#B08D57] group-hover:rotate-180 transition-transform duration-500" />
            <span>
              {isOpenWand
                ? isArabic
                  ? 'إغلاق القارورة الكريستالية'
                  : 'Close Flacon Cap'
                : isArabic
                ? 'استكشفي الموزع والقطرة'
                : 'Reveal Applicator Wand'}
            </span>
          </motion.button>
        )}
      </motion.div>

      {/* Floating Specs Pill below the 3D stage */}
      <div className="mt-4 flex items-center gap-4 text-xs font-body text-stone-600 dark:text-stone-300">
        <span className="flex items-center gap-1">
          <Sparkles size={12} className="text-[#B08D57]" />
          <span>{isArabic ? currentShade.finish_ar : currentShade.finish_en}</span>
        </span>
        <span className="w-1 h-1 rounded-full bg-stone-400" />
        <span>{isArabic ? currentShade.undertone_ar : currentShade.undertone_en}</span>
      </div>
    </div>
  );
};
