<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    /**
     * fillable
     * 
     * @var array
     */

    protected $fillable = ['judul', 'url'];
}
