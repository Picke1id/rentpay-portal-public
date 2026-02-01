<?php

namespace Tests\Feature;

use App\Models\Charge;
use App\Models\Lease;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Auth\Access\AuthorizationException;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckoutAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_checkout_charge(): void
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

        $this->mock(PaymentService::class, function ($mock) {
            $mock->shouldReceive('createCheckoutSession')
                ->andThrow(new AuthorizationException('Not allowed to pay this charge.'));
        });

        Sanctum::actingAs($admin);

        $this->postJson('/api/payments/checkout', ['charge_id' => $charge->id])
            ->assertStatus(403);
    }
}
