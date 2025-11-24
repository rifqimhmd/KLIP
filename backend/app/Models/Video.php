<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    /**
     * fillable
     * @var array
     */
    protected $fillable = ['judul', 'video_url'];
}
