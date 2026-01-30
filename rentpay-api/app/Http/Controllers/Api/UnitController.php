<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UnitStoreRequest;
use App\Http\Requests\UnitUpdateRequest;
use App\Http\Resources\UnitResource;
use App\Models\Property;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UnitController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Unit::class, 'unit');
    }

    public function index(): JsonResponse
    {
        $units = Unit::query()
            ->whereHas('property', fn ($q) => $q->where('user_id', auth()->id()))
            ->with('property')
            ->latest()
            ->get();

        return UnitResource::collection($units)->response();
    }

    public function store(UnitStoreRequest $request): JsonResponse
    {
        $property = Property::find($request->validated()['property_id']);
        if (! $property || $property->user_id !== auth()->id()) {
            throw new ModelNotFoundException('Property not found.');
        }

        $unit = Unit::create($request->validated());

        return (new UnitResource($unit))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Unit $unit): JsonResponse
    {
        $unit->load('property');

        return (new UnitResource($unit))->response();
    }

    public function update(UnitUpdateRequest $request, Unit $unit): JsonResponse
    {
        $unit->update($request->validated());

        return (new UnitResource($unit))->response();
    }

    public function destroy(Unit $unit): JsonResponse
    {
        $unit->delete();

        return response()->json(['message' => 'Unit deleted.']);
    }
}
