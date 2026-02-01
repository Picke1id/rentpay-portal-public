<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChargeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lease_id' => ['required', 'exists:leases,id'],
            'amount' => ['required', 'integer', 'min:1'],
            'due_date' => ['required', 'date'],
            'status' => ['nullable', 'in:due,void'],
        ];
    }
}
