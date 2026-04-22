<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'q1',
        'q2',
        'q3',
        'q4',
        'q5',
        'q6',
        'q7',
        'status',
        'notes',
        'psikolog_id',
        'assigned_to',
        'deleted_by_user',
        'deleted_by_psikolog',
        'subject',
        'description',
        'subdit',
        'category',
        'urgency',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who made the consultation
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the psychologist assigned to this consultation
     */
    public function psikolog(): BelongsTo
    {
        return $this->belongsTo(User::class, 'psikolog_id');
    }

    /**
     * Get the technical consultant assigned to this consultation
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
