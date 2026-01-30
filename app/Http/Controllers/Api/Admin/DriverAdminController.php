<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DriverAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $drivers = User::where('role', User::ROLE_DRIVER)->orderBy('name')->get(['id', 'name', 'email', 'phone']);
        return response()->json(['data' => $drivers]);
    }
}
