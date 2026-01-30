<?php

namespace Database\Seeders;

use App\Models\AddOn;
use App\Models\Booking;
use App\Models\BookingAddOn;
use App\Models\Package;
use App\Models\Truck;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $packages = Package::all()->keyBy('id');
        $addOns = AddOn::all()->keyBy('id');
        $trucks = Truck::all();
        $drivers = User::where('role', User::ROLE_DRIVER)->get();

        $bookings = [
            [
                'event_date' => now()->addDays(5),
                'event_time' => '14:00',
                'duration_minutes' => 60,
                'package_id' => $packages->first()->id,
                'customer_name' => 'Alice Smith',
                'customer_phone' => '555-2001',
                'customer_email' => 'alice@example.com',
                'event_address' => '456 Party Lane, Downtown',
                'special_notes' => 'Birthday party for 10 kids',
                'status' => Booking::STATUS_PENDING,
                'payment_status' => Booking::PAYMENT_PENDING,
                'total_amount' => 199.00,
                'add_ons' => [],
            ],
            [
                'event_date' => now()->addDays(7),
                'event_time' => '16:00',
                'duration_minutes' => 120,
                'package_id' => $packages->count() > 1 ? $packages->values()[1]->id : $packages->first()->id,
                'customer_name' => 'Bob Johnson',
                'customer_phone' => '555-2002',
                'customer_email' => 'bob@example.com',
                'event_address' => '789 Park Ave, Metro Area',
                'special_notes' => null,
                'status' => Booking::STATUS_CONFIRMED,
                'payment_status' => Booking::PAYMENT_PAID,
                'total_amount' => 389.00, // 349 + 25 + 15
                'add_ons' => [
                    ['add_on_id' => $addOns->first()->id, 'quantity' => 1, 'price_snapshot' => 25.00],
                    ['add_on_id' => $addOns->count() > 1 ? $addOns->values()[1]->id : $addOns->first()->id, 'quantity' => 1, 'price_snapshot' => 15.00],
                ],
            ],
            [
                'event_date' => now()->addDays(10),
                'event_time' => '11:00',
                'duration_minutes' => 60,
                'package_id' => $packages->first()->id,
                'customer_name' => 'Carol Williams',
                'customer_phone' => '555-2003',
                'customer_email' => 'carol@example.com',
                'event_address' => '321 School Rd',
                'special_notes' => 'School event',
                'status' => Booking::STATUS_ASSIGNED,
                'payment_status' => Booking::PAYMENT_PAID,
                'total_amount' => 199.00,
                'truck_id' => $trucks->first()?->id,
                'driver_id' => $drivers->first()?->id,
                'add_ons' => [],
            ],
            [
                'event_date' => now()->addDays(3),
                'event_time' => '13:00',
                'duration_minutes' => 120,
                'package_id' => $packages->count() > 1 ? $packages->values()[1]->id : $packages->first()->id,
                'customer_name' => 'Dave Brown',
                'customer_phone' => '555-2004',
                'customer_email' => 'dave@example.com',
                'event_address' => '100 Main St',
                'special_notes' => null,
                'status' => Booking::STATUS_DISPATCHED,
                'payment_status' => Booking::PAYMENT_PAID,
                'total_amount' => 349.00,
                'truck_id' => $trucks->count() > 1 ? $trucks->values()[1]->id : $trucks->first()?->id,
                'driver_id' => $drivers->count() > 1 ? $drivers->values()[1]->id : $drivers->first()?->id,
                'dispatched_at' => now(),
                'add_ons' => [],
            ],
            [
                'event_date' => now()->subDays(2),
                'event_time' => '15:00',
                'duration_minutes' => 60,
                'package_id' => $packages->first()->id,
                'customer_name' => 'Eve Davis',
                'customer_phone' => '555-2005',
                'customer_email' => 'eve@example.com',
                'event_address' => '555 Past Lane',
                'special_notes' => null,
                'status' => Booking::STATUS_COMPLETED,
                'payment_status' => Booking::PAYMENT_PAID,
                'total_amount' => 224.00, // 199 + 25
                'truck_id' => $trucks->first()?->id,
                'driver_id' => $drivers->first()?->id,
                'dispatched_at' => now()->subDays(2)->setTime(14, 0),
                'completed_at' => now()->subDays(2)->setTime(16, 5),
                'add_ons' => [
                    ['add_on_id' => $addOns->first()->id, 'quantity' => 1, 'price_snapshot' => 25.00],
                ],
            ],
        ];

        foreach ($bookings as $data) {
            $addOnsData = $data['add_ons'];
            unset($data['add_ons']);
            $data['uuid'] = (string) Str::uuid();
            $booking = Booking::create($data);
            foreach ($addOnsData as $ao) {
                BookingAddOn::create([
                    'booking_id' => $booking->id,
                    'add_on_id' => $ao['add_on_id'],
                    'quantity' => $ao['quantity'],
                    'price_snapshot' => $ao['price_snapshot'],
                ]);
            }
        }
    }
}
