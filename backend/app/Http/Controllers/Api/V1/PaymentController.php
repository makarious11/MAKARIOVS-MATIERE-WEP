<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymobService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function paymobCallback(Request $request, PaymobService $paymob): JsonResponse
    {
        $receivedHmac = $request->query('hmac') ?: $request->header('X-Paymob-HMAC');
        $payload = $request->all();

        if ($receivedHmac && !$paymob->verifyHmac($payload, $receivedHmac)) {
            Log::warning('Paymob HMAC verification failed for payload: ' . json_encode($payload));
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $merchantOrderId = $payload['obj']['order']['merchant_order_id'] ?? null;
        $success = $payload['obj']['success'] ?? false;
        $transactionId = $payload['obj']['id'] ?? null;

        if ($merchantOrderId) {
            $order = Order::where('number', $merchantOrderId)->first();
            if ($order) {
                if ($success) {
                    $order->update([
                        'payment_status' => 'paid',
                        'status' => 'confirmed',
                        'paymob_transaction_id' => $transactionId,
                    ]);
                } else {
                    $order->update([
                        'payment_status' => 'failed',
                    ]);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }
}

