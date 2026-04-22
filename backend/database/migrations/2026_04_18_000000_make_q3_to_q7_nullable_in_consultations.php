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
            // Make q3-q7 nullable to support teknis consultations
            $table->text('q3')->nullable()->change();
            $table->text('q4')->nullable()->change();
            $table->text('q5')->nullable()->change();
            $table->text('q6')->nullable()->change();
            $table->text('q7')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->text('q3')->nullable(false)->change();
            $table->text('q4')->nullable(false)->change();
            $table->text('q5')->nullable(false)->change();
            $table->text('q6')->nullable(false)->change();
            $table->text('q7')->nullable(false)->change();
        });
    }
};
