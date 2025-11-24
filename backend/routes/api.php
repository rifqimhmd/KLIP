<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\DokumenController;
use App\Http\Controllers\Api\VideoController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::apiResource('/banners', BannerController::class);
Route::apiResource('/dokumens', DokumenController::class);
Route::apiResource('/videos', VideoController::class);
