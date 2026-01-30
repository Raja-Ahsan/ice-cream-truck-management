<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Truck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TruckAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $trucks = Truck::where('is_active', true)->orderBy('name')->get();
        return response()->json(['data' => $trucks]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'plate_number' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);
        $validated['is_active'] = $validated['is_active'] ?? true;
        $truck = Truck::create($validated);
        return response()->json(['data' => $truck], 201);
    }

    public function show(Truck $truck): JsonResponse
    {
        return response()->json(['data' => $truck]);
    }

    public function update(Request $request, Truck $truck): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'plate_number' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);
        $truck->update($validated);
        return response()->json(['data' => $truck->fresh()]);
    }

    public function destroy(Truck $truck): JsonResponse
    {
        $truck->update(['is_active' => false]);
        return response()->json(['message' => 'Truck deactivated.']);
    }
}
