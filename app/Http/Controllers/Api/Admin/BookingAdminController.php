<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\NotifyDriverAssignedJob;
use App\Models\Booking;
use App\Models\TruckInventorySnapshot;
use App\Models\TruckInventorySnapshotLine;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['package', 'truck', 'driver', 'addOns.addOn']);
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->has('from_date')) {
            $query->whereDate('event_date', '>=', $request->input('from_date'));
        }
        if ($request->has('to_date')) {
            $query->whereDate('event_date', '<=', $request->input('to_date'));
        }
        $bookings = $query->orderByDesc('created_at')->paginate($request->input('per_page', 15));
        return response()->json($bookings);
    }

    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['package', 'truck', 'driver', 'addOns.addOn']);
        return response()->json(['data' => $booking]);
    }

    public function assign(Request $request, Booking $booking): JsonResponse
    {
        $request->validate([
            'truck_id' => 'required|exists:trucks,id',
            'driver_id' => 'required|exists:users,id',
        ]);
        $driver = User::findOrFail($request->driver_id);
        if ($driver->role !== User::ROLE_DRIVER) {
            return response()->json(['message' => 'Selected user is not a driver.'], 422);
        }
        $booking->update([
            'truck_id' => $request->truck_id,
            'driver_id' => $request->driver_id,
            'status' => Booking::STATUS_ASSIGNED,
        ]);
        NotifyDriverAssignedJob::dispatch($booking);
        $booking->load(['package', 'truck', 'driver', 'addOns.addOn']);
        return response()->json(['message' => 'Booking assigned.', 'data' => $booking]);
    }

    public function setInventorySnapshot(Request $request, Booking $booking): JsonResponse
    {
        $request->validate([
            'lines' => 'required|array',
            'lines.*.inventory_product_id' => 'required|exists:inventory_products,id',
            'lines.*.quantity_assigned' => 'required|integer|min:0',
        ]);
        if (! $booking->truck_id) {
            return response()->json(['message' => 'Assign truck first.'], 422);
        }
        $snapshot = TruckInventorySnapshot::create([
            'truck_id' => $booking->truck_id,
            'booking_id' => $booking->id,
            'snapshot_at' => now(),
        ]);
        foreach ($request->lines as $line) {
            TruckInventorySnapshotLine::create([
                'truck_inventory_snapshot_id' => $snapshot->id,
                'inventory_product_id' => $line['inventory_product_id'],
                'quantity_assigned' => $line['quantity_assigned'],
            ]);
        }
        return response()->json([
            'message' => 'Inventory snapshot saved.',
            'data' => $snapshot->load('lines.inventoryProduct'),
        ]);
    }

    public function dispatch(Booking $booking): JsonResponse
    {
        if ($booking->status !== Booking::STATUS_ASSIGNED) {
            return response()->json(['message' => 'Booking must be assigned first.'], 422);
        }
        $booking->update([
            'status' => Booking::STATUS_DISPATCHED,
            'dispatched_at' => now(),
        ]);
        $booking->load(['package', 'truck', 'driver', 'addOns.addOn']);
        return response()->json(['message' => 'Booking dispatched.', 'data' => $booking]);
    }
}
