'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { ScentFinderQuiz } from '@/components/ui/ScentFinderQuiz';

interface HeroSectionProps {
  isArabic?: boolean;
}

/** Golden speck particles that float upward slowly */
const GOLD_PARTICLES = [
  { id: 0, x: 18, delay: 0, duration: 11, size: 3 },
  { id: 1, x: 42, delay: 4, duration: 13, size: 2 },
  { id: 2, x: 68, delay: 2, duration: 12, size: 2.5 },
  { id: 3, x: 86, delay: 6, duration: 15, size: 3 },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ isArabic = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [sliderWidth, setSliderWidth] = useState(256);

  /* Mouse parallax */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const bottleX = useTransform(mouseX, [-0.5, 0.5], [-14, 14]);
  const bottleY = useTransform(mouseY, [-0.5, 0.5], [-10, 10]);
  const titleX = useTransform(mouseX, [-0.5, 0.5], [10, -10]);
  const titleY = useTransform(mouseY, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX / innerWidth - 0.5);
    mouseY.set(clientY / innerHeight - 0.5);
  };

  /* Draggable slide-to-discover */
  const dragX = useMotionValue(0);

  useEffect(() => {
    if (trackRef.current) setSliderWidth(trackRef.current.offsetWidth);
  }, []);

  const handleDragEnd = () => {
    const threshold = (sliderWidth - 48) * 0.7;
    if (dragX.get() >= threshold) {
      document.getElementById('collection-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    dragX.set(0);
  };

  return (
    <section
      ref={containerRef}
      dir={isArabic ? 'rtl' : 'ltr'}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex flex-col justify-between items-center overflow-hidden pt-24 sm:pt-28 pb-12 select-none"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 30%, #281512 0%, #0D0A08 65%)' }}
    >
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Bottom cream fade transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(20,17,15,0.7))',
        }}
      />

      {/* Botanical texture at low opacity */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.07]">
        <BotanicalPattern opacity={1} />
      </div>

      {/* Decorative vertical hairlines */}
      <div
        className="absolute top-16 bottom-16 left-6 md:left-12 w-px pointer-events-none z-10"
        style={{ background: 'rgba(176,141,87,0.22)' }}
      />
      <div
        className="absolute top-16 bottom-16 right-6 md:right-12 w-px pointer-events-none z-10"
        style={{ background: 'rgba(176,141,87,0.22)' }}
      />

      {/* Floating golden dust particles */}
      {GOLD_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none z-10"
          style={{
            left: `${p.x}%`,
            bottom: '12%',
            width: p.size,
            height: p.size,
            background: 'radial-gradient(circle, #D4AF37 0%, rgba(176,141,87,0.1) 80%)',
          }}
          animate={{
            y: [-20, -320],
            opacity: [0, 0.8, 0],
            scale: [0.7, 1.2, 0.6],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Top Origin Tagline */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-20 text-center"
      >
        <span
          className="text-xs sm:text-sm tracking-widest uppercase font-medium block"
          style={{
            fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : 'var(--font-display)',
            color: 'rgba(176,141,87,0.85)',
            letterSpacing: isArabic ? '0.05em' : '0.3em',
          }}
        >
          {isArabic ? 'دار العطور الفاخرة — القاهرة · باريس' : 'MAISON DE PARFUM — LE CAIRE · PARIS'}
        </span>
      </motion.div>

      {/* Central 3D Composition: Behind Title -> Hero Bottle -> Front Title */}
      <div className="relative w-full max-w-6xl my-auto flex items-center justify-center py-6 px-4">
        {/* LAYER 1 — Giant Outline Brand Name BEHIND bottle (z-10) */}
        <motion.div
          style={{ x: titleX, y: titleY }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{
              fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', 'Playfair Display', serif",
              fontSize: 'clamp(80px, 14vw, 180px)',
              lineHeight: 0.9,
              color: 'transparent',
              WebkitTextStroke: '1.5px rgba(176,141,87,0.65)',
              letterSpacing: isArabic ? '0.04em' : '0.15em',
              fontWeight: 300,
              textTransform: 'uppercase',
            }}
          >
            {isArabic ? 'لوفينوس' : "L’VENUS"}
          </motion.h1>
        </motion.div>

        {/* LAYER 2 — Arch Frame + Hero Venus Emblem & Logo (z-20) */}
        <motion.div
          style={{ x: bottleX, y: bottleY }}
          animate={{ y: [-5, 6, -5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-20 w-72 md:w-96 lg:w-[420px] aspect-[3/4] flex items-center justify-center"
        >
          {/* Arch-shaped warm dark pedestal frame */}
          <div
            className="absolute inset-x-3 bottom-4 top-4 rounded-t-[200px] rounded-b-3xl -z-10 overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse at 50% 40%, #2A1713 0%, #160F0C 65%, #0D0A08 100%)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(176,141,87,0.3)',
            }}
          >
            {/* Inner golden hairline arch */}
            <div
              className="absolute inset-[4px] rounded-t-[196px] rounded-b-2xl pointer-events-none"
              style={{ border: '1px solid rgba(176,141,87,0.4)' }}
            />
            {/* Secondary delicate inner accent border */}
            <div
              className="absolute inset-[9px] rounded-t-[191px] rounded-b-xl pointer-events-none opacity-40"
              style={{ border: '0.5px dashed rgba(176,141,87,0.5)' }}
            />
          </div>

          {/* Golden and Burgundy warm glow behind Venus Emblem */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(107,29,47,0.35) 0%, rgba(176,141,87,0.2) 45%, transparent 75%)',
            }}
          />

          {/* Majestic L'VENUS Logo Emblem Centerpiece */}
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
            {/* Rotating Celestial Stippled Halo */}
            <svg
              className="absolute w-60 h-60 sm:w-72 sm:h-72 pointer-events-none opacity-50"
              viewBox="0 0 200 200"
              fill="none"
            >
              <circle
                cx="100"
                cy="100"
                r="92"
                stroke="#B08D57"
                strokeWidth="0.75"
                strokeDasharray="4 6"
                className="animate-[spin_45s_linear_infinite]"
                style={{ transformOrigin: '100px 100px' }}
              />
              <circle
                cx="100"
                cy="100"
                r="84"
                stroke="#B08D57"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </svg>

            {/* Glowing Golden Aura */}
            <div className="absolute w-44 h-44 rounded-full bg-[#B08D57]/20 blur-3xl pointer-events-none" />

            {/* Venus Sculpture Engraving — Large, Crisp & Majestic */}
            <div className="relative z-10 flex flex-col items-center group cursor-default">
              <motion.div
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <img
                  src="/brand/VINUS_LOSO.svg"
                  alt="L'VENUS Classical Venus Emblem"
                  className="w-40 h-40 sm:w-52 sm:h-52 md:w-56 md:h-56 object-contain brightness-0 invert drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)] filter"
                />
              </motion.div>

              {/* Burgundy Wax Seal Stamp Accent */}
              <div className="relative -mt-6 sm:-mt-8 z-20 transition-transform duration-500 hover:scale-110">
                <WaxSeal size={isArabic ? 64 : 68} animateStamp={false} />
              </div>

              {/* Maison Heritage Line */}
              <div className="mt-5 sm:mt-6 flex flex-col items-center space-y-1">
                <span className="font-display text-[11px] sm:text-xs tracking-[0.35em] uppercase text-[#B08D57] font-semibold">
                  {isArabic ? 'دار العطور الفاخرة' : 'MAISON DE PARFUM'}
                </span>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-[#FDFBF7]/70 font-light">
                  <span>LE CAIRE</span>
                  <span className="w-1 h-1 rounded-full bg-[#B08D57]" />
                  <span>PARIS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Soft shadow under pedestal */}
          <div
            className="absolute -bottom-6 inset-x-8 h-8 rounded-[100%] blur-2xl -z-10"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          />
        </motion.div>

        {/* LAYER 3 — Front depth overlap & script tagline IN FRONT (z-30) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-30">
          <motion.div style={{ x: titleX, y: titleY }} className="flex flex-col items-center">
            {/* Invisible spacer matching title dimensions */}
            <div
              style={{ fontSize: 'clamp(80px, 14vw, 180px)', lineHeight: 0.9, visibility: 'hidden', userSelect: 'none' }}
              aria-hidden="true"
            >
              {isArabic ? 'لوفينوس' : "L’VENUS"}
            </div>

            {/* Script Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ duration: 1, delay: 0.65 }}
              style={{
                fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive",
                fontStyle: isArabic ? 'italic' : 'normal',
                fontSize: isArabic ? '22px' : 'clamp(22px, 2.5vw, 34px)',
                color: '#FDFBF7',
                marginTop: '1.2rem',
                letterSpacing: '0.04em',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              }}
            >
              {isArabic ? 'خلاصة العطر — بإتقان مكاريوس' : 'Extrait de Parfum — Crafted by Makarious'}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Draggable Slide-To-Discover */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.85 }}
        className="relative z-30 flex flex-col items-center space-y-3 mt-6 sm:mt-10"
      >
        <div
          ref={trackRef}
          className="ios-glass-pill-dark relative w-64 sm:w-72 h-12 rounded-full p-1 flex items-center overflow-hidden transition-all duration-300"
        >
          {/* Track label */}
          <span
            className="w-full text-center text-[11px] uppercase tracking-widest select-none"
            style={{
              fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : 'var(--font-display)',
              color: 'rgba(253,251,247,0.7)',
              paddingRight: isArabic ? 0 : '2rem',
              paddingLeft: isArabic ? '2rem' : 0,
            }}
          >
            {isArabic ? 'اسحب لاكتشاف العطور' : 'Slide to discover'}
          </span>

          {/* Draggable Burgundy Wax Handle with Venus logo */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: sliderWidth - 44 }}
            dragElastic={0.07}
            onDragEnd={handleDragEnd}
            className="absolute w-10 h-10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
            style={{
              x: dragX,
              background: '#6B1D2F',
              boxShadow: '0 2px 14px rgba(107,29,47,0.7)',
              left: isArabic ? undefined : 4,
              right: isArabic ? 4 : undefined,
            }}
          >
            <ChevronRight
              size={16}
              className="text-[#FDFBF7]"
              style={{ transform: isArabic ? 'scaleX(-1)' : undefined }}
            />
          </motion.div>
        </div>

        <span
          className="text-[11px] tracking-wider"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'rgba(253,251,247,0.45)',
          }}
        >
          {isArabic ? 'أربعة عطور نيش استثنائية' : 'Four Uncompromising Fragrances'}
        </span>

        {/* Interactive Scent Finder Quiz Button */}
        <div className="pt-2">
          <ScentFinderQuiz />
        </div>
      </motion.div>
    </section>
  );
};
