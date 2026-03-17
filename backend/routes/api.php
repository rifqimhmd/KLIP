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
use App\Http\Controllers\AuthWebController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthWebController::class, 'register']);

// password reset endpoints
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendLink']);
Route::post('/reset-password',   [ResetPasswordController::class, 'reset']);

// Public documents endpoint (published documents only)
Route::get('/documents', [DocumentController::class, 'index']);
Route::get('/documents/{id}', [DocumentController::class, 'show']);

// Public banners & site settings
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/site-settings', [SiteSettingController::class, 'index']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
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
    Route::get('/consultations/psychologists', [ConsultationController::class, 'psychologists']); // Get available psychologist profiles
    Route::get('/consultations/assistants', [ConsultationController::class, 'assistants']); // Psikolog fetches asisten list
    Route::get('/consultations/admin/pending', [ConsultationController::class, 'pending']); // Get pending consultations (psikolog/admin)
    Route::get('/consultations/export/pdf', [ConsultationController::class, 'exportPdf']);
    Route::get('/consultations/export/excel', [ConsultationController::class, 'exportExcel']);
    Route::put('/consultations/psychologists/availability', [ConsultationController::class, 'updateAvailability']);
    Route::post('/consultations', [ConsultationController::class, 'store']); // Create consultation
    Route::get('/consultations/{id}', [ConsultationController::class, 'show']); // Get specific consultation
    Route::put('/consultations/{id}', [ConsultationController::class, 'update']); // Update consultation (psikolog/admin)
    Route::post('/consultations/{id}/complete', [ConsultationController::class, 'markCompleted']); // User marks needs_referral as completed
    Route::post('/consultations/{id}/assign', [ConsultationController::class, 'assignToAssistant']); // Psikolog assigns to asisten
    Route::delete('/consultations/{id}', [ConsultationController::class, 'destroy']); // Delete consultation

    // Admin user management
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);

    // Admin banner management
    Route::get('/admin/banners', [BannerController::class, 'adminIndex']);
    Route::post('/admin/banners', [BannerController::class, 'store']);
    Route::post('/admin/banners/{id}', [BannerController::class, 'update']);
    Route::delete('/admin/banners/{id}', [BannerController::class, 'destroy']);

    // Admin site settings (images)
    Route::post('/admin/site-settings/{key}', [SiteSettingController::class, 'update']);

    // Real-time chat (per consultation room)
    Route::get('/chat/stats', [ChatController::class, 'stats']);
    Route::get('/chat/{consultationId}/messages', [ChatController::class, 'index']);
    Route::post('/chat/{consultationId}/messages', [ChatController::class, 'store']);
    Route::post('/chat/{consultationId}/end', [ChatController::class, 'endChat']);
    Route::delete('/chat/{consultationId}/messages', [ChatController::class, 'destroyAllMessages']);
    Route::delete('/chat/{consultationId}/messages/{messageId}', [ChatController::class, 'destroyMessage']);
});

// Simple example public endpoint
Route::get('/ping', function (Request $request) {
    return response()->json(['pong' => true]);
});
