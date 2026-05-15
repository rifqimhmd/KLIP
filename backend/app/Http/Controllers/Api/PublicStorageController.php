<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Serves files from storage/app/public when the web server blocks direct /storage/* URLs (403).
 */
class PublicStorageController extends Controller
{
    public function show(string $path): BinaryFileResponse
    {
        $path = str_replace('\\', '/', $path);
        if ($path === '' || str_contains($path, '..')) {
            abort(404);
        }

        $root = storage_path('app/public');
        $full = $root.DIRECTORY_SEPARATOR.$path;

        $rootReal = realpath($root);
        $fileReal = realpath($full);
        if ($rootReal === false || $fileReal === false || ! str_starts_with($fileReal, $rootReal)) {
            abort(404);
        }

        if (! is_file($fileReal)) {
            abort(404);
        }

        return response()->file($fileReal, [
            'Content-Type' => File::mimeType($fileReal) ?: 'application/octet-stream',
        ]);
    }
}
