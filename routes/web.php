<?php

use Illuminate\Support\Facades\Route;

Route::get('/db-test', function () {
    try {
        $tables = DB::select('SHOW TABLES');
        return response()->json(['success' => true, 'tables' => $tables]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()]);
    }
});