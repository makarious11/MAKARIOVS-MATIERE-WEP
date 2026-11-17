'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Clock,
  Truck,
  Home,
  ArrowLeft,
  PackageCheck,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { BotanicalPattern } from '@/components/ui/BotanicalPattern';
import { getAllOrdersForAdmin, getStatusOverrides, MaisonOrder } from '@/lib/orders';

interface TrackingPageProps {
  params: Promise<{ locale?: string; number: string }>;
}

interface OrderData {
  order_number: string;
  customer?: {
    name?: string;
    governorate?: string;
    governorate_ar?: string;
    city?: string;
    address?: string;
  };
  items?: Array<{
    name_en: string;
    name_ar?: string;
    size_ml?: number;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  pricing?: {
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
  };
  payment?: {
    method: string;
    status: string;
  };
  status?: string;
  created_at?: string;
  eta_days?: string;
}

export default function OrderTrackingPage({ params }: TrackingPageProps) {
  const resolvedParams = use(params);
  const number = resolvedParams.number;
  const isArabic = resolvedParams.locale === 'ar';

  const [order, setOrder] = useState<OrderData | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('Processing');
  const [loading, setLoading] = useState(true);

  const loadOrderData = async () => {
    // 1. Check local store first (captures live status updates from Admin immediately)
    const allOrders = getAllOrdersForAdmin();
    const overrides = getStatusOverrides();
    const matched = allOrders.find((o) => o.id === number);

    const activeStatus = overrides[number] || (matched ? matched.status : 'Processing');
    setCurrentStatus(activeStatus);

    if (matched) {
      setOrder({
        order_number: matched.id,
        customer: {
          name: matched.customer,
          governorate: matched.gov,
          city: '',
          address: matched.gov,
        },
        items: [
          {
            name_en: matched.items,
            name_ar: matched.items,
            quantity: 1,
            price: matched.total,
            subtotal: matched.total,
          },
        ],
        pricing: {
          subtotal: matched.total,
          shipping: 65,
          discount: 0,
          total: matched.total,
        },
        status: activeStatus,
        created_at: matched.date,
      });
    }

    // 2. Fetch server API data and merge
    try {
      const res = await fetch(`/api/v1/orders/${encodeURIComponent(number)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          // If admin has overridden status locally, respect the override
          const serverStatus = overrides[number] || json.data.status || activeStatus;
          setCurrentStatus(serverStatus);
          setOrder((prev) => ({
            ...json.data,
            status: serverStatus,
            customer: {
              ...json.data.customer,
              name: prev?.customer?.name || json.data.customer?.name,
            },
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching order from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();

    // Listen for live status change dispatched from Admin dashboard
    const handleStatusUpdate = (e: any) => {
      if (e.detail?.id === number) {
        setCurrentStatus(e.detail.status);
        setOrder((prev) => (prev ? { ...prev, status: e.detail.status } : null));
      } else {
        loadOrderData();
      }
    };

    window.addEventListener('lv_order_status_updated', handleStatusUpdate);
    window.addEventListener('storage', loadOrderData);

    return () => {
      window.removeEventListener('lv_order_status_updated', handleStatusUpdate);
      window.removeEventListener('storage', loadOrderData);
    };
  }, [number]);

  // Normalize status value
  const normStatus = (currentStatus || 'Processing').toLowerCase();
  const isProcessing = normStatus === 'processing' || normStatus === 'pending' || normStatus === 'confirmed';
  const isShipped = normStatus === 'shipped';
  const isDelivered = normStatus === 'delivered';
  const isCancelled = normStatus === 'cancelled';

  // Dynamic Timeline steps reflecting the exact stage
  const timelineSteps = [
    {
      id: 1,
      title: isArabic ? 'تم تأكيد وتسجيل الطلب' : 'Order Placed & Registered',
      date: isArabic ? 'اليوم' : 'Today',
      description: isArabic
        ? 'تم تسجيل طلبك رسمياً في سجل شحن الأتيليه الملكي.'
        : 'Your commission has entered the atelier dispatch book.',
      done: true,
      active: false,
      icon: Clock,
    },
    {
      id: 2,
      title: isArabic ? 'الختم بالشمع وفحص الجودة' : 'Artisanal Wax Sealing & Inspection',
      date: isProcessing
        ? isArabic ? 'جاري الآن في الأتيليه' : 'In Progress — Atelier'
        : isArabic ? 'مكتمل' : 'Completed',
      description: isArabic
        ? 'نقش الغطاء الخشبي، وفحص الزجاجة وتطبيق ختم الشمع الملكي يدوياً.'
        : 'Cap carved, flacon inspected, and hot burgundy wax stamp applied.',
      done: isShipped || isDelivered,
      active: isProcessing,
      icon: isProcessing ? Sparkles : Check,
    },
    {
      id: 3,
      title: isArabic ? 'في الطريق مع مندوب التوصيل' : 'Dispatched with Courier',
      date: isDelivered
        ? isArabic ? 'تم التسليم' : 'Completed'
        : isShipped
        ? isArabic ? 'الآن — في الطريق لوجهتك' : 'Out for Delivery — In Transit'
        : isArabic ? 'يبدأ فور اكتمال التجهيز' : 'Awaiting courier pickup',
      description: isArabic
        ? 'الطلب في طريقه إليك عبر سيارات شحن مجهزة ومكيفة.'
        : 'En route to your address via climate-controlled luxury transport.',
      done: isDelivered,
      active: isShipped,
      icon: Truck,
    },
    {
      id: 4,
      title: isArabic ? 'تم التسليم بنجاح للعميل' : 'Delivered to Patron',
      date: isDelivered
        ? isArabic ? 'تم الاستلام بنجاح' : 'Delivered & Handed to Patron'
        : isArabic ? 'متوقع خلال 1–2 يوم عمل' : 'Expected within 1–2 days',
      description: isArabic
        ? 'يتم تسليم الصندوق الأسود الفاخر لك يداً بيد.'
        : 'Handed to you in our rigid black presentation box.',
      done: isDelivered,
      active: isDelivered,
      icon: isDelivered ? PackageCheck : Home,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-32 pb-24 transition-colors duration-300">
      <BotanicalPattern opacity={0.04} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-widest text-[#3A332D]/70 dark:text-[#DFCA9B]/80 hover:text-[#6B1D2F] dark:hover:text-[#B08D57] transition-colors"
          >
            <ArrowLeft size={14} className={isArabic ? 'rotate-180' : ''} />
            <span>{isArabic ? 'العودة للرئيسية' : 'Return Home'}</span>
          </Link>

          <a
            href={`https://wa.me/201210593766?text=${encodeURIComponent(
              `Hello L'VENUS Concierge, I am inquiring about Order #${number} (Status: ${currentStatus})`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-wider text-[#6B1D2F] dark:text-[#DFCA9B] hover:underline"
          >
            <MessageCircle size={14} />
            <span>{isArabic ? 'تواصل مع الكونسيرج (واتساب)' : 'Concierge WhatsApp'}</span>
          </a>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-12 rounded-3xl bg-[#F1EADA]/60 dark:bg-[#161210] border border-[#B08D57]/40 shadow-xl space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#B08D57]/30 pb-6 gap-4">
            <div>
              <span className="font-display text-xs tracking-widest3 uppercase text-[#B08D57] block">
                {isArabic ? 'متابعة مسار شحن الأتيليه' : 'Atelier Fulfillment Timeline'}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-[#14110F] dark:text-[#FDFBF7] mt-1">
                {isArabic ? `طلب رقم ${number}` : `Order ${number}`}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <WaxSeal size={48} />
            </div>
          </div>

          {/* Patron & Destination Banner */}
          <div className="p-5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1C1613] border border-[#B08D57]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-display text-[10px] uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] block">
                {isArabic ? 'اسم العميل' : 'Patron'}
              </span>
              <span className="font-bold text-[#14110F] dark:text-[#FDFBF7]">
                {order?.customer?.name || 'Royal Patron'}
              </span>
            </div>
            <div>
              <span className="font-display text-[10px] uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] block">
                {isArabic ? 'وجهة التوصيل' : 'Destination'}
              </span>
              <span className="text-[#14110F] dark:text-[#FDFBF7]">
                {order?.customer?.governorate || 'Cairo'}, {order?.customer?.city || ''}
              </span>
            </div>
            <div>
              <span className="font-display text-[10px] uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] block">
                {isArabic ? 'حالة الشحن الحالية' : 'Live Status'}
              </span>

              {/* Dynamic Status Pill */}
              <span
                className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-full text-xs ${
                  isDelivered
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : isShipped
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                    : isCancelled
                    ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                }`}
              >
                {isDelivered ? (
                  <>
                    <CheckCircle2 size={13} />
                    <span>{isArabic ? 'تم التسليم بنجاح' : 'Delivered to Patron'}</span>
                  </>
                ) : isShipped ? (
                  <>
                    <Truck size={13} className="animate-pulse" />
                    <span>{isArabic ? 'في الطريق مع المندوب' : 'In Transit / Dispatched'}</span>
                  </>
                ) : isCancelled ? (
                  <>
                    <AlertCircle size={13} />
                    <span>{isArabic ? 'ملغي' : 'Cancelled'}</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} className="animate-spin text-amber-600 dark:text-amber-400" />
                    <span>{isArabic ? 'قيد التجهيز والختم' : 'Processing / In Atelier'}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Cancelled Notice if Applicable */}
          {isCancelled && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <p>
                {isArabic
                  ? 'تم إلغاء هذه الشحنة. إذا كان لديك أي استفسار يرجى التواصل مع كونسيرج الدار.'
                  : 'This consignment has been cancelled. Please contact concierge for assistance.'}
              </p>
            </div>
          )}

          {/* Dynamic Interactive Timeline Steps */}
          <div className="space-y-8 pl-4 sm:pl-8 border-l-2 border-[#B08D57]/40 relative">
            {timelineSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative space-y-1">
                  {/* Timeline Node */}
                  <div
                    className={`absolute -left-[25px] sm:-left-[41px] top-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                      step.done
                        ? 'bg-[#6B1D2F] text-[#FDFBF7] border-[#B08D57] shadow-sm'
                        : step.active
                        ? 'bg-amber-500/20 text-[#DFCA9B] border-[#B08D57] ring-4 ring-[#B08D57]/20 animate-pulse'
                        : 'bg-[#FDFBF7] dark:bg-[#1C1613] text-[#3A332D]/40 dark:text-[#DFCA9B]/40 border-[#B08D57]/40'
                    }`}
                  >
                    <Icon size={14} />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-display text-sm sm:text-base uppercase tracking-wider ${
                          step.done || step.active
                            ? 'text-[#14110F] dark:text-[#FDFBF7] font-bold'
                            : 'text-[#3A332D]/50 dark:text-[#DFCA9B]/50'
                        }`}
                      >
                        {step.title}
                      </h3>
                      {step.active && (
                        <span className="px-2 py-0.5 rounded-full bg-[#B08D57]/20 text-[#8C6E3D] dark:text-[#DFCA9B] text-[9px] font-bold uppercase tracking-widest border border-[#B08D57]/40">
                          {isArabic ? 'المرحلة الحالية' : 'Current Stage'}
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-body text-xs italic ${
                        step.active
                          ? 'text-[#6B1D2F] dark:text-[#DFCA9B] font-semibold'
                          : 'text-[#8C6E3D] dark:text-[#DFCA9B]/70'
                      }`}
                    >
                      {step.date}
                    </span>
                  </div>
                  <p className="font-body text-xs text-[#3A332D]/75 dark:text-[#DFCA9B]/80 leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Order Item Preview if present */}
          {order?.items && order.items.length > 0 && (
            <div className="border-t border-[#B08D57]/30 pt-6 space-y-3">
              <span className="font-display text-xs uppercase tracking-widest text-[#8C6E3D] dark:text-[#DFCA9B] block font-semibold">
                {isArabic ? 'الأصناف المحجوزة في هذه الشحنة' : 'Vessels In This Commission'}
              </span>
              <div className="divide-y divide-[#B08D57]/20">
                {order.items.map((item, i) => (
                  <div key={i} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-[#14110F] dark:text-[#FDFBF7]">
                        {isArabic ? item.name_ar || item.name_en : item.name_en}
                      </span>
                      {item.size_ml && (
                        <span className="text-[#8C6E3D] dark:text-[#DFCA9B]/70 ml-2">
                          {item.size_ml} ml × {item.quantity}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-[#14110F] dark:text-[#FDFBF7]">
                      {new Intl.NumberFormat('en-US').format(item.subtotal || item.price)} EGP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Assistance */}
          <div className="pt-6 border-t border-[#B08D57]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-[#3A332D]/75 dark:text-[#DFCA9B]/80 gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#B08D57]" />
              <p>
                {isArabic ? 'هل تحتاج مساعدة في شحنتك؟ ' : 'Need assistance with your consignment? '}
                <Link href={isArabic ? '/ar/contact' : '/contact'} className="text-[#6B1D2F] dark:text-[#DFCA9B] underline font-medium">
                  {isArabic ? 'تواصل مع الدعم الفني' : 'Contact our concierge'}
                </Link>
              </p>
            </div>
            <Link
              href={isArabic ? '/ar/shop' : '/shop'}
              className="px-6 py-2.5 rounded-full bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] font-display text-xs uppercase tracking-widest hover:bg-[#6B1D2F] dark:hover:bg-[#8A1D2E] transition-colors shadow-sm"
            >
              {isArabic ? 'تصفح التشكيلة' : 'Browse Shop'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}