    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up(): void
        {
            Schema::create('rsbsa_enrollments', function (Blueprint $table) {
                $table->id();

               
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

               
                $table->foreignId('beneficiary_id')->constrained('beneficiary_details')->onDelete('cascade');
                $table->foreignId('farm_profile_id')->constrained('farm_profiles')->onDelete('cascade');

                $table->string('application_reference_code')->unique();
                $table->year('enrollment_year');
                $table->enum('enrollment_type', ['new', 'renewal', 'update'])->default('new');

             
                $table->enum('application_status', [
                                'pending',   
                                'approved', 
                                'rejected',
                                'cancelled'
                            ])->default('pending');


                $table->timestamp('submitted_at')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->timestamp('rejected_at')->nullable();

       
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->dateTime('interview_scheduled_at')->nullable();
                $table->dateTime('interview_completed_at')->nullable();

                $table->timestamps();
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('rsbsa_enrollments');
        }
    };