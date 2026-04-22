<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$name = 'Winanti M.Psi';
$jabatan = 'Psikolog';
$email = 'winanti@example.com'; // Default email if not exists
$nip = '198701012024012001'; // Default NIP if not exists

$user = User::where('name', 'Winanti M.Psi')->first();

if (!$user) {
    echo "User Winanti not found. Creating...\n";
    $user = User::create([
        'name' => $name,
        'email' => $email,
        'nip' => $nip,
        'password' => Hash::make('password123'), // Default password
        'jabatan' => $jabatan,
        'status_pengguna' => 'Psikolog',
        'daftar_sebagai' => 'Psikolog',
        'is_available' => true,
        'email_verified_at' => now(),
    ]);
    echo "User created with ID: " . $user->id . "\n";
} else {
    echo "User Winanti already exists. Updating jabatan...\n";
    $user->update([
        'jabatan' => $jabatan,
        'status_pengguna' => 'Psikolog',
        'daftar_sebagai' => 'Psikolog',
    ]);
    echo "User updated.\n";
}
