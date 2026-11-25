'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Check, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { PerfumeData, ProductVariant } from '@/lib/catalog';

interface WaitingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: PerfumeData;
  variant: ProductVariant;
}

export const WaitingListModal: React.FC<WaitingListModalProps> = ({
  isOpen,
  onClose,
  product,
  variant,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reservationCode, setReservationCode] = useState('');
  const pathname = usePathname();
  const isArabic = pathname ? pathname.startsWith('/ar') : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;

    const code = `LV-VIP-${Math.floor(100000 + Math.random() * 900000)}`;
    setReservationCode(code);

    try {
      const existing = JSON.parse(localStorage.getItem('lvenus_waitlist_entries') || '[]');
      existing.push({
        code,
        product_slug: product.slug,
        product_name: product.name_en,
        variant_size: variant.size_ml,
        client_name: name,
        client_contact: contact,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('lvenus_waitlist_entries', JSON.stringify(existing));
    } catch {}

    setIsSubmitted(true);
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setName('');
    setContact('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-[#0D0A08]/85 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md rounded-2xl border border-[#B08D57]/40 bg-[#FDFBF7] dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] shadow-2xl overflow-hidden z-10 p-6 sm:p-8"
          >
            <button
              onClick={resetAndClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#B08D57]/10 text-[#14110F]/70 dark:text-[#FDFBF7]/70 cursor-pointer"
            >
              <X size={18} />
            </button>

            {!isSubmitted ? (
              <div>
                <div className="flex items-center gap-2.5 text-[#B08D57] mb-2">
                  <Bell size={18} />
                  <span className="text-xs font-display tracking-[0.2em] uppercase">
                    {isArabic ? 'قائمة الحجز الخاص' : 'VIP Private Waitlist'}
                  </span>
                </div>

                <h3 className="font-serif text-2xl mb-1">
                  {isArabic ? product.name_ar : product.name_en}
                </h3>
                <p className="text-xs text-[#B08D57] mb-4">
                  {variant.name_en || `${variant.size_ml} ml`} — {isArabic ? 'نفدت هذه الدفعة الحرفية' : 'Atelier batch currently reserved'}
                </p>

                <p className="text-xs text-[#14110F]/70 dark:text-[#FDFBF7]/70 mb-6">
                  {isArabic
                    ? 'نظراً لأن عطور لوفينوس تصاغ في دفعات حرفية محدودة، يسعدنا إدراجك في قائمة الحجز الفوري لتأكيد أولويتك مع إشعارك فور اكتمال تعتيق الدفعة القادمة.'
                    : 'Because our Extraits de Parfum mature in limited porcelain batches, register your priority allocation. You will receive private advance notification before public release.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-display tracking-wider uppercase text-[#14110F]/80 dark:text-[#FDFBF7]/80 mb-1">
                      {isArabic ? 'الاسم الكريم' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isArabic ? 'السيد / السيدة...' : 'Your name...'}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#B08D57]/30 bg-white/60 dark:bg-black/30 text-xs focus:outline-none focus:border-[#B08D57]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-display tracking-wider uppercase text-[#14110F]/80 dark:text-[#FDFBF7]/80 mb-1">
                      {isArabic ? 'رقم الهاتف أو الواتساب / البريد' : 'WhatsApp Phone / Email'}
                    </label>
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="0121 059 3766"
                      dir="ltr"
                      className="w-full px-4 py-2.5 rounded-lg border border-[#B08D57]/30 bg-white/60 dark:bg-black/30 text-xs focus:outline-none focus:border-[#B08D57]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 px-6 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] text-[#FDFBF7] text-xs font-display uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                  >
                    {isArabic ? 'تأكيد أولوية الحجز' : 'Request Private Allocation'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#B08D57]/15 border border-[#B08D57] flex items-center justify-center text-[#B08D57]">
                  <Check size={28} />
                </div>

                <h3 className="font-serif text-2xl mb-2 text-[#B08D57]">
                  {isArabic ? 'تم تأكيد حجزك بنجاح' : 'Priority Reserved'}
                </h3>

                <p className="text-xs text-[#14110F]/70 dark:text-[#FDFBF7]/70 mb-4">
                  {isArabic
                    ? 'شكراً لثقتكم. تم تسجيل بياناتكم وسيتواصل معكم مستشار الدار فور جاهزية الدفعة العطرية القادمة.'
                    : 'Your private allocation ticket is logged. The Atelier Concierge will contact you prior to flacon release.'}
                </p>

                <div className="inline-block px-4 py-2 rounded-lg bg-[#B08D57]/10 border border-[#B08D57]/30 text-xs font-mono text-[#B08D57] tracking-widest mb-6">
                  {reservationCode}
                </div>

                <div>
                  <button
                    onClick={resetAndClose}
                    className="py-2.5 px-6 rounded-full border border-[#B08D57] hover:bg-[#B08D57]/10 text-xs font-display tracking-widest uppercase cursor-pointer"
                  >
                    {isArabic ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

