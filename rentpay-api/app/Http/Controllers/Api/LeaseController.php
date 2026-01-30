<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeaseStoreRequest;
use App\Http\Requests\LeaseUpdateRequest;
use App\Http\Resources\LeaseResource;
use App\Models\Lease;
use App\Services\LeaseService;
use Illuminate\Http\JsonResponse;

class LeaseController extends Controller
{
    public function __construct(private LeaseService $leaseService)
    {
        $this->authorizeResource(Lease::class, 'lease');
    }

    public function index(): JsonResponse
    {
        $leases = Lease::query()
            ->whereHas('unit.property', fn ($q) => $q->where('user_id', auth()->id()))
            ->with(['unit.property', 'tenant'])
            ->latest()
            ->get();

        return LeaseResource::collection($leases)->response();
    }

    public function store(LeaseStoreRequest $request): JsonResponse
    {
        $lease = $this->leaseService->createLease($request->user(), $request->validated());

        return (new LeaseResource($lease))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Lease $lease): JsonResponse
    {
        $lease->load('unit');

        return (new LeaseResource($lease))->response();
    }

    public function update(LeaseUpdateRequest $request, Lease $lease): JsonResponse
    {
        $lease->update($request->validated());

        return (new LeaseResource($lease))->response();
    }

    public function destroy(Lease $lease): JsonResponse
    {
        $lease->delete();

        return response()->json(['message' => 'Lease deleted.']);
    }
}
