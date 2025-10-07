<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_beneficiary_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_beneficiary_id')->constrained('program_beneficiaries')->onDelete('cascade');
            $table->string('item_name');
            $table->foreignId('inventory_id')->nullable()->constrained('inventories')->nullOnDelete();
            
            // ASSISTANCE TYPE
          $table->enum('assistance_type', ['aid', 'cash', 'gasoline', 'voucher', 'service'])->default('aid');
            
            $table->decimal('quantity', 10, 2);
            $table->string('unit');

            $table->text('coordinator_notes')->nullable();

            // Item value tracking
            $table->decimal('unit_value', 10, 2)->nullable();
            $table->decimal('total_value', 10, 2)->nullable();

            // Status tracking
            $table->enum('status', [
                'pending',      // Awaiting distribution
                'distributed',  // Successfully given to beneficiary
                'unclaimed',    // Beneficiary didn't claim within timeframe
                'cancelled'     // Distribution cancelled
            ])->default('pending');

            // STATUS TIMESTAMPS & TRACKING
            $table->timestamp('distributed_at')->nullable();
            $table->foreignId('distributed_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamp('unclaimed_at')->nullable();
            $table->string('unclaimed_reason')->nullable();
            
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('cancellation_reason')->nullable();
            
       
            
            $table->timestamps();

            // Indexes
            $table->index(['assistance_type']);
            $table->index(['status']);
 
            $table->index(['program_beneficiary_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_beneficiary_items');
    }
};