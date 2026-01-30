<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * FAQ Chatbot: responds only from FAQ knowledge base (no hallucinations).
 */
class FaqChatController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        $question = $request->input('question');
        $faqs = Faq::where('is_active', true)->orderBy('sort_order')->get();

        $bestMatch = null;
        $bestScore = 0;
        $questionLower = mb_strtolower($question);
        $questionWords = array_filter(preg_split('/\s+/', $questionLower), fn ($w) => strlen($w) > 2);

        foreach ($faqs as $faq) {
            $q = mb_strtolower($faq->question);
            $a = mb_strtolower($faq->answer);
            $combined = $q.' '.$a;
            $score = 0;
            foreach ($questionWords as $word) {
                if (str_contains($combined, $word)) {
                    $score++;
                }
            }
            if ($score > $bestScore && $score >= 1) {
                $bestScore = $score;
                $bestMatch = $faq;
            }
        }

        if ($bestMatch) {
            return response()->json([
                'answer' => $bestMatch->answer,
                'source' => 'faq',
                'faq_id' => $bestMatch->id,
            ]);
        }

        return response()->json([
            'answer' => 'Sorry, I could not find an answer to that in our FAQs. Please contact us for help.',
            'source' => 'fallback',
        ]);
    }
}
