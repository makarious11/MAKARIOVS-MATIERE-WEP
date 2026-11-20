'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { LipGlossThreeCanvas } from './LipGlossThreeCanvas';

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

  return (
    <div className={`relative w-full flex flex-col items-center justify-center ${className}`}>
      {/* Real-time 3D Flacon Stage (Transparent, Background-Free, Heroic Size) */}
      <div className="w-full flex items-center justify-center">
        <LipGlossThreeCanvas
          activeShadeId={activeShadeId}
          isOpenWand={isOpenWand}
          onToggleOpenWand={onToggleOpenWand}
          scrollY={scrollY}
          isArabic={isArabic}
        />
      </div>

      {/* Floating Specs Pill below the 3D stage */}
      <div className="mt-3 flex items-center gap-4 text-xs font-body text-stone-600 dark:text-stone-300">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles size={13} className="text-[#B08D57]" />
          <span>{isArabic ? currentShade.finish_ar : currentShade.finish_en}</span>
        </span>
        <span className="w-1 h-1 rounded-full bg-stone-400" />
        <span>{isArabic ? currentShade.undertone_ar : currentShade.undertone_en}</span>
      </div>
    </div>
  );
};
