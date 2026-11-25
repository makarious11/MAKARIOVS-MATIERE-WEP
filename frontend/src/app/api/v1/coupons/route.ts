import { NextResponse } from 'next/server';
import { getServerCoupons, saveServerCoupon, deleteServerCoupon } from '@/lib/serverDb';
import { requireAdmin, sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const denied = requireAdmin(request, 'List All Coupons');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active_only') === 'true';

    let list = getServerCoupons();
    if (activeOnly) {
      list = list.filter((c) => c.is_active);
    }

    return NextResponse.json({
      data: list,
      meta: { total: list.length },
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error retrieving coupons', error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request, 'Save Coupon');
  if (denied) return denied;

  try {
    const body = await request.json();
    const rawCode = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';

    if (!rawCode || !/^[A-Z0-9_-]{2,32}$/.test(rawCode)) {
      return NextResponse.json(
        { message: 'Coupon code must be 2–32 alphanumeric characters (A-Z, 0-9, _, -)' },
        { status: 422 }
      );
    }

    const couponType = body.type === 'fixed' ? 'fixed' : 'percent';
    const rawVal = Number(body.value);
    if (!Number.isFinite(rawVal) || rawVal <= 0 || (couponType === 'percent' && rawVal > 95)) {
      return NextResponse.json(
        { message: 'Coupon value must be positive (and <= 95% for percentage coupons)' },
        { status: 422 }
      );
    }

    const sanitizedPayload = {
      id: body.id ? Number(body.id) : undefined,
      code: rawCode,
      type: couponType as 'percent' | 'fixed',
      value: rawVal,
      min_order: Math.max(0, Number(body.min_order) || 0),
      max_uses: body.max_uses ? Math.max(1, Number(body.max_uses)) : null,
      is_active: body.is_active !== false,
      description: sanitizeText(body.description, 200),
    };

    const updatedCoupons = saveServerCoupon(sanitizedPayload);
    return NextResponse.json({
      success: true,
      data: sanitizedPayload,
      coupons: updatedCoupons,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving coupon', error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin(request, 'Delete Coupon');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ message: 'Valid coupon id is required' }, { status: 422 });
    }

    const updatedCoupons = deleteServerCoupon(id);
    return NextResponse.json({
      success: true,
      coupons: updatedCoupons,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting coupon', error: String(err) }, { status: 500 });
  }
}
