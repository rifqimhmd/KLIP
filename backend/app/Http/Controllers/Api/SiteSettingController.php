<?php

namespace App\Http\Controllers\Api;

use App\Models\SiteSetting;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteSettingController extends Controller
{
    private const ALLOWED_KEYS = ['konsultasi_image', 'produk_image'];

    private function isAdmin($user): bool
    {
        return $user && (
            ($user->status_pengguna ?? '') === 'Admin' ||
            strtolower((string) ($user->daftar_sebagai ?? '')) === 'admin'
        );
    }

    /** GET /api/site-settings — public */
    public function index()
    {
        $result = [];
        foreach (self::ALLOWED_KEYS as $key) {
            $value = SiteSetting::getValue($key);
            if ($value) {
                $result[$key] = preg_match('/^https?:\/\//', $value)
                    ? $value
                    : Storage::disk('public')->url($value);
            } else {
                $result[$key] = null;
            }
        }
        return response()->json($result);
    }

    /** POST /api/admin/site-settings/{key} — admin, upload image */
    public function update(Request $request, string $key)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if (!in_array($key, self::ALLOWED_KEYS, true)) {
            return response()->json(['error' => 'Key tidak valid.'], 400);
        }

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $setting = SiteSetting::firstOrCreate(['key' => $key]);

        // Delete old image if it's a stored path
        if ($setting->value && !preg_match('/^https?:\/\//', $setting->value)) {
            if (Storage::disk('public')->exists($setting->value)) {
                Storage::disk('public')->delete($setting->value);
            }
        }

        $setting->value = $request->file('image')->store('site', 'public');
        $setting->save();

        return response()->json([
            'message' => 'Gambar berhasil diperbarui.',
            'data' => [
                'key' => $key,
                'url' => Storage::disk('public')->url($setting->value),
            ],
        ]);
    }
}
