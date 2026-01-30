<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\NotifyAdminNewBookingJob;
use App\Models\AddOn;
use App\Models\Booking;
use App\Models\BookingAddOn;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_date' => 'required|date|after_or_equal:today',
            'event_time' => 'required|date_format:H:i',
            'duration_minutes' => 'required|integer|min:30|max:480',
            'package_id' => ['required', Rule::exists('packages', 'id')],
            'add_ons' => 'array',
            'add_ons.*.add_on_id' => ['required', Rule::exists('add_ons', 'id')],
            'add_ons.*.quantity' => 'required|integer|min:1|max:99',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_email' => 'required|email',
            'event_address' => 'required|string|max:1000',
            'special_notes' => 'nullable|string|max:2000',
        ]);

        $package = Package::findOrFail($validated['package_id']);
        $total = (float) $package->price;

        $addOnsData = [];
        if (! empty($validated['add_ons'])) {
            foreach ($validated['add_ons'] as $item) {
                $addOn = AddOn::findOrFail($item['add_on_id']);
                $qty = (int) $item['quantity'];
                $lineTotal = $addOn->price * $qty;
                $total += $lineTotal;
                $addOnsData[] = [
                    'add_on_id' => $addOn->id,
                    'quantity' => $qty,
                    'price_snapshot' => $addOn->price,
                    'line_total' => $lineTotal,
                ];
            }
        }

        $booking = DB::transaction(function () use ($validated, $package, $total, $addOnsData) {
            $booking = Booking::create([
                'event_date' => $validated['event_date'],
                'event_time' => $validated['event_time'],
                'duration_minutes' => $validated['duration_minutes'],
                'package_id' => $package->id,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'],
                'event_address' => $validated['event_address'],
                'special_notes' => $validated['special_notes'] ?? null,
                'status' => Booking::STATUS_PENDING,
                'payment_status' => Booking::PAYMENT_PENDING,
                'total_amount' => round($total, 2),
            ]);

            foreach ($addOnsData as $item) {
                BookingAddOn::create([
                    'booking_id' => $booking->id,
                    'add_on_id' => $item['add_on_id'],
                    'quantity' => $item['quantity'],
                    'price_snapshot' => $item['price_snapshot'],
                ]);
            }

            return $booking->fresh(['package', 'addOns.addOn']);
        });

        NotifyAdminNewBookingJob::dispatch($booking);

        return response()->json([
            'message' => 'Booking created. Complete payment to confirm.',
            'data' => $booking,
        ], 201);
    }

    public function showByUuid(string $uuid): JsonResponse
    {
        $booking = Booking::where('uuid', $uuid)->with(['package', 'addOns.addOn'])->firstOrFail();

        return response()->json(['data' => $booking]);
    }

    public function createPaymentIntent(Request $request, string $uuid): JsonResponse
    {
        $booking = Booking::where('uuid', $uuid)->firstOrFail();

        if ($booking->payment_status === Booking::PAYMENT_PAID) {
            return response()->json(['message' => 'Booking already paid.'], 422);
        }

        $amountCents = (int) round($booking->total_amount * 100);

        if (! config('services.stripe.secret') || ! class_exists('\Stripe\StripeClient')) {
            return response()->json([
                'message' => 'Stripe not configured. Set STRIPE_SECRET in .env and run: composer require stripe/stripe-php',
                'client_secret' => null,
                'booking_uuid' => $booking->uuid,
            ]);
        }

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            $pi = $stripe->paymentIntents->create([
                'amount' => $amountCents,
                'currency' => config('services.stripe.currency', 'usd'),
                'metadata' => ['booking_uuid' => $booking->uuid],
                'automatic_payment_methods' => ['enabled' => true],
            ]);
            $booking->update([
                'stripe_payment_intent_id' => $pi->id,
                'payment_status' => Booking::PAYMENT_AUTHORIZED,
            ]);

            return response()->json([
                'client_secret' => $pi->client_secret,
                'booking_uuid' => $booking->uuid,
            ]);
        } catch (\Throwable $e) {
            Log::error('Stripe PaymentIntent error: '.$e->getMessage());

            return response()->json(['message' => 'Payment setup failed.'], 500);
        }
    }
}
