<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\User::where('status_pengguna', 'Psikolog')->update(['status_approval' => 'approved']);
echo "Psikolog approved\n";