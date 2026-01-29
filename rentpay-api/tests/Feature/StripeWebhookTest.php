<?php

namespace Tests\Feature;

use App\Models\Charge;
use App\Models\Lease;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_marks_charge_paid(): void
    {
        config(['services.stripe.webhook_secret' => null]);

        $admin = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'tenant']);

        $property = Property::create(['user_id' => $admin->id, 'name' => 'Test Property']);
        $unit = Unit::create(['property_id' => $property->id, 'name' => 'Unit C']);
        $lease = Lease::create([
            'unit_id' => $unit->id,
            'tenant_user_id' => $tenant->id,
            'rent_amount' => 100000,
            'due_day' => 1,
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);

        $charge = Charge::create([
            'lease_id' => $lease->id,
            'amount' => 100000,
            'due_date' => now()->startOfMonth()->toDateString(),
            'status' => 'due',
        ]);

        $payment = Payment::create([
            'charge_id' => $charge->id,
            'provider' => 'stripe',
            'status' => 'pending',
            'amount' => 100000,
        ]);

        $payload = [
            'id' => 'evt_test_123',
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'metadata' => [
                        'payment_id' => (string) $payment->id,
                    ],
                    'payment_intent' => 'pi_test_123',
                ],
            ],
        ];

        $response = $this->postJson('/api/webhooks/stripe', $payload);

        $response->assertOk();

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'succeeded',
            'provider_payment_id' => 'pi_test_123',
        ]);

        $this->assertDatabaseHas('charges', [
            'id' => $charge->id,
            'status' => 'paid',
        ]);
    }
}
