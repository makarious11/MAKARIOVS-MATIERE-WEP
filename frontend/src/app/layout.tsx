import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { fontVariables } from '@/lib/fonts';
import { APP_NAME } from '@/lib/constants';
import '@/styles/globals.css';
import Providers from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MiniCart } from '@/components/layout/MiniCart';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { LoaderScreen } from '@/components/ui/LoaderScreen';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "L’VENUS — Maison de Parfum | Le Caire · Paris",
    template: `%s — L’VENUS`,
  },
  description:
    'Extrait de Parfum — Crafted by Makarious. Discover four rare fragrances rooted in Egyptian botanical alchemy and Parisian elegance.',
  keywords: [
    'perfume',
    'luxury perfume',
    'niche fragrance',
    'Extrait de Parfum',
    'Cairo',
    'Paris',
    'L’VENUS',
    'عطور نيش',
    'عطور فاخرة',
    'لوفينوس',
    'مكاريوس',
  ],
  openGraph: {
    type: 'website',
    siteName: "L’VENUS",
    locale: 'en_US',
    alternateLocale: 'ar_EG',
    images: [
      {
        url: '/images/products/packaging-mockup.jpg',
        width: 1200,
        height: 630,
        alt: "L’VENUS Luxury Extrait de Parfum",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/products/packaging-mockup.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRtl = locale === 'ar';

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/brand/VINUS_LOSO.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Sans+Arabic:wght@300;400;500&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('lv_theme');
                if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] antialiased selection:bg-[#6B1D2F] selection:text-[#FDFBF7] min-h-screen flex flex-col justify-between transition-colors duration-300">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <GrainOverlay />
            <CustomCursor />
            <LoaderScreen />
            <Header />
            <main className="flex-1">{children}</main>
            <MiniCart />
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
