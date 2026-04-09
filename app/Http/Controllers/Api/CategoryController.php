<?php

namespace App\Http\Controllers\Api;

// Manually include the base controller definition
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}

class CategoryController extends Controller
{
    public function index()
    {
        $categories = \App\Models\Category::orderBy('catorder')->get(['id', 'name']);
        return response()->json($categories);
    }
}