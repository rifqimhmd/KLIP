<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$routes = $app['router']->getRoutes();
foreach ($routes as $route) {
    if (strpos($route->uri(), 'kasubdit') !== false) {
        var_dump($route->methods(), $route->uri(), $route->action);
    }
}
