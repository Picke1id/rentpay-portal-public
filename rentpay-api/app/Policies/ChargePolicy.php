<?php

namespace App\Policies;

use App\Models\Charge;
use App\Models\User;

class ChargePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'tenant'], true);
    }

    public function view(User $user, Charge $charge): bool
    {
        if ($user->role === 'admin') {
            return $charge->lease?->unit?->property?->user_id === $user->id;
        }

        return $user->role === 'tenant' && $charge->lease?->tenant_user_id === $user->id;
    }
}
