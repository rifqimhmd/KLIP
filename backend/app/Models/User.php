<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'nip',
        'pangkat_golongan',
        'jabatan',
        'instansi',
        'no_wa',
        'foto',
        'foto_position_x',
        'foto_position_y',
        'daftar_sebagai',
        'status_pengguna',
        'is_available',
        'organization_detail',
        'status_approval',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'foto_position_x' => 'integer',
            'foto_position_y' => 'integer',
            'is_available' => 'boolean',
            'is_online' => 'boolean',
            'last_seen_at' => 'datetime',
        ];
    }
}
