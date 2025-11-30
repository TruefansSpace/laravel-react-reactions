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

    /**
     * Query Scope: Add reactions data using efficient subqueries
     * 
     * This scope adds two subqueries to your main query:
     * 1. reactions_summary_json - A JSON object with counts for each reaction type
     * 2. user_reaction_type - The current user's reaction (if userId provided)
     * 
     * HOW IT WORKS:
     * Instead of loading all reactions into memory, we use SQL subqueries that:
     * - Run aggregation (GROUP BY, COUNT) at the database level
     * - Return only the final counts, not all reaction records
     * - Execute as part of the main query (1 query total, not N+1)
     * 
     * EXAMPLE SQL GENERATED:
     * SELECT posts.*,
     *   (SELECT JSON_OBJECT('like', COUNT(*), 'love', COUNT(*), ...)
     *    FROM reactions WHERE reactable_id = posts.id) as reactions_summary_json,
     *   (SELECT type FROM reactions WHERE reactable_id = posts.id AND user_id = 1) as user_reaction_type
     * FROM posts
     * 
     * PERFORMANCE:
     * - Without this: 1 query for posts + 2 queries per post = 21 queries for 10 posts
     * - With this: 1 query total, regardless of number of posts
     * - Scales to millions of reactions without memory issues
     * 
     * USAGE:
     * Post::withReactionsData(auth()->id())->get()
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int|null $userId Optional user ID to get their reaction
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithReactionsData($query, ?int $userId = null)
    {
        $model = $query->getModel();
        $table = $model->getTable();
        $modelClass = get_class($model);
        
        // Build JSON_OBJECT dynamically from config
        $reactionTypes = array_keys(config('react-reactions.types', [
            'like' => '👍',
            'love' => '❤️',
            'haha' => '😂',
            'wow' => '😮',
            'sad' => '😢',
            'angry' => '😠',
        ]));
        
        $jsonParts = [];
        foreach ($reactionTypes as $type) {
            $jsonParts[] = sprintf(
                '"%s", COALESCE(SUM(CASE WHEN type = "%s" THEN 1 END), 0)',
                $type,
                $type
            );
        }
        $jsonObjectSql = 'JSON_OBJECT(' . implode(', ', $jsonParts) . ')';
        
        return $query
            // Select all columns from the main table first
            ->select($table . '.*')
            // Subquery 1: Get reaction counts aggregated by type
            ->selectSub(
                \Illuminate\Support\Facades\DB::table('reactions')
                    ->selectRaw($jsonObjectSql)
                    ->whereColumn('reactable_id', $table . '.id')
                    ->where('reactable_type', $modelClass),
                'reactions_summary_json'
            )
            // Subquery 2: Get the specific user's reaction (if userId provided)
            ->when($userId, function ($q) use ($userId, $modelClass, $table) {
                $q->selectSub(
                    \Illuminate\Support\Facades\DB::table('reactions')
                        ->select('type')
                        ->whereColumn('reactable_id', $table . '.id')
                        ->where('reactable_type', $modelClass)
                        ->where('user_id', $userId)
                        ->limit(1),
                    'user_reaction_type'
                );
            });
    }

    /**
     * Parse reactions summary from JSON subquery result
     */
    public function parseReactionsSummary(): array
    {
        if (!isset($this->reactions_summary_json)) {
            return $this->reactionsSummary();
        }

        $summary = json_decode($this->reactions_summary_json, true) ?? [];
        
        // Remove zeros for cleaner output
        return array_filter($summary, fn($count) => $count > 0);
    }

    /**
     * Get user reaction from subquery result
     */
    public function parseUserReaction(): ?string
    {
        return $this->user_reaction_type ?? null;
    }
}
