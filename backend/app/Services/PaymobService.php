<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymobService
{
    protected string $apiKey;
    protected string $integrationId;
    protected string $iframeId;
    protected string $hmacSecret;
    protected string $baseUrl = 'https://accept.paymob.com/api';

    public function __construct()
    {
        $this->apiKey = config('services.paymob.api_key', env('PAYMOB_API_KEY', ''));
        $this->integrationId = config('services.paymob.integration_id', env('PAYMOB_INTEGRATION_ID', ''));
        $this->iframeId = config('services.paymob.iframe_id', env('PAYMOB_IFRAME_ID', ''));
        $this->hmacSecret = config('services.paymob.hmac_secret', env('PAYMOB_HMAC_SECRET', ''));
    }

    /**
     * Authenticate and get Auth Token from Paymob.
     */
    public function getAuthToken(): ?string
    {
        try {
            $response = Http::post("{$this->baseUrl}/auth/tokens", [
                'api_key' => $this->apiKey,
            ]);

            if ($response->successful()) {
                return $response->json('token');
            }
        } catch (\Exception $e) {
            Log::error('Paymob Auth Token Exception: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Create an order registration in Paymob.
     */
    public function createOrder(string $authToken, Order $order): ?int
    {
        try {
            $response = Http::post("{$this->baseUrl}/ecommerce/orders", [
                'auth_token' => $authToken,
                'delivery_needed' => 'false',
                'amount_cents' => (int) round($order->total * 100),
                'currency' => 'EGP',
                'merchant_order_id' => $order->number,
                'items' => [],
            ]);

            if ($response->successful()) {
                return $response->json('id');
            }
        } catch (\Exception $e) {
            Log::error('Paymob Order Creation Exception: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Obtain payment key token.
     */
    public function getPaymentKey(string $authToken, int $paymobOrderId, Order $order): ?string
    {
        try {
            $response = Http::post("{$this->baseUrl}/acceptance/payment_keys", [
                'auth_token' => $authToken,
                'amount_cents' => (int) round($order->total * 100),
                'expiration' => 3600,
                'order_id' => $paymobOrderId,
                'billing_data' => [
                    'apartment' => 'NA',
                    'email' => $order->guest_email ?: 'patron@makariovs.com',
                    'floor' => 'NA',
                    'first_name' => $order->name,
                    'street' => $order->address,
                    'building' => 'NA',
                    'phone_number' => $order->phone,
                    'shipping_method' => 'PKG',
                    'postal_code' => 'NA',
                    'city' => $order->city ?: 'Cairo',
                    'country' => 'EGY',
                    'last_name' => 'Patron',
                    'state' => $order->governorate,
                ],
                'currency' => 'EGP',
                'integration_id' => $this->integrationId,
            ]);

            if ($response->successful()) {
                return $response->json('token');
            }
        } catch (\Exception $e) {
            Log::error('Paymob Payment Key Exception: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Full initialization flow generating the iframe URL.
     */
    public function initiatePayment(Order $order): ?string
    {
        $token = $this->getAuthToken();
        if (!$token) return null;

        $paymobOrderId = $this->createOrder($token, $order);
        if (!$paymobOrderId) return null;

        $order->update(['paymob_order_id' => $paymobOrderId]);

        $paymentKey = $this->getPaymentKey($token, $paymobOrderId, $order);
        if (!$paymentKey) return null;

        return "https://accept.paymob.com/api/acceptance/iframes/{$this->iframeId}?payment_token={$paymentKey}";
    }

    /**
     * Verify Paymob Webhook HMAC signature.
     */
    public function verifyHmac(array $data, string $receivedHmac): bool
    {
        $keys = [
            'amount_cents',
            'created_at',
            'currency',
            'error_occured',
            'has_parent_transaction',
            'id',
            'integration_id',
            'is_3d_secure',
            'is_auth',
            'is_capture',
            'is_refunded',
            'is_standalone_payment',
            'is_voided',
            'order',
            'owner',
            'pending',
            'source_data_pan',
            'source_data_sub_type',
            'source_data_type',
            'success',
        ];

        $concatenated = '';
        foreach ($keys as $key) {
            $concatenated .= $data[$key] ?? '';
        }

        $calculatedHmac = hash_hmac('sha512', $concatenated, $this->hmacSecret);

        return hash_equals($calculatedHmac, $receivedHmac);
    }
}

