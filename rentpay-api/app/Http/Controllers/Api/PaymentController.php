<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\Charge;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $paymentService)
    {
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $charge = Charge::with('lease')->findOrFail($request->validated()['charge_id']);
        $url = $this->paymentService->createCheckoutSession($request->user(), $charge);

        return response()->json(['url' => $url]);
    }
}
