<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use TrueFans\LaravelReactReactions\Events\CommentDeleted;
use TrueFans\LaravelReactReactions\Notifications\CommentDeletedNotification;
use Workbench\App\Models\TestPost;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createUser();
    $this->post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $this->user->id,
    ]);

    // Enable delete notifications for testing
    config(['react-reactions.notifications.notify_on_delete' => true]);
    config(['react-reactions.notifications.admin_email' => 'admin@example.com']);
});

test('comment deleted event is dispatched when comment is deleted', function () {
    $this->actingAs($this->user);

    Event::fake([CommentDeleted::class]);

    $comment = $this->post->comment($this->user->id, 'Test comment');

    $this->delete("/comments/{$comment->id}");

    Event::assertDispatched(CommentDeleted::class, function ($event) use ($comment) {
        return $event->comment->id === $comment->id;
    });
});

test('admin receives notification when comment is deleted', function () {
    Notification::fake();

    $comment = $this->post->comment($this->user->id, 'Test comment to delete');

    event(new CommentDeleted($comment));

    // Process the queued job
    Notification::assertSentOnDemand(CommentDeletedNotification::class, function ($notification, $channels, $notifiable) use ($comment) {
        return $notification->comment->id === $comment->id;
    });
});

test('notification is not sent when notify_on_delete is disabled', function () {
    config(['react-reactions.notifications.notify_on_delete' => false]);

    Notification::fake();

    $comment = $this->post->comment($this->user->id, 'Test comment');

    event(new CommentDeleted($comment));

    Notification::assertNothingSent();
});

test('post owner receives notification when their post comment is deleted', function () {
    config(['react-reactions.notifications.notify_owner' => true]);

    $commenter = createUser();
    $comment = $this->post->comment($commenter->id, 'Test comment');

    Notification::fake();

    event(new CommentDeleted($comment));

    // Process the queued job
    Notification::assertSentTo(
        $this->user,
        CommentDeletedNotification::class,
        function ($notification) use ($comment) {
            return $notification->comment->id === $comment->id;
        }
    );
});

test('notification includes deleted comment content', function () {
    $comment = $this->post->comment($this->user->id, 'This comment will be deleted');

    $notification = new CommentDeletedNotification($comment);
    $mailMessage = $notification->toMail($this->user);

    expect($mailMessage->introLines)->toContain('"This comment will be deleted"');
});

test('notification subject indicates comment deletion', function () {
    $comment = $this->post->comment($this->user->id, 'Test');

    $notification = new CommentDeletedNotification($comment);
    $mailMessage = $notification->toMail($this->user);

    expect($mailMessage->subject)->toContain('deleted');
});
