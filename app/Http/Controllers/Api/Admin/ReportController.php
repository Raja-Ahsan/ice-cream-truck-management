<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function bookings(Request $request): JsonResponse
    {
        $from = $request->input('from_date', now()->startOfMonth()->toDateString());
        $to = $request->input('to_date', now()->toDateString());

        $bookings = Booking::whereBetween('event_date', [$from, $to])
            ->with(['package', 'truck', 'driver'])
            ->orderBy('event_date')
            ->orderBy('event_time')
            ->get();

        $summary = [
            'total' => $bookings->count(),
            'by_status' => $bookings->groupBy('status')->map->count(),
            'revenue' => $bookings->where('payment_status', Booking::PAYMENT_PAID)->sum('total_amount'),
        ];

        return response()->json([
            'from' => $from,
            'to' => $to,
            'summary' => $summary,
            'data' => $bookings,
        ]);
    }

    public function revenue(Request $request): JsonResponse
    {
        $from = $request->input('from_date', now()->startOfMonth()->toDateString());
        $to = $request->input('to_date', now()->toDateString());

        $daily = Booking::where('payment_status', Booking::PAYMENT_PAID)
            ->whereBetween('event_date', [$from, $to])
            ->select(DB::raw('event_date as date'), DB::raw('SUM(total_amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('event_date')
            ->orderBy('event_date')
            ->get();

        $total = $daily->sum('total');
        $count = $daily->sum('count');

        return response()->json([
            'from' => $from,
            'to' => $to,
            'total_revenue' => round($total, 2),
            'total_bookings' => $count,
            'by_day' => $daily,
        ]);
    }

    public function export(Request $request): StreamedResponse|JsonResponse
    {
        $from = $request->input('from_date', now()->startOfMonth()->toDateString());
        $to = $request->input('to_date', now()->toDateString());
        $format = $request->input('format', 'csv');

        $bookings = Booking::whereBetween('event_date', [$from, $to])
            ->with(['package', 'truck', 'driver'])
            ->orderBy('event_date')
            ->orderBy('event_time')
            ->get();

        if ($format === 'csv') {
            return response()->streamDownload(function () use ($bookings) {
                $out = fopen('php://output', 'w');
                fputcsv($out, ['Date', 'Time', 'Customer', 'Email', 'Package', 'Amount', 'Status', 'Payment', 'Truck', 'Driver']);
                foreach ($bookings as $b) {
                    fputcsv($out, [
                        $b->event_date->format('Y-m-d'),
                        $b->event_time,
                        $b->customer_name,
                        $b->customer_email,
                        $b->package?->name,
                        $b->total_amount,
                        $b->status,
                        $b->payment_status,
                        $b->truck?->name,
                        $b->driver?->name,
                    ]);
                }
                fclose($out);
            }, 'bookings-'.$from.'-'.$to.'.csv', [
                'Content-Type' => 'text/csv',
            ]);
        }

        return response()->json(['message' => 'Use format=csv for export. PDF can be added later.']);
    }
}
