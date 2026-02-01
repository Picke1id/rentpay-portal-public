<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_cannot_access_admin_endpoints(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        Sanctum::actingAs($tenant);

        $this->getJson('/api/admin/charges')->assertStatus(403);
        $this->getJson('/api/admin/tenants')->assertStatus(403);
    }
}
