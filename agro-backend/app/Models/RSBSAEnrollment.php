<?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\Model;

    class RsbsaEnrollment extends Model
    {
        use HasFactory;

        protected $fillable = [
            'user_id',
            'beneficiary_id',
            'farm_profile_id',
            'application_reference_code',
            'enrollment_year',
            'enrollment_type',
            'application_status',
            'submitted_at',
            'approved_at',
            'rejected_at',
            'reviewed_by',
            'interview_completed_at', 
        ];

        protected $casts = [
            'enrollment_year'        => 'integer',
            'submitted_at'           => 'datetime',
            'approved_at'            => 'datetime',
            'rejected_at'            => 'datetime',
            'interview_completed_at' => 'datetime',
        ];

        /*
        |--------------------------------------------------------------------------
        | Relationships
        |--------------------------------------------------------------------------
        */
        public function user()
        {
            return $this->belongsTo(User::class);
        }

        public function beneficiaryDetail()
        {
            return $this->belongsTo(BeneficiaryDetail::class, 'beneficiary_id');
        }

        public function farmProfile()
        {
            return $this->belongsTo(FarmProfile::class);
        }

        public function reviewer()
        {
            return $this->belongsTo(User::class, 'reviewed_by');
        }

        public function coordinatorBeneficiaries()
        {
            return $this->hasMany(CoordinatorBeneficiary::class, 'enrollment_id');
        }

        /*
        |--------------------------------------------------------------------------
        | Scopes
        |--------------------------------------------------------------------------
        */
        public function scopeForUser($query, $userId)
        {
            return $query->where('user_id', $userId);
        }

        public function scopeLatestFirst($query)
        {
            return $query->orderByDesc('id');
        }
    }
