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

// Handle preflight OPTIONS requests for all admin routes
Route::options('/admin/{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
})->where('any', '.*');

// ... rest of your web routes