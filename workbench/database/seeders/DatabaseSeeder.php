<?php

namespace Workbench\Database\Seeders;

use Illuminate\Database\Seeder;
use Workbench\App\Models\TestPost;
use Workbench\App\Models\User;
use TrueFans\LaravelReactReactions\Models\Comment;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create 60 test users to demonstrate infinite scroll
        $users = [];
        
        // First 5 main test users
        $mainUsers = [
            ['email' => 'test@example.com', 'name' => 'Test User'],
            ['email' => 'john@example.com', 'name' => 'John Doe'],
            ['email' => 'jane@example.com', 'name' => 'Jane Smith'],
            ['email' => 'alice@example.com', 'name' => 'Alice Johnson'],
            ['email' => 'bob@example.com', 'name' => 'Bob Wilson'],
        ];

        foreach ($mainUsers as $userData) {
            $users[] = User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => bcrypt('password'),
                ]
            );
        }

        // Generate 55 more users for infinite scroll demo
        $firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery', 'Sebastian', 'Ella', 'Jack', 'Scarlett', 'Aiden', 'Grace', 'Owen', 'Chloe', 'Samuel', 'Victoria', 'David', 'Riley', 'Joseph', 'Aria', 'Carter', 'Lily', 'Wyatt', 'Aubrey', 'John', 'Zoey', 'Luke', 'Penelope', 'Dylan', 'Lillian', 'Grayson', 'Addison'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark'];

        for ($i = 0; $i < 55; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $email = strtolower($firstName . '.' . $lastName . $i . '@example.com');
            
            $users[] = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $firstName . ' ' . $lastName,
                    'password' => bcrypt('password'),
                ]
            );
        }

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

        foreach ($posts as $index => $postData) {
            $post = TestPost::create($postData);

            // First post gets 50+ reactions for infinite scroll demo
            if ($index === 0) {
                // Add reactions from 50 random users
                $selectedUsers = collect($users)->random(min(50, count($users)));
                foreach ($selectedUsers as $user) {
                    $randomReaction = $reactionTypes[array_rand($reactionTypes)];
                    $post->react($user->id, $randomReaction);
                }
            } else {
                // Other posts get 3-8 random reactions
                $numReactions = rand(3, 8);
                $selectedUsers = collect($users)->random(min($numReactions, count($users)));
                
                foreach ($selectedUsers as $user) {
                    $randomReaction = $reactionTypes[array_rand($reactionTypes)];
                    $post->react($user->id, $randomReaction);
                }
            }

            // Add comments to posts
            $numComments = rand(2, 5);
            $commentUsers = collect($users)->random(min($numComments, count($users)));
            
            $commentTexts = [
                'This is amazing! Great work!',
                'I totally agree with this.',
                'Thanks for sharing this information.',
                'Very interesting perspective.',
                'Could you elaborate more on this?',
                'This is exactly what I needed to hear.',
                'Fantastic post! Keep it up!',
                'I have some thoughts on this...',
                'This resonates with me so much.',
                'Well said! Couldn\'t agree more.',
                'This is really helpful, thank you!',
                'Interesting take on this topic.',
                'I learned something new today!',
                'This deserves more attention.',
                'Brilliant insights here.',
            ];

            foreach ($commentUsers as $commentUser) {
                $comment = Comment::create([
                    'commentable_type' => TestPost::class,
                    'commentable_id' => $post->id,
                    'user_id' => $commentUser->id,
                    'content' => $commentTexts[array_rand($commentTexts)],
                ]);

                // 50% chance to add 1-2 replies to this comment
                if (rand(0, 1)) {
                    $numReplies = rand(1, 2);
                    $replyUsers = collect($users)->random(min($numReplies, count($users)));
                    
                    $replyTexts = [
                        'I agree with you!',
                        'Thanks for your comment!',
                        'That\'s a good point.',
                        'Interesting perspective!',
                        'I see what you mean.',
                        'Exactly my thoughts!',
                        'Well put!',
                        'Thanks for clarifying.',
                        'I hadn\'t thought of it that way.',
                        'Great addition to the discussion!',
                    ];

                    foreach ($replyUsers as $replyUser) {
                        Comment::create([
                            'commentable_type' => TestPost::class,
                            'commentable_id' => $post->id,
                            'user_id' => $replyUser->id,
                            'parent_id' => $comment->id,
                            'content' => $replyTexts[array_rand($replyTexts)],
                        ]);
                    }
                }
            }
        }
    }
}
