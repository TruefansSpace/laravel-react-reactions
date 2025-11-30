<?php

use TrueFans\LaravelReactReactions\Models\Comment;
use TrueFans\LaravelReactReactions\Notifications\NewCommentNotification;
use Workbench\App\Models\TestPost;

it('notification has correct via channels', function () {
    $user = createUser();
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $user->id,
    ]);

    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $post->id,
        'user_id' => $user->id,
        'content' => 'Test comment',
    ]);

    $notification = new NewCommentNotification($comment);
    
    expect($notification->via($user))->toBe(['mail']);
});

it('notification generates correct mail message', function () {
    $user = createUser();
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $user->id,
    ]);

    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $post->id,
        'user_id' => $user->id,
        'content' => 'Test comment',
    ]);

    $notification = new NewCommentNotification($comment);
    $mailMessage = $notification->toMail($user);
    
    expect($mailMessage)->toBeInstanceOf(\Illuminate\Notifications\Messages\MailMessage::class)
        ->and($mailMessage->subject)->toContain('New comment')
        ->and($mailMessage->introLines)->toBeArray()
        ->and(count($mailMessage->introLines))->toBeGreaterThanOrEqual(2);
});

it('notification generates correct array representation', function () {
    $user = createUser();
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $user->id,
    ]);

    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $post->id,
        'user_id' => $user->id,
        'content' => 'Test comment',
    ]);

    $notification = new NewCommentNotification($comment);
    $array = $notification->toArray($user);
    
    expect($array)->toBeArray()
        ->and($array)->toHaveKey('comment_id')
        ->and($array)->toHaveKey('commentable_type')
        ->and($array)->toHaveKey('commentable_id')
        ->and($array)->toHaveKey('user_id')
        ->and($array)->toHaveKey('content');
});

it('notification mail includes comment content', function () {
    $user = createUser();
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $user->id,
    ]);

    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $post->id,
        'user_id' => $user->id,
        'content' => 'This is my comment',
    ]);

    $notification = new NewCommentNotification($comment);
    $mailMessage = $notification->toMail($user);
    
    // Check that content is included
    $contentLine = $mailMessage->introLines[1];
    expect($contentLine)->toContain('This is my comment');
});

it('notification handles reply comments differently', function () {
    $user = createUser();
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $user->id,
    ]);

    $parentComment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $post->id,
        'user_id' => $user->id,
        'content' => 'Parent comment',
    ]);

    $reply = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $post->id,
        'user_id' => $user->id,
        'parent_id' => $parentComment->id,
        'content' => 'Reply comment',
    ]);

    $notification = new NewCommentNotification($reply);
    $mailMessage = $notification->toMail($user);
    
    expect($mailMessage->subject)->toContain('reply');
});

it('notification mail structure is correct', function () {
    $user = createUser();
    $post = \Workbench\App\Models\TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $user->id,
    ]);

    $comment = \TrueFans\LaravelReactReactions\Models\Comment::create([
        'commentable_type' => \Workbench\App\Models\TestPost::class,
        'commentable_id' => $post->id,
        'user_id' => $user->id,
        'content' => 'Test comment',
    ]);

    $notification = new \TrueFans\LaravelReactReactions\Notifications\NewCommentNotification($comment);
    $mailMessage = $notification->toMail($user);
    
    expect($mailMessage)->toBeInstanceOf(\Illuminate\Notifications\Messages\MailMessage::class)
        ->and($mailMessage->subject)->toBeString()
        ->and($mailMessage->introLines)->toBeArray();
});
