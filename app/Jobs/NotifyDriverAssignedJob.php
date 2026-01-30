<?php

namespace App\Jobs;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NotifyDriverAssignedJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Booking $booking
    ) {}

    public function handle(): void
    {
        $driver = $this->booking->driver;
        if (! $driver) {
            return;
        }
        // TODO: Push notification / SMS when channels are configured
        Log::info('Driver notified of assignment', [
            'driver_id' => $driver->id,
            'booking_id' => $this->booking->id,
        ]);
    }
}
