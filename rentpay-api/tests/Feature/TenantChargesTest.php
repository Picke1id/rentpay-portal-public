<?php

namespace Tests\Feature;

use App\Models\Charge;
use App\Models\Lease;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantChargesTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_can_view_due_charges(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'tenant']);

        $property = Property::create(['user_id' => $admin->id, 'name' => 'Test Property']);
        $unit = Unit::create(['property_id' => $property->id, 'name' => 'Unit B']);
        $lease = Lease::create([
            'unit_id' => $unit->id,
            'tenant_user_id' => $tenant->id,
            'rent_amount' => 90000,
            'due_day' => 1,
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);

        Charge::create([
            'lease_id' => $lease->id,
            'amount' => 90000,
            'due_date' => now()->startOfMonth()->toDateString(),
            'status' => 'due',
        ]);

        Sanctum::actingAs($tenant);

        $response = $this->getJson('/api/tenant/charges');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }
}
