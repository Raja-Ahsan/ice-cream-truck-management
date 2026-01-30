<?php

namespace Database\Seeders;

use App\Models\AddOn;
use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageAndAddOnSeeder extends Seeder
{
    public function run(): void
    {
        Package::updateOrCreate(
            ['name' => 'Basic Party'],
            [
                'description' => '1 hour of ice cream fun',
                'price' => 199.00,
                'duration_minutes' => 60,
                'sort_order' => 1,
                'is_active' => true,
            ]
        );
        Package::updateOrCreate(
            ['name' => 'Premium Party'],
            [
                'description' => '2 hours with extra treats',
                'price' => 349.00,
                'duration_minutes' => 120,
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        AddOn::updateOrCreate(['name' => 'Extra Scoops'], ['price' => 25.00, 'is_active' => true]);
        AddOn::updateOrCreate(['name' => 'Birthday Banner'], ['price' => 15.00, 'is_active' => true]);
        AddOn::updateOrCreate(['name' => 'Photo Booth'], ['price' => 50.00, 'is_active' => true]);
    }
}
