<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class KasubditController extends Controller
{
    private function isAdmin($user): bool
    {
        if (!$user) {
            return false;
        }

        return ($user->status_pengguna ?? null) === 'Admin'
            || strtolower((string) ($user->daftar_sebagai ?? '')) === 'admin';
    }

    public function getInfo()
    {
        $baseUrl = config('app.url');
        
        // Data Direktur dan Subdirektorat Kepatuhan Internal
        $persons = [
            [
                'id' => 1,
                'name' => 'LILIK SUJANDI, Bc.IP., S.IP., M.Si',
                'position' => 'Direktur Kepatuhan Internal',
                'photo' => $baseUrl . '/storage/kasubdit/direktur-kepatuhan-internal.jpg',
                'description' => 'Direktur Kepatuhan Internal yang bertanggung jawab atas pengawasan, pengendalian, dan peningkatan kepatuhan internal di lingkungan Direktorat Jenderal Pemasyarakatan.',
                'expertise' => [
                    'Kepatuhan Internal',
                    'Pengawasan dan Pengendalian',
                    'Manajemen Risiko',
                    'Good Governance'
                ]
            ],
            [
                'id' => 2,
                'name' => 'ERIES SUGIANTO, A.Md.IP., S.H., M.Si.',
                'position' => 'Subdirektorat Pencegahan dan Pengendalian',
                'photo' => $baseUrl . '/storage/kasubdit/subdit-pencegahan-pengendalian.jpg',
                'description' => 'Subdirektorat Pencegahan dan Pengendalian yang bertanggung jawab atas program pencegahan pelanggaran dan pengendalian gratifikasi.',
                'expertise' => [
                    'Pencegahan Korupsi',
                    'Pengendalian Gratifikasi',
                    'Sistem Pengendalian Internal',
                    'Reformasi Birokrasi'
                ]
            ],
            [
                'id' => 3,
                'name' => 'RIKO PURNAMA CANDRA, A.Md.IP., S.H',
                'position' => 'Subdirektorat Fasilitasi Advokasi dan Investigasi Internal',
                'photo' => $baseUrl . '/storage/kasubdit/subdit-advokasi-investigasi.jpg',
                'description' => 'Subdirektorat Fasilitasi Advokasi dan Investigasi Internal yang menangani advokasi hukum dan investigasi internal.',
                'expertise' => [
                    'Advokasi Hukum',
                    'Investigasi Internal',
                    'Penanganan Pelanggaran',
                    'Mediasi dan Advokasi'
                ]
            ],
            [
                'id' => 4,
                'name' => 'ERWAN PRASETYO, A.Md.IP., S.H., M.H.',
                'position' => 'Ketua Kelompok Kerja Edukasi Pencegahan Korupsi dan Pengendalian Gratifikasi',
                'photo' => $baseUrl . '/storage/kasubdit/ketua-edukasi-pencegahan.jpg',
                'description' => 'Ketua Kelompok Kerja Edukasi Pencegahan Korupsi dan Pengendalian Gratifikasi yang mengembangkan program edukasi anti korupsi.',
                'expertise' => [
                    'Edukasi Anti Korupsi',
                    'Socialisasi Gratifikasi',
                    'Pembinaan Kepatuhan',
                    'Capacity Building'
                ]
            ],
            [
                'id' => 5,
                'name' => 'IDAM WAHJU KUNTJORO, A.Md.IP, SH, MH',
                'position' => 'Ketua Kelompok Kerja Pemantauan Kinerja dan Zona Integritas',
                'photo' => $baseUrl . '/storage/kasubdit/ketua-pemantauan-kinerja.jpg',
                'description' => 'Ketua Kelompok Kerja Pemantauan Kinerja dan Zona Integritas yang memantau kinerja dan mengembangkan zona integritas.',
                'expertise' => [
                    'Pemantauan Kinerja',
                    'Zona Integritas',
                    'Peningkatan Akuntabilitas',
                    'Evaluasi Kinerja'
                ]
            ]
        ];

        return response()->json([
            'persons' => $persons,
            'count' => count($persons)
        ]);
    }

    /**
     * Upload photo for kasubdit (Admin only)
     */
    public function uploadPhoto(Request $request, $id)
    {
        $user = $request->user();
        
        // Debug logging
        Log::info('Kasubdit uploadPhoto called', [
            'user_id' => $user?->id,
            'user_status' => $user?->status_pengguna ?? 'null',
            'user_daftar_sebagai' => $user?->daftar_sebagai ?? 'null',
            'person_id' => $id,
            'has_file' => $request->hasFile('photo'),
            'all_files' => $request->allFiles(),
        ]);
        
        // Check if user is admin
        if (!$this->isAdmin($user)) {
            Log::warning('Kasubdit uploadPhoto: User is not admin', [
                'user_id' => $user?->id,
                'status_pengguna' => $user?->status_pengguna,
            ]);
            return response()->json(['error' => 'Only admin can upload photos'], 403);
        }

        if (!$request->hasFile('photo')) {
            Log::warning('Kasubdit uploadPhoto: No photo file uploaded');
            return response()->json(['error' => 'No photo file uploaded'], 400);
        }

        try {
            $request->validate([
                'photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Kasubdit uploadPhoto: Validation failed', [
                'errors' => $e->errors(),
            ]);
            return response()->json(['error' => 'Invalid file: ' . implode(', ', $e->errors()['photo'] ?? [])], 422);
        }

        // Map ID to filename
        $filenames = [
            1 => 'direktur-kepatuhan-internal.jpg',
            2 => 'subdit-pencegahan-pengendalian.jpg',
            3 => 'subdit-advokasi-investigasi.jpg',
            4 => 'ketua-edukasi-pencegahan.jpg',
            5 => 'ketua-pemantauan-kinerja.jpg'
        ];

        if (!isset($filenames[$id])) {
            return response()->json(['error' => 'Invalid person ID'], 404);
        }

        $filename = $filenames[$id];

        // Store the file
        $path = $request->file('photo')->storeAs('kasubdit', $filename, 'public');
        $photoUrl = Storage::disk('public')->url($path);
        
        // Buat URL lengkap dengan base URL
        $fullPhotoUrl = config('app.url') . $photoUrl;

        return response()->json([
            'message' => 'Photo uploaded successfully',
            'photo_url' => $fullPhotoUrl,
            'id' => $id
        ]);
    }
}