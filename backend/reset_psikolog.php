<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = \App\Models\User::where('status_pengguna', 'Psikolog')->get();
foreach ($users as $user) {
    echo $user->email . " (Password has di-reset menjadi: password)\n";
    $user->password = bcrypt('password');
    $user->save();
}

if ($users->count() === 0) {
    echo "Tidak ada user dengan role psikolog.\n";
}
