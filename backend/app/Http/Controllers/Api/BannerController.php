<?php

namespace App\Http\Controllers\Api;

use App\Models\Banner;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    private function isAdmin($user): bool
    {
        return $user && (
            ($user->status_pengguna ?? '') === 'Admin' ||
            strtolower((string) ($user->daftar_sebagai ?? '')) === 'admin'
        );
    }

    /** GET /api/banners — public, returns only active banners */
    public function index()
    {
        $banners = Banner::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(fn($b) => [
                'id'        => $b->id,
                'title'     => $b->title,
                'subtitle'  => $b->subtitle,
                'image_url' => $b->image_url,
                'order'     => $b->order,
            ]);

        return response()->json($banners);
    }

    /** GET /api/admin/banners — admin, returns all banners */
    public function adminIndex(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $banners = Banner::orderBy('order')
            ->get()
            ->map(fn($b) => array_merge($b->toArray(), ['image_url' => $b->image_url]));

        return response()->json($banners);
    }

    /** POST /api/admin/banners — create a new banner with image upload */
    public function store(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'image'    => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'title'    => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'order'    => 'nullable|integer|min:0',
            'is_active' => 'nullable',
        ]);

        $path = $request->file('image')->store('banners', 'public');
        $maxOrder = Banner::max('order') ?? -1;

        $banner = Banner::create([
            'title'     => $request->title,
            'subtitle'  => $request->subtitle,
            'image_path' => $path,
            'order'     => $request->filled('order') ? (int) $request->order : $maxOrder + 1,
            'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN),
        ]);

        return response()->json([
            'message' => 'Banner berhasil ditambahkan.',
            'data'    => array_merge($banner->toArray(), ['image_url' => $banner->image_url]),
        ], 201);
    }

    /** POST /api/admin/banners/{id} — update banner (image optional) */
    public function update(Request $request, $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $banner = Banner::findOrFail($id);

        $request->validate([
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'title'    => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'order'    => 'nullable|integer|min:0',
            'is_active' => 'nullable',
        ]);

        if ($request->hasFile('image')) {
            if (Storage::disk('public')->exists($banner->image_path)) {
                Storage::disk('public')->delete($banner->image_path);
            }
            $banner->image_path = $request->file('image')->store('banners', 'public');
        }

        if ($request->has('title'))    $banner->title    = $request->title;
        if ($request->has('subtitle')) $banner->subtitle = $request->subtitle;
        if ($request->has('order'))    $banner->order    = (int) $request->order;
        if ($request->has('is_active')) {
            $banner->is_active = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $banner->save();

        return response()->json([
            'message' => 'Banner berhasil diperbarui.',
            'data'    => array_merge($banner->fresh()->toArray(), ['image_url' => $banner->fresh()->image_url]),
        ]);
    }

    /** DELETE /api/admin/banners/{id} */
    public function destroy(Request $request, $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $banner = Banner::findOrFail($id);

        if (Storage::disk('public')->exists($banner->image_path)) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        return response()->json(['message' => 'Banner berhasil dihapus.']);
    }
}
