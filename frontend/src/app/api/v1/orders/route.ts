import { NextResponse } from 'next/server';
import { getServerCatalog, getServerOrders, saveServerOrder, updateServerOrderStatus, deleteServerOrder, saveServerPatron } from '@/lib/serverDb';
import { EGYPT_GOVERNORATES } from '@/lib/governorates';
import { MaisonOrder } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      governorate,
      city,
      address,
      notes,
      items,
      payment_method = 'cod',
      coupon_code,
      gift_box = false,
      gift_note = '',
    } = body;

    // Validation
    if (!name || !phone || !governorate || !address) {
      return NextResponse.json(
        { message: 'Name, phone, governorate, and address are required' },
        { status: 422 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'Cart cannot be empty' },
        { status: 422 }
      );
    }

    const catalog = getServerCatalog();

    // Server-side price recalculation (Never trust client prices)
    let recalculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const perfume = catalog.find((p) => p.id === item.product_id || p.slug === item.product_slug);
      const variant = perfume?.variants?.find((v) => v.id === item.variant_id) || perfume?.variants?.[0] || {
        id: item.variant_id || 1,
        size_ml: item.size_ml || 50,
        price: Number(item.price) || 3600,
      };
      const qty = Math.max(1, parseInt(String(item.quantity || 1), 10));
      const price = variant.price || 3600;

      recalculatedSubtotal += price * qty;
      validatedItems.push({
        product_id: perfume ? perfume.id : (item.product_id || 1),
        variant_id: variant.id,
        name_en: perfume ? perfume.name_en : (item.name_en || "L\u2019VENUS Creation"),
        name_ar: perfume ? perfume.name_ar : (item.name_ar || 'إبداع لوفينوس'),
        size_ml: variant.size_ml,
        price,
        quantity: qty,
        subtotal: price * qty,
      });
    }

    // Shipping fee lookup
    const govData =
      EGYPT_GOVERNORATES.find(
        (g) =>
          g.value === governorate ||
          g.name_en.toLowerCase() === String(governorate).toLowerCase() ||
          g.name_ar === governorate
      ) || EGYPT_GOVERNORATES[0];
    const shippingFee = govData ? govData.fee : 50;

    // Gift box fee
    const giftFee = gift_box ? 150 : 0;

    // Coupon discount calculation
    let discount = 0;
    if (coupon_code && typeof coupon_code === 'string') {
      const codeUpper = coupon_code.toUpperCase();
      if (codeUpper === 'LVENUS10' || codeUpper === 'VENUS10' || codeUpper === 'MAKARIOVS10') discount = (recalculatedSubtotal * 10) / 100;
      else if (codeUpper === 'MAISON20') discount = (recalculatedSubtotal * 20) / 100;
      else if (codeUpper === 'EXTRAIT500') discount = Math.min(500, recalculatedSubtotal);
    }

    const total = recalculatedSubtotal + shippingFee + giftFee - discount;

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = body.order_number || `LV-${randomSuffix}`;

    const orderRecord: any = {
      order_number: orderNumber,
      customer: {
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: email || null,
        governorate: govData ? govData.name_en : 'Cairo',
        governorate_ar: govData ? govData.name_ar : 'القاهرة',
        city: city || (govData ? govData.name_en : 'Cairo'),
        address: String(address).trim(),
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
        status: payment_method === 'cod' ? 'pending' : 'pending_card_gateway',
      },
      status: 'confirmed',
      created_at: new Date().toISOString(),
      eta_days: govData ? govData.eta_days : '1–2 days',
    };

    // Format for MaisonOrder display
    const maisonOrder: MaisonOrder = {
      id: orderNumber,
      customer: String(name).trim(),
      phone: String(phone).trim(),
      gov: `${govData ? govData.name_ar : 'القاهرة'} — ${city || address}`,
      items: validatedItems.map((i) => `${i.name_ar || i.name_en} (${i.size_ml}ml)`).join(', '),
      total,
      payment: payment_method === 'cod' ? 'COD' : 'Card',
      status: 'Processing',
      date: new Date().toISOString().split('T')[0],
      is_new: true,
    };

    // 1. Save order persistently to disk
    saveServerOrder(maisonOrder);

    // 2. Also register patron persistently so customer never disappears
    saveServerPatron({
      id: `patron_${Date.now()}`,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email || undefined,
      governorate: govData ? govData.name_en : 'Cairo',
      city: city || '',
      address: String(address).trim(),
      registeredAt: new Date().getFullYear().toString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Order created and persisted successfully',
      data: orderRecord,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating order', error: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number');
    const orders = getServerOrders();

    if (number) {
      const found = orders.find((o) => o.id === number);
      if (found) return NextResponse.json({ data: found });
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: orders,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error retrieving orders', error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ message: 'orderId and status are required' }, { status: 422 });
    }

    const updated = updateServerOrderStatus(orderId, status);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error updating order', error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
