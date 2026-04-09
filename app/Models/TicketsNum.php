<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketsNum extends Model
{
    protected $table = 'ticketsnum';
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = ['id'];
}