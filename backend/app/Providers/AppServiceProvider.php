<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL; // 1. Tambahkan baris ini
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 2. Paksa HTTPS jika di server (Production)
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        // Customize password reset link to point at frontend
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontend = config('app.frontend_url') ?: env('FRONTEND_URL', 'http://localhost:5173');
            return $frontend.'/reset-password?token='.$token.'&email='.urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}