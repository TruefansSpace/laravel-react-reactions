<?php

use TrueFans\LaravelReactReactions\Commands\LaravelReactReactionsCommand;

it('has correct signature', function () {
    $command = new LaravelReactReactionsCommand();
    
    expect($command->signature)->toBe('laravel-react-reactions');
});

it('has description', function () {
    $command = new LaravelReactReactionsCommand();
    
    expect($command->description)->not->toBeEmpty();
});

it('can be instantiated', function () {
    $command = new LaravelReactReactionsCommand();
    
    expect($command)->toBeInstanceOf(LaravelReactReactionsCommand::class);
});
