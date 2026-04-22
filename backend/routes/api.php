<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\ResetPasswordController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\SurveyController;
use App\Http\Controllers\Api\KasubditController;
use App\Http\Controllers\Api\PengaduanController;
use App\Http\Controllers\AuthWebController;
use App\Http\Controllers\Admin\UserApprovalController;

Route::post('/login', [AuthWebController::class, 'login'])->name('api.login');
Route::post('/register', [AuthWebController::class, 'register'])->name('api.register');

// password reset endpoints
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendLink'])->name('api.forgot-password');
Route::post('/reset-password', [ResetPasswordController::class, 'reset'])->name('api.reset-password');

// Public documents endpoint (published documents only)
Route::get('/documents', [DocumentController::class, 'index']);
Route::get('/documents/{id}', [DocumentController::class, 'show']);

// Public banners & site settings
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/site-settings', [SiteSettingController::class, 'index']);

// Public survey endpoint
Route::post('/survey', [SurveyController::class, 'store']);

// Public kasubdit info
Route::get('/kasubdit', [KasubditController::class, 'getInfo']);

// Admin kasubdit photo upload
Route::post('/kasubdit/{id}/upload-photo', [KasubditController::class, 'uploadPhoto'])
    ->middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class]);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthWebController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/update-password', [AuthController::class, 'updatePassword']);
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);
    Route::post('/profile/update-foto', [AuthController::class, 'updateFoto']);

    // Document management
    Route::post('/documents', [DocumentController::class, 'store']); // User, psikolog, admin can upload
    Route::put('/documents/{id}', [DocumentController::class, 'update']); // User can update their own
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']); // User can delete their own

    // Admin document management
    Route::get('/documents/admin/pending', [DocumentController::class, 'pending']); // View pending docs
    Route::post('/documents/{id}/approve', [DocumentController::class, 'approve']); // Admin approve
    Route::post('/documents/{id}/reject', [DocumentController::class, 'reject']); // Admin reject

    // Consultation management
    Route::get('/consultations', [ConsultationController::class, 'index']); // Get user's consultations
    Route::get('/psychologists', [ConsultationController::class, 'psychologists']); // Get available psychologist profiles
    Route::get('/consultations/psychologists', [ConsultationController::class, 'psychologists']); // Get available psychologist profiles (alias)
    Route::get('/consultations/assistants', [ConsultationController::class, 'assistants']); // Psikolog fetches asisten list
    Route::get('/consultations/admin/pending', [ConsultationController::class, 'pending']); // Get pending consultations (psikolog/admin)
    Route::get('/consultations/export/pdf', [ConsultationController::class, 'exportPdf']);
    Route::get('/consultations/export/excel', [ConsultationController::class, 'exportExcel']);
    Route::put('/consultations/psychologists/availability', [ConsultationController::class, 'updateAvailability']);
    Route::post('/consultations', [ConsultationController::class, 'store']); // Create consultation
    Route::get('/consultations/{id}', [ConsultationController::class, 'show']); // Get specific consultation
    Route::put('/consultations/{id}', [ConsultationController::class, 'update']); // Update consultation (psikolog/admin)
    Route::put('/consultations/{id}/teknis', [ConsultationController::class, 'updateTeknis']); // Update teknis consultation (konsultan teknis)
    Route::post('/consultations/{id}/complete', [ConsultationController::class, 'markCompleted']); // User marks needs_referral as completed
    Route::post('/consultations/{id}/assign', [ConsultationController::class, 'assignToAssistant']); // Psikolog assigns to asisten
    Route::delete('/consultations/{id}', [ConsultationController::class, 'destroy']); // Delete consultation

    // Admin consultations management
    Route::get('/admin/consultations', [ConsultationController::class, 'adminIndex'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);

    // Admin documents management
    Route::get('/admin/documents', [DocumentController::class, 'adminIndex'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/documents', [DocumentController::class, 'store'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/documents/{id}', [DocumentController::class, 'update'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::delete('/admin/documents/{id}', [DocumentController::class, 'destroy'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);

    // Admin user management
    Route::get('/admin/users', [AdminUserController::class, 'index'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/users', [AdminUserController::class, 'store'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::put('/admin/users/{id}', [AdminUserController::class, 'update'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/users/{id}/update-foto', [AdminUserController::class, 'updateFoto'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);

    // User approval management
    Route::get('/admin/users/pending', [UserApprovalController::class, 'index'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/users/{id}/approve', [UserApprovalController::class, 'approve'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/users/{id}/reject', [UserApprovalController::class, 'reject'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::get('/admin/users/all', [UserApprovalController::class, 'getAllUsers'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);

    // Admin banner management
    Route::get('/admin/banners', [BannerController::class, 'adminIndex'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/banners', [BannerController::class, 'store'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/banners/{id}', [BannerController::class, 'update'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::delete('/admin/banners/{id}', [BannerController::class, 'destroy'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);

    // Admin site settings (images) - using inline middleware for now
    Route::post('/admin/site-settings/{key}', [SiteSettingController::class, 'update'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/survey-images', [SiteSettingController::class, 'updateSurveyImages'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/produk-images', [SiteSettingController::class, 'updateProdukImages'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/logos', [SiteSettingController::class, 'updateLogos'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);

    // Admin survey management
    Route::get('/admin/surveys', [SurveyController::class, 'index'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::get('/admin/surveys/statistics', [SurveyController::class, 'statistics'])
        ->middleware(\App\Http\Middleware\AdminMiddleware::class);

    // Real-time chat (per consultation room)
    Route::get('/chat/stats', [ChatController::class, 'stats']);
    Route::get('/chat/{consultationId}/messages', [ChatController::class, 'index']);
    Route::post('/chat/{consultationId}/messages', [ChatController::class, 'store']);
    Route::post('/chat/{consultationId}/end', [ChatController::class, 'endChat']);
    Route::delete('/chat/{consultationId}/messages', [ChatController::class, 'destroyAllMessages']);
    Route::delete('/chat/{consultationId}/messages/{messageId}', [ChatController::class, 'destroyMessage']);

    // Pengaduan routes
    Route::get('/pengaduan', [PengaduanController::class, 'index']);
    Route::post('/pengaduan', [PengaduanController::class, 'store']);
    Route::get('/pengaduan/{id}', [PengaduanController::class, 'show']);
    
    // Admin pengaduan routes
    Route::get('/admin/pengaduan', [PengaduanController::class, 'adminIndex']);
    Route::put('/admin/pengaduan/{id}/status', [PengaduanController::class, 'updateStatus']);
});

// Simple example public endpoint
Route::get('/ping', function (Request $request) {
    return response()->json(['pong' => true]);
});
