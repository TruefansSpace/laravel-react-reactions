<?php

use Illuminate\Support\Facades\Route;
use TrueFans\LaravelReactReactions\Http\Controllers\ReactionController;

Route::middleware(['web', 'auth'])->prefix('reactions')->name('reactions.')->group(function () {
    Route::post('/', [ReactionController::class, 'store'])->name('store');
    Route::delete('/', [ReactionController::class, 'destroy'])->name('destroy');
    Route::get('/list/{reactableType}/{reactableId}', [ReactionController::class, 'list'])->name('list');
});

Route::middleware(['web', 'auth'])->prefix('comments')->name('comments.')->group(function () {
    Route::post('/', [\TrueFans\LaravelReactReactions\Http\Controllers\CommentController::class, 'store'])->name('store');
    Route::put('/{comment}', [\TrueFans\LaravelReactReactions\Http\Controllers\CommentController::class, 'update'])->name('update');
    Route::delete('/{comment}', [\TrueFans\LaravelReactReactions\Http\Controllers\CommentController::class, 'destroy'])->name('destroy');
    Route::get('/list/{commentableType}/{commentableId}', [\TrueFans\LaravelReactReactions\Http\Controllers\CommentController::class, 'list'])->name('list');
});
