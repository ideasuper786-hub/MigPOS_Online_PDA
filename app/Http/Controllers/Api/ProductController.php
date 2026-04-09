<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function byCategory($categoryId)
    {
        // Force a simple, unfiltered query
        $products = Product::where('category', $categoryId)
            ->get(['id', 'name', 'pricesell', 'texttip']);

        // If still empty, try with LIKE (in case of hidden characters)
        if ($products->isEmpty()) {
            $products = Product::where('category', 'LIKE', '%' . $categoryId . '%')
                ->get(['id', 'name', 'pricesell', 'texttip']);
        }

        // Log for debugging
        \Log::info("Category $categoryId returned " . $products->count() . " products");

        return response()->json($products);
    }
}