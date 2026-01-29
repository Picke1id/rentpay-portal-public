<?php

namespace App\Policies;

use App\Models\Lease;
use App\Models\User;

class LeasePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, Lease $lease): bool
    {
        if ($user->role === 'admin') {
            return $lease->unit?->property?->user_id === $user->id;
        }

        return $user->role === 'tenant' && $lease->tenant_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Lease $lease): bool
    {
        return $user->role === 'admin' && $lease->unit?->property?->user_id === $user->id;
    }

    public function delete(User $user, Lease $lease): bool
    {
        return $user->role === 'admin' && $lease->unit?->property?->user_id === $user->id;
    }
}
