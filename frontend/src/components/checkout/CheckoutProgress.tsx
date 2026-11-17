'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CheckoutProgressProps {
  currentStep: 1 | 2 | 3;
  isArabic?: boolean;
}

export const CheckoutProgress: React.FC<CheckoutProgressProps> = ({
  currentStep,
  isArabic = false,
}) => {
  const steps = [
    { number: 1, label: isArabic ? 'الشحن والتوصيل' : 'Shipping' },
    { number: 2, label: isArabic ? 'طريقة الدفع' : 'Payment' },
    { number: 3, label: isArabic ? 'تأكيد الطلب' : 'Confirmation' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto py-6">
      <div className="relative flex items-center justify-between">
        {/* Background Track Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[1px] bg-[#B08D57]/30 -z-0" />

        {/* Active Progress Fill */}
        <motion.div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] bg-[#6E1423] origin-left -z-0"
          initial={{ width: '0%' }}
          animate={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Step Nodes */}
        {steps.map((step) => {
          const isDone = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-display text-xs transition-all duration-300 ${
                  isDone
                    ? 'bg-[#6B1D2F] dark:bg-[#8A1D2E] text-[#FDFBF7] border border-[#B08D57]'
                    : isCurrent
                    ? 'bg-[#14110F] dark:bg-[#1E1613] text-[#FDFBF7] border-2 border-[#B08D57] shadow-md scale-110'
                    : 'bg-[#F1EADA] dark:bg-[#1C1613] text-[#14110F]/50 dark:text-[#FDFBF7]/50 border border-[#B08D57]/40'
                }`}
              >
                {isDone ? <Check size={14} /> : step.number}
              </div>
              <span
                className={`font-display text-[11px] uppercase tracking-wider mt-2 ${
                  isCurrent ? 'text-[#14110F] dark:text-[#FDFBF7] font-bold' : 'text-[#3A332D]/70 dark:text-[#DFCA9B]/70'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

