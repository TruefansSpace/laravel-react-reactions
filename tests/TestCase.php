<?php

namespace TrueFans\LaravelReactReactions\Tests;

use Illuminate\Database\Eloquent\Factories\Factory;
use Orchestra\Testbench\TestCase as Orchestra;
use TrueFans\LaravelReactReactions\LaravelReactReactionsServiceProvider;

class TestCase extends Orchestra
{
    protected function setUp(): void
    {
        parent::setUp();

        Factory::guessFactoryNamesUsing(
            fn (string $modelName) => 'TrueFans\\LaravelReactReactions\\Database\\Factories\\'.class_basename($modelName).'Factory'
        );

        // Run migrations
        $this->loadLaravelMigrations();
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadMigrationsFrom(__DIR__.'/../workbench/database/migrations');
    }

    protected function tearDown(): void
    {
        // Prevent error handler issues with architecture tests
        restore_error_handler();
        restore_exception_handler();
        
        parent::tearDown();
    }

    protected function getPackageProviders($app)
    {
        return [
            LaravelReactReactionsServiceProvider::class,
        ];
    }

    public function getEnvironmentSetUp($app): void
    {
        config()->set('database.default', 'testing');
        config()->set('database.connections.testing', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]);
        config()->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
        
        // Configure auth to use Workbench User model
        config()->set('auth.providers.users.model', \Workbench\App\Models\User::class);
        
        // Define login route for tests
        $app['router']->get('/login', function () {
            return 'login';
        })->name('login');
    }
}
