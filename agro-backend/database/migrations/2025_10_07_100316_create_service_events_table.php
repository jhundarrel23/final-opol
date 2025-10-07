<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('service_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_catalog_id')->constrained('service_catalogs')->cascadeOnDelete();
            $table->foreignId('coordinator_id')->constrained('users')->cascadeOnDelete();
            $table->string('barangay');
            $table->date('service_date');
            $table->text('remarks')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('service_events');
    }
};
