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
];

