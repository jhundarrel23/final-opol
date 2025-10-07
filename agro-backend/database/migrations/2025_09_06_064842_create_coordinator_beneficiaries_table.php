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
        Schema::create('coordinator_beneficiaries', function (Blueprint $table) {
            $table->id();

         
            $table->foreignId('coordinator_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

      
            $table->foreignId('enrollment_id')
                  ->constrained('rsbsa_enrollments')
                  ->cascadeOnDelete();  

  
            $table->unique(['coordinator_id', 'enrollment_id']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coordinator_beneficiaries');
    }
};
