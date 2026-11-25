import { NextResponse } from 'next/server';
import {
  getServerCatalog,
  getServerCoupons,
  getServerOrders,
  incrementServerCouponUsage,
  saveServerOrder,
  saveServerPatron,
  updateServerOrderStatus,
  deleteServerOrder,
} from '@/lib/serverDb';
import { EGYPT_GOVERNORATES } from '@/lib/governorates';
import { MaisonOrder } from '@/lib/orders';
import {
  ORDER_RECEIPT_COOKIE_NAME,
  buildSecureCookieOptions,
  checkRateLimit,
  createOrderReceiptToken,
  getClientIp,
  isIpBlocked,
  isValidEgyptianPhone,
  isValidEmail,
  logSecurityEvent,
  parseCookieHeader,
  requireAdmin,
  sanitizeText,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

const ALLOWED_PAYMENT_METHODS = new Set(['cod', 'card', 'instapay', 'vodafone_cash']);
const ALLOWED_STATUSES = new Set(['Processing', 'Shipped', 'Delivered', 'Cancelled']);

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isIpBlocked(ip)) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  // Prevent checkout spam / DoS (max 10 orders per hour per IP)
  const rl = checkRateLimit(`order_create_${ip}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    logSecurityEvent({
      severity: 'warning',
      event: 'ORDER_RATE_LIMIT',
      ip,
      path: 'POST /api/v1/orders',
      details: `Excessive order creation attempts blocked (${rl.retryAfterSeconds}s wait)`,
    });
    return NextResponse.json(
      { message: `Too many order requests. Please wait ${rl.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    const name = sanitizeText(body?.name, 100);
    const phone = sanitizeText(body?.phone, 24);
    const email = sanitizeText(body?.email, 140);
    const governorate = sanitizeText(body?.governorate, 80);
    const city = sanitizeText(body?.city, 80);
    const address = sanitizeText(body?.address, 300);
    const notes = sanitizeText(body?.notes, 400);
    const gift_box = Boolean(body?.gift_box);
    const gift_note = sanitizeText(body?.gift_note, 200);
    const coupon_code = sanitizeText(body?.coupon_code, 32);
    const payment_method = ALLOWED_PAYMENT_METHODS.has(String(body?.payment_method || 'cod'))
      ? String(body?.payment_method || 'cod')
      : 'cod';

    // Strict input validation
    if (!name || name.length < 3 || !phone || !governorate || !address || address.length < 5) {
      return NextResponse.json(
        { message: 'Valid name, mobile number, governorate, and detailed address are required' },
        { status: 422 }
      );
    }

    if (!isValidEgyptianPhone(phone)) {
      return NextResponse.json(
        { message: 'Please enter a valid Egyptian mobile number' },
        { status: 422 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 422 });
    }

    const items = body?.items;
    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 25) {
      return NextResponse.json({ message: 'Cart must contain between 1 and 25 items' }, { status: 422 });
    }

    // Validate optional GPS map coordinates and map URL safely
    let safeCoords: { lat: number; lng: number } | undefined;
    if (body?.map_coords && typeof body.map_coords === 'object') {
      const lat = Number(body.map_coords.lat);
      const lng = Number(body.map_coords.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        safeCoords = { lat, lng };
      }
    }

    let safeMapUrl: string | undefined;
    if (typeof body?.map_url === 'string' && body.map_url.startsWith('https://www.google.com/maps')) {
      safeMapUrl = body.map_url.slice(0, 260);
    }

    const catalog = getServerCatalog();

    // Server-side price recalculation (NEVER trust client prices or unverified products)
    let recalculatedSubtotal = 0;
    const validatedItems: Array<{
      product_id: number;
      product_slug: string;
      variant_id: number;
      name_en: string;
      name_ar: string;
      size_ml: number;
      price: number;
      quantity: number;
      subtotal: number;
      image: string;
    }> = [];

    for (const item of items) {
      const perfume = catalog.find(
        (p) => (p.id === item.product_id || p.slug === item.product_slug) && p.is_hidden !== true
      );

      if (!perfume) {
        logSecurityEvent({
          severity: 'warning',
          event: 'ORDER_TAMPERING_BLOCKED',
          ip,
          path: 'POST /api/v1/orders',
          details: `Order rejected: unknown or hidden product (${String(item.product_slug || item.product_id)})`,
        });
        return NextResponse.json(
          { message: 'One or more selected products are unavailable' },
          { status: 422 }
        );
      }

      const variant = perfume.variants?.find((v) => v.id === item.variant_id) || perfume.variants?.[0];
      if (!variant || !Number.isFinite(variant.price) || variant.price <= 0) {
        return NextResponse.json({ message: 'Invalid product variant' }, { status: 422 });
      }

      const rawQty = parseInt(String(item.quantity ?? 1), 10);
      if (!Number.isFinite(rawQty) || rawQty < 1 || rawQty > 50) {
        return NextResponse.json({ message: 'Quantity per item must be between 1 and 50' }, { status: 422 });
      }

      const price = variant.price;
      const itemSubtotal = price * rawQty;
      recalculatedSubtotal += itemSubtotal;

      validatedItems.push({
        product_id: perfume.id,
        product_slug: perfume.slug,
        variant_id: variant.id,
        name_en: perfume.name_en,
        name_ar: perfume.name_ar,
        size_ml: variant.size_ml,
        price,
        quantity: rawQty,
        subtotal: itemSubtotal,
        image: perfume.images?.bottle || perfume.images?.hero || '/images/products/la-fleur-du-nil-bottle.jpg',
      });
    }

    // Shipping fee lookup
    const govData =
      EGYPT_GOVERNORATES.find(
        (g) =>
          g.value === governorate ||
          g.name_en.toLowerCase() === governorate.toLowerCase() ||
          g.name_ar === governorate
      ) || EGYPT_GOVERNORATES[0];
    const shippingFee = govData ? govData.fee : 65;

    // Gift box fee
    const giftFee = gift_box ? 150 : 0;

    // Dynamic coupon calculation from server database
    let discount = 0;
    if (coupon_code) {
      const codeUpper = coupon_code.toUpperCase();
      const serverCoupons = getServerCoupons();
      const matchingCoupon = serverCoupons.find((c) => c.code.toUpperCase() === codeUpper && c.is_active);

      if (
        matchingCoupon &&
        recalculatedSubtotal >= (matchingCoupon.min_order || 0) &&
        (!matchingCoupon.max_uses || matchingCoupon.used_count < matchingCoupon.max_uses)
      ) {
        if (matchingCoupon.type === 'percent') {
          discount = (recalculatedSubtotal * Math.min(95, matchingCoupon.value)) / 100;
        } else {
          discount = Math.min(matchingCoupon.value, recalculatedSubtotal);
        }
        try {
          incrementServerCouponUsage(matchingCoupon.code);
        } catch {}
      }
    }

    const total = Math.max(1, recalculatedSubtotal + shippingFee + giftFee - discount);

    // Always generate or sanitize Order Number safely on server
    const clientOrderNum = typeof body?.order_number === 'string' ? body.order_number.trim().toUpperCase() : '';
    const orderNumber = /^LV-[A-Z0-9]{6,10}$/.test(clientOrderNum)
      ? clientOrderNum
      : `LV-${Math.floor(100000 + Math.random() * 900000)}`;

    const computedMapUrl =
      safeMapUrl ||
      (safeCoords
        ? `https://www.google.com/maps?q=${safeCoords.lat},${safeCoords.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', ' + (govData ? govData.name_en : 'Cairo') + ', Egypt')}`);

    const orderRecord: any = {
      order_number: orderNumber,
      customer: {
        name,
        phone,
        email: email || null,
        governorate: govData ? govData.name_en : 'Cairo',
        governorate_ar: govData ? govData.name_ar : 'القاهرة',
        city: city || (govData ? govData.name_en : 'Cairo'),
        address,
        notes: notes || null,
      },
      gift: {
        enabled: gift_box,
        note: gift_note,
        fee: giftFee,
      },
      items: validatedItems,
      pricing: {
        subtotal: recalculatedSubtotal,
        shipping: shippingFee,
        discount,
        gift_fee: giftFee,
        total,
      },
      payment: {
        method: payment_method,
        status: payment_method === 'cod' ? 'pending' : 'pending_gateway',
      },
      status: 'confirmed',
      created_at: new Date().toISOString(),
      eta_days: govData ? govData.eta_days : '1–2 days',
    };

    const maisonOrder: MaisonOrder = {
      id: orderNumber,
      customer: name,
      phone,
      gov: `${govData ? govData.name_ar : 'القاهرة'} — ${city || address}`,
      items: validatedItems.map((i) => `${i.name_ar || i.name_en} (${i.size_ml}ml) × ${i.quantity}`).join(', '),
      items_detail: validatedItems.map((i) => ({
        product_id: i.product_id,
        product_slug: i.product_slug,
        name_en: i.name_en,
        name_ar: i.name_ar,
        size_ml: i.size_ml,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      map_url: computedMapUrl,
      map_coords: safeCoords,
      total,
      payment: payment_method === 'cod' ? 'COD' : payment_method,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0],
      is_new: true,
    };

    // 1. Save order persistently to disk
    saveServerOrder(maisonOrder);

    // 2. Register/update patron profile cleanly
    saveServerPatron({
      id: `patron_${Date.now()}`,
      name,
      phone,
      email: email || undefined,
      governorate: govData ? govData.name_en : 'Cairo',
      city: city || '',
      address,
      registeredAt: new Date().getFullYear().toString(),
    });

    // 3. Issue signed HttpOnly receipt cookie so buyer can inspect unmasked tracking
    const existingReceiptCookie = parseCookieHeader(request, ORDER_RECEIPT_COOKIE_NAME);
    const updatedReceiptToken = createOrderReceiptToken(existingReceiptCookie, orderNumber);

    const response = NextResponse.json({
      success: true,
      message: 'Order created and persisted successfully',
      data: orderRecord,
    });
    response.cookies.set(
      ORDER_RECEIPT_COOKIE_NAME,
      updatedReceiptToken,
      buildSecureCookieOptions(30 * 24 * 60 * 60, 'lax')
    );
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating order', error: error?.message || String(error) },
      { status: 500 }
    );
  }
}

// ADMIN ONLY: List all orders (contains PII: phones, addresses, GPS coordinates)
export async function GET(request: Request) {
  const denied = requireAdmin(request, 'List All Orders');
  if (denied) return denied;

  try {
    const orders = getServerOrders();
    return NextResponse.json({
      data: orders,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error retrieving orders', error: String(err) }, { status: 500 });
  }
}

// ADMIN ONLY: Update order fulfillment status
export async function PATCH(request: Request) {
  const denied = requireAdmin(request, 'Update Order Status');
  if (denied) return denied;

  try {
    const { orderId, status } = await request.json();
    if (!orderId || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ message: 'Valid orderId and status are required' }, { status: 422 });
    }

    const updated = updateServerOrderStatus(String(orderId), status);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error updating order', error: String(err) }, { status: 500 });
  }
}

// ADMIN ONLY: Delete an order
export async function DELETE(request: Request) {
  const denied = requireAdmin(request, 'Delete Order');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Order id is required' }, { status: 422 });
    }

    const updated = deleteServerOrder(id);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting order', error: String(err) }, { status: 500 });
  }
}
