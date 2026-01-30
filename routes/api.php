<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ----- Public (no auth) -----
Route::prefix('v1')->group(function () {
    Route::get('cms/pages', [\App\Http\Controllers\Api\CmsController::class, 'pages']);
    Route::get('cms/pages/{slug}', [\App\Http\Controllers\Api\CmsController::class, 'pageBySlug']);
    Route::get('packages', [\App\Http\Controllers\Api\PackageController::class, 'index']);
    Route::get('add-ons', [\App\Http\Controllers\Api\AddOnController::class, 'index']);
    Route::post('service-area/check', [\App\Http\Controllers\Api\ServiceAreaController::class, 'check']);
    Route::post('bookings', [\App\Http\Controllers\Api\BookingController::class, 'store']);
    Route::get('bookings/{uuid}', [\App\Http\Controllers\Api\BookingController::class, 'showByUuid']);
    Route::post('bookings/{uuid}/payment-intent', [\App\Http\Controllers\Api\BookingController::class, 'createPaymentIntent']);
    Route::post('faq/chat', [\App\Http\Controllers\Api\FaqChatController::class, 'chat']);
    Route::post('stripe/webhook', [\App\Http\Controllers\Api\StripeWebhookController::class, 'handle'])->name('stripe.webhook');
});

// ----- Auth: Login (returns token) -----
Route::prefix('v1')->group(function () {
    Route::post('login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
});

// ----- Protected: Admin -----
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('bookings', [\App\Http\Controllers\Api\Admin\BookingAdminController::class, 'index']);
    Route::get('bookings/{booking}', [\App\Http\Controllers\Api\Admin\BookingAdminController::class, 'show']);
    Route::put('bookings/{booking}/assign', [\App\Http\Controllers\Api\Admin\BookingAdminController::class, 'assign']);
    Route::put('bookings/{booking}/inventory-snapshot', [\App\Http\Controllers\Api\Admin\BookingAdminController::class, 'setInventorySnapshot']);
    Route::put('bookings/{booking}/dispatch', [\App\Http\Controllers\Api\Admin\BookingAdminController::class, 'dispatch']);
    Route::get('trucks', [\App\Http\Controllers\Api\Admin\TruckAdminController::class, 'index']);
    Route::get('drivers', [\App\Http\Controllers\Api\Admin\DriverAdminController::class, 'index']);
    Route::get('live/locations', [\App\Http\Controllers\Api\Admin\LiveMapController::class, 'locations']);
    Route::apiResource('cms-pages', \App\Http\Controllers\Api\Admin\CmsPageAdminController::class);
    Route::apiResource('faqs', \App\Http\Controllers\Api\Admin\FaqAdminController::class);
    Route::apiResource('service-areas', \App\Http\Controllers\Api\Admin\ServiceAreaAdminController::class);
    Route::apiResource('packages', \App\Http\Controllers\Api\Admin\PackageAdminController::class);
    Route::apiResource('add-ons', \App\Http\Controllers\Api\Admin\AddOnAdminController::class);
    Route::apiResource('trucks', \App\Http\Controllers\Api\Admin\TruckAdminController::class)->except(['index']);
    Route::apiResource('inventory-products', \App\Http\Controllers\Api\Admin\InventoryProductAdminController::class);
    Route::get('reports/bookings', [\App\Http\Controllers\Api\Admin\ReportController::class, 'bookings']);
    Route::get('reports/revenue', [\App\Http\Controllers\Api\Admin\ReportController::class, 'revenue']);
    Route::get('reports/export', [\App\Http\Controllers\Api\Admin\ReportController::class, 'export']);
    Route::get('settings', [\App\Http\Controllers\Api\Admin\SettingsAdminController::class, 'index']);
    Route::put('settings', [\App\Http\Controllers\Api\Admin\SettingsAdminController::class, 'update']);
    Route::post('settings/upload-logo', [\App\Http\Controllers\Api\Admin\SettingsAdminController::class, 'uploadLogo']);
    Route::post('settings/upload-favicon', [\App\Http\Controllers\Api\Admin\SettingsAdminController::class, 'uploadFavicon']);
});

// ----- Protected: Driver -----
Route::prefix('v1/driver')->middleware(['auth:sanctum', 'role:driver'])->group(function () {
    Route::get('bookings', [\App\Http\Controllers\Api\Driver\DriverBookingController::class, 'index']);
    Route::get('bookings/{booking}', [\App\Http\Controllers\Api\Driver\DriverBookingController::class, 'show']);
    Route::post('bookings/{booking}/start-route', [\App\Http\Controllers\Api\Driver\DriverBookingController::class, 'startRoute']);
    Route::post('bookings/{booking}/arrive', [\App\Http\Controllers\Api\Driver\DriverBookingController::class, 'arrive']);
    Route::post('bookings/{booking}/complete', [\App\Http\Controllers\Api\Driver\DriverBookingController::class, 'complete']);
    Route::post('location', [\App\Http\Controllers\Api\Driver\DriverLocationController::class, 'store']);
});
