<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use TrueFans\LaravelReactReactions\Events\CommentCreated;
use TrueFans\LaravelReactReactions\Listeners\SendCommentNotification;
use TrueFans\LaravelReactReactions\Models\Comment;
use TrueFans\LaravelReactReactions\Notifications\NewCommentNotification;
use Workbench\App\Models\TestPost;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createUser();
    $this->post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $this->user->id,
    ]);
    $this->listener = new SendCommentNotification;

    config(['react-reactions.notifications.enabled' => true]);
    config(['react-reactions.notifications.admin_email' => 'admin@example.com']);
});

test('listener can be instantiated', function () {
    expect($this->listener)->toBeInstanceOf(SendCommentNotification::class);
});

test('listener handles comment created event', function () {
    Notification::fake();

    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test comment',
    ]);

    $event = new CommentCreated($comment);
    $this->listener->handle($event);

    Notification::assertSentOnDemand(NewCommentNotification::class);
});

test('listener does not send notification when disabled', function () {
    Notification::fake();
    config(['react-reactions.notifications.enabled' => false]);

    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test comment',
    ]);

    $event = new CommentCreated($comment);
    $this->listener->handle($event);

    Notification::assertNothingSent();
});

test('listener does not send notification when no admin email', function () {
    Notification::fake();
    config(['react-reactions.notifications.admin_email' => null]);

    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test comment',
    ]);

    $event = new CommentCreated($comment);
    $this->listener->handle($event);

    Notification::assertNothingSent();
});

test('listener sends notification with correct comment data', function () {
    Notification::fake();

    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test comment content',
    ]);

    $event = new CommentCreated($comment);
    $this->listener->handle($event);

    Notification::assertSentOnDemand(
        NewCommentNotification::class,
        function ($notification, $channels, $notifiable) use ($comment) {
            return $notification->comment->id === $comment->id;
        }
    );
});
