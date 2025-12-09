<?php

namespace TrueFans\LaravelReactReactions;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use TrueFans\LaravelReactReactions\Events\CommentCreated;
use TrueFans\LaravelReactReactions\Events\CommentDeleted;
use TrueFans\LaravelReactReactions\Listeners\SendCommentDeletedNotification;
use TrueFans\LaravelReactReactions\Listeners\SendCommentNotification;

class LaravelReactReactionsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/react-reactions.php',
            'react-reactions'
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publish config
        $this->publishes([
            __DIR__.'/../config/react-reactions.php' => config_path('react-reactions.php'),
        ], 'react-reactions-config');

        // Publish migrations
        $this->publishes([
            __DIR__.'/../database/migrations' => database_path('migrations'),
        ], 'react-reactions-migrations');

        // Publish React components
        $this->publishes([
            __DIR__.'/../resources/js/Components' => resource_path('js/Components/Reactions'),
        ], 'react-reactions-components');

        // Load routes
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');

        // Register event listeners
        Event::listen(
            CommentCreated::class,
            SendCommentNotification::class
        );

        Event::listen(
            CommentDeleted::class,
            SendCommentDeletedNotification::class
        );
    }
}
