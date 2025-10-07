<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subsidy_program_id')->constrained('subsidy_programs')->onDelete('cascade');
            $table->foreignId('beneficiary_id')->constrained('beneficiary_details')->onDelete('cascade');
     
       
            $table->timestamps();

            $table->unique(['subsidy_program_id', 'beneficiary_id'], 'unique_program_beneficiary');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_beneficiaries');
    }
};