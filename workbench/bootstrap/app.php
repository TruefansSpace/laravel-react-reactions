<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

use function Orchestra\Testbench\default_skeleton_path;

return Application::configure(basePath: $APP_BASE_PATH ?? default_skeleton_path())
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \Workbench\App\Http\Middleware\HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, \Illuminate\Http\Request $request) {
            // Handle unauthenticated exceptions
            if ($exception instanceof \Illuminate\Auth\AuthenticationException) {
                // For Inertia requests, redirect to login with 303
                if ($request->expectsJson() || $request->inertia()) {
                    return \Inertia\Inertia::location(route('login'));
                }

                // For regular requests, redirect to login with 303
                return redirect()->guest(route('login'), 303);
            }

            return $response;
        });
    })->create();
