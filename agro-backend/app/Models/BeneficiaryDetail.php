<?php

namespace App\Models;

use App\Models\User;
use App\Models\ProgramBeneficiary;
use App\Models\SubsidyProgram;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BeneficiaryDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'rsbsa_number',
        'barangay',
        'municipality',
        'province',
        'region',
        'contact_number',
        'emergency_contact_number',
        'birth_date',
        'place_of_birth',
        'sex',
        'civil_status',
        'name_of_spouse',
        'highest_education',
        'religion',
        'is_pwd',
        'has_government_id',
        'gov_id_type',
        'gov_id_number',
        'is_association_member',
        'association_name',
        'mothers_maiden_name',
        'is_household_head',
        'household_head_name',
        'data_source',
        'status',
        'verified_at',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_pwd' => 'boolean',
        'is_household_head' => 'boolean',
        'verified_at' => 'datetime',
    ];

    // Relationships

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function farmProfiles()
    {
        return $this->hasMany(FarmProfile::class, 'beneficiary_id');
    }

    public function beneficiaryLivelihoods()
    {
        return $this->hasMany(BeneficiaryLivelihood::class, 'beneficiary_id');
    }

    public function rsbsaEnrollments()
    {
        return $this->hasMany(RsbsaEnrollment::class, 'beneficiary_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'beneficiary_id');
    }

    /**
     * ProgramBeneficiaries linked to this beneficiary
     */
    public function programBeneficiaries()
    {
        return $this->hasMany(ProgramBeneficiary::class, 'beneficiary_id', 'id');
    }

    /**
     * Subsidy programs linked to this beneficiary through program_beneficiaries
     */
    public function subsidyPrograms()
    {
        return $this->hasManyThrough(
            SubsidyProgram::class,
            ProgramBeneficiary::class,
            'beneficiary_id',       // Foreign key on ProgramBeneficiary
            'id',                   // Foreign key on SubsidyProgram (local key)
            'id',                   // Local key on BeneficiaryDetail
            'subsidy_program_id'    // Local key on ProgramBeneficiary
        );
    }

    // Scopes
    public function scopeByBarangay($query, $barangay)
    {
        return $query->where('barangay', $barangay);
    }

    public function scopeByDataSource($query, $source)
    {
        return $query->where('data_source', $source);
    }

    public function scopePwd($query)
    {
        return $query->where('is_pwd', true);
    }

    public function scopeHouseholdHeads($query)
    {
        return $query->where('is_household_head', true);
    }

    public function scopeBySex($query, $sex)
    {
        return $query->where('sex', $sex);
    }

    public function scopeByEducation($query, $education)
    {
        return $query->where('highest_education', $education);
    }
}
