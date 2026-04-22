<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PengaduanFile extends Model
{
    protected $fillable = [
        'pengaduan_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    protected $appends = ['file_url'];

    public function pengaduan(): BelongsTo
    {
        return $this->belongsTo(Pengaduan::class);
    }

    public function getFileUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }
}
