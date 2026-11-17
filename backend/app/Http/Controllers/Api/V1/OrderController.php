<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingZone;
use App\Models\Coupon;
use App\Services\PaymobService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request, PaymobService $paymob): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3',
            'phone' => ['required', 'string', 'regex:/^(\+20|0020|0)?1[0125][0-9]{8}$/'],
            'email' => 'nullable|email',
            'governorate' => 'required|string',
            'city' => 'nullable|string',
            'address' => 'required|string|min:5',
            'notes' => 'nullable|string',
            'gift_box' => 'boolean',
            'gift_note' => 'nullable|string|max:200',
            'payment_method' => 'required|in:cod,card',
            'coupon_code' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $paymob, $request) {
            $subtotal = 0;
            $orderItemsData = [];

            // 1. Recalculate prices & check stock
            foreach ($validated['items'] as $item) {
                $variant = ProductVariant::with('product')->lockForUpdate()->findOrFail($item['variant_id']);

                if ($variant->stock < $item['quantity']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$variant->product->name_en} ({$variant->size_ml}ml)",
                    ], 422);
                }

                $itemSubtotal = $variant->price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'product_id' => $variant->product_id,
                    'variant_id' => $variant->id,
                    'name_snapshot' => $variant->product->name_en,
                    'size_snapshot' => "{$variant->size_ml} ml",
                    'price_snapshot' => $variant->price,
                    'qty' => $item['quantity'],
                ];

                // Decrement stock
                $variant->decrement('stock', $item['quantity']);
            }

            // 2. Shipping calculation
            $shippingZone = ShippingZone::where('governorate', $validated['governorate'])->first();
            $shippingFee = $shippingZone ? (float) $shippingZone->fee : 60.00;

            // 3. Coupon calculation
            $discount = 0;
            if (!empty($validated['coupon_code'])) {
                $coupon = Coupon::where('code', strtoupper($validated['coupon_code']))->first();
                if ($coupon && $coupon->isValid($subtotal)) {
                    $discount = $coupon->calculateDiscount($subtotal);
                    $coupon->increment('used_count');
                }
            }

            // Gift box fee (+150 EGP)
            $giftFee = !empty($validated['gift_box']) ? 150.00 : 0.00;
            $total = ($subtotal + $shippingFee + $giftFee) - $discount;

            // Generate Order number prefixed with LV-XXXXXX
            $orderNumber = 'LV-' . strtoupper(Str::random(6));

            $order = Order::create([
                'number' => $orderNumber,
                'user_id' => $request->user()?->id,
                'guest_email' => $validated['email'] ?? null,
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'governorate' => $validated['governorate'],
                'city' => $validated['city'] ?? $validated['governorate'],
                'address' => $validated['address'],
                'notes' => $validated['notes'] ?? null,
                'gift_box' => !empty($validated['gift_box']),
                'gift_note' => $validated['gift_note'] ?? null,
                'subtotal' => $subtotal,
                'shipping' => $shippingFee,
                'discount' => $discount,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
                'status' => 'confirmed',
            ]);

            foreach ($orderItemsData as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            $paymentUrl = null;
            if ($validated['payment_method'] === 'card') {
                $paymentUrl = $paymob->initiatePayment($order);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => [
                    'order_number' => $order->number,
                    'total' => $order->total,
                    'payment_method' => $order->payment_method,
                    'payment_url' => $paymentUrl,
                ],
            ], 201);
        });
    }

    public function validateCart(Request $request): JsonResponse
    {
        $items = $request->input('items', []);
        $subtotal = 0;
        $validated = [];

        foreach ($items as $item) {
            $variant = ProductVariant::with('product')->find($item['variant_id'] ?? null);
            if ($variant) {
                $qty = max(1, (int) ($item['quantity'] ?? 1));
                $available = min($qty, $variant->stock);
                $subtotal += $variant->price * $available;
                $validated[] = [
                    'variant_id' => $variant->id,
                    'product_id' => $variant->product_id,
                    'price' => $variant->price,
                    'quantity' => $available,
                    'in_stock' => $variant->stock >= $qty,
                ];
            }
        }

        return response()->json([
            'valid' => true,
            'subtotal' => $subtotal,
            'items' => $validated,
        ]);
    }

    public function show(string $number): JsonResponse
    {
        $order = Order::with('items')
            ->where('number', $number)
            ->firstOrFail();

        return response()->json([
            'data' => $order,
        ]);
    }
}

