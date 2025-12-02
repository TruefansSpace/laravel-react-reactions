<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use TrueFans\LaravelReactReactions\Events\CommentCreated;
use TrueFans\LaravelReactReactions\Models\Comment;
use TrueFans\LaravelReactReactions\Notifications\NewCommentNotification;
use Workbench\App\Models\TestPost;
use Workbench\App\Models\User;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createUser();
    $this->post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $this->user->id,
    ]);

    // Enable notifications
    config(['react-reactions.notifications.enabled' => true]);
    config(['react-reactions.notifications.admin_email' => 'admin@example.com']);
});

test('comment creation dispatches event', function () {
    $this->actingAs($this->user);

    Event::fake([CommentCreated::class]);

    $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => 'Test comment',
    ]);

    Event::assertDispatched(CommentCreated::class, function ($event) {
        return $event->comment->content === 'Test comment';
    });
});

test('sends notification to admin email', function () {
    Notification::fake();

    $comment = $this->post->comment($this->user->id, 'Test comment');

    event(new CommentCreated($comment));

    // Process the queued job
    $this->artisan('queue:work --once');

    Notification::assertSentOnDemand(
        NewCommentNotification::class,
        function ($notification, $channels, $notifiable) {
            return $notifiable->routes['mail'] === 'admin@example.com';
        }
    );
});

test('sends notification to post owner', function () {
    Notification::fake();
    config(['react-reactions.notifications.notify_owner' => true]);

    $postOwner = createUser();
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $postOwner->id,
    ]);
    $commenter = createUser();

    $comment = $post->comment($commenter->id, 'Test comment');

    event(new CommentCreated($comment));

    // Process the queued job
    $this->artisan('queue:work --once');

    Notification::assertSentTo($postOwner, NewCommentNotification::class);
});

test('does not notify post owner if they are the commenter', function () {
    Notification::fake();
    config(['react-reactions.notifications.notify_owner' => true]);

    $comment = $this->post->comment($this->user->id, 'Test comment');

    event(new CommentCreated($comment));

    // Process the queued job
    $this->artisan('queue:work --once');

    // Should not send to post owner (who is the commenter)
    Notification::assertNotSentTo($this->user, NewCommentNotification::class);
});

test('sends notification to parent comment author on reply', function () {
    Notification::fake();
    config(['react-reactions.notifications.notify_parent_author' => true]);

    $parentAuthor = createUser();
    $replier = createUser();

    $parentComment = $this->post->comment($parentAuthor->id, 'Parent comment');
    $reply = $parentComment->addReply($replier->id, 'Reply comment');

    event(new CommentCreated($reply));

    // Process the queued job
    $this->artisan('queue:work --once');

    Notification::assertSentTo($parentAuthor, NewCommentNotification::class);
});

test('does not notify parent author if they are the replier', function () {
    Notification::fake();
    config(['react-reactions.notifications.notify_parent_author' => true]);

    $parentComment = $this->post->comment($this->user->id, 'Parent');
    $reply = $parentComment->addReply($this->user->id, 'Self reply');

    event(new CommentCreated($reply));

    // Process the queued job
    $this->artisan('queue:work --once');

    // Should not send notification to self
    Notification::assertNotSentTo($this->user, NewCommentNotification::class);
});

test('notification listener is called', function () {
    Notification::fake();

    $comment = $this->post->comment($this->user->id, 'Test');

    event(new CommentCreated($comment));

    Notification::assertSentOnDemand(NewCommentNotification::class);
});

test('notification contains correct data', function () {
    Notification::fake();

    $comment = $this->post->comment($this->user->id, 'Test comment content');

    event(new CommentCreated($comment));

    // Process the queued job
    $this->artisan('queue:work --once');

    Notification::assertSentOnDemand(
        NewCommentNotification::class,
        function ($notification) {
            $mailData = $notification->toMail($notification);

            return str_contains($mailData->render(), 'Test comment content');
        }
    );
});

test('respects notification enabled config', function () {
    Notification::fake();
    config(['react-reactions.notifications.enabled' => false]);

    $comment = $this->post->comment($this->user->id, 'Test');

    event(new CommentCreated($comment));

    // Process the queued job
    $this->artisan('queue:work --once');

    Notification::assertNothingSent();
});

test('respects notify on replies config', function () {
    Notification::fake();
    config(['react-reactions.notifications.notify_on_replies' => false]);

    $parentComment = $this->post->comment($this->user->id, 'Parent');
    $reply = $parentComment->addReply($this->user->id, 'Reply');

    event(new CommentCreated($reply));

    // Process the queued job
    $this->artisan('queue:work --once');

    // Should not send notification for reply
    Notification::assertNothingSentTo($this->user);
});

test('notification email has correct subject', function () {
    $comment = $this->post->comment($this->user->id, 'Test');
    $notification = new NewCommentNotification($comment);

    $mailMessage = $notification->toMail($this->user);

    expect($mailMessage->subject)->toContain('TestPost');
});

test('notification email includes comment content', function () {
    $comment = $this->post->comment($this->user->id, 'My test comment');
    $notification = new NewCommentNotification($comment);

    $mailMessage = $notification->toMail($this->user);

    // Check that intro lines contain the comment content (wrapped in quotes)
    expect($mailMessage->introLines)->toContain('"My test comment"');
});

test('notification email includes commenter name', function () {
    $comment = $this->post->comment($this->user->id, 'Test');
    $notification = new NewCommentNotification($comment);

    $mailMessage = $notification->toMail($this->user);

    // Check that the intro lines contain the user name
    $introText = implode(' ', $mailMessage->introLines);
    expect($introText)->toContain($this->user->name);
});

test('notification distinguishes between comment and reply', function () {
    $parentComment = $this->post->comment($this->user->id, 'Parent');
    $reply = $parentComment->addReply($this->user->id, 'Reply');

    $commentNotification = new NewCommentNotification($parentComment);
    $replyNotification = new NewCommentNotification($reply);

    $commentMail = $commentNotification->toMail($this->user);
    $replyMail = $replyNotification->toMail($this->user);

    expect($commentMail->subject)->toContain('New comment')
        ->and($replyMail->subject)->toContain('New reply');
});
