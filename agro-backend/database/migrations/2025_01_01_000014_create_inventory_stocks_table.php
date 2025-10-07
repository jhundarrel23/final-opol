<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_stocks', function (Blueprint $table) {
            $table->id();

            // Reference to the inventory item
            $table->foreignId('inventory_id')->constrained('inventories')->onDelete('cascade');

            // Quantity and movement
            $table->decimal('quantity', 10, 2);
            $table->enum('movement_type', ['stock_in', 'stock_out', 'adjustment', 'transfer', 'distribution']);
            $table->enum('transaction_type', [
                'purchase', 'grant', 'return', 'distribution', 
                'damage', 'expired', 'transfer_in', 'transfer_out', 
                'adjustment', 'initial_stock'
            ]);

            // Financial tracking
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->decimal('total_value', 12, 2)->nullable();
            $table->decimal('running_balance', 12, 2)->default(0.00);

            // References & flow tracking
            $table->string('reference_number')->nullable(); 
            $table->string('source')->nullable(); 
            $table->string('destination')->nullable(); 
            
            // PROGRAM LINKAGE (NEW)
            $table->foreignId('program_id')->nullable()->constrained('subsidy_programs')->nullOnDelete();
            $table->foreignId('program_beneficiary_item_id')->nullable()->constrained('program_beneficiary_items')->nullOnDelete();

            // Dates and batch
            $table->date('date_received')->nullable();
            $table->date('transaction_date');
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            
            // EXPIRY ALERTS (NEW)
            $table->boolean('is_expired')->default(false);
            $table->boolean('is_near_expiry')->default(false); 

            // Remarks
            $table->text('remarks')->nullable();


            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->boolean('is_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('transacted_by')->nullable()->constrained('users')->nullOnDelete(); // Who performed transaction
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete(); // Who approved

            $table->timestamp('approved_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();

            $table->json('attachments')->nullable(); 

            $table->timestamps();
            $table->softDeletes(); 

            $table->index(['inventory_id', 'movement_type']);
            $table->index(['status']);
            $table->index(['transaction_date']);
            $table->index(['batch_number']);
            $table->index(['transaction_type']);
            $table->index(['program_id']);
            $table->index(['is_expired']);
            $table->index(['expiry_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_stocks');
    }
};