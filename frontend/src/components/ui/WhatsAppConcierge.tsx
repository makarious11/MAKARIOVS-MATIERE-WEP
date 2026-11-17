'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const WhatsAppConcierge: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const isArabic = pathname ? pathname.startsWith('/ar') : false;

  useEffect(() => {
    // Show after 2.5 seconds so as not to distract during initial hero presentation
    const timer = setTimeout(() => setIsVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const phoneNumber = '201000000000'; // Default Maison VIP line
  const message = isArabic
    ? encodeURIComponent('مرحباً بكم في دار لوفينوس. أود الاستفسار حول إبداعات الدار وطلب استشارة عطرية خاصة.')
    : encodeURIComponent("Greetings from L'VENUS. I would like to inquire about the Maison's creations and request a fragrance consultation.");

  const waUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <aside aria-label="WhatsApp VIP Concierge" className="fixed bottom-6 left-5 sm:left-7 z-40">
          <motion.a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 border border-[#B08D57]/60 bg-[#161210] text-[#FDFBF7] hover:border-[#DFCA9B] hover:shadow-[0_8px_35px_rgba(176,141,87,0.4)] group cursor-pointer"
            aria-label="WhatsApp VIP Concierge"
          >
            {/* Pulsing beacon */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#25D366]" />
            </span>

            {/* WA Icon */}
            <div className="text-[#25D366] group-hover:scale-110 transition-transform">
              <MessageCircle size={20} strokeWidth={2} />
            </div>

            {/* Concierge Label */}
            <div className="flex flex-col text-left">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#B08D57] font-display font-semibold flex items-center gap-1">
                <Sparkles size={10} />
                {isArabic ? 'المستشار الخاص' : 'VIP Concierge'}
              </span>
              <span className="text-xs font-serif text-[#FDFBF7] tracking-wider leading-none">
                {isArabic ? 'تواصل مع الدار' : 'Atelier Direct'}
              </span>
            </div>

            {/* Subtle glow border */}
            <div className="absolute inset-0 rounded-full border border-[#B08D57]/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.a>
        </aside>
      )}
    </AnimatePresence>
  );
};

