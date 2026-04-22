<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
echo base_path('routes/api.php') . "\n";
echo file_exists(base_path('routes/api.php')) ? 'exists' : 'missing';
echo "\n";
echo substr(file_get_contents(base_path('routes/api.php')), 0, 300);
