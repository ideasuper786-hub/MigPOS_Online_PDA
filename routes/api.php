<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('categories', [CategoryController::class, 'index']);
Route::get('products/category/{categoryId}', [ProductController::class, 'byCategory']);
Route::post('order', [OrderController::class, 'store']);