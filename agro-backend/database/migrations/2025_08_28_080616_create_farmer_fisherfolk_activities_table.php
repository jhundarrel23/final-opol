<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fisherfolk_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_livelihood_id')->constrained('beneficiary_livelihoods')->onDelete('cascade');

            $table->boolean('fish_capture')->default(false);
            $table->boolean('aquaculture')->default(false);
            $table->boolean('gleaning')->default(false);
            $table->boolean('fish_processing')->default(false);
            $table->boolean('fish_vending')->default(false);
            $table->boolean('others')->default(false);
            $table->string('others_specify', 150)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fisherfolk_activities');
    }
};
