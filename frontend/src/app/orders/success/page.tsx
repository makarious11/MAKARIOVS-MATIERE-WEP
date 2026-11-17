'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Package, Mail } from 'lucide-react';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';

interface SuccessPageProps {
  searchParams: Promise<{ number?: string }>;
}

export default function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedParams = use(searchParams);
  const orderNumber = resolvedParams?.number || 'LV-849201';

  const petals = Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    x: (i * 7 + 4) % 96,
    delay: i * 0.22,
    duration: 5 + (i % 4),
    size: 5 + (i % 4),
  }));

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-36 pb-28 flex flex-col items-center justify-center overflow-hidden transition-colors duration-300">
      <BotanicalPattern opacity={0.05} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-5">
        {petals.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: '-10vh', opacity: 0, rotate: 0 }}
            animate={{
              y: '110vh',
              opacity: [0, 0.65, 0],
              x: [`${p.x}vw`, `${p.x + (p.id % 2 === 0 ? 4 : -4)}vw`],
              rotate: [0, 360],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ width: p.size, height: p.size }}
            className="absolute rounded-full bg-[#6B1D2F]/30 blur-[0.5px]"
          />
        ))}
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 text-center space-y-8">
        <div className="flex justify-center">
          <WaxSeal size={100} animateStamp />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B08D57]/15 border border-[#B08D57]/30 text-xs font-display uppercase tracking-widest text-[#8C6E3D] dark:text-[#DFCA9B]">
            <CheckCircle2 size={14} className="text-[#6B1D2F] dark:text-[#B08D57]" />
            <span>Order Sealed & Confirmed — L’VENUS</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
            Merci, Noble Patron
          </h1>

          <p className="font-script text-2xl text-[#6B1D2F] dark:text-[#DFCA9B] italic">
            Your vessel is being prepared in our atelier
          </p>

          <p className="font-body text-xs sm:text-sm text-[#3A332D]/75 dark:text-[#DFCA9B]/80 max-w-md mx-auto leading-relaxed pt-2">
            Each flacon is inspected, crowned with our carved walnut cap, and hand-sealed with natural burgundy wax before departure.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#F1EADA] dark:bg-[#161210] border border-[#B08D57]/40 shadow-md space-y-4">
          <div className="space-y-1">
            <span className="font-display text-[11px] uppercase tracking-widest text-[#3A332D]/70 dark:text-[#DFCA9B]/70 block">
              Official Order Reference
            </span>
            <span className="font-display text-2xl sm:text-3xl font-bold tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
              {orderNumber}
            </span>
          </div>

          <div className="pt-3 border-t border-[#B08D57]/30 flex flex-col sm:flex-row items-center justify-between text-xs font-body text-[#3A332D]/80 dark:text-[#DFCA9B]/80 gap-3">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-[#8C6E3D] dark:text-[#B08D57]" />
              <span>A confirmation dispatch has been sent</span>
            </div>
            <div className="flex items-center gap-2">
              <Package size={15} className="text-[#8C6E3D] dark:text-[#B08D57]" />
              <span>ETA: 1–3 business days</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={`/orders/${orderNumber}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <span>Track Order Timeline</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#14110F]/30 dark:border-[#B08D57]/40 hover:border-[#6B1D2F] dark:hover:border-[#B08D57] text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] font-display text-xs uppercase tracking-widest transition-colors"
          >
            Return to Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
