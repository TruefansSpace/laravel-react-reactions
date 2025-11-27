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

    public function getEnvironmentSetUp($app)
    {
        config()->set('database.default', 'testing');

        /*
         foreach (\Illuminate\Support\Facades\File::allFiles(__DIR__ . '/../database/migrations') as $migration) {
            (include $migration->getRealPath())->up();
         }
         */
    }
}
