<?php

namespace App\Services;

use App\Models\Charge;
use App\Models\Payment;
use App\Models\PaymentEvent;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\DatabaseManager;
use Stripe\StripeClient;

class PaymentService
{
    public function __construct(private DatabaseManager $db)
    {
    }

    public function createCheckoutSession(User $user, Charge $charge): string
    {
        if ($user->role !== 'tenant' || $charge->lease?->tenant_user_id !== $user->id) {
            throw new AuthorizationException('Not allowed to pay this charge.');
        }

        if ($charge->status !== 'due') {
            throw new AuthorizationException('Charge is not payable.');
        }

        $stripe = new StripeClient(config('services.stripe.secret'));

        return $this->db->transaction(function () use ($stripe, $charge): string {
            $payment = Payment::create([
                'charge_id' => $charge->id,
                'provider' => 'stripe',
                'provider_payment_id' => null,
                'status' => 'pending',
                'amount' => $charge->amount,
            ]);

            $session = $stripe->checkout->sessions->create([
                'mode' => 'payment',
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'quantity' => 1,
                    'price_data' => [
                        'currency' => 'usd',
                        'unit_amount' => $charge->amount,
                        'product_data' => [
                            'name' => 'Rent Payment',
                        ],
                    ],
                ]],
                'success_url' => config('services.stripe.checkout_success_url'),
                'cancel_url' => config('services.stripe.checkout_cancel_url'),
                'client_reference_id' => (string) $payment->id,
                'metadata' => [
                    'payment_id' => (string) $payment->id,
                    'charge_id' => (string) $charge->id,
                ],
            ]);

            $payment->update([
                'provider_payment_id' => $session->id,
            ]);

            return $session->url;
        });
    }

    public function handleStripeWebhook(object $event): void
    {
        $this->db->transaction(function () use ($event): void {
            PaymentEvent::firstOrCreate(
                ['event_id' => $event->id],
                [
                    'provider' => 'stripe',
                    'event_type' => $event->type,
                    'payload' => json_decode(json_encode($event), true),
                ]
            );

            if ($event->type === 'checkout.session.completed') {
                $session = $event->data->object;
                $paymentId = $session->metadata->payment_id ?? null;
                $paymentIntent = $session->payment_intent ?? null;

                $payment = $paymentId
                    ? Payment::find($paymentId)
                    : Payment::query()->where('provider_payment_id', $session->id ?? null)->first();

                if (! $payment) {
                    return;
                }

                $payment->update([
                    'provider_payment_id' => $paymentIntent ?: $payment->provider_payment_id,
                    'status' => 'succeeded',
                    'paid_at' => Carbon::now(),
                ]);

                $payment->charge?->update([
                    'status' => 'paid',
                ]);
            }

            if ($event->type === 'payment_intent.succeeded') {
                $intent = $event->data->object;
                $payment = Payment::query()->where('provider_payment_id', $intent->id ?? null)->first();

                if (! $payment) {
                    return;
                }

                $payment->update([
                    'status' => 'succeeded',
                    'paid_at' => Carbon::now(),
                ]);

                $payment->charge?->update([
                    'status' => 'paid',
                ]);
            }
        });
    }
}
