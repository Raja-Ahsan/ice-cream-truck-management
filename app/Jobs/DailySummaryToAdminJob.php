<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DailySummaryToAdminJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $yesterday = today()->subDay();
        $bookings = Booking::whereDate('created_at', $yesterday)->get();
        $paid = Booking::where('payment_status', Booking::PAYMENT_PAID)->whereDate('created_at', $yesterday)->sum('total_amount');
        $count = $bookings->count();

        $summary = [
            'date' => $yesterday->toDateString(),
            'bookings_count' => $count,
            'revenue' => round($paid, 2),
        ];

        $admins = User::where('role', User::ROLE_ADMIN)->get();
        foreach ($admins as $admin) {
            // TODO: Send email when mail is configured
            Log::info('Daily summary sent to admin', ['admin_id' => $admin->id, 'summary' => $summary]);
        }
    }
}
