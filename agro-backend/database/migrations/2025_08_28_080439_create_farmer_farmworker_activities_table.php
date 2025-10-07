<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farmworker_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_livelihood_id')->constrained('beneficiary_livelihoods')->onDelete('cascade');

            $table->boolean('land_preparation')->default(false);
            $table->boolean('planting')->default(false);
            $table->boolean('cultivation')->default(false);
            $table->boolean('harvesting')->default(false);
            $table->boolean('others')->default(false);
            $table->string('others_specify', 150)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farmworker_activities');
    }
};
