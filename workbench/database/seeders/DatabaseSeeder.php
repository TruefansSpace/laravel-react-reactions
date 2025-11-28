<?php

namespace Workbench\Database\Seeders;

use Illuminate\Database\Seeder;
use Workbench\App\Models\TestPost;
use Workbench\App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create test users using updateOrCreate to avoid duplicates
        $users = [];
        $users[] = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        $users[] = User::updateOrCreate(
            ['email' => 'john@example.com'],
            [
                'name' => 'John Doe',
                'password' => bcrypt('password'),
            ]
        );

        $users[] = User::updateOrCreate(
            ['email' => 'jane@example.com'],
            [
                'name' => 'Jane Smith',
                'password' => bcrypt('password'),
            ]
        );

        $users[] = User::updateOrCreate(
            ['email' => 'alice@example.com'],
            [
                'name' => 'Alice Johnson',
                'password' => bcrypt('password'),
            ]
        );

        $users[] = User::updateOrCreate(
            ['email' => 'bob@example.com'],
            [
                'name' => 'Bob Wilson',
                'password' => bcrypt('password'),
            ]
        );

        // Delete existing posts to start fresh
        TestPost::query()->delete();

        // Create 10 test posts with varied content
        $posts = [
            [
                'title' => 'Welcome to Our Reaction System!',
                'content' => 'This is a demonstration of our Facebook-like reaction system. Hover over the Like button to see all available reactions! You can express yourself with 👍 Like, ❤️ Love, 😂 Haha, 😮 Wow, 😢 Sad, or 😠 Angry.',
            ],
            [
                'title' => 'Amazing New Features Released',
                'content' => 'We are excited to announce the release of our new features! The reaction system now supports real-time updates and beautiful animations. Try it out and let us know what you think!',
            ],
            [
                'title' => 'Community Guidelines Update',
                'content' => 'We have updated our community guidelines to ensure a safe and welcoming environment for everyone. Please take a moment to review the changes and react to show your acknowledgment.',
            ],
            [
                'title' => 'Behind the Scenes: Development Journey',
                'content' => 'Ever wondered how we built this reaction system? In this post, we share our development journey, the challenges we faced, and the solutions we implemented. It has been an amazing ride!',
            ],
            [
                'title' => 'User Success Stories',
                'content' => 'We love hearing from our users! Today we are sharing some incredible success stories from our community. Your feedback and reactions mean the world to us. Keep them coming!',
            ],
            [
                'title' => 'Tips and Tricks for Power Users',
                'content' => 'Did you know you can quickly react by hovering over the button? Here are some tips and tricks to get the most out of our platform. Become a power user today!',
            ],
            [
                'title' => 'Upcoming Events and Webinars',
                'content' => 'Join us for our upcoming webinar series where we will dive deep into advanced features and best practices. React to this post if you are interested in attending!',
            ],
            [
                'title' => 'Thank You for 10K Users!',
                'content' => 'We have reached an incredible milestone - 10,000 users! Thank you all for your support and engagement. We could not have done it without you. React with a ❤️ to celebrate with us!',
            ],
            [
                'title' => 'Feature Request: What Do You Want Next?',
                'content' => 'We are planning our next sprint and want to hear from you! What features would you like to see next? React and comment below with your ideas. Your input shapes our roadmap!',
            ],
            [
                'title' => 'Weekend Vibes and Relaxation',
                'content' => 'It is the weekend! Time to relax and unwind. What are your plans? Share your weekend vibes by reacting to this post. We hope you all have a wonderful time!',
            ],
        ];

        $reactionTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

        foreach ($posts as $postData) {
            $post = TestPost::create($postData);

            // Add 3-4 random reactions from different users
            $numReactions = rand(3, 4);
            $selectedUsers = collect($users)->random($numReactions);
            
            foreach ($selectedUsers as $user) {
                $randomReaction = $reactionTypes[array_rand($reactionTypes)];
                $post->react($user->id, $randomReaction);
            }
        }
    }
}
