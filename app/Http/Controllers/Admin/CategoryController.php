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
    $categories = Category::orderBy('catorder')
        ->get(['id', 'name', 'parentid', 'texttip', 'catshowname', 'catorder', 'BUTTONCOLOR', 'TEXTCOLOR']);
    return response()->json($categories)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

public function tree()
{
    $categories = Category::all(['id', 'name']);
    return response()->json($categories)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}



    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parentid' => 'nullable|string',
            'texttip' => 'nullable|string',
            'catshowname' => 'boolean',
            'catorder' => 'nullable|string',
            'BUTTONCOLOR' => 'nullable|string|max:7',
            'TEXTCOLOR' => 'nullable|string|max:7',
        ]);

        $category = Category::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'parentid' => $request->parentid,
            'texttip' => $request->texttip,
            'catshowname' => $request->catshowname ?? 1,
            'catorder' => $request->catorder,
            'BUTTONCOLOR' => $request->BUTTONCOLOR,
            'TEXTCOLOR' => $request->TEXTCOLOR,
        ]);

        if ($request->hasFile('image')) {
            $image = file_get_contents($request->file('image')->getRealPath());
            $category->image = $image;
            $category->save();
        }

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'parentid' => 'nullable|string',
            'texttip' => 'nullable|string',
            'catshowname' => 'boolean',
            'catorder' => 'nullable|string',
            'BUTTONCOLOR' => 'nullable|string|max:7',
            'TEXTCOLOR' => 'nullable|string|max:7',
        ]);

        $category->update($request->only([
            'name', 'parentid', 'texttip', 'catshowname',
            'catorder', 'BUTTONCOLOR', 'TEXTCOLOR'
        ]));

        if ($request->hasFile('image')) {
            $image = file_get_contents($request->file('image')->getRealPath());
            $category->image = $image;
            $category->save();
        }

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(null, 204);
    }
}