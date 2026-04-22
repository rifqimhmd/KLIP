<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use App\Models\PengaduanFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PengaduanController extends Controller
{
    /**
     * Store a newly created pengaduan.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kategori' => 'required|in:penyalahgunaan_wewenang,pelanggaran_kode_etik,pungutan_liar,disiplin_pegawai,lainnya',
            'lokasi' => 'required|string',
            'tanggal_kejadian' => 'required|date',
            'jam_kejadian' => 'nullable',
            'nama_terlapor' => 'nullable|string',
            'jabatan_terlapor' => 'nullable|string',
            'deskripsi_kejadian' => 'required|string',
            'tempat_kejadian' => 'required|string',
            'alasan_pelanggaran' => 'nullable|string',
            'saksi' => 'nullable|string',
            'anonim' => 'nullable|in:0,1,true,false',
            'pernyataan_kebenaran' => 'required|in:0,1,true,false',
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        // Create pengaduan
        $pengaduan = Pengaduan::create([
            'user_id' => $request->user()->id,
            'kategori' => $request->kategori,
            'lokasi' => $request->lokasi,
            'tanggal_kejadian' => $request->tanggal_kejadian,
            'jam_kejadian' => $request->jam_kejadian,
            'nama_terlapor' => $request->nama_terlapor,
            'jabatan_terlapor' => $request->jabatan_terlapor,
            'deskripsi_kejadian' => $request->deskripsi_kejadian,
            'tempat_kejadian' => $request->tempat_kejadian,
            'alasan_pelanggaran' => $request->alasan_pelanggaran,
            'saksi' => $request->saksi,
            'anonim' => $request->boolean('anonim'),
            'pernyataan_kebenaran' => $request->boolean('pernyataan_kebenaran'),
            'status' => 'pending',
        ]);

        // Handle file uploads
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('pengaduan_files', 'public');
                
                PengaduanFile::create([
                    'pengaduan_id' => $pengaduan->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengaduan berhasil dikirim',
            'data' => $pengaduan->load('files'),
        ], 201);
    }

    /**
     * Get user's pengaduan history.
     */
    public function index(Request $request)
    {
        $pengaduans = Pengaduan::where('user_id', $request->user()->id)
            ->with('files')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pengaduans,
        ]);
    }

    /**
     * Get single pengaduan detail.
     */
    public function show(Request $request, $id)
    {
        $pengaduan = Pengaduan::where('user_id', $request->user()->id)
            ->with('files')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $pengaduan,
        ]);
    }

    /**
     * Admin: Get all pengaduans.
     */
    public function adminIndex(Request $request)
    {
        $user = $request->user();
        $authHeader = $request->header('Authorization');
        
        // DEBUG
        \Log::info('AdminPengaduan - Auth Header: ' . ($authHeader ? substr($authHeader, 0, 30) . '...' : 'NULL'));
        \Log::info('AdminPengaduan - User: ' . ($user ? $user->id : 'null'));
        \Log::info('AdminPengaduan - Role: ' . ($user ? $user->role : 'null'));
        
        // Check if user is admin (case-insensitive)
        $role = strtolower($user->role ?? '');
        \Log::info('AdminPengaduan - Role lowercase: ' . $role);
        
        if (!$user || !in_array($role, ['admin', 'super_admin', 'konsultan_teknis'])) {
            return response()->json(['error' => 'Forbidden', 'debug_role' => $user?->role], 403);
        }

        $pengaduans = Pengaduan::with(['user', 'files'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($pengaduan) {
                $pengaduan->files = $pengaduan->files->map(function ($file) {
                    $file->file_url = $file->file_url;
                    return $file;
                });
                return $pengaduan;
            });

        return response()->json([
            'success' => true,
            'data' => $pengaduans,
        ]);
    }

    /**
     * Admin: Update pengaduan status.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        
        // Check if user is admin (case-insensitive)
        $role = strtolower($user->role ?? '');
        if (!$user || !in_array($role, ['admin', 'super_admin', 'konsultan_teknis'])) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,diproses,selesai,ditolak',
            'catatan_admin' => 'nullable|string',
        ]);

        $pengaduan = Pengaduan::findOrFail($id);
        $pengaduan->update([
            'status' => $request->status,
            'catatan_admin' => $request->catatan_admin,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pengaduan berhasil diupdate',
            'data' => $pengaduan,
        ]);
    }
}
