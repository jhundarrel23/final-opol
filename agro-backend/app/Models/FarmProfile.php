<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'beneficiary_id',
        'livelihood_category_id'
    ];

    // Relationships
    public function beneficiaryDetail()
    {
        return $this->belongsTo(BeneficiaryDetail::class, 'beneficiary_id');
    }

    public function livelihoodCategory()
    {
        return $this->belongsTo(LivelihoodCategory::class);
    }

    public function farmParcels()
    {
        return $this->hasMany(FarmParcel::class);
    }

    public function rsbsaEnrollments()
    {
        return $this->hasMany(RsbsaEnrollment::class);
    }
}