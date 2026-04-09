<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthWebController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'nip' => ['required', 'string'],
            'password' => ['required'],
        ]);

        $identifier = trim((string) $credentials['nip']);
        $password = trim((string) $credentials['password']);

        $user = User::where('nip', $identifier)
            ->orWhereRaw('LOWER(email) = ?', [mb_strtolower($identifier)])
            ->first();

        if ($user && Hash::check($password, $user->password)) {
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();
            return response()->json(['message' => 'Logged in']);
        }

        return response()->json(['message' => 'The provided credentials are incorrect.'], 422);
    }

    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'nip' => array_merge(
                    ['required', 'string', 'unique:users,nip'],
                    strtolower($request->input('status_pengguna', '')) !== 'admin'
                        ? ['regex:/^\d{16}$/']
                        : []
                ),
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'pangkat_golongan' => ['required', 'string', 'max:255'],
                'jabatan' => ['required', 'string', 'max:255'],
                'bagian' => ['required', 'string', 'max:255'],
                'no_wa' => ['required', 'string'],
                'daftar_sebagai' => ['required', 'string', 'in:UPT,Kanwil,Ditjenpas'],
                'organization_detail' => ['nullable', 'string'],
                'status_pengguna' => ['required', 'string'],
            ]);

            // Trim whitespace from all string fields to prevent login failures
            foreach (['name', 'nip', 'email', 'pangkat_golongan', 'jabatan', 'bagian', 'no_wa', 'daftar_sebagai', 'status_pengguna'] as $field) {
                if (isset($validated[$field])) {
                    $validated[$field] = trim($validated[$field]);
                }
            }
            if (isset($validated['organization_detail'])) {
                $validated['organization_detail'] = trim($validated['organization_detail']);
            }

            \Log::info('Register attempt', [
                'nip' => $validated['nip'],
                'email' => $validated['email'],
            ]);

            // Password will be automatically hashed by User model's cast
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],  // No manual hashing - let the cast handle it
                'nip' => $validated['nip'],
                'pangkat_golongan' => $validated['pangkat_golongan'],
                'jabatan' => $validated['jabatan'],
                'bagian' => $validated['bagian'],
                'no_wa' => $validated['no_wa'],
                'daftar_sebagai' => $validated['daftar_sebagai'],
                'organization_detail' => $validated['organization_detail'] ?? null,
                'status_pengguna' => $validated['status_pengguna'],
            ]);

            \Log::info('User registered successfully', ['user_id' => $user->id, 'nip' => $user->nip]);

            return response()->json(['message' => 'User registered successfully'], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('Validation failed on register', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Register error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
