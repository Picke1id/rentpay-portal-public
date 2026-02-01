<?php

namespace Tests\Feature;

use App\Models\Charge;
use App\Models\Lease;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DuplicateCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_duplicate_checkout_is_blocked_when_pending_exists(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'tenant']);
        $property = Property::create(['user_id' => $admin->id, 'name' => 'Test Property']);
        $unit = Unit::create(['property_id' => $property->id, 'name' => 'Unit A']);
        $lease = Lease::create([
            'unit_id' => $unit->id,
            'tenant_user_id' => $tenant->id,
            'rent_amount' => 120000,
            'due_day' => 1,
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);
        $charge = Charge::create([
            'lease_id' => $lease->id,
            'amount' => 120000,
            'due_date' => now()->toDateString(),
            'status' => 'due',
        ]);

        Payment::create([
            'charge_id' => $charge->id,
            'provider' => 'stripe',
            'provider_payment_id' => 'cs_test_pending',
            'status' => 'pending',
            'amount' => $charge->amount,
        ]);

        $this->mock(PaymentService::class, function ($mock) {
            $mock->shouldReceive('createCheckoutSession')->never();
        });

        Sanctum::actingAs($tenant);

        $this->postJson('/api/payments/checkout', ['charge_id' => $charge->id])
            ->assertStatus(409);
    }
}
