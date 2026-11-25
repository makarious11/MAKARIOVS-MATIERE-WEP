'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { isAdminRoute } from '@/lib/constants';

export const WhatsAppConcierge: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const isArabic = pathname ? pathname.startsWith('/ar') : false;
  const onAdmin = isAdminRoute(pathname);

  useEffect(() => {
    if (onAdmin) return;
    // Show after 2.5 seconds so as not to distract during initial hero presentation
    const timer = setTimeout(() => setIsVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [onAdmin]);

  if (onAdmin) return null;

  const phoneNumber = '201210593766'; // Official L'VENUS Atelier VIP Concierge line
  const message = isArabic
    ? encodeURIComponent('مرحباً بكم في دار لوفينوس. أود الاستفسار حول إبداعات الدار وطلب استشارة عطرية خاصة.')
    : encodeURIComponent("Greetings from L'VENUS. I would like to inquire about the Maison's creations and request a fragrance consultation.");

  const waUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <aside
          aria-label="WhatsApp VIP Concierge"
          className="fixed bottom-16 sm:bottom-20 left-4 sm:left-6 z-40"
        >
          <motion.a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 16 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative flex items-center gap-2 px-3 py-2 rounded-full shadow-xl transition-all duration-200 border border-[#B08D57]/60 bg-[#161210]/95 backdrop-blur-md text-[#FDFBF7] hover:border-[#DFCA9B] hover:shadow-[0_8px_28px_rgba(176,141,87,0.35)] group cursor-pointer"
            aria-label={isArabic ? 'المستشار الخاص عبر واتساب' : 'WhatsApp VIP Concierge'}
          >
            {/* Pulsing beacon */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]" />
            </span>

            {/* WA Icon */}
            <div className="text-[#25D366] group-hover:scale-110 transition-transform shrink-0">
              <MessageCircle size={17} strokeWidth={2} />
            </div>

            {/* Compact Concierge Label */}
            <div className="hidden sm:flex flex-col text-start">
              <span className="text-[9px] tracking-[0.14em] uppercase text-[#DFCA9B] font-display font-semibold flex items-center gap-1 leading-tight">
                <Sparkles size={9} />
                {isArabic ? 'المستشار الخاص' : 'VIP Concierge'}
              </span>
            </div>
          </motion.a>
        </aside>
      )}
    </AnimatePresence>
  );
};

