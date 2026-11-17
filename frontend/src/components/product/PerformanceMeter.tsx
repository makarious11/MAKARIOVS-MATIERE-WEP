'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PerformanceMeterProps {
  longevity: number; // 1-10
  sillage: number;   // 1-10
  intensity: number; // 1-10
  isArabic?: boolean;
}

export const PerformanceMeter: React.FC<PerformanceMeterProps> = ({
  longevity,
  sillage,
  intensity,
  isArabic = false,
}) => {
  const metrics = [
    {
      label: isArabic ? 'الثبات (الدوام على البشرة والأقمشة)' : 'Longevity (Persistence)',
      value: longevity,
      description: isArabic ? '١٤ إلى ١٨+ ساعة بتركيز إكستري' : '14–18+ hours on pulse points & fine fabrics',
    },
    {
      label: isArabic ? 'الفوحان (الهالة العطرية)' : 'Sillage (Projection Aura)',
      value: sillage,
      description: isArabic ? 'هالة ملكية دافئة تحيط بك بنقاء' : 'Intimate yet undeniable 2–3 meter radiance',
    },
    {
      label: isArabic ? 'كثافة الزيوت العطرية' : 'Concentration Intensity',
      value: intensity,
      description: isArabic ? '٣٢٪ إلى ٣٨٪ زيوت مقطرة نقية' : '32%–38% pure perfume oils maceration',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs tracking-widest uppercase text-[#14110F] dark:text-[#FDFBF7]">
          {isArabic ? 'مؤشرات الأداء العطري' : 'Performance Profile'}
        </span>
        <span className="font-body text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/80 italic">
          Extrait Grade
        </span>
      </div>

      <div className="space-y-4 p-5 rounded-2xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/25 dark:border-[#B08D57]/30">
        {metrics.map((m) => {
          const percent = (m.value / 10) * 100;

          return (
            <div key={m.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] font-medium">
                  {m.label}
                </span>
                <span className="font-display text-[#B08D57] font-semibold">
                  {m.value} / 10
                </span>
              </div>

              {/* Progress Bar Hairline */}
              <div className="h-1.5 w-full bg-[#14110F]/10 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-gradient-to-r from-[#B08D57] via-[#C8A97A] to-[#6B1D2F] rounded-full"
                />
              </div>

              <span
                className="text-[11px] text-[#3A332D]/70 dark:text-[#DFCA9B]/70 block"
                style={{ fontFamily: isArabic ? "'Amiri', serif" : 'var(--font-body)' }}
              >
                {m.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
