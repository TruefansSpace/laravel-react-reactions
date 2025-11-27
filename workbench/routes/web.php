<?php

use Illuminate\Support\Facades\Route;
use Workbench\App\Http\Controllers\TestController;

Route::get('/', [TestController::class, 'index'])->name('test.index');
