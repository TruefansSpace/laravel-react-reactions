<?php

use TrueFans\LaravelReactReactions\Models\Reaction;
use Workbench\App\Models\TestPost;

beforeEach(function () {
    $this->actingAs(createUser());
});

it('can add a reaction to a model', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $reaction = $post->react(auth()->id(), 'like');

    expect($reaction)->toBeInstanceOf(Reaction::class)
        ->and($reaction->type)->toBe('like')
        ->and($reaction->user_id)->toBe(auth()->id())
        ->and($post->reactions()->count())->toBe(1);
});

it('can remove a reaction from a model', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $post->react(auth()->id(), 'like');
    $result = $post->unreact(auth()->id());

    expect($result)->toBeTrue()
        ->and($post->reactions()->count())->toBe(0);
});

it('can toggle a reaction', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    // First toggle - adds reaction
    $result = $post->toggleReaction(auth()->id(), 'like');
    expect($result)->toBeInstanceOf(Reaction::class)
        ->and($post->reactions()->count())->toBe(1);

    // Second toggle - removes reaction
    $result = $post->toggleReaction(auth()->id(), 'like');
    expect($result)->toBeTrue()
        ->and($post->reactions()->count())->toBe(0);
});

it('can change reaction type', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $post->react(auth()->id(), 'like');
    $post->react(auth()->id(), 'love');

    expect($post->reactions()->count())->toBe(1)
        ->and($post->userReaction(auth()->id()))->toBe('love');
});

it('can get reactions summary', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $user1 = createUser();
    $user2 = createUser();
    $user3 = createUser();

    $post->react($user1->id, 'like');
    $post->react($user2->id, 'like');
    $post->react($user3->id, 'love');

    $summary = $post->reactionsSummary();

    expect($summary)->toHaveKey('like', 2)
        ->and($summary)->toHaveKey('love', 1);
});

it('can get user reaction', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $post->react(auth()->id(), 'haha');

    expect($post->userReaction(auth()->id()))->toBe('haha');
});

it('enforces unique reaction per user per reactable', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $post->react(auth()->id(), 'like');
    $post->react(auth()->id(), 'love');

    // Should only have one reaction (the updated one)
    expect($post->reactions()->count())->toBe(1)
        ->and($post->userReaction(auth()->id()))->toBe('love');
});


it('returns null for user reaction when user id is zero', function () {
    $post = \Workbench\App\Models\TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $reaction = $post->userReaction(0);
    
    expect($reaction)->toBeNull();
});

it('can count total reactions', function () {
    $user1 = createUser();
    $user2 = createUser();
    $post = \Workbench\App\Models\TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $post->react($user1->id, 'like');
    $post->react($user2->id, 'love');

    $count = $post->reactions()->count();
    
    expect($count)->toBe(2);
});
