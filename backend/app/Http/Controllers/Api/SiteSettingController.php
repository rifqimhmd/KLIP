<?php

namespace App\Http\Controllers\Api;

use App\Models\SiteSetting;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteSettingController extends Controller
{
    private const ALLOWED_KEYS = ['konsultasi_image', 'produk_image', 'produk_image_1', 'produk_image_2', 'produk_image_3', 'produk_image_4', 'login_logo_kemenkumham', 'login_logo_ditjen', 'home_logo'];

    private function isAdmin($user): bool
    {
        if (!$user) {
            return false;
        }
        
        $statusPengguna = strtolower((string) ($user->status_pengguna ?? ''));
        $daftarSebagai = strtolower((string) ($user->daftar_sebagai ?? ''));
        
        return $statusPengguna === 'admin' || $daftarSebagai === 'admin';
    }

    public function index()
    {
        $result = [];
        foreach (self::ALLOWED_KEYS as $key) {
            $value = SiteSetting::getValue($key);
            if ($value) {
                // Use asset() for consistent URL generation
                $result[$key] = asset($value);
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

    public function updateSurveyImages(Request $request)
    {
        try {
            $request->validate([
                'survey_image_1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'survey_image_2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'survey_image_3' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'survey_image_4' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $updatedImages = [];

            for ($i = 1; $i <= 4; $i++) {
                $key = "survey_image_{$i}";
                
                if ($request->hasFile($key)) {
                    $image = $request->file($key);
                    $imageName = time() . "_survey_{$i}." . $image->getClientOriginalExtension();
                    
                    // Hapus gambar lama jika ada
                    $oldSetting = SiteSetting::where('key', $key)->first();
                    if ($oldSetting && $oldSetting->value) {
                        $oldImagePath = public_path($oldSetting->value);
                        if (file_exists($oldImagePath)) {
                            unlink($oldImagePath);
                        }
                    }

                    // Simpan gambar baru
                    $image->move(public_path('images'), $imageName);

                    // Simpan ke database
                    SiteSetting::updateOrCreate(
                        ['key' => $key],
                        ['value' => 'images/' . $imageName]
                    );

                    $updatedImages[$key] = [
                        'url' => 'images/' . $imageName,
                        'full_url' => asset('images/' . $imageName)
                    ];
                }
            }

            return response()->json([
                'message' => 'Survey images updated successfully',
                'updated_images' => $updatedImages
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating survey images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateProdukImages(Request $request)
    {
        try {
            // Log incoming request for debugging
            \Log::info('Produk images upload request', [
                'has_files' => $request->allFiles(),
                'user_id' => $request->user()?->id,
                'content_type' => $request->header('Content-Type')
            ]);

            $request->validate([
                'produk_image_1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'produk_image_2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'produk_image_3' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'produk_image_4' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $updatedImages = [];

            // Ensure images directory exists
            $imagesPath = public_path('images');
            if (!file_exists($imagesPath)) {
                mkdir($imagesPath, 0755, true);
                \Log::info('Created images directory', ['path' => $imagesPath]);
            }

            for ($i = 1; $i <= 4; $i++) {
                $key = "produk_image_{$i}";
                
                if ($request->hasFile($key)) {
                    $image = $request->file($key);
                    
                    \Log::info('Processing image', [
                        'key' => $key,
                        'original_name' => $image->getClientOriginalName(),
                        'size' => $image->getSize(),
                        'mime_type' => $image->getMimeType()
                    ]);
                    
                    $imageName = time() . "_produk_{$i}." . $image->getClientOriginalExtension();
                    
                    // Hapus gambar lama jika ada
                    $oldSetting = SiteSetting::where('key', $key)->first();
                    if ($oldSetting && $oldSetting->value) {
                        $oldImagePath = public_path($oldSetting->value);
                        if (file_exists($oldImagePath)) {
                            unlink($oldImagePath);
                            \Log::info('Deleted old image', ['path' => $oldImagePath]);
                        }
                    }

                    // Simpan gambar baru
                    $image->move($imagesPath, $imageName);
                    \Log::info('Saved new image', ['path' => $imagesPath . '/' . $imageName]);

                    // Simpan ke database
                    SiteSetting::updateOrCreate(
                        ['key' => $key],
                        ['value' => 'images/' . $imageName]
                    );

                    $updatedImages[$key] = [
                        'url' => 'images/' . $imageName,
                        'full_url' => asset('images/' . $imageName)
                    ];
                    
                    \Log::info('Updated image record', ['key' => $key, 'url' => 'images/' . $imageName]);
                }
            }

            \Log::info('Produk images update completed', ['updated_count' => count($updatedImages)]);

            return response()->json([
                'message' => 'Produk images updated successfully',
                'updated_images' => $updatedImages
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed for produk images', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating produk images', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error updating produk images: ' . $e->getMessage()
            ], 500);
        }
    }

    /** POST /api/admin/logos — admin, upload logo images for login and home */
    public function updateLogos(Request $request)
    {
        try {
            if (!$this->isAdmin($request->user())) {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            $request->validate([
                'login_logo_kemenkumham' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'login_logo_ditjen' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'home_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            $updatedLogos = [];
            $logoKeys = ['login_logo_kemenkumham', 'login_logo_ditjen', 'home_logo'];

            // Ensure images directory exists
            $imagesPath = public_path('images');
            if (!file_exists($imagesPath)) {
                mkdir($imagesPath, 0755, true);
                \Log::info('Created images directory', ['path' => $imagesPath]);
            }

            foreach ($logoKeys as $key) {
                if ($request->hasFile($key)) {
                    $image = $request->file($key);
                    
                    \Log::info('Processing logo', [
                        'key' => $key,
                        'original_name' => $image->getClientOriginalName(),
                        'size' => $image->getSize(),
                        'mime_type' => $image->getMimeType()
                    ]);
                    
                    $imageName = time() . "_{$key}." . $image->getClientOriginalExtension();
                    
                    // Hapus gambar lama jika ada
                    $oldSetting = SiteSetting::where('key', $key)->first();
                    if ($oldSetting && $oldSetting->value) {
                        $oldImagePath = public_path($oldSetting->value);
                        if (file_exists($oldImagePath)) {
                            unlink($oldImagePath);
                            \Log::info('Deleted old logo', ['path' => $oldImagePath]);
                        }
                    }

                    // Simpan gambar baru
                    $image->move($imagesPath, $imageName);
                    \Log::info('Saved new logo', ['path' => $imagesPath . '/' . $imageName]);

                    // Simpan ke database
                    SiteSetting::updateOrCreate(
                        ['key' => $key],
                        ['value' => 'images/' . $imageName]
                    );

                    $updatedLogos[$key] = [
                        'url' => 'images/' . $imageName,
                        'full_url' => asset('images/' . $imageName)
                    ];
                    
                    \Log::info('Updated logo record', ['key' => $key, 'url' => 'images/' . $imageName]);
                }
            }

            \Log::info('Logos update completed', ['updated_count' => count($updatedLogos)]);

            return response()->json([
                'message' => 'Logo berhasil diperbarui.',
                'updated_logos' => $updatedLogos
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed for logos', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating logos', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error updating logos: ' . $e->getMessage()
            ], 500);
        }
    }
}
