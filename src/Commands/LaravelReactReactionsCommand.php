<?php

namespace TrueFans\LaravelReactReactions\Commands;

use Illuminate\Console\Command;

class LaravelReactReactionsCommand extends Command
{
    public $signature = 'laravel-react-reactions';

    public $description = 'My command';

    public function handle(): int
    {
        $this->comment('All done');

        return self::SUCCESS;
    }
}
