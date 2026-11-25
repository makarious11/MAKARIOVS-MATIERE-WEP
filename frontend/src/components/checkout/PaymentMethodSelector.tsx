'use client';

import React from 'react';
import { Banknote, CreditCard, ShieldCheck, Smartphone, QrCode } from 'lucide-react';

export type PaymentMethodType = 'cod' | 'card' | 'instapay' | 'vodafone_cash';

interface PaymentMethodSelectorProps {
  method: PaymentMethodType;
  onChange: (method: PaymentMethodType) => void;
  isArabic?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  method,
  onChange,
  isArabic = false,
}) => {
  return (
    <div className="space-y-4">
      <span className="block font-display text-xs uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
        {isArabic ? 'اختر طريقة السداد المعتمدة' : 'Select Payment Sanctuary'}
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cash On Delivery */}
        <button
          type="button"
          onClick={() => onChange('cod')}
          className={`p-5 rounded-2xl border text-start transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer ${
            method === 'cod'
              ? 'bg-[#14110F] dark:bg-[#1C1613] text-[#FDFBF7] border-[#B08D57] shadow-xl'
              : 'bg-[#F1EADA]/50 dark:bg-[#1A1512]/60 text-[#14110F] dark:text-[#FDFBF7] border-[#B08D57]/30 hover:border-[#6B1D2F]'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-2.5 rounded-full bg-[#B08D57]/20 text-[#B08D57]">
              <Banknote size={20} />
            </div>
            <span className="font-display text-[10px] tracking-widest uppercase border border-[#B08D57]/40 px-2 py-0.5 rounded text-[#B08D57]">
              {isArabic ? 'الدفع نقداً' : 'Cash'}
            </span>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">
              {isArabic ? 'الدفع عند الاستلام (COD)' : 'Cash on Delivery (COD)'}
            </h4>
            <p className={`font-body text-xs mt-1 ${method === 'cod' ? 'text-[#FDFBF7]/75' : 'text-[#3A332D]/75 dark:text-[#FDFBF7]/60'}`}>
              {isArabic
                ? 'سداد القيمة نقداً لمندوب التوصيل عند استلام قارورة العطر المختومة.'
                : 'Pay with cash in Egyptian Pounds upon physical receipt of your flacon.'}
            </p>
          </div>
        </button>

        {/* InstaPay */}
        <button
          type="button"
          onClick={() => onChange('instapay')}
          className={`p-5 rounded-2xl border text-start transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer ${
            method === 'instapay'
              ? 'bg-[#14110F] dark:bg-[#1C1613] text-[#FDFBF7] border-[#B08D57] shadow-xl'
              : 'bg-[#F1EADA]/50 dark:bg-[#1A1512]/60 text-[#14110F] dark:text-[#FDFBF7] border-[#B08D57]/30 hover:border-[#6B1D2F]'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-2.5 rounded-full bg-[#6B1D2F]/20 text-[#DFCA9B]">
              <QrCode size={20} />
            </div>
            <span className="font-display text-[10px] tracking-widest uppercase bg-[#6B1D2F]/20 border border-[#B08D57]/50 px-2 py-0.5 rounded text-[#DFCA9B]">
              {isArabic ? 'فوري وسريع' : 'InstaPay'}
            </span>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">
              {isArabic ? 'تحويل انستاباي (InstaPay)' : 'InstaPay Instant Transfer'}
            </h4>
            <p className={`font-body text-xs mt-1 ${method === 'instapay' ? 'text-[#FDFBF7]/75' : 'text-[#3A332D]/75 dark:text-[#FDFBF7]/60'}`}>
              {isArabic
                ? 'تحويل بنكي فوري عبر تطبيق انستاباي إلى حساب دار لوفينوس مباشرة.'
                : 'Direct zero-fee bank transfer via Egyptian InstaPay network.'}
            </p>
          </div>
        </button>

        {/* Smart Wallets / Vodafone Cash */}
        <button
          type="button"
          onClick={() => onChange('vodafone_cash')}
          className={`p-5 rounded-2xl border text-start transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer ${
            method === 'vodafone_cash'
              ? 'bg-[#14110F] dark:bg-[#1C1613] text-[#FDFBF7] border-[#B08D57] shadow-xl'
              : 'bg-[#F1EADA]/50 dark:bg-[#1A1512]/60 text-[#14110F] dark:text-[#FDFBF7] border-[#B08D57]/30 hover:border-[#6B1D2F]'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-2.5 rounded-full bg-[#B08D57]/20 text-[#B08D57]">
              <Smartphone size={20} />
            </div>
            <span className="font-display text-[10px] tracking-widest uppercase border border-[#B08D57]/40 px-2 py-0.5 rounded text-[#B08D57]">
              {isArabic ? 'محافظ إلكترونية' : 'E-Wallets'}
            </span>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">
              {isArabic ? 'فودافون كاش والمحافظ' : 'Vodafone Cash & Mobile Wallets'}
            </h4>
            <p className={`font-body text-xs mt-1 ${method === 'vodafone_cash' ? 'text-[#FDFBF7]/75' : 'text-[#3A332D]/75 dark:text-[#FDFBF7]/60'}`}>
              {isArabic
                ? 'تحويل فوري عبر فودافون كاش، أورنج، اتصالات، أو وي كاش.'
                : 'Instant transfer via Vodafone Cash, Orange, Etisalat or WE pay.'}
            </p>
          </div>
        </button>

        {/* Paymob Card Gateway */}
        <button
          type="button"
          onClick={() => onChange('card')}
          className={`p-5 rounded-2xl border text-start transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer ${
            method === 'card'
              ? 'bg-[#14110F] dark:bg-[#1C1613] text-[#FDFBF7] border-[#B08D57] shadow-xl'
              : 'bg-[#F1EADA]/50 dark:bg-[#1A1512]/60 text-[#14110F] dark:text-[#FDFBF7] border-[#B08D57]/30 hover:border-[#6B1D2F]'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-2.5 rounded-full bg-[#6B1D2F]/20 text-[#DFCA9B]">
              <CreditCard size={20} />
            </div>
            <span className="font-display text-[10px] tracking-widest uppercase border border-[#B08D57]/40 px-2 py-0.5 rounded text-[#B08D57]">
              3D Secure
            </span>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">
              {isArabic ? 'البطاقة الائتمانية (Paymob)' : 'Credit / Debit Card (Paymob)'}
            </h4>
            <p className={`font-body text-xs mt-1 ${method === 'card' ? 'text-[#FDFBF7]/75' : 'text-[#3A332D]/75 dark:text-[#FDFBF7]/60'}`}>
              {isArabic
                ? 'دفع فوري آمن عبر فيزا، ماستركارد، أو ميزة عبر بوابة باي موب.'
                : 'Instant 3D-Secure card payment via Visa, Mastercard & Meeza.'}
            </p>
          </div>
        </button>
      </div>

      {/* Details banner for InstaPay */}
      {method === 'instapay' && (
        <div className="p-4 rounded-xl border border-[#B08D57]/50 bg-[#B08D57]/10 dark:bg-[#1C1613] space-y-2">
          <p className="text-xs font-display uppercase tracking-widest text-[#B08D57] font-semibold">
            {isArabic ? 'بيانات التحويل عبر انستاباي' : 'InstaPay Transfer Credentials'}
          </p>
          <div className="text-xs font-mono bg-black/10 dark:bg-black/30 p-2.5 rounded border border-[#B08D57]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#14110F] dark:text-[#FDFBF7]">
            <span>IPA / العنوان: <strong className="text-[#B08D57]">lvenus@instapay</strong></span>
            <span>الاسم: <strong>L’VENUS MAISON</strong></span>
          </div>
          <p className="text-[11px] text-[#14110F]/70 dark:text-[#FDFBF7]/70">
            {isArabic
              ? 'يرجى تحويل الإجمالي وذكر رقم هاتفك في وصف التحويل. سيتصل بك فريق الدار فوراً لتأكيد الإرسال.'
              : 'Please transfer the exact total and note your phone in description. Our concierge will confirm arrival.'}
          </p>
        </div>
      )}

      {/* Details banner for Vodafone Cash */}
      {method === 'vodafone_cash' && (
        <div className="p-4 rounded-xl border border-[#B08D57]/50 bg-[#B08D57]/10 dark:bg-[#1C1613] space-y-2">
          <p className="text-xs font-display uppercase tracking-widest text-[#B08D57] font-semibold">
            {isArabic ? 'بيانات المحفظة الإلكترونية' : 'Mobile Wallet Credentials'}
          </p>
          <div className="text-xs font-mono bg-black/10 dark:bg-black/30 p-2.5 rounded border border-[#B08D57]/20 flex items-center justify-between text-[#14110F] dark:text-[#FDFBF7]">
            <span>{isArabic ? 'رقم المحفظة المعتمد:' : 'Official Wallet Number:'} <strong dir="ltr" className="ltr-isolate text-[#B08D57]">01210593766</strong></span>
          </div>
          <p className="text-[11px] text-[#14110F]/70 dark:text-[#FDFBF7]/70">
            {isArabic
              ? 'يرجى إرسال رسالة التأكيد عبر واتساب إلى خدمة العملاء فور إتمام التحويل.'
              : 'Kindly send confirmation SMS or screenshot to our WhatsApp concierge after transfer.'}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#161210] border border-[#B08D57]/20 text-xs text-[#3A332D]/80 dark:text-[#FDFBF7]/80">
        <ShieldCheck size={16} className="text-[#8C6E3D] flex-shrink-0" />
        <span>
          {isArabic
            ? 'جميع الطلبات مشمولة بضمان أصالة الدار وتأتي ممهورة بختم الشمع الملكي.'
            : 'All orders are covered by the Maison Authenticity Guarantee and arrive sealed in wax.'}
        </span>
      </div>
    </div>
  );
};
