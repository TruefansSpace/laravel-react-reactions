<?php

use TrueFans\LaravelReactReactions\Events\CommentCreated;
use TrueFans\LaravelReactReactions\Listeners\SendCommentNotification;
use TrueFans\LaravelReactReactions\LaravelReactReactionsServiceProvider;

beforeEach(function () {
    $this->provider = new LaravelReactReactionsServiceProvider($this->app);
});

it('registers config', function () {
    $this->provider->register();
    
    expect(config('react-reactions'))->toBeArray();
});

it('merges config from package', function () {
    $this->provider->register();
    $this->provider->boot();
    
    expect(config('react-reactions'))->toBeArray()
        ->and(config('react-reactions.reactions'))->toBeArray();
});

it('boots and loads routes', function () {
    $this->provider->boot();
    
    // Check if routes are registered
    $routes = collect(app('router')->getRoutes())->map(fn($route) => $route->getName());
    
    expect($routes->contains('reactions.store'))->toBeTrue()
        ->and($routes->contains('reactions.destroy'))->toBeTrue()
        ->and($routes->contains('comments.store'))->toBeTrue()
        ->and($routes->contains('comments.destroy'))->toBeTrue();
});

it('registers event listeners', function () {
    $this->provider->boot();
    
    $listeners = app('events')->getListeners(CommentCreated::class);
    
    expect($listeners)->not->toBeEmpty();
});

it('publishes config files', function () {
    $publishes = LaravelReactReactionsServiceProvider::pathsToPublish(
        LaravelReactReactionsServiceProvider::class,
        'react-reactions-config'
    );
    
    expect($publishes)->not->toBeEmpty()
        ->and(array_values($publishes)[0])->toContain('react-reactions.php');
});

it('publishes migration files', function () {
    $publishes = LaravelReactReactionsServiceProvider::pathsToPublish(
        LaravelReactReactionsServiceProvider::class,
        'react-reactions-migrations'
    );
    
    expect($publishes)->not->toBeEmpty();
});

it('publishes react component files', function () {
    $publishes = LaravelReactReactionsServiceProvider::pathsToPublish(
        LaravelReactReactionsServiceProvider::class,
        'react-reactions-components'
    );
    
    expect($publishes)->not->toBeEmpty();
});
