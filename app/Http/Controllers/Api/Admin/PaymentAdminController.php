<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentAdminController extends Controller
{
    /** Payment status filter: paid, partial (authorized), unpaid (pending, failed). */
    private function paymentStatusFilter(string $status): ?array
    {
        if ($status === 'paid') {
            return [Booking::PAYMENT_PAID];
        }
        if ($status === 'partial') {
            return [Booking::PAYMENT_AUTHORIZED];
        }
        if ($status === 'unpaid') {
            return [Booking::PAYMENT_PENDING, Booking::PAYMENT_FAILED];
        }
        return null;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Booking::query()->with(['package']);

        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('customer_name', 'like', $term)
                    ->orWhere('customer_email', 'like', $term)
                    ->orWhere('customer_phone', 'like', $term)
                    ->orWhere('event_address', 'like', $term);
            });
        }

        $status = $request->input('status');
        $statuses = $this->paymentStatusFilter($status);
        if ($statuses !== null) {
            $query->whereIn('payment_status', $statuses);
        }

        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(5, min(50, $perPage));
        $paginated = $query->orderByDesc('event_date')->orderBy('event_time')->paginate($perPage);

        $baseQuery = Booking::query();
        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $baseQuery->where(function ($q) use ($term) {
                $q->where('customer_name', 'like', $term)
                    ->orWhere('customer_email', 'like', $term)
                    ->orWhere('customer_phone', 'like', $term)
                    ->orWhere('event_address', 'like', $term);
            });
        }

        $totalRevenue = (clone $baseQuery)->sum('total_amount');
        $collected = (clone $baseQuery)->where('payment_status', Booking::PAYMENT_PAID)->sum('total_amount');
        $pending = (clone $baseQuery)->whereIn('payment_status', [Booking::PAYMENT_PENDING, Booking::PAYMENT_AUTHORIZED, Booking::PAYMENT_FAILED])->sum('total_amount');
        $thisMonthStart = Carbon::now()->startOfMonth()->toDateString();
        $thisMonthEnd = Carbon::now()->endOfMonth()->toDateString();
        $thisMonth = (clone $baseQuery)->where('payment_status', Booking::PAYMENT_PAID)
            ->whereBetween('event_date', [$thisMonthStart, $thisMonthEnd])
            ->sum('total_amount');

        $total_count = (clone $baseQuery)->count();
        $paid_count = (clone $baseQuery)->where('payment_status', Booking::PAYMENT_PAID)->count();
        $partial_count = (clone $baseQuery)->where('payment_status', Booking::PAYMENT_AUTHORIZED)->count();
        $unpaid_count = (clone $baseQuery)->whereIn('payment_status', [Booking::PAYMENT_PENDING, Booking::PAYMENT_FAILED])->count();

        $items = collect($paginated->items())->map(function (Booking $booking) {
            $eventLabel = $booking->customer_name ?: ($booking->package?->name ?? 'Event Booking');
            $statusLabel = $this->paymentStatusToLabel($booking->payment_status);
            $bookingRef = $booking->uuid ? strtoupper(substr($booking->uuid, 0, 8)) : 'BK-' . $booking->id;
            return [
                'id' => $booking->id,
                'uuid' => $booking->uuid,
                'booking_ref' => $bookingRef,
                'event_label' => $eventLabel,
                'event_address' => $booking->event_address,
                'customer_name' => $booking->customer_name,
                'customer_phone' => $booking->customer_phone,
                'customer_email' => $booking->customer_email,
                'event_date' => $booking->event_date?->format('Y-m-d'),
                'event_time' => $booking->event_time,
                'total_amount' => (float) $booking->total_amount,
                'payment_status' => $booking->payment_status,
                'status_label' => $statusLabel,
            ];
        });

        // Same pagination shape as BookingAdminController::index so frontend parses identically
        $response = array_merge($paginated->toArray(), [
            'data' => $items->values()->all(),
            'meta' => [
                'total_revenue' => round((float) $totalRevenue, 2),
                'collected' => round((float) $collected, 2),
                'pending' => round((float) $pending, 2),
                'this_month' => round((float) $thisMonth, 2),
                'total_count' => $total_count,
                'paid_count' => $paid_count,
                'partial_count' => $partial_count,
                'unpaid_count' => $unpaid_count,
            ],
        ]);
        return response()->json($response);
    }

    private function paymentStatusToLabel(?string $status): string
    {
        if ($status === Booking::PAYMENT_PAID) {
            return 'Paid';
        }
        if ($status === Booking::PAYMENT_AUTHORIZED) {
            return 'Partial';
        }
        if (in_array($status, [Booking::PAYMENT_PENDING, Booking::PAYMENT_FAILED], true)) {
            return 'Unpaid';
        }
        if ($status === Booking::PAYMENT_REFUNDED) {
            return 'Refunded';
        }
        return 'Unpaid';
    }

    public function updatePaymentStatus(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:paid,authorized,pending',
        ]);
        $booking->update(['payment_status' => $validated['payment_status']]);
        $statusLabel = $this->paymentStatusToLabel($booking->payment_status);
        return response()->json([
            'message' => 'Payment status updated.',
            'data' => [
                'id' => $booking->id,
                'payment_status' => $booking->payment_status,
                'status_label' => $statusLabel,
            ],
        ]);
    }
}
