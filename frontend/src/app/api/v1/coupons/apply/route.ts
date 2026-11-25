import { NextResponse } from 'next/server';
import { getServerCoupons } from '@/lib/serverDb';
import { checkRateLimit, getClientIp, isIpBlocked, logSecurityEvent } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isIpBlocked(ip)) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  // Stop automated coupon code brute-forcing / guessing (max 15 checks per 5 min)
  const rl = checkRateLimit(`coupon_apply_${ip}`, 15, 5 * 60 * 1000);
  if (!rl.allowed) {
    logSecurityEvent({
      severity: 'warning',
      event: 'RATE_LIMIT_COUPON_GUESSING',
      ip,
      path: 'POST /api/v1/coupons/apply',
      details: `Excessive promo code attempts blocked (${rl.retryAfterSeconds}s cooldown)`,
    });
    return NextResponse.json(
      { message: `Too many coupon attempts. Please wait ${rl.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const rawCode = typeof body?.code === 'string' ? body.code.trim() : '';
    const subtotal = Math.max(0, Number(body?.subtotal) || 0);

    if (!rawCode || rawCode.length > 32) {
      return NextResponse.json({ message: 'Valid coupon code is required' }, { status: 400 });
    }

    const coupons = getServerCoupons();
    const cleanCode = rawCode.toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!found || !found.is_active) {
      return NextResponse.json({ message: 'Invalid or expired coupon code' }, { status: 404 });
    }

    if (found.max_uses && found.used_count >= found.max_uses) {
      return NextResponse.json({ message: 'This coupon code has reached its usage limit' }, { status: 422 });
    }

    if (subtotal < (found.min_order || 0)) {
      return NextResponse.json(
        { message: `Coupon requires minimum order of ${found.min_order} EGP` },
        { status: 422 }
      );
    }

    return NextResponse.json({
      data: {
        id: found.id,
        code: found.code,
        type: found.type,
        value: found.value,
        min_order: found.min_order,
      },
      message: 'Coupon applied successfully',
    });
  } catch {
    return NextResponse.json({ message: 'Failed to process coupon' }, { status: 500 });
  }
}
