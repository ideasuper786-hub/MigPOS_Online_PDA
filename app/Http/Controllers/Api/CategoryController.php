<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        // Get all categories (no parent filter – show all active)
        $categories = Category::orderBy('catorder')->get(['id', 'name']);
        return response()->json($categories);
    }
}