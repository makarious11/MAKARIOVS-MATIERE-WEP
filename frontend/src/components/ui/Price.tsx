'use client';

import React, { useEffect, useState } from 'react';
import { useCurrencyStore, CURRENCIES } from '@/store/currencyStore';
import { usePathname } from 'next/navigation';

interface PriceProps {
  amount: number;
  className?: string;
  showOriginalEGP?: boolean;
}

export const Price: React.FC<PriceProps> = ({ amount, className = '', showOriginalEGP = false }) => {
  const [mounted, setMounted] = useState(false);
  const { currency, formatPrice } = useCurrencyStore();
  const pathname = usePathname();
  const isArabic = pathname ? pathname.startsWith('/ar') : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Default server render in EGP to avoid hydration mismatch
    const fallbackFormatted = `${amount.toLocaleString(isArabic ? 'ar-EG' : 'en-US')} ${isArabic ? 'ج.م' : 'EGP'}`;
    return <span className={className}>{fallbackFormatted}</span>;
  }

  const formatted = formatPrice(amount, isArabic);

  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span>{formatted}</span>
      {showOriginalEGP && currency !== 'EGP' && (
        <span className="text-[0.75em] opacity-50 font-normal">
          ({amount.toLocaleString(isArabic ? 'ar-EG' : 'en-US')} {isArabic ? 'ج.م' : 'EGP'})
        </span>
      )}
    </span>
  );
};

