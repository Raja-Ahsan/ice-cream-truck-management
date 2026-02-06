<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

/**
 * FAQ Chatbot: uses OpenAI when API key is set; otherwise keyword matching from FAQ knowledge base.
 */
class FaqChatController extends Controller
{
    private const FALLBACK_ANSWER = 'Sorry, I could not find an answer to that in our FAQs. Please contact us for help.';

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        $question = trim($request->input('question'));
        $faqs = Faq::where('is_active', true)->orderBy('sort_order')->get();

        // Try OpenAI first when API key is set and AI is enabled
        $apiKey = Setting::get('openai_api_key', '');
        $aiEnabled = Setting::get('ai_enabled');
        if ($apiKey !== '' && $aiEnabled !== '0' && $aiEnabled !== false) {
            $answer = $this->askOpenAi($question, $faqs, $apiKey);
            if ($answer !== null) {
                return response()->json([
                    'answer' => $answer,
                    'source' => 'ai',
                ]);
            }
        }

        // Fallback: keyword matching
        $bestMatch = $this->keywordMatch($question, $faqs);
        if ($bestMatch) {
            return response()->json([
                'answer' => $bestMatch->answer,
                'source' => 'faq',
                'faq_id' => $bestMatch->id,
            ]);
        }

        return response()->json([
            'answer' => self::FALLBACK_ANSWER,
            'source' => 'fallback',
        ]);
    }

    private function askOpenAi(string $question, $faqs, string $apiKey): ?string
    {
        $context = $faqs->isEmpty()
            ? 'No FAQs are available.'
            : $faqs->map(fn ($f) => "Q: {$f->question}\nA: {$f->answer}")->implode("\n\n");

        $model = Setting::get('ai_model', 'gpt-3.5-turbo');
        $maxTokens = (int) Setting::get('ai_max_tokens', 256);
        $temperature = (float) (Setting::get('ai_temperature') ?? 0.3);

        $systemMessage = 'You are a helpful FAQ assistant for an ice cream truck booking business. Answer ONLY based on the FAQs below. If the question cannot be answered from the FAQs, reply with exactly: ' . self::FALLBACK_ANSWER . ' Keep answers concise and friendly.';

        $response = Http::withToken($apiKey)
            ->timeout(15)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemMessage . "\n\nFAQs:\n\n" . $context],
                    ['role' => 'user', 'content' => $question],
                ],
                'max_tokens' => max(50, min(1024, $maxTokens)),
                'temperature' => max(0, min(2, $temperature)),
            ]);

        if (! $response->successful()) {
            return null;
        }

        $data = $response->json();
        $content = $data['choices'][0]['message']['content'] ?? null;
        if ($content === null || $content === '') {
            return null;
        }

        return trim($content);
    }

    private function keywordMatch(string $question, $faqs)
    {
        $bestMatch = null;
        $bestScore = 0;
        $questionLower = mb_strtolower($question);
        $questionWords = array_filter(preg_split('/\s+/', $questionLower), fn ($w) => strlen($w) > 2);

        foreach ($faqs as $faq) {
            $q = mb_strtolower($faq->question);
            $a = mb_strtolower($faq->answer);
            $combined = $q . ' ' . $a;
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

        return $bestMatch;
    }
}
