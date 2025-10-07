<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('service_beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_event_id')->constrained('service_events')->cascadeOnDelete();
            $table->foreignId('beneficiary_id')->constrained('beneficiary_details')->cascadeOnDelete();
            $table->string('species')->nullable(); // manual entry like "Goat", "Carabao"
            $table->decimal('quantity', 10, 2)->default(1.00); // number of heads, hectares, sessions, etc.
            $table->text('remarks')->nullable();
            $table->enum('status', ['provided', 'cancelled'])->default('provided');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('service_beneficiaries');
    }
};
