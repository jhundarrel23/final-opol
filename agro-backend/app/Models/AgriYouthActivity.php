<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgriYouthActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'beneficiary_livelihood_id',
        'is_agri_youth',
        'is_part_of_farming_household',
        'is_formal_agri_course',
        'is_nonformal_agri_course',
        'is_agri_program_participant',
        'others',
        'others_specify'
    ];

    protected $casts = [
        'is_agri_youth' => 'boolean',
        'is_part_of_farming_household' => 'boolean',
        'is_formal_agri_course' => 'boolean',
        'is_nonformal_agri_course' => 'boolean',
        'is_agri_program_participant' => 'boolean',
        'others' => 'boolean'
    ];

    // Relationships
    public function beneficiaryLivelihood()
    {
        return $this->belongsTo(BeneficiaryLivelihood::class);
    }
}