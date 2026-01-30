<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminChargeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lease_id' => $this->lease_id,
            'amount' => $this->amount,
            'due_date' => $this->due_date,
            'status' => $this->status,
            'unit' => $this->lease?->unit?->name,
            'property' => $this->lease?->unit?->property?->name,
            'tenant' => $this->lease?->tenant?->name,
        ];
    }
}
