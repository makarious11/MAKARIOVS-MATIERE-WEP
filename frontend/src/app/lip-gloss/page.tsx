import LipGlossCatalogPage from '@/app/[locale]/lip-gloss/page';

export const dynamic = 'force-dynamic';

export default function RootLipGlossPage() {
  return <LipGlossCatalogPage params={Promise.resolve({ locale: 'en' })} />;
}
