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
        //
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
    }
}
