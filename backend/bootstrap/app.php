<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withBroadcasting(
        channels: __DIR__.'/../routes/channels.php',
        attributes: ['middleware' => ['auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        
        // Define middleware groups
        $middleware->group('api', [
            \Illuminate\Http\Middleware\ValidatePostSize::class,
            \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        
        // 1. TAMBAHKAN INI: Agar Laravel mengenali HTTPS dari Load Balancer Railway
        $middleware->trustProxies(at: '*');

        // Enable CORS only for the frontend and set strict security headers
        $middleware->use([
            \App\Http\Middleware\SecurityHeaders::class,
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Exclude CSRF only for public auth and password reset endpoints.
        // API bearer-token calls do not use CSRF, while stateful web session routes remain protected.
        $middleware->validateCsrfTokens(except: [
            'api/login',
            'api/register',
            'sanctum/csrf-cookie',
            'api/forgot-password',
            'api/reset-password',
            'broadcasting/auth',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();