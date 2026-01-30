<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\DriverLocation;
use App\Models\User;
use Illuminate\Database\Seeder;

class DriverLocationSeeder extends Seeder
{
    public function run(): void
    {
        $drivers = User::where('role', User::ROLE_DRIVER)->get();
        $assignedBooking = Booking::whereNotNull('driver_id')->whereIn('status', ['assigned', 'dispatched', 'in_progress'])->first();

        // Sample coordinates (Downtown / Metro area)
        $waypoints = [
            ['lat' => 40.7128, 'lng' => -74.0060],
            ['lat' => 40.7150, 'lng' => -74.0080],
            ['lat' => 40.7180, 'lng' => -74.0100],
            ['lat' => 40.7200, 'lng' => -74.0120],
        ];

        foreach ($drivers as $driver) {
            for ($i = 0; $i < 2; $i++) {
                $base = $waypoints[array_rand($waypoints)];
                $recorded = now()->subMinutes(rand(5 + $i * 15, 30 + $i * 15));
                DriverLocation::firstOrCreate(
                    [
                        'user_id' => $driver->id,
                        'recorded_at' => $recorded,
                    ],
                    [
                        'latitude' => $base['lat'] + (mt_rand(-100, 100) / 10000),
                        'longitude' => $base['lng'] + (mt_rand(-100, 100) / 10000),
                        'booking_id' => $assignedBooking?->id,
                    ]
                );
            }
        }
    }
}
