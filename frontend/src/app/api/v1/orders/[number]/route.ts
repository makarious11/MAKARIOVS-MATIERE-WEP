import { NextResponse } from 'next/server';
import { getServerOrders } from '@/lib/serverDb';
import { normalizePhone } from '@/lib/patronAuth';
import {
  checkRateLimit,
  getClientIp,
  hasOrderReceiptAccess,
  isIpBlocked,
  logSecurityEvent,
  maskName,
  verifyAdminFromRequest,
  verifyPatronFromRequest,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const ip = getClientIp(request);
  if (isIpBlocked(ip)) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  // Stop order number enumeration brute-forcing
  const rl = checkRateLimit(`order_lookup_${ip}`, 25, 5 * 60 * 1000);
  if (!rl.allowed) {
    logSecurityEvent({
      severity: 'warning',
      event: 'ORDER_ENUMERATION_RATE_LIMIT',
      ip,
      path: 'GET /api/v1/orders/[number]',
      details: `Excessive order lookup requests blocked (${rl.retryAfterSeconds}s wait)`,
    });
    return NextResponse.json(
      { message: `Too many lookups. Please wait ${rl.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  const { number } = await params;
  const cleanNumber = String(number || '').trim().toUpperCase();

  if (!/^LV-[A-Z0-9]{4,14}$/.test(cleanNumber)) {
    return NextResponse.json({ message: 'Invalid order reference format' }, { status: 400 });
  }

  const orders = getServerOrders();
  const matched = orders.find((o) => o.id.toUpperCase() === cleanNumber);

  if (!matched) {
    return NextResponse.json({ message: 'Order reference not found' }, { status: 404 });
  }

  // Determine whether caller is authorized to see unmasked PII (Admin, buyer receipt cookie, or matching Patron session)
  const isAdmin = verifyAdminFromRequest(request).authenticated;
  const hasReceipt = hasOrderReceiptAccess(request, cleanNumber);
  const patronSession = verifyPatronFromRequest(request);
  const isOrderOwnerPatron = Boolean(
    patronSession.authenticated &&
      patronSession.phone &&
      matched.phone &&
      normalizePhone(patronSession.phone) === normalizePhone(matched.phone)
  );

  const allowFullPII = isAdmin || hasReceipt || isOrderOwnerPatron;

  const govOnly = (matched.gov || 'Cairo').split('—')[0]?.trim() || 'Cairo';

  const itemsList =
    matched.items_detail && matched.items_detail.length > 0
      ? matched.items_detail.map((i) => ({
          name_en: i.name_en,
          name_ar: i.name_ar || i.name_en,
          size_ml: i.size_ml,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.price * i.quantity,
        }))
      : [
          {
            name_en: matched.items,
            name_ar: matched.items,
            quantity: 1,
            price: matched.total,
            subtotal: matched.total,
          },
        ];

  return NextResponse.json({
    data: {
      order_number: matched.id,
      customer: {
        name: allowFullPII ? matched.customer : maskName(matched.customer),
        governorate: govOnly,
        city: allowFullPII ? matched.gov : '',
        address: allowFullPII ? matched.gov : govOnly,
      },
      items: itemsList,
      pricing: {
        subtotal: matched.total,
        shipping: 0,
        discount: 0,
        total: matched.total,
      },
      payment: {
        method: matched.payment,
        status: matched.status === 'Delivered' ? 'paid' : 'confirmed',
      },
      status: matched.status,
      created_at: matched.date,
      eta_days: '1–3 business days',
    },
  });
}
