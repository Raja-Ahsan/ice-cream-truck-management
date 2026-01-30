<?php

namespace Database\Seeders;

use App\Models\ServiceArea;
use Illuminate\Database\Seeder;

class ServiceAreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['name' => 'Downtown', 'zip_code' => '10001', 'radius_km' => 15, 'is_active' => true],
            ['name' => 'Metro Area', 'zip_code' => '10002', 'radius_km' => 25, 'is_active' => true],
            ['name' => 'West Side', 'zip_code' => '10003', 'radius_km' => 20, 'is_active' => true],
        ];
        foreach ($areas as $area) {
            ServiceArea::updateOrCreate(['zip_code' => $area['zip_code']], $area);
        }
    }
}
