<?php

namespace App\Events;

use App\Models\DriverLocation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public DriverLocation $location
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('live-locations'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'location.updated';
    }

    public function broadcastWith(): array
    {
        $this->location->load('user:id,name');
        return [
            'driver_id' => $this->location->user_id,
            'driver_name' => $this->location->user?->name,
            'latitude' => (float) $this->location->latitude,
            'longitude' => (float) $this->location->longitude,
            'recorded_at' => $this->location->recorded_at?->toIso8601String(),
            'booking_id' => $this->location->booking_id,
        ];
    }
}
