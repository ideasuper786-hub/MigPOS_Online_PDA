<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketLine extends Model
{
    protected $table = 'ticketlines';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['ticket', 'line', 'product', 'units', 'price', 'taxid', 'attributes'];
}