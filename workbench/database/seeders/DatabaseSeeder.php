<?php

namespace Workbench\Database\Seeders;

use Illuminate\Database\Seeder;
use Workbench\App\Models\TestPost;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create a test post
        TestPost::create([
            'title' => 'Test Post for Reactions',
            'content' => 'This is a test post to demonstrate the Facebook-like reaction system. Hover over the Like button to see all available reactions!',
        ]);

        // Create a test user if needed
        if (! \Illuminate\Support\Facades\Schema::hasTable('users')) {
            return;
        }

        $userModel = config('auth.providers.users.model', 'App\Models\User');
        
        if (class_exists($userModel) && $userModel::count() === 0) {
            $userModel::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]);
        }
    }
}
