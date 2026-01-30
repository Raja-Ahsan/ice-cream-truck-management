<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            AdminAndDriverSeeder::class,
            ServiceAreaSeeder::class,
            PackageAndAddOnSeeder::class,
            CmsPageSeeder::class,
            FaqSeeder::class,
            TruckAndInventorySeeder::class,
            SettingsSeeder::class,
            BookingSeeder::class,
            TruckInventorySnapshotSeeder::class,
            DriverLocationSeeder::class,
            ActivityLogSeeder::class,
        ]);
    }
}
