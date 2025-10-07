<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            // File info
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type');
            $table->unsignedBigInteger('file_size');

            // Document categorization
            $table->string('document_type'); // e.g. rsbsa_form, service_proof, inventory_receipt

            // Relationships
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('beneficiary_id')->nullable()->constrained('beneficiary_details')->nullOnDelete();

            // Polymorphic relationship fields (for universal linking)
            $table->string('related_type')->nullable();   // e.g. App\Models\InventoryStock, App\Models\ServiceEvent
            $table->unsignedBigInteger('related_id')->nullable(); // e.g. 45 (the ID of that record)

            // Description or notes
            $table->text('description')->nullable();

            // Timestamps and soft delete
            $table->timestamps();
            $table->softDeletes();

            // INDEXES for faster queries
            $table->index(['document_type']);
            $table->index(['user_id']);
            $table->index(['beneficiary_id']);
            $table->index(['related_type', 'related_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
