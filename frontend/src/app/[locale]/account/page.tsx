'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  Heart,
  MapPin,
  ArrowRight,
  ShieldCheck,
  User,
  LogOut,
  Phone,
  Mail,
  Search,
  Sparkles,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';
import { getPatronOrders, MaisonOrder } from '@/lib/orders';
import {
  getCurrentPatron,
  setCurrentPatron,
  loginPatron,
  registerPatron,
  logoutPatron,
  PatronProfile,
  normalizePhone,
} from '@/lib/patronAuth';

export default function AccountPage() {
  const pathname = usePathname();
  const router = useRouter();
  const isArabic = Boolean(pathname?.startsWith('/ar'));

  // Auth State
  const [patron, setPatron] = useState<PatronProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'track'>('login');
  const [authError, setAuthError] = useState('');

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // Quick Tracking Input
  const [quickTrackNumber, setQuickTrackNumber] = useState('');

  // Sanctum View State
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses'>('orders');
  const [patronOrders, setPatronOrders] = useState<MaisonOrder[]>([]);

  // Load Patron & Patron's Orders
  const loadPatronData = () => {
    const active = getCurrentPatron();
    setPatron(active);
    if (active) {
      const orders = getPatronOrders(active.phone, active.name);
      setPatronOrders(orders);
    } else {
      setPatronOrders([]);
    }
  };

  useEffect(() => {
    loadPatronData();

    const handleAuthChange = () => {
      loadPatronData();
    };
    window.addEventListener('lv_patron_auth_changed', handleAuthChange);
    window.addEventListener('lv_order_created', handleAuthChange);
    window.addEventListener('lv_order_status_updated', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('lv_patron_auth_changed', handleAuthChange);
      window.removeEventListener('lv_order_created', handleAuthChange);
      window.removeEventListener('lv_order_status_updated', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginIdentifier.trim()) {
      setAuthError(isArabic ? 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني' : 'Please enter your phone number or email');
      return;
    }

    const res = loginPatron(loginIdentifier.trim());
    if (!res.success || !res.patron) {
      setAuthError(res.error || (isArabic ? 'تعذر الدخول، يرجى التحقق من البيانات' : 'Authentication failed'));
      return;
    }

    setPatron(res.patron);
    setPatronOrders(getPatronOrders(res.patron.phone, res.patron.name));
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const res = registerPatron({
      name: regName,
      phone: regPhone,
      email: regEmail,
      city: regCity,
      address: regAddress,
      allowExisting: false,
    });

    if (!res.success || !res.patron) {
      setAuthError(
        res.error ||
          (isArabic
            ? 'هذا الرقم مسجل بالفعل في سجلات الدار. لا يمكن إنشاء حسابين بنفس الرقم، يرجى تسجيل الدخول.'
            : 'This mobile number is already registered. Cannot create duplicate accounts, please sign in.')
      );
      if (res.alreadyRegistered) {
        setLoginIdentifier(regPhone);
      }
      return;
    }

    setPatron(res.patron);
    setPatronOrders(getPatronOrders(res.patron.phone, res.patron.name));
  };

  // Handle Logout
  const handleLogout = () => {
    logoutPatron();
    setPatron(null);
    setPatronOrders([]);
    setLoginIdentifier('');
  };

  // Handle Direct Track
  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = quickTrackNumber.trim();
    if (!cleanNum) return;
    router.push(isArabic ? `/ar/orders/${cleanNum}` : `/orders/${cleanNum}`);
  };

  // ============================================================
  // VIEW 1: PATRON AUTHENTICATION GATE (NOT LOGGED IN)
  // ============================================================
  if (!patron) {
    return (
      <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-32 pb-24 transition-colors duration-300">
        <BotanicalPattern opacity={0.04} />

        <div className="max-w-xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
          {/* Header Seal */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <WaxSeal size={68} />
            </div>
            <span className="font-display text-xs tracking-widest3 uppercase text-[#B08D57] block">
              {isArabic ? 'محراب عملاء دار لوفينوس' : 'Maison L’VENUS Patron Sanctuary'}
            </span>
            <h1 className="font-display text-2xl sm:text-4xl uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
              {isArabic ? 'بوابة العضوية والشحنات' : 'Patron Account Access'}
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#3A332D]/75 dark:text-[#DFCA9B]/80 max-w-sm mx-auto leading-relaxed">
              {isArabic
                ? 'سجل دخولك برقم الموبايل لمتابعة شحناتك الخاصة، أو تتبع طلبك مباشرة.'
                : 'Enter your phone number to access your personal commissions, addresses, and scent history.'}
            </p>
          </div>

          {/* Auth Card */}
          <div className="p-6 sm:p-10 rounded-3xl bg-[#F1EADA]/60 dark:bg-[#161210] border border-[#B08D57]/40 shadow-xl space-y-6">
            {/* Mode Switcher */}
            <div className="flex rounded-full bg-[#FDFBF7] dark:bg-[#1C1613] p-1 border border-[#B08D57]/30">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 rounded-full font-display text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-sm font-semibold'
                    : 'text-[#14110F]/60 dark:text-[#FDFBF7]/60 hover:text-[#14110F] dark:hover:text-[#FDFBF7]'
                }`}
              >
                {isArabic ? 'دخول العميل' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 rounded-full font-display text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-sm font-semibold'
                    : 'text-[#14110F]/60 dark:text-[#FDFBF7]/60 hover:text-[#14110F] dark:hover:text-[#FDFBF7]'
                }`}
              >
                {isArabic ? 'عضوية جديدة' : 'New Member'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('track');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 rounded-full font-display text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  authMode === 'track'
                    ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-sm font-semibold'
                    : 'text-[#14110F]/60 dark:text-[#FDFBF7]/60 hover:text-[#14110F] dark:hover:text-[#FDFBF7]'
                }`}
              >
                {isArabic ? 'تتبع سريع' : 'Quick Track'}
              </button>
            </div>

            {authError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 text-center font-medium space-y-2.5">
                <p>{authError}</p>
                {authMode === 'register' && loginIdentifier && (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                      }}
                      className="inline-block px-4 py-2 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] text-white text-[11px] font-display uppercase tracking-wider cursor-pointer hover:bg-[#6B1D2F] shadow-sm transition-colors"
                    >
                      {isArabic ? 'الانتقال لتسجيل الدخول برقمك' : 'Sign In With This Number'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: LOGIN */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                    {isArabic ? 'رقم الموبايل المصري (أو البريد)' : 'Egyptian Mobile Number or Email'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={isArabic ? '01012345678 أو patron@domain.com' : '01012345678 or patron@domain.com'}
                      className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>
                  <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                    {isArabic
                      ? 'أدخل نفس رقم الموبايل الذي استخدمته عند طلب العطر لإظهار شحناتك تلقائياً.'
                      : 'Enter the phone number used during your order dispatch to retrieve your vessels.'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 transition-all duration-300 shadow-md border border-[#B08D57]/30 cursor-pointer font-medium flex items-center justify-center gap-2"
                >
                  <UserCheck size={14} />
                  <span>{isArabic ? 'فتح محراب العميل' : 'Open Patron Sanctum'}</span>
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                    {isArabic ? 'الاسم بالكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={isArabic ? 'مثال: مكاريوس بطرس' : 'e.g. Makarious Boutros'}
                    className="w-full p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'رقم الموبايل *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'البريد (اختياري)' : 'Email (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="patron@domain.com"
                      className="w-full p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'المدينة / المنطقة' : 'City / District'}
                    </label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder={isArabic ? 'الزمالك / التجمع' : 'Zamalek / New Cairo'}
                      className="w-full p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'العنوان بالتفصيل' : 'Street Address'}
                    </label>
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder={isArabic ? 'رقم المبنى والشارع والشقة' : 'Building, street, apt...'}
                      className="w-full p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 text-xs font-body focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 transition-all duration-300 shadow-md border border-[#B08D57]/30 cursor-pointer font-medium mt-2"
                >
                  {isArabic ? 'تأسيس عضوية جديدة' : 'Establish Patron Membership'}
                </button>
              </form>
            )}

            {/* TAB 3: QUICK TRACK */}
            {authMode === 'track' && (
              <form onSubmit={handleQuickTrackSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-display text-xs uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                    {isArabic ? 'رقم الشحنة / كود الطلب' : 'Official Order Reference Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={quickTrackNumber}
                    onChange={(e) => setQuickTrackNumber(e.target.value)}
                    placeholder="e.g. LV-777140"
                    className="w-full p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]"
                  />
                  <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                    {isArabic ? 'متاح لأي عميل لمتابعة شحنته دون الحاجة لتسجيل الدخول.' : 'Direct dispatch tracking without logging in.'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-widest3 transition-all duration-300 shadow-md border border-[#B08D57]/30 cursor-pointer font-medium flex items-center justify-center gap-2"
                >
                  <Search size={14} />
                  <span>{isArabic ? 'تتبع مسار الشحنة الآن' : 'Track Consignment Now'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEW 2: LOGGED-IN PATRON SANCTUM
  // ============================================================
  const patronInitial = (patron.name || 'P').charAt(0).toUpperCase();

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-32 pb-24 transition-colors duration-300">
      <BotanicalPattern opacity={0.04} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Header Profile Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#B08D57]/30 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] flex items-center justify-center font-display text-xl border border-[#B08D57]/40 shadow-md font-bold">
              {patronInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                  {patron.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] tracking-widest uppercase bg-[#B08D57]/20 text-[#8C6E3D] dark:text-[#DFCA9B] font-semibold border border-[#B08D57]/40">
                  {isArabic ? 'عضو دار لوفينوس' : 'Patron Member'}
                </span>
              </div>
              <p className="font-body text-xs text-[#8C6E3D] dark:text-[#DFCA9B] italic mt-0.5">
                {patron.phone ? `${patron.phone} • ` : ''}
                {isArabic ? `عضوية معتمدة منذ ${patron.registeredAt || '2026'}` : `Registered Patron Collector since ${patron.registeredAt || '2026'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <WaxSeal size={42} />
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-full border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-700 dark:hover:text-white transition-all text-xs font-display uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={isArabic ? 'تسجيل الخروج والتبديل لحساب آخر' : 'Sign out / Switch account'}
            >
              <LogOut size={13} />
              <span>{isArabic ? 'خروج' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-[#B08D57]/20 pb-4 overflow-x-auto">
          {[
            {
              id: 'orders',
              label: isArabic ? `سجل طلباتي (${patronOrders.length})` : `My Consignments (${patronOrders.length})`,
              icon: Package,
            },
            { id: 'wishlist', label: isArabic ? 'قائمة الأمنيات' : 'Perfume Wishlist', icon: Heart },
            { id: 'addresses', label: isArabic ? 'العناوين المسجلة' : 'Saved Addresses', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-display text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-md border border-[#B08D57]/40 font-medium'
                    : 'bg-[#F1EADA]/60 dark:bg-[#161210] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/30 hover:bg-[#F1EADA] dark:hover:bg-[#1C1613]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* TAB 1: PATRON ORDERS (ONLY THEIR OWN COMMISSIONS)            */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm uppercase tracking-widest text-[#14110F] dark:text-[#FDFBF7]">
                {isArabic
                  ? `شحنات العطور المحجوزة لحسابك (${patronOrders.length})`
                  : `Your Personal Consignments (${patronOrders.length})`}
              </h2>

              <Link
                href={isArabic ? '/ar/shop' : '/shop'}
                className="text-xs font-display uppercase tracking-wider text-[#6B1D2F] dark:text-[#DFCA9B] hover:underline"
              >
                {isArabic ? '+ طلب عطر جديد' : '+ Commission New Flacon'}
              </Link>
            </div>

            {patronOrders.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/30 text-center space-y-4">
                <Package size={36} className="mx-auto text-[#B08D57]" />
                <h3 className="font-display text-lg uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? 'لا توجد شحنات مسجلة لهذا الحساب حتى الآن' : 'No Consignments Yet'}
                </h3>
                <p className="font-body text-xs text-[#3A332D]/70 dark:text-[#DFCA9B]/80 max-w-sm mx-auto leading-relaxed">
                  {isArabic
                    ? 'لم تقم بحجز أي عطر برقم هذا الهاتف بعد. يمكنك استكشاف التشكيلة الملكية وطلب عطرك الأول.'
                    : 'You have not commissioned any vessels with this account yet. Explore our four rare Extraits.'}
                </p>
                <Link
                  href={isArabic ? '/ar/shop' : '/shop'}
                  className="inline-block mt-2 px-6 py-2.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] font-display text-xs uppercase tracking-widest hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] transition-colors cursor-pointer"
                >
                  {isArabic ? 'استكشف التشكيلة' : 'Explore Collection'}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {patronOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-6 rounded-3xl bg-[#F1EADA]/60 dark:bg-[#161210] border border-[#B08D57]/35 dark:border-[#B08D57]/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-base font-bold uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
                          {isArabic ? `طلب رقم ${ord.id}` : `Order ${ord.id}`}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-display uppercase tracking-wider font-semibold ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : ord.status === 'Shipped'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <p className="font-body text-xs text-[#3A332D]/75 dark:text-[#DFCA9B]/85">
                        {isArabic ? 'بتاريخ' : 'Placed on'} {ord.date} — {ord.items}
                      </p>
                      <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                        {isArabic ? 'وجهة التوصيل:' : 'Destination:'} {ord.gov}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-display text-base font-bold text-[#14110F] dark:text-[#FDFBF7]">
                        {new Intl.NumberFormat('en-US').format(ord.total)} EGP
                      </span>
                      <Link
                        href={isArabic ? `/ar/orders/${ord.id}` : `/orders/${ord.id}`}
                        className="px-5 py-2.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] text-[#FDFBF7] font-display text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer border border-[#B08D57]/30"
                      >
                        <span>{isArabic ? 'تتبع الشحنة' : 'Track'}</span>
                        <ArrowRight size={12} className={isArabic ? 'rotate-180' : ''} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: WISHLIST                                              */}
        {/* ============================================================ */}
        {activeTab === 'wishlist' && (
          <div className="p-12 rounded-3xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/30 text-center space-y-4">
            <Heart size={36} className="mx-auto text-[#6B1D2F] dark:text-[#DFCA9B]" />
            <h3 className="font-display text-lg uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7]">
              {isArabic ? 'مكتبتك العطرية الخاصة' : 'Curate Your Personal Scent Library'}
            </h3>
            <p className="font-body text-xs text-[#3A332D]/70 dark:text-[#DFCA9B]/80 max-w-sm mx-auto leading-relaxed">
              {isArabic
                ? 'انقر على رمز القلب عند أي عطر لحفظه في محرابك الخاص لمواسم الحصاد القادمة.'
                : 'Tap the heart icon on any Extrait de Parfum to save it to your private sanctuary for future harvest cycles.'}
            </p>
            <Link
              href={isArabic ? '/ar/shop' : '/shop'}
              className="inline-block mt-2 px-6 py-2.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] font-display text-xs uppercase tracking-widest hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] transition-colors cursor-pointer"
            >
              {isArabic ? 'استكشف التشكيلة' : 'Explore Collection'}
            </Link>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SAVED ADDRESSES                                       */}
        {/* ============================================================ */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#F1EADA]/60 dark:bg-[#161210] border border-[#B08D57]/40 space-y-3">
              <span className="font-display text-[10px] uppercase tracking-widest text-[#B08D57] block font-semibold">
                {isArabic ? 'عنوان التوصيل المعتمد لحسابك' : 'Primary Delivery Sanctuary (Egypt)'}
              </span>
              <h4 className="font-display text-sm uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] font-bold">
                {patron.name}
              </h4>
              <p className="font-body text-xs text-[#3A332D] dark:text-[#DFCA9B]/85 leading-relaxed">
                {patron.address || (isArabic ? 'شارع 26 يوليو، الزمالك' : '26 July Street, Zamalek')}<br />
                {patron.city || 'Cairo'}, Egypt<br />
                {isArabic ? 'الهاتف:' : 'Mobile:'} {patron.phone || '01012345678'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
