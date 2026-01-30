<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendBookingConfirmationJob;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $sig = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        if (! $secret || ! class_exists(\Stripe\Webhook::class)) {
            return response('Webhook not configured', 400);
        }

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sig, $secret);
        } catch (\Exception $e) {
            Log::warning('Stripe webhook signature verification failed: '.$e->getMessage());
            return response('Invalid signature', 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $pi = $event->data->object;
            $booking = Booking::where('stripe_payment_intent_id', $pi->id)->first();
            if ($booking) {
                $booking->update([
                    'payment_status' => Booking::PAYMENT_PAID,
                    'status' => Booking::STATUS_CONFIRMED,
                ]);
                SendBookingConfirmationJob::dispatch($booking);
            }
        }

        return response('OK', 200);
    }
}
