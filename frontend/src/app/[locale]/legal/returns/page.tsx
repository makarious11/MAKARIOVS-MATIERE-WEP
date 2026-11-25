import React from 'react';
import Link from 'next/link';

export default function ReturnsPolicyPage() {
  return (
    <div className="relative min-h-screen bg-[#FBF8EE] pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="font-display text-xs tracking-widest3 uppercase text-[#B08D57]">
            Sanctuary Guarantee
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-widest text-[#14110F]">
            Returns & Exchanges
          </h1>
        </div>

        <div className="prose prose-sm font-body text-[#3A332D] leading-relaxed space-y-4">
          <p>
            Due to the delicate alchemical nature and high concentration of our Extraits de Parfum (32%–38% pure perfume oils), we uphold strict return protocols to preserve olfactory purity.
          </p>
          <h3 className="font-display uppercase text-sm text-[#14110F]">The Wax Seal Protocol</h3>
          <p>
            Each parcel arrives with a complimentary 2ml sample vial of the fragrance purchased. We invite you to experience the fragrance using the sample vial first. If the scent does not harmonize with your skin chemistry, you may return the full-size flacon within 14 days, provided the burgundy wax seal and box outer sleeve remain entirely intact and undamaged.
          </p>
          <h3 className="font-display uppercase text-sm text-[#14110F]">Damaged or Defective Consignments</h3>
          <p>
            In the rare event of transit damage, notify our concierge within 48 hours of delivery at{' '}
            <a href="mailto:concierge@lvenus.com" className="underline text-[#6B1D2F]">concierge@lvenus.com</a>{' '}
            with photographic documentation. A courier will be dispatched to exchange your vessel immediately.
          </p>
        </div>

        <div className="pt-6 text-center">
          <Link
            href="/shop"
            className="px-8 py-3 rounded-full bg-[#14110F] text-[#FBF8EE] font-display text-xs uppercase tracking-widest hover:bg-[#6E1423] transition-colors"
          >
            Back to Collection
          </Link>
        </div>
      </div>
    </div>
  );
}

