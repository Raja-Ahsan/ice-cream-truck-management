<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class DriverAdminController extends Controller
{
    private function today(): string
    {
        return Carbon::today()->toDateString();
    }

    /** Current booking statuses (assigned, dispatched, in_progress). */
    private function activeStatuses(): array
    {
        return [
            Booking::STATUS_ASSIGNED,
            Booking::STATUS_DISPATCHED,
            Booking::STATUS_IN_PROGRESS,
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $today = $this->today();
        $query = User::query()->where('role', User::ROLE_DRIVER);

        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('license', 'like', $term);
            });
        }

        $status = $request->input('status');
        if ($status === 'available') {
            $query->whereDoesntHave('assignedBookings', function ($q) use ($today) {
                $q->where('event_date', '>=', $today)
                    ->whereIn('status', $this->activeStatuses());
            });
        } elseif ($status === 'active_today') {
            $query->whereHas('assignedBookings', function ($q) use ($today) {
                $q->where('event_date', '>=', $today)
                    ->whereIn('status', $this->activeStatuses());
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(5, min(50, $perPage));
        $paginated = $query->orderBy('name')->paginate($perPage);

        $baseQuery = User::query()->where('role', User::ROLE_DRIVER);
        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $baseQuery->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('license', 'like', $term);
            });
        }
        $total = (clone $baseQuery)->count();
        $active_today_count = (clone $baseQuery)->whereHas('assignedBookings', function ($q) use ($today) {
            $q->where('event_date', '>=', $today)->whereIn('status', $this->activeStatuses());
        })->count();
        $available_count = (clone $baseQuery)->whereDoesntHave('assignedBookings', function ($q) use ($today) {
            $q->where('event_date', '>=', $today)->whereIn('status', $this->activeStatuses());
        })->count();

        $items = collect($paginated->items())->map(function (User $driver) use ($today) {
            $currentBooking = $driver->assignedBookings()
                ->where('event_date', '>=', $today)
                ->whereIn('status', $this->activeStatuses())
                ->with(['truck', 'package'])
                ->orderBy('event_date')
                ->orderBy('event_time')
                ->first();

            $statusLabel = 'Available';
            $truckName = null;
            $truckNumber = null;
            $eventLabel = null;
            $bookingStatus = null;

            if ($currentBooking) {
                $bookingStatus = $currentBooking->status;
                if (in_array($currentBooking->status, [Booking::STATUS_DISPATCHED, Booking::STATUS_IN_PROGRESS], true)) {
                    $statusLabel = 'On Route';
                } else {
                    $statusLabel = 'Assigned';
                }
                if ($currentBooking->truck) {
                    $truckName = $currentBooking->truck->name;
                    $truckNumber = $currentBooking->truck->truck_number;
                }
                $eventLabel = $currentBooking->customer_name ?: ($currentBooking->package?->name ?? 'Event');
            }

            return [
                'id' => $driver->id,
                'driver_id' => 'd' . $driver->id,
                'name' => $driver->name,
                'email' => $driver->email,
                'phone' => $driver->phone,
                'license' => $driver->license,
                'current_booking' => $currentBooking ? [
                    'truck_name' => $truckName,
                    'truck_number' => $truckNumber,
                    'event_date' => $currentBooking->event_date?->toDateString(),
                    'event_label' => $eventLabel,
                    'status' => $bookingStatus,
                ] : null,
                'status_label' => $statusLabel,
            ];
        });

        $response = array_merge($paginated->toArray(), ['data' => $items->values()->all()]);
        $response['meta'] = [
            'total' => $total,
            'active_today_count' => $active_today_count,
            'available_count' => $available_count,
        ];
        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', Password::defaults()],
            'phone' => 'nullable|string|max:50',
            'license' => 'nullable|string|max:100',
        ]);
        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = User::ROLE_DRIVER;
        $driver = User::create($validated);
        return response()->json(['data' => [
            'id' => $driver->id,
            'driver_id' => 'd' . $driver->id,
            'name' => $driver->name,
            'email' => $driver->email,
            'phone' => $driver->phone,
            'license' => $driver->license,
            'current_booking' => null,
            'status_label' => 'Available',
        ]], 201);
    }
}
