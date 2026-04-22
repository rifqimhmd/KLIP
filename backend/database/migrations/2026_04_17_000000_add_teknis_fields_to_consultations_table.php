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
        Schema::table('consultations', function (Blueprint $table) {
            // Tipe konsultasi: 'psikolog' atau 'teknis'
            $table->string('type')->default('psikolog')->after('id');
            
            // Field untuk konsultasi teknis
            $table->string('subject')->nullable()->after('type');
            $table->text('description')->nullable()->after('subject');
            $table->string('subdit')->nullable()->after('description')->comment('advokasi atau pencegahan');
            $table->string('category')->nullable()->after('subdit');
            $table->string('urgency')->default('medium')->after('category');
            
            // Assigned to untuk konsultan teknis (bisa admin atau role khusus)
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null')->after('psikolog_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->dropColumn([
                'type',
                'subject',
                'description',
                'subdit',
                'category',
                'urgency',
                'assigned_to'
            ]);
        });
    }
};
