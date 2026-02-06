<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SettingsAdminController extends Controller
{
    private const GROUPS = [
        'general' => [
            'site_title' => 'string|max:255',
            'site_tagline' => 'nullable|string|max:500',
            'site_logo' => 'nullable|string|max:500',
            'header_logo' => 'nullable|string|max:500',
            'footer_logo' => 'nullable|string|max:500',
            'site_favicon' => 'nullable|string|max:500',
            'site_email' => 'nullable|email',
            'site_phone' => 'nullable|string|max:50',
            'site_address' => 'nullable|string|max:500',
        ],
        'social' => [
            'facebook_url' => 'nullable|url|max:500',
            'instagram_url' => 'nullable|url|max:500',
            'twitter_url' => 'nullable|url|max:500',
            'linkedin_url' => 'nullable|url|max:500',
            'youtube_url' => 'nullable|url|max:500',
            'tiktok_url' => 'nullable|url|max:500',
        ],
        'stripe' => [
            'stripe_publishable_key' => 'nullable|string|max:500',
            'stripe_secret_key' => 'nullable|string|max:500',
            'stripe_webhook_secret' => 'nullable|string|max:500',
            'stripe_enabled' => 'boolean',
        ],
        'google' => [
            'google_maps_api_key' => 'nullable|string|max:500',
            'google_analytics_id' => 'nullable|string|max:255',
            'google_tag_manager_id' => 'nullable|string|max:255',
        ],
        'ai' => [
            'openai_api_key' => 'nullable|string|max:500',
            'ai_model' => 'nullable|string|max:100',
            'ai_max_tokens' => 'nullable|integer|min:1|max:128000',
            'ai_temperature' => 'nullable|numeric|min:0|max:2',
            'ai_enabled' => 'boolean',
        ],
        'seo' => [
            'default_meta_title' => 'nullable|string|max:255',
            'default_meta_description' => 'nullable|string|max:500',
            'default_meta_keywords' => 'nullable|string|max:500',
        ],
    ];

    private const ENCRYPTED_KEYS = [
        'stripe_secret_key', 'stripe_webhook_secret', 'openai_api_key', 'google_maps_api_key',
    ];

    public function index(): JsonResponse
    {
        $settings = [];
        foreach (array_keys(self::GROUPS) as $group) {
            $settings[$group] = Setting::getGroup($group, true);
        }
        return response()->json(['data' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $group = $request->input('group');
        if (! $group || ! isset(self::GROUPS[$group])) {
            return response()->json(['message' => 'Invalid group.'], 422);
        }

        $rules = self::GROUPS[$group];
        $data = $request->validate($rules);

        foreach ($data as $key => $value) {
            if ($value === '' || $value === null) {
                continue;
            }
            // Do not overwrite secrets with masked placeholder (e.g. sk_l••••••••abcd)
            if (in_array($key, self::ENCRYPTED_KEYS, true) && str_contains((string) $value, '••••••••')) {
                continue;
            }
            if (in_array($key, self::ENCRYPTED_KEYS, true)) {
                Setting::set($key, $value, true, $group);
            } else {
                $store = $value;
                if (in_array($key, ['stripe_enabled', 'ai_enabled'], true)) {
                    $store = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0';
                }
                Setting::set($key, $store, false, $group);
            }
        }

        return response()->json(['message' => 'Settings saved.', 'data' => Setting::getGroup($group, true)]);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|image|mimes:png,jpg,jpeg,svg|max:2048']);
        $path = $request->file('file')->store('settings', 'public');
        Setting::set('site_logo', Storage::url($path), false, 'general');
        return response()->json(['url' => Storage::url($path), 'message' => 'Site logo uploaded.']);
    }

    public function uploadHeaderLogo(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|image|mimes:png,jpg,jpeg,svg|max:2048']);
        $path = $request->file('file')->store('settings', 'public');
        Setting::set('header_logo', Storage::url($path), false, 'general');
        return response()->json(['url' => Storage::url($path), 'message' => 'Header logo uploaded.']);
    }

    public function uploadFooterLogo(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|image|mimes:png,jpg,jpeg,svg|max:2048']);
        $path = $request->file('file')->store('settings', 'public');
        Setting::set('footer_logo', Storage::url($path), false, 'general');
        return response()->json(['url' => Storage::url($path), 'message' => 'Footer logo uploaded.']);
    }

    public function uploadFavicon(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:ico,png|max:512']);
        $path = $request->file('file')->store('settings', 'public');
        Setting::set('site_favicon', Storage::url($path), false, 'general');
        return response()->json(['url' => Storage::url($path), 'message' => 'Favicon uploaded.']);
    }
}
