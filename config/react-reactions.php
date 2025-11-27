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
];

