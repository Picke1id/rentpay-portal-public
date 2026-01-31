<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChargeStoreRequest;
use App\Http\Resources\AdminChargeResource;
use App\Models\Charge;
use App\Models\Lease;
use App\Services\ChargeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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

    public function store(ChargeStoreRequest $request, ChargeService $service): JsonResponse
    {
        $user = auth()->user();

        if (! $user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $lease = Lease::query()
            ->where('id', $request->validated()['lease_id'])
            ->whereHas('unit.property', fn ($q) => $q->where('user_id', $user->id))
            ->first();

        if (! $lease) {
            throw new ModelNotFoundException('Lease not found.');
        }

        $payload = $request->validated();
        $payload['status'] = $payload['status'] ?? 'due';

        $charge = $service->createCharge($payload);
        $charge->load(['lease.unit.property', 'lease.tenant']);

        return (new AdminChargeResource($charge))
            ->response()
            ->setStatusCode(201);
    }
}
