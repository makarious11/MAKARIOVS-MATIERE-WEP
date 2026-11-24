import { NextResponse } from 'next/server';
import { getServerCoupons, saveServerCoupon, deleteServerCoupon } from '@/lib/serverDb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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
  try {
    const body = await request.json();
    if (!body || !body.code) {
      return NextResponse.json({ message: 'Coupon code is required' }, { status: 422 });
    }

    const updatedCoupons = saveServerCoupon(body);
    return NextResponse.json({
      success: true,
      data: body,
      coupons: updatedCoupons,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving coupon', error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Coupon id is required' }, { status: 422 });
    }

    const updatedCoupons = deleteServerCoupon(Number(id));
    return NextResponse.json({
      success: true,
      coupons: updatedCoupons,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting coupon', error: String(err) }, { status: 500 });
  }
}
