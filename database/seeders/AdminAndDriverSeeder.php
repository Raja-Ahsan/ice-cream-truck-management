<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminAndDriverSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'email' => 'admin@icecreamtruck.com',
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ADMIN,
                'phone' => null,
            ],
            [
                'email' => 'driver@icecreamtruck.com',
                'name' => 'Driver One',
                'password' => Hash::make('password'),
                'role' => User::ROLE_DRIVER,
                'phone' => '555-0101',
            ],
            [
                'email' => 'driver2@icecreamtruck.com',
                'name' => 'Driver Two',
                'password' => Hash::make('password'),
                'role' => User::ROLE_DRIVER,
                'phone' => '555-0102',
            ],
            [
                'email' => 'customer@example.com',
                'name' => 'Jane Customer',
                'password' => Hash::make('password'),
                'role' => User::ROLE_CUSTOMER,
                'phone' => '555-1000',
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                $data
            );
        }
    }
}
