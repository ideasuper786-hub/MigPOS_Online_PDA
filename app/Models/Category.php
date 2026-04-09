<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
    'id', 'name', 'parentid', 'image', 'texttip',
    'catshowname', 'catorder', 'BUTTONCOLOR', 'TEXTCOLOR'
];
}