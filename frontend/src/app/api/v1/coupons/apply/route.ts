import { NextResponse } from 'next/server';

const VALID_COUPONS = [
  { id: 1, code: 'MAKARIOVS10', type: 'percent', value: 10, min_order: 1000 },
  { id: 2, code: 'MAISON20', type: 'percent', value: 20, min_order: 3000 },
  { id: 3, code: 'EXTRAIT500', type: 'fixed', value: 500, min_order: 4000 },
];

export async function POST(request: Request) {
  try {
    const { code, subtotal = 0 } = await request.json();
    if (!code) {
      return NextResponse.json({ message: 'Coupon code is required' }, { status: 400 });
    }

    const found = VALID_COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      return NextResponse.json({ message: 'Invalid or expired coupon code' }, { status: 404 });
    }

    if (subtotal < found.min_order) {
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

