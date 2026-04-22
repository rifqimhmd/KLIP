<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'nip' => 'required|string',
            'password' => 'required|string',
        ]);

        $identifier = trim((string) $data['nip']);
        $password = trim((string) $data['password']);

        $user = User::where('nip', $identifier)
            ->orWhereRaw('LOWER(email) = ?', [mb_strtolower($identifier)])
            ->first();

        $storedPassword = $user?->password ?? '$2y$10$'.str_repeat('a', 53);
        if (! Hash::check($password, $storedPassword) || ! $user) {
            throw ValidationException::withMessages([
                'nip' => ['NIP/Email atau password tidak sesuai.'],
            ]);
        }

        DB::table('users')->where('id', $user->id)->update([
            'is_online' => true,
            'last_seen_at' => now(),
        ]);

        // create token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            // Delete current token
            if ($user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }

            // If no active tokens remain, mark offline
            // Also immediately mark offline so the admin dashboard reflects the logout
            DB::table('users')->where('id', $user->id)->update([
                'is_online' => false,
                'last_seen_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if ($user) {
            // Refresh online status on every /api/user call (heartbeat)
            DB::table('users')->where('id', $user->id)->update([
                'is_online' => true,
                'last_seen_at' => now(),
            ]);
            $user = $user->fresh();
        }
        return response()->json($user);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $request->user()->id,
            'no_wa' => 'nullable|string|max:20',
            'pangkat_golongan' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'instansi' => 'nullable|string|max:255',
            'daftar_sebagai' => 'nullable|in:UPT,Kanwil,Ditjenpas',
            'organization_detail' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini tidak sesuai.'],
            ]);
        }

        unset($validated['current_password']);

        if (!empty($validated['daftar_sebagai']) && empty($validated['organization_detail'])) {
            throw ValidationException::withMessages([
                'organization_detail' => ['Detail unit wajib dipilih.'],
            ]);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function updateFoto(Request $request)
    {
        $request->validate([
            'foto' => 'nullable|image|max:1024',
            'foto_position_x' => 'nullable|integer|min:0|max:100',
            'foto_position_y' => 'nullable|integer|min:0|max:100',
        ]);

        if (!$request->hasFile('foto') && !$request->has('foto_position_x') && !$request->has('foto_position_y')) {
            return response()->json([
                'message' => 'Tidak ada perubahan foto yang dikirim'
            ], 422);
        }

        $user = $request->user();

        if ($request->hasFile('foto')) {
            if ($user->foto) {
                $storedPath = parse_url($user->foto, PHP_URL_PATH) ?: $user->foto;
                $oldPath = ltrim(str_replace('/storage/', '', $storedPath), '/');
                if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('foto')->store('profile-photos', 'public');
            $user->foto = url(Storage::url($path));
        }

        if ($request->has('foto_position_x')) {
            $user->foto_position_x = (int) $request->input('foto_position_x');
        }

        if ($request->has('foto_position_y')) {
            $user->foto_position_y = (int) $request->input('foto_position_y');
        }

        $user->save();

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui',
            'foto' => $user->foto,
            'foto_position_x' => $user->foto_position_x,
            'foto_position_y' => $user->foto_position_y,
            'user' => $user,
        ]);
    }
}
