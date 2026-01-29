<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;

class TenantPaymentController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if ($user?->role !== 'tenant') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $payments = Payment::query()
            ->whereHas('charge.lease', fn ($q) => $q->where('tenant_user_id', $user->id))
            ->latest()
            ->get();

        return PaymentResource::collection($payments)->response();
    }
}
