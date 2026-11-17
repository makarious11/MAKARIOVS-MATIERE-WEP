import { create } from 'zustand';

export type CurrencyCode = 'EGP' | 'SAR' | 'AED' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol_en: string;
  symbol_ar: string;
  name_en: string;
  name_ar: string;
  rateAgainstEGP: number; // 1 EGP = x Currency
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  EGP: {
    code: 'EGP',
    symbol_en: 'EGP',
    symbol_ar: 'ج.م',
    name_en: 'Egyptian Pound',
    name_ar: 'جنيه مصري',
    rateAgainstEGP: 1,
  },
  SAR: {
    code: 'SAR',
    symbol_en: 'SAR',
    symbol_ar: 'ر.س',
    name_en: 'Saudi Riyal',
    name_ar: 'ريال سعودي',
    rateAgainstEGP: 0.076,
  },
  AED: {
    code: 'AED',
    symbol_en: 'AED',
    symbol_ar: 'د.إ',
    name_en: 'UAE Dirham',
    name_ar: 'درهم إماراتي',
    rateAgainstEGP: 0.074,
  },
  USD: {
    code: 'USD',
    symbol_en: '$',
    symbol_ar: '$',
    name_en: 'US Dollar',
    name_ar: 'دولار أمريكي',
    rateAgainstEGP: 0.020,
  },
};

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (amountInEGP: number, isArabic?: boolean) => string;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: 'EGP',
  setCurrency: (currency: CurrencyCode) => {
    set({ currency });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lv_currency', currency);
      } catch {}
    }
  },
  formatPrice: (amountInEGP: number, isArabic = false) => {
    const curCode = get().currency;
    const config = CURRENCIES[curCode] || CURRENCIES.EGP;
    const converted = Math.round(amountInEGP * config.rateAgainstEGP);
    const formattedNum = converted.toLocaleString(isArabic ? 'ar-EG' : 'en-US');
    const symbol = isArabic ? config.symbol_ar : config.symbol_en;
    
    if (curCode === 'USD') {
      return `$${formattedNum}`;
    }
    return isArabic ? `${formattedNum} ${symbol}` : `${symbol} ${formattedNum}`;
  },
}));

