<?php

// config for TrueFans/LaravelReactReactions
return [
    /*
     * Available reaction types
     */
    'types' => [
        'like' => '👍',
        'love' => '❤️',
        'haha' => '😂',
        'wow' => '😮',
        'sad' => '😢',
        'angry' => '😠',
    ],

    /*
     * Route configuration
     */
    'route' => [
        'prefix' => 'reactions',
        'middleware' => ['web', 'auth'],
    ],

    /*
     * UI configuration
     */
    'ui' => [
        'picker_delay' => 300, // milliseconds before showing picker on hover
        'animation_duration' => 200, // milliseconds for animations
    ],

    /*
     * Comments configuration
     */
    'comments' => [
        'reactions_enabled' => true, // Enable reactions on comments
        'nested_replies' => true, // Allow nested replies
        'max_depth' => 3, // Maximum nesting depth (0 = unlimited)
        'per_page' => 10, // Comments per page
        'edit_timeout' => 300, // Seconds user can edit their comment (0 = unlimited)
        'require_approval' => false, // Require admin approval before showing
    ],

    /*
     * Notification configuration
     */
    'notifications' => [
        'enabled' => env('REACTIONS_NOTIFICATIONS_ENABLED', true),
        'admin_email' => env('REACTIONS_ADMIN_EMAIL', env('MAIL_FROM_ADDRESS')),
        'notify_owner' => true, // Notify the owner of the commentable item
        'notify_parent_author' => true, // Notify parent comment author on replies
        'notify_on_replies' => true, // Send notifications for replies (not just top-level comments)
        'queue' => true, // Queue notification emails
    ],
];
