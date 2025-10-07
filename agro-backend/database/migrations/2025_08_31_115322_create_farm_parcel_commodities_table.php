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
        Schema::create('parcel_commodities', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('farm_parcel_id')
                  ->constrained('farm_parcels')
                  ->cascadeOnDelete();

            $table->foreignId('commodity_id')
                  ->constrained('commodities')
                  ->cascadeOnDelete();

            $table->decimal('size_hectares', 10, 2)->nullable();
            $table->integer('number_of_heads')->nullable();

            $table->enum('farm_type', ['irrigated', 'rainfed upland', 'rainfed lowland'])->nullable();
            $table->boolean('is_organic_practitioner')->default(false);
            $table->text('remarks')->nullable();

            $table->timestamps();

        
            $table->index(['farm_parcel_id', 'commodity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parcel_commodities');
    }
};