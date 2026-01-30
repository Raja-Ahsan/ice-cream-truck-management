<?php

namespace App\Jobs;

use App\Models\DriverLocation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class CleanInactiveGpsSessionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Delete driver location records older than 7 days to save space.
     */
    public function handle(): void
    {
        $cutoff = now()->subDays(7);
        $deleted = DriverLocation::where('recorded_at', '<', $cutoff)->delete();
        if ($deleted > 0) {
            \Illuminate\Support\Facades\Log::info('Cleaned old GPS records', ['deleted' => $deleted]);
        }
    }
}
