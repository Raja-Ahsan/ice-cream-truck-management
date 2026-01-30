<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\InventoryProduct;
use App\Models\TruckInventorySnapshot;
use App\Models\TruckInventorySnapshotLine;
use Illuminate\Database\Seeder;

class TruckInventorySnapshotSeeder extends Seeder
{
    public function run(): void
    {
        $booking = Booking::whereNotNull('truck_id')->whereIn('status', ['assigned', 'dispatched', 'in_progress', 'completed'])->first();
        if (! $booking) {
            return;
        }

        $snapshot = TruckInventorySnapshot::firstOrCreate(
            [
                'truck_id' => $booking->truck_id,
                'booking_id' => $booking->id,
            ],
            [
                'snapshot_at' => now(),
            ]
        );

        $products = InventoryProduct::where('is_active', true)->get();
        foreach ($products as $product) {
            TruckInventorySnapshotLine::firstOrCreate(
                [
                    'truck_inventory_snapshot_id' => $snapshot->id,
                    'inventory_product_id' => $product->id,
                ],
                [
                    'quantity_assigned' => rand(5, 20),
                    'quantity_used' => $booking->status === 'completed' ? rand(3, 15) : null,
                    'quantity_remaining' => $booking->status === 'completed' ? rand(0, 5) : null,
                ]
            );
        }
    }
}
