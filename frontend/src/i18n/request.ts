// next-intl server-side request config
import { getRequestConfig } from 'next-intl/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/constants';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate; fall back to default
  if (!locale || !SUPPORTED_LOCALES.includes(locale as typeof SUPPORTED_LOCALES[number])) {
    locale = DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
