'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Anchor } from 'lucide-react';

interface NotesPyramidProps {
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  isArabic?: boolean;
}

export const NotesPyramid: React.FC<NotesPyramidProps> = ({
  topNotes,
  heartNotes,
  baseNotes,
  isArabic = false,
}) => {
  const layers = [
    {
      title: isArabic ? 'القمة العطرية (الافتتاحية)' : 'Top Notes (The Awakening)',
      subtitle: isArabic ? 'الانطباع الأول المنعش (١٥ إلى ٣٠ دقيقة)' : '15–30 minutes of luminous botanical radiance',
      icon: Sparkles,
      notes: topNotes,
      bg: 'bg-[#FDFBF7] dark:bg-[#161210]',
      border: 'border-[#B08D57]/30',
      badgeBg: 'bg-[#B08D57]/15 dark:bg-[#B08D57]/20 text-[#8C6E3D] dark:text-[#DFCA9B]',
    },
    {
      title: isArabic ? 'قلب العطر (الجوهر الخيميائي)' : 'Heart Notes (The Essence)',
      subtitle: isArabic ? 'الروح العطرية الأساسية (٢ إلى ٦ ساعات)' : '2–6 hours of profound floral and resinous depth',
      icon: Heart,
      notes: heartNotes,
      bg: 'bg-[#F1EADA]/60 dark:bg-[#1A1412]',
      border: 'border-[#B08D57]/40',
      badgeBg: 'bg-[#6B1D2F]/15 dark:bg-[#6B1D2F]/30 text-[#6B1D2F] dark:text-[#DFCA9B]',
    },
    {
      title: isArabic ? 'قاعدة العطر (الأثر الخالد)' : 'Base Notes (The Foundation)',
      subtitle: isArabic ? 'العمق والثبات الملكي (١٤ إلى ٢٤ ساعة)' : '14–24+ hours of antique woods and sovereign amber',
      icon: Anchor,
      notes: baseNotes,
      bg: 'bg-[#14110F] dark:bg-[#0A0706]',
      border: 'border-[#B08D57]/50',
      textColor: 'text-[#FDFBF7]',
      badgeBg: 'bg-[#B08D57]/20 text-[#B08D57]',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs tracking-widest uppercase text-[#14110F] dark:text-[#FDFBF7]">
          {isArabic ? 'هرم النفحات الخيميائية' : 'Olfactory Pyramid'}
        </span>
        <span className="font-body text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/80 italic">
          {isArabic ? '٣ طبقات متدرجة النقاء' : '3-Tier Evolution'}
        </span>
      </div>

      <div className="space-y-3">
        {layers.map((layer, idx) => {
          const Icon = layer.icon;
          const isDark = idx === 2;

          return (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`p-4 sm:p-5 rounded-2xl border ${layer.border} ${layer.bg} space-y-2.5 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={isDark ? 'text-[#B08D57]' : 'text-[#6B1D2F] dark:text-[#DFCA9B]'} />
                  <span
                    className={`font-display text-xs uppercase tracking-wider font-semibold ${
                      isDark ? 'text-[#FDFBF7]' : 'text-[#14110F] dark:text-[#FDFBF7]'
                    }`}
                  >
                    {layer.title}
                  </span>
                </div>
                <span
                  className={`text-[11px] ${
                    isDark ? 'text-[#FDFBF7]/60' : 'text-[#3A332D]/70 dark:text-[#DFCA9B]/70'
                  } hidden sm:block`}
                  style={{ fontFamily: isArabic ? "'Amiri', serif" : 'var(--font-body)' }}
                >
                  {layer.subtitle}
                </span>
              </div>

              {/* Notes Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {layer.notes.map((note) => (
                  <span
                    key={note}
                    className={`px-3 py-1 rounded-full text-xs font-display tracking-wider border border-[#B08D57]/30 ${layer.badgeBg}`}
                  >
                    {note}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
