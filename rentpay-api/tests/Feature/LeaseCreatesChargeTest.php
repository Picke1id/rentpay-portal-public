<?php

namespace Tests\Feature;

use App\Models\Charge;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LeaseCreatesChargeTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_creating_lease_generates_charge(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'tenant']);
        $property = Property::create(['user_id' => $admin->id, 'name' => 'Test Property']);
        $unit = Unit::create(['property_id' => $property->id, 'name' => 'Unit A']);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/leases', [
            'unit_id' => $unit->id,
            'tenant_user_id' => $tenant->id,
            'rent_amount' => 120000,
            'due_day' => 1,
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => null,
        ]);

        $response->assertStatus(201);

        $this->assertTrue(Charge::query()->where('status', 'due')->count() === 1);
    }
}
