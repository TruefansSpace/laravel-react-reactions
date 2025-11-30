<?php

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

/**
 * Create a test user for authentication in tests
 */
function createUser(): Authenticatable
{
    $userModel = config('auth.providers.users.model', \Workbench\App\Models\User::class);
    
    return Model::unguarded(function () use ($userModel) {
        return $userModel::create([
            'name' => 'Test User ' . uniqid(),
            'email' => 'test' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
        ]);
    });
}

