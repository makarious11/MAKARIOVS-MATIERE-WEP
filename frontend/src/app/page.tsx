import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { HeroSection } from '@/components/home/HeroSection';
import { BrandStoryStrip } from '@/components/home/BrandStoryStrip';
import { CollectionSection } from '@/components/home/CollectionSection';
import { CraftSection } from '@/components/home/CraftSection';
import { NotesExplorer } from '@/components/home/NotesExplorer';
import { ReviewsMarquee } from '@/components/home/ReviewsMarquee';
import { FinalCTA } from '@/components/home/FinalCTA';

export const metadata: Metadata = {
  title: "L’VENUS — Maison de Parfum | Le Caire · Paris",
  description:
    'Extrait de Parfum — Crafted by Makarious. Discover four rare fragrances rooted in Egyptian botanical alchemy and Parisian elegance.',
};

export default async function HomePage() {
  const locale = await getLocale();
  const isArabic = locale === 'ar';

  return (
    <div className="w-full">
      {/* 1. Immersive Hero (100vh) with L'VENUS 3D depth */}
      <HeroSection isArabic={isArabic} />

      {/* 2. Brand Story Strip with Side_profile accent */}
      <BrandStoryStrip isArabic={isArabic} />

      {/* 3. The 4 Extraits Collection (--ink background) */}
      <CollectionSection isArabic={isArabic} />

      {/* 4. Signature Craft & Apothecary Atelier */}
      <CraftSection isArabic={isArabic} />

      {/* 5. Interactive Ingredient Explorer */}
      <NotesExplorer isArabic={isArabic} />

      {/* 6. Testimonials Marquee */}
      <ReviewsMarquee isArabic={isArabic} />

      {/* 7. Final Wax Seal CTA */}
      <FinalCTA isArabic={isArabic} />
    </div>
  );
}
