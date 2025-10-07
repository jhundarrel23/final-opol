<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('service_catalogs', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Vaccination", "Deworming"
            $table->foreignId('sector_id')->constrained('sectors')->cascadeOnDelete();
            $table->string('unit')->nullable(); // e.g. "head", "hectare", "session"
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('service_catalogs');
    }
};
