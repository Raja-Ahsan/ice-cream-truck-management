<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AddOn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddOnAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $addOns = AddOn::orderBy('name')->get();
        return response()->json(['data' => $addOns]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'numeric|min:0',
            'is_active' => 'boolean',
        ]);
        $validated['price'] = $validated['price'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $addOn = AddOn::create($validated);
        return response()->json(['data' => $addOn], 201);
    }

    public function show(AddOn $addOn): JsonResponse
    {
        return response()->json(['data' => $addOn]);
    }

    public function update(Request $request, AddOn $addOn): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'numeric|min:0',
            'is_active' => 'boolean',
        ]);
        $addOn->update($validated);
        return response()->json(['data' => $addOn->fresh()]);
    }

    public function destroy(AddOn $addOn): JsonResponse
    {
        $addOn->update(['is_active' => false]);
        return response()->json(['message' => 'Add-on deactivated.']);
    }
}
