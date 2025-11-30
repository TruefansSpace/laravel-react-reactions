<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User;

/**
 * Create a test user for authentication in tests
 */
function createUser(): User
{
    $userModel = config('auth.providers.users.model', 'App\Models\User');
    
    return Model::unguarded(function () use ($userModel) {
        return $userModel::create([
            'name' => 'Test User ' . uniqid(),
            'email' => 'test' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
        ]);
    });
}

