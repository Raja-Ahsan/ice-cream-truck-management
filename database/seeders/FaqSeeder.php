<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            ['question' => 'How far in advance should I book?', 'answer' => 'We recommend booking at least 2 weeks in advance for weekend events.', 'sort_order' => 1, 'is_active' => true],
            ['question' => 'What areas do you serve?', 'answer' => 'Enter your ZIP code on our website to check if we serve your area.', 'sort_order' => 2, 'is_active' => true],
            ['question' => 'What payment methods do you accept?', 'answer' => 'We accept all major credit cards securely through our booking system.', 'sort_order' => 3, 'is_active' => true],
            ['question' => 'Can I cancel or reschedule?', 'answer' => 'Yes. Contact us at least 48 hours before the event for rescheduling. Cancellation policy applies.', 'sort_order' => 4, 'is_active' => true],
        ];
        foreach ($faqs as $i => $faq) {
            Faq::updateOrCreate(
                ['question' => $faq['question']],
                array_merge($faq, ['sort_order' => $i + 1])
            );
        }
    }
}
