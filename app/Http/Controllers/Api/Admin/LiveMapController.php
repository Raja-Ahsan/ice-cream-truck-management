<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DriverLocation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveMapController extends Controller
{
    public function locations(Request $request): JsonResponse
    {
        $drivers = User::where('role', User::ROLE_DRIVER)->get(['id', 'name', 'email', 'phone']);

        $locations = [];
        foreach ($drivers as $driver) {
            $latest = DriverLocation::where('user_id', $driver->id)
                ->with(['booking' => fn ($q) => $q->with('truck')])
                ->orderByDesc('recorded_at')
                ->first();

            $booking = $latest?->booking;
            $truck = $booking?->truck;

            $locations[] = [
                'driver_id' => $driver->id,
                'driver_name' => $driver->name,
                'driver_email' => $driver->email,
                'driver_phone' => $driver->phone,
                'latitude' => $latest?->latitude,
                'longitude' => $latest?->longitude,
                'recorded_at' => $latest?->recorded_at?->toIso8601String(),
                'booking_id' => $latest?->booking_id,
                'booking_status' => $booking?->status,
                'truck_id' => $truck?->id,
                'truck_name' => $truck?->name,
                'plate_number' => $truck?->plate_number,
            ];
        }

        return response()->json(['data' => $locations]);
    }
}
