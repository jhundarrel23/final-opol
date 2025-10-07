<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farm_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_id')->constrained('beneficiary_details')->onDelete('cascade');
            $table->foreignId('livelihood_category_id')->constrained('livelihood_categories');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farm_profiles');
    }
};