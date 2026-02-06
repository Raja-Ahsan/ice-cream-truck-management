<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InventoryProductAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InventoryProduct::query();
        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)->orWhere('unit', 'like', $term);
            });
        }
        if ($request->filled('status')) {
            if ($request->input('status') === 'active') {
                $query->where('is_active', true);
            } elseif ($request->input('status') === 'inactive') {
                $query->where('is_active', false);
            }
        }
        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(5, min(50, $perPage));
        $products = $query->orderBy('name')->paginate($perPage);
        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'nullable|string|max:50',
            'quantity_in_stock' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);
        $validated['unit'] = $validated['unit'] ?? 'unit';
        $validated['quantity_in_stock'] = (int) ($validated['quantity_in_stock'] ?? 0);
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
            'unit' => 'nullable|string|max:50',
            'quantity_in_stock' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);
        if (array_key_exists('quantity_in_stock', $validated)) {
            $validated['quantity_in_stock'] = (int) $validated['quantity_in_stock'];
        }
        $inventoryProduct->update($validated);
        return response()->json(['data' => $inventoryProduct->fresh()]);
    }

    public function destroy(InventoryProduct $inventoryProduct): JsonResponse
    {
        $inventoryProduct->update(['is_active' => false]);
        return response()->json(['message' => 'Product deactivated.']);
    }

    public function uploadImage(Request $request, InventoryProduct $inventoryProduct): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:2048'],
        ]);
        if ($inventoryProduct->image) {
            Storage::disk('public')->delete($inventoryProduct->image);
        }
        $path = $request->file('image')->store('inventory-products', 'public');
        $inventoryProduct->update(['image' => $path]);
        return response()->json(['message' => 'Product image updated.', 'data' => $inventoryProduct->fresh()]);
    }

    public function removeImage(InventoryProduct $inventoryProduct): JsonResponse
    {
        if ($inventoryProduct->image) {
            Storage::disk('public')->delete($inventoryProduct->image);
            $inventoryProduct->update(['image' => null]);
        }
        return response()->json(['message' => 'Product image removed.', 'data' => $inventoryProduct->fresh()]);
    }
}
