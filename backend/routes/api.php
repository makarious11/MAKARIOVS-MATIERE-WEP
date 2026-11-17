<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\ShippingZoneController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\NewsletterController;
use App\Http\Controllers\Api\V1\ContactController;

/*
|--------------------------------------------------------------------------
| L'VENUS — Maison de Parfum & Luxe | API V1 Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // 1. Categories & Lines
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);

    // 2. Catalog & Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::get('/shipping-zones', [ShippingZoneController::class, 'index']);

    // 3. Checkout & Orders
    Route::post('/cart/validate', [OrderController::class, 'validateCart'])->middleware('throttle:30,1');
    Route::post('/coupons/apply', [CouponController::class, 'apply']);
    Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:20,1');
    Route::get('/orders/{number}', [OrderController::class, 'show']);

    // 4. Payments (Paymob Egypt Gateway)
    Route::match(['get', 'post'], '/payments/paymob/callback', [PaymentController::class, 'paymobCallback']);

    // 5. Inquiries, Reviews & Newsletter
    Route::post('/reviews', [ReviewController::class, 'store'])->middleware('throttle:10,1');
    Route::post('/newsletter', [NewsletterController::class, 'store'])->middleware('throttle:10,1');
    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:10,1');
});
