<?php

return [
    'enabled' => env('DEBUGBAR_ENABLED', env('APP_DEBUG', false)),

    'except' => [
        'telescope*',
        'horizon*',
    ],

    'storage' => [
        'enabled' => true,
        'open' => null,
        'driver' => 'file',
        'path' => storage_path('debugbar'),
    ],

    'editor' => env('DEBUGBAR_EDITOR', 'phpstorm'),

    'remote_sites_path' => env('DEBUGBAR_REMOTE_SITES_PATH', ''),

    'local_sites_path' => env('DEBUGBAR_LOCAL_SITES_PATH', ''),

    'include_vendors' => true,

    'capture_ajax' => true,

    'add_ajax_timing' => false,

    'error_handler' => false,

    'clockwork' => false,

    'collectors' => [
        'phpinfo' => true,
        'messages' => true,
        'time' => true,
        'memory' => true,
        'exceptions' => true,
        'log' => true,
        'db' => true,
        'views' => true,
        'route' => true,
        'auth' => false,
        'gate' => true,
        'session' => true,
        'symfony_request' => true,
        'mail' => true,
        'laravel' => false,
        'events' => false,
        'default_request' => false,
        'logs' => false,
        'files' => false,
        'config' => false,
        'cache' => false,
        'models' => true,
        'livewire' => false,
    ],

    'options' => [
        'auth' => [
            'show_name' => true,
        ],
        'db' => [
            'with_params' => true,
            'backtrace' => true,
            'backtrace_exclude_paths' => [],
            'timeline' => false,
            'duration_background' => true,
            'explain' => [
                'enabled' => false,
                'types' => ['SELECT'],
            ],
            'hints' => false,
            'show_copy' => false,
        ],
        'mail' => [
            'full_log' => false,
        ],
        'views' => [
            'timeline' => false,
            'data' => false,
        ],
        'route' => [
            'label' => true,
        ],
        'logs' => [
            'file' => null,
        ],
        'cache' => [
            'values' => true,
        ],
    ],

    'inject' => true,

    'route_prefix' => '_debugbar',

    'route_middleware' => [],

    'route_domain' => null,

    'theme' => env('DEBUGBAR_THEME', 'auto'),

    'debug_backtrace_limit' => 50,
];
