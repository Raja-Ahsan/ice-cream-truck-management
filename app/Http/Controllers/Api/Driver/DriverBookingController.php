<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Jobs\TriggerInventoryReviewJob;
use App\Models\Booking;
use App\Models\TruckInventorySnapshot;
use App\Models\TruckInventorySnapshotLine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverBookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::where('driver_id', $request->user()->id)
            ->with(['package', 'truck'])
            ->orderByDesc('event_date')
            ->orderByDesc('event_time')
            ->get();

        return response()->json(['data' => $bookings]);
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        $booking->load(['package', 'truck', 'addOns.addOn', 'inventorySnapshots.lines.inventoryProduct']);
        return response()->json(['data' => $booking]);
    }

    public function startRoute(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        if ($booking->status !== Booking::STATUS_DISPATCHED) {
            return response()->json(['message' => 'Booking must be dispatched first.'], 422);
        }
        $booking->update(['status' => Booking::STATUS_IN_PROGRESS]);
        $booking->refresh();
        $booking->load(['package', 'truck', 'addOns.addOn', 'inventorySnapshots.lines.inventoryProduct']);
        return response()->json(['message' => 'Route started.', 'data' => $booking]);
    }

    public function arrive(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        if (! in_array($booking->status, [Booking::STATUS_DISPATCHED, Booking::STATUS_IN_PROGRESS], true)) {
            return response()->json(['message' => 'Booking must be dispatched or in progress to record arrival.'], 422);
        }
        $updates = ['status' => Booking::STATUS_IN_PROGRESS];
        if ($booking->arrived_at === null) {
            $updates['arrived_at'] = now();
        }
        $booking->update($updates);
        $booking->refresh();
        $booking->load(['package', 'truck', 'addOns.addOn', 'inventorySnapshots.lines.inventoryProduct']);
        return response()->json(['message' => 'Arrival recorded.', 'data' => $booking]);
    }

    public function complete(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        if ($booking->status === Booking::STATUS_COMPLETED) {
            return response()->json(['message' => 'Booking is already completed.'], 422);
        }
        if ($booking->status !== Booking::STATUS_IN_PROGRESS) {
            return response()->json(['message' => 'Booking must be in progress. Record arrival first.'], 422);
        }

        $request->validate([
            'inventory' => 'nullable|array',
            'inventory.*.truck_inventory_snapshot_line_id' => 'required|exists:truck_inventory_snapshot_lines,id',
            'inventory.*.quantity_used' => 'required|integer|min:0',
            'inventory.*.quantity_remaining' => 'required|integer|min:0',
            'inventory.*.quantity_waste' => 'nullable|integer|min:0',
            'notes' => 'nullable|string|max:2000',
        ]);

        $snapshotIdsForBooking = TruckInventorySnapshot::where('booking_id', $booking->id)->pluck('id')->all();
        if (! empty($request->inventory)) {
            foreach ($request->inventory as $line) {
                $update = [
                    'quantity_used' => $line['quantity_used'],
                    'quantity_remaining' => $line['quantity_remaining'],
                ];
                if (array_key_exists('quantity_waste', $line)) {
                    $update['quantity_waste'] = (int) $line['quantity_waste'];
                }
                $updated = TruckInventorySnapshotLine::where('id', $line['truck_inventory_snapshot_line_id'])
                    ->whereIn('truck_inventory_snapshot_id', $snapshotIdsForBooking)
                    ->update($update);
                if ($updated === 0) {
                    return response()->json(['message' => 'Inventory line does not belong to this booking.'], 422);
                }
            }
        }

        $booking->update([
            'status' => Booking::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
        TriggerInventoryReviewJob::dispatch($booking);
        $booking->refresh();
        $booking->load(['package', 'truck', 'addOns.addOn', 'inventorySnapshots.lines.inventoryProduct']);
        return response()->json(['message' => 'Event completed.', 'data' => $booking]);
    }
}
