<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farm_parcels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_profile_id')->constrained('farm_profiles')->onDelete('cascade');
            $table->string('parcel_number')->nullable();
            $table->string('barangay', 100);
            $table->decimal('total_farm_area', 10, 2); 
            
            $table->enum('tenure_type', ['registered_owner', 'tenant', 'lessee']);
            $table->string('landowner_name')->nullable();
            $table->string('ownership_document_number')->nullable();  
            $table->string('ownership_document_type')->nullable();
            
      
            $table->boolean('is_ancestral_domain')->default(false);
            $table->boolean('is_agrarian_reform_beneficiary')->default(false);
    
            
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farm_parcels');
    }
};
