import { MetadataRoute } from 'next';
import { PERFUMES } from '@/lib/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lvenus.com';

  const productRoutes = PERFUMES.map((perfume) => ({
    url: `${baseUrl}/product/${perfume.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const staticRoutes = [
    '',
    '/shop',
    '/story',
    '/contact',
    '/legal/shipping',
    '/legal/returns',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}

