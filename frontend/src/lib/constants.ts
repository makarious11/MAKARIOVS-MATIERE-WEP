// ============================================================
// L'VENUS — App Constants & Brand Configuration
// "MAISON DE PARFUM — LE CAIRE · PARIS"
// ============================================================

export const BRAND_NAME = "L'VENUS";
export const BRAND_NAME_AR = 'لوفينوس';
export const BRAND_TAGLINE = 'Extrait de Parfum — Crafted by Makarious';
export const BRAND_TAGLINE_AR = 'خلاصة العطر — بإتقان مكاريوس';
export const BRAND_ORIGIN = 'MAISON DE PARFUM — LE CAIRE · PARIS';
export const BRAND_ORIGIN_AR = 'دار العطور الفاخرة — القاهرة · باريس';

export const APP_NAME = "L'VENUS";
export const APP_NAME_AR = 'لوفينوس';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export const DEFAULT_LOCALE = 'en' as const;

export function isAdminRoute(pathname?: string | null): boolean {
  return Boolean(pathname && /^\/(?:ar\/)?admin(?:\/|$)/.test(pathname));
}

// Egyptian governorates with shipping info & pricing
export const GOVERNORATES = [
  { value: 'cairo', label_en: 'Cairo', label_ar: 'القاهرة', fee: 65, eta_en: '1-2 business days', eta_ar: 'خلال 1-2 يوم عمل' },
  { value: 'giza', label_en: 'Giza', label_ar: 'الجيزة', fee: 65, eta_en: '1-2 business days', eta_ar: 'خلال 1-2 يوم عمل' },
  { value: 'alexandria', label_en: 'Alexandria', label_ar: 'الإسكندرية', fee: 85, eta_en: '2-3 business days', eta_ar: 'خلال 2-3 أيام عمل' },
  { value: 'luxor', label_en: 'Luxor', label_ar: 'الأقصر', fee: 110, eta_en: '3-4 business days', eta_ar: 'خلال 3-4 أيام عمل' },
  { value: 'aswan', label_en: 'Aswan', label_ar: 'أسوان', fee: 120, eta_en: '3-5 business days', eta_ar: 'خلال 3-5 أيام عمل' },
  { value: 'port_said', label_en: 'Port Said', label_ar: 'بورسعيد', fee: 90, eta_en: '2-3 business days', eta_ar: 'خلال 2-3 أيام عمل' },
  { value: 'suez', label_en: 'Suez', label_ar: 'السويس', fee: 90, eta_en: '2-3 business days', eta_ar: 'خلال 2-3 أيام عمل' },
  { value: 'ismailia', label_en: 'Ismailia', label_ar: 'الإسماعيلية', fee: 90, eta_en: '2-3 business days', eta_ar: 'خلال 2-3 أيام عمل' },
  { value: 'mansoura', label_en: 'Mansoura (Dakahlia)', label_ar: 'المنصورة (الدقهلية)', fee: 85, eta_en: '2-3 business days', eta_ar: 'خلال 2-3 أيام عمل' },
  { value: 'tanta', label_en: 'Tanta (Gharbia)', label_ar: 'طنطا (الغربية)', fee: 85, eta_en: '2-3 business days', eta_ar: 'خلال 2-3 أيام عمل' },
  { value: 'zagazig', label_en: 'Zagazig (Sharqia)', label_ar: 'الزقازيق (الشرقية)', fee: 85, eta_en: '2-3 business days', eta_ar: 'خلال 2-3 أيام عمل' },
  { value: 'damanhur', label_en: 'Damanhur (Beheira)', label_ar: 'دمنهور (البحيرة)', fee: 85, eta_en: '2-3 business days', eta_ar: 'خلال 2-3 أيام عمل' },
  { value: 'fayoum', label_en: 'Fayoum', label_ar: 'الفيوم', fee: 95, eta_en: '2-4 business days', eta_ar: 'خلال 2-4 أيام عمل' },
  { value: 'beni_suef', label_en: 'Beni Suef', label_ar: 'بني سويف', fee: 95, eta_en: '2-4 business days', eta_ar: 'خلال 2-4 أيام عمل' },
  { value: 'minya', label_en: 'Minya', label_ar: 'المنيا', fee: 100, eta_en: '3-4 business days', eta_ar: 'خلال 3-4 أيام عمل' },
  { value: 'asyut', label_en: 'Asyut', label_ar: 'أسيوط', fee: 100, eta_en: '3-4 business days', eta_ar: 'خلال 3-4 أيام عمل' },
  { value: 'sohag', label_en: 'Sohag', label_ar: 'سوهاج', fee: 110, eta_en: '3-4 business days', eta_ar: 'خلال 3-4 أيام عمل' },
  { value: 'qena', label_en: 'Qena', label_ar: 'قنا', fee: 110, eta_en: '3-4 business days', eta_ar: 'خلال 3-4 أيام عمل' },
  { value: 'red_sea', label_en: 'Red Sea (Hurghada / Gouna)', label_ar: 'البحر الأحمر (الغردقة / الجونة)', fee: 125, eta_en: '3-5 business days', eta_ar: 'خلال 3-5 أيام عمل' },
  { value: 'matrouh', label_en: 'Matrouh / North Coast', label_ar: 'مطروح / الساحل الشمالي', fee: 120, eta_en: '3-5 business days', eta_ar: 'خلال 3-5 أيام عمل' },
  { value: 'north_sinai', label_en: 'North Sinai', label_ar: 'شمال سيناء', fee: 140, eta_en: '4-6 business days', eta_ar: 'خلال 4-6 أيام عمل' },
  { value: 'south_sinai', label_en: 'South Sinai (Sharm El Sheikh)', label_ar: 'جنوب سيناء (شرم الشيخ)', fee: 140, eta_en: '4-6 business days', eta_ar: 'خلال 4-6 أيام عمل' },
  { value: 'new_valley', label_en: 'New Valley', label_ar: 'الوادي الجديد', fee: 140, eta_en: '4-6 business days', eta_ar: 'خلال 4-6 أيام عمل' },
] as const;

export type Governorate = (typeof GOVERNORATES)[number]['value'];

export const BRAND_COLORS = {
  paper: '#FDFBF7',
  paper2: '#F1EADA',
  ink: '#14110F',
  inkSoft: '#3A332D',
  wax: '#6B1D2F',
  gold: '#B08D57',
} as const;

export const NOTES_FAMILIES = [
  'floral',
  'oriental',
  'woody',
  'fresh',
  'fougere',
  'chypre',
  'gourmand',
  'aquatic',
] as const;

/** Minimum order for free shipping (EGP) */
export const FREE_SHIPPING_THRESHOLD = 2500;

export const PAGINATION_LIMIT = 12;
