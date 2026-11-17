import React from 'react';
import Link from 'next/link';
import { EGYPT_GOVERNORATES } from '@/components/checkout/GovernorateSelect';

export default function ShippingPolicyPage() {
  return (
    <div className="relative min-h-screen bg-[#FBF8EE] pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="font-display text-xs tracking-widest3 uppercase text-[#B08D57]">
            Apothecary Logistics
          </span>
          <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-widest text-[#14110F]">
            Shipping & Governorate Rates
          </h1>
        </div>

        <div className="prose prose-sm font-body text-[#3A332D] leading-relaxed space-y-4">
          <p>
            All bottles of MAKARIOVS & MATIÈRE are dispatched from our Cairo fulfillment vault in temperature-controlled, shock-absorbent packaging. Each parcel is hand-sealed with authentic burgundy wax and accompanied by a handwritten certificate of authenticity.
          </p>
          <p>
            <strong>Complimentary Delivery:</strong> Orders exceeding 1,500 EGP qualify for complimentary white-glove courier shipping across all 27 Egyptian governorates.
          </p>
        </div>

        {/* Egyptian Governorates Table */}
        <div className="rounded-2xl border border-[#B08D57]/30 overflow-hidden bg-[#F1EADA]/50">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-[#14110F] text-[#FBF8EE] font-display uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Governorate</th>
                <th className="p-4">Arabic</th>
                <th className="p-4">Delivery ETA</th>
                <th className="p-4 text-right">Standard Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B08D57]/20">
              {EGYPT_GOVERNORATES.map((gov) => (
                <tr key={gov.value} className="hover:bg-[#FBF8EE] transition-colors">
                  <td className="p-4 font-semibold text-[#14110F]">{gov.name_en}</td>
                  <td className="p-4">{gov.name_ar}</td>
                  <td className="p-4 text-[#8C6E3D]">{gov.eta_days}</td>
                  <td className="p-4 text-right font-display font-bold text-[#6E1423]">
                    {gov.fee} EGP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/shop"
            className="px-8 py-3 rounded-full bg-[#14110F] text-[#FBF8EE] font-display text-xs uppercase tracking-widest hover:bg-[#6E1423] transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}

