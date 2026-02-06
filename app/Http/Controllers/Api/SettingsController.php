<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /** Public settings (logos, favicon, site title) for frontend and document head. */
    public function public(): JsonResponse
    {
        $general = Setting::getGroup('general', false);
        $data = [
            'site_title' => $general['site_title'] ?? config('app.name'),
            'site_tagline' => $general['site_tagline'] ?? '',
            'site_logo' => $general['site_logo'] ?? null,
            'header_logo' => $general['header_logo'] ?? null,
            'footer_logo' => $general['footer_logo'] ?? null,
            'site_favicon' => $general['site_favicon'] ?? null,
        ];
        return response()->json(['data' => $data]);
    }
}
