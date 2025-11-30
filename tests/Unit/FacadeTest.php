<?php

use TrueFans\LaravelReactReactions\Facades\LaravelReactReactions;
use TrueFans\LaravelReactReactions\LaravelReactReactions as LaravelReactReactionsClass;

it('resolves facade accessor correctly', function () {
    $accessor = LaravelReactReactions::getFacadeRoot();
    
    expect($accessor)->toBeInstanceOf(LaravelReactReactionsClass::class);
});

it('returns correct facade accessor name', function () {
    $reflection = new ReflectionClass(LaravelReactReactions::class);
    $method = $reflection->getMethod('getFacadeAccessor');
    $method->setAccessible(true);
    
    $accessor = $method->invoke(null);
    
    expect($accessor)->toBe(LaravelReactReactionsClass::class);
});
