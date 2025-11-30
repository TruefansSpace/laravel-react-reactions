<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use TrueFans\LaravelReactReactions\Events\CommentCreated;
use TrueFans\LaravelReactReactions\Models\Comment;
use Workbench\App\Models\TestPost;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createUser();
    $this->post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $this->user->id,
    ]);
});

test('comment created event can be instantiated', function () {
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test comment',
    ]);
    
    $event = new CommentCreated($comment);
    
    expect($event)->toBeInstanceOf(CommentCreated::class)
        ->and($event->comment)->toBeInstanceOf(Comment::class)
        ->and($event->comment->id)->toBe($comment->id);
});

test('comment created event uses dispatchable trait', function () {
    expect(CommentCreated::class)->toUse(\Illuminate\Foundation\Events\Dispatchable::class);
});

test('comment created event uses serializes models trait', function () {
    expect(CommentCreated::class)->toUse(\Illuminate\Queue\SerializesModels::class);
});

test('comment created event can be dispatched', function () {
    Event::fake();
    
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test comment',
    ]);
    
    event(new CommentCreated($comment));
    
    Event::assertDispatched(CommentCreated::class, function ($event) use ($comment) {
        return $event->comment->id === $comment->id;
    });
});
