<?php

namespace TrueFans\LaravelReactReactions\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use TrueFans\LaravelReactReactions\Models\Reaction;

class ReactionFactory extends Factory
{
    protected $model = Reaction::class;

    public function definition(): array
    {
        return [
            'user_id' => 1,
            'reactable_type' => 'App\\Models\\Post',
            'reactable_id' => 1,
            'type' => $this->faker->randomElement(['like', 'love', 'haha', 'wow', 'sad', 'angry']),
        ];
    }

    public function like(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'like',
        ]);
    }

    public function love(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'love',
        ]);
    }

    public function haha(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'haha',
        ]);
    }

    public function wow(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'wow',
        ]);
    }

    public function sad(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'sad',
        ]);
    }

    public function angry(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'angry',
        ]);
    }
}
