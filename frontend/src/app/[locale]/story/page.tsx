'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';
import { SnakeDivider } from '@/components/ui/SnakeDivider';
import { MAISON_CATEGORIES } from '@/lib/catalog';

export default function StoryPage() {
  const pathname = usePathname();
  const isArabic = Boolean(pathname?.startsWith('/ar'));

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-32 pb-24 select-none transition-colors duration-300">
      <BotanicalPattern opacity={0.05} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="font-display text-xs tracking-[0.35em] uppercase text-[#B08D57] font-semibold">
            {isArabic ? 'دار لوفينوس للأناقة والعطور — القاهرة · باريس' : 'MAISON L’VENUS — LE CAIRE · PARIS'}
          </span>
          <h1
            className="text-4xl sm:text-6xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]"
            style={{
              fontFamily: isArabic ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300,
            }}
          >
            {isArabic ? 'سيرة الدار وفلسفتها' : 'The L’VENUS Monograph'}
          </h1>
          <p
            className="text-2xl text-[#6B1D2F] dark:text-[#DFCA9B] italic"
            style={{ fontFamily: isArabic ? "'Amiri', serif" : "'Pinyon Script', cursive" }}
          >
            {isArabic ? 'رؤية فنية تجمع بين أصالة الشرق وأناقة باريس — بإتقان مكاريوس' : 'Extrait de Parfum & Haute Créations — Crafted by Makarious'}
          </p>
        </div>

        {/* Featured Visual — Brand Identity Monograph Artwork */}
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-[#B08D57]/30 shadow-2xl bg-[#F1EADA] dark:bg-[#161210]">
          <Image
            src="/images/brand/NEW_brand-identity.png"
            alt="L’VENUS Classical Botanical & Architectural Monograph"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-4 rounded-2xl border border-[#B08D57]/40 pointer-events-none" />
        </div>

        {/* 2-Column Content Layout: Left Editorial Side-Profile Accent, Right Literary Essay */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Vertical Classical Torso & Laurel Accent */}
          <div className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center p-6 border-r border-[#B08D57]/20 sticky top-36">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#B08D57] -rotate-90 origin-center whitespace-nowrap mb-8 font-medium">
              {isArabic ? 'أرشيف دار لوفينوس' : 'MAISON L’VENUS ARCHIVE'}
            </span>
            <img
              src="/brand/Side_profile.svg"
              alt="Venus Torso & Laurel"
              className="w-32 h-auto object-contain opacity-85 dark:opacity-90 dark:brightness-0 dark:invert select-none my-4 drop-shadow-sm"
            />
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#B08D57] rotate-90 origin-center whitespace-nowrap mt-8 font-medium">
              {isArabic ? 'القاهرة · باريس' : 'LE CAIRE · PARIS'}
            </span>
            <div className="mt-10">
              <WaxSeal size={52} rotating />
            </div>
          </div>

          {/* Long-form Literary Story */}
          <div
            className="lg:col-span-9 prose prose-lg max-w-none text-[#3A332D] dark:text-[#C8C0B7] leading-relaxed space-y-7"
            style={{
              fontFamily: isArabic ? "'Cairo', 'Amiri', serif" : "'EB Garamond', Georgia, serif",
              fontSize: isArabic ? '18px' : '18px',
            }}
          >
            {isArabic ? (
              <>
                <p className="text-xl sm:text-2xl font-light text-[#14110F] dark:text-[#FDFBF7] leading-relaxed">
                  لوفينوس (L’VENUS) لم تولد كعلامة تجارية عابرة، ولم تُبنَ على أرقام أو صيحات مؤقتة. بدأت الدار في القاهرة كحلم فني عميق صاغه مكاريوس، يسعى لإحياء المعنى الحقيقي للفخامة المستدامة: الجمال الخالد، وندرة المكونات، وتقدير الحرفة اليدوية التي تتوارثها الأجيال.
                </p>

                <p>
                  منذ فجر الحضارة، كانت مصر موطن أندر النباتات العطرية والزهور الملكية وبلورات الراتنجات المقدسة. وفي المقابل، صاغت باريس على مر القرون أرقى تقاليد الخياطة الرفيعة وهندسة التصميم الفاخر. في لوفينوس، تلتقي هاتان الروحيتان في حوار إبداعي مستمر يجمع بين ثراء الشرق وسحر باريس.
                </p>

                <blockquote className="border-r-4 border-[#B08D57] pr-6 my-8 italic text-xl text-[#14110F] dark:text-[#FDFBF7] bg-[#F1EADA]/40 dark:bg-[#1C1613] py-4 rounded-l-2xl">
                  «الفخامة ليست ضجيجاً ولا تكراراً؛ الفخامة الحقيقية هي سكينة الإتقان، ونقاء المادة، وأثر يد الصانع الذي يمنح كل قطعة روحاً فريدة.»
                </blockquote>

                <h3 className="font-serif text-2xl text-[#14110F] dark:text-[#FDFBF7] font-normal pt-4">
                  فصول الدار — مسيرة تبدأ بالعطور وتمتد للأناقة الشاملة
                </h3>

                <p>
                  نبدأ رحلتنا اليوم بالفصل الأول: <strong>العطور الاستثنائية (Haute Parfumerie)</strong>، حيث نصوغ مستخلصات عطرية نقية (Extraits de Parfum) بتركيز نادر يتراوح بين ٣٢٪ و٣٨٪، لتدوم على البشرة كأثر ملكي لا يُمحى. تُتوج كل زجاجة بغطاء من خشب الجوز الداكن المحفور يدوياً، وتُختم بشمع الختم العنابي الإمبراطوري الذي يحمل نقش وجه فينوس الأثري.
                </p>

                <p>
                  وكما بنيت أعظم دور الأناقة في التاريخ على أسس راسخة، تمتد رؤية لوفينوس المستقبلية لتشمل خطوطاً متكاملة من <strong>العناية الفائقة بالبشرة (Soin Botanique)</strong> بمستخلصات الورد السكندري وزيوت الصحراء النادرة، مروراً بـ <strong>الأزياء الراقية (Haute Couture)</strong> المنسوجة من أندر أقطان مصر والحرير الفاخر، والمقتنيات الجلدية المحاكة يدوياً.
                </p>
              </>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-light text-[#14110F] dark:text-[#FDFBF7] leading-relaxed">
                  <span className="float-left text-7xl font-display font-light text-[#6B1D2F] dark:text-[#DFCA9B] leading-none pr-4 pt-1">
                    L
                  </span>
                  ’VENUS was not born in a commercial boardroom, nor conceived through the disposable lens of fleeting seasonal trends. Founded in Cairo by Makarious, the Maison was dreamed into existence out of an uncompromising reverence for authentic luxury: timeless materials, sovereign patience, and the human hand at work.
                </p>

                <p>
                  Egypt has forever been the cradle of sacred botanicals, rare fossilized resins, and fragrant flora harvested along the life-giving Nile. Millennia later, Paris codified the world’s most exacting standards of haute couture and architectural proportions. At L’VENUS, these twin traditions unite in a dialogue of sovereign prestige.
                </p>

                <blockquote className="border-l-4 border-[#B08D57] pl-6 my-8 italic text-xl text-[#14110F] dark:text-[#FDFBF7] bg-[#F1EADA]/40 dark:bg-[#1C1613] py-4 rounded-r-2xl font-serif">
                  “True luxury is never noisy or rushed. It is the quiet authority of pure ingredients, architectural balance, and the indelible imprint of master craft.”
                </blockquote>

                <h3 className="font-serif text-2xl text-[#14110F] dark:text-[#FDFBF7] font-normal pt-4">
                  The Maison’s Lineage — From Haute Parfumerie to Complete Art de Vivre
                </h3>

                <p>
                  Our journey commences with Chapter I: <strong>La Haute Parfumerie</strong>. Four monumental Extraits de Parfum, formulated at an extraordinary concentration of 32% to 38% pure oil. Each flacon is hewn from heavy glass, crowned with a hand-carved dark walnut cap bearing the classical Venus relief, and sealed by hand with our signature burgundy wax stamp.
                </p>

                <p>
                  In the grand tradition of historic Parisian Maisons, L’VENUS is conceived as a multi-disciplinary house of style. Our creative horizon encompasses future chapters in <strong>Soin Botanique</strong> (cellular skincare infused with Alexandrian rose), <strong>Haute Couture</strong> tailored in Egyptian long-staple cotton and fine silk faille, and hand-stitched leather travel chests.
                </p>
              </>
            )}

            <SnakeDivider opacity={0.35} />

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between border-t border-[#B08D57]/20 gap-6">
              <div className="flex items-center gap-4">
                <WaxSeal size={52} />
                <div>
                  <span className="font-display text-sm uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] font-semibold block">
                    Makarious
                  </span>
                  <span className="text-xs text-[#8C6E3D] dark:text-[#DFCA9B] italic font-serif">
                    {isArabic ? 'المؤسس والمدير الإبداعي — دار لوفينوس' : 'Founder & Creative Director — Maison L’VENUS'}
                  </span>
                </div>
              </div>

              <Link
                href={isArabic ? '/ar/shop' : '/shop'}
                className="px-8 py-3.5 rounded-full bg-[#14110F] dark:bg-[#1E1714] border border-[#B08D57]/30 text-[#FDFBF7] text-xs uppercase tracking-widest font-medium hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] transition-all shadow-md"
              >
                {isArabic ? 'استكشف إبداعات الدار' : 'Discover the Creations'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
