<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', User::ROLE_ADMIN)->first();
        $booking = Booking::first();

        $logs = [
            [
                'user_id' => $admin?->id,
                'action' => 'login',
                'subject_type' => null,
                'subject_id' => null,
                'properties' => ['ip' => '127.0.0.1'],
            ],
            [
                'user_id' => $admin?->id,
                'action' => 'booking.viewed',
                'subject_type' => Booking::class,
                'subject_id' => $booking?->id,
                'properties' => ['booking_uuid' => $booking?->uuid],
            ],
            [
                'user_id' => $admin?->id,
                'action' => 'booking.assigned',
                'subject_type' => Booking::class,
                'subject_id' => $booking?->id,
                'properties' => ['truck_id' => 1, 'driver_id' => 1],
            ],
        ];

        foreach ($logs as $log) {
            ActivityLog::create(array_merge($log, [
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Dummy)',
                'created_at' => now()->subHours(rand(1, 24)),
            ]));
        }
    }
}
