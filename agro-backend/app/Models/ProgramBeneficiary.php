<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramBeneficiary extends Model
{
    use HasFactory;

    protected $fillable = [
        'subsidy_program_id',
        'beneficiary_id',
    ];

    // Belongs to program (SubsidyProgram)
    public function program()
    {
        return $this->belongsTo(SubsidyProgram::class, 'subsidy_program_id');
    }

    // ✅ FIX: Use BeneficiaryDetail instead of Beneficiary
    public function beneficiary()
    {
        return $this->belongsTo(BeneficiaryDetail::class, 'beneficiary_id');
    }

    // Beneficiary has many items
    public function items()
    {
        return $this->hasMany(ProgramBeneficiaryItem::class, 'program_beneficiary_id');
    }
}