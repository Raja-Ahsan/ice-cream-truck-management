<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceArea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceAreaAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $areas = ServiceArea::orderBy('name')->get();
        return response()->json(['data' => $areas]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'zip_code' => 'nullable|string|max:20',
            'center_lat' => 'nullable|numeric',
            'center_lng' => 'nullable|numeric',
            'radius_km' => 'integer|min:1|max:500',
            'is_active' => 'boolean',
        ]);
        $validated['radius_km'] = $validated['radius_km'] ?? 25;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $area = ServiceArea::create($validated);
        return response()->json(['data' => $area], 201);
    }

    public function show(ServiceArea $serviceArea): JsonResponse
    {
        return response()->json(['data' => $serviceArea]);
    }

    public function update(Request $request, ServiceArea $serviceArea): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'zip_code' => 'nullable|string|max:20',
            'center_lat' => 'nullable|numeric',
            'center_lng' => 'nullable|numeric',
            'radius_km' => 'integer|min:1|max:500',
            'is_active' => 'boolean',
        ]);
        $serviceArea->update($validated);
        return response()->json(['data' => $serviceArea->fresh()]);
    }

    public function destroy(ServiceArea $serviceArea): JsonResponse
    {
        $serviceArea->delete();
        return response()->json(['message' => 'Service area deleted.']);
    }
}
