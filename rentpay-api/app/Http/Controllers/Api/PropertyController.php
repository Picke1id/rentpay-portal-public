<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PropertyStoreRequest;
use App\Http\Requests\PropertyUpdateRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\JsonResponse;

class PropertyController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Property::class, 'property');
    }

    public function index(): JsonResponse
    {
        $properties = Property::query()
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return PropertyResource::collection($properties)->response();
    }

    public function store(PropertyStoreRequest $request): JsonResponse
    {
        $property = Property::create([
            ...$request->validated(),
            'user_id' => auth()->id(),
        ]);

        return (new PropertyResource($property))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Property $property): JsonResponse
    {
        $property->load('units');

        return (new PropertyResource($property))->response();
    }

    public function update(PropertyUpdateRequest $request, Property $property): JsonResponse
    {
        $property->update($request->validated());

        return (new PropertyResource($property))->response();
    }

    public function destroy(Property $property): JsonResponse
    {
        $property->delete();

        return response()->json(['message' => 'Property deleted.']);
    }
}
