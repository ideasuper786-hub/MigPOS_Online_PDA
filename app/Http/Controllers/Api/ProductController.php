<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ProductController  // <-- no "extends Controller"
{
    public function byCategory($categoryId)
    {
        $products = DB::select("
            SELECT id, name, pricesell, texttip
            FROM products
            WHERE category = ?
        ", [$categoryId]);

        return response()->json($products);
    }
}