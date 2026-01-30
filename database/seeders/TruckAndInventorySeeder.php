<?php

namespace Database\Seeders;

use App\Models\InventoryProduct;
use App\Models\Truck;
use Illuminate\Database\Seeder;

class TruckAndInventorySeeder extends Seeder
{
    public function run(): void
    {
        Truck::updateOrCreate(['name' => 'Truck 1'], ['plate_number' => 'ICT-001', 'is_active' => true]);
        Truck::updateOrCreate(['name' => 'Truck 2'], ['plate_number' => 'ICT-002', 'is_active' => true]);

        InventoryProduct::updateOrCreate(['name' => 'Ice Cream Cones'], ['unit' => 'box', 'is_active' => true]);
        InventoryProduct::updateOrCreate(['name' => 'Ice Cream Tubs'], ['unit' => 'tub', 'is_active' => true]);
    }
}
