<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;

// API routes - temporary fix
Route::prefix('api')->group(function () {
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('products/category/{categoryId}', [ProductController::class, 'byCategory']);
    Route::post('order', [OrderController::class, 'store']);
});
Route::get('test', fn() => 'Laravel is working!');

Route::get('db-check', function () {
    try {
        $categories = DB::table('categories')->get();
        return response()->json(['count' => $categories->count(), 'data' => $categories]);
    } catch (\Exception $e) {
        return $e->getMessage();
    }
});

Route::prefix('admin')->group(function () {
    Route::get('categories', [App\Http\Controllers\Admin\CategoryController::class, 'index']);
    Route::get('categories-tree', [App\Http\Controllers\Admin\CategoryController::class, 'tree']);
    Route::post('categories', [App\Http\Controllers\Admin\CategoryController::class, 'store']);
    Route::put('categories/{id}', [App\Http\Controllers\Admin\CategoryController::class, 'update']);
    Route::delete('categories/{id}', [App\Http\Controllers\Admin\CategoryController::class, 'destroy']);
});

// ... rest of your web routes