<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, Property $property): bool
    {
        return $user->role === 'admin' && $property->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Property $property): bool
    {
        return $user->role === 'admin' && $property->user_id === $user->id;
    }

    public function delete(User $user, Property $property): bool
    {
        return $user->role === 'admin' && $property->user_id === $user->id;
    }
}
