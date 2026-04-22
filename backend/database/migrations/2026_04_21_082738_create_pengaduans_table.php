<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengaduans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Informasi Dasar
            $table->enum('kategori', ['penyalahgunaan_wewenang', 'pelanggaran_kode_etik', 'pungutan_liar', 'disiplin_pegawai', 'lainnya']);
            $table->string('lokasi');
            $table->date('tanggal_kejadian');
            $table->time('jam_kejadian')->nullable();
            
            // Inti Pengaduan
            $table->string('nama_terlapor')->nullable();
            $table->string('jabatan_terlapor')->nullable();
            $table->text('deskripsi_kejadian');
            $table->text('tempat_kejadian');
            $table->text('alasan_pelanggaran')->nullable();
            
            // Bukti Pendukung
            $table->text('saksi')->nullable();
            
            // Pernyataan Kerahasiaan & Kebenaran
            $table->boolean('anonim')->default(false);
            $table->boolean('pernyataan_kebenaran')->default(false);
            
            // Status pengaduan
            $table->enum('status', ['pending', 'diproses', 'selesai', 'ditolak'])->default('pending');
            $table->text('catatan_admin')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaduans');
    }
};
