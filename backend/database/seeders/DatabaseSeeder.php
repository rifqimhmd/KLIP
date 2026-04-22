<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create three seed accounts: Admin, User, Psikolog
        // Note: password field will be automatically hashed by User model's 'password' => 'hashed' cast
        User::updateOrCreate(
            ['status_pengguna' => 'Admin'],
            [
                'nip' => '11111111',
                'name' => 'Joshua Setiawan B Nahor',
                'email' => 'joshua.setiawan123@gmail.com',
                'password' => 'password123',
                'no_wa' => '+628111111111',
                'daftar_sebagai' => 'Direktorat Kepatuhan Internal',
                'organization_detail' => 'Direktorat Kepatuhan Internal',
                'status_pengguna' => 'Admin',
            ]
        );

        User::updateOrCreate(
            ['nip' => '222222222'],
            [
                'name' => 'User',
                'email' => 'zuhal@gmail.com',
                'password' => 'password123',
                'no_wa' => '+628222222222',
                'daftar_sebagai' => 'UPT',
                'status_pengguna' => 'User',
            ]
        );

        // Winanti, M.Psi - Psikolog Utama
        User::updateOrCreate(
            ['nip' => '333333333'],
            [
                'name' => 'Winanti, M.Psi',
                'email' => 'winanti.psikolog@gmail.com',
                'password' => 'psikolog',
                'no_wa' => '+628333333333',
                'daftar_sebagai' => 'Ditjenpas',
                'organization_detail' => 'Direktorat Perawatan Kesehatan dan Rehabilitasi',
                'status_pengguna' => 'Psikolog',
            ]
        );

        // Create test user if not exists
        User::updateOrCreate(
            ['nip' => '444444444'],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password',
                'no_wa' => '+628444444444',
                'daftar_sebagai' => 'UPT',
                'status_pengguna' => 'User',
            ]
        );
    }
}
