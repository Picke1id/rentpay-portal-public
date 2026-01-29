<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminTenantController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if (! $user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $tenants = User::query()
            ->where('role', 'tenant')
            ->orderBy('name')
            ->get();

        return TenantResource::collection($tenants)->response();
    }
}
