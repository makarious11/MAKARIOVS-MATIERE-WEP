import { NextResponse } from 'next/server';
import { getServerCoupons } from '@/lib/serverDb';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { code, subtotal = 0 } = await request.json();
    if (!code) {
      return NextResponse.json({ message: 'Coupon code is required' }, { status: 400 });
    }

    const coupons = getServerCoupons();
    const cleanCode = code.trim().toUpperCase();

    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return NextResponse.json({ message: 'Invalid coupon code' }, { status: 404 });
    }

    if (!found.is_active) {
      return NextResponse.json({ message: 'This coupon code has expired or is inactive' }, { status: 422 });
    }

    if (found.max_uses && found.used_count >= found.max_uses) {
      return NextResponse.json({ message: 'This coupon code has reached its maximum usage limit' }, { status: 422 });
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
