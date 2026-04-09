<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        // Exclude the 'image' BLOB column
        $categories = Category::orderBy('catorder')
            ->get(['id', 'name', 'parentid', 'texttip', 'catshowname', 'catorder', 'BUTTONCOLOR', 'TEXTCOLOR']);
        return response()->json($categories);
    }

    public function tree()
    {
        $categories = Category::all(['id', 'name']);
        return response()->json($categories);
    }

    // store, update, destroy methods unchanged (they handle image separately)
}