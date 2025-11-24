<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dokumen extends Model
{
    /**
     * fillable
     * @var array
     */
    protected $fillable = ['title', 'file_url', 'thumbnail_url'];
}
