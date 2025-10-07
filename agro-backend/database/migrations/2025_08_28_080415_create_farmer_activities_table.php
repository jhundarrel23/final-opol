<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farmer_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_livelihood_id')->constrained('beneficiary_livelihoods')->onDelete('cascade');

            $table->boolean('rice')->default(false);
            $table->boolean('corn')->default(false);
            $table->boolean('other_crops')->default(false);
            $table->string('other_crops_specify', 150)->nullable();

            $table->boolean('livestock')->default(false);
            $table->string('livestock_specify', 150)->nullable();

            $table->boolean('poultry')->default(false);
            $table->string('poultry_specify', 150)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farmer_activities');
    }
};
