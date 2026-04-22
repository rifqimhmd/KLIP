<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    private function isAdmin($user): bool
    {
        if (!$user) {
            return false;
        }

        return strtolower((string) ($user->status_pengguna ?? '')) === 'admin'
            || strtolower((string) ($user->daftar_sebagai ?? '')) === 'admin';
    }

    public function index(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::orderBy('id', 'desc')->get();

        return response()->json([
            'users' => $users,
            'total' => $users->count()
        ]);
    }

    public function store(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['required', 'string', 'max:255', 'unique:users,nip'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'no_wa' => ['nullable', 'string', 'max:25'],
            'pangkat_golongan' => ['nullable', 'string', 'max:255'],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'instansi' => ['nullable', 'string', 'max:255'],
            'daftar_sebagai' => ['nullable', 'string', 'max:255'],
            'organization_detail' => ['nullable', 'string', 'max:255'],
            'status_pengguna' => ['required', Rule::in(['User', 'Admin', 'Psikolog', 'Asisten Psikolog'])],
            'is_available' => ['nullable', 'boolean'],
        ]);

        if (!array_key_exists('is_available', $validated)) {
            $validated['is_available'] = true;
        }

        // Normalize empty strings to null for optional fields
        foreach (['pangkat_golongan', 'jabatan', 'instansi', 'no_wa', 'daftar_sebagai', 'organization_detail'] as $field) {
            if (array_key_exists($field, $validated) && $validated[$field] === '') {
                $validated[$field] = null;
            }
        }

        $user = User::create($validated);

        return response()->json([
            'message' => 'User berhasil ditambahkan',
            'user' => $user,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['required', 'string', 'max:255', Rule::unique('users', 'nip')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'no_wa' => ['nullable', 'string', 'max:25'],
            'pangkat_golongan' => ['nullable', 'string', 'max:255'],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'instansi' => ['nullable', 'string', 'max:255'],
            'daftar_sebagai' => ['nullable', 'string', 'max:255'],
            'organization_detail' => ['nullable', 'string', 'max:255'],
            'status_pengguna' => ['required', Rule::in(['User', 'Admin', 'Psikolog', 'Asisten Psikolog'])],
            'is_available' => ['nullable', 'boolean'],
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        // Normalize empty strings to null for optional fields
        foreach (['pangkat_golongan', 'jabatan', 'instansi', 'no_wa', 'daftar_sebagai', 'organization_detail'] as $field) {
            if (array_key_exists($field, $validated) && $validated[$field] === '') {
                $validated[$field] = null;
            }
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User berhasil diperbarui',
            'user' => $user,
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Admin tidak dapat menghapus akun sendiri'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus']);
    }

    public function updateFoto(Request $request, string $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/profile'), $filename);

            // Delete old photo if exists
            if ($user->foto && file_exists(public_path($user->foto))) {
                @unlink(public_path($user->foto));
            }

            $user->foto = 'uploads/profile/' . $filename;
            $user->save();

            return response()->json([
                'message' => 'Foto profil berhasil diperbarui',
                'foto_url' => asset($user->foto),
                'user' => $user
            ]);
        }

        return response()->json(['message' => 'Gagal mengupload foto'], 422);
    }
}
