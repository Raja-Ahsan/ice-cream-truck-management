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
        $drivers = User::where('role', User::ROLE_DRIVER)->get(['id', 'name']);

        $locations = [];
        foreach ($drivers as $driver) {
            $latest = DriverLocation::where('user_id', $driver->id)
                ->orderByDesc('recorded_at')
                ->first();
            $locations[] = [
                'driver_id' => $driver->id,
                'driver_name' => $driver->name,
                'latitude' => $latest?->latitude,
                'longitude' => $latest?->longitude,
                'recorded_at' => $latest?->recorded_at?->toIso8601String(),
                'booking_id' => $latest?->booking_id,
            ];
        }

        return response()->json(['data' => $locations]);
    }
}
