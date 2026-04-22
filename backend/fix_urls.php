<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$docs = \App\Models\Document::where('file', 'like', 'http://localhost/%')->get();
foreach ($docs as $doc) {
    $doc->file = str_replace('http://localhost', 'http://127.0.0.1:8000', $doc->file);
    $doc->save();
}

$docsCover = \App\Models\Document::where('cover', 'like', 'http://localhost/%')->get();
foreach ($docsCover as $doc) {
    $doc->cover = str_replace('http://localhost', 'http://127.0.0.1:8000', $doc->cover);
    $doc->save();
}

echo "Updated!\n";
