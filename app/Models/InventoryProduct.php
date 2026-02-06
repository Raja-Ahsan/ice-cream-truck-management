<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryProduct extends Model
{
    protected $fillable = [
        'name',
        'unit',
        'image',
        'quantity_in_stock',
        'is_active',
    ];

    protected $appends = ['quantity_allocated', 'quantity_available', 'image_url'];

    protected function casts(): array
    {
        return [
            'quantity_in_stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function snapshotLines(): HasMany
    {
        return $this->hasMany(TruckInventorySnapshotLine::class, 'inventory_product_id');
    }

    /** Quantity assigned to trucks (bookings in assigned/dispatched/in_progress). */
    public function getQuantityAllocatedAttribute(): int
    {
        return (int) TruckInventorySnapshotLine::query()
            ->where('inventory_product_id', $this->id)
            ->whereHas('snapshot.booking', function ($q) {
                $q->whereIn('status', [
                    Booking::STATUS_ASSIGNED,
                    Booking::STATUS_DISPATCHED,
                    Booking::STATUS_IN_PROGRESS,
                ]);
            })
            ->sum('quantity_assigned');
    }

    public function getQuantityAvailableAttribute(): int
    {
        return max(0, $this->quantity_in_stock - $this->quantity_allocated);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }
        return asset('storage/'.$this->image);
    }
}
