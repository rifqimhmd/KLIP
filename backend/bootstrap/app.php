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
        ]);
        
        // 1. TAMBAHKAN INI: Agar Laravel mengenali HTTPS dari Load Balancer Railway
        $middleware->trustProxies(at: '*');

        // Enable CORS only for the frontend and set strict security headers
        $middleware->use([
            \App\Http\Middleware\SecurityHeaders::class,
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Exclude CSRF only for public auth, password reset, and broadcast auth.
        // This app authenticates API requests with bearer tokens, so API routes stay stateless.
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
        // Hide detailed error messages in production (prevent information disclosure)
        $exceptions->render(function (Throwable $e, $request) {
            if (config('app.debug') === false) {
                if ($request->is('api/*')) {
                    return response()->json([
                        'message' => 'An error occurred. Please try again later.'
                    ], 500);
                }
            }
        });
    })->create();
