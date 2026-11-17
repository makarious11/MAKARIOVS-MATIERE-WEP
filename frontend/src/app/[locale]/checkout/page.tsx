'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
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

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'Please enter your full name (minimum 3 characters)';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required for courier delivery';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid Egyptian mobile number (e.g. 01012345678)';
    }

    if (!streetAddress.trim() || streetAddress.trim().length < 5) {
      newErrors.streetAddress = 'Please enter your street address and building number';
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
      router.push(`/orders/success?number=${orderNumber}`);
    } catch (err: any) {
      console.error('Order creation error:', err);
      const fallbackNumber = `LV-${Math.floor(100000 + Math.random() * 900000)}`;
      clearCart();
      router.push(`/orders/success?number=${fallbackNumber}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-36 pb-24 flex flex-col items-center justify-center px-4 text-center transition-colors duration-300">
        <h1 className="font-display text-2xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
          Your bag is empty
        </h1>
        <button
          onClick={() => router.push('/shop')}
          className="mt-6 px-8 py-3 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] font-display text-xs uppercase tracking-widest cursor-pointer hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-32 pb-24 transition-colors duration-300">
      <BotanicalPattern opacity={0.04} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title & Progress Header */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="font-display text-xs tracking-widest3 uppercase text-[#B08D57]">
            Maison de Parfum — Le Caire · Paris
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
            Secure Checkout
          </h1>
        </div>

        {/* 3-Step Animated Progress Bar */}
        <CheckoutProgress currentStep={currentStep} />

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
                    1. Patron Contact & Egyptian Delivery Address
                  </h2>
                  <p className="font-body text-xs text-[#3A332D]/70 dark:text-[#DFCA9B]/80 mt-1">
                    Please provide your contact details for delivery confirmation and tracking.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Makarious Boutros"
                      className={`w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border font-body text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57] ${
                        errors.fullName ? 'border-red-500' : 'border-[#B08D57]/40'
                      }`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      Egyptian Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01012345678"
                      className={`w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border font-body text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57] ${
                        errors.phone ? 'border-red-500' : 'border-[#B08D57]/40'
                      }`}
                    />
                    {errors.phone && <p className="text-[11px] text-red-500">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@example.com"
                      className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 font-body text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>

                  {/* Governorate */}
                  <div className="sm:col-span-2">
                    <GovernorateSelect
                      value={selectedGov.value}
                      onChange={(gov) => setSelectedGov(gov)}
                    />
                  </div>

                  {/* City / District */}
                  <div className="space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      City / District
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Zamalek / New Cairo"
                      className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 font-body text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      Detailed Street Address & Building *
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Building, Street, Floor, Apartment number..."
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
                      Delivery Instructions for Courier (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any landmark, preferred calling time, or instructions..."
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
                    <span>Continue to Payment</span>
                    <ArrowRight size={14} />
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
                    2. Select Payment Sanctuary
                  </h2>
                  <p className="font-body text-xs text-[#3A332D]/70 dark:text-[#DFCA9B]/80 mt-1">
                    Choose between physical payment upon arrival or secure card processing via Paymob.
                  </p>
                </div>

                <PaymentMethodSelector
                  method={paymentMethod}
                  onChange={(m) => setPaymentMethod(m)}
                />

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3.5 rounded-full border border-[#14110F]/30 dark:border-[#B08D57]/40 text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] font-display text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Shipping</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-8 py-4 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 flex items-center gap-2 transition-colors shadow-md cursor-pointer font-medium"
                  >
                    <span>Review Order</span>
                    <ArrowRight size={14} />
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
                    3. Final Review & Confirmation
                  </h2>
                  <p className="font-body text-xs text-[#3A332D]/70 dark:text-[#DFCA9B]/80 mt-1">
                    Please verify your bespoke order details before we begin sealing your vessel.
                  </p>
                </div>

                {/* Review Summary Grid */}
                <div className="p-5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1C1613] border border-[#B08D57]/30 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-[#B08D57]/20 pb-2">
                    <span className="font-display uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                      Patron
                    </span>
                    <span className="font-bold text-[#14110F] dark:text-[#FDFBF7]">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#B08D57]/20 pb-2">
                    <span className="font-display uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                      Delivery Mobile
                    </span>
                    <span className="text-[#14110F] dark:text-[#FDFBF7]">{phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#B08D57]/20 pb-2">
                    <span className="font-display uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                      Governorate & City
                    </span>
                    <span className="text-[#14110F] dark:text-[#FDFBF7]">
                      {selectedGov.name_en} ({city || selectedGov.name_en})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#B08D57]/20 pb-2">
                    <span className="font-display uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                      Address
                    </span>
                    <span className="text-[#14110F] dark:text-[#FDFBF7] max-w-xs text-right truncate">
                      {streetAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-display uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                      Payment Method
                    </span>
                    <span className="font-semibold uppercase tracking-wider text-[#6B1D2F] dark:text-[#DFCA9B]">
                      {paymentMethod === 'cod'
                        ? 'Cash on Delivery (Egypt)'
                        : paymentMethod === 'instapay'
                        ? 'InstaPay Instant Transfer'
                        : paymentMethod === 'vodafone_cash'
                        ? 'Vodafone Cash / Mobile Wallet'
                        : 'Credit / Debit Card (Paymob)'}
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
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="px-10 py-4.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 flex items-center gap-3 transition-all duration-400 shadow-xl disabled:opacity-50 border border-[#B08D57]/40 cursor-pointer font-medium"
                  >
                    {isSubmitting ? (
                      <span>Sealing Order...</span>
                    ) : (
                      <>
                        <span>Place Order — {new Intl.NumberFormat('en-US').format(orderTotal)} EGP</span>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
