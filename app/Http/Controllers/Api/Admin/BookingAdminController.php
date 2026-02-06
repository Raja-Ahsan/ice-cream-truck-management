<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\NotifyDriverAssignedJob;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\InventoryProduct;
use App\Models\TruckInventorySnapshot;
use App\Models\TruckInventorySnapshotLine;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['package', 'truck', 'driver', 'addOns.addOn', 'inventorySnapshots.lines.inventoryProduct']);
        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('customer_name', 'like', $term)
                    ->orWhere('customer_email', 'like', $term)
                    ->orWhere('customer_phone', 'like', $term)
                    ->orWhere('event_address', 'like', $term)
                    ->orWhere('uuid', 'like', $term);
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('from_date')) {
            $query->whereDate('event_date', '>=', $request->input('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('event_date', '<=', $request->input('to_date'));
        }
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->input('payment_status'));
        }
        $bookings = $query->orderByDesc('event_date')->orderByDesc('created_at')->paginate($request->input('per_page', 15));
        return response()->json($bookings);
    }

    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['package', 'truck', 'driver', 'addOns.addOn', 'inventorySnapshots.lines.inventoryProduct']);
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

    /**
     * Before event: admin sets inventory per truck. Snapshot saved.
     * Lock: only when status is assigned; not allowed during/after event.
     */
    public function setInventorySnapshot(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->status !== Booking::STATUS_ASSIGNED) {
            return response()->json([
                'message' => 'Inventory can only be set when booking is assigned (before dispatch). During and after event, inventory is locked.',
            ], 422);
        }
        if ($booking->inventorySnapshots()->exists()) {
            return response()->json(['message' => 'A snapshot already exists for this booking.'], 422);
        }
        $request->validate([
            'lines' => 'required|array',
            'lines.*.inventory_product_id' => 'required|exists:inventory_products,id',
            'lines.*.quantity_assigned' => 'required|integer|min:0',
        ]);
        if (! $booking->truck_id) {
            return response()->json(['message' => 'Assign truck first.'], 422);
        }
        $requestedByProduct = [];
        foreach ($request->lines as $line) {
            $pid = (int) $line['inventory_product_id'];
            $requestedByProduct[$pid] = ($requestedByProduct[$pid] ?? 0) + (int) $line['quantity_assigned'];
        }
        foreach ($requestedByProduct as $productId => $requested) {
            $product = InventoryProduct::find($productId);
            if ($product && $requested > $product->quantity_available) {
                return response()->json([
                    'message' => sprintf(
                        'Not enough stock for "%s". Available: %d, requested: %d.',
                        $product->name,
                        $product->quantity_available,
                        $requested
                    ),
                ], 422);
            }
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

    /**
     * After event: admin review – confirm or flag mismatch. Logs adjustments. Updates global inventory on approve.
     */
    public function inventoryReview(Request $request, Booking $booking): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,flagged',
            'adjustments' => 'array',
            'adjustments.*.truck_inventory_snapshot_line_id' => 'required|exists:truck_inventory_snapshot_lines,id',
            'adjustments.*.quantity_used' => 'required|integer|min:0',
            'adjustments.*.quantity_remaining' => 'required|integer|min:0',
            'note' => 'nullable|string|max:1000',
        ]);
        $snapshot = $booking->inventorySnapshots()->latest('id')->first();
        if (! $snapshot) {
            return response()->json(['message' => 'No inventory snapshot found for this booking.'], 422);
        }
        if ($snapshot->review_status !== TruckInventorySnapshot::REVIEW_PENDING) {
            return response()->json(['message' => 'This snapshot has already been reviewed.'], 422);
        }
        if (! empty($request->adjustments)) {
            foreach ($request->adjustments as $adj) {
                TruckInventorySnapshotLine::where('id', $adj['truck_inventory_snapshot_line_id'])
                    ->where('truck_inventory_snapshot_id', $snapshot->id)
                    ->update([
                        'quantity_used' => $adj['quantity_used'],
                        'quantity_remaining' => $adj['quantity_remaining'],
                    ]);
            }
        }
        $snapshot->update([
            'review_status' => $request->status,
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);
        $discrepancies = [];
        foreach ($snapshot->lines()->get() as $line) {
            $d = $snapshot->getDiscrepancyForLine($line);
            if ($d !== null && $d !== 0) {
                $discrepancies[] = ['line_id' => $line->id, 'product_id' => $line->inventory_product_id, 'discrepancy' => $d];
            }
        }
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'inventory.reviewed',
            'subject_type' => TruckInventorySnapshot::class,
            'subject_id' => $snapshot->id,
            'properties' => [
                'booking_id' => $booking->id,
                'status' => $request->status,
                'discrepancies' => $discrepancies,
                'note' => $request->note,
            ],
        ]);
        if ($request->status === TruckInventorySnapshot::REVIEW_APPROVED) {
            foreach ($snapshot->lines()->get() as $line) {
                $used = (int) ($line->quantity_used ?? 0);
                if ($used > 0) {
                    InventoryProduct::where('id', $line->inventory_product_id)->decrement('quantity_in_stock', $used);
                }
            }
        }
        return response()->json([
            'message' => $request->status === 'approved' ? 'Inventory approved and global stock updated.' : 'Inventory flagged for review.',
            'data' => $snapshot->fresh(['lines.inventoryProduct', 'reviewedByUser']),
        ]);
    }

    /**
     * List completed bookings with inventory snapshots pending admin review.
     */
    public function inventoryReviewPending(Request $request): JsonResponse
    {
        $snapshots = TruckInventorySnapshot::with(['booking.package', 'booking.truck', 'booking.driver', 'lines.inventoryProduct'])
            ->where('review_status', TruckInventorySnapshot::REVIEW_PENDING)
            ->whereHas('booking', fn ($q) => $q->where('status', Booking::STATUS_COMPLETED))
            ->orderByDesc('updated_at')
            ->get();
        $data = $snapshots->map(function (TruckInventorySnapshot $snap) {
            $linesWithDiscrepancy = $snap->lines->map(function ($line) use ($snap) {
                $d = $snap->getDiscrepancyForLine($line);
                return [
                    'id' => $line->id,
                    'inventory_product_id' => $line->inventory_product_id,
                    'product' => $line->inventoryProduct,
                    'quantity_assigned' => $line->quantity_assigned,
                    'quantity_used' => $line->quantity_used,
                    'quantity_remaining' => $line->quantity_remaining,
                    'discrepancy' => $d,
                ];
            })->values();
            return [
                'snapshot' => $snap,
                'booking' => $snap->booking,
                'lines_with_discrepancy' => $linesWithDiscrepancy,
            ];
        });
        return response()->json(['data' => $data]);
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
