<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Truck;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TruckAdminController extends Controller
{
    private function today(): string
    {
        return Carbon::today()->toDateString();
    }

    public function index(Request $request): JsonResponse
    {
        $today = $this->today();
        $query = Truck::query();

        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('truck_number', 'like', $term)
                    ->orWhere('model', 'like', $term);
            });
        }

        $status = $request->input('status');
        if ($status === 'available') {
            $query->whereDoesntHave('bookings', function ($q) use ($today) {
                $q->where('event_date', '>=', $today)
                    ->whereIn('status', [
                        Booking::STATUS_ASSIGNED,
                        Booking::STATUS_DISPATCHED,
                        Booking::STATUS_IN_PROGRESS,
                    ]);
            });
        } elseif ($status === 'booked') {
            $query->whereHas('bookings', function ($q) use ($today) {
                $q->where('event_date', '>=', $today)->where('status', Booking::STATUS_ASSIGNED);
            })->whereDoesntHave('bookings', function ($q) use ($today) {
                $q->where('event_date', '>=', $today)
                    ->whereIn('status', [Booking::STATUS_DISPATCHED, Booking::STATUS_IN_PROGRESS]);
            });
        } elseif ($status === 'on_route') {
            $query->whereHas('bookings', function ($q) use ($today) {
                $q->where('event_date', '>=', $today)
                    ->whereIn('status', [Booking::STATUS_DISPATCHED, Booking::STATUS_IN_PROGRESS]);
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(5, min(50, $perPage));
        $paginated = $query->orderBy('name')->paginate($perPage);

        $baseQuery = Truck::query();
        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $baseQuery->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('truck_number', 'like', $term)
                    ->orWhere('model', 'like', $term);
            });
        }
        $total = (clone $baseQuery)->count();
        $available_count = (clone $baseQuery)->whereDoesntHave('bookings', function ($q) use ($today) {
            $q->where('event_date', '>=', $today)
                ->whereIn('status', [
                    Booking::STATUS_ASSIGNED,
                    Booking::STATUS_DISPATCHED,
                    Booking::STATUS_IN_PROGRESS,
                ]);
        })->count();
        $booked_count = (clone $baseQuery)->whereHas('bookings', function ($q) use ($today) {
            $q->where('event_date', '>=', $today)->where('status', Booking::STATUS_ASSIGNED);
        })->whereDoesntHave('bookings', function ($q) use ($today) {
            $q->where('event_date', '>=', $today)
                ->whereIn('status', [Booking::STATUS_DISPATCHED, Booking::STATUS_IN_PROGRESS]);
        })->count();
        $on_route_count = (clone $baseQuery)->whereHas('bookings', function ($q) use ($today) {
            $q->where('event_date', '>=', $today)
                ->whereIn('status', [Booking::STATUS_DISPATCHED, Booking::STATUS_IN_PROGRESS]);
        })->count();

        $response = $paginated->toArray();
        $response['meta'] = [
            'total' => $total,
            'available_count' => $available_count,
            'booked_count' => $booked_count,
            'on_route_count' => $on_route_count,
        ];
        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'truck_number' => 'nullable|string|max:50',
            'model' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:0',
            'plate_number' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000',
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
            'truck_number' => 'nullable|string|max:50',
            'model' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:0',
            'plate_number' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000',
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

    public function uploadImage(Request $request, Truck $truck): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:2048'],
        ]);
        if ($truck->image) {
            Storage::disk('public')->delete($truck->image);
        }
        $path = $request->file('image')->store('trucks', 'public');
        $truck->update(['image' => $path]);
        return response()->json(['message' => 'Truck image updated.', 'data' => $truck->fresh()]);
    }

    public function removeImage(Truck $truck): JsonResponse
    {
        if ($truck->image) {
            Storage::disk('public')->delete($truck->image);
            $truck->update(['image' => null]);
        }
        return response()->json(['message' => 'Truck image removed.', 'data' => $truck->fresh()]);
    }
}
