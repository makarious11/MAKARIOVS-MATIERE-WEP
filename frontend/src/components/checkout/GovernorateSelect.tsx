'use client';

import React from 'react';
import { EGYPT_GOVERNORATES, type GovernorateOption } from '@/lib/governorates';
export { EGYPT_GOVERNORATES, type GovernorateOption };

interface GovernorateSelectProps {
  value: string;
  onChange: (option: GovernorateOption) => void;
  isArabic?: boolean;
  error?: string;
}

export const GovernorateSelect: React.FC<GovernorateSelectProps> = ({
  value,
  onChange,
  isArabic = false,
  error,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
        {isArabic ? 'المحافظة (مصر)' : 'Governorate (Egypt)'} *
      </label>
      <select
        value={value}
        onChange={(e) => {
          const found = EGYPT_GOVERNORATES.find((g) => g.value === e.target.value);
          if (found) onChange(found);
        }}
        className={`w-full p-3.5 rounded-xl bg-[#FBF8EE] dark:bg-[#1C1613] border font-body text-xs text-[#14110F] dark:text-[#FDFBF7] focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57] ${
          error ? 'border-red-500' : 'border-[#B08D57]/40'
        }`}
      >
        {EGYPT_GOVERNORATES.map((gov) => (
          <option key={gov.value} value={gov.value} className="dark:bg-[#1C1613] dark:text-[#FDFBF7]">
            {isArabic
              ? `${gov.name_ar} — ${gov.fee} ج.م (${gov.eta_days})`
              : `${gov.name_en} — EGP ${gov.fee} (${gov.eta_days})`}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
};

