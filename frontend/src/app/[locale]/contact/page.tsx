'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Mail, MapPin, Clock, Phone, Check } from 'lucide-react';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';

export default function ContactPage() {
  const pathname = usePathname();
  const isArabic = Boolean(pathname?.startsWith('/ar'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(isArabic ? 'استفسار عام عن العطور' : 'General Scent Inquiries');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-32 pb-24 transition-colors duration-300">
      <BotanicalPattern opacity={0.04} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <span className="font-display text-xs tracking-widest3 uppercase text-[#B08D57] dark:text-[#DFCA9B]">
            {isArabic ? 'الكونسيرج الخاص والاستفسارات' : 'Private Concierge & Inquiries'}
          </span>
          <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
            {isArabic ? 'تواصل مع الأتيليه' : 'Contact The Atelier'}
          </h1>
          <p className="font-script text-xl text-[#8C6E3D] dark:text-[#DFCA9B] italic">
            {isArabic ? 'مراسلة خاصة مع الخيميائي وصانع العطور' : 'Correspond with the Master Alchemist'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-[#F1EADA]/60 dark:bg-[#161210] border border-[#B08D57]/40 shadow-sm transition-colors">
            {submitted ? (
              <div className="py-12 flex flex-col items-center text-center space-y-6">
                <WaxSeal size={80} animateStamp />
                <h3 className="font-display text-2xl uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? 'تم استلام مراسلتكم بنجاح' : 'Correspondence Received'}
                </h3>
                <p className="font-body text-xs sm:text-sm text-[#3A332D]/75 dark:text-[#DFCA9B]/80 max-w-sm leading-relaxed">
                  {isArabic
                    ? 'سُجلت رسالتك في سجل المشغل العطري. سيقوم كونسيرج العطور بالرد عليك بعناية فائقة خلال 24 ساعة.'
                    : 'Your message has entered our apothecary log. Our fragrance concierge will reply with deliberate care within 24 hours.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] font-display text-xs uppercase tracking-widest cursor-pointer hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] transition-colors"
                >
                  {isArabic ? 'إرسال رسالة أخرى' : 'Send Another Dispatch'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'الاسم بالكامل *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isArabic ? 'مثال: مكاريوس بطرس' : 'e.g. Jean Makarious'}
                      className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/30 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'البريد الإلكتروني *' : 'Email Address *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@domain.com"
                      className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/30 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'رقم الهاتف (اختياري)' : 'Phone (Optional)'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+20 100 000 0000"
                      className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/30 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'موضوع الاستفسار' : 'Inquiry Subject'}
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/30 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    >
                      <option value="General Scent Inquiries">{isArabic ? 'استفسار عام عن العطور' : 'General Scent Inquiries'}</option>
                      <option value="Bespoke & Private Commission">{isArabic ? 'طلبات وتصميمات خاصة' : 'Bespoke & Private Commission'}</option>
                      <option value="Press & Literary Features">{isArabic ? 'الصحافة والإعلام' : 'Press & Literary Features'}</option>
                      <option value="Order Tracking & Logistics">{isArabic ? 'تتبع الطلبات والشحن' : 'Order Tracking & Logistics'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                    {isArabic ? 'نص الرسالة *' : 'Your Message *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isArabic ? 'اكتب رسالتك أو استفسارك هنا...' : 'Inscribe your thoughts, questions, or bespoke fragrance inquiries...'}
                    className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/30 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 transition-all duration-400 shadow-md border border-[#B08D57]/30 disabled:opacity-50 cursor-pointer font-medium"
                >
                  {loading
                    ? isArabic ? 'جاري إرسال المراسلة...' : 'Transmitting Dispatch...'
                    : isArabic ? 'ختم وإرسال الرسالة' : 'Seal & Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Physical Ateliers & Concierge Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/40 shadow-sm space-y-6 transition-colors">
              <div className="space-y-2">
                <span className="font-display text-xs uppercase tracking-widest text-[#B08D57]">
                  {isArabic ? 'المشغلان التوأم' : 'The Dual Ateliers'}
                </span>
                <h3 className="font-display text-xl uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? 'القاهرة · باريس' : 'Cairo · Paris'}
                </h3>
              </div>

              <div className="space-y-4 text-xs font-body text-[#3A332D] dark:text-[#DFCA9B]/85">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#6B1D2F] dark:text-[#B08D57] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-[#14110F] dark:text-[#FDFBF7] font-display block uppercase">
                      {isArabic ? 'القاهرة' : 'Le Caire'}
                    </span>
                    <span>{isArabic ? 'شارع 26 يوليو، جزيرة الزمالك، القاهرة، مصر' : '26 July St, Island of Zamalek, Cairo, Egypt'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#6B1D2F] dark:text-[#B08D57] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-[#14110F] dark:text-[#FDFBF7] font-display block uppercase">
                      {isArabic ? 'باريس' : 'Paris'}
                    </span>
                    <span>14 Rue de Tournon, 75006 Paris, France</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-[#B08D57]/20">
                  <Clock size={16} className="text-[#8C6E3D] dark:text-[#B08D57] flex-shrink-0" />
                  <span>{isArabic ? 'ساعات العمل: 10:00 ص – 8:00 م (بتوقيت القاهرة)' : 'Apothecary Hours: 10:00 AM – 8:00 PM (Cairo Time)'}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#8C6E3D] dark:text-[#B08D57] flex-shrink-0" />
                  <span>concierge@makariovs.com</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/30 flex items-center gap-4 transition-colors">
              <WaxSeal size={40} />
              <p className="font-body text-xs text-[#3A332D]/80 dark:text-[#DFCA9B]/80 italic">
                {isArabic
                  ? '“كل رسالة تُقرأ بعناية من قِبل مؤسسي الدار ويتم الرد عليها شخصياً.”'
                  : '“Every letter is read by our founders and answered by hand.”'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
