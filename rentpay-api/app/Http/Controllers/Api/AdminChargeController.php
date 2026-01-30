<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminChargeResource;
use App\Models\Charge;
use Illuminate\Http\JsonResponse;

class AdminChargeController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if (! $user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $charges = Charge::query()
            ->whereHas('lease.unit.property', fn ($q) => $q->where('user_id', $user->id))
            ->with(['lease.unit.property', 'lease.tenant'])
            ->latest('due_date')
            ->get();

        return AdminChargeResource::collection($charges)->response();
    }
}
