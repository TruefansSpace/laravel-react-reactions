<?php

namespace TrueFans\LaravelReactReactions\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \TrueFans\LaravelReactReactions\LaravelReactReactions
 */
class LaravelReactReactions extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return \TrueFans\LaravelReactReactions\LaravelReactReactions::class;
    }
}
