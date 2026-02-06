<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TruckInventorySnapshot extends Model
{
    public const REVIEW_PENDING = 'pending_review';
    public const REVIEW_APPROVED = 'approved';
    public const REVIEW_FLAGGED = 'flagged';

    protected $fillable = [
        'truck_id',
        'booking_id',
        'snapshot_at',
        'review_status',
        'reviewed_at',
        'reviewed_by',
    ];

    protected function casts(): array
    {
        return [
            'snapshot_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(TruckInventorySnapshotLine::class, 'truck_inventory_snapshot_id');
    }

    public function reviewedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /** Expected remaining = assigned - used. Discrepancy = reported remaining - expected. */
    public function getDiscrepancyForLine(TruckInventorySnapshotLine $line): ?int
    {
        $assigned = (int) $line->quantity_assigned;
        $used = (int) ($line->quantity_used ?? 0);
        $reportedRemaining = (int) ($line->quantity_remaining ?? 0);
        $expectedRemaining = $assigned - $used;
        return $reportedRemaining - $expectedRemaining;
    }
}
