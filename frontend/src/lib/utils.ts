import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price amount with currency symbol.
 * @param amount   – raw number (e.g. 350)
 * @param currency – ISO code, default 'EGP'
 * @param locale   – BCP-47 locale, default 'en-EG'
 */
export function formatPrice(
  amount: number,
  currency = 'EGP',
  locale = 'en-EG',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Build an absolute URL for a Laravel-served image.
 * Falls back to a placeholder if path is empty.
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/images/placeholder.webp';
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  return `${base}/storage/${path}`;
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Slugify a string (English + Arabic-safe) */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]+/g, '')
    .replace(/--+/g, '-');
}
