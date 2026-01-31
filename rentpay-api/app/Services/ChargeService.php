<?php

namespace App\Services;

use App\Models\Charge;

class ChargeService
{
    public function createCharge(array $payload): Charge
    {
        return Charge::create($payload);
    }
}
