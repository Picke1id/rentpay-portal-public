<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(private PaymentService $paymentService)
    {
    }

    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        if (app()->environment('testing') && empty($secret)) {
            $event = json_decode($payload);
        } else {
            try {
                $event = Webhook::constructEvent($payload, $signature, $secret);
            } catch (\Throwable $e) {
                return response('invalid', 400);
            }
        }

        $this->paymentService->handleStripeWebhook($event);

        return response('ok', 200);
    }
}
