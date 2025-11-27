<?php

use Illuminate\Support\Facades\Route;
use TrueFans\LaravelReactReactions\Http\Controllers\ReactionController;

Route::middleware(['web', 'auth'])->prefix('reactions')->name('reactions.')->group(function () {
    Route::post('/', [ReactionController::class, 'store'])->name('store');
    Route::delete('/', [ReactionController::class, 'destroy'])->name('destroy');
    Route::get('/{type}/{id}', [ReactionController::class, 'index'])->name('index');
});
