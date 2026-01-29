<?php

namespace App\Policies;

use App\Models\Unit;
use App\Models\User;

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, Unit $unit): bool
    {
        return $user->role === 'admin' && $unit->property?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Unit $unit): bool
    {
        return $user->role === 'admin' && $unit->property?->user_id === $user->id;
    }

    public function delete(User $user, Unit $unit): bool
    {
        return $user->role === 'admin' && $unit->property?->user_id === $user->id;
    }
}
