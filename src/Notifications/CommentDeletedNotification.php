<?php

namespace TrueFans\LaravelReactReactions\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use TrueFans\LaravelReactReactions\Models\Comment;

class CommentDeletedNotification extends Notification
{
    public Comment $comment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Comment $comment)
    {
        $this->comment = $comment;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $commentable = $this->comment->commentable;
        $commentableType = class_basename($commentable);
        $commentableTitle = $commentable->title ?? $commentable->name ?? "Item #{$commentable->id}";

        $isReply = $this->comment->parent_id !== null;
        $subject = $isReply
            ? "Reply deleted on {$commentableType}: {$commentableTitle}"
            : "Comment deleted on {$commentableType}: {$commentableTitle}";

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting('Hello!')
            ->line($isReply
                ? "{$this->comment->user->name} deleted their reply:"
                : "{$this->comment->user->name} deleted their comment:")
            ->line('"'.$this->comment->content.'"');

        // Add view link if commentable has a URL method
        if (method_exists($commentable, 'url')) {
            $message->action('View Item', $commentable->url());
        }

        return $message
            ->line('This is a notification that the comment has been removed.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'comment_id' => $this->comment->id,
            'user_id' => $this->comment->user_id,
            'user_name' => $this->comment->user->name,
            'content' => $this->comment->content,
            'commentable_type' => $this->comment->commentable_type,
            'commentable_id' => $this->comment->commentable_id,
            'deleted_at' => now()->toDateTimeString(),
        ];
    }
}
