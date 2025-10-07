<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agri_youth_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_livelihood_id')->constrained('beneficiary_livelihoods')->onDelete('cascade');

            $table->boolean('is_agri_youth')->default(false);
            $table->boolean('is_part_of_farming_household')->default(false);
            $table->boolean('is_formal_agri_course')->default(false);
            $table->boolean('is_nonformal_agri_course')->default(false);
            $table->boolean('is_agri_program_participant')->default(false);
            $table->boolean('others')->default(false);
            $table->string('others_specify', 150)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agri_youth_activities');
    }
};