<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('service_event_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_event_id')->constrained('service_events')->cascadeOnDelete();
            $table->foreignId('inventory_stock_id')->constrained('inventory_stocks')->cascadeOnDelete();
            $table->decimal('quantity_used', 10, 2)->nullable(); 
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['service_event_id', 'inventory_stock_id']); 
        });
    }

    public function down(): void {
        Schema::dropIfExists('service_event_stocks');
    }
};
