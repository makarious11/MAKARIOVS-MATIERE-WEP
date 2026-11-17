import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const store = (globalThis as unknown as { __LV_ORDERS__?: Map<string, any> }).__LV_ORDERS__;

  if (store && store.has(number)) {
    return NextResponse.json({ data: store.get(number) });
  }

  // Graceful fallback for mock order numbers like LV-748291
  return NextResponse.json({
    data: {
      order_number: number,
      customer: {
        name: 'Royal Patron',
        governorate: 'Cairo',
        governorate_ar: 'القاهرة',
        city: 'Zamalek',
        address: '26 July Street, Zamalek, Cairo',
      },
      items: [
        {
          name_en: 'La Fleur du Nil',
          name_ar: 'زهرة النيل',
          size_ml: 100,
          quantity: 1,
          price: 5800,
          subtotal: 5800,
        },
      ],
      pricing: {
        subtotal: 5800,
        shipping: 65,
        discount: 0,
        total: 5865,
      },
      payment: {
        method: 'cod',
        status: 'confirmed',
      },
      status: 'confirmed',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      eta_days: '1–2 days',
    },
  });
}
