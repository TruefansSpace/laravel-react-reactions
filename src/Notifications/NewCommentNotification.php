<?php

namespace TrueFans\LaravelReactReactions\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use TrueFans\LaravelReactReactions\Models\Comment;

class NewCommentNotification extends Notification
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
            ? "New reply on {$commentableType}: {$commentableTitle}"
            : "New comment on {$commentableType}: {$commentableTitle}";

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting('Hello!')
            ->line($isReply 
                ? "{$this->comment->user->name} replied to a comment:"
                : "{$this->comment->user->name} posted a new comment:")
            ->line('"' . $this->comment->content . '"');

        // Add view link if commentable has a URL method
        if (method_exists($commentable, 'url')) {
            $message->action('View Comment', $commentable->url());
        }

        return $message
            ->line('Thank you for using our application!');
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
        ];
    }
}
