<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryProductAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $products = InventoryProduct::orderBy('name')->get();
        return response()->json(['data' => $products]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'string|max:50',
            'is_active' => 'boolean',
        ]);
        $validated['unit'] = $validated['unit'] ?? 'unit';
        $validated['is_active'] = $validated['is_active'] ?? true;
        $product = InventoryProduct::create($validated);
        return response()->json(['data' => $product], 201);
    }

    public function show(InventoryProduct $inventoryProduct): JsonResponse
    {
        return response()->json(['data' => $inventoryProduct]);
    }

    public function update(Request $request, InventoryProduct $inventoryProduct): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'unit' => 'string|max:50',
            'is_active' => 'boolean',
        ]);
        $inventoryProduct->update($validated);
        return response()->json(['data' => $inventoryProduct->fresh()]);
    }

    public function destroy(InventoryProduct $inventoryProduct): JsonResponse
    {
        $inventoryProduct->update(['is_active' => false]);
        return response()->json(['message' => 'Product deactivated.']);
    }
}
