<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$docs = \App\Models\Document::orderBy('id', 'desc')->take(5)->get();
foreach ($docs as $doc) {
    echo "ID: " . $doc->id . "\n";
    echo "Title: " . $doc->title . "\n";
    echo "File: " . ($doc->file ?: 'NULL') . "\n";
    echo "Status: " . $doc->status . "\n";
    echo "-------------------\n";
}
