<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'tenant'], true);
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->role === 'admin') {
            return $payment->charge?->lease?->unit?->property?->user_id === $user->id;
        }

        return $user->role === 'tenant'
            && $payment->charge?->lease?->tenant_user_id === $user->id;
    }
}
