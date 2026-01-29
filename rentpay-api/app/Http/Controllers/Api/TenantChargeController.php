<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChargeResource;
use App\Models\Charge;
use Illuminate\Http\JsonResponse;

class TenantChargeController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if ($user?->role !== 'tenant') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $charges = Charge::query()
            ->whereHas('lease', fn ($q) => $q->where('tenant_user_id', $user->id))
            ->where('status', 'due')
            ->orderBy('due_date')
            ->get();

        return ChargeResource::collection($charges)->response();
    }
}
