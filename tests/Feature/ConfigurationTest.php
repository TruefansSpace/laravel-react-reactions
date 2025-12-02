<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('reactions config has correct structure', function () {
    $config = config('react-reactions');

    expect($config)->toBeArray()
        ->and($config)->toHaveKeys(['types', 'comments', 'notifications']);
});

test('reactions config has enabled types', function () {
    $reactions = config('react-reactions.types');

    expect($reactions)->toBeArray()
        ->and($reactions)->toHaveKey('like')
        ->and($reactions)->toHaveKey('love')
        ->and($reactions)->toHaveKey('haha')
        ->and($reactions)->toHaveKey('wow')
        ->and($reactions)->toHaveKey('sad')
        ->and($reactions)->toHaveKey('angry');
});

test('comments config has reactions enabled setting', function () {
    $enabled = config('react-reactions.comments.reactions_enabled');

    expect($enabled)->toBeTrue();
});

test('comments config has max depth setting', function () {
    $maxDepth = config('react-reactions.comments.max_depth');

    expect($maxDepth)->toBeInt()
        ->and($maxDepth)->toBeGreaterThan(0);
});

test('notifications config has enabled setting', function () {
    $enabled = config('react-reactions.notifications.enabled');

    expect($enabled)->toBeBool();
});

test('notifications config has admin email setting', function () {
    $email = config('react-reactions.notifications.admin_email');

    expect($email === null || is_string($email))->toBeTrue();
});

test('can override reactions config', function () {
    config(['react-reactions.types' => ['like' => '👍', 'love' => '❤️']]);

    $reactions = config('react-reactions.types');

    expect($reactions)->toHaveCount(2)
        ->and($reactions)->toHaveKey('like')
        ->and($reactions)->toHaveKey('love');
});

test('can disable comments reactions', function () {
    config(['react-reactions.comments.reactions_enabled' => false]);

    expect(config('react-reactions.comments.reactions_enabled'))->toBeFalse();
});

test('can disable notifications', function () {
    config(['react-reactions.notifications.enabled' => false]);

    expect(config('react-reactions.notifications.enabled'))->toBeFalse();
});

test('can set custom admin email', function () {
    config(['react-reactions.notifications.admin_email' => 'custom@example.com']);

    expect(config('react-reactions.notifications.admin_email'))->toBe('custom@example.com');
});

test('can set custom max comment depth', function () {
    config(['react-reactions.comments.max_depth' => 5]);

    expect(config('react-reactions.comments.max_depth'))->toBe(5);
});
