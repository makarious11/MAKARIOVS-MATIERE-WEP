import LocalizedShopPage from '@/app/[locale]/shop/page';

export const dynamic = 'force-dynamic';

export default function RootShopPage() {
  return <LocalizedShopPage params={Promise.resolve({ locale: 'en' })} />;
}
