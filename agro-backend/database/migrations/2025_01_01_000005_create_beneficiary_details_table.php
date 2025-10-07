<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beneficiary_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            

            $table->string('rsbsa_number', 50)->nullable();


            // LOCATION INFORMATION  
            $table->string('barangay', 100);
            $table->string('municipality', 100)->default('Opol');
            $table->string('province', 100)->default('Misamis Oriental');
            $table->string('region', 100)->default('Region X (Northern Mindanao)');

            // CONTACT INFORMATION
            $table->string('contact_number', 20);
            $table->string('emergency_contact_number', 20)->nullable();

            // PERSONAL INFORMATION
            $table->date('birth_date');
            $table->string('place_of_birth', 150)->nullable();
            $table->enum('sex', ['male', 'female']);
            $table->enum('civil_status', [
                'single', 'married', 'widowed', 'separated', 'divorced'
            ])->nullable();
            $table->string('name_of_spouse', 150)->nullable();

            // EDUCATIONAL & DEMOGRAPHIC INFORMATION
            $table->enum('highest_education', [
                'None', 'Pre-school', 'Elementary', 'Junior High School',
                'Senior High School', 'Vocational', 'College', 'Post Graduate'
            ])->nullable();
            $table->string('religion', 100)->nullable();
            $table->boolean('is_pwd')->default(false);

            // GOVERNMENT ID INFORMATION
            $table->enum('has_government_id', ['yes', 'no'])->default('no');
            $table->string('gov_id_type', 100)->nullable();
            $table->string('gov_id_number', 100)->nullable();

            // ASSOCIATION & ORGANIZATION MEMBERSHIP
            $table->enum('is_association_member', ['yes', 'no'])->default('no');
            $table->string('association_name', 200)->nullable();

            // HOUSEHOLD INFORMATION
            $table->string('mothers_maiden_name', 150)->nullable();
            $table->boolean('is_household_head')->default(false);
            $table->string('household_head_name', 150)->nullable();

          
            $table->enum('data_source', [
                'self_registration', 'coordinator_input', 'da_import', 'system_migration'
            ])->default('self_registration');
            
            $table->timestamps();
            $table->softDeletes();

            // INDEXES
            $table->unique(['user_id'], 'bd_user_unique');
            $table->unique(['rsbsa_number'], 'bd_sys_rsbsa_unique');
            $table->index(['barangay'], 'bd_barangay_idx');
            $table->index(['data_source'], 'bd_data_source_idx');
            $table->index(['created_at'], 'bd_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beneficiary_details');
    }
};
