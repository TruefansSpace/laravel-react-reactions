<?php

namespace Workbench\App\Providers;

use Illuminate\Support\ServiceProvider;

class WorkbenchServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->usePublicPath(realpath(__DIR__.'/../../public'));
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Vite::useHotFile(
            realpath(__DIR__.'/../../public/hot')
        );

        $this->loadViewsFrom(__DIR__.'/../../resources/views', 'workbench');

        // Configure Inertia SSR
        config([
            'inertia.ssr.enabled' => true,
            'inertia.ssr.bundle' => realpath(__DIR__.'/../../public/build/ssr.js'),
        ]);

        // Load debugbar config
        $this->mergeConfigFrom(
            __DIR__.'/../../config/debugbar.php', 'debugbar'
        );
    }
}
