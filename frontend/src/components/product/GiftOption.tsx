'use client';

import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { WaxSeal } from '@/components/ui/WaxSeal';

interface GiftOptionProps {
  enabled?: boolean;
  note?: string;
  onChange?: (enabled: boolean, note: string) => void;
  onToggle?: (enabled: boolean, note: string) => void;
  isArabic?: boolean;
}

export const GiftOption: React.FC<GiftOptionProps> = ({
  enabled: controlledEnabled,
  note: controlledNote,
  onChange,
  onToggle,
  isArabic = false,
}) => {
  const [internalEnabled, setInternalEnabled] = useState(false);
  const [internalNote, setInternalNote] = useState('');

  const isEnabled = controlledEnabled !== undefined ? controlledEnabled : internalEnabled;
  const noteValue = controlledNote !== undefined ? controlledNote : internalNote;

  const handleToggle = (checked: boolean) => {
    setInternalEnabled(checked);
    onChange?.(checked, checked ? noteValue : '');
    onToggle?.(checked, checked ? noteValue : '');
  };

  const handleNoteChange = (text: string) => {
    setInternalNote(text);
    onChange?.(isEnabled, text);
    onToggle?.(isEnabled, text);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/30 space-y-3">
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[#B08D57] text-[#6B1D2F] focus:ring-[#B08D57]"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] flex items-center gap-2">
              <Gift size={14} className="text-[#6B1D2F] dark:text-[#DFCA9B]" />
              {isArabic ? 'تغليف الهدايا بالشمع الملكي (+ 150 ج.م)' : 'Wax-Sealed Luxury Gift Box (+ 150 EGP)'}
            </span>
            <WaxSeal size={22} />
          </div>
          <p className="font-body text-xs text-[#3A332D]/70 dark:text-[#DFCA9B]/70 mt-0.5">
            {isArabic
              ? 'صندوق أسود فاخر مع بطانة ورقية بنقوش نباتية، ومختوم يدوياً بختم الشمع البرغندي بتفاصيل فينوس.'
              : 'Rigid presentation black box with botanical paper liner, hand-stamped with genuine burgundy wax.'}
          </p>
        </div>
      </label>

      {isEnabled && (
        <div className="pt-2">
          <label className="font-display text-[11px] uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] block mb-1">
            {isArabic ? 'رسالة خطية مخصصة (تُكتب بخط اليد)' : 'Handwritten Calligraphy Card Message'}
          </label>
          <textarea
            value={noteValue}
            onChange={(e) => handleNoteChange(e.target.value)}
            rows={2}
            maxLength={180}
            placeholder={
              isArabic
                ? 'اكتب رسالتك لنهديها نيابة عنك بحبر كلاسيكي...'
                : 'Write your personalized dedication to be penned by our scribe...'
            }
            className="w-full p-3 text-xs rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] border border-[#B08D57]/40 text-[#14110F] dark:text-[#FDFBF7] focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57] font-body"
          />
        </div>
      )}
    </div>
  );
};
