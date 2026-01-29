<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeaseController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\TenantChargeController;
use App\Http\Controllers\Api\TenantPaymentController;
use App\Http\Controllers\Api\UnitController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::apiResource('properties', PropertyController::class);
    Route::apiResource('units', UnitController::class);
    Route::apiResource('leases', LeaseController::class);

    Route::get('/tenant/charges', [TenantChargeController::class, 'index']);
    Route::get('/tenant/payments', [TenantPaymentController::class, 'index']);

    Route::post('/payments/checkout', [PaymentController::class, 'checkout']);
});
