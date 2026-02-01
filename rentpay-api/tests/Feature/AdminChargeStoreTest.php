<?php

namespace Tests\Feature;

use App\Models\Lease;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminChargeStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_create_paid_charge_manually(): void
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

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/charges', [
            'lease_id' => $lease->id,
            'amount' => 120000,
            'due_date' => now()->toDateString(),
            'status' => 'paid',
        ]);

        $response->assertStatus(422);
    }
}
