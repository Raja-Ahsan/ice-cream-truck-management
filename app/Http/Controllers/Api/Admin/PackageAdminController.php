<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $packages = Package::orderBy('sort_order')->get();
        return response()->json(['data' => $packages]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'integer|min:15|max:480',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $validated['duration_minutes'] = $validated['duration_minutes'] ?? 60;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $package = Package::create($validated);
        return response()->json(['data' => $package], 201);
    }

    public function show(Package $package): JsonResponse
    {
        return response()->json(['data' => $package]);
    }

    public function update(Request $request, Package $package): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'duration_minutes' => 'integer|min:15|max:480',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $package->update($validated);
        return response()->json(['data' => $package->fresh()]);
    }

    public function destroy(Package $package): JsonResponse
    {
        $package->update(['is_active' => false]);
        return response()->json(['message' => 'Package deactivated.']);
    }
}
