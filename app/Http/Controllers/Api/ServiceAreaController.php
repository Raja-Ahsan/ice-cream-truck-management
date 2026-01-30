<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceArea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceAreaController extends Controller
{
    public function check(Request $request): JsonResponse
    {
        $request->validate([
            'zip' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $zip = $request->input('zip');
        $lat = $request->input('latitude');
        $lng = $request->input('longitude');

        $areas = ServiceArea::where('is_active', true)->get();

        foreach ($areas as $area) {
            if ($area->zip_code && $zip && str_replace(' ', '', $area->zip_code) === str_replace(' ', '', $zip)) {
                return response()->json([
                    'covered' => true,
                    'message' => 'Your area is within our service zone.',
                    'service_area' => $area->only(['id', 'name']),
                ]);
            }
            if ($area->center_lat && $area->center_lng && $lat !== null && $lng !== null) {
                $distanceKm = $this->haversineDistance(
                    (float) $area->center_lat,
                    (float) $area->center_lng,
                    (float) $lat,
                    (float) $lng
                );
                if ($distanceKm <= $area->radius_km) {
                    return response()->json([
                        'covered' => true,
                        'message' => 'Your area is within our service zone.',
                        'service_area' => $area->only(['id', 'name']),
                    ]);
                }
            }
        }

        return response()->json([
            'covered' => false,
            'message' => 'Sorry, we do not currently serve this area.',
        ], 200);
    }

    private function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
