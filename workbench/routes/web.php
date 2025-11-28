<?php

use Illuminate\Support\Facades\Route;
use Workbench\App\Http\Controllers\TestController;

Route::get('/', [TestController::class, 'index'])->name('test.index');
Route::post('/reactions', [TestController::class, 'react'])->name('reactions.react');
Route::delete('/reactions', [TestController::class, 'react'])->name('reactions.unreact');
