<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['key' => 'site_name', 'value' => 'Ice Cream Truck', 'group' => 'general'],
            ['key' => 'site_email', 'value' => 'hello@icecreamtruck.com', 'group' => 'general'],
            ['key' => 'site_phone', 'value' => '1-800-ICE-CREAM', 'group' => 'general'],
            ['key' => 'business_address', 'value' => '123 Sweet Street, Dessert City', 'group' => 'general'],
            ['key' => 'facebook_url', 'value' => 'https://facebook.com/icecreamtruck', 'group' => 'social'],
            ['key' => 'instagram_url', 'value' => 'https://instagram.com/icecreamtruck', 'group' => 'social'],
            ['key' => 'twitter_url', 'value' => 'https://twitter.com/icecreamtruck', 'group' => 'social'],
            ['key' => 'stripe_public_key', 'value' => 'pk_test_dummy', 'group' => 'stripe'],
            ['key' => 'stripe_webhook_secret', 'value' => 'whsec_dummy', 'group' => 'stripe', 'is_encrypted' => true],
            ['key' => 'google_maps_api_key', 'value' => '', 'group' => 'google'],
            ['key' => 'openai_api_key', 'value' => '', 'group' => 'ai', 'is_encrypted' => true],
            ['key' => 'meta_title_default', 'value' => 'Ice Cream Truck | Book Your Event', 'group' => 'seo'],
            ['key' => 'meta_description_default', 'value' => 'Book an ice cream truck for parties and events.', 'group' => 'seo'],
        ];

        foreach ($items as $item) {
            $encrypt = $item['is_encrypted'] ?? false;
            unset($item['is_encrypted']);
            Setting::updateOrCreate(
                ['key' => $item['key']],
                array_merge($item, ['is_encrypted' => $encrypt])
            );
        }
    }
}
