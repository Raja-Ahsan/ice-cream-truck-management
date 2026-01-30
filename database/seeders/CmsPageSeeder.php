<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use Illuminate\Database\Seeder;

class CmsPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'home',
                'title' => 'Welcome',
                'content' => '<p>Book our ice cream truck for your next event!</p>',
                'meta_title' => 'Ice Cream Truck | Book Now',
                'meta_description' => 'Book an ice cream truck for parties and events.',
                'published_at' => now(),
                'sort_order' => 1,
            ],
            [
                'slug' => 'pricing',
                'title' => 'Pricing',
                'content' => '<p>Transparent pricing for all packages.</p>',
                'meta_title' => 'Pricing',
                'meta_description' => 'Ice cream truck pricing and packages.',
                'published_at' => now(),
                'sort_order' => 2,
            ],
            [
                'slug' => 'faqs',
                'title' => 'FAQs',
                'content' => '<p>Frequently asked questions.</p>',
                'meta_title' => 'FAQs',
                'meta_description' => 'Common questions about our service.',
                'published_at' => now(),
                'sort_order' => 3,
            ],
        ];
        foreach ($pages as $page) {
            CmsPage::updateOrCreate(['slug' => $page['slug']], $page);
        }
    }
}
