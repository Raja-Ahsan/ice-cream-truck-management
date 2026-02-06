<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Booking extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_ASSIGNED = 'assigned';
    public const STATUS_DISPATCHED = 'dispatched';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    public const PAYMENT_PENDING = 'pending';
    public const PAYMENT_AUTHORIZED = 'authorized';
    public const PAYMENT_PAID = 'paid';
    public const PAYMENT_FAILED = 'failed';
    public const PAYMENT_REFUNDED = 'refunded';

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            if (empty($booking->uuid)) {
                $booking->uuid = (string) Str::uuid();
            }
        });
    }

    protected $fillable = [
        'uuid',
        'event_date',
        'event_time',
        'duration_minutes',
        'package_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'event_address',
        'special_notes',
        'status',
        'payment_status',
        'stripe_payment_intent_id',
        'total_amount',
        'truck_id',
        'driver_id',
        'dispatched_at',
        'arrived_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'total_amount' => 'decimal:2',
            'dispatched_at' => 'datetime',
            'arrived_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function addOns(): HasMany
    {
        return $this->hasMany(BookingAddOn::class);
    }

    public function inventorySnapshots(): HasMany
    {
        return $this->hasMany(TruckInventorySnapshot::class);
    }
}
