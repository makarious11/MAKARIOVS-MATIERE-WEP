'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, ArrowLeft, ShieldCheck, MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Price } from '@/components/ui/Price';
import { useCartStore } from '@/store/cartStore';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { GovernorateSelect, EGYPT_GOVERNORATES, GovernorateOption } from '@/components/checkout/GovernorateSelect';
import { PaymentMethodSelector, PaymentMethodType } from '@/components/checkout/PaymentMethodSelector';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';
import { saveNewOrderToStorage, MaisonOrder, playLuxuryChime } from '@/lib/orders';
import { getCurrentPatron, registerPatron } from '@/lib/patronAuth';

export default function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isArabic = Boolean(pathname?.startsWith('/ar'));
  const { items, subtotal, discount, coupon, clearCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedGov, setSelectedGov] = useState<GovernorateOption>(EGYPT_GOVERNORATES[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill logged-in patron details
  useEffect(() => {
    const patron = getCurrentPatron();
    if (patron) {
      if (patron.name) setFullName(patron.name);
      if (patron.phone) setPhone(patron.phone);
      if (patron.email) setEmail(patron.email);
      if (patron.address) setStreetAddress(patron.address);
      if (patron.city) setCity(patron.city);
    }
  }, []);

  const shippingFee = selectedGov.fee;
  const orderTotal = subtotal + shippingFee - discount;

  // Egyptian phone validator: (+20 or 010/011/012/015)
  const validatePhone = (num: string): boolean => {
    const cleaned = num.replace(/[\s-]/g, '');
    const egRegex = /^(\+20|0020|0)?1[0125][0-9]{8}$/;
    return egRegex.test(cleaned);
  };

  // Egyptian GPS Geolocation & Map Picker
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع الجغرافي غير مدعومة في متصفحك.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapLocation({ lat, lng });
        setLocationSuccess(true);
        setIsLocating(false);

        // Try reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
          const data = await res.json();
          if (data && data.display_name) {
            setStreetAddress(data.display_name);
            setMapLocation({ lat, lng, address: data.display_name });
          }
        } catch {}
      },
      (err) => {
        setIsLocating(false);
        alert('تعذر تحديد موقعك بدقة، يمكنك كتابة العنوان يدوياً بالتفصيل أو السماح للمتصفح بالوصول للموقع.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = isArabic
        ? 'يرجى إدخال الاسم بالكامل (٣ أحرف على الأقل)'
        : 'Please enter your full name (minimum 3 characters)';
    }

    if (!phone.trim()) {
      newErrors.phone = isArabic
        ? 'رقم الموبايل مطلوب لتأكيد التوصيل مع المندوب'
        : 'Phone number is required for courier delivery';
    } else if (!validatePhone(phone)) {
      newErrors.phone = isArabic
        ? 'يرجى إدخال رقم موبايل مصري صحيح (مثال: 01210593766)'
        : 'Please enter a valid Egyptian mobile number (e.g. 01210593766)';
    }

    if (!streetAddress.trim() || streetAddress.trim().length < 5) {
      newErrors.streetAddress = isArabic
        ? 'يرجى كتابة العنوان بالتفصيل (اسم الشارع ورقم العقار)'
        : 'Please enter your street address and building number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // 1. Generate Order Number LV-XXXXXX
      const orderNumber = `LV-${Math.floor(100000 + Math.random() * 900000)}`;

      // 2. Ensure patron profile is saved
      registerPatron({
        name: fullName,
        phone,
        email,
        address: streetAddress,
        city: city || selectedGov.name_en,
        governorate: selectedGov.name_en,
        allowExisting: true,
      });

      // 3. Save order for Admin Dashboard & Client Tracking
      const itemsSummary = items
        .map((i) => `${i.product.name_en} (${i.variant.size_ml}ml) × ${i.quantity}`)
        .join(', ');

      const newMaisonOrder: MaisonOrder = {
        id: orderNumber,
        customer: fullName,
        phone,
        gov: `${selectedGov.name_en} — ${city || selectedGov.name_en}`,
        items: itemsSummary || "L\u2019VENUS Haute Parfumerie",
        total: orderTotal,
        payment:
          paymentMethod === 'cod'
            ? 'COD'
            : paymentMethod === 'instapay'
            ? 'InstaPay'
            : paymentMethod === 'vodafone_cash'
            ? 'Vodafone Cash'
            : 'Paymob Card',
        status: 'Processing',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        is_new: true,
          items_detail: items.map((i) => ({
            product_id: i.product.id,
            product_slug: i.product.slug,
            name_en: i.product.name_en,
            name_ar: i.product.name_ar,
            size_ml: i.variant.size_ml,
            price: i.variant.price,
            quantity: i.quantity,
            image: (i.product as any).images?.bottle || (i.product as any).images?.hero || (Array.isArray(i.product.images) ? i.product.images[0]?.url : undefined) || '/images/products/la-fleur-du-nil-bottle.jpg',
          })),
          map_coords: mapLocation ? { lat: mapLocation.lat, lng: mapLocation.lng } : undefined,
          map_url: mapLocation ? `https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}` : undefined,
      };

      saveNewOrderToStorage(newMaisonOrder);

      // 4. Play audio chime
      playLuxuryChime();

      // 5. Clear cart
      clearCart();

      // 6. Notify server in background
      fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber,
          name: fullName,
          phone,
          email,
          governorate: selectedGov.value,
          city: city || selectedGov.name_en,
          address: streetAddress,
          notes: orderNotes,
          payment_method: paymentMethod,
            map_coords: mapLocation ? { lat: mapLocation.lat, lng: mapLocation.lng } : undefined,
            map_url: mapLocation ? `https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}` : undefined,
          coupon_code: coupon?.code,
          items: items.map((i) => ({
            product_id: i.product.id,
            product_slug: i.product.slug,
            variant_id: i.variant.id,
            quantity: i.quantity,
          })),
        }),
      }).catch((err) => console.warn('Order API sync notice:', err));

      // 7. Route to success page with live tracking link
      router.push(isArabic ? `/ar/orders/success?number=${orderNumber}` : `/orders/success?number=${orderNumber}`);
    } catch (err: any) {
      console.error('Order creation error:', err);
      const fallbackNumber = `LV-${Math.floor(100000 + Math.random() * 900000)}`;
      clearCart();
      router.push(isArabic ? `/ar/orders/success?number=${fallbackNumber}` : `/orders/success?number=${fallbackNumber}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-36 pb-24 flex flex-col items-center justify-center px-4 text-center transition-colors duration-200">
        <h1 className="font-display text-2xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
          {isArabic ? 'حقيبة التسوق فارغة' : 'Your bag is empty'}
        </h1>
        <button
          onClick={() => router.push(isArabic ? '/ar/shop' : '/shop')}
          className="mt-6 px-8 py-3 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] font-display text-xs uppercase tracking-widest cursor-pointer hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] transition-colors"
        >
          {isArabic ? 'العودة إلى المتجر' : 'Return to Shop'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-32 pb-24 transition-colors duration-200">
      <BotanicalPattern opacity={0.04} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title & Progress Header */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="font-display text-xs tracking-widest3 uppercase text-[#B08D57]">
            {isArabic ? 'دار العطور الفاخرة — القاهرة · باريس' : 'Maison de Parfum — Le Caire · Paris'}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
            {isArabic ? 'إتمام الطلب الآمن' : 'Secure Checkout'}
          </h1>
        </div>

        {/* 3-Step Animated Progress Bar */}
        <CheckoutProgress currentStep={currentStep} isArabic={isArabic} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
          {/* Main Form Steps Column */}
          <div className="lg:col-span-7 bg-[#F1EADA]/50 dark:bg-[#161210] p-6 sm:p-10 rounded-3xl border border-[#B08D57]/30 shadow-sm space-y-8">
            {/* ======================================================== */}
            {/* STEP 1: Contact & Shipping                                */}
            {/* ======================================================== */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-[#B08D57]/30 pb-4">
                  <h2 className="font-display text-lg uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                    {isArabic ? '١. بيانات التواصل وعنوان الاستلام' : '1. Patron Contact & Egyptian Delivery Address'}
                  </h2>
                  <p className="font-body text-xs text-[#3A332D]/70 dark:text-[#DFCA9B]/80 mt-1">
                    {isArabic
                      ? 'يرجى إدخال بياناتك بدقة لتأكيد الشحن ومتابعة مسار الطلب.'
                      : 'Please provide your contact details for delivery confirmation and tracking.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'الاسم بالكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isArabic ? 'مثال: مكاريوس بطرس' : 'e.g. Makarious Boutros'}
                      className={`w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border font-body text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57] ${
                        errors.fullName ? 'border-red-500' : 'border-[#B08D57]/40'
                      }`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'رقم الموبايل المصري *' : 'Egyptian Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01210593766"
                      dir="ltr"
                      className={`w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border font-body text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57] ${
                        errors.phone ? 'border-red-500' : 'border-[#B08D57]/40'
                      }`}
                    />
                    {errors.phone && <p className="text-[11px] text-red-500">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@lvenus.com"
                      dir="ltr"
                      className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 font-body text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>

                  {/* Governorate */}
                  <div className="sm:col-span-2">
                    <GovernorateSelect
                      value={selectedGov.value}
                      onChange={(gov) => setSelectedGov(gov)}
                      isArabic={isArabic}
                    />
                  </div>

                  {/* City / District */}
                  <div className="space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'المدينة / الحي' : 'City / District'}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={isArabic ? 'مثال: الزمالك / التجمع الخامس' : 'e.g. Zamalek / New Cairo'}
                      className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 font-body text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2 space-y-2">
                    {/* Map & GPS Auto-Locate Option */}
                    <div className="p-3.5 rounded-2xl bg-[#F1EADA]/70 dark:bg-[#1C1613] border border-[#B08D57]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#6B1D2F] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <MapPin size={15} />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#14110F] dark:text-[#FDFBF7] block">
                            تحديد موقع الاستلام على الخريطة (GPS)
                          </span>
                          <span className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80 block">
                            {locationSuccess
                              ? '✓ تم تحديد إحداثيات موقعك بدقة وسيتوجه المندوب إليك مباشرة'
                              : 'بنقرة واحدة يتم التقاط موقعك الجغرافي لتسهيل وصول المندوب'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={isLocating}
                          className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] text-white text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
                          <span>{isLocating ? 'جاري تحديد موقعك...' : locationSuccess ? 'تحديث موقعي' : 'حدد موقعي على الخريطة'}</span>
                        </button>

                        {mapLocation && (
                          <a
                            href={`https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-full border border-[#B08D57]/40 text-xs text-[#8C6E3D] dark:text-[#DFCA9B] hover:bg-[#B08D57]/20 flex items-center gap-1 shrink-0"
                            title="معاينة الموقع على Google Maps"
                          >
                            <span>عرض</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                        {isArabic ? 'العنوان بالتفصيل ورقم العقار *' : 'Detailed Street Address & Building *'}
                      </label>
                      <span className="text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                        {isArabic ? '(أو اكتب العنوان يدوياً بالتفصيل)' : '(or enter street address manually)'}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder={isArabic ? 'اسم الشارع، رقم العمارة، الدور، الشقة...' : 'Building, Street, Floor, Apartment number...'}
                      className={`w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border font-body text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57] ${
                        errors.streetAddress ? 'border-red-500' : 'border-[#B08D57]/40'
                      }`}
                    />
                    {errors.streetAddress && (
                      <p className="text-[11px] text-red-500">{errors.streetAddress}</p>
                    )}
                  </div>

                  {/* Special Courier Notes */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'ملاحظات إضافية لمندوب التوصيل (اختياري)' : 'Delivery Instructions for Courier (Optional)'}
                    </label>
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder={isArabic ? 'علامة مميزة، موعد مناسب للاتصال، أو أي تعليمات...' : 'Any landmark, preferred calling time, or instructions...'}
                      className="w-full p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 font-body text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-8 py-4 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 flex items-center gap-2 transition-colors shadow-md cursor-pointer"
                  >
                    <span>{isArabic ? 'المتابعة لاختيار الدفع' : 'Continue to Payment'}</span>
                    <ArrowRight size={14} className={isArabic ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STEP 2: Payment Gateway Selection                         */}
            {/* ======================================================== */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-[#B08D57]/30 pb-4">
                  <h2 className="font-display text-lg uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                    {isArabic ? '٢. اختيار وسيلة الدفع الآمنة' : '2. Select Payment Sanctuary'}
                  </h2>
                  <p className="font-body text-xs text-[#3A332D]/70 dark:text-[#DFCA9B]/80 mt-1">
                    {isArabic
                      ? 'اختر بين الدفع نقداً عند الاستلام، أو التحويل الفوري عبر InstaPay / فودافون كاش، أو البطاقة البنكية.'
                      : 'Choose between physical payment upon arrival or secure card processing via Paymob.'}
                  </p>
                </div>

                <PaymentMethodSelector
                  method={paymentMethod}
                  onChange={(m) => setPaymentMethod(m)}
                  isArabic={isArabic}
                />

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3.5 rounded-full border border-[#14110F]/30 dark:border-[#B08D57]/40 text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] font-display text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={14} className={isArabic ? 'rotate-180' : ''} />
                    <span>{isArabic ? 'العودة لبيانات الشحن' : 'Back to Shipping'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-8 py-4 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 flex items-center gap-2 transition-colors shadow-md cursor-pointer font-medium"
                  >
                    <span>{isArabic ? 'مراجعة الطلب' : 'Review Order'}</span>
                    <ArrowRight size={14} className={isArabic ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STEP 3: Review & Place Order                             */}
            {/* ======================================================== */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-[#B08D57]/30 pb-4">
                  <h2 className="font-display text-lg uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                    {isArabic ? '٣. المراجعة النهائية وتأكيد الطلب' : '3. Final Review & Confirmation'}
                  </h2>
                  <p className="font-body text-xs text-[#3A332D]/70 dark:text-[#DFCA9B]/80 mt-1">
                    {isArabic
                      ? 'يرجى مراجعة كافة تفاصيل طلبك قبل تجهيزه وختمه بالشمع الملكي.'
                      : 'Please verify your bespoke order details before we begin sealing your vessel.'}
                  </p>
                </div>

                {/* Review Summary Grid */}
                <div className="p-5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1C1613] border border-[#B08D57]/30 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-[#B08D57]/20 pb-2">
                    <span className="font-display uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                      {isArabic ? 'اسم العميل' : 'Patron'}
                    </span>
                    <span className="font-bold text-[#14110F] dark:text-[#FDFBF7]">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#B08D57]/20 pb-2">
                    <span className="font-display uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                      {isArabic ? 'رقم الموبايل' : 'Delivery Mobile'}
                    </span>
                    <span dir="ltr" className="ltr-isolate text-[#14110F] dark:text-[#FDFBF7]">{phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#B08D57]/20 pb-2">
                    <span className="font-display uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                      {isArabic ? 'المحافظة والمدينة' : 'Governorate & City'}
                    </span>
                    <span className="text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic
                        ? `${selectedGov.name_ar}${city ? ` (${city})` : ''}`
                        : `${selectedGov.name_en} (${city || selectedGov.name_en})`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#B08D57]/20 pb-2">
                    <span className="font-display uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                      {isArabic ? 'العنوان بالتفصيل' : 'Address'}
                    </span>
                    <span className="text-[#14110F] dark:text-[#FDFBF7] max-w-xs text-end truncate">
                      {streetAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-display uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                      {isArabic ? 'وسيلة الدفع' : 'Payment Method'}
                    </span>
                    <span className="font-semibold uppercase tracking-wider text-[#6B1D2F] dark:text-[#DFCA9B]">
                      {paymentMethod === 'cod'
                        ? isArabic ? 'الدفع عند الاستلام (مصر)' : 'Cash on Delivery (Egypt)'
                        : paymentMethod === 'instapay'
                        ? isArabic ? 'تحويل انستاباي الفوري' : 'InstaPay Instant Transfer'
                        : paymentMethod === 'vodafone_cash'
                        ? isArabic ? 'فودافون كاش / المحافظ الإلكترونية' : 'Vodafone Cash / Mobile Wallet'
                        : isArabic ? 'البطاقة الائتمانية (Paymob)' : 'Credit / Debit Card (Paymob)'}
                    </span>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
                    {submitError}
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    className="px-6 py-3.5 rounded-full border border-[#14110F]/30 dark:border-[#B08D57]/40 text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] font-display text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={14} className={isArabic ? 'rotate-180' : ''} />
                    <span>{isArabic ? 'رجوع' : 'Back'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="px-10 py-4.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 flex items-center gap-3 transition-all duration-400 shadow-xl disabled:opacity-50 border border-[#B08D57]/40 cursor-pointer font-medium"
                  >
                    {isSubmitting ? (
                      <span>{isArabic ? 'جاري تسجيل وختم الطلب...' : 'Sealing Order...'}</span>
                    ) : (
                      <>
                        <span>
                          {isArabic ? 'تأكيد الطلب — ' : 'Place Order — '}
                          <Price amount={orderTotal} />
                        </span>
                        <ShieldCheck size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Summary Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shippingFee={shippingFee}
              discount={discount}
              total={orderTotal}
              coupon={coupon}
              isArabic={isArabic}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
