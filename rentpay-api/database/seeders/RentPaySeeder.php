<?php

namespace Database\Seeders;

use App\Models\Charge;
use App\Models\Lease;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RentPaySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@rentpay.test',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        $tenant = User::create([
            'name' => 'Tenant User',
            'email' => 'tenant@rentpay.test',
            'role' => 'tenant',
            'password' => Hash::make('password'),
        ]);

        $property = Property::create([
            'user_id' => $admin->id,
            'name' => 'Maple Apartments',
            'address_line1' => '123 Maple St',
            'city' => 'Springfield',
            'state' => 'CA',
            'postal_code' => '90001',
        ]);

        $unit = Unit::create([
            'property_id' => $property->id,
            'name' => 'Unit 1A',
            'notes' => 'Main floor unit',
        ]);

        $lease = Lease::create([
            'unit_id' => $unit->id,
            'tenant_user_id' => $tenant->id,
            'rent_amount' => 150000,
            'due_day' => 1,
            'start_date' => Carbon::today()->startOfMonth()->toDateString(),
            'end_date' => null,
        ]);

        Charge::create([
            'lease_id' => $lease->id,
            'amount' => $lease->rent_amount,
            'due_date' => Carbon::today()->startOfMonth()->toDateString(),
            'status' => 'due',
        ]);
    }
}
