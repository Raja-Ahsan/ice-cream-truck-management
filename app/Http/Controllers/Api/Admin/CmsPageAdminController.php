<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsPageAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $pages = CmsPage::orderBy('sort_order')->get();

        return response()->json(['data' => $pages]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug' => 'required|string|max:255|unique:cms_pages,slug',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'published_at' => 'nullable|date',
            'sort_order' => 'integer',
        ]);

        $page = CmsPage::create($validated);

        return response()->json(['data' => $page], 201);
    }

    public function show(CmsPage $cms_page): JsonResponse
    {
        return response()->json(['data' => $cms_page]);
    }

    public function update(Request $request, CmsPage $cms_page): JsonResponse
    {
        $validated = $request->validate([
            'slug' => 'sometimes|string|max:255|unique:cms_pages,slug,'.$cms_page->id,
            'title' => 'sometimes|string|max:255',
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'published_at' => 'nullable|date',
            'sort_order' => 'integer',
        ]);
        $cms_page->update($validated);
        return response()->json(['data' => $cms_page->fresh()]);
    }

    public function destroy(CmsPage $cms_page): JsonResponse
    {
        $cms_page->delete();
        return response()->json(['message' => 'Page deleted.']);
    }
}
