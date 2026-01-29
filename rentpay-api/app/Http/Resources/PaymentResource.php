<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'charge_id' => $this->charge_id,
            'provider' => $this->provider,
            'provider_payment_id' => $this->provider_payment_id,
            'status' => $this->status,
            'amount' => $this->amount,
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
        ];
    }
}
