<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $faqs = Faq::orderBy('sort_order')->get();
        return response()->json(['data' => $faqs]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string|max:2000',
            'answer' => 'required|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $faq = Faq::create($validated);
        return response()->json(['data' => $faq], 201);
    }

    public function show(Faq $faq): JsonResponse
    {
        return response()->json(['data' => $faq]);
    }

    public function update(Request $request, Faq $faq): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'sometimes|string|max:2000',
            'answer' => 'sometimes|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $faq->update($validated);
        return response()->json(['data' => $faq->fresh()]);
    }

    public function destroy(Faq $faq): JsonResponse
    {
        $faq->delete();
        return response()->json(['message' => 'FAQ deleted.']);
    }
}
