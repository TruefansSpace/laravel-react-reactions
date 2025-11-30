<?php

use Illuminate\Support\Facades\Route;
use Workbench\App\Http\Controllers\AuthController;
use Workbench\App\Http\Controllers\TestController;

// Authentication routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Test page route (accessible without auth for viewing, but reactions require auth)
Route::get('/', [TestController::class, 'index'])->name('test.index');

// Include package routes (reactions API endpoints with auth middleware)
require __DIR__ . '/../../routes/web.php';
