<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    public function pages(Request $request): JsonResponse
    {
        $pages = CmsPage::whereNotNull('published_at')
            ->orderBy('sort_order')
            ->get(['id', 'slug', 'title', 'meta_title', 'meta_description', 'published_at']);

        return response()->json(['data' => $pages]);
    }

    public function pageBySlug(string $slug): JsonResponse
    {
        $page = CmsPage::where('slug', $slug)->whereNotNull('published_at')->firstOrFail();

        return response()->json(['data' => $page]);
    }
}
