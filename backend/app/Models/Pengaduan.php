<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pengaduan extends Model
{
    protected $fillable = [
        'user_id',
        'kategori',
        'lokasi',
        'tanggal_kejadian',
        'jam_kejadian',
        'nama_terlapor',
        'jabatan_terlapor',
        'deskripsi_kejadian',
        'tempat_kejadian',
        'alasan_pelanggaran',
        'saksi',
        'anonim',
        'pernyataan_kebenaran',
        'status',
        'catatan_admin',
    ];

    protected $casts = [
        'tanggal_kejadian' => 'date',
        'anonim' => 'boolean',
        'pernyataan_kebenaran' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(PengaduanFile::class);
    }
}
