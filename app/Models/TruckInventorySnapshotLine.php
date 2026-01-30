<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TruckInventorySnapshotLine extends Model
{
    protected $table = 'truck_inventory_snapshot_lines';

    protected $fillable = [
        'truck_inventory_snapshot_id',
        'inventory_product_id',
        'quantity_assigned',
        'quantity_used',
        'quantity_remaining',
    ];

    public function snapshot(): BelongsTo
    {
        return $this->belongsTo(TruckInventorySnapshot::class, 'truck_inventory_snapshot_id');
    }

    public function inventoryProduct(): BelongsTo
    {
        return $this->belongsTo(InventoryProduct::class);
    }
}
