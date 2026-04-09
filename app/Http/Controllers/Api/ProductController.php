<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function byCategory($categoryId)
    {
        $products = Product::where('category', $categoryId)
            ->where('iscom', 0)
            ->get(['id', 'name', 'pricesell', 'texttip']);
        return response()->json($products);
    }
}