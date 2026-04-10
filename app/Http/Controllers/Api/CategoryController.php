<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        // Only select id and name – avoid the image BLOB
        $categories = Category::orderBy('catorder')->get(['id', 'name']);
        return response()->json($categories);
    }
}