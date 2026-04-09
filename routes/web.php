<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;

// API routes - temporary fix
Route::prefix('api')->group(function () {
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('products/category/{categoryId}', [ProductController::class, 'byCategory']);
    Route::post('order', [OrderController::class, 'store']);
});

Route::get('test', function () {
    return 'Laravel is working!';
});

Route::get('db-check', function () {
    try {
        $categories = DB::table('categories')->get();
        return response()->json(['count' => $categories->count(), 'data' => $categories]);
    } catch (\Exception $e) {
        return $e->getMessage();
    }
});


// ... rest of your web routes