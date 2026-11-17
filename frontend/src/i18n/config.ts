import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/constants';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE };

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** next-intl routing config */
export const i18nConfig = {
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
} as const;
