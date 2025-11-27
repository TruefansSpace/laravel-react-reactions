<?php

namespace TrueFans\LaravelReactReactions;

use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;
use TrueFans\LaravelReactReactions\Commands\LaravelReactReactionsCommand;

class LaravelReactReactionsServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        /*
         * This class is a Package Service Provider
         *
         * More info: https://github.com/spatie/laravel-package-tools
         */
        $package
            ->name('react-reactions')
            ->hasConfigFile()
            ->hasViews()
            ->hasMigration('create_react_reactions_table')
            ->hasRoute('web')
            ->hasCommand(LaravelReactReactionsCommand::class);
    }

    public function packageRegistered(): void
    {
        // Register publishable React components
        $this->publishes([
            __DIR__.'/../resources/js/Components' => resource_path('js/Components/Reactions'),
        ], 'react-reactions-components');
    }
}
