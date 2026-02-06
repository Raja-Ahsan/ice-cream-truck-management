<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileAdminController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->makeHidden(['password']);
        return response()->json(['data' => $user]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'current_password' => ['nullable', 'required_with:password', 'current_password'],
            'password' => ['nullable', 'min:8', 'confirmed'],
        ]);
        unset($validated['current_password'], $validated['password_confirmation']);
        if (! empty($request->password)) {
            $validated['password'] = Hash::make($request->password);
        } else {
            unset($validated['password']);
        }
        $user->update($validated);
        $user->makeHidden(['password']);
        return response()->json(['message' => 'Profile updated.', 'data' => $user]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:2048'],
        ]);
        $user = $request->user();
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
        $path = $request->file('avatar')->store('profiles', 'public');
        $user->update(['avatar' => $path]);
        $user->makeHidden(['password']);
        return response()->json(['message' => 'Profile picture updated.', 'data' => $user]);
    }

    public function removeAvatar(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }
        $user->makeHidden(['password']);
        return response()->json(['message' => 'Profile picture removed.', 'data' => $user]);
    }
}
