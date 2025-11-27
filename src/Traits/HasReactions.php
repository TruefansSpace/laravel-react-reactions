<?php

namespace TrueFans\LaravelReactReactions\Traits;

use Illuminate\Database\Eloquent\Relations\MorphMany;
use TrueFans\LaravelReactReactions\Models\Reaction;

trait HasReactions
{
    public function reactions(): MorphMany
    {
        return $this->morphMany(Reaction::class, 'reactable');
    }

    public function react(int $userId, string $type): Reaction
    {
        return $this->reactions()->updateOrCreate(
            ['user_id' => $userId],
            ['type' => $type]
        );
    }

    public function unreact(int $userId): bool
    {
        return $this->reactions()
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    public function toggleReaction(int $userId, string $type): Reaction|bool
    {
        $existing = $this->reactions()
            ->where('user_id', $userId)
            ->first();

        if ($existing && $existing->type === $type) {
            return $this->unreact($userId);
        }

        return $this->react($userId, $type);
    }

    public function reactionsSummary(): array
    {
        return $this->reactions()
            ->selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();
    }

    public function userReaction(int $userId): ?string
    {
        return $this->reactions()
            ->where('user_id', $userId)
            ->value('type');
    }

    public function getReactionsSummaryAttribute(): array
    {
        return $this->reactionsSummary();
    }

    public function getUserReactionAttribute(): ?string
    {
        if (! auth()->check()) {
            return null;
        }

        return $this->userReaction(auth()->id());
    }
}
